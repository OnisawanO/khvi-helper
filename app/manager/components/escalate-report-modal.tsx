"use client";

import { useState, type FormEvent } from "react";
import {
  ShieldCheckIcon,
  ShieldExclamationIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { IncidentReport, IncidentSeverity } from "../types";

interface EscalateReportModalProps {
  report: IncidentReport | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (
    reportId: string,
    severity: IncidentSeverity,
    assessmentNote: string
  ) => void;
}

const severityOptions: Array<{
  level: IncidentSeverity;
  label: string;
  badgeBg: string;
  badgeText: string;
  borderClass: string;
  description: string;
  suggestedAction: string;
}> = [
  {
    level: "medium",
    label: "Medium (ปานกลาง)",
    badgeBg: "bg-[#fef9c3]",
    badgeText: "text-[#854d0e]",
    borderClass: "border-[#facc15]",
    description: "ข้อพิพาทเรื่องเวลา การสื่อสารคลาดเคลื่อน หรือยกเลิกงานกระชั้นชิด",
    suggestedAction: "Admin บันทึกพฤติกรรม ตักเตือน หรือบันทึก Strike/Warning",
  },
  {
    level: "high",
    label: "High (ร้ายแรง)",
    badgeBg: "bg-[#ffedd5]",
    badgeText: "text-[#c2410c]",
    borderClass: "border-[#fb923c]",
    description: "ไม่มาตามนัดหมาย ละเมิดเงื่อนไข หรือเรียกร้องเงินนอกระบบ",
    suggestedAction: "เสนอให้ Admin ระงับสิทธิ์ใช้งานบัญชีชั่วคราว",
  },
  {
    level: "critical",
    label: "Critical (วิกฤต/ฉุกเฉิน)",
    badgeBg: "bg-[#fee2e2]",
    badgeText: "text-[#b91c1c]",
    borderClass: "border-[#f87171]",
    description: "คุกคาม ข่มขู่ กรรโชก หลอกลวง หรือเสี่ยงต่อชีวิตและความปลอดภัย",
    suggestedAction: "เสนอให้ Admin แบนบัญชีถาวรและตรวจสอบความปลอดภัยทันที",
  },
];

export function EscalateReportModal({
  report,
  isOpen,
  onClose,
  onConfirm,
}: EscalateReportModalProps) {
  if (!isOpen || !report) return null;

  return (
    <EscalateReportModalContent
      report={report}
      onClose={onClose}
      onConfirm={onConfirm}
    />
  );
}

function EscalateReportModalContent({
  report,
  onClose,
  onConfirm,
}: {
  report: IncidentReport;
  onClose: () => void;
  onConfirm: (
    reportId: string,
    severity: IncidentSeverity,
    assessmentNote: string
  ) => void;
}) {
  const [selectedSeverity, setSelectedSeverity] = useState<IncidentSeverity | null>(
    report.severity ?? null
  );
  const [assessmentNote, setAssessmentNote] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedSeverity) return;

    onConfirm(report.id, selectedSeverity, assessmentNote.trim());
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="escalate-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div className="relative flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-slate-100 p-5 pb-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#fff1ef] text-[#d93829]">
              <ShieldExclamationIcon className="h-6 w-6" aria-hidden="true" />
            </span>
            <div>
              <h2 id="escalate-modal-title" className="text-base font-extrabold text-[#092f45]">
                Escalate Incident #{report.id}
              </h2>
              <p className="mt-0.5 text-xs text-[#527082]">
                เลือกระดับความรุนแรงก่อนส่งให้ Admin ดำเนินการ
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close escalation dialog"
            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 focus:outline-none focus:ring-2 focus:ring-[#4d8a93] cursor-pointer"
          >
            <XMarkIcon className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div className="overflow-y-auto p-5">
          <div className="space-y-1 rounded-xl border border-slate-200 bg-slate-50/70 p-3 text-xs">
            <div className="flex items-center justify-between gap-3">
              <span className="font-semibold text-slate-600">ผู้ถูกรายงาน</span>
              <span className="text-right font-extrabold text-red-600">
                {report.reportedUserName} ({report.reportedUserRole})
              </span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="font-semibold text-slate-600">ผู้รายงาน</span>
              <span className="text-right font-medium text-slate-800">
                {report.reporterName} ({report.reporterRole})
              </span>
            </div>
            <div className="border-t border-slate-200/60 pt-1.5 text-slate-700">
              <span className="font-semibold text-slate-900">เหตุผล: </span>
              {report.reason}
            </div>
          </div>

          <form id="escalate-form" onSubmit={handleSubmit} className="mt-5 space-y-4">
            <fieldset>
              <legend className="mb-2 text-xs font-bold text-[#092f45]">
                ระบุระดับความรุนแรง <span className="text-red-500">*</span>
              </legend>
              <div className="space-y-2">
                {severityOptions.map((option) => {
                  const isSelected = selectedSeverity === option.level;
                  return (
                    <label
                      key={option.level}
                      className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition-all focus-within:ring-2 focus-within:ring-[#4d8a93] ${
                        isSelected
                          ? `${option.borderClass} bg-slate-50 ring-1 ring-[#087f80]`
                          : "border-slate-200 hover:border-slate-300 hover:bg-slate-50/50"
                      }`}
                    >
                      <input
                        type="radio"
                        name={`severity-${report.id}`}
                        value={option.level}
                        checked={isSelected}
                        onChange={() => setSelectedSeverity(option.level)}
                        className="mt-1 h-4 w-4 border-slate-300 text-[#087f80] focus:ring-[#087f80]"
                      />
                      <span className="flex-1 text-xs">
                        <span className={`inline-flex rounded-md px-2 py-0.5 text-[11px] font-extrabold ${option.badgeBg} ${option.badgeText}`}>
                          {option.label}
                        </span>
                        <span className="mt-1 block leading-relaxed text-slate-600">
                          {option.description}
                        </span>
                        <span className="mt-1 block text-[11px] font-semibold leading-relaxed text-slate-500">
                          แนวทางสำหรับ Admin: {option.suggestedAction}
                        </span>
                      </span>
                    </label>
                  );
                })}
              </div>
              {!selectedSeverity && (
                <p className="mt-2 text-[11px] font-semibold text-red-600" role="alert">
                  ต้องเลือกระดับความรุนแรงก่อนส่งต่อให้ Admin
                </p>
              )}
            </fieldset>

            <div>
              <label htmlFor="assessment-note" className="mb-1.5 block text-xs font-bold text-[#092f45]">
                ความเห็นเบื้องต้นของ Manager ถึง Admin <span className="font-normal text-slate-500">(ถ้ามี)</span>
              </label>
              <textarea
                id="assessment-note"
                rows={3}
                value={assessmentNote}
                onChange={(event) => setAssessmentNote(event.target.value)}
                placeholder="ระบุข้อเท็จจริงที่ตรวจสอบแล้วหรือข้อเสนอแนะถึง Admin"
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 placeholder-slate-400 focus:border-[#087f80] focus:outline-none focus:ring-1 focus:ring-[#087f80]"
              />
            </div>
          </form>
        </div>

        <div className="flex items-center justify-end gap-2.5 border-t border-slate-100 bg-slate-50/50 p-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#4d8a93] cursor-pointer"
          >
            ยกเลิก
          </button>
          <button
            type="submit"
            form="escalate-form"
            disabled={!selectedSeverity}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#092f45] px-4 py-2 text-xs font-bold text-white shadow-xs transition-colors hover:bg-[#12425e] focus:outline-none focus:ring-2 focus:ring-[#4d8a93] disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
          >
            <ShieldCheckIcon className="h-4 w-4 text-[#f59e0b]" aria-hidden="true" />
            ยืนยันการส่งต่อ
          </button>
        </div>
      </div>
    </div>
  );
}
