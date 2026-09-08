"use client";

import { useEffect, useState } from "react";
import { ClockIcon } from "@heroicons/react/24/outline";
import type { CopyLocale } from "@/app/lib/locale";

const copy = {
  en: { prefix: "Expires in", expired: "Expired without a claim" },
  zh: { prefix: "剩余时间", expired: "无人接取已过期" },
} as const;

function formatRemaining(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

/**
 * Counts down the auto-expire window for an open urgent pin (BR-07).
 * `seconds` comes from the server render, so the first paint matches on both sides.
 */
export function ExpiryCountdown({
  seconds,
  copyLocale,
  compact = false,
}: {
  seconds: number;
  copyLocale: CopyLocale;
  compact?: boolean;
}) {
  const [remaining, setRemaining] = useState(seconds);
  const t = copy[copyLocale];

  useEffect(() => {
    const interval = window.setInterval(() => {
      setRemaining((current) => (current <= 0 ? 0 : current - 1));
    }, 1000);

    return () => window.clearInterval(interval);
  }, []);

  const isExpired = remaining <= 0;
  const isRunningOut = !isExpired && remaining <= 5 * 60;

  return (
    <span
      role="timer"
      aria-live="off"
      className={`inline-flex items-center gap-1.5 font-extrabold ${compact ? "text-xs" : "text-sm"} ${
        isExpired || isRunningOut ? "text-[#c33a2a]" : "text-[#52676f]"
      }`}
    >
      <ClockIcon aria-hidden="true" className={compact ? "h-4 w-4" : "h-5 w-5"} />
      {isExpired ? t.expired : `${t.prefix} ${formatRemaining(remaining)}`}
    </span>
  );
}
