export function parseManagerTimestamp(value?: string, now = Date.now()): number {
  const normalized = value?.trim();
  if (!normalized) return 0;

  const absolute = Date.parse(normalized.replace(" ", "T"));
  if (Number.isFinite(absolute)) return absolute;

  const lower = normalized.toLowerCase();
  if (lower === "just now") return now;

  const relative = lower.match(/^(\d+)\s+(minute|minutes|min|mins|hour|hours|day|days)\s+ago$/);
  if (relative) {
    const amount = Number(relative[1]);
    const unit = relative[2];
    const unitMs = unit.startsWith("minute") || unit.startsWith("min")
      ? 60_000
      : unit.startsWith("hour")
        ? 3_600_000
        : 86_400_000;
    return now - amount * unitMs;
  }

  const yesterday = lower.match(/^yesterday,\s*(\d{1,2}):(\d{2})$/);
  if (yesterday) {
    const date = new Date(now);
    date.setDate(date.getDate() - 1);
    date.setHours(Number(yesterday[1]), Number(yesterday[2]), 0, 0);
    return date.getTime();
  }

  return 0;
}

export function formatBadgeCount(count: number): string {
  if (count > 99) return "99+";
  return count.toString();
}
