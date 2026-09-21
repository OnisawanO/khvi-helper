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
      {/* 1. Header Banner (Clean & Frameless) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 py-2">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-lg sm:text-xl font-black text-[#092f45]">
              Platform Policies & System Governance
            </h2>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 border border-emerald-200">
              <CheckBadgeIcon className="h-3.5 w-3.5 text-emerald-600" />
              Active Enforcement
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Global operational rules controlling emergency SOS dispatch, volunteer accreditation, and anti-abuse safeguards.
          </p>
        </div>

        {/* Action Controls in Header */}
        <div className="flex items-center gap-2.5 self-end sm:self-center">
          <button
            type="button"
            onClick={handleResetToDefault}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all cursor-pointer shadow-2xs"
            title="Reset to factory baseline defaults"
          >
            <ArrowPathIcon className="h-4 w-4 text-slate-400" />
            <span>Reset Defaults</span>
          </button>

          <button
            type="submit"
            disabled={!hasUnsavedChanges}
            className={`inline-flex items-center gap-2 rounded-xl px-5 py-2 text-sm font-black text-white shadow-md transition-all cursor-pointer ${
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

      {/* Unsaved Changes Notification Pill (Informational Only, No Redundant Button) */}
      {hasUnsavedChanges && (
        <div className="flex items-center gap-2.5 rounded-2xl border border-amber-300 bg-amber-50/90 px-4 py-3.5 text-sm font-bold text-amber-900 shadow-xs animate-in fade-in slide-in-from-top-1">
          <ExclamationTriangleIcon className="h-5 w-5 text-amber-600 shrink-0" />
          <span>You have unsaved policy changes. Click &ldquo;Save Modifications&rdquo; above to apply them across the platform.</span>
        </div>
      )}

      {/* 2. Flat Canvas Sections with Clean Hairline Dividers */}
      <div className="space-y-10">
        {/* SECTION 1: EMERGENCY SOS & DISPATCH RULES */}
        <div className="space-y-2">
          {/* Section Header */}
          <div className="pb-3 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-50 text-[#087f80]">
                <SignalIcon className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-[#092f45]">
                  1. SOS & Automated Dispatch Rules
                </h3>
                <p className="text-xs text-slate-500">
                  Configure incident radius, volunteer dispatching SLAs, and access permissions.
                </p>
              </div>
            </div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-teal-700 bg-teal-50 border border-teal-200 px-2.5 py-0.5 rounded-full">
              SLA Enforcement
            </span>
          </div>

          {/* Section Rows */}
          <div className="divide-y divide-slate-100">
            {/* Setting 1.1: SOS Dispatch Radius */}
            <div className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 px-1 rounded-lg transition-colors">
              <div className="max-w-xl space-y-0.5">
                <div className="flex items-center gap-2">
                  <label className="text-sm font-bold text-slate-900">
                    Volunteer Search Radius
                  </label>
                  <span className="text-[11px] font-semibold text-teal-700 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-md">
                    Target: 3 - 50 km
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                  Maximum distance from incident location to broadcast alerts to qualified nearby volunteers.
                </p>
              </div>
              <div className="shrink-0">
                <div className="flex items-center w-48 sm:w-52 rounded-xl border border-slate-200 bg-slate-50 shadow-2xs focus-within:border-[#087f80] focus-within:ring-2 focus-within:ring-[#087f80]/20 focus-within:bg-white transition-all overflow-hidden">
                  <button
                    type="button"
                    onClick={() => updateField("sosDispatchRadiusKm", Math.max(1, formData.sosDispatchRadiusKm - 1))}
                    className="flex h-10 w-10 shrink-0 items-center justify-center text-slate-500 hover:bg-slate-200/70 hover:text-slate-900 active:bg-slate-300/60 transition-colors cursor-pointer border-r border-slate-200"
                    title="Decrease by 1 km"
                  >
                    <span className="text-lg font-bold select-none">−</span>
                  </button>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    step={1}
                    value={formData.sosDispatchRadiusKm}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      if (!isNaN(val)) updateField("sosDispatchRadiusKm", val);
                    }}
                    className="w-full bg-transparent px-2 py-2 text-sm sm:text-base font-black text-[#092f45] text-center focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <button
                    type="button"
                    onClick={() => updateField("sosDispatchRadiusKm", Math.min(100, formData.sosDispatchRadiusKm + 1))}
                    className="flex h-10 w-10 shrink-0 items-center justify-center text-slate-500 hover:bg-slate-200/70 hover:text-slate-900 active:bg-slate-300/60 transition-colors cursor-pointer border-l border-slate-200"
                    title="Increase by 1 km"
                  >
                    <span className="text-lg font-bold select-none">+</span>
                  </button>
                  <div className="shrink-0 bg-slate-100 border-l border-slate-200 px-3 py-2 text-xs sm:text-sm font-bold text-slate-700 select-none">
                    km
                  </div>
                </div>
              </div>
            </div>

            {/* Setting 1.2: Ticket Auto-Escalation SLA */}
            <div className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 px-1 rounded-lg transition-colors">
              <div className="max-w-xl space-y-0.5">
                <div className="flex items-center gap-2">
                  <ClockIcon className="h-4 w-4 text-red-500 shrink-0" />
                  <label className="text-sm font-bold text-slate-900">
                    Auto-Escalation SLA Window
                  </label>
                  <span className="text-[11px] font-semibold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded-md">
                    SLA: 5 - 60 mins
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                  If no volunteer claims the assignment within this window, an urgent alert triggers for Field Managers.
                </p>
              </div>
              <div className="shrink-0">
                <div className="flex items-center w-48 sm:w-52 rounded-xl border border-slate-200 bg-slate-50 shadow-2xs focus-within:border-red-400 focus-within:ring-2 focus-within:ring-red-200 focus-within:bg-white transition-all overflow-hidden">
                  <button
                    type="button"
                    onClick={() => updateField("autoEscalateTicketMinutes", Math.max(1, formData.autoEscalateTicketMinutes - 5))}
                    className="flex h-10 w-10 shrink-0 items-center justify-center text-slate-500 hover:bg-slate-200/70 hover:text-slate-900 active:bg-slate-300/60 transition-colors cursor-pointer border-r border-slate-200"
                    title="Decrease by 5 mins"
                  >
                    <span className="text-lg font-bold select-none">−</span>
                  </button>
                  <input
                    type="number"
                    min={1}
                    max={180}
                    step={1}
                    value={formData.autoEscalateTicketMinutes}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      if (!isNaN(val)) updateField("autoEscalateTicketMinutes", val);
                    }}
                    className="w-full bg-transparent px-2 py-2 text-sm sm:text-base font-black text-[#092f45] text-center focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <button
                    type="button"
                    onClick={() => updateField("autoEscalateTicketMinutes", Math.min(180, formData.autoEscalateTicketMinutes + 5))}
                    className="flex h-10 w-10 shrink-0 items-center justify-center text-slate-500 hover:bg-slate-200/70 hover:text-slate-900 active:bg-slate-300/60 transition-colors cursor-pointer border-l border-slate-200"
                    title="Increase by 5 mins"
                  >
                    <span className="text-lg font-bold select-none">+</span>
                  </button>
                  <div className="shrink-0 bg-slate-100 border-l border-slate-200 px-3 py-2 text-xs sm:text-sm font-bold text-slate-700 select-none">
                    mins
                  </div>
                </div>
              </div>
            </div>

            {/* Setting 1.3: Guest SOS Toggle */}
            <div className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 px-1 rounded-lg transition-colors">
              <div className="max-w-xl space-y-0.5">
                <span className="text-sm font-bold text-slate-900 block">
                  Allow Guest SOS Broadcasts
                </span>
                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                  Allow tourists in distress to broadcast help requests immediately without mandatory prior authentication.
                </p>
              </div>
              <div className="shrink-0">
                <label className="inline-flex items-center gap-3 cursor-pointer p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.allowGuestSosRequests}
                    onChange={(e) => updateField("allowGuestSosRequests", e.target.checked)}
                    className="h-5 w-5 accent-[#087f80] rounded cursor-pointer"
                  />
                  <span className="text-xs sm:text-sm font-bold text-slate-700 select-none pr-1">
                    {formData.allowGuestSosRequests ? "Enabled (Public)" : "Disabled (Login Only)"}
                  </span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2: VOLUNTEER ACCREDITATION & PLATFORM SAFEGUARDS */}
        <div className="space-y-2">
          {/* Section Header */}
          <div className="pb-3 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                <StarIcon className="h-4 w-4 fill-amber-500" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-[#092f45]">
                  2. Quality Standards & Platform Safeguards
                </h3>
                <p className="text-xs text-slate-500">
                  Establish performance review baselines and automatic anti-abuse account restrictions.
                </p>
              </div>
            </div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full">
              Trust & Safety
            </span>
          </div>

          {/* Section Rows */}
          <div className="divide-y divide-slate-100">
            {/* Setting 2.1: Rating Threshold */}
            <div className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 px-1 rounded-lg transition-colors">
              <div className="max-w-xl space-y-0.5">
                <div className="flex items-center gap-2">
                  <label className="text-sm font-bold text-slate-900">
                    Minimum Review Rating Threshold
                  </label>
                  <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
                    Baseline: 3.5 ★
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                  Volunteers whose cumulative rating falls below this threshold will be flagged for managerial review.
                </p>
              </div>
              <div className="shrink-0">
                <div className="flex items-center w-48 sm:w-52 rounded-xl border border-slate-200 bg-slate-50 shadow-2xs focus-within:border-amber-400 focus-within:ring-2 focus-within:ring-amber-200 focus-within:bg-white transition-all overflow-hidden">
                  <button
                    type="button"
                    onClick={() =>
                      updateField(
                        "interpreterMinRatingThreshold",
                        Number(Math.max(1.0, formData.interpreterMinRatingThreshold - 0.1).toFixed(1))
                      )
                    }
                    className="flex h-10 w-10 shrink-0 items-center justify-center text-slate-500 hover:bg-slate-200/70 hover:text-slate-900 active:bg-slate-300/60 transition-colors cursor-pointer border-r border-slate-200"
                    title="Decrease by 0.1 stars"
                  >
                    <span className="text-lg font-bold select-none">−</span>
                  </button>
                  <input
                    type="number"
                    min={1.0}
                    max={5.0}
                    step={0.1}
                    value={formData.interpreterMinRatingThreshold}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      if (!isNaN(val)) updateField("interpreterMinRatingThreshold", val);
                    }}
                    className="w-full bg-transparent px-2 py-2 text-sm sm:text-base font-black text-[#092f45] text-center focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      updateField(
                        "interpreterMinRatingThreshold",
                        Number(Math.min(5.0, formData.interpreterMinRatingThreshold + 0.1).toFixed(1))
                      )
                    }
                    className="flex h-10 w-10 shrink-0 items-center justify-center text-slate-500 hover:bg-slate-200/70 hover:text-slate-900 active:bg-slate-300/60 transition-colors cursor-pointer border-l border-slate-200"
                    title="Increase by 0.1 stars"
                  >
                    <span className="text-lg font-bold select-none">+</span>
                  </button>
                  <div className="shrink-0 bg-slate-100 border-l border-slate-200 px-3 py-2 text-xs sm:text-sm font-bold text-slate-700 select-none">
                    ★ / 5.0
                  </div>
                </div>
              </div>
            </div>

            {/* Setting 2.2: Max False Alarms */}
            <div className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 px-1 rounded-lg transition-colors">
              <div className="max-w-xl space-y-0.5">
                <div className="flex items-center gap-2">
                  <ShieldExclamationIcon className="h-4 w-4 text-red-500 shrink-0" />
                  <label className="text-sm font-bold text-slate-900">
                    Max False Alarms Before Soft Lock
                  </label>
                  <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md">
                    Limit: 3 strikes
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                  Users with confirmed malicious or fake SOS requests exceeding this limit are automatically soft-locked.
                </p>
              </div>
              <div className="shrink-0">
                <div className="flex items-center w-48 sm:w-52 rounded-xl border border-slate-200 bg-slate-50 shadow-2xs focus-within:border-red-400 focus-within:ring-2 focus-within:ring-red-200 focus-within:bg-white transition-all overflow-hidden">
                  <button
                    type="button"
                    onClick={() =>
                      updateField("maxFalseAlarmsBeforeAutoLock", Math.max(1, formData.maxFalseAlarmsBeforeAutoLock - 1))
                    }
                    className="flex h-10 w-10 shrink-0 items-center justify-center text-slate-500 hover:bg-slate-200/70 hover:text-slate-900 active:bg-slate-300/60 transition-colors cursor-pointer border-r border-slate-200"
                    title="Decrease by 1 strike"
                  >
                    <span className="text-lg font-bold select-none">−</span>
                  </button>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    step={1}
                    value={formData.maxFalseAlarmsBeforeAutoLock}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      if (!isNaN(val)) updateField("maxFalseAlarmsBeforeAutoLock", val);
                    }}
                    className="w-full bg-transparent px-2 py-2 text-sm sm:text-base font-black text-[#092f45] text-center focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      updateField("maxFalseAlarmsBeforeAutoLock", Math.min(10, formData.maxFalseAlarmsBeforeAutoLock + 1))
                    }
                    className="flex h-10 w-10 shrink-0 items-center justify-center text-slate-500 hover:bg-slate-200/70 hover:text-slate-900 active:bg-slate-300/60 transition-colors cursor-pointer border-l border-slate-200"
                    title="Increase by 1 strike"
                  >
                    <span className="text-lg font-bold select-none">+</span>
                  </button>
                  <div className="shrink-0 bg-slate-100 border-l border-slate-200 px-3 py-2 text-xs sm:text-sm font-bold text-slate-700 select-none">
                    Strikes
                  </div>
                </div>
              </div>
            </div>

            {/* Setting 2.3: Mandatory ID Verification Toggle */}
            <div className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 px-1 rounded-lg transition-colors">
              <div className="max-w-xl space-y-0.5">
                <span className="text-sm font-bold text-slate-900 block">
                  Mandatory ID / Passport Verification
                </span>
                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                  Require verified identity documents and manager review before approving volunteers.
                </p>
              </div>
              <div className="shrink-0">
                <label className="inline-flex items-center gap-3 cursor-pointer p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.mandatoryIdVerification}
                    onChange={(e) => updateField("mandatoryIdVerification", e.target.checked)}
                    className="h-5 w-5 accent-[#087f80] rounded cursor-pointer"
                  />
                  <span className="text-xs sm:text-sm font-bold text-slate-700 select-none pr-1">
                    {formData.mandatoryIdVerification ? "Enforced (Required)" : "Optional (Self-declaration)"}
                  </span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 3: TAXONOMIES & MASTER CATALOGS */}
        <div className="space-y-2">
          {/* Section Header */}
          <div className="pb-3 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <LanguageIcon className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-[#092f45]">
                  3. Operational Taxonomies & Catalogs
                </h3>
                <p className="text-xs text-slate-500">
                  Manage active operational languages and volunteer specialty service categories.
                </p>
              </div>
            </div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full">
              System Taxonomy
            </span>
          </div>

          {/* Section Rows */}
          <div className="divide-y divide-slate-100">
            {/* Sub-section: Languages */}
            <div className="py-4 space-y-3 hover:bg-slate-50/40 px-1 rounded-lg transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <label className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <LanguageIcon className="h-4 w-4 text-[#087f80] shrink-0" />
                    <span>Supported Languages</span>
                    <span className="text-xs font-semibold text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full">
                      {formData.languagesCatalog.length} active
                    </span>
                  </label>
                  <p className="text-xs sm:text-sm text-slate-500">
                    Selectable by tourists for emergency SOS and volunteer matching (Min 2 required).
                  </p>
                </div>
                {/* Add Language Form */}
                <div className="flex gap-2 w-full sm:w-auto sm:min-w-[320px]">
                  <input
                    type="text"
                    value={newLanguage}
                    onChange={(e) => setNewLanguage(e.target.value)}
                    placeholder="Add operational language..."
                    className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs sm:text-sm text-slate-800 focus:border-[#087f80] focus:bg-white focus:outline-none"
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
                    className="inline-flex items-center gap-1.5 rounded-xl bg-[#087f80] px-4 py-2 text-xs sm:text-sm font-bold text-white hover:bg-[#066869] cursor-pointer shadow-2xs shrink-0"
                  >
                    <PlusIcon className="h-4 w-4" />
                    <span>Add</span>
                  </button>
                </div>
              </div>
              {/* Language Chips */}
              <div className="flex flex-wrap gap-2 pt-1">
                {formData.languagesCatalog.map((lang) => (
                  <span
                    key={lang}
                    className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50/90 px-3 py-1.5 text-xs sm:text-sm font-semibold text-slate-700 shadow-2xs"
                  >
                    <span>{lang}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveLanguage(lang)}
                      className="text-slate-400 hover:text-red-500 cursor-pointer text-base font-bold leading-none"
                      title={`Remove ${lang}`}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Sub-section: Categories */}
            <div className="py-4 space-y-3 hover:bg-slate-50/40 px-1 rounded-lg transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <label className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <ShieldCheckIcon className="h-4 w-4 text-[#087f80] shrink-0" />
                    <span>Specialty Service Categories</span>
                    <span className="text-xs font-semibold text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full">
                      {formData.specialtyCategories.length} active
                    </span>
                  </label>
                  <p className="text-xs sm:text-sm text-slate-500">
                    Domains used to classify emergency missions and volunteer qualifications (Min 2 required).
                  </p>
                </div>
                {/* Add Category Form */}
                <div className="flex gap-2 w-full sm:w-auto sm:min-w-[320px]">
                  <input
                    type="text"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    placeholder="Add specialty domain..."
                    className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs sm:text-sm text-slate-800 focus:border-[#087f80] focus:bg-white focus:outline-none"
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
                    className="inline-flex items-center gap-1.5 rounded-xl bg-[#087f80] px-4 py-2 text-xs sm:text-sm font-bold text-white hover:bg-[#066869] cursor-pointer shadow-2xs shrink-0"
                  >
                    <PlusIcon className="h-4 w-4" />
                    <span>Add</span>
                  </button>
                </div>
              </div>
              {/* Category Chips */}
              <div className="flex flex-wrap gap-2 pt-1">
                {formData.specialtyCategories.map((cat) => (
                  <span
                    key={cat}
                    className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50/90 px-3 py-1.5 text-xs sm:text-sm font-semibold text-slate-700 shadow-2xs"
                  >
                    <span>{cat}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveCategory(cat)}
                      className="text-slate-400 hover:text-red-500 cursor-pointer text-base font-bold leading-none"
                      title={`Remove ${cat}`}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Audit Information */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-t border-slate-200 pt-4 text-xs sm:text-sm text-slate-500">
        <div>
          Last Policy Audit: <strong className="text-slate-700">{formData.lastUpdated || "2026-09-17 10:00:00"}</strong> by <strong className="text-slate-700">{formData.updatedBy || "Super Admin"}</strong>
        </div>
        <div className="text-xs text-slate-400">
          All modifications trigger an immutable entry in the Security Audit Trail.
        </div>
      </div>
    </form>
  );
}
