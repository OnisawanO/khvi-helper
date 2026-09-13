"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowLeftIcon,
  ClipboardDocumentListIcon,
  MapPinIcon,
} from "@heroicons/react/24/outline";
import { useCopyLocale } from "@/app/components/app-shell";
import { ExpiryCountdown } from "@/app/components/expiry-countdown";
import { StatusBadge, UrgencyBadge } from "@/app/components/request-badges";
import { useRequests } from "@/app/lib/request-store";
import { categoryLabel, languageLabel, type Urgency } from "@/app/lib/mock-requests";

const REQUEST_FILTERS = [
  { id: "all", urgency: null },
  { id: "urgent", urgency: "Immediate" },
  { id: "scheduled", urgency: "Scheduled" },
] as const satisfies readonly { id: string; urgency: Urgency | null }[];

type RequestFilterId = (typeof REQUEST_FILTERS)[number]["id"];

const copy = {
  en: {
    back: "Back to main",
    label: "Interpreter workspace",
    title: "Find requests",
    intro: "Open requests saved in this browser. Review the language, category and broad area before choosing an assignment.",
    assignments: "My assignments",
    filterLabel: "Filter available requests",
    filters: { all: "All", urgent: "Urgent", scheduled: "Scheduled" },
    created: "Created",
    scheduled: "Appointment",
    area: "Area",
    claimUnavailable: "Claim coming soon",
    emptyTitle: "No matching requests",
    emptyBody: "No open request matches this filter. New requests will appear here when they are available.",
    guide: "Read the assignment guide",
    loading: "Loading available requests…",
  },
  zh: {
    back: "返回主页",
    label: "口译员工作区",
    title: "查找求助",
    intro: "查看此浏览器中保存的开放求助。接单前先确认语言、类别和大致区域。",
    assignments: "我的任务",
    filterLabel: "筛选可接任务",
    filters: { all: "全部", urgent: "紧急", scheduled: "预约" },
    created: "创建时间",
    scheduled: "预约时间",
    area: "区域",
    claimUnavailable: "接单功能即将开放",
    emptyTitle: "没有匹配的求助",
    emptyBody: "没有符合此筛选条件的开放求助。新求助可用后会显示在这里。",
    guide: "查看接单指南",
    loading: "正在读取可接任务…",
  },
} as const;

export function FindRequestsList() {
  const [activeFilter, setActiveFilter] = useState<RequestFilterId>("all");
  const { requests: allRequests, ready } = useRequests();
  const copyLocale = useCopyLocale();
  const t = copy[copyLocale];
  const openRequests = allRequests.filter((request) => request.status === "Open");
  const matching = (filterId: RequestFilterId) => {
    const urgency = REQUEST_FILTERS.find((filter) => filter.id === filterId)?.urgency ?? null;
    return openRequests.filter((request) => urgency === null || request.urgency === urgency);
  };
  const requests = matching(activeFilter);
  const counts = Object.fromEntries(REQUEST_FILTERS.map((filter) => [filter.id, matching(filter.id).length]));

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
            href="/my-assignments#main-content"
          >
            <ClipboardDocumentListIcon aria-hidden="true" className="h-5 w-5" />
            {t.assignments}
          </Link>
        </div>

        <nav aria-label={t.filterLabel} className="mt-7 flex flex-wrap gap-2">
          {REQUEST_FILTERS.map((filter) => {
            const isActive = filter.id === activeFilter;

            return (
              <button
                key={filter.id}
                type="button"
                aria-pressed={isActive}
                className={`inline-flex items-center gap-2 rounded-lg border px-3.5 py-2 text-xs font-extrabold transition-colors ${
                  isActive
                    ? "border-[#092f45] bg-(--khvi-navy) text-white"
                    : "border-[#cbd7dc] bg-white text-[#425761] hover:border-[#087f80] hover:text-[#087f80]"
                }`}
                onClick={() => setActiveFilter(filter.id)}
              >
                {t.filters[filter.id]}
                <span className={isActive ? "text-white/70" : "text-[#8a9aa0]"}>{counts[filter.id] ?? 0}</span>
              </button>
            );
          })}
        </nav>

        {!ready ? (
          <p role="status" className="mt-6">{t.loading}</p>
        ) : requests.length === 0 ? (
          <section className="mt-6 border border-[#d6e0e4] bg-white p-10 text-center">
            <ClipboardDocumentListIcon aria-hidden="true" className="mx-auto h-10 w-10 text-[#9aa9ae]" />
            <h2 className="mt-4 text-lg font-extrabold text-[#203d4d]">{t.emptyTitle}</h2>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-7 text-[#64777e]">{t.emptyBody}</p>
            <Link
              className="mt-5 inline-flex h-12 items-center justify-center rounded-lg border-2 border-[#087f80] px-5 text-sm font-extrabold text-[#087f80] transition-colors hover:bg-[#edf7f5]"
              href="/welcome#welcome-steps"
            >
              {t.guide}
            </Link>
          </section>
        ) : (
          <ul className="mt-6 grid gap-3">
            {requests.map((request) => (
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
                    {request.expiresAt && <ExpiryCountdown seconds={0} expiresAt={request.expiresAt} copyLocale={copyLocale} compact />}
                    <span className="text-xs font-extrabold text-[#8a9aa0]">{t.claimUnavailable}</span>
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
