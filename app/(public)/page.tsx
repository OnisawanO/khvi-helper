"use client";

import { useEffect, useState, type ComponentType, type SVGProps } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  BellAlertIcon,
  BuildingLibraryIcon,
  ClockIcon,
  GlobeAltIcon,
  HeartIcon,
  ShieldCheckIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";
import { SiteFooter } from "@/app/components/site-footer";
import { SiteHeader } from "@/app/components/site-header";
import { ResponsiveHeroImage } from "@/app/components/responsive-hero-image";
import { RegisterModal } from "@/app/components/auth/register-modal";
import { LoginModal } from "@/app/components/auth/login-modal";
import { useStoredLocale } from "@/app/lib/locale";
import { getRedirectPathByRole, type UserProfile } from "@/app/lib/mock-auth";
import { getCurrentUserProfile } from "@/app/lib/supabase-auth";
import { createClient } from "@/utils/supabase/client";

type Icon = ComponentType<SVGProps<SVGSVGElement>>;

const landingCopy = {
  th: {
    skip: "ข้ามไปเนื้อหาหลัก",
    header: {
      brandSubtitle: "เชื่อมคน เชื่อมภาษา เพื่อสังคมที่เท่าเทียม",
      languageLabel: "ภาษาหน้าจอ",
      signIn: "เข้าสู่ระบบ",
      primaryAction: "ขอความช่วยเหลือ",
      nav: [["เกี่ยวกับเรา", "#about"], ["สำหรับอาสาสมัคร", "/welcome#volunteer-application"], ["ข่าวสาร", "#community"]],
    },
    hero: {
      lead: "สื่อสารได้",
      accent: "ช่วยได้",
      body: "เพราะทุกคนมีสิทธิ์ในการสื่อสาร KHVI Helper เชื่อมโยงอาสาสมัครล่าม เพื่อช่วยเหลือผู้ที่ต้องการความช่วยเหลือด้านภาษาในสถานการณ์ฉุกเฉินและในชีวิตประจำวัน",
      action: "ขอความช่วยเหลือ",
      note: "แจ้งความต้องการล่าม ได้อย่างรวดเร็ว ปลอดภัย และฟรี",
      imageAlt: "ล่ามอาสากำลังช่วยผู้สูงอายุสื่อสารผ่านแท็บเล็ต",
    },
    trust: [
      { title: "ปลอดภัย น่าเชื่อถือ", detail: "ตรวจสอบอาสาสมัครทุกคน" },
      { title: "อาสาสมัครทั่วประเทศ", detail: "หลากหลายภาษา พร้อมช่วยเหลือ" },
      { title: "รวดเร็ว ทันเหตุการณ์", detail: "เชื่อมต่อได้ในเวลาที่คุณต้องการ" },
      { title: "เพื่อสังคมที่เท่าเทียม", detail: "ไม่ทิ้งใครไว้ข้างหลัง" },
    ],
    about: {
      label: "KHVI HELPER",
      title: "พลังของการสื่อสาร\nสร้างสังคมที่ดีกว่า",
      body: "เราคือเครือข่ายอาสาสมัครล่าม ที่พร้อมช่วยเหลือผู้คนในสถานการณ์ฉุกเฉิน การเข้าถึงบริการสาธารณสุข การติดต่อภาครัฐ และในชีวิตประจำวัน เพื่อให้ทุกคนได้สื่อสารอย่างมั่นใจ",
      action: "เกี่ยวกับเรา",
      cards: [
        { title: "ช่วยในสถานการณ์ฉุกเฉิน", detail: "เจ็บป่วย อุบัติเหตุ เหตุฉุกเฉิน เราพร้อมเชื่อมต่อล่ามทันที" },
        { title: "เข้าถึงบริการภาครัฐ", detail: "ลดอุปสรรคในการติดต่อกับหน่วยงานต่าง ๆ" },
        { title: "เชื่อมโยงผู้คน หลากหลายภาษา", detail: "ร่วมสร้างสังคมที่เปิดกว้างและเท่าเทียม" },
      ],
    },
    community: {
      quote: "เพื่อการสื่อสารไร้พรมแดน\nโอกาสของทุกคนก็ไปได้ไกลกว่าเดิม",
      note: "คนต่างภาษา แต่หัวใจเดียวกัน",
      imageAlt: "กลุ่มคนหลากหลายยืนเคียงกันมองทิวทัศน์ประเทศไทย",
    },
    footer: {
      description: "เครือข่ายอาสาสมัครล่ามเพื่อการสื่อสารที่เข้าถึงได้สำหรับทุกคน",
      note: "เชื่อมคน เชื่อมภาษา",
      explore: "สำรวจ",
      safety: "ความปลอดภัย",
      needHelp: "ต้องการความช่วยเหลือ?",
      needHelpBody: "แจ้งภาษาและสถานที่เพื่อเริ่มค้นหาอาสาสมัครล่าม",
      footerCta: "ขอความช่วยเหลือ",
      privacy: "ข้อมูลละเอียดเปิดหลังผู้ขอยืนยันล่าม",
      links: { map: "เกี่ยวกับเรา", how: "สำหรับอาสาสมัคร", roles: "ชุมชน", privacy: "ความเป็นส่วนตัว", request: "ขอความช่วยเหลือ", signIn: "เข้าสู่ระบบ" },
    },
  },
  en: {
    skip: "Skip to main content",
    header: {
      brandSubtitle: "Connecting people and languages",
      languageLabel: "Language",
      signIn: "Sign in",
      primaryAction: "Get help",
      nav: [["About us", "#about"], ["For volunteers", "/welcome#volunteer-application"], ["Community", "#community"]],
    },
    hero: {
      lead: "Communicate clearly.",
      accent: "Help confidently.",
      body: "Everyone deserves to be understood. KHVI Helper connects people with volunteer interpreters for language support in urgent situations and everyday life.",
      action: "Get language help",
      note: "Request an interpreter quickly, safely, and free of charge.",
      imageAlt: "A volunteer interpreter helping an older woman communicate using a tablet",
    },
    trust: [
      { title: "Safe and trusted", detail: "Every volunteer is reviewed" },
      { title: "A nationwide community", detail: "Many languages, ready to help" },
      { title: "Timely connections", detail: "Find help when you need it" },
      { title: "Equal communication", detail: "No one is left behind" },
    ],
    about: {
      label: "KHVI HELPER",
      title: "Communication can build\na more inclusive society",
      body: "We are a network of volunteer interpreters helping people in emergencies, healthcare, public services, and daily life so everyone can communicate with confidence.",
      action: "About us",
      cards: [
        { title: "Help in urgent situations", detail: "Connect with language support for illness, accidents, and urgent needs." },
        { title: "Access public services", detail: "Reduce language barriers when contacting public agencies." },
        { title: "Connect across languages", detail: "Help create a more open and equal community." },
      ],
    },
    community: {
      quote: "When communication crosses borders,\neveryone can go further.",
      note: "Different languages, one community",
      imageAlt: "A diverse group standing together and looking over a Thai landscape",
    },
    footer: {
      description: "A volunteer interpreter network making communication accessible to everyone.",
      note: "Connecting people and languages",
      explore: "Explore",
      safety: "Safety",
      needHelp: "Need help?",
      needHelpBody: "Share the language and location to start finding a volunteer interpreter.",
      footerCta: "Get help",
      privacy: "Sensitive details open only after interpreter confirmation",
      links: { map: "About us", how: "For volunteers", roles: "Community", privacy: "Privacy", request: "Get help", signIn: "Sign in" },
    },
  },
  zh: {
    skip: "跳到主要内容",
    header: {
      brandSubtitle: "连接人与语言，共创平等社会",
      languageLabel: "语言",
      signIn: "登录",
      primaryAction: "获取帮助",
      nav: [["关于我们", "#about"], ["志愿者专区", "/welcome#volunteer-application"], ["社区", "#community"]],
    },
    hero: {
      lead: "沟通无碍",
      accent: "互助有力",
      body: "每个人都有沟通的权利。KHVI Helper 将有语言需求的人与志愿口译员连接起来，服务于紧急情况和日常生活。",
      action: "获取语言帮助",
      note: "快速、安全、免费地申请志愿口译服务。",
      imageAlt: "志愿口译员通过平板电脑帮助老年女性沟通",
    },
    trust: [
      { title: "安全可信", detail: "每位志愿者均经过审核" },
      { title: "全国志愿网络", detail: "多种语言，随时提供帮助" },
      { title: "及时连接", detail: "在需要时快速找到帮助" },
      { title: "平等沟通", detail: "不让任何人掉队" },
    ],
    about: {
      label: "KHVI HELPER",
      title: "沟通的力量\n让社会更加美好",
      body: "我们是志愿口译员网络，在紧急情况、医疗、公共服务和日常生活中提供帮助，让每个人都能自信沟通。",
      action: "关于我们",
      cards: [
        { title: "紧急情况支援", detail: "在疾病、事故及紧急需求中快速连接口译员。" },
        { title: "使用公共服务", detail: "减少联系公共机构时遇到的语言障碍。" },
        { title: "连接不同语言的人", detail: "共同建设更加开放和平等的社区。" },
      ],
    },
    community: {
      quote: "当沟通跨越边界，\n每个人都能走得更远。",
      note: "语言不同，心意相通",
      imageAlt: "多元群体并肩眺望泰国景观",
    },
    footer: {
      description: "让每个人都能获得沟通支持的志愿口译网络。",
      note: "连接人与语言",
      explore: "探索",
      safety: "安全",
      needHelp: "需要帮助？",
      needHelpBody: "填写所需语言和地点，开始寻找志愿口译员。",
      footerCta: "获取帮助",
      privacy: "确认口译员后才会开放敏感信息",
      links: { map: "关于我们", how: "志愿者专区", roles: "社区", privacy: "隐私", request: "获取帮助", signIn: "登录" },
    },
  },
} as const;

const localizedLandingCopy = {
  ...landingCopy,
  es: {
    ...landingCopy.en,
    header: {
      ...landingCopy.en.header,
      brandSubtitle: "Conectamos personas y lenguas para una sociedad más igualitaria",
      languageLabel: "Idioma",
      signIn: "Iniciar sesión",
      primaryAction: "Obtener ayuda",
      nav: [["Sobre nosotros", "#about"], ["Para voluntarios", "/welcome#volunteer-application"], ["Comunidad", "#community"]],
    },
    hero: {
      ...landingCopy.en.hero,
      lead: "Comunícate con claridad.",
      accent: "Ayuda con confianza.",
      body: "Todas las personas merecen ser comprendidas. KHVI Helper conecta a las personas con intérpretes voluntarios para ofrecer apoyo lingüístico en situaciones urgentes y en la vida diaria.",
      action: "Obtener ayuda lingüística",
      note: "Solicita un intérprete de forma rápida, segura y gratuita.",
      imageAlt: "Una intérprete voluntaria ayuda a una mujer mayor a comunicarse con una tableta",
    },
    trust: [
      { title: "Seguro y confiable", detail: "Revisamos a cada voluntario" },
      { title: "Comunidad nacional", detail: "Muchas lenguas, siempre dispuestos a ayudar" },
      { title: "Conexiones oportunas", detail: "Encuentra ayuda cuando la necesitas" },
      { title: "Comunicación igualitaria", detail: "Nadie queda atrás" },
    ],
    about: {
      ...landingCopy.en.about,
      title: "La comunicación puede construir\nuna sociedad más inclusiva",
      body: "Somos una red de intérpretes voluntarios que ayuda en emergencias, atención sanitaria, servicios públicos y vida diaria para que todas las personas puedan comunicarse con confianza.",
      action: "Sobre nosotros",
      cards: [
        { title: "Ayuda en situaciones urgentes", detail: "Conecta con apoyo lingüístico para enfermedades, accidentes y necesidades urgentes." },
        { title: "Accede a servicios públicos", detail: "Reduce las barreras lingüísticas al contactar con organismos públicos." },
        { title: "Conecta entre lenguas", detail: "Ayuda a crear una comunidad más abierta e igualitaria." },
      ],
    },
    community: {
      quote: "Cuando la comunicación cruza fronteras,\ntodas las personas pueden llegar más lejos.",
      note: "Lenguas diferentes, una comunidad",
      imageAlt: "Un grupo diverso observa unido un paisaje tailandés",
    },
    footer: {
      ...landingCopy.en.footer,
      description: "Una red de intérpretes voluntarios que hace accesible la comunicación para todas las personas.",
      note: "Conectamos personas y lenguas",
      explore: "Explorar",
      safety: "Seguridad",
      needHelp: "¿Necesitas ayuda?",
      needHelpBody: "Comparte el idioma y el lugar para empezar a buscar un intérprete voluntario.",
      footerCta: "Obtener ayuda",
      privacy: "Los datos sensibles se abren solo después de confirmar al intérprete",
      links: { map: "Sobre nosotros", how: "Para voluntarios", roles: "Comunidad", privacy: "Privacidad", request: "Obtener ayuda", signIn: "Iniciar sesión" },
    },
  },
  ar: {
    ...landingCopy.en,
    header: {
      ...landingCopy.en.header,
      brandSubtitle: "نربط الناس واللغات من أجل مجتمع أكثر مساواة",
      languageLabel: "اللغة",
      signIn: "تسجيل الدخول",
      primaryAction: "الحصول على المساعدة",
      nav: [["من نحن", "#about"], ["للمتطوعين", "/welcome#volunteer-application"], ["المجتمع", "#community"]],
    },
    hero: {
      ...landingCopy.en.hero,
      lead: "تواصل بوضوح.",
      accent: "وساعد بثقة.",
      body: "يستحق الجميع أن يتم فهمهم. يربط KHVI Helper الناس بالمترجمين المتطوعين للحصول على دعم لغوي في المواقف العاجلة وفي الحياة اليومية.",
      action: "الحصول على مساعدة لغوية",
      note: "اطلب مترجمًا بسرعة وأمان ومجانًا.",
      imageAlt: "مترجمة متطوعة تساعد امرأة مسنة على التواصل باستخدام جهاز لوحي",
    },
    trust: [
      { title: "آمن وموثوق", detail: "نراجع كل متطوع" },
      { title: "مجتمع في جميع أنحاء البلاد", detail: "لغات متعددة ومتطوعون مستعدون للمساعدة" },
      { title: "تواصل في الوقت المناسب", detail: "اعثر على المساعدة عند حاجتك" },
      { title: "تواصل متساوٍ", detail: "لا نترك أحدًا خلفنا" },
    ],
    about: {
      ...landingCopy.en.about,
      title: "يمكن للتواصل أن يبني\nمجتمعًا أكثر شمولًا",
      body: "نحن شبكة من المترجمين المتطوعين الذين يساعدون الناس في حالات الطوارئ والرعاية الصحية والخدمات العامة والحياة اليومية حتى يتمكن الجميع من التواصل بثقة.",
      action: "من نحن",
      cards: [
        { title: "المساعدة في المواقف العاجلة", detail: "تواصل مع الدعم اللغوي في حالات المرض والحوادث والاحتياجات العاجلة." },
        { title: "الوصول إلى الخدمات العامة", detail: "قلل حواجز اللغة عند التواصل مع الجهات العامة." },
        { title: "ربط اللغات المختلفة", detail: "ساعد في بناء مجتمع أكثر انفتاحًا ومساواة." },
      ],
    },
    community: {
      quote: "عندما يتجاوز التواصل الحدود،\nيمكن للجميع أن يذهبوا أبعد.",
      note: "لغات مختلفة، مجتمع واحد",
      imageAlt: "مجموعة متنوعة تقف معًا وتتأمل منظرًا طبيعيًا في تايلاند",
    },
    footer: {
      ...landingCopy.en.footer,
      description: "شبكة مترجمين متطوعين تجعل التواصل متاحًا للجميع.",
      note: "نربط الناس واللغات",
      explore: "استكشف",
      safety: "الأمان",
      needHelp: "هل تحتاج إلى مساعدة؟",
      needHelpBody: "شارك اللغة والمكان لبدء البحث عن مترجم متطوع.",
      footerCta: "الحصول على المساعدة",
      privacy: "تُفتح التفاصيل الحساسة بعد تأكيد المترجم فقط",
      links: { map: "من نحن", how: "للمتطوعين", roles: "المجتمع", privacy: "الخصوصية", request: "الحصول على المساعدة", signIn: "تسجيل الدخول" },
    },
  },
} as const;

const trustIcons = [ShieldCheckIcon, UserGroupIcon, ClockIcon, HeartIcon] as const;
const serviceIcons = [BellAlertIcon, BuildingLibraryIcon, GlobeAltIcon] as const;

function TrustItem({ icon: IconComponent, title, detail }: { icon: Icon; title: string; detail: string }) {
  return (
    <div className="flex items-center gap-3 border-b border-[#cfe0e5] px-4 py-3.5 last:border-b-0 sm:odd:border-r sm:[&:nth-child(n+3)]:border-b-0 lg:border-b-0 lg:border-r lg:last:border-r-0 lg:px-6 lg:py-4">
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#e7f4f5] text-[#087f80] lg:h-12 lg:w-12">
        <IconComponent aria-hidden="true" className="h-6 w-6 lg:h-7 lg:w-7" />
      </span>
      <span>
        <strong className="block text-sm font-extrabold text-[#173646]">{title}</strong>
        <span className="mt-1 block text-xs leading-5 text-[#64777e]">{detail}</span>
      </span>
    </div>
  );
}

export default function Home() {
  const router = useRouter();
  const [intent, setIntent] = useState<"request" | "volunteer" | null>(null);
  const [locale, setLocale] = useStoredLocale();
  const t = locale === "th" ? localizedLandingCopy.th : localizedLandingCopy[locale];
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isSignInOpen, setIsSignInOpen] = useState(false);

  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);

  function continueAfterLogin(user: UserProfile | null = currentUser) {
    if (!user) return;
    setIsSignInOpen(false);
    setIsRegisterOpen(false);
    router.push(user.role === "User" && intent
      ? intent === "request" ? "/request-help#main-content" : "/welcome#volunteer-application"
      : getRedirectPathByRole(user.role));
  }

  function startIntent(nextIntent: "request" | "volunteer") {
    const user = currentUser;
    if (user) {
      router.push(user.role === "User"
        ? nextIntent === "request" ? "/request-help#main-content" : "/welcome#volunteer-application"
        : getRedirectPathByRole(user.role));
      return;
    }
    setIntent(nextIntent);
    setIsSignInOpen(true);
    setIsRegisterOpen(false);
  }

  useEffect(() => {
    const supabase = createClient();
    let disposed = false;

    const refreshUser = async () => {
      const result = await getCurrentUserProfile(supabase);
      if (!disposed) setCurrentUser(result.profile);
    };

    void refreshUser();
    const { data: authListener } = supabase.auth.onAuthStateChange(() => {
      window.setTimeout(() => void refreshUser(), 0);
    });

    return () => {
      disposed = true;
      authListener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const checkUrl = () => {
      const params = new URLSearchParams(window.location.search);
      if (params.get("register") === "true" || window.location.hash === "#register") {
        queueMicrotask(() => { setIsRegisterOpen(true); setIsSignInOpen(false); });
      } else if (
        params.get("signin") === "true"
        || params.get("login") === "true"
        || window.location.hash === "#signin"
        || window.location.hash === "#login"
      ) {
        queueMicrotask(() => { setIsSignInOpen(true); setIsRegisterOpen(false); });
      }
    };

    checkUrl();
    window.addEventListener("hashchange", checkUrl);
    return () => window.removeEventListener("hashchange", checkUrl);
  }, []);

  return (
    <main
      id="top"
      className="min-h-screen bg-[#f7f9fa] text-[#10283a]"
      onClick={(event) => {
        const anchor = (event.target as HTMLElement).closest("a");
        const href = anchor?.getAttribute("href");
        if (href === "/request-help#main-content" || href === "/welcome#volunteer-application") {
          event.preventDefault();
          startIntent(href === "/welcome#volunteer-application" ? "volunteer" : "request");
        }
      }}
    >
      <a className="skip-link" href="#main-content">{t.skip}</a>
      <SiteHeader
        copy={t.header}
        locale={locale}
        onLocaleChange={setLocale}
        onOpenRegister={() => { setIntent(null); setIsRegisterOpen(true); setIsSignInOpen(false); }}
        onOpenSignIn={() => { setIntent(null); setIsSignInOpen(true); setIsRegisterOpen(false); }}
      />

      <section id="main-content" className="mx-auto max-w-[1480px] scroll-mt-24 px-4 pt-4 sm:px-8 sm:pt-6 lg:px-8 lg:pt-8">
        <div className="relative overflow-hidden rounded-2xl border border-[#d8e3e7] bg-white shadow-[0_18px_50px_rgba(21,52,67,0.10)]">
          <div className="absolute inset-0 hidden lg:block">
            <Image src="/khvi-landing-hero.png" alt={t.hero.imageAlt} fill priority className="object-cover object-center" sizes="(min-width: 1480px) 1420px, calc(100vw - 64px)" />
          </div>
          <div aria-hidden="true" className={`absolute inset-0 hidden lg:block ${locale === "ar" ? "bg-[linear-gradient(270deg,#ffffff_0%,rgba(255,255,255,0.98)_35%,rgba(255,255,255,0.86)_49%,rgba(255,255,255,0)_72%)]" : "bg-[linear-gradient(90deg,#ffffff_0%,rgba(255,255,255,0.98)_35%,rgba(255,255,255,0.86)_49%,rgba(255,255,255,0)_72%)]"}`} />
          <div className="relative z-10 flex max-w-[720px] flex-col justify-center px-5 py-8 sm:px-10 sm:py-10 lg:min-h-[500px] lg:px-12">
            <h1 className="max-w-[720px] text-[2.65rem] font-extrabold leading-[1.04] tracking-[-0.035em] text-[#0b3550] text-balance sm:text-[3.5rem] lg:text-[clamp(3.4rem,5vw,5rem)]">
              <span className="block">{t.hero.lead}</span>
              <span className="mt-1 block text-[#ef5b47]">{t.hero.accent}</span>
            </h1>
            <p className="mt-5 max-w-[620px] text-pretty text-[15px] font-semibold leading-7 text-[#294b60] sm:mt-6 sm:text-lg sm:leading-8">{t.hero.body}</p>
            <a href="/request-help#main-content" className="mt-6 inline-flex min-h-14 w-full max-w-[390px] items-center justify-center gap-3 rounded-xl bg-[#ef5b47] px-5 py-3 text-base font-extrabold text-white shadow-[0_12px_25px_rgba(239,91,71,0.24)] transition-colors hover:bg-[#d94a38] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#092f45] sm:mt-7 sm:px-6 sm:text-lg">
              <BellAlertIcon aria-hidden="true" className="h-7 w-7" />
              {t.hero.action}
            </a>
            <p className="mt-3 text-sm font-semibold text-white/75">{t.hero.note}</p>
          </div>
        </div>

        <div className="relative z-10 mx-2 -mt-4 grid overflow-hidden rounded-2xl border border-[#d8e3e7] bg-white/95 shadow-[0_15px_35px_rgba(21,52,67,0.10)] backdrop-blur sm:mx-6 sm:-mt-5 sm:grid-cols-2 lg:-mt-7 lg:grid-cols-4">
          {t.trust.map((item, index) => <TrustItem key={item.title} icon={trustIcons[index]} title={item.title} detail={item.detail} />)}
        </div>
      </section>

      <section id="about" className="relative mx-auto grid max-w-[1480px] scroll-mt-24 gap-7 px-4 py-10 sm:px-8 sm:py-14 lg:grid-cols-[0.92fr_1.48fr] lg:items-center lg:gap-8 lg:px-8 lg:py-16">
        <span id="map-preview" className="absolute top-0" aria-hidden="true" />
        <span id="how-it-works" className="absolute top-0" aria-hidden="true" />
        <div>
          <span className="inline-flex rounded-md bg-[#dff4f5] px-3 py-1.5 text-xs font-extrabold tracking-wide text-[#087f80]">{t.about.label}</span>
          <h2 className="mt-4 whitespace-pre-line text-3xl font-extrabold leading-tight tracking-[-0.02em] text-[#0b3550] sm:text-4xl">{t.about.title}</h2>
          <p className="mt-5 max-w-lg text-sm leading-7 text-[#536c79] sm:text-base">{t.about.body}</p>
          <a href="#community" className="mt-5 inline-flex text-sm font-extrabold text-[#087f80] underline decoration-2 underline-offset-4 hover:text-[#075f61]">{t.about.action}</a>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {t.about.cards.map((card, index) => {
            const IconComponent = serviceIcons[index];
            return (
              <article key={card.title} className="flex items-center gap-4 rounded-2xl border border-[#dbe6ea] bg-[linear-gradient(180deg,#f4fbfc_0%,#eef5f8_100%)] p-4 text-left shadow-[0_10px_24px_rgba(20,55,72,0.06)] md:block md:p-5 md:text-center">
                <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-[#dff1f4] text-[#087f80] md:mx-auto md:h-20 md:w-20">
                  <IconComponent aria-hidden="true" className="h-8 w-8 md:h-11 md:w-11" />
                </span>
                <div>
                  <h3 className="text-base font-extrabold leading-6 text-[#123b55] md:mt-5">{card.title}</h3>
                  <p className="mt-1.5 text-sm leading-6 text-[#58717f] md:mt-3">{card.detail}</p>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section id="community" className="relative mx-auto max-w-[1480px] scroll-mt-24 px-4 pb-10 sm:px-8 sm:pb-14 lg:px-8">
        <span id="roles" className="absolute top-0" aria-hidden="true" />
        <span id="safety" className="absolute top-0" aria-hidden="true" />
        <div className="overflow-hidden rounded-2xl border border-[#d7e4e8] bg-white sm:relative sm:min-h-[280px] sm:bg-[#eef7f8]">
          <div className="relative aspect-[3/1] bg-[#eef7f8] sm:absolute sm:inset-0 sm:aspect-auto">
            <Image src="/khvi-community-banner.png" alt={t.community.imageAlt} fill className="object-cover object-center" sizes="(min-width: 1480px) 1420px, (min-width: 640px) calc(100vw - 64px), calc(100vw - 32px)" />
          </div>
          <div aria-hidden="true" className="absolute inset-0 hidden bg-gradient-to-b from-white/90 via-white/30 to-transparent sm:block" />
          <div className="relative z-10 flex items-start justify-between gap-6 px-5 py-5 sm:px-10 sm:py-7">
            <p className="whitespace-pre-line text-base font-extrabold leading-7 text-[#123b55] sm:text-2xl sm:leading-9">{t.community.quote}</p>
            <p className="hidden max-w-[230px] text-right text-base font-extrabold leading-7 text-[#087f80] sm:block">{t.community.note}</p>
          </div>
        </div>
      </section>

      <RegisterModal
        onSuccess={() => continueAfterLogin()}
        intentLabel={intent ? locale === "th" ? intent === "request" ? "สมัครเพื่อขอความช่วยเหลือ" : "สมัครเพื่อดูขั้นตอนอาสาสมัคร" : locale === "zh" ? intent === "request" ? "注册以获取帮助" : "注册以查看志愿者流程" : locale === "es" ? intent === "request" ? "Regístrate para obtener ayuda" : "Regístrate para conocer el voluntariado" : locale === "ar" ? intent === "request" ? "أنشئ حسابًا للحصول على المساعدة" : "أنشئ حسابًا للتعرف على التطوع" : intent === "request" ? "Register to get help" : "Register to explore volunteering" : undefined}
        isOpen={isRegisterOpen}
        onClose={() => { setIsRegisterOpen(false); setIntent(null); }}
        onSwitchToSignIn={() => { setIsRegisterOpen(false); setIsSignInOpen(true); }}
      />
      <LoginModal
        onSuccess={continueAfterLogin}
        intentLabel={intent ? locale === "th" ? intent === "request" ? "เข้าสู่ระบบเพื่อขอความช่วยเหลือ" : "เข้าสู่ระบบเพื่อดูขั้นตอนอาสาสมัคร" : locale === "zh" ? intent === "request" ? "登录以获取帮助" : "登录以查看志愿者流程" : locale === "es" ? intent === "request" ? "Inicia sesión para obtener ayuda" : "Inicia sesión para conocer el voluntariado" : locale === "ar" ? intent === "request" ? "سجّل الدخول للحصول على المساعدة" : "سجّل الدخول للتعرف على التطوع" : intent === "request" ? "Sign in to get help" : "Sign in to explore volunteering" : undefined}
        isOpen={isSignInOpen}
        onClose={() => { setIsSignInOpen(false); setIntent(null); }}
        onSwitchToRegister={() => { setIsSignInOpen(false); setIsRegisterOpen(true); }}
      />
      <SiteFooter copy={t.footer} brandSubtitle={t.header.brandSubtitle} />
    </main>
  );
}
