"use client";

import { ExclamationTriangleIcon, XMarkIcon } from "@heroicons/react/24/outline";

export type RoleAssignmentAlertKind = "no_approved_application" | "revoked_access";

type RoleAssignmentAlertDialogProps = {
  isOpen: boolean;
  kind: RoleAssignmentAlertKind;
  onClose: () => void;
};

const copy: Record<RoleAssignmentAlertKind, { title: string; message: string; detail: string }> = {
  no_approved_application: {
    title: "Cannot assign Interpreter role",
    message: "No approved interpreter application was found for this account.",
    detail: "Approve the user's interpreter application first. The role can only be assigned when the application status is Approved.",
  },
  revoked_access: {
    title: "Interpreter access was revoked",
    message: "This account cannot be restored through the standard role selector.",
    detail: "A Primary Admin must review the interpreter accreditation again before this account can receive Interpreter access.",
  },
};

export function RoleAssignmentAlertDialog({
  isOpen,
  kind,
  onClose,
}: RoleAssignmentAlertDialogProps) {
  if (!isOpen) return null;

  const content = copy[kind];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#092f45]/55 p-4 backdrop-blur-xs">
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="role-assignment-alert-title"
        className="w-full max-w-md overflow-hidden rounded-2xl border border-amber-200 bg-white shadow-[0_24px_60px_rgba(9,47,69,0.3)]"
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <ExclamationTriangleIcon className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <h3 id="role-assignment-alert-title" className="text-base font-extrabold text-[#092f45]">
                {content.title}
              </h3>
              <p className="mt-1 text-sm font-semibold leading-relaxed text-slate-700">
                {content.message}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
            aria-label="Close alert"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4 px-6 py-5">
          <p className="text-sm leading-relaxed text-slate-600">{content.detail}</p>
          <div className="rounded-xl border border-amber-100 bg-amber-50/70 px-4 py-3 text-xs leading-relaxed text-amber-900">
            The User Account &amp; Security Console will remain open so you can review the account details.
          </div>
        </div>

        <div className="flex justify-end border-t border-slate-100 bg-slate-50/70 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-[#087f80] px-5 py-2.5 text-xs font-extrabold text-white transition hover:bg-[#066b6c]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
