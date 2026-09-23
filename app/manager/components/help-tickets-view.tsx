"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import {
  AdjustmentsHorizontalIcon,
  ChatBubbleLeftRightIcon,
  CheckIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ExclamationTriangleIcon,
  MagnifyingGlassIcon,
  PaperAirplaneIcon,
  BellAlertIcon,
  TagIcon,
} from "@heroicons/react/24/outline";
import { HelpTicket } from "../types";

interface HelpTicketsViewProps {
  tickets: HelpTicket[];
  activeReplyingTicketId: string | null;
  setActiveReplyingTicketId: (id: string | null) => void;
  ticketReplyText: string;
  setTicketReplyText: (text: string) => void;
  onSendReply: (ticketId: string) => void;
}

export function HelpTicketsView({
  tickets,
  activeReplyingTicketId,
  setActiveReplyingTicketId,
  ticketReplyText,
  setTicketReplyText,
  onSendReply,
}: HelpTicketsViewProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUrgencies, setSelectedUrgencies] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [filterMenuOpen, setFilterMenuOpen] = useState(false);
  const filterMenuRef = useRef<HTMLDivElement>(null);

  // Close filter popover on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        filterMenuRef.current &&
        !filterMenuRef.current.contains(event.target as Node)
      ) {
        setFilterMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleUrgency = (urg: string) => {
    setSelectedUrgencies((prev) =>
      prev.includes(urg) ? prev.filter((u) => u !== urg) : [...prev, urg]
    );
  };

  const toggleCategory = (cat: string) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const toggleStatus = (st: string) => {
    setSelectedStatuses((prev) =>
      prev.includes(st) ? prev.filter((s) => s !== st) : [...prev, st]
    );
  };

  const resetAllFilters = () => {
    setSelectedUrgencies([]);
    setSelectedCategories([]);
    setSelectedStatuses([]);
  };

  const activeFilterCount =
    selectedUrgencies.length +
    selectedCategories.length +
    selectedStatuses.length;

  // Filtered tickets
  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      // 1. Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = t.title.toLowerCase().includes(q);
        const matchDetail = t.detail.toLowerCase().includes(q);
        const matchReq = t.requesterName.toLowerCase().includes(q);
        const matchMission = t.missionId.toLowerCase().includes(q);
        const matchCat = t.category.toLowerCase().includes(q);
        const matchId = t.id.toLowerCase().includes(q);
        if (
          !matchTitle &&
          !matchDetail &&
          !matchReq &&
          !matchMission &&
          !matchCat &&
          !matchId
        ) {
          return false;
        }
      }

      // 2. Urgency filter
      if (
        selectedUrgencies.length > 0 &&
        !selectedUrgencies.includes(t.urgency)
      ) {
        return false;
      }

      // 3. Category filter
      if (
        selectedCategories.length > 0 &&
        !selectedCategories.includes(t.category)
      ) {
        return false;
      }

      // 4. Status filter
      if (
        selectedStatuses.length > 0 &&
        !selectedStatuses.includes(t.status)
      ) {
        return false;
      }

      return true;
    });
  }, [
    tickets,
    searchQuery,
    selectedUrgencies,
    selectedCategories,
    selectedStatuses,
  ]);

  const totalPages = Math.max(1, Math.ceil(filteredTickets.length / pageSize));
  const validCurrentPage = Math.min(currentPage, totalPages);

  const paginatedTickets = useMemo(() => {
    const startIndex = (validCurrentPage - 1) * pageSize;
    return filteredTickets.slice(startIndex, startIndex + pageSize);
  }, [filteredTickets, validCurrentPage, pageSize]);

  const openCount = tickets.filter(
    (t) => t.status === "Open" || t.status === "In Progress"
  ).length;

  return (
    <div className="space-y-4">
      {/* View Header with Search & Filter */}
      <div className="rounded-2xl border border-[#d8e3e7] bg-white p-5 shadow-xs">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2.5">
            <h1 className="text-lg font-extrabold text-[#112d3f] sm:text-xl">
              Mission Assistance & Support Tickets
            </h1>
            <span className="rounded-full bg-[#edf7f5] px-2.5 py-0.5 text-xs font-bold text-[#087f80]">
              Active: {openCount}
            </span>
          </div>

        {/* Search & Filter Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search Input */}
          <div className="relative">
            <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#7e97a3]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search tickets, mission, user..."
              className="w-48 sm:w-60 rounded-xl border border-[#ccdbe1] bg-[#f9fbfb] py-1.5 pl-8 pr-3 text-xs text-[#143141] placeholder-[#7d95a2] focus:border-[#087f80] focus:bg-white focus:outline-none shadow-xs"
            />
          </div>

          {/* Filter Popover Button */}
          <div className="relative" ref={filterMenuRef}>
            <button
              type="button"
              onClick={() => setFilterMenuOpen(!filterMenuOpen)}
              className={`inline-flex items-center gap-2 rounded-xl border px-3 py-1.5 text-xs font-bold transition-colors cursor-pointer shadow-xs ${
                activeFilterCount > 0
                  ? "border-[#087f80] bg-[#edf7f5] text-[#087f80]"
                  : "border-[#ccdbe1] bg-white text-[#254454] hover:bg-[#f7fafb]"
              }`}
            >
              <AdjustmentsHorizontalIcon className="h-4 w-4" />
              <span>Filter</span>
              {activeFilterCount > 0 && (
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#087f80] text-[9px] font-black text-white">
                  {activeFilterCount}
                </span>
              )}
              <ChevronDownIcon
                className={`h-3 w-3 transition-transform ${
                  filterMenuOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Filter Popover Dropdown */}
            {filterMenuOpen && (
              <div className="absolute right-0 top-full mt-2 z-40 w-80 sm:w-88 rounded-2xl border border-[#d3dfe3] bg-white p-4 shadow-[0_16px_40px_rgba(9,47,69,0.14)] space-y-4 animate-in fade-in">
                <div className="flex items-center justify-between border-b border-[#edf2f5] pb-2.5">
                  <span className="text-xs font-black text-[#112d3f] flex items-center gap-1.5">
                    <AdjustmentsHorizontalIcon className="h-4 w-4 text-[#087f80]" />
                    Filter Help Tickets
                  </span>
                  {activeFilterCount > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        resetAllFilters();
                        setCurrentPage(1);
                      }}
                      className="text-[11px] font-bold text-[#f04f3e] hover:underline cursor-pointer"
                    >
                      Clear all ({activeFilterCount})
                    </button>
                  )}
                </div>

                {/* 1. Urgency */}
                <div>
                  <label className="text-[11px] font-bold text-[#557180] flex items-center gap-1 mb-2">
                    <BellAlertIcon className="h-3.5 w-3.5 text-[#087f80]" />
                    Urgency Level
                  </label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {[
                      { id: "urgent", label: "Urgent Escalation" },
                      { id: "normal", label: "Normal Inquiry" },
                    ].map((urg) => {
                      const isChecked = selectedUrgencies.includes(urg.id);
                      return (
                        <label
                          key={urg.id}
                          onClick={() => {
                            toggleUrgency(urg.id);
                            setCurrentPage(1);
                          }}
                          className={`flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-xs font-semibold cursor-pointer transition-colors ${
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
                          <span className="truncate">{urg.label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Category */}
                <div>
                  <label className="text-[11px] font-bold text-[#557180] flex items-center gap-1 mb-2">
                    <TagIcon className="h-3.5 w-3.5 text-[#087f80]" />
                    Issue Category
                  </label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {["Safety", "Communication", "No-Show", "Other"].map((cat) => {
                      const isChecked = selectedCategories.includes(cat);
                      return (
                        <label
                          key={cat}
                          onClick={() => {
                            toggleCategory(cat);
                            setCurrentPage(1);
                          }}
                          className={`flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-xs font-semibold cursor-pointer transition-colors ${
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
                          <span className="truncate">{cat}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Status */}
                <div>
                  <label className="text-[11px] font-bold text-[#557180] flex items-center gap-1 mb-2">
                    <TagIcon className="h-3.5 w-3.5 text-[#087f80]" />
                    Ticket Status
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {["Open", "In Progress", "Resolved"].map((st) => {
                      const isChecked = selectedStatuses.includes(st);
                      return (
                        <label
                          key={st}
                          onClick={() => {
                            toggleStatus(st);
                            setCurrentPage(1);
                          }}
                          className={`flex items-center gap-2 rounded-lg border px-2 py-1.5 text-xs font-semibold cursor-pointer transition-colors ${
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
                          <span className="truncate">{st}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Ticket List Container */}
      <div className="min-h-[480px] rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <div className="space-y-3">
        {paginatedTickets.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            {tickets.length === 0
              ? "No live help tickets found."
              : "No tickets matching your search or filter criteria."}
          </div>
        ) : (
          paginatedTickets.map((ticket) => (
            <div
              key={ticket.id}
              className="rounded-xl border border-[#dbe6ec] p-4 transition-colors hover:border-[#087f80] bg-white"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg mt-0.5 ${
                      ticket.urgency === "urgent"
                        ? "bg-[#f04f3e] text-white"
                        : "bg-[#edf4f7] text-[#092f45]"
                    }`}
                  >
                    <ExclamationTriangleIcon className="h-4 w-4" />
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-extrabold text-sm text-[#143242]">
                        {ticket.title}
                      </h3>
                      <span className="rounded-md bg-[#edf4f7] px-2 py-0.5 text-[10px] font-bold text-[#092f45]">
                        {ticket.category}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#6b8491] mt-0.5">
                      #{ticket.id} · Mission:{" "}
                      <strong className="text-[#087f80]">
                        {ticket.missionId}
                      </strong>{" "}
                      · From {ticket.requesterName} ({ticket.requesterRole}) ·{" "}
                      {ticket.createdAt}
                    </p>
                  </div>
                </div>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[11px] font-extrabold ${
                    ticket.status === "Resolved"
                      ? "bg-[#e8f5f1] text-[#087557]"
                      : ticket.status === "In Progress"
                      ? "bg-[#e8f2f8] text-[#1a5b82]"
                      : "bg-[#fff1ef] text-[#f04f3e]"
                  }`}
                >
                  {ticket.status}
                </span>
              </div>

              {/* Detail Content */}
              <p className="mt-3 text-xs text-[#355261] bg-[#f8fbfc] p-3 rounded-lg border border-[#e4ecf0] leading-relaxed">
                {ticket.detail}
              </p>

              {/* Previous response if resolved */}
              {ticket.response && (
                <div className="mt-2.5 rounded-lg border border-[#cbe4dc] bg-[#f2f9f6] p-3 text-xs text-[#144f3d]">
                  <strong className="font-extrabold text-[#087557]">
                    Manager Response (Recorded):
                  </strong>
                  <p className="mt-1">{ticket.response}</p>
                </div>
              )}

              {/* Reply Input Form */}
              {activeReplyingTicketId === ticket.id ? (
                <div className="mt-3 space-y-2 border-t border-[#edf2f5] pt-3">
                  <textarea
                    value={ticketReplyText}
                    onChange={(e) => setTicketReplyText(e.target.value)}
                    placeholder="Type resolution dispatch or reply note for the requester..."
                    rows={2}
                    className="w-full rounded-xl border border-[#cddce2] p-2.5 text-xs text-[#143242] focus:border-[#087f80] focus:outline-none"
                  />
                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveReplyingTicketId(null);
                        setTicketReplyText("");
                      }}
                      className="rounded-lg px-3 py-1.5 text-xs font-semibold text-[#66818f] hover:bg-[#edf2f5] cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => onSendReply(ticket.id)}
                      disabled={!ticketReplyText.trim()}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-[#087f80] px-4 py-1.5 text-xs font-bold text-white hover:bg-[#066869] disabled:opacity-50 cursor-pointer"
                    >
                      <PaperAirplaneIcon className="h-3.5 w-3.5" />
                      Send & Resolve Ticket
                    </button>
                  </div>
                </div>
              ) : (
                ticket.status !== "Resolved" && (
                  <div className="mt-3 flex justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveReplyingTicketId(ticket.id);
                        setTicketReplyText("");
                      }}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-[#cde0e7] bg-white px-3.5 py-1.5 text-xs font-bold text-[#087f80] hover:bg-[#f0f6f8] cursor-pointer"
                    >
                      <ChatBubbleLeftRightIcon className="h-3.5 w-3.5" />
                      Respond to Requester
                    </button>
                  </div>
                )
              )}
            </div>
          ))
        )}
      </div>

      {/* Pagination Footer */}
      {filteredTickets.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-200 pt-4 text-xs text-slate-500 select-none">
          <div>
            Showing{" "}
            <strong className="text-[#092f45]">
              {(validCurrentPage - 1) * pageSize + 1}
            </strong>{" "}
            to{" "}
            <strong className="text-[#092f45]">
              {Math.min(validCurrentPage * pageSize, filteredTickets.length)}
            </strong>{" "}
            of <strong className="text-[#092f45]">{filteredTickets.length}</strong> help requests
            {filteredTickets.length !== tickets.length && (
              <span className="text-[#647f8d] ml-1">
                (filtered from {tickets.length})
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={validCurrentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-[#092f45] shadow-2xs hover:bg-slate-50 hover:border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
              title="Previous page"
            >
              <ChevronLeftIcon className="h-3.5 w-3.5" />
              <span>Previous</span>
            </button>

            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  type="button"
                  onClick={() => setCurrentPage(pageNum)}
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

            <button
              type="button"
              disabled={validCurrentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-[#092f45] shadow-2xs hover:bg-slate-50 hover:border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
              title="Next page"
            >
              <span>Next</span>
              <ChevronRightIcon className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
      </div>
    </div>
    </div>
  );
}
