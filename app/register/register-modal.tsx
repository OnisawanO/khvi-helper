"use client";

import { useEffect, useRef } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { RegisterForm } from "./register-form";

export interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function RegisterModal({ isOpen, onClose, onSuccess }: RegisterModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    // Prevent body scroll when modal is open
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="แบบฟอร์มสมัครสมาชิก"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-[#092f45]/60 backdrop-blur-xs"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        ref={dialogRef}
        className="relative my-auto w-full max-w-lg rounded-2xl border border-[#d6e0e4] bg-white p-5 sm:p-8 shadow-[0_24px_54px_rgba(9,47,69,0.22)] max-h-[92vh] overflow-y-auto"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-10 flex h-8 w-8 items-center justify-center rounded-lg text-[#73848a] hover:bg-[#eef5f7] hover:text-[#122b3e] transition-colors"
          aria-label="ปิดหน้าต่างสมัครสมาชิก"
        >
          <XMarkIcon className="h-5 w-5" aria-hidden="true" />
        </button>

        {/* Form Body */}
        <RegisterForm
          isModal={true}
          onCancel={onClose}
          onSuccess={onSuccess}
        />
      </div>
    </div>
  );
}
