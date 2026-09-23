"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  ArrowRightIcon,
  ClockIcon,
  LanguageIcon,
  MagnifyingGlassIcon,
  MapPinIcon,
} from "@heroicons/react/24/outline";
import { StatusBadge, UrgencyBadge } from "@/app/components/request-badges";
import type { UserProfile } from "@/app/lib/mock-auth";
import type { HelpRequest } from "@/app/lib/mock-requests";
import { referenceLabel, type ReferenceCatalog } from "@/app/lib/reference-catalog";
import type { InterpreterRating } from "@/app/lib/real-interpreter-rating";
import type { OpenRequestsDiagnostic } from "@/app/lib/real-request-data";
import type { InterpreterWorkspaceMode } from "@/app/lib/workspace-mode";
import { ApplicationStatusCard } from "@/components/volunteer/ApplicationStatusCard";
import { useWelcomeApplication } from "@/app/components/welcome/use-welcome-application";
import {
  button,
  ContactPanel,
  EmptyRecentRequests,
  getNextAction,
  muted,
  panel,
  RequestListRow,
  useWelcomeCopy,
  WelcomeAccountHeader,
  WelcomeHero,
} from "@/app/components/welcome/welcome-ui";

const RequestMap = dynamic(
  () => import("@/app/interpreter/find-requests/request-map").then((module) => module.RequestMap),
  { ssr: false },
);

function distance(request: HelpRequest, location: GeolocationCoordinates | null) {
  if (!location || request.latitude === null || request.longitude === null) return null;
  const rad = Math.PI / 180;
  const dLat = (request.latitude - location.latitude) * rad;
  const dLon = (request.longitude - location.longitude) * rad;
  const a = Math.sin(dLat / 2) ** 2
    + Math.cos(location.latitude * rad) * Math.cos(request.latitude * rad) * Math.sin(dLon / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(Math.min(1, a)));
}

export function InterpreterWelcome({
  user,
  interpreterMode,
  onInterpreterModeChange,
  openRequests,
  assignments,
  diagnostic,
  referenceCatalog,
  interpreterRating,
}: {
  user: UserProfile;
  interpreterMode: InterpreterWorkspaceMode;
  onInterpreterModeChange?: (mode: InterpreterWorkspaceMode) => void;
  openRequests: HelpRequest[];
  assignments: HelpRequest[];
  diagnostic?: OpenRequestsDiagnostic;
  referenceCatalog: ReferenceCatalog;
  interpreterRating: InterpreterRating | null;
}) {
  const { locale, copyLocale, tr } = useWelcomeCopy();
  const {
    activeApplication,
    applicationLoaded,
    applicationStatus,
    applicationVerified,
    interpreterAccess,
  } = useWelcomeApplication(user.userId);
  const [location, setLocation] = useState<GeolocationCoordinates | null>(null);
  const [geo, setGeo] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [language, setLanguage] = useState("all");
  const [category, setCategory] = useState("all");
  const locationWatchRef = useRef<number | null>(null);

  useEffect(() => () => {
    if (locationWatchRef.current !== null) {
      navigator.geolocation?.clearWatch(locationWatchRef.current);
    }
  }, []);

  const active = assignments.filter((request) => ["Claimed", "InProgress"].includes(request.status));
  const current = active[0];
  const recent = assignments
    .filter((request) => ["Completed", "Cancelled"].includes(request.status))
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
    .slice(0, 3);
  const open = openRequests
    .filter(
      (request) =>
        request.status === "Open"
        && (language === "all" || request.languageId === language)
        && (category === "all" || request.categoryId === category),
    )
    .slice(0, 3);
  const nearbyOpen = openRequests
    .filter((request) => request.status === "Open")
    .filter((request) => !location || (distance(request, location) !== null && distance(request, location)! <= 5))
    .slice(0, 12);
  const languageLabel = (request: HelpRequest) => referenceLabel(referenceCatalog.languages, request.languageId, locale);
  const categoryLabel = (request: HelpRequest) => referenceLabel(referenceCatalog.categories, request.categoryId, locale);
  const nextAction = getNextAction(current, tr);
  const showApplicationCard = applicationLoaded && applicationVerified && Boolean(activeApplication);

  function locate() {
    if (!navigator.geolocation) {
      setGeo("error");
      return;
    }
    if (locationWatchRef.current !== null) navigator.geolocation.clearWatch(locationWatchRef.current);
    setGeo("loading");
    locationWatchRef.current = navigator.geolocation.watchPosition(
      (position) => {
        setLocation(position.coords);
        setGeo("ready");
      },
      () => setGeo("error"),
      { timeout: 10000, maximumAge: 10000, enableHighAccuracy: false },
    );
  }

  return (
    <main id="main-content" className="mx-auto max-w-[1480px] px-5 py-8 sm:px-8 lg:px-8 lg:py-10">
      <WelcomeAccountHeader
        user={user}
        interpreterMode={interpreterMode}
        onInterpreterModeChange={onInterpreterModeChange}
        interpreterRating={interpreterRating}
        applicationStatus={applicationStatus}
        applicationVerified={interpreterAccess.verified}
        interpreterRevoked={interpreterAccess.revoked}
        tr={tr}
      />
      <div className="grid items-start gap-5 md:items-stretch md:grid-cols-[minmax(0,1fr)_minmax(260px,360px)]">
        <WelcomeHero variant="interpreter" tr={tr} />
        {current ? (
          <aside className={`${panel} order-1 h-fit self-start border-l-4 border-l-(--khvi-teal) md:order-2 md:h-full md:self-stretch`} aria-labelledby="active-assignment-title">
            <div className="flex flex-wrap justify-between gap-3">
              <h2 id="active-assignment-title" className="text-xl font-bold">{tr("งานที่กำลังดำเนินการ", "Current assignment", "进行中的任务")}</h2>
              <div className="flex flex-wrap gap-2"><UrgencyBadge urgency={current.urgency} copyLocale={locale === "th" ? "th" : copyLocale} /><StatusBadge status={current.status} copyLocale={locale === "th" ? "th" : copyLocale} /></div>
            </div>
            <dl className="mt-5 divide-y divide-(--khvi-teal)/15 border-y border-(--khvi-teal)/15 text-sm">
              <div className="grid gap-1 py-3">
                <dt className="font-bold text-(--khvi-ink)/60">{tr("ภาษาและหมวดหมู่", "Language and category", "语言和类别")}</dt>
                <dd className="font-semibold text-(--khvi-ink)">{languageLabel(current)} · {categoryLabel(current)}</dd>
              </div>
              <div className="grid gap-1 py-3">
                <dt className="font-bold text-(--khvi-ink)/60">{tr("พื้นที่นัดพบ", "Meeting area", "见面区域")}</dt>
                <dd className="text-(--khvi-ink)">{current.areaName}</dd>
              </div>
            </dl>
            <p className="my-4 rounded-lg bg-(--khvi-teal)/10 px-4 py-3 text-sm leading-6" role="status">{nextAction}</p>
            {current.requester && <div className="mb-4 flex items-center gap-3"><LanguageIcon className="h-6 w-6 shrink-0 text-(--khvi-teal)" aria-hidden="true" /><div><p className="text-xs font-bold text-(--khvi-ink)/60">{tr("ผู้ขอความช่วยเหลือ", "Requester", "求助者")}</p><p className="font-bold">{current.requester.name}</p></div></div>}
            <Link className={`${button} mt-6 w-full shrink-0`} href={`/user/my-requests/${current.requestId}#main-content`}>{tr("ดูรายละเอียดทั้งหมด", "View all details", "查看全部详情")}<ArrowRightIcon className="h-4 w-4 shrink-0" aria-hidden="true" /></Link>
            {active.length > 1 && <p className={muted}>{tr("คุณมีหลายงานที่กำลังดำเนินการ สามารถเปิดดูงานทั้งหมดได้", "You have multiple active assignments. Open your assignments to view them all.", "您有多个进行中的任务，请打开任务列表查看全部内容。")}</p>}
          </aside>
        ) : (
          <aside className={`${panel} order-1 flex min-h-0 h-fit flex-col self-start md:order-2 md:h-full md:self-stretch`} aria-labelledby="nearby-title">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div><h2 id="nearby-title" className="flex items-center gap-2 text-lg font-bold leading-7 sm:text-xl"><MapPinIcon className="h-5 w-5 shrink-0 text-(--khvi-teal)" aria-hidden="true" />{tr("คำขอใกล้เคียง", "Nearby requests", "附近求助")}</h2></div>
              <span className="rounded-full bg-(--khvi-teal)/10 px-3 py-1 text-xs font-bold text-(--khvi-teal)">5 km</span>
            </div>
            <button className={`${button} mt-3 min-h-10 w-full shrink-0 px-4 py-2 text-xs disabled:opacity-50`} onClick={locate} disabled={geo === "loading"}>{geo === "loading" ? tr("กำลังค้นหาตำแหน่ง…", "Locating…", "正在定位…") : geo === "error" ? tr("ลองใช้ตำแหน่งอีกครั้ง", "Try location again", "再次尝试定位") : tr("ใช้ตำแหน่งปัจจุบัน", "Use my current location", "使用当前位置")}</button>
            {geo === "error" && <p role="status" className="mt-2 text-xs leading-5 text-(--khvi-coral)">{tr("เข้าถึงตำแหน่งไม่ได้ ลองอีกครั้ง", "Location unavailable. Try again.", "无法获取位置，请重试。")}</p>}
            <div className="mx-auto mt-3 aspect-square w-[220px] max-w-full shrink-0 overflow-hidden rounded-full sm:w-[240px]">
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
            <Link className={`${button} mt-auto min-h-10 w-full shrink-0 px-4 py-2 text-xs`} href="/interpreter/find-requests#main-content">{tr("เปิดแผนที่เต็ม", "Open full map", "打开完整地图")}</Link>
          </aside>
        )}
      </div>
      <section className={`${panel} mt-7 flex flex-col`} aria-labelledby="discover-title">
        <h2 id="discover-title" className="flex items-center gap-2 text-xl font-bold"><MagnifyingGlassIcon className="h-6 w-6 shrink-0 text-(--khvi-teal)" aria-hidden="true" />{tr("ค้นหาคำขอที่เหมาะกับคุณ", "Explore suitable requests", "查找合适的请求")}</h2>
        <p className={muted}>{tr("ค้นหาและกรองคำขอที่ตรงกับความสามารถของคุณ", "Filter open requests that match your skills.", "按技能筛选符合您能力的求助任务。")}</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-bold">{tr("ภาษา", "Language", "语言")}<select className="mt-2 min-h-12 w-full rounded-lg border border-(--khvi-teal)/30 bg-white px-3" value={language} onChange={(event) => setLanguage(event.target.value)}><option value="all">{tr("ทุกภาษา", "All languages", "全部语言")}</option>{referenceCatalog.languages.map((option) => <option key={option.id} value={option.id}>{referenceLabel([option], option.id, locale)}</option>)}</select></label>
          <label className="text-sm font-bold">{tr("หมวดหมู่", "Category", "类别")}<select className="mt-2 min-h-12 w-full rounded-lg border border-(--khvi-teal)/30 bg-white px-3" value={category} onChange={(event) => setCategory(event.target.value)}><option value="all">{tr("ทุกหมวดหมู่", "All categories", "全部类别")}</option>{referenceCatalog.categories.map((option) => <option key={option.id} value={option.id}>{referenceLabel([option], option.id, locale)}</option>)}</select></label>
        </div>
        {open.length ? (
          <ul className="mt-3 divide-y divide-(--khvi-teal)/20">
            {open.map((request) => (
              <RequestListRow
                key={request.requestId}
                request={request}
                discovery
                languageLabel={languageLabel(request)}
                categoryLabel={categoryLabel(request)}
                locale={locale}
                copyLocale={copyLocale}
                tr={tr}
              />
            ))}
          </ul>
        ) : (
          <p role="status" className="my-6 rounded-lg bg-(--khvi-paper) p-5 text-sm leading-7">{diagnostic?.status === "application_not_approved" ? tr("ใบสมัครล่ามของคุณยังไม่ได้รับการอนุมัติ จึงยังไม่สามารถดูคำขอเปิดได้", "Your interpreter application is pending approval.", "您的口译员申请正在审核中，暂无法查看开放任务。") : diagnostic?.status === "no_matching_skills" ? tr("ยังไม่มีคำขอเปิดที่ตรงกับภาษาหรือหมวดหมู่ที่คุณได้รับอนุมัติ", "No open requests currently match your approved skills.", "当前暂无符合您获批技能的求助任务。") : tr("ยังไม่มีคำขอเปิดที่ตรงกับเงื่อนไขการค้นหา ลองเปลี่ยนภาษา หมวดหมู่ หรือระยะค้นหา", "No open requests match these filters. Try another language, category or distance.", "没有符合筛选条件的开放求助，请调整语言、类别或距离。")}</p>
        )}
        <Link className={`${button} mt-4 min-h-10 shrink-0 self-start px-4 py-2 text-xs`} href="/interpreter/find-requests#main-content">{tr("เปิดแผนที่", "Open the map", "打开地图")}</Link>
      </section>
      <section className={`${panel} mt-7 flex flex-col`}>
        <div className="flex min-w-0 flex-wrap items-center justify-between gap-3">
          <h2 className="flex min-w-0 items-center gap-2 text-xl font-bold"><ClockIcon className="h-6 w-6 shrink-0 text-(--khvi-teal)" aria-hidden="true" />{tr("งานที่ผ่านมาของคุณ", "Your past work", "您的历史工作")}</h2>
          <Link className={`${button} min-h-10 shrink-0 px-4 py-2 text-xs`} href="/interpreter/my-assignments#main-content">{tr("ดูทั้งหมด", "View all", "查看全部")}</Link>
        </div>
        {recent.length ? (
          <ul className="min-w-0 divide-y divide-(--khvi-teal)/20">
            {recent.map((request) => (
              <RequestListRow
                key={request.requestId}
                request={request}
                languageLabel={languageLabel(request)}
                categoryLabel={categoryLabel(request)}
                locale={locale}
                copyLocale={copyLocale}
                tr={tr}
              />
            ))}
          </ul>
        ) : <EmptyRecentRequests variant="interpreter" tr={tr} />}
      </section>
      <div className="mt-7 grid items-stretch gap-5 md:grid-cols-2">
        <section id="volunteer-application" className="h-full scroll-mt-28 [&>section]:h-full">{showApplicationCard ? <ApplicationStatusCard application={activeApplication} /> : null}</section>
        <ContactPanel tr={tr} />
      </div>
    </main>
  );
}
