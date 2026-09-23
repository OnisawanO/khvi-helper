"use client";

import { FormEvent, useState } from "react";
import { KeyIcon, UserPlusIcon, XMarkIcon } from "@heroicons/react/24/outline";

export type StaffAccountFormData = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  preferredUiLanguage: "th" | "en" | "zh" | "my" | "vi";
  temporaryPassword: string;
};

interface StaffAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (input: StaffAccountFormData) => Promise<{ success: boolean; error?: string }>;
}

const inputClassName =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-[#092f45] outline-none transition focus:border-[#087f80] focus:ring-2 focus:ring-[#087f80]/15";

const THAI_PHONE_DIGIT_LIMIT = 10;

function normalizeThaiPhone(value: string) {
  return value.replace(/\D/g, "").slice(0, THAI_PHONE_DIGIT_LIMIT);
}

function formatThaiPhone(value: string) {
  const digits = normalizeThaiPhone(value);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
}

export function StaffAccountModal({ isOpen, onClose, onSubmit }: StaffAccountModalProps) {
  const [form, setForm] = useState<StaffAccountFormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    preferredUiLanguage: "en",
    temporaryPassword: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const setField = <K extends keyof StaffAccountFormData>(field: K, value: StaffAccountFormData[K]) => {
    setForm((current) => ({ ...current, [field]: value }));
    setError(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const normalizedPhone = normalizeThaiPhone(form.phone);
    if (!/^0\d{9}$/.test(normalizedPhone)) {
      setError("Phone number must contain 10 digits and start with 0.");
      setIsSubmitting(false);
      return;
    }

    const result = await onSubmit({ ...form, phone: normalizedPhone });
    if (!result.success) {
      setError(result.error || "Unable to create the staff account.");
      setIsSubmitting(false);
      return;
    }

    setIsSubmitting(false);
    setForm({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      dateOfBirth: "",
      preferredUiLanguage: "en",
      temporaryPassword: "",
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#092f45]/45 p-4 backdrop-blur-[2px]" role="dialog" aria-modal="true" aria-labelledby="staff-account-title">
      <div className="max-h-[min(760px,calc(100vh-2rem))] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-slate-200 px-5 py-4 sm:px-6">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#087f80]/10 text-[#087f80]">
              <UserPlusIcon className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <h2 id="staff-account-title" className="text-base font-bold text-[#092f45]">Add Staff Account</h2>
              <p className="mt-1 text-xs leading-relaxed text-slate-500">
                Create a Manager account with a temporary password. Admin access is granted separately after review.
              </p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600" aria-label="Close">
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 p-5 sm:p-6">
          <div className="rounded-xl border border-[#b8dfe0] bg-[#f1fbfb] px-4 py-3 text-xs text-[#24565b]">
            <p className="font-bold">Provisioning order</p>
            <p className="mt-1 leading-relaxed">This form creates a Manager first. Use <span className="font-bold">Grant Admin Access</span> from the Manager account details only when this person needs delegated Admin permissions.</p>
          </div>

          {error && (
            <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-xs font-semibold leading-relaxed text-red-800">
              {error}
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-xs font-bold text-slate-600">
              First name
              <input required value={form.firstName} onChange={(event) => setField("firstName", event.target.value)} className={inputClassName} autoComplete="given-name" />
            </label>
            <label className="text-xs font-bold text-slate-600">
              Last name
              <input required value={form.lastName} onChange={(event) => setField("lastName", event.target.value)} className={inputClassName} autoComplete="family-name" />
            </label>
            <label className="text-xs font-bold text-slate-600">
              Email
              <input required type="email" value={form.email} onChange={(event) => setField("email", event.target.value)} className={inputClassName} autoComplete="email" />
            </label>
            <label className="text-xs font-bold text-slate-600">
              Phone number
              <input
                required
                type="tel"
                inputMode="numeric"
                value={form.phone}
                onChange={(event) => {
                  const digits = normalizeThaiPhone(event.target.value);
                  if (digits && digits[0] !== "0") return;
                  setField("phone", formatThaiPhone(digits));
                }}
                className={inputClassName}
                autoComplete="tel"
                placeholder="0XX-XXX-XXXX"
                maxLength={12}
                pattern="0[0-9]{2}-[0-9]{3}-[0-9]{4}"
                aria-describedby="staff-phone-help"
              />
              <span id="staff-phone-help" className="mt-1 block text-[11px] font-normal text-slate-400">
                Enter 10 digits starting with 0.
              </span>
            </label>
            <label className="text-xs font-bold text-slate-600">
              Date of birth
              <input required type="date" value={form.dateOfBirth} onChange={(event) => setField("dateOfBirth", event.target.value)} className={inputClassName} />
            </label>
            <label className="text-xs font-bold text-slate-600">
              Preferred UI language
              <select value={form.preferredUiLanguage} onChange={(event) => setField("preferredUiLanguage", event.target.value as StaffAccountFormData["preferredUiLanguage"])} className={inputClassName}>
                <option value="en">English</option>
                <option value="th">Thai</option>
                <option value="zh">Mandarin Chinese</option>
                <option value="my">Burmese</option>
                <option value="vi">Vietnamese</option>
              </select>
            </label>
          </div>

          <label className="block text-xs font-bold text-slate-600">
            Temporary password
            <div className="relative mt-1.5">
              <KeyIcon className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" aria-hidden="true" />
              <input required minLength={8} type="password" value={form.temporaryPassword} onChange={(event) => setField("temporaryPassword", event.target.value)} className={`${inputClassName} pl-9`} autoComplete="new-password" />
            </div>
            <span className="mt-1 block text-[11px] font-normal text-slate-400">At least 8 characters. Share this securely and ask the staff member to change it after first sign-in.</span>
          </label>

          <div className="flex flex-col-reverse gap-2 border-t border-slate-200 pt-4 sm:flex-row sm:justify-end">
            <button type="button" onClick={onClose} className="rounded-lg border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-600 transition hover:bg-slate-50">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="rounded-lg bg-[#087f80] px-4 py-2.5 text-xs font-bold text-white transition hover:bg-[#076f70] disabled:cursor-not-allowed disabled:opacity-60">
              {isSubmitting ? "Creating account..." : "Create Manager Account"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
