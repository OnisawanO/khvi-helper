"use client";

import { useMemo, useState } from "react";
import { ManagerMetrics } from "@/components/manager/ManagerMetrics";
import {
  ApplicationDetailModal,
  type InterpreterApplication as ModalApplication,
} from "@/components/manager/ApplicationDetailModal";
import {
  reviewInterpreterApplication,
  useInterpreterApplications,
  type ApplicationStatus,
  type InterpreterApplication,
} from "@/app/lib/interpreter-application";
import type { UserProfile } from "@/app/lib/mock-auth";

type InterpreterApplicationQueueProps = {
  manager: UserProfile;
  initialStatusFilter?: QueueFilter;
};

type QueueFilter = ApplicationStatus | "queue" | "all";

const statusLabel: Record<ApplicationStatus, string> = {
  pending: "รอตรวจสอบ",
  under_review: "กำลังตรวจสอบ",
  needs_revision: "ขอเอกสารเพิ่ม",
  approved: "อนุมัติแล้ว",
  rejected: "ไม่อนุมัติ",
  cancelled: "ถอนใบสมัครแล้ว",
};

const statusClass: Record<ApplicationStatus, string> = {
  pending: "border-[#d97706]/20 bg-[#fff8e8] text-[#b36916]",
  under_review: "border-[#1a5b82]/20 bg-[#e8f2f8] text-[#1a5b82]",
  needs_revision: "border-[#b45309]/20 bg-[#fff7ed] text-[#b45309]",
  approved: "border-[#087557]/20 bg-[#e7f5f0] text-[#087557]",
  rejected: "border-[#d93829]/20 bg-[#fff1ef] text-[#d93829]",
  cancelled: "border-[#cbd7dc] bg-[#f3f6f7] text-[#53656c]",
};

function asModalApplication(application: InterpreterApplication): ModalApplication {
  return application;
}

export function InterpreterApplicationQueue({ manager, initialStatusFilter = "all" }: InterpreterApplicationQueueProps) {
  const { applications, ready } = useInterpreterApplications();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<QueueFilter>(initialStatusFilter);
  const [selected, setSelected] = useState<InterpreterApplication | null>(null);
  const [error, setError] = useState<string | null>(null);

  const counts = useMemo(() => ({
    total: applications.length,
    pending: applications.filter((item) => item.status === "pending" || item.status === "under_review").length,
    approved: applications.filter((item) => item.status === "approved").length,
    needsRevision: applications.filter((item) => item.status === "needs_revision").length,
    rejected: applications.filter((item) => item.status === "rejected").length,
  }), [applications]);

  const displayedApplications = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return applications.filter((application) => {
      const matchesStatus = statusFilter === "all"
        || (statusFilter === "queue" && (application.status === "pending" || application.status === "under_review" || application.status === "needs_revision"))
        || application.status === statusFilter;
      const searchable = [
        application.id,
        application.applicantName,
        application.email,
        application.phone,
        application.assignedArea,
        application.primaryLanguage,
        ...application.languages.map((language) => language.name),
        ...application.categories.map((category) => category.name),
      ].join(" ").toLowerCase();
      return matchesStatus && (!normalizedQuery || searchable.includes(normalizedQuery));
    });
  }, [applications, query, statusFilter]);

  const applyDecision = (applicationId: string, decision: Parameters<typeof reviewInterpreterApplication>[2]) => {
    try {
      setError(null);
      reviewInterpreterApplication(applicationId, manager, decision);
      setSelected(null);
    } catch (reviewError) {
      setError(reviewError instanceof Error ? reviewError.message : "บันทึกผลการพิจารณาไม่สำเร็จ");
    }
  };

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-[#d8e3e7] bg-white p-5 shadow-xs">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[#087f80]">Recruitment workflow · PR26</p>
            <h1 className="mt-1 text-lg font-extrabold text-[#112d3f] sm:text-xl">Volunteer interpreter applications</h1>
            <p className="mt-1 text-xs text-[#637d8a]">คิวนี้ใช้ข้อมูลใบสมัครชุดเดียวกับหน้า Workspace และหน้า status ของผู้สมัคร</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="ค้นหาชื่อ, ID, ภาษา..."
              className="w-52 rounded-xl border border-[#ccdbe1] bg-[#f9fbfb] px-3 py-2 text-xs text-[#143141] focus:border-[#087f80] focus:bg-white focus:outline-none"
            />
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as QueueFilter)}
              className="rounded-xl border border-[#ccdbe1] bg-white px-3 py-2 text-xs font-bold text-[#254454] focus:border-[#087f80] focus:outline-none"
            >
              <option value="queue">คิวที่ต้องดำเนินการ</option>
              <option value="all">ทุกสถานะ</option>
              {(Object.keys(statusLabel) as ApplicationStatus[]).map((status) => <option key={status} value={status}>{statusLabel[status]}</option>)}
            </select>
          </div>
        </div>
      </section>

      <ManagerMetrics {...counts} />

      {error && <div role="alert" className="border border-[#f8c5be] bg-[#fff1f2] p-3 text-sm font-bold text-[#b8291b]">{error}</div>}

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50/90 px-5 py-3.5">
          <div>
            <h2 className="text-sm font-extrabold text-[#092f45]">Application review queue</h2>
            <p className="mt-1 text-[11px] text-[#637d8a]">เลือกแถวเพื่อเปิดข้อมูลสมัครและตัดสินใจตาม BR-02</p>
          </div>
          <span className="font-mono text-xs font-bold text-[#087f80]">{displayedApplications.length} / {applications.length}</span>
        </div>

        {!ready ? (
          <div className="p-10 text-center text-sm text-[#64777e]">กำลังโหลดคิวใบสมัคร...</div>
        ) : displayedApplications.length === 0 ? (
          <div className="p-10 text-center text-sm text-[#64777e]">ไม่พบใบสมัครตามเงื่อนไข</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse text-left text-xs text-slate-600">
              <thead className="border-b border-slate-200 bg-white font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-5 py-3">ผู้สมัคร</th>
                  <th className="px-3 py-3">ภาษา / หมวดงาน</th>
                  <th className="px-3 py-3">ส่งเมื่อ</th>
                  <th className="px-3 py-3 text-center">สถานะ</th>
                  <th className="px-5 py-3 text-right">การทำงาน</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {displayedApplications.map((application) => (
                  <tr key={application.id} className="cursor-pointer transition-colors hover:bg-teal-50/40" onClick={() => setSelected(application)}>
                    <td className="px-5 py-3.5">
                      <p className="font-bold text-sm text-[#092f45]">{application.applicantName}</p>
                      <p className="mt-0.5 font-mono text-[10px] text-slate-500">{application.id} · {application.assignedArea}</p>
                    </td>
                    <td className="px-3 py-3.5">
                      <p className="font-bold text-[#092f45]">{application.languages.map((language) => language.name).join(", ")}</p>
                      <p className="mt-1 max-w-xs truncate text-[10px] text-slate-500">{application.categories.map((category) => category.name).join(" · ")}</p>
                    </td>
                    <td className="px-3 py-3.5 text-[11px] text-slate-500">{application.submittedAt}</td>
                    <td className="px-3 py-3.5 text-center">
                      <span className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-extrabold ${statusClass[application.status]}`}>{statusLabel[application.status]}</span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button type="button" onClick={(event) => { event.stopPropagation(); setSelected(application); }} className="rounded-lg border border-[#087f80] px-3 py-1.5 text-[11px] font-bold text-[#087f80] hover:bg-[#edf7f5]">ตรวจสอบ</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <ApplicationDetailModal
        application={selected ? asModalApplication(selected) : null}
        isOpen={Boolean(selected)}
        onClose={() => setSelected(null)}
        onApprove={(applicationId) => applyDecision(applicationId, { status: "approved" })}
        onRequestRevision={(applicationId, note) => applyDecision(applicationId, { status: "needs_revision", note })}
        onReject={(applicationId, reason) => applyDecision(applicationId, { status: "rejected", reason })}
      />
    </div>
  );
}
