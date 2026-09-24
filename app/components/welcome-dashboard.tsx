"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { ArrowRightIcon, LanguageIcon, ClipboardDocumentListIcon, MapPinIcon, MagnifyingGlassIcon, ClockIcon, PhoneIcon, EnvelopeIcon, ChatBubbleLeftRightIcon, ShieldCheckIcon } from "@heroicons/react/24/outline";
import { StarIcon } from "@heroicons/react/24/solid";
import { useCopyLocale, useInterpreterAccess, useUiLocale } from "./app-shell";
import { ExpiryCountdown } from "./expiry-countdown";
import { ResponsiveHeroImage } from "./responsive-hero-image";
import { StatusBadge, UrgencyBadge } from "./request-badges";
import type { HelpRequest, RequestStatus } from "@/app/lib/request-types";
import type { UserProfile } from "@/app/lib/auth-types";
import type { InterpreterApplication } from "@/app/lib/interpreter-application-types";
import { loadMyInterpreterApplicationAction } from "@/app/actions/interpreter-application-actions";
import { ApplicationStatusCard } from "@/components/volunteer/ApplicationStatusCard";
import type { InterpreterWorkspaceMode } from "@/app/lib/workspace-mode";
import type { OpenRequestsDiagnostic } from "@/app/lib/real-request-data";
import { referenceLabel, type ReferenceCatalog } from "@/app/lib/reference-catalog";
import type { InterpreterRating } from "@/app/lib/real-interpreter-rating";
const RequestMap = dynamic(
  () => import("../interpreter/find-requests/request-map").then((module) => module.RequestMap),
  { ssr: false },
);

const button = "inline-flex min-h-12 items-center justify-center gap-2 rounded-(--khvi-radius-sm) bg-(--khvi-navy) px-5 py-3 text-sm font-bold text-white hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--khvi-sun)";
const heroButton = "inline-flex min-h-12 items-center justify-center gap-2 rounded-(--khvi-radius-sm) bg-white px-5 py-3 text-sm font-bold text-(--khvi-navy) hover:bg-(--khvi-paper) focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--khvi-sun)";
const panel = "rounded-(--khvi-radius-md) border border-(--khvi-teal)/20 bg-(--khvi-surface) p-5 sm:p-7";
const muted = "mt-2 text-sm leading-7 text-(--khvi-ink)/70";

const welcomeSpanish: Record<string, string> = {
  "Open": "Abierta", "Claimed": "Asignada", "In progress": "En curso", "Completed": "Completada",
  "Request progress": "Progreso de la solicitud", "Waiting for an interpreter. Open the request to track its deadline.": "Esperando a un intérprete. Abre la solicitud para consultar el plazo.",
  "An interpreter has claimed this request. Review the details and confirmation steps before meeting.": "Un intérprete ha aceptado esta solicitud. Revisa los detalles y los pasos de confirmación antes del encuentro.",
  "The requester has confirmed completion. Waiting for the interpreter.": "El solicitante confirmó la finalización. Esperando al intérprete.",
  "The interpreter has confirmed completion. Waiting for the requester.": "El intérprete confirmó la finalización. Esperando al solicitante.",
  "Work is in progress. Both people confirm when it is complete.": "El trabajo está en curso. Ambas personas deben confirmar cuando termine.",
  "View details": "Ver detalles", "Welcome": "Bienvenido/a", "No reviews yet": "Aún no hay reseñas", "Rating unavailable": "Calificación no disponible",
  "Choose how to use KHVI": "Elige cómo usar KHVI", "Switch between helping and requesting help": "Cambiar entre ayudar y solicitar ayuda", "Help others": "Ayudar a otros", "Request help": "Solicitar ayuda",
  "View application status": "Ver estado de la solicitud", "Volunteer apply": "Solicitud de voluntariado", "A volunteer interpreter helping a user speak with a community service worker": "Un intérprete voluntario ayuda a una persona a comunicarse con un servicio comunitario", "A requester receiving an explanation from a volunteer interpreter": "Una persona recibe una explicación de un intérprete voluntario",
  "Community language help": "Ayuda lingüística comunitaria", "Help someone be understood.": "Ayuda a que alguien sea comprendido.", "A little language help starts here.": "Un poco de ayuda lingüística empieza aquí.",
  "Explore requests by language, category and distance. Review each request and take one assignment at a time.": "Explora solicitudes por idioma, categoría y distancia. Revisa cada solicitud y acepta una misión a la vez.", "Choose a language, category and meeting point. A suitable interpreter chooses to claim your request.": "Elige un idioma, una categoría y un punto de encuentro. Un intérprete adecuado podrá aceptar tu solicitud.", "Create a help request": "Crear una solicitud de ayuda",
  "Current help request": "Solicitud de ayuda actual", "Language and category": "Idioma y categoría", "Assigned interpreter": "Intérprete asignado", "View all details": "Ver todos los detalles", "You have multiple active records. Open the full list to view them all.": "Tienes varios registros activos. Abre la lista completa para verlos todos.",
  "No active help requests": "No hay solicitudes de ayuda activas", "Track your request status and assigned interpreter here when you have an active request.": "Aquí podrás consultar el estado y el intérprete asignado cuando tengas una solicitud activa.",
  "Current assignment": "Misión actual", "Meeting area": "Zona de encuentro", "Requester": "Solicitante", "You have multiple active assignments. Open your assignments to view them all.": "Tienes varias misiones activas. Abre tus misiones para verlas todas.",
  "Nearby requests": "Solicitudes cercanas", "Locating…": "Buscando ubicación…", "Try location again": "Intentar localizar de nuevo", "Use my current location": "Usar mi ubicación actual", "Location unavailable. Try again.": "Ubicación no disponible. Inténtalo de nuevo.", "Nearby help request map": "Mapa de solicitudes cercanas", "Loading map…": "Cargando mapa…", "Current location": "Ubicación actual", "Open full map": "Abrir mapa completo",
  "Explore suitable requests": "Explorar solicitudes adecuadas", "Filter open requests that match your skills.": "Filtra solicitudes abiertas que coincidan con tus habilidades.", "Language": "Idioma", "All languages": "Todos los idiomas", "Category": "Categoría", "All categories": "Todas las categorías", "Open the map": "Abrir el mapa", "No open requests currently match your approved skills.": "No hay solicitudes abiertas que coincidan con tus habilidades aprobadas.", "No open requests match these filters. Try another language, category or distance.": "No hay solicitudes abiertas que coincidan con estos filtros. Prueba con otro idioma, categoría o distancia.",
  "Recent requests": "Solicitudes recientes", "Your past work": "Trabajos anteriores", "View all": "Ver todo", "You have no past assignments yet. Claimed assignments will appear here.": "Aún no tienes misiones anteriores. Las misiones aceptadas aparecerán aquí.", "You have no recent requests yet. Requests you submit will appear here.": "Aún no tienes solicitudes recientes. Las solicitudes que envíes aparecerán aquí.", "Find requests": "Buscar solicitudes", "Contact us if you have a problem": "Contáctanos si tienes un problema", "If you run into a problem or need further help, contact us through:": "Si tienes un problema o necesitas más ayuda, contáctanos por:", "Review after completion": "Reseña después de completar la misión", "All completed assignments have been reviewed.": "Todas las misiones completadas tienen una reseña.", "Review a completed assignment": "Reseñar una misión completada",
};

const welcomeArabic: Record<string, string> = {
  "Open": "مفتوح", "Claimed": "تم استلامها", "In progress": "قيد التنفيذ", "Completed": "مكتملة",
  "Request progress": "تقدم الطلب", "Waiting for an interpreter. Open the request to track its deadline.": "بانتظار مترجم. افتح الطلب لمتابعة الموعد النهائي.",
  "An interpreter has claimed this request. Review the details and confirmation steps before meeting.": "استلم مترجم هذا الطلب. راجع التفاصيل وخطوات التأكيد قبل اللقاء.",
  "The requester has confirmed completion. Waiting for the interpreter.": "أكد صاحب الطلب إتمام المهمة. بانتظار المترجم.",
  "The interpreter has confirmed completion. Waiting for the requester.": "أكد المترجم إتمام المهمة. بانتظار صاحب الطلب.",
  "Work is in progress. Both people confirm when it is complete.": "المهمة قيد التنفيذ. يجب على الطرفين التأكيد عند اكتمالها.",
  "View details": "عرض التفاصيل", "Welcome": "مرحبًا", "No reviews yet": "لا توجد مراجعات بعد", "Rating unavailable": "التقييم غير متاح",
  "Choose how to use KHVI": "اختر طريقة استخدام KHVI", "Switch between helping and requesting help": "التبديل بين تقديم المساعدة وطلبها", "Help others": "مساعدة الآخرين", "Request help": "طلب المساعدة",
  "View application status": "عرض حالة الطلب", "Volunteer apply": "طلب التطوع", "A volunteer interpreter helping a user speak with a community service worker": "مترجم متطوع يساعد مستخدمًا على التواصل مع موظف خدمة مجتمعية", "A requester receiving an explanation from a volunteer interpreter": "صاحب طلب يتلقى شرحًا من مترجم متطوع",
  "Community language help": "مساعدة لغوية مجتمعية", "Help someone be understood.": "ساعد شخصًا على أن يُفهم.", "A little language help starts here.": "تبدأ المساعدة اللغوية من هنا.",
  "Explore requests by language, category and distance. Review each request and take one assignment at a time.": "استكشف الطلبات حسب اللغة والفئة والمسافة. راجع كل طلب واقبل مهمة واحدة في كل مرة.", "Choose a language, category and meeting point. A suitable interpreter chooses to claim your request.": "اختر اللغة والفئة ومكان اللقاء. يمكن لمترجم مناسب استلام طلبك.", "Create a help request": "إنشاء طلب مساعدة",
  "Current help request": "طلب المساعدة الحالي", "Language and category": "اللغة والفئة", "Assigned interpreter": "المترجم المكلّف", "View all details": "عرض كل التفاصيل", "You have multiple active records. Open the full list to view them all.": "لديك عدة سجلات نشطة. افتح القائمة الكاملة لعرضها.",
  "No active help requests": "لا توجد طلبات مساعدة نشطة", "Track your request status and assigned interpreter here when you have an active request.": "تابع حالة طلبك والمترجم المكلّف هنا عند وجود طلب نشط.",
  "Current assignment": "المهمة الحالية", "Meeting area": "منطقة اللقاء", "Requester": "صاحب الطلب", "You have multiple active assignments. Open your assignments to view them all.": "لديك عدة مهام نشطة. افتح قائمة مهامك لعرضها.",
  "Nearby requests": "الطلبات القريبة", "Locating…": "جارٍ تحديد الموقع…", "Try location again": "حاول تحديد الموقع مجددًا", "Use my current location": "استخدم موقعي الحالي", "Location unavailable. Try again.": "الموقع غير متاح. حاول مرة أخرى.", "Nearby help request map": "خريطة طلبات المساعدة القريبة", "Loading map…": "جارٍ تحميل الخريطة…", "Current location": "الموقع الحالي", "Open full map": "فتح الخريطة الكاملة",
  "Explore suitable requests": "استكشاف الطلبات المناسبة", "Filter open requests that match your skills.": "صفِّ الطلبات المفتوحة التي تناسب مهاراتك.", "Language": "اللغة", "All languages": "كل اللغات", "Category": "الفئة", "All categories": "كل الفئات", "Open the map": "فتح الخريطة", "No open requests currently match your approved skills.": "لا توجد طلبات مفتوحة تطابق مهاراتك المعتمدة.", "No open requests match these filters. Try another language, category or distance.": "لا توجد طلبات مفتوحة تطابق عوامل التصفية هذه. جرّب لغة أو فئة أو مسافة أخرى.",
  "Recent requests": "الطلبات الأخيرة", "Your past work": "أعمالك السابقة", "View all": "عرض الكل", "You have no past assignments yet. Claimed assignments will appear here.": "لا توجد مهام سابقة بعد. ستظهر المهام التي تستلمها هنا.", "You have no recent requests yet. Requests you submit will appear here.": "لا توجد طلبات حديثة بعد. ستظهر الطلبات التي ترسلها هنا.", "Find requests": "البحث عن الطلبات", "Contact us if you have a problem": "تواصل معنا إذا واجهت مشكلة", "If you run into a problem or need further help, contact us through:": "إذا واجهت مشكلة أو احتجت إلى مساعدة إضافية فتواصل معنا عبر:", "Review after completion": "المراجعة بعد إتمام المهمة", "All completed assignments have been reviewed.": "تمت مراجعة جميع المهام المكتملة.", "Review a completed assignment": "مراجعة مهمة مكتملة",
};

function localizeWelcomeText(locale: ReturnType<typeof useUiLocale>, th: string, en: string, zh: string) {
  if (locale === "th") return th;
  if (locale === "zh") return zh;
  if (locale === "es") {
    if (en.startsWith("Average rating ")) return en.replace("Average rating", "Calificación promedio").replace("out of", "de").replace("from", "de").replace("reviews", "reseñas");
    if (en.includes("completed assignments are waiting for your review")) return en.replace("completed assignments are waiting for your review.", "misiones completadas esperan tu reseña.");
    return welcomeSpanish[en] ?? en;
  }
  if (locale === "ar") {
    if (en.startsWith("Average rating ")) return en.replace("Average rating", "متوسط التقييم").replace("out of", "من").replace("from", "من").replace("reviews", "مراجعات");
    if (en.includes("completed assignments are waiting for your review")) return en.replace("completed assignments are waiting for your review.", "مهام مكتملة بانتظار مراجعتك.");
    return welcomeArabic[en] ?? en;
  }
  return en;
}
function distance(request: HelpRequest, location: GeolocationCoordinates | null) {
  if (!location || request.latitude === null || request.longitude === null) return null;
  const rad = Math.PI / 180;
  const dLat = (request.latitude - location.latitude) * rad;
  const dLon = (request.longitude - location.longitude) * rad;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(location.latitude * rad) * Math.cos(request.latitude * rad) * Math.sin(dLon / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(Math.min(1, a)));
}

function RequestProgress({ status, tr }: { status: RequestStatus; tr: (th: string, en: string, zh: string) => string }) {
  const steps = [
    { status: "Open" as const, label: tr("รอรับงาน", "Open", "开放中") },
    { status: "Claimed" as const, label: tr("รับงานแล้ว", "Claimed", "已接取") },
    { status: "InProgress" as const, label: tr("กำลังดำเนินการ", "In progress", "进行中") },
    { status: "Completed" as const, label: tr("เสร็จสิ้น", "Completed", "已完成") },
  ];
  const activeIndex = Math.max(0, steps.findIndex((step) => step.status === status));
  const currentStep = steps[activeIndex];

  return (
    <section className="mt-4 rounded-lg border border-(--khvi-teal)/20 bg-(--khvi-paper) p-3" aria-label={tr("ความคืบหน้าคำขอ", "Request progress", "求助进度")}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-bold text-(--khvi-ink)">{tr("ความคืบหน้าคำขอ", "Request progress", "求助进度")}</h3>
        <span className="text-xs font-bold text-(--khvi-teal)">{currentStep.label}</span>
      </div>
      <ol className="mt-3 grid grid-cols-4 gap-1">
        {steps.map((step, index) => {
          const reached = index <= activeIndex;
          return (
            <li key={step.status} className="min-w-0">
              <div className="flex items-center">
                <span
                  aria-current={index === activeIndex ? "step" : undefined}
                  className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-[0.65rem] font-extrabold ${reached ? "bg-(--khvi-teal) text-white" : "bg-white text-(--khvi-ink)/45"}`}
                >
                  {index + 1}
                </span>
                {index < steps.length - 1 && <span aria-hidden="true" className={`mx-1 h-0.5 min-w-0 flex-1 ${index < activeIndex ? "bg-(--khvi-teal)" : "bg-(--khvi-teal)/20"}`} />}
              </div>
              <span className={`mt-1 block break-words text-[0.6rem] font-bold leading-3.5 ${index === activeIndex ? "text-(--khvi-teal)" : "text-(--khvi-ink)/60"}`}>{step.label}</span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

export function WelcomeDashboard({
  user,
  interpreterMode = "helper",
  onInterpreterModeChange,
  openRequests = [],
  assignments = [],
  requesterRequests = [],
  diagnostic,
  referenceCatalog = { languages: [], categories: [] },
  interpreterRating = null,
}: {
  user: UserProfile;
  interpreterMode?: InterpreterWorkspaceMode;
  onInterpreterModeChange?: (mode: InterpreterWorkspaceMode) => void;
  openRequests?: HelpRequest[];
  assignments?: HelpRequest[];
  requesterRequests?: HelpRequest[];
  diagnostic?: OpenRequestsDiagnostic;
  referenceCatalog?: ReferenceCatalog;
  interpreterRating?: InterpreterRating | null;
}) {
  const locale = useUiLocale();
  const interpreterAccess = useInterpreterAccess();
  const copyLocale = useCopyLocale();
  const tr = (th: string, en: string, zh: string) => localizeWelcomeText(locale, th, en, zh);
  const interpreterAccount = user.role === "Interpreter";
  const interpreter = interpreterAccount && interpreterMode === "helper";
  const workspaceBase = interpreterAccount ? "/interpreter" : "/user";
  const [applicationResult, setApplicationResult] = useState<{
    userId: string;
    application: InterpreterApplication | null;
    loaded: boolean;
    verified: boolean;
  }>({ userId: user.userId, application: null, loaded: false, verified: false });

  useEffect(() => {
    let disposed = false;
    let requestId = 0;
    const refreshApplication = async () => {
      const currentRequest = ++requestId;
      const result = await loadMyInterpreterApplicationAction();
      if (!disposed && currentRequest === requestId) {
        setApplicationResult({
          userId: user.userId,
          application: result.ok ? result.data : null,
          loaded: true,
          verified: result.ok,
        });
      }
    };
    void refreshApplication();
    window.addEventListener("focus", refreshApplication);
    return () => {
      disposed = true;
      window.removeEventListener("focus", refreshApplication);
    };
  }, [user.userId]);

  const applicationLoaded = applicationResult.userId === user.userId && applicationResult.loaded;
  const activeApplication = applicationLoaded && applicationResult.verified ? applicationResult.application : null;
  const applicationStatus = applicationLoaded && applicationResult.verified
    ? activeApplication?.status ?? null
    : interpreterAccess.applicationStatus;

  const [location, setLocation] = useState<GeolocationCoordinates | null>(null);
  const [geo, setGeo] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [language, setLanguage] = useState("all");
  const [category, setCategory] = useState("all");
  const locationWatchRef = useRef<number | null>(null);
  const [now, setNow] = useState(0);
  useEffect(() => {
    const updateNow = () => setNow(Date.now());
    updateNow();
    const timer = window.setInterval(updateNow, 1000);
    return () => {
      window.clearInterval(timer);
      if (locationWatchRef.current !== null) navigator.geolocation?.clearWatch(locationWatchRef.current);
    };
  }, []);
  const isLiveOpenRequest = (request: HelpRequest) =>
    request.status !== "Open"
    || !request.expiresAt
    || Date.parse(request.expiresAt) > now;
  const active = interpreter
    ? assignments.filter((r) => ["Claimed", "InProgress"].includes(r.status))
    : requesterRequests
      .filter((r) => ["Open", "Claimed", "InProgress"].includes(r.status))
      .filter(isLiveOpenRequest);
  const current = active[0];
  const completed = interpreter
    ? assignments.filter((r) => r.status === "Completed")
    : requesterRequests.filter((r) => r.status === "Completed");
  const pendingReviews = completed.filter((r) => Boolean(r.interpreter) && !r.review);
  const recent = interpreter
    ? assignments
      .filter((r) => ["Completed", "Cancelled"].includes(r.status))
      .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
      .slice(0, 3)
    : requesterRequests.filter((r) => r.requestId !== current?.requestId).slice(0, 3);
  const open = openRequests
    .filter(
      (r) =>
        r.status === "Open" &&
        (language === "all" || r.languageId === language) &&
        (category === "all" || r.categoryId === category)
    )
    .slice(0, 3);
  const nearbyOpen = openRequests
    .filter((r) => r.status === "Open")
    .filter((r) => !location || (distance(r, location) !== null && distance(r, location)! <= 5))
    .slice(0, 12);
  const lang = (r: HelpRequest) => referenceLabel(referenceCatalog.languages, r.languageId, locale);
  const cat = (r: HelpRequest) => referenceLabel(referenceCatalog.categories, r.categoryId, locale);
  const listPath = interpreter ? "/interpreter/my-assignments#main-content" : `${workspaceBase}/my-requests#main-content`;
  const nextAction = current?.status === "Open"
    ? tr("กำลังรอล่ามรับคำขอ เปิดรายละเอียดเพื่อติดตามเวลาหมดอายุ", "Waiting for an interpreter. Open the request to track its deadline.", "正在等待口译员接单。打开请求查看截止时间。")
    : current?.status === "Claimed"
      ? tr("มีล่ามรับงานแล้ว ตรวจสอบรายละเอียดและขั้นตอนการยืนยันก่อนนัดพบ", "An interpreter has claimed this request. Review the details and confirmation steps before meeting.", "已有口译员接单。见面前请查看详情和确认步骤。")
      : current?.userConfirmedDoneAtLabel && current?.interpreterConfirmedDoneAtLabel === null
        ? tr("ผู้ขอยืนยันจบงานแล้ว รอการยืนยันจากล่าม", "The requester has confirmed completion. Waiting for the interpreter.", "求助者已确认完成，等待口译员确认。")
        : current?.interpreterConfirmedDoneAtLabel && current?.userConfirmedDoneAtLabel === null
          ? tr("ล่ามยืนยันจบงานแล้ว รอการยืนยันจากผู้ขอ", "The interpreter has confirmed completion. Waiting for the requester.", "口译员已确认完成，等待求助者确认。")
          : tr("ภารกิจกำลังดำเนินการ ทั้งสองฝ่ายต้องยืนยันเมื่อช่วยเหลือเสร็จ", "Work is in progress. Both people confirm when it is complete.", "任务进行中。完成后双方都需要确认。" );
  function locate() {
    if (!navigator.geolocation) { setGeo("error"); return; }
    if (locationWatchRef.current !== null) navigator.geolocation.clearWatch(locationWatchRef.current);
    setGeo("loading");
    locationWatchRef.current = navigator.geolocation.watchPosition(p => { setLocation(p.coords); setGeo("ready"); }, () => setGeo("error"), { timeout: 10000, maximumAge: 10000, enableHighAccuracy: false });
  }
  function requestRow(r: HelpRequest, discovery = false) {
    return <li key={r.requestId} className="flex min-w-0 flex-wrap items-center justify-between gap-4 py-5">
      <div className="min-w-0 flex-1"><h3 className="break-words font-bold">{lang(r)} · {cat(r)}</h3><p className={muted}>{discovery ? r.areaName : r.scheduledAtLabel ?? r.createdAtLabel}</p></div>
      <div className="flex w-full min-w-0 flex-wrap items-center gap-3 sm:w-auto sm:justify-end"><UrgencyBadge urgency={r.urgency} copyLocale={locale === "th" ? "th" : copyLocale} /><StatusBadge status={r.status} copyLocale={locale === "th" ? "th" : copyLocale} /><Link className={`${button} min-h-10 max-w-full shrink-0 px-4 py-2 text-xs whitespace-nowrap`} href={discovery ? "/interpreter/find-requests#main-content" : `${interpreter ? "/interpreter/my-assignments" : `${workspaceBase}/my-requests`}/${r.requestId}#main-content`}>{tr("ดูรายละเอียด", "View details", "查看详情")}<ArrowRightIcon aria-hidden="true" className="h-4 w-4 shrink-0" /></Link></div>
    </li>;
  }
  return <main id="main-content" className="mx-auto max-w-[1480px] px-5 py-8 sm:px-8 lg:px-8 lg:py-10">
    <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
      <div>
        <p className="text-sm font-semibold text-(--khvi-teal)">{tr("ยินดีต้อนรับ", "Welcome", "欢迎")}</p>
        <h1 className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-2 text-3xl font-bold">
          <span className="break-words">{user.name}</span>
          {interpreterAccount && <span className="inline-flex items-center gap-2 rounded-full border border-(--khvi-teal)/20 bg-white px-4 py-2 text-base font-bold text-(--khvi-ink)" aria-label={interpreterRating?.average != null ? tr(`คะแนนรีวิวเฉลี่ย ${interpreterRating.average.toFixed(2)} จาก 5 จาก ${interpreterRating.reviewCount} รีวิว`, `Average rating ${interpreterRating.average.toFixed(2)} out of 5 from ${interpreterRating.reviewCount} reviews`, `平均评分 ${interpreterRating.average.toFixed(2)} / 5，共 ${interpreterRating.reviewCount} 条评价`) : interpreterRating ? tr("ยังไม่มีรีวิว", "No reviews yet", "暂无评价") : tr("คะแนนรีวิวไม่พร้อมใช้งาน", "Rating unavailable", "评分暂不可用")}>
            <StarIcon className="h-6 w-6 shrink-0 text-(--khvi-sun)" aria-hidden="true" />
            {interpreterRating?.average != null ? <><span className="text-xl leading-none sm:text-2xl">{interpreterRating.average.toFixed(2)} / 5</span><span className="text-sm font-medium text-(--khvi-ink)/65">({interpreterRating.reviewCount})</span></> : interpreterRating ? tr("ยังไม่มีรีวิว", "No reviews yet", "暂无评价") : tr("คะแนนรีวิวไม่พร้อมใช้งาน", "Rating unavailable", "评分暂不可用")}
          </span>}
        </h1>
      </div>
      {interpreterAccount ? (
        <div className="w-full sm:w-auto">
          <p className="mb-2 text-xs font-bold text-(--khvi-ink)/65 sm:text-right">{tr("เลือกโหมดการใช้งาน", "Choose how to use KHVI", "选择使用模式")}</p>
          <div role="group" aria-label={tr("สลับระหว่างการช่วยเหลือและการขอความช่วยเหลือ", "Switch between helping and requesting help", "在提供帮助和请求帮助之间切换")} className="grid min-h-12 w-full grid-cols-2 rounded-full border border-(--khvi-teal)/30 bg-white p-1 shadow-sm sm:w-auto sm:min-w-[330px]">
            {(["helper", "requester"] as const).map((mode) => {
              const selected = interpreterMode === mode;
              return <button key={mode} type="button" aria-pressed={selected} onClick={() => onInterpreterModeChange?.(mode)} className={`min-h-10 rounded-full px-4 py-2 text-sm font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--khvi-sun) ${selected ? "bg-(--khvi-navy) text-white shadow-sm" : "text-(--khvi-ink)/70 hover:bg-(--khvi-paper)"}`}>
                {mode === "helper" ? tr("เข้ามาช่วยเหลือ", "Help others", "提供帮助") : tr("เข้ามาขอความช่วยเหลือ", "Request help", "请求帮助")}
              </button>;
            })}
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-3">
          {applicationStatus && applicationStatus !== "approved" && !interpreterAccess.revoked ? (
            <Link
              className="inline-flex min-h-10 items-center justify-center rounded-full bg-(--khvi-navy) px-4 py-2 text-sm font-bold text-white shadow-sm hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--khvi-sun)"
              href="/user/volunteer/status#main-content"
            >
              {tr("ดูสถานะการสมัคร", "View application status", "查看申请状态")}
            </Link>
          ) : !applicationStatus && interpreterAccess.verified && !interpreterAccess.revoked ? (
            <Link
              className="inline-flex min-h-10 items-center justify-center rounded-full bg-(--khvi-navy) px-4 py-2 text-sm font-bold text-white shadow-sm hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--khvi-sun)"
              href="/user/volunteer/apply#main-content"
            >
              {tr("สมัครล่ามอาสา", "Volunteer apply", "申请志愿口译员")}
            </Link>
          ) : null}
        </div>
      )}
    </div>
    <div className={interpreter ? "grid items-start gap-5 md:items-stretch md:grid-cols-[minmax(0,1fr)_minmax(260px,360px)]" : "grid items-start gap-5 md:items-stretch md:grid-cols-[1.5fr_1fr]"}>
      <section className="order-2 relative min-h-[420px] overflow-hidden rounded-(--khvi-radius-lg) bg-(--khvi-navy) text-white sm:min-h-[380px] md:order-1">
        <ResponsiveHeroImage
          desktopSrc={interpreter ? "/khvi-interpreter-hero.png" : "/khvi-requester-hero.png"}
          mobileSrc={interpreter ? "/khvi-interpreter-hero-mobile.png" : "/khvi-requester-hero-mobile.png"}
          alt={interpreter
            ? tr("ล่ามอาสาช่วยผู้ใช้สื่อสารกับเจ้าหน้าที่บริการชุมชน", "A volunteer interpreter helping a user speak with a community service worker", "志愿口译员帮助用户与社区服务人员沟通")
            : tr("ผู้ขอความช่วยเหลือกำลังรับคำอธิบายจากล่ามอาสา", "A requester receiving an explanation from a volunteer interpreter", "求助者正在听志愿口译员讲解")}
          sizes="(min-width: 1024px) 60vw, 100vw"
          className="object-center md:object-[58%_center]"
        />
        <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(180deg,rgba(9,47,69,0.30)_0%,rgba(9,47,69,0.82)_58%,rgba(9,47,69,0.97)_100%)] md:bg-[linear-gradient(90deg,rgba(9,47,69,0.97)_0%,rgba(9,47,69,0.82)_50%,rgba(9,47,69,0.18)_100%)]" />
        <div className="relative z-10 flex min-h-[420px] flex-col items-start justify-end p-6 sm:min-h-[380px] sm:p-9">
          <span className="flex items-center gap-2 text-sm text-white/80"><LanguageIcon className="h-5 w-5" aria-hidden="true" /> KHVI · {tr("สื่อสารเข้าใจ ช่วยเหลือใกล้ตัว", "Community language help", "社区语言帮助")}</span>
          <h2 className="mt-6 max-w-lg text-3xl font-bold leading-tight sm:text-4xl">{interpreter ? tr("ใช้ภาษาที่คุณถนัด ช่วยให้ใครสักคนเข้าใจ", "Help someone be understood.", "用你的语言能力，帮助身边的人。") : tr("ต้องการความช่วยเหลือด้านภาษา เริ่มได้ที่นี่", "A little language help starts here.", "沟通有困难？从这里开始。")}</h2>
          <div className="mt-5 max-w-lg border-l-2 border-white/45 pl-4">
            <p className="leading-8 text-white/85">{interpreter ? tr("ค้นหาคำขอตามภาษา หมวดหมู่ และระยะทาง ตรวจสอบก่อนรับงาน และรับผิดชอบครั้งละหนึ่งภารกิจ", "Explore requests by language, category and distance. Review each request and take one assignment at a time.", "按语言、类别和距离查找请求。确认详情后接单，一次只接受一个任务。") : tr("เลือกภาษา หมวดหมู่ และจุดนัดพบ ล่ามที่ตรงเงื่อนไขจะเป็นผู้เลือกกดรับคำขอของคุณ", "Choose a language, category and meeting point. A suitable interpreter chooses to claim your request.", "选择语言、类别和见面地点，符合条件的口译员会自行接单。")}</p>
          </div>
          {!interpreter && <Link className={`${heroButton} mt-7`} href={`${workspaceBase}/request-help#main-content`}>{tr("ต้องการขอความช่วยเหลือ", "Create a help request", "创建求助请求")}</Link>}
        </div>
      </section>
      {!interpreter && (
        <aside className={`${panel} ${current ? "order-1" : "order-3"} flex h-fit self-start flex-col border-l-4 border-l-(--khvi-teal) md:order-2 md:h-auto md:self-stretch`} aria-labelledby="current-title">
          <div className="flex min-w-0 flex-wrap justify-between gap-3">
            <h2 id="current-title" className="min-w-0 flex-1 break-words text-lg font-bold leading-7 sm:text-xl">{tr("คำขอความช่วยเหลือที่กำลังดำเนินการ", "Current help request", "当前进行中的求助")}</h2>
          </div>
          {current ? <div className="flex min-h-0 flex-1 flex-col">
            <dl className="mt-6 divide-y divide-(--khvi-teal)/15 border-y border-(--khvi-teal)/15 text-sm">
              <div className="grid min-w-0 gap-1 py-4 sm:grid-cols-[8rem_minmax(0,1fr)] lg:grid-cols-1 xl:grid-cols-[8rem_minmax(0,1fr)]">
                <dt className="break-words text-xs font-bold leading-5 text-(--khvi-ink)/60 sm:text-sm">{tr("ภาษาและหมวดหมู่", "Language and category", "语言和类别")}</dt>
                <dd className="min-w-0 break-words text-sm font-semibold leading-6 text-(--khvi-ink)">{lang(current)} · {cat(current)}</dd>
              </div>
            </dl>
            <RequestProgress status={current.status} tr={tr} />
            {current.status === "Open" && current.expiresAt && <div className="mt-4"><ExpiryCountdown key={current.requestId} seconds={0} expiresAt={current.expiresAt} copyLocale={locale === "th" ? "th" : copyLocale} /></div>}
            {current.status !== "Open" && <p className="my-4 break-words rounded-lg bg-(--khvi-teal)/10 px-4 py-3 text-sm leading-6" role="status">{nextAction}</p>}
            {current.interpreter && <div className="mb-4 flex items-center gap-3"><LanguageIcon className="h-6 w-6 shrink-0 text-(--khvi-teal)" aria-hidden="true" /><div><p className="text-xs font-bold text-(--khvi-ink)/60">{tr("ล่ามที่รับงาน", "Assigned interpreter", "接单口译员")}</p><p className="font-bold">{current.interpreter.name}</p><p className="text-sm text-(--khvi-ink)/70">{current.interpreter.primaryLanguage}</p></div></div>}
            <div className="mt-auto pt-7">
              <Link className={`${button} w-full text-center leading-6`} href={`${interpreter ? "/interpreter/my-assignments" : `${workspaceBase}/my-requests`}/${current.requestId}#main-content`}>{tr("ดูรายละเอียดทั้งหมด", "View all details", "查看全部详情")}<ArrowRightIcon className="h-4 w-4 shrink-0" aria-hidden="true" /></Link>
              {active.length > 1 && <p className={muted}>{tr("คุณมีหลายรายการที่กำลังดำเนินการ สามารถเปิดดูรายการทั้งหมดได้", "You have multiple active records. Open the full list to view them all.", "您有多个进行中的记录，请在完整列表中查看。")}</p>}
            </div>
          </div> : <div className="mt-5 flex flex-1 flex-col items-center justify-center border-t border-(--khvi-teal)/15 py-6 text-center sm:py-8">
            <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-(--khvi-teal)/10 sm:h-24 sm:w-24">
              <ClipboardDocumentListIcon className="h-10 w-10 text-(--khvi-teal) sm:h-12 sm:w-12" aria-hidden="true" />
            </div>
            <h3 className="text-lg font-bold text-(--khvi-ink)">{tr("ยังไม่มีคำขอที่กำลังดำเนินการ", "No active help requests", "暂无进行中的求助")}</h3>
            <p className="mt-2 max-w-[28ch] text-sm leading-7 text-(--khvi-ink)/70">{tr("เมื่อมีคำขอ คุณจะติดตามสถานะและล่ามที่รับงานได้ที่นี่", "Track your request status and assigned interpreter here when you have an active request.", "有进行中的求助时，可在此查看状态及接单口译员。")}</p>
          </div>}
        </aside>
      )}
      {interpreter && (current ? <aside className={`${panel} order-1 h-fit self-start border-l-4 border-l-(--khvi-teal) md:order-2 md:h-full md:self-stretch`} aria-labelledby="active-assignment-title">
        <div className="flex flex-wrap justify-between gap-3">
          <h2 id="active-assignment-title" className="text-xl font-bold">{tr("งานที่กำลังดำเนินการ", "Current assignment", "进行中的任务")}</h2>
          <div className="flex flex-wrap gap-2"><UrgencyBadge urgency={current.urgency} copyLocale={locale === "th" ? "th" : copyLocale} /><StatusBadge status={current.status} copyLocale={locale === "th" ? "th" : copyLocale} /></div>
        </div>
        <dl className="mt-5 divide-y divide-(--khvi-teal)/15 border-y border-(--khvi-teal)/15 text-sm">
          <div className="grid gap-1 py-3">
            <dt className="font-bold text-(--khvi-ink)/60">{tr("ภาษาและหมวดหมู่", "Language and category", "语言和类别")}</dt>
            <dd className="font-semibold text-(--khvi-ink)">{lang(current)} · {cat(current)}</dd>
          </div>
          <div className="grid gap-1 py-3">
            <dt className="font-bold text-(--khvi-ink)/60">{tr("พื้นที่นัดพบ", "Meeting area", "见面区域")}</dt>
            <dd className="text-(--khvi-ink)">{current.areaName}</dd>
          </div>
        </dl>
        <p className="my-4 rounded-lg bg-(--khvi-teal)/10 px-4 py-3 text-sm leading-6" role="status">{nextAction}</p>
        {current.requester && <div className="mb-4 flex items-center gap-3"><LanguageIcon className="h-6 w-6 shrink-0 text-(--khvi-teal)" aria-hidden="true" /><div><p className="text-xs font-bold text-(--khvi-ink)/60">{tr("ผู้ขอความช่วยเหลือ", "Requester", "求助者")}</p><p className="font-bold">{current.requester.name}</p></div></div>}
        <Link className={`${button} mt-6 w-full shrink-0`} href={`${interpreter ? "/interpreter/my-assignments" : `${workspaceBase}/my-requests`}/${current.requestId}#main-content`}>{tr("ดูรายละเอียดทั้งหมด", "View all details", "查看全部详情")}<ArrowRightIcon className="h-4 w-4 shrink-0" aria-hidden="true" /></Link>
        {active.length > 1 && <p className={muted}>{tr("คุณมีหลายงานที่กำลังดำเนินการ สามารถเปิดดูงานทั้งหมดได้", "You have multiple active assignments. Open your assignments to view them all.", "您有多个进行中的任务，请打开任务列表查看全部内容。")}</p>}
      </aside> : <aside className={`${panel} order-1 flex min-h-0 h-fit flex-col self-start md:order-2 md:h-full md:self-stretch`} aria-labelledby="nearby-title">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 id="nearby-title" className="flex items-center gap-2 text-lg font-bold leading-7 sm:text-xl"><MapPinIcon className="h-5 w-5 shrink-0 text-(--khvi-teal)" aria-hidden="true" />{tr("คำขอใกล้เคียง", "Nearby requests", "附近求助")}</h2>
          </div>
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
      </aside>)}
    </div>
    {interpreter && <section className={`${panel} mt-7 flex flex-col`} aria-labelledby="discover-title"><h2 id="discover-title" className="flex items-center gap-2 text-xl font-bold"><MagnifyingGlassIcon className="h-6 w-6 shrink-0 text-(--khvi-teal)" aria-hidden="true" />{tr("ค้นหาคำขอที่เหมาะกับคุณ", "Explore suitable requests", "查找合适的请求")}</h2><p className={muted}>{tr("ค้นหาและกรองคำขอที่ตรงกับความสามารถของคุณ", "Filter open requests that match your skills.", "按技能筛选符合您能力的求助任务。")}</p><div className="mt-4 grid gap-4 sm:grid-cols-2"><label className="text-sm font-bold">{tr("ภาษา", "Language", "语言")}<select className="mt-2 min-h-12 w-full rounded-lg border border-(--khvi-teal)/30 bg-white px-3" value={language} onChange={e => setLanguage(e.target.value)}><option value="all">{tr("ทุกภาษา", "All languages", "全部语言")}</option>{referenceCatalog.languages.map(option => <option key={option.id} value={option.id}>{referenceLabel([option], option.id, locale)}</option>)}</select></label><label className="text-sm font-bold">{tr("หมวดหมู่", "Category", "类别")}<select className="mt-2 min-h-12 w-full rounded-lg border border-(--khvi-teal)/30 bg-white px-3" value={category} onChange={e => setCategory(e.target.value)}><option value="all">{tr("ทุกหมวดหมู่", "All categories", "全部类别")}</option>{referenceCatalog.categories.map(option => <option key={option.id} value={option.id}>{referenceLabel([option], option.id, locale)}</option>)}</select></label></div>{open.length ? <ul className="mt-3 divide-y divide-(--khvi-teal)/20">{open.map(r => requestRow(r, true))}</ul> : <p role="status" className="my-6 rounded-lg bg-(--khvi-paper) p-5 text-sm leading-7">{diagnostic?.status === "application_not_approved" ? tr("ใบสมัครล่ามของคุณยังไม่ได้รับการอนุมัติ จึงยังไม่สามารถดูคำขอเปิดได้", "Your interpreter application is pending approval.", "您的口译员申请正在审核中，暂无法查看开放任务。") : diagnostic?.status === "no_matching_skills" ? tr("ยังไม่มีคำขอเปิดที่ตรงกับภาษาหรือหมวดหมู่ที่คุณได้รับอนุมัติ", "No open requests currently match your approved skills.", "当前暂无符合您获批技能的求助任务。") : tr("ยังไม่มีคำขอเปิดที่ตรงกับเงื่อนไขการค้นหา ลองเปลี่ยนภาษา หมวดหมู่ หรือระยะค้นหา", "No open requests match these filters. Try another language, category or distance.", "没有符合筛选条件的开放求助，请调整语言、类别或距离。")}</p>}<Link className={`${button} mt-4 min-h-10 shrink-0 self-start px-4 py-2 text-xs`} href="/interpreter/find-requests#main-content">{tr("เปิดแผนที่", "Open the map", "打开地图")}</Link></section>}
    <section className={`${panel} mt-7 flex flex-col`}><div className="flex min-w-0 flex-wrap items-center justify-between gap-3"><h2 className="flex min-w-0 items-center gap-2 text-xl font-bold">{interpreter && <ClockIcon className="h-6 w-6 shrink-0 text-(--khvi-teal)" aria-hidden="true" />}{interpreter ? tr("งานที่ผ่านมาของคุณ", "Your past work", "您的历史工作") : tr("คำขอล่าสุด", "Recent requests", "最近的请求")}</h2><Link className={`${button} min-h-10 shrink-0 px-4 py-2 text-xs`} href={listPath}>{tr("ดูทั้งหมด", "View all", "查看全部")}</Link></div>{recent.length ? <ul className="min-w-0 divide-y divide-(--khvi-teal)/20">{recent.map(r => requestRow(r, false))}</ul> : <div className="flex items-start gap-4 py-6"><ClipboardDocumentListIcon className="h-8 w-8 shrink-0 text-(--khvi-teal)" aria-hidden="true" /><div><p className="text-sm leading-7">{interpreter ? tr("ยังไม่มีงานที่ผ่านมา เมื่อล่ามรับงาน รายการจะแสดงที่นี่", "You have no past assignments yet. Claimed assignments will appear here.", "您还没有历史任务，接取任务后会显示在这里。") : tr("ยังไม่มีคำขอล่าสุด เมื่อคุณส่งคำขอความช่วยเหลือ รายการจะแสดงที่นี่", "You have no recent requests yet. Requests you submit will appear here.", "您还没有最近的求助，提交求助后会显示在这里。")}</p><Link className={`${button} mt-3 min-h-10 px-4 py-2 text-xs`} href={interpreter ? "/interpreter/find-requests#main-content" : `${workspaceBase}/request-help#main-content`}>{interpreter ? tr("ค้นหาคำขอ", "Find requests", "查找求助") : tr("ขอความช่วยเหลือ", "Request help", "请求帮助")}</Link></div></div>}</section>
    <div className="mt-7 grid items-stretch gap-5 md:grid-cols-2">
      <section id="volunteer-application" className="h-full scroll-mt-28 [&>section]:h-full">{!applicationLoaded || !applicationResult.verified || (interpreterAccount && !activeApplication) ? null : <ApplicationStatusCard application={activeApplication} />}</section>
      <section className={`${panel} h-full`}>
        <ChatBubbleLeftRightIcon className="h-7 w-7 text-(--khvi-teal)" aria-hidden="true" />
        <h2 className="mt-3 text-xl font-bold">{tr("ช่องทางติดต่อหากพบปัญหา", "Contact us if you have a problem", "遇到问题时的联系方式")}</h2>
        <p className={muted}>{tr("หากพบปัญหาในการใช้งานหรือต้องการความช่วยเหลือเพิ่มเติม ติดต่อเราได้ที่", "If you run into a problem or need further help, contact us through:", "如果遇到使用问题或需要更多帮助，请通过以下方式联系我们：")}</p>
        <div className="mt-4 space-y-3 text-sm leading-6">
          <a className="flex items-center gap-3 font-bold text-(--khvi-ink) underline-offset-4 hover:text-(--khvi-teal) hover:underline" href="tel:0653735884"><PhoneIcon className="h-5 w-5 shrink-0 text-(--khvi-teal)" aria-hidden="true" /><span>0653735884</span></a>
          <a className="flex min-w-0 items-center gap-3 font-bold text-(--khvi-ink) underline-offset-4 hover:text-(--khvi-teal) hover:underline" href="mailto:wasutorn5884@gmail.com"><EnvelopeIcon className="h-5 w-5 shrink-0 text-(--khvi-teal)" aria-hidden="true" /><span className="break-all">wasutorn5884@gmail.com</span></a>
        </div>
        {!interpreter && completed.length > 0 && <div className="mt-6 border-t border-(--khvi-teal)/20 pt-5">
          <ShieldCheckIcon className="h-7 w-7 text-(--khvi-teal)" aria-hidden="true" />
          <h3 className="mt-3 text-lg font-bold">{tr("รีวิวหลังจบภารกิจ", "Review after completion", "完成后评价")}</h3>
          <p className={muted}>{pendingReviews.length
            ? tr(`มีงานที่เสร็จแล้ว ${completed.length} รายการ และมี ${pendingReviews.length} รายการรอรีวิว`, `${pendingReviews.length} of ${completed.length} completed assignments are waiting for your review.`, `${pendingReviews.length} / ${completed.length} 个已完成任务等待评价。`)
            : tr("คุณรีวิวงานที่เสร็จแล้วครบถ้วนแล้ว", "All completed assignments have been reviewed.", "所有已完成任务都已评价。")}</p>
          {pendingReviews[0] && <Link className={`${button} mt-4 min-h-10 self-start px-4 py-2 text-xs`} href={`${workspaceBase}/my-requests/${pendingReviews[0].requestId}#main-content`}>{tr("ไปรีวิวงานที่เสร็จแล้ว", "Review a completed assignment", "评价已完成任务")}<ArrowRightIcon className="h-4 w-4" aria-hidden="true" /></Link>}
        </div>}
      </section>
    </div>
  </main>;
}
