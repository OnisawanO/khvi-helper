"use client";

interface ManagerMetricsProps {
  total: number;
  pending: number;
  approved: number;
  needsRevision: number;
  rejected: number;
  avgReviewTime?: string;
}

export function ManagerMetrics({
  total,
  pending,
  approved,
  needsRevision,
  rejected,
  avgReviewTime = "42 นาที",
}: ManagerMetricsProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {/* Metric 1: Pending & Under Review */}
      <div className="border border-[#e0c48f] bg-[#fffdfa] p-4 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-[#8c6b2d]">รอการตรวจสอบ</span>
          <span className="flex h-2 w-2 rounded-full bg-[#d97706]" />
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-black text-[#10283a] sm:text-3xl">{pending}</span>
          <span className="text-[11px] font-semibold text-[#8c6b2d]">ฉบับ</span>
        </div>
        <div className="mt-1 text-[11px] text-[#8c6b2d]">
          ต้องดำเนินการตาม BR-02
        </div>
      </div>

      {/* Metric 2: Approved */}
      <div className="border border-[#9fd3c7] bg-[#f5fbf9] p-4 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-[#087557]">อนุมัติสิทธิ์แล้ว</span>
          <span className="flex h-2 w-2 rounded-full bg-[#087557]" />
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-black text-[#087557] sm:text-3xl">{approved}</span>
          <span className="text-[11px] font-semibold text-[#087557]">คน</span>
        </div>
        <div className="mt-1 text-[11px] text-[#527d71]">
          เปิดสิทธิ์ Claim ภารกิจสำเร็จ
        </div>
      </div>

      {/* Metric 3: Needs Revision */}
      <div className="border border-[#eed4b2] bg-[#fffaf5] p-4 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-[#b45309]">ขอเอกสารเพิ่ม</span>
          <span className="flex h-2 w-2 rounded-full bg-[#b45309]" />
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-black text-[#b45309] sm:text-3xl">{needsRevision}</span>
          <span className="text-[11px] font-semibold text-[#b45309]">เคส</span>
        </div>
        <div className="mt-1 text-[11px] text-[#9a5b28]">
          รอผู้สมัครส่งเอกสารใหม่
        </div>
      </div>

      {/* Metric 4: Rejected */}
      <div className="border border-[#f8c5be] bg-[#fff8f7] p-4 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-[#f04f3e]">ไม่อนุมัติ</span>
          <span className="flex h-2 w-2 rounded-full bg-[#f04f3e]" />
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-black text-[#f04f3e] sm:text-3xl">{rejected}</span>
          <span className="text-[11px] font-semibold text-[#f04f3e]">เคส</span>
        </div>
        <div className="mt-1 text-[11px] text-[#a8524a]">
          บันทึกเหตุผลในระบบ
        </div>
      </div>

      {/* Metric 5: Total & Avg Speed */}
      <div className="col-span-2 border border-[#d6e0e4] bg-white p-4 shadow-xs sm:col-span-1">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-[#53656c]">ใบสมัครทั้งหมด</span>
          <span className="font-mono text-[10px] text-[#73848a]">TOTAL</span>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-black text-[#10283a] sm:text-3xl">{total}</span>
          <span className="text-[11px] font-semibold text-[#53656c]">รายการ</span>
        </div>
        <div className="mt-1 text-[11px] text-[#53656c]">
          เฉลี่ย <strong className="text-[#10283a]">{avgReviewTime}</strong> / ใบสมัคร
        </div>
      </div>
    </div>
  );
}

