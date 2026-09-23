"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";
import {
  AdjustmentsHorizontalIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  ClipboardDocumentListIcon,
  ClockIcon,
  InformationCircleIcon,
  MapPinIcon,
  ShieldCheckIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useCopyLocale } from "@/app/components/app-shell";
import { ActiveTaskDialog } from "@/app/components/active-task-dialog";
import { ExpiryCountdown } from "@/app/components/expiry-countdown";
import { StatusBadge, UrgencyBadge } from "@/app/components/request-badges";
import { WorkspaceBreadcrumbs } from "@/app/components/workspace-breadcrumbs";
import { claimBookingAction } from "@/app/actions/booking-actions";
import { INTERPRETER_MATCHING_RADIUS_KM } from "@/app/lib/matching-settings";
import type { OpenRequestsDiagnostic } from "@/app/lib/real-request-data";
import {
  CATEGORIES,
  categoryLabel,
  LANGUAGES,
  languageLabel,
  type HelpRequest,
  type Urgency,
} from "@/app/lib/mock-requests";

const RequestMap = dynamic(
  () => import("./request-map").then((module) => module.RequestMap),
  { ssr: false },
);

const REQUEST_FILTERS = [
  { id: "all", urgency: null },
  { id: "urgent", urgency: "Immediate" },
  { id: "scheduled", urgency: "Scheduled" },
] as const satisfies readonly { id: string; urgency: Urgency | null }[];

const DISTANCE_FILTERS = [
  { id: "all", value: null },
  { id: "5", value: 5 },
  { id: "10", value: 10 },
  { id: String(INTERPRETER_MATCHING_RADIUS_KM), value: INTERPRETER_MATCHING_RADIUS_KM },
] as const;

type RequestFilterId = (typeof REQUEST_FILTERS)[number]["id"];
type DistanceFilterId = (typeof DISTANCE_FILTERS)[number]["id"];
type SortOption = "newest" | "nearest";
type GeoStatus = "idle" | "loading" | "ready" | "error";
type Coordinates = { latitude: number; longitude: number };

const copy = {
  en: {
    breadcrumb: "Breadcrumb",
    main: "Main",
    label: "Interpreter workspace",
    title: "Find requests",
    intro: "Scan nearby requests, check the broad area and claim the one you can help with.",
    assignments: "My assignments",
    filtersLabel: "Filter available requests",
    language: "Language",
    category: "Category",
    distance: "Distance",
    allLanguages: "All languages",
    allCategories: "All categories",
    anyDistance: "Any distance",
    sortBy: "Sort by",
    newestFirst: "Newest first",
    nearestFirst: "Nearest first",
    connectGpsForSort: "Connect GPS to sort by nearest first",
    connectGps: "Use my location",
    locatingGps: "Finding you…",
    gpsReady: "GPS connected",
    gpsError: "Location unavailable",
    gpsIdle: "Connect GPS to use distance filters",
    filters: { all: "All", urgent: "Urgent", scheduled: "Scheduled" },
    mapLabel: "Open request map",
    mapHint: "Pins show broad areas only. Select a pin to review the request.",
    mapLegend: "Request map",
    urgentLegend: "Immediate",
    scheduledLegend: "Scheduled",
    myLocation: "Your location",
    openRequests: "Open requests",
    requestCount: (count: number) => `${count} available ${count === 1 ? "request" : "requests"}`,
    area: "Area",
    created: "Created",
    scheduled: "Appointment",
    viewDetails: "View details",
    claim: "Claim request",
    claimError: "This request could not be claimed. Refresh the list and try again.",
    claimTitle: "Review before you claim",
    claimBody: "Confirm that this request matches your language and category before claiming it.",
    description: "What help is needed",
    privacy: "Exact address, coordinates and contact details stay hidden until the requester confirms you.",
    close: "Close",
    cancel: "Keep browsing",
    confirmClaim: "Confirm claim",
    claimedTitle: "Request claimed successfully",
    claimedBody: "You have claimed this request. Head to your assignments to coordinate with the requester.",
    goAssignments: "Open my assignments",
    refresh: "Refresh",
    refreshing: "Refreshing…",
    diagnosticNotApprovedTitle: "Interpreter application pending approval",
    diagnosticNotApprovedBody: (status: string | null) =>
      `Your volunteer interpreter application status is "${status || "pending"}". Requests become visible once approved by a manager.`,
    checkApplicationStatus: "Check application status →",
    diagnosticNoMatchingSkillsTitle: "No open requests match your skills",
    diagnosticNoMatchingSkillsBody: (openCount: number, langCount: number, catCount: number) =>
      `There are currently no open requests matching your approved skills (${langCount} languages, ${catCount} categories). You will see requests as soon as matching ones are created.`,
    diagnosticDbErrorTitle: "Unable to load requests",
    noMatching: "No requests match these filters",
    noMatchingBody: "Try a wider distance or clear one of the filters.",
    loading: "Loading the request map…",
    locationUnavailable: "Location not available",
    distanceUnavailable: "Connect GPS for distance",
    distanceAway: "away",
    broadAreaOnly: "Broad area shown before claim",
    workspaceBlockedTitle: "Finish your current task first",
    workspaceBlockedBody: "You cannot claim another request while you have an active help request or assignment.",
  },
  zh: {
    breadcrumb: "面包屑导航",
    main: "主页",
    label: "口译员工作区",
    title: "查找求助",
    intro: "查看附近求助，确认大致区域，然后接取你可以帮助的任务。",
    assignments: "我的任务",
    filtersLabel: "筛选可接任务",
    language: "语言",
    category: "类别",
    distance: "距离",
    allLanguages: "全部语言",
    allCategories: "全部类别",
    anyDistance: "不限距离",
    sortBy: "排序方式",
    newestFirst: "最新求助优先",
    nearestFirst: "最近求助优先",
    connectGpsForSort: "连接 GPS 后可按距离排序",
    connectGps: "使用我的位置",
    locatingGps: "正在定位…",
    gpsReady: "GPS 已连接",
    gpsError: "无法获取位置",
    gpsIdle: "连接 GPS 后可使用距离筛选",
    filters: { all: "全部", urgent: "紧急", scheduled: "预约" },
    mapLabel: "开放求助地图",
    mapHint: "地图只显示大致区域。选择一个标记查看求助详情。",
    workspaceBlockedTitle: "请先完成当前任务",
    workspaceBlockedBody: "当你有进行中的求助或口译任务时，暂时不能接取新的任务。",
    mapLegend: "求助地图",
    urgentLegend: "紧急",
    scheduledLegend: "预约",
    myLocation: "你的位置",
    openRequests: "开放求助",
    requestCount: (count: number) => `${count} 个可接任务`,
    area: "区域",
    created: "创建时间",
    scheduled: "预约时间",
    viewDetails: "查看详情",
    claim: "接取任务",
    claimError: "无法接取此任务。请刷新列表后重试。",
    claimTitle: "接取前请确认",
    claimBody: "接取前请确认语言和类别符合你的服务能力。",
    description: "求助内容",
    privacy: "求助者确认你之后，系统才会显示准确地址、坐标和联系方式。",
    close: "关闭",
    cancel: "继续浏览",
    confirmClaim: "确认接取",
    claimedTitle: "任务接取成功",
    claimedBody: "你已接取此任务。可前往我的任务列表查看详情与确认步骤。",
    goAssignments: "打开我的任务",
    refresh: "刷新",
    refreshing: "正在刷新…",
    diagnosticNotApprovedTitle: "口译员申请正在审核中",
    diagnosticNotApprovedBody: (status: string | null) =>
      `您的志愿者口译员申请状态为 "${status || "待审核"}"。经管理员批准后即可查看求助任务。`,
    checkApplicationStatus: "查看申请状态 →",
    diagnosticNoMatchingSkillsTitle: "暂无符合技能的求助任务",
    diagnosticNoMatchingSkillsBody: (openCount: number, langCount: number, catCount: number) =>
      `目前暂无与您获批技能（${langCount} 种语言，${catCount} 个类别）匹配的开放求助。有匹配任务时将在此处显示。`,
    diagnosticDbErrorTitle: "无法加载求助任务",
    noMatching: "没有符合筛选条件的求助",
    noMatchingBody: "可以扩大距离范围或清除筛选条件。",
    loading: "正在加载求助地图…",
    locationUnavailable: "位置不可用",
    distanceUnavailable: "连接 GPS 后显示距离",
    distanceAway: "公里",
    broadAreaOnly: "接取前只显示大致区域",
  },
} as const;

function distanceInKm(from: Coordinates, to: Coordinates): number {
  const earthRadiusKm = 6371;
  const latitudeDelta = ((to.latitude - from.latitude) * Math.PI) / 180;
  const longitudeDelta = ((to.longitude - from.longitude) * Math.PI) / 180;
  const latitudeFrom = (from.latitude * Math.PI) / 180;
  const latitudeTo = (to.latitude * Math.PI) / 180;
  const haversine =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.sin(longitudeDelta / 2) ** 2 * Math.cos(latitudeFrom) * Math.cos(latitudeTo);

  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
}

function requestCoordinates(request: HelpRequest): Coordinates | null {
  if (request.latitude === null || request.longitude === null) return null;
  return { latitude: request.latitude, longitude: request.longitude };
}

function requestCreatedTimestamp(request: HelpRequest): number {
  const timestamp = Date.parse(request.createdAt || request.createdAtLabel);
  return Number.isFinite(timestamp) ? timestamp : 0;
}

function compareRequestIds(first: HelpRequest, second: HelpRequest): number {
  return Number(second.requestId) - Number(first.requestId);
}

export function FindRequestsList({
  initialRequests,
  diagnostic,
  workspaceBlocked = false,
}: {
  initialRequests: HelpRequest[];
  diagnostic?: OpenRequestsDiagnostic;
  workspaceBlocked?: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [activeFilter, setActiveFilter] = useState<RequestFilterId>("all");
  const [languageFilter, setLanguageFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [distanceFilter, setDistanceFilter] = useState<DistanceFilterId>("all");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [selectedRequest, setSelectedRequest] = useState<HelpRequest | null>(null);
  const [claimRequest, setClaimRequest] = useState<HelpRequest | null>(null);
  const [claimedRequestId, setClaimedRequestId] = useState<string | null>(null);
  const [claimingId, setClaimingId] = useState<string | null>(null);
  const [claimError, setClaimError] = useState<string | null>(null);
  const [activeTaskDialogOpen, setActiveTaskDialogOpen] = useState(false);
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null);
  const [geoStatus, setGeoStatus] = useState<GeoStatus>("idle");
  const ready = true;
  const copyLocale = useCopyLocale();
  const t = copy[copyLocale];

  useEffect(() => {
    if (!claimRequest) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setClaimRequest(null);
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [claimRequest]);

  const sourceRequests = initialRequests;
  const openRequests = useMemo(
    () => sourceRequests.filter((request) => request.status === "Open" && request.requestId !== claimedRequestId),
    [claimedRequestId, sourceRequests],
  );

  const requests = useMemo(() => {
    const selectedUrgency = REQUEST_FILTERS.find((filter) => filter.id === activeFilter)?.urgency ?? null;
    const selectedDistance = DISTANCE_FILTERS.find((filter) => filter.id === distanceFilter)?.value ?? null;

    return openRequests.filter((request) => {
      const matchesUrgency = selectedUrgency === null || request.urgency === selectedUrgency;
      const matchesLanguage = languageFilter === "all" || request.languageId === languageFilter;
      const matchesCategory = categoryFilter === "all" || request.categoryId === categoryFilter;
      const coordinates = requestCoordinates(request);
      const matchesDistance =
        selectedDistance === null ||
        userLocation === null ||
        coordinates === null ||
        distanceInKm(userLocation, coordinates) <= selectedDistance;

      return matchesUrgency && matchesLanguage && matchesCategory && matchesDistance;
    });
  }, [activeFilter, categoryFilter, distanceFilter, languageFilter, openRequests, userLocation]);

  const sortedRequests = useMemo(() => {
    const next = [...requests];

    next.sort((first, second) => {
      if (sortBy === "nearest" && userLocation) {
        const firstCoordinates = requestCoordinates(first);
        const secondCoordinates = requestCoordinates(second);
        const firstDistance = firstCoordinates ? distanceInKm(userLocation, firstCoordinates) : Number.POSITIVE_INFINITY;
        const secondDistance = secondCoordinates ? distanceInKm(userLocation, secondCoordinates) : Number.POSITIVE_INFINITY;
        const distanceDifference = firstDistance - secondDistance;
        if (distanceDifference !== 0) return distanceDifference;
      }

      const createdDifference = requestCreatedTimestamp(second) - requestCreatedTimestamp(first);
      return createdDifference !== 0 ? createdDifference : compareRequestIds(first, second);
    });

    return next;
  }, [requests, sortBy, userLocation]);

  const counts = Object.fromEntries(
    REQUEST_FILTERS.map((filter) => {
      const urgency = filter.urgency;
      return [filter.id, openRequests.filter((request) => urgency === null || request.urgency === urgency).length];
    }),
  );

  const findMyLocation = () => {
    if (!navigator.geolocation) {
      setGeoStatus("error");
      return;
    }

    setGeoStatus("loading");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({ latitude: position.coords.latitude, longitude: position.coords.longitude });
        setGeoStatus("ready");
      },
      () => setGeoStatus("error"),
      { enableHighAccuracy: false, maximumAge: 300000, timeout: 10000 },
    );
  };

  const openClaimDialog = (request: HelpRequest) => {
    if (workspaceBlocked) {
      setActiveTaskDialogOpen(true);
      return;
    }
    setSelectedRequest(request);
    setClaimError(null);
    setClaimRequest(request);
  };

  const confirmClaim = async () => {
    if (!claimRequest) return;

    if (workspaceBlocked) {
      setClaimRequest(null);
      setActiveTaskDialogOpen(true);
      return;
    }

    const requestId = claimRequest.requestId;
    setClaimingId(requestId);
    setClaimError(null);

    const result = await claimBookingAction(requestId);

    if (result.ok) {
      setClaimedRequestId(requestId);
      setClaimRequest(null);
      setSelectedRequest(null);
      router.push(`/interpreter/my-assignments/${requestId}`);
    } else {
      if (
        result.code === "active_workspace_task_exists" ||
        result.code === "active_assignment_exists"
      ) {
        setClaimRequest(null);
        setActiveTaskDialogOpen(true);
      }

      setClaimError(result.error || t.claimError);
      setClaimingId(null);
    }
  };

  const handleRefresh = () => {
    startTransition(() => {
      router.refresh();
    });
  };

  return (
    <main id="main-content" className="flex-1 px-5 py-8 sm:px-8 lg:px-12 lg:py-10">
      <div className="mx-auto max-w-[1180px]">
        <WorkspaceBreadcrumbs
          ariaLabel={t.breadcrumb}
          currentLabel={t.title}
          homeHref="/interpreter"
          homeLabel={t.main}
        />

        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-extrabold text-[#087f80]">{t.label}</p>
            <h1 className="mt-1.5 text-3xl font-extrabold tracking-normal text-[#122b3e] sm:text-4xl">{t.title}</h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-[#64777e]">{t.intro}</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleRefresh}
              disabled={isPending}
              className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-lg border border-[#cbd7dc] bg-white px-4 text-sm font-extrabold text-[#122b3e] transition-colors hover:bg-[#f6f9fa] disabled:opacity-60"
            >
              <ArrowPathIcon aria-hidden="true" className={`h-5 w-5 ${isPending ? "animate-spin text-(--khvi-teal)" : "text-[#64777e]"}`} />
              {isPending ? t.refreshing : t.refresh}
            </button>
            <Link
              className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-lg bg-(--khvi-navy) px-5 text-sm font-extrabold text-white transition-colors hover:bg-[#0c4960]"
              href="/interpreter/my-assignments#main-content"
            >
              <ClipboardDocumentListIcon aria-hidden="true" className="h-5 w-5" />
              {t.assignments}
            </Link>
          </div>
        </div>

        {workspaceBlocked && (
          <aside className="mt-6 flex items-start gap-3.5 rounded-(--khvi-radius-md) border border-amber-300 bg-amber-50 p-4 text-amber-900" role="status">
            <InformationCircleIcon aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
            <div>
              <h2 className="text-sm font-extrabold text-amber-950">{t.workspaceBlockedTitle}</h2>
              <p className="mt-1 text-xs leading-5 text-amber-800">{t.workspaceBlockedBody}</p>
            </div>
          </aside>
        )}

        {diagnostic && diagnostic.status === "application_not_approved" && (
          <aside aria-label="application-status-notice" className="mt-6 flex items-start gap-3.5 rounded-(--khvi-radius-md) border border-amber-300 bg-amber-50 p-4 text-amber-900 shadow-sm">
            <InformationCircleIcon aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
            <div>
              <h3 className="text-sm font-extrabold text-amber-950">{t.diagnosticNotApprovedTitle}</h3>
              <p className="mt-1 text-xs leading-5 text-amber-800">{t.diagnosticNotApprovedBody(diagnostic.applicationStatus)}</p>
              <Link href="/user/volunteer/status" className="mt-2 inline-flex items-center text-xs font-extrabold text-amber-950 underline hover:no-underline">
                {t.checkApplicationStatus}
              </Link>
            </div>
          </aside>
        )}

        {diagnostic && diagnostic.status === "no_matching_skills" && (
          <aside aria-label="matching-skills-notice" className="mt-6 flex items-start gap-3.5 rounded-(--khvi-radius-md) border border-blue-200 bg-blue-50 p-4 text-blue-900 shadow-sm">
            <InformationCircleIcon aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
            <div>
              <h3 className="text-sm font-extrabold text-blue-950">{t.diagnosticNoMatchingSkillsTitle}</h3>
              <p className="mt-1 text-xs leading-5 text-blue-800">
                {t.diagnosticNoMatchingSkillsBody(diagnostic.openRequestsCount, diagnostic.approvedLanguageCount, diagnostic.approvedCategoryCount)}
              </p>
            </div>
          </aside>
        )}

        {diagnostic && diagnostic.status === "db_error" && (
          <aside aria-label="db-error-notice" className="mt-6 flex items-start gap-3.5 rounded-(--khvi-radius-md) border border-red-200 bg-red-50 p-4 text-red-900 shadow-sm">
            <XMarkIcon aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
            <div>
              <h3 className="text-sm font-extrabold text-red-950">{t.diagnosticDbErrorTitle}</h3>
              <p className="mt-1 text-xs leading-5 text-red-800">{diagnostic.error}</p>
            </div>
          </aside>
        )}

        <section className="mt-7 rounded-(--khvi-radius-md) border border-[#d6e0e4] bg-white p-4 shadow-[0_10px_30px_rgba(16,40,58,0.06)] sm:p-5" aria-label={t.filtersLabel}>
          <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div className="grid gap-3 sm:grid-cols-3">
              <label className="grid gap-1.5 text-xs font-extrabold text-[#425761]">
                <span>{t.language}</span>
                <select
                  value={languageFilter}
                  onChange={(event) => setLanguageFilter(event.target.value)}
                  className="h-11 min-w-44 rounded-lg border border-[#cbd7dc] bg-white px-3 text-sm font-bold text-[#173646]"
                >
                  <option value="all">{t.allLanguages}</option>
                  {LANGUAGES.map((language) => <option key={language.id} value={language.id}>{languageLabel(language.id, copyLocale)}</option>)}
                </select>
              </label>
              <label className="grid gap-1.5 text-xs font-extrabold text-[#425761]">
                <span>{t.category}</span>
                <select
                  value={categoryFilter}
                  onChange={(event) => setCategoryFilter(event.target.value)}
                  className="h-11 min-w-44 rounded-lg border border-[#cbd7dc] bg-white px-3 text-sm font-bold text-[#173646]"
                >
                  <option value="all">{t.allCategories}</option>
                  {CATEGORIES.map((category) => <option key={category.id} value={category.id}>{categoryLabel(category.id, copyLocale)}</option>)}
                </select>
              </label>
              <label className="grid gap-1.5 text-xs font-extrabold text-[#425761]">
                <span>{t.distance}</span>
                <select
                  value={distanceFilter}
                  onChange={(event) => setDistanceFilter(event.target.value as DistanceFilterId)}
                  className="h-11 min-w-44 rounded-lg border border-[#cbd7dc] bg-white px-3 text-sm font-bold text-[#173646]"
                >
                  <option value="all">{t.anyDistance}</option>
                  <option value="5">5 km</option>
                  <option value="10">10 km</option>
                  <option value={String(INTERPRETER_MATCHING_RADIUS_KM)}>{INTERPRETER_MATCHING_RADIUS_KM} km</option>
                </select>
              </label>
            </div>

            <div className="flex flex-col items-start gap-2 xl:items-end">
              <button
                type="button"
                onClick={findMyLocation}
                disabled={geoStatus === "loading"}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border-2 border-(--khvi-teal) px-4 text-sm font-extrabold text-(--khvi-navy) transition-colors hover:bg-[#edf7f5] disabled:cursor-wait disabled:opacity-60"
              >
                <MapPinIcon aria-hidden="true" className="h-5 w-5" />
                {geoStatus === "loading" ? t.locatingGps : t.connectGps}
              </button>
              <p className={`text-xs font-bold ${geoStatus === "error" ? "text-(--khvi-coral)" : "text-[#78898f]"}`} role="status">
                {geoStatus === "ready" ? t.gpsReady : geoStatus === "error" ? t.gpsError : t.gpsIdle}
              </p>
              {sortBy === "nearest" && !userLocation && <p className="text-xs font-bold text-(--khvi-sun)">{t.connectGpsForSort}</p>}
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-[#eef2f4] pt-4">
            <AdjustmentsHorizontalIcon aria-hidden="true" className="h-4 w-4 text-(--khvi-teal)" />
            <span className="mr-1 text-xs font-extrabold text-[#64777e]">{t.filtersLabel}</span>
            {REQUEST_FILTERS.map((filter) => {
              const isActive = filter.id === activeFilter;
              return (
                <button
                  key={filter.id}
                  type="button"
                  aria-pressed={isActive}
                  className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-xs font-extrabold transition-colors ${isActive ? "border-(--khvi-navy) bg-(--khvi-navy) text-white" : "border-[#cbd7dc] bg-white text-[#425761] hover:border-(--khvi-teal) hover:text-(--khvi-teal)"}`}
                  onClick={() => setActiveFilter(filter.id)}
                >
                  {t.filters[filter.id]}
                  <span className={isActive ? "text-white/70" : "text-[#8a9aa0]"}>{counts[filter.id] ?? 0}</span>
                </button>
              );
            })}
          </div>
        </section>

        <div className="mt-6 grid gap-5 lg:items-start lg:grid-cols-[minmax(0,1.45fr)_360px]">
          <section className="overflow-hidden rounded-(--khvi-radius-md) border border-[#d6e0e4] bg-white shadow-[0_10px_30px_rgba(16,40,58,0.06)]" aria-label={t.mapLabel}>
            <div className="flex flex-col gap-2 border-b border-[#e4ebed] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-(--khvi-coral)" aria-hidden="true" />
                  <h2 className="text-base font-extrabold text-[#173646]">{t.mapLegend}</h2>
                </div>
                <p className="mt-1 text-xs leading-5 text-[#78898f]">{t.mapHint}</p>
              </div>
              <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-[#eef7f5] px-3 py-1.5 text-xs font-extrabold text-[#2b6c6f]">
                <MapPinIcon aria-hidden="true" className="h-4 w-4" />
                {t.requestCount(requests.length)}
              </span>
            </div>

            <div className="relative overflow-hidden">
              {!ready ? (
                <div className="grid min-h-[430px] place-items-center bg-[#f6f9fa] sm:min-h-[520px]">
                  <p role="status" className="rounded-full bg-white px-4 py-2 text-sm font-extrabold text-[#425761] shadow-sm">{t.loading}</p>
                </div>
              ) : (
                <>
                  <RequestMap
                    requests={sortedRequests}
                    userLocation={userLocation}
                    selectedRequest={selectedRequest}
                    mapLabel={t.mapLabel}
                    loadingLabel={t.loading}
                    myLocationLabel={t.myLocation}
                    onSelect={setSelectedRequest}
                  />
                  {selectedRequest && sortedRequests.some((request) => request.requestId === selectedRequest.requestId) && (
                    <div className="absolute inset-x-4 bottom-4 z-30 rounded-(--khvi-radius-sm) border border-[#d6e0e4] bg-white p-4 shadow-[0_18px_36px_rgba(16,40,58,0.18)] sm:left-auto sm:max-w-sm">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <StatusBadge status={selectedRequest.status} copyLocale={copyLocale} />
                            <UrgencyBadge urgency={selectedRequest.urgency} copyLocale={copyLocale} />
                          </div>
                          <h3 className="mt-2 text-base font-extrabold text-[#173646]">{categoryLabel(selectedRequest.categoryId, copyLocale)} · {languageLabel(selectedRequest.languageId, copyLocale)}</h3>
                        </div>
                        <button type="button" aria-label={t.close} className="rounded-full p-1.5 text-[#64777e] hover:bg-[#f1f5f6]" onClick={() => setSelectedRequest(null)}>
                          <XMarkIcon aria-hidden="true" className="h-5 w-5" />
                        </button>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-[#64777e]">{selectedRequest.description}</p>
                      <div className="mt-3 grid gap-1 text-xs font-bold text-[#73848a]">
                        <span>{t.area}: {selectedRequest.areaName}</span>
                        <span>{t.created}: {selectedRequest.createdAtLabel}</span>
                      </div>
                      <button type="button" className="mt-4 inline-flex h-11 w-full items-center justify-center rounded-lg bg-(--khvi-navy) px-4 text-sm font-extrabold text-white hover:bg-[#0c4960]" onClick={() => openClaimDialog(selectedRequest)}>
                        {t.claim}
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="flex flex-wrap gap-x-5 gap-y-2 border-t border-[#e4ebed] px-5 py-3 text-xs font-bold text-[#64777e]">
              <span className="inline-flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-(--khvi-coral)" />{t.urgentLegend}</span>
              <span className="inline-flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-(--khvi-sun)" />{t.scheduledLegend}</span>
              <span className="inline-flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-(--khvi-teal)" />{t.myLocation}</span>
              <span className="inline-flex items-center gap-1.5 text-[#87969a]"><InformationCircleIcon aria-hidden="true" className="h-4 w-4" />{t.broadAreaOnly}</span>
            </div>
          </section>

          <aside className="rounded-(--khvi-radius-md) border border-[#d6e0e4] bg-white shadow-[0_10px_30px_rgba(16,40,58,0.06)]" aria-label={t.openRequests}>
            <div className="border-b border-[#e4ebed] px-5 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-extrabold text-[#173646]">{t.openRequests}</h2>
                  <p className="mt-1 text-xs font-bold text-[#78898f]">{t.requestCount(requests.length)}</p>
                </div>
                <span className="grid h-10 w-10 place-items-center rounded-full bg-[#eef7f5] text-sm font-extrabold text-[#2b6c6f]">{requests.length}</span>
              </div>

              <div className="mt-3 grid h-10 grid-cols-2 overflow-hidden rounded-lg border border-[#cbd7dc] bg-white" role="group" aria-label={t.sortBy}>
                <button
                  type="button"
                  aria-pressed={sortBy === "newest"}
                  className={`inline-flex items-center justify-center gap-1 border-r border-[#cbd7dc] px-2 text-[11px] font-extrabold transition-colors ${sortBy === "newest" ? "bg-(--khvi-navy) text-white" : "text-[#425761] hover:bg-[#eef7f5]"}`}
                  onClick={() => setSortBy("newest")}
                >
                  <ClockIcon aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
                  <span>{t.newestFirst}</span>
                </button>
                <button
                  type="button"
                  aria-pressed={sortBy === "nearest"}
                  className={`inline-flex items-center justify-center gap-1 px-2 text-[11px] font-extrabold transition-colors ${sortBy === "nearest" ? "bg-(--khvi-navy) text-white" : "text-[#425761] hover:bg-[#eef7f5]"}`}
                  onClick={() => setSortBy("nearest")}
                >
                  <MapPinIcon aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
                  <span>{t.nearestFirst}</span>
                </button>
              </div>
            </div>

            <div className="grid gap-3 p-3">
              {requests.length === 0 ? (
                <div className="px-4 py-10 text-center">
                  <ClipboardDocumentListIcon aria-hidden="true" className="mx-auto h-9 w-9 text-[#9aa9ae]" />
                  <h3 className="mt-3 text-sm font-extrabold text-[#203d4d]">
                    {diagnostic?.status === "application_not_approved"
                      ? t.diagnosticNotApprovedTitle
                      : diagnostic?.status === "no_matching_skills"
                      ? t.diagnosticNoMatchingSkillsTitle
                      : t.noMatching}
                  </h3>
                  <p className="mt-2 text-xs leading-5 text-[#64777e]">
                    {diagnostic?.status === "application_not_approved"
                      ? t.diagnosticNotApprovedBody(diagnostic.applicationStatus)
                      : diagnostic?.status === "no_matching_skills"
                      ? t.diagnosticNoMatchingSkillsBody(diagnostic.openRequestsCount, diagnostic.approvedLanguageCount, diagnostic.approvedCategoryCount)
                      : t.noMatchingBody}
                  </p>
                </div>
              ) : sortedRequests.map((request) => (
                <article key={request.requestId} className={`rounded-(--khvi-radius-sm) border p-4 transition-colors ${selectedRequest?.requestId === request.requestId ? "border-(--khvi-teal) bg-[#f5fbfa]" : "border-[#e1e9eb] bg-white hover:border-[#a8c5c5]"}`}>
                  <button type="button" className="w-full text-left" onClick={() => setSelectedRequest(request)}>
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge status={request.status} copyLocale={copyLocale} />
                      <UrgencyBadge urgency={request.urgency} copyLocale={copyLocale} />
                    </div>
                    <h3 className="mt-3 text-sm font-extrabold text-[#173646]">{categoryLabel(request.categoryId, copyLocale)} · {languageLabel(request.languageId, copyLocale)}</h3>
                    <div className="mt-2 grid gap-1 text-xs font-bold text-[#73848a]">
                      <span className="inline-flex items-center gap-1.5"><MapPinIcon aria-hidden="true" className="h-3.5 w-3.5 text-(--khvi-teal)" />{request.areaName}</span>
                      <span className="inline-flex items-center gap-1.5"><ClockIcon aria-hidden="true" className="h-3.5 w-3.5 text-(--khvi-teal)" />{request.scheduledAtLabel ? `${t.scheduled}: ${request.scheduledAtLabel}` : `${t.created}: ${request.createdAtLabel}`}</span>
                      <span className="font-extrabold text-(--khvi-teal)">{userLocation && requestCoordinates(request) ? `${distanceInKm(userLocation, requestCoordinates(request)!).toFixed(1)} km ${t.distanceAway}` : t.distanceUnavailable}</span>
                    </div>
                  </button>
                  <div className="mt-4 flex items-center justify-between gap-3 border-t border-[#edf2f3] pt-3">
                    {request.expiresAt ? <ExpiryCountdown seconds={0} expiresAt={request.expiresAt} copyLocale={copyLocale} compact /> : <span className="text-xs font-bold text-[#87969a]">{t.locationUnavailable}</span>}
                    <button type="button" className="inline-flex h-9 items-center justify-center rounded-lg bg-(--khvi-navy) px-3 text-xs font-extrabold text-white hover:bg-[#0c4960] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--khvi-sun)" onClick={() => openClaimDialog(request)}>{t.claim}</button>
                  </div>
                </article>
              ))}
            </div>
          </aside>
        </div>

        {claimedRequestId && (
          <section className="mt-5 flex flex-col gap-3 rounded-(--khvi-radius-sm) border border-[#b7d9d2] bg-[#eef8f5] p-4 sm:flex-row sm:items-center sm:justify-between" role="status">
            <div className="flex items-start gap-3">
              <CheckCircleIcon aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-[#2b8177]" />
              <div>
                <p className="text-sm font-extrabold text-[#205f5a]">{t.claimedTitle}</p>
                <p className="mt-1 text-xs leading-5 text-[#4c7774]">{t.claimedBody}</p>
              </div>
            </div>
            <Link className="inline-flex h-10 items-center justify-center rounded-lg border border-[#6aa99f] px-4 text-xs font-extrabold text-[#205f5a] hover:bg-white" href="/interpreter/my-assignments#main-content">{t.goAssignments}</Link>
          </section>
        )}
      </div>

      <ActiveTaskDialog open={activeTaskDialogOpen} onClose={() => setActiveTaskDialogOpen(false)} />

      {claimRequest && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-[#10283a]/55 p-4 backdrop-blur-sm" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setClaimRequest(null); }}>
          <section className="max-h-[calc(100vh-2rem)] w-full max-w-xl overflow-y-auto rounded-(--khvi-radius-md) bg-white shadow-[0_24px_70px_rgba(16,40,58,0.26)]" role="dialog" aria-modal="true" aria-labelledby="claim-dialog-title">
            <div className="flex items-start justify-between gap-4 border-b border-[#e4ebed] px-5 py-5 sm:px-6">
              <div>
                <h2 id="claim-dialog-title" className="text-xl font-extrabold text-[#173646]">{t.claimTitle}</h2>
                <p className="mt-2 max-w-md text-sm leading-6 text-[#64777e]">{t.claimBody}</p>
              </div>
              <button type="button" aria-label={t.close} className="rounded-full p-2 text-[#64777e] hover:bg-[#f1f5f6]" onClick={() => setClaimRequest(null)}><XMarkIcon aria-hidden="true" className="h-5 w-5" /></button>
            </div>
            <div className="grid gap-5 px-5 py-5 sm:px-6">
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status={claimRequest.status} copyLocale={copyLocale} />
                <UrgencyBadge urgency={claimRequest.urgency} copyLocale={copyLocale} />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-[#173646]">{categoryLabel(claimRequest.categoryId, copyLocale)} · {languageLabel(claimRequest.languageId, copyLocale)}</h3>
                <p className="mt-3 text-sm leading-7 text-[#425761]">{claimRequest.description}</p>
              </div>
              <dl className="grid gap-3 rounded-(--khvi-radius-sm) bg-[#f6f9fa] p-4 text-sm sm:grid-cols-2">
                <div><dt className="text-xs font-extrabold text-[#87969a]">{t.area}</dt><dd className="mt-1 font-extrabold text-[#203d4d]">{claimRequest.areaName}</dd></div>
                <div><dt className="text-xs font-extrabold text-[#87969a]">{claimRequest.scheduledAtLabel ? t.scheduled : t.created}</dt><dd className="mt-1 font-extrabold text-[#203d4d]">{claimRequest.scheduledAtLabel ?? claimRequest.createdAtLabel}</dd></div>
              </dl>
              <div className="flex items-start gap-3 rounded-(--khvi-radius-sm) border border-[#f0dfbf] bg-[#fff9ee] p-4">
                <ShieldCheckIcon aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-[#b8752b]" />
                <p className="text-xs leading-5 text-[#77562d]">{t.privacy}</p>
              </div>
              {claimError && <p role="alert" className="text-sm font-bold text-[#c7473a]">{claimError}</p>}
              <div className="flex flex-col-reverse gap-3 border-t border-[#e4ebed] pt-4 sm:flex-row sm:justify-end">
                <button type="button" className="inline-flex h-11 items-center justify-center rounded-lg border border-[#cbd7dc] px-4 text-sm font-extrabold text-[#425761] hover:bg-[#f6f9fa]" onClick={() => setClaimRequest(null)}>{t.cancel}</button>
                <button type="button" disabled={claimingId !== null} className="inline-flex h-11 items-center justify-center rounded-lg bg-(--khvi-navy) px-5 text-sm font-extrabold text-white hover:bg-[#0c4960] disabled:cursor-wait disabled:opacity-60" onClick={confirmClaim}>{t.confirmClaim}</button>
              </div>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
