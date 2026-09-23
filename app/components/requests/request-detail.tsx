"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  cancelBookingAction,
  confirmBookingCompletionAction,
  confirmBookingInterpreterAction,
  saveMissionLocationAction,
  startBookingAction,
  updateBookingDetailsAction,
} from "@/app/actions/booking-actions";
import type { RealMissionLocations } from "@/app/lib/real-request-data";
import type { UserProfile } from "@/app/lib/mock-auth";
import { useEffect, useState, type SubmitEvent } from "react";
import {
  ArrowPathIcon,
  CheckCircleIcon,
  ChatBubbleLeftRightIcon,
  ExclamationTriangleIcon,
  LockClosedIcon,
  LockOpenIcon,
  MapPinIcon,
  PencilSquareIcon,
  PhoneIcon,
  PlusIcon,
  StarIcon,
  UserCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import { useCopyLocale } from "@/app/components/app-shell";
import { ExpiryCountdown } from "@/app/components/expiry-countdown";
import { MissionLocationMap, type MissionMapPoint } from "@/app/components/mission-location-map";
import { StatusBadge, UrgencyBadge } from "@/app/components/request-badges";
import { ReviewModal, type SubmittedReview } from "@/app/components/review/review-modal";
import { WorkspaceBreadcrumbs } from "@/app/components/workspace-breadcrumbs";
import {
  approximateCoordinates,
  categoryLabel,
  exactCoordinates,
  isContactUnlocked,
  languageLabel,
  CATEGORIES,
  LANGUAGES,
  type CategoryId,
  type HelpRequest,
  type LanguageId,
  type RequestStatus,
} from "@/app/lib/mock-requests";

const TIMELINE_STEPS = ["Open", "Claimed", "InProgress", "Completed"] as const;

const copy = {
  en: {
    breadcrumb: "Request detail breadcrumb",
    main: "Main",
    requestsLabel: "My requests",
    assignmentsLabel: "My assignments",
    requesterView: "Requester mission room",
    interpreterView: "Interpreter mission room",
    created: "Created",
    scheduled: "Appointment",
    timelineTitle: "Progress",
    steps: {
      Open: { title: "Pin is open", detail: "Matching interpreters nearby can see and claim it." },
      Claimed: { title: "Claimed by an interpreter", detail: "The requester reviews and confirms the assigned interpreter." },
      InProgress: { title: "Work started", detail: "The interpreter marked the job as started." },
      Completed: { title: "Both sides confirmed", detail: "The job closes when you and the interpreter both confirm." },
    },
    detailsTitle: "Request details",
    editDetails: "Edit request details",
    editHint: "You can edit this request until the interpreter starts work.",
    languageLabel: "Language needed",
    categoryLabel: "Category",
    descriptionLabel: "Notes for the interpreter",
    descriptionHint: "Add any context that helps the interpreter prepare. Optional.",
    meetingPointLabel: "Meeting point",
    meetingPointRequired: "Add a meeting point before saving.",
    saveDetails: "Save changes",
    discardDetails: "Discard changes",
    detailsSaved: "Request details updated.",
    locationTitle: "Location",
    areaLabel: "Area",
    exactLabel: "Meeting point",
    exactCoordsLabel: "Exact coordinates",
    interpreterViewLabel: "What interpreters see before requester confirmation",
    interpreterViewBody: "Language, category, and area only. The meeting point and coordinates stay hidden until you confirm the assigned interpreter.",
    lockedTitle: "No interpreter yet",
    lockedBody: "A matching interpreter's profile appears here after they claim the request. Contact details unlock after you confirm them.",
    unlockedTitle: "Interpreter contact",
    requesterContactTitle: "Requester contact",
    extraContactLabel: "Other contact",
    contactLockedTitle: "Contact and exact location are locked",
    contactLockedBody: "The requester must confirm the assigned interpreter before sensitive details appear.",
    mapTitle: "Requester and interpreter map",
    mapIntro: "Each marker updates from that person's live location while this mission page is open.",
    requesterMarker: "Requester",
    interpreterMarker: "Interpreter",
    youMarker: "You",
    coordinatesMapLabel: "Coordinates",
    accuracyMapLabel: "Accuracy",
    updatedMapLabel: "Updated",
    expandMapLabel: "Open full-screen map",
    collapseMapLabel: "Close full-screen map",
    touchZoomLabel: "Drag the map or pinch with two fingers to zoom.",
    liveGpsLabel: "Live GPS",
    requestLocationLabel: "Request location",
    readingLocation: "Starting live location…",
    locationSaved: "Live location is on",
    locationDenied: "Location permission was denied. Allow location access in your browser, then reload this page.",
    locationUnavailable: "Live location is unavailable right now.",
    locationFailed: "Could not save your location. Please try again.",
    mapEmpty: "Waiting for your live location. Allow location access when your browser asks.",
    otherLocationLocked: "The other person's exact marker unlocks after the requester confirms the interpreter.",
    waitingRequesterLocation: "Waiting for the requester's live location.",
    waitingInterpreterLocation: "Waiting for the interpreter's live location.",
    ratingLabel: "rating",
    jobsLabel: "jobs completed",
    actionsTitle: "Actions",
    confirmInterpreter: "Confirm this interpreter",
    confirmInterpreterHint: "Confirm the profile before contact details unlock and work can start.",
    interpreterConfirmed: "Interpreter confirmed",
    startWork: "Start work",
    waitingForRequester: "Waiting for the requester to confirm you",
    withdraw: "Cancel assignment",
    cancel: "Cancel request",
    cancelReasonLabel: "Why are you cancelling?",
    cancelReasonHint: "The reason is stored with the request so managers can review it later.",
    cancelReasonMissing: "Add a short reason before cancelling.",
    cancelConfirm: "Confirm cancellation",
    cancelDismiss: "Keep the request",
    confirmDone: "Confirm the work is done",
    confirmDoneHint: "The request closes only after both sides confirm the work is done.",
    yourConfirmation: "You confirmed",
    requesterConfirmation: "Requester confirmed",
    interpreterConfirmation: "Interpreter confirmed",
    waitingInterpreter: "Waiting for the interpreter to confirm",
    waitingOtherSide: "Waiting for the other side to confirm",
    justNow: "Just now",
    completedTitle: "Job completed",
    reviewTitle: "Tell us about this completed job",
    reviewCta: "Review interpreter",
    reviewHint: "A quick rating helps us recognise reliable language support.",
    reviewSubmitted: "Review submitted",
    reviewReceived: "Requester review",
    reviewPending: "The requester has not reviewed this completed job yet.",
    reviewSubmittedAt: "Submitted",
    reviewReadOnly: "Your feedback is shown here as a read-only preview.",
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
    breadcrumb: "求助详情面包屑导航",
    main: "主页",
    requestsLabel: "我的求助",
    assignmentsLabel: "我的任务",
    requesterView: "求助者任务室",
    interpreterView: "口译员任务室",
    created: "创建时间",
    scheduled: "预约时间",
    timelineTitle: "进度",
    steps: {
      Open: { title: "求助点开放中", detail: "附近匹配的口译员可以看到并接取。" },
      Claimed: { title: "已被口译员接取", detail: "求助者核对并确认已分配的口译员。" },
      InProgress: { title: "工作已开始", detail: "口译员已标记任务开始。" },
      Completed: { title: "双方已确认", detail: "你和口译员都确认后任务才会关闭。" },
    },
    detailsTitle: "求助详情",
    editDetails: "编辑求助详情",
    editHint: "口译员开始工作前，你可以编辑这条求助。",
    languageLabel: "需要的语言",
    categoryLabel: "类别",
    descriptionLabel: "给口译员的说明",
    descriptionHint: "填写有助于口译员准备的信息。可选填。",
    meetingPointLabel: "碰面地点",
    meetingPointRequired: "保存前请填写碰面地点。",
    saveDetails: "保存更改",
    discardDetails: "放弃更改",
    detailsSaved: "求助详情已更新。",
    locationTitle: "位置",
    areaLabel: "区域",
    exactLabel: "碰面地点",
    exactCoordsLabel: "准确坐标",
    interpreterViewLabel: "求助者确认前口译员看到的信息",
    interpreterViewBody: "只有语言、类别和区域。碰面地点和坐标在你确认已分配的口译员之前保持隐藏。",
    lockedTitle: "还没有口译员",
    lockedBody: "匹配的口译员接取后，这里会显示其资料；你确认后才会解锁联系方式。",
    unlockedTitle: "口译员联系方式",
    requesterContactTitle: "求助者联系方式",
    extraContactLabel: "其他联系方式",
    contactLockedTitle: "联系方式和准确位置尚未解锁",
    contactLockedBody: "求助者确认已接单的口译员后，系统才会显示敏感信息。",
    mapTitle: "求助者与口译员地图",
    mapIntro: "任务页面打开期间，每个标记都会根据本人的实时位置更新。",
    requesterMarker: "求助者",
    interpreterMarker: "口译员",
    youMarker: "你",
    coordinatesMapLabel: "坐标",
    accuracyMapLabel: "精度",
    updatedMapLabel: "更新时间",
    expandMapLabel: "全屏查看地图",
    collapseMapLabel: "关闭全屏地图",
    touchZoomLabel: "拖动地图，或用双指缩放。",
    liveGpsLabel: "实时 GPS",
    requestLocationLabel: "求助位置",
    readingLocation: "正在启动实时位置…",
    locationSaved: "实时位置已开启",
    locationDenied: "位置权限被拒绝。请在浏览器中允许位置访问，然后重新加载此页面。",
    locationUnavailable: "实时位置当前不可用。",
    locationFailed: "无法保存你的位置，请重试。",
    mapEmpty: "正在等待你的实时位置。浏览器询问时请允许位置访问。",
    otherLocationLocked: "求助者确认口译员后，才会解锁对方的准确位置标记。",
    waitingRequesterLocation: "正在等待求助者的实时位置。",
    waitingInterpreterLocation: "正在等待口译员的实时位置。",
    ratingLabel: "评分",
    jobsLabel: "已完成任务",
    actionsTitle: "可执行操作",
    confirmInterpreter: "确认这位口译员",
    confirmInterpreterHint: "确认资料后，双方才可查看联系方式并开始任务。",
    interpreterConfirmed: "已确认口译员",
    startWork: "开始任务",
    waitingForRequester: "等待求助者确认你",
    withdraw: "取消任务",
    cancel: "取消求助",
    cancelReasonLabel: "为什么要取消？",
    cancelReasonHint: "取消原因会随求助一起保存，便于管理员日后查看。",
    cancelReasonMissing: "取消前请填写简短原因。",
    cancelConfirm: "确认取消",
    cancelDismiss: "保留这条求助",
    confirmDone: "确认工作已完成",
    confirmDoneHint: "只有双方都确认工作完成后，求助才会关闭。",
    yourConfirmation: "你已确认",
    requesterConfirmation: "求助者已确认",
    interpreterConfirmation: "口译员已确认",
    waitingInterpreter: "等待口译员确认",
    waitingOtherSide: "等待另一方确认",
    justNow: "刚刚",
    completedTitle: "任务已完成",
    reviewTitle: "评价这次已完成的任务",
    reviewCta: "评价口译员",
    reviewHint: "简短的评分可以帮助社区认可可靠的语言支持。",
    reviewSubmitted: "评价已提交",
    reviewReceived: "求助者评价",
    reviewPending: "求助者尚未评价这次已完成的任务。",
    reviewSubmittedAt: "提交时间",
    reviewReadOnly: "你的反馈会以只读预览显示在这里。",
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

export function RequestDetail({
  request,
  viewer,
  initialMissionLocations = {},
}: { request: HelpRequest; viewer: UserProfile; initialMissionLocations?: RealMissionLocations }) {
  const router = useRouter();
  const pathname = usePathname();
  const copyLocale = useCopyLocale();
  const t = copy[copyLocale];
  const isInterpreter = viewer.role === "Interpreter";
  const accountBase = pathname.startsWith("/interpreter") ? "/interpreter" : "/user";
  const assignmentBase = "/interpreter/my-assignments";
  const requesterBase = `${accountBase}/my-requests`;

  const { status, cancelledBy, cancelReason } = request;
  const [cancelDraft, setCancelDraft] = useState("");
  const [cancelFormOpen, setCancelFormOpen] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [editFormOpen, setEditFormOpen] = useState(false);
  const [editLanguageId, setEditLanguageId] = useState<LanguageId>(request.languageId);
  const [editCategoryId, setEditCategoryId] = useState<CategoryId>(request.categoryId);
  const [editDescription, setEditDescription] = useState(request.description);
  const [editMeetingPoint, setEditMeetingPoint] = useState(request.exactAddress);
  const [editError, setEditError] = useState<string | null>(null);
  const [editSuccess, setEditSuccess] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [submittedReview, setSubmittedReview] = useState<SubmittedReview | null>(null);
  const [locationState, setLocationState] = useState<"loading" | "saved" | "denied" | "unavailable" | "error">("loading");
  const [missionLocations, setMissionLocations] = useState<RealMissionLocations>(initialMissionLocations);
  const userConfirmedAt = request.userConfirmedDoneAtLabel;

  const interpreterConfirmedAt = request.interpreterConfirmedDoneAtLabel;
  const viewerConfirmedAt = isInterpreter ? interpreterConfirmedAt : userConfirmedAt;
  const existingReview = request.review
    ? { rating: request.review.rating, comment: request.review.comment ?? "" }
    : null;
  const reviewPreview = submittedReview ?? existingReview;
  const contactUnlocked = isContactUnlocked(status) && Boolean(request.requesterConfirmedAtLabel);
  const canSeeSensitiveLocation = !isInterpreter || contactUnlocked;
  const isClosed = status === "Cancelled" || status === "Expired";
  const canCancel = isInterpreter
    ? status === "Claimed" || status === "InProgress"
    : !["Completed", "Cancelled", "Expired"].includes(status);
  const canEdit = !isInterpreter && (status === "Open" || status === "Claimed");
  const canTrackLocation = !isClosed && status !== "Completed";
  const states = stepStates(status);

  const savedRequesterLocation = missionLocations.requester
    && (!request.requester || missionLocations.requester.actorId === request.requester.userId)
    ? missionLocations.requester
    : null;
  const savedInterpreterLocation = missionLocations.interpreter
    && missionLocations.interpreter.actorId === request.interpreterId
    ? missionLocations.interpreter
    : null;
  const requesterLocation = savedRequesterLocation ?? (
    request.latitude !== null && request.longitude !== null
      ? { latitude: request.latitude, longitude: request.longitude }
      : null
  );
  const interpreterLocation = savedInterpreterLocation;
  const mapPoints: MissionMapPoint[] = [];

  useEffect(() => {
    if (!canTrackLocation) return;

    if (!("geolocation" in navigator)) {
      const unavailableTimer = window.setTimeout(() => setLocationState("unavailable"), 0);
      return () => window.clearTimeout(unavailableTimer);
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        try {
          void saveMissionLocationAction({
            bookingId: request.requestId,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          }).then((result) => {
            if (!result.ok) {
              setLocationState("error");
              return;
            }
            const point = {
              actorId: viewer.userId,
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              updatedAtLabel: new Date().toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" }),
              accuracyMeters: position.coords.accuracy,
            };
            setMissionLocations((current) => ({
              ...current,
              ...(isInterpreter ? { interpreter: point } : { requester: point }),
            }));
            setLocationState("saved");
          }).catch(() => {
            setLocationState("error");
          });
        } catch {
          setLocationState("error");
        }
      },
      (error) => setLocationState(error.code === error.PERMISSION_DENIED ? "denied" : "unavailable"),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 5000 },
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [canTrackLocation, isInterpreter, request.requestId, viewer.userId]);

  if (!isInterpreter && requesterLocation) {
    mapPoints.push({
      id: "requester",
      label: t.requesterMarker,
      name: request.requester?.name ?? viewer.name,
      detail: `${requesterLocation.latitude.toFixed(5)}, ${requesterLocation.longitude.toFixed(5)}`,
      sourceLabel: savedRequesterLocation ? t.liveGpsLabel : t.requestLocationLabel,
      updatedAtLabel: savedRequesterLocation?.updatedAtLabel ?? request.createdAtLabel,
      accuracyMeters: savedRequesterLocation?.accuracyMeters ?? null,
      isCurrentViewer: true,
      latitude: requesterLocation.latitude,
      longitude: requesterLocation.longitude,
    });
  }
  if (isInterpreter && interpreterLocation) {
    mapPoints.push({
      id: "interpreter",
      label: t.interpreterMarker,
      name: request.interpreter?.name ?? viewer.name,
      detail: `${interpreterLocation.latitude.toFixed(5)}, ${interpreterLocation.longitude.toFixed(5)}`,
      sourceLabel: t.liveGpsLabel,
      updatedAtLabel: savedInterpreterLocation?.updatedAtLabel ?? null,
      accuracyMeters: savedInterpreterLocation?.accuracyMeters ?? null,
      isCurrentViewer: true,
      latitude: interpreterLocation.latitude,
      longitude: interpreterLocation.longitude,
    });
  }
  if (contactUnlocked && isInterpreter && requesterLocation) {
    mapPoints.push({
      id: "requester",
      label: t.requesterMarker,
      name: request.requester?.name ?? t.requesterMarker,
      detail: `${requesterLocation.latitude.toFixed(5)}, ${requesterLocation.longitude.toFixed(5)}`,
      sourceLabel: savedRequesterLocation ? t.liveGpsLabel : t.requestLocationLabel,
      updatedAtLabel: savedRequesterLocation?.updatedAtLabel ?? request.createdAtLabel,
      accuracyMeters: savedRequesterLocation?.accuracyMeters ?? null,
      isCurrentViewer: false,
      latitude: requesterLocation.latitude,
      longitude: requesterLocation.longitude,
    });
  }
  if (contactUnlocked && !isInterpreter && interpreterLocation) {
    mapPoints.push({
      id: "interpreter",
      label: t.interpreterMarker,
      name: request.interpreter?.name ?? t.interpreterMarker,
      detail: `${interpreterLocation.latitude.toFixed(5)}, ${interpreterLocation.longitude.toFixed(5)}`,
      sourceLabel: t.liveGpsLabel,
      updatedAtLabel: savedInterpreterLocation?.updatedAtLabel ?? null,
      accuracyMeters: savedInterpreterLocation?.accuracyMeters ?? null,
      isCurrentViewer: false,
      latitude: interpreterLocation.latitude,
      longitude: interpreterLocation.longitude,
    });
  }

  const stepTimestamps: Record<(typeof TIMELINE_STEPS)[number], string | null> = {
    Open: request.createdAtLabel,
    Claimed: request.claimedAtLabel,
    InProgress: request.startedAtLabel,
    Completed: status === "Completed" ? (request.endedAtLabel ?? userConfirmedAt ?? interpreterConfirmedAt) : null,
  };

  async function confirmCancellation() {
    if (!cancelDraft.trim()) {
      setCancelError(t.cancelReasonMissing);
      return;
    }

    const result = await cancelBookingAction(request.requestId, cancelDraft);
    if (!result.ok) {
      setCancelError(result.error);
      return;
    }
    try {
      setCancelError(null);
      setCancelFormOpen(false);
      if (isInterpreter && status === "Claimed") router.replace("/interpreter/find-requests#main-content");
      else router.refresh();
    } catch { setCancelError("Could not save this change. Please try again."); }
  }

  /** BR-05: the request only reaches Completed once both sides confirm. */
  async function confirmDone() {
    const result = await confirmBookingCompletionAction(request.requestId);
    if (!result.ok) setCancelError(result.error);
    else router.refresh();
  }

  async function confirmAssignedInterpreter() {
    const result = await confirmBookingInterpreterAction(request.requestId);
    if (!result.ok) setCancelError(result.error);
    else router.refresh();
  }

  async function beginWork() {
    const result = await startBookingAction(request.requestId);
    if (!result.ok) setCancelError(result.error);
    else router.refresh();
  }

  function openEditForm() {
    setEditLanguageId(request.languageId);
    setEditCategoryId(request.categoryId);
    setEditDescription(request.description);
    setEditMeetingPoint(request.exactAddress);
    setEditError(null);
    setEditSuccess(false);
    setEditFormOpen(true);
  }

  async function saveEditedDetails(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editMeetingPoint.trim()) {
      setEditError(t.meetingPointRequired);
      return;
    }

    const result = await updateBookingDetailsAction({
      bookingId: request.requestId,
      languageId: editLanguageId,
      categoryId: editCategoryId,
      description: editDescription,
      locationName: editMeetingPoint,
    });
    if (result.ok) {
      setEditError(null);
      setEditSuccess(true);
      setEditFormOpen(false);
      router.refresh();
    } else {
      setEditError(result.error);
    }
  }

  return (
    <main id="main-content" className="flex-1 px-5 py-8 sm:px-8 lg:px-12 lg:py-10">
      <div className="mx-auto max-w-[1180px]">
        <WorkspaceBreadcrumbs
          ariaLabel={t.breadcrumb}
          items={[
            {
              label: t.main,
              href: accountBase,
            },
            {
              label: isInterpreter ? t.assignmentsLabel : t.requestsLabel,
              href: isInterpreter ? `${assignmentBase}#main-content` : `${requesterBase}#main-content`,
            },
            { label: t.detailsTitle },
          ]}
        />

        {cancelError && <p role="alert" className="mt-4 text-(--khvi-coral)">{cancelError}</p>}
        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="text-sm font-extrabold text-[#087f80]">
              {isInterpreter ? t.interpreterView : t.requesterView}
            </p>
            <h1 className="mt-1.5 break-words text-3xl font-extrabold tracking-normal text-[#122b3e] sm:text-4xl">
              {categoryLabel(request.categoryId, copyLocale)} · {languageLabel(request.languageId, copyLocale)}
            </h1>
            <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-bold text-[#73848a]">
              <span>{t.created}: {request.createdAtLabel}</span>
              {request.scheduledAtLabel && <span>{t.scheduled}: {request.scheduledAtLabel}</span>}
              {status === "Open" && request.expiresAt && (
                <ExpiryCountdown seconds={0} expiresAt={request.expiresAt} copyLocale={copyLocale} compact />
              )}
            </div>
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-2 sm:justify-end">
            <StatusBadge status={status} copyLocale={copyLocale} />
            <UrgencyBadge urgency={request.urgency} copyLocale={copyLocale} />
          </div>
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
              href={`${accountBase}/request-help#main-content`}
            >
              <PlusIcon aria-hidden="true" className="h-5 w-5" />
              {t.newRequest}
            </Link>
          </section>
        )}

        <div className="mt-7 grid items-start gap-6">
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
                    {isInterpreter ? t.requesterConfirmation : t.yourConfirmation}: {userConfirmedAt}
                  </p>
                  <p className="mt-1">
                    {isInterpreter ? t.yourConfirmation : t.interpreterConfirmation}: {interpreterConfirmedAt}
                  </p>
                </div>
              )}
            </section>

            <section className={sectionClass}>
              <h2 className={sectionTitleClass}>{t.detailsTitle}</h2>

              {editSuccess && !editFormOpen && (
                <p role="status" className="mt-4 flex items-center gap-2 text-sm font-bold text-[#087557]">
                  <CheckCircleIcon aria-hidden="true" className="h-5 w-5" />
                  {t.detailsSaved}
                </p>
              )}

              {editFormOpen ? (
                <form className="mt-5 border-t border-[#e3ebef] pt-5" noValidate onSubmit={saveEditedDetails}>
                  <p className="text-xs leading-5 text-[#73848a]">{t.editHint}</p>
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-extrabold text-[#294554]" htmlFor="edit-language">
                        {t.languageLabel}
                      </label>
                      <select
                        id="edit-language"
                        className="mt-2 w-full rounded-lg border border-[#cbd7dc] bg-white px-3.5 py-3 text-sm font-semibold text-(--khvi-ink) focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-(--khvi-sun)"
                        value={editLanguageId}
                        onChange={(event) => setEditLanguageId(event.target.value as LanguageId)}
                      >
                        {LANGUAGES.map((language) => (
                          <option key={language.id} value={language.id}>{language[copyLocale]}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-extrabold text-[#294554]" htmlFor="edit-category">
                        {t.categoryLabel}
                      </label>
                      <select
                        id="edit-category"
                        className="mt-2 w-full rounded-lg border border-[#cbd7dc] bg-white px-3.5 py-3 text-sm font-semibold text-(--khvi-ink) focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-(--khvi-sun)"
                        value={editCategoryId}
                        onChange={(event) => setEditCategoryId(event.target.value as CategoryId)}
                      >
                        {CATEGORIES.map((category) => (
                          <option key={category.id} value={category.id}>{category[copyLocale]}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-extrabold text-[#294554]" htmlFor="edit-description">
                      {t.descriptionLabel}
                    </label>
                    <textarea
                      id="edit-description"
                      rows={4}
                      maxLength={500}
                      className="mt-2 w-full resize-y rounded-lg border border-[#cbd7dc] bg-white px-3.5 py-3 text-sm font-semibold text-(--khvi-ink) focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-(--khvi-sun)"
                      value={editDescription}
                      aria-describedby="edit-description-hint"
                      onChange={(event) => setEditDescription(event.target.value)}
                    />
                    <p id="edit-description-hint" className="mt-1.5 text-xs leading-5 text-[#73848a]">{t.descriptionHint}</p>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-extrabold text-[#294554]" htmlFor="edit-meeting-point">
                      {t.meetingPointLabel}
                    </label>
                    <input
                      id="edit-meeting-point"
                      type="text"
                      maxLength={200}
                      className="mt-2 w-full rounded-lg border border-[#cbd7dc] bg-white px-3.5 py-3 text-sm font-semibold text-(--khvi-ink) focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-(--khvi-sun)"
                      value={editMeetingPoint}
                      aria-invalid={Boolean(editError)}
                      onChange={(event) => setEditMeetingPoint(event.target.value)}
                    />
                  </div>

                  {editError && (
                    <p role="alert" className="mt-3 flex items-start gap-2 text-xs font-bold leading-5 text-[#c33a2a]">
                      <ExclamationTriangleIcon aria-hidden="true" className="h-4 w-4 shrink-0" />
                      {editError}
                    </p>
                  )}

                  <div className="mt-5 grid gap-2 sm:grid-cols-2">
                    <button
                      type="submit"
                      className="flex h-12 items-center justify-center gap-2 rounded-lg bg-(--khvi-navy) px-4 text-sm font-extrabold text-white transition-colors hover:bg-[#0c4960] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-(--khvi-sun)"
                    >
                      <CheckCircleIcon aria-hidden="true" className="h-5 w-5" />
                      {t.saveDetails}
                    </button>
                    <button
                      type="button"
                      className="flex h-12 items-center justify-center rounded-lg border border-[#cbd7dc] bg-white px-4 text-sm font-extrabold text-[#173646] transition-colors hover:border-[#087f80] hover:text-[#087f80] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-(--khvi-sun)"
                      onClick={() => {
                        setEditFormOpen(false);
                        setEditError(null);
                      }}
                    >
                      {t.discardDetails}
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <p className="mt-4 text-xs font-extrabold text-[#087f80]">{t.descriptionLabel}</p>
                  <p className="mt-1.5 text-sm leading-7 text-[#52676f]">{request.description || (copyLocale === "zh" ? "无补充说明" : "No additional notes.")}</p>
                  {canEdit && (
                    <div className="mt-5 flex justify-end border-t border-[#e3ebef] pt-4">
                      <button
                        type="button"
                        className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border-2 border-[#087f80] px-3.5 text-sm font-extrabold text-[#087f80] transition-colors hover:bg-[#edf7f5] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-(--khvi-sun) sm:w-auto"
                        onClick={openEditForm}
                      >
                        <PencilSquareIcon aria-hidden="true" className="h-5 w-5" />
                        {t.editDetails}
                      </button>
                    </div>
                  )}
                </>
              )}
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
                  <dd className="mt-1 text-sm font-extrabold text-[#203d4d]">
                    {canSeeSensitiveLocation ? exactCoordinates(request) : approximateCoordinates(request)}
                  </dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-xs font-extrabold text-[#8a9aa0]">{t.exactLabel}</dt>
                  <dd className="mt-1 text-sm font-extrabold text-[#203d4d]">
                    {canSeeSensitiveLocation ? request.exactAddress : request.areaName}
                  </dd>
                </div>
              </dl>

              {(status === "Open" || (isInterpreter && !contactUnlocked)) && (
                <div className="mt-5 border-t border-[#e3ebef] pt-4">
                  <p className="flex items-center gap-2 text-xs font-extrabold text-[#b5680b]">
                    <LockClosedIcon aria-hidden="true" className="h-4 w-4" />
                    {isInterpreter ? t.contactLockedTitle : t.interpreterViewLabel}
                  </p>
                  <p className="mt-2 text-sm font-extrabold text-[#203d4d]">
                    {request.areaName} · {approximateCoordinates(request)}
                  </p>
                  <p className="mt-1.5 text-xs leading-5 text-[#73848a]">
                    {isInterpreter ? t.contactLockedBody : t.interpreterViewBody}
                  </p>
                </div>
              )}

              <div className="mt-5 border-t border-[#e3ebef] pt-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h3 className="text-sm font-extrabold text-[#173646]">{t.mapTitle}</h3>
                    <p className="mt-1 max-w-xl text-xs leading-5 text-[#73848a]">{t.mapIntro}</p>
                  </div>
                  {canTrackLocation && (locationState === "loading" || locationState === "saved") && (
                    <p
                      role="status"
                      className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-lg border border-[#9bcfc1] bg-[#f3faf6] px-4 py-2 text-sm font-extrabold text-[#087557]"
                    >
                      {locationState === "loading" ? (
                        <ArrowPathIcon aria-hidden="true" className="h-5 w-5 animate-spin motion-reduce:animate-none" />
                      ) : (
                        <span aria-hidden="true" className="h-2.5 w-2.5 rounded-full bg-[#087557]" />
                      )}
                      {locationState === "loading" ? t.readingLocation : t.locationSaved}
                    </p>
                  )}
                </div>

                <div className="mt-4">
                  {mapPoints.length > 0 ? (
                    <MissionLocationMap
                      points={mapPoints}
                      title={t.mapTitle}
                      loadingLabel={t.readingLocation}
                      youLabel={t.youMarker}
                      coordinatesLabel={t.coordinatesMapLabel}
                      accuracyLabel={t.accuracyMapLabel}
                      updatedLabel={t.updatedMapLabel}
                      expandMapLabel={t.expandMapLabel}
                      collapseMapLabel={t.collapseMapLabel}
                      touchZoomLabel={t.touchZoomLabel}
                    />
                  ) : (
                    <div className="flex min-h-40 items-center justify-center rounded-xl border border-dashed border-[#b9c8ce] bg-[#f7f9fa] px-6 text-center">
                      <p className="max-w-sm text-sm leading-6 text-[#64777e]">{t.mapEmpty}</p>
                    </div>
                  )}
                </div>

                <div aria-live="polite" className="mt-3 space-y-2">
                  {locationState === "denied" && (
                    <p role="alert" className="text-xs font-bold leading-5 text-(--khvi-coral)">{t.locationDenied}</p>
                  )}
                  {locationState === "unavailable" && (
                    <p role="alert" className="text-xs font-bold leading-5 text-(--khvi-coral)">{t.locationUnavailable}</p>
                  )}
                  {locationState === "error" && (
                    <p role="alert" className="text-xs font-bold leading-5 text-(--khvi-coral)">{t.locationFailed}</p>
                  )}
                  {request.interpreter && !contactUnlocked && (
                    <p className="flex items-start gap-2 text-xs leading-5 text-[#8a5a14]">
                      <LockClosedIcon aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
                      {t.otherLocationLocked}
                    </p>
                  )}
                  {contactUnlocked && !requesterLocation && (
                    <p className="text-xs leading-5 text-[#73848a]">{t.waitingRequesterLocation}</p>
                  )}
                  {contactUnlocked && !interpreterLocation && (
                    <p className="text-xs leading-5 text-[#73848a]">{t.waitingInterpreterLocation}</p>
                  )}
                </div>
              </div>
            </section>
          </div>

          <aside className="grid gap-5 sm:grid-cols-2 sm:items-stretch">
            {!isInterpreter && request.interpreter ? (
              <section className="h-full border border-[#b6ddcd] bg-[#f3faf6] p-5 sm:p-6">
                <h2 className="flex items-center gap-2 text-base font-extrabold text-[#0f3a2c]">
                  {contactUnlocked
                    ? <LockOpenIcon aria-hidden="true" className="h-5 w-5" />
                    : <LockClosedIcon aria-hidden="true" className="h-5 w-5" />}
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
                    {(request.interpreter.reviewCount ?? 0) > 0
                      ? <>{request.interpreter.averageRating.toFixed(1)} {t.ratingLabel}</>
                      : <>{copyLocale === "zh" ? "暂无评分" : "No rating yet"}</>}
                  </span>
                  <span>
                    {request.interpreter.completedJobCount} {t.jobsLabel}
                  </span>
                </p>

                {contactUnlocked ? (
                  <div className="mt-5 grid gap-2 border-t border-[#c6e3d5] pt-4">
                    <a
                      className="inline-flex h-12 items-center gap-2 rounded-lg bg-(--khvi-navy) px-4 text-sm font-extrabold text-white transition-colors hover:bg-[#0c4960] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-(--khvi-sun)"
                      href={`tel:${request.interpreter.phone.replace(/\s/g, "")}`}
                    >
                      <PhoneIcon aria-hidden="true" className="h-5 w-5" />
                      {request.interpreter.phone}
                    </a>
                    {request.interpreter.extraContact && (
                      <div className="grid gap-1 rounded-lg border border-[#c6e3d5] bg-white/70 px-4 py-3">
                        <p className="flex items-center gap-2 text-xs font-extrabold text-[#5c8073]">
                          <ChatBubbleLeftRightIcon aria-hidden="true" className="h-4 w-4 text-[#087557]" />
                          {t.extraContactLabel}
                        </p>
                        <p className="break-words text-sm font-bold leading-6 text-[#123a2d]">
                          {request.interpreter.extraContact}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="mt-4 border-t border-[#c6e3d5] pt-4 text-sm leading-6 text-[#52676f]">
                    {t.contactLockedBody}
                  </p>
                )}
              </section>
            ) : isInterpreter && contactUnlocked && request.requester ? (
              <section className="h-full border border-[#b6ddcd] bg-[#f3faf6] p-5 sm:p-6">
                <h2 className="flex items-center gap-2 text-base font-extrabold text-[#0f3a2c]">
                  <LockOpenIcon aria-hidden="true" className="h-5 w-5" />
                  {t.requesterContactTitle}
                </h2>
                <div className="mt-4 flex items-center gap-3">
                  <UserCircleIcon aria-hidden="true" className="h-11 w-11 shrink-0 text-[#087557]" />
                  <div className="min-w-0">
                    <p className="text-base font-extrabold text-[#123a2d]">{request.requester.name}</p>
                    <p className="mt-0.5 text-xs font-bold text-[#5c8073]">{t.requesterMarker}</p>
                  </div>
                </div>

                <div className="mt-5 grid gap-4 border-t border-[#c6e3d5] pt-4">
                  <a
                    className="inline-flex min-h-12 items-center gap-2 rounded-lg bg-(--khvi-navy) px-4 py-2 text-sm font-extrabold text-white transition-colors hover:bg-[#0c4960] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-(--khvi-sun)"
                    href={`tel:${request.requester.phone.replace(/\s/g, "")}`}
                  >
                    <PhoneIcon aria-hidden="true" className="h-5 w-5" />
                    {request.requester.phone}
                  </a>

                  <div className="grid gap-1">
                    <p className="flex items-center gap-2 text-xs font-extrabold text-[#5c8073]">
                      <MapPinIcon aria-hidden="true" className="h-4 w-4" />
                      {t.meetingPointLabel}
                    </p>
                    <p className="text-sm font-bold leading-6 text-[#123a2d]">
                      {request.exactAddress || request.areaName}
                    </p>
                  </div>

                  {requesterLocation && (
                    <div className="grid gap-1 border-t border-[#c6e3d5] pt-4">
                      <p className="flex items-center gap-2 text-xs font-extrabold text-[#5c8073]">
                        <ArrowPathIcon aria-hidden="true" className="h-4 w-4" />
                        {savedRequesterLocation ? t.liveGpsLabel : t.requestLocationLabel}
                      </p>
                      <p className="text-sm font-bold text-[#123a2d]">
                        {requesterLocation.latitude.toFixed(5)}, {requesterLocation.longitude.toFixed(5)}
                      </p>
                      <p className="text-xs leading-5 text-[#5c8073]">
                        {t.updatedMapLabel}: {savedRequesterLocation?.updatedAtLabel ?? request.createdAtLabel}
                      </p>
                    </div>
                  )}
                </div>
              </section>
            ) : status === "Open" || isInterpreter ? (
              <section className={`${sectionClass} h-full`}>
                <h2 className="flex items-center gap-2 text-base font-extrabold text-[#173646]">
                  <LockClosedIcon aria-hidden="true" className="h-5 w-5 text-[#b5680b]" />
                  {isInterpreter ? t.contactLockedTitle : t.lockedTitle}
                </h2>
                <p className="mt-3 text-sm leading-7 text-[#64777e]">
                  {isInterpreter ? t.contactLockedBody : t.lockedBody}
                </p>
              </section>
            ) : null}

            <section className={`${sectionClass} h-full`}>
              <h2 className="flex items-center gap-2 text-base font-extrabold text-[#173646]">
                <CheckCircleIcon aria-hidden="true" className="h-5 w-5" />
                {t.actionsTitle}
              </h2>

              <div className="mt-5 grid gap-4 border-t border-[#dbe7e8] pt-4">

              {status === "Claimed" && (
                <div>
                  {isInterpreter ? (
                    request.requesterConfirmedAtLabel ? (
                      <button
                        type="button"
                        className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#087f80] px-4 text-sm font-extrabold text-white transition-colors hover:bg-[#096f70] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-(--khvi-sun)"
                        onClick={beginWork}
                      >
                        <CheckCircleIcon aria-hidden="true" className="h-5 w-5" />
                        {t.startWork}
                      </button>
                    ) : (
                      <p className="border border-[#f1d2a9] bg-[#fff8ed] p-4 text-sm font-bold leading-6 text-[#8b5a20]">
                        {t.waitingForRequester}
                      </p>
                    )
                  ) : request.requesterConfirmedAtLabel ? (
                    <p className="flex items-center gap-2 border border-[#b6ddcd] bg-[#f3faf6] p-4 text-sm font-extrabold text-[#087557]">
                      <CheckCircleIcon aria-hidden="true" className="h-5 w-5" />
                      {t.interpreterConfirmed}
                    </p>
                  ) : (
                    <>
                      <button
                        type="button"
                        className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#087f80] px-4 text-sm font-extrabold text-white transition-colors hover:bg-[#096f70] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-(--khvi-sun)"
                        onClick={confirmAssignedInterpreter}
                      >
                        <CheckCircleIcon aria-hidden="true" className="h-5 w-5" />
                        {t.confirmInterpreter}
                      </button>
                      <p className="mt-2 text-xs leading-5 text-[#73848a]">{t.confirmInterpreterHint}</p>
                    </>
                  )}
                </div>
              )}

              {status === "InProgress" && (
                <div>
                  {viewerConfirmedAt ? (
                    <div className="flex items-start gap-3 border border-[#b6ddcd] bg-[#f3faf6] p-4">
                      <CheckCircleIcon aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-[#087557]" />
                      <div className="min-w-0">
                        <p className="text-sm font-extrabold leading-6 text-[#087557]">
                          {t.yourConfirmation}
                        </p>
                        <p className="mt-0.5 break-words text-xs font-bold leading-5 text-[#3f6357]">
                          {viewerConfirmedAt}
                        </p>
                        <p className="mt-2 text-xs leading-5 text-[#3f6357]">{t.waitingOtherSide}</p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <button
                        type="button"
                        className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#087f80] px-4 text-sm font-extrabold text-white transition-colors hover:bg-[#096f70] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-(--khvi-sun)"
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

              {canCancel && (
                <div className={status === "Claimed" || status === "InProgress" ? "border-t border-[#dbe7e8] pt-4" : ""}>
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
                          className="flex h-12 items-center justify-center gap-2 rounded-lg bg-(--khvi-coral) px-4 text-sm font-extrabold text-white transition-colors hover:bg-[#d94334] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-(--khvi-sun)"
                          onClick={confirmCancellation}
                        >
                          <XCircleIcon aria-hidden="true" className="h-5 w-5" />
                          {t.cancelConfirm}
                        </button>
                        <button
                          type="button"
                          className="flex h-12 items-center justify-center rounded-lg border border-[#cbd7dc] bg-white px-4 text-sm font-extrabold text-[#173646] transition-colors hover:border-[#087f80] hover:text-[#087f80] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-(--khvi-sun)"
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
                      className="flex h-12 w-full items-center justify-center gap-2 rounded-lg border-2 border-[#f6b8ae] bg-white px-4 text-sm font-extrabold text-[#c33a2a] transition-colors hover:bg-[#fff6f4] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-(--khvi-sun)"
                      onClick={() => setCancelFormOpen(true)}
                    >
                      <XCircleIcon aria-hidden="true" className="h-5 w-5" />
                      {isInterpreter ? t.withdraw : t.cancel}
                    </button>
                  )}
                </div>
              )}

              {(status === "Completed" || isClosed) && (
                <p className="text-sm font-bold leading-7 text-[#52676f]">
                  {status === "Completed" ? t.completedTitle : t.noActions}
                </p>
              )}

              {status === "Completed" && request.interpreter && (
                <div className="border-t border-[#dbe7e8] pt-4">
                  {reviewPreview ? (
                    <div className="border border-[#b6ddcd] bg-[#f3faf6] p-4">
                      <p className="flex items-center gap-2 text-sm font-extrabold text-[#087557]">
                        <CheckCircleIcon aria-hidden="true" className="h-5 w-5" />
                        {isInterpreter ? t.reviewReceived : t.reviewSubmitted}
                      </p>
                      <div className="mt-3 flex items-center gap-1" aria-label={`${reviewPreview.rating}/5`}>
                        {Array.from({ length: 5 }, (_, index) => (
                          <StarIcon
                            key={index}
                            aria-hidden="true"
                            className={`h-5 w-5 ${index < reviewPreview.rating ? "fill-[#f0a35f] text-[#e0952f]" : "text-[#cbd7dc]"}`}
                          />
                        ))}
                      </div>
                      {reviewPreview.comment && <p className="mt-2 text-sm leading-6 text-[#52676f]">{reviewPreview.comment}</p>}
                      {request.review && (
                        <p className="mt-2 text-xs leading-5 text-[#3f6357]">
                          {t.reviewSubmittedAt}: {request.review.createdAtLabel}
                        </p>
                      )}
                      {!isInterpreter && <p className="mt-2 text-xs leading-5 text-[#3f6357]">{t.reviewReadOnly}</p>}
                    </div>
                  ) : isInterpreter ? (
                    <p className="border border-[#d6e0e4] bg-[#f7f9fa] p-4 text-sm leading-6 text-[#64777e]">
                      {t.reviewPending}
                    </p>
                  ) : (
                    <div className="border border-[#b6ddcd] bg-[#f3faf6] p-4">
                      <p className="text-sm font-extrabold text-[#0f3a2c]">{t.reviewTitle}</p>
                      <p className="mt-1.5 text-xs leading-5 text-[#52676f]">{t.reviewHint}</p>
                      <button
                        type="button"
                        className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-(--khvi-navy) px-4 text-sm font-extrabold text-white transition-colors hover:bg-[#0c4960] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-(--khvi-sun)"
                        onClick={() => setReviewOpen(true)}
                      >
                        <StarIcon aria-hidden="true" className="h-5 w-5" />
                        {t.reviewCta}
                      </button>
                    </div>
                  )}
                </div>
              )}
              </div>
            </section>
          </aside>
        </div>
      </div>

      {!isInterpreter && status === "Completed" && request.interpreter && (
        <ReviewModal
          key={reviewOpen ? "review-open" : "review-closed"}
          open={reviewOpen}
          bookingId={request.requestId}
          interpreterName={request.interpreter.name}
          interpreterLanguage={request.interpreter.primaryLanguage}
          completedAt={request.endedAtLabel ?? null}
          existingReview={request.review}
          onClose={() => setReviewOpen(false)}
          onSubmitted={(review) => {
            setSubmittedReview(review);
            router.refresh();
          }}
        />
      )}
    </main>
  );
}
