"use client";

import { useEffect, useRef } from "react";
import {
  UserIcon,
  AcademicCapIcon,
  XMarkIcon,
  ShieldCheckIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import { useStoredLocale } from "@/app/lib/locale";

export interface RegisterRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectUser: () => void;
  onSelectInterpreter: () => void;
}

export function RegisterRoleModal({
  isOpen,
  onClose,
  onSelectUser,
  onSelectInterpreter,
}: RegisterRoleModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const [locale] = useStoredLocale();

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    }
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="role-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-[#092f45]/70 backdrop-blur-xs animate-in fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        ref={dialogRef}
        className="relative my-auto w-full max-w-2xl rounded-3xl border border-[#d6e0e4] bg-white p-6 sm:p-8 shadow-[0_24px_64px_rgba(9,47,69,0.28)]"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-[#5c727d] transition-all hover:bg-slate-200 hover:text-[#092f45] cursor-pointer"
          aria-label="Close"
        >
          <XMarkIcon className="h-5 w-5" aria-hidden="true" />
        </button>

        {/* Header */}
        <div className="text-center max-w-lg mx-auto">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#b9d9d6] bg-[#edf7f5] px-3 py-1 text-xs font-black uppercase tracking-wider text-[#087f80]">
            <SparklesIcon className="h-3.5 w-3.5" />
            {locale === "th" ? "เลือกประเภทบัญชีผู้ใช้" : locale === "zh" ? "选择账户类型" : "Choose Account Type"}
          </span>
          <h2 id="role-modal-title" className="mt-3 text-2xl font-black text-[#10283a] sm:text-3xl">
            {locale === "th"
              ? "คุณต้องการลงทะเบียนเป็นอะไร?"
              : locale === "zh"
                ? "你想注册为哪种角色？"
                : "What would you like to register as?"}
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-[#64777e]">
            {locale === "th"
              ? "เลือกบทบาทของคุณในระบบ KHVI Helper เพื่อเริ่มต้นการลงทะเบียนที่ตรงกับความต้องการ"
              : locale === "zh"
                ? "选择您在 KHVI Helper 系统中的角色，以进行相应的注册流程"
                : "Select your role in KHVI Helper to proceed with the appropriate registration process."}
          </p>
        </div>

        {/* Role Cards Grid */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Card 1: User / Requester */}
          <div
            onClick={onSelectUser}
            className="group relative flex flex-col justify-between rounded-2xl border-2 border-[#e2ebee] bg-white p-5 sm:p-6 transition-all hover:border-[#087f80] hover:shadow-md cursor-pointer hover:-translate-y-0.5"
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#edf7f5] text-[#087f80] group-hover:bg-[#087f80] group-hover:text-white transition-colors">
                  <UserIcon className="h-6 w-6" />
                </div>
                <span className="rounded-full border border-[#cbd7dc] bg-[#f8fafb] px-2.5 py-0.5 text-[11px] font-bold text-[#53656c]">
                  {locale === "th" ? "ผู้ขอความช่วยเหลือ" : locale === "zh" ? "求助者" : "Requester"}
                </span>
              </div>

              <h3 className="mt-4 text-lg font-black text-[#10283a] group-hover:text-[#087f80] transition-colors">
                {locale === "th" ? "ผู้ใช้งานทั่วไป (User)" : locale === "zh" ? "普通用户 (User)" : "Standard User"}
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-[#64777e]">
                {locale === "th"
                  ? "สำหรับผู้ที่ต้องการความช่วยเหลือทางภาษา สื่อสารยามฉุกเฉิน หรือประสานงานในชีวิตประจำวัน"
                  : locale === "zh"
                    ? "适用于需要紧急翻译、日常沟通或协助服务的普通用户"
                    : "For individuals needing language translation, emergency communication, or coordination."}
              </p>

              <ul className="mt-4 space-y-1.5 text-xs text-[#526a74]">
                <li className="flex items-center gap-1.5">
                  <span className="text-[#087557] font-bold">✓</span>
                  <span>{locale === "th" ? "สร้างคำขอ SOS ได้ทันที" : locale === "zh" ? "即时发布 SOS 求助" : "Post SOS help requests"}</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="text-[#087557] font-bold">✓</span>
                  <span>{locale === "th" ? "เชื่อมต่อล่ามอาสาใกล้เคียง" : locale === "zh" ? "连接附近志愿口译员" : "Connect with nearby interpreters"}</span>
                </li>
              </ul>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onSelectUser();
              }}
              className="mt-6 inline-flex w-full min-h-11 items-center justify-center rounded-xl border border-[#087f80] bg-[#edf7f5] px-4 py-2.5 text-xs font-extrabold text-[#087f80] group-hover:bg-[#087f80] group-hover:text-white transition-colors cursor-pointer"
            >
              {locale === "th" ? "ลงทะเบียนเป็น User →" : locale === "zh" ? "注册为普通用户 →" : "Register as User →"}
            </button>
          </div>

          {/* Card 2: Volunteer Interpreter */}
          <div
            onClick={onSelectInterpreter}
            className="group relative flex flex-col justify-between rounded-2xl border-2 border-[#143748] bg-[#092f45] p-5 sm:p-6 text-white transition-all hover:border-[#8ed5c4] hover:shadow-lg cursor-pointer hover:-translate-y-0.5"
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-[#8ed5c4] group-hover:bg-[#8ed5c4] group-hover:text-[#092f45] transition-colors">
                  <AcademicCapIcon className="h-6 w-6" />
                </div>
                <span className="rounded-full border border-[#8ed5c4]/40 bg-[#087f80] px-2.5 py-0.5 text-[11px] font-extrabold text-white">
                  {locale === "th" ? "ล่ามจิตอาสา" : locale === "zh" ? "志愿口译员" : "Interpreter"}
                </span>
              </div>

              <h3 className="mt-4 text-lg font-black text-white group-hover:text-[#8ed5c4] transition-colors">
                {locale === "th" ? "ล่ามจิตอาสา (Interpreter)" : locale === "zh" ? "志愿口译员 (Interpreter)" : "Volunteer Interpreter"}
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-300">
                {locale === "th"
                  ? "สำหรับผู้มีทักษะทางภาษาและประสงค์เข้าร่วมช่วยเหลือผู้ประสบภัยในสถานการณ์ต่าง ๆ"
                  : locale === "zh"
                    ? "适用于具备多语言技能，希望协助受助者并参与应急救援的专业人士"
                    : "For multilingual speakers wanting to provide volunteer interpretation support."}
              </p>

              <ul className="mt-4 space-y-1.5 text-xs text-slate-300">
                <li className="flex items-center gap-1.5">
                  <span className="text-[#8ed5c4] font-bold">✓</span>
                  <span>{locale === "th" ? "สมัครและยื่นเอกสารในหน้าเดียว" : locale === "zh" ? "单页面注册与提交资质" : "Register and submit credentials"}</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="text-[#8ed5c4] font-bold">✓</span>
                  <span>{locale === "th" ? "รับงานช่วยเหลือและสะสมภารกิจ" : locale === "zh" ? "接收任务并积累服务记录" : "Claim requests & build impact"}</span>
                </li>
              </ul>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onSelectInterpreter();
              }}
              className="mt-6 inline-flex w-full min-h-11 items-center justify-center rounded-xl bg-[#087f80] px-4 py-2.5 text-xs font-extrabold text-white group-hover:bg-[#8ed5c4] group-hover:text-[#092f45] transition-colors cursor-pointer"
            >
              {locale === "th" ? "ลงทะเบียนเป็นล่ามอาสา →" : locale === "zh" ? "注册为志愿口译员 →" : "Register as Volunteer →"}
            </button>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-[#73848a]">
          <ShieldCheckIcon className="h-4 w-4 text-[#087557]" />
          <span>
            {locale === "th"
              ? "ข้อมูลของคุณได้รับการคุ้มครองความปลอดภัยตามมาตรฐาน BR-04 Shield"
              : locale === "zh"
                ? "您的个人信息受 BR-04 隐私保护规范保障"
                : "Your information is protected under BR-04 Shield privacy standards"}
          </span>
        </div>
      </div>
    </div>
  );
}
