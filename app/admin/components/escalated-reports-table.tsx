"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  AdjustmentsHorizontalIcon,
  CheckCircleIcon,
  CheckIcon,
  ChevronDownIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  LanguageIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import type { AdminIncidentReport } from "../types";
import { ReportStatusFilter } from "./reports-kpi-cards";
import { TablePagination } from "./table-pagination";
import { SystemReportResolutionDialog } from "./system-report-resolution-dialog";
import type { Locale } from "@/app/components/site-header";

interface EscalatedReportsTableProps {
  reports: AdminIncidentReport[];
  onResolveSystemReport: (reportId: string, note: string) => void;
  selectedStatusFilter?: ReportStatusFilter;
  onSelectStatusFilter?: (status: ReportStatusFilter) => void;
  locale?: Locale;
}

const severityWeight: Record<AdminIncidentReport["severity"], number> = {
  medium: 1,
  high: 2,
  critical: 3,
};

export function EscalatedReportsTable({
  reports,
  onResolveSystemReport,
  selectedStatusFilter = "All",
  onSelectStatusFilter,
  locale = "en",
}: EscalatedReportsTableProps) {
  const text = (en: string, th: string, zh: string, es: string, ar: string) => locale === "th" ? th : locale === "zh" ? zh : locale === "es" ? es : locale === "ar" ? ar : en;
  const severityLabel = (severity: "All" | "medium" | "high" | "critical") => severity === "All"
    ? text("All", "ทั้งหมด", "全部", "Todos", "الكل")
    : severity === "medium" ? text("Medium", "ปานกลาง", "中等", "Media", "متوسطة")
      : severity === "high" ? text("High", "สูง", "高", "Alta", "عالية")
        : text("Critical", "วิกฤต", "严重", "Crítica", "حرجة");
  const statusLabel = (status: ReportStatusFilter) => status === "All"
    ? text("All statuses", "ทุกสถานะ", "所有状态", "Todos los estados", "كل الحالات")
    : status === "Pending" ? text("Pending action only", "เฉพาะรายการที่ต้องดำเนินการ", "仅待处理", "Solo pendientes", "الإجراءات المعلقة فقط")
      : status === "Resolved" ? text("Resolved", "แก้ไขแล้ว", "已解决", "Resueltos", "محلولة")
        : text("Dismissed", "ยกเลิกแล้ว", "已驳回", "Descartados", "مستبعدة");
  const roleLabel = (role: string) => role === "User" ? text("User", "ผู้ใช้", "用户", "Usuario", "مستخدم") : role === "Interpreter" ? text("Interpreter", "ล่าม", "口译员", "Intérprete", "مترجم") : role;
  const reportStatusLabel = (status: string) => status === "Escalated to Admin" ? text("Pending", "รอดำเนินการ", "待处理", "Pendiente", "معلّق") : status === "Resolved" ? text("Resolved", "แก้ไขแล้ว", "已解决", "Resuelto", "تم الحل") : status === "Dismissed" ? text("Dismissed", "ยกเลิกแล้ว", "已驳回", "Descartado", "مستبعد") : status;
  const [filterSeverity, setFilterSeverity] = useState<"All" | "critical" | "high" | "medium">("All");
  const [selectedReporterRoles, setSelectedReporterRoles] = useState<string[]>([]);
  const [localStatusFilter, setLocalStatusFilter] = useState<ReportStatusFilter>(selectedStatusFilter);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterMenuOpen, setFilterMenuOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedOriginalMap, setExpandedOriginalMap] = useState<Record<string, boolean>>({});
  const [selectedReportDetail, setSelectedReportDetail] = useState<AdminIncidentReport | null>(null);
  const [systemReportToResolve, setSystemReportToResolve] = useState<AdminIncidentReport | null>(null);
  const filterMenuRef = useRef<HTMLDivElement>(null);
  const pageSize = 10;

  const activeStatusFilter = onSelectStatusFilter ? selectedStatusFilter : localStatusFilter;
  const handleStatusChange = (status: ReportStatusFilter) => {
    setLocalStatusFilter(status);
    onSelectStatusFilter?.(status);
    setCurrentPage(1);
  };

  useEffect(() => {
    if (!filterMenuOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (!filterMenuRef.current?.contains(event.target as Node)) setFilterMenuOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [filterMenuOpen]);

  const toggleOriginal = (reportId: string) => {
    setExpandedOriginalMap((current) => ({ ...current, [reportId]: !current[reportId] }));
  };

  const filteredReports = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return reports
      .filter((report) => {
        if (filterSeverity !== "All" && report.severity !== filterSeverity) return false;
        if (activeStatusFilter === "Pending" && report.status !== "Escalated to Admin") return false;
        if (activeStatusFilter === "Resolved" && report.status !== "Resolved") return false;
        if (activeStatusFilter === "Dismissed" && report.status !== "Dismissed") return false;
        if (selectedReporterRoles.length > 0 && !selectedReporterRoles.includes(report.reporterRole)) return false;

        if (query) {
          const searchableText = [
            report.id,
            report.reporterName,
            report.reporterRole,
            report.bookingId,
            report.category,
            report.systemArea,
            report.reason,
            report.originalReason,
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();
          if (!searchableText.includes(query)) return false;
        }

        return true;
      })
      .sort((left, right) => {
        const severityDifference = severityWeight[right.severity] - severityWeight[left.severity];
        return severityDifference || right.createdAt.localeCompare(left.createdAt);
      });
  }, [activeStatusFilter, filterSeverity, reports, searchQuery, selectedReporterRoles]);

  const activeFiltersCount =
    (filterSeverity !== "All" ? 1 : 0) +
    (activeStatusFilter !== "All" ? 1 : 0) +
    selectedReporterRoles.length;
  const totalPages = Math.max(1, Math.ceil(filteredReports.length / pageSize));
  const validCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  const paginatedReports = filteredReports.slice(
    (validCurrentPage - 1) * pageSize,
    validCurrentPage * pageSize,
  );

  const resetFilters = () => {
    setFilterSeverity("All");
    setSelectedReporterRoles([]);
    handleStatusChange("All");
    setSearchQuery("");
    setCurrentPage(1);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 py-1 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <label htmlFor="admin-system-report-search" className="sr-only">
            {text("Search system reports", "ค้นหารายงานระบบ", "搜索系统报告", "Buscar informes del sistema", "البحث في تقارير النظام")}
          </label>
          <input
            id="admin-system-report-search"
            type="search"
            value={searchQuery}
            onChange={(event) => {
              setSearchQuery(event.target.value);
              setCurrentPage(1);
            }}
            placeholder={text("Search report ID, system area, booking or issue...", "ค้นหารหัสรายงาน พื้นที่ระบบ การจอง หรือปัญหา...", "搜索报告编号、系统区域、预订或问题…", "Buscar ID, área, reserva o problema...", "ابحث عن معرّف التقرير أو منطقة النظام أو الحجز أو المشكلة…")}
            className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-10 pr-10 text-xs text-slate-800 placeholder-slate-400 focus:border-[#087f80] focus:outline-none focus:ring-1 focus:ring-[#087f80]"
          />
          <MagnifyingGlassIcon aria-hidden="true" className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setCurrentPage(1);
              }}
              aria-label={text("Clear search", "ล้างการค้นหา", "清除搜索", "Borrar búsqueda", "مسح البحث")}
              className="absolute right-3 top-2 text-slate-400 hover:text-slate-600"
            >
              <XMarkIcon aria-hidden="true" className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-0.5 rounded-lg border border-slate-200 bg-slate-50/70 p-0.5">
            {(["All", "medium", "high", "critical"] as const).map((severity) => (
              <button
                key={severity}
                type="button"
                onClick={() => {
                  setFilterSeverity(severity);
                  setCurrentPage(1);
                }}
                className={`rounded-md px-2.5 py-1 text-xs font-bold transition-all ${filterSeverity === severity ? "border border-slate-200/80 bg-white text-[#092f45] shadow-xs" : "text-slate-600 hover:bg-white/50 hover:text-slate-900"}`}
              >
                {severityLabel(severity)}
              </button>
            ))}
          </div>

          <select
            value={activeStatusFilter}
            onChange={(event) => handleStatusChange(event.target.value as ReportStatusFilter)}
            aria-label={text("Filter report status", "กรองสถานะรายงาน", "筛选报告状态", "Filtrar estado del informe", "تصفية حالة التقرير")}
            className="rounded-xl border border-slate-200 bg-white px-2.5 py-2 text-xs font-semibold text-slate-700 focus:border-[#087f80] focus:outline-none sm:rounded-lg"
          >
            <option value="All">{statusLabel("All")}</option>
            <option value="Pending">{statusLabel("Pending")}</option>
            <option value="Resolved">{statusLabel("Resolved")}</option>
            <option value="Dismissed">{statusLabel("Dismissed")}</option>
          </select>

          <div className="relative" ref={filterMenuRef}>
            <button
              type="button"
              onClick={() => setFilterMenuOpen((open) => !open)}
              aria-expanded={filterMenuOpen}
              aria-haspopup="dialog"
              className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-2 text-xs font-bold transition-colors sm:rounded-lg ${activeFiltersCount > 0 ? "border-[#087f80] bg-[#edf7f5] text-[#087f80]" : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"}`}
            >
              <AdjustmentsHorizontalIcon aria-hidden="true" className="h-4 w-4 text-[#087f80]" />
              {text("Filter", "กรอง", "筛选", "Filtrar", "تصفية")}
              {activeFiltersCount > 0 && <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-[#087f80] px-1 text-[9px] font-black text-white">{activeFiltersCount}</span>}
              <ChevronDownIcon aria-hidden="true" className={`h-3 w-3 transition-transform ${filterMenuOpen ? "rotate-180" : ""}`} />
            </button>

            {filterMenuOpen && (
              <div role="dialog" aria-label={text("Filter system reports", "กรองรายงานระบบ", "筛选系统报告", "Filtrar informes del sistema", "تصفية تقارير النظام")} className="absolute right-0 top-full z-30 mt-2 w-72 space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="flex items-center gap-1.5 text-xs font-bold text-[#092f45]">
                    <AdjustmentsHorizontalIcon aria-hidden="true" className="h-4 w-4 text-[#087f80]" />
                    {text("Report filters", "ตัวกรองรายงาน", "报告筛选", "Filtros de informes", "فلاتر التقارير")}
                  </span>
                  {activeFiltersCount > 0 && <button type="button" onClick={resetFilters} className="text-[10px] font-bold text-red-600 hover:underline">{text("Clear all", "ล้างทั้งหมด", "全部清除", "Borrar todo", "مسح الكل")} ({activeFiltersCount})</button>}
                </div>
                <div>
                  <p className="mb-2 text-[11px] font-bold text-slate-500">{text("Reporter role", "บทบาทผู้รายงาน", "报告人角色", "Rol del informante", "دور المُبلّغ")}</p>
                  <div className="grid grid-cols-2 gap-1.5">
                    {(["User", "Interpreter"] as const).map((role) => {
                      const selected = selectedReporterRoles.includes(role);
                      return (
                        <button
                          type="button"
                          key={role}
                          onClick={() => {
                            setSelectedReporterRoles((current) => current.includes(role) ? current.filter((item) => item !== role) : [...current, role]);
                            setCurrentPage(1);
                          }}
                          aria-pressed={selected}
                          className={`flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-left text-xs font-semibold ${selected ? "border-[#087f80] bg-[#edf7f5] text-[#087f80]" : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-white"}`}
                        >
                          <span className={`flex h-3.5 w-3.5 items-center justify-center rounded border ${selected ? "border-[#087f80] bg-[#087f80] text-white" : "border-slate-300 bg-white"}`}>
                            {selected && <CheckIcon aria-hidden="true" className="h-2.5 w-2.5 stroke-[3]" />}
                          </span>
                          {roleLabel(role)}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-[11px] text-slate-500">
                  <span>{text("Found", "พบ", "找到", "Encontrados", "تم العثور على")} <strong className="text-[#092f45]">{filteredReports.length}</strong> {text("report(s)", "รายงาน", "份报告", "informe(s)", "تقرير")}</span>
                  <button type="button" onClick={() => setFilterMenuOpen(false)} className="rounded-lg bg-[#087f80] px-3 py-1.5 text-xs font-bold text-white">{text("Done", "เสร็จสิ้น", "完成", "Listo", "تم")}</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto border-y border-slate-200">
        <table className="w-full min-w-[980px] border-collapse text-left text-xs">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/75 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
              <th className="py-3.5 pl-5 pr-3">{text("Case ID / Date", "รหัสเคส / วันที่", "案件编号 / 日期", "ID / fecha", "معرّف الحالة / التاريخ")}</th>
              <th className="px-3.5 py-3.5">{text("System area", "พื้นที่ระบบ", "系统区域", "Área del sistema", "منطقة النظام")}</th>
              <th className="px-3.5 py-3.5">{text("Reporter", "ผู้รายงาน", "报告人", "Informante", "المُبلّغ")}</th>
              <th className="px-3.5 py-3.5 text-center">{text("Severity", "ความรุนแรง", "严重程度", "Gravedad", "الخطورة")}</th>
              <th className="px-3.5 py-3.5">{text("System issue", "ปัญหาระบบ", "系统问题", "Problema del sistema", "مشكلة النظام")}</th>
              <th className="px-3.5 py-3.5 text-center">{text("Status", "สถานะ", "状态", "Estado", "الحالة")}</th>
              <th className="py-3.5 pl-3 pr-5 text-right">{text("Administrative action", "การดำเนินการของผู้ดูแล", "管理员操作", "Acción administrativa", "إجراء المسؤول")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {paginatedReports.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-400">
                  <CheckCircleIcon aria-hidden="true" className="mx-auto mb-1 h-8 w-8 text-slate-300" />
                  {text("No system reports match your filters.", "ไม่พบรายงานระบบตามตัวกรอง", "没有符合筛选条件的系统报告。", "Ningún informe coincide con los filtros.", "لا توجد تقارير نظام تطابق عوامل التصفية.")}
                </td>
              </tr>
            ) : (
              paginatedReports.map((report) => {
                const isResolved = report.status !== "Escalated to Admin";
                const isOriginalExpanded = expandedOriginalMap[report.id] ?? false;
                const systemArea = report.category || report.systemArea || "Platform";

                return (
                  <tr key={report.id} className="transition-colors hover:bg-slate-50/80">
                    <td className="whitespace-nowrap py-3.5 pl-5 pr-3">
                      <span className="font-mono font-bold text-[#092f45]">{report.id}</span>
                      <div className="mt-0.5 font-mono text-[10px] text-slate-400">{report.createdAt}</div>
                      {report.bookingId && <span className="mt-1 inline-flex rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] text-slate-500">{text("Booking", "การจอง", "预订", "Reserva", "الحجز")}: {report.bookingId}</span>}
                    </td>
                    <td className="px-3.5 py-3.5 align-top">
                      <div className="flex items-center gap-2">
                        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-50 text-[11px] font-bold text-amber-700">!</span>
                        <div>
                          <div className="font-bold text-[#092f45]">{text("System issue", "ปัญหาระบบ", "系统问题", "Problema del sistema", "مشكلة النظام")}</div>
                          <span className="rounded border border-amber-200 bg-amber-50 px-1.5 py-0.5 text-[9px] font-bold text-amber-800">{systemArea}</span>
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-3.5 py-3.5 align-top">
                      <div className="font-bold text-slate-700">{report.reporterName}</div>
                      <div className="text-[10px] text-slate-400">{report.reporterRole}</div>
                    </td>
                    <td className="whitespace-nowrap px-3.5 py-3.5 text-center align-top">
                      <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wide ${report.severity === "critical" ? "border-red-200 bg-red-100 text-red-700" : report.severity === "high" ? "border-amber-200 bg-amber-100 text-amber-800" : "border-blue-200 bg-blue-100 text-blue-700"}`}>
                        {report.severity === "critical" ? <ExclamationCircleIcon aria-hidden="true" className="h-3 w-3 text-red-600" /> : <ExclamationTriangleIcon aria-hidden="true" className="h-3 w-3 text-amber-600" />}
                        {severityLabel(report.severity)}
                      </span>
                    </td>
                    <td className="max-w-sm px-3.5 py-3.5 align-top">
                      {report.originalReason && report.originalLanguage && (
                        <div className="mb-1 flex items-center gap-1.5">
                          <span className="inline-flex items-center gap-1 rounded border border-slate-200/60 bg-slate-100 px-1.5 py-0.5 text-[9px] font-semibold text-slate-600">
                            <LanguageIcon aria-hidden="true" className="h-2.5 w-2.5 text-slate-500" />
                            {report.originalLanguage}
                          </span>
                          <button type="button" onClick={() => toggleOriginal(report.id)} className="text-[10px] font-bold text-[#087f80] hover:underline">
                            {isOriginalExpanded ? text("Hide original", "ซ่อนต้นฉบับ", "隐藏原文", "Ocultar original", "إخفاء الأصل") : text("View original", "ดูต้นฉบับ", "查看原文", "Ver original", "عرض الأصل")}
                          </button>
                        </div>
                      )}
                      <p className="font-medium leading-relaxed text-slate-800" title={report.reason}>{report.reason}</p>
                      {isOriginalExpanded && report.originalReason && <p className="mt-1.5 rounded-lg border border-slate-200 bg-slate-50 p-2 text-[11px] italic text-slate-600">{report.originalReason}</p>}
                      {report.actionTaken && <p className="mt-1 line-clamp-1 text-[10px] italic text-slate-500">{text("Resolution note", "บันทึกการแก้ไข", "解决说明", "Nota de resolución", "ملاحظة الحل")}: {report.actionTaken}</p>}
                    </td>
                    <td className="whitespace-nowrap px-3.5 py-3.5 text-center align-top">
                      <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${report.status === "Escalated to Admin" ? "animate-pulse border-red-200 bg-red-50 text-red-600" : report.status === "Dismissed" ? "border-slate-200 bg-slate-100 text-slate-600" : "border-emerald-200 bg-emerald-50 text-emerald-700"}`}>
                        {reportStatusLabel(report.status)}
                      </span>
                    </td>
                    <td className="whitespace-nowrap py-3.5 pl-3 pr-5 text-right align-top">
                      {isResolved ? (
                        <button type="button" onClick={() => setSelectedReportDetail(report)} className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-50">
                          <EyeIcon aria-hidden="true" className="h-3.5 w-3.5" /> {text("View history", "ดูประวัติ", "查看历史", "Ver historial", "عرض السجل")}
                        </button>
                      ) : (
                        <button type="button" onClick={() => setSystemReportToResolve(report)} className="inline-flex items-center gap-1 rounded-xl bg-[#087f80] px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-[#066768]">
                          <CheckCircleIcon aria-hidden="true" className="h-3.5 w-3.5" /> {text("Resolve system issue", "แก้ไขปัญหาระบบ", "解决系统问题", "Resolver problema", "حل مشكلة النظام")}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <TablePagination
        totalItems={filteredReports.length}
        currentPage={validCurrentPage}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
        itemName={text("reports", "รายงาน", "报告", "informes", "تقارير")}
        locale={locale}
      />

      <SystemReportResolutionDialog
        report={systemReportToResolve}
        onClose={() => setSystemReportToResolve(null)}
        locale={locale}
        onConfirm={(reportId, note) => {
          onResolveSystemReport(reportId, note);
          setSystemReportToResolve(null);
        }}
      />

      {selectedReportDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-xl space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs font-bold text-slate-500">{selectedReportDetail.id}</span>
                  <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-800">{text("System report", "รายงานระบบ", "系统报告", "Informe del sistema", "تقرير النظام")}</span>
                </div>
                <h3 className="mt-1 text-lg font-extrabold text-[#092f45]">{text("System report history", "ประวัติรายงานระบบ", "系统报告历史", "Historial del informe", "سجل تقرير النظام")}</h3>
                <p className="text-xs text-slate-500">{text("Logged", "บันทึกเมื่อ", "记录时间", "Registrado", "سُجّل")}: {selectedReportDetail.createdAt}{selectedReportDetail.bookingId ? ` · ${text("Booking", "การจอง", "预订", "Reserva", "الحجز")}: ${selectedReportDetail.bookingId}` : ""}</p>
              </div>
              <button type="button" onClick={() => setSelectedReportDetail(null)} aria-label={text("Close report history", "ปิดประวัติรายงาน", "关闭报告历史", "Cerrar historial", "إغلاق سجل التقرير")} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
                <XMarkIcon aria-hidden="true" className="h-5 w-5" />
              </button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-amber-100 bg-amber-50/40 p-3.5">
                <p className="text-[11px] font-bold uppercase tracking-wide text-amber-700">{text("System area", "พื้นที่ระบบ", "系统区域", "Área del sistema", "منطقة النظام")}</p>
                <p className="mt-1 text-sm font-bold text-[#092f45]">{selectedReportDetail.category || selectedReportDetail.systemArea || "Platform"}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-3.5">
                <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">{text("Reported by", "ผู้รายงาน", "报告人", "Informado por", "أبلغ عنه")}</p>
                <p className="mt-1 text-sm font-bold text-[#092f45]">{selectedReportDetail.reporterName}</p>
                <p className="text-xs text-slate-500">{selectedReportDetail.reporterRole}</p>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-sm leading-relaxed text-slate-800">
              <p className="mb-1 text-[11px] font-bold uppercase tracking-wide text-slate-500">{text("System issue", "ปัญหาระบบ", "系统问题", "Problema del sistema", "مشكلة النظام")}</p>
              {selectedReportDetail.reason}
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-3.5">
              <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">{text("Resolution note", "บันทึกการแก้ไข", "解决说明", "Nota de resolución", "ملاحظة الحل")}</p>
              <p className="mt-1 text-xs text-slate-700">{selectedReportDetail.actionTaken || text("No resolution note recorded.", "ไม่มีบันทึกการแก้ไข", "未记录解决说明。", "No hay nota de resolución.", "لم تُسجل ملاحظة للحل.")}</p>
            </div>
            <div className="flex justify-end border-t border-slate-100 pt-3">
              <button type="button" onClick={() => setSelectedReportDetail(null)} className="rounded-xl bg-slate-900 px-5 py-2 text-xs font-bold text-white hover:bg-slate-800">
                {text("Close history", "ปิดประวัติ", "关闭历史", "Cerrar historial", "إغلاق السجل")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
