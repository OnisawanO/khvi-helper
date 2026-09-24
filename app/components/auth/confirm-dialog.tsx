"use client";

import { useEffect, useRef } from "react";

interface ConfirmDialogProps {
  cancelLabel: string;
  confirmLabel: string;
  message: string;
  onCancel: () => void;
  onConfirm: () => void;
}

export function ConfirmDialog({
  cancelLabel,
  confirmLabel,
  message,
  onCancel,
  onConfirm,
}: ConfirmDialogProps) {
  const cancelButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    cancelButtonRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onCancel();
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onCancel]);

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-label={message}
      className="fixed inset-0 z-[70] flex items-center justify-center bg-[#092f45]/55 p-4 backdrop-blur-[2px]"
    >
      <div className="w-full max-w-md rounded-2xl border border-[#d6e0e4] bg-white p-5 shadow-[0_24px_64px_rgba(9,47,69,0.25)] sm:p-6">
        <p className="text-base font-semibold leading-7 text-[#092f45]">{message}</p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            ref={cancelButtonRef}
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-[#cbd9de] bg-white px-4 py-2.5 text-sm font-bold text-[#39525d] transition-colors hover:border-[#092f45] hover:text-[#092f45] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#087f80]"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-xl bg-[#092f45] px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#0d405d] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#087f80]"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
