"use client";

import Link from "next/link";
import {
  ArrowRightIcon,
  ChatBubbleLeftRightIcon,
  ClipboardDocumentListIcon,
  EnvelopeIcon,
  LanguageIcon,
  PhoneIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";
import { StarIcon } from "@heroicons/react/24/solid";
import { useCopyLocale, useUiLocale } from "@/app/components/app-shell";
import { ResponsiveHeroImage } from "@/app/components/responsive-hero-image";
import { StatusBadge, UrgencyBadge } from "@/app/components/request-badges";
import type { ApplicationStatus } from "@/app/lib/interpreter-application";
import type { UserProfile } from "@/app/lib/mock-auth";
import type { HelpRequest, RequestStatus } from "@/app/lib/mock-requests";
import type { InterpreterRating } from "@/app/lib/real-interpreter-rating";
import type { InterpreterWorkspaceMode } from "@/app/lib/workspace-mode";
import type { CopyLocale } from "@/app/lib/locale";
import type { Locale } from "@/app/components/site-header";

export const button = "inline-flex min-h-12 items-center justify-center gap-2 rounded-(--khvi-radius-sm) bg-(--khvi-navy) px-5 py-3 text-sm font-bold text-white hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--khvi-sun)";
export const heroButton = "inline-flex min-h-12 items-center justify-center gap-2 rounded-(--khvi-radius-sm) bg-white px-5 py-3 text-sm font-bold text-(--khvi-navy) hover:bg-(--khvi-paper) focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--khvi-sun)";
export const panel = "rounded-(--khvi-radius-md) border border-(--khvi-teal)/20 bg-(--khvi-surface) p-5 sm:p-7";
export const muted = "mt-2 text-sm leading-7 text-(--khvi-ink)/70";

export type Translate = (th: string, en: string, zh: string) => string;

export function useWelcomeCopy(): {
  locale: Locale;
  copyLocale: CopyLocale;
  tr: Translate;
} {
  const locale = useUiLocale();
  const copyLocale = useCopyLocale();
  const tr: Translate = (th, en, zh) => locale === "th" ? th : locale === "zh" ? zh : en;
  return { locale, copyLocale, tr };
}

export function WelcomeAccountHeader({
  user,
  interpreterMode,
  onInterpreterModeChange,
  interpreterRating,
  applicationStatus,
  applicationVerified,
  interpreterRevoked,
  tr,
}: {
  user: UserProfile;
  interpreterMode: InterpreterWorkspaceMode;
  onInterpreterModeChange?: (mode: InterpreterWorkspaceMode) => void;
  interpreterRating: InterpreterRating | null;
  applicationStatus: ApplicationStatus | null;
  applicationVerified: boolean;
  interpreterRevoked: boolean;
  tr: Translate;
}) {
  const interpreterAccount = user.role === "Interpreter";

  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
      <div>
        <p className="text-sm font-semibold text-(--khvi-teal)">{tr("ยินดีต้อนรับ", "Welcome", "欢迎")}</p>
        <h1 className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-2 text-3xl font-bold">
          <span className="break-words">{user.name}</span>
          {interpreterAccount && (
            <span
              className="inline-flex items-center gap-2 rounded-full border border-(--khvi-teal)/20 bg-white px-4 py-2 text-base font-bold text-(--khvi-ink)"
              aria-label={interpreterRating?.average != null
                ? tr(
                    `คะแนนรีวิวเฉลี่ย ${interpreterRating.average.toFixed(2)} จาก 5 จาก ${interpreterRating.reviewCount} รีวิว`,
                    `Average rating ${interpreterRating.average.toFixed(2)} out of 5 from ${interpreterRating.reviewCount} reviews`,
                    `平均评分 ${interpreterRating.average.toFixed(2)} / 5，共 ${interpreterRating.reviewCount} 条评价`,
                  )
                : interpreterRating
                  ? tr("ยังไม่มีรีวิว", "No reviews yet", "暂无评价")
                  : tr("คะแนนรีวิวไม่พร้อมใช้งาน", "Rating unavailable", "评分暂不可用")}
            >
              <StarIcon className="h-6 w-6 shrink-0 text-(--khvi-sun)" aria-hidden="true" />
              {interpreterRating?.average != null ? (
                <>
                  <span className="text-xl leading-none sm:text-2xl">{interpreterRating.average.toFixed(2)} / 5</span>
                  <span className="text-sm font-medium text-(--khvi-ink)/65">({interpreterRating.reviewCount})</span>
                </>
              ) : interpreterRating
                ? tr("ยังไม่มีรีวิว", "No reviews yet", "暂无评价")
                : tr("คะแนนรีวิวไม่พร้อมใช้งาน", "Rating unavailable", "评分暂不可用")}
            </span>
          )}
        </h1>
      </div>
      {interpreterAccount ? (
        <div className="w-full sm:w-auto">
          <p className="mb-2 text-xs font-bold text-(--khvi-ink)/65 sm:text-right">{tr("เลือกโหมดการใช้งาน", "Choose how to use KHVI", "选择使用模式")}</p>
          <div
            role="group"
            aria-label={tr("สลับระหว่างการช่วยเหลือและการขอความช่วยเหลือ", "Switch between helping and requesting help", "在提供帮助和请求帮助之间切换")}
            className="grid min-h-12 w-full grid-cols-2 rounded-full border border-(--khvi-teal)/30 bg-white p-1 shadow-sm sm:w-auto sm:min-w-[330px]"
          >
            {(["helper", "requester"] as const).map((mode) => {
              const selected = interpreterMode === mode;
              return (
                <button
                  key={mode}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => onInterpreterModeChange?.(mode)}
                  className={`min-h-10 rounded-full px-4 py-2 text-sm font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--khvi-sun) ${selected ? "bg-(--khvi-navy) text-white shadow-sm" : "text-(--khvi-ink)/70 hover:bg-(--khvi-paper)"}`}
                >
                  {mode === "helper" ? tr("เข้ามาช่วยเหลือ", "Help others", "提供帮助") : tr("เข้ามาขอความช่วยเหลือ", "Request help", "请求帮助")}
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-3">
          {applicationStatus && applicationStatus !== "approved" && !interpreterRevoked ? (
            <Link
              className="inline-flex min-h-10 items-center justify-center rounded-full bg-(--khvi-navy) px-4 py-2 text-sm font-bold text-white shadow-sm hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--khvi-sun)"
              href="/volunteer/status#main-content"
            >
              {tr("ดูสถานะการสมัคร", "View application status", "查看申请状态")}
            </Link>
          ) : !applicationStatus && applicationVerified && !interpreterRevoked ? (
            <Link
              className="inline-flex min-h-10 items-center justify-center rounded-full bg-(--khvi-navy) px-4 py-2 text-sm font-bold text-white shadow-sm hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--khvi-sun)"
              href="/volunteer/apply#main-content"
            >
              {tr("สมัครล่ามอาสา", "Volunteer apply", "申请志愿口译员")}
            </Link>
          ) : null}
        </div>
      )}
    </div>
  );
}

export function WelcomeHero({ variant, tr }: { variant: "user" | "interpreter"; tr: Translate }) {
  const interpreter = variant === "interpreter";

  return (
    <section className="order-2 relative min-h-[420px] overflow-hidden rounded-(--khvi-radius-lg) bg-(--khvi-navy) text-white sm:min-h-[380px] md:order-1">
      <ResponsiveHeroImage
        desktopSrc={interpreter ? "/khvi-interpreter-hero.png" : "/khvi-requester-hero.png"}
        mobileSrc={interpreter ? "/khvi-interpreter-hero-mobile.png" : "/khvi-requester-hero-mobile.png"}
        alt={interpreter
          ? tr("ล่ามอาสาช่วยผู้ใช้สื่อสารกับเจ้าหน้าที่บริการชุมชน", "A volunteer interpreter helping a user speak with a community service worker", "志愿口译员帮助用户与社区服务人员沟通")
          : tr("ผู้ขอความช่วยเหลือกำลังรับคำอธิบายจากล่ามอาสา", "A requester receiving an explanation from a volunteer interpreter", "求助者正在听志愿口译员讲解")}
        sizes="(min-width: 1024px) 60vw, 100vw"
        className="object-center md:object-[58%_center]"
      />
      <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(180deg,rgba(9,47,69,0.30)_0%,rgba(9,47,69,0.82)_58%,rgba(9,47,69,0.97)_100%)] md:bg-[linear-gradient(90deg,rgba(9,47,69,0.97)_0%,rgba(9,47,69,0.82)_50%,rgba(9,47,69,0.18)_100%)]" />
      <div className="relative z-10 flex min-h-[420px] flex-col items-start justify-end p-6 sm:min-h-[380px] sm:p-9">
        <span className="flex items-center gap-2 text-sm text-white/80"><LanguageIcon className="h-5 w-5" aria-hidden="true" /> KHVI · {tr("สื่อสารเข้าใจ ช่วยเหลือใกล้ตัว", "Community language help", "社区语言帮助")}</span>
        <h2 className="mt-6 max-w-lg text-3xl font-bold leading-tight sm:text-4xl">{interpreter ? tr("ใช้ภาษาที่คุณถนัด ช่วยให้ใครสักคนเข้าใจ", "Help someone be understood.", "用你的语言能力，帮助身边的人。") : tr("ต้องการความช่วยเหลือด้านภาษา เริ่มได้ที่นี่", "A little language help starts here.", "沟通有困难？从这里开始。")}</h2>
        <div className="mt-5 max-w-lg border-l-2 border-white/45 pl-4">
          <p className="leading-8 text-white/85">{interpreter ? tr("ค้นหาคำขอตามภาษา หมวดหมู่ และระยะทาง ตรวจสอบก่อนรับงาน และรับผิดชอบครั้งละหนึ่งภารกิจ", "Explore requests by language, category and distance. Review each request and take one assignment at a time.", "按语言、类别和距离查找请求。确认详情后接单，一次只接受一个任务。") : tr("เลือกภาษา หมวดหมู่ และจุดนัดพบ ล่ามที่ตรงเงื่อนไขจะเป็นผู้เลือกกดรับคำขอของคุณ", "Choose a language, category and meeting point. A suitable interpreter chooses to claim your request.", "选择语言、类别和见面地点，符合条件的口译员会自行接单。")}</p>
        </div>
        {!interpreter && <Link className={`${heroButton} mt-7`} href="/user/request-help#main-content">{tr("ต้องการขอความช่วยเหลือ", "Create a help request", "创建求助请求")}</Link>}
      </div>
    </section>
  );
}

export function RequestProgress({ status, tr }: { status: RequestStatus; tr: Translate }) {
  const steps = [
    { status: "Open" as const, label: tr("รอรับงาน", "Open", "开放中") },
    { status: "Claimed" as const, label: tr("รับงานแล้ว", "Claimed", "已接取") },
    { status: "InProgress" as const, label: tr("กำลังดำเนินการ", "In progress", "进行中") },
    { status: "Completed" as const, label: tr("เสร็จสิ้น", "Completed", "已完成") },
  ];
  const activeIndex = Math.max(0, steps.findIndex((step) => step.status === status));
  const currentStep = steps[activeIndex];

  return (
    <section className="mt-4 rounded-lg border border-(--khvi-teal)/20 bg-(--khvi-paper) p-3" aria-label={tr("ความคืบหน้าคำขอ", "Request progress", "求助进度")}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-bold text-(--khvi-ink)">{tr("ความคืบหน้าคำขอ", "Request progress", "求助进度")}</h3>
        <span className="text-xs font-bold text-(--khvi-teal)">{currentStep.label}</span>
      </div>
      <ol className="mt-3 grid grid-cols-4 gap-1">
        {steps.map((step, index) => {
          const reached = index <= activeIndex;
          return (
            <li key={step.status} className="min-w-0">
              <div className="flex items-center">
                <span
                  aria-current={index === activeIndex ? "step" : undefined}
                  className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-[0.65rem] font-extrabold ${reached ? "bg-(--khvi-teal) text-white" : "bg-white text-(--khvi-ink)/45"}`}
                >
                  {index + 1}
                </span>
                {index < steps.length - 1 && <span aria-hidden="true" className={`mx-1 h-0.5 min-w-0 flex-1 ${index < activeIndex ? "bg-(--khvi-teal)" : "bg-(--khvi-teal)/20"}`} />}
              </div>
              <span className={`mt-1 block break-words text-[0.6rem] font-bold leading-3.5 ${index === activeIndex ? "text-(--khvi-teal)" : "text-(--khvi-ink)/60"}`}>{step.label}</span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

export function RequestListRow({
  request,
  discovery = false,
  languageLabel,
  categoryLabel,
  locale,
  copyLocale,
  tr,
}: {
  request: HelpRequest;
  discovery?: boolean;
  languageLabel: string;
  categoryLabel: string;
  locale: Locale;
  copyLocale: CopyLocale;
  tr: Translate;
}) {
  return (
    <li className="flex min-w-0 flex-wrap items-center justify-between gap-4 py-5">
      <div className="min-w-0 flex-1"><h3 className="break-words font-bold">{languageLabel} · {categoryLabel}</h3><p className={muted}>{discovery ? request.areaName : request.scheduledAtLabel ?? request.createdAtLabel}</p></div>
      <div className="flex w-full min-w-0 flex-wrap items-center gap-3 sm:w-auto sm:justify-end"><UrgencyBadge urgency={request.urgency} copyLocale={locale === "th" ? "th" : copyLocale} /><StatusBadge status={request.status} copyLocale={locale === "th" ? "th" : copyLocale} /><Link className={`${button} min-h-10 max-w-full shrink-0 px-4 py-2 text-xs whitespace-nowrap`} href={discovery ? "/interpreter/find-requests#main-content" : `/user/my-requests/${request.requestId}#main-content`}>{tr("ดูรายละเอียด", "View details", "查看详情")}<ArrowRightIcon aria-hidden="true" className="h-4 w-4 shrink-0" /></Link></div>
    </li>
  );
}

export function ContactPanel({
  completed = [],
  pendingReviews = [],
  showReviews = false,
  tr,
}: {
  completed?: HelpRequest[];
  pendingReviews?: HelpRequest[];
  showReviews?: boolean;
  tr: Translate;
}) {
  return (
    <section className={`${panel} h-full`}>
      <ChatBubbleLeftRightIcon className="h-7 w-7 text-(--khvi-teal)" aria-hidden="true" />
      <h2 className="mt-3 text-xl font-bold">{tr("ช่องทางติดต่อหากพบปัญหา", "Contact us if you have a problem", "遇到问题时的联系方式")}</h2>
      <p className={muted}>{tr("หากพบปัญหาในการใช้งานหรือต้องการความช่วยเหลือเพิ่มเติม ติดต่อเราได้ที่", "If you run into a problem or need further help, contact us through:", "如果遇到使用问题或需要更多帮助，请通过以下方式联系我们：")}</p>
      <div className="mt-4 space-y-3 text-sm leading-6">
        <a className="flex items-center gap-3 font-bold text-(--khvi-ink) underline-offset-4 hover:text-(--khvi-teal) hover:underline" href="tel:0653735884"><PhoneIcon className="h-5 w-5 shrink-0 text-(--khvi-teal)" aria-hidden="true" /><span>0653735884</span></a>
        <a className="flex min-w-0 items-center gap-3 font-bold text-(--khvi-ink) underline-offset-4 hover:text-(--khvi-teal) hover:underline" href="mailto:wasutorn5884@gmail.com"><EnvelopeIcon className="h-5 w-5 shrink-0 text-(--khvi-teal)" aria-hidden="true" /><span className="break-all">wasutorn5884@gmail.com</span></a>
      </div>
      {showReviews && completed.length > 0 && (
        <div className="mt-6 border-t border-(--khvi-teal)/20 pt-5">
          <ShieldCheckIcon className="h-7 w-7 text-(--khvi-teal)" aria-hidden="true" />
          <h3 className="mt-3 text-lg font-bold">{tr("รีวิวหลังจบภารกิจ", "Review after completion", "完成后评价")}</h3>
          <p className={muted}>{pendingReviews.length
            ? tr(`มีงานที่เสร็จแล้ว ${completed.length} รายการ และมี ${pendingReviews.length} รายการรอรีวิว`, `${pendingReviews.length} of ${completed.length} completed assignments are waiting for your review.`, `${pendingReviews.length} / ${completed.length} 个已完成任务等待评价。`)
            : tr("คุณรีวิวงานที่เสร็จแล้วครบถ้วนแล้ว", "All completed assignments have been reviewed.", "所有已完成任务都已评价。")}</p>
          {pendingReviews[0] && <Link className={`${button} mt-4 min-h-10 self-start px-4 py-2 text-xs`} href={`/user/my-requests/${pendingReviews[0].requestId}#main-content`}>{tr("ไปรีวิวงานที่เสร็จแล้ว", "Review a completed assignment", "评价已完成任务")}<ArrowRightIcon className="h-4 w-4" aria-hidden="true" /></Link>}
        </div>
      )}
    </section>
  );
}

export function EmptyRecentRequests({ variant, tr }: { variant: "user" | "interpreter"; tr: Translate }) {
  const interpreter = variant === "interpreter";
  return (
    <div className="flex items-start gap-4 py-6">
      <ClipboardDocumentListIcon className="h-8 w-8 shrink-0 text-(--khvi-teal)" aria-hidden="true" />
      <div>
        <p className="text-sm leading-7">{interpreter ? tr("ยังไม่มีงานที่ผ่านมา เมื่อล่ามรับงาน รายการจะแสดงที่นี่", "You have no past assignments yet. Claimed assignments will appear here.", "您还没有历史任务，接取任务后会显示在这里。") : tr("ยังไม่มีคำขอล่าสุด เมื่อคุณส่งคำขอความช่วยเหลือ รายการจะแสดงที่นี่", "You have no recent requests yet. Requests you submit will appear here.", "您还没有最近的求助，提交求助后会显示在这里。")}</p>
        <Link className={`${button} mt-3 min-h-10 px-4 py-2 text-xs`} href={interpreter ? "/interpreter/find-requests#main-content" : "/user/request-help#main-content"}>{interpreter ? tr("ค้นหาคำขอ", "Find requests", "查找求助") : tr("ขอความช่วยเหลือ", "Request help", "请求帮助")}</Link>
      </div>
    </div>
  );
}

export function getNextAction(current: HelpRequest | undefined, tr: Translate): string {
  return current?.status === "Open"
    ? tr("กำลังรอล่ามรับคำขอ เปิดรายละเอียดเพื่อติดตามเวลาหมดอายุ", "Waiting for an interpreter. Open the request to track its deadline.", "正在等待口译员接单。打开请求查看截止时间。")
    : current?.status === "Claimed"
      ? tr("มีล่ามรับงานแล้ว ตรวจสอบรายละเอียดและขั้นตอนการยืนยันก่อนนัดพบ", "An interpreter has claimed this request. Review the details and confirmation steps before meeting.", "已有口译员接单。见面前请查看详情和确认步骤。")
      : current?.userConfirmedDoneAtLabel && current?.interpreterConfirmedDoneAtLabel === null
        ? tr("ผู้ขอยืนยันจบงานแล้ว รอการยืนยันจากล่าม", "The requester has confirmed completion. Waiting for the interpreter.", "求助者已确认完成，等待口译员确认。")
        : current?.interpreterConfirmedDoneAtLabel && current?.userConfirmedDoneAtLabel === null
          ? tr("ล่ามยืนยันจบงานแล้ว รอการยืนยันจากผู้ขอ", "The interpreter has confirmed completion. Waiting for the requester.", "口译员已确认完成，等待求助者确认。")
          : tr("ภารกิจกำลังดำเนินการ ทั้งสองฝ่ายต้องยืนยันเมื่อช่วยเหลือเสร็จ", "Work is in progress. Both people confirm when it is complete.", "任务进行中。完成后双方都需要确认。");
}
