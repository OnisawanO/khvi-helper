"use client";

import { useState } from "react";
import {
  ExclamationTriangleIcon,
  NoSymbolIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { AdminUserRecord } from "../types";

type AccountActionDialogProps = {
  isOpen: boolean;
  user: AdminUserRecord | null;
  onClose: () => void;
  onConfirmAccountDeletion: (userId: string, reason: string) => Promise<boolean>;
};

export function AccountActionDialog({
  isOpen,
  user,
  onClose,
  onConfirmAccountDeletion,
}: AccountActionDialogProps) {
  const [reason, setReason] = useState("");
  const [typedConfirmation, setTypedConfirmation] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !user) return null;

  const isLegacyRestricted = user.accountStatus === "Banned" || user.lockReason?.includes("[PERMANENT BAN]");
  const isLocked = user.isLocked;

  const handleAction = async () => {
    setErrorMsg("");

    if (!reason.trim()) {
      setErrorMsg("Please provide a deletion reason for the audit log.");
      return;
    }

    const expectedKeyword = user.name.trim();
    if (typedConfirmation.trim() !== expectedKeyword && typedConfirmation.trim() !== "CONFIRM") {
      setErrorMsg(`For high-risk confirmation, type "${expectedKeyword}" or "CONFIRM" before continuing.`);
      return;
    }

    setIsSubmitting(true);
    try {
      const success = await onConfirmAccountDeletion(user.id, reason.trim());
      if (success) onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-[#d6e0e4] bg-white shadow-[0_24px_56px_rgba(15,38,54,0.3)]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-100 text-red-600">
              <NoSymbolIcon className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-[#092f45]">Permanent Account Deletion</h3>
              <p className="text-xs text-slate-500">Irreversible account and data removal (FR-20)</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            aria-label="Close permanent account deletion dialog"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4 p-6">
          {/* Target Profile Card */}
          <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/80 p-3.5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#092f45] text-xs font-black text-white">
                {user.name.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <p className="text-xs font-extrabold text-[#092f45]">{user.name}</p>
                <p className="text-[11px] text-slate-500">
                  {user.email} <span aria-hidden="true">•</span> {user.role}
                </p>
              </div>
            </div>
            <span
              className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                isLegacyRestricted
                  ? "bg-red-100 text-red-700"
                  : isLocked
                    ? "bg-amber-100 text-amber-700"
                    : "bg-emerald-100 text-emerald-700"
              }`}
            >
              {isLegacyRestricted ? "Legacy Restricted" : isLocked ? "Suspended" : "Active"}
            </span>
          </div>

          {/* Reason Input */}
          <div>
            <label className="mb-1 block text-xs font-extrabold text-[#092f45]">
              Deletion Reason <span className="text-red-500">*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Explain why this account and its stored data must be permanently deleted..."
              rows={3}
              className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-[#092f45] placeholder-slate-400 focus:border-[#087f80] focus:outline-none"
            />
          </div>

          {/* Permanent Deletion Strict Confirmation Step */}
          <div className="space-y-2 rounded-xl border border-red-200 bg-red-50/70 p-4">
            <div className="flex items-center gap-2 text-red-700">
              <ExclamationTriangleIcon className="h-5 w-5 shrink-0 text-red-600" />
              <p className="text-xs font-black">Strict Safety Confirmation Required</p>
            </div>
            <p className="text-[11px] leading-relaxed text-red-600/90">
              This permanently deletes the Supabase Auth account, profile, interpreter certificates, and account data. System audit history is retained without the deleted profile reference. This action cannot be undone. Type <strong>{user.name}</strong> or <strong>CONFIRM</strong> to authorize:
            </p>
            <input
              type="text"
              value={typedConfirmation}
              onChange={(e) => setTypedConfirmation(e.target.value)}
              placeholder={`Type "${user.name}" or "CONFIRM"`}
              className="w-full rounded-lg border border-red-300 bg-white px-3 py-2 text-xs font-bold text-red-900 focus:border-red-600 focus:outline-none"
            />
          </div>

          {/* Error Message Display */}
          {errorMsg && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-2.5 text-xs font-bold text-red-700">
              {errorMsg}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2 border-t border-slate-100 bg-slate-50/80 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => void handleAction()}
            disabled={
              isSubmitting ||
              (typedConfirmation.trim() !== user.name.trim() && typedConfirmation.trim() !== "CONFIRM")
            }
            className="cursor-pointer rounded-xl bg-red-600 px-5 py-2 text-xs font-extrabold text-white shadow-xs shadow-red-600/20 transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isSubmitting ? "Deleting Account..." : "Confirm Permanent Deletion"}
          </button>
        </div>
      </div>
    </div>
  );
}
