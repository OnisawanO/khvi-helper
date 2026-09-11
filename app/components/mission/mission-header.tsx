import type { BookingStatus } from "@/types/database.types";

export type MissionHeaderCopy = {
  eyebrow: string;
  statusLabels: Record<BookingStatus, string>;
};

const statusTone: Record<BookingStatus, string> = {
  Open: "bg-white text-[#18384a] border border-[#d8e1e6]",
  Claimed: "bg-[#fdf1e2] text-[#8a5416] border border-[#f0a35f]",
  InProgress: "bg-[#e6f4ef] text-[#087557] border border-[#7fbfa4]",
  Completed: "bg-[#e6f4ef] text-[#087557] border border-[#7fbfa4]",
  Cancelled: "bg-[#fbe9e7] text-[#a4291d] border border-[#f04f3e]",
  Expired: "bg-[#f2f4f5] text-[#5a6a70] border border-[#d8e1e6]",
};

export function MissionHeader({
  copy,
  bookingId,
  categoryName,
  languageName,
  status,
}: {
  copy: MissionHeaderCopy;
  bookingId: string;
  categoryName: string;
  languageName: string;
  status: BookingStatus;
}) {
  return (
    <header className="rounded-[var(--khvi-radius-lg)] border border-[#e1e8ea] bg-[var(--khvi-surface)] p-6 shadow-[var(--khvi-shadow-soft)] sm:p-8">
      <p className="text-sm font-semibold text-[#66777d]">
        {copy.eyebrow} #{bookingId}
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-extrabold text-[var(--khvi-ink)] sm:text-3xl">
          {categoryName} · {languageName}
        </h1>
        <span className={`rounded-lg px-3 py-1.5 text-xs font-extrabold ${statusTone[status]}`}>{copy.statusLabels[status]}</span>
      </div>
    </header>
  );
}
