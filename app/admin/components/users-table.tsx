"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import {
  AdjustmentsHorizontalIcon,
  BriefcaseIcon,
  ChatBubbleLeftEllipsisIcon,
  CheckCircleIcon,
  CheckIcon,
  ChevronDownIcon,
  DocumentMagnifyingGlassIcon,
  LanguageIcon,
  LockClosedIcon,
  NoSymbolIcon,
  StarIcon,
  UserCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { AdminUserRecord, SystemRole, UserStatusFilter } from "../types";
import { TablePagination } from "./table-pagination";
import type { Locale } from "@/app/components/site-header";
import { formatLocalizedDateTime } from "@/app/lib/locale";
import { localizeCategoryReference, localizeLanguageReference, localizeUnspecified } from "@/app/lib/reference-localization";

interface UsersTableProps {
  users: AdminUserRecord[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedRoles: SystemRole[];
  toggleRoleFilter: (role: SystemRole) => void;
  resetRoles: () => void;
  selectedStatusFilter: UserStatusFilter;
  setSelectedStatusFilter: (status: UserStatusFilter) => void;
  selectedVerificationStatuses: string[];
  toggleVerificationStatusFilter: (status: string) => void;
  resetVerificationStatuses: () => void;
  selectedLanguages: string[];
  toggleLanguageFilter: (lang: string) => void;
  resetLanguages: () => void;
  selectedCategories: string[];
  toggleCategoryFilter: (cat: string) => void;
  resetCategories: () => void;
  filterMenuOpen: boolean;
  setFilterMenuOpen: (open: boolean) => void;
  onSelectUser: (user: AdminUserRecord) => void;
  locale: Locale;
}

export function UsersTable({
  users,
  searchQuery,
  setSearchQuery,
  selectedRoles,
  toggleRoleFilter,
  resetRoles,
  selectedStatusFilter,
  setSelectedStatusFilter,
  selectedVerificationStatuses,
  toggleVerificationStatusFilter,
  resetVerificationStatuses,
  selectedLanguages,
  toggleLanguageFilter,
  resetLanguages,
  selectedCategories,
  toggleCategoryFilter,
  resetCategories,
  filterMenuOpen,
  setFilterMenuOpen,
  onSelectUser,
  locale,
}: UsersTableProps) {
  const filterMenuRef = useRef<HTMLDivElement>(null);

  // Close filter popover when clicking outside
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
  }, [filterMenuOpen, setFilterMenuOpen]);

  const activeFiltersCount =
    selectedRoles.length +
    selectedVerificationStatuses.length +
    selectedLanguages.length +
    selectedCategories.length;
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const totalPages = Math.max(1, Math.ceil(users.length / pageSize));
  const validCurrentPage = Math.min(Math.max(1, currentPage), totalPages);

  const availableLanguages = useMemo(
    () => Array.from(new Set(users.flatMap((user) => [user.primaryLanguage, ...user.spokenLanguages]).filter(Boolean))).sort(),
    [users],
  );
  const availableCategories = useMemo(
    () => Array.from(new Set(users.flatMap((user) => user.interpreterStats?.specialties || []).filter(Boolean))).sort(),
    [users],
  );

  const paginatedUsers = useMemo(() => {
    const start = (validCurrentPage - 1) * pageSize;
    return users.slice(start, start + pageSize);
  }, [users, validCurrentPage, pageSize]);
  const text = (en: string, th: string, zh: string, es: string, ar: string) => locale === "th" ? th : locale === "zh" ? zh : locale === "es" ? es : locale === "ar" ? ar : en;
  const roleLabel = (role: SystemRole) => ({ User: text("User", "ผู้ใช้", "用户", "Usuario", "مستخدم"), Interpreter: text("Interpreter", "ล่าม", "口译员", "Intérprete", "مترجم"), Manager: text("Manager", "ผู้จัดการ", "管理员", "Gestor", "مدير"), Admin: text("Admin", "ผู้ดูแลระบบ", "管理员", "Administrador", "مسؤول") }[role]);
  const formatLastActive = (value: string) => {
    const parsed = new Date(value.replace(" ", "T"));
    return Number.isFinite(parsed.getTime()) ? formatLocalizedDateTime(parsed, locale, { dateStyle: "medium", timeStyle: "short" }) : value;
  };

  return (
    <div className="space-y-4">
      {/* Filter Controls Bar: Flat Canvas Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between py-1">
        {/* Search Bar */}
        <div className="relative flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={text("Search by name, email, phone or ID...", "ค้นหาด้วยชื่อ อีเมล โทรศัพท์ หรือ ID…", "按姓名、邮箱、电话或 ID 搜索…", "Buscar por nombre, correo, teléfono o ID…", "ابحث بالاسم أو البريد أو الهاتف أو المعرّف…")}
            className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-10 pr-4 text-xs text-slate-800 placeholder-slate-400 focus:border-[#087f80] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#087f80]"
          />
          <DocumentMagnifyingGlassIcon className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-2 text-slate-400 hover:text-slate-600"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Filter Controls: Quick Status Select + Unified Multi-Select Filter Button */}
        <div className="flex items-center gap-2">
          {/* Quick Status Filter on Toolbar */}
          <div className="flex items-center gap-1.5">
            <select
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value as UserStatusFilter)}
              className="rounded-xl sm:rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-xs font-semibold text-slate-700 focus:border-[#087f80] focus:outline-none cursor-pointer"
            >
              <option value="All">{text("All Accounts", "ทุกบัญชี", "全部账户", "Todas las cuentas", "كل الحسابات")}</option>
              <option value="Active">{text("Active Only", "เฉพาะที่ใช้งาน", "仅活跃", "Solo activas", "النشطة فقط")}</option>
              <option value="SoftSuspended">{text("Soft Suspended", "ระงับชั่วคราว", "暂时停用", "Suspendidas temporalmente", "موقوفة مؤقتًا")}</option>
              <option value="LegacyRestricted">{text("Legacy Restricted", "จำกัดแบบเดิม", "旧限制", "Restricción heredada", "مقيّدة سابقًا")}</option>
              <option value="AppealPending">{text("Appeal Pending", "รอคำอุทธรณ์", "待申诉", "Apelación pendiente", "استئناف معلق")} ({users.filter(u => u.hasPendingAppeal).length})</option>
            </select>
          </div>

          {/* Unified Filter Button (Roles, Verification, Languages & Categories) */}
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
              <span>{text("Filter", "กรอง", "筛选", "Filtrar", "تصفية")}</span>
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

            {/* Filter Popover Menu (Roles + Languages + Specialties) */}
            {/* Filter Popover Menu (Roles + Verification + Languages + Specialties) */}
            {filterMenuOpen && (
              <div className="fixed inset-x-4 top-24 sm:absolute sm:inset-x-auto sm:right-0 sm:top-full sm:mt-2 z-50 sm:w-88 md:w-96 rounded-2xl border border-[#d3dfe3] bg-white p-4 shadow-[0_16px_40px_rgba(9,47,69,0.18)] space-y-4 animate-in fade-in zoom-in-95 max-h-[80vh] overflow-y-auto">
                <div className="flex items-center justify-between border-b border-[#edf2f5] pb-2.5">
                  <span className="text-xs font-black text-[#112d3f] flex items-center gap-1.5">
                    <AdjustmentsHorizontalIcon className="h-4 w-4 text-[#087f80]" />
                    {text("Filter Options", "ตัวเลือกตัวกรอง", "筛选选项", "Opciones de filtro", "خيارات التصفية")}
                  </span>
                  {activeFiltersCount > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        resetRoles();
                        resetVerificationStatuses();
                        resetLanguages();
                        resetCategories();
                      }}
                      className="text-[11px] font-bold text-[#f04f3e] hover:underline cursor-pointer"
                    >
                      {text("Clear all", "ล้างทั้งหมด", "全部清除", "Borrar todo", "مسح الكل")} ({activeFiltersCount})
                    </button>
                  )}
                </div>

                {/* Section 1: System Roles Multi-Select */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-[11px] font-bold text-[#557180] flex items-center gap-1">
                      <UserCircleIcon className="h-3.5 w-3.5 text-[#087f80]" />
                      {text("Roles (Multi-Select)", "บทบาท (เลือกได้หลายรายการ)", "角色（可多选）", "Roles (selección múltiple)", "الأدوار (اختيار متعدد)")}
                    </label>
                    {selectedRoles.length > 0 && (
                      <button
                        type="button"
                        onClick={resetRoles}
                        className="text-[10px] text-[#087f80] hover:underline cursor-pointer font-bold"
                      >
                        {text("Reset", "รีเซ็ต", "重置", "Restablecer", "إعادة ضبط")} ({selectedRoles.length})
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {(["User", "Interpreter", "Manager", "Admin"] as SystemRole[]).map((role) => {
                      const isChecked = selectedRoles.includes(role);
                      return (
                        <button
                          type="button"
                          key={role}
                          onClick={() => toggleRoleFilter(role)}
                          className={`flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-xs font-semibold cursor-pointer transition-colors text-left ${
                            isChecked
                              ? "border-[#087f80] bg-[#edf7f5] text-[#087f80]"
                              : "border-[#e0eaee] bg-[#f9fbfb] text-[#244253] hover:bg-white"
                          }`}
                        >
                          <span
                            className={`flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded border ${
                              isChecked
                                ? "border-[#087f80] bg-[#087f80] text-white"
                                : "border-[#b8cbd2] bg-white"
                            }`}
                          >
                            {isChecked && <CheckIcon className="h-2.5 w-2.5 stroke-[3]" />}
                          </span>
                          <span className="truncate">{roleLabel(role)}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Section 2: Interpreter Accreditation & Verification Status */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-[11px] font-bold text-[#557180] flex items-center gap-1">
                      <CheckCircleIcon className="h-3.5 w-3.5 text-[#087f80]" />
                      {text("Interpreter Verification", "การรับรองล่าม", "口译员认证", "Verificación del intérprete", "تحقق المترجم")}
                    </label>
                    {selectedVerificationStatuses.length > 0 && (
                      <button
                        type="button"
                        onClick={resetVerificationStatuses}
                        className="text-[10px] text-[#087f80] hover:underline cursor-pointer font-bold"
                      >
                        {text("Reset", "รีเซ็ต", "重置", "Restablecer", "إعادة ضبط")} ({selectedVerificationStatuses.length})
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {(["Approved", "Pending", "Under Review", "Suspended"] as const).map((status) => {
                      const isChecked = selectedVerificationStatuses.includes(status);
                      return (
                        <button
                          type="button"
                          key={status}
                          onClick={() => toggleVerificationStatusFilter(status)}
                          className={`flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-xs font-semibold cursor-pointer transition-colors text-left ${
                            isChecked
                              ? "border-[#087f80] bg-[#edf7f5] text-[#087f80]"
                              : "border-[#e0eaee] bg-[#f9fbfb] text-[#244253] hover:bg-white"
                          }`}
                        >
                          <span
                            className={`flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded border ${
                              isChecked
                                ? "border-[#087f80] bg-[#087f80] text-white"
                                : "border-[#b8cbd2] bg-white"
                            }`}
                          >
                            {isChecked && <CheckIcon className="h-2.5 w-2.5 stroke-[3]" />}
                          </span>
                          <span className="truncate">{({ Approved: text("Approved", "อนุมัติแล้ว", "已批准", "Aprobado", "معتمد"), Pending: text("Pending", "รอตรวจสอบ", "待审核", "Pendiente", "قيد الانتظار"), "Under Review": text("Under Review", "กำลังตรวจสอบ", "审核中", "En revisión", "قيد المراجعة"), Suspended: text("Suspended", "ระงับ", "已暂停", "Suspendido", "موقوف") } as Record<string,string>)[status]}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Section 2: Languages */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-[11px] font-bold text-[#557180] flex items-center gap-1">
                      <LanguageIcon className="h-3.5 w-3.5 text-[#087f80]" />
                      {text("Languages", "ภาษา", "语言", "Idiomas", "اللغات")}
                    </label>
                    {selectedLanguages.length > 0 && (
                      <button
                        type="button"
                        onClick={resetLanguages}
                        className="text-[10px] text-[#087f80] hover:underline cursor-pointer font-bold"
                      >
                        {text("Reset", "รีเซ็ต", "重置", "Restablecer", "إعادة ضبط")} ({selectedLanguages.length})
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-1.5 max-h-36 overflow-y-auto pr-1">
                    {availableLanguages.map((lang) => {
                      const isChecked = selectedLanguages.includes(lang);
                      return (
                        <button
                          type="button"
                          key={lang}
                          onClick={() => toggleLanguageFilter(lang)}
                          className={`flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-xs font-semibold cursor-pointer transition-colors text-left ${
                            isChecked
                              ? "border-[#087f80] bg-[#edf7f5] text-[#087f80]"
                              : "border-[#e0eaee] bg-[#f9fbfb] text-[#244253] hover:bg-white"
                          }`}
                        >
                          <span
                            className={`flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded border ${
                              isChecked
                                ? "border-[#087f80] bg-[#087f80] text-white"
                                : "border-[#b8cbd2] bg-white"
                            }`}
                          >
                            {isChecked && <CheckIcon className="h-2.5 w-2.5 stroke-[3]" />}
                          </span>
                          <span className="truncate">{localizeLanguageReference(lang, locale)}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Section 3: Specialties / Categories */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-[11px] font-bold text-[#557180] flex items-center gap-1">
                      <BriefcaseIcon className="h-3.5 w-3.5 text-[#087f80]" />
                      {text("Specialty Categories", "หมวดหมู่ความเชี่ยวชาญ", "专业类别", "Categorías de especialidad", "فئات التخصص")}
                    </label>
                    {selectedCategories.length > 0 && (
                      <button
                        type="button"
                        onClick={resetCategories}
                        className="text-[10px] text-[#087f80] hover:underline cursor-pointer font-bold"
                      >
                        {text("Reset", "รีเซ็ต", "重置", "Restablecer", "إعادة ضبط")} ({selectedCategories.length})
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-36 overflow-y-auto pr-1">
                    {availableCategories.map((cat) => {
                      const isChecked = selectedCategories.includes(cat);
                      return (
                        <button
                          type="button"
                          key={cat}
                          onClick={() => toggleCategoryFilter(cat)}
                          className={`flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-xs font-semibold cursor-pointer transition-colors text-left ${
                            isChecked
                              ? "border-[#087f80] bg-[#edf7f5] text-[#087f80]"
                              : "border-[#e0eaee] bg-[#f9fbfb] text-[#244253] hover:bg-white"
                          }`}
                        >
                          <span
                            className={`flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded border ${
                              isChecked
                                ? "border-[#087f80] bg-[#087f80] text-white"
                                : "border-[#b8cbd2] bg-white"
                            }`}
                          >
                            {isChecked && <CheckIcon className="h-2.5 w-2.5 stroke-[3]" />}
                          </span>
                          <span className="truncate">{localizeCategoryReference(cat, locale)}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Users Table: Clean Flat Canvas with Hairline Grid */}
      <div className="border-y border-slate-200">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs text-slate-600">
            <thead className="border-b border-slate-200 bg-slate-50/75 font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="py-3.5 pl-3 pr-4 w-[24%]">{text("User & Contact", "ผู้ใช้และการติดต่อ", "用户与联系方式", "Usuario y contacto", "المستخدم والاتصال")}</th>
                <th className="px-3.5 py-3.5 w-[11%] text-center">{text("Role", "บทบาท", "角色", "Rol", "الدور")}</th>
                <th className="px-3.5 py-3.5 w-[13%]">{text("Primary Lang", "ภาษาหลัก", "主要语言", "Idioma principal", "اللغة الأساسية")}</th>
                <th className="px-3.5 py-3.5 w-[20%]">{text("Spoken Languages", "ภาษาที่สื่อสารได้", "使用语言", "Idiomas hablados", "اللغات المنطوقة")}</th>
                <th className="px-3.5 py-3.5 w-[10%] text-center">{text("Rating", "คะแนน", "评分", "Valoración", "التقييم")}</th>
                <th className="px-3.5 py-3.5 w-[11%] text-center">{text("Status", "สถานะ", "状态", "Estado", "الحالة")}</th>
                <th className="py-3.5 pl-3 pr-3 text-right w-[11%]">{text("Last Active", "ใช้งานล่าสุด", "最近活跃", "Última actividad", "آخر نشاط")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <UserCircleIcon className="mx-auto h-10 w-10 text-slate-300" />
                    <p className="mt-2 text-sm font-semibold">{text("No users matching the filters", "ไม่พบผู้ใช้ตามตัวกรอง", "没有符合筛选条件的用户", "No hay usuarios que coincidan con los filtros", "لا يوجد مستخدمون يطابقون عوامل التصفية")}</p>
                    <p className="text-xs text-slate-400">{text("Try adjusting your search criteria or resetting filters.", "ลองปรับคำค้นหาหรือล้างตัวกรอง", "请调整搜索条件或重置筛选", "Ajusta la búsqueda o restablece los filtros.", "جرّب تعديل البحث أو إعادة ضبط عوامل التصفية.")}</p>
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((u) => (
                  <tr
                    key={u.id}
                    onClick={() => onSelectUser(u)}
                    className={`cursor-pointer transition-colors hover:bg-teal-50/40 ${
                      u.isLocked ? "bg-red-50/25 hover:bg-red-50/40" : ""
                    }`}
                  >
                    {/* User & Contact */}
                    <td className="py-3.5 pl-3 pr-4">
                      <div className="font-bold text-[#092f45]">{u.name}</div>
                      <div className="text-[11px] text-slate-500 truncate">{u.email}</div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        ID: {u.id} • {u.phone}
                      </div>
                    </td>

                    {/* Role Badge */}
                    <td className="px-3.5 py-3.5 text-center">
                      <span
                        className={`inline-flex items-center justify-center min-w-[78px] rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                          u.role === "Admin"
                            ? "bg-purple-100 text-purple-700 border border-purple-200/60"
                            : u.role === "Manager"
                            ? "bg-blue-100 text-blue-700 border border-blue-200/60"
                            : u.role === "Interpreter"
                            ? "bg-teal-100 text-[#087f80] border border-teal-200/60"
                            : "bg-slate-100 text-slate-600 border border-slate-200/60"
                        }`}
                      >
                        {roleLabel(u.role)}
                      </span>
                    </td>

                    {/* Primary Language */}
                    <td className="px-3.5 py-3.5 font-semibold text-[#092f45]">
                      <span className="inline-flex items-center gap-1">
                        {u.primaryLanguage && u.primaryLanguage !== "Not recorded" ? localizeLanguageReference(u.primaryLanguage, locale) : localizeUnspecified(u.primaryLanguage, locale)}
                      </span>
                    </td>

                    {/* Spoken Languages */}
                    <td className="px-3.5 py-3.5">
                      <div className="flex flex-wrap gap-1">
                        {u.spokenLanguages?.map((lang) => (
                          <span
                            key={lang}
                            className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600 border border-slate-200"
                          >
                            {localizeLanguageReference(lang, locale)}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Rating / Review Stats */}
                    <td className="px-3.5 py-3.5 text-center">
                      {typeof u.interpreterStats?.rating === "number" ? (
                        <div className="inline-flex items-center gap-1 text-amber-600 font-bold">
                          <StarIcon className="h-3.5 w-3.5 fill-amber-400 text-amber-500" />
                          <span>{u.interpreterStats.rating.toFixed(1)}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-[10px]">{text("Not recorded", "ไม่มีข้อมูล", "未记录", "No registrado", "غير مسجل")}</span>
                      )}
                    </td>

                    {/* Account Status */}
                    <td className="px-3.5 py-3.5 text-center">
                      <div className="inline-flex flex-col items-center gap-1">
                        <span
                          className={`inline-flex max-w-[8rem] items-center justify-center gap-1 text-center text-[10px] font-bold leading-tight ${
                            u.restrictionType === "hard" || u.accountStatus === "Banned"
                              ? "text-red-700"
                              : u.isLocked
                              ? "text-amber-800"
                              : "text-emerald-700"
                          }`}
                        >
                          {u.restrictionType === "hard" || u.accountStatus === "Banned" ? (
                            <>
                              <NoSymbolIcon className="h-3 w-3" />
                              <span>{text("Legacy Restricted", "จำกัดแบบเดิม", "旧限制", "Restricción heredada", "مقيّدة سابقًا")}</span>
                            </>
                          ) : u.isLocked ? (
                            <>
                              <LockClosedIcon className="h-3 w-3" />
                              <span>{text("Soft Suspended", "ระงับชั่วคราว", "暂时停用", "Suspendida temporalmente", "موقوفة مؤقتًا")}</span>
                            </>
                          ) : (
                            <>
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                              <span>{text("Active", "ใช้งานอยู่", "活跃", "Activa", "نشط")}</span>
                            </>
                          )}
                        </span>
                        {u.isLocked && u.hasPendingAppeal && (
                          <span
                             className="inline-flex items-center gap-1 text-[9px] font-bold text-amber-800 animate-pulse"
                            title={`Appeal submitted on ${u.appealSubmittedAt || "recently"}: ${u.appealReason || ""}`}
                          >
                            <ChatBubbleLeftEllipsisIcon className="h-2.5 w-2.5 text-amber-600" />
                            <span>{text("Appeal Pending", "รอคำอุทธรณ์", "待申诉", "Apelación pendiente", "استئناف معلق")}</span>
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Last Active */}
                    <td className="py-3.5 pl-3 pr-3 text-right text-slate-500 text-[11px] font-medium whitespace-nowrap">
                      {formatLastActive(u.lastActive)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <TablePagination
          totalItems={users.length}
          currentPage={validCurrentPage}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          itemName={text("users", "ผู้ใช้", "用户", "usuarios", "مستخدمين")}
          locale={locale}
        />
      </div>
    </div>
  );
}
