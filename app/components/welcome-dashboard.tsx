"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AcademicCapIcon, ArrowRightIcon, ClockIcon, MapPinIcon, LanguageIcon, ShieldCheckIcon, ClipboardDocumentListIcon } from "@heroicons/react/24/outline";
import { useCopyLocale, useUiLocale } from "./app-shell";
import { ExpiryCountdown } from "./expiry-countdown";
import { ResponsiveHeroImage } from "./responsive-hero-image";
import { StatusBadge, UrgencyBadge } from "./request-badges";
import { useRequests } from "@/app/lib/request-store";
import { categoryLabel, languageLabel, LANGUAGES, CATEGORIES, type HelpRequest } from "@/app/lib/mock-requests";
import { getDisplayName, type UserProfile } from "@/app/lib/mock-auth";
import { getVolunteerApplication, subscribeVolunteerApplications, type VolunteerApplicationSummary } from "@/app/lib/volunteer-application-store";
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
  const displayName = getDisplayName(user.name);
  const { requests, ready } = useRequests();
  const [location, setLocation] = useState<GeolocationCoordinates | null>(null);
  const [geo, setGeo] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [radius, setRadius] = useState("all");
  const [language, setLanguage] = useState("all");
  const [category, setCategory] = useState("all");
  const [volunteerApplication, setVolunteerApplication] = useState<VolunteerApplicationSummary | null>(null);
  const [applicationReady, setApplicationReady] = useState(user.role !== "User");
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

  useEffect(() => {
    if (user.role !== "User") return;

    const refreshApplication = () => {
      setVolunteerApplication(getVolunteerApplication(user.userId));
      setApplicationReady(true);
    };

    refreshApplication();
    return subscribeVolunteerApplications(refreshApplication);
  }, [user.role, user.userId]);

  function volunteerApplicationCard() {
    if (user.role !== "User") return null;

    if (volunteerApplication) {
      const statusLabel = volunteerApplication.status === "approved"
        ? tr("อนุมัติแล้ว", "Approved", "已批准")
        : volunteerApplication.status === "needs_revision"
          ? tr("ต้องส่งเอกสารเพิ่ม", "More information needed", "需要补充资料")
          : volunteerApplication.status === "rejected"
            ? tr("ไม่ผ่านการพิจารณา", "Not approved", "未通过")
            : tr("กำลังตรวจสอบ", "Under review", "审核中");
      const submittedLabel = new Date(volunteerApplication.submittedAt).toLocaleDateString(
        locale === "th" ? "th-TH" : locale === "zh" ? "zh-CN" : "en-US",
        { day: "numeric", month: "short", year: "numeric" },
      );

      return (
        <Link
          id="volunteer-application"
          href="/volunteer/status"
          className={`${panel} group mt-7 block scroll-mt-28 border-l-4 border-l-(--khvi-teal) transition-colors hover:border-(--khvi-teal) hover:bg-(--khvi-paper) focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--khvi-sun)`}
          aria-label={`${tr("ดูรายละเอียดสถานะสมัครเป็นล่าม", "View interpreter application status", "查看口译员申请状态")}: ${statusLabel}`}
        >
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex min-w-0 items-start gap-4">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-(--khvi-teal)/10 text-(--khvi-teal)">
                <ClockIcon className="h-6 w-6" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <p className="text-xs font-bold text-(--khvi-teal)">{tr("สถานะใบสมัครล่าม", "Interpreter application", "口译员申请")}</p>
                <h2 className="mt-1 text-xl font-bold">{statusLabel}</h2>
                <p className={muted}>{tr("เจ้าหน้าที่กำลังตรวจข้อมูลและเอกสารของคุณ", "Your information and documents are being reviewed.", "工作人员正在审核您的资料和文件。")}</p>
              </div>
            </div>
            <span className="rounded-full bg-(--khvi-teal)/10 px-3 py-1.5 text-xs font-bold text-(--khvi-teal)">{statusLabel}</span>
          </div>
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-(--khvi-teal)/20 pt-4 text-sm">
            <span className="text-(--khvi-ink)/65">{volunteerApplication.applicationId} · {submittedLabel}</span>
            <span className="inline-flex min-h-11 items-center gap-2 font-bold text-(--khvi-teal) underline underline-offset-4">
              {tr("ดูรายละเอียดสถานะ", "View status details", "查看状态详情")}
              <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </span>
          </div>
        </Link>
      );
    }

    return (
      <section id="volunteer-application" className={`${panel} mt-7 scroll-mt-28`}>
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-(--khvi-teal)/10 text-(--khvi-teal)">
              <AcademicCapIcon className="h-7 w-7" aria-hidden="true" />
            </span>
            <div>
              <h2 className="text-xl font-bold">{tr("สมัครเป็นล่ามจิตอาสา", "Become a volunteer interpreter", "申请成为志愿口译员")}</h2>
              <p className={muted}>{tr("ใช้ภาษาที่คุณถนัดเพื่อช่วยให้ผู้อื่นสื่อสารได้ชัดเจนขึ้น เตรียมข้อมูลภาษา หมวดหมู่งาน และเอกสารรับรองเพื่อให้เจ้าหน้าที่ตรวจสอบ", "Use your language skills to help others communicate. Prepare your languages, preferred work categories, and supporting documents for review.", "运用您的语言能力帮助他人沟通。请准备语言、服务类别和证明文件以供审核。")}</p>
            </div>
          </div>
          <Link className={`${button} w-full shrink-0 sm:w-auto`} href="/volunteer/apply">
            {tr("สมัครเป็นล่าม", "Apply as interpreter", "申请成为口译员")}
            <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </section>
    );
  }
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

  if (!interpreter) {
    const primaryHref = current ? `/my-requests/${current.requestId}#main-content` : "/request-help#main-content";
    const primaryLabel = current
      ? tr("ติดตามคำขอปัจจุบัน", "Continue current request", "继续当前求助")
      : tr("สร้างคำขอความช่วยเหลือ", "Create a help request", "创建求助请求");

    return <main id="main-content" className="mx-auto max-w-[1320px] px-5 py-8 sm:px-8 lg:px-12 lg:py-10">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-(--khvi-teal)">{tr("ยินดีต้อนรับ", "Welcome", "欢迎")}</p>
          <h1 className="mt-1 break-words text-3xl font-bold">{displayName}</h1>
        </div>
        {interpreterAccount ? (
          <div className="w-full sm:w-auto">
            <p className="mb-2 text-xs font-bold text-(--khvi-ink)/65 sm:text-right">{tr("เลือกโหมดการใช้งาน", "Choose how to use KHVI", "选择使用模式")}</p>
            <div
              role="group"
              aria-label={tr("สลับระหว่างการช่วยเหลือและการขอความช่วยเหลือ", "Switch between helping and requesting help", "在提供帮助和请求帮助之间切换")}
              className="grid min-h-12 w-full grid-cols-2 rounded-full border border-(--khvi-teal)/30 bg-white p-1 shadow-sm sm:min-w-[330px]"
            >
              {(["helper", "requester"] as const).map((mode) => {
                const selected = interpreterMode === mode;
                const label = mode === "helper"
                  ? tr("เข้ามาช่วยเหลือ", "Help others", "提供帮助")
                  : tr("เข้ามาขอความช่วยเหลือ", "Request help", "请求帮助");
                return <button
                  key={mode}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => onInterpreterModeChange?.(mode)}
                  className={`min-h-10 rounded-full px-4 py-2 text-sm font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--khvi-sun) ${selected ? "bg-(--khvi-navy) text-white shadow-sm" : "text-(--khvi-ink)/70 hover:bg-(--khvi-paper)"}`}
                >
                  {label}
                </button>;
              })}
            </div>
          </div>
        ) : applicationReady ? (
          <Link
            href={volunteerApplication ? "/volunteer/status" : "/volunteer/apply"}
            className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-(--khvi-radius-sm) border border-(--khvi-teal) bg-white px-4 py-2 text-sm font-bold text-(--khvi-teal) transition-colors hover:bg-(--khvi-paper) focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--khvi-sun) sm:w-auto"
          >
            {volunteerApplication ? <ClockIcon className="h-5 w-5" aria-hidden="true" /> : <AcademicCapIcon className="h-5 w-5" aria-hidden="true" />}
            {volunteerApplication
              ? tr("ตรวจสอบสถานะสมัครล่าม", "Check interpreter application", "查看口译员申请")
              : tr("สมัครเป็นล่าม", "Apply as interpreter", "申请成为口译员")}
          </Link>
        ) : (
          <span className="h-11 w-full animate-pulse rounded-(--khvi-radius-sm) bg-(--khvi-teal)/10 sm:w-36" aria-hidden="true" />
        )}
      </div>

      <p className="mb-6 rounded-lg bg-(--khvi-sun)/10 px-4 py-3 text-xs leading-6">
        {tr(
          "โหมดต้นแบบ · ข้อมูลในหน้านี้จัดเก็บเฉพาะในเบราว์เซอร์ และยังไม่ได้เชื่อมกับบัญชีจริง",
          "Preview · Information on this page is stored only in this browser and is not connected to a real account.",
          "预览模式 · 此页面的信息仅保存在当前浏览器中，尚未连接真实账户。",
        )}
      </p>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.8fr)_minmax(18rem,0.9fr)]">
        <section className="group relative min-h-[390px] overflow-hidden rounded-(--khvi-radius-lg) bg-(--khvi-navy) shadow-(--khvi-shadow-soft)" aria-labelledby="user-photo-hero-title">
          <ResponsiveHeroImage
            desktopSrc="/khvi-requester-hero.png"
            mobileSrc="/khvi-requester-hero-mobile.png"
            alt={tr("ผู้ขอความช่วยเหลือกำลังรับคำอธิบายจากล่ามอาสา", "A requester receiving an explanation from a volunteer interpreter", "求助者正在听志愿口译员讲解")}
            sizes="(min-width: 1024px) 62vw, 100vw"
            className="object-center md:object-[58%_center]"
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(9,47,69,0.95)_0%,rgba(9,47,69,0.78)_46%,rgba(9,47,69,0.18)_100%)]" />
          <div className="relative z-10 flex min-h-[390px] max-w-2xl flex-col items-start justify-end p-6 text-white sm:p-9">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/12 px-3 py-1.5 text-xs font-bold text-white backdrop-blur-sm">
              <LanguageIcon className="h-4 w-4" aria-hidden="true" />
              {tr("ความช่วยเหลือด้านภาษาใกล้ตัว", "Language help nearby", "附近的语言帮助")}
            </span>
            <h2 id="user-photo-hero-title" className="mt-5 max-w-xl text-3xl font-bold leading-tight sm:text-4xl">
              {tr("สื่อสารสิ่งสำคัญได้ตรงกัน", "Communicate what matters clearly", "清楚传达重要信息")}
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-7 text-white/82 sm:text-base">
              {tr(
                "ระบุภาษา สถานการณ์ และจุดนัดพบ แล้วติดตามทุกขั้นตอนจากหน้าเดียว",
                "Add the language, situation and meeting point, then follow every step from one place.",
                "填写语言、情况和见面地点，然后在一个页面跟进所有步骤。",
              )}
            </p>
            <div className="mt-6 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <Link className={`${lightButton} w-full sm:w-auto`} href={primaryHref}>
                {primaryLabel}
                <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link className={`${button} w-full border border-white/40 sm:w-auto`} href="/my-requests#main-content">
                {tr("คำขอทั้งหมด", "All requests", "全部求助")}
              </Link>
            </div>
          </div>
        </section>

        <aside className="grid content-start gap-3" aria-label={tr("ทางลัด", "Quick actions", "快捷操作")}>
          <Link
            href={primaryHref}
            className="group flex min-h-28 items-center gap-4 rounded-(--khvi-radius-md) border border-(--khvi-teal)/20 bg-(--khvi-surface) p-5 transition-[border-color,transform,box-shadow] hover:-translate-y-0.5 hover:border-(--khvi-teal)/55 hover:shadow-(--khvi-shadow-soft) focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--khvi-sun)"
          >
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-(--khvi-radius-sm) bg-(--khvi-teal)/10 text-(--khvi-teal)">
              {current ? <ClockIcon className="h-6 w-6" aria-hidden="true" /> : <LanguageIcon className="h-6 w-6" aria-hidden="true" />}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-bold">{current ? tr("ติดตามคำขอปัจจุบัน", "Track current request", "跟进当前求助") : tr("สร้างคำขอใหม่", "Create a new request", "创建新求助")}</span>
              <span className="mt-1 block text-xs leading-6 text-(--khvi-ink)/60">
                {current
                  ? `#${current.requestId} · ${lang(current)} · ${cat(current)}`
                  : tr("เลือกภาษา หมวดหมู่ และจุดนัดพบ", "Choose a language, category and meeting point", "选择语言、类别和见面地点")}
              </span>
            </span>
            <ArrowRightIcon className="h-5 w-5 shrink-0 text-(--khvi-teal) transition-transform group-hover:translate-x-1" aria-hidden="true" />
          </Link>
          <Link
            href="/my-requests#main-content"
            className="group flex min-h-28 items-center gap-4 rounded-(--khvi-radius-md) border border-(--khvi-teal)/20 bg-(--khvi-surface) p-5 transition-[border-color,transform,box-shadow] hover:-translate-y-0.5 hover:border-(--khvi-teal)/55 hover:shadow-(--khvi-shadow-soft) focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--khvi-sun)"
          >
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-(--khvi-radius-sm) bg-(--khvi-teal)/10 text-(--khvi-teal)"><ClipboardDocumentListIcon className="h-6 w-6" aria-hidden="true" /></span>
            <span className="min-w-0 flex-1"><span className="block font-bold">{tr("ดูคำขอทั้งหมด", "View all requests", "查看全部求助")}</span><span className="mt-1 block text-xs leading-6 text-(--khvi-ink)/60">{tr("ตรวจสอบงานนัดหมายและประวัติที่ผ่านมา", "Check appointments and request history", "查看预约和历史记录")}</span></span>
            <ArrowRightIcon className="h-5 w-5 shrink-0 text-(--khvi-teal) transition-transform group-hover:translate-x-1" aria-hidden="true" />
          </Link>
          <a
            href="#welcome-safety"
            className="group flex min-h-28 items-center gap-4 rounded-(--khvi-radius-md) border border-(--khvi-teal)/20 bg-(--khvi-surface) p-5 transition-[border-color,transform,box-shadow] hover:-translate-y-0.5 hover:border-(--khvi-teal)/55 hover:shadow-(--khvi-shadow-soft) focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--khvi-sun)"
          >
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-(--khvi-radius-sm) bg-(--khvi-sage)/12 text-(--khvi-sage)"><ShieldCheckIcon className="h-6 w-6" aria-hidden="true" /></span>
            <span className="min-w-0 flex-1"><span className="block font-bold">{tr("ก่อนพบล่าม", "Before meeting", "见面前")}</span><span className="mt-1 block text-xs leading-6 text-(--khvi-ink)/60">{tr("ดูว่าข้อมูลใดเปิดเผยในแต่ละขั้นตอน", "See what information is shared at each step", "了解各步骤会共享哪些信息")}</span></span>
            <ArrowRightIcon className="h-5 w-5 shrink-0 text-(--khvi-teal) transition-transform group-hover:translate-x-1" aria-hidden="true" />
          </a>
        </aside>
      </div>

      {!ready ? <div className={`${panel} mt-6`} role="status">{tr("กำลังโหลดคำขอ…", "Loading requests…", "正在加载求助…")}</div> : current && <section className={`${panel} mt-6 border-l-4 border-l-(--khvi-teal) shadow-(--khvi-shadow-soft)`} aria-labelledby="current-title">
        <div className="flex flex-wrap justify-between gap-3">
          <div>
            <h2 id="current-title" className="text-xl font-bold">{tr("คำขอที่กำลังติดตาม", "Request in progress", "正在跟进的求助")}</h2>
            <p className="mt-2 text-sm text-(--khvi-ink)/65">#{current.requestId} · {lang(current)} · {cat(current)}</p>
          </div>
          <div className="flex flex-wrap gap-2"><UrgencyBadge urgency={current.urgency} copyLocale={locale === "th" ? "th" : copyLocale} /><StatusBadge status={current.status} copyLocale={locale === "th" ? "th" : copyLocale} /></div>
        </div>
        <p className="mt-4 text-lg font-bold">{current.areaName}</p>
        <p className={muted}>{current.scheduledAtLabel ?? current.createdAtLabel}</p>
        {current.status === "Open" && current.expiresAt && <div className="mt-3"><ExpiryCountdown key={current.requestId} seconds={0} expiresAt={current.expiresAt} copyLocale={locale === "th" ? "th" : copyLocale} /></div>}
        <p className="my-5 rounded-lg bg-(--khvi-teal)/10 px-4 py-3 text-sm leading-7" role="status">{nextAction}</p>
        {current.interpreter && <div className="mb-5 flex items-center gap-3"><LanguageIcon className="h-6 w-6 text-(--khvi-teal)" aria-hidden="true" /><div><p className="font-bold">{current.interpreter.name}</p><p className="text-sm text-(--khvi-ink)/70">{current.interpreter.primaryLanguage}</p></div></div>}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-sm text-(--khvi-ink)/60">{tr("เปิดรายละเอียดเพื่อดูสถานะล่าสุดและสิ่งที่ต้องทำต่อ", "Open the request for its latest status and next step.", "打开求助查看最新状态和下一步。")}</span>
          <Link className={`${button} w-full shrink-0 sm:w-auto`} href={`/my-requests/${current.requestId}#main-content`}>{tr("เปิดรายละเอียด", "Open details", "查看详情")}<ArrowRightIcon className="h-4 w-4" aria-hidden="true" /></Link>
        </div>
      </section>}

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <section className={panel}>
          <div className="flex items-start justify-between gap-4"><div><h2 className="text-xl font-bold">{tr("เลือกเวลาที่เหมาะกับคุณ", "Choose the timing that fits", "选择合适的时间")}</h2><p className={muted}>{tr("เลือกประเภทคำขอก่อนกรอกรายละเอียด", "Choose a request type before adding the details.", "填写详情前先选择求助类型。")}</p></div><span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-(--khvi-teal)/10 text-(--khvi-teal)"><ClockIcon className="h-6 w-6" aria-hidden="true" /></span></div>
          <div className="mt-5 border-t border-(--khvi-teal)/20 pt-5"><h3 className="font-bold">{tr("ต้องการความช่วยเหลือด่วน", "Need help soon", "紧急求助")}</h3><p className={muted}>{tr("คำขอหมดอายุใน 30 นาที หากยังไม่มีล่ามรับงาน", "The request expires after 30 minutes if no interpreter claims it.", "若30分钟内无人接单，请求将过期。")}</p></div>
          <div className="mt-5 border-t border-(--khvi-teal)/20 pt-5"><h3 className="font-bold">{tr("นัดหมายล่วงหน้า", "Plan a meeting", "预约帮助")}</h3><p className={muted}>{tr("เลือกเวลานัดได้ตั้งแต่วันถัดไป โดยไม่จำกัดวันสูงสุด", "Choose any time from the next calendar day onward.", "可选择从下一个日历日开始的任意时间。")}</p></div>
        </section>

        <section className={panel} aria-labelledby="recent-title">
          <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 id="recent-title" className="text-xl font-bold">{tr("คำขอล่าสุด", "Recent requests", "最近的求助")}</h2><p className={muted}>{tr("ติดตามสถานะและกลับไปดูรายละเอียดได้จากรายการนี้", "Track status and return to request details here.", "在此跟进状态并返回查看详情。")}</p></div><Link className="inline-flex min-h-11 items-center font-bold underline underline-offset-4" href="/my-requests#main-content">{tr("ดูทั้งหมด", "View all", "查看全部")}</Link></div>
          {recent.length ? <ul className="mt-3 divide-y divide-(--khvi-teal)/20">{recent.map(r => requestRow(r))}</ul> : <div className="flex items-start gap-4 py-6"><ClipboardDocumentListIcon className="h-8 w-8 shrink-0 text-(--khvi-teal)" aria-hidden="true" /><p className="text-sm leading-7">{tr("ยังไม่มีประวัติในเบราว์เซอร์นี้ เมื่อมีรายการแล้วคุณจะกลับมาติดตามได้ที่นี่", "No history in this browser yet. Saved requests will appear here.", "此浏览器暂无历史记录，保存后的求助会显示在这里。")}</p></div>}
        </section>
      </div>

      {applicationReady && volunteerApplicationCard()}

      <section className={`${panel} mt-7`}>
        <ShieldCheckIcon className="h-7 w-7 text-(--khvi-teal)" aria-hidden="true" />
        <h2 className="mt-3 text-xl font-bold">{tr("รีวิวหลังจบภารกิจ", "Review after completion", "完成后评价")}</h2>
        <p className={muted}>{completed.length ? tr(`มีงานที่เสร็จแล้ว ${completed.length} รายการในเครื่องนี้ ระบบยังตรวจไม่ได้ว่างานใดรีวิวแล้ว`, `${completed.length} completed records on this device. Review status is not available yet.`, `此设备有${completed.length}条已完成记录，评价状态尚不可用。`) : tr("เมื่อทั้งสองฝ่ายยืนยันจบงาน คุณจึงให้คะแนนล่ามได้ ยังไม่มีงานที่เสร็จในเครื่องนี้", "You can review the interpreter after both people confirm completion. There are no completed records on this device yet.", "双方确认完成后才能评价，此设备暂无已完成记录。")}</p>
        <p className="mt-4 rounded-lg bg-(--khvi-paper) p-3 text-sm leading-6">{tr("ระบบส่งรีวิวยังไม่เปิดใช้งาน", "Review submission is not available yet.", "评价提交尚未开放。")}</p>
      </section>

      <section id="welcome-steps" className="mt-10 scroll-mt-28">
        <h2 className="text-2xl font-bold">{tr("จากคำขอจนจบภารกิจ", "From request to completion", "从请求到完成")}</h2>
        <ol className="mt-5 grid gap-6 border-y border-(--khvi-teal)/20 py-7 md:grid-cols-3">{[
          tr("เลือกภาษา หมวดหมู่ และจุดนัดพบ", "Choose language, category and meeting point", "选择语言、类别和见面地点"),
          tr("เมื่อล่ามรับงาน ตรวจสอบและยืนยันล่าม", "Review and confirm the interpreter after claim", "接单后查看并确认口译员"),
          tr("ทั้งสองฝ่ายยืนยันจบ แล้วจึงรีวิว", "Both confirm completion, then review", "双方确认完成后评价"),
        ].map((step, index) => <li key={step} className="flex gap-3 text-sm leading-7"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-(--khvi-teal)/15 font-bold">{index + 1}</span>{step}</li>)}</ol>
      </section>

      <section id="welcome-safety" className="mt-7 scroll-mt-28 rounded-(--khvi-radius-md) bg-(--khvi-sage)/10 p-6">
        <h2 className="font-bold">{tr("ข้อมูลละเอียดเปิดเมื่อคุณยืนยันล่าม", "Detailed information opens after you confirm the interpreter", "确认口译员后才开放详细信息")}</h2>
        <p className={muted}>{tr("ก่อนยืนยัน ระบบแสดงเพียงพื้นที่กว้าง ภาษา และหมวดหมู่ของคำขอ ตรวจสอบบุคคลและจุดนัดพบก่อนเดินทาง", "Before confirmation, the system shows only the broad area, language and category. Confirm who you are meeting and where before travelling.", "确认前，系统仅显示大致区域、语言和类别。出发前请确认见面对象和地点。")}</p>
      </section>
    </main>;
  }

  if (interpreter) {
    const interpreterNextAction = current?.status === "Claimed"
      ? tr(
        "คุณรับคำขอนี้แล้ว เปิดรายละเอียดเพื่อตรวจสอบขั้นตอนและรอผู้ขอยืนยันล่ามก่อนนัดพบ",
        "You claimed this request. Open the details and wait for the requester to confirm you before meeting.",
        "您已接下此求助。请打开详情，并在见面前等待求助者确认您。",
      )
      : current?.userConfirmedDoneAtLabel && current?.interpreterConfirmedDoneAtLabel === null
        ? tr("ผู้ขอยืนยันจบงานแล้ว กรุณาตรวจสอบและยืนยันจากฝั่งล่าม", "The requester confirmed completion. Review the assignment and confirm from your side.", "求助者已确认完成，请查看任务并从口译员一方确认。")
        : current?.interpreterConfirmedDoneAtLabel && current?.userConfirmedDoneAtLabel === null
          ? tr("คุณยืนยันจบงานแล้ว กำลังรอการยืนยันจากผู้ขอ", "You confirmed completion. Waiting for the requester.", "您已确认完成，正在等待求助者确认。")
          : tr("ภารกิจกำลังดำเนินการ เปิดรายละเอียดเพื่อดูตำแหน่งและยืนยันเมื่อช่วยเหลือเสร็จ", "The assignment is in progress. Open the details for location and completion controls.", "任务正在进行。打开详情查看位置并在协助结束后确认完成。");
    const primaryHref = current ? `/my-requests/${current.requestId}#main-content` : "/find-requests#main-content";
    const primaryLabel = current
      ? tr("ไปยังภารกิจปัจจุบัน", "Continue current assignment", "继续当前任务")
      : tr("ค้นหาคำขอใกล้คุณ", "Find nearby requests", "查找附近求助");

    return <main id="main-content" className="mx-auto max-w-[1320px] px-5 py-8 sm:px-8 lg:px-12 lg:py-10">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-(--khvi-teal)">{tr("พื้นที่ทำงานของล่าม", "Interpreter workspace", "口译员工作区")}</p>
          <h1 className="mt-1 break-words text-3xl font-bold">{tr(`สวัสดี ${displayName}`, `Hello, ${displayName}`, `您好，${displayName}`)}</h1>
        </div>
        <div className="w-full sm:w-auto">
          <p className="mb-2 text-xs font-bold text-(--khvi-ink)/65 sm:text-right">{tr("เลือกโหมดการใช้งาน", "Choose how to use KHVI", "选择使用模式")}</p>
          <div
            role="group"
            aria-label={tr("สลับระหว่างการช่วยเหลือและการขอความช่วยเหลือ", "Switch between helping and requesting help", "在提供帮助和请求帮助之间切换")}
            className="grid min-h-12 w-full grid-cols-2 rounded-full border border-(--khvi-teal)/30 bg-white p-1 shadow-sm sm:min-w-[330px]"
          >
            {(["helper", "requester"] as const).map((mode) => {
              const selected = interpreterMode === mode;
              const label = mode === "helper"
                ? tr("เข้ามาช่วยเหลือ", "Help others", "提供帮助")
                : tr("เข้ามาขอความช่วยเหลือ", "Request help", "请求帮助");
              return <button
                key={mode}
                type="button"
                aria-pressed={selected}
                onClick={() => onInterpreterModeChange?.(mode)}
                className={`min-h-10 rounded-full px-4 py-2 text-sm font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--khvi-sun) ${selected ? "bg-(--khvi-navy) text-white shadow-sm" : "text-(--khvi-ink)/70 hover:bg-(--khvi-paper)"}`}
              >
                {label}
              </button>;
            })}
          </div>
        </div>
      </div>

      <p className="mb-6 rounded-lg bg-(--khvi-sun)/10 px-4 py-3 text-xs leading-6">
        {tr(
          "โหมดต้นแบบ · รายการบันทึกอยู่ในเบราว์เซอร์นี้ ยังไม่ได้แยกตามบัญชีหรือยืนยันการจับคู่จริง",
          "Preview · Records are saved in this browser, not scoped to your account or verified as matches.",
          "预览模式 · 记录保存在此浏览器，尚未按账户区分或验证匹配。",
        )}
      </p>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.8fr)_minmax(19rem,0.9fr)]">
        <section className="relative min-h-[420px] overflow-hidden rounded-(--khvi-radius-lg) bg-(--khvi-navy) shadow-(--khvi-shadow-soft)" aria-labelledby="interpreter-photo-hero-title">
          <ResponsiveHeroImage
            desktopSrc="/khvi-interpreter-hero.png"
            mobileSrc="/khvi-interpreter-hero-mobile.png"
            alt={tr("ล่ามอาสาช่วยผู้ใช้สื่อสารกับเจ้าหน้าที่บริการชุมชน", "A volunteer interpreter helping a user speak with a community service worker", "志愿口译员帮助用户与社区服务人员沟通")}
            sizes="(min-width: 1024px) 64vw, 100vw"
            className="object-center md:object-[58%_center]"
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(9,47,69,0.97)_0%,rgba(9,47,69,0.86)_42%,rgba(9,47,69,0.22)_78%,rgba(9,47,69,0.06)_100%)]" />
          <div className="relative z-10 flex min-h-[420px] max-w-xl flex-col items-start justify-end p-6 text-white sm:p-9">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/12 px-3 py-1.5 text-xs font-bold backdrop-blur-sm">
              <LanguageIcon className="h-4 w-4" aria-hidden="true" />
              {tr("ใช้ภาษาของคุณช่วยให้เรื่องสำคัญเข้าใจกัน", "Use your language skills where they matter", "用您的语言能力帮助重要沟通")}
            </span>
            <h2 id="interpreter-photo-hero-title" className="mt-5 text-3xl font-bold leading-tight sm:text-4xl">
              {current
                ? tr("ภารกิจของคุณรออยู่", "Your assignment is ready to continue", "您的任务等待继续")
                : tr("ช่วยให้ใครสักคนสื่อสารได้อย่างมั่นใจ", "Help someone communicate with confidence", "帮助他人自信沟通")}
            </h2>
            <p className="mt-3 max-w-lg text-sm leading-7 text-white/85 sm:text-base">
              {current
                ? tr("กลับไปดูสถานะ ตำแหน่ง และขั้นตอนถัดไปของภารกิจปัจจุบัน", "Return to the current assignment for its status, location and next step.", "返回当前任务，查看状态、位置和下一步。")
                : tr("เลือกคำขอตามภาษา หมวดหมู่ และระยะทาง แล้วตรวจสอบรายละเอียดก่อนรับงาน", "Choose a request by language, category and distance, then review it before claiming.", "按语言、类别和距离选择求助，并在接单前查看详情。")}
            </p>
            <div className="mt-6 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <Link className={`${lightButton} w-full sm:w-auto`} href={primaryHref}>
                {primaryLabel}
                <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link className={`${button} w-full border border-white/40 sm:w-auto`} href="/my-assignments#main-content">
                {tr("งานของฉัน", "My assignments", "我的任务")}
              </Link>
            </div>
          </div>
        </section>

        <aside className={`${panel} shadow-(--khvi-shadow-soft)`} aria-labelledby="interpreter-location-title">
          <span className="grid h-12 w-12 place-items-center rounded-(--khvi-radius-sm) bg-(--khvi-teal)/10 text-(--khvi-teal)">
            <MapPinIcon className="h-7 w-7" aria-hidden="true" />
          </span>
          <h2 id="interpreter-location-title" className="mt-4 text-xl font-bold">{tr("ค้นหางานใกล้คุณ", "Find work near you", "查找附近任务")}</h2>
          <p className={muted}>{tr("ใช้ตำแหน่งเพื่อกรองคำขอ พิกัดของคุณจะไม่ถูกบันทึก", "Use your location to filter requests. Your coordinates are not saved.", "使用您的位置筛选求助，您的坐标不会被保存。")}</p>
          <button className={`${button} mt-5 w-full disabled:cursor-wait disabled:opacity-50`} onClick={locate} disabled={geo === "loading"}>
            {geo === "loading" ? tr("กำลังค้นหาตำแหน่ง…", "Locating…", "正在定位…") : tr("ใช้ตำแหน่งของฉัน", "Use my location", "使用我的位置")}
          </button>
          <p role="status" className={muted}>
            {geo === "error"
              ? tr("เข้าถึงตำแหน่งไม่ได้ ลองใหม่หรือดูทุกระยะ", "Location unavailable. Retry or browse all distances.", "无法获取位置，请重试或查看所有距离。")
              : geo === "ready"
                ? tr("เชื่อมต่อตำแหน่งปัจจุบันแล้ว", "Current location connected", "已连接当前位置")
                : tr("ยังไม่ได้เปิดใช้ตำแหน่ง", "Location has not been shared", "尚未共享位置")}
          </p>
          <label className="mt-4 block text-sm font-bold" htmlFor="welcome-radius">{tr("รัศมีค้นหา", "Search radius", "搜索半径")}</label>
          <select id="welcome-radius" className="mt-2 min-h-12 w-full rounded-lg border border-(--khvi-teal)/30 bg-white px-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--khvi-sun)" value={radius} onChange={event => setRadius(event.target.value)}>
            <option value="all">{tr("ทุกระยะ", "Any distance", "任何距离")}</option>
            {[5, 10, 25].map(kilometres => <option key={kilometres} value={kilometres} disabled={!location}>{kilometres} km</option>)}
          </select>
          <div className="mt-5 border-t border-(--khvi-teal)/20 pt-4">
            <Link className="group inline-flex min-h-11 items-center gap-2 font-bold text-(--khvi-teal) underline underline-offset-4" href="/find-requests#main-content">
              {tr("เปิดแผนที่คำขอทั้งหมด", "Open the full request map", "打开全部求助地图")}
              <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </Link>
          </div>
        </aside>
      </div>

      {!ready ? <div className={`${panel} mt-6`} role="status">{tr("กำลังโหลดคำขอ…", "Loading requests…", "正在加载求助…")}</div> : current && <section className={`${panel} mt-6 border-l-4 border-l-(--khvi-teal) shadow-(--khvi-shadow-soft)`} aria-labelledby="interpreter-current-title">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold text-(--khvi-teal)">{tr("ภารกิจปัจจุบัน", "Current assignment", "当前任务")}</p>
            <h2 id="interpreter-current-title" className="mt-1 text-xl font-bold">#{current.requestId} · {lang(current)} · {cat(current)}</h2>
            <p className={muted}>{current.areaName} · {current.scheduledAtLabel ?? current.createdAtLabel}</p>
          </div>
          <div className="flex flex-wrap gap-2"><UrgencyBadge urgency={current.urgency} copyLocale={locale === "th" ? "th" : copyLocale} /><StatusBadge status={current.status} copyLocale={locale === "th" ? "th" : copyLocale} /></div>
        </div>
        <p className="my-5 rounded-lg bg-(--khvi-teal)/10 px-4 py-3 text-sm leading-7" role="status">{interpreterNextAction}</p>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-sm text-(--khvi-ink)/60">{tr("ตรวจสอบข้อมูลที่เปิดเผยตามขั้นตอนก่อนเดินทาง", "Review the information available at this stage before travelling.", "出发前请查看此阶段可见的信息。")}</span>
          <Link className={`${button} w-full shrink-0 sm:w-auto`} href={`/my-requests/${current.requestId}#main-content`}>
            {tr("เปิดภารกิจ", "Open assignment", "打开任务")}
            <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
        {active.length > 1 && <p className={muted}>{tr("พบหลายรายการในข้อมูลต้นแบบ เปิดงานของฉันเพื่อเลือกภารกิจ", "This preview contains multiple active records. Open My assignments to choose one.", "预览中有多个进行中的记录，请打开“我的任务”进行选择。")}</p>}
      </section>}

      <section className={`${panel} mt-6`} aria-labelledby="discover-title">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold text-(--khvi-teal)">{tr("คำขอที่เปิดอยู่", "Open requests", "开放求助")}</p>
            <h2 id="discover-title" className="mt-1 text-2xl font-bold">{tr("ค้นหาคำขอที่เหมาะกับคุณ", "Find a suitable request", "查找适合您的求助")}</h2>
            <p className={muted}>{tr("กรองรายการในเครื่องตามภาษา หมวดหมู่ และระยะทาง รายการเหล่านี้ยังไม่ใช่ผลจับคู่จากโปรไฟล์", "Filter browser records by language, category and distance. These are not verified profile matches.", "按语言、类别和距离筛选浏览器记录，这些尚非经过验证的个人资料匹配。")}</p>
          </div>
          <Link className="inline-flex min-h-11 shrink-0 items-center gap-2 font-bold text-(--khvi-teal) underline underline-offset-4" href="/find-requests#main-content">
            {tr("ดูบนแผนที่", "View on map", "在地图上查看")}
            <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
        <div className="mt-5 grid gap-4 rounded-(--khvi-radius-sm) bg-(--khvi-paper) p-4 sm:grid-cols-2">
          <label className="text-sm font-bold">{tr("ภาษา", "Language", "语言")}
            <select className="mt-2 min-h-12 w-full rounded-lg border border-(--khvi-teal)/30 bg-white px-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--khvi-sun)" value={language} onChange={event => setLanguage(event.target.value)}>
              <option value="all">{tr("ทุกภาษา", "All languages", "全部语言")}</option>
              {LANGUAGES.map(item => <option key={item.id} value={item.id}>{locale === "th" ? thaiLanguages[item.id] : item[copyLocale]}</option>)}
            </select>
          </label>
          <label className="text-sm font-bold">{tr("หมวดหมู่", "Category", "类别")}
            <select className="mt-2 min-h-12 w-full rounded-lg border border-(--khvi-teal)/30 bg-white px-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--khvi-sun)" value={category} onChange={event => setCategory(event.target.value)}>
              <option value="all">{tr("ทุกหมวดหมู่", "All categories", "全部类别")}</option>
              {CATEGORIES.map(item => <option key={item.id} value={item.id}>{locale === "th" ? thaiCategories[item.id] : item[copyLocale]}</option>)}
            </select>
          </label>
        </div>
        {open.length
          ? <ul className="mt-3 divide-y divide-(--khvi-teal)/20">{open.map(request => requestRow(request, true))}</ul>
          : <p role="status" className="my-6 rounded-lg bg-(--khvi-paper) p-5 text-sm leading-7">{tr("ยังไม่มีคำขอในเครื่องที่ตรงตัวกรอง ลองเปลี่ยนภาษา หมวดหมู่ หรือระยะค้นหา", "No browser records match these filters. Try another language, category or distance.", "没有符合筛选条件的浏览器记录，请调整语言、类别或距离。")}</p>}
      </section>

      <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1.35fr)_minmax(18rem,0.65fr)]">
        <section className={panel} aria-labelledby="assignment-history-title">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 id="assignment-history-title" className="text-xl font-bold">{tr("ภารกิจที่ผ่านมาในเครื่องนี้", "Past assignments on this device", "此设备上的历史任务")}</h2>
              <p className={muted}>{tr("กลับไปดูสถานะและรายละเอียดของภารกิจที่ผ่านมา", "Return to the status and details of earlier assignments.", "返回查看以往任务的状态和详情。")}</p>
            </div>
            <Link className="inline-flex min-h-11 items-center font-bold underline underline-offset-4" href="/my-assignments#main-content">{tr("ดูทั้งหมด", "View all", "查看全部")}</Link>
          </div>
          {recent.length
            ? <ul className="mt-3 divide-y divide-(--khvi-teal)/20">{recent.map(request => requestRow(request))}</ul>
            : <div className="flex items-start gap-4 py-6"><ClipboardDocumentListIcon className="h-8 w-8 shrink-0 text-(--khvi-teal)" aria-hidden="true" /><p className="text-sm leading-7">{tr("ยังไม่มีประวัติในเบราว์เซอร์นี้ เมื่อทำภารกิจแล้วรายการจะปรากฏที่นี่", "There is no history in this browser yet. Completed assignments will appear here.", "此浏览器暂无历史记录，完成任务后会显示在这里。")}</p></div>}
        </section>

        <div className="grid gap-5">
          <section id="volunteer-application" className={`${panel} scroll-mt-28`}>
            <LanguageIcon className="h-7 w-7 text-(--khvi-teal)" aria-hidden="true" />
            <h2 className="mt-3 text-xl font-bold">{tr("โปรไฟล์ล่าม", "Interpreter profile", "口译员资料")}</h2>
            <p className={muted}>{tr("ข้อมูลภาษา หมวดหมู่ และสถานะอนุมัติยังไม่ได้เชื่อมกับบัญชีนี้ ตัวกรองด้านบนใช้สำรวจงานเท่านั้น", "Languages, categories and approval are not connected to this account yet. The filters above are for exploring requests.", "语言、类别和审批状态尚未关联到账户。上方筛选仅用于浏览求助。")}</p>
            <details className="mt-4 border-t border-(--khvi-teal)/20 pt-4">
              <summary className="min-h-11 cursor-pointer font-bold">{tr("ดูข้อมูลที่ต้องเตรียม", "What to prepare", "需要准备什么")}</summary>
              <ul className="list-disc space-y-2 py-3 pl-5 text-sm leading-7"><li>{tr("ภาษาและหมวดหมู่ที่ช่วยเหลือได้", "Languages and categories you can help with", "可提供服务的语言和类别")}</li><li>{tr("ช่องทางติดต่อและประสบการณ์ที่เกี่ยวข้อง", "Contact channels and relevant experience", "联系方式和相关经验")}</li></ul>
            </details>
          </section>
          <section className={`${panel} bg-(--khvi-sage)/10`}>
            <ShieldCheckIcon className="h-7 w-7 text-(--khvi-teal)" aria-hidden="true" />
            <h2 className="mt-3 text-xl font-bold">{tr("ดูแลความเป็นส่วนตัว", "Protect privacy", "保护隐私")}</h2>
            <p className={muted}>{tr("ก่อนผู้ขอยืนยันล่าม ให้ใช้เฉพาะพื้นที่กว้าง ๆ และข้อมูลที่จำเป็นต่อการตัดสินใจรับงาน", "Before requester confirmation, use only the broad area and information needed to assess the request.", "求助者确认前，仅使用大致区域和判断任务所需的信息。")}</p>
          </section>
        </div>
      </div>

      <section id="welcome-steps" className="mt-10 scroll-mt-28">
        <p className="text-xs font-bold text-(--khvi-teal)">{tr("ขั้นตอนภารกิจ", "Assignment flow", "任务流程")}</p>
        <h2 className="mt-1 text-2xl font-bold">{tr("จากการค้นหาจนจบงาน", "From discovery to completion", "从查找到完成")}</h2>
        <ol className="mt-5 grid gap-6 border-y border-(--khvi-teal)/20 py-7 md:grid-cols-3">{[
          tr("ค้นหางานที่ตรงความสามารถ", "Find a suitable request", "查找合适的求助"),
          tr("รับงานและรอผู้ขอยืนยันล่าม", "Claim and await requester confirmation", "接单并等待求助者确认"),
          tr("เริ่มงานและยืนยันจบทั้งสองฝ่าย", "Start work, then both confirm completion", "开始任务，完成后双方确认"),
        ].map((step, index) => <li key={step} className="flex gap-3 text-sm leading-7"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-(--khvi-teal)/15 font-bold">{index + 1}</span>{step}</li>)}</ol>
      </section>

      <section id="welcome-safety" className="mt-7 scroll-mt-28 rounded-(--khvi-radius-md) bg-(--khvi-sage)/10 p-6">
        <h2 className="font-bold">{tr("แบ่งปันเฉพาะข้อมูลที่จำเป็น", "Share only what is needed", "仅分享必要信息")}</h2>
        <p className={muted}>{tr("ตรวจสอบบุคคลและจุดนัดพบก่อนเดินทาง ข้อมูลติดต่อและพิกัดละเอียดเปิดตามขั้นตอนยืนยันล่าม บริการนี้ช่วยด้านภาษา ไม่ทดแทนหน่วยงานฉุกเฉิน", "Confirm who you are meeting and where. Contact details and exact locations follow interpreter confirmation. Language support does not replace emergency services.", "出发前确认见面对象和地点。确认口译员后才开放联系方式及详细位置。语言服务不能代替紧急救援。")}</p>
      </section>
    </main>;
  }

  return <main id="main-content" className="mx-auto max-w-[1320px] px-5 py-8 sm:px-8 lg:px-12 lg:py-10">
    <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
      <div>
        <p className="text-sm font-semibold text-(--khvi-teal)">{tr("ยินดีต้อนรับ", "Welcome", "欢迎")}</p>
        <h1 className="mt-1 break-words text-3xl font-bold">{displayName}</h1>
      </div>
      {interpreterAccount ? (
        <div className="w-full sm:w-auto">
          <p className="mb-2 text-xs font-bold text-(--khvi-ink)/65 sm:text-right">{tr("เลือกโหมดการใช้งาน", "Choose how to use KHVI", "选择使用模式")}</p>
          <div
            role="group"
            aria-label={tr("สลับระหว่างการช่วยเหลือและการขอความช่วยเหลือ", "Switch between helping and requesting help", "在提供帮助和请求帮助之间切换")}
            className="grid min-h-12 w-full grid-cols-2 rounded-full border border-(--khvi-teal)/30 bg-white p-1 shadow-sm sm:w-auto sm:min-w-[330px]"
          >
            {(["helper", "requester"] as const).map((mode) => {
              const selected = interpreterMode === mode;
              const label = mode === "helper"
                ? tr("เข้ามาช่วยเหลือ", "Help others", "提供帮助")
                : tr("เข้ามาขอความช่วยเหลือ", "Request help", "请求帮助");
              return (
                <button
                  key={mode}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => onInterpreterModeChange?.(mode)}
                  className={`min-h-10 rounded-full px-4 py-2 text-sm font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--khvi-sun) ${selected ? "bg-(--khvi-navy) text-white shadow-sm" : "text-(--khvi-ink)/70 hover:bg-(--khvi-paper)"}`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      ) : applicationReady ? (
        <Link
          href={volunteerApplication ? "/volunteer/status" : "/volunteer/apply"}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-(--khvi-radius-sm) border border-(--khvi-teal) bg-white px-4 py-2 text-sm font-bold text-(--khvi-teal) transition-colors hover:bg-(--khvi-paper) focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--khvi-sun)"
        >
          {volunteerApplication ? <ClockIcon className="h-5 w-5" aria-hidden="true" /> : <AcademicCapIcon className="h-5 w-5" aria-hidden="true" />}
          {volunteerApplication
            ? tr("ตรวจสอบสถานะสมัครล่าม", "Check interpreter application", "查看口译员申请")
            : tr("สมัครเป็นล่าม", "Apply as interpreter", "申请成为口译员")}
        </Link>
      ) : (
        <span className="h-11 w-36 animate-pulse rounded-(--khvi-radius-sm) bg-(--khvi-teal)/10" aria-hidden="true" />
      )}
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
        {interpreter ? <><p className={muted}>{tr("ใช้ตำแหน่งเพื่อกรองรายการด้านล่าง พิกัดของคุณจะไม่ถูกบันทึก", "Use your location to filter the list below. Your coordinates are not saved.", "使用位置筛选下方列表，您的坐标不会被保存。")}</p><button className={`${button} mt-4 w-full disabled:opacity-50`} onClick={locate} disabled={geo === "loading"}>{geo === "loading" ? tr("กำลังค้นหาตำแหน่ง…", "Locating…", "正在定位…") : tr("ใช้ตำแหน่งของฉัน", "Use my location", "使用我的位置")}</button><p role="status" className={muted}>{geo === "error" ? tr("เข้าถึงตำแหน่งไม่ได้ ลองใหม่หรือดูทุกระยะ", "Location unavailable. Retry or browse all distances.", "无法获取位置，请重试或查看所有距离。") : geo === "ready" ? tr("พร้อมใช้ตำแหน่งปัจจุบัน", "Current location connected", "已连接当前位置") : tr("ยังไม่ได้เปิดใช้ตำแหน่ง", "Location has not been shared", "尚未共享位置")}</p><label className="mt-4 block text-sm font-bold" htmlFor="welcome-radius">{tr("รัศมีค้นหา", "Search radius", "搜索半径")}</label><select id="welcome-radius" className="mt-2 min-h-12 w-full rounded-lg border border-(--khvi-teal)/30 bg-white px-3" value={radius} onChange={e => setRadius(e.target.value)}><option value="all">{tr("ทุกระยะ", "Any distance", "任何距离")}</option>{[5, 10, 25].map(n => <option key={n} value={n} disabled={!location}>{n} km</option>)}</select></> : <div className="mt-5 space-y-5"><div><h3 className="font-bold">{tr("ต้องการความช่วยเหลือด่วน", "Need help soon", "紧急求助")}</h3><p className={muted}>{tr("คำขอหมดอายุใน 30 นาที หากยังไม่มีล่ามรับงาน", "Requests expire after 30 minutes if no interpreter claims them.", "若30分钟内无人接单，请求将过期。")}</p></div><div className="border-t border-(--khvi-teal)/20 pt-5"><h3 className="font-bold">{tr("นัดหมายล่วงหน้า", "Plan a meeting", "预约帮助")}</h3><p className={muted}>{tr("เลือกเวลานัดได้ตั้งแต่วันถัดไป โดยไม่จำกัดวันสูงสุด", "Choose any time from the next calendar day onward.", "可选择从下一个日历日开始的任意时间。")}</p></div></div>}
      </aside>
    </div>
    {interpreter && <section className={`${panel} mt-7`} aria-labelledby="discover-title"><h2 id="discover-title" className="text-xl font-bold">{tr("ค้นหาคำขอที่เหมาะกับคุณ", "Explore suitable requests", "查找合适的请求")}</h2><p className={muted}>{tr("เลือกความถนัดเพื่อกรองคำขอในเครื่อง ยังไม่ใช่ผลจับคู่จากโปรไฟล์ล่าม", "Filter browser records by your skills. These are not verified profile matches.", "按技能筛选浏览器记录，尚非经过验证的个人资料匹配。")}</p><div className="mt-4 grid gap-4 sm:grid-cols-2"><label className="text-sm font-bold">{tr("ภาษา", "Language", "语言")}<select className="mt-2 min-h-12 w-full rounded-lg border border-(--khvi-teal)/30 bg-white px-3" value={language} onChange={e => setLanguage(e.target.value)}><option value="all">{tr("ทุกภาษา", "All languages", "全部语言")}</option>{LANGUAGES.map(l => <option key={l.id} value={l.id}>{locale === "th" ? thaiLanguages[l.id] : l[copyLocale]}</option>)}</select></label><label className="text-sm font-bold">{tr("หมวดหมู่", "Category", "类别")}<select className="mt-2 min-h-12 w-full rounded-lg border border-(--khvi-teal)/30 bg-white px-3" value={category} onChange={e => setCategory(e.target.value)}><option value="all">{tr("ทุกหมวดหมู่", "All categories", "全部类别")}</option>{CATEGORIES.map(c => <option key={c.id} value={c.id}>{locale === "th" ? thaiCategories[c.id] : c[copyLocale]}</option>)}</select></label></div>{open.length ? <ul className="mt-3 divide-y divide-(--khvi-teal)/20">{open.map(r => requestRow(r, true))}</ul> : <p role="status" className="my-6 rounded-lg bg-(--khvi-paper) p-5 text-sm leading-7">{tr("ยังไม่มีคำขอในเครื่องที่ตรงตัวกรอง ลองเปลี่ยนภาษา หมวดหมู่ หรือระยะค้นหา", "No browser records match these filters. Try another language, category or distance.", "没有符合筛选条件的浏览器记录，请调整语言、类别或距离。")}</p>}<Link className="inline-flex min-h-11 items-center gap-2 font-bold underline underline-offset-4" href="/find-requests#main-content">{tr("เปิดแผนที่ทั้งหมด", "Open the full map", "打开完整地图")}<ArrowRightIcon className="h-4 w-4" aria-hidden="true" /></Link></section>}
    <section className={`${panel} mt-7`}><div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-xl font-bold">{interpreter ? tr("ภารกิจที่ผ่านมาในเครื่องนี้", "Past assignments on this device", "此设备上的历史任务") : tr("คำขอล่าสุด", "Recent requests", "最近的请求")}</h2><Link className="inline-flex min-h-11 items-center font-bold underline underline-offset-4" href={listPath}>{tr("ดูทั้งหมด", "View all", "查看全部")}</Link></div>{recent.length ? <ul className="divide-y divide-(--khvi-teal)/20">{recent.map(r => requestRow(r))}</ul> : <div className="flex items-start gap-4 py-6"><ClipboardDocumentListIcon className="h-8 w-8 shrink-0 text-(--khvi-teal)" aria-hidden="true" /><p className="text-sm leading-7">{tr("ยังไม่มีประวัติในเบราว์เซอร์นี้ เมื่อมีรายการแล้วคุณจะกลับมาติดตามได้ที่นี่", "No history in this browser yet. Return here to follow saved requests.", "此浏览器暂无历史记录，保存后可在此查看。")}</p></div>}</section>
    <div className="mt-7 grid gap-5 md:grid-cols-2">
      {interpreter && <section id="volunteer-application" className={`${panel} scroll-mt-28`}><LanguageIcon className="h-7 w-7 text-(--khvi-teal)" aria-hidden="true" /><h2 className="mt-3 text-xl font-bold">{tr("โปรไฟล์ล่าม", "Interpreter profile", "口译员资料")}</h2><p className={muted}>{tr("ภาษา หมวดหมู่ และสถานะอนุมัติยังไม่มีข้อมูลเชื่อมกับบัญชีนี้ ตัวกรองด้านบนใช้สำรวจงานเท่านั้น", "Languages, categories and approval have not been connected to this account. The filters above are for exploring requests.", "语言、类别和审批状态尚未关联到账户。上方筛选仅用于浏览请求。")}</p><details className="mt-4 border-t border-(--khvi-teal)/20 pt-4"><summary className="min-h-11 cursor-pointer font-bold">{tr("ดูข้อมูลที่ต้องเตรียม", "What to prepare", "需要准备什么")}</summary><ul className="list-disc space-y-2 py-3 pl-5 text-sm leading-7"><li>{tr("ภาษาและหมวดหมู่ที่ช่วยเหลือได้", "Languages and categories you can help with", "可提供服务的语言和类别")}</li><li>{tr("ช่องทางติดต่อและประสบการณ์ที่เกี่ยวข้อง", "Contact channels and relevant experience", "联系方式和相关经验")}</li></ul></details></section>}
      <section className={`${panel} ${interpreter ? "" : "md:col-span-2"}`}><ShieldCheckIcon className="h-7 w-7 text-(--khvi-teal)" aria-hidden="true" /><h2 className="mt-3 text-xl font-bold">{interpreter ? tr("ดูแลความเป็นส่วนตัว", "Look after privacy", "保护隐私") : tr("รีวิวหลังจบภารกิจ", "Review after completion", "完成后评价")}</h2><p className={muted}>{interpreter ? tr("ก่อนผู้ขอยืนยันล่าม ให้ใช้เฉพาะพื้นที่กว้าง ๆ และข้อมูลที่จำเป็นต่อการตัดสินใจรับงาน", "Before requester confirmation, use only the broad area and information needed to assess the request.", "求助者确认前，仅使用大致区域和判断任务所需的信息。") : completed.length ? tr(`มีงานที่เสร็จแล้ว ${completed.length} รายการในเครื่องนี้ ระบบยังตรวจไม่ได้ว่างานใดรีวิวแล้ว`, `${completed.length} completed records on this device. Review status is not available yet.`, `此设备有${completed.length}条已完成记录，评价状态尚不可用。`) : tr("เมื่อทั้งสองฝ่ายยืนยันจบงาน คุณจึงให้คะแนนล่ามได้ ยังไม่มีงานที่เสร็จในเครื่องนี้", "Reviews follow confirmation from both people. There are no completed records on this device yet.", "双方确认完成后才能评价，此设备暂无已完成记录。")}</p>{!interpreter && <p className="mt-4 rounded-lg bg-(--khvi-paper) p-3 text-sm leading-6">{tr("ระบบส่งรีวิวยังไม่เปิดใช้งาน", "Review submission is not available yet.", "评价提交尚未开放。")}</p>}</section>
    </div>
    <section id="welcome-steps" className="mt-10 scroll-mt-28"><h2 className="text-2xl font-bold">{tr("จากคำขอจนจบภารกิจ", "From request to completion", "从请求到完成")}</h2><ol className="mt-5 grid gap-6 border-y border-(--khvi-teal)/20 py-7 md:grid-cols-3">{(interpreter ? [tr("ค้นหางานที่ตรงความสามารถ", "Find a suitable request", "查找合适的请求"), tr("รับงานและรอผู้ขอยืนยันล่าม", "Claim and await requester confirmation", "接单并等待求助者确认"), tr("เริ่มงานและยืนยันจบทั้งสองฝ่าย", "Start work, then both confirm completion", "开始任务，完成后双方确认")] : [tr("เลือกภาษา หมวดหมู่ และจุดนัดพบ", "Choose language, category and meeting point", "选择语言、类别和见面地点"), tr("เมื่อล่ามรับงาน ตรวจสอบและยืนยันล่าม", "Review and confirm the interpreter after claim", "接单后查看并确认口译员"), tr("ทั้งสองฝ่ายยืนยันจบ แล้วจึงรีวิว", "Both confirm completion, then review", "双方确认完成后评价")]).map((s, i) => <li key={s} className="flex gap-3 text-sm leading-7"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-(--khvi-teal)/15 font-bold">{i + 1}</span>{s}</li>)}</ol></section>
    <section id="welcome-safety" className="mt-7 scroll-mt-28 rounded-(--khvi-radius-md) bg-(--khvi-sage)/10 p-6"><h2 className="font-bold">{tr("แบ่งปันเฉพาะข้อมูลที่จำเป็น", "Share only what is needed", "仅分享必要信息")}</h2><p className={muted}>{tr("ตรวจสอบบุคคลและจุดนัดพบก่อนเดินทาง ข้อมูลติดต่อและพิกัดละเอียดเปิดตามขั้นตอนยืนยันล่าม บริการนี้ช่วยด้านภาษา ไม่ทดแทนหน่วยงานฉุกเฉิน", "Confirm who you are meeting and where. Contact details and exact locations follow interpreter confirmation. Language support does not replace emergency services.", "出发前确认见面对象和地点。确认口译员后才开放联系方式及详细位置。语言服务不能代替紧急救援。")}</p></section>
  </main>;
}
