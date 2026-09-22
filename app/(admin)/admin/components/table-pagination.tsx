"use client";

import {
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";

interface TablePaginationProps {
  totalItems: number;
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  itemName?: string;
}

export function TablePagination({
  totalItems,
  currentPage,
  pageSize,
  onPageChange,
  itemName = "records",
}: TablePaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const validCurrentPage = Math.min(Math.max(1, currentPage), totalPages);

  if (totalItems === 0) {
    return null;
  }

  const startRecord = (validCurrentPage - 1) * pageSize + 1;
  const endRecord = Math.min(validCurrentPage * pageSize, totalItems);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-200 bg-slate-50/70 px-5 py-3.5 text-xs text-slate-500 select-none">
      <div>
        Showing{" "}
        <strong className="text-[#092f45]">{startRecord}</strong> to{" "}
        <strong className="text-[#092f45]">{endRecord}</strong> of{" "}
        <strong className="text-[#092f45]">{totalItems}</strong> {itemName}
      </div>

      <div className="flex items-center gap-1.5">
        {/* Previous Page Button */}
        <button
          type="button"
          disabled={validCurrentPage <= 1}
          onClick={() => onPageChange(Math.max(1, validCurrentPage - 1))}
          className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-[#092f45] shadow-2xs hover:bg-slate-50 hover:border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
          title="Previous page"
        >
          <ChevronLeftIcon className="h-3.5 w-3.5" />
          <span>Previous</span>
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
          title="Next page"
        >
          <span>Next</span>
          <ChevronRightIcon className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

