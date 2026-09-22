"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  CheckBadgeIcon,
  KeyIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import type { AuthCopy } from "@/app/lib/auth-copy";
import { ConfirmDialog } from "./confirm-dialog";

export type AuthSideCopy = Pick<
  AuthCopy["side"]["login"],
  "eyebrow" | "title" | "description" | "centerTitle" | "trustOne" | "trustTwo"
> & Partial<Pick<AuthCopy["side"]["login"], "roles" | "secure" | "roleCount"> & Pick<AuthCopy["side"]["register"], "languages" | "radius" | "verified">>;

interface AuthShellProps {
  ariaLabel: string;
  children: ReactNode;
  confirmCancelLabel?: string;
  confirmDiscardLabel?: string;
  confirmCloseMessage?: string;
  dir?: "ltr" | "rtl";
  isDirty?: boolean;
  mode?: "modal" | "page";
  onClose?: () => void;
  sideCopy: AuthSideCopy;
}

export function AuthShell({
  ariaLabel,
  children,
  confirmCancelLabel = "Cancel",
  confirmDiscardLabel = "Discard",
  confirmCloseMessage,
  dir = "ltr",
  isDirty = false,
  mode = "page",
  onClose,
  sideCopy,
}: AuthShellProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const [isConfirmingClose, setIsConfirmingClose] = useState(false);
  const closeStateRef = useRef({ confirmCloseMessage, isDirty, onClose });
  const isModal = mode === "modal";
  closeStateRef.current = { confirmCloseMessage, isDirty, onClose };

  useEffect(() => {
    if (!isModal || !onClose) return;

    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const frame = requestAnimationFrame(() => {
      dialogRef.current?.querySelector<HTMLElement>("input, button, a[href]")?.focus();
    });
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Tab") {
        const nodes = Array.from(
          dialogRef.current?.querySelectorAll<HTMLElement>(
            'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex="0"]',
          ) ?? [],
        ).filter((element) => element.getClientRects().length > 0);
        const first = nodes[0];
        const last = nodes[nodes.length - 1];

        if (first && last && (event.shiftKey ? document.activeElement === first : document.activeElement === last)) {
          event.preventDefault();
          (event.shiftKey ? last : first).focus();
        }
      }

      if (event.key === "Escape") {
        handleClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      cancelAnimationFrame(frame);
      document.body.style.overflow = originalOverflow;
      previousFocus?.focus();
      document.removeEventListener("keydown", handleKeyDown);
    };
    // The modal lifecycle is intentionally tied to its open/close state.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isModal]);

  function handleClose() {
    const { confirmCloseMessage: message, isDirty: dirty, onClose: close } = closeStateRef.current;
    if (!close) return;
    if (dirty && message) {
      setIsConfirmingClose(true);
      return;
    }
    close();
  }

  function cancelClose() {
    setIsConfirmingClose(false);
  }

  function confirmClose() {
    setIsConfirmingClose(false);
    closeStateRef.current.onClose?.();
  }

  const card = (
    <div
      ref={dialogRef}
      dir={dir}
      className={`relative grid w-full grid-cols-1 overflow-hidden border border-[#d6e0e4] bg-white shadow-[0_24px_64px_rgba(9,47,69,0.18)] md:grid-cols-[1.15fr_0.85fr] ${
        isModal ? "my-auto max-w-5xl rounded-3xl max-h-[94vh]" : "max-w-5xl rounded-[2rem]"
      }`}
    >
      {isModal && onClose && (
        <button
          type="button"
          onClick={handleClose}
          className="absolute right-4 top-4 z-20 grid h-10 w-10 place-items-center rounded-full bg-white/85 text-[#5c727d] shadow-sm backdrop-blur transition-colors hover:bg-white hover:text-[#092f45] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#087f80]"
          aria-label="Close"
        >
          <XMarkIcon className="h-5 w-5" aria-hidden="true" />
        </button>
      )}

      <div className="min-h-0 overflow-y-auto p-5 sm:p-8">
        {children}
      </div>

      <aside
        className={`relative hidden min-h-full flex-col justify-between overflow-hidden border-[#d8e8e4] bg-[#edf7f5] p-8 md:flex ${
          dir === "rtl" ? "md:order-1 md:border-r" : "md:order-2 md:border-l"
        }`}
      >
        <div aria-hidden="true" className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-[#087f80]/10 blur-3xl" />
        <div aria-hidden="true" className="pointer-events-none absolute -bottom-24 -left-20 h-64 w-64 rounded-full bg-[#092f45]/8 blur-3xl" />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-[#087f80]/25 bg-[#d8efe9] px-3 py-1 text-xs font-bold text-[#087f80]">
            <ShieldCheckIcon className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{sideCopy.eyebrow}</span>
          </div>
          <h2 className="mt-4 text-2xl font-extrabold leading-tight text-[#092f45]">
            {sideCopy.title.split("\n").map((line) => <span key={line} className="block">{line}</span>)}
          </h2>
          <p className="mt-2 text-sm leading-6 text-[#5c727d]">{sideCopy.description}</p>
        </div>

        <div className="relative z-10 my-8 flex justify-center">
          <div className="relative grid aspect-square w-full max-w-[230px] place-items-center rounded-full border border-[#d5ebe5] bg-white/45">
            <div className="flex h-28 w-28 flex-col items-center justify-center rounded-3xl bg-[#092f45] text-center text-white shadow-[0_14px_30px_rgba(9,47,69,0.20)]">
              <ShieldCheckIcon className="h-10 w-10" aria-hidden="true" />
              <span className="mt-2 text-[10px] font-extrabold leading-4">{sideCopy.centerTitle}</span>
              <span className="text-[9px] leading-3 text-white/70">{sideCopy.roles ?? sideCopy.languages}</span>
            </div>
            <div className="absolute left-0 top-8 inline-flex items-center gap-1.5 rounded-xl border border-[#d8e8e4] bg-white px-2.5 py-1.5 text-[11px] font-bold text-[#092f45] shadow-sm">
              <KeyIcon className="h-4 w-4 text-[#087f80]" aria-hidden="true" />
              <span>{sideCopy.secure ?? sideCopy.verified}</span>
            </div>
            <div className="absolute bottom-8 right-0 inline-flex items-center gap-1.5 rounded-xl border border-[#d8e8e4] bg-white px-2.5 py-1.5 text-[11px] font-bold text-[#087f80] shadow-sm">
              <UserGroupIcon className="h-4 w-4" aria-hidden="true" />
              <span>{sideCopy.roleCount ?? sideCopy.languages}</span>
            </div>
          </div>
        </div>

        <div className="relative z-10 space-y-2.5 rounded-2xl border border-[#dbe6e4] bg-white/80 p-4 shadow-sm backdrop-blur">
          <div className="flex items-start gap-2.5 text-xs leading-5 text-[#39525d]">
            <ShieldCheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-[#087f80]" aria-hidden="true" />
            <span>{sideCopy.trustOne}</span>
          </div>
          <div className="flex items-start gap-2.5 text-xs leading-5 text-[#39525d]">
            <CheckBadgeIcon className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden="true" />
            <span>{sideCopy.trustTwo}</span>
          </div>
        </div>
      </aside>
    </div>
  );

  if (!isModal) {
    return <div className="flex w-full justify-center">{card}</div>;
  }

  return (
    <>
      <div
      role="dialog"
      aria-modal="true"
      aria-label={ariaLabel}
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#092f45]/65 p-3 backdrop-blur-sm sm:p-5"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) handleClose();
      }}
      >
        {card}
      </div>
      {isConfirmingClose && confirmCloseMessage && (
        <ConfirmDialog
          cancelLabel={confirmCancelLabel}
          confirmLabel={confirmDiscardLabel}
          message={confirmCloseMessage}
          onCancel={cancelClose}
          onConfirm={confirmClose}
        />
      )}
    </>
  );
}
