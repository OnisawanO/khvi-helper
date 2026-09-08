"use client";

import { useEffect, useRef } from "react";
import {
  ArrowRightOnRectangleIcon,
  CheckBadgeIcon,
  KeyIcon,
  ShieldCheckIcon,
  SparklesIcon,
  UserGroupIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { LoginForm } from "./login-form";
import type { UserProfile } from "@/app/lib/mock-auth";

export interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (user: UserProfile) => void;
  onSwitchToRegister?: () => void;
}

export function LoginModal({
  isOpen,
  onClose,
  onSuccess,
  onSwitchToRegister,
}: LoginModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

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
      aria-label="แบบฟอร์มเข้าสู่ระบบ"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto bg-[#092f45]/65 backdrop-blur-xs"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        ref={dialogRef}
        className="relative my-auto w-full max-w-4xl rounded-3xl border border-[#d6e0e4] bg-white shadow-[0_24px_64px_rgba(9,47,69,0.28)] overflow-hidden grid grid-cols-1 md:grid-cols-[1.15fr_0.85fr] max-h-[94vh]"
      >
        {/* Circular Close Button at top-right corner */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-[#5c727d] shadow-sm backdrop-blur transition-all hover:bg-white hover:text-[#092f45] hover:scale-105 active:scale-95 cursor-pointer"
          aria-label="ปิดหน้าต่างเข้าสู่ระบบ"
        >
          <XMarkIcon className="h-5 w-5" aria-hidden="true" />
        </button>

        {/* Left Column: Login Form */}
        <div className="p-6 sm:p-8 overflow-y-auto max-h-[94vh]">
          <LoginForm
            isModal={true}
            onSuccess={onSuccess}
            onSwitchToRegister={onSwitchToRegister}
          />
        </div>

        {/* Right Column: Fastwork-style Illustration & Trust points */}
        <div className="hidden md:flex flex-col justify-between p-8 bg-gradient-to-br from-[#edf7f5] via-[#f1f8f7] to-[#e1efe9] border-l border-[#d8e8e4] relative overflow-hidden">
          {/* Decorative background blobs */}
          <div
            aria-hidden="true"
            className="absolute -top-16 -right-16 w-52 h-52 rounded-full bg-[var(--khvi-teal)]/10 blur-2xl pointer-events-none"
          />
          <div
            aria-hidden="true"
            className="absolute -bottom-16 -left-16 w-52 h-52 rounded-full bg-[var(--khvi-navy)]/8 blur-2xl pointer-events-none"
          />

          {/* Top Branding Tag */}
          <div className="relative z-10">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-[#d8efe9] px-3 py-1 text-xs font-bold text-[var(--khvi-teal)] border border-[var(--khvi-teal)]/30">
              <SparklesIcon className="h-3.5 w-3.5" />
              <span>ยินดีต้อนรับกลับมา</span>
            </div>
            <h3 className="mt-3 text-xl font-extrabold text-[var(--khvi-navy)] leading-snug">
              สานต่อความช่วยเหลือ<br />และภารกิจด้านภาษา
            </h3>
            <p className="mt-1.5 text-xs text-[#5c727d] leading-relaxed">
              เข้าสู่ระบบเพื่อจัดการภารกิจ ช่วยเหลือผู้คน หรือตรวจสอบความเรียบร้อยของชุมชน
            </p>
          </div>

          {/* Center Graphic / Vector Art */}
          <div className="relative z-10 my-6 flex flex-col items-center justify-center">
            <div className="relative w-full max-w-[260px] aspect-square flex items-center justify-center">
              {/* Central Circle Art */}
              <div className="absolute inset-4 rounded-full bg-white/70 shadow-[0_12px_28px_rgba(9,47,69,0.08)] border border-white flex flex-col items-center justify-center p-6 text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#092f45] to-[var(--khvi-teal)] text-white flex items-center justify-center shadow-lg shadow-[var(--khvi-navy)]/25 mb-3">
                  <ArrowRightOnRectangleIcon className="h-8 w-8" />
                </div>
                <div className="text-sm font-bold text-[var(--khvi-navy)]">
                  KHVI Helper Portal
                </div>
                <div className="text-[11px] text-[#73848a] mt-0.5">
                  User · Volunteer · Manager · Admin
                </div>
              </div>

              {/* Floating Badge 1 - Top Left */}
              <div className="absolute top-2 left-0 bg-white rounded-xl shadow-md border border-[#d8e8e4] px-2.5 py-1.5 flex items-center gap-1.5 animate-pulse">
                <KeyIcon className="h-4 w-4 text-[var(--khvi-teal)]" />
                <span className="text-[11px] font-bold text-[var(--khvi-navy)]">เข้าสู่ระบบปลอดภัย</span>
              </div>

              {/* Floating Badge 2 - Bottom Right */}
              <div className="absolute bottom-2 right-0 bg-white rounded-xl shadow-md border border-[#d8e8e4] px-2.5 py-1.5 flex items-center gap-1.5">
                <UserGroupIcon className="h-4 w-4 text-[#087f80]" />
                <span className="text-[11px] font-bold text-[#087f80]">รองรับ 4 สิทธิ์</span>
              </div>
            </div>
          </div>

          {/* Bottom Trust Indicators */}
          <div className="relative z-10 space-y-2.5 rounded-2xl bg-white/80 p-4 border border-[#dbe6e4] backdrop-blur-xs shadow-xs">
            <div className="flex items-start gap-2.5 text-xs text-[#39525d]">
              <ShieldCheckIcon className="h-4 w-4 text-[var(--khvi-teal)] shrink-0 mt-0.5" />
              <span>การเข้ารหัสข้อมูลที่รัดกุม ปกป้องความเป็นส่วนตัวในทุกขั้นตอน</span>
            </div>
            <div className="flex items-start gap-2.5 text-xs text-[#39525d]">
              <CheckBadgeIcon className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>พร้อมนำทางไปยังแดชบอร์ดตามสิทธิ์การใช้งานของคุณโดยอัตโนมัติ</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
