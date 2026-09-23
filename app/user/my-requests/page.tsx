"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { use, useState } from "react";
import { ChevronRightIcon, InboxIcon, MapPinIcon, PlusIcon, UserCircleIcon } from "@heroicons/react/24/outline";
import { useCopyLocale } from "@/app/components/app-shell";
import { ExpiryCountdown } from "@/app/components/expiry-countdown";
import { StatusBadge, UrgencyBadge } from "@/app/components/request-badges";
import { WorkspaceBreadcrumbs } from "@/app/components/workspace-breadcrumbs";
import { useRequesterRequests } from "@/app/components/requests/requester-requests-context";
import {
  categoryLabel,
  isContactUnlocked,
  languageLabel,
  resolveStatusFilter,
  STATUS_FILTERS,
  type StatusFilterId,
} from "@/app/lib/mock-requests";

const copy = {
  en: {
    breadcrumb: "Breadcrumb",
    main: "Main",
    label: "Requester hub",
    title: "My requests",
    intro: "Every pin you created, newest first. Open one to track its status and see interpreter contact details.",
    newRequest: "New request",
    filterLabel: "Filter by status",
    filters: {
      all: "All",
      open: "Open",
      claimed: "Claimed",
      "in-progress": "In progress",
      completed: "Completed",
      closed: "Cancelled or expired",
    },
    created: "Created",
    scheduled: "Appointment",
    area: "Area",
    waiting: "Waiting for an interpreter",
    closedBy: {
      User: "Cancelled by you",
      Interpreter: "Cancelled by the interpreter",
      Manager: "Cancelled by a manager",
      System: "Expired without a claim",
    },
    view: "Open request",
    reviewPending: "Review pending",
    reviewed: "Reviewed",
    emptyTitle: "Nothing here yet",
    emptyBody: "No request matches this filter. Create a pin when you need language help.",
  },
  zh: {
    breadcrumb: "面包屑导航",
    main: "主页",
    label: "求助中心",
    title: "我的求助",
    intro: "你创建的全部求助点，最新的排在前面。点开可查看状态和口译员联系方式。",
    newRequest: "新建求助",
    filterLabel: "按状态筛选",
    filters: {
      all: "全部",
      open: "开放中",
      claimed: "已接取",
      "in-progress": "进行中",
      completed: "已完成",
      closed: "已取消或过期",
    },
    created: "创建时间",
    scheduled: "预约时间",
    area: "区域",
    waiting: "等待口译员接取",
    closedBy: {
      User: "你已取消",
      Interpreter: "口译员已取消",
      Manager: "管理员已取消",
      System: "无人接取已过期",
    },
    view: "查看求助",
    reviewPending: "待评价",
    reviewed: "已评价",
    emptyTitle: "这里还没有内容",
    emptyBody: "没有符合此筛选条件的求助。需要语言帮助时可以创建求助点。",
  },
} as const;

export default function MyRequestsPage({ searchParams }: { searchParams: Promise<{ status?: string | string[] }> }) {
  const { status } = use(searchParams);
  const activeFilter = resolveStatusFilter(status);
  const allRequests = useRequesterRequests();
  const [selectedFilter, setSelectedFilter] = useState(activeFilter);
  const matching = (id: StatusFilterId) => {
    const statuses: readonly string[] | null = STATUS_FILTERS.find((f) => f.id === id)?.statuses ?? null;
    return allRequests.filter((r) => !statuses || statuses.includes(r.status));
  };
  const requests = matching(selectedFilter);
  const counts = Object.fromEntries(STATUS_FILTERS.map((f) => [f.id, matching(f.id).length]));
  const copyLocale = useCopyLocale();
  const t = copy[copyLocale];
  const pathname = usePathname();
  const workspaceBase = pathname.startsWith("/interpreter") ? "/interpreter" : "/user";

  return (
    <main id="main-content" className="flex-1 px-5 py-8 sm:px-8 lg:px-12 lg:py-10">
      <div className="mx-auto max-w-[1180px]">
        <WorkspaceBreadcrumbs
          ariaLabel={t.breadcrumb}
          currentLabel={t.title}
          homeHref={workspaceBase}
          homeLabel={t.main}
        />
        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-extrabold text-[#087f80]">{t.label}</p>
            <h1 className="mt-1.5 text-3xl font-extrabold tracking-normal text-[#122b3e] sm:text-4xl">{t.title}</h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-[#64777e]">{t.intro}</p>
          </div>
          <Link
            className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-lg bg-(--khvi-coral) px-5 text-sm font-extrabold text-white shadow-[0_10px_20px_rgba(240,79,62,0.22)] transition-colors hover:bg-[#d94334]"
            href={`${workspaceBase}/request-help#main-content`}
          >
            <PlusIcon aria-hidden="true" className="h-5 w-5" />
            {t.newRequest}
          </Link>
        </div>

        <div role="group" aria-label={t.filterLabel} className="mt-7 flex flex-wrap gap-2">
          {STATUS_FILTERS.map((filter) => {
            const isActive = filter.id === selectedFilter;
            const href = filter.id === "all" ? `${workspaceBase}/my-requests#main-content` : `${workspaceBase}/my-requests?status=${filter.id}#main-content`;

            return (
              <button
                key={filter.id}
                type="button"
                aria-pressed={isActive}
                aria-controls="request-results"
                className={`inline-flex items-center gap-2 rounded-lg border px-3.5 py-2 text-xs font-extrabold transition-colors focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-(--khvi-sun) ${
                  isActive
                    ? "border-[#092f45] bg-(--khvi-navy) text-white"
                    : "border-[#cbd7dc] bg-white text-[#425761] hover:border-[#087f80] hover:text-[#087f80]"
                }`}
                onClick={() => {
                  setSelectedFilter(filter.id);
                  window.history.replaceState(null, "", href);
                }}
              >
                {t.filters[filter.id]}
                <span className={isActive ? "text-white/70" : "text-[#8a9aa0]"}>{counts[filter.id] ?? 0}</span>
              </button>
            );
          })}
        </div>

        {requests.length === 0 ? (
          <section id="request-results" className="mt-6 border border-[#d6e0e4] bg-white p-10 text-center">
            <InboxIcon aria-hidden="true" className="mx-auto h-10 w-10 text-[#9aa9ae]" />
            <h2 className="mt-4 text-lg font-extrabold text-[#203d4d]">{t.emptyTitle}</h2>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-7 text-[#64777e]">{t.emptyBody}</p>
            <Link
              className="mt-5 inline-flex h-12 items-center justify-center gap-2 rounded-lg border-2 border-[#087f80] px-5 text-sm font-extrabold text-[#087f80] transition-colors hover:bg-[#edf7f5]"
              href={`${workspaceBase}/request-help#main-content`}
            >
              <PlusIcon aria-hidden="true" className="h-5 w-5" />
              {t.newRequest}
            </Link>
          </section>
        ) : (
          <ul id="request-results" className="mt-6 grid gap-3" aria-live="polite">
            {requests.map((request) => (
              <li key={request.requestId}>
                <Link
                  href={`${workspaceBase}/my-requests/${request.requestId}`}
                  aria-label={`${t.view}: ${categoryLabel(request.categoryId, copyLocale)} · ${languageLabel(request.languageId, copyLocale)}, ${request.scheduledAtLabel ?? request.createdAtLabel}`}
                  className="group flex flex-col gap-4 border border-[#d6e0e4] bg-white p-5 transition-colors hover:border-[#087f80] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-(--khvi-sun) lg:flex-row lg:items-center lg:justify-between"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge status={request.status} copyLocale={copyLocale} />
                      <UrgencyBadge urgency={request.urgency} copyLocale={copyLocale} />
                    </div>

                    <h2 className="mt-3 text-lg font-extrabold text-[#173646]">
                      {categoryLabel(request.categoryId, copyLocale)} · {languageLabel(request.languageId, copyLocale)}
                    </h2>
                    <p className="mt-1.5 line-clamp-2 max-w-2xl text-sm leading-6 text-[#64777e]">{request.description}</p>

                    <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-bold text-[#73848a]">
                      <span className="inline-flex items-center gap-1.5">
                        <MapPinIcon aria-hidden="true" className="h-4 w-4 text-[#087f80]" />
                        {t.area}: {request.areaName}
                      </span>
                      <span>
                        {t.created}: {request.createdAtLabel}
                      </span>
                      {request.scheduledAtLabel && (
                        <span>
                          {t.scheduled}: {request.scheduledAtLabel}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center justify-between gap-4 border-t border-[#eef2f4] pt-4 lg:w-64 lg:flex-col lg:items-end lg:border-t-0 lg:pt-0">
                    {request.status === "Open" && request.expiresAt ? (
                      <ExpiryCountdown seconds={0} expiresAt={request.expiresAt} copyLocale={copyLocale} compact />
                    ) : isContactUnlocked(request.status) && request.interpreter ? (
                      <span className="inline-flex items-center gap-2 text-xs font-extrabold text-[#294554]">
                        <UserCircleIcon aria-hidden="true" className="h-5 w-5 text-[#087557]" />
                        {request.interpreter.name}
                      </span>
                    ) : request.status === "Open" ? (
                      <span className="text-xs font-bold text-[#8a9aa0]">{t.waiting}</span>
                    ) : request.cancelledBy ? (
                      <span className="text-xs font-bold text-[#8a9aa0]">{t.closedBy[request.cancelledBy]}</span>
                    ) : null}

                    {request.status === "Completed" && request.interpreter && (
                      <span className="text-xs font-extrabold text-[#087557]">
                        {request.review ? t.reviewed : t.reviewPending}
                      </span>
                    )}

                    <span className="inline-flex min-h-11 items-center justify-center gap-1 rounded-lg bg-(--khvi-navy) px-4 text-xs font-extrabold text-white transition-colors group-hover:bg-[#0c4960] sm:self-end">
                      {t.view}
                      <ChevronRightIcon aria-hidden="true" className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
