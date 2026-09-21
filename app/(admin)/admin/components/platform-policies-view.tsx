"use client";

import { useState } from "react";
import {
  ArrowPathIcon,
  CheckBadgeIcon,
  CheckIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  LanguageIcon,
  MinusIcon,
  PlusIcon,
  ShieldCheckIcon,
  ShieldExclamationIcon,
  SignalIcon,
  StarIcon,
  XMarkIcon,
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-lg sm:text-xl font-bold text-[#092f45]">
              Platform Policies & System Governance
            </h2>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700 border border-emerald-200">
              <CheckBadgeIcon className="h-3.5 w-3.5 text-emerald-600" />
              Active
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-end sm:self-center">
          <button
            type="button"
            onClick={handleResetToDefault}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer"
            title="Reset to baseline defaults"
          >
            <ArrowPathIcon className="h-3.5 w-3.5 text-slate-400" />
            <span>Reset Defaults</span>
          </button>

          <button
            type="submit"
            disabled={!hasUnsavedChanges}
            className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-bold text-white transition-all cursor-pointer shadow-xs ${
              hasUnsavedChanges
                ? "bg-[#087f80] hover:bg-[#066869]"
                : "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
            }`}
          >
            <CheckIcon className="h-4 w-4" />
            <span>{hasUnsavedChanges ? "Save Changes" : "Up to Date"}</span>
          </button>
        </div>
      </div>

      {/* Unsaved Changes Alert Pill */}
      {hasUnsavedChanges && (
        <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50/90 px-4 py-2.5 text-xs font-semibold text-amber-900 shadow-2xs animate-in fade-in">
          <ExclamationTriangleIcon className="h-4 w-4 text-amber-600 shrink-0" />
          <span>You have unsaved policy changes. Click &ldquo;Save Changes&rdquo; to apply them across the platform.</span>
        </div>
      )}

      {/* 2. Structured Compact Studio Grid Layout (Option A) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        
        {/* CARD 1: EMERGENCY SOS & DISPATCH RULES */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-50 text-[#087f80]">
                <SignalIcon className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#092f45]">
                  1. SOS & Dispatch Configuration
                </h3>
                <p className="text-[11px] text-slate-400">
                  Incident radius, volunteer SLA window, and guest access
                </p>
              </div>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
              SLA
            </span>
          </div>

          <div className="space-y-4 text-xs">
            {/* 1.1 Search Radius */}
            <div className="flex items-center justify-between gap-4">
              <div>
                <label className="font-semibold text-slate-800 block">
                  Volunteer Search Radius
                </label>
                <span className="text-[11px] text-slate-400">
                  Max distance to broadcast alerts to qualified nearby volunteers
                </span>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-0.5 shadow-2xs shrink-0 w-32">
                <button
                  type="button"
                  onClick={() => updateField("sosDispatchRadiusKm", Math.max(1, formData.sosDispatchRadiusKm - 5))}
                  disabled={formData.sosDispatchRadiusKm <= 1}
                  className="flex h-7 w-7 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-800 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors shrink-0"
                  title="Decrease radius (-5 km)"
                >
                  <MinusIcon className="h-3.5 w-3.5" />
                </button>
                <div className="flex items-baseline justify-center flex-1 text-center">
                  <span className="font-bold text-slate-900 text-sm">
                    {formData.sosDispatchRadiusKm}
                  </span>
                  <span className="ml-1 text-[11px] font-medium text-slate-500">
                    km
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => updateField("sosDispatchRadiusKm", Math.min(100, formData.sosDispatchRadiusKm + 5))}
                  disabled={formData.sosDispatchRadiusKm >= 100}
                  className="flex h-7 w-7 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-800 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors shrink-0"
                  title="Increase radius (+5 km)"
                >
                  <PlusIcon className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* 1.2 SLA Window */}
            <div className="flex items-center justify-between gap-4 pt-2 border-t border-slate-100">
              <div>
                <label className="font-semibold text-slate-800 flex items-center gap-1.5">
                  <span>Auto-Escalation SLA Window</span>
                  <ClockIcon className="h-3.5 w-3.5 text-slate-400" />
                </label>
                <span className="text-[11px] text-slate-400">
                  Alert Field Managers if no volunteer claims within this window
                </span>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-0.5 shadow-2xs shrink-0 w-32">
                <button
                  type="button"
                  onClick={() => updateField("autoEscalateTicketMinutes", Math.max(5, formData.autoEscalateTicketMinutes - 5))}
                  disabled={formData.autoEscalateTicketMinutes <= 5}
                  className="flex h-7 w-7 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-800 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors shrink-0"
                  title="Decrease SLA window (-5 mins)"
                >
                  <MinusIcon className="h-3.5 w-3.5" />
                </button>
                <div className="flex items-baseline justify-center flex-1 text-center">
                  <span className="font-bold text-slate-900 text-sm">
                    {formData.autoEscalateTicketMinutes}
                  </span>
                  <span className="ml-1 text-[11px] font-medium text-slate-500">
                    mins
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => updateField("autoEscalateTicketMinutes", Math.min(180, formData.autoEscalateTicketMinutes + 5))}
                  disabled={formData.autoEscalateTicketMinutes >= 180}
                  className="flex h-7 w-7 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-800 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors shrink-0"
                  title="Increase SLA window (+5 mins)"
                >
                  <PlusIcon className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* 1.3 Guest SOS Toggle */}
            <div className="flex items-center justify-between gap-4 pt-2 border-t border-slate-100">
              <div>
                <span className="font-semibold text-slate-800 block">
                  Allow Guest SOS Broadcasts
                </span>
                <span className="text-[11px] text-slate-400">
                  Enable distress broadcast without mandatory prior login
                </span>
              </div>
              <label className="relative inline-flex cursor-pointer items-center shrink-0">
                <input
                  type="checkbox"
                  checked={formData.allowGuestSosRequests}
                  onChange={(e) => updateField("allowGuestSosRequests", e.target.checked)}
                  className="peer sr-only"
                />
                <div className="peer h-5 w-9 rounded-full bg-slate-200 after:absolute after:top-[2px] after:left-[2px] after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-all peer-checked:bg-[#087f80] peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
              </label>
            </div>
          </div>
        </div>

        {/* CARD 2: VOLUNTEER SAFEGUARDS & ABUSE CONTROL */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                <ShieldCheckIcon className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#092f45]">
                  2. Quality & Anti-Abuse Safeguards
                </h3>
                <p className="text-[11px] text-slate-400">
                  Rating threshold, false alarm lockouts, and ID enforcement
                </p>
              </div>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
              Safety
            </span>
          </div>

          <div className="space-y-4 text-xs">
            {/* 2.1 Minimum Rating Threshold */}
            <div className="flex items-center justify-between gap-4">
              <div>
                <label className="font-semibold text-slate-800 flex items-center gap-1.5">
                  <span>Minimum Rating Threshold</span>
                  <StarIcon className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                </label>
                <span className="text-[11px] text-slate-400">
                  Flag volunteers whose cumulative rating drops below baseline
                </span>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-0.5 shadow-2xs shrink-0 w-32">
                <button
                  type="button"
                  onClick={() => updateField("interpreterMinRatingThreshold", Number(Math.max(1.0, formData.interpreterMinRatingThreshold - 0.1).toFixed(1)))}
                  disabled={formData.interpreterMinRatingThreshold <= 1.0}
                  className="flex h-7 w-7 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-800 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors shrink-0"
                  title="Decrease rating threshold (-0.1)"
                >
                  <MinusIcon className="h-3.5 w-3.5" />
                </button>
                <div className="flex items-center justify-center flex-1 text-center">
                  <span className="font-bold text-slate-900 text-sm">
                    {formData.interpreterMinRatingThreshold.toFixed(1)}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => updateField("interpreterMinRatingThreshold", Number(Math.min(5.0, formData.interpreterMinRatingThreshold + 0.1).toFixed(1)))}
                  disabled={formData.interpreterMinRatingThreshold >= 5.0}
                  className="flex h-7 w-7 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-800 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors shrink-0"
                  title="Increase rating threshold (+0.1)"
                >
                  <PlusIcon className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* 2.2 Max False Alarms */}
            <div className="flex items-center justify-between gap-4 pt-2 border-t border-slate-100">
              <div>
                <label className="font-semibold text-slate-800 flex items-center gap-1.5">
                  <span>Max False Alarms Before Lock</span>
                  <ShieldExclamationIcon className="h-3.5 w-3.5 text-red-500" />
                </label>
                <span className="text-[11px] text-slate-400">
                  Confirmed fake SOS requests triggering automatic soft-lock
                </span>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-0.5 shadow-2xs shrink-0 w-32">
                <button
                  type="button"
                  onClick={() => updateField("maxFalseAlarmsBeforeAutoLock", Math.max(1, formData.maxFalseAlarmsBeforeAutoLock - 1))}
                  disabled={formData.maxFalseAlarmsBeforeAutoLock <= 1}
                  className="flex h-7 w-7 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-800 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors shrink-0"
                  title="Decrease strike allowance (-1 strike)"
                >
                  <MinusIcon className="h-3.5 w-3.5" />
                </button>
                <div className="flex items-baseline justify-center flex-1 text-center">
                  <span className="font-bold text-slate-900 text-sm">
                    {formData.maxFalseAlarmsBeforeAutoLock}
                  </span>
                  <span className="ml-1 text-[11px] font-medium text-slate-500">
                    Strikes
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => updateField("maxFalseAlarmsBeforeAutoLock", Math.min(10, formData.maxFalseAlarmsBeforeAutoLock + 1))}
                  disabled={formData.maxFalseAlarmsBeforeAutoLock >= 10}
                  className="flex h-7 w-7 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-800 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors shrink-0"
                  title="Increase strike allowance (+1 strike)"
                >
                  <PlusIcon className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* 2.3 ID Verification Toggle */}
            <div className="flex items-center justify-between gap-4 pt-2 border-t border-slate-100">
              <div>
                <span className="font-semibold text-slate-800 block">
                  Mandatory ID / Passport Verification
                </span>
                <span className="text-[11px] text-slate-400">
                  Require verified identity documents before approving volunteer status
                </span>
              </div>
              <label className="relative inline-flex cursor-pointer items-center shrink-0">
                <input
                  type="checkbox"
                  checked={formData.mandatoryIdVerification}
                  onChange={(e) => updateField("mandatoryIdVerification", e.target.checked)}
                  className="peer sr-only"
                />
                <div className="peer h-5 w-9 rounded-full bg-slate-200 after:absolute after:top-[2px] after:left-[2px] after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-all peer-checked:bg-[#087f80] peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
              </label>
            </div>
          </div>
        </div>

        {/* CARD 3: OPERATIONAL TAXONOMIES & MASTER CATALOGS (SPAN FULL WIDTH) */}
        <div className="col-span-1 lg:col-span-2 rounded-xl border border-slate-200 bg-white p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <LanguageIcon className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#092f45]">
                  3. Operational Taxonomies & Master Catalogs
                </h3>
                <p className="text-[11px] text-slate-400">
                  Active languages and service specialty categories available across the platform
                </p>
              </div>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
              Taxonomy
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            {/* 3.1 Languages Catalog */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="font-bold text-slate-800 flex items-center gap-1.5">
                  <span>Supported Languages ({formData.languagesCatalog.length})</span>
                  <LanguageIcon className="h-3.5 w-3.5 text-[#087f80]" />
                </label>
              </div>

              {/* Add Language Inline */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newLanguage}
                  onChange={(e) => setNewLanguage(e.target.value)}
                  placeholder="New language (e.g. French, Arabic)..."
                  className="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:border-[#087f80] focus:outline-none"
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
                  className="inline-flex items-center gap-1 rounded-lg bg-[#087f80] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#066869] transition-colors cursor-pointer shrink-0"
                >
                  <PlusIcon className="h-3.5 w-3.5" />
                  <span>Add</span>
                </button>
              </div>

              {/* Language Pills */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {formData.languagesCatalog.map((lang) => (
                  <span
                    key={lang}
                    className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700"
                  >
                    <span>{lang}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveLanguage(lang)}
                      className="text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                      title={`Remove ${lang}`}
                    >
                      <XMarkIcon className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* 3.2 Specialty Categories */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="font-bold text-slate-800 flex items-center gap-1.5">
                  <span>Specialty Categories ({formData.specialtyCategories.length})</span>
                  <ShieldCheckIcon className="h-3.5 w-3.5 text-[#087f80]" />
                </label>
              </div>

              {/* Add Category Inline */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="New domain (e.g. Legal, Tourism)..."
                  className="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:border-[#087f80] focus:outline-none"
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
                  className="inline-flex items-center gap-1 rounded-lg bg-[#087f80] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#066869] transition-colors cursor-pointer shrink-0"
                >
                  <PlusIcon className="h-3.5 w-3.5" />
                  <span>Add</span>
                </button>
              </div>

              {/* Category Pills */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {formData.specialtyCategories.map((cat) => (
                  <span
                    key={cat}
                    className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700"
                  >
                    <span>{cat}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveCategory(cat)}
                      className="text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                      title={`Remove ${cat}`}
                    >
                      <XMarkIcon className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Audit Information */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-t border-slate-200 pt-4 text-xs text-slate-400">
        <div>
          Last Policy Audit: <strong className="text-slate-600 font-semibold">{formData.lastUpdated || "2026-09-17 10:00:00"}</strong> by <strong className="text-slate-600 font-semibold">{formData.updatedBy || "Super Admin"}</strong>
        </div>
        <div>
          All modifications trigger an immutable entry in the Security Audit Trail.
        </div>
      </div>
    </form>
  );
}
