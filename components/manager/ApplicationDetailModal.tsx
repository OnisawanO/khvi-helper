"use client";

import { useState, useEffect } from "react";

export type ApplicationStatus = "pending" | "under_review" | "approved" | "needs_revision" | "rejected";

export interface InterpreterApplication {
  id: string;
  userId: number;
  applicantName: string;
  phone: string;
  email: string;
  age: number;
  extraContact: string;
  primaryLanguage: string;
  languages: Array<{ id: string; name: string; type?: string; level?: string }>;
  categories: Array<{ id: number; name: string; icon?: string }>;
  workHistory: Array<{
    id: number;
    description: string;
    startDate: string;
    endDate: string;
    organization?: string;
  }>;
  certificateFileName: string;
  certificateUrl: string;
  submittedAt: string;
  reviewedAt?: string;
  reviewedByManagerId?: number;
  reviewedByManagerName?: string;
  status: ApplicationStatus;
  rejectReason?: string;
  revisionNote?: string;
  assignedArea: string;
}

interface ApplicationDetailModalProps {
  application: InterpreterApplication | null;
  isOpen: boolean;
  onClose: () => void;
  onApprove: (appId: string) => void;
  onRequestRevision: (appId: string, note: string) => void;
  onReject: (appId: string, reason: string) => void;
}

function ApplicationDetailModalContent({
  application,
  onClose,
  onApprove,
  onRequestRevision,
  onReject,
}: {
  application: InterpreterApplication;
  onClose: () => void;
  onApprove: (appId: string) => void;
  onRequestRevision: (appId: string, note: string) => void;
  onReject: (appId: string, reason: string) => void;
}) {
  const [decisionTab, setDecisionTab] = useState<"none" | "revision" | "reject">("none");
  const [revisionInput, setRevisionInput] = useState(application.revisionNote || "");
  const [rejectInput, setRejectInput] = useState(application.rejectReason || "");
  const [showCertPreview, setShowCertPreview] = useState(false);

  const handleConfirmRevision = () => {
    if (!revisionInput.trim()) return;
    onRequestRevision(application.id, revisionInput.trim());
    setDecisionTab("none");
  };

  const handleConfirmReject = () => {
    if (!rejectInput.trim()) return;
    onReject(application.id, rejectInput.trim());
    setDecisionTab("none");
  };

  return (
    <div className="relative flex flex-col w-full max-w-3xl max-h-[92vh] border border-[#092f45] bg-[#f7f9fa] shadow-2xl text-[#10283a] overflow-hidden">
      {/* Header Bar */}
      <div className="flex items-center justify-between border-b border-[#143748] bg-[#092f45] px-5 py-3.5 text-white">
        <div className="flex items-center gap-2">
          <span className="border border-white/30 bg-white/10 px-2 py-0.5 font-mono text-[11px] font-extrabold text-white">
            {application.id}
          </span>
          <span className="text-xs font-extrabold text-slate-200">
            พิจารณาใบสมัครล่ามจิตอาสา (Manager Review)
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

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
        {/* Top Status Banner */}
        <div className="border border-[#d6e0e4] bg-white p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-[#53656c]">
                ผู้ยื่นสมัคร:
              </span>
              <h3 id="modal-application-title" className="text-base sm:text-lg font-black text-[#10283a]">
                {application.applicantName}
              </h3>
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-[#53656c]">
              <span>ยื่นส่งเมื่อ: <strong className="text-[#10283a]">{application.submittedAt}</strong></span>
              <span>•</span>
              <span>พื้นที่: <strong className="text-[#10283a]">{application.assignedArea}</strong></span>
            </div>
          </div>

          <div className="shrink-0">
            {application.status === "approved" ? (
              <span className="inline-block border border-[#087557] bg-[#edf7f5] px-3 py-1.5 text-xs font-extrabold text-[#087557]">
                ✓ อนุมัติสิทธิ์แล้ว (BR-02 Unlocked)
              </span>
            ) : application.status === "needs_revision" ? (
              <span className="inline-block border border-[#d97706] bg-[#fffbeb] px-3 py-1.5 text-xs font-extrabold text-[#b45309]">
                ⚠️ ขอเอกสารเพิ่มเติม
              </span>
            ) : application.status === "rejected" ? (
              <span className="inline-block border border-[#f04f3e] bg-[#fff1f2] px-3 py-1.5 text-xs font-extrabold text-[#f04f3e]">
                ✕ ปฏิเสธใบสมัคร
              </span>
            ) : (
              <span className="inline-block border border-[#087f80] bg-[#edf7f5] px-3 py-1.5 text-xs font-extrabold text-[#087f80]">
                ⏳ รอการตรวจสอบ (Pending Review)
              </span>
            )}
          </div>
        </div>

        {/* Section 1: ข้อมูลผู้สมัคร (USER Schema) */}
        <div className="border border-[#d6e0e4] bg-white p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-[#e3ebef] pb-2">
            <h4 className="text-xs font-extrabold text-[#10283a] uppercase tracking-wider">
              1. ข้อมูลประจำตัวผู้สมัคร (USER Profile)
            </h4>
            <span className="border border-[#cbd7dc] bg-[#f8fafb] px-2 py-0.5 font-mono text-[10px] text-[#53656c]">
              User ID: #{application.userId}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="border border-[#e2ebee] bg-[#f8fafb] p-3">
              <span className="block text-[10px] font-bold text-[#64777e] uppercase mb-0.5">
                ชื่อ-นามสกุล (USER.name)
              </span>
              <div className="font-bold text-[#10283a]">{application.applicantName}</div>
              <div className="text-[11px] text-[#73848a] mt-0.5">อายุ {application.age} ปี</div>
            </div>

            <div className="border border-[#e2ebee] bg-[#f8fafb] p-3">
              <span className="block text-[10px] font-bold text-[#64777e] uppercase mb-0.5">
                อีเมลติดต่อ (USER.email)
              </span>
              <div className="font-bold text-[#10283a]">{application.email}</div>
              <div className="text-[11px] text-[#73848a] mt-0.5">ใช้ส่งผลการพิจารณาทางการ</div>
            </div>

            <div className="border border-[#e2ebee] bg-[#f8fafb] p-3">
              <span className="block text-[10px] font-bold text-[#64777e] uppercase mb-0.5">
                เบอร์โทรศัพท์ (USER.phone)
              </span>
              <div className="font-bold text-[#10283a]">{application.phone}</div>
              <span className="text-[11px] text-[#73848a] mt-0.5 block">สำหรับประสานงานฉุกเฉิน</span>
            </div>

            <div className="border border-[#e2ebee] bg-[#f8fafb] p-3">
              <span className="block text-[10px] font-bold text-[#64777e] uppercase mb-0.5">
                ช่องทางติดต่อสำรอง (extra_contact)
              </span>
              <div className="font-bold text-[#10283a]">{application.extraContact}</div>
              <span className="text-[10px] text-[#f04f3e] font-semibold mt-0.5 block">
                🔒 ปกป้องตาม BR-04 (ผู้ใช้ทั่วไปไม่เห็นจนกว่าจะ Claim)
              </span>
            </div>
          </div>
        </div>

        {/* Section 2: ทักษะภาษาและการช่วยเหลือ (LANGUAGE & CATEGORY) */}
        <div className="border border-[#d6e0e4] bg-white p-4 shadow-xs space-y-4">
          <h4 className="text-xs font-extrabold text-[#10283a] uppercase tracking-wider border-b border-[#e3ebef] pb-2">
            2. ทักษะทางภาษาและหมวดหมู่ความเชี่ยวชาญ (Skills & Readiness)
          </h4>

          <div>
            <span className="block text-[11px] font-bold text-[#53656c] mb-2 uppercase">
              ภาษาที่ให้บริการ (LANGUAGE table):
            </span>
            <div className="flex flex-wrap gap-2">
              {application.languages.map((lang) => (
                <span
                  key={lang.id}
                  className="inline-flex items-center gap-1.5 border border-[#087f80] bg-[#edf7f5] px-2.5 py-1 text-xs font-bold text-[#087557]"
                >
                  <span>✓ {lang.name}</span>
                  {lang.type && (
                    <span className="border-l border-[#8ed5c4] pl-1.5 text-[10px] font-medium text-[#087f80]">
                      {lang.type}
                    </span>
                  )}
                </span>
              ))}
            </div>
          </div>

          <div>
            <span className="block text-[11px] font-bold text-[#53656c] mb-2 uppercase">
              หมวดหมู่ภารกิจที่พร้อมช่วยเหลือ (CATEGORY table):
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {application.categories.map((cat) => (
                <div
                  key={cat.id}
                  className="flex items-center gap-2 border border-[#d6e0e4] bg-[#f8fafb] p-2.5 font-bold text-[#10283a]"
                >
                  <span className="text-base">{cat.icon || "💬"}</span>
                  <span>{cat.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Section 3: ประวัติและประสบการณ์ทำงาน (WORK_HISTORY) */}
        <div className="border border-[#d6e0e4] bg-white p-4 shadow-xs space-y-3">
          <h4 className="text-xs font-extrabold text-[#10283a] uppercase tracking-wider border-b border-[#e3ebef] pb-2">
            3. ประวัติการทำงานและประสบการณ์ (WORK_HISTORY table)
          </h4>

          {application.workHistory.length === 0 ? (
            <p className="text-xs text-[#73848a]">ไม่มีประวัติการทำงานที่ระบุเพิ่มเติม</p>
          ) : (
            <div className="space-y-2.5">
              {application.workHistory.map((history) => (
                <div key={history.id} className="border-l-2 border-[#087f80] bg-[#f8fafb] p-3 text-xs">
                  <div className="flex items-center justify-between text-[#53656c] text-[11px] mb-1">
                    <span className="font-bold text-[#10283a]">{history.organization || "งานอิสระ / อาสาสมัคร"}</span>
                    <span>{history.startDate} – {history.endDate}</span>
                  </div>
                  <div className="text-[#10283a] font-medium leading-relaxed">
                    {history.description}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section 4: เอกสารรับรองคุณวุฒิ (certificate_url) */}
        <div className="border border-[#d6e0e4] bg-white p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-[#e3ebef] pb-2">
            <h4 className="text-xs font-extrabold text-[#10283a] uppercase tracking-wider">
              4. เอกสารรับรองคุณวุฒิ (INTERPRETER_APPLICATIONS.certificate_url)
            </h4>
            <span className="border border-[#087f80] bg-[#edf7f5] px-2 py-0.5 text-[10px] font-bold text-[#087557]">
              เอกสารประกอบการตรวจสอบ
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border border-[#8ed5c4] bg-[#edf7f5] p-3.5 text-xs">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl">📄</span>
              <div>
                <div className="font-mono font-bold text-[#10283a] truncate max-w-sm">
                  {application.certificateFileName}
                </div>
                <div className="text-[11px] text-[#526a74]">
                  ขนาด 2.4 MB • ผ่านการสแกนความปลอดภัยแล้ว
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowCertPreview(!showCertPreview)}
                className="border border-[#087f80] bg-white px-3 py-1.5 text-xs font-extrabold text-[#087f80] hover:bg-[#edf7f5] transition-colors"
              >
                {showCertPreview ? "ซ่อนตัวอย่าง" : "ดูตัวอย่างเอกสาร"}
              </button>
              <a
                href={`#preview-${application.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  setShowCertPreview(true);
                }}
                className="border border-[#092f45] bg-[#092f45] px-3 py-1.5 text-xs font-extrabold text-white hover:bg-[#0c4960] transition-colors"
              >
                เปิดไฟล์เต็ม
              </a>
            </div>
          </div>

          {/* Document Preview Box */}
          {showCertPreview && (
            <div className="border border-[#8ed5c4] bg-[#f8fafb] p-4 text-center space-y-2 animate-in fade-in duration-150">
              <div className="text-3xl">📑</div>
              <div className="font-mono text-xs font-bold text-[#087557]">
                {application.certificateFileName}
              </div>
              <div className="mx-auto max-w-md border border-dashed border-[#b9d9d6] bg-white p-4 text-xs text-[#526a74] space-y-1">
                <p className="font-bold text-[#10283a]">ตัวอย่างการจำลองการตรวจสอบเอกสารรับรอง:</p>
                <p>• ตรวจสอบชื่อผู้สอบ: {application.applicantName}</p>
                <p>• ระดับผลการทดสอบ: HSK ระดับ 5 (242 คะแนน) / IELTS 7.5</p>
                <p>• ออกโดย: สถาบันขงจื่อ และ British Council</p>
              </div>
            </div>
          )}
        </div>

        {/* Past Review Log if available */}
        {application.reviewedAt && (
          <div className="border border-[#cbd7dc] bg-[#f8fafb] p-4 text-xs space-y-1">
            <div className="font-extrabold text-[#10283a]">บันทึกการพิจารณาล่าสุด:</div>
            <div className="text-[#53656c]">
              ดำเนินการเมื่อ: <strong className="text-[#10283a]">{application.reviewedAt}</strong> โดยผู้จัดการ:{" "}
              <strong className="text-[#10283a]">{application.reviewedByManagerName || "Manager ประจำศูนย์"}</strong>
            </div>
            {application.rejectReason && (
              <div className="mt-1 text-[#f04f3e] border-l-2 border-[#f04f3e] pl-2">
                เหตุผลการปฏิเสธ: {application.rejectReason}
              </div>
            )}
            {application.revisionNote && (
              <div className="mt-1 text-[#b45309] border-l-2 border-[#b45309] pl-2">
                คำขอเอกสารเพิ่มเติม: {application.revisionNote}
              </div>
            )}
          </div>
        )}

        {/* Decision Sub-forms */}
        {decisionTab === "revision" && (
          <div className="border-2 border-[#d97706] bg-[#fffbeb] p-4 text-xs space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-[#92400e]">ระบุคำขอเอกสารเพิ่มเติมเพื่อแจ้งผู้สมัคร:</span>
              <button
                type="button"
                onClick={() => setDecisionTab("none")}
                className="text-xs font-bold text-[#92400e] hover:underline"
              >
                ยกเลิก
              </button>
            </div>
            <textarea
              value={revisionInput}
              onChange={(e) => setRevisionInput(e.target.value)}
              rows={3}
              placeholder="เช่น เอกสารผลสอบวัดระดับภาษาที่แนบมามีความละเอียดต่ำ ไม่สามารถระบุชื่อและคะแนนได้อย่างชัดเจน กรุณาแนบไฟล์ PDF ต้นฉบับใหม่อีกครั้ง"
              className="w-full border border-[#d97706] bg-white p-2.5 text-xs text-[#10283a] focus:outline-none"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={handleConfirmRevision}
                className="border border-[#b45309] bg-[#b45309] px-4 py-2 font-bold text-white hover:bg-[#92400e] transition-colors"
              >
                บันทึกและส่งคำขอแก้ไข
              </button>
            </div>
          </div>
        )}

        {decisionTab === "reject" && (
          <div className="border-2 border-[#f04f3e] bg-[#fff1f2] p-4 text-xs space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-[#f04f3e]">ระบุเหตุผลการปฏิเสธใบสมัคร (บันทึก reject_reason):</span>
              <button
                type="button"
                onClick={() => setDecisionTab("none")}
                className="text-xs font-bold text-[#f04f3e] hover:underline"
              >
                ยกเลิก
              </button>
            </div>
            <textarea
              value={rejectInput}
              onChange={(e) => setRejectInput(e.target.value)}
              rows={3}
              placeholder="เช่น ข้อมูลคุณวุฒิหรือประสบการณ์ไม่เป็นไปตามเกณฑ์ขั้นต่ำของระบบล่ามจิตอาสา KHVI"
              className="w-full border border-[#f04f3e] bg-white p-2.5 text-xs text-[#10283a] focus:outline-none"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={handleConfirmReject}
                className="border border-[#f04f3e] bg-[#f04f3e] px-4 py-2 font-bold text-white hover:bg-[#d43828] transition-colors"
              >
                ยืนยันการปฏิเสธใบสมัคร
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer Decision Bar */}
      <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3 border-t border-[#d6e0e4] bg-white px-5 py-4">
        <button
          type="button"
          onClick={onClose}
          className="border border-[#cbd7dc] bg-white px-4 py-2 text-xs font-bold text-[#53656c] hover:bg-[#f8fafb]"
        >
          ปิดหน้าต่าง
        </button>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setDecisionTab(decisionTab === "reject" ? "none" : "reject")}
            className={`border px-3.5 py-2 text-xs font-bold transition-colors ${
              decisionTab === "reject"
                ? "border-[#f04f3e] bg-[#f04f3e] text-white"
                : "border-[#f04f3e] bg-white text-[#f04f3e] hover:bg-[#fff1f2]"
            }`}
          >
            ✕ ปฏิเสธใบสมัคร
          </button>

          <button
            type="button"
            onClick={() => setDecisionTab(decisionTab === "revision" ? "none" : "revision")}
            className={`border px-3.5 py-2 text-xs font-bold transition-colors ${
              decisionTab === "revision"
                ? "border-[#d97706] bg-[#d97706] text-white"
                : "border-[#d97706] bg-white text-[#b45309] hover:bg-[#fffaf0]"
            }`}
          >
            ⚠️ ขอเอกสารเพิ่ม
          </button>

          <button
            type="button"
            onClick={() => onApprove(application.id)}
            className="border border-[#087557] bg-[#087557] px-5 py-2 text-xs font-black text-white hover:bg-[#065e46] transition-colors shadow-xs"
          >
            ✓ อนุมัติสิทธิ์ล่าม (BR-02 Approve)
          </button>
        </div>
      </div>
    </div>
  );
}

export function ApplicationDetailModal({
  application,
  isOpen,
  onClose,
  onApprove,
  onRequestRevision,
  onReject,
}: ApplicationDetailModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
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

  if (!isOpen || !application) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-application-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <ApplicationDetailModalContent
        key={application.id}
        application={application}
        onClose={onClose}
        onApprove={onApprove}
        onRequestRevision={onRequestRevision}
        onReject={onReject}
      />
    </div>
  );
}

