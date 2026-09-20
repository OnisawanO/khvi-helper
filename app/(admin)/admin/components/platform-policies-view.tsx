"use client";

import { useState } from "react";
import {
  ArrowPathIcon,
  CheckBadgeIcon,
  CheckIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  LanguageIcon,
  PlusIcon,
  ShieldCheckIcon,
  ShieldExclamationIcon,
  SignalIcon,
  StarIcon,
} from "@heroicons/react/24/outline";
import { SystemSettingsConfig } from "../types";
import { initialSystemSettings } from "../mock-data";

interface PlatformPoliciesViewProps {
  settings: SystemSettingsConfig;
  onSave: (newSettings: SystemSettingsConfig) => void;
}

export function PlatformPoliciesView({ settings, onSave }: PlatformPoliciesViewProps) {
  const [formData, setFormData] = useState<SystemSettingsConfig>({ ...settings });
  const [newLanguage, setNewLanguage] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const updateField = <K extends keyof SystemSettingsConfig>(key: K, value: SystemSettingsConfig[K]) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
    setHasUnsavedChanges(true);
  };

  const handleAddLanguage = () => {
    const trimmed = newLanguage.trim();
    if (!trimmed) return;
    if (formData.languagesCatalog.some((l) => l.toLowerCase() === trimmed.toLowerCase())) {
      alert("Language already exists in the catalog.");
      return;
    }
    updateField("languagesCatalog", [...formData.languagesCatalog, trimmed]);
    setNewLanguage("");
  };

  const handleRemoveLanguage = (lang: string) => {
    if (formData.languagesCatalog.length <= 2) {
      alert("Platform policy requires at least 2 active primary operational languages.");
      return;
    }
    updateField(
      "languagesCatalog",
      formData.languagesCatalog.filter((l) => l !== lang)
    );
  };

  const handleAddCategory = () => {
    const trimmed = newCategory.trim();
    if (!trimmed) return;
    if (formData.specialtyCategories.some((c) => c.toLowerCase() === trimmed.toLowerCase())) {
      alert("Category taxonomy already exists.");
      return;
    }
    updateField("specialtyCategories", [...formData.specialtyCategories, trimmed]);
    setNewCategory("");
  };

  const handleRemoveCategory = (cat: string) => {
    if (formData.specialtyCategories.length <= 2) {
      alert("Platform policy requires at least 2 service specialty categories.");
      return;
    }
    updateField(
      "specialtyCategories",
      formData.specialtyCategories.filter((c) => c !== cat)
    );
  };

  const handleResetToDefault = () => {
    if (confirm("Reset all platform governance parameters to system defaults?")) {
      setFormData({ ...initialSystemSettings });
      setHasUnsavedChanges(true);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      lastUpdated: new Date().toISOString().replace("T", " ").slice(0, 19),
    });
    setHasUnsavedChanges(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in duration-200">
      {/* 1. Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-3xl border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-[#edf7f5]/40 p-6 shadow-xs">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#087f80] text-white shadow-md shadow-[#087f80]/20">
            <ShieldCheckIcon className="h-7 w-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black text-[#092f45]">
                Platform Policies & System Governance
              </h2>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                <CheckBadgeIcon className="h-3 w-3 text-emerald-600" />
                Active Enforcement
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Global operational rules controlling emergency SOS dispatch, volunteer accreditation, and anti-abuse safeguards.
            </p>
          </div>
        </div>

        {/* Action Controls in Header */}
        <div className="flex items-center gap-2 self-end sm:self-center">
          <button
            type="button"
            onClick={handleResetToDefault}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all cursor-pointer shadow-2xs"
            title="Reset to factory baseline defaults"
          >
            <ArrowPathIcon className="h-3.5 w-3.5 text-slate-400" />
            <span>Reset Defaults</span>
          </button>

          <button
            type="submit"
            disabled={!hasUnsavedChanges}
            className={`inline-flex items-center gap-2 rounded-xl px-5 py-2 text-xs font-black text-white shadow-md transition-all cursor-pointer ${
              hasUnsavedChanges
                ? "bg-[#087f80] hover:bg-[#066869] shadow-[#087f80]/25 scale-102 ring-2 ring-[#087f80]/30"
                : "bg-slate-300 text-slate-500 cursor-not-allowed shadow-none"
            }`}
          >
            <CheckIcon className="h-4 w-4 stroke-[3]" />
            <span>{hasUnsavedChanges ? "Save Modifications" : "Policies Up to Date"}</span>
          </button>
        </div>
      </div>

      {/* Unsaved Changes Notification Pill */}
      {hasUnsavedChanges && (
        <div className="flex items-center justify-between rounded-2xl border border-amber-300 bg-amber-50/90 px-4 py-3 text-xs font-bold text-amber-900 shadow-xs animate-in fade-in slide-in-from-top-1">
          <div className="flex items-center gap-2">
            <ExclamationTriangleIcon className="h-5 w-5 text-amber-600 shrink-0" />
            <span>You have unsaved policy changes. Click &ldquo;Save Modifications&rdquo; to apply them across the platform.</span>
          </div>
          <button
            type="submit"
            className="rounded-lg bg-amber-600 px-3 py-1 text-xs font-extrabold text-white hover:bg-amber-700 cursor-pointer shadow-2xs"
          >
            Save Now
          </button>
        </div>
      )}

      {/* 2. Grid of 3 Essential Governance Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* SECTION 1: EMERGENCY SOS & DISPATCH RULES */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-5 flex flex-col justify-between">
          <div className="space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-teal-50 text-[#087f80]">
                  <SignalIcon className="h-4 w-4" />
                </div>
                <h3 className="text-sm font-extrabold text-[#092f45]">
                  1. SOS & Dispatch
                </h3>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                SLA
              </span>
            </div>

            {/* Setting 1.1: SOS Dispatch Radius */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800">
                  Volunteer Search Radius
                </label>
                <span className="rounded-full bg-[#edf7f5] px-2.5 py-0.5 text-xs font-black text-[#087f80] border border-[#087f80]/20">
                  {formData.sosDispatchRadiusKm} km
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Maximum distance to notify available nearby volunteers.
              </p>
              <input
                type="range"
                min={3}
                max={50}
                step={1}
                value={formData.sosDispatchRadiusKm}
                onChange={(e) => updateField("sosDispatchRadiusKm", Number(e.target.value))}
                className="w-full accent-[#087f80] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-semibold">
                <span>3 km (Urban)</span>
                <span>15 km (Std)</span>
                <span>50 km (Wide)</span>
              </div>
            </div>

            {/* Setting 1.2: Ticket Auto-Escalation SLA */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <ClockIcon className="h-3.5 w-3.5 text-red-500" />
                  Unclaimed Auto-Escalate
                </label>
                <span className="rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-black text-red-700 border border-red-200">
                  {formData.autoEscalateTicketMinutes} mins
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Trigger priority alert to Field Managers if request stays unassigned.
              </p>
              <input
                type="range"
                min={5}
                max={60}
                step={5}
                value={formData.autoEscalateTicketMinutes}
                onChange={(e) => updateField("autoEscalateTicketMinutes", Number(e.target.value))}
                className="w-full accent-red-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-semibold">
                <span>5 mins</span>
                <span>20 mins</span>
                <span>60 mins</span>
              </div>
            </div>
          </div>

          {/* Setting 1.3: Guest SOS Toggle */}
          <div className="pt-3 border-t border-slate-100">
            <label className="flex items-start justify-between gap-2 cursor-pointer p-2 rounded-xl hover:bg-slate-50 transition-colors">
              <div>
                <span className="text-xs font-bold text-slate-800">
                  Allow Guest SOS
                </span>
                <p className="text-[11px] text-slate-500">
                  Allow tourists in distress to request help without logging in first.
                </p>
              </div>
              <input
                type="checkbox"
                checked={formData.allowGuestSosRequests}
                onChange={(e) => updateField("allowGuestSosRequests", e.target.checked)}
                className="h-4 w-4 mt-0.5 accent-[#087f80] rounded cursor-pointer"
              />
            </label>
          </div>
        </div>

        {/* SECTION 2: VOLUNTEER ACCREDITATION & PLATFORM SAFEGUARDS */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-5 flex flex-col justify-between">
          <div className="space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                  <StarIcon className="h-4 w-4 fill-amber-500" />
                </div>
                <h3 className="text-sm font-extrabold text-[#092f45]">
                  2. Quality & Safeguards
                </h3>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Standards
              </span>
            </div>

            {/* Setting 2.1: Rating Threshold */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800">
                  Min Rating Threshold
                </label>
                <span className="rounded-full bg-amber-50 border border-amber-200 px-2.5 py-0.5 text-xs font-black text-amber-700">
                  ★ {formData.interpreterMinRatingThreshold} / 5.0
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Interpreters falling below this rating are flagged for review.
              </p>
              <input
                type="range"
                min={3.0}
                max={4.8}
                step={0.1}
                value={formData.interpreterMinRatingThreshold}
                onChange={(e) => updateField("interpreterMinRatingThreshold", Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-semibold">
                <span>3.0</span>
                <span>3.5 (Default)</span>
                <span>4.8</span>
              </div>
            </div>

            {/* Setting 2.2: Max False Alarms */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <ShieldExclamationIcon className="h-3.5 w-3.5 text-red-500" />
                  Max False Alarms Before Lock
                </label>
                <span className="rounded-full bg-red-50 border border-red-200 px-2.5 py-0.5 text-xs font-black text-red-700">
                  {formData.maxFalseAlarmsBeforeAutoLock} reports
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Confirmed fake emergency requests before account is locked.
              </p>
              <input
                type="range"
                min={1}
                max={5}
                step={1}
                value={formData.maxFalseAlarmsBeforeAutoLock}
                onChange={(e) => updateField("maxFalseAlarmsBeforeAutoLock", Number(e.target.value))}
                className="w-full accent-red-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-semibold">
                <span>1 strike</span>
                <span>3 strikes</span>
                <span>5 strikes</span>
              </div>
            </div>
          </div>

          {/* Setting 2.3: Mandatory ID Verification Toggle */}
          <div className="pt-3 border-t border-slate-100">
            <label className="flex items-start justify-between gap-2 cursor-pointer p-2 rounded-xl hover:bg-slate-50 transition-colors">
              <div>
                <span className="text-xs font-bold text-slate-800">
                  Enforce ID/Passport Verification
                </span>
                <p className="text-[11px] text-slate-500">
                  Require verified identity documents before approving volunteers.
                </p>
              </div>
              <input
                type="checkbox"
                checked={formData.mandatoryIdVerification}
                onChange={(e) => updateField("mandatoryIdVerification", e.target.checked)}
                className="h-4 w-4 mt-0.5 accent-[#087f80] rounded cursor-pointer"
              />
            </label>
          </div>
        </div>

        {/* SECTION 3: TAXONOMIES & MASTER CATALOGS */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <LanguageIcon className="h-4 w-4" />
              </div>
              <h3 className="text-sm font-extrabold text-[#092f45]">
                3. Languages & Categories
              </h3>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Catalogs
            </span>
          </div>

          {/* Sub-section: Languages */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <LanguageIcon className="h-3.5 w-3.5 text-[#087f80]" />
                Supported Languages ({formData.languagesCatalog.length})
              </label>
            </div>
            <div className="flex gap-1.5">
              <input
                type="text"
                value={newLanguage}
                onChange={(e) => setNewLanguage(e.target.value)}
                placeholder="Add language..."
                className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-800 focus:border-[#087f80] focus:bg-white focus:outline-none"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddLanguage();
                  }
                }}
              />
              <button
                type="button"
                onClick={handleAddLanguage}
                className="inline-flex items-center gap-1 rounded-xl bg-[#087f80] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#066869] cursor-pointer"
              >
                <PlusIcon className="h-3.5 w-3.5" />
                <span>Add</span>
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1 pt-1">
              {formData.languagesCatalog.map((lang) => (
                <span
                  key={lang}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50/80 px-2 py-0.5 text-[11px] font-semibold text-slate-700"
                >
                  <span>{lang}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveLanguage(lang)}
                    className="text-slate-400 hover:text-red-500 cursor-pointer text-sm leading-none"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Sub-section: Categories */}
          <div className="space-y-2 pt-3 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <ShieldCheckIcon className="h-3.5 w-3.5 text-[#087f80]" />
                Service Categories ({formData.specialtyCategories.length})
              </label>
            </div>
            <div className="flex gap-1.5">
              <input
                type="text"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="Add category..."
                className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-800 focus:border-[#087f80] focus:bg-white focus:outline-none"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddCategory();
                  }
                }}
              />
              <button
                type="button"
                onClick={handleAddCategory}
                className="inline-flex items-center gap-1 rounded-xl bg-[#087f80] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#066869] cursor-pointer"
              >
                <PlusIcon className="h-3.5 w-3.5" />
                <span>Add</span>
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1 pt-1">
              {formData.specialtyCategories.map((cat) => (
                <span
                  key={cat}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50/80 px-2 py-0.5 text-[11px] font-semibold text-slate-700"
                >
                  <span>{cat}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveCategory(cat)}
                    className="text-slate-400 hover:text-red-500 cursor-pointer text-sm leading-none"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer Audit Information */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-xs text-slate-500">
        <div>
          Last Policy Audit: <strong>{formData.lastUpdated || "2026-09-17 10:00:00"}</strong> by <strong>{formData.updatedBy || "Super Admin"}</strong>
        </div>
        <div className="text-[11px] text-slate-400">
          All modifications trigger an immutable entry in the Security Audit Trail.
        </div>
      </div>
    </form>
  );
}
