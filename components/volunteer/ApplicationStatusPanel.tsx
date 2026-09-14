"use client";

import Link from "next/link";
import { useState } from "react";
import { useUiLocale } from "@/app/components/app-shell";
import type { ApplicationStatus, InterpreterApplication } from "@/app/lib/interpreter-application";

type ApplicationStatusPanelProps = {
  application: InterpreterApplication;
  onReupload?: (fileName: string) => void;
  onCancel?: (reason: string) => void;
  compact?: boolean;
};

const statusCopy: Record<ApplicationStatus, { th: string; en: string; zh: string; className: string }> = {
  pending: { th: "รอตรวจสอบ", en: "Pending review", zh: "等待审核", className: "border-[#d97706] bg-[#fffbeb] text-[#92400e]" },
  under_review: { th: "กำลังตรวจสอบ", en: "Under review", zh: "审核中", className: "border-[#087f80] bg-[#edf7f5] text-[#087557]" },
  needs_revision: { th: "ขอเอกสารเพิ่มเติม", en: "Needs revision", zh: "需要补充材料", className: "border-[#d97706] bg-[#fffbeb] text-[#92400e]" },
  approved: { th: "อนุมัติแล้ว", en: "Approved", zh: "已批准", className: "border-[#087557] bg-[#edf7f5] text-[#087557]" },
  rejected: { th: "ไม่อนุมัติ", en: "Rejected", zh: "未批准", className: "border-[#f04f3e] bg-[#fff1f2] text-[#b8291b]" },
  cancelled: { th: "ถอนใบสมัครแล้ว", en: "Withdrawn", zh: "已撤回", className: "border-[#cbd7dc] bg-[#f3f6f7] text-[#53656c]" },
};

export function ApplicationStatusPanel({ application, onReupload, onCancel, compact = false }: ApplicationStatusPanelProps) {
  const locale = useUiLocale();
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const status = statusCopy[application.status];
  const label = locale === "th" ? status.th : locale === "zh" ? status.zh : status.en;
  const detail = application.status === "needs_revision"
    ? application.revisionNote
    : application.status === "rejected"
      ? application.rejectReason
      : application.status === "approved"
        ? locale === "th" ? "คุณสมบัติผ่านการตรวจสอบตามกฎ BR-02 แล้ว" : locale === "zh" ? "已通过 BR-02 资格审核" : "Your credentials passed the BR-02 review."
        : application.status === "cancelled"
          ? application.cancellationReason ?? (locale === "th" ? "คุณถอนใบสมัครนี้แล้ว" : locale === "zh" ? "你已撤回此申请" : "You withdrew this application.")
        : locale === "th" ? "ใบสมัครถูกส่งเข้าคิวตรวจสอบของ Manager แล้ว" : locale === "zh" ? "申请已进入管理员审核队列" : "Your application is in the Manager review queue.";
  const canCancel = Boolean(onCancel) && ["pending", "under_review", "needs_revision"].includes(application.status);

  return (
    <div className="space-y-5">
      <section className="border border-[#143748] bg-[#092f45] p-5 text-white shadow-sm sm:p-7" aria-labelledby="application-status-title">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-wider text-[#8ed5c4]">Volunteer application</p>
            <h1 id="application-status-title" className="mt-2 text-xl font-extrabold sm:text-2xl">
              {locale === "th" ? "ติดตามสถานะใบสมัครล่ามอาสา" : locale === "zh" ? "查看志愿口译员申请状态" : "Track your interpreter application"}
            </h1>
            <p className="mt-2 text-xs text-white/75">{application.id} · {application.applicantName}</p>
          </div>
          <span className={`inline-flex w-fit border px-3 py-1.5 text-xs font-extrabold ${status.className}`}>{label}</span>
        </div>
      </section>

      <section className="border border-[#d6e0e4] bg-white p-5 shadow-sm sm:p-7" aria-labelledby="application-summary-title">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 id="application-summary-title" className="text-lg font-extrabold text-[#10283a]">
              {locale === "th" ? "สรุปใบสมัคร" : locale === "zh" ? "申请摘要" : "Application summary"}
            </h2>
            <p className="mt-1 text-xs text-[#64777e]">{locale === "th" ? `ส่งเมื่อ ${application.submittedAt}` : `Submitted ${application.submittedAt}`}</p>
          </div>
          {application.reviewedAt && <p className="text-xs text-[#64777e]">{locale === "th" ? `ตรวจล่าสุด ${application.reviewedAt}` : `Reviewed ${application.reviewedAt}`}</p>}
        </div>

        <p className="mt-4 rounded-lg bg-[#f7f9fa] p-4 text-sm leading-7 text-[#294554]">{detail}</p>

        {(application.status === "needs_revision" || application.status === "rejected") && onReupload && (
          <div className="mt-4 border border-[#d97706] bg-[#fffbeb] p-4">
            <p className="text-sm font-extrabold text-[#92400e]">
              {application.status === "rejected" ? "เริ่มใบสมัครใหม่ด้วยข้อมูลที่แก้ไขแล้ว" : "อัปโหลดเอกสารใหม่เพื่อส่งตรวจอีกครั้ง"}
            </p>
            <input
              className="mt-3 block w-full text-xs text-[#526a74] file:mr-3 file:border-0 file:bg-[#b45309] file:px-3 file:py-2 file:font-bold file:text-white"
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) onReupload(file.name);
              }}
            />
          </div>
        )}

        {canCancel && (
          <div className="mt-5 border-t border-[#e6eef0] pt-5">
            {cancelOpen ? (
              <div className="border border-[#f8c5be] bg-[#fff8f7] p-4">
                <p className="text-sm font-extrabold text-[#b8291b]">ยืนยันการถอนใบสมัคร</p>
                <p className="mt-1 text-xs leading-5 text-[#7c4a44]">หลังถอน ใบสมัครนี้จะออกจากคิวตรวจสอบ และจะไม่สามารถให้ Manager พิจารณาต่อได้</p>
                <label className="mt-3 block text-xs font-bold text-[#7c4a44]" htmlFor="application-cancel-reason">เหตุผล (ไม่บังคับ)</label>
                <textarea
                  id="application-cancel-reason"
                  value={cancelReason}
                  onChange={(event) => setCancelReason(event.target.value)}
                  maxLength={300}
                  rows={2}
                  placeholder="เช่น เปลี่ยนใจและยังไม่พร้อมรับงาน"
                  className="mt-1.5 w-full resize-y border border-[#e6b8b1] bg-white px-3 py-2 text-sm text-[#203d4d] focus:border-[#c33a2a] focus:outline-none"
                />
                <div className="mt-3 flex flex-wrap gap-2">
                  <button type="button" onClick={() => onCancel?.(cancelReason)} className="bg-[#c33a2a] px-4 py-2 text-xs font-extrabold text-white hover:bg-[#a92e22]">ยืนยันถอนใบสมัคร</button>
                  <button type="button" onClick={() => setCancelOpen(false)} className="border border-[#cbd7dc] bg-white px-4 py-2 text-xs font-bold text-[#39525d] hover:bg-[#f8fafb]">เก็บใบสมัครไว้</button>
                </div>
              </div>
            ) : (
              <button type="button" onClick={() => setCancelOpen(true)} className="inline-flex min-h-10 items-center justify-center border border-[#e6b8b1] bg-white px-4 py-2 text-sm font-bold text-[#b8291b] hover:bg-[#fff1f2]">
                ถอนใบสมัครนี้
              </button>
            )}
          </div>
        )}

        {!compact && (
          <>
            <div className="mt-5 grid gap-4 text-sm sm:grid-cols-2">
              <div><dt className="text-xs font-bold text-[#73848a]">Applicant</dt><dd className="mt-1 font-extrabold text-[#203d4d]">{application.applicantName}</dd></div>
              <div><dt className="text-xs font-bold text-[#73848a]">Contact</dt><dd className="mt-1 font-extrabold text-[#203d4d]">{application.phone}</dd></div>
              <div><dt className="text-xs font-bold text-[#73848a]">Languages</dt><dd className="mt-1 flex flex-wrap gap-1.5">{application.languages.map((language) => <span key={language.id} className="rounded-full border border-[#b9d9d6] bg-[#edf7f5] px-2.5 py-1 text-xs font-bold text-[#087557]">{language.name}</span>)}</dd></div>
              <div><dt className="text-xs font-bold text-[#73848a]">Categories</dt><dd className="mt-1 flex flex-wrap gap-1.5">{application.categories.map((category) => <span key={category.id} className="rounded-full border border-[#d6e0e4] bg-[#f8fafb] px-2.5 py-1 text-xs font-bold text-[#39525d]">{category.icon} {category.name}</span>)}</dd></div>
            </div>

            <div className="mt-5 border-t border-[#e6eef0] pt-5">
              <h3 className="text-sm font-extrabold text-[#203d4d]">Documents and review record</h3>
              <ul className="mt-3 space-y-2 text-xs text-[#526a74]">
                {application.documents.map((document) => <li key={document.name} className="flex items-center justify-between gap-3 border border-[#d6e0e4] bg-[#f8fafb] px-3 py-2.5"><span>📄 {document.name}</span><span>{document.size}</span></li>)}
              </ul>
              {application.reviewedByManagerName && <p className="mt-3 text-xs text-[#64777e]">Reviewed by <strong className="text-[#203d4d]">{application.reviewedByManagerName}</strong></p>}
            </div>
          </>
        )}
      </section>

      <div className="flex flex-wrap gap-3">
        <Link className="inline-flex min-h-11 items-center justify-center border border-[#087f80] px-4 py-2.5 text-sm font-bold text-[#087f80] hover:bg-[#edf7f5]" href="/welcome#welcome-user">กลับหน้า Workspace</Link>
        {(application.status === "needs_revision" || application.status === "rejected" || application.status === "cancelled") && <Link className="inline-flex min-h-11 items-center justify-center bg-[#092f45] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#0c4960]" href="/volunteer/apply#main-content">{application.status === "cancelled" ? "สมัครใหม่" : "แก้ไขใบสมัคร"}</Link>}
      </div>
    </div>
  );
}
