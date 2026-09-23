"use client";

import { useState } from "react";
import {
  KeyIcon,
  LockClosedIcon,
  ShieldCheckIcon,
  SparklesIcon,
  StarIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  NoSymbolIcon,
  UserMinusIcon,
  EnvelopeIcon,
  PhoneIcon,
  CalendarDaysIcon,
  ClockIcon,
  ChatBubbleLeftEllipsisIcon,
  CheckBadgeIcon,
} from "@heroicons/react/24/outline";
import { AdminUserRecord, SystemRole } from "../types";

interface UserEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: AdminUserRecord | null;
  tempRole: SystemRole;
  setTempRole: (role: SystemRole) => void;
  tempIsLocked: boolean;
  setTempIsLocked: (locked: boolean) => void;
  tempLockReason: string;
  setTempLockReason: (reason: string) => void;
  onSave: () => void;
  canManageSecurity?: boolean;
  isPrimaryAdmin?: boolean;
  onGrantAdminAccess?: (user: AdminUserRecord) => void;
  onRevokeInterpreter?: (user: AdminUserRecord, reason: string) => void;
  onDirectHardBan?: (user: AdminUserRecord) => void;
}

export function UserEditModal({
  isOpen,
  onClose,
  user,
  tempIsLocked,
  setTempIsLocked,
  tempLockReason,
  setTempLockReason,
  onSave,
  canManageSecurity = true,
  isPrimaryAdmin = false,
  onGrantAdminAccess,
  onRevokeInterpreter,
  onDirectHardBan,
}: UserEditModalProps) {
  const [isRevoking, setIsRevoking] = useState(false);
  const [revokeReason, setRevokeReason] = useState("");
  const [appealDismissed, setAppealDismissed] = useState(false);

  if (!isOpen || !user) return null;

  const isHardBanned = user.accountStatus === "Banned" || user.lockReason?.includes("[PERMANENT BAN]");
  const canEditTarget =
    !isHardBanned &&
    canManageSecurity &&
    (isPrimaryAdmin || user.role === "User" || user.role === "Interpreter");
  const applicationStatusClass = user.applicationSummary?.status === "Approved"
    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
    : user.applicationSummary?.status === "Rejected"
    ? "bg-red-50 text-red-700 border-red-200"
    : "bg-amber-50 text-amber-700 border-amber-200";
  const interpreterCategories = [...new Set(
    user.applicationSummary?.categories.length
      ? user.applicationSummary.categories
      : user.interpreterStats?.specialties || []
  )];
  const hasInterpreterDetails = user.role === "Interpreter" || Boolean(user.interpreterStats || user.applicationSummary);
  const isRestricted = isHardBanned || user.isLocked;

  // Dynamic Risk Level Calculation
  const riskAssessment = (() => {
    if (isHardBanned) {
      return {
        level: "Banned / Excluded",
        badgeColor: "bg-slate-900 text-red-300 border-slate-700",
        dotColor: "bg-red-500",
        desc: "Permanently banned from accessing KHVI Helper services.",
      };
    }
    if (user.isLocked) {
      return {
        level: "High Risk (Suspended)",
        badgeColor: "bg-red-50 text-red-700 border-red-200",
        dotColor: "bg-red-600 animate-ping",
        desc: "Account is currently under administrative suspension.",
      };
    }
    return {
      level: "Clean & Operational",
      badgeColor: "bg-emerald-50 text-emerald-800 border-emerald-200",
      dotColor: "bg-emerald-500",
        desc: "No account security flags on record.",
    };
  })();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-3 sm:p-5 backdrop-blur-xs animate-in fade-in">
      <div className="relative flex h-[92vh] max-h-[900px] w-full max-w-6xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl border border-slate-200 animate-in zoom-in-95">
        
        {/* Header Bar */}
        <div className="flex min-h-[3.75rem] items-center justify-between border-b border-slate-200 bg-white px-6 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#092f45] text-white shrink-0 shadow-xs">
              <ShieldCheckIcon className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-[#092f45] leading-tight">
                  {isRestricted ? "Restricted Account & Security Console" : "User Account & Security Console"}
                </h3>
                <span className="text-xs text-slate-400">•</span>
                <span className="font-mono text-xs text-slate-500 font-medium">ID: {user.id}</span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Modal Body: Unified Scrollable Container (Sticky Header & Footer) */}
        <div className="flex-1 overflow-y-auto bg-white">
          <div className="flex flex-col md:flex-row min-h-full">
            {/* LEFT COLUMN: Profile, Contact, Languages & Operational Metrics (36% Width) */}
            <div className="w-full md:w-[36%] border-b md:border-b-0 md:border-r border-slate-200 p-6 space-y-5 bg-white">
            
            {/* Identity Banner */}
            <div className="flex items-start gap-4 pb-4 border-b border-slate-100">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#092f45] text-xl font-bold text-white shrink-0 shadow-xs">
                {user.name.slice(0, 2).toUpperCase()}
              </div>
              <div className="space-y-1 min-w-0 flex-1">
                <h4 className="text-base font-bold text-[#092f45] truncate">{user.name}</h4>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="inline-flex items-center rounded-md bg-[#087f80]/10 px-2 py-0.5 text-xs font-bold text-[#087f80]">
                    {user.role === "Admin" && user.adminLevel
                      ? `${user.role} · ${user.adminLevel}`
                      : user.role}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-bold ${
                      isHardBanned
                        ? "bg-slate-900 text-red-300"
                        : user.isLocked
                        ? "bg-red-50 text-red-700 border border-red-200"
                        : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        isHardBanned
                          ? "bg-red-400"
                          : user.isLocked
                          ? "bg-red-500"
                          : "bg-emerald-500"
                      }`}
                    />
                    {isHardBanned
                      ? "Permanently Banned"
                      : user.isLocked
                      ? "Suspended"
                      : "Active"}
                  </span>
                </div>
              </div>
            </div>

            {/* Contact & System Details */}
            <div className="space-y-3">
              <h5 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Identity & Contact Details
              </h5>
              
              <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-1.5 text-[11px]">
                    <EnvelopeIcon className="h-3.5 w-3.5 text-slate-400" />
                    Email Address:
                  </span>
                  <span className="font-semibold text-slate-800">{user.email}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-1.5 text-[11px]">
                    <PhoneIcon className="h-3.5 w-3.5 text-slate-400" />
                    Phone Number:
                  </span>
                  <span className="font-semibold text-slate-800">{user.phone || "Not provided"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-1.5 text-[11px]">
                    <CalendarDaysIcon className="h-3.5 w-3.5 text-slate-400" />
                    Registered Since:
                  </span>
                  <span className="text-slate-600">{user.registeredAt}</span>
                </div>
                {user.dateOfBirth ? (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 flex items-center gap-1.5 text-[11px]">
                      <CalendarDaysIcon className="h-3.5 w-3.5 text-slate-400" />
                      Date of Birth:
                    </span>
                    <span className="text-slate-600">{user.dateOfBirth}</span>
                  </div>
                ) : null}
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-1.5 text-[11px]">
                    <ClockIcon className="h-3.5 w-3.5 text-slate-400" />
                    Last Sign-in:
                  </span>
                  <span className="text-slate-600">{user.lastActive}</span>
                </div>
              </div>
            </div>

            {/* Language Skills */}
            <div className="space-y-3">
              <h5 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Language Capabilities
              </h5>
              <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5 space-y-3 text-xs">
                <div>
                  <span className="text-[11px] text-slate-400 block">Primary Native Language:</span>
                  <span className="font-semibold text-slate-800 mt-0.5 block">{user.primaryLanguage}</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block">Preferred UI Language:</span>
                  <span className="font-semibold text-slate-800 mt-0.5 block">{user.preferredUiLanguage || "Not available"}</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block mb-1.5">Spoken & Additional:</span>
                  {user.spokenLanguages.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {user.spokenLanguages.map((l) => (
                        <span
                          key={l}
                          className="rounded-md bg-white border border-slate-200 px-2 py-0.5 text-xs text-slate-700 font-medium"
                        >
                          {l}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-slate-500">Not recorded</span>
                  )}
                </div>
                {hasInterpreterDetails ? (
                  <div className="border-t border-slate-200/70 pt-3">
                    <span className="text-[11px] text-slate-400 block mb-1.5">Service Categories:</span>
                    {interpreterCategories.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {interpreterCategories.map((category) => (
                          <span
                            key={category}
                            className="rounded-md bg-white border border-teal-200 px-2 py-0.5 text-xs text-teal-800 font-medium"
                          >
                            {category}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-slate-500">Not available</span>
                    )}
                  </div>
                ) : null}
              </div>
            </div>

            {/* Connected interpreter application review */}
            {user.applicationSummary ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <h5 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Interpreter Application
                  </h5>
                  <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${applicationStatusClass}`}>
                    {user.applicationSummary.status}
                  </span>
                </div>
                <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5 space-y-2 text-xs">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-slate-400">Application ID</span>
                    <span className="font-mono font-semibold text-slate-700">#{user.applicationSummary.id}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-slate-400">Submitted</span>
                    <span className="text-right text-slate-600">{user.applicationSummary.submittedAt}</span>
                  </div>
                  {user.applicationSummary.reviewedAt ? (
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-slate-400">Reviewed</span>
                      <span className="text-right text-slate-600">{user.applicationSummary.reviewedAt}</span>
                    </div>
                  ) : null}
                  {user.applicationSummary.reviewedBy ? (
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-slate-400">Reviewed by</span>
                      <span className="text-right font-semibold text-slate-700">{user.applicationSummary.reviewedBy}</span>
                    </div>
                  ) : null}
                </div>
              </div>
            ) : null}

            {/* Connected interpreter metrics */}
            {user.interpreterStats ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h5 className="text-[11px] font-bold uppercase tracking-wider text-teal-800 flex items-center gap-1">
                    <SparklesIcon className="h-3.5 w-3.5 text-teal-600" />
                    Interpreter Record
                  </h5>
                  {typeof user.interpreterStats.rating === "number" ? (
                    <span className="inline-flex items-center gap-1 font-bold text-xs text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                      <StarIcon className="h-3 w-3 fill-amber-500 text-amber-500" />
                      {user.interpreterStats.rating.toFixed(1)} / 5.0
                    </span>
                  ) : (
                    <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold text-slate-500">
                      No review data
                    </span>
                  )}
                </div>

                <div className="rounded-xl border border-teal-100 bg-teal-50/40 p-3.5 space-y-3 text-xs">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="rounded-lg bg-white p-2 border border-teal-100/60">
                      <span className="text-[10px] text-slate-400 block">Completed Missions</span>
                      <span className="text-sm font-bold text-slate-800">{user.interpreterStats.completedMissions}</span>
                    </div>
                    <div className="rounded-lg bg-white p-2 border border-teal-100/60">
                      <span className="text-[10px] text-slate-400 block">Accreditation</span>
                      <span className="text-xs font-bold text-emerald-700 mt-0.5 block">
                        {user.interpreterStats.verificationStatus || "Approved"}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1.5 border-t border-teal-100/70 pt-2">
                    <span className="text-[10px] font-bold text-teal-900 uppercase">Review data</span>
                    <p className="rounded-lg bg-white border border-teal-100/60 p-2 text-xs text-slate-600">
                      {typeof user.interpreterStats.reviewCount === "number"
                        ? `${user.interpreterStats.reviewCount} user reviews recorded.`
                        : "No connected review records are available yet."}
                    </p>
                  </div>
                </div>
              </div>
            ) : null}

            {/* Safety & Risk Summary Card */}
            <div className={`rounded-xl border p-3.5 ${riskAssessment.badgeColor}`}>
              <div className="flex items-center justify-between">
                <span className="font-extrabold uppercase text-[10px] tracking-wider">Account Standing</span>
                <span className="flex items-center gap-1.5 font-bold text-xs">
                  <span className={`h-2 w-2 rounded-full ${riskAssessment.dotColor}`} />
                  {riskAssessment.level}
                </span>
              </div>
              <p className="mt-1 text-[11px] opacity-90 leading-relaxed">{riskAssessment.desc}</p>
            </div>
          </div>

          {/* RIGHT COLUMN: Governance, Role Permissions & Incident History (64% Width) */}
          <div className="flex-1 p-6 space-y-5 bg-white">
            {(user.role === "Manager" || user.role === "Admin") && (
              <>
                {/* Section 1: Role and access summary */}
                <div className="space-y-3 border-b border-slate-200 pb-5">
              <div className="flex items-center gap-2">
                <KeyIcon className="h-4 w-4 text-[#087f80]" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  Role & Access
                </h4>
              </div>

              <div className="flex items-center justify-between px-0 py-2">
                <div>
                  <p className="text-sm font-bold text-[#092f45]">{user.role}</p>
                  <p className="mt-1 text-[11px] text-slate-600">
                    Staff privileges are managed through dedicated governance actions.
                  </p>
                </div>
                <span className="rounded-full border border-teal-200 bg-white px-2.5 py-1 text-[10px] font-bold text-teal-700">
                  Read only
                </span>
              </div>

              {user.role === "Manager" && (
                <div className="rounded-lg border border-blue-200 bg-blue-50/60 px-3 py-3 text-[11px] leading-relaxed text-blue-900">
                  <p className="font-bold">Manager account</p>
                  <p className="mt-1 text-blue-800/80">Manager accounts are provisioned as staff accounts and cannot be changed through the generic User Directory flow.</p>
                  {isPrimaryAdmin && onGrantAdminAccess && (
                    <div className="mt-3 flex flex-col gap-2 border-t border-blue-200/70 pt-3 sm:flex-row sm:items-center sm:justify-between">
                      <span className="text-[10px] font-semibold text-blue-800/75">
                        {user.isLocked ? "Unlock this account before promotion." : "Promote this Manager to delegated Admin."}
                      </span>
                      <button
                        type="button"
                        disabled={user.isLocked}
                        onClick={() => onGrantAdminAccess(user)}
                        className="inline-flex items-center justify-center rounded-lg border border-blue-300 bg-white px-3 py-2 text-[11px] font-bold text-blue-800 transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Grant Admin Access
                      </button>
                    </div>
                  )}
                </div>
              )}

              {!canManageSecurity && user.role !== "Admin" && user.role !== "Manager" && (
                <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-[11px] leading-relaxed text-slate-600">
                  This account is read-only for the current Admin level.
                </div>
              )}

              {user.role === "Admin" && (
                <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-[11px] leading-relaxed text-slate-600">
                  Admin accounts are read-only in User Directory. Use the dedicated Admin Access flow to manage Admin privileges.
                </div>
              )}
                </div>
              </>
            )}

            {/* APPEAL REVIEW CARD (If user has a pending appeal) */}
            {user.isLocked && user.hasPendingAppeal && !appealDismissed && (
              <div className="rounded-xl border border-amber-300 bg-amber-50/60 p-4 space-y-3 animate-in fade-in">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-100 text-amber-800">
                      <ChatBubbleLeftEllipsisIcon className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                        <span>User Appeal Statement</span>
                        <span className="rounded bg-amber-200/80 px-1.5 py-0.2 text-[9px] font-bold text-amber-900 uppercase">
                          {user.appealCategory || "Pending Review"}
                        </span>
                      </h4>
                      <p className="text-[10px] text-amber-700">
                        Submitted on: {user.appealSubmittedAt || "Recent"}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-amber-800 bg-white border border-amber-300 px-2 py-0.5 rounded-full shadow-2xs">
                    Needs Action
                  </span>
                </div>

                <div className="rounded-lg border border-amber-200 bg-white p-3 text-xs text-slate-700 shadow-2xs leading-relaxed">
                  &ldquo;{user.appealReason}&rdquo;
                </div>

                <div className="flex items-center justify-between gap-2 pt-1 border-t border-amber-200/60 text-xs">
                  <span className="text-[11px] text-amber-800 font-medium">
                    Quick Resolution:
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={!canEditTarget}
                      onClick={() => {
                        // Reject appeal by dismissing prompt while staying locked
                        setTempIsLocked(true);
                        setTempLockReason(tempLockReason ? `${tempLockReason} (Appeal Reviewed & Rejected)` : "Appeal reviewed and rejected by Admin.");
                        setAppealDismissed(true);
                      }}
                      className="rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      Reject Appeal
                    </button>
                    <button
                      type="button"
                      disabled={!canEditTarget}
                      onClick={() => {
                        // Approve appeal: unlock user immediately and dismiss prompt
                        setTempIsLocked(false);
                        setTempLockReason("");
                        setAppealDismissed(true);
                      }}
                      className="rounded-lg bg-[#087f80] px-3 py-1 text-[11px] font-bold text-white hover:bg-[#087f80]/90 transition-colors cursor-pointer shadow-2xs flex items-center gap-1"
                    >
                      <CheckBadgeIcon className="h-3.5 w-3.5" />
                      Approve & Unlock
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Section 2: Account Enforcement */}
            <div className="space-y-4 border-b border-slate-200 pb-5">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2">
                  <LockClosedIcon className="h-4 w-4 text-[#f04f3e]" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                    Account Enforcement
                  </h4>
                </div>
              </div>

              {user.role === "Admin" ? (
                <div className="rounded-lg border border-slate-200 bg-white p-3 text-xs text-slate-600">
                  <p className="font-semibold text-[#092f45]">
                    🛡️ System Policy: Admin accounts cannot be suspended
                  </p>
                  <p className="mt-0.5 text-[11px] text-slate-500">
                    Staff security changes require the dedicated governance flow and Primary Admin authorization.
                  </p>
                </div>
              ) : isHardBanned ? (
                <div className="rounded-lg border border-red-200 bg-red-50/60 p-3 text-xs text-red-800">
                  <p className="font-semibold text-red-900">
                    Permanent ban is active
                  </p>
                  <p className="mt-0.5 text-[11px] text-red-700/80">
                    This account cannot be edited through the standard User Directory flow. A Primary Admin must review any change.
                  </p>
                </div>
              ) : !canEditTarget ? (
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
                  Account enforcement is read-only for the current Admin level.
                </div>
              ) : (
                <p className="text-xs text-slate-500">
                  Soft ban blocks sign-in, interpreter calls, and SOS requests. Changes are recorded in the System Audit Trail.
                </p>
              )}

              {user.role !== "Admin" && user.role !== "Manager" && !isHardBanned && canEditTarget && (
                <>
                  {tempIsLocked ? (
                    <div className="space-y-3 rounded-lg border border-amber-200 bg-amber-50/40 p-3 animate-in fade-in">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-xs font-bold text-amber-900">Soft ban is selected</p>
                          <p className="mt-0.5 text-[11px] text-amber-800/80">Save to keep the suspension, or unlock this account.</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setTempIsLocked(false);
                            setTempLockReason("");
                          }}
                          className="rounded-lg border border-emerald-300 bg-white px-3 py-1.5 text-[11px] font-bold text-emerald-700 transition hover:bg-emerald-50"
                        >
                          Unlock Account
                        </button>
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-[#f04f3e]">
                          Reason for Soft Ban (Audit Requirement):
                        </label>
                        <textarea
                          rows={2}
                          value={tempLockReason}
                          onChange={(e) => setTempLockReason(e.target.value)}
                          placeholder="e.g. Terms violation, severe conduct breach, or pending safety investigation..."
                          className="w-full rounded-lg border border-red-300 bg-white p-2.5 text-xs text-slate-800 placeholder-slate-400 focus:border-[#f04f3e] focus:outline-none"
                        />
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setTempIsLocked(true)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-amber-300 bg-white px-3 py-2 text-xs font-bold text-amber-700 transition hover:bg-amber-50"
                    >
                      <LockClosedIcon className="h-3.5 w-3.5" />
                      Suspend Account
                    </button>
                  )}
                </>
              )}

              {isPrimaryAdmin && user.role !== "Admin" && !isHardBanned && onDirectHardBan && (
                <div className="space-y-3 border-t border-red-100 pt-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold text-red-900">Permanent hard ban</p>
                      <p className="mt-1 text-[11px] leading-relaxed text-red-700/80">
                        Irreversible enforcement. Blocks new sign-ins and token refreshes through Supabase Auth and permanently restricts the account in KHVI.
                      </p>
                    </div>
                    <NoSymbolIcon className="h-5 w-5 shrink-0 text-red-600" />
                  </div>
                  <button
                    type="button"
                    onClick={() => onDirectHardBan(user)}
                    className="rounded-lg border border-red-300 bg-white px-3 py-2 text-xs font-bold text-red-700 transition-colors hover:bg-red-50"
                  >
                    Review Permanent Hard Ban
                  </button>
                </div>
              )}
            </div>

            {/* Section 2.5: Interpreter Accreditation Revocation */}
            {isPrimaryAdmin && user.role === "Interpreter" && (
              <div className="rounded-xl border border-amber-200 bg-amber-50/30 p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <UserMinusIcon className="h-4 w-4 text-amber-600" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      Interpreter Accreditation Governance
                    </h4>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 border border-amber-200 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                    Executive Action
                  </span>
                </div>
                <p className="text-xs text-slate-600">
                  Revoking accreditation strips volunteer interpreter privileges, cancels standing mission claims, and reverts the account to a standard User.
                </p>

                {isRevoking ? (
                  <div className="space-y-3 rounded-lg border border-amber-300 bg-white p-3 animate-in fade-in">
                    <label className="block text-xs font-bold text-[#f04f3e]">
                      Revocation Reason (Recorded in System Audit Log):
                    </label>
                    <textarea
                      rows={2}
                      value={revokeReason}
                      onChange={(e) => setRevokeReason(e.target.value)}
                      placeholder="e.g. Expired credentials, non-compliance with mission rules..."
                      className="w-full rounded-lg border border-red-300 p-2 text-xs text-slate-800 focus:border-red-500 focus:outline-none"
                    />
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setIsRevoking(false);
                          setRevokeReason("");
                        }}
                        className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (!revokeReason.trim()) {
                            alert("Please enter a revocation reason for the audit record.");
                            return;
                          }
                          if (onRevokeInterpreter) {
                            onRevokeInterpreter(user, revokeReason.trim());
                          }
                        }}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-[#f04f3e] px-3.5 py-1.5 text-xs font-bold text-white hover:bg-[#d93829] cursor-pointer"
                      >
                        <ExclamationTriangleIcon className="h-4 w-4" />
                        Confirm Revocation
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] text-slate-500">
                      Current Accreditation:{" "}
                      <strong className="text-emerald-700 font-bold">
                        {user.interpreterStats?.verificationStatus || "Approved & Active"}
                      </strong>
                    </span>
                    <button
                      type="button"
                      disabled={!canEditTarget}
                      onClick={() => setIsRevoking(true)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-amber-300 bg-white px-3 py-1.5 text-xs font-bold text-amber-700 hover:bg-amber-50 cursor-pointer transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <UserMinusIcon className="h-4 w-4" />
                      Revoke Accreditation
                    </button>
                  </div>
                )}
              </div>
            )}

          </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex min-h-[3.75rem] flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-t border-slate-200 bg-white px-6 py-3">
          <span className="text-xs text-slate-400 text-center sm:text-left">
            Security policy changes are logged to the immutable System Audit Trail
          </span>
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              {isHardBanned ? "Close" : "Cancel"}
            </button>
            {!isHardBanned && (
              <button
                type="button"
                onClick={onSave}
                disabled={!canEditTarget}
                className="w-full sm:w-auto rounded-lg bg-[#087f80] px-5 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#087f80]/90 transition-all cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
              >
                Save Security Changes
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
