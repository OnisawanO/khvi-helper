import { BoltIcon, CalendarDaysIcon } from "@heroicons/react/24/outline";
import type { CopyLocale } from "@/app/lib/locale";
import type { RequestStatus, Urgency } from "@/app/lib/mock-requests";

const statusCopy: Record<RequestStatus, Record<CopyLocale, string>> = {
  Open: { en: "Open", zh: "开放中" },
  Claimed: { en: "Claimed", zh: "已接取" },
  InProgress: { en: "In progress", zh: "进行中" },
  Completed: { en: "Completed", zh: "已完成" },
  Cancelled: { en: "Cancelled", zh: "已取消" },
  Expired: { en: "Expired", zh: "已过期" },
};

const statusTone: Record<RequestStatus, string> = {
  Open: "border-transparent bg-(--khvi-coral) text-white",
  Claimed: "border-[#b9d9d6] bg-[#edf7f5] text-[#087f80]",
  InProgress: "border-[#f0c98f] bg-[#fff4df] text-[#b5680b]",
  Completed: "border-[#b6ddcd] bg-[#e6f4ef] text-[#087557]",
  Cancelled: "border-[#d6e0e4] bg-[#eef2f4] text-[#52676f]",
  Expired: "border-[#d6e0e4] bg-[#eef2f4] text-[#52676f]",
};

const urgencyCopy: Record<Urgency, Record<CopyLocale, string>> = {
  Immediate: { en: "Urgent", zh: "紧急" },
  Scheduled: { en: "Scheduled", zh: "预约" },
};

export function StatusBadge({ status, copyLocale }: { status: RequestStatus; copyLocale: CopyLocale }) {
  return (
    <span className={`inline-flex items-center rounded-lg border px-3 py-1.5 text-xs font-extrabold ${statusTone[status]}`}>
      {statusCopy[status][copyLocale]}
    </span>
  );
}

export function UrgencyBadge({ urgency, copyLocale }: { urgency: Urgency; copyLocale: CopyLocale }) {
  const isImmediate = urgency === "Immediate";
  const Icon = isImmediate ? BoltIcon : CalendarDaysIcon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-extrabold ${
        isImmediate ? "border-[#f6b8ae] bg-[#fff6f4] text-[#c33a2a]" : "border-[#d6e0e4] bg-white text-[#425761]"
      }`}
    >
      <Icon aria-hidden="true" className="h-4 w-4" />
      {urgencyCopy[urgency][copyLocale]}
    </span>
  );
}

export function statusLabel(status: RequestStatus, copyLocale: CopyLocale): string {
  return statusCopy[status][copyLocale];
}
