"use client";

import {
  ArrowPathIcon,
  CalendarDaysIcon,
  CheckBadgeIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  FunnelIcon,
  LockClosedIcon,
  MapPinIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { useCopyLocale } from "@/app/components/app-shell";
import { type CategoryId, type LanguageId } from "@/app/lib/mock-requests";

const LeafletMap = dynamic(() => import("@/app/components/map/leaflet-map").then((module) => module.LeafletMap), {
  ssr: false,
  loading: () => <div className="flex min-h-[450px] items-center justify-center bg-[#e7efec] text-sm font-semibold text-[#52676f] lg:min-h-[680px]">Loading map…</div>,
});

type JobUrgency = "Immediate" | "Scheduled";

export type MapJob = {
  requestId: string;
  languageId: LanguageId;
  categoryId: CategoryId;
  areaName: string;
  distanceKm: number;
  urgency: JobUrgency;
  timeLabel: string;
  expiryLabel: string;
  latitude: number;
  longitude: number;
};

const MAP_JOBS: readonly MapJob[] = [
  {
    requestId: "1042",
    languageId: "burmese",
    categoryId: "medical",
    areaName: "Walailak University area",
    distanceKm: 1.2,
    urgency: "Immediate",
    timeLabel: "Help needed now",
    expiryLabel: "22 min left",
    latitude: 8.64,
    longitude: 99.9,
  },
  {
    requestId: "1047",
    languageId: "english",
    categoryId: "government",
    areaName: "Tha Sala community",
    distanceKm: 2.4,
    urgency: "Scheduled",
    timeLabel: "Today at 14:30",
    expiryLabel: "Appointment",
    latitude: 8.43,
    longitude: 99.96,
  },
  {
    requestId: "1048",
    languageId: "english",
    categoryId: "medical",
    areaName: "Tha Sala market area",
    distanceKm: 3.6,
    urgency: "Immediate",
    timeLabel: "Help needed now",
    expiryLabel: "18 min left",
    latitude: 8.44,
    longitude: 99.94,
  },
  {
    requestId: "1049",
    languageId: "burmese",
    categoryId: "government",
    areaName: "Moklan community",
    distanceKm: 4.8,
    urgency: "Scheduled",
    timeLabel: "Today at 16:00",
    expiryLabel: "Appointment",
    latitude: 8.67,
    longitude: 99.9,
  },
] as const;

const copy = {
  en: {
    eyebrow: "Interpreter workspace",
    title: "Find help requests near you",
    subtitle: "Browse open pins that match your approved languages and categories.",
    approved: "Approved interpreter",
    available: "Ready to help",
    filters: "Filter open requests",
    language: "Language",
    allLanguages: "All languages",
    burmese: "Burmese",
    english: "English",
    category: "Category",
    allCategories: "All categories",
    medical: "Medical",
    government: "Government office",
    distance: "Distance",
    urgency: "Urgency",
    allUrgency: "All request types",
    immediate: "Immediate",
    scheduled: "Scheduled",
    clear: "Clear filters",
    results: (count: number) => `${count} matching requests`,
    nearby: "Nearest first",
    roughLocation: "Approximate areas only until a request is claimed",
    myLocation: "Your approximate location",
    urgent: "Urgent",
    appointment: "Appointment",
    request: (id: string) => `Request #${id}`,
    matching: "Matches your approved skills",
    area: "Approximate area",
    fromYou: (distance: number) => `${distance.toFixed(1)} km from you`,
    needed: "Help needed",
    hiddenTitle: "Details unlock after claim",
    hiddenBody: "Exact meeting point, precise coordinates, and requester contact details stay hidden until the job is claimed.",
    continue: "Continue to claim",
    handoff: "The claim step checks availability and prevents duplicate claims.",
    noResults: "No open requests match these filters.",
    noResultsHint: "Try a wider distance or another request type.",
    close: "Close request details",
    reload: "Reset map view",
    resetDone: "Map filters reset",
    mockNotice: "Open requests are mock data · map tiles from OpenStreetMap",
    claimNotice: (id: string) => `Request #${id} is ready for the claim flow.`,
  },
  zh: {
    eyebrow: "口译员工作区",
    title: "查找附近的语言求助",
    subtitle: "查看与您已批准的语言和类别匹配的开放请求。",
    approved: "已批准的口译员",
    available: "准备接单",
    filters: "筛选开放请求",
    language: "语言",
    allLanguages: "所有语言",
    burmese: "缅甸语",
    english: "英语",
    category: "类别",
    allCategories: "所有类别",
    medical: "医疗",
    government: "政府机构",
    distance: "距离",
    urgency: "紧急程度",
    allUrgency: "所有请求类型",
    immediate: "紧急",
    scheduled: "预约",
    clear: "清除筛选",
    results: (count: number) => `${count} 个匹配请求`,
    nearby: "按距离排序",
    roughLocation: "接取请求前只显示大致区域",
    myLocation: "您的大致位置",
    urgent: "紧急",
    appointment: "预约",
    request: (id: string) => `请求 #${id}`,
    matching: "符合您已批准的技能",
    area: "大致区域",
    fromYou: (distance: number) => `距您 ${distance.toFixed(1)} 公里`,
    needed: "需要帮助",
    hiddenTitle: "接取后解锁详情",
    hiddenBody: "准确碰面地点、精确坐标和求助者联系方式会在接取任务后显示。",
    continue: "继续接取",
    handoff: "接取步骤会检查可用状态并防止重复接取。",
    noResults: "没有符合筛选条件的开放请求。",
    noResultsHint: "尝试扩大距离或选择其他请求类型。",
    close: "关闭请求详情",
    reload: "重置地图视图",
    resetDone: "地图筛选已重置",
    mockNotice: "开放请求为模拟数据 · 地图来自 OpenStreetMap",
    claimNotice: (id: string) => `请求 #${id} 已准备进入接取流程。`,
  },
} as const;

export type MapCopy = {
  [Key in keyof typeof copy.en]: (typeof copy.en)[Key] extends (...args: infer Arguments) => infer Result
    ? (...args: Arguments) => Result
    : string;
};

function getLanguageLabel(languageId: LanguageId, labels: MapCopy): string {
  return languageId === "burmese" ? labels.burmese : labels.english;
}

function getCategoryLabel(categoryId: CategoryId, labels: MapCopy): string {
  return categoryId === "medical" ? labels.medical : labels.government;
}

function StatusBadge({ job, labels }: { job: MapJob; labels: MapCopy }) {
  const urgent = job.urgency === "Immediate";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-extrabold ${
        urgent ? "bg-[#f04f3e]/10 text-[#a02c20]" : "bg-[#f0a35f]/20 text-[#81551f]"
      }`}
    >
      {urgent ? <ExclamationTriangleIcon aria-hidden="true" className="h-3.5 w-3.5" /> : <CalendarDaysIcon aria-hidden="true" className="h-3.5 w-3.5" />}
      {urgent ? labels.urgent : labels.appointment}
    </span>
  );
}

export function MapView() {
  const copyLocale = useCopyLocale();
  const labels = copy[copyLocale];
  const [language, setLanguage] = useState<"all" | LanguageId>("all");
  const [category, setCategory] = useState<"all" | CategoryId>("all");
  const [distance, setDistance] = useState("5");
  const [urgency, setUrgency] = useState<"all" | "Immediate" | "Scheduled">("all");
  const [selectedId, setSelectedId] = useState<string | null>("1042");
  const [claimNotice, setClaimNotice] = useState<string | null>(null);

  const visibleJobs = useMemo(
    () =>
      MAP_JOBS.filter(
        (job) =>
          (language === "all" || job.languageId === language) &&
          (category === "all" || job.categoryId === category) &&
          job.distanceKm <= Number(distance) &&
          (urgency === "all" || job.urgency === urgency),
      ),
    [category, distance, language, urgency],
  );

  const selectedJob = visibleJobs.find((job) => job.requestId === selectedId) ?? visibleJobs[0] ?? null;

  function resetFilters() {
    setLanguage("all");
    setCategory("all");
    setDistance("5");
    setUrgency("all");
    setSelectedId("1042");
    setClaimNotice(labels.resetDone);
  }

  return (
    <main id="main-content" className="min-h-screen bg-[#f7f9fa] text-[#10283a]">
      <section className="mx-auto max-w-[1440px] px-5 pb-6 pt-8 sm:px-8 lg:px-12 lg:pt-10">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-extrabold text-[#087f80]">{labels.eyebrow}</p>
            <h1 className="mt-2 text-3xl font-extrabold tracking-normal text-[#153447] sm:text-4xl">{labels.title}</h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-[#64777e]">{labels.subtitle}</p>
          </div>
          <div className="inline-flex items-center gap-2 self-start rounded-lg border border-[#b9d9d6] bg-[#edf7f5] px-3 py-2 text-xs font-extrabold text-[#25625e] md:self-auto">
            <CheckBadgeIcon aria-hidden="true" className="h-5 w-5" />
            <span>{labels.approved}<br /><span className="font-semibold text-[#4b7773]">{labels.available}</span></span>
          </div>
        </div>

        <section className="mt-7 border border-[#d6e0e4] bg-white p-4 shadow-[0_8px_22px_rgba(20,55,72,0.05)]" aria-labelledby="map-filters-title">
          <div className="mb-3 flex items-center gap-2 text-sm font-extrabold text-[#294554]" id="map-filters-title"><FunnelIcon aria-hidden="true" className="h-4 w-4 text-[#087f80]" />{labels.filters}</div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <label className="text-xs font-extrabold text-[#52676f]">{labels.language}<select className="mt-1.5 h-11 w-full rounded-lg border border-[#cbd7dc] bg-white px-3 text-sm font-semibold text-[#173646]" value={language} onChange={(event) => { setLanguage(event.target.value as "all" | LanguageId); setClaimNotice(null); }}><option value="all">{labels.allLanguages}</option><option value="burmese">{labels.burmese}</option><option value="english">{labels.english}</option></select></label>
            <label className="text-xs font-extrabold text-[#52676f]">{labels.category}<select className="mt-1.5 h-11 w-full rounded-lg border border-[#cbd7dc] bg-white px-3 text-sm font-semibold text-[#173646]" value={category} onChange={(event) => { setCategory(event.target.value as "all" | CategoryId); setClaimNotice(null); }}><option value="all">{labels.allCategories}</option><option value="medical">{labels.medical}</option><option value="government">{labels.government}</option></select></label>
            <label className="text-xs font-extrabold text-[#52676f]">{labels.distance}<select className="mt-1.5 h-11 w-full rounded-lg border border-[#cbd7dc] bg-white px-3 text-sm font-semibold text-[#173646]" value={distance} onChange={(event) => { setDistance(event.target.value); setClaimNotice(null); }}><option value="3">Within 3 km</option><option value="5">Within 5 km</option><option value="10">Within 10 km</option></select></label>
            <label className="text-xs font-extrabold text-[#52676f]">{labels.urgency}<select className="mt-1.5 h-11 w-full rounded-lg border border-[#cbd7dc] bg-white px-3 text-sm font-semibold text-[#173646]" value={urgency} onChange={(event) => { setUrgency(event.target.value as "all" | "Immediate" | "Scheduled"); setClaimNotice(null); }}><option value="all">{labels.allUrgency}</option><option value="Immediate">{labels.immediate}</option><option value="Scheduled">{labels.scheduled}</option></select></label>
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3"><button type="button" className="inline-flex min-h-10 items-center gap-2 rounded-lg px-2 text-xs font-extrabold text-[#52676f] underline decoration-[#b2c1c5] underline-offset-4 transition-colors hover:text-[#087f80]" onClick={resetFilters}><ArrowPathIcon aria-hidden="true" className="h-4 w-4" />{labels.clear}</button>{claimNotice && <p className="text-xs font-semibold text-[#087f80]" aria-live="polite">{claimNotice}</p>}</div>
        </section>

        <div className="mt-5 grid overflow-hidden border border-[#d6e0e4] bg-white lg:grid-cols-[minmax(220px,0.64fr)_minmax(500px,1.9fr)_minmax(275px,0.86fr)] xl:grid-cols-[minmax(240px,0.62fr)_minmax(560px,2.05fr)_minmax(280px,0.83fr)]">
          <section className="order-2 border-t border-[#d6e0e4] lg:order-1 lg:border-r lg:border-t-0" aria-label="Open request list">
            <div className="flex items-center justify-between gap-3 border-b border-[#d6e0e4] px-4 py-4"><span className="text-sm font-extrabold text-[#294554]">{labels.results(visibleJobs.length)}</span><span className="text-[11px] text-[#73848a]">{labels.nearby}</span></div>
            {visibleJobs.length ? visibleJobs.map((job) => {
              const selected = selectedJob?.requestId === job.requestId;
              return <button key={job.requestId} type="button" aria-pressed={selected} className={`block w-full border-b border-[#e3ebef] border-l-4 px-4 py-4 text-left transition-colors hover:bg-[#f7f9fa] ${selected ? "border-l-[#4d8a93] bg-[#edf7f5]" : "border-l-transparent"}`} onClick={() => { setSelectedId(job.requestId); setClaimNotice(null); }}><div className="flex items-center justify-between gap-2"><StatusBadge job={job} labels={labels} /><span className="text-[11px] text-[#73848a]">≈ {job.distanceKm.toFixed(1)} km</span></div><p className="mt-2 text-sm font-extrabold text-[#203d4d]">{getLanguageLabel(job.languageId, labels)} · {getCategoryLabel(job.categoryId, labels)}</p><p className="mt-1 text-xs text-[#64777e]">{job.areaName}</p><p className="mt-2 text-xs font-bold text-[#087f80]">{job.expiryLabel}</p></button>;
            }) : <div className="px-4 py-7 text-sm text-[#64777e]"><p className="font-extrabold text-[#294554]">{labels.noResults}</p><p className="mt-1 text-xs leading-5">{labels.noResultsHint}</p></div>}
          </section>

          <LeafletMap jobs={visibleJobs} selectedId={selectedJob?.requestId ?? null} labels={labels} onSelect={(id) => { setSelectedId(id); setClaimNotice(null); }} />

          <aside className="order-3 border-t border-[#d6e0e4] p-5 lg:order-3 lg:border-l lg:border-t-0" aria-label="Request details">
            {selectedJob ? <><div className="flex items-center justify-between gap-3"><StatusBadge job={selectedJob} labels={labels} /><button type="button" className="flex h-10 w-10 items-center justify-center rounded-lg border border-transparent text-[#52676f] transition-colors hover:border-[#cbd7dc] hover:bg-[#f7f9fa]" aria-label={labels.close} onClick={() => { setSelectedId(null); setClaimNotice(null); }}><XMarkIcon aria-hidden="true" className="h-5 w-5" /></button></div><h2 className="mt-5 text-xl font-extrabold leading-8 text-[#173646]">{labels.needed} {getLanguageLabel(selectedJob.languageId, labels)}<br />{getCategoryLabel(selectedJob.categoryId, labels)}</h2><p className="mt-1 text-xs text-[#73848a]">{labels.request(selectedJob.requestId)}</p><p className="mt-4 flex items-center gap-2 text-xs font-bold text-[#3f6655]"><CheckCircleIcon aria-hidden="true" className="h-4 w-4" />{labels.matching}</p><dl className="mt-5"><div className="border-t border-[#e3ebef] py-3"><dt className="text-[11px] text-[#73848a]">{labels.area}</dt><dd className="mt-1 text-sm font-bold text-[#294554]">{selectedJob.areaName}</dd></div><div className="border-t border-[#e3ebef] py-3"><dt className="text-[11px] text-[#73848a]">{labels.distance}</dt><dd className="mt-1 text-sm font-bold text-[#294554]">{labels.fromYou(selectedJob.distanceKm)}</dd></div><div className="border-t border-[#e3ebef] py-3"><dt className="text-[11px] text-[#73848a]">{labels.needed}</dt><dd className="mt-1 flex items-center gap-2 text-sm font-bold text-[#294554]"><ClockIcon aria-hidden="true" className="h-4 w-4 text-[#b5680b]" />{selectedJob.timeLabel}</dd></div></dl><div className="mt-4 rounded-lg bg-[#f7f9fa] p-4"><p className="flex items-center gap-2 text-xs font-extrabold text-[#294554]"><LockClosedIcon aria-hidden="true" className="h-4 w-4 text-[#087f80]" />{labels.hiddenTitle}</p><p className="mt-2 text-xs leading-5 text-[#64777e]">{labels.hiddenBody}</p></div><div className="mt-5 lg:mt-8"><button type="button" className="flex min-h-12 w-full items-center justify-center rounded-lg bg-[#092f45] px-4 py-3 text-sm font-extrabold text-white shadow-[0_8px_18px_rgba(9,47,69,0.18)] transition-colors hover:bg-[#0c4960]" onClick={() => setClaimNotice(labels.claimNotice(selectedJob.requestId))}>{labels.continue}</button><p className="mt-2 text-center text-[11px] leading-5 text-[#73848a]">{labels.handoff}</p></div></> : <div className="flex min-h-[280px] flex-col items-center justify-center text-center text-sm text-[#64777e]"><MapPinIcon aria-hidden="true" className="h-8 w-8 text-[#4d8a93]" /><p className="mt-3 font-bold text-[#294554]">{labels.noResults}</p></div>}
          </aside>
        </div>
        <p className="mt-3 flex items-center gap-2 text-[11px] text-[#73848a]"><MapPinIcon aria-hidden="true" className="h-3.5 w-3.5" />{labels.mockNotice}</p>
      </section>
    </main>
  );
}
