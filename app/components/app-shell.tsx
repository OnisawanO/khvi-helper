"use client";

import { createContext, useContext, useEffect, type ReactNode } from "react";
import { isLocale, persistPreferredUiLanguage, resolveCopyLocale, useStoredLocale, type CopyLocale } from "@/app/lib/locale";
import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";
import { RequestNavigation } from "./request-navigation";
import type { Locale } from "./site-header";
import { createClient } from "@/utils/supabase/client";

export type WorkspaceRole = "User" | "Interpreter" | "Manager" | "Admin";

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
  es: {
    skip: "Saltar al contenido principal",
    header: {
      brandSubtitle: "Mapa de intérpretes comunitarios",
      languageLabel: "Idioma",
      signIn: "Iniciar sesión",
      primaryAction: "Crear solicitud",
      nav: [
        ["Nueva solicitud", "/request-help#main-content"],
        ["Mis solicitudes", "/my-requests#main-content"],
        ["Cómo funciona", "/#how-it-works"],
        ["Seguridad", "/#safety"],
      ],
    },
    footer: {
      description: "Una plataforma de ayuda lingüística basada en mapas para situaciones que requieren una comunicación clara y oportuna.",
      note: "Creado para una coordinación más segura",
      explore: "Explorar",
      safety: "Seguridad",
      needHelp: "¿Necesitas ayuda?",
      needHelpBody: "Crea una solicitud con el idioma, la categoría y el lugar donde necesitas ayuda.",
      footerCta: "Crear solicitud de ayuda",
      privacy: "Los datos sensibles permanecen ocultos hasta que el solicitante confirma al intérprete",
      links: { map: "Vista del mapa", how: "Cómo funciona", roles: "Roles", privacy: "Protección de datos", request: "Crear solicitud", signIn: "Iniciar sesión" },
    },
  },
  ar: {
    skip: "انتقل إلى المحتوى الرئيسي",
    header: {
      brandSubtitle: "خريطة المترجمين المتطوعين",
      languageLabel: "اللغة",
      signIn: "تسجيل الدخول",
      primaryAction: "إنشاء طلب",
      nav: [
        ["طلب جديد", "/request-help#main-content"],
        ["طلباتي", "/my-requests#main-content"],
        ["كيف يعمل النظام", "/#how-it-works"],
        ["الأمان", "/#safety"],
      ],
    },
    footer: {
      description: "منصة مساعدة لغوية تعتمد على الخرائط للمواقف التي تحتاج إلى تواصل واضح وسريع.",
      note: "مصممة لتنسيق أكثر أمانًا",
      explore: "استكشف",
      safety: "الأمان",
      needHelp: "هل تحتاج إلى مساعدة؟",
      needHelpBody: "ابدأ بإنشاء طلب يحدد اللغة والفئة والمكان الذي تحتاج فيه إلى المساعدة.",
      footerCta: "إنشاء طلب مساعدة",
      privacy: "تبقى التفاصيل الحساسة مخفية حتى يؤكد صاحب الطلب المترجم",
      links: { map: "معاينة الخريطة", how: "كيف يعمل النظام", roles: "الأدوار", privacy: "حماية البيانات", request: "إنشاء طلب", signIn: "تسجيل الدخول" },
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
export function AppShell({ children, accountActions, welcomeRole, accountRole }: {
  children: ReactNode;
  accountActions?: ReactNode;
  welcomeRole?: WorkspaceRole;
  accountRole?: WorkspaceRole;
}) {
  const [locale, setLocale] = useStoredLocale();

  useEffect(() => {
    let disposed = false;
    const supabase = createClient();

    const syncProfileLocale = async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;

      const { data } = await supabase
        .from("profiles")
        .select("preferred_ui_language")
        .eq("user_id", userData.user.id)
        .maybeSingle();
      const preferredLocale = data?.preferred_ui_language;

      if (!disposed && typeof preferredLocale === "string" && isLocale(preferredLocale)) {
        setLocale(preferredLocale);
      }
    };

    void syncProfileLocale();
    return () => {
      disposed = true;
    };
  }, [setLocale]);

  const handleLocaleChange = (nextLocale: Locale) => {
    setLocale(nextLocale);
    void persistPreferredUiLanguage(nextLocale).catch((error: unknown) => {
      console.error("Unable to persist preferred UI language", error);
    });
  };
  const copyLocale = resolveCopyLocale(locale);
  const t = locale === "th" ? {
    ...shellCopy.en,
    skip: "ข้ามไปเนื้อหาหลัก",
    header: { ...shellCopy.en.header, brandSubtitle: "แผนที่ล่ามจิตอาสา", languageLabel: "ภาษาหน้าจอ", signIn: "เข้าสู่ระบบ", primaryAction: "สร้างคำขอ" },
    footer: {
      description: "พื้นที่เชื่อมผู้ต้องการความช่วยเหลือด้านภาษากับล่ามจิตอาสา", note: "ประสานงานด้วยความเข้าใจ",
      explore: "สำรวจ", safety: "ความปลอดภัย", needHelp: "ต้องการความช่วยเหลือ?", needHelpBody: "ระบุภาษา หมวดหมู่ และสถานที่ที่ต้องการความช่วยเหลือ",
      footerCta: "สร้างคำขอความช่วยเหลือ", privacy: "ข้อมูลละเอียดเปิดตามขั้นตอนยืนยันล่าม",
      links: { map: "แผนที่ตัวอย่าง", how: "ขั้นตอนใช้งาน", roles: "บทบาท", privacy: "ความเป็นส่วนตัว", request: "สร้างคำขอ", signIn: "เข้าสู่ระบบ" },
    },
  } : shellCopy[locale];
  const navLabel = (th: string, en: string, zh: string, es: string, ar: string) => locale === "th" ? th : locale === "zh" ? zh : locale === "es" ? es : locale === "ar" ? ar : en;
  const isInterpreterAccount = accountRole === "Interpreter" || welcomeRole === "Interpreter";
  const welcomeNav = welcomeRole === "Interpreter"
    ? [[navLabel("ค้นหางาน", "Find requests", "寻找求助", "Buscar solicitudes", "البحث عن الطلبات"), "/find-requests#main-content"], [navLabel("งานของฉัน", "My assignments", "我的任务", "Mis asignaciones", "مهامي"), "/my-assignments#main-content"]] as const
    : welcomeRole === "Manager"
      ? [[navLabel("คอนโซลผู้จัดการ", "Manager console", "管理台", "Consola del gestor", "لوحة المدير"), "/manager#main-content"], [navLabel("โปรไฟล์และการตั้งค่า", "Profile & Settings", "个人资料与设置", "Perfil y configuración", "الملف الشخصي والإعدادات"), "/profile#main-content"]] as const
      : welcomeRole === "Admin"
        ? [[navLabel("แดชบอร์ดผู้ดูแล", "Admin dashboard", "管理员面板", "Panel de administración", "لوحة المسؤول"), "/admin#main-content"], [navLabel("โปรไฟล์และการตั้งค่า", "Profile & Settings", "个人资料与设置", "Perfil y configuración", "الملف الشخصي والإعدادات"), "/profile#main-content"]] as const
        : isInterpreterAccount
          ? [[navLabel("สร้างคำขอ", "New request", "新建求助", "Nueva solicitud", "طلب جديد"), "/request-help#main-content"], [navLabel("คำขอทั้งหมด", "All requests", "全部求助", "Todas las solicitudes", "كل الطلبات"), "/my-requests#main-content"]] as const
          : [
              [navLabel("สร้างคำขอ", "New request", "新建求助", "Nueva solicitud", "طلب جديد"), "/request-help#main-content"],
              [navLabel("คำขอทั้งหมด", "All requests", "全部求助", "Todas las solicitudes", "كل الطلبات"), "/my-requests#main-content"],
              [navLabel("สมัครล่ามอาสา", "Volunteer apply", "申请志愿口译员", "Solicitud de voluntariado", "طلب التطوع"), "/volunteer/apply#main-content"],
            ] as const;

  return (
    <UiLocaleContext.Provider value={locale}><CopyLocaleContext.Provider value={copyLocale}>
      <a className="skip-link" href="#main-content">
        {t.skip}
      </a>
      <SiteHeader
        copy={welcomeRole ? { ...t.header, nav: welcomeNav } : t.header}
        locale={locale}
        onLocaleChange={handleLocaleChange}
        accountActions={accountActions}
        workspaceRole={welcomeRole}
      />
      <RequestNavigation />
      {children}
      <SiteFooter copy={t.footer} brandSubtitle={t.header.brandSubtitle} workspace={Boolean(welcomeRole)} />
    </CopyLocaleContext.Provider></UiLocaleContext.Provider>
  );
}
