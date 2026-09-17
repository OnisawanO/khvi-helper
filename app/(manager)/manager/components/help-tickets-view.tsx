"use client";

import {
  ChatBubbleLeftRightIcon,
  ExclamationTriangleIcon,
  PaperAirplaneIcon,
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
  const openCount = tickets.filter(
    (t) => t.status === "Open" || t.status === "In Progress"
  ).length;

  return (
    <div className="min-h-[480px] rounded-2xl border border-[#d8e3e7] bg-white p-6 shadow-xs space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#edf2f4] pb-4">
        <div>
          <h2 className="text-base font-extrabold text-[#112d3f]">
            Live Mission Assistance & Support Requests (FR-51, FR-52)
          </h2>
          <p className="mt-1 text-xs text-[#637d8b]">
            Urgent assistance tickets filed by users or interpreters requiring active coordinator dispatch.
          </p>
        </div>
        <span className="rounded-full bg-[#edf7f5] px-3 py-1 text-xs font-bold text-[#087f80]">
          Active Escalations: {openCount}
        </span>
      </div>

      {/* Ticket List */}
      <div className="space-y-3">
        {tickets.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            No live help tickets found.
          </div>
        ) : (
          tickets.map((ticket) => (
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
    </div>
  );
}

