"use client";

import { useState } from "react";
import Link from "next/link";
import { ClaimButton } from "@/components/volunteer/ClaimButton";
import { ApplicationStatusModal } from "@/components/volunteer/ApplicationStatusModal";
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

type Mission = {
  id: string;
  badge: {
    text: string;
    type: "urgent" | "scheduled";
  };
  title: string;
  distance: string;
  requestedAt: string;
  description: string;
  category: string;
  languages: string;
};

const initialMissions: Mission[] = [
  {
    id: "mission-1",
    badge: {
      text: "SOS - ต้องการด่วน",
      type: "urgent",
    },
    title: "ต้องการล่าม ไทย ↔ จีน",
    distance: "ห่างออกไป 2.3 กม.",
    requestedAt: "2 นาทีที่แล้ว",
    description: "นักท่องเที่ยวสื่อสารภาษาไทยไม่ได้ ต้องการล่ามสื่อสารกับแพทย์เพื่ออธิบายอาการแพ้ยา",
    category: "การแพทย์/ฉุกเฉิน",
    languages: "ไทย - จีน",
  },
  {
    id: "mission-2",
    badge: {
      text: "รอการตอบรับ",
      type: "scheduled",
    },
    title: "ต้องการล่าม ไทย ↔ สเปน",
    distance: "ห่างออกไป 5.1 กม.",
    requestedAt: "15 นาทีที่แล้ว",
    description: "นักท่องเที่ยวต้องการความช่วยเหลือในการเจรจาอุบัติเหตุรถชนกับเจ้าหน้าที่ตำรวจ",
    category: "สถานีตำรวจ/อุบัติเหตุ",
    languages: "ไทย - สเปน",
  },
];

export default function VolunteerDashboardPage() {
  const [missions, setMissions] = useState<Mission[]>(initialMissions);
  const [claimedMission, setClaimedMission] = useState<Mission | null>(null);
  const [isReady, setIsReady] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);

  const handleClaim = async (missionId: string) => {
    // จำลองความล่าช้าของระบบ Atomic Claim Transaction (Postgres RPC)
    await new Promise((resolve) => setTimeout(resolve, 600));

    const target = missions.find((m) => m.id === missionId);
    if (!target) return;

    // นำหมุดที่ Claim แล้วออกจากกระดานตาม Business Rule
    setMissions((prev) => prev.filter((m) => m.id !== missionId));
    setClaimedMission(target);
    setToastMessage(`คุณได้รับงาน "${target.title}" เรียบร้อยแล้ว (ระบบล็อคงานแบบ Atomic Claim)`);
    setShowToast(true);

    setTimeout(() => {
      setShowToast(false);
    }, 4000);
  };

  const handleReset = () => {
    setMissions(initialMissions);
    setClaimedMission(null);
  };

  const [locale, setLocale] = useState<Locale>("th");

  return (
    <div className="min-h-screen flex flex-col bg-[#f7f9fa] text-[#10283a] antialiased">
      <SiteHeader
        copy={headerCopy}
        locale={locale}
        onLocaleChange={(newLocale) => setLocale(newLocale)}
      />

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 border border-[#087f80] bg-[#087f80] px-5 py-3.5 text-white shadow-xl transition-all">
          <svg className="h-5 w-5 shrink-0 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
          <span className="text-sm font-extrabold">{toastMessage}</span>
        </div>
      )}

      {/* Main Container */}
      <main className="flex-1 mx-auto w-full max-w-[1440px] px-5 py-8 sm:px-8 lg:px-12">
        {/* Navigation Breadcrumb back to landing */}
        <div className="mb-4 flex items-center justify-between text-xs text-[#64777e]">
          <Link href="/" className="inline-flex items-center gap-1.5 font-bold text-[#087f80] hover:text-[#096f70] transition-colors">
            <span>← กลับสู่หน้าหลัก KHVI Helper</span>
          </Link>
          <span className="font-mono text-[#73848a]">Mockup: Persona คนที่ 4 (Volunteer Portal)</span>
        </div>

        {/* Top Header Card */}
        <header className="border border-[#143748] bg-[#092f45] px-6 py-5 shadow-sm text-white">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex flex-wrap items-baseline gap-2">
                <h1 className="text-xl font-black tracking-tight text-white sm:text-2xl">
                  KHVI Helper
                </h1>
                <span className="text-sm font-medium text-slate-300 sm:text-base">
                  | ระบบจับคู่งานล่ามจิตอาสา
                </span>
              </div>
              <p className="mt-1 text-xs text-[#8ed5c4] sm:text-sm">
                ยินดีต้อนรับ, ปกรณ์ (Volunteer Interpreter)
              </p>
            </div>

            {/* Ready Status Toggle */}
            <div className="flex items-center">
              <button
                type="button"
                onClick={() => setIsReady(!isReady)}
                title="คลิกเพื่อสลับสถานะพร้อมรับงาน"
                className={`inline-flex items-center gap-2 border px-4 py-2 text-xs font-extrabold transition-all shadow-sm ${
                  isReady
                    ? "border-[#087f80] bg-[#087f80] text-white hover:bg-[#096f70]"
                    : "border-slate-600 bg-slate-800 text-slate-300 hover:bg-slate-700"
                }`}
              >
                <span
                  className={`inline-block h-2 w-2 rounded-full ${
                    isReady ? "bg-white animate-pulse" : "bg-slate-400"
                  }`}
                />
                <span>{isReady ? "● พร้อมรับงาน (Ready)" : "○ พักรับงาน (Busy)"}</span>
              </button>
            </div>
          </div>
        </header>

        {/* Two-Column Layout */}
        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-start">
          {/* Left Column: กระดานภารกิจ (Mission Dashboard) */}
          <section className="lg:col-span-8">
            <div className="mb-4 flex items-center gap-2">
              <span className="inline-block h-5 w-1.5 bg-[#087f80]" />
              <h2 className="text-lg font-extrabold text-[#10283a]">กระดานภารกิจ</h2>
              <span className="border border-[#d8e4e7] bg-white px-2 py-0.5 font-mono text-xs text-[#64777e]">
                /volunteer/dashboard
              </span>
            </div>

            {/* List of Available Missions */}
            <div className="space-y-4">
              {missions.length === 0 ? (
                <div className="border border-dashed border-[#cbd7dc] bg-white p-8 text-center shadow-sm">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-[#edf7f5] text-[#087f80]">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-base font-extrabold text-[#10283a]">
                    ไม่มีคำขอรอรับงานบนกระดานในขณะนี้
                  </h3>
                  <p className="mt-1 text-xs text-[#64777e]">
                    คำขอใหม่ที่ตรงกับภาษาและความถนัดของคุณจะแสดงขึ้นที่นี่โดยอัตโนมัติ
                  </p>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="mt-4 inline-flex items-center gap-1.5 border border-[#cbd7dc] bg-white px-4 py-2 text-xs font-bold text-[#10283a] shadow-sm hover:bg-[#f8fafb]"
                  >
                    <span>🔄 รีเซ็ตข้อมูลทดสอบ (Reset Mockup)</span>
                  </button>
                </div>
              ) : (
                missions.map((mission) => (
                  <article
                    key={mission.id}
                    className="border border-[#d6e0e4] bg-white p-5 shadow-sm transition-shadow hover:shadow-md sm:p-6"
                  >
                    {/* Badge */}
                    <div>
                      {mission.badge.type === "urgent" ? (
                        <span className="inline-block border border-[#f6b8ae] bg-[#fff1f2] px-2.5 py-1 text-xs font-extrabold text-[#f04f3e]">
                          {mission.badge.text}
                        </span>
                      ) : (
                        <span className="inline-block border border-[#f0c98f] bg-[#fffbf4] px-2.5 py-1 text-xs font-extrabold text-[#ca8a04]">
                          {mission.badge.text}
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <h3 className="mt-2 text-lg font-extrabold text-[#10283a] sm:text-xl">
                      {mission.title}
                    </h3>

                    {/* Info Rows with dashed dividers */}
                    <div className="mt-4 space-y-2.5 text-xs sm:text-sm">
                      {/* Distance Row */}
                      <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline">
                        <span className="w-36 shrink-0 font-bold text-[#53656c] sm:w-40">
                          ระยะทางโดยประมาณ:
                        </span>
                        <div className="flex flex-wrap items-baseline gap-1.5">
                          <span className="text-[#10283a] font-medium">
                            {mission.distance}
                          </span>
                          <span className="text-xs italic text-[#f04f3e] font-semibold">
                            (*พิกัดละเอียดและข้อมูลติดต่อซ่อนอยู่จนกว่าจะ Claim)
                          </span>
                        </div>
                      </div>

                      <div className="border-b border-dashed border-[#e3ebef]" />

                      {/* Time Row */}
                      <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline">
                        <span className="w-36 shrink-0 font-bold text-[#53656c] sm:w-40">
                          เวลาที่ร้องขอ:
                        </span>
                        <span className="text-[#10283a] font-medium">
                          {mission.requestedAt}
                        </span>
                      </div>

                      <div className="border-b border-dashed border-[#e3ebef]" />

                      {/* Description Row */}
                      <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline">
                        <span className="w-36 shrink-0 font-bold text-[#53656c] sm:w-40">
                          รายละเอียดเบื้องต้น:
                        </span>
                        <span className="flex-1 leading-relaxed text-[#53656c]">
                          {mission.description}
                        </span>
                      </div>
                    </div>

                    {/* Action Button aligned right */}
                    <div className="mt-5 flex justify-end">
                      <ClaimButton
                        missionId={mission.id}
                        onClaim={handleClaim}
                      />
                    </div>
                  </article>
                ))
              )}
            </div>

            {/* Recently Claimed Card (Show feedback when claimed) */}
            {claimedMission && (
              <div className="mt-6 border border-[#087f80] bg-[#edf7f5] p-5 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="inline-block border border-[#087f80] bg-[#087f80] px-2.5 py-0.5 text-xs font-extrabold text-white">
                      ภารกิจที่คุณเพิ่งกดรับ (Claimed Active)
                    </span>
                    <h4 className="mt-2 text-base font-extrabold text-[#10283a]">
                      {claimedMission.title}
                    </h4>
                    <p className="mt-1 text-xs text-[#53656c]">
                      ระบบได้ปลดล็อกข้อมูลติดต่อและพิกัดแม่นยำแล้ว สามารถส่งต่อไปยังหน้าห้องปฏิบัติการภารกิจ
                    </p>
                  </div>
                  <Link
                    href={`/mission/${claimedMission.id}`}
                    className="inline-flex shrink-0 items-center gap-1 border border-[#087f80] bg-[#087f80] px-4 py-2 text-xs font-extrabold text-white shadow-sm hover:bg-[#096f70] transition-colors"
                  >
                    <span>ไปยังห้องภารกิจ (Shared Room) →</span>
                  </Link>
                </div>
              </div>
            )}
          </section>

          {/* Right Column: ข้อมูลส่วนตัว (Profile Status & Actions) */}
          <aside className="space-y-6 lg:col-span-4">
            <div>
              <div className="mb-4 flex items-center gap-2">
                <span className="inline-block h-5 w-1.5 bg-[#087f80]" />
                <h2 className="text-lg font-extrabold text-[#10283a]">ข้อมูลส่วนตัว</h2>
                <span className="border border-[#d8e4e7] bg-white px-2 py-0.5 font-mono text-xs text-[#64777e]">
                  /volunteer/status
                </span>
              </div>

              {/* Profile Card */}
              <div className="border border-[#d6e0e4] bg-white p-5 shadow-sm space-y-4">
                {/* Account Status */}
                <div className="flex items-center justify-between text-xs sm:text-sm">
                  <span className="font-bold text-[#64777e]">สถานะบัญชี</span>
                  <span className="font-extrabold text-[#087557]">อนุมัติแล้ว</span>
                </div>

                {/* Proficient Languages */}
                <div className="flex items-start justify-between text-xs sm:text-sm gap-2">
                  <span className="shrink-0 font-bold text-[#64777e]">ภาษาที่เชี่ยวชาญ</span>
                  <span className="text-right font-bold text-[#10283a] leading-snug">
                    ไทย, อังกฤษ, จีน,
                    <br className="hidden sm:inline" /> สเปน, อาหรับ
                  </span>
                </div>

                {/* Completed Missions */}
                <div className="flex items-center justify-between text-xs sm:text-sm">
                  <span className="font-bold text-[#64777e]">ภารกิจที่สำเร็จ</span>
                  <span className="font-bold text-[#10283a]">12 งาน</span>
                </div>

                {/* Rating */}
                <div className="flex items-center justify-between text-xs sm:text-sm">
                  <span className="font-bold text-[#64777e]">คะแนนรีวิว</span>
                  <span className="font-bold text-[#10283a]">4.9 / 5.0</span>
                </div>

                {/* Action Links */}
                <div className="space-y-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsStatusModalOpen(true)}
                    className="w-full text-left border border-[#087f80] bg-[#edf7f5] p-3 transition-colors hover:bg-[#dff0ec]"
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-extrabold text-[#087557]">
                        หน้าต่างดูสถานะใบสมัคร
                      </div>
                      <span className="text-xs font-bold text-[#087f80]">เปิดดู ↗</span>
                    </div>
                    <div className="font-mono text-[11px] text-[#087f80] mt-0.5">
                      Modal: สถานะการอนุมัติสิทธิ์ล่าม (BR-02)
                    </div>
                  </button>

                  <Link
                    href="/volunteer/apply"
                    className="block border border-[#d6e0e4] p-3 transition-colors hover:border-[#087f80] hover:bg-[#f8fafb]"
                  >
                    <div className="text-sm font-extrabold text-[#10283a]">
                      จัดการโปรไฟล์ล่าม
                    </div>
                    <div className="font-mono text-xs text-[#73848a]">
                      /volunteer/apply
                    </div>
                  </Link>

                  <Link
                    href="/volunteer/status"
                    className="block border border-[#d6e0e4] p-3 transition-colors hover:border-[#087f80] hover:bg-[#f8fafb]"
                  >
                    <div className="text-sm font-extrabold text-[#10283a]">
                      สถานะใบสมัครแบบเต็มหน้า
                    </div>
                    <div className="font-mono text-xs text-[#73848a]">
                      /volunteer/status
                    </div>
                  </Link>
                </div>
              </div>
            </div>

            {/* Business Rules Callout Box */}
            <div className="border border-[#b9d9d6] bg-[#edf7f5] p-5 text-xs text-[#10283a] sm:text-sm">
              <h3 className="mb-2 font-extrabold text-[#10283a]">
                ข้อกำหนดตาม Business Rules:
              </h3>
              <ul className="space-y-1.5 leading-relaxed text-[#53656c]">
                <li>
                  - คุณจะไม่เห็นข้อมูลติดต่อของผู้ขอความช่วยเหลือจนกว่าจะกด Claim งาน สำเร็จ
                </li>
                <li>
                  - ระบบป้องกันการ Claim ซ้ำซ้อน หากมีผู้อื่นรับงานไปก่อน งานจะหายไปจาก Dashboard ทันที
                </li>
              </ul>
            </div>
          </aside>
        </div>
      </main>

      {/* Application Status Modal */}
      <ApplicationStatusModal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        defaultStatus="approved"
      />

      <SiteFooter copy={footerCopy} brandSubtitle={headerCopy.brandSubtitle} />
    </div>
  );
}

