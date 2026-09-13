"use client";

import { createContext, useContext, type ReactNode } from "react";
import { resolveCopyLocale, useStoredLocale, type CopyLocale } from "@/app/lib/locale";
import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";
import { RequestNavigation } from "./request-navigation";
import type { Locale } from "./site-header";

const shellCopy = {
  en: {
    skip: "Skip to main content",
    header: {
      brandSubtitle: "Community interpreter map",
      languageLabel: "Language",
      signIn: "Sign in",
      primaryAction: "Create pin",
      nav: [
        ["New request", "/request-help#main-content"],
        ["My requests", "/my-requests#main-content"],
        ["How it works", "/#how-it-works"],
        ["Safety", "/#safety"],
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
      privacy: "Sensitive details stay hidden until the requester confirms the interpreter",
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
        ["新建求助", "/request-help#main-content"],
        ["我的求助", "/my-requests#main-content"],
        ["使用流程", "/#how-it-works"],
        ["安全机制", "/#safety"],
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
      privacy: "敏感信息会在求助者确认口译员前保持隐藏",
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

const CopyLocaleContext = createContext<CopyLocale>("en");
const UiLocaleContext = createContext<Locale>("en");
export function useUiLocale() { return useContext(UiLocaleContext); }

/** Read the header locale from inside any client component rendered under AppShell. */
export function useCopyLocale(): CopyLocale {
  return useContext(CopyLocaleContext);
}

/**
 * Shared chrome for the signed-in request routes: skip link, header with the
 * language switcher, and the site footer. Pages render their own `<main>` so the
 * skip link keeps working.
 */
export function AppShell({ children, accountActions, welcomeRole }: {
  children: ReactNode;
  accountActions?: ReactNode;
  welcomeRole?: "User" | "Interpreter";
}) {
  const [locale, setLocale] = useStoredLocale();
  const copyLocale = resolveCopyLocale(locale);
  const t = locale === "th" && welcomeRole ? {
    ...shellCopy.en,
    skip: "ข้ามไปเนื้อหาหลัก",
    header: { ...shellCopy.en.header, brandSubtitle: "แผนที่ล่ามจิตอาสา", languageLabel: "ภาษาหน้าจอ", signIn: "เข้าสู่ระบบ", primaryAction: "สร้างคำขอ" },
    footer: {
      description: "พื้นที่เชื่อมผู้ต้องการความช่วยเหลือด้านภาษากับล่ามจิตอาสา", note: "ประสานงานด้วยความเข้าใจ",
      explore: "สำรวจ", safety: "ความปลอดภัย", needHelp: "ต้องการความช่วยเหลือ?", needHelpBody: "ระบุภาษา หมวดหมู่ และสถานที่ที่ต้องการความช่วยเหลือ",
      footerCta: "สร้างคำขอความช่วยเหลือ", privacy: "ข้อมูลละเอียดเปิดตามขั้นตอนยืนยันล่าม",
      links: { map: "แผนที่ตัวอย่าง", how: "ขั้นตอนใช้งาน", roles: "บทบาท", privacy: "ความเป็นส่วนตัว", request: "สร้างคำขอ", signIn: "เข้าสู่ระบบ" },
    },
  } : shellCopy[copyLocale];
  const navLabel = (th: string, en: string, zh: string) => locale === "th" ? th : copyLocale === "zh" ? zh : en;
  const welcomeNav = welcomeRole === "Interpreter"
    ? [[navLabel("ค้นหางาน", "Find requests", "寻找求助"), "/find-requests#main-content"], [navLabel("งานของฉัน", "My assignments", "我的任务"), "/my-assignments#main-content"]] as const
    : [[navLabel("สร้างคำขอ", "New request", "新建求助"), "/request-help#main-content"], [navLabel("คำขอของฉัน", "My requests", "我的求助"), "/my-requests#main-content"]] as const;

  return (
    <UiLocaleContext.Provider value={locale}><CopyLocaleContext.Provider value={copyLocale}>
      <a className="skip-link" href="#main-content">
        {t.skip}
      </a>
      <SiteHeader
        copy={welcomeRole ? { ...t.header, nav: welcomeNav } : t.header}
        locale={locale}
        onLocaleChange={setLocale}
        accountActions={accountActions}
        workspaceRole={welcomeRole}
      />
      <RequestNavigation />
      {children}
      <SiteFooter copy={t.footer} brandSubtitle={t.header.brandSubtitle} workspace={Boolean(welcomeRole)} />
    </CopyLocaleContext.Provider></UiLocaleContext.Provider>
  );
}
