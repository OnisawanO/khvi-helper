"use client";

import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  NoSymbolIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";
import type { Locale } from "@/app/components/site-header";

export type ReportStatusFilter = "All" | "Pending" | "Resolved" | "Dismissed";

interface ReportsKpiCardsProps {
  totalReportsCount: number;
  pendingReportsCount: number;
  resolvedReportsCount: number;
  dismissedReportsCount: number;
  selectedStatusFilter: ReportStatusFilter;
  onSelectStatusFilter: (status: ReportStatusFilter) => void;
  locale?: Locale;
}

export function ReportsKpiCards({
  totalReportsCount,
  pendingReportsCount,
  resolvedReportsCount,
  dismissedReportsCount,
  selectedStatusFilter,
  onSelectStatusFilter,
  locale = "en",
}: ReportsKpiCardsProps) {
  const text = (en: string, th: string, zh: string, es: string, ar: string) => locale === "th" ? th : locale === "zh" ? zh : locale === "es" ? es : locale === "ar" ? ar : en;
  const cards = [
    {
      filter: "All" as const,
      label: text("Total System Reports", "รายงานระบบทั้งหมด", "系统报告总数", "Total de informes del sistema", "إجمالي تقارير النظام"),
      value: totalReportsCount,
      suffix: text("cases", "รายการ", "条", "casos", "حالات"),
      footer: text("All logged platform issues", "ปัญหาแพลตฟอร์มที่บันทึกทั้งหมด", "所有已记录的平台问题", "Todos los problemas registrados", "جميع مشكلات المنصة المسجلة"),
      icon: ShieldCheckIcon,
      tone: "blue",
    },
    {
      filter: "Pending" as const,
      label: text("Pending Review", "รอตรวจสอบ", "待审核", "Pendientes de revisión", "قيد المراجعة"),
      value: pendingReportsCount,
      suffix: text("awaiting", "รอดำเนินการ", "待处理", "pendientes", "بانتظار الإجراء"),
      footer: pendingReportsCount > 0 ? text("Action required", "ต้องดำเนินการ", "需要处理", "Requiere acción", "يلزم إجراء") : text("All clear", "ไม่มีรายการค้าง", "一切正常", "Todo en orden", "لا توجد إجراءات معلقة"),
      icon: ExclamationCircleIcon,
      tone: "amber",
    },
    {
      filter: "Resolved" as const,
      label: text("Resolved Issues", "ปัญหาที่แก้ไขแล้ว", "已解决问题", "Problemas resueltos", "المشكلات المحلولة"),
      value: resolvedReportsCount,
      suffix: text("resolved", "แก้ไขแล้ว", "已解决", "resueltos", "محلولة"),
      footer: text("Verified platform fixes", "การแก้ไขแพลตฟอร์มที่ยืนยันแล้ว", "已验证的平台修复", "Correcciones verificadas", "إصلاحات المنصة المؤكدة"),
      icon: CheckCircleIcon,
      tone: "emerald",
    },
    {
      filter: "Dismissed" as const,
      label: text("Dismissed Reports", "รายงานที่ยกเลิก", "已驳回报告", "Informes descartados", "التقارير المستبعدة"),
      value: dismissedReportsCount,
      suffix: text("dismissed", "ยกเลิกแล้ว", "已驳回", "descartados", "مستبعدة"),
      footer: text("Closed without a fix", "ปิดโดยไม่แก้ไข", "未修复即关闭", "Cerrados sin corrección", "أُغلقت دون إصلاح"),
      icon: NoSymbolIcon,
      tone: "slate",
    },
  ];

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-1 shadow-2xs">
      <div className="grid grid-cols-2 gap-1 lg:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;
          const selected = selectedStatusFilter === card.filter;
          const toneClasses = {
            blue: selected ? "border-blue-200 ring-blue-500/20 text-blue-700" : "text-blue-600",
            amber: selected ? "border-amber-200 ring-amber-500/20 text-amber-700" : "text-amber-600",
            emerald: selected ? "border-emerald-200 ring-emerald-500/20 text-emerald-700" : "text-emerald-600",
            slate: selected ? "border-slate-300 ring-slate-500/20 text-slate-700" : "text-slate-600",
          }[card.tone] ?? "text-slate-600";

          return (
            <button
              key={card.filter}
              type="button"
              onClick={() => onSelectStatusFilter(card.filter)}
              className={`group rounded-lg border bg-white p-3.5 text-left transition-all hover:bg-white sm:p-4 ${
                selected ? `shadow-xs ring-1 ${toneClasses}` : "border-transparent hover:border-slate-200"
              }`}
            >
              <div className="flex items-center justify-between gap-1">
                <p className="truncate text-[10px] font-bold uppercase tracking-wider text-slate-500 sm:text-xs">
                  {card.label}
                </p>
                <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-slate-50 sm:h-7 sm:w-7 ${toneClasses.split(" ").at(-1)}`}>
                  <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </span>
              </div>
              <div className="mt-1.5 flex items-baseline gap-2">
                <p className="text-xl font-black text-[#092f45] sm:text-2xl">{card.value}</p>
                <span className="text-[11px] font-semibold text-slate-400">{card.suffix}</span>
              </div>
              <div className="mt-2 flex items-center justify-between border-t border-slate-100 pt-1.5 text-[10px] text-slate-500 sm:text-xs">
                <span className="truncate text-slate-400">{card.footer}</span>
                <span className="ml-2 shrink-0 font-bold text-[#087f80] group-hover:underline">
                  {selected ? text("Active Filter", "ตัวกรองที่ใช้อยู่", "当前筛选", "Filtro activo", "التصفية النشطة") : text("Filter", "กรอง", "筛选", "Filtrar", "تصفية")}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
