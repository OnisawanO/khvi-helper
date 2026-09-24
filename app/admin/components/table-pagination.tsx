"use client";

import {
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import type { Locale } from "@/app/components/site-header";

interface TablePaginationProps {
  totalItems: number;
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  itemName?: string;
  locale?: Locale;
}

export function TablePagination({
  totalItems,
  currentPage,
  pageSize,
  onPageChange,
  itemName = "records",
  locale = "en",
}: TablePaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const validCurrentPage = Math.min(Math.max(1, currentPage), totalPages);

  if (totalItems === 0) {
    return null;
  }

  const startRecord = (validCurrentPage - 1) * pageSize + 1;
  const endRecord = Math.min(validCurrentPage * pageSize, totalItems);
  const label = locale === "th" ? { showing: "แสดง", to: "ถึง", of: "จาก", previous: "ก่อนหน้า", next: "ถัดไป" } : locale === "zh" ? { showing: "显示", to: "至", of: "共", previous: "上一页", next: "下一页" } : locale === "es" ? { showing: "Mostrando", to: "a", of: "de", previous: "Anterior", next: "Siguiente" } : locale === "ar" ? { showing: "عرض", to: "إلى", of: "من", previous: "السابق", next: "التالي" } : { showing: "Showing", to: "to", of: "of", previous: "Previous", next: "Next" };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-200 bg-slate-50/70 px-5 py-3.5 text-xs text-slate-500 select-none">
      <div>
        {label.showing}{" "}
        <strong className="text-[#092f45]">{startRecord}</strong> {label.to}{" "}
        <strong className="text-[#092f45]">{endRecord}</strong> {label.of}{" "}
        <strong className="text-[#092f45]">{totalItems}</strong> {itemName}
      </div>

      <div className="flex items-center gap-1.5">
        {/* Previous Page Button */}
        <button
          type="button"
          disabled={validCurrentPage <= 1}
          onClick={() => onPageChange(Math.max(1, validCurrentPage - 1))}
          className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-[#092f45] shadow-2xs hover:bg-slate-50 hover:border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
          title={label.previous}
        >
          <ChevronLeftIcon className="h-3.5 w-3.5" />
          <span>{label.previous}</span>
        </button>

        {/* Page Indicator Pills */}
        <div className="flex items-center gap-1">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
            <button
              key={pageNum}
              type="button"
              onClick={() => onPageChange(pageNum)}
              className={`flex h-8 w-8 items-center justify-center rounded-xl text-xs font-bold transition-all cursor-pointer ${
                validCurrentPage === pageNum
                  ? "bg-[#087f80] text-white shadow-xs"
                  : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:border-slate-300"
              }`}
            >
              {pageNum}
            </button>
          ))}
        </div>

        {/* Next Page Button */}
        <button
          type="button"
          disabled={validCurrentPage >= totalPages}
          onClick={() => onPageChange(Math.min(totalPages, validCurrentPage + 1))}
          className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-[#092f45] shadow-2xs hover:bg-slate-50 hover:border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
          title={label.next}
        >
          <span>{label.next}</span>
          <ChevronRightIcon className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

