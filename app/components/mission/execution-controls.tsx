"use client";

import { useState } from "react";
import { PlayCircleIcon, XCircleIcon } from "@heroicons/react/24/outline";
import type { BookingStatus } from "@/types/database.types";

export type ExecutionControlsCopy = {
  startAction: string;
  endAction: string;
  cancelAction: string;
  cancelPromptTitle: string;
  cancelPromptPlaceholder: string;
  cancelConfirm: string;
  cancelDismiss: string;
  startedAtLabel: string;
};

export function ExecutionControls({
  copy,
  status,
  startedAt,
  onStart,
  onEnd,
  onCancel,
}: {
  copy: ExecutionControlsCopy;
  status: BookingStatus;
  startedAt: string | null;
  onStart: () => void;
  onEnd: () => void;
  onCancel: (reason: string) => void;
}) {
  const [showCancelPrompt, setShowCancelPrompt] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  const canStart = status === "Claimed";
  const canEnd = status === "InProgress";
  const canCancel = status === "Claimed" || status === "InProgress";

  if (!canStart && !canEnd && !canCancel) {
    return null;
  }

  return (
    <section className="rounded-[var(--khvi-radius-lg)] border border-[#e1e8ea] bg-[var(--khvi-surface)] p-6 shadow-[var(--khvi-shadow-soft)] sm:p-8">
      {startedAt ? (
        <p className="mb-4 text-sm text-[#66777d]">
          {copy.startedAtLabel}: {new Date(startedAt).toLocaleString()}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-3">
        {canStart ? (
          <button
            type="button"
            onClick={onStart}
            className="inline-flex items-center gap-2 rounded-lg bg-[var(--khvi-navy)] px-5 py-3 text-sm font-extrabold text-white transition hover:bg-[#0c3a55] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--khvi-sun)]"
          >
            <PlayCircleIcon aria-hidden="true" className="h-5 w-5" />
            {copy.startAction}
          </button>
        ) : null}

        {canEnd ? (
          <button
            type="button"
            onClick={onEnd}
            className="inline-flex items-center gap-2 rounded-lg bg-[var(--khvi-teal)] px-5 py-3 text-sm font-extrabold text-white transition hover:bg-[#3f747c] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--khvi-sun)]"
          >
            {copy.endAction}
          </button>
        ) : null}

        {canCancel ? (
          <button
            type="button"
            onClick={() => setShowCancelPrompt(true)}
            className="inline-flex items-center gap-2 rounded-lg border border-[#f04f3e] px-5 py-3 text-sm font-extrabold text-[#f04f3e] transition hover:bg-[#fbe9e7] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--khvi-sun)]"
          >
            <XCircleIcon aria-hidden="true" className="h-5 w-5" />
            {copy.cancelAction}
          </button>
        ) : null}
      </div>

      {showCancelPrompt ? (
        <div className="mt-5 rounded-[var(--khvi-radius-md)] border border-[#f0a35f] bg-[#fdf1e2] p-4">
          <p className="text-sm font-extrabold text-[#8a5416]">{copy.cancelPromptTitle}</p>
          <textarea
            value={cancelReason}
            onChange={(event) => setCancelReason(event.target.value)}
            placeholder={copy.cancelPromptPlaceholder}
            rows={3}
            className="mt-3 w-full rounded-lg border border-[#e6c491] bg-white p-3 text-sm text-[var(--khvi-ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--khvi-sun)]"
          />
          <div className="mt-3 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => {
                onCancel(cancelReason.trim());
                setShowCancelPrompt(false);
                setCancelReason("");
              }}
              disabled={cancelReason.trim().length === 0}
              className="rounded-lg bg-[#f04f3e] px-4 py-2 text-sm font-extrabold text-white transition hover:bg-[#d8402f] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {copy.cancelConfirm}
            </button>
            <button
              type="button"
              onClick={() => setShowCancelPrompt(false)}
              className="rounded-lg px-4 py-2 text-sm font-extrabold text-[#8a5416] transition hover:bg-[#f7e3c4]"
            >
              {copy.cancelDismiss}
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
