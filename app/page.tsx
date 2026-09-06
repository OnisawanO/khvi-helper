"use client";

import Image from "next/image";
import type { ReactNode } from "react";
import { useState } from "react";
import {
  CheckBadgeIcon,
  CheckCircleIcon,
  ChevronRightIcon,
  ChatBubbleLeftRightIcon,
  ClipboardDocumentListIcon,
  ExclamationTriangleIcon,
  MagnifyingGlassIcon,
  MapPinIcon,
  ShieldCheckIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";
import { SiteFooter } from "./components/site-footer";
import { SiteHeader } from "./components/site-header";

const languageChips = ["All languages", "English", "Thai", "中文", "မြန်မာ", "Tiếng Việt", "한국어", "日本語"];

const interpreterRows = [
  ["N", "Natcha P.", "English, Thai", "Medical · English", "5 min", "bg-[#e7f5f2]"],
  ["S", "Somchai K.", "中文, Thai", "Legal · Government", "8 min", "bg-[#f9eadf]"],
  ["P", "Pimchan T.", "日本語, Thai", "Education · Daily life", "9 min", "bg-[#e6edf4]"],
] as const;

const howItWorksSteps = [
  ["01", "Tell us what you need", "Choose a language, category, and location for support.", ClipboardDocumentListIcon],
  ["02", "Meet a nearby interpreter", "See verified interpreters who match your language needs.", UserGroupIcon],
  ["03", "Communicate with confidence", "Precise location and contact details unlock after a claim.", ChatBubbleLeftRightIcon],
] as const;

function IconBox({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <span aria-hidden="true" className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-xl font-bold ${className}`}>{children}</span>;
}

function ScenePin({ className = "", sos = false }: { className?: string; sos?: boolean }) {
  return (
    <div className={`absolute flex flex-col items-center ${className}`}>
      <div className={`relative flex h-12 w-12 items-center justify-center rounded-full border-4 border-white shadow-[0_8px_16px_rgba(16,49,61,0.2)] ${sos ? "bg-[#ef5b3e]" : "bg-[#0d8587]"}`}>
        {sos ? <ExclamationTriangleIcon aria-hidden="true" className="h-5 w-5 text-white" /> : <MapPinIcon aria-hidden="true" className="h-5 w-5 text-white" />}
        <span className={`absolute -bottom-2 h-4 w-4 rotate-45 rounded-[3px] ${sos ? "bg-[#ef5b3e]" : "bg-[#0d8587]"}`} />
      </div>
    </div>
  );
}

function NeighborhoodScene() {
  return (
    <div className="neighborhood-scene relative min-h-[480px] overflow-hidden rounded-xl border border-[#d9e1e5] bg-[#edf1f2] shadow-[0_14px_34px_rgba(35,62,75,0.1)] lg:min-h-[530px]">
      <div className="absolute left-[6%] top-[13%] h-20 w-24 rounded-[8px] bg-[#dbe4db] shadow-[12px_12px_0_#e5e4d6]" />
      <div className="absolute left-[15%] top-[20%] h-28 w-20 rounded-[8px] bg-[#d6dfd2] shadow-[14px_10px_0_#e7e1d4]" />
      <div className="absolute right-[7%] top-[25%] h-24 w-28 rounded-[8px] bg-[#dce5db] shadow-[-12px_15px_0_#e3dfd4]" />
      <div className="absolute bottom-[14%] left-[16%] h-16 w-28 rounded-[50%] bg-[#d3dfcf]" />
      <div className="absolute bottom-[12%] right-[11%] h-20 w-32 rounded-[50%] bg-[#d1dfd3]" />

      <div className="scene-road absolute left-[-10%] top-[38%] h-10 w-[120%] rotate-[18deg]" />
      <div className="scene-road absolute left-[-8%] top-[67%] h-8 w-[120%] rotate-[-14deg]" />
      <div className="scene-road scene-road-major absolute left-[44%] top-[-20%] h-[140%] w-5 rotate-[29deg]" />
      <div className="scene-road scene-road-major absolute left-[70%] top-[-20%] h-[140%] w-4 rotate-[-24deg]" />

      <div className="absolute left-[8%] top-[13%] rounded-full bg-white/80 px-3 py-1.5 text-[11px] font-bold text-[#66746f] shadow-sm">Bang Rak · บางรัก</div>
      <div className="absolute left-[60%] top-[18%] rounded-full bg-white/80 px-3 py-1.5 text-[11px] font-bold text-[#66746f] shadow-sm">Din Daeng · ดินแดง</div>
      <div className="absolute left-[69%] top-[64%] rounded-full bg-white/80 px-3 py-1.5 text-[11px] font-bold text-[#66746f] shadow-sm">Khlong Toei · คลองเตย</div>

      <ScenePin className="left-[21%] top-[30%]" />
      <ScenePin className="left-[76%] top-[28%]" />
      <ScenePin className="left-[64%] top-[72%]" />
      <ScenePin className="left-[38%] top-[77%]" sos />

      <div className="absolute left-[48%] top-[38%] flex -translate-x-1/2 flex-col items-center">
        <div className="relative flex h-28 w-28 items-center justify-center rounded-full border-[10px] border-[#f4c6a5]/75 bg-[#fffdf5] shadow-[0_18px_30px_rgba(44,70,69,0.18)]">
          <Image src="/khvi-logo.jpg" alt="KHVI Helper" fill sizes="112px" className="scale-[2.05] object-cover object-[50%_54%]" />
        </div>
        <span className="mt-3 rounded-full bg-white px-4 py-2 text-xs font-extrabold text-[#143044] shadow-md">12 interpreters available</span>
      </div>

      <div className="absolute bottom-5 left-5 right-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/80 bg-white/90 px-4 py-3 shadow-lg backdrop-blur sm:left-7 sm:right-7">
        <div className="flex items-center gap-3">
          <span className="h-3 w-3 rounded-full bg-[#1aa875] shadow-[0_0_0_5px_rgba(26,168,117,0.12)]" />
          <div><p className="text-xs font-extrabold text-[#1d3b46]">Interpreters ready to help</p><p className="text-[11px] text-[#708087]">ล่ามที่พร้อมช่วยอยู่ใกล้คุณ</p></div>
        </div>
        <span className="flex items-center gap-1.5 rounded-full bg-[#e9f4ed] px-3 py-1 text-xs font-extrabold text-[#188157]"><CheckCircleIcon aria-hidden="true" className="h-4 w-4" /> Response avg. 02:18</span>
      </div>
    </div>
  );
}

function Stat({ value, label, note }: { value: string; label: string; note: string }) {
  return (
    <div className="min-w-0">
      <p className="text-2xl font-extrabold tabular-nums tracking-normal text-[#122b3e]">{value}</p>
      <p className="mt-1 text-xs font-bold text-[#294554]">{label}</p>
      <p className="mt-1 text-[10px] leading-4 text-[#7a8588]">{note}</p>
    </div>
  );
}

function InterpreterRow({ row }: { row: (typeof interpreterRows)[number] }) {
  const [initial, name, languages, specialty, response, avatarClass] = row;
  return (
    <div className="flex items-center gap-3 border-b border-[#eee9e0] py-3 last:border-b-0">
      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-extrabold text-[#173646] ${avatarClass}`}>{initial}</span>
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-1 truncate text-sm font-extrabold text-[#203847]">{name} <CheckBadgeIcon aria-label="Verified interpreter" className="h-4 w-4 shrink-0 text-[#15966d]" /></p>
        <p className="truncate text-xs text-[#66767c]">{languages}</p>
      </div>
      <div className="hidden text-right sm:block"><p className="text-xs font-bold text-[#354f5a]">{specialty}</p><p className="mt-1 text-[11px] text-[#15966d]">Available now</p></div>
      <span className="shrink-0 rounded-full bg-[#eef6f1] px-2.5 py-1 text-[11px] font-bold text-[#23805d]">{response}</span>
    </div>
  );
}

export default function Home() {
  const [selectedLanguage, setSelectedLanguage] = useState("All languages");
  const visibleRows = selectedLanguage === "All languages"
    ? interpreterRows
    : interpreterRows.filter((row) => row[2].includes(selectedLanguage));

  return (
    <main id="top" className="min-h-screen bg-[#f7f9fa] text-[#10283a]">
      <a className="skip-link" href="#main-content">Skip to main content</a>
      <SiteHeader />

      <section id="main-content" className="mx-auto grid max-w-[1440px] scroll-mt-24 gap-8 px-5 pb-8 pt-8 sm:px-8 sm:pt-10 lg:grid-cols-[0.82fr_1.18fr] lg:items-center lg:px-12 lg:pb-12 lg:pt-12">
        <div className="lg:pr-2">
          <div className="mb-5 inline-flex items-center gap-2 rounded-lg border border-[#cbdde3] bg-[#eef5f7] px-3 py-1.5 text-xs font-extrabold uppercase tracking-[0.08em] text-[#216873]"><span className="h-2 w-2 rounded-full bg-[#15966d]" /> KHVI service standard</div>
          <h1 className="max-w-[620px] text-[clamp(2.7rem,5vw,4.8rem)] font-extrabold leading-[1.08] tracking-normal text-[#122b3e]">
            Language support,
            <span className="mt-2 block text-[0.72em] tracking-normal text-[#0d8587]">when it matters.</span>
          </h1>
          <p className="mt-6 max-w-[520px] text-base leading-8 text-[#53656c] sm:text-lg">
            Connect with verified interpreters nearby—fast, private, and human.
            <span className="mt-1 block text-sm text-[#7b878b]">เชื่อมต่อกับล่ามที่ไว้ใจได้เมื่อคุณต้องการความช่วยเหลือ</span>
          </p>
          <div className="mt-8 flex max-w-[470px] flex-col gap-3 sm:flex-row">
            <a className="flex h-14 flex-1 items-center justify-center gap-2 rounded-lg bg-[#ee5b3d] px-5 text-sm font-extrabold text-white shadow-[0_10px_20px_rgba(238,91,61,0.2)] transition-colors hover:bg-[#d94d31]" href="/request-help"><ExclamationTriangleIcon aria-hidden="true" className="h-5 w-5" /> Request urgent help</a>
            <a className="flex h-14 flex-1 items-center justify-center gap-2 rounded-lg border-2 border-[#123b4f] bg-transparent px-5 text-sm font-extrabold text-[#123b4f] transition-colors hover:bg-[#edf3f1]" href="#find-interpreter"><MagnifyingGlassIcon aria-hidden="true" className="h-5 w-5" /> Find an interpreter</a>
          </div>
          <div className="mt-9 flex flex-wrap gap-x-5 gap-y-2 text-xs font-bold text-[#748086]">
            <span className="flex items-center gap-2"><CheckCircleIcon aria-hidden="true" className="h-4 w-4 text-[#0d8587]" /> Verified profiles</span>
            <span className="flex items-center gap-2"><ShieldCheckIcon aria-hidden="true" className="h-4 w-4 text-[#0d8587]" /> Privacy protected</span>
            <span className="flex items-center gap-2"><CheckCircleIcon aria-hidden="true" className="h-4 w-4 text-[#0d8587]" /> 38 languages</span>
          </div>
        </div>
        <NeighborhoodScene />
      </section>

      <section className="mx-auto grid max-w-[1320px] grid-cols-2 gap-5 border-y border-[#dbe3e7] bg-white px-5 py-7 sm:grid-cols-4 sm:px-8 lg:px-12">
        <Stat value="1,248" label="Active interpreters" note="ล่ามที่พร้อมช่วย" />
        <Stat value="356" label="Helped this week" note="เคสที่ได้รับการช่วยเหลือ" />
        <Stat value="38" label="Languages" note="ภาษาที่รองรับ" />
        <Stat value="92%" label="Community trust" note="คะแนนความเชื่อมั่น" />
      </section>

      <section id="find-interpreter" className="mx-auto grid max-w-[1320px] gap-6 px-5 py-10 sm:px-8 lg:grid-cols-[1.2fr_0.8fr] lg:px-12 lg:py-14">
        <div className="rounded-xl border border-[#d6e0e4] bg-white px-5 py-5 shadow-[0_8px_24px_rgba(35,62,75,0.05)] sm:px-7">
          <div className="flex flex-col gap-3 border-b border-[#eee9e0] pb-4 sm:flex-row sm:items-end sm:justify-between">
            <div><p className="text-xs font-extrabold uppercase tracking-[0.12em] text-[#0d8587]">Find help nearby</p><h2 className="mt-1 text-2xl font-extrabold tracking-normal text-[#153447]">Available interpreters</h2></div>
            <a className="inline-flex items-center gap-1 text-xs font-extrabold text-[#0d8587]" href="#community">View all <ChevronRightIcon aria-hidden="true" className="h-4 w-4" /></a>
          </div>
          <div className="flex flex-wrap gap-2 border-b border-[#eee9e0] py-4" aria-label="Filter interpreters by language">
            <span className="mr-1 self-center text-xs font-extrabold text-[#5b6d72]">Popular languages</span>
            {languageChips.map((language) => <button key={language} type="button" aria-pressed={selectedLanguage === language} className={`rounded-full px-3 py-1.5 text-[11px] font-bold transition-colors ${selectedLanguage === language ? "bg-[#0d8587] text-white" : "bg-[#f1f6f1] text-[#47706c] hover:bg-[#dfeee8]"}`} onClick={() => setSelectedLanguage(language)}>{language}</button>)}
          </div>
          <div className="divide-y divide-[#eee9e0]" aria-live="polite">
            {visibleRows.length > 0 ? visibleRows.map((row) => <InterpreterRow key={row[1]} row={row} />) : <p className="py-8 text-center text-sm text-[#66767c]">No interpreters found for this language yet.</p>}
          </div>
          <div className="mt-3 flex items-center justify-between rounded-lg bg-[#f4f8f4] px-4 py-3 text-xs text-[#4f666d]"><span>Filter by language, distance, and expertise</span><a className="inline-flex items-center gap-1 font-extrabold text-[#168766] transition-colors hover:text-[#0d8587]" href="/filters">Filters <ChevronRightIcon aria-hidden="true" className="h-4 w-4" /></a></div>
        </div>

        <div id="community" className="rounded-xl border border-[#d6e0e4] bg-[#eef4f1] p-6 sm:p-7">
          <div className="flex items-start justify-between gap-4"><div><p className="text-xs font-extrabold uppercase tracking-[0.12em] text-[#638271]">Community updates</p><h2 className="mt-1 text-2xl font-extrabold tracking-normal text-[#153447]">Our network</h2></div><IconBox className="rounded-lg bg-white text-[#0d8587]"><UserGroupIcon className="h-6 w-6" /></IconBox></div>
          <p className="mt-4 text-sm leading-7 text-[#53656c]">A verified interpreter community helping people communicate with confidence.</p>
          <div className="mt-5 space-y-3">
            <div className="rounded-xl border border-white/80 bg-white/75 p-3"><p className="text-xs font-extrabold text-[#234450]">New: Medical interpreters</p><p className="mt-1 text-xs text-[#78858a]">เพิ่มล่ามด้านการแพทย์ 6 คนในพื้นที่</p></div>
            <div className="rounded-xl border border-white/80 bg-white/75 p-3"><p className="text-xs font-extrabold text-[#234450]">Safety reminder</p><p className="mt-1 text-xs text-[#78858a]">ข้อมูลส่วนตัวจะเปิดเมื่อมีการ claim เท่านั้น</p></div>
          </div>
          <a className="mt-5 inline-flex items-center gap-1 text-sm font-extrabold text-[#0d8587]" href="#safety">Read about safety <ChevronRightIcon aria-hidden="true" className="h-4 w-4" /></a>
        </div>
      </section>

      <section id="how-it-works" className="border-y border-[#dbe3e7] bg-[#eef2f4] px-5 py-12 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-[1320px]">
          <div className="max-w-xl"><p className="text-xs font-extrabold uppercase tracking-[0.12em] text-[#0d8587]">How it works</p><h2 className="mt-2 text-3xl font-extrabold tracking-normal text-[#153447]">Clear communication, made simple</h2><p className="mt-2 text-sm text-[#718086]">ขั้นตอนที่ชัดเจนตั้งแต่การขอความช่วยเหลือจนจบภารกิจ</p></div>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {howItWorksSteps.map(([number, title, description, StepIcon]) => (
              <article key={number} className="rounded-xl border border-[#d6e0e4] bg-white p-5"><div className="flex items-center justify-between"><IconBox className="rounded-lg bg-[#e1f0eb] text-[#0d8587]"><StepIcon className="h-6 w-6" /></IconBox><span className="text-sm font-extrabold text-[#7d8d93]">{number}</span></div><h3 className="mt-5 font-extrabold text-[#203d4d]">{title}</h3><p className="mt-2 text-sm leading-6 text-[#6c797d]">{description}</p></article>
            ))}
          </div>
        </div>
      </section>

      <section id="safety" className="bg-[#082f45] px-5 py-10 text-white sm:px-8 lg:px-12 lg:py-12">
        <div className="mx-auto grid max-w-[1320px] gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
          <div><p className="text-xs font-extrabold uppercase tracking-[0.12em] text-[#8ed5c4]">Trust &amp; safety</p><h2 className="mt-2 text-3xl font-extrabold tracking-normal text-balance">Your safety comes first</h2><p className="mt-3 max-w-md text-sm leading-7 text-white/80">We reveal only what is needed and unlock precise location details after a request is claimed.</p></div>
          <div className="grid gap-3 sm:grid-cols-3"><div className="rounded-lg border border-white/10 bg-white/10 p-4"><p className="text-sm font-extrabold">Verified profiles</p><p className="mt-2 text-xs leading-5 text-white/75">ล่ามผ่านการตรวจสอบเอกสาร</p></div><div className="rounded-lg border border-white/10 bg-white/10 p-4"><p className="text-sm font-extrabold">Privacy protected</p><p className="mt-2 text-xs leading-5 text-white/75">ข้อมูลส่วนตัวไม่เปิดก่อน claim</p></div><div className="rounded-lg border border-white/10 bg-white/10 p-4"><p className="text-sm font-extrabold">Safety review</p><p className="mt-2 text-xs leading-5 text-white/75">ติดตามสถานะและ audit trail</p></div></div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
