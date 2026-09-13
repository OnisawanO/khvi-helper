"use client";

import { useState } from "react";
import Link from "next/link";
import { ApplicationForm } from "@/components/volunteer/ApplicationForm";
import { SiteHeader, type Locale } from "@/app/components/site-header";
import { SiteFooter } from "@/app/components/site-footer";

const headerCopy = {
  brandSubtitle: "Community interpreter map",
  languageLabel: "Language",
  signIn: "Sign in",
  primaryAction: "Create pin",
  nav: [
    ["Map preview", "/#map-preview"],
    ["How it works", "/#how-it-works"],
    ["Safety", "/#safety"],
    ["Roles", "/#roles"],
  ] as const,
};

const footerCopy = {
  description: "A map-based language help platform for situations where communication needs to be clear and timely.",
  note: "Built for safer coordination",
  explore: "Explore",
  safety: "Safety",
  needHelp: "Need help?",
  needHelpBody: "Start by creating a request pin with the language, category, and location where help is needed.",
  footerCta: "Create a help request pin",
  privacy: "Sensitive details stay hidden until a job is claimed",
  links: {
    map: "/#map-preview",
    how: "/#how-it-works",
    roles: "/#roles",
    privacy: "/#safety",
    request: "/request-help",
    signIn: "/sign-in",
  },
};

export default function VolunteerApplyPage() {
  const [locale, setLocale] = useState<Locale>("th");

  return (
    <div className="min-h-screen flex flex-col bg-[#f7f9fa] text-[#10283a] antialiased">
      <SiteHeader
        copy={headerCopy}
        locale={locale}
        onLocaleChange={(newLocale) => setLocale(newLocale)}
      />

      <main className="flex-1 mx-auto w-full max-w-4xl px-4 py-8 sm:px-6">
        {/* Navigation Breadcrumb */}
        <div className="mb-5 flex items-center justify-between text-xs text-[#64777e]">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 font-bold text-[#087f80] hover:text-[#096f70] transition-colors"
          >
            <span>← กลับสู่หน้าหลัก</span>
          </Link>
          <span className="border border-[#d8e4e7] bg-white px-2.5 py-1 font-mono text-xs text-[#73848a]">
            /volunteer/apply
          </span>
        </div>

        {/* Centered Header Banner (Sharp Rectangular) */}
        <div className="border border-[#143748] bg-[#092f45] p-6 text-white shadow-sm sm:p-7 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="border border-[#8ed5c4]/40 bg-[#087f80] px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-white">
                  Volunteer Portal
                </span>
                <span className="text-xs text-slate-300">• KHVI Helper Volunteer Onboarding</span>
              </div>
              <h1 className="mt-2 text-xl font-extrabold tracking-tight text-white sm:text-2xl">
                จัดการโปรไฟล์และสมัครล่ามจิตอาสา
              </h1>
              <p className="mt-1 text-xs text-slate-300 leading-relaxed max-w-xl">
                ระบุภาษาที่สื่อสารได้ หมวดหมู่งาน และช่องทางติดต่อ เพื่อให้ระบบจับคู่ภารกิจได้อย่างแม่นยำ
              </p>
            </div>

            {/* Badges */}
            <div className="flex items-center gap-2 shrink-0">
              <span className="border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-bold text-[#8ed5c4]">
                ✓ Data Dictionary 100%
              </span>
              <span className="border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-bold text-white/80">
                🔒 BR-04 Shield
              </span>
            </div>
          </div>
        </div>

        {/* Centered Form Container */}
        <ApplicationForm />
      </main>

      <SiteFooter copy={footerCopy} brandSubtitle={headerCopy.brandSubtitle} />
    </div>
  );
}
