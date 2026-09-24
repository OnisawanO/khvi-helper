"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState, useTransition, type FormEvent } from "react";
import {
  BugAntIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ShieldExclamationIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { submitSystemReportAction } from "@/app/actions/system-report-actions";
import { createClient } from "@/utils/supabase/client";

type ReportAccess = "loading" | "guest" | "allowed" | "restricted";

type SystemReportDialogProps = {
  tone: "dark" | "light";
};

const categoryOptions = [
  { value: "account_access", label: "Sign in and account" },
  { value: "requests_bookings", label: "Requests and bookings" },
  { value: "map_location", label: "Map and location" },
  { value: "language_display", label: "Language and display" },
  { value: "other", label: "Other" },
];

const focusableSelector = [
  "button:not([disabled])",
  "[href]",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
].join(",");

export function SystemReportDialog({ tone }: SystemReportDialogProps) {
  const [open, setOpen] = useState(false);
  const [access, setAccess] = useState<ReportAccess>("loading");
  const [category, setCategory] = useState(categoryOptions[0].value);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [bookingId, setBookingId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [isPending, startTransition] = useTransition();
  const dialogRef = useRef<HTMLElement>(null);

  const reset = useCallback(() => {
    setAccess("loading");
    setCategory(categoryOptions[0].value);
    setTitle("");
    setDescription("");
    setBookingId("");
    setError(null);
    setSubmitted(false);
  }, []);

  const closeDialog = useCallback(() => {
    setOpen(false);
    reset();
  }, [reset]);

  const openDialog = useCallback(() => {
    reset();
    setOpen(true);
  }, [reset]);

  useEffect(() => {
    if (!open) return;

    let active = true;
    const loadAccess = async () => {
      const supabase = createClient();
      const { data: userData } = await supabase.auth.getUser();
      if (!active) return;

      if (!userData.user) {
        setAccess("guest");
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role, is_locked")
        .eq("user_id", userData.user.id)
        .maybeSingle();

      if (!active) return;
      setAccess(
        !profileError && profile && !profile.is_locked && ["User", "Interpreter"].includes(profile.role)
          ? "allowed"
          : "restricted",
      );
    };

    void loadAccess();
    return () => {
      active = false;
    };
  }, [open, closeDialog]);

  useEffect(() => {
    if (!open) return;

    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const focusFirstElement = () => {
      dialogRef.current?.querySelector<HTMLElement>(focusableSelector)?.focus();
    };
    const frame = window.requestAnimationFrame(focusFirstElement);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeDialog();
        return;
      }

      if (event.key !== "Tab") return;
      const focusable = Array.from(dialogRef.current?.querySelectorAll<HTMLElement>(focusableSelector) ?? []);
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      window.cancelAnimationFrame(frame);
      document.body.style.overflow = originalOverflow;
      document.removeEventListener("keydown", handleKeyDown);
      previousFocus?.focus();
    };
  }, [open, closeDialog]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    startTransition(async () => {
      const result = await submitSystemReportAction({ category, title, description, bookingId });
      if (!result.ok) {
        setError(result.error);
        return;
      }

      setSubmitted(true);
    });
  };

  const triggerClassName = tone === "dark"
    ? "inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 font-semibold text-white/70 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-(--khvi-sun)"
    : "inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 font-semibold text-(--khvi-teal) transition-colors hover:bg-(--khvi-paper) hover:text-(--khvi-navy) focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-(--khvi-sun)";

  return (
    <>
      <button type="button" className={triggerClassName} onClick={openDialog}>
        <ShieldExclamationIcon aria-hidden="true" className="h-4 w-4" />
        Report a system issue
      </button>

      {open && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-(--khvi-navy)/65 p-4 backdrop-blur-[2px]" role="presentation">
          <section
            ref={dialogRef}
            aria-labelledby="system-report-title"
            aria-modal="true"
            className="relative max-h-[min(760px,calc(100vh-2rem))] w-full max-w-[620px] overflow-y-auto rounded-(--khvi-radius-lg) bg-(--khvi-surface) shadow-(--khvi-shadow-raised)"
            role="dialog"
          >
            <div className="border-b border-[#dbe7e8] bg-[#f3faf6] px-6 py-6 sm:px-8">
              <button
                aria-label="Close system issue dialog"
                className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#cfe0df] bg-white text-[#315363] transition-colors hover:border-(--khvi-teal) hover:text-(--khvi-teal) focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-(--khvi-sun)"
                type="button"
                onClick={closeDialog}
              >
                <XMarkIcon aria-hidden="true" className="h-5 w-5" />
              </button>
              <div className="flex items-center gap-3 pr-10">
                <span aria-hidden="true" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#dff2ea] text-(--khvi-teal)">
                  <BugAntIcon className="h-6 w-6" />
                </span>
                <div>
                  <h2 id="system-report-title" className="text-2xl font-extrabold tracking-tight text-(--khvi-navy)">
                    Report a system issue
                  </h2>
                  <p className="mt-1 text-sm leading-6 text-[#52676f]">
                    Tell us what went wrong. Do not include passwords or personal information.
                  </p>
                </div>
              </div>
            </div>

            <div className="px-6 py-6 sm:px-8 sm:py-7">
              {access === "loading" && (
                <div aria-live="polite" className="flex items-center gap-3 rounded-(--khvi-radius-md) border border-[#dbe7e8] bg-(--khvi-paper) p-4 text-sm text-[#52676f]">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-(--khvi-teal) border-t-transparent" />
                  Checking your account…
                </div>
              )}

              {access === "guest" && (
                <div className="rounded-(--khvi-radius-md) border border-[#dbe7e8] bg-(--khvi-paper) p-5 text-sm leading-6 text-[#52676f]">
                  <p className="font-extrabold text-(--khvi-navy)">Sign in to send a report</p>
                  <p className="mt-1">Your account lets the team investigate the issue and its related booking.</p>
                  <Link className="mt-4 inline-flex min-h-11 items-center rounded-lg bg-(--khvi-navy) px-5 text-sm font-extrabold text-white transition-colors hover:bg-[#0c4960] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-(--khvi-sun)" href="/sign-in">
                    Sign in
                  </Link>
                </div>
              )}

              {access === "restricted" && (
                <div className="rounded-(--khvi-radius-md) border border-[#f4c8c1] bg-[#fff5f2] p-5 text-sm leading-6 text-[#7b3025]" role="alert">
                  <ExclamationTriangleIcon aria-hidden="true" className="mb-2 h-6 w-6" />
                  Only active User and Interpreter accounts can send system reports.
                </div>
              )}

              {access === "allowed" && submitted && (
                <div className="py-6 text-center" role="status">
                  <CheckCircleIcon aria-hidden="true" className="mx-auto h-14 w-14 text-[#087557]" />
                  <h3 className="mt-4 text-xl font-extrabold text-(--khvi-navy)">Report received</h3>
                  <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#52676f]">
                    The KHVI team can now review the system issue you sent.
                  </p>
                  <button className="mt-6 inline-flex min-h-11 items-center rounded-lg bg-(--khvi-navy) px-5 text-sm font-extrabold text-white transition-colors hover:bg-[#0c4960] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-(--khvi-sun)" type="button" onClick={closeDialog}>
                    Done
                  </button>
                </div>
              )}

              {access === "allowed" && !submitted && (
                <form className="space-y-5" onSubmit={handleSubmit}>
                  <div>
                    <label className="mb-1.5 block text-sm font-extrabold text-[#173646]" htmlFor="system-report-category">System area</label>
                    <select
                      id="system-report-category"
                      className="min-h-11 w-full rounded-lg border border-[#cfe0df] bg-white px-3 text-sm text-(--khvi-ink) focus:border-(--khvi-teal) focus:outline-none focus:ring-2 focus:ring-(--khvi-teal)/20"
                      value={category}
                      onChange={(event) => setCategory(event.target.value)}
                    >
                      {categoryOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-extrabold text-[#173646]" htmlFor="system-report-title-field">Subject</label>
                    <input
                      id="system-report-title-field"
                      required
                      maxLength={200}
                      className="min-h-11 w-full rounded-lg border border-[#cfe0df] px-3 text-sm text-(--khvi-ink) placeholder:text-[#788b91] focus:border-(--khvi-teal) focus:outline-none focus:ring-2 focus:ring-(--khvi-teal)/20"
                      placeholder="Example: The map does not load"
                      value={title}
                      onChange={(event) => setTitle(event.target.value)}
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-extrabold text-[#173646]" htmlFor="system-report-description">What happened?</label>
                    <textarea
                      id="system-report-description"
                      required
                      maxLength={5000}
                      rows={5}
                      className="w-full rounded-lg border border-[#cfe0df] px-3 py-2.5 text-sm leading-6 text-(--khvi-ink) placeholder:text-[#788b91] focus:border-(--khvi-teal) focus:outline-none focus:ring-2 focus:ring-(--khvi-teal)/20"
                      placeholder="Tell us what you expected, what happened, and how to reproduce the issue."
                      value={description}
                      onChange={(event) => setDescription(event.target.value)}
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-extrabold text-[#173646]" htmlFor="system-report-booking">Related booking ID <span className="font-semibold text-[#70848b]">(optional)</span></label>
                    <input
                      id="system-report-booking"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      className="min-h-11 w-full rounded-lg border border-[#cfe0df] px-3 text-sm text-(--khvi-ink) placeholder:text-[#788b91] focus:border-(--khvi-teal) focus:outline-none focus:ring-2 focus:ring-(--khvi-teal)/20"
                      placeholder="Example: 123"
                      value={bookingId}
                      onChange={(event) => setBookingId(event.target.value)}
                    />
                    <p className="mt-1.5 text-xs leading-5 text-[#70848b]">You can link only a booking that belongs to you.</p>
                  </div>

                  {error && <p className="rounded-lg border border-[#f4c8c1] bg-[#fff5f2] px-3 py-2 text-sm text-[#7b3025]" role="alert">{error}</p>}

                  <div className="flex flex-wrap justify-end gap-3 border-t border-[#dbe7e8] pt-5">
                    <button className="min-h-11 rounded-lg border border-[#cfe0df] bg-white px-5 text-sm font-extrabold text-[#315363] transition-colors hover:bg-(--khvi-paper) focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-(--khvi-sun)" type="button" onClick={closeDialog}>
                      Cancel
                    </button>
                    <button className="inline-flex min-h-11 items-center justify-center rounded-lg bg-(--khvi-navy) px-5 text-sm font-extrabold text-white transition-colors hover:bg-[#0c4960] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-(--khvi-sun) disabled:cursor-not-allowed disabled:opacity-60" type="submit" disabled={isPending}>
                      {isPending ? "Sending…" : "Send report"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </section>
        </div>
      )}
    </>
  );
}
