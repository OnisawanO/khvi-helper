"use client";

import { useState } from "react";
import {
  KeyIcon,
  LanguageIcon,
  LockClosedIcon,
  ShieldCheckIcon,
  ShieldExclamationIcon,
  SparklesIcon,
  StarIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  UserMinusIcon,
  EnvelopeIcon,
  PhoneIcon,
  CalendarDaysIcon,
  ChatBubbleLeftEllipsisIcon,
  CheckBadgeIcon,
} from "@heroicons/react/24/outline";
import { AdminIncidentReport, AdminUserRecord, SystemRole } from "../types";

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
  incidentReports?: AdminIncidentReport[];
  onRevokeInterpreter?: (user: AdminUserRecord, reason: string) => void;
  onDirectHardBan?: (user: AdminUserRecord) => void;
}

export function UserEditModal({
  isOpen,
  onClose,
  user,
  tempRole,
  setTempRole,
  tempIsLocked,
  setTempIsLocked,
  tempLockReason,
  setTempLockReason,
  onSave,
  incidentReports = [],
  onRevokeInterpreter,
  onDirectHardBan,
}: UserEditModalProps) {
  const [isRevoking, setIsRevoking] = useState(false);
  const [revokeReason, setRevokeReason] = useState("");
  const [appealDismissed, setAppealDismissed] = useState(false);

  if (!isOpen || !user) return null;

  const userIncidentReports = incidentReports.filter(
    (r) =>
      r.reportedUserId === user.id ||
      (r.reportedUserName && r.reportedUserName.toLowerCase() === user.name.toLowerCase())
  );

  const hasCriticalIncident = userIncidentReports.some((r) => r.severity === "critical");
  const isHardBanned = user.accountStatus === "Banned" || user.lockReason?.includes("[PERMANENT BAN]");

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
    if (hasCriticalIncident || userIncidentReports.length >= 2) {
      return {
        level: "Critical Safety Flag",
        badgeColor: "bg-red-50 text-red-700 border-red-200",
        dotColor: "bg-red-600",
        desc: "Multiple or high-severity reports require immediate review.",
      };
    }
    if (userIncidentReports.length === 1) {
      return {
        level: "Moderate Concern",
        badgeColor: "bg-amber-50 text-amber-800 border-amber-200",
        dotColor: "bg-amber-500",
        desc: "Single incident report filed against this account.",
      };
    }
    return {
      level: "Clean & Operational",
      badgeColor: "bg-emerald-50 text-emerald-800 border-emerald-200",
      dotColor: "bg-emerald-500",
      desc: "No negative reports or safety flags on record.",
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
                  User Account & Security Console
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
                    {user.role}
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
                      ? "Banned"
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
                  <span className="text-[11px] text-slate-400 block mb-1.5">Spoken & Additional:</span>
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
                </div>
              </div>
            </div>

            {/* Interpreter Metrics (if Interpreter) */}
            {user.interpreterStats ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h5 className="text-[11px] font-bold uppercase tracking-wider text-teal-800 flex items-center gap-1">
                    <SparklesIcon className="h-3.5 w-3.5 text-teal-600" />
                    Interpreter Metrics
                  </h5>
                  <span className="inline-flex items-center gap-1 font-bold text-xs text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                    <StarIcon className="h-3 w-3 fill-amber-500 text-amber-500" />
                    {user.interpreterStats.rating} / 5.0
                  </span>
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

                  {user.interpreterStats.feedbackHighlights && user.interpreterStats.feedbackHighlights.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[10px] font-bold text-teal-900 uppercase">Recent Feedback</span>
                      {user.interpreterStats.feedbackHighlights.slice(0, 2).map((fb, idx) => (
                        <div key={idx} className="rounded-lg bg-white border border-teal-100/60 p-2 text-xs text-slate-600 italic">
                          &ldquo;{fb}&rdquo;
                        </div>
                      ))}
                    </div>
                  )}
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
            
            {/* Section 1: RBAC Role Assignment */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-3">
              <div className="flex items-center gap-2">
                <KeyIcon className="h-4 w-4 text-[#087f80]" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  RBAC Role Assignment
                </h4>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                {(["User", "Interpreter", "Manager", "Admin"] as SystemRole[]).map((r) => {
                  const isSelected = tempRole === r;
                  return (
                    <button
                      key={r}
                      type="button"
                      onClick={() => {
                        setTempRole(r);
                        if (r === "Admin") {
                          setTempIsLocked(false);
                          setTempLockReason("");
                        }
                      }}
                      className={`rounded-xl border p-3 text-left transition-all cursor-pointer ${
                        isSelected
                          ? "border-[#087f80] bg-[#087f80]/10 text-[#087f80] ring-1 ring-[#087f80]"
                          : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <p className="text-xs font-bold">{r}</p>
                      <p className="mt-1 text-[10px] text-slate-500">
                        {r === "Admin"
                          ? "Super Backoffice"
                          : r === "Manager"
                          ? "Ops & Verifications"
                          : r === "Interpreter"
                          ? "Claim Missions"
                          : "Standard Requester"}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

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

            {/* Section 2: Account Suspension & Lockout Control */}
            <div
              className={`rounded-xl border p-5 space-y-3 ${
                tempRole === "Admin"
                  ? "border-slate-200 bg-slate-50/70"
                  : "border-slate-200 bg-white"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <LockClosedIcon
                    className={`h-4 w-4 ${
                      tempRole === "Admin" ? "text-slate-400" : "text-[#f04f3e]"
                    }`}
                  />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                    Account Suspension & Lockout
                  </h4>
                </div>

                {tempRole === "Admin" ? (
                  <span className="rounded-full bg-slate-200/80 px-2.5 py-1 text-[11px] font-bold text-slate-600">
                    Admin Protected
                  </span>
                ) : (
                  <label className="relative inline-flex cursor-pointer items-center">
                    <input
                      type="checkbox"
                      checked={tempIsLocked}
                      onChange={(e) => setTempIsLocked(e.target.checked)}
                      className="peer sr-only"
                    />
                    <div className="peer h-6 w-11 rounded-full bg-slate-200 after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-[#f04f3e] peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
                  </label>
                )}
              </div>

              {tempRole === "Admin" ? (
                <div className="rounded-lg border border-slate-200 bg-white p-3 text-xs text-slate-600">
                  <p className="font-semibold text-[#092f45]">
                    🛡️ System Policy: Admin accounts cannot be suspended
                  </p>
                  <p className="mt-0.5 text-[11px] text-slate-500">
                    To preserve governance continuity, administrator accounts cannot be locked.
                    Reassign to User or Manager first if offboarding is necessary.
                  </p>
                </div>
              ) : (
                <p className="text-xs text-slate-500">
                  Suspended users are blocked from logging in, accepting interpreter calls, or generating SOS requests.
                </p>
              )}

              {tempRole !== "Admin" && tempIsLocked && (
                <div className="space-y-3 pt-1 animate-in fade-in">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-[#f04f3e]">
                      Reason for Suspension (Audit Requirement):
                    </label>
                    <textarea
                      rows={2}
                      value={tempLockReason}
                      onChange={(e) => setTempLockReason(e.target.value)}
                      placeholder="e.g. Terms violation, severe conduct breach, or pending safety investigation..."
                      className="w-full rounded-lg border border-red-300 bg-red-50/20 p-2.5 text-xs text-slate-800 placeholder-slate-400 focus:border-[#f04f3e] focus:outline-none"
                    />
                  </div>

                  {/* Permanent Hard Ban Escalation */}
                  {user.accountStatus !== "Banned" && onDirectHardBan && (
                    <div className="flex items-center justify-between rounded-lg border border-red-200 bg-red-50/40 p-3">
                      <div>
                        <p className="text-xs font-bold text-red-900">Permanent Hard Ban</p>
                        <p className="text-[11px] text-red-700/80">
                          Irrevocably disables credentials and blacklists device identity
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => onDirectHardBan(user)}
                        className="rounded-lg border border-red-300 bg-white px-3 py-1.5 text-xs font-bold text-red-700 hover:bg-red-50 transition-colors cursor-pointer shrink-0"
                      >
                        Hard Ban Account
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Section 2.5: Interpreter Accreditation Revocation */}
            {(user.role === "Interpreter" || tempRole === "Interpreter") && (
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
                      onClick={() => setIsRevoking(true)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-amber-300 bg-white px-3 py-1.5 text-xs font-bold text-amber-700 hover:bg-amber-50 cursor-pointer transition-colors"
                    >
                      <UserMinusIcon className="h-4 w-4" />
                      Revoke Accreditation
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Section 3: Escalated Incident Reports History */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldExclamationIcon className="h-4 w-4 text-slate-600" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                    Incident Reports History
                  </h4>
                </div>
                <span
                  className={`inline-flex items-center gap-1 font-bold text-xs px-2.5 py-0.5 rounded-full ${
                    userIncidentReports.length > 0
                      ? "text-red-700 bg-red-50 border border-red-200"
                      : "text-emerald-700 bg-emerald-50 border border-emerald-200"
                  }`}
                >
                  {userIncidentReports.length > 0
                    ? `${userIncidentReports.length} Active Flag${userIncidentReports.length > 1 ? "s" : ""}`
                    : "Clean Record"}
                </span>
              </div>

              {userIncidentReports.length > 0 ? (
                <div className="space-y-2.5 pt-1">
                  {userIncidentReports.map((rep) => (
                    <div
                      key={rep.id}
                      className="rounded-xl border border-slate-200 bg-slate-50/50 p-3.5 space-y-2"
                    >
                      <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-[#092f45]">
                            {rep.id}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            Booking: {rep.bookingId}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`inline-flex rounded-full px-2 py-0.5 text-[9px] font-black uppercase ${
                              rep.severity === "critical"
                                ? "bg-red-100 text-red-700 border border-red-200"
                                : rep.severity === "high"
                                ? "bg-amber-100 text-amber-800 border border-amber-200"
                                : "bg-blue-100 text-blue-700 border border-blue-200"
                            }`}
                          >
                            {rep.severity}
                          </span>
                          <span
                            className={`inline-flex rounded-md px-1.5 py-0.5 text-[9px] font-bold ${
                              rep.status === "Escalated to Admin"
                                ? "bg-red-50 text-red-600 border border-red-200"
                                : rep.status === "Resolved (Hard Banned)"
                                ? "bg-slate-900 text-red-300 border border-slate-700"
                                : rep.status === "Resolved (Locked)"
                                ? "bg-amber-50 text-amber-800 border border-amber-200"
                                : "bg-slate-100 text-slate-600 border border-slate-200"
                            }`}
                          >
                            {rep.status}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <p className="text-xs text-slate-800 font-medium leading-relaxed">
                          {rep.reason}
                        </p>
                        {rep.originalReason && rep.originalLanguage && (
                          <div className="flex items-center gap-1 text-[11px] text-slate-500 italic bg-white p-2 rounded-lg border border-slate-200">
                            <LanguageIcon className="h-3.5 w-3.5 text-blue-600 shrink-0 not-italic" />
                            <span>
                              Original ({rep.originalLanguage}): &ldquo;{rep.originalReason}&rdquo;
                            </span>
                          </div>
                        )}
                        {rep.actionTaken && (
                          <p className="text-[10px] text-slate-500 bg-white px-2 py-1 rounded border border-slate-200">
                            <strong className="text-slate-700">Enforcement Log:</strong>{" "}
                            {rep.actionTaken}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-1 text-[10px] text-slate-400 border-t border-slate-200/60">
                        <span>
                          Reported by:{" "}
                          <strong className="text-slate-600">{rep.reporterName}</strong> (
                          {rep.reporterRole})
                        </span>
                        <span>Date: {rep.createdAt}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-lg bg-slate-50 border border-dashed border-slate-200 p-4 text-center">
                  <p className="text-xs text-slate-500">
                    No active misconduct incident reports or safety escalations on file.
                  </p>
                </div>
              )}
            </div>
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
              Cancel
            </button>
            <button
              type="button"
              onClick={onSave}
              className="w-full sm:w-auto rounded-lg bg-[#087f80] px-5 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#087f80]/90 transition-all cursor-pointer"
            >
              Save Security Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
