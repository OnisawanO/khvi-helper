"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import {
  AdjustmentsHorizontalIcon,
  CheckIcon,
  ChevronDownIcon,
  ListBulletIcon,
  MagnifyingGlassIcon,
  TableCellsIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { AuditLogEntry } from "../types";
import { TablePagination } from "./table-pagination";
import type { Locale } from "@/app/components/site-header";
import { formatLocalizedDateTime } from "@/app/lib/locale";

interface AuditTrailTableProps {
  auditLogs: AuditLogEntry[];
  auditViewMode: "table" | "activity";
  setAuditViewMode: (mode: "table" | "activity") => void;
  locale: Locale;
}

export function AuditTrailTable({
  auditLogs,
  auditViewMode,
  setAuditViewMode,
  locale,
}: AuditTrailTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSeverities, setSelectedSeverities] = useState<string[]>([]);
  const [selectedActions, setSelectedActions] = useState<string[]>([]);
  const [selectedActorRoles, setSelectedActorRoles] = useState<string[]>([]);
  const [filterMenuOpen, setFilterMenuOpen] = useState(false);
  const filterMenuRef = useRef<HTMLDivElement>(null);

  // Pagination state (10 records per page)
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Close filter popover on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (filterMenuRef.current && !filterMenuRef.current.contains(event.target as Node)) {
        setFilterMenuOpen(false);
      }
    }
    if (filterMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [filterMenuOpen]);

  // Unique actions list for filter
  const availableActions = useMemo(() => {
    const set = new Set<string>();
    auditLogs.forEach((l) => set.add(l.action));
    return Array.from(set).sort();
  }, [auditLogs]);

  const filteredLogs = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return auditLogs.filter((log) => {
      if (selectedSeverities.length > 0 && !selectedSeverities.includes(log.severity)) {
        return false;
      }
      if (selectedActions.length > 0 && !selectedActions.includes(log.action)) {
        return false;
      }
      if (selectedActorRoles.length > 0) {
        const actorLower = log.actor.toLowerCase();
        const matchesActor = selectedActorRoles.some((role) => {
          if (role === "Admin") return actorLower.includes("admin");
          if (role === "Manager") return actorLower.includes("manager");
          if (role === "System") return actorLower.includes("system");
          return false;
        });
        if (!matchesActor) return false;
      }
      if (q) {
        const matchId = log.id.toLowerCase().includes(q);
        const matchActor = log.actor.toLowerCase().includes(q);
        const matchAction = log.action.toLowerCase().includes(q);
        const matchTarget = log.targetUser.toLowerCase().includes(q);
        const matchDetails = log.details.toLowerCase().includes(q);
        if (!matchId && !matchActor && !matchAction && !matchTarget && !matchDetails) {
          return false;
        }
      }
      return true;
    });
  }, [auditLogs, selectedSeverities, selectedActions, selectedActorRoles, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / pageSize));
  const validCurrentPage = Math.min(Math.max(1, currentPage), totalPages);

  const paginatedLogs = useMemo(() => {
    const start = (validCurrentPage - 1) * pageSize;
    return filteredLogs.slice(start, start + pageSize);
  }, [filteredLogs, validCurrentPage, pageSize]);

  const activeFiltersCount =
    selectedSeverities.length + selectedActions.length + selectedActorRoles.length;
  const text = (en: string, th: string, zh: string, es: string, ar: string) => locale === "th" ? th : locale === "zh" ? zh : locale === "es" ? es : locale === "ar" ? ar : en;
  const actionLabel = (action: string) => ({
    INTERPRETER_APPLICATION_APPROVED: text("Interpreter application approved", "อนุมัติใบสมัครล่าม", "已批准口译员申请", "Solicitud de intérprete aprobada", "تم اعتماد طلب المترجم"),
    INTERPRETER_REVOKED: text("Interpreter accreditation revoked", "เพิกถอนการรับรองล่าม", "已撤销口译员认证", "Acreditación de intérprete revocada", "تم إلغاء اعتماد المترجم"),
    ACCOUNT_UPDATE: text("Account updated", "อัปเดตบัญชี", "已更新账户", "Cuenta actualizada", "تم تحديث الحساب"),
    ACCOUNT_SUSPEND: text("Account suspended", "ระงับบัญชี", "已暂停账户", "Cuenta suspendida", "تم تعليق الحساب"),
    ACCOUNT_BAN: text("Account banned", "แบนบัญชี", "已封禁账户", "Cuenta bloqueada", "تم حظر الحساب"),
  }[action] ?? text("Security action", "การดำเนินการความปลอดภัย", "安全操作", "Acción de seguridad", "إجراء أمني"));
  const detailsLabel = (details: string) => {
    if (/Interpreter application decision: approved/i.test(details)) return text("Interpreter application decision: approved.", "ตัดสินใบสมัครล่าม: อนุมัติ", "口译员申请决定：已批准", "Decisión de solicitud de intérprete: aprobada.", "قرار طلب المترجم: تمت الموافقة.");
    const revoked = details.match(/^Interpreter accreditation revoked:\s*(.*)$/i);
    if (revoked) return text(`Interpreter accreditation revoked: ${revoked[1]}`, `เพิกถอนการรับรองล่าม: ${revoked[1]}`, `已撤销口译员认证：${revoked[1]}`, `Acreditación de intérprete revocada: ${revoked[1]}`, `تم إلغاء اعتماد المترجم: ${revoked[1]}`);
    const role = details.match(/^Role set to (.*)\. Locked: (Yes|No)\.?$/i);
    if (role) return text(`Role set to ${role[1]}. Locked: ${role[2]}.`, `กำหนดบทบาทเป็น ${role[1]} · ล็อก: ${role[2] === "Yes" ? "ใช่" : "ไม่"}`, `角色设为${role[1]} · 已锁定：${role[2] === "Yes" ? "是" : "否"}`, `Rol establecido: ${role[1]} · Bloqueada: ${role[2] === "Yes" ? "Sí" : "No"}`, `تم تعيين الدور إلى ${role[1]} · مقفل: ${role[2] === "Yes" ? "نعم" : "لا"}`);
    return details;
  };
  const severityLabel = (severity: string) => ({ danger: text("Danger", "อันตราย", "危险", "Peligro", "خطر"), warning: text("Warning", "คำเตือน", "警告", "Advertencia", "تحذير"), info: text("Info", "ข้อมูล", "信息", "Información", "معلومات") }[severity] ?? severity);
  const timestampLabel = (timestamp: string) => formatLocalizedDateTime(timestamp, locale, { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Bangkok" });

  return (
    <div className="space-y-4">
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-slate-200">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-[#092f45]">{text("System Security Audit Trail", "ประวัติการตรวจสอบความปลอดภัยระบบ", "系统安全审计记录", "Registro de auditoría de seguridad", "سجل تدقيق أمان النظام")}</h2>
          </div>

          {/* Toggle Button: View 1 (Table Grid) vs View 2 (Activity Cards Feed) */}
          <div className="flex items-center gap-1 self-start sm:self-auto rounded-lg border border-slate-200 bg-slate-50/70 p-0.5">
            <button
              type="button"
              onClick={() => setAuditViewMode("table")}
              className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-bold transition-all cursor-pointer ${
                auditViewMode === "table"
                  ? "bg-white text-[#087f80] shadow-xs border border-slate-200/80"
                  : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
              }`}
              title={text("Table Grid View", "มุมมองตาราง", "表格视图", "Vista de tabla", "عرض الجدول")}
            >
              <TableCellsIcon className="h-3.5 w-3.5" />
              <span>{text("Table", "ตาราง", "表格", "Tabla", "جدول")}</span>
            </button>
            <button
              type="button"
              onClick={() => setAuditViewMode("activity")}
              className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-bold transition-all cursor-pointer ${
                auditViewMode === "activity"
                  ? "bg-white text-[#087f80] shadow-xs border border-slate-200/80"
                  : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
              }`}
              title={text("Recent Activity Feed View", "มุมมองกิจกรรมล่าสุด", "最近活动视图", "Vista de actividad reciente", "عرض النشاط الأخير")}
            >
              <ListBulletIcon className="h-3.5 w-3.5" />
              <span>{text("Activity Feed", "ฟีดกิจกรรม", "活动动态", "Actividad", "موجز النشاط")}</span>
            </button>
          </div>
        </div>

        {/* Search and Audit Filter Toolbar: Flat Canvas Bar */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between py-2">
          {/* Search Bar */}
          <div className="relative flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={text("Search audit trail by log ID, actor, action type, target account or detail...", "ค้นหาด้วยรหัส ผู้ดำเนินการ ประเภทการดำเนินการ บัญชีเป้าหมาย หรือรายละเอียด…", "按日志 ID、执行者、操作类型、目标账户或详情搜索…", "Buscar por ID, actor, acción, cuenta objetivo o detalle…", "ابحث برقم السجل أو المنفذ أو نوع الإجراء أو الحساب أو التفاصيل…")}
              className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-10 pr-4 text-xs text-slate-800 placeholder-slate-400 focus:border-[#087f80] focus:outline-none focus:ring-1 focus:ring-[#087f80]"
            />
            <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Combined Filter Popover */}
          <div className="relative" ref={filterMenuRef}>
            <button
              type="button"
              onClick={() => setFilterMenuOpen(!filterMenuOpen)}
              className={`flex items-center justify-center gap-2 rounded-xl sm:rounded-lg border px-3 py-2 text-xs font-bold transition-all shadow-2xs cursor-pointer ${
                activeFiltersCount > 0
                  ? "border-[#087f80] bg-[#edf7f5] text-[#087f80]"
                  : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              <AdjustmentsHorizontalIcon className="h-4 w-4 text-[#087f80]" />
              <span>{text("Event Filter", "กรองเหตุการณ์", "事件筛选", "Filtrar eventos", "تصفية الأحداث")}</span>
              {activeFiltersCount > 0 && (
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#087f80] text-[9px] font-black text-white">
                  {activeFiltersCount}
                </span>
              )}
              <ChevronDownIcon
                className={`h-3 w-3 text-[#5e7783] transition-transform ${
                  filterMenuOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Filter Popover Dropdown */}
            {filterMenuOpen && (
              <div className="absolute right-0 top-full z-30 mt-2 w-72 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl space-y-3.5 animate-in fade-in zoom-in-95">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="text-xs font-bold text-[#092f45] flex items-center gap-1.5">
                    <AdjustmentsHorizontalIcon className="h-4 w-4 text-[#087f80]" />
                    {text("Audit Event Filters", "ตัวกรองเหตุการณ์ตรวจสอบ", "审计事件筛选", "Filtros de auditoría", "عوامل تصفية أحداث التدقيق")}
                  </span>
                  {activeFiltersCount > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedSeverities([]);
                        setSelectedActions([]);
                        setSelectedActorRoles([]);
                      }}
                      className="text-[10px] font-bold text-red-600 hover:underline cursor-pointer"
                    >
                      {text("Reset All", "รีเซ็ตทั้งหมด", "全部重置", "Restablecer todo", "إعادة ضبط الكل")} ({activeFiltersCount})
                    </button>
                  )}
                </div>

                {/* Section 1: Actor Type */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                      {text("Actor", "ผู้ดำเนินการ", "执行者", "Actor", "المنفذ")}
                    </label>
                    {selectedActorRoles.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setSelectedActorRoles([])}
                        className="text-[10px] font-bold text-[#087f80] hover:underline cursor-pointer"
                      >
                        {text("Reset", "รีเซ็ต", "重置", "Restablecer", "إعادة ضبط")} ({selectedActorRoles.length})
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    {(["Admin", "Manager", "System"] as const).map((actorType) => {
                      const isChecked = selectedActorRoles.includes(actorType);
                      return (
                        <button
                          type="button"
                          key={actorType}
                          onClick={() =>
                            setSelectedActorRoles((prev) =>
                              prev.includes(actorType)
                                ? prev.filter((a) => a !== actorType)
                                : [...prev, actorType]
                            )
                          }
                          className={`flex items-center justify-between rounded-lg border px-2 py-1 text-xs font-semibold cursor-pointer transition-colors ${
                            isChecked
                              ? "border-[#087f80] bg-[#edf7f5] text-[#087f80]"
                              : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-white"
                          }`}
                        >
                          <span className="truncate">{actorType}</span>
                          <span
                            className={`flex h-3 w-3 shrink-0 items-center justify-center rounded border ${
                              isChecked
                                ? "border-[#087f80] bg-[#087f80] text-white"
                                : "border-slate-300 bg-white"
                            }`}
                          >
                            {isChecked && <CheckIcon className="h-2 w-2 stroke-[3]" />}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Section 2: Severity Filter */}
                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                    {text("Severity", "ระดับความรุนแรง", "严重程度", "Gravedad", "الخطورة")}
                  </label>
                  <div className="flex flex-wrap gap-1">
                    {(["danger", "warning", "info"] as const).map((sev) => {
                      const isChecked = selectedSeverities.includes(sev);
                      return (
                        <button
                          type="button"
                          key={sev}
                          onClick={() =>
                            setSelectedSeverities((prev) =>
                              prev.includes(sev) ? prev.filter((s) => s !== sev) : [...prev, sev]
                            )
                          }
                          className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-semibold cursor-pointer transition-colors ${
                            isChecked
                              ? sev === "danger"
                                ? "border-red-300 bg-red-50 text-red-700"
                                : sev === "warning"
                                ? "border-amber-300 bg-amber-50 text-amber-700"
                                : "border-teal-300 bg-teal-50 text-[#087f80]"
                              : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-white"
                          }`}
                        >
                          <span
                            className={`flex h-3 w-3 items-center justify-center rounded border ${
                              isChecked
                                ? "border-current bg-current text-white"
                                : "border-slate-300 bg-white"
                            }`}
                          >
                            {isChecked && <CheckIcon className="h-2 w-2 stroke-[3] text-white" />}
                          </span>
                          <span className="capitalize">{severityLabel(sev)}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Section 3: Action Type */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                      {text("Action Type", "ประเภทการดำเนินการ", "操作类型", "Tipo de acción", "نوع الإجراء")}
                    </label>
                    {selectedActions.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setSelectedActions([])}
                        className="text-[10px] font-bold text-[#087f80] hover:underline cursor-pointer"
                      >
                        {text("Reset", "รีเซ็ต", "重置", "Restablecer", "إعادة ضبط")} ({selectedActions.length})
                      </button>
                    )}
                  </div>
                  <div className="max-h-40 overflow-y-auto space-y-1 pr-1">
                    {availableActions.map((action) => {
                      const isChecked = selectedActions.includes(action);
                      return (
                        <button
                          type="button"
                          key={action}
                          onClick={() =>
                            setSelectedActions((prev) =>
                              prev.includes(action) ? prev.filter((a) => a !== action) : [...prev, action]
                            )
                          }
                          className={`flex w-full items-center justify-between rounded-lg border px-2.5 py-1.5 text-xs font-semibold cursor-pointer transition-colors ${
                            isChecked
                              ? "border-[#087f80] bg-[#edf7f5] text-[#087f80]"
                              : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-white"
                          }`}
                        >
                          <span className="truncate">{actionLabel(action)}</span>
                          <span
                            className={`flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded border ${
                              isChecked
                                ? "border-[#087f80] bg-[#087f80] text-white"
                                : "border-slate-300 bg-white"
                            }`}
                          >
                            {isChecked && <CheckIcon className="h-2.5 w-2.5 stroke-[3]" />}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* VIEW 1: DEDICATED TABLE VIEW */}
        {auditViewMode === "table" && (
          <div className="mt-4 border-y border-slate-200 overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="border-b border-slate-200 bg-slate-50 font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="py-3 pl-4 pr-2">{text("Log ID & Time", "รหัสและเวลา", "日志 ID 与时间", "ID y hora", "المعرّف والوقت")}</th>
                  <th className="px-2 py-3 text-center">{text("Severity", "ระดับความรุนแรง", "严重程度", "Gravedad", "الخطورة")}</th>
                  <th className="px-2 py-3">{text("Administrator", "ผู้ดูแลระบบ", "管理员", "Administrador", "المسؤول")}</th>
                  <th className="px-2 py-3">{text("Action", "การดำเนินการ", "操作", "Acción", "الإجراء")}</th>
                  <th className="px-2 py-3">{text("Target Account", "บัญชีเป้าหมาย", "目标账户", "Cuenta objetivo", "الحساب المستهدف")}</th>
                  <th className="py-3 pl-2 pr-4">{text("Details", "รายละเอียด", "详情", "Detalles", "التفاصيل")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {paginatedLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400 font-sans">
                      {text("No audit events match your search/filter criteria.", "ไม่พบเหตุการณ์ตามตัวกรอง", "没有符合搜索/筛选条件的审计事件。", "No hay eventos que coincidan con la búsqueda o los filtros.", "لا توجد أحداث تدقيق تطابق البحث أو عوامل التصفية.")}
                    </td>
                  </tr>
                ) : (
                  paginatedLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 pl-4 pr-2 text-slate-500">
                        <span className="font-bold text-[#092f45]">{log.id}</span>
                        <div className="text-[10px] text-slate-400 font-sans">{timestampLabel(log.timestamp)}</div>
                      </td>
                      <td className="px-2 py-3 text-center">
                        <span
                          className={`inline-block rounded px-2 py-0.5 text-[9px] font-bold uppercase ${
                            log.severity === "danger"
                              ? "bg-red-100 text-[#f04f3e]"
                              : log.severity === "warning"
                              ? "bg-amber-100 text-amber-700"
                              : "bg-teal-100 text-[#087f80]"
                          }`}
                        >
                          {severityLabel(log.severity)}
                        </span>
                      </td>
                      <td className="px-2 py-3 font-semibold text-[#092f45] font-sans">{log.actor}</td>
                      <td className="px-2 py-3 font-bold text-slate-700">{actionLabel(log.action)}</td>
                      <td className="px-2 py-3 text-slate-600 font-sans">{log.targetUser}</td>
                      <td className="py-3 pl-2 pr-4 text-slate-500 font-sans text-xs">{detailsLabel(log.details)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* VIEW 2: DEDICATED RECENT ACTIVITY FEED CARDS: Flat Hairline Feed */}
        {auditViewMode === "activity" && (
          <div className="mt-2 divide-y divide-slate-100 border-y border-slate-200">
            {paginatedLogs.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                {text("No audit events match your search/filter criteria.", "ไม่พบเหตุการณ์ตามตัวกรอง", "没有符合搜索/筛选条件的审计事件。", "No hay eventos que coincidan con la búsqueda o los filtros.", "لا توجد أحداث تدقيق تطابق البحث أو عوامل التصفية.")}
              </div>
            ) : (
              paginatedLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-3.5 px-2 transition-colors hover:bg-slate-50/70"
                >
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wide ${
                          log.severity === "danger"
                            ? "bg-red-50 text-red-700 border border-red-200/80"
                            : log.severity === "warning"
                            ? "bg-amber-50 text-amber-800 border border-amber-200/80"
                            : "bg-teal-50 text-teal-800 border border-teal-200/80"
                        }`}
                      >
                        {actionLabel(log.action)}
                      </span>
                      <span className="text-xs font-bold text-[#092f45]">
                        {log.targetUser}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {text("by", "โดย", "由", "por", "بواسطة")} <strong className="text-slate-600 font-semibold">{log.actor}</strong>
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {detailsLabel(log.details)}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 border-t sm:border-t-0 pt-1.5 sm:pt-0 border-slate-100">
                    <span className="text-xs font-mono text-slate-400">
                      {timestampLabel(log.timestamp)}
                    </span>
                    <span className="rounded bg-slate-50 border border-slate-200/80 px-2 py-0.5 text-[10px] font-mono font-medium text-slate-600">
                      {log.id}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Table Pagination Footer */}
        <TablePagination
          totalItems={filteredLogs.length}
          currentPage={validCurrentPage}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          itemName={text("audit log events", "เหตุการณ์ตรวจสอบ", "审计事件", "eventos de auditoría", "أحداث التدقيق")}
          locale={locale}
        />
      </div>
    </div>
  );
}
