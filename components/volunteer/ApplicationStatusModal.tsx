"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export type ApplicationStatus = "under_review" | "approved" | "needs_revision";

export interface ApplicationInfo {
  applicationId?: string;
  applicantName?: string;
  phone?: string;
  extraContact?: string;
  languages?: Array<{ id: string; name: string; type?: string }>;
  categories?: Array<{ id: number; name: string; icon?: string }>;
  certificateFileName?: string;
  submittedAt?: string;
  estimatedReviewTime?: string;
  assignedArea?: string;
}

interface ApplicationStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  data?: ApplicationInfo;
  defaultStatus?: ApplicationStatus;
}

export function ApplicationStatusModal({
  isOpen,
  onClose,
  data,
  defaultStatus = "under_review",
}: ApplicationStatusModalProps) {
  // Status state for interactive simulation
  const [status, setStatus] = useState<ApplicationStatus>(defaultStatus);
  const [isAvailable, setIsAvailable] = useState(false);
  const [reuploadedFileName, setReuploadedFileName] = useState("");
  const [showCertPreview, setShowCertPreview] = useState(false);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const currentData: ApplicationInfo = {
    applicationId: data?.applicationId || "APP-2026-0913-048",
    applicantName: data?.applicantName || "ปกรณ์ กิจเจริญชัย (Pakorn Kitcharoenchai)",
    phone: data?.phone || "081-234-5678",
    extraContact: data?.extraContact || "@pakorn_trans (LINE ID)",
    languages: data?.languages && data.languages.length > 0 ? data.languages : [
      { id: "th", name: "ไทย (Thai)", type: "Primary (ภาษาหลัก)" },
      { id: "en", name: "อังกฤษ (English)", type: "Fluent" },
      { id: "zh", name: "จีน (Chinese)", type: "HSK 5" },
    ],
    categories: data?.categories && data.categories.length > 0 ? data.categories : [
      { id: 9, name: "การสื่อสารทั่วไปและชีวิตประจำวัน (General & Daily Life)", icon: "💬" },
      { id: 1, name: "การแพทย์และโรงพยาบาล (Healthcare & Hospital)", icon: "🏥" },
      { id: 2, name: "สถานีตำรวจและคดีความ (Police & Legal)", icon: "👮" },
    ],
    certificateFileName: reuploadedFileName || data?.certificateFileName || "hsk5_and_ielts_certificate.pdf",
    submittedAt: data?.submittedAt || "13 ก.ย. 2026, 21:30 น.",
    estimatedReviewTime: data?.estimatedReviewTime || "ภายใน 24 ชั่วโมง",
    assignedArea: data?.assignedArea || "กรุงเทพมหานครและปริมณฑล (Bangkok Metropolitan)",
  };

  const handleReupload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setReuploadedFileName(file.name);
      setStatus("under_review");
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="status-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative flex flex-col w-full max-w-2xl max-h-[92vh] border border-[#092f45] bg-[#f7f9fa] shadow-2xl text-[#10283a] overflow-hidden">
        {/* Modal Window Top Header Bar */}
        <div className="flex items-center justify-between border-b border-[#143748] bg-[#092f45] px-5 py-3.5 text-white">
          <div className="flex items-center gap-2">
            <span className="border border-white/30 bg-white/10 px-2 py-0.5 font-mono text-[11px] font-extrabold text-white">
              {currentData.applicationId}
            </span>
            <span className="text-xs font-extrabold text-slate-200">
              หน้าต่างดูสถานะส่งใบสมัครล่าม
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="ปิดหน้าต่าง"
            className="flex h-7 w-7 items-center justify-center border border-white/20 bg-white/10 text-xs font-bold text-white hover:bg-white/20 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Modal Window Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {/* Status Simulator Bar */}
          <div className="border border-[#c5d8dc] bg-[#edf7f5] p-3 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="flex items-center gap-1.5 text-xs font-extrabold text-[#092f45]">
                <span className="h-2 w-2 bg-[#087f80]"></span>
                <span>โหมดทดสอบผลพิจารณา (Live Simulator):</span>
              </div>
              <div className="flex flex-wrap gap-1">
                <button
                  type="button"
                  onClick={() => setStatus("under_review")}
                  className={`px-2.5 py-1 text-[11px] font-extrabold transition-colors ${
                    status === "under_review"
                      ? "border border-[#087f80] bg-[#087f80] text-white shadow-xs"
                      : "border border-[#b8cbd0] bg-white text-[#526a74] hover:bg-[#f0f6f7]"
                  }`}
                >
                  1. รอตรวจสอบ
                </button>
                <button
                  type="button"
                  onClick={() => setStatus("approved")}
                  className={`px-2.5 py-1 text-[11px] font-extrabold transition-colors ${
                    status === "approved"
                      ? "border border-[#087557] bg-[#087557] text-white shadow-xs"
                      : "border border-[#b8cbd0] bg-white text-[#526a74] hover:bg-[#f0f6f7]"
                  }`}
                >
                  2. อนุมัติแล้ว (BR-02)
                </button>
                <button
                  type="button"
                  onClick={() => setStatus("needs_revision")}
                  className={`px-2.5 py-1 text-[11px] font-extrabold transition-colors ${
                    status === "needs_revision"
                      ? "border border-[#d97706] bg-[#d97706] text-white shadow-xs"
                      : "border border-[#b8cbd0] bg-white text-[#526a74] hover:bg-[#f0f6f7]"
                  }`}
                >
                  3. ขอเอกสารเพิ่ม
                </button>
              </div>
            </div>
          </div>

          {/* Dynamic Status Banner */}
          <div
            className={`border p-4 sm:p-5 text-white shadow-sm transition-colors ${
              status === "approved"
                ? "border-[#064e3b] bg-[#064e3b]"
                : status === "needs_revision"
                ? "border-[#78350f] bg-[#78350f]"
                : "border-[#143748] bg-[#092f45]"
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="border border-white/30 bg-white/10 px-1.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-white">
                    Verification Rule BR-02
                  </span>
                  <span className="text-xs text-white/80">• ยื่นส่งเมื่อ {currentData.submittedAt}</span>
                </div>
                <h3 id="status-modal-title" className="mt-1.5 text-base sm:text-lg font-black text-white">
                  {status === "approved"
                    ? "คุณผ่านการอนุมัติเป็นล่ามจิตอาสา KHVI แล้ว"
                    : status === "needs_revision"
                    ? "ผู้จัดการระบบขอเอกสารเพิ่มเติมเพื่อประกอบการพิจารณา"
                    : "ใบสมัครของคุณกำลังอยู่ระหว่างการตรวจสอบ"}
                </h3>
                <p className="mt-1 text-xs text-white/80 leading-relaxed">
                  {status === "approved"
                    ? "คุณสามารถเปิดสถานะพร้อมรับงานและกดรับภารกิจ SOS บนกระดานได้ทันที"
                    : status === "needs_revision"
                    ? "กรุณาแนบไฟล์ผลสอบหรือใบรับรองใหม่ที่ชัดเจน เพื่อให้ Manager อนุมัติสิทธิ์ได้รวดเร็วขึ้น"
                    : "เจ้าหน้าที่ Manager กำลังตรวจสอบข้อมูลและเอกสารตามลำดับคิว"}
                </p>
              </div>

              <div className="shrink-0 self-start sm:self-auto">
                {status === "approved" ? (
                  <span className="inline-block border border-emerald-300 bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-900 shadow-xs">
                    ✓ อนุมัติแล้ว (Verified)
                  </span>
                ) : status === "needs_revision" ? (
                  <span className="inline-block border border-amber-300 bg-amber-100 px-3 py-1 text-xs font-black text-amber-900 shadow-xs">
                    ⚠️ ขอเอกสารเพิ่ม
                  </span>
                ) : (
                  <span className="inline-block border border-[#8ed5c4]/60 bg-[#edf7f5] px-3 py-1 text-xs font-black text-[#087f80] shadow-xs">
                    ⏳ กำลังรอตรวจสอบ
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Action Box When Needs Revision */}
          {status === "needs_revision" && (
            <div className="border border-[#d97706] bg-[#fffbeb] p-4 shadow-sm space-y-2.5">
              <div className="flex items-center gap-2">
                <span className="text-base">⚠️</span>
                <h4 className="text-xs font-extrabold text-[#92400e]">
                  ข้อความแจ้งเตือนจาก Manager ประจำศูนย์:
                </h4>
              </div>
              <div className="border-l-2 border-[#d97706] pl-3 py-1 text-xs text-[#78350f] bg-white/70 font-medium">
                &ldquo;เอกสารผลสอบวัดระดับภาษาที่แนบมามีความละเอียดต่ำ ไม่สามารถระบุชื่อและคะแนนได้อย่างชัดเจน กรุณาแนบไฟล์ PDF หรือภาพถ่ายต้นฉบับใหม่อีกครั้งครับ&rdquo;
              </div>
              <div className="pt-1 flex flex-wrap items-center gap-2">
                <input
                  type="file"
                  id="modal-reupload-input"
                  onChange={handleReupload}
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => document.getElementById("modal-reupload-input")?.click()}
                  className="border border-[#b45309] bg-[#b45309] px-3.5 py-1.5 text-xs font-black text-white hover:bg-[#92400e] transition-colors"
                >
                  📎 เลือกไฟล์เอกสารใหม่
                </button>
                <span className="text-[11px] text-[#78350f]">รองรับ PDF, JPG, PNG ขนาดไม่เกิน 10MB</span>
              </div>
            </div>
          )}

          {/* Approved Ready Switcher */}
          {status === "approved" && (
            <div className="border border-[#087557] bg-white p-4 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-xs text-[#10283a]">สถานะความพร้อมรับงาน SOS</span>
                  <span className="font-mono text-[10px] bg-[#edf7f5] text-[#087557] px-1.5 py-0.5 border border-[#8ed5c4]">
                    BR-02 Unlocked
                  </span>
                </div>
                <div className="text-[11px] text-[#64777e] mt-0.5">
                  {isAvailable ? "● กำลังเปิดรับงาน (พร้อมช่วยเหลือเมื่อมีเคสฉุกเฉิน)" : "○ ปิดรับงานชั่วคราว"}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAvailable(!isAvailable)}
                className={`px-4 py-2 text-xs font-black transition-colors ${
                  isAvailable
                    ? "border border-[#087557] bg-[#087557] text-white shadow-xs"
                    : "border border-[#a8bcc3] bg-white text-[#39525d] hover:bg-[#f2f6f7]"
                }`}
              >
                {isAvailable ? "✓ กำลังเปิดรับงาน" : "คลิกเพื่อเปิดรับงาน"}
              </button>
            </div>
          )}

          {/* Modern UI Stepper / Verification Pipeline */}
          <div className="border border-[#d6e0e4] bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-[#e9f0f2] pb-2.5 mb-4">
              <h4 className="text-[11px] font-extrabold text-[#10283a] uppercase tracking-wider">
                ขั้นตอนการอนุมัติสิทธิ์ล่าม (Verification Steps)
              </h4>
              <span className="text-[10px] font-mono font-bold text-[#087f80]">
                {status === "approved"
                  ? "ขั้นที่ 3/3 (เสร็จสิ้น)"
                  : status === "needs_revision"
                  ? "ขั้นที่ 2/3 (รอแก้ไข)"
                  : "ขั้นที่ 2/3 (รอตรวจสอบ)"}
              </span>
            </div>

            {/* Stepper Progress Bar & Connecting Track */}
            <div className="relative mb-5 px-3 hidden sm:block">
              <div className="absolute top-4 left-8 right-8 h-1 bg-[#e2ebee] -z-0" />
              <div
                className={`absolute top-4 left-8 h-1 transition-all duration-500 -z-0 ${
                  status === "approved"
                    ? "w-[calc(100%-4rem)] bg-[#087557]"
                    : status === "needs_revision"
                    ? "w-1/2 bg-[#d97706]"
                    : "w-1/2 bg-[#087f80]"
                }`}
              />

              <div className="relative z-10 flex justify-between">
                <div className="flex flex-col items-center">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#087557] bg-[#087557] text-white shadow-xs font-black text-xs">
                    ✓
                  </div>
                  <span className="mt-1.5 text-[11px] font-extrabold text-[#087557]">ส่งใบสมัคร</span>
                </div>

                <div className="flex flex-col items-center">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all font-black text-xs ${
                      status === "approved"
                        ? "border-[#087557] bg-[#087557] text-white"
                        : status === "needs_revision"
                        ? "border-[#d97706] bg-[#fffbeb] text-[#d97706] ring-2 ring-[#fef3c7]"
                        : "border-[#087f80] bg-[#edf7f5] text-[#087f80] ring-2 ring-[#d8f0ea] animate-pulse"
                    }`}
                  >
                    {status === "approved" ? "✓" : status === "needs_revision" ? "⚠️" : "2"}
                  </div>
                  <span
                    className={`mt-1.5 text-[11px] font-extrabold ${
                      status === "approved"
                        ? "text-[#087557]"
                        : status === "needs_revision"
                        ? "text-[#d97706]"
                        : "text-[#087f80]"
                    }`}
                  >
                    ตรวจคุณสมบัติ
                  </span>
                </div>

                <div className="flex flex-col items-center">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all font-black text-xs ${
                      status === "approved"
                        ? "border-[#087557] bg-[#087557] text-white ring-2 ring-[#d1fae5]"
                        : "border-[#cbd7dc] bg-[#f8fafb] text-[#73848a]"
                    }`}
                  >
                    {status === "approved" ? "✓" : "3"}
                  </div>
                  <span
                    className={`mt-1.5 text-[11px] font-extrabold ${
                      status === "approved" ? "text-[#087557]" : "text-[#73848a]"
                    }`}
                  >
                    เปิดรับงาน SOS
                  </span>
                </div>
              </div>
            </div>

            {/* Stepper Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              {/* Step 1 */}
              <div className="border border-[#087f80]/40 bg-[#edf7f5]/70 p-3">
                <div className="flex items-center justify-between text-[11px] mb-1">
                  <div className="flex items-center gap-1">
                    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#087557] text-white text-[9px] font-bold">
                      1
                    </span>
                    <span className="font-extrabold text-[#087557]">ขั้นที่ 1</span>
                  </div>
                  <span className="border border-[#087f80] bg-[#087f80] text-white px-1.5 py-0.2 text-[9px] font-bold">
                    ✓ สำเร็จ
                  </span>
                </div>
                <div className="font-bold text-[#10283a]">ยื่นส่งใบสมัคร</div>
                <div className="text-[10px] text-[#53656c] mt-0.5">บันทึกข้อมูลเข้าระบบแล้ว</div>
              </div>

              {/* Step 2 */}
              <div
                className={`p-3 transition-all ${
                  status === "approved"
                    ? "border border-[#087f80]/40 bg-[#edf7f5]/70"
                    : status === "needs_revision"
                    ? "border border-[#d97706] bg-[#fffbeb]"
                    : "border-2 border-[#087f80] bg-white shadow-xs"
                }`}
              >
                <div className="flex items-center justify-between text-[11px] mb-1">
                  <div className="flex items-center gap-1">
                    <span
                      className={`flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold text-white ${
                        status === "approved"
                          ? "bg-[#087557]"
                          : status === "needs_revision"
                          ? "bg-[#d97706]"
                          : "bg-[#087f80]"
                      }`}
                    >
                      2
                    </span>
                    <span
                      className={`font-extrabold ${
                        status === "approved"
                          ? "text-[#087557]"
                          : status === "needs_revision"
                          ? "text-[#d97706]"
                          : "text-[#087f80]"
                      }`}
                    >
                      ขั้นที่ 2
                    </span>
                  </div>
                  <span
                    className={`px-1.5 py-0.2 text-[9px] font-bold ${
                      status === "approved"
                        ? "border border-[#087f80] bg-[#087f80] text-white"
                        : status === "needs_revision"
                        ? "border border-[#d97706] bg-[#d97706] text-white"
                        : "border border-[#087f80] bg-[#edf7f5] text-[#087f80] animate-pulse"
                    }`}
                  >
                    {status === "approved"
                      ? "✓ ผ่านแล้ว"
                      : status === "needs_revision"
                      ? "⚠️ ขอเอกสารเพิ่ม"
                      : "● กำลังตรวจ"}
                  </span>
                </div>
                <div className="font-bold text-[#10283a]">Manager ตรวจสอบ</div>
                <div className="text-[10px] text-[#53656c] mt-0.5">
                  {status === "approved" ? "เอกสารครบถ้วน" : status === "needs_revision" ? "รออัปโหลดใหม่" : "ประมาณ 24 ชม."}
                </div>
              </div>

              {/* Step 3 */}
              <div
                className={`p-3 transition-all ${
                  status === "approved"
                    ? "border-2 border-[#087557] bg-white shadow-xs"
                    : "border border-[#d8e4e7] bg-[#f8fafb] text-[#73848a]"
                }`}
              >
                <div className="flex items-center justify-between text-[11px] mb-1">
                  <div className="flex items-center gap-1">
                    <span
                      className={`flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold ${
                        status === "approved" ? "bg-[#087557] text-white" : "bg-[#cbd7dc] text-[#53656c]"
                      }`}
                    >
                      3
                    </span>
                    <span className={`font-bold ${status === "approved" ? "text-[#087557]" : "text-[#73848a]"}`}>
                      ขั้นที่ 3
                    </span>
                  </div>
                  <span
                    className={`px-1.5 py-0.2 text-[9px] font-bold ${
                      status === "approved"
                        ? "border border-[#087557] bg-[#087557] text-white"
                        : "border border-[#d8e4e7] bg-white text-[#73848a]"
                    }`}
                  >
                    {status === "approved" ? "✓ ปลดล็อก" : "รออนุมัติ"}
                  </span>
                </div>
                <div className={`font-bold text-xs ${status === "approved" ? "text-[#10283a]" : "text-[#526a74]"}`}>
                  เปิดรับงาน SOS
                </div>
                <div className="text-[10px] text-[#73848a] mt-0.5">สิทธิ์กด Claim (BR-02)</div>
              </div>
            </div>
          </div>

          {/* Application Summary Box */}
          <div className="border border-[#d6e0e4] bg-white p-4 shadow-sm space-y-3.5">
            <h4 className="text-[11px] font-extrabold text-[#10283a] uppercase tracking-wider border-b border-[#e3ebef] pb-2">
              สรุปข้อมูลใบสมัคร (Application Details)
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="border border-[#e2ebee] bg-[#f8fafb] p-2.5">
                <span className="block text-[10px] font-bold text-[#64777e] uppercase mb-0.5">ผู้สมัคร (USER.name)</span>
                <span className="font-bold text-[#10283a]">{currentData.applicantName}</span>
              </div>
              <div className="border border-[#e2ebee] bg-[#f8fafb] p-2.5">
                <span className="block text-[10px] font-bold text-[#64777e] uppercase mb-0.5">เบอร์โทรศัพท์ (USER.phone)</span>
                <span className="font-bold text-[#10283a]">{currentData.phone}</span>
              </div>
              <div className="border border-[#e2ebee] bg-[#f8fafb] p-2.5">
                <span className="block text-[10px] font-bold text-[#64777e] uppercase mb-0.5">ช่องทางติดต่อเสริม (extra_contact)</span>
                <span className="font-bold text-[#10283a]">{currentData.extraContact}</span>
                <span className="mt-0.5 block text-[10px] text-[#f04f3e]">🔒 ซ่อนตามกฎ BR-04</span>
              </div>
              <div className="border border-[#e2ebee] bg-[#f8fafb] p-2.5">
                <span className="block text-[10px] font-bold text-[#64777e] uppercase mb-0.5">พื้นที่ให้บริการ</span>
                <span className="font-bold text-[#10283a]">{currentData.assignedArea}</span>
              </div>
            </div>

            {/* Languages Chips */}
            <div className="pt-1">
              <span className="block text-[10px] font-bold text-[#64777e] uppercase mb-1.5">
                ภาษาที่ระบุให้บริการ ({currentData.languages?.length || 0}):
              </span>
              <div className="flex flex-wrap gap-1.5">
                {currentData.languages?.map((lang) => (
                  <span
                    key={lang.id}
                    className="inline-flex items-center gap-1 border border-[#087f80] bg-[#edf7f5] px-2 py-0.5 text-xs font-bold text-[#087557]"
                  >
                    <span>✓ {lang.name}</span>
                    {lang.type && <span className="text-[10px] text-[#087f80] font-normal">({lang.type})</span>}
                  </span>
                ))}
              </div>
            </div>

            {/* Certificate */}
            <div className="border-t border-[#edf2f4] pt-3 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="text-sm">📄</span>
                <span className="font-mono text-[#10283a] font-bold truncate max-w-xs">
                  {currentData.certificateFileName}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowCertPreview(!showCertPreview)}
                className="border border-[#087f80] bg-white px-2.5 py-1 text-[11px] font-bold text-[#087f80] hover:bg-[#edf7f5] transition-colors"
              >
                {showCertPreview ? "ซ่อนตัวอย่าง" : "ดูตัวอย่างเอกสาร"}
              </button>
            </div>

            {/* Certificate Preview Dropdown */}
            {showCertPreview && (
              <div className="border border-[#8ed5c4] bg-[#edf7f5] p-3 text-center space-y-1">
                <div className="text-2xl">📑</div>
                <div className="font-mono text-xs font-bold text-[#087557]">{currentData.certificateFileName}</div>
                <p className="text-[11px] text-[#526a74]">
                  เอกสารถูกจัดเก็บในพื้นที่ปลอดภัย KHVI Storage เพื่อให้เจ้าหน้าที่ Manager ตรวจสอบ
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Modal Window Footer Actions Bar */}
        <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-2.5 border-t border-[#d6e0e4] bg-white px-5 py-3.5">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="border border-[#c3d1d6] bg-white px-4 py-2 text-xs font-bold text-[#39525d] hover:bg-[#f8fafb] transition-colors"
            >
              ปิดหน้าต่าง
            </button>
            <Link
              href="/volunteer/status"
              onClick={onClose}
              className="border border-[#d8e4e7] bg-[#f8fafb] px-3.5 py-2 text-xs font-bold text-[#087f80] hover:border-[#087f80] hover:bg-[#edf7f5] transition-colors"
            >
              ดูหน้าสถานะเต็ม (/volunteer/status) ↗
            </Link>
          </div>

          <div className="flex items-center gap-2">
            {status === "approved" ? (
              <Link
                href="/volunteer/dashboard"
                onClick={onClose}
                className="border border-[#087557] bg-[#087557] px-5 py-2 text-xs font-extrabold text-white hover:bg-[#065e46] transition-colors shadow-xs"
              >
                ไปที่กระดานรับงาน SOS →
              </Link>
            ) : (
              <Link
                href="/volunteer/apply"
                onClick={onClose}
                className="border border-[#092f45] bg-[#092f45] px-5 py-2 text-xs font-extrabold text-white hover:bg-[#0c4960] transition-colors shadow-xs"
              >
                แก้ไขข้อมูลใบสมัคร
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
