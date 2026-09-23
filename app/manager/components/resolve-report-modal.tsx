"use client";

import { useState, type FormEvent } from "react";
import { CheckCircleIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { IncidentReport } from "../types";

interface ResolveReportModalProps {
  report: IncidentReport | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reportId: string, resolutionNote: string) => void;
}

export function ResolveReportModal({
  report,
  isOpen,
  onClose,
  onConfirm,
}: ResolveReportModalProps) {
  if (!isOpen || !report) return null;

  return (
    <ResolveReportModalContent
      key={report.id}
      report={report}
      onClose={onClose}
      onConfirm={onConfirm}
    />
  );
}

function ResolveReportModalContent({
  report,
  onClose,
  onConfirm,
}: {
  report: IncidentReport;
  onClose: () => void;
  onConfirm: (reportId: string, resolutionNote: string) => void;
}) {
  const [resolutionNote, setResolutionNote] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const note = resolutionNote.trim();
    if (!note) return;

    onConfirm(report.id, note);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="resolve-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div className="relative flex max-h-[90vh] w-full max-w-md flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-slate-100 p-5 pb-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#ecfdf5] text-[#059669]">
              <CheckCircleIcon className="h-6 w-6" aria-hidden="true" />
            </span>
            <div>
              <h2 id="resolve-modal-title" className="text-base font-extrabold text-[#092f45]">
                Resolve Incident #{report.id}
              </h2>
              <p className="mt-0.5 text-xs text-[#527082]">
                ปิดเคสหลังจาก Manager ไกล่เกลี่ยหรือแก้ไขปัญหาเรียบร้อย
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close resolution dialog"
            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 focus:outline-none focus:ring-2 focus:ring-[#4d8a93] cursor-pointer"
          >
            <XMarkIcon className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div className="overflow-y-auto p-5">
          <div className="space-y-1 rounded-xl border border-slate-200 bg-slate-50/70 p-3 text-xs">
            <div className="flex items-center justify-between gap-3">
              <span className="font-semibold text-slate-600">คู่กรณี</span>
              <span className="text-right font-bold text-slate-800">
                {report.reporterName} ↔ {report.reportedUserName}
              </span>
            </div>
            <div className="border-t border-slate-200/60 pt-1 text-slate-700">
              <span className="font-semibold text-slate-900">ประเด็น: </span>
              {report.reason}
            </div>
          </div>

          <form id="resolve-form" onSubmit={handleSubmit} className="mt-4 space-y-4">
            <div>
              <label htmlFor="resolution-note" className="mb-1.5 block text-xs font-bold text-[#092f45]">
                บันทึกข้อสรุปการแก้ปัญหา <span className="text-red-500">*</span>
              </label>
              <textarea
                id="resolution-note"
                required
                rows={4}
                value={resolutionNote}
                onChange={(event) => setResolutionNote(event.target.value)}
                placeholder="สรุปข้อเท็จจริงและผลการประสานงานระหว่างคู่กรณี"
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
            form="resolve-form"
            disabled={!resolutionNote.trim()}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#087f80] px-4 py-2 text-xs font-bold text-white shadow-xs transition-colors hover:bg-[#066768] focus:outline-none focus:ring-2 focus:ring-[#4d8a93] disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
          >
            <CheckCircleIcon className="h-4 w-4" aria-hidden="true" />
            Mark as Resolved
          </button>
        </div>
      </div>
    </div>
  );
}
