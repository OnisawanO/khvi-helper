"use client";

import Link from "next/link";
import {
  ArrowLeftIcon,
  ClipboardDocumentListIcon,
  MapPinIcon,
} from "@heroicons/react/24/outline";
import { useCopyLocale } from "@/app/components/app-shell";
import { StatusBadge, UrgencyBadge } from "@/app/components/request-badges";
import { useRequests } from "@/app/lib/request-store";
import {
  categoryLabel,
  languageLabel,
  type HelpRequest,
  type StatusFilterId,
} from "@/app/lib/mock-requests";

const ASSIGNMENT_FILTERS = ["all", "claimed", "in-progress", "completed"] as const;
type AssignmentFilterId = (typeof ASSIGNMENT_FILTERS)[number];

const copy = {
  en: {
    back: "Back to main",
    label: "Interpreter workspace",
    title: "My assignments",
    intro: "Assignments you have claimed, ordered from the latest activity. Check each status before continuing the work.",
    findRequests: "Find requests",
    filterLabel: "Filter assignments by status",
    filters: { all: "All", claimed: "Claimed", "in-progress": "In progress", completed: "Completed" },
    created: "Created",
    scheduled: "Appointment",
    area: "Area",
    next: { Claimed: "Await requester confirmation", InProgress: "Continue assignment", Completed: "Assignment completed" },
    emptyTitle: "No assignments yet",
    emptyBody: "Claimed requests will appear here. Open Find requests when you are ready to help.",
    loading: "Loading your assignments…",
  },
  zh: {
    back: "返回主页",
    label: "口译员工作区",
    title: "我的任务",
    intro: "查看你接取的任务和最新状态，继续工作前先确认当前步骤。",
    findRequests: "查找求助",
    filterLabel: "按状态筛选任务",
    filters: { all: "全部", claimed: "已接取", "in-progress": "进行中", completed: "已完成" },
    created: "创建时间",
    scheduled: "预约时间",
    area: "区域",
    next: { Claimed: "等待求助者确认", InProgress: "继续任务", Completed: "任务已完成" },
    emptyTitle: "还没有任务",
    emptyBody: "你接取的求助会显示在这里。准备好提供帮助时，请打开查找求助。",
    loading: "正在读取你的任务…",
  },
} as const;

function assignmentStatus(filterId: AssignmentFilterId): HelpRequest["status"] | null {
  if (filterId === "claimed") return "Claimed";
  if (filterId === "in-progress") return "InProgress";
  if (filterId === "completed") return "Completed";
  return null;
}

function normalizeFilter(filterId: StatusFilterId): AssignmentFilterId {
  return ASSIGNMENT_FILTERS.includes(filterId as AssignmentFilterId) ? filterId as AssignmentFilterId : "all";
}

export function MyAssignmentsList({ activeFilter }: { activeFilter: StatusFilterId }) {
  const { requests: allRequests, ready } = useRequests();
  const copyLocale = useCopyLocale();
  const t = copy[copyLocale];
  const selectedFilter = normalizeFilter(activeFilter);
  const allAssignments = allRequests.filter((request) => ["Claimed", "InProgress", "Completed"].includes(request.status));
  const matching = (filterId: AssignmentFilterId) => {
    const status = assignmentStatus(filterId);
    return allAssignments.filter((request) => status === null || request.status === status);
  };
  const assignments = matching(selectedFilter);
  const counts = Object.fromEntries(ASSIGNMENT_FILTERS.map((filterId) => [filterId, matching(filterId).length]));

  return (
    <main id="main-content" className="flex-1 px-5 py-8 sm:px-8 lg:px-12 lg:py-10">
      <div className="mx-auto max-w-[1180px]">
        <Link
          className="inline-flex items-center gap-2 text-sm font-extrabold text-[#087f80] transition-colors hover:text-[#0a6465]"
          href="/welcome#welcome-Interpreter"
        >
          <ArrowLeftIcon aria-hidden="true" className="h-4 w-4" />
          {t.back}
        </Link>

        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-extrabold text-[#087f80]">{t.label}</p>
            <h1 className="mt-1.5 text-3xl font-extrabold tracking-normal text-[#122b3e] sm:text-4xl">{t.title}</h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-[#64777e]">{t.intro}</p>
          </div>
          <Link
            className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-lg bg-(--khvi-navy) px-5 text-sm font-extrabold text-white transition-colors hover:bg-[#0c4960]"
            href="/find-requests#main-content"
          >
            <MapPinIcon aria-hidden="true" className="h-5 w-5" />
            {t.findRequests}
          </Link>
        </div>

        <nav aria-label={t.filterLabel} className="mt-7 flex flex-wrap gap-2">
          {ASSIGNMENT_FILTERS.map((filterId) => {
            const isActive = filterId === selectedFilter;
            const href = filterId === "all" ? "/my-assignments#main-content" : `/my-assignments?status=${filterId}#main-content`;

            return (
              <Link
                key={filterId}
                href={href}
                aria-current={isActive ? "page" : undefined}
                className={`inline-flex items-center gap-2 rounded-lg border px-3.5 py-2 text-xs font-extrabold transition-colors ${
                  isActive
                    ? "border-[#092f45] bg-(--khvi-navy) text-white"
                    : "border-[#cbd7dc] bg-white text-[#425761] hover:border-[#087f80] hover:text-[#087f80]"
                }`}
              >
                {t.filters[filterId]}
                <span className={isActive ? "text-white/70" : "text-[#8a9aa0]"}>{counts[filterId] ?? 0}</span>
              </Link>
            );
          })}
        </nav>

        {!ready ? (
          <p role="status" className="mt-6">{t.loading}</p>
        ) : assignments.length === 0 ? (
          <section className="mt-6 border border-[#d6e0e4] bg-white p-10 text-center">
            <ClipboardDocumentListIcon aria-hidden="true" className="mx-auto h-10 w-10 text-[#9aa9ae]" />
            <h2 className="mt-4 text-lg font-extrabold text-[#203d4d]">{t.emptyTitle}</h2>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-7 text-[#64777e]">{t.emptyBody}</p>
            <Link
              className="mt-5 inline-flex h-12 items-center justify-center gap-2 rounded-lg border-2 border-[#087f80] px-5 text-sm font-extrabold text-[#087f80] transition-colors hover:bg-[#edf7f5]"
              href="/find-requests#main-content"
            >
              <MapPinIcon aria-hidden="true" className="h-5 w-5" />
              {t.findRequests}
            </Link>
          </section>
        ) : (
          <ul className="mt-6 grid gap-3">
            {assignments.map((request) => (
              <li key={request.requestId}>
                <article className="flex flex-col gap-4 border border-[#d6e0e4] bg-white p-5 lg:flex-row lg:items-center lg:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge status={request.status} copyLocale={copyLocale} />
                      <UrgencyBadge urgency={request.urgency} copyLocale={copyLocale} />
                      <span className="text-xs font-extrabold text-[#8a9aa0]">#{request.requestId}</span>
                    </div>
                    <h2 className="mt-3 text-lg font-extrabold text-[#173646]">
                      {categoryLabel(request.categoryId, copyLocale)} · {languageLabel(request.languageId, copyLocale)}
                    </h2>
                    <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-bold text-[#73848a]">
                      <span className="inline-flex items-center gap-1.5">
                        <MapPinIcon aria-hidden="true" className="h-4 w-4 text-[#087f80]" />
                        {t.area}: {request.areaName}
                      </span>
                      <span>{t.created}: {request.createdAtLabel}</span>
                      {request.scheduledAtLabel && <span>{t.scheduled}: {request.scheduledAtLabel}</span>}
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center justify-between gap-4 border-t border-[#eef2f4] pt-4 lg:w-64 lg:flex-col lg:items-end lg:border-t-0 lg:pt-0">
                    <span className="text-xs font-extrabold text-[#425761]">{t.next[request.status as keyof typeof t.next]}</span>
                  </div>
                </article>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
