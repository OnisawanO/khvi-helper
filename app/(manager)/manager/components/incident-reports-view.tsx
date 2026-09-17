"use client";

import {
  ShieldCheckIcon,
  ShieldExclamationIcon,
} from "@heroicons/react/24/outline";
import { IncidentReport } from "../types";

interface IncidentReportsViewProps {
  reports: IncidentReport[];
  onEscalate: (reportId: string) => void;
}

export function IncidentReportsView({
  reports,
  onEscalate,
}: IncidentReportsViewProps) {
  const pendingCount = reports.filter(
    (r) => r.status === "Pending Investigation"
  ).length;

  return (
    <div className="min-h-[480px] rounded-2xl border border-[#d8e3e7] bg-white p-6 shadow-xs space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#edf2f4] pb-4">
        <div>
          <h2 className="text-base font-extrabold text-[#112d3f]">
            Incident Reports & Disputes (FR-53)
          </h2>
          <p className="mt-1 text-xs text-[#647f8d]">
            Misconduct reports filed by users or interpreters for operational triage and Admin escalation.
          </p>
        </div>
        <span className="rounded-full bg-[#fef5e8] px-3 py-1 text-xs font-bold text-[#b56e18]">
          Pending Cases: {pendingCount}
        </span>
      </div>

      {/* Reports List */}
      <div className="space-y-3">
        {reports.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            No incident reports found.
          </div>
        ) : (
          reports.map((report) => (
            <div
              key={report.id}
              className="rounded-xl border border-[#dbe6ec] p-4 transition-colors hover:border-[#087f80] bg-white"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#fff1ef] text-[#d93829] mt-0.5">
                    <ShieldExclamationIcon className="h-4 w-4" />
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-extrabold text-sm text-[#143242]">
                        Incident #{report.id}
                      </h3>
                      <span className="text-xs text-[#6b8491]">
                        Booking Ref:{" "}
                        <strong className="text-[#087f80]">
                          {report.bookingId}
                        </strong>
                      </span>
                    </div>
                    <p className="text-[11px] text-[#6b8491] mt-0.5">
                      Reported by:{" "}
                      <strong className="text-[#102938]">
                        {report.reporterName}
                      </strong>{" "}
                      ({report.reporterRole}) · Against:{" "}
                      <strong className="text-[#c0392b]">
                        {report.reportedUserName}
                      </strong>{" "}
                      ({report.reportedUserRole}) · {report.createdAt}
                    </p>
                  </div>
                </div>

                <span
                  className={`rounded-full px-2.5 py-0.5 text-[11px] font-extrabold ${
                    report.status === "Resolved"
                      ? "bg-[#e8f5f1] text-[#087557]"
                      : report.status === "Escalated to Admin"
                      ? "bg-[#eef2f6] text-[#2c4755]"
                      : "bg-[#fef4e8] text-[#b36916]"
                  }`}
                >
                  {report.status}
                </span>
              </div>

              <div className="mt-3 rounded-lg border border-[#e4ecf0] bg-[#f8fbfc] p-3 text-xs leading-relaxed text-[#355261]">
                <p className="font-bold text-[#143141]">Reported Issue:</p>
                <p className="mt-0.5">{report.reason}</p>
              </div>

              {report.actionTaken && (
                <div className="mt-2.5 rounded-lg border border-[#e2e8f0] bg-[#f8fafc] p-2.5 text-xs text-[#334155]">
                  <strong className="font-bold text-[#0f172a]">
                    Action Status:
                  </strong>{" "}
                  {report.actionTaken}
                </div>
              )}

              {/* Action buttons */}
              {report.status === "Pending Investigation" && (
                <div className="mt-3 flex items-center justify-end gap-2 border-t border-[#edf2f5] pt-3">
                  <button
                    type="button"
                    onClick={() => onEscalate(report.id)}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-[#092f45] px-4 py-1.5 text-xs font-bold text-white hover:bg-[#12425e] cursor-pointer"
                  >
                    <ShieldCheckIcon className="h-3.5 w-3.5 text-[#f59e0b]" />
                    Escalate to Admin Portal (Lock Account FR-78)
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

