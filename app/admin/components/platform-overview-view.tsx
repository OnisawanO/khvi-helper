"use client";

import { useState, useMemo } from "react";
import {
  ArrowPathIcon,
  CheckBadgeIcon,
  ExclamationTriangleIcon,
  LockClosedIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";
import { AdminUserRecord, AdminIncidentReport, AuditLogEntry } from "../types";
import type { Locale } from "@/app/components/site-header";
import { localizeLanguageReference } from "@/app/lib/reference-localization";
import { formatLocalizedDateTime } from "@/app/lib/locale";

interface PlatformOverviewViewProps {
  users: AdminUserRecord[];
  reports: AdminIncidentReport[];
  auditLogs: AuditLogEntry[];
  locale: Locale;
  onNavigateTab: (tab: "users" | "reports" | "audit") => void;
  onRefresh?: () => void;
}

export function PlatformOverviewView({
  users,
  reports,
  auditLogs,
  locale,
  onNavigateTab,
  onRefresh,
}: PlatformOverviewViewProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const text = (th: string, en: string, zh: string, es: string, ar: string) =>
    locale === "th" ? th : locale === "zh" ? zh : locale === "es" ? es : locale === "ar" ? ar : en;
  const auditActionLabel = (action: string) => {
    const labels: Record<string, [string, string, string, string, string]> = {
      INTERPRETER_APPLICATION_APPROVED: ["อนุมัติใบสมัครล่าม", "Interpreter application approved", "已批准口译员申请", "Solicitud de intérprete aprobada", "تم اعتماد طلب المترجم"],
      INTERPRETER_APPLICATION_REJECTED: ["ปฏิเสธใบสมัครล่าม", "Interpreter application rejected", "已拒绝口译员申请", "Solicitud de intérprete rechazada", "تم رفض طلب المترجم"],
      INTERPRETER_REVOKED: ["เพิกถอนการรับรองล่าม", "Interpreter accreditation revoked", "已撤销口译员认证", "Acreditación de intérprete revocada", "تم إلغاء اعتماد المترجم"],
      ACCOUNT_UPDATE: ["อัปเดตบัญชี", "Account updated", "已更新账户", "Cuenta actualizada", "تم تحديث الحساب"],
      ACCOUNT_SUSPEND: ["ระงับบัญชี", "Account suspended", "已暂停账户", "Cuenta suspendida", "تم تعليق الحساب"],
      ACCOUNT_BAN: ["แบนบัญชี", "Account banned", "已封禁账户", "Cuenta bloqueada", "تم حظر الحساب"],
      ACCOUNT_DELETE: ["ลบบัญชี", "Account deleted", "已删除账户", "Cuenta eliminada", "تم حذف الحساب"],
    };
    const value = labels[action];
    return value ? text(...value) : text("การดำเนินการด้านความปลอดภัย", "Security action", "安全操作", "Acción de seguridad", "إجراء أمني");
  };
  const auditDetailsLabel = (details: string) => {
    const approved = details.match(/^Interpreter application decision: approved\.?$/i);
    if (approved) return text("ตัดสินใบสมัครล่าม: อนุมัติ", "Interpreter application decision: approved", "口译员申请决定：已批准", "Decisión de solicitud de intérprete: aprobada", "قرار طلب المترجم: تمت الموافقة");
    const rejected = details.match(/^Interpreter application decision: rejected\.?$/i);
    if (rejected) return text("ตัดสินใบสมัครล่าม: ปฏิเสธ", "Interpreter application decision: rejected", "口译员申请决定：已拒绝", "Decisión de solicitud de intérprete: rechazada", "قرار طلب المترجم: مرفوض");
    const revoked = details.match(/^Interpreter accreditation revoked:\s*(.*)$/i);
    if (revoked) return text(`เพิกถอนการรับรองล่าม: ${revoked[1]}`, `Interpreter accreditation revoked: ${revoked[1]}`, `已撤销口译员认证：${revoked[1]}`, `Acreditación de intérprete revocada: ${revoked[1]}`, `تم إلغاء اعتماد المترجم: ${revoked[1]}`);
    const role = details.match(/^Role set to (.*)\. Locked: (Yes|No)\.?$/i);
    if (role) return text(`กำหนดบทบาทเป็น ${role[1]} · ล็อก: ${role[2] === "Yes" ? "ใช่" : "ไม่"}`, `Role set to ${role[1]} · Locked: ${role[2]}`, `角色设为${role[1]} · 已锁定：${role[2] === "Yes" ? "是" : "否"}`, `Rol establecido: ${role[1]} · Bloqueada: ${role[2] === "Yes" ? "Sí" : "No"}`, `تم تعيين الدور إلى ${role[1]} · مقفل: ${role[2] === "Yes" ? "نعم" : "لا"}`);
    return details;
  };

  const handleManualRefresh = () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    if (onRefresh) {
      onRefresh();
    }
    setTimeout(() => {
      setIsRefreshing(false);
    }, 600);
  };
  // 1. Role & Account Distribution
  const metrics = useMemo(() => {
    const totalUsers = users.length;
    const interpreters = users.filter((u) => u.role === "Interpreter");
    const isInactive = (u: AdminUserRecord) =>
      u.isLocked || u.accountStatus === "Locked" || u.accountStatus === "Banned";
    const activeInterpreters = interpreters.filter(
      (u) => !isInactive(u) && u.interpreterStats?.verificationStatus === "Approved"
    );
    const pendingInterpreters = interpreters.filter(
      (u) =>
        u.interpreterStats?.verificationStatus === "Pending" ||
        u.interpreterStats?.verificationStatus === "Under Review"
    );
    const standardUsers = users.filter((u) => u.role === "User");
    const managers = users.filter((u) => u.role === "Manager");
    const admins = users.filter((u) => u.role === "Admin");
    const lockedOrBanned = users.filter(isInactive);
    const activeStandardUsersCount = standardUsers.filter((u) => !isInactive(u)).length;
    const activeInterpreterAccountsCount = interpreters.filter((u) => !isInactive(u)).length;
    const activeStaffCount = [...managers, ...admins].filter((u) => !isInactive(u)).length;
    const activeAccountsCount = users.filter((u) => !isInactive(u)).length;

    // Reports Breakdown
    const pendingReports = reports.filter((r) => r.status === "Escalated to Admin");
    const criticalReports = pendingReports.filter((r) => r.severity === "critical");
    const highReports = pendingReports.filter((r) => r.severity === "high");
    const resolvedReports = reports.filter((r) => r.status === "Resolved");

    // Language Coverage breakdown from Interpreters
    const languageCounts: Record<string, number> = {};
    activeInterpreters.forEach((interp) => {
      const languages = new Set(
        interp.spokenLanguages?.length
          ? interp.spokenLanguages
          : interp.primaryLanguage
            ? [interp.primaryLanguage]
            : []
      );
      languages.forEach((lang) => {
        languageCounts[lang] = (languageCounts[lang] || 0) + 1;
      });
    });

    const sortedLanguages = Object.entries(languageCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6);

    // Incident by original language requested
    const incidentLangCounts: Record<string, number> = {};
    reports.forEach((rep) => {
      const l = rep.originalLanguage || "English";
      incidentLangCounts[l] = (incidentLangCounts[l] || 0) + 1;
    });

    // Governance Actions in Audit Logs
    const enforcementCount = auditLogs.filter(
      (l) => l.action.includes("SUSPEND") || l.action.includes("BAN") || l.action.includes("LOCKED")
    ).length;

    return {
      totalUsers,
      interpretersCount: interpreters.length,
      activeInterpretersCount: activeInterpreters.length,
      pendingInterpretersCount: pendingInterpreters.length,
      activeStandardUsersCount,
      activeInterpreterAccountsCount,
      activeStaffCount,
      activeAccountsCount,
      lockedOrBannedCount: lockedOrBanned.length,
      pendingReportsCount: pendingReports.length,
      criticalReportsCount: criticalReports.length,
      highReportsCount: highReports.length,
      resolvedReportsCount: resolvedReports.length,
      sortedLanguages,
      incidentLangCounts,
      enforcementCount,
    };
  }, [users, reports, auditLogs]);

  // Max value for language bar scale
  const maxLanguageSupply = Math.max(1, ...metrics.sortedLanguages.map(([, count]) => count));

  // Calculations for Donut 1 (Escalated Reports)
  const totalReports = metrics.pendingReportsCount || 1;
  const criticalPct = metrics.criticalReportsCount / totalReports;
  const highPct = metrics.highReportsCount / totalReports;
  const mediumPct = Math.max(0, 1 - criticalPct - highPct);
  const C = 439.82; // 2 * PI * 70
  const strokeCrit = criticalPct * C;
  const strokeHigh = highPct * C;
  const strokeMed = mediumPct * C;
  const offsetCrit = 0;
  const offsetHigh = -strokeCrit;
  const offsetMed = -(strokeCrit + strokeHigh);

  // Calculations for Donut 2 (Platform Account Composition)
  const totalAcc = metrics.activeAccountsCount || 1;
  const standardPct = metrics.activeStandardUsersCount / totalAcc;
  const interpPct = metrics.activeInterpreterAccountsCount / totalAcc;
  const staffPct = metrics.activeStaffCount / totalAcc;
  const strokeUsers = standardPct * C;
  const strokeInterp = interpPct * C;
  const strokeStaff = staffPct * C;
  const offsetUsers = 0;
  const offsetInterp = -strokeUsers;
  const offsetStaff = -(strokeUsers + strokeInterp);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1. Executive Summary Welcome Header (Clean Pure Minimalist) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-[#092f45]">
            {text("ภาพรวมแพลตฟอร์ม", "Platform overview", "平台概览", "Resumen de la plataforma", "نظرة عامة على المنصة")}
          </h2>
        </div>

        {/* Header Action Controls: Alert Status & Quick Refresh Button */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Quick Refresh Button (Text followed by Icon) */}
          <button
            type="button"
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 hover:border-slate-300 transition-all cursor-pointer disabled:opacity-60"
            title={text("รีเฟรชข้อมูลภาพรวมแพลตฟอร์ม", "Refresh platform overview data", "刷新平台概览数据", "Actualizar datos del resumen", "تحديث بيانات نظرة المنصة")}
          >
            <span>
              {isRefreshing ? text("กำลังรีเฟรช…", "Refreshing…", "正在刷新…", "Actualizando…", "جارٍ التحديث…") : text("รีเฟรช", "Refresh", "刷新", "Actualizar", "تحديث")}
            </span>
            <ArrowPathIcon
              className={`h-3.5 w-3.5 text-[#087f80] ${
                isRefreshing ? "animate-spin" : ""
              }`}
            />
          </button>

          {/* System Alert Status */}
          <button
            type="button"
            onClick={() => onNavigateTab("reports")}
            className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold transition-all cursor-pointer ${
              metrics.criticalReportsCount > 0
                ? "bg-red-50 text-[#f04f3e] hover:bg-red-100 border border-red-200"
                : "bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <ExclamationTriangleIcon className="h-3.5 w-3.5" />
            <span>
              {metrics.criticalReportsCount > 0
                ? text(`${metrics.criticalReportsCount} กรณีวิกฤตรอการตัดสินใจ`, `${metrics.criticalReportsCount} critical cases pending decision`, `${metrics.criticalReportsCount} 起严重事件等待决定`, `${metrics.criticalReportsCount} casos críticos pendientes de decisión`, `${metrics.criticalReportsCount} حالات حرجة بانتظار القرار`)
                : text("จัดการเหตุการณ์ทั้งหมดแล้ว", "All incidents handled", "所有事件均已处理", "Todos los incidentes están atendidos", "تمت معالجة جميع الحوادث")}
            </span>
          </button>
        </div>
      </div>

      {/* 2. Top-level Summary KPI Cards (Original Operational Metrics in Segmented Box Container) */}
      <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-1 shadow-2xs">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-1">
          {/* Card 1: Total Accounts */}
          <div className="rounded-lg bg-white border border-slate-100 p-3.5 sm:p-4 shadow-2xs">
            <div className="flex items-center justify-between gap-1">
              <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 truncate">
                {text("บัญชีทั้งหมด", "Total accounts", "账户总数", "Cuentas totales", "إجمالي الحسابات")}
              </p>
              <div className="flex h-6 w-6 sm:h-7 sm:w-7 shrink-0 items-center justify-center rounded-md bg-blue-50 text-blue-600">
                <UserGroupIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </div>
            </div>
            <div className="mt-1.5 flex items-baseline gap-2">
              <p className="text-xl sm:text-2xl font-black text-[#092f45]">
                {metrics.totalUsers}
              </p>
              <span className="text-[11px] font-semibold text-slate-400">{text("ผู้ใช้", "users", "位用户", "usuarios", "مستخدمون")}</span>
            </div>
            <div className="mt-2 flex items-center justify-between border-t border-slate-100 pt-1.5 text-[10px] sm:text-xs text-slate-500">
              <span className="text-slate-400">{text("รายชื่อบนแพลตฟอร์ม", "Platform directory", "平台目录", "Directorio de la plataforma", "دليل المنصة")}</span>
              <span className="font-bold text-blue-600">
                {metrics.activeAccountsCount} {text("กำลังใช้งาน", "active now", "当前活跃", "activas ahora", "نشطة الآن")}
              </span>
            </div>
          </div>

          {/* Card 2: Escalated Cases */}
          <div className="rounded-lg bg-white border border-slate-100 p-3.5 sm:p-4 shadow-2xs">
            <div className="flex items-center justify-between gap-1">
              <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 truncate">
                {text("กรณีที่ส่งต่อ", "Escalated cases", "已升级事件", "Casos escalados", "الحالات المصعّدة")}
              </p>
              <div className="flex h-6 w-6 sm:h-7 sm:w-7 shrink-0 items-center justify-center rounded-md bg-red-50 text-[#f04f3e]">
                <ExclamationTriangleIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </div>
            </div>
            <div className="mt-1.5 flex items-baseline gap-2">
              <p
                className={`text-xl sm:text-2xl font-black ${
                  metrics.criticalReportsCount > 0 ? "text-[#f04f3e]" : "text-[#10283a]"
                }`}
              >
                {metrics.criticalReportsCount}
              </p>
              <span className="text-[11px] font-semibold text-slate-400">{text("วิกฤต", "critical", "严重", "críticos", "حرجة")}</span>
            </div>
            <div className="mt-2 flex items-center justify-between border-t border-slate-100 pt-1.5 text-[10px] sm:text-xs text-slate-500">
              <span className="text-slate-400">{text("รอการตัดสินใจ", "Awaiting decision", "等待决定", "Pendientes de decisión", "بانتظار القرار")}</span>
              <span
                className={`font-bold ${
                  metrics.pendingReportsCount > 0 ? "text-[#f04f3e]" : "text-slate-500"
                }`}
              >
                {metrics.pendingReportsCount} {text("รอดำเนินการ", "pending", "待处理", "pendientes", "معلقة")}
              </span>
            </div>
          </div>

          {/* Card 3: Disciplined Users */}
          <div className="rounded-lg bg-white border border-slate-100 p-3.5 sm:p-4 shadow-2xs">
            <div className="flex items-center justify-between gap-1">
              <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 truncate">
                {text("ผู้ใช้ที่ถูกจำกัดสิทธิ์", "Restricted users", "受限制用户", "Usuarios restringidos", "المستخدمون المقيّدون")}
              </p>
              <div className="flex h-6 w-6 sm:h-7 sm:w-7 shrink-0 items-center justify-center rounded-md bg-amber-50 text-[#f0a35f]">
                <LockClosedIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </div>
            </div>
            <div className="mt-1.5 flex items-baseline gap-2">
              <p className="text-xl sm:text-2xl font-black text-[#10283a]">
                {metrics.lockedOrBannedCount}
              </p>
              <span className="text-[11px] font-semibold text-slate-400">{text("ล็อก / จำกัดสิทธิ์เดิม", "locked / legacy restricted", "已锁定 / 旧版受限", "bloqueados / restricción heredada", "مقفلون / مقيّدون سابقًا")}</span>
            </div>
            <div className="mt-2 flex items-center justify-between border-t border-slate-100 pt-1.5 text-[10px] sm:text-xs text-slate-500">
              <span className="text-slate-400">{text("การบังคับใช้จากการตรวจสอบ", "Audit enforcements", "审计执行", "Medidas de auditoría", "إجراءات التدقيق")}</span>
              <span className="font-bold text-[#f0a35f]">
                {metrics.enforcementCount} {text("การดำเนินการที่บันทึก", "actions logged", "项已记录操作", "acciones registradas", "إجراءات مسجلة")}
              </span>
            </div>
          </div>

          {/* Card 4: Pending Approvals */}
          <div className="rounded-lg bg-white border border-slate-100 p-3.5 sm:p-4 shadow-2xs">
            <div className="flex items-center justify-between gap-1">
              <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 truncate">
                {text("รอการอนุมัติ", "Pending approvals", "待批准", "Aprobaciones pendientes", "اعتمادات معلقة")}
              </p>
              <div className="flex h-6 w-6 sm:h-7 sm:w-7 shrink-0 items-center justify-center rounded-md bg-teal-50 text-[#087f80]">
                <CheckBadgeIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </div>
            </div>
            <div className="mt-1.5 flex items-baseline gap-2">
              <p
                className={`text-xl sm:text-2xl font-black ${
                  metrics.pendingInterpretersCount > 0 ? "text-[#087f80]" : "text-[#10283a]"
                }`}
              >
                {metrics.pendingInterpretersCount}
              </p>
              <span className="text-[11px] font-semibold text-slate-400">{text("อาสาสมัคร", "volunteers", "位志愿者", "voluntarios", "متطوعون")}</span>
            </div>
            <div className="mt-2 flex items-center justify-between border-t border-slate-100 pt-1.5 text-[10px] sm:text-xs text-slate-500">
              <span className="text-slate-400">{text("คิวคงค้าง", "Backlog queue", "待办队列", "Cola pendiente", "قائمة الانتظار المتراكمة")}</span>
              <span
                className={`font-bold ${
                  metrics.pendingInterpretersCount > 0 ? "text-[#087f80]" : "text-slate-500"
                }`}
              >
                {metrics.pendingInterpretersCount > 0 ? text("รอตรวจสอบ", "Awaiting review", "等待审核", "Pendiente de revisión", "بانتظار المراجعة") : text("ไม่มีรายการคงค้าง", "Queue clear", "队列已清空", "Cola vacía", "لا توجد عناصر معلقة")}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Operational Emergency & Readiness Row (Donut 1 + Language Bar with Vertical Divider) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 py-6 border-b border-slate-200 items-stretch">
        {/* LEFT: Incident Urgency & Resolution Pipeline (Big Donut Chart) */}
        <div className="flex flex-col justify-between space-y-5 lg:pr-8 lg:border-r lg:border-slate-200">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-[#10283a]">
                  {text("รายงานที่ส่งต่อและลำดับความเร่งด่วน", "Escalated reports and urgency pipeline", "已升级报告与紧急程度", "Informes escalados y nivel de urgencia", "التقارير المصعّدة ومسار الاستعجال")}
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {text("ระดับความรุนแรงของเหตุการณ์ที่รอผู้ดูแลตรวจสอบ", "Severity of incidents awaiting admin review", "等待管理员审核的事件严重程度", "Gravedad de incidentes pendientes de revisión", "شدة الحوادث بانتظار مراجعة المسؤول")}
                </p>
              </div>
              <button
                type="button"
                onClick={() => onNavigateTab("reports")}
                className="text-[11px] font-bold text-[#f04f3e] hover:underline cursor-pointer"
              >
                {text("ดูกรณี →", "View cases →", "查看事件 →", "Ver casos →", "عرض الحالات ←")}
              </button>
            </div>

            {/* Big Donut Chart & Breakdown */}
            <div className="pt-5 flex flex-col sm:flex-row items-center gap-6 sm:gap-8">
              {/* Big SVG Donut */}
              <div className="relative flex items-center justify-center shrink-0 w-44 h-44 sm:w-48 sm:h-48">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 180 180">
                  <circle
                    cx="90"
                    cy="90"
                    r="70"
                    fill="transparent"
                    stroke="#f1f5f9"
                    strokeWidth="16"
                  />
                  {metrics.criticalReportsCount > 0 && (
                    <circle
                      cx="90"
                      cy="90"
                      r="70"
                      fill="transparent"
                      stroke="#f04f3e"
                      strokeWidth="16"
                      strokeDasharray={`${strokeCrit} ${C - strokeCrit}`}
                      strokeDashoffset={offsetCrit}
                      className="transition-all duration-500"
                    />
                  )}
                  {metrics.highReportsCount > 0 && (
                    <circle
                      cx="90"
                      cy="90"
                      r="70"
                      fill="transparent"
                      stroke="#f0a35f"
                      strokeWidth="16"
                      strokeDasharray={`${strokeHigh} ${C - strokeHigh}`}
                      strokeDashoffset={offsetHigh}
                      className="transition-all duration-500"
                    />
                  )}
                  {metrics.pendingReportsCount - metrics.criticalReportsCount - metrics.highReportsCount > 0 && (
                    <circle
                      cx="90"
                      cy="90"
                      r="70"
                      fill="transparent"
                      stroke="#759284"
                      strokeWidth="16"
                      strokeDasharray={`${strokeMed} ${C - strokeMed}`}
                      strokeDashoffset={offsetMed}
                      className="transition-all duration-500"
                    />
                  )}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-3xl sm:text-4xl font-black text-[#10283a] leading-none">
                    {metrics.pendingReportsCount}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-1">
                    {text("เหตุการณ์คงค้าง", "Pending incidents", "待处理事件", "Incidentes pendientes", "حوادث معلقة")}
                  </span>
                </div>
              </div>

              {/* Donut Legend (Clean Minimal List) */}
              <div className="flex-1 w-full divide-y divide-slate-100">
                <div className="py-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="h-2 w-2 rounded-full bg-[#f04f3e] shrink-0" />
                    <span className="text-xs font-semibold text-slate-700">{text("เร่งด่วนระดับวิกฤต", "Critical priority", "严重优先级", "Prioridad crítica", "أولوية حرجة")}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-xs font-bold text-[#f04f3e]">
                      {metrics.criticalReportsCount}
                    </span>
                    <span className="text-[10px] text-slate-400 ml-1.5">
                      ({Math.round(criticalPct * 100)}%)
                    </span>
                  </div>
                </div>

                <div className="py-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="h-2 w-2 rounded-full bg-[#f0a35f] shrink-0" />
                    <span className="text-xs font-semibold text-slate-700">{text("เร่งด่วนสูง", "High urgency", "高紧急度", "Urgencia alta", "استعجال مرتفع")}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-xs font-bold text-[#10283a]">
                      {metrics.highReportsCount}
                    </span>
                    <span className="text-[10px] text-slate-400 ml-1.5">
                      ({Math.round(highPct * 100)}%)
                    </span>
                  </div>
                </div>

                <div className="py-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="h-2 w-2 rounded-full bg-[#759284] shrink-0" />
                    <span className="text-xs font-semibold text-slate-700">{text("มาตรฐาน / ปานกลาง", "Standard / medium", "标准 / 中等", "Estándar / media", "قياسي / متوسط")}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-xs font-bold text-[#10283a]">
                      {metrics.pendingReportsCount - metrics.criticalReportsCount - metrics.highReportsCount}
                    </span>
                    <span className="text-[10px] text-slate-400 ml-1.5">
                      ({Math.round(mediumPct * 100)}%)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Adjudication Status Mini Bar */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>
              {text("รอการตัดสินใจ:", "Awaiting decision:", "等待决定：", "Pendientes de decisión:", "بانتظار القرار:")} <strong className="text-[#f04f3e]">{metrics.pendingReportsCount}</strong> {text("กรณี", "cases", "起", "casos", "حالات")}
            </span>
            <span>
              {text("แก้ไขแล้ว / บังคับใช้แล้ว:", "Resolved / enforced:", "已解决 / 已执行：", "Resueltos / aplicados:", "تم الحل / التنفيذ:")} <strong className="text-[#4d8a93]">{metrics.resolvedReportsCount}</strong> {text("กรณี", "cases", "起", "casos", "حالات")}
            </span>
          </div>
        </div>

        {/* RIGHT: Volunteer Supply by Language (Horizontal Bar Chart) */}
        <div className="flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-[#10283a]">
                  {text("ความครอบคลุมของล่ามอาสาตามภาษา", "Volunteer interpreter coverage by language", "各语言志愿口译员覆盖情况", "Cobertura de intérpretes voluntarios por idioma", "تغطية المترجمين المتطوعين حسب اللغة")}
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {text("การกระจายตัวของอาสาสมัครที่ยืนยันแล้วและพร้อมรับงาน", "Distribution of verified volunteers ready for dispatch", "已认证且可派遣志愿者的分布", "Distribución de voluntarios verificados disponibles", "توزيع المتطوعين الموثقين الجاهزين للإسناد")}
                </p>
              </div>
            </div>

            <div className="space-y-4 pt-4">
              {metrics.sortedLanguages.map(([language, count]) => {
                const percentage = Math.round((count / maxLanguageSupply) * 100);
                return (
                  <div key={language} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-700">{localizeLanguageReference(language, locale)}</span>
                      <span className="font-bold text-[#4d8a93]">
                        {count} {text("อาสาสมัคร", count === 1 ? "volunteer" : "volunteers", "位志愿者", count === 1 ? "voluntario" : "voluntarios", "متطوع")}
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[#4d8a93] transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* 4. Macro Governance & Security Log Row (Donut 2 + Audit Feed with Vertical Divider) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 py-6 items-stretch">
        {/* LEFT: Platform Account Composition (Big Donut Chart) */}
        <div className="flex flex-col justify-between space-y-5 lg:pr-8 lg:border-r lg:border-slate-200">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-[#10283a]">
                  {text("องค์ประกอบบัญชีที่ใช้งาน", "Active account composition", "活跃账户构成", "Composición de cuentas activas", "توزيع الحسابات النشطة")}
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {text("สัดส่วนบทบาทที่ใช้งาน โดยแสดงบัญชีถูกระงับแยกต่างหาก", "Active role balance; suspended accounts are shown separately", "活跃角色构成；已暂停账户单独显示", "Equilibrio de roles activos; las cuentas suspendidas se muestran aparte", "توزيع الأدوار النشطة؛ تُعرض الحسابات الموقوفة منفصلة")}
                </p>
              </div>
              <button
                type="button"
                onClick={() => onNavigateTab("users")}
                className="text-[11px] font-bold text-[#4d8a93] hover:underline cursor-pointer"
              >
                {text("รายชื่อ →", "Directory →", "目录 →", "Directorio →", "الدليل ←")}
              </button>
            </div>

            {/* Big Donut Chart & Breakdown */}
            <div className="pt-5 flex flex-col sm:flex-row items-center gap-6 sm:gap-8">
              {/* Big SVG Donut */}
              <div className="relative flex items-center justify-center shrink-0 w-44 h-44 sm:w-48 sm:h-48">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 180 180">
                  <circle
                    cx="90"
                    cy="90"
                    r="70"
                    fill="transparent"
                    stroke="#f1f5f9"
                    strokeWidth="16"
                  />
                  {metrics.activeStandardUsersCount > 0 && (
                    <circle
                      cx="90"
                      cy="90"
                      r="70"
                      fill="transparent"
                      stroke="#092f45"
                      strokeWidth="16"
                      strokeDasharray={`${strokeUsers} ${C - strokeUsers}`}
                      strokeDashoffset={offsetUsers}
                      className="transition-all duration-500"
                    />
                  )}
                  {metrics.activeInterpreterAccountsCount > 0 && (
                    <circle
                      cx="90"
                      cy="90"
                      r="70"
                      fill="transparent"
                      stroke="#4d8a93"
                      strokeWidth="16"
                      strokeDasharray={`${strokeInterp} ${C - strokeInterp}`}
                      strokeDashoffset={offsetInterp}
                      className="transition-all duration-500"
                    />
                  )}
                  {metrics.activeStaffCount > 0 && (
                    <circle
                      cx="90"
                      cy="90"
                      r="70"
                      fill="transparent"
                      stroke="#f0a35f"
                      strokeWidth="16"
                      strokeDasharray={`${strokeStaff} ${C - strokeStaff}`}
                      strokeDashoffset={offsetStaff}
                      className="transition-all duration-500"
                    />
                  )}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-3xl sm:text-4xl font-black text-[#10283a] leading-none">
                    {metrics.activeAccountsCount}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-1">
                    {text("บัญชีที่ใช้งาน", "Active accounts", "活跃账户", "Cuentas activas", "الحسابات النشطة")}
                  </span>
                </div>
              </div>

              {/* Donut Legend (Clean Minimal List) */}
              <div className="flex-1 w-full divide-y divide-slate-100">
                <div className="py-2 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="h-2 w-2 rounded-full bg-[#092f45] shrink-0" />
                    <span className="text-xs font-semibold text-slate-700">{text("ผู้ใช้", "Users", "用户", "Usuarios", "المستخدمون")}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-xs font-bold text-[#10283a]">
                      {metrics.activeStandardUsersCount}
                    </span>
                    <span className="text-[10px] text-slate-400 ml-1.5">
                      ({Math.round(standardPct * 100)}%)
                    </span>
                  </div>
                </div>

                <div className="py-2 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="h-2 w-2 rounded-full bg-[#4d8a93] shrink-0" />
                    <span className="text-xs font-semibold text-slate-700">{text("ล่าม", "Interpreters", "口译员", "Intérpretes", "المترجمون")}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-xs font-bold text-[#4d8a93]">
                      {metrics.activeInterpreterAccountsCount}
                    </span>
                    <span className="text-[10px] text-slate-400 ml-1.5">
                      ({Math.round(interpPct * 100)}%)
                    </span>
                  </div>
                </div>

                <div className="py-2 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="h-2 w-2 rounded-full bg-[#f0a35f] shrink-0" />
                    <span className="text-xs font-semibold text-slate-700">{text("เจ้าหน้าที่", "Staff", "工作人员", "Personal", "الموظفون")}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-xs font-bold text-[#10283a]">
                      {metrics.activeStaffCount}
                    </span>
                    <span className="text-[10px] text-slate-400 ml-1.5">
                      ({Math.round(staffPct * 100)}%)
                    </span>
                  </div>
                </div>

                <div className="py-2 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-700">{text("ถูกระงับ", "Suspended", "已暂停", "Suspendidas", "موقوفة")}</span>
                  <span className="font-mono text-xs font-bold text-[#f04f3e]">
                    {metrics.lockedOrBannedCount} {text("บัญชี", "accounts", "个账户", "cuentas", "حسابات")}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Active ratio note */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>
              {text("ดัชนีความพร้อม:", "Health index:", "健康指数：", "Índice de salud:", "مؤشر السلامة:")} <strong className="text-[#4d8a93]">{Math.round(((metrics.totalUsers - metrics.lockedOrBannedCount) / (metrics.totalUsers || 1)) * 100)}%</strong> {text("ยืนยันและใช้งาน", "verified active", "已验证活跃", "verificadas y activas", "موثقة ونشطة")}
            </span>
            <span className="text-slate-400">
              {text("บังคับใช้สิทธิ์ตามบทบาท", "Role-based access enforced", "已实施基于角色的访问控制", "Acceso basado en roles aplicado", "تم فرض الوصول المستند إلى الدور")}
            </span>
          </div>
        </div>

        {/* RIGHT: Recent Platform Security & Enforcement Feed */}
        <div className="flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-[#10283a]">
                  {text("รายการการบังคับใช้ด้านความปลอดภัย", "Security enforcement feed", "安全执行动态", "Actividad de aplicación de seguridad", "سجل تنفيذ الأمان")}
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {text("การดำเนินการผู้ดูแลล่าสุดที่บันทึกในประวัติการตรวจสอบ", "Latest administrative actions recorded in the audit trail", "审计记录中的最新管理操作", "Últimas acciones administrativas registradas en la auditoría", "أحدث إجراءات الإدارة المسجلة في سجل التدقيق")}
                </p>
              </div>
              <button
                type="button"
                onClick={() => onNavigateTab("audit")}
                className="text-[11px] font-bold text-[#4d8a93] hover:underline cursor-pointer"
              >
                {text("ประวัติทั้งหมด →", "Full trail →", "完整记录 →", "Registro completo →", "السجل الكامل ←")}
              </button>
            </div>

            <div className="divide-y divide-slate-100 pt-1">
              {auditLogs.slice(0, 5).map((log) => (
                <div key={log.id} className="py-2.5 flex items-start justify-between gap-3 text-xs">
                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`inline-flex rounded px-1.5 py-0.5 text-[10px] font-bold tracking-wide uppercase ${
                          log.severity === "danger"
                            ? "bg-red-50 text-[#f04f3e]"
                            : log.severity === "warning"
                            ? "bg-amber-50 text-[#f0a35f]"
                            : "bg-slate-100 text-[#10283a]"
                        }`}
                      >
                        {auditActionLabel(log.action)}
                      </span>
                      <span className="font-semibold text-[#10283a] truncate">{log.targetUser}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 line-clamp-1">{auditDetailsLabel(log.details)}</p>
                  </div>
                  <div className="text-right shrink-0 text-[10px] text-slate-400 font-mono">
                    {formatLocalizedDateTime(log.timestamp, locale, { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Bangkok" })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <p className="text-[11px] text-slate-400 pt-1">
            {text("บันทึกระบบที่ตรวจสอบการแก้ไขได้แบบเรียลไทม์", "Tamper-evident system log recorded in real time", "实时记录的防篡改系统日志", "Registro del sistema a prueba de manipulaciones en tiempo real", "سجل نظامي مقاوم للعبث ومحدّث لحظيًا")}
          </p>
        </div>
      </div>
    </div>
  );
}
