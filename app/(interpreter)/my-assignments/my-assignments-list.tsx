"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  CheckCircleIcon,
  ClipboardDocumentListIcon,
  MapPinIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";
import { useCopyLocale } from "@/app/components/app-shell";
import { ExpiryCountdown } from "@/app/components/expiry-countdown";
import { StatusBadge, UrgencyBadge } from "@/app/components/request-badges";
import { WorkspaceBreadcrumbs } from "@/app/components/workspace-breadcrumbs";
import { cancelBookingAction, claimBookingAction } from "@/app/actions/booking-actions";
import type { ApplicationStatus } from "@/app/lib/interpreter-application";
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
    breadcrumb: "Breadcrumb",
    main: "Main",
    label: "Interpreter workspace",
    title: "My assignments",
    intro: "Claim matching requests and track the assignments you are handling.",
    findRequests: "Find requests",
    availableTitle: "Available requests",
    availableBody: "These open requests match the languages and service categories approved for your interpreter profile.",
    availableCount: (count: number) => `${count} available ${count === 1 ? "request" : "requests"}`,
    claimRequest: "Claim request",
    claiming: "Claiming…",
    claimFallback: "This request could not be claimed. Refresh the list and try again.",
    claimSuccessTitle: "Request claimed",
    claimSuccessBody: "The request is now listed under your assignments.",
    openClaimedMission: "Open claimed mission",
    noAvailableTitle: "No matching requests available",
    noAvailableBody: "New requests will appear here when their language and category match your approved profile.",
    approvalTitle: "Approval is required before you can claim work",
    approvalMissingBody: "Complete your interpreter application with at least one language and one service category.",
    approvalPendingBody: "Your application is waiting for review. Matching requests will appear after approval.",
    approvalRevisionBody: "Review the manager's note and update your application before claiming work.",
    approvalRejectedBody: "Review the application decision before submitting updated information.",
    startApplication: "Start interpreter application",
    viewApplicationStatus: "View application status",
    assignmentsTitle: "Your assignments",
    filterLabel: "Filter assignments by status",
    filters: { all: "All", claimed: "Claimed", "in-progress": "In progress", completed: "Completed" },
    created: "Created",
    scheduled: "Appointment",
    area: "Area",
    openMission: "Open mission",
    cancelAssignment: "Cancel assignment",
    cancelReasonLabel: "Why are you cancelling?",
    cancelReasonPlaceholder: "Add a short reason",
    cancelReasonHint: "Claimed work returns to the request pool. Work already started will be cancelled.",
    cancelReasonMissing: "Add a short reason before cancelling.",
    cancelConfirm: "Confirm cancellation",
    cancelDismiss: "Keep assignment",
    cancelFallback: "Could not cancel this assignment. Please try again.",
    next: { Claimed: "Await requester confirmation", InProgress: "Continue assignment", Completed: "Assignment completed" },
    emptyTitle: "No assignments yet",
    emptyBody: "Claimed requests will appear here. Open Find requests when you are ready to help.",
    loading: "Loading your assignments…",
  },
  zh: {
    breadcrumb: "面包屑导航",
    main: "主页",
    label: "口译员工作区",
    title: "我的任务",
    intro: "接取符合条件的求助，并跟踪你正在处理的任务。",
    findRequests: "查找求助",
    availableTitle: "可接取的求助",
    availableBody: "这些开放求助符合你已批准的语言和服务类别。",
    availableCount: (count: number) => `${count} 个可接任务`,
    claimRequest: "接取任务",
    claiming: "正在接取…",
    claimFallback: "无法接取此任务，请刷新列表后重试。",
    claimSuccessTitle: "任务已接取",
    claimSuccessBody: "此任务现已显示在你的任务列表中。",
    openClaimedMission: "打开已接任务",
    noAvailableTitle: "暂无匹配的求助",
    noAvailableBody: "当新求助的语言和类别符合你已批准的资料时，会显示在这里。",
    approvalTitle: "获得批准后才能接取任务",
    approvalMissingBody: "请完成口译员申请，并至少选择一种语言和一个服务类别。",
    approvalPendingBody: "你的申请正在等待审核，批准后会显示匹配的求助。",
    approvalRevisionBody: "请查看管理员的说明并更新申请，然后才能接取任务。",
    approvalRejectedBody: "请查看申请结果，再提交更新后的资料。",
    startApplication: "开始口译员申请",
    viewApplicationStatus: "查看申请状态",
    assignmentsTitle: "你的任务",
    filterLabel: "按状态筛选任务",
    filters: { all: "全部", claimed: "已接取", "in-progress": "进行中", completed: "已完成" },
    created: "创建时间",
    scheduled: "预约时间",
    area: "区域",
    openMission: "进入任务",
    cancelAssignment: "取消任务",
    cancelReasonLabel: "为什么要取消？",
    cancelReasonPlaceholder: "请填写简短原因",
    cancelReasonHint: "已接取的任务会返回求助池；已经开始的任务会被取消。",
    cancelReasonMissing: "取消前请填写简短原因。",
    cancelConfirm: "确认取消",
    cancelDismiss: "保留任务",
    cancelFallback: "无法取消此任务，请重试。",
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

export function MyAssignmentsList({
  activeFilter,
  applicationStatus,
  initialAssignments,
  initialAvailableRequests,
}: {
  activeFilter: StatusFilterId;
  applicationStatus: ApplicationStatus | null;
  initialAssignments: HelpRequest[];
  initialAvailableRequests: HelpRequest[];
}) {
  const router = useRouter();
  const allRequests = initialAssignments;
  const copyLocale = useCopyLocale();
  const t = copy[copyLocale];
  const [selectedFilter, setSelectedFilter] = useState<AssignmentFilterId>(() => normalizeFilter(activeFilter));
  const [claimingId, setClaimingId] = useState<string | null>(null);
  const [claimedRequestId, setClaimedRequestId] = useState<string | null>(null);
  const [claimError, setClaimError] = useState<{ requestId: string; message: string } | null>(null);
  const [claimSuccessId, setClaimSuccessId] = useState<string | null>(null);
  const [cancelRequestId, setCancelRequestId] = useState<string | null>(null);
  const [cancelDraft, setCancelDraft] = useState("");
  const [cancelError, setCancelError] = useState<string | null>(null);
  const allAssignments = allRequests.filter((request) => ["Claimed", "InProgress", "Completed"].includes(request.status));
  const matching = (filterId: AssignmentFilterId) => {
    const status = assignmentStatus(filterId);
    return allAssignments.filter((request) => status === null || request.status === status);
  };
  const assignments = matching(selectedFilter);
  const counts = Object.fromEntries(ASSIGNMENT_FILTERS.map((filterId) => [filterId, matching(filterId).length]));
  const availableRequests = initialAvailableRequests.filter(
    (request) => request.status === "Open" && request.requestId !== claimedRequestId,
  );
  const applicationApproved = applicationStatus === "approved";
  const approvalBody = applicationStatus === null
    ? t.approvalMissingBody
    : applicationStatus === "needs_revision"
      ? t.approvalRevisionBody
      : applicationStatus === "rejected"
        ? t.approvalRejectedBody
        : t.approvalPendingBody;

  async function handleClaimRequest(requestId: string) {
    setClaimingId(requestId);
    setClaimError(null);
    setClaimSuccessId(null);

    const result = await claimBookingAction(requestId);
    if (result.ok) {
      setClaimedRequestId(requestId);
      setClaimSuccessId(requestId);
      setClaimingId(null);
      router.refresh();
      return;
    }

    setClaimError({ requestId, message: result.error || t.claimFallback });
    setClaimingId(null);
    router.refresh();
  }

  function openCancelForm(requestId: string) {
    setCancelRequestId(requestId);
    setCancelDraft("");
    setCancelError(null);
  }

  function closeCancelForm() {
    setCancelRequestId(null);
    setCancelDraft("");
    setCancelError(null);
  }

  async function handleCancelAssignment(requestId: string) {
    if (!cancelDraft.trim()) {
      setCancelError(t.cancelReasonMissing);
      return;
    }
    const result = await cancelBookingAction(requestId, cancelDraft);
    if (result.ok) {
      closeCancelForm();
      window.location.reload();
    } else {
      setCancelError(result.error || t.cancelFallback);
    }
  }

  return (
    <main id="main-content" className="flex-1 px-5 py-8 sm:px-8 lg:px-12 lg:py-10">
      <div className="mx-auto max-w-[1180px]">
        <WorkspaceBreadcrumbs
          ariaLabel={t.breadcrumb}
          currentLabel={t.title}
          homeHref="/welcome#welcome-Interpreter"
          homeLabel={t.main}
        />

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

        <section className="mt-7" aria-labelledby="available-requests-title">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 id="available-requests-title" className="text-xl font-extrabold text-[#173646]">{t.availableTitle}</h2>
              <p className="mt-1 max-w-2xl text-sm leading-6 text-[#64777e]">{t.availableBody}</p>
            </div>
            {applicationApproved && (
              <span className="text-xs font-extrabold text-[#64777e]" aria-live="polite">
                {t.availableCount(availableRequests.length)}
              </span>
            )}
          </div>

          {!applicationApproved ? (
            <div className="mt-4 flex flex-col gap-4 border-l-4 border-[#f0a35f] bg-white p-5 shadow-[0_8px_24px_rgba(16,40,58,0.06)] sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <ShieldCheckIcon aria-hidden="true" className="mt-0.5 h-6 w-6 shrink-0 text-[#b8752b]" />
                <div>
                  <h3 className="text-base font-extrabold text-[#173646]">{t.approvalTitle}</h3>
                  <p className="mt-1.5 max-w-2xl text-sm leading-6 text-[#64777e]">{approvalBody}</p>
                </div>
              </div>
              {applicationStatus !== null && (
                <Link
                  href="/volunteer/status#main-content"
                  className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-lg bg-(--khvi-navy) px-4 py-2 text-sm font-extrabold text-white transition-colors hover:bg-[#0c4960] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-(--khvi-sun)"
                >
                  {t.viewApplicationStatus}
                </Link>
              )}
            </div>
          ) : availableRequests.length === 0 ? (
            <div className="mt-4 border border-[#d6e0e4] bg-white p-6 text-center" aria-live="polite">
              <ClipboardDocumentListIcon aria-hidden="true" className="mx-auto h-8 w-8 text-[#9aa9ae]" />
              <h3 className="mt-3 text-base font-extrabold text-[#203d4d]">{t.noAvailableTitle}</h3>
              <p className="mx-auto mt-1.5 max-w-lg text-sm leading-6 text-[#64777e]">{t.noAvailableBody}</p>
            </div>
          ) : (
            <ul className="mt-4 grid gap-3">
              {availableRequests.map((request) => {
                const error = claimError?.requestId === request.requestId ? claimError.message : null;
                const errorId = `claim-error-${request.requestId}`;

                return (
                  <li key={request.requestId}>
                    <article className="border border-l-4 border-[#d6e0e4] border-l-(--khvi-teal) bg-white p-5 shadow-[0_8px_24px_rgba(16,40,58,0.05)]">
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <StatusBadge status={request.status} copyLocale={copyLocale} />
                            <UrgencyBadge urgency={request.urgency} copyLocale={copyLocale} />
                          </div>
                          <h3 className="mt-3 text-lg font-extrabold text-[#173646]">
                            {categoryLabel(request.categoryId, copyLocale)} · {languageLabel(request.languageId, copyLocale)}
                          </h3>
                          <p className="mt-2 line-clamp-2 max-w-3xl break-words text-sm leading-6 text-[#52676f]">{request.description}</p>
                          <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-bold text-[#73848a]">
                            <span className="inline-flex items-center gap-1.5">
                              <MapPinIcon aria-hidden="true" className="h-4 w-4 text-[#087f80]" />
                              {t.area}: {request.areaName}
                            </span>
                            <span>{t.created}: {request.createdAtLabel}</span>
                            {request.scheduledAtLabel && <span>{t.scheduled}: {request.scheduledAtLabel}</span>}
                            {request.expiresAt && (
                              <ExpiryCountdown seconds={0} expiresAt={request.expiresAt} copyLocale={copyLocale} compact />
                            )}
                          </div>
                        </div>
                        <button
                          type="button"
                          disabled={claimingId !== null}
                          aria-describedby={error ? errorId : undefined}
                          onClick={() => void handleClaimRequest(request.requestId)}
                          className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-lg bg-(--khvi-navy) px-5 py-2 text-sm font-extrabold text-white transition-colors hover:bg-[#0c4960] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-(--khvi-sun) disabled:cursor-wait disabled:opacity-60"
                        >
                          {claimingId === request.requestId ? t.claiming : t.claimRequest}
                        </button>
                      </div>
                      {error && <p id={errorId} role="alert" className="mt-3 border-t border-[#f1d2cd] pt-3 text-sm font-bold text-(--khvi-coral)">{error}</p>}
                    </article>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {claimSuccessId && (
          <section className="mt-5 flex flex-col gap-3 border border-[#b7d9d2] bg-[#eef8f5] p-4 sm:flex-row sm:items-center sm:justify-between" role="status" aria-live="polite">
            <div className="flex items-start gap-3">
              <CheckCircleIcon aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-[#2b8177]" />
              <div>
                <p className="text-sm font-extrabold text-[#205f5a]">{t.claimSuccessTitle}</p>
                <p className="mt-1 text-xs leading-5 text-[#4c7774]">{t.claimSuccessBody}</p>
              </div>
            </div>
            <Link
              href={`/my-requests/${claimSuccessId}#main-content`}
              className="inline-flex min-h-10 items-center justify-center rounded-lg border border-[#6aa99f] px-4 py-2 text-xs font-extrabold text-[#205f5a] transition-colors hover:bg-white focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-(--khvi-sun)"
            >
              {t.openClaimedMission}
            </Link>
          </section>
        )}

        <h2 className="mt-8 text-xl font-extrabold text-[#173646]">{t.assignmentsTitle}</h2>
        <div role="group" aria-label={t.filterLabel} className="mt-3 flex flex-wrap gap-2">
          {ASSIGNMENT_FILTERS.map((filterId) => {
            const isActive = filterId === selectedFilter;
            const href = filterId === "all" ? "/my-assignments#main-content" : `/my-assignments?status=${filterId}#main-content`;

            return (
              <button
                key={filterId}
                type="button"
                aria-pressed={isActive}
                aria-controls="assignment-results"
                onClick={() => {
                  closeCancelForm();
                  setSelectedFilter(filterId);
                  window.history.replaceState(null, "", href);
                }}
                className={`inline-flex items-center gap-2 rounded-lg border px-3.5 py-2 text-xs font-extrabold transition-colors focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-(--khvi-sun) ${
                  isActive
                    ? "border-[#092f45] bg-(--khvi-navy) text-white"
                    : "border-[#cbd7dc] bg-white text-[#425761] hover:border-[#087f80] hover:text-[#087f80]"
                }`}
              >
                {t.filters[filterId]}
                <span className={isActive ? "text-white/70" : "text-[#8a9aa0]"}>{counts[filterId] ?? 0}</span>
              </button>
            );
          })}
        </div>

        {assignments.length === 0 ? (
          <section id="assignment-results" aria-live="polite" className="mt-6 border border-[#d6e0e4] bg-white p-10 text-center">
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
          <ul id="assignment-results" aria-live="polite" className="mt-6 grid gap-3">
            {assignments.map((request) => (
              <li key={request.requestId}>
                <article className="flex flex-col gap-4 border border-[#d6e0e4] bg-white p-5 lg:flex-row lg:items-center lg:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge status={request.status} copyLocale={copyLocale} />
                      <UrgencyBadge urgency={request.urgency} copyLocale={copyLocale} />
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
                  <div className="flex shrink-0 flex-col gap-3 border-t border-[#eef2f4] pt-4 lg:w-80 lg:border-t-0 lg:pt-0">
                    <span className="text-xs font-extrabold text-[#425761]">{t.next[request.status as keyof typeof t.next]}</span>
                    <div className={`grid gap-2 ${request.status === "Claimed" || request.status === "InProgress" ? "grid-cols-2" : "grid-cols-1"}`}>
                      <Link
                        href={`/my-requests/${request.requestId}`}
                        className="inline-flex min-h-11 items-center justify-center rounded-lg bg-(--khvi-navy) px-3 py-2 text-center text-sm font-extrabold text-white transition-colors hover:bg-[#0c4960] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-(--khvi-sun)"
                      >
                        {t.openMission}
                      </Link>
                      {(request.status === "Claimed" || request.status === "InProgress") && (
                        <button
                          type="button"
                          aria-expanded={cancelRequestId === request.requestId}
                          aria-controls={`cancel-assignment-${request.requestId}`}
                          onClick={() => cancelRequestId === request.requestId ? closeCancelForm() : openCancelForm(request.requestId)}
                          className="inline-flex min-h-11 items-center justify-center rounded-lg border-2 border-(--khvi-coral) px-3 py-2 text-sm font-extrabold text-(--khvi-coral) transition-colors hover:bg-[#fff6f4] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-(--khvi-sun)"
                        >
                          {t.cancelAssignment}
                        </button>
                      )}
                    </div>
                    {cancelRequestId === request.requestId && (
                      <form
                        id={`cancel-assignment-${request.requestId}`}
                        className="border-t border-[#e3e9ec] pt-3"
                        onSubmit={(event) => {
                          event.preventDefault();
                          handleCancelAssignment(request.requestId);
                        }}
                      >
                        <label className="block text-sm font-extrabold text-[#294554]" htmlFor={`cancel-reason-${request.requestId}`}>
                          {t.cancelReasonLabel}
                        </label>
                        <textarea
                          id={`cancel-reason-${request.requestId}`}
                          rows={3}
                          maxLength={300}
                          autoFocus
                          value={cancelDraft}
                          placeholder={t.cancelReasonPlaceholder}
                          aria-describedby={`cancel-reason-hint-${request.requestId}`}
                          aria-invalid={Boolean(cancelError)}
                          onChange={(event) => {
                            setCancelDraft(event.target.value);
                            setCancelError(null);
                          }}
                          className="mt-2 w-full resize-y rounded-lg border border-[#b9c8ce] bg-white px-3 py-2 text-sm text-(--khvi-ink) outline-none transition-colors placeholder:text-[#87969c] focus:border-[#087f80] focus:ring-2 focus:ring-[#087f80]/20"
                        />
                        <p id={`cancel-reason-hint-${request.requestId}`} className="mt-1.5 text-xs leading-5 text-[#73848a]">
                          {t.cancelReasonHint}
                        </p>
                        {cancelError && <p role="alert" className="mt-2 text-xs font-bold text-(--khvi-coral)">{cancelError}</p>}
                        <div className="mt-3 grid grid-cols-2 gap-2">
                          <button
                            type="submit"
                            className="inline-flex min-h-10 items-center justify-center rounded-lg bg-(--khvi-coral) px-3 py-2 text-xs font-extrabold text-white transition-colors hover:bg-[#d94334] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-(--khvi-sun)"
                          >
                            {t.cancelConfirm}
                          </button>
                          <button
                            type="button"
                            onClick={closeCancelForm}
                            className="inline-flex min-h-10 items-center justify-center rounded-lg border border-[#b9c8ce] bg-white px-3 py-2 text-xs font-extrabold text-[#425761] transition-colors hover:border-[#087f80] hover:text-[#087f80] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-(--khvi-sun)"
                          >
                            {t.cancelDismiss}
                          </button>
                        </div>
                      </form>
                    )}
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
