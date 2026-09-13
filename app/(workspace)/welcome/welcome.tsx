"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ArrowRightIcon, BoltIcon, CalendarDaysIcon,
  CheckCircleIcon, ClipboardDocumentListIcon, LanguageIcon, MapPinIcon,
  ShieldCheckIcon, UserGroupIcon,
} from "@heroicons/react/24/outline";
import { AppShell, useCopyLocale } from "@/app/components/app-shell";
import { WorkspaceAccountActions } from "@/app/components/workspace-account-actions";
import { StatusBadge } from "@/app/components/request-badges";
import { useRequests } from "@/app/lib/request-store";
import { categoryLabel, languageLabel } from "@/app/lib/mock-requests";
import {
  AUTH_SESSION_STORAGE_KEY, clearMockUserSession, getMockUserSession,
  getRedirectPathByRole, type UserProfile,
} from "@/app/lib/mock-auth";

const buttonClass = "inline-flex min-h-12 items-center justify-center gap-2 rounded-(--khvi-radius-sm) px-5 py-3 text-sm font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--khvi-sun)";
const panelClass = "rounded-(--khvi-radius-md) border border-(--khvi-teal)/20 bg-(--khvi-surface)";

export function Welcome() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    const refreshSession = () => {
      const session = getMockUserSession();
      if (!session || !["User", "Interpreter", "Manager", "Admin"].includes(session.role)) {
        setUser(null);
        router.replace("/#top");
      } else if (session.role === "Manager" || session.role === "Admin") {
        setUser(null);
        router.replace(getRedirectPathByRole(session.role));
      } else {
        setUser(session);
        const roleHash = session.role === "Interpreter" ? "#welcome-Interpreter" : "#welcome-user";
        if (!window.location.hash || window.location.hash === "#top" || window.location.hash === "#welcome-guide") {
          window.history.replaceState(null, "", roleHash);
        }
      }
    };
    const onStorage = (event: StorageEvent) => {
      if (event.key === AUTH_SESSION_STORAGE_KEY || event.key === null) refreshSession();
    };
    queueMicrotask(refreshSession);
    window.addEventListener("storage", onStorage);
    window.addEventListener("focus", refreshSession);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("focus", refreshSession);
    };
  }, [router]);

  if (!user) return <main className="flex min-h-screen items-center justify-center bg-(--khvi-paper)" aria-busy="true"><p role="status">Loading your workspace…</p></main>;

  return <div id={user.role === "Interpreter" ? "welcome-Interpreter" : "welcome-user"} className="min-h-screen bg-(--khvi-paper) text-(--khvi-ink)">
    <AppShell welcomeRole={user.role === "Interpreter" ? "Interpreter" : "User"} accountActions={<WorkspaceAccountActions onSignOut={() => {
      clearMockUserSession();
      setUser(null);
      router.replace("/#top");
    }} />}>
      <WelcomeContent user={user} />
    </AppShell>
  </div>;
}

function WelcomeContent({ user }: { user: UserProfile }) {
  const locale = useCopyLocale();
  const zh = locale === "zh";
  const interpreter = user.role === "Interpreter";
  const { requests, ready } = useRequests();
  const active = requests.filter((request) => ["Open", "Claimed", "InProgress"].includes(request.status));
  const recent = [...active, ...requests.filter((request) => !active.includes(request))].slice(0, 3);

  const steps = interpreter ? (zh ? [
    ["选择合适的求助", "按语言、事项和距离查看请求。只接取你能完成的任务。"],
    ["协调见面", "接单后等待求助者确认，再按流程联系并开始工作。"],
    ["双方确认完成", "完成口译后确认结束，等待求助者也确认。"],
  ] : [
    ["Find a suitable request", "Check the language, category and distance. Accept work you can complete."],
    ["Coordinate the meeting", "After claiming, wait for the requester’s confirmation before arranging the work."],
    ["Confirm completion together", "Confirm when interpreting is finished. The requester confirms too."],
  ]) : (zh ? [
    ["描述你的需要", "选择一种语言、一个事项，并填写见面地点。"],
    ["查看请求进度", "打开请求，查看状态和接单口译员的信息。"],
    ["确认帮助已完成", "双方都确认完成后，请求才会结束。"],
  ] : [
    ["Tell us what you need", "Choose one language, one category and a clear meeting point."],
    ["Follow your request", "Open your request to check its status and the interpreter’s details."],
    ["Confirm the help is complete", "You and your interpreter both confirm to finish the request."],
  ]);
  const checklist = interpreter ? (zh ? ["了解事项背景和专业术语", "确认你能到达见面地点", "尊重隐私，只分享必要的信息", "一次只接取一项任务"] : ["Review the situation and relevant terminology", "Check that you can reach the meeting point", "Respect privacy and share only what is needed", "Take one assignment at a time"]) : (zh ? ["选择需要的语言", "选择医疗、学校等事项", "填写楼栋、柜台或附近地标", "准备帮助口译员理解情况的简短说明"] : ["The language you need help with", "A category, such as medical or school", "A building, counter or nearby landmark", "A short note to help the interpreter prepare"]);

  return <main id="main-content" className="mx-auto max-w-[1320px] px-5 py-8 sm:px-8 lg:px-12 lg:py-10">
    <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-(--khvi-teal)">{zh ? "欢迎回来" : "Welcome"}</p>
        <h1 className="mt-1 break-words text-2xl font-bold sm:text-3xl">{user.name}</h1>
      </div>
      <span className="inline-flex items-center gap-2 rounded-full border border-(--khvi-teal)/25 bg-(--khvi-surface) px-4 py-2 text-sm font-semibold">
        {interpreter ? <LanguageIcon aria-hidden="true" className="h-5 w-5 text-(--khvi-teal)" /> : <UserGroupIcon aria-hidden="true" className="h-5 w-5 text-(--khvi-teal)" />}
        {interpreter ? (zh ? "志愿口译员" : "Volunteer interpreter") : (zh ? "求助者" : "Requester")}
      </span>
    </div>

    <div className="grid gap-5 lg:grid-cols-[1.55fr_1fr]">
      <section className="flex flex-col items-start rounded-(--khvi-radius-lg) bg-(--khvi-navy) p-6 text-white sm:p-9">
        <span className="inline-flex items-center gap-2 text-sm font-semibold text-white/80"><LanguageIcon className="h-5 w-5" aria-hidden="true" />{zh ? "KHVI · 社区语言帮助" : "KHVI · Community language help"}</span>
        <h2 className="mt-6 max-w-lg text-3xl font-bold leading-tight sm:text-4xl">{interpreter ? (zh ? "用你的语言能力，帮助身边的人。" : "Help someone be understood.") : (zh ? "沟通有困难？从这里开始。" : "A little language help starts here.")}</h2>
        <p className="mt-4 max-w-lg text-base leading-7 text-white/80">{interpreter ? (zh ? "在这里了解接单流程，准备下一次志愿口译。" : "Get ready for your next volunteer assignment, with a clear guide to helping someone through an important conversation.") : (zh ? "告诉我们需要的语言、事项和见面地点，然后在同一个地方跟踪请求。" : "Tell us the language, situation and meeting point. Create your request and follow its progress in one place.")}</p>
        <div className="mt-7 flex flex-wrap gap-3">
          <Link href={interpreter ? "/find-requests#main-content" : "/request-help#main-content"} className={`${buttonClass} bg-white text-(--khvi-navy) hover:bg-(--khvi-paper)`}>
            {interpreter ? (zh ? "查找求助" : "Find requests") : (zh ? "创建求助请求" : "Create a help request")}
            <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
          </Link>
          <Link href={interpreter ? "/my-assignments#main-content" : "/my-requests#main-content"} className={`${buttonClass} border border-white/40 hover:bg-white/10`}>
            {interpreter ? (zh ? "我的任务" : "My assignments") : (zh ? "我的请求" : "My requests")}
          </Link>
        </div>
        <p className="mt-8 flex items-center gap-2 text-xs leading-5 text-white/70"><ShieldCheckIcon aria-hidden="true" className="h-4 w-4 shrink-0" />{zh ? "志愿服务，为更清楚的沟通提供帮助。" : "Volunteer support for clearer conversations."}</p>
      </section>

      <aside className={`${panelClass} p-6 sm:p-7`}>
        <span className="inline-flex h-11 w-11 items-center justify-center rounded-(--khvi-radius-sm) bg-(--khvi-teal)/10"><MapPinIcon aria-hidden="true" className="h-6 w-6 text-(--khvi-teal)" /></span>
        <h2 className="mt-4 text-xl font-bold">{interpreter ? (zh ? "附近的匹配请求" : "Matching requests nearby") : (zh ? "按你的时间安排" : "Help on your schedule")}</h2>
        {interpreter ? <>
          <span className="mt-4 inline-block rounded-full bg-(--khvi-sun)/20 px-3 py-1 text-xs font-semibold">{zh ? "即将开放" : "Coming soon"}</span>
          <p className="mt-4 text-sm leading-7 text-(--khvi-ink)/75">{zh ? "接单地图尚未开放。开放后，你可以按语言、事项和距离查看合适的求助。" : "The assignment map is not available yet. When it opens, you’ll be able to find requests by language, category and distance."}</p>
          <p className="mt-5 border-t border-(--khvi-teal)/20 pt-4 text-sm leading-6">{zh ? "目前不能从此页接单。" : "Accepting assignments is not available from this page yet."}</p>
        </> : <div className="mt-5 space-y-5">
          <div className="flex gap-3"><BoltIcon aria-hidden="true" className="mt-1 h-5 w-5 shrink-0 text-(--khvi-coral)" /><div><h3 className="text-sm font-bold">{zh ? "紧急求助" : "Need help soon"}</h3><p className="mt-1 text-sm leading-6 text-(--khvi-ink)/75">{zh ? "选择紧急求助。若 30 分钟内无人接单，请求将过期。" : "Choose Urgent. Your request expires after 30 minutes if no interpreter accepts."}</p></div></div>
          <div className="flex gap-3 border-t border-(--khvi-teal)/20 pt-5"><CalendarDaysIcon aria-hidden="true" className="mt-1 h-5 w-5 shrink-0 text-(--khvi-teal)" /><div><h3 className="text-sm font-bold">{zh ? "预约帮助" : "Plan a meeting"}</h3><p className="mt-1 text-sm leading-6 text-(--khvi-ink)/75">{zh ? "选择超过 30 分钟后、24 小时内的时间。" : "Choose a time more than 30 minutes ahead, within the next 24 hours."}</p></div></div>
        </div>}
      </aside>
    </div>

    {!interpreter && <section className="mt-9" aria-labelledby="recent-heading">
      <div className="flex flex-wrap items-end justify-between gap-3"><div><h2 id="recent-heading" className="text-xl font-bold">{zh ? "继续查看请求" : "Pick up where you left off"}</h2><p className="mt-1 text-sm text-(--khvi-ink)/65">{zh ? "此设备上保存的请求，进行中的优先显示。" : "Requests saved on this device, with active requests first."}</p></div><Link className="inline-flex min-h-11 items-center gap-2 text-sm font-bold underline underline-offset-4" href="/my-requests#main-content">{zh ? "查看全部" : "View all requests"}<ArrowRightIcon className="h-4 w-4" aria-hidden="true" /></Link></div>
      <div className={`${panelClass} mt-4 overflow-hidden`}>
        {!ready ? <p role="status" className="p-6">{zh ? "正在读取请求…" : "Loading requests…"}</p> : recent.length > 0 ? <ul className="divide-y divide-(--khvi-teal)/20">{recent.map((request) => <li key={request.requestId}><Link href={`/my-requests/${request.requestId}#main-content`} className="flex flex-wrap items-center justify-between gap-4 p-5 transition-colors hover:bg-(--khvi-paper) focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-(--khvi-sun)"><div><p className="text-xs text-(--khvi-ink)/65">#{request.requestId}</p><h3 className="mt-1 font-bold">{languageLabel(request.languageId, locale)} · {categoryLabel(request.categoryId, locale)}</h3><p className="mt-1 text-sm text-(--khvi-ink)/65">{request.scheduledAtLabel ? `${zh ? "预约" : "Appointment"}: ${request.scheduledAtLabel}` : request.createdAtLabel}</p></div><div className="flex items-center gap-3"><StatusBadge status={request.status} copyLocale={locale} /><ArrowRightIcon aria-hidden="true" className="h-5 w-5" /></div></Link></li>)}</ul> : <div className="flex flex-col items-start gap-4 p-6 sm:flex-row sm:items-center sm:p-7"><ClipboardDocumentListIcon className="h-10 w-10 shrink-0 text-(--khvi-teal)" aria-hidden="true" /><div className="flex-1"><h3 className="font-bold">{zh ? "准备好创建第一个请求了吗？" : "Ready for your first request?"}</h3><p className="mt-1 text-sm leading-6 text-(--khvi-ink)/70">{zh ? "创建请求后，你可以在这里查看进度。" : "Once you create a request, you can return here to follow its progress."}</p></div><Link href="/request-help#main-content" className={`${buttonClass} border border-(--khvi-teal)/30 hover:bg-(--khvi-paper)`}>{zh ? "开始" : "Get started"}<ArrowRightIcon className="h-4 w-4" aria-hidden="true" /></Link></div>}
      </div>
    </section>}

    <section id="welcome-steps" className="mt-10 scroll-mt-28" aria-labelledby="guide-heading">
      <p className="text-sm font-semibold text-(--khvi-teal)">{zh ? "一步一步开始" : "Know what comes next"}</p>
      <h2 id="guide-heading" className="mt-1 text-2xl font-bold">{interpreter ? (zh ? "你的接单指南" : "Your assignment guide") : (zh ? "从请求到完成" : "From request to conversation")}</h2>
      <ol className="mt-5 grid gap-6 border-y border-(--khvi-teal)/20 py-7 md:grid-cols-3">{steps.map(([title, body], index) => <li key={title} className="flex gap-4"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-(--khvi-teal)/15 text-sm font-bold">{index + 1}</span><div><h3 className="font-bold">{title}</h3><p className="mt-2 text-sm leading-6 text-(--khvi-ink)/75">{body}</p></div></li>)}</ol>
    </section>

    <div id="welcome-safety" className="mt-8 grid scroll-mt-28 gap-7 md:grid-cols-2">
      <section><h2 className="flex items-center gap-2 text-lg font-bold"><ClipboardDocumentListIcon className="h-5 w-5 text-(--khvi-teal)" aria-hidden="true" />{interpreter ? (zh ? "接单前的准备" : "Before you accept an assignment") : (zh ? "准备这些信息" : "A few things to have ready")}</h2><ul className="mt-4 space-y-3">{checklist.map((item) => <li className="flex gap-3 text-sm leading-6" key={item}><CheckCircleIcon aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-(--khvi-teal)" />{item}</li>)}</ul></section>
      <section className="rounded-(--khvi-radius-md) bg-(--khvi-sage)/10 p-6"><h2 className="flex items-center gap-2 text-lg font-bold"><ShieldCheckIcon className="h-5 w-5" aria-hidden="true" />{zh ? "照顾彼此的隐私" : "Look after each other’s privacy"}</h2><p className="mt-3 text-sm leading-7">{zh ? "只提供完成口译所需的信息。见面前确认对方身份和地点，并在沟通过程中尊重个人隐私。" : "Share only the information needed for interpreting. Confirm who you are meeting and where, and treat personal details with care."}</p><p className="mt-3 text-sm leading-7 text-(--khvi-ink)/75">{zh ? "若有紧急危险，请先联系当地紧急救援服务。" : "For immediate danger, contact local emergency services first."}</p></section>
    </div>
  </main>;
}
