"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRightIcon, ClipboardDocumentListIcon, LanguageIcon } from "@heroicons/react/24/outline";
import { ExpiryCountdown } from "@/app/components/expiry-countdown";
import type { UserProfile } from "@/app/lib/mock-auth";
import type { HelpRequest } from "@/app/lib/mock-requests";
import { referenceLabel, type ReferenceCatalog } from "@/app/lib/reference-catalog";
import type { InterpreterRating } from "@/app/lib/real-interpreter-rating";
import type { InterpreterWorkspaceMode } from "@/app/lib/workspace-mode";
import { ApplicationStatusCard } from "@/components/volunteer/ApplicationStatusCard";
import { useWelcomeApplication } from "@/app/components/welcome/use-welcome-application";
import {
  button,
  ContactPanel,
  EmptyRecentRequests,
  getNextAction,
  muted,
  panel,
  RequestListRow,
  RequestProgress,
  useWelcomeCopy,
  WelcomeAccountHeader,
  WelcomeHero,
} from "@/app/components/welcome/welcome-ui";

export function UserWelcome({
  user,
  interpreterMode,
  onInterpreterModeChange,
  requesterRequests,
  referenceCatalog,
  interpreterRating,
}: {
  user: UserProfile;
  interpreterMode: InterpreterWorkspaceMode;
  onInterpreterModeChange?: (mode: InterpreterWorkspaceMode) => void;
  requesterRequests: HelpRequest[];
  referenceCatalog: ReferenceCatalog;
  interpreterRating: InterpreterRating | null;
}) {
  const { locale, copyLocale, tr } = useWelcomeCopy();
  const {
    activeApplication,
    applicationLoaded,
    applicationStatus,
    applicationVerified,
    interpreterAccess,
  } = useWelcomeApplication(user.userId);
  const [now, setNow] = useState(0);

  useEffect(() => {
    const updateNow = () => setNow(Date.now());
    updateNow();
    const timer = window.setInterval(updateNow, 1000);
    return () => window.clearInterval(timer);
  }, []);

  const isLiveOpenRequest = (request: HelpRequest) =>
    request.status !== "Open"
    || !request.expiresAt
    || Date.parse(request.expiresAt) > now;
  const active = requesterRequests
    .filter((request) => ["Open", "Claimed", "InProgress"].includes(request.status))
    .filter(isLiveOpenRequest);
  const current = active[0];
  const completed = requesterRequests.filter((request) => request.status === "Completed");
  const pendingReviews = completed.filter((request) => Boolean(request.interpreter) && !request.review);
  const recent = requesterRequests.filter((request) => request.requestId !== current?.requestId).slice(0, 3);
  const languageLabel = (request: HelpRequest) => referenceLabel(referenceCatalog.languages, request.languageId, locale);
  const categoryLabel = (request: HelpRequest) => referenceLabel(referenceCatalog.categories, request.categoryId, locale);
  const nextAction = getNextAction(current, tr);
  const interpreterAccount = user.role === "Interpreter";
  const showApplicationCard = applicationLoaded
    && applicationVerified
    && (!interpreterAccount || Boolean(activeApplication));

  return (
    <main id="main-content" className="mx-auto max-w-[1480px] px-5 py-8 sm:px-8 lg:px-8 lg:py-10">
      <WelcomeAccountHeader
        user={user}
        interpreterMode={interpreterMode}
        onInterpreterModeChange={onInterpreterModeChange}
        interpreterRating={interpreterRating}
        applicationStatus={applicationStatus}
        applicationVerified={interpreterAccess.verified}
        interpreterRevoked={interpreterAccess.revoked}
        tr={tr}
      />
      <div className="grid items-start gap-5 md:items-stretch md:grid-cols-[1.5fr_1fr]">
        <WelcomeHero variant="user" tr={tr} />
        <aside className={`${panel} ${current ? "order-1" : "order-3"} flex h-fit self-start flex-col border-l-4 border-l-(--khvi-teal) md:order-2 md:h-auto md:self-stretch`} aria-labelledby="current-title">
          <div className="flex min-w-0 flex-wrap justify-between gap-3">
            <h2 id="current-title" className="min-w-0 flex-1 break-words text-lg font-bold leading-7 sm:text-xl">{tr("คำขอความช่วยเหลือที่กำลังดำเนินการ", "Current help request", "当前进行中的求助")}</h2>
          </div>
          {current ? (
            <div className="flex min-h-0 flex-1 flex-col">
              <dl className="mt-6 divide-y divide-(--khvi-teal)/15 border-y border-(--khvi-teal)/15 text-sm">
                <div className="grid min-w-0 gap-1 py-4 sm:grid-cols-[8rem_minmax(0,1fr)] lg:grid-cols-1 xl:grid-cols-[8rem_minmax(0,1fr)]">
                  <dt className="break-words text-xs font-bold leading-5 text-(--khvi-ink)/60 sm:text-sm">{tr("ภาษาและหมวดหมู่", "Language and category", "语言和类别")}</dt>
                  <dd className="min-w-0 break-words text-sm font-semibold leading-6 text-(--khvi-ink)">{languageLabel(current)} · {categoryLabel(current)}</dd>
                </div>
              </dl>
              <RequestProgress status={current.status} tr={tr} />
              {current.status === "Open" && current.expiresAt && <div className="mt-4"><ExpiryCountdown key={current.requestId} seconds={0} expiresAt={current.expiresAt} copyLocale={locale === "th" ? "th" : copyLocale} /></div>}
              {current.status !== "Open" && <p className="my-4 break-words rounded-lg bg-(--khvi-teal)/10 px-4 py-3 text-sm leading-6" role="status">{nextAction}</p>}
              {current.interpreter && <div className="mb-4 flex items-center gap-3"><LanguageIcon className="h-6 w-6 shrink-0 text-(--khvi-teal)" aria-hidden="true" /><div><p className="text-xs font-bold text-(--khvi-ink)/60">{tr("ล่ามที่รับงาน", "Assigned interpreter", "接单口译员")}</p><p className="font-bold">{current.interpreter.name}</p><p className="text-sm text-(--khvi-ink)/70">{current.interpreter.primaryLanguage}</p></div></div>}
              <div className="mt-auto pt-7">
                <Link className={`${button} w-full text-center leading-6`} href={`/user/my-requests/${current.requestId}#main-content`}>{tr("ดูรายละเอียดทั้งหมด", "View all details", "查看全部详情")}<ArrowRightIcon className="h-4 w-4 shrink-0" aria-hidden="true" /></Link>
                {active.length > 1 && <p className={muted}>{tr("คุณมีหลายรายการที่กำลังดำเนินการ สามารถเปิดดูรายการทั้งหมดได้", "You have multiple active records. Open the full list to view them all.", "您有多个进行中的记录，请在完整列表中查看。")}</p>}
              </div>
            </div>
          ) : (
            <div className="mt-5 flex flex-1 flex-col items-center justify-center border-t border-(--khvi-teal)/15 py-6 text-center sm:py-8">
              <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-(--khvi-teal)/10 sm:h-24 sm:w-24">
                <ClipboardDocumentListIcon className="h-10 w-10 text-(--khvi-teal) sm:h-12 sm:w-12" aria-hidden="true" />
              </div>
              <h3 className="text-lg font-bold text-(--khvi-ink)">{tr("ยังไม่มีคำขอที่กำลังดำเนินการ", "No active help requests", "暂无进行中的求助")}</h3>
              <p className="mt-2 max-w-[28ch] text-sm leading-7 text-(--khvi-ink)/70">{tr("เมื่อมีคำขอ คุณจะติดตามสถานะและล่ามที่รับงานได้ที่นี่", "Track your request status and assigned interpreter here when you have an active request.", "有进行中的求助时，可在此查看状态及接单口译员。")}</p>
            </div>
          )}
        </aside>
      </div>
      <section className={`${panel} mt-7 flex flex-col`}>
        <div className="flex min-w-0 flex-wrap items-center justify-between gap-3">
          <h2 className="flex min-w-0 items-center gap-2 text-xl font-bold">{tr("คำขอล่าสุด", "Recent requests", "最近的请求")}</h2>
          <Link className={`${button} min-h-10 shrink-0 px-4 py-2 text-xs`} href="/user/my-requests#main-content">{tr("ดูทั้งหมด", "View all", "查看全部")}</Link>
        </div>
        {recent.length ? (
          <ul className="min-w-0 divide-y divide-(--khvi-teal)/20">
            {recent.map((request) => (
              <RequestListRow
                key={request.requestId}
                request={request}
                languageLabel={languageLabel(request)}
                categoryLabel={categoryLabel(request)}
                locale={locale}
                copyLocale={copyLocale}
                tr={tr}
              />
            ))}
          </ul>
        ) : <EmptyRecentRequests variant="user" tr={tr} />}
      </section>
      <div className="mt-7 grid items-stretch gap-5 md:grid-cols-2">
        <section id="volunteer-application" className="h-full scroll-mt-28 [&>section]:h-full">{showApplicationCard ? <ApplicationStatusCard application={activeApplication} /> : null}</section>
        <ContactPanel completed={completed} pendingReviews={pendingReviews} showReviews tr={tr} />
      </div>
    </main>
  );
}
