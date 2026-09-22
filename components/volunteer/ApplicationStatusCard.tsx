"use client";

import Link from "next/link";
import { CheckBadgeIcon, DocumentCheckIcon, ExclamationTriangleIcon, LanguageIcon } from "@heroicons/react/24/outline";
import { useInterpreterAccess, useUiLocale } from "@/app/components/app-shell";
import type { ApplicationStatus, InterpreterApplication } from "@/app/lib/interpreter-application";

type ApplicationStatusCardProps = {
  application: InterpreterApplication | null;
  compact?: boolean;
};

const statusStyles: Record<ApplicationStatus, { label: string; className: string }> = {
  pending: { label: "รอการตรวจสอบ", className: "border-[#d97706] bg-[#fffbeb] text-[#92400e]" },
  under_review: { label: "กำลังตรวจสอบ", className: "border-[#087f80] bg-[#edf7f5] text-[#087557]" },
  needs_revision: { label: "ต้องแก้ไขเอกสาร", className: "border-[#d97706] bg-[#fffbeb] text-[#92400e]" },
  approved: { label: "อนุมัติแล้ว", className: "border-[#087557] bg-[#edf7f5] text-[#087557]" },
  rejected: { label: "ไม่อนุมัติ", className: "border-[#f04f3e] bg-[#fff1f2] text-[#b8291b]" },
  cancelled: { label: "ถอนใบสมัครแล้ว", className: "border-[#cbd7dc] bg-[#f3f6f7] text-[#53656c]" },
};

export function ApplicationStatusCard({ application, compact = false }: ApplicationStatusCardProps) {
  const locale = useUiLocale();
  const { revoked, verified } = useInterpreterAccess();
  const isThai = locale === "th";
  const isChinese = locale === "zh";

  const text = (th: string, en: string, zh: string) => isThai ? th : isChinese ? zh : en;

  if (!application) {
    if (!verified || revoked) return null;
    return (
      <section className="rounded-(--khvi-radius-md) border border-(--khvi-teal)/20 bg-(--khvi-surface) p-5 sm:p-7" aria-labelledby="volunteer-application-title">
        <div className="flex items-start gap-3">
          <LanguageIcon className="h-7 w-7 shrink-0 text-(--khvi-teal)" aria-hidden="true" />
          <div>
            <h2 id="volunteer-application-title" className="text-xl font-bold">
              {text("สมัครเป็นล่ามอาสา", "Become a volunteer interpreter", "申请成为志愿口译员")}
            </h2>
            <p className="mt-2 text-sm leading-7 text-(--khvi-ink)/70">
              {text(
                "เตรียมภาษา หมวดหมู่งาน ช่องทางติดต่อ และเอกสารรับรอง เพื่อให้ Manager ตรวจสอบก่อนรับงาน",
                "Submit your languages, service categories, contact channels and credentials for Manager review.",
                "提交语言、服务类别、联系方式和资质文件，等待管理员审核。",
              )}
            </p>
            <Link className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-(--khvi-radius-sm) bg-(--khvi-navy) px-4 py-2.5 text-sm font-bold text-white hover:opacity-90" href="/volunteer/apply#main-content">
              {text("เริ่มใบสมัคร", "Start application", "开始申请")}
            </Link>
          </div>
        </div>
      </section>
    );
  }

  const style = revoked ? { label: "ถูกยกเลิกสถานะล่าม", className: "border-[#f04f3e] bg-[#fff1f2] text-[#b8291b]" } : statusStyles[application.status];
  const detail = revoked
    ? text("สถานะล่ามอาสาของคุณถูกยกเลิกแล้ว จึงไม่สามารถสมัครเป็นล่ามอีกครั้งได้", "Your interpreter accreditation has been revoked. You cannot submit another application.", "你的志愿口译员资格已被撤销，无法再次申请。")
    : application.status === "needs_revision"
    ? application.revisionNote
    : application.status === "rejected"
      ? application.rejectReason
      : application.status === "approved"
        ? text("ใบสมัครผ่านการตรวจสอบแล้ว", "Your application has been approved.", "申请已通过审核。")
        : application.status === "cancelled"
          ? text("คุณถอนใบสมัครนี้แล้ว หากต้องการสมัครใหม่ให้เริ่มใบสมัครอีกครั้ง", "You withdrew this application. Start a new application if you change your mind.", "你已撤回此申请。如需重新申请，请重新开始申请。")
        : text("ใบสมัครอยู่ในคิวตรวจสอบของ Manager", "Your application is in the Manager review queue.", "申请正在管理员审核队列中。");

  return (
    <section className="rounded-(--khvi-radius-md) border border-(--khvi-teal)/20 bg-(--khvi-surface) p-5 sm:p-7" aria-labelledby="volunteer-application-title">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          {application.status === "approved" ? <CheckBadgeIcon className="h-7 w-7 shrink-0 text-(--khvi-teal)" aria-hidden="true" /> : application.status === "needs_revision" || application.status === "rejected" ? <ExclamationTriangleIcon className="h-7 w-7 shrink-0 text-(--khvi-coral)" aria-hidden="true" /> : <DocumentCheckIcon className="h-7 w-7 shrink-0 text-(--khvi-teal)" aria-hidden="true" />}
          <div>
            <p className="text-xs font-extrabold uppercase tracking-wide text-(--khvi-teal)">
              {text("ใบสมัครล่ามอาสา", "Volunteer interpreter application", "志愿口译员申请")}
            </p>
            <h2 id="volunteer-application-title" className="mt-1 text-xl font-bold">
              {application.applicantName}
            </h2>
            <p className="mt-1 font-mono text-xs text-(--khvi-ink)/60">{application.id} · {application.submittedAt}</p>
          </div>
        </div>
        <span className={`inline-flex w-fit items-center rounded-full border px-3 py-1 text-xs font-extrabold ${style.className}`}>
          {revoked ? text(style.label, "Accreditation revoked", "口译员资格已撤销") : text(style.label, application.status.replace("_", " "), application.status.replace("_", " "))}
        </span>
      </div>

      {!compact && (
        <>
          <p className="mt-4 rounded-lg bg-(--khvi-paper) px-4 py-3 text-sm leading-7">{detail}</p>
          <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold text-(--khvi-ink)/70">
            <span className="rounded-full border border-(--khvi-teal)/20 bg-white px-3 py-1.5">{application.languages.length} {text("ภาษา", "languages", "种语言")}</span>
            <span className="rounded-full border border-(--khvi-teal)/20 bg-white px-3 py-1.5">{application.categories.length} {text("หมวดงาน", "categories", "个类别")}</span>
            <span className="rounded-full border border-(--khvi-teal)/20 bg-white px-3 py-1.5">📄 {application.certificateFileName}</span>
          </div>
        </>
      )}

      {application.status !== "approved" && <div className="mt-5 flex flex-wrap gap-3">
        <Link className="inline-flex min-h-11 items-center justify-center rounded-(--khvi-radius-sm) border border-(--khvi-teal) px-4 py-2.5 text-sm font-bold text-(--khvi-teal) hover:bg-(--khvi-teal)/5" href="/volunteer/status#main-content">
          {text("ดูสถานะและรายละเอียด", "View application status", "查看申请状态")}
        </Link>
        {!revoked && (application.status === "needs_revision" || application.status === "rejected" || application.status === "cancelled") && (
          <Link className="inline-flex min-h-11 items-center justify-center rounded-(--khvi-radius-sm) bg-(--khvi-coral) px-4 py-2.5 text-sm font-bold text-white hover:opacity-90" href="/volunteer/apply#main-content">
            {text(application.status === "cancelled" ? "สมัครใหม่" : "แก้ไขใบสมัคร", application.status === "cancelled" ? "Start a new application" : "Update application", application.status === "cancelled" ? "重新申请" : "修改申请")}
          </Link>
        )}
      </div>}
    </section>
  );
}
