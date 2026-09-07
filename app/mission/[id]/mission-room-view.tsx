"use client";

import { useEffect, useMemo, useState } from "react";
import { SiteHeader, type Locale } from "@/app/components/site-header";
import { SiteFooter } from "@/app/components/site-footer";
import { MissionHeader } from "@/app/components/mission/mission-header";
import { ContactCard } from "@/app/components/mission/contact-card";
import { ExecutionControls } from "@/app/components/mission/execution-controls";
import { CompletionConfirm } from "@/app/components/mission/completion-confirm";
import type { Booking } from "@/types/database.types";

const copy = {
  en: {
    header: {
      brandSubtitle: "Mission tracking room",
      languageLabel: "Language",
      signIn: "Sign in",
      primaryAction: "Back to map",
      nav: [
        ["Map", "/#map-preview"],
        ["How it works", "/#how-it-works"],
        ["Safety", "/#safety"],
      ],
    },
    footer: {
      description: "K-HVI connects people who need language help with nearby approved volunteer interpreters.",
      note: "This mission room is shared by the requester and the interpreter.",
      explore: "Explore",
      safety: "Safety",
      needHelp: "Need help?",
      needHelpBody: "Use Help Request from your dashboard if something looks wrong with this mission.",
      footerCta: "Back to map",
      privacy: "Contact details unlock only after a job is claimed.",
      links: { map: "Map preview", how: "How it works", roles: "Roles", privacy: "Privacy", request: "Create pin", signIn: "Sign in" },
    },
    mission: {
      eyebrow: "Mission",
      statusLabels: {
        Open: "Open",
        Claimed: "Claimed",
        InProgress: "In progress",
        Completed: "Completed",
        Cancelled: "Cancelled",
        Expired: "Expired",
      },
      viewingAs: "Viewing as",
      asUser: "Requester",
      asInterpreter: "Interpreter",
      contact: {
        title: "Contact & meeting point",
        privacyNote: "Contact details unlock once the interpreter claims this job.",
        descriptionLabel: "Request details",
        locationLabel: "Meeting point",
        contactLabel: "Phone",
        extraContactLabel: "Other contact",
      },
      execution: {
        startAction: "Start job",
        endAction: "Mark job as finished",
        cancelAction: "Cancel",
        cancelPromptTitle: "Tell us why this mission is being cancelled",
        cancelPromptPlaceholder: "Reason for cancellation",
        cancelConfirm: "Confirm cancellation",
        cancelDismiss: "Keep mission",
        startedAtLabel: "Started at",
      },
      completion: {
        title: "Confirm job completion",
        body: "Both the requester and the interpreter need to confirm before this mission closes.",
        userLabel: "Requester",
        interpreterLabel: "Interpreter",
        confirmedLabel: "Confirmed",
        waitingLabel: "Waiting for confirmation",
        confirmAction: "Confirm job is done",
      },
      cancelledNote: "This mission was cancelled.",
      cancelledBy: "Cancelled by",
      cancelledReason: "Reason",
      completedNote: "This mission is complete. Thank you for using K-HVI.",
    },
  },
  th: {
    header: {
      brandSubtitle: "ห้องติดตามภารกิจ",
      languageLabel: "ภาษา",
      signIn: "เข้าสู่ระบบ",
      primaryAction: "กลับไปที่แผนที่",
      nav: [
        ["แผนที่", "/#map-preview"],
        ["วิธีใช้งาน", "/#how-it-works"],
        ["ความปลอดภัย", "/#safety"],
      ],
    },
    footer: {
      description: "K-HVI จับคู่ผู้ต้องการความช่วยเหลือด้านภาษากับล่ามจิตอาสาที่ผ่านการตรวจสอบใกล้เคียง",
      note: "ห้องนี้ใช้งานร่วมกันระหว่างผู้ขอความช่วยเหลือและล่าม",
      explore: "เมนู",
      safety: "ความปลอดภัย",
      needHelp: "ต้องการความช่วยเหลือ?",
      needHelpBody: "ส่งคำร้องขอความช่วยเหลือจากแดชบอร์ดของคุณ หากพบปัญหากับภารกิจนี้",
      footerCta: "กลับไปที่แผนที่",
      privacy: "ข้อมูลติดต่อจะเปิดเผยหลังจากล่ามรับงานแล้วเท่านั้น",
      links: { map: "ดูแผนที่", how: "วิธีใช้งาน", roles: "บทบาทผู้ใช้", privacy: "ความเป็นส่วนตัว", request: "สร้างคำขอ", signIn: "เข้าสู่ระบบ" },
    },
    mission: {
      eyebrow: "ภารกิจ",
      statusLabels: {
        Open: "เปิดรับ",
        Claimed: "รับงานแล้ว",
        InProgress: "กำลังดำเนินการ",
        Completed: "จบงานแล้ว",
        Cancelled: "ยกเลิกแล้ว",
        Expired: "หมดอายุ",
      },
      viewingAs: "กำลังดูในมุมมองของ",
      asUser: "ผู้ขอความช่วยเหลือ",
      asInterpreter: "ล่าม",
      contact: {
        title: "ข้อมูลติดต่อและจุดนัดพบ",
        privacyNote: "ข้อมูลติดต่อจะเปิดเผยเมื่อล่ามกดรับงานแล้ว",
        descriptionLabel: "รายละเอียดคำขอ",
        locationLabel: "จุดนัดพบ",
        contactLabel: "เบอร์โทรศัพท์",
        extraContactLabel: "ช่องทางติดต่ออื่น",
      },
      execution: {
        startAction: "เริ่มงาน",
        endAction: "ยืนยันจบงาน",
        cancelAction: "ยกเลิก",
        cancelPromptTitle: "กรุณาระบุเหตุผลในการยกเลิกภารกิจนี้",
        cancelPromptPlaceholder: "เหตุผลการยกเลิก",
        cancelConfirm: "ยืนยันการยกเลิก",
        cancelDismiss: "ไม่ยกเลิก",
        startedAtLabel: "เริ่มงานเมื่อ",
      },
      completion: {
        title: "ยืนยันจบงานทั้งสองฝ่าย",
        body: "ทั้งผู้ขอความช่วยเหลือและล่ามต้องยืนยันก่อนที่ภารกิจนี้จะปิด",
        userLabel: "ผู้ขอความช่วยเหลือ",
        interpreterLabel: "ล่าม",
        confirmedLabel: "ยืนยันแล้ว",
        waitingLabel: "รอการยืนยัน",
        confirmAction: "ยืนยันว่างานเสร็จแล้ว",
      },
      cancelledNote: "ภารกิจนี้ถูกยกเลิกแล้ว",
      cancelledBy: "ยกเลิกโดย",
      cancelledReason: "เหตุผล",
      completedNote: "ภารกิจนี้เสร็จสมบูรณ์แล้ว ขอบคุณที่ใช้บริการ K-HVI",
    },
  },
} as const;

const localeLanguageTags: Record<Locale, string> = {
  en: "en",
  th: "th",
  zh: "zh-Hans",
  my: "my",
  vi: "vi",
};

function isLocale(value: string | null): value is Locale {
  return value === "en" || value === "th" || value === "zh" || value === "my" || value === "vi";
}

function getCopyLocale(locale: Locale): keyof typeof copy {
  return locale === "th" ? "th" : "en";
}

export function MissionRoomView({ initialBooking }: { initialBooking: Booking }) {
  const [locale, setLocale] = useState<Locale>(() => {
    if (typeof window !== "undefined") {
      const savedLocale = window.localStorage.getItem("khvi-locale");
      if (isLocale(savedLocale)) {
        return savedLocale;
      }
    }
    return "th";
  });
  const [booking, setBooking] = useState<Booking>(initialBooking);
  const [viewerRole, setViewerRole] = useState<"user" | "interpreter">("user");

  const t = copy[getCopyLocale(locale)];

  useEffect(() => {
    document.documentElement.lang = localeLanguageTags[locale];
    window.localStorage.setItem("khvi-locale", locale);
  }, [locale]);

  const showCompletionConfirm = booking.status === "InProgress" && booking.endedAt !== null;

  const handleStart = () => {
    setBooking((current) => ({ ...current, status: "InProgress", startedAt: new Date().toISOString() }));
  };

  const handleEnd = () => {
    setBooking((current) => ({ ...current, endedAt: new Date().toISOString() }));
  };

  const handleConfirmCompletion = () => {
    setBooking((current) => {
      const next: Booking = {
        ...current,
        userConfirmedDoneAt: viewerRole === "user" ? new Date().toISOString() : current.userConfirmedDoneAt,
        interpreterConfirmedDoneAt: viewerRole === "interpreter" ? new Date().toISOString() : current.interpreterConfirmedDoneAt,
      };
      const bothConfirmed = next.userConfirmedDoneAt !== null && next.interpreterConfirmedDoneAt !== null;
      return bothConfirmed ? { ...next, status: "Completed" } : next;
    });
  };

  const handleCancel = (reason: string) => {
    setBooking((current) => ({
      ...current,
      status: "Cancelled",
      cancelledBy: viewerRole === "user" ? "User" : "Interpreter",
      cancelReason: reason,
    }));
  };

  const roleToggle = useMemo(
    () => (
      <div className="flex items-center gap-2 text-sm">
        <span className="font-semibold text-[#66777d]">{t.mission.viewingAs}:</span>
        <div className="inline-flex rounded-lg border border-[#d8e1e6] bg-white p-1">
          <button
            type="button"
            onClick={() => setViewerRole("user")}
            className={`rounded-md px-3 py-1.5 text-xs font-extrabold transition ${viewerRole === "user" ? "bg-[var(--khvi-navy)] text-white" : "text-[#52676f]"}`}
          >
            {t.mission.asUser}
          </button>
          <button
            type="button"
            onClick={() => setViewerRole("interpreter")}
            className={`rounded-md px-3 py-1.5 text-xs font-extrabold transition ${viewerRole === "interpreter" ? "bg-[var(--khvi-navy)] text-white" : "text-[#52676f]"}`}
          >
            {t.mission.asInterpreter}
          </button>
        </div>
      </div>
    ),
    [t, viewerRole],
  );

  return (
    <main className="min-h-screen bg-[var(--khvi-paper)] text-[var(--khvi-ink)]">
      <SiteHeader copy={t.header} locale={locale} onLocaleChange={setLocale} />

      <section className="mx-auto max-w-[880px] px-5 py-8 sm:px-8 sm:py-12">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">{roleToggle}</div>

        <div className="space-y-6">
          <MissionHeader
            copy={t.mission}
            bookingId={booking.bookingId}
            categoryName={booking.categoryName}
            languageName={booking.languageName}
            status={booking.status}
          />

          <ContactCard copy={t.mission.contact} booking={booking} viewerRole={viewerRole} />

          {booking.status === "Cancelled" ? (
            <section className="rounded-[var(--khvi-radius-lg)] border border-[#f04f3e] bg-[#fbe9e7] p-6 text-sm text-[#a4291d] sm:p-8">
              <p className="font-extrabold">{t.mission.cancelledNote}</p>
              <p className="mt-2">
                {t.mission.cancelledBy}: {booking.cancelledBy}
              </p>
              {booking.cancelReason ? (
                <p className="mt-1">
                  {t.mission.cancelledReason}: {booking.cancelReason}
                </p>
              ) : null}
            </section>
          ) : (
            <ExecutionControls
              copy={t.mission.execution}
              status={booking.status}
              startedAt={booking.startedAt}
              onStart={handleStart}
              onEnd={handleEnd}
              onCancel={handleCancel}
            />
          )}

          {showCompletionConfirm ? (
            <CompletionConfirm
              copy={t.mission.completion}
              viewerRole={viewerRole}
              userConfirmedDoneAt={booking.userConfirmedDoneAt}
              interpreterConfirmedDoneAt={booking.interpreterConfirmedDoneAt}
              onConfirm={handleConfirmCompletion}
            />
          ) : null}

          {booking.status === "Completed" ? (
            <section className="rounded-[var(--khvi-radius-lg)] border border-[#7fbfa4] bg-[#e6f4ef] p-6 text-sm font-semibold text-[#087557] sm:p-8">
              {t.mission.completedNote}
            </section>
          ) : null}
        </div>
      </section>

      <SiteFooter copy={t.footer} brandSubtitle={t.header.brandSubtitle} />
    </main>
  );
}
