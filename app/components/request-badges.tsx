import { BoltIcon, CalendarDaysIcon } from "@heroicons/react/24/outline";
import type { CopyLocale } from "@/app/lib/locale";
import type { RequestStatus, Urgency } from "@/app/lib/request-types";

const statusCopy: Record<RequestStatus, Record<CopyLocale, string>> = {
  Open: { th: "รอรับงาน", en: "Open", zh: "开放中", es: "Abierta", ar: "مفتوح" },
  Claimed: { th: "รับงานแล้ว", en: "Claimed", zh: "已接取", es: "Asignada", ar: "تم الاستلام" },
  InProgress: { th: "กำลังดำเนินการ", en: "In progress", zh: "进行中", es: "En curso", ar: "قيد التنفيذ" },
  Completed: { th: "เสร็จสิ้น", en: "Completed", zh: "已完成", es: "Completada", ar: "مكتمل" },
  Cancelled: { th: "ยกเลิก", en: "Cancelled", zh: "已取消", es: "Cancelada", ar: "ملغى" },
  Expired: { th: "หมดอายุ", en: "Expired", zh: "已过期", es: "Expirada", ar: "منتهي" },
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
  Immediate: { th: "ด่วน", en: "Urgent", zh: "紧急", es: "Urgente", ar: "عاجل" },
  Scheduled: { th: "นัดหมาย", en: "Scheduled", zh: "预约", es: "Programada", ar: "مجدول" },
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
