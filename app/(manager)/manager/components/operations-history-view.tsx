"use client";

import {
  CheckCircleIcon,
  ChatBubbleLeftRightIcon,
  ClockIcon,
  ShieldExclamationIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { ManagerActivity } from "../types";

interface OperationsHistoryViewProps {
  activities: ManagerActivity[];
}

export function OperationsHistoryView({
  activities,
}: OperationsHistoryViewProps) {
  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black tracking-tight text-[#092f45]">
            Operations Activity History
          </h2>
          <p className="mt-1 text-xs text-[#527082]">
            Log of administrative and operational actions taken by managers (Approvals, Rejections, Ticket Replies, and Admin Escalations).
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f1f5f8] px-3 py-1 text-xs font-bold text-[#2d4b5b] border border-[#dce6ed]">
            <ClockIcon className="h-3.5 w-3.5 text-[#087f80]" />
            Total Actions: {activities.length}
          </span>
        </div>
      </div>

      {/* Activity Feed Timeline */}
      <div className="space-y-3">
        {activities.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#c6d7e0] bg-white p-12 text-center">
            <ClockIcon className="h-10 w-10 text-slate-300" />
            <h4 className="mt-3 text-sm font-bold text-[#092f45]">
              No activity records found
            </h4>
            <p className="mt-1 text-xs text-[#6b8491]">
              Actions taken on applicants, help tickets, or reports will appear here in chronological order.
            </p>
          </div>
        ) : (
          activities.map((act) => {
            let badgeBg = "bg-[#f0f9f5] text-[#087557] border-[#bfe5d7]";
            let typeLabel = "Approval";
            let IconComponent = CheckCircleIcon;

            if (act.type === "rejection") {
              badgeBg = "bg-[#fff1ef] text-[#d93829] border-[#fecac6]";
              typeLabel = "Rejection";
              IconComponent = XMarkIcon;
            } else if (act.type === "ticket_reply") {
              badgeBg = "bg-[#f0f7ff] text-[#0284c7] border-[#bae6fd]";
              typeLabel = "Ticket Reply";
              IconComponent = ChatBubbleLeftRightIcon;
            } else if (act.type === "report_escalation") {
              badgeBg = "bg-[#fffbeb] text-[#d97706] border-[#fde68a]";
              typeLabel = "Escalated to Admin";
              IconComponent = ShieldExclamationIcon;
            }

            return (
              <div
                key={act.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-[#dbe6ec] bg-white p-4 transition-all hover:border-[#087f80] hover:shadow-xs"
              >
                <div className="flex items-start gap-3">
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border ${badgeBg}`}
                  >
                    <IconComponent className="h-5 w-5" />
                  </span>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-black text-[#092f45]">
                        {act.targetName}
                      </span>
                      <span
                        className={`rounded-full border px-2 py-0.5 text-[10px] font-extrabold ${badgeBg}`}
                      >
                        {typeLabel}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-[#4b6574] leading-relaxed">
                      {act.description}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0 self-start sm:self-center pl-12 sm:pl-0">
                  <span className="text-[11px] font-bold text-[#839ba8] whitespace-nowrap">
                    {act.timestamp}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

