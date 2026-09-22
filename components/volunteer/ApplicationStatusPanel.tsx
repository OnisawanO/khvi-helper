"use client";

import Link from "next/link";
import { useState } from "react";
import { useInterpreterAccess, useUiLocale } from "@/app/components/app-shell";
import type { ApplicationStatus, InterpreterApplication } from "@/app/lib/interpreter-application";

type ApplicationStatusPanelProps = {
  application: InterpreterApplication;
  onReupload?: (file: File) => void;
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
  const { revoked } = useInterpreterAccess();
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const status = statusCopy[application.status];
  const label = revoked ? locale === "th" ? "ถูกยกเลิกสถานะล่าม" : locale === "zh" ? "口译员资格已撤销" : "Accreditation revoked" : locale === "th" ? status.th : locale === "zh" ? status.zh : status.en;
  const detail = revoked
    ? locale === "th" ? "สถานะล่ามอาสาของคุณถูกยกเลิกแล้ว" : locale === "zh" ? "你的志愿口译员资格已被撤销" : "Your interpreter accreditation has been revoked."
    : application.status === "needs_revision"
    ? application.revisionNote
    : application.status === "rejected"
      ? application.rejectReason
      : application.status === "approved"
        ? locale === "th" ? "คุณสมบัติผ่านการตรวจสอบตามกฎ BR-02 แล้ว" : locale === "zh" ? "已通过 BR-02 资格审核" : "Your credentials passed the BR-02 review."
        : application.status === "cancelled"
          ? application.cancellationReason ?? (locale === "th" ? "คุณถอนใบสมัครนี้แล้ว" : locale === "zh" ? "你已撤回此申请" : "You withdrew this application.")
        : locale === "th" ? "ใบสมัครถูกส่งเข้าคิวตรวจสอบของ Manager แล้ว" : locale === "zh" ? "申请已进入管理员审核队列" : "Your application is in the Manager review queue.";
  const canCancel = Boolean(onCancel) && ["pending", "under_review", "needs_revision"].includes(application.status);

  const isStep2Done = ["approved", "rejected", "needs_revision"].includes(application.status);
  const isStep2Active = ["pending", "under_review"].includes(application.status);
  const isStep3Done = application.status === "approved";
  const isStep3Attention = application.status === "needs_revision";
  const isStep3Rejected = application.status === "rejected";
  const isCancelled = application.status === "cancelled";

  return (
    <div className="space-y-5">
      <section className="rounded-(--khvi-radius-md) border border-[#143748] bg-[#092f45] p-5 text-white shadow-sm sm:p-7" aria-labelledby="application-status-title">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-wider text-[#8ed5c4]">Volunteer application</p>
            <h1 id="application-status-title" className="mt-2 text-xl font-extrabold sm:text-2xl">
              {locale === "th" ? "ติดตามสถานะใบสมัครล่ามอาสา" : locale === "zh" ? "查看志愿口译员申请状态" : "Track your interpreter application"}
            </h1>
            <p className="mt-2 text-xs text-white/75">{application.id} · {application.applicantName}</p>
          </div>
          <span className={`inline-flex w-fit rounded-full border px-3 py-1.5 text-xs font-extrabold ${revoked ? "border-[#f04f3e] bg-[#fff1f2] text-[#b8291b]" : status.className}`}>{label}</span>
        </div>
      </section>

      {/* 3-Step Progress Indicator */}
      <section className="rounded-(--khvi-radius-md) border border-[#d6e0e4] bg-white p-5 sm:p-7 shadow-sm" aria-label={locale === "th" ? "ขั้นตอนการสมัคร" : "Application progress steps"}>
        <h2 className="text-xs font-black uppercase tracking-wider text-[#64777e] mb-5">
          {locale === "th" ? "ขั้นตอนการดำเนินงาน (Progress Steps)" : locale === "zh" ? "申请流程进度" : "Application Progress Steps"}
        </h2>

        <div className="relative">
          {/* Connector Line for Desktop */}
          <div className="hidden sm:block absolute top-5 left-[16.66%] right-[16.66%] h-1 -translate-y-1/2 bg-[#e4edf0] z-0" aria-hidden="true">
            <div
              className="h-full transition-all duration-500"
              style={{
                width: isStep3Done || isStep3Attention || isStep3Rejected ? "100%" : isStep2Active ? "50%" : "0%",
                backgroundColor: isStep3Done ? "#087557" : isStep3Rejected ? "#f04f3e" : isStep3Attention ? "#d97706" : "#087f80",
              }}
            />
          </div>

          <ol className="grid grid-cols-1 gap-6 sm:grid-cols-3 sm:gap-4 relative z-10">
            {/* Step 1: ส่งใบสมัครล่าม */}
            <li className="flex sm:flex-col items-center sm:items-center text-left sm:text-center gap-3.5 sm:gap-2">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-[#087557] bg-[#087557] font-extrabold text-white shadow-xs">
                ✓
              </div>
              <div className="min-w-0">
                <p className="text-sm font-extrabold text-[#10283a]">
                  {locale === "th" ? "1. ส่งใบสมัครล่าม" : locale === "zh" ? "1. 提交口译申请" : "1. Submit application"}
                </p>
                <p className="mt-0.5 text-xs text-[#53656c]">
                  {locale === "th" ? `ส่งเมื่อ ${application.submittedAt}` : `Submitted ${application.submittedAt}`}
                </p>
              </div>
            </li>

            {/* Step 2: กำลังตรวจสอบ */}
            <li className="flex sm:flex-col items-center sm:items-center text-left sm:text-center gap-3.5 sm:gap-2">
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 font-extrabold shadow-xs transition-colors ${
                isStep2Done
                  ? "border-[#087557] bg-[#087557] text-white"
                  : isStep2Active
                    ? "border-[#087f80] bg-[#087f80] text-white ring-4 ring-[#087f80]/20"
                    : isCancelled
                      ? "border-[#cbd7dc] bg-[#cbd7dc] text-[#53656c]"
                      : "border-[#cbd7dc] bg-[#f4f7f8] text-[#73848a]"
              }`}>
                {isStep2Done ? "✓" : isCancelled ? "—" : "2"}
              </div>
              <div className="min-w-0">
                <p className={`text-sm font-extrabold ${isStep2Active ? "text-[#087f80]" : "text-[#10283a]"}`}>
                  {locale === "th" ? "2. กำลังตรวจสอบ" : locale === "zh" ? "2. 正在审核" : "2. Under review"}
                </p>
                <p className="mt-0.5 text-xs text-[#53656c]">
                  {isStep2Done
                    ? locale === "th" ? (application.reviewedAt ? `ตรวจเมื่อ ${application.reviewedAt}` : "ตรวจสอบเรียบร้อย") : "Review completed"
                    : application.status === "under_review"
                      ? locale === "th" ? "Manager กำลังตรวจสอบข้อมูล" : "Manager is reviewing"
                      : isCancelled
                        ? locale === "th" ? "ยกเลิกคำขอแล้ว" : "Withdrawn"
                        : locale === "th" ? "อยู่ในคิวรอการตรวจสอบ" : "In review queue"}
                </p>
              </div>
            </li>

            {/* Step 3: ตรวจสอบเสร็จแล้ว */}
            <li className="flex sm:flex-col items-center sm:items-center text-left sm:text-center gap-3.5 sm:gap-2">
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 font-extrabold shadow-xs transition-colors ${
                isStep3Done
                  ? "border-[#087557] bg-[#087557] text-white ring-4 ring-[#087557]/20"
                  : isStep3Attention
                    ? "border-[#d97706] bg-[#fffbeb] text-[#92400e] ring-4 ring-[#d97706]/20"
                    : isStep3Rejected
                      ? "border-[#f04f3e] bg-[#fff1f2] text-[#b8291b] ring-4 ring-[#f04f3e]/20"
                      : isCancelled
                        ? "border-[#cbd7dc] bg-[#cbd7dc] text-[#53656c]"
                        : "border-[#cbd7dc] bg-[#f4f7f8] text-[#73848a]"
              }`}>
                {isStep3Done ? "✓" : isStep3Attention ? "!" : isStep3Rejected ? "✕" : isCancelled ? "—" : "3"}
              </div>
              <div className="min-w-0">
                <p className={`text-sm font-extrabold ${
                  isStep3Done
                    ? "text-[#087557]"
                    : isStep3Attention
                      ? "text-[#92400e]"
                      : isStep3Rejected
                        ? "text-[#b8291b]"
                        : "text-[#10283a]"
                }`}>
                  {locale === "th" ? "3. ตรวจสอบเสร็จแล้ว" : locale === "zh" ? "3. 审核完成" : "3. Review completed"}
                </p>
                <p className="mt-0.5 text-xs text-[#53656c]">
                  {isStep3Done
                    ? locale === "th" ? "อนุมัติคุณสมบัติเรียบร้อย" : "Approved as Interpreter"
                    : isStep3Attention
                      ? locale === "th" ? "ขอเอกสารเพิ่มเติม" : "Revision requested"
                      : isStep3Rejected
                        ? locale === "th" ? "ไม่อนุมัติใบสมัคร" : "Application rejected"
                        : isCancelled
                          ? locale === "th" ? "ถอนใบสมัครแล้ว" : "Withdrawn"
                          : locale === "th" ? "รอผลการพิจารณา" : "Awaiting decision"}
                </p>
              </div>
            </li>
          </ol>
        </div>
      </section>

      <section className="rounded-(--khvi-radius-md) border border-[#d6e0e4] bg-white p-5 shadow-sm sm:p-7" aria-labelledby="application-summary-title">
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
          <div className="mt-4 rounded-(--khvi-radius-sm) border border-[#d97706] bg-[#fffbeb] p-4">
            <p className="text-sm font-extrabold text-[#92400e]">
              {application.status === "rejected" ? "เริ่มใบสมัครใหม่ด้วยข้อมูลที่แก้ไขแล้ว" : "อัปโหลดเอกสารใหม่เพื่อส่งตรวจอีกครั้ง"}
            </p>
            <input
              className="mt-3 block w-full text-xs text-[#526a74] file:mr-3 file:border-0 file:rounded-(--khvi-radius-sm) file:bg-[#b45309] file:px-3 file:py-2 file:font-bold file:text-white"
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) onReupload(file);
              }}
            />
          </div>
        )}

        {!compact && (
          <>
            <div className="mt-5 grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
              <div><dt className="text-xs font-bold text-[#73848a]">Applicant</dt><dd className="mt-1 font-extrabold text-[#203d4d]">{application.applicantName}</dd></div>
              <div><dt className="text-xs font-bold text-[#73848a]">Contact</dt><dd className="mt-1 font-extrabold text-[#203d4d]">{application.phone}</dd></div>
              <div><dt className="text-xs font-bold text-[#73848a]">Languages</dt><dd className="mt-1 flex flex-wrap gap-1.5">{application.languages.map((language) => <span key={language.id} className="rounded-full border border-[#b9d9d6] bg-[#edf7f5] px-2.5 py-1 text-xs font-bold text-[#087557]">{language.name}</span>)}</dd></div>
              <div><dt className="text-xs font-bold text-[#73848a]">Categories</dt><dd className="mt-1 flex flex-wrap gap-1.5">{application.categories.map((category) => <span key={category.id} className="rounded-full border border-[#d6e0e4] bg-[#f8fafb] px-2.5 py-1 text-xs font-bold text-[#39525d]">{category.icon} {category.name}</span>)}</dd></div>
            </div>

            <div className="mt-5 border-t border-[#e6eef0] pt-5">
              <h3 className="text-sm font-extrabold text-[#203d4d]">Documents and review record</h3>
              <ul className="mt-3 space-y-2 text-xs text-[#526a74]">
                {application.documents.map((document) => <li key={document.name} className="flex items-center justify-between gap-3 rounded-(--khvi-radius-sm) border border-[#d6e0e4] bg-[#f8fafb] px-3 py-2.5"><span>📄 {document.name}</span><span>{document.size}</span></li>)}
              </ul>
              {application.reviewedByManagerName && <p className="mt-3 text-xs text-[#64777e]">Reviewed by <strong className="text-[#203d4d]">{application.reviewedByManagerName}</strong></p>}
            </div>
          </>
        )}

        {canCancel && (
          <div className="mt-6 border-t border-[#e6eef0] pt-5">
            {cancelOpen ? (
              <div className="rounded-(--khvi-radius-sm) border border-[#f8c5be] bg-[#fff8f7] p-4">
                <p className="text-sm font-extrabold text-[#b8291b]">ยืนยันการยกเลิกสมัคร</p>
                <p className="mt-1 text-xs leading-5 text-[#7c4a44]">หลังยกเลิก ใบสมัครนี้จะถูกถอนออกจากระบบ และนำคุณกลับสู่หน้าหลัก</p>
                <label className="mt-3 block text-xs font-bold text-[#7c4a44]" htmlFor="application-cancel-reason">เหตุผล (ไม่บังคับ)</label>
                <textarea
                  id="application-cancel-reason"
                  value={cancelReason}
                  onChange={(event) => setCancelReason(event.target.value)}
                  maxLength={300}
                  rows={2}
                  placeholder="เช่น เปลี่ยนใจและยังไม่พร้อมรับงาน"
                  className="mt-1.5 w-full resize-y rounded-(--khvi-radius-sm) border border-[#e6b8b1] bg-white px-3 py-2 text-sm text-[#203d4d] focus:border-[#c33a2a] focus:outline-none"
                />
                <div className="mt-3 flex flex-wrap gap-2">
                  <button type="button" onClick={() => onCancel?.(cancelReason)} className="rounded-(--khvi-radius-sm) bg-[#c33a2a] px-4 py-2 text-xs font-extrabold text-white hover:bg-[#a92e22] cursor-pointer">ยืนยันยกเลิกสมัครและกลับสู่หน้าหลัก</button>
                  <button type="button" onClick={() => setCancelOpen(false)} className="rounded-(--khvi-radius-sm) border border-[#cbd7dc] bg-white px-4 py-2 text-xs font-bold text-[#39525d] hover:bg-[#f8fafb] cursor-pointer">เก็บใบสมัครไว้</button>
                </div>
              </div>
            ) : (
              <button type="button" onClick={() => setCancelOpen(true)} className="inline-flex min-h-10 items-center justify-center rounded-(--khvi-radius-sm) border border-[#e6b8b1] bg-white px-4 py-2 text-sm font-bold text-[#b8291b] hover:bg-[#fff1f2] cursor-pointer">
                ยกเลิกสมัครเพื่อออกและกลับสู่หน้าหลัก
              </button>
            )}
          </div>
        )}
      </section>

      <div className="flex flex-wrap gap-3">
        <Link className="inline-flex min-h-11 items-center justify-center rounded-(--khvi-radius-sm) border border-[#087f80] px-4 py-2.5 text-sm font-bold text-[#087f80] hover:bg-[#edf7f5]" href="/welcome#welcome-user">กลับสู่หน้าหลัก</Link>
        {!revoked && (application.status === "needs_revision" || application.status === "rejected" || application.status === "cancelled") && <Link className="inline-flex min-h-11 items-center justify-center rounded-(--khvi-radius-sm) bg-[#092f45] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#0c4960]" href="/volunteer/apply#main-content">{application.status === "cancelled" ? "สมัครใหม่" : "แก้ไขใบสมัคร"}</Link>}
      </div>
    </div>
  );
}
