"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRightIcon, MapPinIcon, LanguageIcon, ShieldCheckIcon, ClipboardDocumentListIcon } from "@heroicons/react/24/outline";
import { useCopyLocale, useUiLocale } from "./app-shell";
import { ExpiryCountdown } from "./expiry-countdown";
import { StatusBadge, UrgencyBadge } from "./request-badges";
import { useRequests } from "@/app/lib/request-store";
import { categoryLabel, languageLabel, LANGUAGES, CATEGORIES, type HelpRequest } from "@/app/lib/mock-requests";
import type { UserProfile } from "@/app/lib/mock-auth";
import { useMyInterpreterApplication } from "@/app/lib/interpreter-application";
import { ApplicationStatusCard } from "@/components/volunteer/ApplicationStatusCard";
import type { InterpreterWorkspaceMode } from "@/app/lib/workspace-mode";

const button = "inline-flex min-h-12 items-center justify-center gap-2 rounded-(--khvi-radius-sm) bg-(--khvi-navy) px-5 py-3 text-sm font-bold text-white hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--khvi-sun)";
const lightButton = "inline-flex min-h-12 items-center justify-center gap-2 rounded-(--khvi-radius-sm) bg-white px-5 py-3 text-sm font-bold text-(--khvi-navy) hover:bg-(--khvi-paper) focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--khvi-sun)";
const panel = "rounded-(--khvi-radius-md) border border-(--khvi-teal)/20 bg-(--khvi-surface) p-5 sm:p-7";
const muted = "mt-2 text-sm leading-7 text-(--khvi-ink)/70";
const thaiLanguages: Record<string, string> = { burmese: "พม่า", chinese: "จีน", english: "อังกฤษ", vietnamese: "เวียดนาม", sign: "ภาษามือไทย" };
const thaiCategories: Record<string, string> = { medical: "การแพทย์", police: "สถานีตำรวจ", government: "หน่วยงานราชการ", accident: "อุบัติเหตุ", school: "โรงเรียน" };

function distance(request: HelpRequest, location: GeolocationCoordinates | null) {
  if (!location || request.latitude === null || request.longitude === null) return null;
  const rad = Math.PI / 180;
  const dLat = (request.latitude - location.latitude) * rad;
  const dLon = (request.longitude - location.longitude) * rad;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(location.latitude * rad) * Math.cos(request.latitude * rad) * Math.sin(dLon / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(Math.min(1, a)));
}

export function WelcomeDashboard({ user, interpreterMode = "helper", onInterpreterModeChange }: {
  user: UserProfile;
  interpreterMode?: InterpreterWorkspaceMode;
  onInterpreterModeChange?: (mode: InterpreterWorkspaceMode) => void;
}) {
  const locale = useUiLocale();
  const copyLocale = useCopyLocale();
  const tr = (th: string, en: string, zh: string) => locale === "th" ? th : locale === "zh" ? zh : en;
  const interpreterAccount = user.role === "Interpreter";
  const interpreter = interpreterAccount && interpreterMode === "helper";
  const { requests, ready } = useRequests();
  const { application: volunteerApplication } = useMyInterpreterApplication(user.userId);
  const [location, setLocation] = useState<GeolocationCoordinates | null>(null);
  const [geo, setGeo] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [radius, setRadius] = useState("all");
  const [language, setLanguage] = useState("all");
  const [category, setCategory] = useState("all");
  const active = requests.filter(r => interpreter ? ["Claimed", "InProgress"].includes(r.status) : ["Open", "Claimed", "InProgress"].includes(r.status));
  const current = active[0];
  const completed = requests.filter(r => r.status === "Completed");
  const recent = requests.filter(r => interpreter ? ["Completed", "Cancelled"].includes(r.status) && r.interpreter !== null : r.requestId !== current?.requestId).slice(0, 3);
  const open = requests.filter(r => r.status === "Open" && (language === "all" || r.languageId === language) && (category === "all" || r.categoryId === category) && (radius === "all" || (distance(r, location) !== null && distance(r, location)! <= Number(radius)))).slice(0, 3);
  const lang = (r: HelpRequest) => locale === "th" ? thaiLanguages[r.languageId] : languageLabel(r.languageId, copyLocale);
  const cat = (r: HelpRequest) => locale === "th" ? thaiCategories[r.categoryId] : categoryLabel(r.categoryId, copyLocale);
  const listPath = interpreter ? "/my-assignments#main-content" : "/my-requests#main-content";
  const nextAction = current?.status === "Open"
    ? tr("กำลังรอล่ามรับคำขอ เปิดรายละเอียดเพื่อติดตามเวลาหมดอายุ", "Waiting for an interpreter. Open the request to track its deadline.", "正在等待口译员接单。打开请求查看截止时间。")
    : current?.status === "Claimed"
      ? tr("มีล่ามรับงานแล้ว ตรวจสอบรายละเอียดและขั้นตอนการยืนยันก่อนนัดพบ", "An interpreter has claimed this request. Review the details and confirmation steps before meeting.", "已有口译员接单。见面前请查看详情和确认步骤。")
      : current?.userConfirmedDoneAtLabel && current?.interpreterConfirmedDoneAtLabel === null
        ? tr("ผู้ขอยืนยันจบงานแล้ว รอการยืนยันจากล่าม", "The requester has confirmed completion. Waiting for the interpreter.", "求助者已确认完成，等待口译员确认。")
        : current?.interpreterConfirmedDoneAtLabel && current?.userConfirmedDoneAtLabel === null
          ? tr("ล่ามยืนยันจบงานแล้ว รอการยืนยันจากผู้ขอ", "The interpreter has confirmed completion. Waiting for the requester.", "口译员已确认完成，等待求助者确认。")
          : tr("ภารกิจกำลังดำเนินการ ทั้งสองฝ่ายต้องยืนยันเมื่อช่วยเหลือเสร็จ", "Work is in progress. Both people confirm when it is complete.", "任务进行中。完成后双方都需要确认。" );
  function locate() {
    if (!navigator.geolocation) { setGeo("error"); return; }
    setGeo("loading");
    navigator.geolocation.getCurrentPosition(p => { setLocation(p.coords); setGeo("ready"); }, () => setGeo("error"), { timeout: 10000, maximumAge: 60000, enableHighAccuracy: false });
  }
  function requestRow(r: HelpRequest, discovery = false) {
    return <li key={r.requestId} className="flex flex-wrap items-center justify-between gap-4 py-5">
      <div className="min-w-0"><p className="text-xs text-(--khvi-ink)/60">#{r.requestId}</p><h3 className="mt-1 font-bold">{lang(r)} · {cat(r)}</h3><p className={muted}>{discovery ? r.areaName : r.scheduledAtLabel ?? r.createdAtLabel}</p></div>
      <div className="flex flex-wrap items-center gap-3"><UrgencyBadge urgency={r.urgency} copyLocale={locale === "th" ? "th" : copyLocale} /><StatusBadge status={r.status} copyLocale={locale === "th" ? "th" : copyLocale} /><Link className="inline-flex min-h-11 items-center gap-2 text-sm font-bold underline underline-offset-4" href={discovery ? "/find-requests#main-content" : `/my-requests/${r.requestId}#main-content`}>{tr("ดูรายละเอียด", "View details", "查看详情")}<ArrowRightIcon aria-hidden="true" className="h-4 w-4" /></Link></div>
    </li>;
  }
  return <main id="main-content" className="mx-auto max-w-[1480px] px-5 py-8 sm:px-8 lg:px-8 lg:py-10">
    <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
      <div><p className="text-sm font-semibold text-(--khvi-teal)">{tr("ยินดีต้อนรับกลับมา", "Welcome back", "欢迎回来")}</p><h1 className="mt-1 break-words text-3xl font-bold">{user.name}</h1></div>
      {interpreterAccount ? (
        <div className="w-full sm:w-auto">
          <p className="mb-2 text-xs font-bold text-(--khvi-ink)/65 sm:text-right">{tr("เลือกโหมดการใช้งาน", "Choose how to use KHVI", "选择使用模式")}</p>
          <div role="group" aria-label={tr("สลับระหว่างการช่วยเหลือและการขอความช่วยเหลือ", "Switch between helping and requesting help", "在提供帮助和请求帮助之间切换")} className="grid min-h-12 w-full grid-cols-2 rounded-full border border-(--khvi-teal)/30 bg-white p-1 shadow-sm sm:w-auto sm:min-w-[330px]">
            {(["helper", "requester"] as const).map((mode) => {
              const selected = interpreterMode === mode;
              return <button key={mode} type="button" aria-pressed={selected} onClick={() => onInterpreterModeChange?.(mode)} className={`min-h-10 rounded-full px-4 py-2 text-sm font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--khvi-sun) ${selected ? "bg-(--khvi-navy) text-white shadow-sm" : "text-(--khvi-ink)/70 hover:bg-(--khvi-paper)"}`}>
                {mode === "helper" ? tr("เข้ามาช่วยเหลือ", "Help others", "提供帮助") : tr("เข้ามาขอความช่วยเหลือ", "Request help", "请求帮助")}
              </button>;
            })}
          </div>
        </div>
      ) : <span className="rounded-full border border-(--khvi-teal)/25 bg-white px-4 py-2 text-sm font-bold">{tr("ผู้ขอความช่วยเหลือ", "Requester", "求助者")}</span>}
    </div>
    <p className="mb-6 rounded-lg bg-(--khvi-sun)/10 px-4 py-3 text-xs leading-6">{tr("โหมดต้นแบบ · รายการบันทึกอยู่ในเบราว์เซอร์นี้ ยังไม่ได้แยกตามบัญชีหรือยืนยันการจับคู่จริง", "Preview · Records are saved in this browser, not scoped to your account or verified as matches.", "预览模式 · 记录保存在此浏览器，尚未按账户区分或验证匹配。")}</p>
    {!ready ? <div className={`${panel} mb-6`} role="status">{tr("กำลังโหลดคำขอ…", "Loading requests…", "正在加载请求…")}</div> : current && <section className={`${panel} mb-6 border-l-4 border-l-(--khvi-teal)`} aria-labelledby="current-title">
      <div className="flex flex-wrap justify-between gap-3"><h2 id="current-title" className="text-xl font-bold">{interpreter ? tr("ภารกิจที่ดำเนินอยู่ในเครื่องนี้", "Active assignment on this device", "此设备上的当前任务") : tr("คำขอปัจจุบันในเครื่องนี้", "Current request on this device", "此设备上的当前请求")}</h2><div className="flex flex-wrap gap-2"><UrgencyBadge urgency={current.urgency} copyLocale={locale === "th" ? "th" : copyLocale} /><StatusBadge status={current.status} copyLocale={locale === "th" ? "th" : copyLocale} /></div></div>
      <p className="mt-4 text-lg font-bold">#{current.requestId} · {lang(current)} · {cat(current)}</p><p className={muted}>{current.scheduledAtLabel ?? current.createdAtLabel}</p>
      {current.status === "Open" && current.expiresAt && <div className="mt-3"><ExpiryCountdown key={current.requestId} seconds={0} expiresAt={current.expiresAt} copyLocale={locale === "th" ? "th" : copyLocale} /></div>}
      <p className="my-5 rounded-lg bg-(--khvi-teal)/10 px-4 py-3 text-sm leading-7" role="status">{nextAction}</p>
      {current.interpreter && <div className="mb-5 flex items-center gap-3"><LanguageIcon className="h-6 w-6 text-(--khvi-teal)" aria-hidden="true" /><div><p className="font-bold">{current.interpreter.name}</p><p className="text-sm text-(--khvi-ink)/70">{current.interpreter.primaryLanguage}</p></div></div>}
      <Link className={button} href={`/my-requests/${current.requestId}#main-content`}>{tr("กลับไปติดตามภารกิจ", "Continue this request", "继续查看任务")}<ArrowRightIcon className="h-4 w-4" aria-hidden="true" /></Link>
      {active.length > 1 && <p className={muted}>{tr("พบหลายรายการในข้อมูลต้นแบบ ดูรายการทั้งหมดเพื่อเลือกงานที่ต้องการ", "This preview contains multiple active records. Open the full list to choose one.", "预览中有多个进行中的记录，请在完整列表中选择。")}</p>}
    </section>}
    <div className="grid gap-5 lg:grid-cols-[1.5fr_1fr]">
      <section className="flex flex-col items-start rounded-(--khvi-radius-lg) bg-(--khvi-navy) p-6 text-white sm:p-9">
        <span className="flex items-center gap-2 text-sm text-white/80"><LanguageIcon className="h-5 w-5" aria-hidden="true" /> KHVI · {tr("สื่อสารเข้าใจ ช่วยเหลือใกล้ตัว", "Community language help", "社区语言帮助")}</span>
        <h2 className="mt-6 max-w-lg text-3xl font-bold leading-tight sm:text-4xl">{interpreter ? tr("ใช้ภาษาที่คุณถนัด ช่วยให้ใครสักคนเข้าใจ", "Help someone be understood.", "用你的语言能力，帮助身边的人。") : tr("ต้องการความช่วยเหลือด้านภาษา เริ่มได้ที่นี่", "A little language help starts here.", "沟通有困难？从这里开始。")}</h2>
        <p className="mt-4 max-w-lg leading-8 text-white/80">{interpreter ? tr("ค้นหาคำขอตามภาษา หมวดหมู่ และระยะทาง ตรวจสอบก่อนรับงาน และรับผิดชอบครั้งละหนึ่งภารกิจ", "Explore requests by language, category and distance. Review each request and take one assignment at a time.", "按语言、类别和距离查找请求。确认详情后接单，一次只接受一个任务。") : tr("เลือกภาษา หมวดหมู่ และจุดนัดพบ ล่ามที่ตรงเงื่อนไขจะเป็นผู้เลือกกดรับคำขอของคุณ", "Choose a language, category and meeting point. A suitable interpreter chooses to claim your request.", "选择语言、类别和见面地点，符合条件的口译员会自行接单。")}</p>
        <div className="mt-7 flex flex-wrap gap-3"><Link className={lightButton} href={current ? `/my-requests/${current.requestId}#main-content` : interpreter ? "/find-requests#main-content" : "/request-help#main-content"}>{current ? tr("ติดตามงานปัจจุบัน", "Continue current work", "继续当前任务") : interpreter ? tr("ค้นหางาน", "Find requests", "查找求助") : tr("ขอความช่วยเหลือ", "Create a help request", "创建求助请求")}</Link><Link className={`${button} border border-white/40`} href={listPath}>{interpreter ? tr("งานของฉัน", "My assignments", "我的任务") : tr("คำขอทั้งหมด", "All requests", "全部请求")}</Link></div>
        <p className="mt-7 text-xs leading-6 text-white/75">{tr("หากมีอันตรายฉุกเฉิน ให้ติดต่อหน่วยงานฉุกเฉินในพื้นที่ก่อน", "For immediate danger, contact local emergency services first.", "如有紧急危险，请先联系当地紧急救援服务。")}</p>
      </section>
      <aside className={panel}><MapPinIcon className="h-7 w-7 text-(--khvi-teal)" aria-hidden="true" /><h2 className="mt-4 text-xl font-bold">{interpreter ? tr("ตำแหน่งและระยะค้นหา", "Location & search radius", "位置和搜索范围") : tr("เลือกเวลาที่เหมาะกับคุณ", "Help on your schedule", "按你的时间安排")}</h2>
        {interpreter ? <><p className={muted}>{tr("ใช้ตำแหน่งเพื่อกรองรายการด้านล่าง พิกัดของคุณจะไม่ถูกบันทึก", "Use your location to filter the list below. Your coordinates are not saved.", "使用位置筛选下方列表，您的坐标不会被保存。")}</p><button className={`${button} mt-4 w-full disabled:opacity-50`} onClick={locate} disabled={geo === "loading"}>{geo === "loading" ? tr("กำลังค้นหาตำแหน่ง…", "Locating…", "正在定位…") : tr("ใช้ตำแหน่งของฉัน", "Use my location", "使用我的位置")}</button><p role="status" className={muted}>{geo === "error" ? tr("เข้าถึงตำแหน่งไม่ได้ ลองใหม่หรือดูทุกระยะ", "Location unavailable. Retry or browse all distances.", "无法获取位置，请重试或查看所有距离。") : geo === "ready" ? tr("พร้อมใช้ตำแหน่งปัจจุบัน", "Current location connected", "已连接当前位置") : tr("ยังไม่ได้เปิดใช้ตำแหน่ง", "Location has not been shared", "尚未共享位置")}</p><label className="mt-4 block text-sm font-bold" htmlFor="welcome-radius">{tr("รัศมีค้นหา", "Search radius", "搜索半径")}</label><select id="welcome-radius" className="mt-2 min-h-12 w-full rounded-lg border border-(--khvi-teal)/30 bg-white px-3" value={radius} onChange={e => setRadius(e.target.value)}><option value="all">{tr("ทุกระยะ", "Any distance", "任何距离")}</option>{[5, 10, 25].map(n => <option key={n} value={n} disabled={!location}>{n} km</option>)}</select></> : <div className="mt-5 space-y-5"><div><h3 className="font-bold">{tr("ต้องการความช่วยเหลือด่วน", "Need help soon", "紧急求助")}</h3><p className={muted}>{tr("คำขอหมดอายุใน 30 นาที หากยังไม่มีล่ามรับงาน", "Requests expire after 30 minutes if no interpreter claims them.", "若30分钟内无人接单，请求将过期。")}</p></div><div className="border-t border-(--khvi-teal)/20 pt-5"><h3 className="font-bold">{tr("นัดหมายล่วงหน้า", "Plan a meeting", "预约帮助")}</h3><p className={muted}>{tr("เลือกเวลามากกว่า 30 นาทีจากตอนนี้ และไม่เกิน 24 ชั่วโมง", "Choose a time more than 30 minutes ahead, within 24 hours.", "选择超过30分钟后、24小时内的时间。")}</p></div></div>}
      </aside>
    </div>
    {interpreter && <section className={`${panel} mt-7`} aria-labelledby="discover-title"><h2 id="discover-title" className="text-xl font-bold">{tr("ค้นหาคำขอที่เหมาะกับคุณ", "Explore suitable requests", "查找合适的请求")}</h2><p className={muted}>{tr("เลือกความถนัดเพื่อกรองคำขอในเครื่อง ยังไม่ใช่ผลจับคู่จากโปรไฟล์ล่าม", "Filter browser records by your skills. These are not verified profile matches.", "按技能筛选浏览器记录，尚非经过验证的个人资料匹配。")}</p><div className="mt-4 grid gap-4 sm:grid-cols-2"><label className="text-sm font-bold">{tr("ภาษา", "Language", "语言")}<select className="mt-2 min-h-12 w-full rounded-lg border border-(--khvi-teal)/30 bg-white px-3" value={language} onChange={e => setLanguage(e.target.value)}><option value="all">{tr("ทุกภาษา", "All languages", "全部语言")}</option>{LANGUAGES.map(l => <option key={l.id} value={l.id}>{locale === "th" ? thaiLanguages[l.id] : l[copyLocale]}</option>)}</select></label><label className="text-sm font-bold">{tr("หมวดหมู่", "Category", "类别")}<select className="mt-2 min-h-12 w-full rounded-lg border border-(--khvi-teal)/30 bg-white px-3" value={category} onChange={e => setCategory(e.target.value)}><option value="all">{tr("ทุกหมวดหมู่", "All categories", "全部类别")}</option>{CATEGORIES.map(c => <option key={c.id} value={c.id}>{locale === "th" ? thaiCategories[c.id] : c[copyLocale]}</option>)}</select></label></div>{open.length ? <ul className="mt-3 divide-y divide-(--khvi-teal)/20">{open.map(r => requestRow(r, true))}</ul> : <p role="status" className="my-6 rounded-lg bg-(--khvi-paper) p-5 text-sm leading-7">{tr("ยังไม่มีคำขอในเครื่องที่ตรงตัวกรอง ลองเปลี่ยนภาษา หมวดหมู่ หรือระยะค้นหา", "No browser records match these filters. Try another language, category or distance.", "没有符合筛选条件的浏览器记录，请调整语言、类别或距离。")}</p>}<Link className="inline-flex min-h-11 items-center gap-2 font-bold underline underline-offset-4" href="/find-requests#main-content">{tr("เปิดแผนที่ทั้งหมด", "Open the full map", "打开完整地图")}<ArrowRightIcon className="h-4 w-4" aria-hidden="true" /></Link></section>}
    <section className={`${panel} mt-7`}><div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-xl font-bold">{interpreter ? tr("ภารกิจที่ผ่านมาในเครื่องนี้", "Past assignments on this device", "此设备上的历史任务") : tr("คำขอล่าสุด", "Recent requests", "最近的请求")}</h2><Link className="inline-flex min-h-11 items-center font-bold underline underline-offset-4" href={listPath}>{tr("ดูทั้งหมด", "View all", "查看全部")}</Link></div>{recent.length ? <ul className="divide-y divide-(--khvi-teal)/20">{recent.map(r => requestRow(r))}</ul> : <div className="flex items-start gap-4 py-6"><ClipboardDocumentListIcon className="h-8 w-8 shrink-0 text-(--khvi-teal)" aria-hidden="true" /><p className="text-sm leading-7">{tr("ยังไม่มีประวัติในเบราว์เซอร์นี้ เมื่อมีรายการแล้วคุณจะกลับมาติดตามได้ที่นี่", "No history in this browser yet. Return here to follow saved requests.", "此浏览器暂无历史记录，保存后可在此查看。")}</p></div>}</section>
    <div className="mt-7 grid gap-5 md:grid-cols-2">
      <section id="volunteer-application" className="scroll-mt-28"><ApplicationStatusCard application={volunteerApplication} /></section>
      <section className={panel}><ShieldCheckIcon className="h-7 w-7 text-(--khvi-teal)" aria-hidden="true" /><h2 className="mt-3 text-xl font-bold">{interpreter ? tr("ดูแลความเป็นส่วนตัว", "Look after privacy", "保护隐私") : tr("รีวิวหลังจบภารกิจ", "Review after completion", "完成后评价")}</h2><p className={muted}>{interpreter ? tr("ก่อนผู้ขอยืนยันล่าม ให้ใช้เฉพาะพื้นที่กว้าง ๆ และข้อมูลที่จำเป็นต่อการตัดสินใจรับงาน", "Before requester confirmation, use only the broad area and information needed to assess the request.", "求助者确认前，仅使用大致区域和判断任务所需的信息。") : completed.length ? tr(`มีงานที่เสร็จแล้ว ${completed.length} รายการในเครื่องนี้ ระบบยังตรวจไม่ได้ว่างานใดรีวิวแล้ว`, `${completed.length} completed records on this device. Review status is not available yet.`, `此设备有${completed.length}条已完成记录，评价状态尚不可用。`) : tr("เมื่อทั้งสองฝ่ายยืนยันจบงาน คุณจึงให้คะแนนล่ามได้ ยังไม่มีงานที่เสร็จในเครื่องนี้", "Reviews follow confirmation from both people. There are no completed records on this device yet.", "双方确认完成后才能评价，此设备暂无已完成记录。")}</p>{!interpreter && <p className="mt-4 rounded-lg bg-(--khvi-paper) p-3 text-sm leading-6">{tr("ระบบส่งรีวิวยังไม่เปิดใช้งาน", "Review submission is not available yet.", "评价提交尚未开放。")}</p>}</section>
    </div>
    <section id="welcome-steps" className="mt-10 scroll-mt-28"><h2 className="text-2xl font-bold">{tr("จากคำขอจนจบภารกิจ", "From request to completion", "从请求到完成")}</h2><ol className="mt-5 grid gap-6 border-y border-(--khvi-teal)/20 py-7 md:grid-cols-3">{(interpreter ? [tr("ค้นหางานที่ตรงความสามารถ", "Find a suitable request", "查找合适的请求"), tr("รับงานและรอผู้ขอยืนยันล่าม", "Claim and await requester confirmation", "接单并等待求助者确认"), tr("เริ่มงานและยืนยันจบทั้งสองฝ่าย", "Start work, then both confirm completion", "开始任务，完成后双方确认")] : [tr("เลือกภาษา หมวดหมู่ และจุดนัดพบ", "Choose language, category and meeting point", "选择语言、类别和见面地点"), tr("เมื่อล่ามรับงาน ตรวจสอบและยืนยันล่าม", "Review and confirm the interpreter after claim", "接单后查看并确认口译员"), tr("ทั้งสองฝ่ายยืนยันจบ แล้วจึงรีวิว", "Both confirm completion, then review", "双方确认完成后评价")]).map((s, i) => <li key={s} className="flex gap-3 text-sm leading-7"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-(--khvi-teal)/15 font-bold">{i + 1}</span>{s}</li>)}</ol></section>
    <section id="welcome-safety" className="mt-7 scroll-mt-28 rounded-(--khvi-radius-md) bg-(--khvi-sage)/10 p-6"><h2 className="font-bold">{tr("แบ่งปันเฉพาะข้อมูลที่จำเป็น", "Share only what is needed", "仅分享必要信息")}</h2><p className={muted}>{tr("ตรวจสอบบุคคลและจุดนัดพบก่อนเดินทาง ข้อมูลติดต่อและพิกัดละเอียดเปิดตามขั้นตอนยืนยันล่าม บริการนี้ช่วยด้านภาษา ไม่ทดแทนหน่วยงานฉุกเฉิน", "Confirm who you are meeting and where. Contact details and exact locations follow interpreter confirmation. Language support does not replace emergency services.", "出发前确认见面对象和地点。确认口译员后才开放联系方式及详细位置。语言服务不能代替紧急救援。")}</p></section>
  </main>;
}
