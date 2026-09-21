"use client";

import { useState } from "react";
import {
  XMarkIcon,
  Cog6ToothIcon,
  LanguageIcon,
  ShieldCheckIcon,
  SignalIcon,
  StarIcon,
  ClockIcon,
  PlusIcon,
  MinusIcon,
  TrashIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";
import { SystemSettingsConfig } from "../types";

interface SystemSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: SystemSettingsConfig;
  onSave: (newSettings: SystemSettingsConfig) => void;
}

export function SystemSettingsModal({
  isOpen,
  onClose,
  settings,
  onSave,
}: SystemSettingsModalProps) {
  const [activeTab, setActiveTab] = useState<"policy" | "languages" | "categories">("policy");
  const [formData, setFormData] = useState<SystemSettingsConfig>({ ...settings });
  const [newLanguage, setNewLanguage] = useState("");
  const [newCategory, setNewCategory] = useState("");

  if (!isOpen) return null;

  const handleAddLanguage = () => {
    const trimmed = newLanguage.trim();
    if (!trimmed) return;
    if (formData.languagesCatalog.some((l) => l.toLowerCase() === trimmed.toLowerCase())) {
      alert("Language already exists in the catalog.");
      return;
    }
    setFormData((prev) => ({
      ...prev,
      languagesCatalog: [...prev.languagesCatalog, trimmed],
    }));
    setNewLanguage("");
  };

  const handleRemoveLanguage = (lang: string) => {
    if (formData.languagesCatalog.length <= 2) {
      alert("System requires at least 2 primary operational languages.");
      return;
    }
    setFormData((prev) => ({
      ...prev,
      languagesCatalog: prev.languagesCatalog.filter((l) => l !== lang),
    }));
  };

  const handleAddCategory = () => {
    const trimmed = newCategory.trim();
    if (!trimmed) return;
    if (formData.specialtyCategories.some((c) => c.toLowerCase() === trimmed.toLowerCase())) {
      alert("Category already exists in the taxonomy.");
      return;
    }
    setFormData((prev) => ({
      ...prev,
      specialtyCategories: [...prev.specialtyCategories, trimmed],
    }));
    setNewCategory("");
  };

  const handleRemoveCategory = (cat: string) => {
    if (formData.specialtyCategories.length <= 2) {
      alert("System requires at least 2 service categories.");
      return;
    }
    setFormData((prev) => ({
      ...prev,
      specialtyCategories: prev.specialtyCategories.filter((c) => c !== cat),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-3 sm:p-4 backdrop-blur-xs animate-in fade-in">
      <div className="relative flex h-[92vh] sm:h-[85vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl sm:rounded-3xl bg-white shadow-2xl animate-in zoom-in-95">
        {/* Header */}
        <div className="flex min-h-[3.5rem] items-center justify-between border-b border-slate-200 px-4 sm:px-6 py-2.5 bg-[#092f45] text-white">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-[#087f80] text-white flex-shrink-0 shadow-xs">
              <Cog6ToothIcon className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold leading-tight">
                System Governance & Platform Policy Settings
              </h3>
              <p className="text-[10px] sm:text-xs text-slate-300">
                Configure SOS dispatch parameters, interpreter accreditation rules, and taxonomies
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-300 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
          >
            <XMarkIcon className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>
        </div>

        {/* Sub-tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-4 sm:px-6 pt-2">
          {[
            { id: "policy", label: "Operational Policies", icon: SignalIcon },
            { id: "languages", label: `Language Catalog (${formData.languagesCatalog.length})`, icon: LanguageIcon },
            { id: "categories", label: `Service Taxonomies (${formData.specialtyCategories.length})`, icon: ShieldCheckIcon },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? "border-[#087f80] text-[#087f80] bg-white rounded-t-xl"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 space-y-6">
          {/* TAB 1: OPERATIONAL POLICIES */}
          {activeTab === "policy" && (
            <div className="space-y-6">
              {/* Parameter 1: SOS Search Radius */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <SignalIcon className="h-5 w-5 text-[#087f80]" />
                    <label className="text-sm font-bold text-[#092f45]">
                      รัศมีค้นหาล่าม (Emergency SOS Dispatch Radius)
                    </label>
                  </div>
                  <span className="text-[11px] font-semibold text-slate-400">
                    ค่าแนะนำ: 3 - 50 km
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  ระยะทางสูงสุดจากพิกัดเกิดเหตุที่จะส่งสัญญาณแจ้งเตือนไปยังล่ามอาสาในพื้นที่
                </p>
                <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50/70 shadow-2xs focus-within:border-slate-300 focus-within:ring-2 focus-within:ring-slate-200/60 focus-within:bg-white transition-all overflow-hidden max-w-md">
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({ ...formData, sosDispatchRadiusKm: Math.max(1, formData.sosDispatchRadiusKm - 1) })
                    }
                    className="flex h-10 w-10 shrink-0 items-center justify-center text-slate-400 hover:bg-slate-200/60 hover:text-slate-700 active:bg-slate-200 transition-colors cursor-pointer border-r border-slate-200"
                    title="ลดลง 1 km"
                  >
                    <MinusIcon className="h-4 w-4" />
                  </button>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    step={1}
                    value={formData.sosDispatchRadiusKm}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      if (!isNaN(val)) setFormData({ ...formData, sosDispatchRadiusKm: val });
                    }}
                    className="w-full bg-transparent px-3 py-2 text-sm font-extrabold text-[#092f45] text-center focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({ ...formData, sosDispatchRadiusKm: Math.min(100, formData.sosDispatchRadiusKm + 1) })
                    }
                    className="flex h-10 w-10 shrink-0 items-center justify-center text-slate-400 hover:bg-slate-200/60 hover:text-slate-700 active:bg-slate-200 transition-colors cursor-pointer border-l border-slate-200"
                    title="เพิ่มขึ้น 1 km"
                  >
                    <PlusIcon className="h-4 w-4" />
                  </button>
                  <div className="shrink-0 bg-slate-100 border-l border-slate-200 px-3.5 py-2.5 text-xs font-bold text-slate-600 select-none">
                    กิโลเมตร (km)
                  </div>
                </div>
              </div>

              {/* Parameter 2: Min Rating Threshold */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <StarIcon className="h-5 w-5 text-amber-500 fill-amber-500" />
                    <label className="text-sm font-bold text-[#092f45]">
                      เกณฑ์คะแนนรีวิวขั้นต่ำ (Interpreter Min Rating Threshold)
                    </label>
                  </div>
                  <span className="text-[11px] font-semibold text-slate-400">
                    เกณฑ์มาตรฐาน: 3.5 ดาว
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  ล่ามอาสาที่มีคะแนนรีวิวสะสมต่ำกว่าเกณฑ์นี้จะถูกส่งเรื่องให้ Manager ตรวจสอบพฤติกรรม
                </p>
                <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50/70 shadow-2xs focus-within:border-slate-300 focus-within:ring-2 focus-within:ring-slate-200/60 focus-within:bg-white transition-all overflow-hidden max-w-md">
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        interpreterMinRatingThreshold: Number(Math.max(1.0, formData.interpreterMinRatingThreshold - 0.1).toFixed(1)),
                      })
                    }
                    className="flex h-10 w-10 shrink-0 items-center justify-center text-slate-400 hover:bg-slate-200/60 hover:text-slate-700 active:bg-slate-200 transition-colors cursor-pointer border-r border-slate-200"
                    title="ลดลง 0.1 ดาว"
                  >
                    <MinusIcon className="h-4 w-4" />
                  </button>
                  <input
                    type="number"
                    min={1.0}
                    max={5.0}
                    step={0.1}
                    value={formData.interpreterMinRatingThreshold}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      if (!isNaN(val)) setFormData({ ...formData, interpreterMinRatingThreshold: val });
                    }}
                    className="w-full bg-transparent px-3 py-2 text-sm font-extrabold text-[#092f45] text-center focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        interpreterMinRatingThreshold: Number(Math.min(5.0, formData.interpreterMinRatingThreshold + 0.1).toFixed(1)),
                      })
                    }
                    className="flex h-10 w-10 shrink-0 items-center justify-center text-slate-400 hover:bg-slate-200/60 hover:text-slate-700 active:bg-slate-200 transition-colors cursor-pointer border-l border-slate-200"
                    title="เพิ่มขึ้น 0.1 ดาว"
                  >
                    <PlusIcon className="h-4 w-4" />
                  </button>
                  <div className="shrink-0 bg-slate-100 border-l border-slate-200 px-3.5 py-2.5 text-xs font-bold text-slate-600 select-none">
                    ★ ดาว / 5.0 (Rating)
                  </div>
                </div>
              </div>

              {/* Parameter 3: Auto-Escalate Ticket Timeout */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ClockIcon className="h-5 w-5 text-[#f04f3e]" />
                    <label className="text-sm font-bold text-[#092f45]">
                      เวลาส่งต่อเคสอัตโนมัติ (Urgent Ticket Auto-Escalation SLA)
                    </label>
                  </div>
                  <span className="text-[11px] font-semibold text-slate-400">
                    ค่าแนะนำ: 5 - 60 mins
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  หากไม่มีล่ามกดรับงานภายในเวลาที่กำหนด ระบบจะแจ้งเตือนเร่งด่วนไปยัง Field Manager
                </p>
                <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50/70 shadow-2xs focus-within:border-slate-300 focus-within:ring-2 focus-within:ring-slate-200/60 focus-within:bg-white transition-all overflow-hidden max-w-md">
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        autoEscalateTicketMinutes: Math.max(1, formData.autoEscalateTicketMinutes - 5),
                      })
                    }
                    className="flex h-10 w-10 shrink-0 items-center justify-center text-slate-400 hover:bg-slate-200/60 hover:text-slate-700 active:bg-slate-200 transition-colors cursor-pointer border-r border-slate-200"
                    title="ลดลง 5 นาที"
                  >
                    <MinusIcon className="h-4 w-4" />
                  </button>
                  <input
                    type="number"
                    min={1}
                    max={180}
                    step={1}
                    value={formData.autoEscalateTicketMinutes}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      if (!isNaN(val)) setFormData({ ...formData, autoEscalateTicketMinutes: val });
                    }}
                    className="w-full bg-transparent px-3 py-2 text-sm font-extrabold text-[#092f45] text-center focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        autoEscalateTicketMinutes: Math.min(180, formData.autoEscalateTicketMinutes + 5),
                      })
                    }
                    className="flex h-10 w-10 shrink-0 items-center justify-center text-slate-400 hover:bg-slate-200/60 hover:text-slate-700 active:bg-slate-200 transition-colors cursor-pointer border-l border-slate-200"
                    title="เพิ่มขึ้น 5 นาที"
                  >
                    <PlusIcon className="h-4 w-4" />
                  </button>
                  <div className="shrink-0 bg-slate-100 border-l border-slate-200 px-3.5 py-2.5 text-xs font-bold text-slate-600 select-none">
                    นาที (mins)
                  </div>
                </div>
              </div>

              {/* Policy Toggles */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
                <h4 className="text-sm font-bold text-[#092f45]">Accreditation & Access Enforcement</h4>
                
                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <span className="text-xs font-bold text-slate-800">
                      Mandatory Background & ID Screening
                    </span>
                    <p className="text-[11px] text-slate-500">
                      Require government ID or credential document verification before interpreter activation.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.mandatoryIdVerification}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        mandatoryIdVerification: e.target.checked,
                      })
                    }
                    className="h-4 w-4 accent-[#087f80] rounded cursor-pointer"
                  />
                </label>

                <div className="h-px bg-slate-100" />

                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <span className="text-xs font-bold text-slate-800">
                      Allow Unregistered Guest SOS Requests
                    </span>
                    <p className="text-[11px] text-slate-500">
                      Allow tourists in life-safety emergencies to emit distress signals without completing account sign-up.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.allowGuestSosRequests}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        allowGuestSosRequests: e.target.checked,
                      })
                    }
                    className="h-4 w-4 accent-[#087f80] rounded cursor-pointer"
                  />
                </label>
              </div>
            </div>
          )}

          {/* TAB 2: LANGUAGE CATALOG */}
          {activeTab === "languages" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-[#092f45]">Approved Language Catalog</h4>
                  <p className="text-xs text-slate-500">
                    Languages officially supported for SOS matching and volunteer applications across the platform.
                  </p>
                </div>
              </div>

              {/* Add Language Bar */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newLanguage}
                  onChange={(e) => setNewLanguage(e.target.value)}
                  placeholder="e.g. Vietnamese, Italian, Burmese..."
                  className="flex-1 rounded-xl border border-slate-300 p-2.5 text-xs text-slate-800 focus:border-[#087f80] focus:outline-none"
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
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#087f80] px-4 py-2 text-xs font-bold text-white hover:bg-[#066869] cursor-pointer"
                >
                  <PlusIcon className="h-4 w-4" />
                  <span>Add Language</span>
                </button>
              </div>

              {/* Language Chips Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2">
                {formData.languagesCatalog.map((lang) => (
                  <div
                    key={lang}
                    className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/70 p-3 text-xs font-semibold text-slate-800 hover:bg-white transition-colors"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <LanguageIcon className="h-4 w-4 text-[#087f80] shrink-0" />
                      <span className="truncate">{lang}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveLanguage(lang)}
                      className="text-slate-400 hover:text-[#f04f3e] p-1 rounded-lg transition-colors cursor-pointer"
                      title={`Remove ${lang}`}
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: SERVICE TAXONOMIES */}
          {activeTab === "categories" && (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-bold text-[#092f45]">Service Specialty Taxonomies</h4>
                <p className="text-xs text-slate-500">
                  Approved operational sectors for tagging SOS emergencies and qualifying interpreter capabilities.
                </p>
              </div>

              {/* Add Category Bar */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="e.g. Disaster Relief, Immigration Court..."
                  className="flex-1 rounded-xl border border-slate-300 p-2.5 text-xs text-slate-800 focus:border-[#087f80] focus:outline-none"
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
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#087f80] px-4 py-2 text-xs font-bold text-white hover:bg-[#066869] cursor-pointer"
                >
                  <PlusIcon className="h-4 w-4" />
                  <span>Add Taxonomy</span>
                </button>
              </div>

              {/* Category Chips Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2">
                {formData.specialtyCategories.map((cat) => (
                  <div
                    key={cat}
                    className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/70 p-3 text-xs font-semibold text-slate-800 hover:bg-white transition-colors"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <ShieldCheckIcon className="h-4 w-4 text-[#087f80] shrink-0" />
                      <span className="truncate">{cat}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveCategory(cat)}
                      className="text-slate-400 hover:text-[#f04f3e] p-1 rounded-lg transition-colors cursor-pointer"
                      title={`Remove ${cat}`}
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer Controls inside Form */}
          <div className="flex items-center justify-between border-t border-slate-200 pt-4">
            <span className="text-xs text-slate-400">
              Policy modifications apply platform-wide immediately.
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#087f80] px-5 py-2 text-xs font-bold text-white shadow-md shadow-[#087f80]/20 hover:bg-[#066869] cursor-pointer"
              >
                <CheckIcon className="h-4 w-4 stroke-[3]" />
                <span>Save Platform Policies</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

