"use client";

import { useRouter } from "next/navigation";
import { WorkspaceBreadcrumbs } from "@/app/components/workspace-breadcrumbs";
import { createBookingAction } from "@/app/actions/booking-actions";
import { useEffect, useMemo, useRef, useState, type SubmitEvent } from "react";
import {
  BoltIcon,
  CalendarDaysIcon,
  CheckCircleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ExclamationTriangleIcon,
  EyeSlashIcon,
  LockClosedIcon,
  MapIcon,
  MapPinIcon,
} from "@heroicons/react/24/outline";
import { useCopyLocale } from "@/app/components/app-shell";
import type { Urgency } from "@/app/lib/mock-requests";
import type { ReferenceOption } from "@/app/lib/reference-catalog";
import { LocationMapPicker, type LocationCoordinates } from "./location-map-picker";

const copy = {
  en: {
    breadcrumb: "Breadcrumb",
    main: "Main",
    label: "New help request",
    title: "Create a help request pin",
    intro: "One language and one category per request. Interpreters who match both can claim it.",
    urgencyLegend: "How soon is help needed?",
    urgency: {
      Immediate: { title: "Urgent", detail: "Help needed within about 15 minutes. The pin expires after 30 minutes without a claim." },
      Scheduled: { title: "Scheduled", detail: "Choose any time from the next calendar day onward." },
    },
    scheduleLabel: "Appointment time",
    scheduleHint: "Choose tomorrow or a later date. There is no maximum date.",
    scheduleDay: "Date",
    scheduleHour: "Hour",
    scheduleMinute: "Minute",
    selectedTime: "Selected time",
    timeWheelHint: "Scroll the hour and minute wheels vertically.",
    previousMonth: "Previous month",
    nextMonth: "Next month",
    selectedDate: "Selected date",
    languageLabel: "Language needed",
    languagePlaceholder: "Select one language",
    categoryLabel: "Category",
    categoryPlaceholder: "Select one category",
    descriptionLabel: "What should the interpreter know?",
    descriptionHint: "Symptoms, documents, landmarks, or anything that helps them prepare. Optional.",
    placeLabel: "Where is help needed? (Place or meeting point)",
    placePlaceholder: "Hospital name, building, counter number",
    gpsButton: "Use my current location",
    mapButton: "Choose on map",
    mapPickerTitle: "Choose a location on the map",
    mapPickerHint: "Tap the map to drop a pin, drag the pin, or move the map and use its center.",
    mapSelected: "Selected coordinates",
    mapUseCenter: "Use map center",
    mapConfirm: "Use this location",
    mapCancel: "Cancel",
    gpsLoading: "Reading location",
    gpsReady: "Coordinates attached",
    gpsHint: "Coordinates stay approximate until you confirm the interpreter who claims the request.",
    gpsDenied: "Location permission was denied. The place description will be used instead.",
    gpsUnavailable: "This browser cannot share a location. The place description will be used instead.",
    gpsMissing: "No coordinates attached. You can save a meeting point, but this preview will not place it on a map.",
    submit: "Create request pin",
    privacyTitle: "What interpreters can see",
    beforeClaim: "Before a claim",
    afterClaim: "After you confirm the interpreter",
    beforeItems: ["Language and category", "Approximate area", "How urgent the request is"],
    afterItems: ["Exact coordinates, if provided", "Full place description"],
    errors: {
      language: "Select the language you need.",
      category: "Select one category.",
      place: "Describe the place where help is needed.",
      scheduleMissing: "Choose the appointment date and time.",
      scheduleTooSoon: "Choose tomorrow or a later date.",
    },
    createdTitle: "Request pin created",
    createdBody: "Matching interpreters nearby can see it now. Review the interpreter who claims it, then confirm them to unlock contact details.",
    createdTrack: "Track this request",
    createdList: "See all my requests",
  },
  zh: {
    breadcrumb: "面包屑导航",
    main: "主页",
    label: "新建求助",
    title: "创建语言求助点",
    intro: "每个求助只选一种语言和一个类别。语言与类别都匹配的口译员才能接取。",
    urgencyLegend: "多久需要帮助？",
    urgency: {
      Immediate: { title: "紧急", detail: "约 15 分钟内需要帮助。30 分钟内无人接取则自动过期。" },
      Scheduled: { title: "预约", detail: "可选择从下一个日历日开始的任意时间。" },
    },
    scheduleLabel: "预约时间",
    scheduleHint: "请选择明天或之后的日期，不设最晚日期。",
    scheduleDay: "日期",
    scheduleHour: "小时",
    scheduleMinute: "分钟",
    selectedTime: "已选时间",
    timeWheelHint: "上下滑动小时和分钟滚轮。",
    previousMonth: "上个月",
    nextMonth: "下个月",
    selectedDate: "已选日期",
    languageLabel: "需要的语言",
    languagePlaceholder: "选择一种语言",
    categoryLabel: "类别",
    categoryPlaceholder: "选择一个类别",
    descriptionLabel: "口译员需要了解什么？",
    descriptionHint: "症状、文件、地标等有助于准备的信息。可选填。",
    placeLabel: "在哪里需要帮助？（地点或碰面处）",
    placePlaceholder: "医院名称、楼栋、柜台号",
    gpsButton: "使用我的当前位置",
    mapButton: "在地图上选择",
    mapPickerTitle: "在地图上选择地点",
    mapPickerHint: "点击地图放置标记、拖动标记，或移动地图后使用地图中心点。",
    mapSelected: "已选坐标",
    mapUseCenter: "使用地图中心点",
    mapConfirm: "使用此地点",
    mapCancel: "取消",
    gpsLoading: "正在读取位置",
    gpsReady: "已附加坐标",
    gpsHint: "在你确认已接单的口译员之前，地图上只显示大致坐标。",
    gpsDenied: "位置权限被拒绝，将改用地点描述。",
    gpsUnavailable: "此浏览器无法共享位置，将改用地点描述。",
    gpsMissing: "尚未附加坐标，口译员只会看到地点描述。",
    submit: "创建求助点",
    privacyTitle: "口译员能看到什么",
    beforeClaim: "接取之前",
    afterClaim: "确认口译员后解锁",
    beforeItems: ["语言和类别", "大致区域", "紧急程度"],
    afterItems: ["准确坐标", "完整地点描述", "你的电话号码"],
    errors: {
      language: "请选择需要的语言。",
      category: "请选择一个类别。",
      place: "请描述需要帮助的地点。",
      scheduleMissing: "请选择预约日期和时间。",
      scheduleTooSoon: "请选择明天或之后的日期。",
    },
    createdTitle: "求助点已创建",
    createdBody: "附近匹配的口译员现在可以看到它。有人接取后，请先核对并确认口译员，联系方式随后才会解锁。",
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
const fieldClass =
  "w-full rounded-lg border border-[#cbd7dc] bg-white px-3.5 py-3 text-sm font-semibold text-(--khvi-ink) transition-colors hover:border-[#8fbfc1]";
const labelClass = "block text-sm font-extrabold text-[#294554]";
const hintClass = "mt-1.5 text-xs leading-5 text-[#73848a]";

function toDateInputValue(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function startOfNextCalendarDay(now: Date) {
  return new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
}

function parseDateInputValue(dateValue: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateValue);
  if (!match) return null;
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]), 12);
  if (
    date.getFullYear() !== Number(match[1])
    || date.getMonth() !== Number(match[2]) - 1
    || date.getDate() !== Number(match[3])
  ) return null;
  return date;
}

function formatShortSelectedDate(dateValue: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateValue);
  if (!match) return "--/--/--";
  return `${match[3]}/${match[2]}/${match[1].slice(-2)}`;
}

function appointmentFromParts(dateValue: string, hourValue: string, minuteValue: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateValue);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]) - 1;
  const day = Number(match[3]);
  const hour = Number(hourValue);
  const minute = Number(minuteValue);
  const appointment = new Date(year, month, day, hour, minute, 0, 0);
  if (appointment.getFullYear() !== year || appointment.getMonth() !== month || appointment.getDate() !== day) return null;
  return appointment;
}

type DateCalendarProps = {
  id: string;
  label: string;
  value: string;
  minimumDate: string;
  locale: "en-US" | "zh-CN";
  previousMonthLabel: string;
  nextMonthLabel: string;
  selectedDateLabel: string;
  invalid: boolean;
  onChange: (value: string) => void;
};

function DateCalendar({
  id,
  label,
  value,
  minimumDate,
  locale,
  previousMonthLabel,
  nextMonthLabel,
  selectedDateLabel,
  invalid,
  onChange,
}: DateCalendarProps) {
  const initialDate = parseDateInputValue(value) ?? parseDateInputValue(minimumDate) ?? new Date();
  const [visibleMonth, setVisibleMonth] = useState(() => new Date(initialDate.getFullYear(), initialDate.getMonth(), 1));
  const year = visibleMonth.getFullYear();
  const month = visibleMonth.getMonth();
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const minimum = parseDateInputValue(minimumDate);
  const previousMonthLastDay = new Date(year, month, 0);
  const previousDisabled = minimum ? previousMonthLastDay.getTime() < minimum.getTime() : false;
  const monthLabel = visibleMonth.toLocaleDateString(locale, { month: "long", year: "numeric" });
  const weekdays = useMemo(
    () => Array.from({ length: 7 }, (_, index) => new Intl.DateTimeFormat(locale, { weekday: "short" }).format(new Date(2024, 0, 7 + index))),
    [locale],
  );

  function moveMonth(offset: number) {
    setVisibleMonth((current) => new Date(current.getFullYear(), current.getMonth() + offset, 1));
  }

  return (
    <div className="col-span-2 rounded-xl border border-[#cbd7dc] bg-white p-3 sm:col-span-1" aria-invalid={invalid || undefined}>
      <p className="text-xs font-extrabold text-[#52676f]" id={`${id}-label`}>{label}</p>
      <div className="mt-2 flex min-h-10 items-center justify-between gap-2">
        <button
          type="button"
          aria-label={previousMonthLabel}
          disabled={previousDisabled}
          className="grid h-9 w-9 place-items-center rounded-full text-[#294554] transition-colors hover:bg-[#edf7f5] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#087f80] disabled:cursor-not-allowed disabled:opacity-30"
          onClick={() => moveMonth(-1)}
        >
          <ChevronLeftIcon aria-hidden="true" className="h-5 w-5" />
        </button>
        <p aria-live="polite" className="text-sm font-extrabold text-[#173646]">{monthLabel}</p>
        <button
          type="button"
          aria-label={nextMonthLabel}
          className="grid h-9 w-9 place-items-center rounded-full text-[#294554] transition-colors hover:bg-[#edf7f5] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#087f80]"
          onClick={() => moveMonth(1)}
        >
          <ChevronRightIcon aria-hidden="true" className="h-5 w-5" />
        </button>
      </div>
      <div role="grid" aria-labelledby={`${id}-label`} className="mt-1 grid grid-cols-7 gap-1 text-center">
        {weekdays.map((weekday, index) => (
          <div key={`${weekday}-${index}`} role="columnheader" className="py-1 text-[0.65rem] font-extrabold uppercase text-[#73848a]">
            {weekday}
          </div>
        ))}
        {Array.from({ length: 42 }, (_, index) => {
          const day = index - firstWeekday + 1;
          if (day < 1 || day > daysInMonth) return <div key={`empty-${index}`} role="gridcell" aria-hidden="true" />;
          const dateValue = toDateInputValue(new Date(year, month, day));
          const disabled = Boolean(minimumDate && dateValue < minimumDate);
          const selected = dateValue === value;

          return (
            <button
              key={dateValue}
              id={selected ? id : undefined}
              type="button"
              role="gridcell"
              disabled={disabled}
              aria-selected={selected}
              aria-label={new Date(year, month, day).toLocaleDateString(locale, { dateStyle: "full" })}
              className={`h-9 rounded-lg text-sm font-bold tabular-nums transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#087f80] ${
                selected
                  ? "bg-[#087f80] text-white shadow-sm"
                  : disabled
                    ? "cursor-not-allowed text-[#b7c1c4] line-through decoration-[#d4dcde]"
                    : "text-[#294554] hover:bg-[#edf7f5]"
              }`}
              onClick={() => onChange(dateValue)}
            >
              {day}
            </button>
          );
        })}
      </div>
      <div className="mt-3 flex items-center justify-between gap-3 border-t border-[#d6e0e4] pt-3">
        <span className="text-xs font-bold text-[#64777e]">{selectedDateLabel}</span>
        <output htmlFor={id} className="text-base font-extrabold tabular-nums text-[#087f80]">
          {formatShortSelectedDate(value)}
        </output>
      </div>
    </div>
  );
}

type TimeWheelProps = {
  id: string;
  label: string;
  value: string;
  max: number;
  onChange: (value: string) => void;
};

const TIME_WHEEL_ITEM_HEIGHT = 44;

function TimeWheel({ id, label, value, max, onChange }: TimeWheelProps) {
  const wheelRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const options = useMemo(() => Array.from({ length: max + 1 }, (_, index) => String(index).padStart(2, "0")), [max]);

  useEffect(() => {
    const wheel = wheelRef.current;
    if (!wheel) return;
    wheel.scrollTop = Number(value) * TIME_WHEEL_ITEM_HEIGHT;
  }, [value]);

  useEffect(() => () => {
    if (animationFrameRef.current !== null) cancelAnimationFrame(animationFrameRef.current);
  }, []);

  function selectOffset(offset: number) {
    const nextIndex = Math.min(max, Math.max(0, Number(value) + offset));
    onChange(options[nextIndex]);
  }

  return (
    <div>
      <p className="text-center text-xs font-extrabold text-[#52676f]" id={`${id}-label`}>{label}</p>
      <div
        className="relative mt-2 overflow-hidden rounded-lg border border-[#cbd7dc] bg-white shadow-[inset_0_0_0_1px_rgba(214,224,228,0.3)]"
      >
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-1/2 z-0 h-11 -translate-y-1/2 border-y border-[#b9d9d6] bg-[#edf7f5]" />
        <div
          ref={wheelRef}
          id={id}
          role="listbox"
          tabIndex={0}
          aria-labelledby={`${id}-label`}
          aria-activedescendant={`${id}-${value}`}
          className="relative z-10 h-[132px] snap-y snap-mandatory overflow-y-auto overscroll-contain py-11 text-center [scrollbar-width:none] focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#087f80] [&::-webkit-scrollbar]:hidden"
          onScroll={(event) => {
            const wheel = event.currentTarget;
            if (animationFrameRef.current !== null) cancelAnimationFrame(animationFrameRef.current);
            animationFrameRef.current = requestAnimationFrame(() => {
              const nextIndex = Math.min(max, Math.max(0, Math.round(wheel.scrollTop / TIME_WHEEL_ITEM_HEIGHT)));
              const nextValue = options[nextIndex];
              if (nextValue !== value) onChange(nextValue);
            });
          }}
          onKeyDown={(event) => {
            if (event.key === "ArrowUp") { event.preventDefault(); selectOffset(-1); }
            if (event.key === "ArrowDown") { event.preventDefault(); selectOffset(1); }
            if (event.key === "Home") { event.preventDefault(); onChange(options[0]); }
            if (event.key === "End") { event.preventDefault(); onChange(options[max]); }
          }}
        >
          {options.map((option) => (
            <button
              key={option}
              id={`${id}-${option}`}
              type="button"
              role="option"
              tabIndex={-1}
              aria-selected={option === value}
              className={`relative block h-11 w-full snap-center text-lg tabular-nums transition-[color,font-size,font-weight] ${
                option === value ? "text-2xl font-extrabold text-[#087f80]" : "font-semibold text-[#829398]"
              }`}
              onClick={() => onChange(option)}
            >
              <span className="absolute inset-0 grid place-items-center leading-none" aria-hidden="true">
                {option}
              </span>
              <span className="sr-only">{option}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export function RequestHelpForm({
  languageOptions,
  categoryOptions,
}: {
  languageOptions: ReferenceOption[];
  categoryOptions: ReferenceOption[];
}) {
  const saving = useRef(false);
  const router = useRouter();
  const copyLocale = useCopyLocale();
  const t = copy[copyLocale];

  const [urgency, setUrgency] = useState<Urgency>("Immediate");
  const [languageId, setLanguageId] = useState<string>("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [description, setDescription] = useState("");
  const [place, setPlace] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledHour, setScheduledHour] = useState("09");
  const [scheduledMinute, setScheduledMinute] = useState("00");
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const [gps, setGps] = useState<GpsState>({ kind: "idle" });
  const [mapPickerOpen, setMapPickerOpen] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [saveError, setSaveError] = useState("");
  const minimumScheduleDate = useMemo(
    () => currentTime ? toDateInputValue(startOfNextCalendarDay(currentTime)) : "",
    [currentTime],
  );
  const selectedAppointment = useMemo(
    () => appointmentFromParts(scheduledDate, scheduledHour, scheduledMinute),
    [scheduledDate, scheduledHour, scheduledMinute],
  );
  const selectedScheduledAt = selectedAppointment?.toISOString() ?? "";

  useEffect(() => {
    const refreshCurrentTime = () => setCurrentTime(new Date());
    refreshCurrentTime();
    const timer = window.setInterval(refreshCurrentTime, 30000);
    return () => window.clearInterval(timer);
  }, []);

  function selectUrgency(option: Urgency) {
    setUrgency(option);
    if (option === "Scheduled" && !scheduledDate && currentTime) {
      setScheduledDate(toDateInputValue(startOfNextCalendarDay(currentTime)));
    }
  }

  function requestLocation() {
    setMapPickerOpen(false);

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

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
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
      if (!selectedAppointment) {
        nextErrors.schedule = t.errors.scheduleMissing;
      } else if (selectedAppointment.getTime() < startOfNextCalendarDay(new Date()).getTime()) {
        nextErrors.schedule = t.errors.scheduleTooSoon;
      }
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length === 0 && languageId && categoryId) {
      saving.current = true;
      setSaveError("");
      const result = await createBookingAction({
        languageId,
        categoryId,
        description: description.trim(),
        urgency,
        exactAddress: place.trim(),
        latitude: gps.kind === "ready" ? gps.latitude : null,
        longitude: gps.kind === "ready" ? gps.longitude : null,
        scheduledAt: urgency === "Scheduled" ? selectedScheduledAt : null,
      });

      if (result.ok) {
        router.push(`/my-requests/${result.data.requestId}`);
      } else {
        saving.current = false;
        setSaveError(result.error);
      }
    }
  }


  return (
    <main id="main-content" className="flex-1 px-5 py-8 sm:px-8 lg:px-12 lg:py-10">
      <div className="mx-auto max-w-[1180px]">
        <WorkspaceBreadcrumbs
          ariaLabel={t.breadcrumb}
          currentLabel={t.title}
          homeHref="/welcome#welcome-user"
          homeLabel={t.main}
        />

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
                <fieldset className="mt-5" aria-describedby="scheduled-at-hint">
                  <legend className={labelClass}>{t.scheduleLabel}</legend>
                  <div className="mt-2 grid grid-cols-2 gap-3 rounded-[var(--khvi-radius-md)] bg-[#edf3f4] p-3 sm:grid-cols-[minmax(280px,1.35fr)_minmax(96px,0.65fr)_minmax(96px,0.65fr)] sm:items-stretch">
                    <DateCalendar
                      id="scheduled-date"
                      label={t.scheduleDay}
                      value={scheduledDate}
                      minimumDate={minimumScheduleDate}
                      locale={copyLocale === "zh" ? "zh-CN" : "en-US"}
                      previousMonthLabel={t.previousMonth}
                      nextMonthLabel={t.nextMonth}
                      selectedDateLabel={t.selectedDate}
                      invalid={Boolean(errors.schedule)}
                      onChange={setScheduledDate}
                    />
                    <div className="col-span-2 grid grid-cols-2 gap-3 sm:col-span-2 lg:grid-rows-[auto_1fr]">
                      <TimeWheel
                        id="scheduled-hour"
                        label={t.scheduleHour}
                        value={scheduledHour}
                        max={23}
                        onChange={setScheduledHour}
                      />
                      <TimeWheel
                        id="scheduled-minute"
                        label={t.scheduleMinute}
                        value={scheduledMinute}
                        max={59}
                        onChange={setScheduledMinute}
                      />
                      <div className="col-span-2 hidden min-h-0 flex-col items-center justify-center rounded-xl border border-[#cbd7dc] bg-white px-4 py-4 text-center lg:flex">
                        <span className="text-xs font-extrabold text-[#64777e]">{t.selectedTime}</span>
                        <output
                          htmlFor="scheduled-hour scheduled-minute"
                          className="mt-1 text-3xl font-extrabold tracking-tight tabular-nums text-[#087f80]"
                        >
                          {scheduledHour}:{scheduledMinute}
                        </output>
                        <span className="mt-2 max-w-44 text-xs leading-5 text-[#73848a]">{t.timeWheelHint}</span>
                      </div>
                    </div>
                  </div>
                  <p className={hintClass} id="scheduled-at-hint">
                    {t.scheduleHint}
                  </p>
                  {errors.schedule && <FieldError message={errors.schedule} />}
                </fieldset>
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
                    onChange={(event) => setLanguageId(event.target.value)}
                  >
                    <option value="">{t.languagePlaceholder}</option>
                    {languageOptions.map((language) => (
                      <option key={language.id} value={language.id}>
                        {copyLocale === "zh" ? language.nameZh : language.name}
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
                    onChange={(event) => setCategoryId(event.target.value)}
                  >
                    <option value="">{t.categoryPlaceholder}</option>
                    {categoryOptions.map((category) => (
                      <option key={category.id} value={category.id}>
                        {copyLocale === "zh" ? category.nameZh : category.name}
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

              <div className="mt-6 border-t border-[#e3ebef] pt-5">
                <div>
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

                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  <button
                    type="button"
                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border-2 border-[#087f80] px-4 py-3 text-sm font-extrabold text-[#087f80] transition-colors hover:bg-[#edf7f5] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#087f80] disabled:opacity-60"
                    disabled={gps.kind === "loading"}
                    onClick={requestLocation}
                  >
                    <MapPinIcon aria-hidden="true" className="h-5 w-5 shrink-0" />
                    {gps.kind === "loading" ? t.gpsLoading : t.gpsButton}
                  </button>
                  <button
                    type="button"
                    className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border-2 px-4 py-3 text-sm font-extrabold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#123b4f] ${
                      mapPickerOpen
                        ? "border-[#123b4f] bg-[#123b4f] text-white"
                        : "border-[#123b4f] bg-white text-[#123b4f] hover:bg-[#edf3f1]"
                    }`}
                    aria-expanded={mapPickerOpen}
                    aria-controls="help-location-map"
                    onClick={() => setMapPickerOpen((open) => !open)}
                  >
                    <MapIcon aria-hidden="true" className="h-5 w-5 shrink-0" />
                    {t.mapButton}
                  </button>
                </div>

                {mapPickerOpen && (
                  <LocationMapPicker
                    initialCoordinates={gps.kind === "ready" ? { latitude: gps.latitude, longitude: gps.longitude } : null}
                    mapLabel={t.mapPickerTitle}
                    hint={t.mapPickerHint}
                    selectedLabel={t.mapSelected}
                    useCenterLabel={t.mapUseCenter}
                    confirmLabel={t.mapConfirm}
                    cancelLabel={t.mapCancel}
                    onConfirm={(coordinates: LocationCoordinates) => {
                      setGps({ kind: "ready", ...coordinates });
                      setMapPickerOpen(false);
                    }}
                    onCancel={() => setMapPickerOpen(false)}
                  />
                )}

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
              </div>

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
