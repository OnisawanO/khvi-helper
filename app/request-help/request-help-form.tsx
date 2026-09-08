"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { createRequest } from "@/app/lib/request-store";
import { useRef, useState, type SubmitEvent } from "react";
import {
  ArrowLeftIcon,
  BoltIcon,
  CalendarDaysIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  EyeSlashIcon,
  LockClosedIcon,
  MapPinIcon,
} from "@heroicons/react/24/outline";
import { useCopyLocale } from "@/app/components/app-shell";
import { CATEGORIES, LANGUAGES, type CategoryId, type LanguageId, type Urgency } from "@/app/lib/mock-requests";

const SCHEDULE_WINDOW_HOURS = 24;

const copy = {
  en: {
    back: "Back to my requests",
    label: "New help request",
    title: "Create a help request pin",
    intro: "One language and one category per request. Interpreters who match both can claim it.",
    urgencyLegend: "How soon is help needed?",
    urgency: {
      Immediate: { title: "Urgent", detail: "Help needed within about 15 minutes. The pin expires after 30 minutes without a claim." },
      Scheduled: { title: "Scheduled", detail: `An appointment within the next ${SCHEDULE_WINDOW_HOURS} hours.` },
    },
    scheduleLabel: "Appointment time",
    scheduleHint: `Choose a time within the next ${SCHEDULE_WINDOW_HOURS} hours.`,
    languageLabel: "Language needed",
    languagePlaceholder: "Select one language",
    categoryLabel: "Category",
    categoryPlaceholder: "Select one category",
    descriptionLabel: "What should the interpreter know?",
    descriptionHint: "Symptoms, documents, landmarks, or anything that helps them prepare. Optional.",
    locationLegend: "Where is help needed?",
    placeLabel: "Place or meeting point",
    placePlaceholder: "Hospital name, building, counter number",
    gpsButton: "Use my current location",
    gpsLoading: "Reading location",
    gpsReady: "Coordinates attached",
    gpsHint: "Coordinates stay approximate on the map until an interpreter claims the request.",
    gpsDenied: "Location permission was denied. The place description will be used instead.",
    gpsUnavailable: "This browser cannot share a location. The place description will be used instead.",
    gpsMissing: "No coordinates attached. You can save a meeting point, but this preview will not place it on a map.",
    submit: "Create request pin",
    privacyTitle: "What interpreters can see",
    beforeClaim: "Before a claim",
    afterClaim: "Unlocked after a claim",
    beforeItems: ["Language and category", "Approximate area", "How urgent the request is"],
    afterItems: ["Exact coordinates, if provided", "Full place description"],
    errors: {
      language: "Select the language you need.",
      category: "Select one category.",
      place: "Describe the place where help is needed.",
      scheduleMissing: "Choose the appointment time.",
      scheduleRange: `The appointment must be within the next ${SCHEDULE_WINDOW_HOURS} hours.`,
    },
    createdTitle: "Request pin created",
    createdBody: "Matching interpreters nearby can see it now. You will see contact details as soon as one claims it.",
    createdTrack: "Track this request",
    createdList: "See all my requests",
  },
  zh: {
    back: "返回我的求助",
    label: "新建求助",
    title: "创建语言求助点",
    intro: "每个求助只选一种语言和一个类别。语言与类别都匹配的口译员才能接取。",
    urgencyLegend: "多久需要帮助？",
    urgency: {
      Immediate: { title: "紧急", detail: "约 15 分钟内需要帮助。30 分钟内无人接取则自动过期。" },
      Scheduled: { title: "预约", detail: `未来 ${SCHEDULE_WINDOW_HOURS} 小时内的预约。` },
    },
    scheduleLabel: "预约时间",
    scheduleHint: `请选择未来 ${SCHEDULE_WINDOW_HOURS} 小时内的时间。`,
    languageLabel: "需要的语言",
    languagePlaceholder: "选择一种语言",
    categoryLabel: "类别",
    categoryPlaceholder: "选择一个类别",
    descriptionLabel: "口译员需要了解什么？",
    descriptionHint: "症状、文件、地标等有助于准备的信息。可选填。",
    locationLegend: "在哪里需要帮助？",
    placeLabel: "地点或碰面处",
    placePlaceholder: "医院名称、楼栋、柜台号",
    gpsButton: "使用我的当前位置",
    gpsLoading: "正在读取位置",
    gpsReady: "已附加坐标",
    gpsHint: "在口译员接取之前，地图上只显示大致坐标。",
    gpsDenied: "位置权限被拒绝，将改用地点描述。",
    gpsUnavailable: "此浏览器无法共享位置，将改用地点描述。",
    gpsMissing: "尚未附加坐标，口译员只会看到地点描述。",
    submit: "创建求助点",
    privacyTitle: "口译员能看到什么",
    beforeClaim: "接取之前",
    afterClaim: "接取之后解锁",
    beforeItems: ["语言和类别", "大致区域", "紧急程度"],
    afterItems: ["准确坐标", "完整地点描述", "你的电话号码"],
    errors: {
      language: "请选择需要的语言。",
      category: "请选择一个类别。",
      place: "请描述需要帮助的地点。",
      scheduleMissing: "请选择预约时间。",
      scheduleRange: `预约时间必须在未来 ${SCHEDULE_WINDOW_HOURS} 小时内。`,
    },
    createdTitle: "求助点已创建",
    createdBody: "附近匹配的口译员现在可以看到它。一旦有人接取，你就会看到联系方式。",
    createdTrack: "查看这条求助",
    createdList: "查看全部求助",
  },
} as const;

type Errors = Partial<Record<"language" | "category" | "place" | "schedule", string>>;
type GpsState =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "ready"; latitude: number; longitude: number }
  | { kind: "denied" }
  | { kind: "unavailable" };

function toDateTimeInputValue(date: Date): string {
  const pad = (value: number) => String(value).padStart(2, "0");

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

const fieldClass =
  "w-full rounded-lg border border-[#cbd7dc] bg-white px-3.5 py-3 text-sm font-semibold text-(--khvi-ink) transition-colors hover:border-[#8fbfc1]";
const labelClass = "block text-sm font-extrabold text-[#294554]";
const hintClass = "mt-1.5 text-xs leading-5 text-[#73848a]";

export function RequestHelpForm() {
  const saving = useRef(false);
  const router = useRouter();
  const copyLocale = useCopyLocale();
  const t = copy[copyLocale];

  const [urgency, setUrgency] = useState<Urgency>("Immediate");
  const [languageId, setLanguageId] = useState<LanguageId | "">("");
  const [categoryId, setCategoryId] = useState<CategoryId | "">("");
  const [description, setDescription] = useState("");
  const [place, setPlace] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [scheduleBounds, setScheduleBounds] = useState<{ min: string; max: string } | null>(null);
  const [gps, setGps] = useState<GpsState>({ kind: "idle" });
  const [errors, setErrors] = useState<Errors>({});
  const [saveError, setSaveError] = useState("");

  /** Bounds are read when the user picks "Scheduled" so the window starts from the real current time. */
  function selectUrgency(option: Urgency) {
    setUrgency(option);

    if (option === "Scheduled") {
      const now = new Date();
      const limit = new Date(now.getTime() + SCHEDULE_WINDOW_HOURS * 60 * 60 * 1000);

      setScheduleBounds({ min: toDateTimeInputValue(now), max: toDateTimeInputValue(limit) });
    }
  }

  function requestLocation() {
    if (!("geolocation" in navigator)) {
      setGps({ kind: "unavailable" });
      return;
    }

    setGps({ kind: "loading" });
    navigator.geolocation.getCurrentPosition(
      (position) =>
        setGps({ kind: "ready", latitude: position.coords.latitude, longitude: position.coords.longitude }),
      () => setGps({ kind: "denied" }),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving.current) return;

    const nextErrors: Errors = {};

    if (!languageId) {
      nextErrors.language = t.errors.language;
    }

    if (!categoryId) {
      nextErrors.category = t.errors.category;
    }

    if (!place.trim()) {
      nextErrors.place = t.errors.place;
    }

    if (urgency === "Scheduled") {
      if (!scheduledAt) {
        nextErrors.schedule = t.errors.scheduleMissing;
      } else if (!Number.isFinite(Date.parse(scheduledAt)) || Date.parse(scheduledAt) <= Date.now() || Date.parse(scheduledAt) > Date.now() + 86400000) {
        nextErrors.schedule = t.errors.scheduleRange;
      }
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length === 0 && languageId && categoryId) {
      saving.current = true;
      try {
        const id = createRequest({ languageId, categoryId, description: description.trim(), urgency,
          exactAddress: place.trim(), latitude: gps.kind === "ready" ? gps.latitude : null,
          longitude: gps.kind === "ready" ? gps.longitude : null }, scheduledAt);
        router.push(`/my-requests/${id}`);
      } catch {
        saving.current = false;
        setSaveError("Could not save your request. Check browser storage permissions and try again. Your form is still here.");
      }
    }
  }


  return (
    <main id="main-content" className="flex-1 px-5 py-8 sm:px-8 lg:px-12 lg:py-10">
      <div className="mx-auto max-w-[1180px]">
        <Link
          className="inline-flex items-center gap-2 text-sm font-extrabold text-[#087f80] transition-colors hover:text-[#0a6465]"
          href="/my-requests"
        >
          <ArrowLeftIcon aria-hidden="true" className="h-4 w-4" />
          {t.back}
        </Link>

        <p className="mt-6 text-sm font-extrabold text-[#087f80]">{t.label}</p>
        <h1 className="mt-1.5 text-3xl font-extrabold tracking-normal text-[#122b3e] sm:text-4xl">{t.title}</h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-[#64777e]">{t.intro}</p>

          <div className="mt-7 grid items-start gap-6 lg:grid-cols-[1.35fr_0.65fr]">
            <form className="border border-[#d6e0e4] bg-white p-5 sm:p-6" noValidate onSubmit={handleSubmit}>
              <fieldset>
                <legend className={labelClass}>{t.urgencyLegend}</legend>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  {(["Immediate", "Scheduled"] as const).map((option) => {
                    const Icon = option === "Immediate" ? BoltIcon : CalendarDaysIcon;

                    return (
                      <label
                        key={option}
                        className={`flex cursor-pointer gap-3 border p-4 transition-colors ${
                          urgency === option
                            ? option === "Immediate"
                              ? "border-(--khvi-coral) bg-[#fff6f4]"
                              : "border-[#087f80] bg-[#edf7f5]"
                            : "border-[#d6e0e4] bg-white hover:border-[#8fbfc1]"
                        }`}
                      >
                        <input
                          type="radio"
                          name="urgency"
                          value={option}
                          checked={urgency === option}
                          className="mt-1 h-4 w-4 shrink-0 accent-[#087f80]"
                          onChange={() => selectUrgency(option)}
                        />
                        <span>
                          <span className="flex items-center gap-2 text-sm font-extrabold text-[#173646]">
                            <Icon aria-hidden="true" className="h-5 w-5" />
                            {t.urgency[option].title}
                          </span>
                          <span className="mt-1.5 block text-xs leading-5 text-[#64777e]">{t.urgency[option].detail}</span>
                        </span>
                      </label>
                    );
                  })}
                </div>
              </fieldset>

              {urgency === "Scheduled" && (
                <div className="mt-5">
                  <label className={labelClass} htmlFor="scheduled-at">
                    {t.scheduleLabel}
                  </label>
                  <input
                    id="scheduled-at"
                    type="datetime-local"
                    className={`mt-2 ${fieldClass}`}
                    value={scheduledAt}
                    min={scheduleBounds?.min}
                    max={scheduleBounds?.max}
                    aria-describedby="scheduled-at-hint"
                    aria-invalid={Boolean(errors.schedule)}
                    onChange={(event) => setScheduledAt(event.target.value)}
                  />
                  <p className={hintClass} id="scheduled-at-hint">
                    {t.scheduleHint}
                  </p>
                  {errors.schedule && <FieldError message={errors.schedule} />}
                </div>
              )}

              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <div>
                  <label className={labelClass} htmlFor="language">
                    {t.languageLabel}
                  </label>
                  <select
                    id="language"
                    className={`mt-2 ${fieldClass}`}
                    value={languageId}
                    aria-invalid={Boolean(errors.language)}
                    onChange={(event) => setLanguageId(event.target.value as LanguageId)}
                  >
                    <option value="">{t.languagePlaceholder}</option>
                    {LANGUAGES.map((language) => (
                      <option key={language.id} value={language.id}>
                        {language[copyLocale]}
                      </option>
                    ))}
                  </select>
                  {errors.language && <FieldError message={errors.language} />}
                </div>

                <div>
                  <label className={labelClass} htmlFor="category">
                    {t.categoryLabel}
                  </label>
                  <select
                    id="category"
                    className={`mt-2 ${fieldClass}`}
                    value={categoryId}
                    aria-invalid={Boolean(errors.category)}
                    onChange={(event) => setCategoryId(event.target.value as CategoryId)}
                  >
                    <option value="">{t.categoryPlaceholder}</option>
                    {CATEGORIES.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category[copyLocale]}
                      </option>
                    ))}
                  </select>
                  {errors.category && <FieldError message={errors.category} />}
                </div>
              </div>

              <div className="mt-5">
                <label className={labelClass} htmlFor="description">
                  {t.descriptionLabel}
                </label>
                <textarea
                  id="description"
                  rows={4}
                  maxLength={500}
                  className={`mt-2 resize-y ${fieldClass}`}
                  value={description}
                  aria-describedby="description-hint"
                  onChange={(event) => setDescription(event.target.value)}
                />
                <p className={hintClass} id="description-hint">
                  {t.descriptionHint}
                </p>
              </div>

              <fieldset className="mt-6 border-t border-[#e3ebef] pt-5">
                <legend className={labelClass}>{t.locationLegend}</legend>

                <div className="mt-3">
                  <label className={labelClass} htmlFor="place">
                    {t.placeLabel}
                  </label>
                  <input
                    id="place"
                    type="text"
                    className={`mt-2 ${fieldClass}`}
                    placeholder={t.placePlaceholder}
                    value={place}
                    aria-invalid={Boolean(errors.place)}
                    onChange={(event) => setPlace(event.target.value)}
                  />
                  {errors.place && <FieldError message={errors.place} />}
                </div>

                <button
                  type="button"
                  className="mt-4 inline-flex h-12 items-center gap-2 rounded-lg border-2 border-[#087f80] px-4 text-sm font-extrabold text-[#087f80] transition-colors hover:bg-[#edf7f5] disabled:opacity-60"
                  disabled={gps.kind === "loading"}
                  onClick={requestLocation}
                >
                  <MapPinIcon aria-hidden="true" className="h-5 w-5" />
                  {gps.kind === "loading" ? t.gpsLoading : t.gpsButton}
                </button>

                <div aria-live="polite" className="mt-3">
                  {gps.kind === "ready" && (
                    <p className="flex items-start gap-2 text-xs font-bold leading-5 text-[#087557]">
                      <CheckCircleIcon aria-hidden="true" className="h-4 w-4 shrink-0" />
                      {t.gpsReady}: {gps.latitude.toFixed(5)}, {gps.longitude.toFixed(5)}
                    </p>
                  )}
                  {gps.kind === "denied" && <Notice message={t.gpsDenied} />}
                  {gps.kind === "unavailable" && <Notice message={t.gpsUnavailable} />}
                  {(gps.kind === "idle" || gps.kind === "loading") && <p className={hintClass}>{t.gpsHint}</p>}
                </div>
              </fieldset>

              {saveError && <FieldError message={saveError} />}
              <button
                type="submit"
                className="mt-7 flex h-14 w-full items-center justify-center gap-2 rounded-lg bg-(--khvi-coral) px-5 text-sm font-extrabold text-white shadow-[0_10px_20px_rgba(240,79,62,0.22)] transition-colors hover:bg-[#d94334]"
              >
                <MapPinIcon aria-hidden="true" className="h-5 w-5" />
                {t.submit}
              </button>
            </form>

            <aside className="border border-[#d6e0e4] bg-white p-5 lg:sticky lg:top-28">
              <h2 className="flex items-center gap-2 text-base font-extrabold text-[#173646]">
                <LockClosedIcon aria-hidden="true" className="h-5 w-5 text-[#087f80]" />
                {t.privacyTitle}
              </h2>

              <p className="mt-5 text-xs font-extrabold text-[#087f80]">{t.beforeClaim}</p>
              <ul className="mt-2.5 space-y-2 text-sm leading-6 text-[#52676f]">
                {t.beforeItems.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <CheckCircleIcon aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-[#087557]" />
                    {item}
                  </li>
                ))}
              </ul>

              <p className="mt-5 border-t border-[#e3ebef] pt-4 text-xs font-extrabold text-[#b5680b]">{t.afterClaim}</p>
              <ul className="mt-2.5 space-y-2 text-sm leading-6 text-[#52676f]">
                {t.afterItems.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <EyeSlashIcon aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-[#b5680b]" />
                    {item}
                  </li>
                ))}
              </ul>

              {gps.kind !== "ready" && (
                <p className="mt-5 flex items-start gap-2 border-t border-[#e3ebef] pt-4 text-xs leading-5 text-[#73848a]">
                  <ExclamationTriangleIcon aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-[#b5680b]" />
                  {t.gpsMissing}
                </p>
              )}
            </aside>
          </div>
      </div>
    </main>
  );
}

function FieldError({ message }: { message: string }) {
  return (
    <p role="alert" className="mt-2 flex items-start gap-2 text-xs font-bold leading-5 text-[#c33a2a]">
      <ExclamationTriangleIcon aria-hidden="true" className="h-4 w-4 shrink-0" />
      {message}
    </p>
  );
}

function Notice({ message }: { message: string }) {
  return (
    <p className="flex items-start gap-2 text-xs font-bold leading-5 text-[#b5680b]">
      <ExclamationTriangleIcon aria-hidden="true" className="h-4 w-4 shrink-0" />
      {message}
    </p>
  );
}
