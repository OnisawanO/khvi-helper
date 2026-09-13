"use client";

import {
  KeyIcon,
  LockClosedIcon,
  ShieldCheckIcon,
  SparklesIcon,
  StarIcon,
  XMarkIcon,
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
}: UserEditModalProps) {
  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-3 sm:p-4 backdrop-blur-xs animate-in fade-in">
      <div className="relative flex h-[92vh] sm:h-[85vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl sm:rounded-3xl bg-white shadow-2xl animate-in zoom-in-95">
        {/* Modal Header */}
        <div className="flex min-h-[3.5rem] items-center justify-between border-b border-slate-200 px-4 sm:px-6 py-2.5">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-[#092f45] text-white flex-shrink-0">
              <ShieldCheckIcon className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-[#092f45] leading-tight">
                Admin Security Console • User Account Control
              </h3>
              <p className="text-[10px] sm:text-xs text-slate-400">
                ID: {user.id} • Registered {user.registeredAt}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors flex-shrink-0"
          >
            <XMarkIcon className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>
        </div>

        {/* Modal Body: Stacked on Mobile / 30% Left Profile + 70% Right Editor on Desktop */}
        <div className="flex flex-1 flex-col md:flex-row overflow-hidden">
          {/* Profile Card Sidebar */}
          <div className="w-full md:w-[32%] max-h-56 md:max-h-none flex-shrink-0 border-b md:border-b-0 md:border-r border-slate-200 bg-slate-50 p-4 sm:p-6 overflow-y-auto space-y-4 sm:space-y-6">
            <div className="text-center">
              <div className="mx-auto flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-[#092f45] text-lg sm:text-xl font-bold text-white shadow-md">
                {user.name.slice(0, 2).toUpperCase()}
              </div>
              <h4 className="mt-3 text-base font-bold text-[#092f45]">{user.name}</h4>
              <p className="text-xs text-slate-500">{user.email}</p>
              <p className="text-xs text-slate-500">{user.phone}</p>

              <div className="mt-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold bg-white border border-slate-200 shadow-xs">
                <span className="text-slate-400">Current Role:</span>
                <span className="text-[#087f80]">{user.role}</span>
              </div>
            </div>

            <div className="space-y-3 border-t border-slate-200 pt-4 text-xs">
              <div>
                <span className="font-bold text-slate-400 uppercase text-[10px]">Primary Language:</span>
                <p className="font-semibold text-slate-800 mt-0.5">{user.primaryLanguage}</p>
              </div>
              <div>
                <span className="font-bold text-slate-400 uppercase text-[10px]">Spoken Languages:</span>
                <div className="mt-1 flex flex-wrap gap-1">
                  {user.spokenLanguages.map((l) => (
                    <span key={l} className="rounded bg-white border border-slate-200 px-1.5 py-0.5 text-[10px] text-slate-700">
                      {l}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <span className="font-bold text-slate-400 uppercase text-[10px]">Account Security Status:</span>
                <p className={`mt-0.5 font-bold ${user.isLocked ? "text-[#f04f3e]" : "text-emerald-600"}`}>
                  {user.isLocked ? "Suspended (Locked)" : "Active / Operational"}
                </p>
              </div>
            </div>

            {user.interpreterStats && (
              <div className="rounded-xl border border-teal-200 bg-teal-50/60 p-3 text-xs space-y-2">
                <p className="font-bold text-teal-800 flex items-center gap-1">
                  <SparklesIcon className="h-4 w-4" />
                  <span>Interpreter Metrics</span>
                </p>
                <div className="flex justify-between text-slate-600">
                  <span>Missions:</span>
                  <span className="font-bold text-slate-900">{user.interpreterStats.completedMissions}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Rating:</span>
                  <span className="font-bold text-amber-600">★ {user.interpreterStats.rating}</span>
                </div>
              </div>
            )}
          </div>

          {/* 70% Right RBAC Editor Workspace */}
          <div className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto space-y-5 sm:space-y-6">
            {/* Section 1: Role RBAC Assignment */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs space-y-3 sm:space-y-4">
              <div className="flex items-center gap-2">
                <KeyIcon className="h-5 w-5 text-[#087f80]" />
                <h4 className="text-sm font-bold text-[#092f45]">RBAC Role Assignment</h4>
              </div>
              <p className="text-xs text-slate-500">
                Assign system permissions. Role transitions update system access policies across all client interfaces.
              </p>

              <div className="grid grid-cols-2 gap-2 sm:gap-3 sm:grid-cols-4">
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
                      className={`rounded-xl border p-2.5 sm:p-3 text-left transition-all ${
                        isSelected
                          ? "border-[#087f80] bg-[#087f80]/10 text-[#087f80] ring-2 ring-[#087f80]/30"
                          : "border-slate-200 bg-slate-50/60 text-slate-700 hover:bg-slate-100"
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

            {/* Section 2: Account Lock & Suspension Control */}
            <div className={`rounded-2xl border p-4 sm:p-5 shadow-xs space-y-3 sm:space-y-4 ${
              tempRole === "Admin"
                ? "border-slate-200 bg-slate-50/70"
                : "border-slate-200 bg-white"
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <LockClosedIcon className={`h-5 w-5 ${tempRole === "Admin" ? "text-slate-400" : "text-[#f04f3e]"}`} />
                  <h4 className="text-sm font-bold text-[#092f45]">Account Suspension & Lockout</h4>
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
                <div className="rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-600">
                  <p className="font-semibold text-[#092f45]">🛡️ System Policy: Admin accounts cannot be suspended</p>
                  <p className="mt-0.5 text-[11px] text-slate-500">
                    To preserve system governance and root availability, administrators cannot be locked or suspended. If this operator requires offboarding, reassign their role to User or Manager first.
                  </p>
                </div>
              ) : (
                <p className="text-xs text-slate-500">
                  When suspended, the user cannot log in, initiate SOS requests, accept translator calls, or access backoffice dashboards.
                </p>
              )}

              {tempRole !== "Admin" && tempIsLocked && (
                <div className="space-y-2 animate-in fade-in">
                  <label className="block text-xs font-bold text-[#f04f3e]">
                    Reason for Account Suspension (Mandatory for Audit Trail):
                  </label>
                  <textarea
                    rows={3}
                    value={tempLockReason}
                    onChange={(e) => setTempLockReason(e.target.value)}
                    placeholder="e.g. Disciplinary breach, false distress signal generation, or security compromise..."
                    className="w-full rounded-xl border border-red-300 bg-red-50/20 p-3 text-xs text-slate-800 placeholder-slate-400 focus:border-[#f04f3e] focus:outline-none focus:ring-1 focus:ring-[#f04f3e]"
                  />
                </div>
              )}
            </div>

            {/* Section 3: Interpreter Feedback & Quality Log */}
            {user.interpreterStats && (
              <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-[#092f45]">Recent Performance Reviews</h4>
                  <span className="inline-flex items-center gap-1 font-bold text-xs text-amber-600 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
                    <StarIcon className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                    <span>Rating {user.interpreterStats.rating} / 5.0</span>
                  </span>
                </div>
                <div className="space-y-2">
                  {user.interpreterStats.feedbackHighlights.map((fb, idx) => (
                    <div key={idx} className="rounded-lg bg-slate-50 border border-slate-200/60 p-3 text-xs text-slate-600">
                      “{fb}”
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex min-h-[3.5rem] flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 border-t border-slate-200 bg-slate-50 px-4 sm:px-6 py-2.5 sm:py-3">
          <span className="text-[11px] sm:text-xs text-slate-400 text-center sm:text-left">
            Action will be permanently recorded in System Audit Trail
          </span>
          <div className="flex items-center justify-end gap-2 sm:gap-3">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onSave}
              className="w-full sm:w-auto rounded-xl bg-[#087f80] px-5 py-2 text-xs font-bold text-white shadow-md shadow-[#087f80]/20 hover:bg-[#087f80]/90 transition-all"
            >
              Save Security Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

