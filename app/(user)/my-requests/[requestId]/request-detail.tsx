"use client";

import Link from "next/link";
import { updateRequest } from "@/app/lib/request-store";
import { useState } from "react";
import {
  ArrowLeftIcon,
  CheckCircleIcon,
  ChatBubbleLeftRightIcon,
  ExclamationTriangleIcon,
  LockClosedIcon,
  LockOpenIcon,
  MapPinIcon,
  PhoneIcon,
  PlusIcon,
  StarIcon,
  UserCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import { useCopyLocale } from "@/app/components/app-shell";
import { ExpiryCountdown } from "@/app/components/expiry-countdown";
import { StatusBadge, UrgencyBadge } from "@/app/components/request-badges";
import {
  approximateCoordinates,
  categoryLabel,
  exactCoordinates,
  isContactUnlocked,
  languageLabel,
  type HelpRequest,
  type RequestStatus,
} from "@/app/lib/mock-requests";

const TIMELINE_STEPS = ["Open", "Claimed", "InProgress", "Completed"] as const;

const copy = {
  en: {
    back: "Back to my requests",
    requestPrefix: "Request",
    created: "Created",
    scheduled: "Appointment",
    timelineTitle: "Progress",
    steps: {
      Open: { title: "Pin is open", detail: "Matching interpreters nearby can see and claim it." },
      Claimed: { title: "Claimed by an interpreter", detail: "Contact details are unlocked for both sides." },
      InProgress: { title: "Work started", detail: "The interpreter marked the job as started." },
      Completed: { title: "Both sides confirmed", detail: "The job closes when you and the interpreter both confirm." },
    },
    detailsTitle: "Request details",
    descriptionLabel: "Notes for the interpreter",
    locationTitle: "Location",
    areaLabel: "Area",
    exactLabel: "Meeting point",
    exactCoordsLabel: "Exact coordinates",
    interpreterViewLabel: "What interpreters see before a claim",
    interpreterViewBody: "Language, category, and area only. The meeting point and coordinates below stay hidden from them until someone claims the request.",
    lockedTitle: "No interpreter yet",
    lockedBody: "Their name, phone number, and extra contact channel appear here as soon as a matching interpreter claims this request.",
    unlockedTitle: "Interpreter contact",
    ratingLabel: "rating",
    jobsLabel: "jobs completed",
    actionsTitle: "Actions",
    cancel: "Cancel request",
    cancelReasonLabel: "Why are you cancelling?",
    cancelReasonHint: "The reason is stored with the request so managers can review it later.",
    cancelReasonMissing: "Add a short reason before cancelling.",
    cancelConfirm: "Confirm cancellation",
    cancelDismiss: "Keep the request",
    confirmDone: "Confirm the work is done",
    confirmDoneHint: "The request closes only after the interpreter confirms as well.",
    yourConfirmation: "You confirmed",
    interpreterConfirmation: "Interpreter confirmed",
    waitingInterpreter: "Waiting for the interpreter to confirm",
    justNow: "Just now",
    completedTitle: "Job completed",
    closedTitle: "This request is closed",
    closedReason: "Reason",
    closedBy: {
      User: "Cancelled by you",
      Interpreter: "Cancelled by the interpreter",
      Manager: "Cancelled by a manager",
      System: "Expired without a claim",
    },
    newRequest: "Create a new request",
    noActions: "No action is needed from you right now.",
  },
  zh: {
    back: "返回我的求助",
    requestPrefix: "求助",
    created: "创建时间",
    scheduled: "预约时间",
    timelineTitle: "进度",
    steps: {
      Open: { title: "求助点开放中", detail: "附近匹配的口译员可以看到并接取。" },
      Claimed: { title: "已被口译员接取", detail: "双方的联系方式已解锁。" },
      InProgress: { title: "工作已开始", detail: "口译员已标记任务开始。" },
      Completed: { title: "双方已确认", detail: "你和口译员都确认后任务才会关闭。" },
    },
    detailsTitle: "求助详情",
    descriptionLabel: "给口译员的说明",
    locationTitle: "位置",
    areaLabel: "区域",
    exactLabel: "碰面地点",
    exactCoordsLabel: "准确坐标",
    interpreterViewLabel: "接取前口译员看到的信息",
    interpreterViewBody: "只有语言、类别和区域。下方的碰面地点和坐标在有人接取之前对他们保持隐藏。",
    lockedTitle: "还没有口译员",
    lockedBody: "只要有匹配的口译员接取这条求助，这里就会显示他们的姓名、电话和其他联系方式。",
    unlockedTitle: "口译员联系方式",
    ratingLabel: "评分",
    jobsLabel: "已完成任务",
    actionsTitle: "可执行操作",
    cancel: "取消求助",
    cancelReasonLabel: "为什么要取消？",
    cancelReasonHint: "取消原因会随求助一起保存，便于管理员日后查看。",
    cancelReasonMissing: "取消前请填写简短原因。",
    cancelConfirm: "确认取消",
    cancelDismiss: "保留这条求助",
    confirmDone: "确认工作已完成",
    confirmDoneHint: "只有口译员也确认后，求助才会关闭。",
    yourConfirmation: "你已确认",
    interpreterConfirmation: "口译员已确认",
    waitingInterpreter: "等待口译员确认",
    justNow: "刚刚",
    completedTitle: "任务已完成",
    closedTitle: "这条求助已关闭",
    closedReason: "原因",
    closedBy: {
      User: "你已取消",
      Interpreter: "口译员已取消",
      Manager: "管理员已取消",
      System: "无人接取已过期",
    },
    newRequest: "创建新的求助",
    noActions: "目前无需你操作。",
  },
} as const;

type StepState = "done" | "current" | "upcoming" | "stopped";

function stepStates(status: RequestStatus): Record<(typeof TIMELINE_STEPS)[number], StepState> {
  const reachedIndex = TIMELINE_STEPS.indexOf(status as (typeof TIMELINE_STEPS)[number]);
  const isClosed = status === "Cancelled" || status === "Expired";

  return TIMELINE_STEPS.reduce(
    (states, step, index) => {
      if (isClosed) {
        states[step] = index === 0 ? "done" : "stopped";
      } else if (status === "Completed" || index < reachedIndex) {
        states[step] = "done";
      } else if (index === reachedIndex) {
        states[step] = "current";
      } else {
        states[step] = "upcoming";
      }

      return states;
    },
    {} as Record<(typeof TIMELINE_STEPS)[number], StepState>,
  );
}

const sectionClass = "border border-[#d6e0e4] bg-white p-5 sm:p-6";
const sectionTitleClass = "text-base font-extrabold text-[#173646]";

export function RequestDetail({ request }: { request: HelpRequest }) {
  const copyLocale = useCopyLocale();
  const t = copy[copyLocale];

  const { status, cancelledBy, cancelReason } = request;
  const [cancelDraft, setCancelDraft] = useState("");
  const [cancelFormOpen, setCancelFormOpen] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const userConfirmedAt = request.userConfirmedDoneAtLabel;

  const interpreterConfirmedAt = request.interpreterConfirmedDoneAtLabel;
  const contactUnlocked = isContactUnlocked(status) && request.interpreter !== null;
  const isClosed = status === "Cancelled" || status === "Expired";
  const states = stepStates(status);

  const stepTimestamps: Record<(typeof TIMELINE_STEPS)[number], string | null> = {
    Open: request.createdAtLabel,
    Claimed: request.claimedAtLabel,
    InProgress: request.startedAtLabel,
    Completed: status === "Completed" ? (userConfirmedAt ?? request.userConfirmedDoneAtLabel) : null,
  };

  function confirmCancellation() {
    if (!cancelDraft.trim()) {
      setCancelError(t.cancelReasonMissing);
      return;
    }

    try {
      updateRequest(request.requestId, "cancel", cancelDraft);
      setCancelError(null);
      setCancelFormOpen(false);
    } catch { setCancelError("Could not save this change. Please try again."); }
  }

  /** BR-05: the request only reaches Completed once both sides confirm. */
  function confirmDone() {
    try { updateRequest(request.requestId, "confirm"); }
    catch { setCancelError("Could not save your confirmation. Please try again."); }
  }

  return (
    <main id="main-content" className="flex-1 px-5 py-8 sm:px-8 lg:px-12 lg:py-10">
      <div className="mx-auto max-w-[1180px]">
        {cancelError && <p role="alert" className="mb-4 text-(--khvi-coral)">{cancelError}</p>}
        <Link
          className="inline-flex items-center gap-2 text-sm font-extrabold text-[#087f80] transition-colors hover:text-[#0a6465]"
          href="/my-requests#main-content"
        >
          <ArrowLeftIcon aria-hidden="true" className="h-4 w-4" />
          {t.back}
        </Link>

        <div className="mt-6 flex flex-wrap items-center gap-2">
          <StatusBadge status={status} copyLocale={copyLocale} />
          <UrgencyBadge urgency={request.urgency} copyLocale={copyLocale} />
          <span className="text-xs font-extrabold text-[#8a9aa0]">
            {t.requestPrefix} #{request.requestId}
          </span>
        </div>

        <h1 className="mt-3 text-3xl font-extrabold tracking-normal text-[#122b3e] sm:text-4xl">
          {categoryLabel(request.categoryId, copyLocale)} · {languageLabel(request.languageId, copyLocale)}
        </h1>

        <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-bold text-[#73848a]">
          <span>
            {t.created}: {request.createdAtLabel}
          </span>
          {request.scheduledAtLabel && (
            <span>
              {t.scheduled}: {request.scheduledAtLabel}
            </span>
          )}
          {status === "Open" && request.expiresAt && (
            <ExpiryCountdown seconds={0} expiresAt={request.expiresAt} copyLocale={copyLocale} compact />
          )}
        </div>

        {isClosed && cancelledBy && (
          <section className="mt-6 border border-[#d6e0e4] bg-[#eef2f4] p-5">
            <h2 className="flex items-center gap-2 text-base font-extrabold text-[#3c5561]">
              <XCircleIcon aria-hidden="true" className="h-5 w-5" />
              {t.closedTitle} · {t.closedBy[cancelledBy]}
            </h2>
            {cancelReason && (
              <p className="mt-2 text-sm leading-7 text-[#52676f]">
                {t.closedReason}: {cancelReason}
              </p>
            )}
            <Link
              className="mt-4 inline-flex h-11 items-center gap-2 rounded-lg border-2 border-[#087f80] bg-white px-4 text-sm font-extrabold text-[#087f80] transition-colors hover:bg-[#edf7f5]"
              href="/request-help#main-content"
            >
              <PlusIcon aria-hidden="true" className="h-5 w-5" />
              {t.newRequest}
            </Link>
          </section>
        )}

        <div className="mt-6 grid items-start gap-5 lg:grid-cols-[1.25fr_0.75fr]">
          <div className="grid gap-5">
            <section className={sectionClass}>
              <h2 className={sectionTitleClass}>{t.timelineTitle}</h2>
              <ol className="mt-5">
                {TIMELINE_STEPS.map((step, index) => {
                  const state = states[step];
                  const timestamp = stepTimestamps[step];
                  const isLast = index === TIMELINE_STEPS.length - 1;

                  return (
                    <li key={step} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <span
                          aria-hidden="true"
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-xs font-extrabold ${
                            state === "done"
                              ? "border-[#087557] bg-[#e6f4ef] text-[#087557]"
                              : state === "current"
                                ? "border-[#087f80] bg-[#087f80] text-white"
                                : state === "stopped"
                                  ? "border-[#d6e0e4] bg-[#eef2f4] text-[#9aa9ae]"
                                  : "border-[#d6e0e4] bg-white text-[#9aa9ae]"
                          }`}
                        >
                          {state === "done" ? <CheckCircleIcon className="h-5 w-5" /> : index + 1}
                        </span>
                        {!isLast && (
                          <span
                            aria-hidden="true"
                            className={`w-0.5 flex-1 ${state === "done" ? "bg-[#87c3ae]" : "bg-[#e3ebef]"}`}
                          />
                        )}
                      </div>

                      <div className={isLast ? "pb-0" : "pb-6"}>
                        <p
                          className={`text-sm font-extrabold ${
                            state === "upcoming" || state === "stopped" ? "text-[#8a9aa0]" : "text-[#203d4d]"
                          }`}
                        >
                          {t.steps[step].title}
                        </p>
                        <p className="mt-1 text-xs leading-6 text-[#73848a]">{t.steps[step].detail}</p>
                        {timestamp && <p className="mt-1 text-xs font-bold text-[#52676f]">{timestamp}</p>}
                      </div>
                    </li>
                  );
                })}
              </ol>

              {status === "Completed" && (
                <div className="mt-2 border-t border-[#e3ebef] pt-4 text-xs font-bold text-[#087557]">
                  <p>
                    {t.yourConfirmation}: {userConfirmedAt}
                  </p>
                  <p className="mt-1">
                    {t.interpreterConfirmation}: {interpreterConfirmedAt}
                  </p>
                </div>
              )}
            </section>

            <section className={sectionClass}>
              <h2 className={sectionTitleClass}>{t.detailsTitle}</h2>
              <p className="mt-4 text-xs font-extrabold text-[#087f80]">{t.descriptionLabel}</p>
              <p className="mt-1.5 text-sm leading-7 text-[#52676f]">{request.description || (copyLocale === "zh" ? "无补充说明" : "No additional notes.")}</p>
            </section>

            <section className={sectionClass}>
              <h2 className={`flex items-center gap-2 ${sectionTitleClass}`}>
                <MapPinIcon aria-hidden="true" className="h-5 w-5 text-[#087f80]" />
                {t.locationTitle}
              </h2>

              <dl className="mt-4 grid gap-x-6 gap-y-4 sm:grid-cols-2">
                <div>
                  <dt className="text-xs font-extrabold text-[#8a9aa0]">{t.areaLabel}</dt>
                  <dd className="mt-1 text-sm font-extrabold text-[#203d4d]">{request.areaName}</dd>
                </div>
                <div>
                  <dt className="text-xs font-extrabold text-[#8a9aa0]">{t.exactCoordsLabel}</dt>
                  <dd className="mt-1 text-sm font-extrabold text-[#203d4d]">{exactCoordinates(request)}</dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-xs font-extrabold text-[#8a9aa0]">{t.exactLabel}</dt>
                  <dd className="mt-1 text-sm font-extrabold text-[#203d4d]">{request.exactAddress}</dd>
                </div>
              </dl>

              {status === "Open" && (
                <div className="mt-5 border-t border-[#e3ebef] pt-4">
                  <p className="flex items-center gap-2 text-xs font-extrabold text-[#b5680b]">
                    <LockClosedIcon aria-hidden="true" className="h-4 w-4" />
                    {t.interpreterViewLabel}
                  </p>
                  <p className="mt-2 text-sm font-extrabold text-[#203d4d]">
                    {request.areaName} · {approximateCoordinates(request)}
                  </p>
                  <p className="mt-1.5 text-xs leading-5 text-[#73848a]">{t.interpreterViewBody}</p>
                </div>
              )}
            </section>
          </div>

          <div className="grid gap-5">
            {contactUnlocked && request.interpreter ? (
              <section className="border border-[#b6ddcd] bg-[#f3faf6] p-5 sm:p-6">
                <h2 className="flex items-center gap-2 text-base font-extrabold text-[#0f3a2c]">
                  <LockOpenIcon aria-hidden="true" className="h-5 w-5" />
                  {t.unlockedTitle}
                </h2>

                <div className="mt-4 flex items-center gap-3">
                  <UserCircleIcon aria-hidden="true" className="h-11 w-11 shrink-0 text-[#087557]" />
                  <div className="min-w-0">
                    <p className="text-base font-extrabold text-[#123a2d]">{request.interpreter.name}</p>
                    <p className="mt-0.5 text-xs font-bold text-[#5c8073]">{request.interpreter.primaryLanguage}</p>
                  </div>
                </div>

                <p className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-bold text-[#3f6357]">
                  <span className="inline-flex items-center gap-1.5">
                    <StarIcon aria-hidden="true" className="h-4 w-4 text-[#e0952f]" />
                    {request.interpreter.averageRating.toFixed(1)} {t.ratingLabel}
                  </span>
                  <span>
                    {request.interpreter.completedJobCount} {t.jobsLabel}
                  </span>
                </p>

                <div className="mt-5 grid gap-2 border-t border-[#c6e3d5] pt-4">
                  <a
                    className="inline-flex h-12 items-center gap-2 rounded-lg bg-(--khvi-navy) px-4 text-sm font-extrabold text-white transition-colors hover:bg-[#0c4960]"
                    href={`tel:${request.interpreter.phone.replace(/\s/g, "")}`}
                  >
                    <PhoneIcon aria-hidden="true" className="h-5 w-5" />
                    {request.interpreter.phone}
                  </a>
                  <p className="inline-flex items-center gap-2 px-1 text-sm font-bold text-[#3f6357]">
                    <ChatBubbleLeftRightIcon aria-hidden="true" className="h-5 w-5 text-[#087557]" />
                    {request.interpreter.extraContact}
                  </p>
                </div>
              </section>
            ) : status === "Open" ? (
              <section className={sectionClass}>
                <h2 className="flex items-center gap-2 text-base font-extrabold text-[#173646]">
                  <LockClosedIcon aria-hidden="true" className="h-5 w-5 text-[#b5680b]" />
                  {t.lockedTitle}
                </h2>
                <p className="mt-3 text-sm leading-7 text-[#64777e]">{t.lockedBody}</p>
              </section>
            ) : null}

            <section className={sectionClass}>
              <h2 className={sectionTitleClass}>{t.actionsTitle}</h2>

              {status === "InProgress" && (
                <div className="mt-4">
                  {userConfirmedAt ? (
                    <div className="border border-[#b6ddcd] bg-[#f3faf6] p-4">
                      <p className="flex items-center gap-2 text-sm font-extrabold text-[#087557]">
                        <CheckCircleIcon aria-hidden="true" className="h-5 w-5" />
                        {t.yourConfirmation}: {userConfirmedAt}
                      </p>
                      <p className="mt-2 text-xs leading-5 text-[#3f6357]">{t.waitingInterpreter}</p>
                    </div>
                  ) : (
                    <>
                      <button
                        type="button"
                        className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#087f80] px-4 text-sm font-extrabold text-white transition-colors hover:bg-[#096f70]"
                        onClick={confirmDone}
                      >
                        <CheckCircleIcon aria-hidden="true" className="h-5 w-5" />
                        {t.confirmDone}
                      </button>
                      <p className="mt-2 text-xs leading-5 text-[#73848a]">{t.confirmDoneHint}</p>
                    </>
                  )}
                </div>
              )}

              {(status === "Open" || status === "Claimed") && (
                <div className="mt-4">
                  {cancelFormOpen ? (
                    <div>
                      <label className="block text-sm font-extrabold text-[#294554]" htmlFor="cancel-reason">
                        {t.cancelReasonLabel}
                      </label>
                      <textarea
                        id="cancel-reason"
                        rows={3}
                        maxLength={300}
                        className="mt-2 w-full resize-y rounded-lg border border-[#cbd7dc] bg-white px-3.5 py-3 text-sm font-semibold text-(--khvi-ink)"
                        value={cancelDraft}
                        aria-describedby="cancel-reason-hint"
                        aria-invalid={Boolean(cancelError)}
                        onChange={(event) => setCancelDraft(event.target.value)}
                      />
                      <p className="mt-1.5 text-xs leading-5 text-[#73848a]" id="cancel-reason-hint">
                        {t.cancelReasonHint}
                      </p>
                      {cancelError && (
                        <p role="alert" className="mt-2 flex items-start gap-2 text-xs font-bold leading-5 text-[#c33a2a]">
                          <ExclamationTriangleIcon aria-hidden="true" className="h-4 w-4 shrink-0" />
                          {cancelError}
                        </p>
                      )}
                      <div className="mt-4 grid gap-2">
                        <button
                          type="button"
                          className="flex h-12 items-center justify-center gap-2 rounded-lg bg-(--khvi-coral) px-4 text-sm font-extrabold text-white transition-colors hover:bg-[#d94334]"
                          onClick={confirmCancellation}
                        >
                          <XCircleIcon aria-hidden="true" className="h-5 w-5" />
                          {t.cancelConfirm}
                        </button>
                        <button
                          type="button"
                          className="flex h-12 items-center justify-center rounded-lg border border-[#cbd7dc] bg-white px-4 text-sm font-extrabold text-[#173646] transition-colors hover:border-[#087f80] hover:text-[#087f80]"
                          onClick={() => {
                            setCancelFormOpen(false);
                            setCancelError(null);
                          }}
                        >
                          {t.cancelDismiss}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      className="flex h-12 w-full items-center justify-center gap-2 rounded-lg border-2 border-[#f6b8ae] bg-white px-4 text-sm font-extrabold text-[#c33a2a] transition-colors hover:bg-[#fff6f4]"
                      onClick={() => setCancelFormOpen(true)}
                    >
                      <XCircleIcon aria-hidden="true" className="h-5 w-5" />
                      {t.cancel}
                    </button>
                  )}
                </div>
              )}

              {(status === "Completed" || isClosed) && (
                <p className="mt-4 text-sm leading-7 text-[#64777e]">
                  {status === "Completed" ? t.completedTitle : t.noActions}
                </p>
              )}
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
