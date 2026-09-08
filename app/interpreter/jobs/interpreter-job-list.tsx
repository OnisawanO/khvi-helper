"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  CheckCircleIcon,
  ChevronRightIcon,
  ClockIcon,
  InboxIcon,
  MapPinIcon,
  NoSymbolIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";
import { useCopyLocale } from "@/app/components/app-shell";
import { ExpiryCountdown } from "@/app/components/expiry-countdown";
import { StatusBadge, UrgencyBadge } from "@/app/components/request-badges";
import {
  categoryLabel,
  languageLabel,
  type HelpRequest,
} from "@/app/lib/mock-requests";

type InterpreterFilter = "all" | "available" | "scheduled" | "active" | "completed";

const copy = {
  en: {
    label: "Interpreter hub",
    title: "Jobs near you",
    intro:
      "Review language-help requests that match your role. Accept a job to open its mission room, or decline it to hide it from your list.",
    filters: {
      all: "All",
      available: "Available",
      scheduled: "Scheduled",
      active: "My active jobs",
      completed: "Completed",
    },
    area: "Area",
    appointment: "Appointment",
    accept: "Accept job",
    decline: "Decline",
    openMission: "Open mission",
    accepted: "Accepted",
    declinedNotice: "Declined jobs are hidden only for this interpreter.",
    emptyTitle: "No jobs in this view",
    emptyBody: "Try another filter or wait for a new help request.",
  },
  zh: {
    label: "口译员中心",
    title: "附近任务",
    intro: "查看语言求助任务。接取后可进入任务室；拒绝后只会从你的列表中隐藏。",
    filters: {
      all: "全部",
      available: "可接取",
      scheduled: "预约",
      active: "进行中的任务",
      completed: "已完成",
    },
    area: "区域",
    appointment: "预约时间",
    accept: "接取任务",
    decline: "拒绝",
    openMission: "进入任务",
    accepted: "已接取",
    declinedNotice: "拒绝只会从当前口译员列表中隐藏，不会取消求助。",
    emptyTitle: "当前没有任务",
    emptyBody: "请选择其他筛选条件，或等待新的求助。",
  },
} as const;

const filters: InterpreterFilter[] = [
  "all",
  "available",
  "scheduled",
  "active",
  "completed",
];

function matchesFilter(
  request: HelpRequest,
  filter: InterpreterFilter,
  acceptedIds: Set<string>,
) {
  if (filter === "all") return true;
  if (filter === "available") return request.status === "Open" && !acceptedIds.has(request.requestId);
  if (filter === "scheduled") return request.urgency === "Scheduled" && request.status === "Open";
  if (filter === "active") {
    return (
      acceptedIds.has(request.requestId) ||
      request.status === "Claimed" ||
      request.status === "InProgress"
    );
  }
  return request.status === "Completed";
}

export function InterpreterJobList({ requests }: { requests: HelpRequest[] }) {
  const copyLocale = useCopyLocale();
  const t = copy[copyLocale];
  const [activeFilter, setActiveFilter] = useState<InterpreterFilter>("all");
  const [acceptedIds, setAcceptedIds] = useState<Set<string>>(() => new Set());
  const [declinedIds, setDeclinedIds] = useState<Set<string>>(() => new Set());

  const visibleRequests = useMemo(
    () =>
      requests.filter(
        (request) =>
          !declinedIds.has(request.requestId) &&
          matchesFilter(request, activeFilter, acceptedIds),
      ),
    [requests, declinedIds, activeFilter, acceptedIds],
  );

  const counts = useMemo(() => {
    return Object.fromEntries(
      filters.map((filter) => [
        filter,
        requests.filter(
          (request) =>
            !declinedIds.has(request.requestId) &&
            matchesFilter(request, filter, acceptedIds),
        ).length,
      ]),
    ) as Record<InterpreterFilter, number>;
  }, [requests, declinedIds, acceptedIds]);

  const acceptJob = (requestId: string) => {
    setAcceptedIds((current) => {
      const next = new Set(current);
      next.add(requestId);
      return next;
    });
  };

  const declineJob = (requestId: string) => {
    setDeclinedIds((current) => {
      const next = new Set(current);
      next.add(requestId);
      return next;
    });
  };

  return (
    <main id="main-content" className="flex-1 px-5 py-8 sm:px-8 lg:px-12 lg:py-10">
      <div className="mx-auto max-w-[1180px]">
        <div>
          <p className="text-sm font-extrabold text-[#087f80]">{t.label}</p>
          <h1 className="mt-1.5 text-3xl font-extrabold tracking-normal text-[#122b3e] sm:text-4xl">
            {t.title}
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-[#64777e]">{t.intro}</p>
        </div>

        <nav aria-label="Filter jobs" className="mt-7 flex flex-wrap gap-2">
          {filters.map((filter) => {
            const isActive = activeFilter === filter;

            return (
              <button
                key={filter}
                type="button"
                onClick={() => setActiveFilter(filter)}
                className={`inline-flex items-center gap-2 rounded-lg border px-3.5 py-2 text-xs font-extrabold transition-colors ${
                  isActive
                    ? "border-[#092f45] bg-[#092f45] text-white"
                    : "border-[#cbd7dc] bg-white text-[#425761] hover:border-[#087f80] hover:text-[#087f80]"
                }`}
              >
                {t.filters[filter]}
                <span className={isActive ? "text-white/70" : "text-[#8a9aa0]"}>
                  {counts[filter]}
                </span>
              </button>
            );
          })}
        </nav>

        <p className="mt-4 text-xs font-semibold text-[#8a9aa0]">{t.declinedNotice}</p>

        {visibleRequests.length === 0 ? (
          <section className="mt-6 border border-[#d6e0e4] bg-white p-10 text-center">
            <InboxIcon className="mx-auto h-10 w-10 text-[#9aa9ae]" aria-hidden="true" />
            <h2 className="mt-4 text-lg font-extrabold text-[#203d4d]">{t.emptyTitle}</h2>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-7 text-[#64777e]">
              {t.emptyBody}
            </p>
          </section>
        ) : (
          <ul className="mt-6 grid gap-3">
            {visibleRequests.map((request) => {
              const locallyAccepted = acceptedIds.has(request.requestId);
              const isAvailable = request.status === "Open" && !locallyAccepted;
              const isActiveJob =
                locallyAccepted ||
                request.status === "Claimed" ||
                request.status === "InProgress";

              return (
                <li
                  key={request.requestId}
                  className="border border-[#d6e0e4] bg-white p-5 transition-colors hover:border-[#087f80]"
                >
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        {locallyAccepted ? (
                          <span className="inline-flex items-center gap-1.5 rounded-md border border-[#9bcfba] bg-[#eaf7f1] px-2.5 py-1 text-xs font-extrabold text-[#087557]">
                            <CheckCircleIcon className="h-4 w-4" aria-hidden="true" />
                            {t.accepted}
                          </span>
                        ) : (
                          <StatusBadge status={request.status} copyLocale={copyLocale} />
                        )}

                        <UrgencyBadge urgency={request.urgency} copyLocale={copyLocale} />
                        <span className="text-xs font-extrabold text-[#8a9aa0]">
                          #{request.requestId}
                        </span>
                      </div>

                      <h2 className="mt-3 text-lg font-extrabold text-[#173646]">
                        {categoryLabel(request.categoryId, copyLocale)} ·{" "}
                        {languageLabel(request.languageId, copyLocale)}
                      </h2>

                      <p className="mt-1.5 line-clamp-2 max-w-2xl text-sm leading-6 text-[#64777e]">
                        {request.description}
                      </p>

                      <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-bold text-[#73848a]">
                        <span className="inline-flex items-center gap-1.5">
                          <MapPinIcon className="h-4 w-4 text-[#087f80]" aria-hidden="true" />
                          {t.area}: {request.areaName}
                        </span>

                        {request.scheduledAtLabel && (
                          <span className="inline-flex items-center gap-1.5">
                            <ClockIcon className="h-4 w-4 text-[#087f80]" aria-hidden="true" />
                            {t.appointment}: {request.scheduledAtLabel}
                          </span>
                        )}

                        {request.interpreter && request.status !== "Open" && (
                          <span className="inline-flex items-center gap-1.5">
                            <UserCircleIcon className="h-4 w-4 text-[#087557]" aria-hidden="true" />
                            {request.interpreter.name}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex shrink-0 flex-col gap-2 border-t border-[#eef2f4] pt-4 lg:w-60 lg:border-t-0 lg:pt-0">
                      {request.status === "Open" && request.expiresInSeconds !== null && !locallyAccepted && (
                        <div className="mb-1">
                          <ExpiryCountdown
                            seconds={request.expiresInSeconds}
                            copyLocale={copyLocale}
                            compact
                          />
                        </div>
                      )}

                      {isAvailable ? (
                        <>
                          <button
                            type="button"
                            onClick={() => acceptJob(request.requestId)}
                            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#087f80] px-4 text-sm font-extrabold text-white transition-colors hover:bg-[#066e70]"
                          >
                            <CheckCircleIcon className="h-5 w-5" aria-hidden="true" />
                            {t.accept}
                          </button>

                          <button
                            type="button"
                            onClick={() => declineJob(request.requestId)}
                            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-[#efb0a8] bg-white px-4 text-sm font-extrabold text-[#cc3e31] transition-colors hover:bg-[#fff4f2]"
                          >
                            <NoSymbolIcon className="h-5 w-5" aria-hidden="true" />
                            {t.decline}
                          </button>
                        </>
                      ) : isActiveJob ? (
                        <Link
                          href={`/mission/${request.requestId}?role=interpreter${
                            locallyAccepted ? "&claimed=1" : ""
                          }`}
                          className="inline-flex h-11 items-center justify-center gap-1.5 rounded-lg bg-[#092f45] px-4 text-sm font-extrabold text-white transition-colors hover:bg-[#123e55]"
                        >
                          {t.openMission}
                          <ChevronRightIcon className="h-4 w-4" aria-hidden="true" />
                        </Link>
                      ) : request.status === "Completed" ? (
                        <Link
                          href={`/mission/${request.requestId}?role=interpreter`}
                          className="inline-flex h-11 items-center justify-center gap-1.5 rounded-lg border border-[#cbd7dc] bg-white px-4 text-sm font-extrabold text-[#294554] hover:border-[#087f80]"
                        >
                          {t.openMission}
                          <ChevronRightIcon className="h-4 w-4" aria-hidden="true" />
                        </Link>
                      ) : null}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </main>
  );
}
