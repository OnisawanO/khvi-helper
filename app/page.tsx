"use client";

import { useEffect, useState, type ComponentType, type SVGProps } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarDaysIcon,
  CheckBadgeIcon,
  CheckCircleIcon,
  ClockIcon,
  DocumentCheckIcon,
  ExclamationTriangleIcon,
  LanguageIcon,
  LockClosedIcon,
  MapPinIcon,
  ShieldCheckIcon,
  UserCircleIcon,
  UserGroupIcon,
  UserPlusIcon,
} from "@heroicons/react/24/outline";
import { SiteFooter } from "./components/site-footer";
import { SiteHeader, type Locale } from "./components/site-header";
import { resolveCopyLocale, useStoredLocale } from "./lib/locale";
import { getMockUserSession } from "./lib/mock-auth";
import { RegisterModal } from "./register/register-modal";
import { LoginModal } from "./login/login-modal";

type Icon = ComponentType<SVGProps<SVGSVGElement>>;
type RequestCardContent = {
  title: string;
  meta: string;
  location: string;
  action: string;
  tone: "urgent" | "scheduled";
};

const copy = {
  en: {
    skip: "Skip to main content",
    header: {
      brandSubtitle: "Community interpreter map",
      languageLabel: "Language",
      signIn: "Sign in",
      primaryAction: "Create pin",
      nav: [
        ["Map preview", "#map-preview"],
        ["How it works", "#how-it-works"],
        ["Safety", "#safety"],
        ["Roles", "#roles"],
      ],
    },
    hero: {
      label: "Map-based volunteer interpreter platform",
      title: "Language help nearby, when communication cannot wait",
      body: "Create a help request pin, choose one language and one category, and let approved volunteer interpreters nearby claim the job.",
      primaryCta: "Create a help request pin",
      secondaryCta: "Apply as interpreter",
      statusTitle: "Job status",
    },
    statuses: ["Open", "Claimed", "In progress", "Completed"],
    filters: ["Chinese", "English", "Medical", "Police station", "Within 5 km"],
    mapLabels: ["Bang Rak", "Din Daeng", "Khlong Toei"],
    mapCard: {
      title: "Matched job near you",
      meta: "Medical · Chinese · within 5 km from an approximate location",
      privacy: "Exact contact details and location unlock after claim",
      action: "Claim job",
    },
    featureBand: [
      "Match by language and category, instead of asking one interpreter at a time",
      "Protect exact location and contact details until a job is claimed",
      "Support urgent jobs and same-day scheduled requests",
    ],
    mapSection: {
      label: "Map workflow preview",
      title: "One pin goes to every approved interpreter who matches the request",
      body: "The platform reduces waiting time by pooling each request for qualified interpreters, while still hiding sensitive details until someone claims the job.",
      cards: [
        {
          title: "Urgent request",
          meta: "Medical · Chinese",
          location: "Approximate location only",
          action: "Waiting 03:42",
          tone: "urgent",
        },
        {
          title: "Today appointment",
          meta: "Police station · English",
          location: "Scheduled 14:30",
          action: "View details",
          tone: "scheduled",
        },
      ],
    },
    how: {
      label: "How it works",
      title: "Four steps both sides can understand",
      steps: [
        {
          title: "Create a request pin",
          description: "The requester chooses one language, one category, a short description, and the help location.",
        },
        {
          title: "Matched interpreters see it",
          description: "Only approved interpreters with the matching language and category can see the open pin.",
        },
        {
          title: "Details unlock after claim",
          description: "Before claim, only a rough area is visible. After claim, exact location and contact details are shown.",
        },
        {
          title: "Both sides confirm completion",
          description: "The job is completed only when the requester and interpreter both confirm the work is done.",
        },
      ],
    },
    safety: {
      label: "Data safety",
      title: "Reveal only what is needed, when it is needed",
      body: "The landing page should make it clear that exact location and contact details are not visible to everyone from the start.",
      items: [
        {
          title: "Interpreter approval first",
          description: "A Manager or Admin reviews the application before a user becomes an interpreter.",
        },
        {
          title: "Approximate map location",
          description: "The map shows only language, category, and a rough area before the job is claimed.",
        },
        {
          title: "Single successful claim",
          description: "Claiming should be atomic so one open pin can be accepted by only one interpreter.",
        },
      ],
    },
    roles: {
      label: "System roles",
      title: "Each role has a clear job",
      action: "Sign in to open your workspace",
      cards: [
        {
          role: "Requester",
          detail: "Creates requests, tracks job status, and sees interpreter contact details after a claim.",
        },
        {
          role: "Volunteer interpreter",
          detail: "Applies, waits for approval, sees matched nearby jobs, and claims suitable requests.",
        },
        {
          role: "Manager / Admin",
          detail: "Reviews interpreter applications, manages roles, and keeps the platform trustworthy.",
        },
      ],
    },
    footer: {
      description: "A map-based language help platform for situations where communication needs to be clear and timely.",
      note: "Built for safer coordination",
      explore: "Explore",
      safety: "Safety",
      needHelp: "Need help?",
      needHelpBody: "Start by creating a request pin with the language, category, and location where help is needed.",
      footerCta: "Create a help request pin",
      privacy: "Sensitive details stay hidden until a job is claimed",
      links: {
        map: "Map preview",
        how: "How it works",
        roles: "Roles",
        privacy: "Data protection",
        request: "Create request",
        signIn: "Sign in",
      },
    },
  },
  zh: {
    skip: "跳到主要内容",
    header: {
      brandSubtitle: "社区口译地图",
      languageLabel: "语言",
      signIn: "登录",
      primaryAction: "创建求助点",
      nav: [
        ["地图预览", "#map-preview"],
        ["使用流程", "#how-it-works"],
        ["安全机制", "#safety"],
        ["系统角色", "#roles"],
      ],
    },
    hero: {
      label: "基于地图的志愿口译平台",
      title: "需要沟通时，快速找到附近语言帮助",
      body: "创建求助点，选择一种语言和一个类别，让附近已审核的志愿口译员接取任务。",
      primaryCta: "创建语言求助点",
      secondaryCta: "申请成为口译员",
      statusTitle: "任务状态",
    },
    statuses: ["开放中", "已接取", "进行中", "已完成"],
    filters: ["中文", "英语", "医疗", "警察局", "5 公里内"],
    mapLabels: ["邦拉", "丁登", "空堤"],
    mapCard: {
      title: "附近匹配任务",
      meta: "医疗 · 中文 · 距大致位置 5 公里内",
      privacy: "接取任务后解锁准确联系方式和位置",
      action: "接取任务",
    },
    featureBand: [
      "按语言和类别匹配，不必逐个联系口译员",
      "任务被接取前保护准确位置和联系方式",
      "支持紧急求助和当天预约任务",
    ],
    mapSection: {
      label: "地图流程预览",
      title: "一个求助点会展示给所有符合条件的已审核口译员",
      body: "平台把每个请求放入任务池，减少等待时间，同时在任务被接取前隐藏敏感信息。",
      cards: [
        {
          title: "紧急求助",
          meta: "医疗 · 中文",
          location: "仅显示大致位置",
          action: "等待 03:42",
          tone: "urgent",
        },
        {
          title: "今日预约",
          meta: "警察局 · 英语",
          location: "预约 14:30",
          action: "查看详情",
          tone: "scheduled",
        },
      ],
    },
    how: {
      label: "使用流程",
      title: "双方都能理解的四个步骤",
      steps: [
        {
          title: "创建求助点",
          description: "求助者选择一种语言、一个类别，填写简短说明，并标记需要帮助的位置。",
        },
        {
          title: "符合条件的口译员可见",
          description: "只有通过审核且语言和类别匹配的口译员，才能看到开放中的求助点。",
        },
        {
          title: "接取后解锁详细信息",
          description: "接取前只显示大致区域；接取后显示准确位置和联系方式。",
        },
        {
          title: "双方确认完成",
          description: "只有求助者和口译员都确认完成后，任务才会变为已完成。",
        },
      ],
    },
    safety: {
      label: "数据安全",
      title: "只在必要的时候展示必要的信息",
      body: "首页应清楚说明，准确位置和联系方式不会从一开始就对所有人公开。",
      items: [
        {
          title: "口译员先通过审核",
          description: "Manager 或 Admin 审核申请后，用户才会成为口译员。",
        },
        {
          title: "地图只显示大致位置",
          description: "任务被接取前，地图只显示语言、类别和大致区域。",
        },
        {
          title: "一次任务只能成功接取一次",
          description: "接取流程应采用原子操作，确保一个开放求助点只能被一名口译员接取。",
        },
      ],
    },
    roles: {
      label: "系统角色",
      title: "每个角色都有清楚的职责",
      action: "登录并打开你的工作区",
      cards: [
        {
          role: "求助者",
          detail: "创建请求、跟踪任务状态，并在任务被接取后查看口译员联系方式。",
        },
        {
          role: "志愿口译员",
          detail: "提交申请、等待审核、查看附近匹配任务，并接取合适的请求。",
        },
        {
          role: "Manager / Admin",
          detail: "审核口译员申请、管理角色，并维护平台可信度。",
        },
      ],
    },
    footer: {
      description: "一个基于地图的语言求助平台，服务于需要清晰、及时沟通的场景。",
      note: "为更安全的协作而设计",
      explore: "探索",
      safety: "安全",
      needHelp: "需要帮助？",
      needHelpBody: "从创建求助点开始，填写所需语言、类别和需要帮助的位置。",
      footerCta: "创建语言求助点",
      privacy: "敏感信息会在任务被接取前保持隐藏",
      links: {
        map: "地图预览",
        how: "使用流程",
        roles: "系统角色",
        privacy: "数据保护",
        request: "创建请求",
        signIn: "登录",
      },
    },
  },
} as const;

const statusTone = ["bg-[#f04f3e] text-white", "bg-white text-[#18384a]", "bg-white text-[#18384a]", "bg-[#e6f4ef] text-[#087557]"] as const;
const stepIcons = [MapPinIcon, LanguageIcon, LockClosedIcon, CheckCircleIcon] as const;
const safetyIcons = [CheckBadgeIcon, ShieldCheckIcon, DocumentCheckIcon] as const;
const roleIcons = [UserCircleIcon, UserGroupIcon, ShieldCheckIcon] as const;

function IconFrame({ icon: IconComponent, className = "" }: { icon: Icon; className?: string }) {
  return (
    <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${className}`}>
      <IconComponent aria-hidden="true" className="h-6 w-6" />
    </span>
  );
}

function StatusFlow({ labels, title }: { labels: readonly string[]; title: string }) {
  return (
    <div className="mt-7">
      <p className="text-sm font-bold text-[#294554]">{title}</p>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {labels.map((label, index) => (
          <div key={label} className="flex items-center gap-2">
            <span className={`rounded-lg border border-[#d7e0e5] px-3 py-2 text-xs font-extrabold shadow-sm ${statusTone[index]}`}>
              {label}
            </span>
            {index < labels.length - 1 && <span className="text-[#9aa9ae]">/</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

function MapPin({ className = "", sos = false }: { className?: string; sos?: boolean }) {
  return (
    <div className={`absolute ${className}`}>
      <div
        className={`relative flex h-12 w-12 items-center justify-center rounded-full border-[5px] border-white shadow-[0_12px_22px_rgba(23,54,70,0.2)] ${
          sos ? "bg-[#f04f3e]" : "bg-[#087f80]"
        }`}
      >
        {sos ? (
          <ExclamationTriangleIcon aria-hidden="true" className="h-5 w-5 text-white" />
        ) : (
          <UserCircleIcon aria-hidden="true" className="h-5 w-5 text-white" />
        )}
        <span className={`absolute -bottom-2 h-4 w-4 rotate-45 rounded-[3px] ${sos ? "bg-[#f04f3e]" : "bg-[#087f80]"}`} />
      </div>
    </div>
  );
}

function MapPreview({ locale }: { locale: Locale }) {
  const t = copy[resolveCopyLocale(locale)];

  return (
    <div className="landing-map relative min-h-[520px] overflow-hidden border border-[#d8e1e6] bg-[#eef4f6] shadow-[0_18px_45px_rgba(20,55,72,0.12)]">
      <div className="absolute left-5 right-5 top-5 z-10 flex flex-wrap gap-2">
        {t.filters.map((filter) => (
          <span key={filter} className="rounded-lg border border-[#d8e4e7] bg-white/90 px-3 py-2 text-xs font-extrabold text-[#1d3b46] shadow-sm backdrop-blur">
            {filter}
          </span>
        ))}
      </div>

      <div className="absolute left-[30%] top-[24%] h-[310px] w-[310px] rounded-full border border-dashed border-[#f04f3e] bg-[#f04f3e]/10" />
      <div className="absolute left-[39%] top-[41%] z-10 flex h-24 w-24 items-center justify-center rounded-full border-[10px] border-white bg-[#f04f3e] text-xl font-extrabold text-white shadow-[0_18px_30px_rgba(240,79,62,0.28)]">
        SOS
      </div>
      <MapPin className="left-[17%] top-[28%]" sos />
      <MapPin className="left-[71%] top-[23%]" />
      <MapPin className="left-[73%] top-[60%]" sos />
      <MapPin className="left-[23%] top-[67%]" />
      <MapPin className="left-[58%] top-[70%]" />

      <div className="absolute left-[12%] top-[18%] rounded-lg bg-white/80 px-3 py-1.5 text-xs font-bold text-[#65757b] shadow-sm">{t.mapLabels[0]}</div>
      <div className="absolute right-[16%] top-[36%] rounded-lg bg-white/80 px-3 py-1.5 text-xs font-bold text-[#65757b] shadow-sm">{t.mapLabels[1]}</div>
      <div className="absolute bottom-[18%] left-[44%] rounded-lg bg-white/80 px-3 py-1.5 text-xs font-bold text-[#65757b] shadow-sm">{t.mapLabels[2]}</div>

      <div className="absolute bottom-5 left-5 right-5 z-10 border border-[#d8e1e6] bg-white/95 p-4 shadow-[0_14px_28px_rgba(20,55,72,0.12)] backdrop-blur">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <IconFrame icon={UserCircleIcon} className="bg-[#e6f4ef] text-[#087557]" />
            <div>
              <p className="text-base font-extrabold text-[#173646]">{t.mapCard.title}</p>
              <p className="mt-1 text-sm text-[#66777d]">{t.mapCard.meta}</p>
              <p className="mt-2 flex items-center gap-2 text-xs font-bold text-[#73848a]">
                <LockClosedIcon aria-hidden="true" className="h-4 w-4" />
                {t.mapCard.privacy}
              </p>
            </div>
          </div>
          <a className="inline-flex h-12 shrink-0 items-center justify-center rounded-lg bg-[#087f80] px-6 text-sm font-extrabold text-white shadow-[0_10px_18px_rgba(8,127,128,0.2)] transition-colors hover:bg-[#096f70]" href="/request-help#main-content">
            {t.mapCard.action}
          </a>
        </div>
      </div>
    </div>
  );
}

function RequestCard({ card, icon: IconComponent }: { card: RequestCardContent; icon: Icon }) {
  const isUrgent = card.tone === "urgent";

  return (
    <article className={`border p-4 ${isUrgent ? "border-[#f6b8ae] bg-[#fff6f4]" : "border-[#f0c98f] bg-[#fffbf4]"}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <IconFrame icon={IconComponent} className={isUrgent ? "bg-[#f04f3e] text-white" : "bg-[#fff1d8] text-[#b5680b]"} />
          <div>
            <h3 className="text-base font-extrabold text-[#173646]">{card.title}</h3>
            <p className="mt-1 text-sm text-[#66777d]">{card.meta}</p>
          </div>
        </div>
        <span className={`rounded-lg px-3 py-1.5 text-xs font-extrabold ${isUrgent ? "bg-[#f04f3e] text-white" : "bg-[#f7d99e] text-[#6b3b08]"}`}>
          {card.action}
        </span>
      </div>
      <p className="mt-4 flex items-center gap-2 text-sm text-[#52676f]">
        <MapPinIcon aria-hidden="true" className="h-5 w-5 text-[#087f80]" />
        {card.location}
      </p>
    </article>
  );
}

export default function Home() {
  const router = useRouter();
  const [locale, setLocale] = useStoredLocale();
  const t = copy[resolveCopyLocale(locale)];
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isSignInOpen, setIsSignInOpen] = useState(false);

  useEffect(() => {
    if (getMockUserSession()) {
      router.replace("/welcome");
      return;
    }

    const checkUrl = () => {
      const params = new URLSearchParams(window.location.search);
      if (params.get("register") === "true" || window.location.hash === "#register") {
        queueMicrotask(() => {
          setIsRegisterOpen(true);
          setIsSignInOpen(false);
        });
      } else if (
        params.get("signin") === "true" ||
        params.get("login") === "true" ||
        window.location.hash === "#signin" ||
        window.location.hash === "#login"
      ) {
        queueMicrotask(() => {
          setIsSignInOpen(true);
          setIsRegisterOpen(false);
        });
      }
    };

    checkUrl();
    window.addEventListener("hashchange", checkUrl);
    return () => window.removeEventListener("hashchange", checkUrl);
  }, [router]);

  return (
    <main id="top" className="min-h-screen bg-[#f7f9fa] text-[#10283a]">
      <a className="skip-link" href="#main-content">
        {t.skip}
      </a>
      <SiteHeader
        copy={t.header}
        locale={locale}
        onLocaleChange={setLocale}
        onOpenRegister={() => {
          setIsRegisterOpen(true);
          setIsSignInOpen(false);
        }}
        onOpenSignIn={() => {
          setIsSignInOpen(true);
          setIsRegisterOpen(false);
        }}
      />

      <section id="main-content" className="mx-auto grid max-w-[1440px] scroll-mt-24 gap-8 px-5 pb-10 pt-8 sm:px-8 lg:grid-cols-[0.76fr_1.24fr] lg:items-center lg:px-12 lg:py-12">
        <div>
          <p className="max-w-fit rounded-lg border border-[#b9d9d6] bg-[#edf7f5] px-3 py-2 text-sm font-extrabold text-[#087f80]">
            {t.hero.label}
          </p>
          <h1 className="mt-6 max-w-[680px] text-[clamp(2.2rem,4.8vw,4.35rem)] font-extrabold leading-[1.12] tracking-normal text-[#122b3e]">
            {t.hero.title}
          </h1>
          <p className="mt-6 max-w-[560px] text-base leading-8 text-[#53656c] sm:text-lg">
            {t.hero.body}
          </p>
          <div className="mt-8 flex max-w-[430px] flex-col gap-3">
            <a className="flex min-h-14 flex-1 items-center justify-center gap-2 rounded-lg bg-[#f04f3e] px-4 py-3 text-center text-[13px] font-extrabold leading-5 text-white shadow-[0_10px_20px_rgba(240,79,62,0.22)] transition-colors hover:bg-[#d94334] sm:px-5 sm:text-sm" href="/request-help#main-content">
              <MapPinIcon aria-hidden="true" className="h-5 w-5" />
              {t.hero.primaryCta}
            </a>
            <div className="flex gap-2">
              <a className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-lg border-2 border-[#087f80] px-3 py-2 text-center text-xs font-extrabold leading-5 text-[#087f80] transition-colors hover:bg-[#edf7f5] sm:px-4 sm:text-sm" href="/volunteer/apply">
                <UserGroupIcon aria-hidden="true" className="h-4 w-4 shrink-0" />
                {t.hero.secondaryCta}
              </a>
              <button
                type="button"
                onClick={() => setIsRegisterOpen(true)}
                className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-lg border border-[#cbd7dc] bg-white px-3 py-2 text-center text-xs font-extrabold leading-5 text-[#173646] shadow-xs transition-colors hover:border-[#087f80] hover:text-[#087f80] hover:bg-[#edf7f5] sm:px-4 sm:text-sm"
              >
                <UserPlusIcon aria-hidden="true" className="h-4 w-4 shrink-0 text-[#0d8587]" />
                {locale === "zh" ? "注册账号" : "สมัครสมาชิก"}
              </button>
            </div>
          </div>
          <StatusFlow labels={t.statuses} title={t.hero.statusTitle} />
        </div>

        <MapPreview locale={locale} />
      </section>

      <section className="border-y border-[#dbe3e7] bg-white px-5 py-5 sm:px-8 lg:px-12">
        <div className="mx-auto grid max-w-[1320px] gap-3 md:grid-cols-3">
          {t.featureBand.map((feature, index) => {
            const icons = [LanguageIcon, LockClosedIcon, ClockIcon] as const;
            const IconComponent = icons[index];
            const tone = index === 1 ? "bg-[#f4f7fa] text-[#173646]" : index === 2 ? "bg-[#fff4df] text-[#b5680b]" : "bg-[#edf7f5] text-[#087f80]";

            return (
              <div key={feature} className="flex items-center gap-3 border-[#e3ebef] py-2 md:border-r md:px-6 first:md:pl-0 last:md:border-r-0 last:md:pr-0">
                <IconFrame icon={IconComponent} className={tone} />
                <p className="text-sm font-bold text-[#294554]">{feature}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section id="map-preview" className="mx-auto grid max-w-[1320px] gap-6 px-5 py-12 sm:px-8 lg:grid-cols-[1fr_0.72fr] lg:px-12">
        <div>
          <p className="text-sm font-extrabold text-[#087f80]">{t.mapSection.label}</p>
          <h2 className="mt-2 max-w-2xl text-3xl font-extrabold tracking-normal text-[#153447] sm:text-4xl">
            {t.mapSection.title}
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-[#64777e]">
            {t.mapSection.body}
          </p>
        </div>
        <div className="grid gap-3">
          {t.mapSection.cards.map((card, index) => (
            <RequestCard key={card.title} card={card} icon={index === 0 ? ExclamationTriangleIcon : CalendarDaysIcon} />
          ))}
        </div>
      </section>

      <section id="how-it-works" className="border-y border-[#dbe3e7] bg-[#edf2f4] px-5 py-12 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-[1320px]">
          <div className="max-w-2xl">
            <p className="text-sm font-extrabold text-[#087f80]">{t.how.label}</p>
            <h2 className="mt-2 text-3xl font-extrabold tracking-normal text-[#153447] sm:text-4xl">
              {t.how.title}
            </h2>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {t.how.steps.map((step, index) => (
              <article key={step.title} className="border border-[#d6e0e4] bg-white p-5">
                <div className="flex items-center justify-between gap-4">
                  <IconFrame icon={stepIcons[index]} className="bg-[#edf7f5] text-[#087f80]" />
                  <span className="text-sm font-extrabold text-[#88989d]">{index + 1}</span>
                </div>
                <h3 className="mt-5 text-lg font-extrabold text-[#203d4d]">{step.title}</h3>
                <p className="mt-3 text-sm leading-7 text-[#64777e]">{step.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="safety" className="bg-[#082f45] px-5 py-12 text-white sm:px-8 lg:px-12">
        <div className="mx-auto grid max-w-[1320px] gap-8 lg:grid-cols-[0.78fr_1.22fr] lg:items-start">
          <div>
            <p className="text-sm font-extrabold text-[#8ed5c4]">{t.safety.label}</p>
            <h2 className="mt-2 text-3xl font-extrabold tracking-normal sm:text-4xl">{t.safety.title}</h2>
            <p className="mt-4 max-w-md text-sm leading-7 text-white/75">
              {t.safety.body}
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {t.safety.items.map((item, index) => (
              <article key={item.title} className="border border-white/12 bg-white/10 p-5">
                <IconFrame icon={safetyIcons[index]} className="bg-white text-[#087f80]" />
                <h3 className="mt-5 text-base font-extrabold">{item.title}</h3>
                <p className="mt-3 text-sm leading-6 text-white/72">{item.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="roles" className="px-5 py-12 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-[1320px]">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-extrabold text-[#087f80]">{t.roles.label}</p>
              <h2 className="mt-2 text-3xl font-extrabold tracking-normal text-[#153447] sm:text-4xl">{t.roles.title}</h2>
            </div>
            <button
              type="button"
              onClick={() => {
                setIsSignInOpen(true);
                setIsRegisterOpen(false);
              }}
              className="inline-flex h-11 items-center justify-center rounded-lg border border-[#cbd7dc] bg-white px-4 text-sm font-extrabold text-[#173646] transition-colors hover:border-[#087f80] hover:text-[#087f80] cursor-pointer"
            >
              {t.roles.action}
            </button>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {t.roles.cards.map((card, index) => (
              <article key={card.role} className="border border-[#d6e0e4] bg-white p-5">
                <IconFrame icon={roleIcons[index]} className="bg-[#edf7f5] text-[#087f80]" />
                <h3 className="mt-5 text-lg font-extrabold text-[#203d4d]">{card.role}</h3>
                <p className="mt-3 text-sm leading-7 text-[#64777e]">{card.detail}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <RegisterModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        onSwitchToSignIn={() => {
          setIsRegisterOpen(false);
          setIsSignInOpen(true);
        }}
      />

      <LoginModal
        isOpen={isSignInOpen}
        onClose={() => setIsSignInOpen(false)}
        onSwitchToRegister={() => {
          setIsSignInOpen(false);
          setIsRegisterOpen(true);
        }}
      />

      <SiteFooter copy={t.footer} brandSubtitle={t.header.brandSubtitle} />
    </main>
  );
}
