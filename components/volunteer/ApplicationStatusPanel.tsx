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

function getExtraContactIcon(extraContact: string): string {
  if (extraContact.startsWith("ID_LINE:") || extraContact.toLowerCase().includes("line")) return "💬";
  if (extraContact.startsWith("FACEBOOK:") || extraContact.toLowerCase().includes("facebook")) return "📘";
  if (extraContact.startsWith("WHATSAPP:") || extraContact.toLowerCase().includes("whatsapp")) return "📱";
  if (extraContact.startsWith("WECHAT:") || extraContact.toLowerCase().includes("wechat")) return "🟢";
  if (extraContact.startsWith("TELEGRAM:") || extraContact.toLowerCase().includes("telegram")) return "✈️";
  return "🌐";
}

export function ApplicationStatusPanel({ application, onReupload, onCancel, compact = false }: ApplicationStatusPanelProps) {
  const locale = useUiLocale();
  const { revoked } = useInterpreterAccess();
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [previewDoc, setPreviewDoc] = useState<{ name: string; url: string } | null>(null);

  const resolveDocUrl = (rawUrl?: string) => {
    if (!rawUrl) return "";
    if (rawUrl.startsWith("http://") || rawUrl.startsWith("https://") || rawUrl.startsWith("/")) {
      return rawUrl;
    }
    return `/api/interpreter-certificate?path=${encodeURIComponent(rawUrl)}`;
  };
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
                  {locale === "th"
                    ? `ส่งเมื่อ ${application.submittedAt}`
                    : locale === "zh"
                      ? `提交于 ${application.submittedAt}`
                      : `Submitted ${application.submittedAt}`}
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
                    ? locale === "th"
                      ? (application.reviewedAt ? `ตรวจเมื่อ ${application.reviewedAt}` : "ตรวจสอบเรียบร้อย")
                      : locale === "zh"
                        ? (application.reviewedAt ? `审核于 ${application.reviewedAt}` : "审核已完成")
                        : (application.reviewedAt ? `Reviewed ${application.reviewedAt}` : "Review completed")
                    : application.status === "under_review"
                      ? locale === "th" ? "Manager กำลังตรวจสอบข้อมูล" : locale === "zh" ? "管理员正在审核" : "Manager is reviewing"
                      : isCancelled
                        ? locale === "th" ? "ยกเลิกคำขอแล้ว" : locale === "zh" ? "已撤回申请" : "Withdrawn"
                        : locale === "th" ? "อยู่ในคิวรอการตรวจสอบ" : locale === "zh" ? "排队等待审核" : "In review queue"}
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
                    ? locale === "th" ? "อนุมัติคุณสมบัติเรียบร้อย" : locale === "zh" ? "资质已批准" : "Approved as Interpreter"
                    : isStep3Attention
                      ? locale === "th" ? "ขอเอกสารเพิ่มเติม" : locale === "zh" ? "需要补充材料" : "Revision requested"
                      : isStep3Rejected
                        ? locale === "th" ? "ไม่อนุมัติใบสมัคร" : locale === "zh" ? "申请未批准" : "Application rejected"
                        : isCancelled
                          ? locale === "th" ? "ถอนใบสมัครแล้ว" : locale === "zh" ? "已撤回" : "Withdrawn"
                          : locale === "th" ? "รอผลการพิจารณา" : locale === "zh" ? "等待评审结果" : "Awaiting decision"}
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
            <p className="mt-1 text-xs text-[#64777e]">
              {locale === "th"
                ? `ส่งเมื่อ ${application.submittedAt}`
                : locale === "zh"
                  ? `提交于 ${application.submittedAt}`
                  : `Submitted ${application.submittedAt}`}
            </p>
          </div>
          {application.reviewedAt && (
            <p className="text-xs text-[#64777e]">
              {locale === "th"
                ? `ตรวจล่าสุด ${application.reviewedAt}`
                : locale === "zh"
                  ? `最近审核于 ${application.reviewedAt}`
                  : `Reviewed ${application.reviewedAt}`}
            </p>
          )}
        </div>

        <p className="mt-4 rounded-lg bg-[#f7f9fa] p-4 text-sm leading-7 text-[#294554]">{detail}</p>

        {(application.status === "needs_revision" || application.status === "rejected") && onReupload && (
          <div className="mt-4 rounded-(--khvi-radius-sm) border border-[#d97706] bg-[#fffbeb] p-4">
            <p className="text-sm font-extrabold text-[#92400e]">
              {application.status === "rejected"
                ? locale === "th" ? "เริ่มใบสมัครใหม่ด้วยข้อมูลที่แก้ไขแล้ว" : locale === "zh" ? "用修改后的信息重新提交申请" : "Start a new application with updated details"
                : locale === "th" ? "อัปโหลดเอกสารใหม่เพื่อส่งตรวจอีกครั้ง" : locale === "zh" ? "重新上传文件以再次审核" : "Upload new documents to request re-review"}
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
          <div className="mt-6 space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-[#64777e] border-b border-[#edf2f4] pb-2">
              {locale === "th"
                ? "ข้อมูลที่ยื่นในใบสมัคร (Submitted Application Details)"
                : locale === "zh"
                  ? "申请提交详情"
                  : "Submitted Application Details"}
            </h3>

            {/* 1. Personal & Contact Information */}
            <div className="rounded-xl border border-[#e4edf0] bg-[#f8fbfc] p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black uppercase tracking-wider text-[#6b8593]">
                  {locale === "th"
                    ? "1. ข้อมูลส่วนตัวและการติดต่อ"
                    : locale === "zh"
                      ? "1. 个人与联络信息"
                      : "1. Personal & Contact Information"}
                </span>
                <span className="rounded bg-white px-2 py-0.5 text-[10px] font-mono text-[#53656c] border border-[#d6e0e4]">
                  BR-04 Shielded
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                <div>
                  <dt className="text-[11px] font-bold text-[#73848a]">
                    {locale === "th" ? "ชื่อ-นามสกุล:" : locale === "zh" ? "姓名:" : "Full Name:"}
                  </dt>
                  <dd className="mt-1 font-extrabold text-[#10283a]">{application.applicantName}</dd>
                </div>

                <div>
                  <dt className="text-[11px] font-bold text-[#73848a]">
                    {locale === "th" ? "อายุ:" : locale === "zh" ? "年龄:" : "Age:"}
                  </dt>
                  <dd className="mt-1 font-extrabold text-[#10283a]">
                    {application.age > 0
                      ? locale === "th"
                        ? `${application.age} ปี`
                        : locale === "zh"
                          ? `${application.age} 岁`
                          : `${application.age} yrs`
                      : "—"}
                  </dd>
                </div>

                <div>
                  <dt className="text-[11px] font-bold text-[#73848a]">
                    {locale === "th" ? "เบอร์โทรศัพท์หลัก:" : locale === "zh" ? "主要电话:" : "Phone:"}
                  </dt>
                  <dd className="mt-1 font-extrabold text-[#10283a]">{application.phone || "—"}</dd>
                </div>

                <div>
                  <dt className="text-[11px] font-bold text-[#73848a]">
                    {locale === "th" ? "อีเมลติดต่อ:" : locale === "zh" ? "电子邮件:" : "Email:"}
                  </dt>
                  <dd className="mt-1 font-extrabold text-[#10283a]">{application.email || "—"}</dd>
                </div>

                {application.extraContact && (
                  <div className="sm:col-span-2 lg:col-span-4 pt-2 border-t border-[#e8eff1]">
                    <dt className="text-[11px] font-bold text-[#73848a] mb-1">
                      {locale === "th"
                        ? "ช่องทางติดต่อเพิ่มเติม (extra_contact):"
                        : locale === "zh"
                          ? "其他联系渠道 (extra_contact):"
                          : "Additional Contact Channel (extra_contact):"}
                    </dt>
                    <dd className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 rounded-md border border-[#cde0e2] bg-white px-2.5 py-1 text-xs font-semibold text-[#0c6b6c]">
                        <span>{getExtraContactIcon(application.extraContact)}</span>
                        <span className="font-mono font-bold text-[#10283a]">{application.extraContact}</span>
                      </span>
                      <span className="text-[10px] text-[#73848a]">
                        {locale === "th"
                          ? "(ระบบจะเปิดเผยเฉพาะเมื่อคุณ Claim งานแล้วเท่านั้น)"
                          : locale === "zh"
                            ? "（仅在接单后向求助者公开）"
                            : "(Revealed only after you claim a mission)"}
                      </span>
                    </dd>
                  </div>
                )}
              </div>
            </div>

            {/* 2. Languages */}
            <div className="rounded-xl border border-[#e4edf0] bg-[#f8fbfc] p-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black uppercase tracking-wider text-[#6b8593]">
                  {locale === "th"
                    ? `2. ภาษาที่เลือกให้บริการ (${application.languages.length} ภาษา)`
                    : locale === "zh"
                      ? `2. 所选服务语言 (${application.languages.length} 种)`
                      : `2. Selected Languages (${application.languages.length})`}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {application.languages.map((language) => {
                  const langLabel =
                    locale === "th"
                      ? language.nameTh ?? language.name
                      : locale === "zh"
                        ? language.nameZh ?? language.name
                        : language.name;
                  return (
                    <span
                      key={language.id}
                      className="inline-flex items-center gap-1.5 rounded-md border border-[#cbe3dd] bg-white px-3 py-1.5 text-xs font-bold text-[#087557]"
                    >
                      <span>✓ {langLabel}</span>
                      {language.type && (
                        <span className="rounded bg-[#edf7f5] px-1.5 py-0.5 text-[10px] font-semibold text-[#087f80]">
                          {language.type}
                        </span>
                      )}
                    </span>
                  );
                })}
              </div>
            </div>

            {/* 3. Categories */}
            <div className="rounded-xl border border-[#e4edf0] bg-[#f8fbfc] p-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black uppercase tracking-wider text-[#6b8593]">
                  {locale === "th"
                    ? `3. หมวดหมู่ภารกิจที่พร้อมช่วยเหลือ (${application.categories.length} หมวด)`
                    : locale === "zh"
                      ? `3. 任务类别 (${application.categories.length} 类)`
                      : `3. Mission Categories (${application.categories.length})`}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {application.categories.map((category) => {
                  const catLabel =
                    locale === "th"
                      ? category.nameTh ?? category.name
                      : locale === "zh"
                        ? category.nameZh ?? category.name
                        : category.name;
                  return (
                    <div
                      key={category.id}
                      className="flex items-center gap-2 rounded-md border border-[#d6e0e4] bg-white px-3 py-2 text-xs font-bold text-[#10283a]"
                    >
                      <span className="text-base">{category.icon || "💬"}</span>
                      <span>{catLabel}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 4. Credentials & Documents */}
            <div className="rounded-xl border border-[#e4edf0] bg-[#f8fbfc] p-4 space-y-2.5">
              <span className="text-[11px] font-black uppercase tracking-wider text-[#6b8593]">
                {locale === "th"
                  ? "4. เอกสารรับรองคุณวุฒิที่แนบ"
                  : locale === "zh"
                    ? "4. 所附资质文件"
                    : "4. Attached Credential Documents"}
              </span>
              <ul className="space-y-2 text-xs text-[#526a74]">
                {(application.documents.length > 0
                  ? application.documents
                  : [{ name: application.certificateFileName, type: "cert" as const, size: "", url: application.certificateUrl }]
                ).filter((doc) => doc.name).map((document) => {
                  const finalUrl = resolveDocUrl(document.url);
                  return (
                    <li
                      key={document.name}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-[#d6e0e4] bg-white p-3"
                    >
                      <div className="flex items-center gap-2 font-bold text-[#10283a] min-w-0">
                        <span className="shrink-0 text-base">📄</span>
                        <span className="truncate">{document.name}</span>
                      </div>
                      {finalUrl && (
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => setPreviewDoc({ name: document.name, url: finalUrl })}
                            className="rounded border border-[#087f80] bg-[#edf7f5] px-2.5 py-1 text-[11px] font-bold text-[#087f80] hover:bg-[#d8efe9] transition-colors cursor-pointer"
                          >
                            {locale === "th" ? "ดูตัวอย่าง" : locale === "zh" ? "预览" : "Preview"}
                          </button>
                          <a
                            href={finalUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="rounded border border-[#c3d1d6] bg-[#f8fafb] px-2.5 py-1 text-[11px] font-bold text-[#203d4d] hover:bg-[#edf7f5] hover:text-[#087f80] transition-colors"
                          >
                            {locale === "th" ? "เปิดดูเอกสาร ↗" : locale === "zh" ? "查看文件 ↗" : "View document ↗"}
                          </a>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
              {application.reviewedByManagerName && (
                <p className="mt-3 text-xs text-[#64777e]">
                  {locale === "th" ? "ตรวจสอบโดย " : locale === "zh" ? "审核人 " : "Reviewed by "}
                  <strong className="text-[#203d4d]">{application.reviewedByManagerName}</strong>
                </p>
              )}
            </div>
          </div>
        )}

        {canCancel && (
          <div className="mt-6 border-t border-[#e6eef0] pt-5">
            {cancelOpen ? (
              <div className="rounded-(--khvi-radius-sm) border border-[#f8c5be] bg-[#fff8f7] p-4">
                <p className="text-sm font-extrabold text-[#b8291b]">
                  {locale === "th" ? "ยืนยันการยกเลิกสมัคร" : locale === "zh" ? "确认取消申请" : "Confirm application cancellation"}
                </p>
                <p className="mt-1 text-xs leading-5 text-[#7c4a44]">
                  {locale === "th"
                    ? "หลังยกเลิก ใบสมัครนี้จะถูกถอนออกจากระบบ และนำคุณกลับสู่หน้าหลัก"
                    : locale === "zh"
                      ? "取消后，此申请将从系统中撤回，您将返回首页。"
                      : "After cancellation, this application will be withdrawn from the system and you will be returned to the home page."}
                </p>
                <label className="mt-3 block text-xs font-bold text-[#7c4a44]" htmlFor="application-cancel-reason">
                  {locale === "th" ? "เหตุผล (ไม่บังคับ)" : locale === "zh" ? "原因（选填）" : "Reason (optional)"}
                </label>
                <textarea
                  id="application-cancel-reason"
                  value={cancelReason}
                  onChange={(event) => setCancelReason(event.target.value)}
                  maxLength={300}
                  rows={2}
                  placeholder={
                    locale === "th"
                      ? "เช่น เปลี่ยนใจและยังไม่พร้อมรับงาน"
                      : locale === "zh"
                        ? "例如：改变主意，暂未准备好接单"
                        : "e.g. Changed my mind or not ready to take assignments yet"
                  }
                  className="mt-1.5 w-full resize-y rounded-(--khvi-radius-sm) border border-[#e6b8b1] bg-white px-3 py-2 text-sm text-[#203d4d] focus:border-[#c33a2a] focus:outline-none"
                />
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => onCancel?.(cancelReason)}
                    className="rounded-(--khvi-radius-sm) bg-[#c33a2a] px-4 py-2 text-xs font-extrabold text-white hover:bg-[#a92e22] cursor-pointer"
                  >
                    {locale === "th" ? "ยืนยันยกเลิกสมัครและกลับสู่หน้าหลัก" : locale === "zh" ? "确认取消并返回首页" : "Confirm cancel and return home"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setCancelOpen(false)}
                    className="rounded-(--khvi-radius-sm) border border-[#cbd7dc] bg-white px-4 py-2 text-xs font-bold text-[#39525d] hover:bg-[#f8fafb] cursor-pointer"
                  >
                    {locale === "th" ? "เก็บใบสมัครไว้" : locale === "zh" ? "保留申请" : "Keep application"}
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setCancelOpen(true)}
                className="inline-flex min-h-10 items-center justify-center rounded-(--khvi-radius-sm) border border-[#e6b8b1] bg-white px-4 py-2 text-sm font-bold text-[#b8291b] hover:bg-[#fff1f2] cursor-pointer"
              >
                {locale === "th"
                  ? "ยกเลิกสมัครเพื่อออกและกลับสู่หน้าหลัก"
                  : locale === "zh"
                    ? "取消申请并返回首页"
                    : "Cancel application to exit and return home"}
              </button>
            )}
          </div>
        )}
      </section>

      <div className="flex flex-wrap gap-3">
        <Link className="inline-flex min-h-11 items-center justify-center rounded-(--khvi-radius-sm) border border-[#087f80] px-4 py-2.5 text-sm font-bold text-[#087f80] hover:bg-[#edf7f5]" href="/welcome#welcome-user">
          {locale === "th" ? "กลับสู่หน้าหลัก" : locale === "zh" ? "返回首页" : "Back to Home"}
        </Link>
        {!revoked && (application.status === "needs_revision" || application.status === "rejected" || application.status === "cancelled") && (
          <Link className="inline-flex min-h-11 items-center justify-center rounded-(--khvi-radius-sm) bg-[#092f45] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#0c4960]" href="/volunteer/apply#main-content">
            {application.status === "cancelled"
              ? locale === "th" ? "สมัครใหม่" : locale === "zh" ? "重新申请" : "Apply again"
              : locale === "th" ? "แก้ไขใบสมัคร" : locale === "zh" ? "修改申请" : "Edit application"}
          </Link>
        )}
      </div>

      {/* Document Preview Lightbox Modal */}
      {previewDoc && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={locale === "th" ? "ดูตัวอย่างเอกสาร" : locale === "zh" ? "预览文件" : "Document Preview"}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => setPreviewDoc(null)}
        >
          <div
            className="relative flex flex-col w-full max-w-3xl max-h-[90vh] rounded-xl border border-[#092f45] bg-white shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#e2ebee] bg-[#092f45] px-4 py-3 text-white">
              <div className="flex items-center gap-2 text-sm font-bold truncate">
                <span>📄</span>
                <span className="truncate">{previewDoc.name}</span>
              </div>
              <button
                type="button"
                onClick={() => setPreviewDoc(null)}
                aria-label={locale === "th" ? "ปิดหน้าต่าง" : locale === "zh" ? "关闭" : "Close"}
                className="flex h-7 w-7 items-center justify-center rounded-md border border-white/20 bg-white/10 text-xs font-bold text-white hover:bg-white/20 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-auto bg-[#f8fafb] p-4 flex items-center justify-center min-h-[320px]">
              {/\.(jpg|jpeg|png|webp|gif)$/i.test(previewDoc.name) ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={previewDoc.url}
                  alt={previewDoc.name}
                  className="max-h-[70vh] w-auto max-w-full rounded object-contain mx-auto shadow-sm"
                />
              ) : /\.pdf$/i.test(previewDoc.name) ? (
                <iframe
                  src={previewDoc.url}
                  title={previewDoc.name}
                  className="w-full h-[70vh] rounded border border-[#cbd7dc]"
                />
              ) : (
                <div className="text-center p-8">
                  <span className="text-5xl">📄</span>
                  <p className="mt-3 font-bold text-[#10283a]">{previewDoc.name}</p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between border-t border-[#e2ebee] bg-white px-4 py-3">
              <a
                href={previewDoc.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded border border-[#087f80] bg-[#edf7f5] px-3.5 py-1.5 text-xs font-bold text-[#087f80] hover:bg-[#d8efe9] transition-colors"
              >
                <span>{locale === "th" ? "เปิดในแท็บใหม่ ↗" : locale === "zh" ? "在新标签页打开 ↗" : "Open in new tab ↗"}</span>
              </a>
              <button
                type="button"
                onClick={() => setPreviewDoc(null)}
                className="rounded border border-[#cbd7dc] bg-white px-4 py-1.5 text-xs font-bold text-[#53656c] hover:bg-[#f4f7f8] cursor-pointer"
              >
                {locale === "th" ? "ปิด" : locale === "zh" ? "关闭" : "Close"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
