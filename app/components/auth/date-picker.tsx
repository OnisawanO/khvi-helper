"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  CalendarDaysIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import type { Locale } from "@/app/components/site-header";

const displayLocales: Record<Locale, string> = {
  en: "en-US",
  th: "th-TH",
  zh: "zh-CN",
  es: "es-ES",
  ar: "ar-EG",
};

interface DatePickerProps {
  id: string;
  label: string;
  locale: Locale;
  maxDate: string;
  invalid?: boolean;
  value: string;
  onChange: (value: string) => void;
}

export function toDateInputValue(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return [String(year), month, day].join("-");
}

function parseDateInputValue(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]) - 1;
  const day = Number(match[3]);
  const date = new Date(year, month, day);
  return date.getFullYear() === year && date.getMonth() === month && date.getDate() === day ? date : null;
}

export function DatePicker({
  id,
  label,
  locale,
  maxDate,
  invalid = false,
  value,
  onChange,
}: DatePickerProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const max = useMemo(() => parseDateInputValue(maxDate) ?? new Date(), [maxDate]);
  const selectedDate = parseDateInputValue(value);
  const initialDate = selectedDate ?? max;
  const [isOpen, setIsOpen] = useState(false);
  const [visibleMonth, setVisibleMonth] = useState(
    () => new Date(initialDate.getFullYear(), initialDate.getMonth(), 1),
  );
  const [popoverPosition, setPopoverPosition] = useState({ top: 0, left: 0 });
  const formatLocale = displayLocales[locale] + "-u-ca-gregory";
  const maxDateValue = toDateInputValue(max);
  const minYear = max.getFullYear() - 120;
  const year = visibleMonth.getFullYear();
  const month = visibleMonth.getMonth();
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthLabel = visibleMonth.toLocaleDateString(formatLocale, { month: "long" });
  const yearLabel = visibleMonth.toLocaleDateString(formatLocale, { year: "numeric" });
  const selectedLabel = selectedDate
    ? selectedDate.toLocaleDateString(formatLocale, { day: "numeric", month: "long", year: "numeric" })
    : "";
  const weekdays = useMemo(
    () => Array.from(
      { length: 7 },
      (_, index) => new Intl.DateTimeFormat(formatLocale, { weekday: "short" }).format(new Date(2024, 0, 7 + index)),
    ),
    [formatLocale],
  );
  const months = useMemo(
    () => Array.from(
      { length: 12 },
      (_, index) => new Date(2024, index, 1).toLocaleDateString(formatLocale, { month: "long" }),
    ),
    [formatLocale],
  );
  const years = useMemo(
    () => Array.from({ length: 121 }, (_, index) => max.getFullYear() - index),
    [max],
  );

  useEffect(() => {
    if (!isOpen) return;

    function updatePosition() {
      const anchor = rootRef.current?.getBoundingClientRect();
      if (!anchor) return;

      const width = Math.min(320, window.innerWidth - 32);
      const left = Math.min(
        Math.max(16, anchor.left),
        Math.max(16, window.innerWidth - width - 16),
      );
      const estimatedHeight = 390;
      const top = anchor.bottom + estimatedHeight > window.innerHeight - 16
        ? Math.max(16, anchor.top - estimatedHeight - 8)
        : anchor.bottom + 8;

      setPopoverPosition({ top, left });
    }

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    function handlePointerDown(event: PointerEvent) {
      const target = event.target as Node;
      if (!rootRef.current?.contains(target) && !popoverRef.current?.contains(target)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setIsOpen(false);
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  function moveMonth(offset: number) {
    setVisibleMonth((current) => new Date(current.getFullYear(), current.getMonth() + offset, 1));
  }

  function handleMonthChange(nextMonth: string) {
    setVisibleMonth(new Date(year, Number(nextMonth), 1));
  }

  function handleYearChange(nextYear: string) {
    setVisibleMonth(new Date(Number(nextYear), month, 1));
  }

  const previousDisabled = year <= minYear && month === 0;
  const nextDisabled = year > max.getFullYear() ||
    (year === max.getFullYear() && month >= max.getMonth());

  return (
    <div ref={rootRef} className="relative">
      <button
        id={id}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-controls={id + "-calendar"}
        aria-describedby={invalid ? id + "-error" : undefined}
        onClick={() => setIsOpen((open) => !open)}
        className={[
          "flex min-h-10 w-full items-center gap-2 rounded-lg border bg-white px-3 py-2 text-left text-xs font-semibold text-[var(--khvi-ink)] transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#087f80] sm:text-sm",
          invalid ? "border-[#e24432] bg-[#fdf8f7]" : "border-[#cbd7dc] hover:border-[#8fbfc1]",
        ].join(" ")}
      >
        <CalendarDaysIcon className="h-4 w-4 shrink-0 text-[#73848a]" aria-hidden="true" />
        <span className={selectedLabel ? "" : "text-[#73848a]"}>
          {selectedLabel || label}
        </span>
      </button>

      {isOpen && (
        <div
          ref={popoverRef}
          id={id + "-calendar"}
          role="dialog"
          aria-label={label}
          className="fixed z-[80] w-[min(20rem,calc(100vw-2rem))] rounded-2xl border border-[#d6e0e4] bg-white p-3 shadow-[0_20px_50px_rgba(9,47,69,0.22)]"
          style={{ top: popoverPosition.top, left: popoverPosition.left }}
        >
          <div className="rounded-xl bg-[#edf7f5] p-2">
            <div className="flex items-center gap-1">
              <button
                type="button"
                aria-label="Previous month"
                disabled={previousDisabled}
                onClick={() => moveMonth(-1)}
                className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-[#294554] transition-colors hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#087f80] disabled:cursor-not-allowed disabled:opacity-30"
              >
                <ChevronLeftIcon className="h-4 w-4" aria-hidden="true" />
              </button>
              <div className="flex min-w-0 flex-1 items-center justify-center gap-2">
                <div className="relative min-w-0 flex-1">
                  <select
                    aria-label="Month"
                    value={month}
                    onChange={(event) => handleMonthChange(event.target.value)}
                    className="h-8 w-full appearance-none rounded-lg border-0 bg-transparent px-1 py-1 pr-6 text-center text-sm font-extrabold text-[#173646] focus:outline-2 focus:outline-[#087f80]"
                  >
                    {months.map((monthName, index) => (
                      <option key={monthName} value={index}>{monthName}</option>
                    ))}
                  </select>
                  <ChevronDownIcon className="pointer-events-none absolute right-1 top-1/2 h-4 w-4 -translate-y-1/2 text-[#173646]" aria-hidden="true" />
                </div>
                <div className="relative min-w-0 flex-1">
                  <select
                    aria-label="Year"
                    value={year}
                    onChange={(event) => handleYearChange(event.target.value)}
                    className="h-8 w-full appearance-none rounded-lg border-0 bg-transparent px-1 py-1 pr-6 text-center text-sm font-extrabold text-[#173646] focus:outline-2 focus:outline-[#087f80]"
                  >
                    {years.map((yearValue) => (
                      <option key={yearValue} value={yearValue}>
                        {new Date(yearValue, 0, 1).toLocaleDateString(formatLocale, { year: "numeric" })}
                      </option>
                    ))}
                  </select>
                  <ChevronDownIcon className="pointer-events-none absolute right-1 top-1/2 h-4 w-4 -translate-y-1/2 text-[#173646]" aria-hidden="true" />
                </div>
              </div>
              <button
                type="button"
                aria-label="Next month"
                disabled={nextDisabled}
                onClick={() => moveMonth(1)}
                className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-[#294554] transition-colors hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#087f80] disabled:cursor-not-allowed disabled:opacity-30"
              >
                <ChevronRightIcon className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
            <p className="mt-1 text-center text-[11px] font-semibold text-[#5c727d]" aria-live="polite">
              {monthLabel} {yearLabel}
            </p>
          </div>

          <div role="grid" aria-label={label} className="mt-3 grid grid-cols-7 gap-1 text-center">
            {weekdays.map((weekday, index) => (
              <div key={weekday + "-" + index} role="columnheader" className="py-1 text-[0.62rem] font-extrabold uppercase text-[#73848a]">
                {weekday}
              </div>
            ))}
            {Array.from({ length: 42 }, (_, index) => {
              const day = index - firstWeekday + 1;
              if (day < 1 || day > daysInMonth) {
                return <div key={"empty-" + index} role="gridcell" aria-hidden="true" />;
              }

              const date = new Date(year, month, day);
              const dateValue = toDateInputValue(date);
              const disabled = dateValue > maxDateValue;
              const selected = dateValue === value;
              const today = dateValue === maxDateValue;

              return (
                <button
                  key={dateValue}
                  type="button"
                  role="gridcell"
                  disabled={disabled}
                  aria-selected={selected}
                  aria-label={date.toLocaleDateString(formatLocale, { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                  onClick={() => {
                    onChange(dateValue);
                    setIsOpen(false);
                  }}
                  className={[
                    "h-9 rounded-lg text-sm font-bold tabular-nums transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#087f80]",
                    selected
                      ? "bg-[#087f80] text-white shadow-sm"
                      : disabled
                        ? "cursor-not-allowed text-[#b7c1c4]"
                        : today
                          ? "text-[#087f80] ring-1 ring-inset ring-[#087f80]/50 hover:bg-[#edf7f5]"
                          : "text-[#294554] hover:bg-[#edf7f5]",
                  ].join(" ")}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {selectedLabel && (
            <div className="mt-3 border-t border-[#edf2f4] pt-2 text-center text-xs font-bold text-[#087f80]">
              {selectedLabel}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
