"use client";

import { useState, type FormEvent } from "react";
import { CheckCircleIcon, XMarkIcon } from "@heroicons/react/24/outline";
import type { AdminIncidentReport } from "../types";

type SystemReportResolutionDialogProps = {
  report: AdminIncidentReport | null;
  onClose: () => void;
  onConfirm: (reportId: string, note: string) => void;
};

export function SystemReportResolutionDialog({
  report,
  onClose,
  onConfirm,
}: SystemReportResolutionDialogProps) {
  const [note, setNote] = useState("");

  if (!report) return null;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedNote = note.trim();
    if (!trimmedNote) return;
    onConfirm(report.id, trimmedNote);
    setNote("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-slate-100 p-5">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircleIcon className="h-6 w-6" aria-hidden="true" />
            </span>
            <div>
              <h2 className="text-base font-extrabold text-[#092f45]">Resolve system report</h2>
              <p className="mt-0.5 text-xs text-slate-500">{report.id} · {report.category || report.systemArea || "System issue"}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#4d8a93]"
          >
            <XMarkIcon className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-3 p-5">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs leading-relaxed text-slate-700">
              <p className="font-bold text-[#092f45]">Reported issue</p>
              <p className="mt-1">{report.reason}</p>
            </div>
            <label className="block text-xs font-bold text-[#092f45]" htmlFor="system-report-resolution-note">
              Resolution note <span className="text-red-500">*</span>
            </label>
            <textarea
              id="system-report-resolution-note"
              required
              rows={4}
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Describe the fix, verification, or follow-up action."
              className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 placeholder-slate-400 focus:border-[#087f80] focus:outline-none focus:ring-1 focus:ring-[#087f80]"
            />
          </div>
          <div className="flex justify-end gap-2 border-t border-slate-100 bg-slate-50/60 p-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#4d8a93]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!note.trim()}
              className="rounded-xl bg-[#087f80] px-4 py-2 text-xs font-bold text-white hover:bg-[#066768] disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-[#4d8a93]"
            >
              Mark resolved
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
