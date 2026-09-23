"use client";

import { useUiLocale } from "@/app/components/app-shell";

export function VolunteerApplyHeader() {
  const locale = useUiLocale();

  return (
    <div className="rounded-(--khvi-radius-md) border border-[#143748] bg-[#092f45] p-6 text-white shadow-sm sm:p-7 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-(--khvi-radius-sm) border border-[#8ed5c4]/40 bg-[#087f80] px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-white">
              Volunteer Portal
            </span>
            <span className="text-xs text-slate-300">• KHVI Helper Volunteer Onboarding</span>
          </div>
          <h1 className="mt-2 text-xl font-extrabold tracking-tight text-white sm:text-2xl">
            {locale === "th"
              ? "จัดการโปรไฟล์และสมัครล่ามจิตอาสา"
              : locale === "zh"
                ? "管理个人资料并申请志愿口译员"
                : "Manage Profile & Volunteer Interpreter Application"}
          </h1>
          <p className="mt-1 text-xs text-slate-300 sm:text-sm">
            {locale === "th"
              ? "ลงทะเบียนทักษะทางภาษาและยื่นเอกสารเพื่อร่วมเป็นเครือข่ายช่วยเหลือผู้ประสบภัย"
              : locale === "zh"
                ? "登记语言技能并提交资质证明，加入应急救援志愿网络"
                : "Register language proficiencies and submit credentials to join the crisis response network"}
          </p>
        </div>

        {/* Badges */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="rounded-(--khvi-radius-sm) border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-bold text-[#8ed5c4]">
            ✓ Data Dictionary 100%
          </span>
        </div>
      </div>
    </div>
  );
}

