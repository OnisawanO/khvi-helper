"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SiteHeader, type Locale } from "@/app/components/site-header";
import { SiteFooter } from "@/app/components/site-footer";
import { getMockUserSession } from "@/app/lib/mock-auth";
import { getVolunteerApplication, type VolunteerApplicationSummary } from "@/app/lib/volunteer-application-store";

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

type ApplicationStatus = "under_review" | "approved" | "needs_revision";

export default function VolunteerStatusPage() {
  const [locale, setLocale] = useState<Locale>("th");

  // State สำหรับจำลองสถานะการพิจารณา (Live Interactive Simulation)
  const [status, setStatus] = useState<ApplicationStatus>("under_review");
  const [isAvailable, setIsAvailable] = useState(false);
  const [showCertModal, setShowCertModal] = useState(false);
  const [reuploadedFileName, setReuploadedFileName] = useState("");
  const [savedApplication, setSavedApplication] = useState<VolunteerApplicationSummary | null>(null);

  useEffect(() => {
    const refreshApplication = () => {
      const currentUser = getMockUserSession();
      if (!currentUser) return;

      const application = getVolunteerApplication(currentUser.userId);
      setSavedApplication(application);
      if (application && application.status !== "rejected") {
        setStatus(application.status);
      }
    };

    refreshApplication();
  }, []);

  const applicationData = {
    applicationId: savedApplication?.applicationId ?? "APP-2026-0913-048",
    volunteerId: "VLT-TH-2026-0091",
    submittedAt: savedApplication
      ? new Date(savedApplication.submittedAt).toLocaleString("th-TH", { dateStyle: "medium", timeStyle: "short" })
      : "13 ก.ย. 2026, 21:30 น.",
    applicantName: savedApplication?.applicantName ?? "ปกรณ์ กิจเจริญชัย (Pakorn Kitcharoenchai)",
    phone: savedApplication?.phone || "081-234-5678",
    extraContact: savedApplication?.extraContact || "@pakorn_trans (LINE ID)",
    languages: savedApplication?.languages?.length ? savedApplication.languages : [
      { id: "th", name: "ไทย (Thai)", type: "Primary (ภาษาหลัก)" },
      { id: "en", name: "อังกฤษ (English)", type: "Fluent" },
      { id: "zh", name: "จีน (Chinese)", type: "HSK 5" },
    ],
    categories: savedApplication?.categories?.length ? savedApplication.categories : [
      { id: 9, name: "การสื่อสารทั่วไปและชีวิตประจำวัน (General & Daily Life)", icon: "💬" },
      { id: 1, name: "การแพทย์และโรงพยาบาล (Healthcare & Hospital)", icon: "🏥" },
      { id: 2, name: "สถานีตำรวจและคดีความ (Police & Legal)", icon: "👮" },
    ],
    certificateFileName: reuploadedFileName || savedApplication?.certificateFileName || "hsk5_and_ielts_certificate.pdf",
    estimatedReviewTime: "ภายใน 24 ชั่วโมง",
    assignedArea: savedApplication?.assignedArea || "กรุงเทพมหานครและปริมณฑล (Bangkok Metropolitan)",
  };

  const handleReupload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setReuploadedFileName(file.name);
      setStatus("under_review");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f7f9fa] text-[#10283a] antialiased">
      {/* Site Header (Identical sharp styling) */}
      <SiteHeader
        copy={headerCopy}
        locale={locale}
        onLocaleChange={(newLocale) => setLocale(newLocale)}
      />

      {/* Main Body (Centered max-w-4xl) */}
      <main className="flex-1 mx-auto w-full max-w-4xl px-4 py-8 sm:px-6">
        {/* Navigation Breadcrumb */}
        <div className="mb-5 flex items-center justify-between text-xs text-[#64777e]">
          <Link
            href="/volunteer/dashboard"
            className="inline-flex items-center gap-1.5 font-bold text-[#087f80] hover:text-[#096f70] transition-colors"
          >
            <span>← กลับสู่กระดานภารกิจ (/volunteer/dashboard)</span>
          </Link>
          <span className="border border-[#d8e4e7] bg-white px-2.5 py-1 font-mono text-xs text-[#73848a]">
            /volunteer/status
          </span>
        </div>

        {/* Demo Status Switcher Bar (Interactive Simulation for Reviewers) */}
        <div className="mb-6 border border-[#c5d8dc] bg-[#edf7f5] p-3 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 bg-[#087f80]"></span>
              <span className="text-xs font-extrabold text-[#092f45]">
                โหมดทดสอบผลการพิจารณา (Live Status Simulator):
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => setStatus("under_review")}
                className={`px-3 py-1.5 text-xs font-extrabold transition-colors ${
                  status === "under_review"
                    ? "border border-[#087f80] bg-[#087f80] text-white shadow-xs"
                    : "border border-[#b8cbd0] bg-white text-[#526a74] hover:bg-[#f0f6f7]"
                }`}
              >
                1. กำลังรอตรวจสอบ (Under Review)
              </button>
              <button
                type="button"
                onClick={() => setStatus("approved")}
                className={`px-3 py-1.5 text-xs font-extrabold transition-colors ${
                  status === "approved"
                    ? "border border-[#087557] bg-[#087557] text-white shadow-xs"
                    : "border border-[#b8cbd0] bg-white text-[#526a74] hover:bg-[#f0f6f7]"
                }`}
              >
                2. ผ่านการอนุมัติ (Approved / BR-02)
              </button>
              <button
                type="button"
                onClick={() => setStatus("needs_revision")}
                className={`px-3 py-1.5 text-xs font-extrabold transition-colors ${
                  status === "needs_revision"
                    ? "border border-[#d97706] bg-[#d97706] text-white shadow-xs"
                    : "border border-[#b8cbd0] bg-white text-[#526a74] hover:bg-[#f0f6f7]"
                }`}
              >
                3. ขอเอกสารเพิ่ม (Needs Revision)
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic Header Banner (Sharp Rectangular) */}
        <div
          className={`border p-6 text-white shadow-sm sm:p-7 mb-6 transition-colors ${
            status === "approved"
              ? "border-[#064e3b] bg-[#064e3b]"
              : status === "needs_revision"
              ? "border-[#78350f] bg-[#78350f]"
              : "border-[#143748] bg-[#092f45]"
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="border border-white/30 bg-white/10 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-white">
                  Volunteer Portal
                </span>
                <span className="text-xs text-white/80">• Application Status Tracking</span>
              </div>
              <h1 className="mt-2 text-xl font-extrabold tracking-tight text-white sm:text-2xl">
                {status === "approved"
                  ? "ยินดีต้อนรับสู่ทีมล่ามจิตอาสา KHVI!"
                  : status === "needs_revision"
                  ? "ผู้จัดการระบบขอเอกสารเพิ่มเติมเพื่อประกอบการพิจารณา"
                  : "ตรวจสอบสถานะใบสมัครล่ามจิตอาสา"}
              </h1>
              <p className="mt-1 text-xs text-white/80 leading-relaxed max-w-xl">
                {status === "approved"
                  ? "คุณได้รับการตรวจสอบคุณสมบัติตามกฎความปลอดภัย BR-02 เรียบร้อยแล้ว สามารถเปิดสถานะพร้อมรับงานและกดรับงาน SOS ได้ทันที"
                  : status === "needs_revision"
                  ? "กรุณาแนบไฟล์เอกสารผลสอบวัดระดับภาษาหรือบัตรประจำตัวที่คมชัดกว่าเดิม เพื่อให้ Manager สามารถอนุมัติสิทธิ์ได้"
                  : "ติดตามขั้นตอนการพิจารณาตรวจสอบคุณสมบัติและเอกสารรับรองโดย Manager ตามระเบียบความปลอดภัย BR-02"}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {status === "approved" ? (
                <span className="border border-emerald-300 bg-emerald-100 px-3.5 py-1.5 text-xs font-black text-emerald-900 shadow-xs">
                  ✓ อนุมัติแล้ว (Verified Volunteer)
                </span>
              ) : status === "needs_revision" ? (
                <span className="border border-amber-300 bg-amber-100 px-3.5 py-1.5 text-xs font-black text-amber-900 shadow-xs">
                  ⚠️ ขอเอกสารเพิ่มเติม (Action Required)
                </span>
              ) : (
                <span className="border border-[#8ed5c4]/60 bg-[#edf7f5] px-3.5 py-1.5 text-xs font-black text-[#087f80] shadow-xs">
                  ⏳ รอการตรวจสอบ (BR-02)
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Digital Volunteer Badge (Only Shown When Approved) */}
        {status === "approved" && (
          <div className="border-2 border-[#087557] bg-white p-6 shadow-sm mb-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-[#e2ebee] pb-6">
              <div className="flex items-start gap-4">
                <div className="h-16 w-16 shrink-0 border border-[#087557] bg-[#edf7f5] flex items-center justify-center text-3xl font-black text-[#087557]">
                  🏅
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="border border-[#087557] bg-[#087557] text-white text-[10px] font-extrabold px-2 py-0.5 uppercase">
                      Official Badge
                    </span>
                    <span className="font-mono text-xs text-[#526a74]">
                      ID: <strong className="text-[#10283a]">{applicationData.volunteerId}</strong>
                    </span>
                  </div>
                  <h2 className="mt-1 text-base font-extrabold text-[#10283a]">
                    {applicationData.applicantName}
                  </h2>
                  <p className="text-xs text-[#087557] font-bold">
                    ✓ ล่ามจิตอาสาที่ผ่านการรับรองอย่างเป็นทางการ (KHVI Verified Interpreter)
                  </p>
                </div>
              </div>

              {/* Ready / Available Toggle Switch */}
              <div className="border border-[#b9d9d6] bg-[#f7fafb] p-4 text-xs flex flex-col sm:flex-row sm:items-center gap-4">
                <div>
                  <div className="font-extrabold text-[#10283a]">สถานะความพร้อมรับงานฉุกเฉิน</div>
                  <div className="text-[11px] text-[#64777e]">
                    {isAvailable ? "● กำลังเปิดรับงาน (พร้อมช่วยเหลือ SOS)" : "○ ปิดรับงานชั่วคราว"}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAvailable(!isAvailable)}
                  className={`px-5 py-2 text-xs font-black transition-colors ${
                    isAvailable
                      ? "border border-[#087557] bg-[#087557] text-white shadow-xs"
                      : "border border-[#a8bcc3] bg-white text-[#39525d] hover:bg-[#f2f6f7]"
                  }`}
                >
                  {isAvailable ? "✓ กำลังเปิดรับงาน" : "คลิกเพื่อเปิดรับงาน"}
                </button>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-[#526a74]">
              <div>
                วันที่ได้รับการอนุมัติ: <strong className="text-[#10283a]">13 ก.ย. 2026, 21:50 น.</strong>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[11px] bg-[#edf7f5] text-[#087557] px-2 py-1 border border-[#8ed5c4]">
                  BR-02 Unlocked: Claim Permission Active
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Action Required Box (Only Shown When Needs Revision) */}
        {status === "needs_revision" && (
          <div className="border-2 border-[#d97706] bg-[#fffbeb] p-6 shadow-sm mb-6">
            <div className="flex items-start gap-4">
              <span className="text-2xl">⚠️</span>
              <div className="flex-1 space-y-2">
                <h3 className="font-extrabold text-[#92400e] text-sm sm:text-base">
                  คำแนะนำจาก Manager ประจำศูนย์ (ข้อความแจ้งเตือน):
                </h3>
                <div className="border-l-2 border-[#d97706] pl-3 py-1 text-xs text-[#78350f] bg-white/60 leading-relaxed font-medium">
                  &ldquo;เอกสารผลสอบวัดระดับภาษาที่แนบมามีความละเอียดต่ำ ไม่สามารถระบุชื่อและคะแนนได้อย่างชัดเจน กรุณาถ่ายภาพใหม่หรือแนบไฟล์ PDF ต้นฉบับอีกครั้ง เพื่อให้เจ้าหน้าที่สามารถอนุมัติสิทธิ์ได้โดยเร็วครับ&rdquo;
                </div>
                <div className="pt-2">
                  <label className="block text-xs font-extrabold text-[#92400e] mb-1.5">
                    อัปโหลดเอกสารใหม่แทนที่:
                  </label>
                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      type="file"
                      id="reupload-input"
                      onChange={handleReupload}
                      accept=".pdf,.jpg,.jpeg,.png"
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => document.getElementById("reupload-input")?.click()}
                      className="border border-[#b45309] bg-[#b45309] px-4 py-2 text-xs font-black text-white hover:bg-[#92400e] transition-colors"
                    >
                      📎 เลือกไฟล์เอกสารใหม่จากเครื่อง...
                    </button>
                    <span className="text-xs text-[#78350f]">รองรับ PDF, JPG, PNG ขนาดไม่เกิน 10MB</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modern UI Stepper / Verification Pipeline */}
        <div className="border border-[#d6e0e4] bg-white p-6 shadow-sm mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-[#e9f0f2] pb-4 mb-6">
            <div>
              <h2 className="text-sm font-extrabold text-[#10283a] uppercase tracking-wider">
                ขั้นตอนการอนุมัติสิทธิ์ล่ามจิตอาสา (Verification Pipeline)
              </h2>
              <p className="text-xs text-[#64777e] mt-0.5">
                ติดตามขั้นตอนการพิจารณาตรวจสอบคุณสมบัติตามมาตรฐานความปลอดภัย BR-02
              </p>
            </div>
            <div className="flex items-center gap-1.5 self-start sm:self-auto">
              <span className="inline-block h-2 w-2 rounded-full bg-[#087f80]"></span>
              <span className="text-xs font-mono font-bold text-[#087f80]">
                {status === "approved"
                  ? "ขั้นตอนที่ 3 / 3 (เสร็จสิ้น)"
                  : status === "needs_revision"
                  ? "ขั้นตอนที่ 2 / 3 (รอแก้ไขเอกสาร)"
                  : "ขั้นตอนที่ 2 / 3 (กำลังดำเนินการ)"}
              </span>
            </div>
          </div>

          {/* Stepper Progress Bar & Connecting Track (Desktop/Tablet) */}
          <div className="relative mb-6 hidden md:block">
            {/* Background Line */}
            <div className="absolute top-5 left-12 right-12 h-1 bg-[#e2ebee] -z-0" />
            
            {/* Active Progress Line */}
            <div
              className={`absolute top-5 left-12 h-1 transition-all duration-500 -z-0 ${
                status === "approved"
                  ? "w-[calc(100%-6rem)] bg-[#087557]"
                  : status === "needs_revision"
                  ? "w-1/2 bg-[#d97706]"
                  : "w-1/2 bg-[#087f80]"
              }`}
            />

            {/* Step Markers Row */}
            <div className="relative z-10 flex justify-between">
              {/* Marker 1 */}
              <div className="flex flex-col items-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#087557] bg-[#087557] text-white shadow-sm font-extrabold text-sm">
                  ✓
                </div>
                <span className="mt-2 text-xs font-extrabold text-[#087557]">ยื่นส่งใบสมัคร</span>
                <span className="text-[10px] text-[#73848a]">สำเร็จเรียบร้อย</span>
              </div>

              {/* Marker 2 */}
              <div className="flex flex-col items-center">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all font-extrabold text-sm ${
                    status === "approved"
                      ? "border-[#087557] bg-[#087557] text-white shadow-sm"
                      : status === "needs_revision"
                      ? "border-[#d97706] bg-[#fffbeb] text-[#d97706] shadow-sm ring-4 ring-[#fef3c7]"
                      : "border-[#087f80] bg-[#edf7f5] text-[#087f80] shadow-sm ring-4 ring-[#d8f0ea] animate-pulse"
                  }`}
                >
                  {status === "approved" ? "✓" : status === "needs_revision" ? "⚠️" : "2"}
                </div>
                <span
                  className={`mt-2 text-xs font-extrabold ${
                    status === "approved"
                      ? "text-[#087557]"
                      : status === "needs_revision"
                      ? "text-[#d97706]"
                      : "text-[#087f80]"
                  }`}
                >
                  Manager ตรวจสอบ
                </span>
                <span className="text-[10px] text-[#73848a]">
                  {status === "approved"
                    ? "ผ่านการตรวจแล้ว"
                    : status === "needs_revision"
                    ? "ต้องการเอกสารเพิ่ม"
                    : "กำลังตรวจสอบ"}
                </span>
              </div>

              {/* Marker 3 */}
              <div className="flex flex-col items-center">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all font-extrabold text-sm ${
                    status === "approved"
                      ? "border-[#087557] bg-[#087557] text-white shadow-sm ring-4 ring-[#d1fae5]"
                      : "border-[#cbd7dc] bg-[#f8fafb] text-[#73848a]"
                  }`}
                >
                  {status === "approved" ? "✓" : "3"}
                </div>
                <span
                  className={`mt-2 text-xs font-extrabold ${
                    status === "approved" ? "text-[#087557]" : "text-[#73848a]"
                  }`}
                >
                  เปิดรับงาน SOS
                </span>
                <span className="text-[10px] text-[#73848a]">
                  {status === "approved" ? "ปลดล็อกสิทธิ์แล้ว" : "รอผลการอนุมัติ"}
                </span>
              </div>
            </div>
          </div>

          {/* Stepper Step Cards with Detailed Context */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Step 1 Card */}
            <div className="border border-[#087f80]/40 bg-[#edf7f5]/70 p-4 text-xs">
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-1.5">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#087557] text-white text-[10px] font-black">
                    1
                  </span>
                  <span className="font-extrabold text-[#087557]">ขั้นตอนที่ 1</span>
                </div>
                <span className="border border-[#087f80] bg-[#087f80] text-white px-2 py-0.5 text-[10px] font-extrabold">
                  ✓ สำเร็จ
                </span>
              </div>
              <div className="font-bold text-[#10283a] text-sm">ยื่นส่งใบสมัครเรียบร้อย</div>
              <p className="mt-1 text-[11px] text-[#53656c] leading-snug">
                บันทึกข้อมูลภาษา หมวดหมู่งาน และแนบเอกสารรับรองเข้าระบบแล้ว
              </p>
              <div className="mt-2.5 pt-2 border-t border-[#d3e5e3] font-mono text-[10px] text-[#087557]">
                วันที่ยื่น: {applicationData.submittedAt}
              </div>
            </div>

            {/* Step 2 Card */}
            <div
              className={`p-4 text-xs transition-all ${
                status === "approved"
                  ? "border border-[#087f80]/40 bg-[#edf7f5]/70"
                  : status === "needs_revision"
                  ? "border-2 border-[#d97706] bg-[#fffbeb] shadow-xs"
                  : "border-2 border-[#087f80] bg-white shadow-xs"
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-1.5">
                  <span
                    className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-black ${
                      status === "approved"
                        ? "bg-[#087557] text-white"
                        : status === "needs_revision"
                        ? "bg-[#d97706] text-white"
                        : "bg-[#087f80] text-white"
                    }`}
                  >
                    2
                  </span>
                  <span
                    className={`font-extrabold ${
                      status === "approved"
                        ? "text-[#087557]"
                        : status === "needs_revision"
                        ? "text-[#d97706]"
                        : "text-[#087f80]"
                    }`}
                  >
                    ขั้นตอนที่ 2
                  </span>
                </div>
                <span
                  className={`px-2 py-0.5 text-[10px] font-extrabold ${
                    status === "approved"
                      ? "border border-[#087f80] bg-[#087f80] text-white"
                      : status === "needs_revision"
                      ? "border border-[#d97706] bg-[#d97706] text-white"
                      : "border border-[#087f80] bg-[#edf7f5] text-[#087f80] animate-pulse"
                  }`}
                >
                  {status === "approved"
                    ? "✓ ผ่านการตรวจ"
                    : status === "needs_revision"
                    ? "⚠️ ขอเอกสารเพิ่ม"
                    : "● กำลังดำเนินการ"}
                </span>
              </div>
              <div className="font-bold text-[#10283a] text-sm">Manager ตรวจสอบคุณสมบัติ</div>
              <p className="mt-1 text-[11px] text-[#53656c] leading-snug">
                {status === "approved"
                  ? "เจ้าหน้าที่ตรวจสอบทักษะภาษาและยืนยันเอกสารถูกต้องครบถ้วน"
                  : status === "needs_revision"
                  ? "รอผู้สมัครอัปโหลดเอกสารรับรองใหม่ที่คมชัดกว่าเดิม"
                  : "เจ้าหน้าที่ Manager กำลังตรวจสอบความถูกต้องของเอกสารและทักษะภาษา"}
              </p>
              <div className="mt-2.5 pt-2 border-t border-[#e3ebef] font-mono text-[10px] text-[#73848a]">
                {status === "approved"
                  ? "สถานะ: ตรวจสอบเสร็จสมบูรณ์"
                  : `คิวการตรวจ: ประมาณ ${applicationData.estimatedReviewTime}`}
              </div>
            </div>

            {/* Step 3 Card */}
            <div
              className={`p-4 text-xs transition-all ${
                status === "approved"
                  ? "border-2 border-[#087557] bg-white shadow-xs"
                  : "border border-[#d8e4e7] bg-[#f8fafb] text-[#73848a]"
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-1.5">
                  <span
                    className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-black ${
                      status === "approved" ? "bg-[#087557] text-white" : "bg-[#cbd7dc] text-[#53656c]"
                    }`}
                  >
                    3
                  </span>
                  <span
                    className={`font-bold ${
                      status === "approved" ? "text-[#087557] font-extrabold" : "text-[#73848a]"
                    }`}
                  >
                    ขั้นตอนที่ 3
                  </span>
                </div>
                <span
                  className={`px-2 py-0.5 text-[10px] font-bold ${
                    status === "approved"
                      ? "border border-[#087557] bg-[#087557] text-white font-extrabold"
                      : "border border-[#d8e4e7] bg-white text-[#73848a]"
                  }`}
                >
                  {status === "approved" ? "✓ ปลดล็อกแล้ว" : "รอผลตรวจสอบ"}
                </span>
              </div>
              <div className={`font-bold text-sm ${status === "approved" ? "text-[#10283a]" : "text-[#39525d]"}`}>
                อนุมัติและเปิดรับงาน SOS
              </div>
              <p className="mt-1 text-[11px] text-[#73848a] leading-snug">
                เมื่อผ่านการอนุมัติ สามารถเปิดสถานะพร้อมรับงานและกด Claim ภารกิจได้
              </p>
              <div className="mt-2.5 pt-2 border-t border-[#e3ebef] font-mono text-[10px] text-[#9aa9ae]">
                ปลดล็อกตามกฎ BR-02
              </div>
            </div>
          </div>
        </div>

        {/* Application Details Summary (INTERPRETER_APPLICATIONS Schema) */}
        <div className="border border-[#d6e0e4] bg-white p-6 shadow-sm mb-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-[#e3ebef] pb-3">
            <div>
              <h3 className="text-sm font-extrabold text-[#10283a]">
                รายละเอียดใบสมัครที่บันทึกในระบบ (Submitted Application Details)
              </h3>
              <span className="text-xs text-[#64777e]">
                รหัสอ้างอิง: <strong className="font-mono text-[#10283a]">{applicationData.applicationId}</strong>
              </span>
            </div>
            <span
              className={`px-2.5 py-1 text-xs font-bold self-start sm:self-auto ${
                status === "approved"
                  ? "border border-emerald-400 bg-emerald-50 text-emerald-800"
                  : status === "needs_revision"
                  ? "border border-amber-400 bg-amber-50 text-amber-800"
                  : "border border-[#b9d9d6] bg-[#edf7f5] text-[#087f80]"
              }`}
            >
              สถานะ:{" "}
              {status === "approved"
                ? "อนุมัติแล้ว (Verified)"
                : status === "needs_revision"
                ? "ขอเอกสารเพิ่มเติม"
                : "กำลังรอ Manager ตรวจสอบ"}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {/* Applicant Name */}
            <div className="border border-[#e2ebee] bg-[#f8fafb] p-3.5">
              <span className="block text-[11px] font-bold text-[#64777e] uppercase tracking-wide mb-1">
                ชื่อผู้สมัคร (USER.name)
              </span>
              <div className="font-bold text-[#10283a] text-sm">{applicationData.applicantName}</div>
              <span className="mt-0.5 block text-[11px] text-[#73848a]">จัดเก็บลงตาราง USER</span>
            </div>

            {/* Phone */}
            <div className="border border-[#e2ebee] bg-[#f8fafb] p-3.5">
              <span className="block text-[11px] font-bold text-[#64777e] uppercase tracking-wide mb-1">
                เบอร์โทรศัพท์หลัก (USER.phone)
              </span>
              <div className="font-bold text-[#10283a] text-sm">{applicationData.phone}</div>
              <span className="mt-0.5 block text-[11px] text-[#73848a]">ใช้ติดต่อประสานงานกรณีฉุกเฉิน</span>
            </div>

            {/* Extra Contact */}
            <div className="border border-[#e2ebee] bg-[#f8fafb] p-3.5">
              <span className="block text-[11px] font-bold text-[#64777e] uppercase tracking-wide mb-1">
                ช่องทางติดต่อเสริม (extra_contact)
              </span>
              <div className="font-bold text-[#10283a] text-sm">{applicationData.extraContact}</div>
              <span className="mt-0.5 block text-[11px] text-[#f04f3e]">🔒 ซ่อนเป็นความลับ ปลดล็อกเมื่อ Claim (BR-04)</span>
            </div>

            {/* Area */}
            <div className="border border-[#e2ebee] bg-[#f8fafb] p-3.5">
              <span className="block text-[11px] font-bold text-[#64777e] uppercase tracking-wide mb-1">
                พื้นที่ให้บริการหลัก
              </span>
              <div className="font-bold text-[#10283a] text-sm">{applicationData.assignedArea}</div>
              <span className="mt-0.5 block text-[11px] text-[#73848a]">พิกัดละเอียดจะถูกปกป้องตาม BR-04</span>
            </div>
          </div>

          {/* Languages Section */}
          <div className="border-t border-[#edf2f4] pt-4">
            <span className="block text-xs font-bold text-[#10283a] uppercase tracking-wide mb-2">
              ภาษาที่ระบุให้บริการ (interpreter_languages):
            </span>
            <div className="flex flex-wrap gap-2">
              {applicationData.languages.map((l) => (
                <span
                  key={l.id}
                  className="inline-flex items-center gap-2 border border-[#087f80] bg-[#edf7f5] px-3 py-1.5 text-xs font-bold text-[#087557]"
                >
                  <span>✓ {l.name}</span>
                  <span className="border-l border-[#8ed5c4] pl-2 font-mono text-[10px] text-[#087f80]">{l.type}</span>
                </span>
              ))}
            </div>
          </div>

          {/* Categories Section (With General as 1st item) */}
          <div className="border-t border-[#edf2f4] pt-4">
            <span className="block text-xs font-bold text-[#10283a] uppercase tracking-wide mb-2">
              หมวดหมู่งานที่พร้อมช่วยเหลือ (interpreter_categories):
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {applicationData.categories.map((cat) => (
                <div
                  key={cat.id}
                  className="flex items-center gap-2.5 border border-[#087f80] bg-[#edf7f5] p-3 text-xs font-bold text-[#087557]"
                >
                  <span className="text-base">{cat.icon}</span>
                  <span>{cat.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Certificate File Attachment */}
          <div className="border-t border-[#edf2f4] pt-4">
            <span className="block text-xs font-bold text-[#10283a] uppercase tracking-wide mb-2">
              เอกสารรับรองคุณวุฒิ (INTERPRETER_APPLICATIONS.certificate_url):
            </span>
            <div className="flex items-center justify-between border border-[#8ed5c4] bg-[#edf7f5] p-3.5 text-xs">
              <div className="flex items-center gap-2 font-bold text-[#087557]">
                <svg className="h-5 w-5 shrink-0 text-[#087f80]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>📄 {applicationData.certificateFileName}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowCertModal(true)}
                  className="border border-[#087f80] bg-white px-3 py-1 text-[11px] font-extrabold text-[#087f80] hover:bg-[#edf7f5] transition-colors"
                >
                  ดูตัวอย่างเอกสาร
                </button>
                <span className="border border-[#087f80] bg-[#087f80] text-white px-2 py-1 text-[11px] font-extrabold">
                  {status === "approved" ? "ตรวจสอบแล้ว" : "แนบในระบบ"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Manager Review Audit Trail / Activity Log */}
        <div className="border border-[#d6e0e4] bg-white p-6 shadow-sm mb-6">
          <h3 className="text-xs font-extrabold text-[#10283a] uppercase tracking-wider mb-4">
            บันทึกการดำเนินการของระบบ (Application Activity Log)
          </h3>
          <div className="space-y-3 font-mono text-xs">
            <div className="flex items-start gap-3 border-l-2 border-[#087f80] pl-3">
              <div className="text-[#64777e] shrink-0 text-[11px]">13 ก.ย. 21:30 น.</div>
              <div className="text-[#10283a]">
                <strong>บันทึกใบสมัครเข้าระบบ:</strong> ผู้สมัครส่งแบบฟอร์มพร้อมเอกสารรับรองภาษา (รหัส {applicationData.applicationId})
              </div>
            </div>
            <div className="flex items-start gap-3 border-l-2 border-[#087f80] pl-3">
              <div className="text-[#64777e] shrink-0 text-[11px]">13 ก.ย. 21:35 น.</div>
              <div className="text-[#10283a]">
                <strong>จัดสรรคิวอัตโนมัติ:</strong> ส่งใบสมัครเข้ากระดานพิจารณาของ Manager ประจำศูนย์กรุงเทพฯ
              </div>
            </div>
            {status === "approved" ? (
              <div className="flex items-start gap-3 border-l-2 border-[#087557] pl-3">
                <div className="text-[#087557] shrink-0 text-[11px]">13 ก.ย. 21:50 น.</div>
                <div className="text-[#087557]">
                  <strong>อนุมัติสิทธิ์สำเร็จ (BR-02):</strong> Manager ตรวจสอบเอกสารผ่านการรับรอง ปลดล็อกสิทธิ์ Claim ภารกิจ
                </div>
              </div>
            ) : status === "needs_revision" ? (
              <div className="flex items-start gap-3 border-l-2 border-[#d97706] pl-3">
                <div className="text-[#d97706] shrink-0 text-[11px]">13 ก.ย. 21:48 น.</div>
                <div className="text-[#d97706]">
                  <strong>ส่งคำขอแก้ไขเอกสาร:</strong> Manager ร้องขอให้อัปโหลดผลสอบระดับภาษาใหม่
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-3 border-l-2 border-dashed border-[#a4b8bf] pl-3">
                <div className="text-[#73848a] shrink-0 text-[11px]">กำลังดำเนินการ</div>
                <div className="text-[#73848a]">
                  รอเจ้าหน้าที่ Manager เข้าตรวจสอบเอกสารตามลำดับคิว
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Manager Review Notification & Safety Notice */}
        <div className="border border-[#b9d9d6] bg-[#edf7f5] p-5 text-xs text-[#10283a] shadow-sm mb-6 flex items-start gap-3">
          <span className="text-base font-bold text-[#087557] shrink-0">ℹ️</span>
          <div className="space-y-1">
            <h4 className="font-extrabold text-sm text-[#087557]">
              การแจ้งเตือนและการเปิดสิทธิ์รับงาน (BR-02 Verification Rule)
            </h4>
            <p className="leading-relaxed text-[#53656c]">
              ตามกฎระเบียบความปลอดภัย BR-02 ล่ามจิตอาสาจะต้องได้รับการอนุมัติจากผู้จัดการระบบ (Manager) ก่อน จึงจะสามารถเปิดสถานะพร้อมรับงานและกด Claim งานได้ ระบบจะส่งข้อความแจ้งเตือนผลการตรวจสอบให้ท่านทราบทางโทรศัพท์และบนหน้านี้ทันทีเมื่อเสร็จสิ้น
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3 pt-2">
          <Link
            href="/volunteer/apply"
            className="border border-[#c3d1d6] bg-white px-6 py-2.5 text-xs font-bold text-[#39525d] hover:bg-[#f8fafb] transition-colors text-center"
          >
            ← แก้ไขข้อมูลใบสมัคร
          </Link>
          {status === "approved" && (
            <div className="flex items-center gap-3">
              <Link
                href="/volunteer/dashboard"
                className="border border-[#087557] bg-[#087557] px-6 py-2.5 text-xs font-extrabold text-white hover:bg-[#065e46] transition-colors text-center shadow-sm"
              >
                ไปที่กระดานภารกิจ SOS (รับงานล่าม) →
              </Link>
            </div>
          )}
        </div>
      </main>

      {/* Certificate Preview Modal */}
      {showCertModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-lg border border-[#092f45] bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#e2ebee] pb-3 mb-4">
              <h4 className="text-sm font-extrabold text-[#10283a]">
                ตัวอย่างเอกสารรับรองที่แนบในระบบ
              </h4>
              <button
                type="button"
                onClick={() => setShowCertModal(false)}
                className="text-xs font-bold text-[#64777e] hover:text-[#10283a]"
              >
                ✕ ปิด
              </button>
            </div>
            <div className="border border-[#d6e0e4] bg-[#f8fafb] p-8 text-center space-y-3">
              <div className="text-4xl">📄</div>
              <div className="font-mono text-xs font-bold text-[#10283a]">
                {applicationData.certificateFileName}
              </div>
              <p className="text-[11px] text-[#64777e] max-w-sm mx-auto">
                เอกสารนี้ได้รับการเข้ารหัสและจัดเก็บในระบบคลาวด์ KHVI เพื่อให้ Manager ใช้ตรวจสอบคุณสมบัติตามมาตรฐาน BR-02
              </p>
            </div>
            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => setShowCertModal(false)}
                className="border border-[#087f80] bg-[#087f80] px-5 py-2 text-xs font-extrabold text-white"
              >
                ตกลง
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Site Footer (Identical sharp styling) */}
      <SiteFooter copy={footerCopy} brandSubtitle={headerCopy.brandSubtitle} />
    </div>
  );
}
