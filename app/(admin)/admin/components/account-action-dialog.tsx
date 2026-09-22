"use client";

import { useState } from "react";
import {
  ExclamationTriangleIcon,
  LockClosedIcon,
  NoSymbolIcon,
  ShieldCheckIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { AdminUserRecord } from "../types";

type AccountActionDialogProps = {
  isOpen: boolean;
  user: AdminUserRecord | null;
  onClose: () => void;
  onConfirmLock: (userId: string, reason: string) => void;
  onConfirmHardBan: (userId: string, reason: string) => void;
  onConfirmUnlock: (userId: string) => void;
};

export function AccountActionDialog({
  isOpen,
  user,
  onClose,
  onConfirmLock,
  onConfirmHardBan,
  onConfirmUnlock,
}: AccountActionDialogProps) {
  const [actionType, setActionType] = useState<"lock" | "hard_ban" | "unlock">("lock");
  const [reason, setReason] = useState("");
  const [typedConfirmation, setTypedConfirmation] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen || !user) return null;

  const isBanned = user.accountStatus === "Banned" || user.lockReason?.includes("[PERMANENT BAN]");
  const isLocked = user.isLocked;

  const handleAction = () => {
    setErrorMsg("");
    if (actionType === "unlock") {
      onConfirmUnlock(user.id);
      onClose();
      return;
    }

    if (!reason.trim()) {
      setErrorMsg("กรุณาระบุเหตุผลในการดำเนินการเพื่อบันทึกใน Audit Log (Required)");
      return;
    }

    if (actionType === "hard_ban") {
      // Safety confirmation: Must match user's name or uppercase "CONFIRM"
      const expectedKeyword = user.name.trim();
      if (typedConfirmation.trim() !== expectedKeyword && typedConfirmation.trim() !== "CONFIRM") {
        setErrorMsg(`เพื่อความปลอดภัยขั้นสูงสุด กรุณาพิมพ์ "${expectedKeyword}" หรือ "CONFIRM" ในช่องยืนยันก่อนกดแบนถาวร`);
        return;
      }
      onConfirmHardBan(user.id, reason.trim());
      onClose();
      return;
    }

    if (actionType === "lock") {
      onConfirmLock(user.id, reason.trim());
      onClose();
      return;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-[#d6e0e4] bg-white shadow-[0_24px_56px_rgba(15,38,54,0.3)]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${
              actionType === "hard_ban"
                ? "bg-red-100 text-red-600"
                : actionType === "lock"
                ? "bg-amber-100 text-amber-600"
                : "bg-emerald-100 text-emerald-600"
            }`}>
              {actionType === "hard_ban" ? (
                <NoSymbolIcon className="h-5 w-5" />
              ) : actionType === "lock" ? (
                <LockClosedIcon className="h-5 w-5" />
              ) : (
                <ShieldCheckIcon className="h-5 w-5" />
              )}
            </div>
            <div>
              <h3 className="text-base font-extrabold text-[#092f45]">
                {isLocked
                  ? "Manage Account Suspension or Unlock"
                  : "Security Enforcement & Suspension"}
              </h3>
              <p className="text-xs text-slate-500">Security & Platform Integrity Control (FR-20)</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Target Profile Card */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#092f45] text-xs font-black text-white">
                {user.name.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <p className="text-xs font-extrabold text-[#092f45]">{user.name}</p>
                <p className="text-[11px] text-slate-500">{user.email} • {user.role}</p>
              </div>
            </div>
            <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
              isBanned
                ? "bg-red-100 text-red-700"
                : isLocked
                ? "bg-amber-100 text-amber-700"
                : "bg-emerald-100 text-emerald-700"
            }`}>
              {isBanned ? "Permanently Banned" : isLocked ? "Suspended" : "Active"}
            </span>
          </div>

          {/* Mode Switcher */}
          <div className="grid grid-cols-2 gap-2 border-b border-slate-100 pb-3">
            <button
              type="button"
              onClick={() => {
                setActionType("lock");
                setErrorMsg("");
              }}
              className={`rounded-xl border py-2 text-xs font-bold transition-all cursor-pointer ${
                actionType === "lock"
                  ? "border-amber-500 bg-amber-50 text-amber-900 shadow-xs"
                  : "border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              Temporary Suspension (Soft Lock)
            </button>
            <button
              type="button"
              onClick={() => {
                setActionType("hard_ban");
                setErrorMsg("");
              }}
              className={`rounded-xl border py-2 text-xs font-bold transition-all cursor-pointer ${
                actionType === "hard_ban"
                  ? "border-red-600 bg-red-50 text-red-700 shadow-xs"
                  : "border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              Permanent Hard Ban ⚠️
            </button>
          </div>

          {/* Reason Input */}
          <div>
            <label className="block text-xs font-extrabold text-[#092f45] mb-1">
              Enforcement Reason <span className="text-red-500">*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={
                actionType === "hard_ban"
                  ? "Specify severe violation charges (e.g. Harassment, fraudulent identity, severe misconduct)..."
                  : "Specify temporary restriction reason (e.g. Pending investigation for no-show)..."
              }
              rows={3}
              className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-[#092f45] placeholder-slate-400 focus:border-[#087f80] focus:outline-none"
            />
          </div>

          {/* HARD BAN STRICT CONFIRMATION STEP */}
          {actionType === "hard_ban" && (
            <div className="rounded-xl border border-red-200 bg-red-50/70 p-4 space-y-2">
              <div className="flex items-center gap-2 text-red-700">
                <ExclamationTriangleIcon className="h-5 w-5 shrink-0 text-red-600" />
                <p className="text-xs font-black">Strict Safety Confirmation Required</p>
              </div>
              <p className="text-[11px] text-red-600/90 leading-relaxed">
                Permanent Hard Ban will immediately revoke all authentication credentials, forfeit interpreter ratings, and restrict re-registration permanently. Please type <strong>{user.name}</strong> or <strong>CONFIRM</strong> to authorize:
              </p>
              <input
                type="text"
                value={typedConfirmation}
                onChange={(e) => setTypedConfirmation(e.target.value)}
                placeholder={`Type "${user.name}" or "CONFIRM"`}
                className="w-full rounded-lg border border-red-300 bg-white px-3 py-2 text-xs font-bold text-red-900 focus:border-red-600 focus:outline-none"
              />
            </div>
          )}

          {/* Error Message Display */}
          {errorMsg && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-2.5 text-xs font-bold text-red-700">
              {errorMsg}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/80 px-6 py-4">
          {isLocked && (
            <button
              type="button"
              onClick={() => {
                onConfirmUnlock(user.id);
                onClose();
              }}
              className="rounded-xl border border-emerald-300 bg-emerald-50 px-3.5 py-2 text-xs font-bold text-emerald-700 hover:bg-emerald-100 cursor-pointer"
            >
              Unlock Account
            </button>
          )}
          <div className="flex items-center gap-2 ml-auto">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleAction}
              disabled={actionType === "hard_ban" && typedConfirmation.trim() !== user.name.trim() && typedConfirmation.trim() !== "CONFIRM"}
              className={`rounded-xl px-5 py-2 text-xs font-extrabold text-white shadow-xs transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                actionType === "hard_ban"
                  ? "bg-red-600 hover:bg-red-700 shadow-red-600/20"
                  : "bg-amber-600 hover:bg-amber-700 shadow-amber-600/20"
              }`}
            >
              {actionType === "hard_ban" ? "Confirm Permanent Hard Ban" : "Confirm Account Suspension"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

