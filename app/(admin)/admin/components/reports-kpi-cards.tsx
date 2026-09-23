"use client";

import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  NoSymbolIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";

export type ReportStatusFilter = "All" | "Pending" | "Resolved" | "Dismissed";

interface ReportsKpiCardsProps {
  totalReportsCount: number;
  pendingReportsCount: number;
  resolvedReportsCount: number;
  dismissedReportsCount: number;
  selectedStatusFilter: ReportStatusFilter;
  onSelectStatusFilter: (status: ReportStatusFilter) => void;
}

export function ReportsKpiCards({
  totalReportsCount,
  pendingReportsCount,
  resolvedReportsCount,
  dismissedReportsCount,
  selectedStatusFilter,
  onSelectStatusFilter,
}: ReportsKpiCardsProps) {
  const cards = [
    {
      filter: "All" as const,
      label: "Total System Reports",
      value: totalReportsCount,
      suffix: "cases",
      footer: "All logged platform issues",
      icon: ShieldCheckIcon,
      tone: "blue",
    },
    {
      filter: "Pending" as const,
      label: "Pending Review",
      value: pendingReportsCount,
      suffix: "awaiting",
      footer: pendingReportsCount > 0 ? "Action required" : "All clear",
      icon: ExclamationCircleIcon,
      tone: "amber",
    },
    {
      filter: "Resolved" as const,
      label: "Resolved Issues",
      value: resolvedReportsCount,
      suffix: "resolved",
      footer: "Verified platform fixes",
      icon: CheckCircleIcon,
      tone: "emerald",
    },
    {
      filter: "Dismissed" as const,
      label: "Dismissed Reports",
      value: dismissedReportsCount,
      suffix: "dismissed",
      footer: "Closed without a fix",
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
                  {selected ? "Active Filter" : "Filter"}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
