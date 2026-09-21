"use client";

import {
  ArrowRightIcon,
  CheckBadgeIcon,
  CheckCircleIcon,
  ClipboardDocumentListIcon,
  ClockIcon,
  Cog6ToothIcon,
  DocumentMagnifyingGlassIcon,
  EnvelopeIcon,
  GlobeAltIcon,
  MapPinIcon,
  PencilSquareIcon,
  PhotoIcon,
  PhoneIcon,
  ShieldCheckIcon,
  TrashIcon,
  XMarkIcon,
  UserCircleIcon,
  UsersIcon,
  WrenchScrewdriverIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import NextImage from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ChangeEvent, type FormEvent, type PointerEvent, type ReactNode } from "react";
import { AppShell, type WorkspaceRole } from "@/app/components/app-shell";
import { deleteOwnAccountAction } from "@/app/actions/account-actions";
import { WorkspaceAccountActions } from "@/app/components/workspace-account-actions";
import { WorkspaceBreadcrumbs } from "@/app/components/workspace-breadcrumbs";
import { UserAvatar } from "@/app/components/user-avatar";
import {
  AUTH_SESSION_STORAGE_KEY,
  clearMockUserSession,
  getMockUserSession,
  saveMockUserSession,
  type UserProfile,
} from "@/app/lib/mock-auth";
import { getCurrentUserProfile } from "@/app/lib/supabase-auth";
import type { Locale } from "@/app/components/site-header";
import { persistPreferredUiLanguage, useStoredLocale } from "@/app/lib/locale";
import { CATEGORIES, LANGUAGES } from "@/app/lib/mock-requests";
import { createClient } from "@/utils/supabase/client";

type FormState = {
  firstName: string;
  lastName: string;
  phone: string;
  dateOfBirth: string;
  preferredUiLanguage: Locale;
};

type RoleConfig = {
  eyebrow: string;
  title: string;
  description: string;
  badge: string;
  homeHref: string;
  homeLabel: string;
  accentClass: string;
  note: string;
};

const roleConfig: Record<WorkspaceRole, RoleConfig> = {
  User: {
    eyebrow: "Requester profile",
    title: "Profile & Settings",
    description: "Keep your language help profile ready before you need support.",
    badge: "Service requester",
    homeHref: "/welcome#main-content",
    homeLabel: "Workspace",
    accentClass: "bg-[#eaf5f4] text-[#087f80]",
    note: "Your contact details stay private until the request flow allows them to be shared.",
  },
  Interpreter: {
    eyebrow: "Interpreter profile",
    title: "Profile & Settings",
    description: "Keep your verified skills and matching preferences current.",
    badge: "Approved interpreter",
    homeHref: "/welcome#main-content",
    homeLabel: "Workspace",
    accentClass: "bg-[#fff2df] text-[#9a5a16]",
    note: "Only approved languages and categories are used to match you with open requests.",
  },
  Manager: {
    eyebrow: "Manager profile",
    title: "Profile & Settings",
    description: "Review your personal details and operational access in one place.",
    badge: "Operations manager",
    homeHref: "/manager#main-content",
    homeLabel: "Manager console",
    accentClass: "bg-[#edf0f7] text-[#38527b]",
    note: "Manager permissions are assigned by the system and cannot be changed from Profile.",
  },
  Admin: {
    eyebrow: "Admin profile",
    title: "Profile & Settings",
    description: "Manage your personal details while keeping system controls protected.",
    badge: "System administrator",
    homeHref: "/admin#main-content",
    homeLabel: "Admin dashboard",
    accentClass: "bg-[#f4eafa] text-[#70458c]",
    note: "Role, lock status, and system permissions are protected and managed from Admin tools.",
  },
};

const languageOptions: { value: Locale; label: string }[] = [
  { value: "th", label: "ไทย" },
  { value: "en", label: "English" },
  { value: "zh", label: "中文" },
  { value: "es", label: "Español" },
  { value: "ar", label: "العربية" },
];

function splitDisplayName(name: string) {
  const cleanName = name.replace(/\s+\([^)]*\)$/, "").trim();
  const [firstName = "", ...lastNameParts] = cleanName.split(/\s+/);
  return { firstName, lastName: lastNameParts.join(" ") };
}

function getFormState(user: UserProfile): FormState {
  const { firstName, lastName } = splitDisplayName(user.name);
  return {
    firstName,
    lastName,
    phone: user.phone,
    dateOfBirth: user.dateOfBirth,
    preferredUiLanguage: user.preferredUiLanguage,
  };
}

function ProfileLoading() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-(--khvi-paper)" aria-busy="true">
      <p role="status" className="text-sm font-bold text-(--khvi-ink)/65">Loading your profile…</p>
    </main>
  );
}

export function ProfileSettings() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [canDeleteAccount, setCanDeleteAccount] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    let disposed = false;

    const refreshSession = async () => {
      let supabaseResult: Awaited<ReturnType<typeof getCurrentUserProfile>> | null = null;

      try {
        supabaseResult = await getCurrentUserProfile(supabase);
      } catch {
        // Keep the browser preview available when Supabase is not configured.
      }

      if (disposed) return;

      if (supabaseResult?.profile) {
        const previewSession = getMockUserSession();
        const sameAccountPreview = previewSession?.userId === supabaseResult.profile.userId ? previewSession : null;
        setUser(sameAccountPreview ? { ...supabaseResult.profile, ...sameAccountPreview } : supabaseResult.profile);
        setCanDeleteAccount(supabaseResult.accountDeletionAvailable !== false);
        setReady(true);
        return;
      }

      // Do not fall back to a mock session when Supabase has an authenticated
      // user without a valid profile or with a locked account.
      if (supabaseResult?.authenticated) {
        setUser(null);
        setCanDeleteAccount(false);
        setReady(true);
        router.replace("/#top");
        return;
      }

      const session = getMockUserSession();
      if (session && ["User", "Interpreter", "Manager", "Admin"].includes(session.role) && !session.isLocked) {
        setUser(session);
        setCanDeleteAccount(false);
        setReady(true);
        return;
      }

      setUser(null);
      setCanDeleteAccount(false);
      setReady(true);
      router.replace("/#top");
    };

    const onStorage = (event: StorageEvent) => {
      if (event.key === AUTH_SESSION_STORAGE_KEY || event.key === null) {
        void refreshSession();
      }
    };
    const onWindowFocus = () => void refreshSession();

    void refreshSession();
    window.addEventListener("storage", onStorage);
    window.addEventListener("focus", onWindowFocus);
    const { data: authListener } = supabase.auth.onAuthStateChange(() => {
      window.setTimeout(() => void refreshSession(), 0);
    });

    return () => {
      disposed = true;
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("focus", onWindowFocus);
      authListener.subscription.unsubscribe();
    };
  }, [router]);

  if (!ready || !user) return <ProfileLoading />;

  return (
    <div className="min-h-screen bg-(--khvi-paper) text-(--khvi-ink)">
      <AppShell
        welcomeRole={user.role}
        accountActions={
          <WorkspaceAccountActions
            user={user}
            onSignOut={() => {
              clearMockUserSession();
              void createClient().auth.signOut();
              setUser(null);
              router.replace("/#top");
            }}
          />
        }
      >
        <ProfileContent
          user={user}
          onUserChange={setUser}
          canDeleteAccount={canDeleteAccount}
          onAccountDeleted={async () => {
            clearMockUserSession();
            await createClient().auth.signOut();
            setUser(null);
            setCanDeleteAccount(false);
            router.replace("/#top");
          }}
        />
      </AppShell>
    </div>
  );
}

function ProfileContent({
  user,
  onUserChange,
  canDeleteAccount,
  onAccountDeleted,
}: {
  user: UserProfile;
  onUserChange: (user: UserProfile) => void;
  canDeleteAccount: boolean;
  onAccountDeleted: () => void | Promise<void>;
}) {
  const config = roleConfig[user.role];

  return (
    <main id="main-content" className="mx-auto w-full max-w-[1440px] px-4 py-8 sm:px-8 lg:px-12 lg:py-10">
      <WorkspaceBreadcrumbs
        ariaLabel="Profile breadcrumb"
        currentLabel="Profile & Settings"
        homeHref={config.homeHref}
        homeLabel={config.homeLabel}
      />

      <section className="mt-6 overflow-hidden rounded-(--khvi-radius-lg) border border-(--khvi-teal)/20 bg-(--khvi-surface) shadow-[0_14px_34px_rgba(16,40,58,0.07)]">
        <div className="relative px-5 py-7 sm:px-8 sm:py-8 lg:px-10">
          <div className="absolute inset-y-0 right-0 hidden w-1/3 bg-[linear-gradient(135deg,transparent_0_28%,rgba(77,138,147,0.08)_28%_29%,transparent_29%_54%,rgba(240,163,95,0.12)_54%_55%,transparent_55%)] lg:block" aria-hidden="true" />
          <div className="relative flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div className="max-w-2xl">
              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-(--khvi-teal)">{config.eyebrow}</p>
              <h1 className="mt-2 text-3xl font-black tracking-tight text-(--khvi-navy) sm:text-4xl">{config.title}</h1>
              <p className="mt-3 max-w-xl text-sm leading-7 text-(--khvi-ink)/65 sm:text-base">{config.description}</p>
            </div>
            <div className={`inline-flex w-fit items-center gap-2 rounded-full px-3.5 py-2 text-xs font-extrabold ${config.accentClass}`}>
              <CheckBadgeIcon className="h-4 w-4" aria-hidden="true" />
              {config.badge}
            </div>
          </div>
        </div>
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-[18rem_minmax(0,1fr)]">
        <ProfileRail user={user} config={config} />
        <div className="min-w-0 space-y-6">
          <PersonalDetailsCard key={user.userId} user={user} onUserChange={onUserChange} />
          <AccountDeletionCard canDeleteAccount={canDeleteAccount} onDeleted={onAccountDeleted} />
          <RoleSettings user={user} onUserChange={onUserChange} />
        </div>
      </div>
    </main>
  );
}

function ProfileRail({ user, config }: { user: UserProfile; config: RoleConfig }) {
  return (
    <aside className="h-fit overflow-hidden rounded-(--khvi-radius-md) border border-(--khvi-teal)/20 bg-(--khvi-surface) shadow-[0_10px_24px_rgba(16,40,58,0.05)] lg:sticky lg:top-28">
      <div className="border-b border-(--khvi-teal)/15 p-5 sm:p-6">
        <div className="flex items-center gap-3">
          <UserAvatar user={user} size="lg" className="rounded-2xl shadow-[0_8px_16px_rgba(9,47,69,0.18)]" />
          <div className="min-w-0">
            <p className="truncate text-sm font-black text-(--khvi-navy)">{user.name}</p>
            <p className="mt-1 truncate text-xs font-semibold text-(--khvi-ink)/55">{user.email}</p>
          </div>
        </div>
        <div className={`mt-5 flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold ${config.accentClass}`}>
          <UserCircleIcon className="h-4 w-4" aria-hidden="true" />
          {user.role}
        </div>
      </div>

      <nav aria-label="Profile sections" className="p-3">
        <a href="#personal-details" className="flex items-center gap-3 rounded-lg bg-(--khvi-paper) px-3 py-3 text-sm font-extrabold text-(--khvi-navy) transition-colors hover:bg-[#edf5f4]">
          <PencilSquareIcon className="h-5 w-5 text-(--khvi-teal)" aria-hidden="true" />
          Personal details
        </a>
        <a href="#role-settings" className="mt-1 flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-bold text-(--khvi-ink)/65 transition-colors hover:bg-(--khvi-paper) hover:text-(--khvi-teal)">
          <Cog6ToothIcon className="h-5 w-5" aria-hidden="true" />
          Role settings
        </a>
        <a href="#account-deletion" className="mt-1 flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-bold text-(--khvi-coral) transition-colors hover:bg-(--khvi-coral)/10">
          <TrashIcon className="h-5 w-5" aria-hidden="true" />
          Delete account
        </a>
      </nav>

      <div className="m-3 rounded-lg border border-(--khvi-teal)/15 bg-[#f4f8f8] p-4">
        <p className="text-xs font-extrabold text-(--khvi-navy)">Account privacy</p>
        <p className="mt-2 text-xs leading-5 text-(--khvi-ink)/60">{config.note}</p>
      </div>
    </aside>
  );
}

function PersonalDetailsCard({ user, onUserChange }: { user: UserProfile; onUserChange: (user: UserProfile) => void }) {
  const [form, setForm] = useState<FormState>(() => getFormState(user));
  const [, setStoredLocale] = useStoredLocale();
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [saved, setSaved] = useState(false);

  const updateField = <K extends keyof FormState>(field: K, value: FormState[K]) => {
    setSaved(false);
    setErrors((current) => ({ ...current, [field]: undefined }));
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors: Partial<Record<keyof FormState, string>> = {};
    if (!form.firstName.trim()) nextErrors.firstName = "Enter your first name";
    if (!form.lastName.trim()) nextErrors.lastName = "Enter your last name";
    if (!/^0\d{8,9}$/.test(form.phone.replace(/[\s-]/g, ""))) nextErrors.phone = "Use a valid Thai phone number";
    if (!form.dateOfBirth) nextErrors.dateOfBirth = "Select your date of birth";

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      setSaved(false);
      return;
    }

    const nextUser: UserProfile = {
      ...user,
      name: `${form.firstName.trim()} ${form.lastName.trim()}`.trim(),
      phone: form.phone.trim(),
      dateOfBirth: form.dateOfBirth,
      preferredUiLanguage: form.preferredUiLanguage,
    };
    saveMockUserSession(nextUser);
    onUserChange(nextUser);
    setSaved(true);
  };

  return (
    <section id="personal-details" className="scroll-mt-28 rounded-(--khvi-radius-md) border border-(--khvi-teal)/20 bg-(--khvi-surface) shadow-[0_10px_24px_rgba(16,40,58,0.05)]">
      <div className="flex flex-col gap-3 border-b border-(--khvi-teal)/15 px-5 py-5 sm:flex-row sm:items-start sm:justify-between sm:px-7">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-(--khvi-teal)">Account</p>
          <h2 className="mt-1 text-xl font-black text-(--khvi-navy)">Personal details</h2>
          <p className="mt-1 text-sm text-(--khvi-ink)/60">These details belong to your account and can be updated by you.</p>
        </div>
        <div className="flex items-center gap-2 text-xs font-bold text-(--khvi-ink)/50">
          <ShieldCheckIcon className="h-4 w-4 text-(--khvi-sage)" aria-hidden="true" />
          Private to your account
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 px-5 py-6 sm:px-7">
        <ProfileImagePicker user={user} onUserChange={onUserChange} />
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="First name" error={errors.firstName}>
            <input value={form.firstName} onChange={(event) => updateField("firstName", event.target.value)} className={inputClass(errors.firstName)} autoComplete="given-name" />
          </Field>
          <Field label="Last name" error={errors.lastName}>
            <input value={form.lastName} onChange={(event) => updateField("lastName", event.target.value)} className={inputClass(errors.lastName)} autoComplete="family-name" />
          </Field>
          <Field label="Email address" hint="Managed by sign-in provider">
            <div className="relative">
              <EnvelopeIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-(--khvi-ink)/40" aria-hidden="true" />
              <input value={user.email} readOnly className={`${inputClass()} bg-(--khvi-paper) pl-9 text-(--khvi-ink)/60`} aria-describedby="email-help" />
            </div>
          </Field>
          <Field label="Phone number" error={errors.phone}>
            <div className="relative">
              <PhoneIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-(--khvi-ink)/40" aria-hidden="true" />
              <input value={form.phone} onChange={(event) => updateField("phone", event.target.value)} className={`${inputClass(errors.phone)} pl-9`} inputMode="tel" autoComplete="tel" />
            </div>
          </Field>
          <Field label="Date of birth" error={errors.dateOfBirth}>
            <input type="date" value={form.dateOfBirth} onChange={(event) => updateField("dateOfBirth", event.target.value)} className={inputClass(errors.dateOfBirth)} />
          </Field>
          <Field label="Preferred UI language" hint="Used for interface copy">
            <div className="relative">
              <GlobeAltIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-(--khvi-ink)/40" aria-hidden="true" />
              <select
                value={form.preferredUiLanguage}
                onChange={(event) => {
                  const nextLocale = event.target.value as Locale;
                  updateField("preferredUiLanguage", nextLocale);
                  setStoredLocale(nextLocale);
                  void persistPreferredUiLanguage(nextLocale).catch((error: unknown) => {
                    console.error("Unable to persist preferred UI language", error);
                  });
                }}
                className={`${inputClass()} pl-9`}
              >
                {languageOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
            </div>
          </Field>
        </div>

        <div className="flex flex-col gap-3 border-t border-(--khvi-teal)/15 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <p id="email-help" className="text-xs leading-5 text-(--khvi-ink)/55">Email, role, and account status are protected system fields.</p>
          <div className="flex items-center gap-3">
            {saved && <span role="status" className="inline-flex items-center gap-1.5 text-xs font-extrabold text-(--khvi-sage)"><CheckCircleIcon className="h-4 w-4" aria-hidden="true" />Saved</span>}
            <button type="submit" className="inline-flex items-center justify-center gap-2 rounded-lg bg-(--khvi-navy) px-4 py-3 text-sm font-extrabold text-white shadow-[0_6px_14px_rgba(9,47,69,0.16)] transition-colors hover:bg-[#0c4960]">
              Save changes
              <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </form>
    </section>
  );
}

function AccountDeletionCard({ canDeleteAccount, onDeleted }: { canDeleteAccount: boolean; onDeleted: () => void | Promise<void> }) {
  const [isOpen, setIsOpen] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const openDialog = () => {
    setError(null);
    setConfirmed(false);
    setIsOpen(true);
  };

  const closeDialog = () => {
    if (busy) return;
    setIsOpen(false);
    setConfirmed(false);
    setError(null);
  };

  const handleDelete = async () => {
    if (!confirmed || busy) return;
    setBusy(true);
    setError(null);

    const result = await deleteOwnAccountAction();
    if (!result.ok) {
      setError(result.error);
      setBusy(false);
      return;
    }

    await onDeleted();
  };

  return (
    <section id="account-deletion" className="scroll-mt-28 overflow-hidden rounded-(--khvi-radius-md) border border-(--khvi-coral)/35 bg-(--khvi-surface) shadow-[0_10px_24px_rgba(16,40,58,0.05)]">
      <div className="border-b border-(--khvi-coral)/20 bg-(--khvi-coral)/5 px-5 py-5 sm:px-7">
        <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-(--khvi-coral)">Account safety</p>
        <h2 className="mt-1 text-xl font-black text-(--khvi-navy)">Delete my account</h2>
        <p className="mt-1 max-w-2xl text-sm leading-6 text-(--khvi-ink)/65">
          Close your account and sign out. Completed history stays available for service records, while personal contact details are removed.
        </p>
      </div>

      <div className="flex flex-col gap-4 px-5 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-7">
        <div className="flex gap-3 text-xs leading-5 text-(--khvi-ink)/60">
          <TrashIcon className="mt-0.5 h-5 w-5 shrink-0 text-(--khvi-coral)" aria-hidden="true" />
          <p>
            Active requests or assignments must be finished or cancelled before you can delete the account.
            {canDeleteAccount ? " This action cannot be undone." : " This control becomes available after the latest Supabase migration is applied."}
          </p>
        </div>
        <button
          type="button"
          onClick={openDialog}
          className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-lg border border-(--khvi-coral)/50 px-4 py-3 text-sm font-extrabold text-(--khvi-coral) transition-colors hover:bg-(--khvi-coral)/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--khvi-sun)"
        >
          <TrashIcon className="h-4 w-4" aria-hidden="true" />
          Delete my account
        </button>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-(--khvi-navy)/70 p-4" role="dialog" aria-modal="true" aria-labelledby="delete-account-title" aria-describedby="delete-account-description">
          <div className="w-full max-w-lg rounded-(--khvi-radius-md) border border-(--khvi-coral)/30 bg-(--khvi-surface) p-5 shadow-[0_24px_60px_rgba(9,47,69,0.28)] sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-(--khvi-coral)">Please confirm</p>
                <h2 id="delete-account-title" className="mt-1 text-xl font-black text-(--khvi-navy)">Delete your account?</h2>
              </div>
              <button type="button" onClick={closeDialog} disabled={busy} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#cbd7dc] text-(--khvi-ink)/60 transition-colors hover:border-(--khvi-teal) hover:text-(--khvi-navy) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--khvi-sun) disabled:opacity-50" aria-label="Close delete account dialog">
                <XMarkIcon className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            <p id="delete-account-description" className="mt-4 text-sm leading-6 text-(--khvi-ink)/70">
              Your session will end immediately. Your completed mission history will remain without your personal contact details. You cannot restore this account from Profile Settings.
            </p>

            {!canDeleteAccount && <p role="alert" className="mt-4 rounded-lg border border-(--khvi-sun)/35 bg-[#fffaf1] p-3 text-sm font-bold leading-5 text-(--khvi-ink)/70">Account deletion is unavailable until the latest Supabase migration is applied.</p>}

            <label className={`mt-5 flex items-start gap-3 rounded-lg border border-(--khvi-coral)/20 bg-(--khvi-coral)/5 p-3 text-sm font-semibold text-(--khvi-ink)/75 ${!canDeleteAccount ? "opacity-55" : ""}`}>
              <input type="checkbox" checked={confirmed} onChange={(event) => setConfirmed(event.target.checked)} disabled={!canDeleteAccount || busy} className="mt-0.5 h-4 w-4 accent-(--khvi-coral) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--khvi-sun)" />
              <span>I understand that this account will be closed and I will be signed out.</span>
            </label>

            {error && <p role="alert" className="mt-4 text-sm font-extrabold text-(--khvi-coral)">{error}</p>}

            <div className="mt-6 flex flex-col-reverse gap-3 border-t border-(--khvi-teal)/15 pt-5 sm:flex-row sm:justify-end">
              <button type="button" onClick={closeDialog} disabled={busy} className="rounded-lg border border-[#cbd7dc] px-4 py-3 text-sm font-extrabold text-(--khvi-ink)/70 transition-colors hover:border-(--khvi-teal) hover:text-(--khvi-navy) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--khvi-sun) disabled:opacity-50">Keep my account</button>
              <button type="button" onClick={() => void handleDelete()} disabled={!canDeleteAccount || !confirmed || busy} className="inline-flex items-center justify-center gap-2 rounded-lg bg-(--khvi-coral) px-4 py-3 text-sm font-extrabold text-white transition-colors hover:bg-[#c75f51] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--khvi-sun) disabled:cursor-not-allowed disabled:opacity-50">
                <TrashIcon className="h-4 w-4" aria-hidden="true" />
                {busy ? "Deleting…" : "Delete account"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

const CROP_SIZE = 280;

type CropSource = {
  url: string;
  width: number;
  height: number;
};

type CropOffset = {
  x: number;
  y: number;
};

function loadCropSource(file: File): Promise<CropSource> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => resolve({ url, width: image.naturalWidth, height: image.naturalHeight });
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Image could not be read"));
    };
    image.src = url;
  });
}

function getCropScale(source: CropSource, zoom: number) {
  return Math.max(CROP_SIZE / source.width, CROP_SIZE / source.height) * zoom;
}

function clampCropOffset(source: CropSource, zoom: number, offset: CropOffset): CropOffset {
  const scale = getCropScale(source, zoom);
  const renderedWidth = source.width * scale;
  const renderedHeight = source.height * scale;
  const minX = Math.min(0, CROP_SIZE - renderedWidth);
  const minY = Math.min(0, CROP_SIZE - renderedHeight);
  return {
    x: Math.min(0, Math.max(minX, offset.x)),
    y: Math.min(0, Math.max(minY, offset.y)),
  };
}

function getInitialCropOffset(source: CropSource, zoom: number): CropOffset {
  const scale = getCropScale(source, zoom);
  return clampCropOffset(source, zoom, {
    x: (CROP_SIZE - source.width * scale) / 2,
    y: (CROP_SIZE - source.height * scale) / 2,
  });
}

function renderCroppedImage(source: CropSource, zoom: number, offset: CropOffset): Promise<string> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    const scale = getCropScale(source, zoom);
    const canvas = document.createElement("canvas");
    const cropSourceSize = CROP_SIZE / scale;
    const sourceX = Math.max(0, -offset.x / scale);
    const sourceY = Math.max(0, -offset.y / scale);
    canvas.width = 256;
    canvas.height = 256;
    const context = canvas.getContext("2d");

    if (!context) {
      reject(new Error("Canvas is not available"));
      return;
    }

    image.onload = () => {
      context.drawImage(image, sourceX, sourceY, cropSourceSize, cropSourceSize, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/jpeg", 0.82));
    };
    image.onerror = () => reject(new Error("Image could not be cropped"));
    image.src = source.url;
  });
}

function ProfileImagePicker({ user, onUserChange }: { user: UserProfile; onUserChange: (user: UserProfile) => void }) {
  const inputId = `profile-photo-${user.userId}`;
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cropSource, setCropSource] = useState<CropSource | null>(null);

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    setMessage(null);
    setError(null);

    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Choose a JPG, PNG, or WEBP image");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be smaller than 5 MB");
      return;
    }

    setBusy(true);
    try {
      setCropSource(await loadCropSource(file));
    } catch {
      setError("The image could not be read. Try another file");
    } finally {
      setBusy(false);
    }
  };

  const handleCropConfirm = (avatarUrl: string) => {
    const nextUser = { ...user, avatarUrl };
    saveMockUserSession(nextUser);
    onUserChange(nextUser);
    if (cropSource) URL.revokeObjectURL(cropSource.url);
    setCropSource(null);
    setMessage("Profile photo updated");
  };

  const handleCropCancel = () => {
    if (cropSource) URL.revokeObjectURL(cropSource.url);
    setCropSource(null);
  };

  const removePhoto = () => {
    const nextUser = { ...user, avatarUrl: undefined };
    saveMockUserSession(nextUser);
    onUserChange(nextUser);
    setMessage("Profile photo removed");
    setError(null);
  };

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-(--khvi-teal)/15 bg-[#f7fbfa] p-4 sm:flex-row sm:items-center sm:p-5">
      <UserAvatar user={user} size="xxl" className="rounded-2xl" />
      <div className="min-w-0">
        <p className="text-sm font-black text-(--khvi-navy)">Profile photo</p>
        <p className="mt-1 text-xs leading-5 text-(--khvi-ink)/60">Use a clear image, then crop it to a square before saving it to this browser preview.</p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <label htmlFor={inputId} className={`inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-lg bg-(--khvi-navy) px-3.5 py-2 text-xs font-extrabold text-white transition-colors hover:bg-[#0c4960] ${busy ? "pointer-events-none opacity-60" : ""}`}>
            <PhotoIcon className="h-4 w-4" aria-hidden="true" />
            {busy ? "Processing…" : "Change photo"}
          </label>
          {user.avatarUrl && <button type="button" onClick={removePhoto} disabled={busy} className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-(--khvi-coral)/35 px-3.5 py-2 text-xs font-extrabold text-(--khvi-coral) transition-colors hover:bg-(--khvi-coral)/10 disabled:cursor-not-allowed disabled:opacity-50"><TrashIcon className="h-4 w-4" aria-hidden="true" />Remove</button>}
          <input id={inputId} type="file" accept="image/png,image/jpeg,image/webp" onChange={handleFileChange} className="sr-only" disabled={busy} />
        </div>
        {message && <p role="status" className="mt-2 text-xs font-extrabold text-(--khvi-sage)">{message}</p>}
        {error && <p role="alert" className="mt-2 text-xs font-extrabold text-(--khvi-coral)">{error}</p>}
      </div>
      {cropSource && <CropEditor source={cropSource} onCancel={handleCropCancel} onConfirm={handleCropConfirm} />}
    </div>
  );
}

function CropEditor({ source, onCancel, onConfirm }: { source: CropSource; onCancel: () => void; onConfirm: (avatarUrl: string) => void }) {
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState<CropOffset>(() => getInitialCropOffset(source, 1));
  const [rendering, setRendering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dragRef = useRef<{ pointerX: number; pointerY: number; offsetX: number; offsetY: number } | null>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !rendering) onCancel();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onCancel, rendering]);

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = { pointerX: event.clientX, pointerY: event.clientY, offsetX: offset.x, offsetY: offset.y };
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current) return;
    const nextOffset = {
      x: dragRef.current.offsetX + event.clientX - dragRef.current.pointerX,
      y: dragRef.current.offsetY + event.clientY - dragRef.current.pointerY,
    };
    setOffset(clampCropOffset(source, zoom, nextOffset));
  };

  const handlePointerUp = (event: PointerEvent<HTMLDivElement>) => {
    dragRef.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  };

  const handleZoomChange = (value: number) => {
    setZoom(value);
    setOffset((current) => clampCropOffset(source, value, current));
  };

  const handleConfirm = async () => {
    setRendering(true);
    setError(null);
    try {
      onConfirm(await renderCroppedImage(source, zoom, offset));
    } catch {
      setError("The crop could not be saved. Try again");
    } finally {
      setRendering(false);
    }
  };

  const scale = getCropScale(source, zoom);

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-(--khvi-navy)/70 p-4" role="dialog" aria-modal="true" aria-labelledby="crop-profile-photo-title">
      <div className="w-full max-w-lg rounded-(--khvi-radius-md) border border-(--khvi-teal)/20 bg-(--khvi-surface) p-5 shadow-[0_24px_60px_rgba(9,47,69,0.28)] sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-(--khvi-teal)">Profile photo</p>
            <h2 id="crop-profile-photo-title" className="mt-1 text-xl font-black text-(--khvi-navy)">Crop your photo</h2>
            <p className="mt-1 text-sm text-(--khvi-ink)/60">Drag the image to position it inside the square.</p>
          </div>
          <button type="button" onClick={onCancel} disabled={rendering} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#cbd7dc] text-(--khvi-ink)/60 transition-colors hover:border-(--khvi-teal) hover:text-(--khvi-navy) disabled:opacity-50" aria-label="Close crop editor">
            <XMarkIcon className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div
          className="relative mx-auto mt-6 h-[280px] w-[280px] cursor-grab touch-none overflow-hidden rounded-2xl bg-(--khvi-ink) active:cursor-grabbing"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          aria-label="Photo crop area"
        >
          <NextImage src={source.url} alt="Photo being cropped" width={source.width} height={source.height} unoptimized className="pointer-events-none absolute max-w-none select-none" style={{ width: source.width * scale, height: source.height * scale, transform: `translate(${offset.x}px, ${offset.y}px)` }} />
          <div className="pointer-events-none absolute inset-0 rounded-2xl border-2 border-white/90 shadow-[0_0_0_999px_rgba(9,47,69,0.38)]" aria-hidden="true" />
        </div>

        <div className="mt-6">
          <div className="flex items-center justify-between text-xs font-bold text-(--khvi-ink)/60">
            <label htmlFor="profile-photo-zoom">Zoom</label>
            <span>{zoom.toFixed(1)}×</span>
          </div>
          <input id="profile-photo-zoom" type="range" min="1" max="3" step="0.05" value={zoom} onChange={(event) => handleZoomChange(Number(event.target.value))} className="mt-3 w-full accent-(--khvi-teal)" />
        </div>

        <div className="mt-6 flex flex-col-reverse gap-3 border-t border-(--khvi-teal)/15 pt-5 sm:flex-row sm:justify-end">
          {error && <p role="alert" className="mr-auto self-center text-xs font-extrabold text-(--khvi-coral)">{error}</p>}
          <button type="button" onClick={onCancel} disabled={rendering} className="rounded-lg border border-[#cbd7dc] px-4 py-3 text-sm font-extrabold text-(--khvi-ink)/70 transition-colors hover:border-(--khvi-teal) hover:text-(--khvi-navy) disabled:opacity-50">Cancel</button>
          <button type="button" onClick={handleConfirm} disabled={rendering} className="rounded-lg bg-(--khvi-navy) px-4 py-3 text-sm font-extrabold text-white transition-colors hover:bg-[#0c4960] disabled:cursor-wait disabled:opacity-60">{rendering ? "Saving…" : "Use this photo"}</button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, hint, error, children }: { label: string; hint?: string; error?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="flex items-baseline justify-between gap-3 text-sm font-extrabold text-(--khvi-navy)">
        {label}
        {hint && <span className="text-[11px] font-semibold text-(--khvi-ink)/45">{hint}</span>}
      </span>
      <span className="mt-2 block">{children}</span>
      {error && <span className="mt-1.5 block text-xs font-bold text-(--khvi-coral)">{error}</span>}
    </label>
  );
}

function inputClass(error?: string) {
  return `h-11 w-full rounded-lg border bg-white px-3 text-sm font-semibold text-(--khvi-ink) transition-colors placeholder:text-(--khvi-ink)/35 ${error ? "border-(--khvi-coral)" : "border-[#cbd7dc] hover:border-(--khvi-teal) focus:border-(--khvi-teal)"}`;
}

function RoleSettings({ user, onUserChange }: { user: UserProfile; onUserChange: (user: UserProfile) => void }) {
  return (
    <section id="role-settings" className="scroll-mt-28 overflow-hidden rounded-(--khvi-radius-md) border border-(--khvi-teal)/20 bg-(--khvi-surface) shadow-[0_10px_24px_rgba(16,40,58,0.05)]">
      <div className="border-b border-(--khvi-teal)/15 px-5 py-5 sm:px-7">
        <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-(--khvi-teal)">Workspace</p>
        <h2 className="mt-1 text-xl font-black text-(--khvi-navy)">Role settings</h2>
        <p className="mt-1 text-sm text-(--khvi-ink)/60">A quick view of the tools and preferences available to your role.</p>
      </div>
      <div className="px-5 py-6 sm:px-7">
        {user.role === "User" && <UserRoleSettings />}
        {user.role === "Interpreter" && <InterpreterRoleSettings user={user} onUserChange={onUserChange} />}
        {user.role === "Manager" && <ManagerRoleSettings />}
        {user.role === "Admin" && <AdminRoleSettings />}
      </div>
    </section>
  );
}

function UserRoleSettings() {
  return (
    <div className="grid gap-5 xl:grid-cols-2">
      <RoleCard icon={<ClipboardDocumentListIcon className="h-5 w-5" aria-hidden="true" />} title="Request history" description="Track requests you have created and the next step for each one." href="/my-requests#main-content" linkLabel="View my requests" />
      <RoleCard icon={<ShieldCheckIcon className="h-5 w-5" aria-hidden="true" />} title="Privacy & safety" description="Sensitive contact details stay hidden until the matching flow reaches the right confirmation step." />
      <div className="xl:col-span-2 grid gap-3 rounded-xl border border-(--khvi-teal)/15 bg-[#f7fbfa] p-4 sm:grid-cols-3 sm:p-5">
        <Metric label="Open requests" value="0" />
        <Metric label="Completed requests" value="0" />
        <Metric label="Account status" value="Active" tone="sage" />
      </div>
    </div>
  );
}

function InterpreterRoleSettings({ user, onUserChange }: { user: UserProfile; onUserChange: (user: UserProfile) => void }) {
  const defaultLanguageIds = ["burmese", "english", "sign"];
  const defaultCategoryIds = ["medical", "government", "accident"];
  const languageOptions = LANGUAGES.map((language) => ({ id: language.id, label: language.en }));
  const categoryOptions = CATEGORIES.map((category) => ({ id: category.id, label: category.en }));
  const [serviceLanguageIds, setServiceLanguageIds] = useState(() => user.serviceLanguageIds?.length ? user.serviceLanguageIds : defaultLanguageIds);
  const [matchingCategoryIds, setMatchingCategoryIds] = useState(() => user.matchingCategoryIds?.length ? user.matchingCategoryIds : defaultCategoryIds);
  const [languageToAdd, setLanguageToAdd] = useState("");
  const [categoryToAdd, setCategoryToAdd] = useState("");
  const [skillMessage, setSkillMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const updateSkills = (nextLanguages: string[], nextCategories: string[], message: string) => {
    const nextUser = { ...user, serviceLanguageIds: nextLanguages, matchingCategoryIds: nextCategories };
    saveMockUserSession(nextUser);
    onUserChange(nextUser);
    setSkillMessage({ type: "success", text: message });
  };

  const addLanguage = () => {
    const nextLanguage = normalizeSkillValue(languageToAdd, languageOptions);
    if (!nextLanguage || hasSkill(serviceLanguageIds, nextLanguage)) return;
    const nextLanguages = [...serviceLanguageIds, nextLanguage];
    setServiceLanguageIds(nextLanguages);
    setLanguageToAdd("");
    updateSkills(nextLanguages, matchingCategoryIds, "Service language added");
  };

  const removeLanguage = (languageId: string) => {
    if (serviceLanguageIds.length <= 1) {
      setSkillMessage({ type: "error", text: "Keep at least one service language" });
      return;
    }
    const nextLanguages = serviceLanguageIds.filter((id) => id !== languageId);
    setServiceLanguageIds(nextLanguages);
    updateSkills(nextLanguages, matchingCategoryIds, "Service language removed");
  };

  const addCategory = () => {
    const nextCategory = normalizeSkillValue(categoryToAdd, categoryOptions);
    if (!nextCategory || hasSkill(matchingCategoryIds, nextCategory)) return;
    const nextCategories = [...matchingCategoryIds, nextCategory];
    setMatchingCategoryIds(nextCategories);
    setCategoryToAdd("");
    updateSkills(serviceLanguageIds, nextCategories, "Matching category added");
  };

  const removeCategory = (categoryId: string) => {
    if (matchingCategoryIds.length <= 2) {
      setSkillMessage({ type: "error", text: "Keep at least two matching categories" });
      return;
    }
    const nextCategories = matchingCategoryIds.filter((id) => id !== categoryId);
    setMatchingCategoryIds(nextCategories);
    updateSkills(serviceLanguageIds, nextCategories, "Matching category removed");
  };

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="Approval status" value="Approved" tone="sage" />
        <Metric label="Service radius" value="25 km" />
        <Metric label="Completed missions" value="18" />
        <Metric label="Review score" value="4.9 / 5" />
      </div>
      <div className="grid gap-5 xl:grid-cols-2">
        <EditableSkillCard
          icon={<GlobeAltIcon className="h-5 w-5" aria-hidden="true" />}
          title="Service languages"
          description="Languages you can provide during a mission"
          selectedIds={serviceLanguageIds}
          options={languageOptions}
          value={languageToAdd}
          onValueChange={setLanguageToAdd}
          onAdd={addLanguage}
          onRemove={removeLanguage}
          minimumLabel="At least one language"
        />
        <EditableSkillCard
          icon={<WrenchScrewdriverIcon className="h-5 w-5" aria-hidden="true" />}
          title="Matching categories"
          description="Categories used for request matching"
          selectedIds={matchingCategoryIds}
          options={categoryOptions}
          value={categoryToAdd}
          onValueChange={setCategoryToAdd}
          onAdd={addCategory}
          onRemove={removeCategory}
          minimumLabel="At least two categories"
        />
        <RoleCard icon={<MapPinIcon className="h-5 w-5" aria-hidden="true" />} title="Search preferences" description="Your request map uses a 25 km matching radius and browser GPS when available." href="/find-requests#main-content" linkLabel="Open find requests" />
        <RoleCard icon={<ClipboardDocumentListIcon className="h-5 w-5" aria-hidden="true" />} title="Assignment history" description="Review claimed, in-progress, and completed missions." href="/my-assignments#main-content" linkLabel="View assignments" />
      </div>
      {skillMessage && <p role={skillMessage.type === "error" ? "alert" : "status"} className={`text-xs font-extrabold ${skillMessage.type === "error" ? "text-(--khvi-coral)" : "text-(--khvi-sage)"}`}>{skillMessage.text}</p>}
    </div>
  );
}

function normalizeSkillValue(value: string, options: { id: string; label: string }[]) {
  const trimmedValue = value.trim();
  const standardOption = options.find((option) => option.id.toLowerCase() === trimmedValue.toLowerCase() || option.label.toLowerCase() === trimmedValue.toLowerCase());
  return standardOption?.id ?? trimmedValue;
}

function hasSkill(selectedIds: string[], value: string) {
  return selectedIds.some((selectedId) => selectedId.trim().toLowerCase() === value.trim().toLowerCase());
}

function EditableSkillCard({ icon, title, description, selectedIds, options, value, onValueChange, onAdd, onRemove, minimumLabel }: {
  icon: ReactNode;
  title: string;
  description: string;
  selectedIds: string[];
  options: { id: string; label: string }[];
  value: string;
  onValueChange: (value: string) => void;
  onAdd: () => void;
  onRemove: (id: string) => void;
  minimumLabel: string;
}) {
  const selectedSet = new Set(selectedIds.map((selectedId) => selectedId.trim().toLowerCase()));
  const availableOptions = options.filter((option) => !selectedSet.has(option.id.toLowerCase()) && !selectedSet.has(option.label.toLowerCase()));
  const inputId = `${title.replace(/\s+/g, "-").toLowerCase()}-add`;
  const datalistId = `${inputId}-suggestions`;

  return (
    <div className="rounded-xl border border-(--khvi-teal)/15 bg-white p-4 sm:p-5">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#edf5f4] text-(--khvi-teal)">{icon}</span>
        <div className="min-w-0">
          <h3 className="text-sm font-black text-(--khvi-navy)">{title}</h3>
          <p className="mt-1 text-xs leading-5 text-(--khvi-ink)/60">{description}</p>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {selectedIds.map((id) => {
          const label = options.find((option) => option.id === id)?.label ?? id;
          return <span key={id} className="inline-flex items-center gap-1 rounded-full bg-(--khvi-paper) py-1 pl-2.5 pr-1 text-[11px] font-bold text-(--khvi-ink)/75"><span>{label}</span><button type="button" onClick={() => onRemove(id)} className="flex h-5 w-5 items-center justify-center rounded-full text-(--khvi-ink)/50 transition-colors hover:bg-(--khvi-coral)/10 hover:text-(--khvi-coral) focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-(--khvi-sun)" aria-label={`Remove ${label}`}><XMarkIcon className="h-3.5 w-3.5" aria-hidden="true" /></button></span>;
        })}
      </div>
      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <label className="sr-only" htmlFor={inputId}>Add to {title}</label>
        <input id={inputId} list={datalistId} value={value} onChange={(event) => onValueChange(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); onAdd(); } }} placeholder="Type or choose a suggestion…" autoComplete="off" className="h-10 min-w-0 flex-1 rounded-lg border border-[#cbd7dc] bg-white px-3 text-xs font-bold text-(--khvi-ink) placeholder:text-(--khvi-ink)/40 focus:border-(--khvi-teal)" />
        <datalist id={datalistId}>
          {availableOptions.map((option) => <option key={option.id} value={option.label} />)}
        </datalist>
        <button type="button" onClick={onAdd} disabled={!value.trim()} className="h-10 rounded-lg border border-(--khvi-teal) px-3.5 text-xs font-extrabold text-(--khvi-teal) transition-colors hover:bg-[#edf5f4] disabled:cursor-not-allowed disabled:opacity-45">Add</button>
      </div>
      <p className="mt-3 text-[11px] font-semibold text-(--khvi-ink)/45">{minimumLabel}. Type a custom value or choose a suggestion. Changes save automatically in this browser preview.</p>
    </div>
  );
}

function ManagerRoleSettings() {
  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-3">
        <Metric label="Pending applications" value="6" />
        <Metric label="Open help requests" value="4" />
        <Metric label="Account status" value="Active" tone="sage" />
      </div>
      <div className="grid gap-5 xl:grid-cols-2">
        <RoleCard icon={<UsersIcon className="h-5 w-5" aria-hidden="true" />} title="Interpreter applications" description="Review language, category, and experience information before approval." href="/manager#main-content" linkLabel="Open manager console" />
        <RoleCard icon={<DocumentMagnifyingGlassIcon className="h-5 w-5" aria-hidden="true" />} title="Support & audit" description="Manage help tickets and escalate reports within your assigned permissions." chips={["Review applications", "Help requests", "Escalate reports"]} />
      </div>
      <ReadOnlyNotice>Role changes and account lock actions are reserved for Admin and are not available here.</ReadOnlyNotice>
    </div>
  );
}

function AdminRoleSettings() {
  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-3">
        <Metric label="System status" value="Normal" tone="sage" />
        <Metric label="Privileged staff" value="8" />
        <Metric label="Audit events today" value="12" />
      </div>
      <div className="grid gap-5 xl:grid-cols-2">
        <RoleCard icon={<UsersIcon className="h-5 w-5" aria-hidden="true" />} title="Users & roles" description="Search profiles and manage role transitions from the protected Admin dashboard." href="/admin#main-content" linkLabel="Open Admin dashboard" />
        <RoleCard icon={<ShieldCheckIcon className="h-5 w-5" aria-hidden="true" />} title="Security controls" description="Role assignment, account lock status, and audit history are system-managed controls." chips={["Role management", "Account lock", "Audit trail"]} />
      </div>
      <ReadOnlyNotice>Role, account status, and system permissions are read-only on this page to prevent accidental privilege changes.</ReadOnlyNotice>
    </div>
  );
}

function RoleCard({ icon, title, description, chips, href, linkLabel }: { icon: ReactNode; title: string; description: string; chips?: string[]; href?: string; linkLabel?: string }) {
  return (
    <div className="rounded-xl border border-(--khvi-teal)/15 bg-white p-4 sm:p-5">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#edf5f4] text-(--khvi-teal)">{icon}</span>
        <div className="min-w-0">
          <h3 className="text-sm font-black text-(--khvi-navy)">{title}</h3>
          <p className="mt-1 text-xs leading-5 text-(--khvi-ink)/60">{description}</p>
        </div>
      </div>
      {chips && <div className="mt-4 flex flex-wrap gap-2">{chips.map((chip) => <span key={chip} className="rounded-full bg-(--khvi-paper) px-2.5 py-1 text-[11px] font-bold text-(--khvi-ink)/70">{chip}</span>)}</div>}
      {href && <Link href={href} className="mt-4 inline-flex items-center gap-1.5 text-xs font-extrabold text-(--khvi-teal) hover:text-(--khvi-navy)">{linkLabel ?? "Open"}<ArrowRightIcon className="h-3.5 w-3.5" aria-hidden="true" /></Link>}
    </div>
  );
}

function Metric({ label, value, tone }: { label: string; value: string; tone?: "sage" }) {
  return (
    <div className="rounded-xl border border-(--khvi-teal)/15 bg-[#f7fbfa] p-4">
      <p className="text-[11px] font-extrabold uppercase tracking-[0.08em] text-(--khvi-ink)/50">{label}</p>
      <p className={`mt-2 text-xl font-black ${tone === "sage" ? "text-(--khvi-sage)" : "text-(--khvi-navy)"}`}>{value}</p>
    </div>
  );
}

function ReadOnlyNotice({ children }: { children: ReactNode }) {
  return (
    <div className="flex gap-3 rounded-xl border border-(--khvi-sun)/35 bg-[#fffaf1] p-4 text-xs leading-5 text-(--khvi-ink)/65">
      <ClockIcon className="mt-0.5 h-4 w-4 shrink-0 text-[#b96d25]" aria-hidden="true" />
      <p>{children}</p>
    </div>
  );
}
