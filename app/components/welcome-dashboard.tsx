"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { ArrowRightIcon, LanguageIcon, ShieldCheckIcon, ClipboardDocumentListIcon, HeartIcon, MapPinIcon, MagnifyingGlassIcon, ClockIcon } from "@heroicons/react/24/outline";
import { useCopyLocale, useUiLocale } from "./app-shell";
import { ExpiryCountdown } from "./expiry-countdown";
import { ResponsiveHeroImage } from "./responsive-hero-image";
import { StatusBadge, UrgencyBadge } from "./request-badges";
import type { HelpRequest } from "@/app/lib/mock-requests";
import type { UserProfile } from "@/app/lib/mock-auth";
import { useMyInterpreterApplication, type InterpreterApplication } from "@/app/lib/interpreter-application";
import { loadMyInterpreterApplicationAction } from "@/app/actions/interpreter-application-actions";
import { ApplicationStatusCard } from "@/components/volunteer/ApplicationStatusCard";
import type { InterpreterWorkspaceMode } from "@/app/lib/workspace-mode";
import type { OpenRequestsDiagnostic } from "@/app/lib/real-request-data";
import { referenceLabel, type ReferenceCatalog } from "@/app/lib/reference-catalog";
const RequestMap = dynamic(
  () => import("@/app/(interpreter)/find-requests/request-map").then((module) => module.RequestMap),
  { ssr: false },
);

const button = "inline-flex min-h-12 items-center justify-center gap-2 rounded-(--khvi-radius-sm) bg-(--khvi-navy) px-5 py-3 text-sm font-bold text-white hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--khvi-sun)";
const heroButton = "inline-flex min-h-12 items-center justify-center gap-2 rounded-(--khvi-radius-sm) bg-white px-5 py-3 text-sm font-bold text-(--khvi-navy) hover:bg-(--khvi-paper) focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--khvi-sun)";
const panel = "rounded-(--khvi-radius-md) border border-(--khvi-teal)/20 bg-(--khvi-surface) p-5 sm:p-7";
const muted = "mt-2 text-sm leading-7 text-(--khvi-ink)/70";
function distance(request: HelpRequest, location: GeolocationCoordinates | null) {
  if (!location || request.latitude === null || request.longitude === null) return null;
  const rad = Math.PI / 180;
  const dLat = (request.latitude - location.latitude) * rad;
  const dLon = (request.longitude - location.longitude) * rad;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(location.latitude * rad) * Math.cos(request.latitude * rad) * Math.sin(dLon / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(Math.min(1, a)));
}

export function WelcomeDashboard({
  user,
  interpreterMode = "helper",
  onInterpreterModeChange,
  openRequests = [],
  assignments = [],
  requesterRequests = [],
  diagnostic,
  referenceCatalog = { languages: [], categories: [] },
}: {
  user: UserProfile;
  interpreterMode?: InterpreterWorkspaceMode;
  onInterpreterModeChange?: (mode: InterpreterWorkspaceMode) => void;
  openRequests?: HelpRequest[];
  assignments?: HelpRequest[];
  requesterRequests?: HelpRequest[];
  diagnostic?: OpenRequestsDiagnostic;
  referenceCatalog?: ReferenceCatalog;
}) {
  const locale = useUiLocale();
  const copyLocale = useCopyLocale();
  const tr = (th: string, en: string, zh: string) => locale === "th" ? th : locale === "zh" ? zh : en;
  const interpreterAccount = user.role === "Interpreter";
  const interpreter = interpreterAccount && interpreterMode === "helper";
  const { application: volunteerApplication } = useMyInterpreterApplication(user.userId);
  const [supabaseApplication, setSupabaseApplication] = useState<InterpreterApplication | null>(null);

  useEffect(() => {
    let disposed = false;
    void loadMyInterpreterApplicationAction().then((result) => {
      if (!disposed && result.ok && result.data) {
        setSupabaseApplication(result.data);
      }
    });
    return () => {
      disposed = true;
    };
  }, []);

  const activeApplication = supabaseApplication ?? volunteerApplication;
  const hasVolunteerApplication = Boolean(activeApplication && activeApplication.status !== "cancelled");

  const [location, setLocation] = useState<GeolocationCoordinates | null>(null);
  const [geo, setGeo] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [language, setLanguage] = useState("all");
  const [category, setCategory] = useState("all");
  const locationWatchRef = useRef<number | null>(null);
  const [now, setNow] = useState(0);
  useEffect(() => {
    const updateNow = () => setNow(Date.now());
    updateNow();
    const timer = window.setInterval(updateNow, 1000);
    return () => {
      window.clearInterval(timer);
      if (locationWatchRef.current !== null) navigator.geolocation?.clearWatch(locationWatchRef.current);
    };
  }, []);
  const isLiveOpenRequest = (request: HelpRequest) =>
    request.status !== "Open"
    || !request.expiresAt
    || Date.parse(request.expiresAt) > now;
  const active = interpreter
    ? assignments.filter((r) => ["Claimed", "InProgress"].includes(r.status))
    : requesterRequests
      .filter((r) => ["Open", "Claimed", "InProgress"].includes(r.status))
      .filter(isLiveOpenRequest);
  const current = active[0];
  const completed = interpreter
    ? assignments.filter((r) => r.status === "Completed")
    : requesterRequests.filter((r) => r.status === "Completed");
  const recent = interpreter
    ? assignments
      .filter((r) => ["Completed", "Cancelled"].includes(r.status))
      .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
      .slice(0, 3)
    : requesterRequests.filter((r) => r.requestId !== current?.requestId).slice(0, 3);
  const open = openRequests
    .filter(
      (r) =>
        r.status === "Open" &&
        (language === "all" || r.languageId === language) &&
        (category === "all" || r.categoryId === category)
    )
    .slice(0, 3);
  const nearbyOpen = openRequests
    .filter((r) => r.status === "Open")
    .filter((r) => !location || (distance(r, location) !== null && distance(r, location)! <= 5))
    .slice(0, 12);
  const lang = (r: HelpRequest) => referenceLabel(referenceCatalog.languages, r.languageId, locale);
  const cat = (r: HelpRequest) => referenceLabel(referenceCatalog.categories, r.categoryId, locale);
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
    if (locationWatchRef.current !== null) navigator.geolocation.clearWatch(locationWatchRef.current);
    setGeo("loading");
    locationWatchRef.current = navigator.geolocation.watchPosition(p => { setLocation(p.coords); setGeo("ready"); }, () => setGeo("error"), { timeout: 10000, maximumAge: 10000, enableHighAccuracy: false });
  }
  function requestRow(r: HelpRequest, discovery = false) {
    return <li key={r.requestId} className="flex flex-wrap items-center justify-between gap-4 py-5">
      <div className="min-w-0"><h3 className="font-bold">{lang(r)} · {cat(r)}</h3><p className={muted}>{discovery ? r.areaName : r.scheduledAtLabel ?? r.createdAtLabel}</p></div>
      <div className="flex flex-wrap items-center gap-3"><UrgencyBadge urgency={r.urgency} copyLocale={locale === "th" ? "th" : copyLocale} /><StatusBadge status={r.status} copyLocale={locale === "th" ? "th" : copyLocale} /><Link className="inline-flex min-h-11 items-center gap-2 text-sm font-bold underline underline-offset-4" href={discovery ? "/find-requests#main-content" : `/my-requests/${r.requestId}#main-content`}>{tr("ดูรายละเอียด", "View details", "查看详情")}<ArrowRightIcon aria-hidden="true" className="h-4 w-4" /></Link></div>
    </li>;
  }
  return <main id="main-content" className="mx-auto max-w-[1480px] px-5 py-8 sm:px-8 lg:px-8 lg:py-10">
    <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
      <div><p className="text-sm font-semibold text-(--khvi-teal)">{tr("ยินดีต้อนรับ", "Welcome", "欢迎")}</p><h1 className="mt-1 break-words text-3xl font-bold">{user.name}</h1></div>
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
      ) : (
        <div className="flex flex-wrap items-center gap-3">
          {hasVolunteerApplication ? (
            <Link
              className="inline-flex min-h-10 items-center justify-center rounded-full bg-(--khvi-navy) px-4 py-2 text-sm font-bold text-white shadow-sm hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--khvi-sun)"
              href="/volunteer/status#main-content"
            >
              {tr("ดูสถานะใบสมัคร", "View application status", "查看申请状态")}
            </Link>
          ) : (
            <Link
              className="inline-flex min-h-10 items-center justify-center rounded-full bg-(--khvi-navy) px-4 py-2 text-sm font-bold text-white shadow-sm hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--khvi-sun)"
              href="/volunteer/apply#main-content"
            >
              {tr("สมัครล่ามอาสา", "Volunteer apply", "申请志愿口译员")}
            </Link>
          )}
        </div>
      )}
    </div>
    <div className={interpreter ? "grid items-start gap-5 md:grid-cols-[minmax(0,1fr)_minmax(260px,360px)]" : "grid items-start gap-5 lg:grid-cols-[1.5fr_1fr]"}>
      <section className="order-2 relative min-h-[500px] overflow-hidden rounded-(--khvi-radius-lg) bg-(--khvi-navy) text-white sm:min-h-[460px] md:order-1">
        <ResponsiveHeroImage
          desktopSrc={interpreter ? "/khvi-interpreter-hero.png" : "/khvi-requester-hero.png"}
          mobileSrc={interpreter ? "/khvi-interpreter-hero-mobile.png" : "/khvi-requester-hero-mobile.png"}
          alt={interpreter
            ? tr("ล่ามอาสาช่วยผู้ใช้สื่อสารกับเจ้าหน้าที่บริการชุมชน", "A volunteer interpreter helping a user speak with a community service worker", "志愿口译员帮助用户与社区服务人员沟通")
            : tr("ผู้ขอความช่วยเหลือกำลังรับคำอธิบายจากล่ามอาสา", "A requester receiving an explanation from a volunteer interpreter", "求助者正在听志愿口译员讲解")}
          sizes="(min-width: 1024px) 60vw, 100vw"
          className="object-center md:object-[58%_center]"
        />
        <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(180deg,rgba(9,47,69,0.30)_0%,rgba(9,47,69,0.82)_58%,rgba(9,47,69,0.97)_100%)] md:bg-[linear-gradient(90deg,rgba(9,47,69,0.97)_0%,rgba(9,47,69,0.82)_50%,rgba(9,47,69,0.18)_100%)]" />
        <div className="relative z-10 flex min-h-[500px] flex-col items-start justify-end p-6 sm:min-h-[460px] sm:p-9">
          <span className="flex items-center gap-2 text-sm text-white/80"><LanguageIcon className="h-5 w-5" aria-hidden="true" /> KHVI · {tr("สื่อสารเข้าใจ ช่วยเหลือใกล้ตัว", "Community language help", "社区语言帮助")}</span>
          <h2 className="mt-6 max-w-lg text-3xl font-bold leading-tight sm:text-4xl">{interpreter ? tr("ใช้ภาษาที่คุณถนัด ช่วยให้ใครสักคนเข้าใจ", "Help someone be understood.", "用你的语言能力，帮助身边的人。") : tr("ต้องการความช่วยเหลือด้านภาษา เริ่มได้ที่นี่", "A little language help starts here.", "沟通有困难？从这里开始。")}</h2>
          <div className="mt-5 max-w-lg border-l-2 border-white/45 pl-4">
            <p className="leading-8 text-white/85">{interpreter ? tr("ค้นหาคำขอตามภาษา หมวดหมู่ และระยะทาง ตรวจสอบก่อนรับงาน และรับผิดชอบครั้งละหนึ่งภารกิจ", "Explore requests by language, category and distance. Review each request and take one assignment at a time.", "按语言、类别和距离查找请求。确认详情后接单，一次只接受一个任务。") : tr("เลือกภาษา หมวดหมู่ และจุดนัดพบ ล่ามที่ตรงเงื่อนไขจะเป็นผู้เลือกกดรับคำขอของคุณ", "Choose a language, category and meeting point. A suitable interpreter chooses to claim your request.", "选择语言、类别和见面地点，符合条件的口译员会自行接单。")}</p>
          </div>
          {!interpreter && <Link className={`${heroButton} mt-7`} href="/request-help#main-content">{tr("ต้องการขอความช่วยเหลือ", "Create a help request", "创建求助请求")}<ArrowRightIcon className="h-4 w-4" aria-hidden="true" /></Link>}
        </div>
      </section>
      {!interpreter && (
        <aside className={`${panel} ${current ? "order-1" : "order-3"} h-fit self-start border-l-4 border-l-(--khvi-teal) lg:order-2 lg:h-auto lg:self-stretch ${!current ? "flex flex-col" : ""}`} aria-labelledby="current-title">
          <div className="flex flex-wrap justify-between gap-3">
            <h2 id="current-title" className="text-xl font-bold">{tr("คำขอความช่วยเหลือที่กำลังดำเนินการ", "Current help request", "当前进行中的求助")}</h2>
            {current && <div className="flex flex-wrap gap-2"><UrgencyBadge urgency={current.urgency} copyLocale={locale === "th" ? "th" : copyLocale} /><StatusBadge status={current.status} copyLocale={locale === "th" ? "th" : copyLocale} /></div>}
          </div>
          {current ? <>
            <dl className="mt-5 divide-y divide-(--khvi-teal)/15 border-y border-(--khvi-teal)/15 text-sm">
              <div className="grid gap-1 py-3 sm:grid-cols-[8rem_1fr] lg:grid-cols-1 xl:grid-cols-[8rem_1fr]">
                <dt className="font-bold text-(--khvi-ink)/60">{tr("ภาษาและหมวดหมู่", "Language and category", "语言和类别")}</dt>
                <dd className="font-semibold text-(--khvi-ink)">{lang(current)} · {cat(current)}</dd>
              </div>
              <div className="grid gap-1 py-3 sm:grid-cols-[8rem_1fr] lg:grid-cols-1 xl:grid-cols-[8rem_1fr]">
                <dt className="font-bold text-(--khvi-ink)/60">{tr("พื้นที่นัดพบ", "Meeting area", "见面区域")}</dt>
                <dd className="text-(--khvi-ink)">{current.areaName}</dd>
              </div>
            </dl>
            {current.status === "Open" && current.expiresAt && <div className="mt-3"><ExpiryCountdown key={current.requestId} seconds={0} expiresAt={current.expiresAt} copyLocale={locale === "th" ? "th" : copyLocale} /></div>}
            <p className="my-4 rounded-lg bg-(--khvi-teal)/10 px-4 py-3 text-sm leading-6" role="status">{nextAction}</p>
            {current.interpreter && <div className="mb-4 flex items-center gap-3"><LanguageIcon className="h-6 w-6 shrink-0 text-(--khvi-teal)" aria-hidden="true" /><div><p className="text-xs font-bold text-(--khvi-ink)/60">{tr("ล่ามที่รับงาน", "Assigned interpreter", "接单口译员")}</p><p className="font-bold">{current.interpreter.name}</p><p className="text-sm text-(--khvi-ink)/70">{current.interpreter.primaryLanguage}</p></div></div>}
            <Link className={`${button} w-full`} href={`/my-requests/${current.requestId}#main-content`}>{tr("ดูรายละเอียดทั้งหมด", "View all details", "查看全部详情")}<ArrowRightIcon className="h-4 w-4" aria-hidden="true" /></Link>
            {active.length > 1 && <p className={muted}>{tr("คุณมีหลายรายการที่กำลังดำเนินการ สามารถเปิดดูรายการทั้งหมดได้", "You have multiple active records. Open the full list to view them all.", "您有多个进行中的记录，请在完整列表中查看。")}</p>}
          </> : <div className="mt-5 flex flex-1 flex-col items-center justify-center border-t border-(--khvi-teal)/15 py-6 text-center sm:py-8">
            <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-(--khvi-teal)/10 sm:h-24 sm:w-24">
              <ClipboardDocumentListIcon className="h-10 w-10 text-(--khvi-teal) sm:h-12 sm:w-12" aria-hidden="true" />
            </div>
            <h3 className="text-lg font-bold text-(--khvi-ink)">{tr("ยังไม่มีคำขอที่กำลังดำเนินการ", "No active help requests", "暂无进行中的求助")}</h3>
            <p className="mt-2 max-w-[28ch] text-sm leading-7 text-(--khvi-ink)/70">{tr("เมื่อมีคำขอ คุณจะติดตามสถานะและล่ามที่รับงานได้ที่นี่", "Track your request status and assigned interpreter here when you have an active request.", "有进行中的求助时，可在此查看状态及接单口译员。")}</p>
          </div>}
        </aside>
      )}
      {interpreter && (current ? <aside className={`${panel} order-1 h-fit self-start border-l-4 border-l-(--khvi-teal) md:order-2 md:h-full md:self-stretch`} aria-labelledby="active-assignment-title">
        <div className="flex flex-wrap justify-between gap-3">
          <h2 id="active-assignment-title" className="text-xl font-bold">{tr("งานที่กำลังดำเนินการ", "Current assignment", "进行中的任务")}</h2>
          <div className="flex flex-wrap gap-2"><UrgencyBadge urgency={current.urgency} copyLocale={locale === "th" ? "th" : copyLocale} /><StatusBadge status={current.status} copyLocale={locale === "th" ? "th" : copyLocale} /></div>
        </div>
        <dl className="mt-5 divide-y divide-(--khvi-teal)/15 border-y border-(--khvi-teal)/15 text-sm">
          <div className="grid gap-1 py-3">
            <dt className="font-bold text-(--khvi-ink)/60">{tr("ภาษาและหมวดหมู่", "Language and category", "语言和类别")}</dt>
            <dd className="font-semibold text-(--khvi-ink)">{lang(current)} · {cat(current)}</dd>
          </div>
          <div className="grid gap-1 py-3">
            <dt className="font-bold text-(--khvi-ink)/60">{tr("พื้นที่นัดพบ", "Meeting area", "见面区域")}</dt>
            <dd className="text-(--khvi-ink)">{current.areaName}</dd>
          </div>
        </dl>
        <p className="my-4 rounded-lg bg-(--khvi-teal)/10 px-4 py-3 text-sm leading-6" role="status">{nextAction}</p>
        {current.requester && <div className="mb-4 flex items-center gap-3"><LanguageIcon className="h-6 w-6 shrink-0 text-(--khvi-teal)" aria-hidden="true" /><div><p className="text-xs font-bold text-(--khvi-ink)/60">{tr("ผู้ขอความช่วยเหลือ", "Requester", "求助者")}</p><p className="font-bold">{current.requester.name}</p></div></div>}
        <Link className={`${button} w-full`} href={`/my-requests/${current.requestId}#main-content`}>{tr("ดูรายละเอียดทั้งหมด", "View all details", "查看全部详情")}<ArrowRightIcon className="h-4 w-4" aria-hidden="true" /></Link>
        {active.length > 1 && <p className={muted}>{tr("คุณมีหลายงานที่กำลังดำเนินการ สามารถเปิดดูงานทั้งหมดได้", "You have multiple active assignments. Open your assignments to view them all.", "您有多个进行中的任务，请打开任务列表查看全部内容。")}</p>}
      </aside> : <aside className={`${panel} order-1 flex h-fit flex-col self-start md:order-2 md:h-full md:self-stretch`} aria-labelledby="nearby-title">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 id="nearby-title" className="flex items-center gap-2 text-xl font-bold"><MapPinIcon className="h-6 w-6 shrink-0 text-(--khvi-teal)" aria-hidden="true" />{tr("คำขอใกล้เคียง", "Nearby requests", "附近求助")}</h2>
          </div>
          <span className="rounded-full bg-(--khvi-teal)/10 px-3 py-1 text-xs font-bold text-(--khvi-teal)">5 km</span>
        </div>
        <button className={`${button} mt-4 w-full disabled:opacity-50`} onClick={locate} disabled={geo === "loading"}>{geo === "loading" ? tr("กำลังค้นหาตำแหน่ง…", "Locating…", "正在定位…") : geo === "error" ? tr("ลองใช้ตำแหน่งอีกครั้ง", "Try location again", "再次尝试定位") : tr("ใช้ตำแหน่งปัจจุบัน", "Use my current location", "使用当前位置")}</button>
        {geo === "error" && <p role="status" className="mt-2 text-xs leading-5 text-(--khvi-coral)">{tr("เข้าถึงตำแหน่งไม่ได้ ลองอีกครั้ง", "Location unavailable. Try again.", "无法获取位置，请重试。")}</p>}
        <div className="mx-auto mt-4 aspect-square w-[280px] max-w-full overflow-hidden rounded-full">
          <RequestMap
            requests={location ? nearbyOpen : []}
            userLocation={location ? { latitude: location.latitude, longitude: location.longitude } : null}
            selectedRequest={null}
            mapLabel={tr("แผนที่คำขอใกล้เคียง", "Nearby help request map", "附近求助地图")}
            loadingLabel={tr("กำลังโหลดแผนที่…", "Loading map…", "正在加载地图…")}
            myLocationLabel={tr("ตำแหน่งปัจจุบัน", "Current location", "当前位置")}
            onSelect={() => undefined}
            compact
            radiusKm={5}
          />
        </div>
        <Link className={`${button} mt-4 w-full`} href="/find-requests#main-content">{tr("เปิดแผนที่เต็ม", "Open full map", "打开完整地图")}<ArrowRightIcon className="h-4 w-4" aria-hidden="true" /></Link>
      </aside>)}
    </div>
    {interpreter && <section className={`${panel} mt-7`} aria-labelledby="discover-title"><h2 id="discover-title" className="flex items-center gap-2 text-xl font-bold"><MagnifyingGlassIcon className="h-6 w-6 shrink-0 text-(--khvi-teal)" aria-hidden="true" />{tr("ค้นหาคำขอที่เหมาะกับคุณ", "Explore suitable requests", "查找合适的请求")}</h2><p className={muted}>{tr("ค้นหาและกรองคำขอที่ตรงกับความสามารถของคุณ", "Filter open requests that match your skills.", "按技能筛选符合您能力的求助任务。")}</p><div className="mt-4 grid gap-4 sm:grid-cols-2"><label className="text-sm font-bold">{tr("ภาษา", "Language", "语言")}<select className="mt-2 min-h-12 w-full rounded-lg border border-(--khvi-teal)/30 bg-white px-3" value={language} onChange={e => setLanguage(e.target.value)}><option value="all">{tr("ทุกภาษา", "All languages", "全部语言")}</option>{referenceCatalog.languages.map(option => <option key={option.id} value={option.id}>{referenceLabel([option], option.id, locale)}</option>)}</select></label><label className="text-sm font-bold">{tr("หมวดหมู่", "Category", "类别")}<select className="mt-2 min-h-12 w-full rounded-lg border border-(--khvi-teal)/30 bg-white px-3" value={category} onChange={e => setCategory(e.target.value)}><option value="all">{tr("ทุกหมวดหมู่", "All categories", "全部类别")}</option>{referenceCatalog.categories.map(option => <option key={option.id} value={option.id}>{referenceLabel([option], option.id, locale)}</option>)}</select></label></div>{open.length ? <ul className="mt-3 divide-y divide-(--khvi-teal)/20">{open.map(r => requestRow(r, true))}</ul> : <p role="status" className="my-6 rounded-lg bg-(--khvi-paper) p-5 text-sm leading-7">{diagnostic?.status === "application_not_approved" ? tr("ใบสมัครล่ามของคุณยังไม่ได้รับการอนุมัติ จึงยังไม่สามารถดูคำขอเปิดได้", "Your interpreter application is pending approval.", "您的口译员申请正在审核中，暂无法查看开放任务。") : diagnostic?.status === "no_matching_skills" ? tr("ยังไม่มีคำขอเปิดที่ตรงกับภาษาหรือหมวดหมู่ที่คุณได้รับอนุมัติ", "No open requests currently match your approved skills.", "当前暂无符合您获批技能的求助任务。") : tr("ยังไม่มีคำขอเปิดที่ตรงกับเงื่อนไขการค้นหา ลองเปลี่ยนภาษา หมวดหมู่ หรือระยะค้นหา", "No open requests match these filters. Try another language, category or distance.", "没有符合筛选条件的开放求助，请调整语言、类别或距离。")}</p>}<Link className="inline-flex min-h-11 items-center gap-2 font-bold underline underline-offset-4" href="/find-requests#main-content">{tr("เปิดแผนที่ทั้งหมด", "Open the full map", "打开完整地图")}<ArrowRightIcon className="h-4 w-4" aria-hidden="true" /></Link></section>}
    <section className={`${panel} mt-7`}><div className="flex flex-wrap items-center justify-between gap-3"><h2 className="flex items-center gap-2 text-xl font-bold">{interpreter && <ClockIcon className="h-6 w-6 shrink-0 text-(--khvi-teal)" aria-hidden="true" />}{interpreter ? tr("งานที่ผ่านมาของคุณ", "Your past work", "您的历史工作") : tr("คำขอล่าสุด", "Recent requests", "最近的请求")}</h2><Link className="inline-flex min-h-11 items-center font-bold underline underline-offset-4" href={listPath}>{tr("ดูทั้งหมด", "View all", "查看全部")}</Link></div>{recent.length ? <ul className="divide-y divide-(--khvi-teal)/20">{recent.map(r => requestRow(r, false))}</ul> : <div className="flex items-start gap-4 py-6"><ClipboardDocumentListIcon className="h-8 w-8 shrink-0 text-(--khvi-teal)" aria-hidden="true" /><div><p className="text-sm leading-7">{interpreter ? tr("ยังไม่มีงานที่ผ่านมา เมื่อล่ามรับงาน รายการจะแสดงที่นี่", "You have no past assignments yet. Claimed assignments will appear here.", "您还没有历史任务，接取任务后会显示在这里。") : tr("ยังไม่มีคำขอล่าสุด เมื่อคุณส่งคำขอความช่วยเหลือ รายการจะแสดงที่นี่", "You have no recent requests yet. Requests you submit will appear here.", "您还没有最近的求助，提交求助后会显示在这里。")}</p><Link className="mt-2 inline-flex min-h-10 items-center gap-2 text-sm font-bold underline underline-offset-4" href={interpreter ? "/find-requests#main-content" : "/request-help#main-content"}>{interpreter ? tr("ค้นหาคำขอ", "Find requests", "查找求助") : tr("ขอความช่วยเหลือ", "Request help", "请求帮助")}<ArrowRightIcon className="h-4 w-4" aria-hidden="true" /></Link></div></div>}</section>
    <div className="mt-7 grid items-stretch gap-5 md:grid-cols-2">
      <section id="volunteer-application" className="h-full scroll-mt-28 [&>section]:h-full"><ApplicationStatusCard application={activeApplication} /></section>
      <section className={`${panel} h-full`}>{interpreter ? <>
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-(--khvi-coral)/10"><HeartIcon className="h-7 w-7 text-(--khvi-coral)" aria-hidden="true" /></div>
        <h2 className="mt-4 text-xl font-bold">{tr("ขอบคุณที่สมัครเป็นล่ามอาสา", "Thank you for volunteering as an interpreter", "感谢您申请成为志愿口译员")}</h2>
        <p className={muted}>{tr("ขอบคุณที่แบ่งปันทักษะด้านภาษาเพื่อช่วยให้ผู้คนสื่อสารและเข้าใจกันได้ดียิ่งขึ้น", "Thank you for sharing your language skills and helping people communicate and understand one another.", "感谢您分享语言能力，帮助人们更顺畅地沟通和相互理解。")}</p>
      </> : <>
        <ShieldCheckIcon className="h-7 w-7 text-(--khvi-teal)" aria-hidden="true" />
        <h2 className="mt-3 text-xl font-bold">{tr("รีวิวหลังจบภารกิจ", "Review after completion", "完成后评价")}</h2>
        <p className={muted}>{completed.length ? tr(`มีงานที่เสร็จแล้ว ${completed.length} รายการจาก Supabase ระบบยังตรวจไม่ได้ว่างานใดรีวิวแล้ว`, `${completed.length} completed records from Supabase. Review status is not available yet.`, `Supabase 中有${completed.length}条已完成记录，评价状态尚不可用。`) : tr("เมื่อทั้งสองฝ่ายยืนยันจบงาน คุณจึงให้คะแนนล่ามได้ ยังไม่มีงานที่เสร็จใน Supabase", "Reviews follow confirmation from both people. There are no completed Supabase records yet.", "双方确认完成后才能评价，Supabase 中暂无已完成记录。")}</p>
        <p className="mt-4 rounded-lg bg-(--khvi-paper) p-3 text-sm leading-6">{tr("ระบบส่งรีวิวยังไม่เปิดใช้งาน", "Review submission is not available yet.", "评价提交尚未开放。")}</p>
      </>}</section>
    </div>
  </main>;
}
