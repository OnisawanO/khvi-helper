"use client";

import { useEffect, useRef } from "react";
import {
  UserIcon,
  AcademicCapIcon,
  XMarkIcon,
  ShieldCheckIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import { useStoredLocale } from "@/app/lib/locale";

export interface RegisterRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectUser: () => void;
  onSelectInterpreter: () => void;
}

const roleCopy = {
  en: {
    close: "Close", eyebrow: "Choose account type", title: "What would you like to register as?", intro: "Select your role in KHVI Helper to continue with the appropriate registration.",
    requesterBadge: "Requester", requesterTitle: "Standard user", requesterBody: "For people who need language support, emergency communication, or everyday coordination.", requesterFeatureOne: "Create SOS help requests", requesterFeatureTwo: "Connect with nearby volunteer interpreters", requesterAction: "Register as user →",
    interpreterBadge: "Interpreter", interpreterTitle: "Volunteer interpreter", interpreterBody: "For multilingual people who want to support others in urgent and everyday situations.", interpreterFeatureOne: "Register and submit credentials in one place", interpreterFeatureTwo: "Accept requests and build a service record", interpreterAction: "Register as volunteer →",
    privacy: "Your information is protected under the BR-04 Shield privacy standard.",
  },
  th: {
    close: "ปิด", eyebrow: "เลือกประเภทบัญชีผู้ใช้", title: "คุณต้องการลงทะเบียนเป็นอะไร?", intro: "เลือกบทบาทของคุณในระบบ KHVI Helper เพื่อเริ่มต้นการลงทะเบียนที่ตรงกับความต้องการ",
    requesterBadge: "ผู้ขอความช่วยเหลือ", requesterTitle: "ผู้ใช้งานทั่วไป", requesterBody: "สำหรับผู้ที่ต้องการความช่วยเหลือทางภาษา สื่อสารยามฉุกเฉิน หรือประสานงานในชีวิตประจำวัน", requesterFeatureOne: "สร้างคำขอ SOS ได้ทันที", requesterFeatureTwo: "เชื่อมต่อล่ามอาสาใกล้เคียง", requesterAction: "ลงทะเบียนเป็นผู้ใช้ →",
    interpreterBadge: "ล่ามจิตอาสา", interpreterTitle: "ล่ามจิตอาสา", interpreterBody: "สำหรับผู้มีทักษะทางภาษาและประสงค์เข้าร่วมช่วยเหลือผู้ประสบภัยในสถานการณ์ต่าง ๆ", interpreterFeatureOne: "สมัครและยื่นเอกสารในหน้าเดียว", interpreterFeatureTwo: "รับงานช่วยเหลือและสะสมภารกิจ", interpreterAction: "ลงทะเบียนเป็นล่ามอาสา →",
    privacy: "ข้อมูลของคุณได้รับการคุ้มครองตามมาตรฐานความเป็นส่วนตัว BR-04 Shield",
  },
  zh: {
    close: "关闭", eyebrow: "选择账户类型", title: "你想注册为哪种角色？", intro: "选择你在 KHVI Helper 中的角色，进入对应的注册流程。",
    requesterBadge: "求助者", requesterTitle: "普通用户", requesterBody: "适用于需要语言协助、紧急沟通或日常协调的用户。", requesterFeatureOne: "发布 SOS 求助", requesterFeatureTwo: "联系附近的志愿口译员", requesterAction: "注册为用户 →",
    interpreterBadge: "志愿口译员", interpreterTitle: "志愿口译员", interpreterBody: "适用于具备多语言能力并希望在紧急或日常场景中帮助他人的人士。", interpreterFeatureOne: "在一处注册并提交资质", interpreterFeatureTwo: "接受任务并积累服务记录", interpreterAction: "注册为志愿者 →",
    privacy: "你的信息受 BR-04 Shield 隐私标准保护。",
  },
  es: {
    close: "Cerrar", eyebrow: "Elige el tipo de cuenta", title: "¿Con qué perfil quieres registrarte?", intro: "Elige tu rol en KHVI Helper para continuar con el registro adecuado.",
    requesterBadge: "Solicitante", requesterTitle: "Usuario", requesterBody: "Para personas que necesitan apoyo lingüístico, comunicación de emergencia o coordinación cotidiana.", requesterFeatureOne: "Crear solicitudes SOS", requesterFeatureTwo: "Conectar con intérpretes voluntarios cercanos", requesterAction: "Registrarme como usuario →",
    interpreterBadge: "Intérprete", interpreterTitle: "Intérprete voluntario", interpreterBody: "Para personas multilingües que desean ayudar en situaciones urgentes y cotidianas.", interpreterFeatureOne: "Registrarte y presentar credenciales en un solo lugar", interpreterFeatureTwo: "Aceptar solicitudes y crear un historial de servicio", interpreterAction: "Registrarme como voluntario →",
    privacy: "Tu información está protegida conforme al estándar de privacidad BR-04 Shield.",
  },
  ar: {
    close: "إغلاق", eyebrow: "اختر نوع الحساب", title: "بأي دور تريد التسجيل؟", intro: "اختر دورك في KHVI Helper للمتابعة إلى التسجيل المناسب.",
    requesterBadge: "صاحب الطلب", requesterTitle: "مستخدم", requesterBody: "لمن يحتاج إلى دعم لغوي أو تواصل في الطوارئ أو تنسيق يومي.", requesterFeatureOne: "إنشاء طلبات مساعدة SOS", requesterFeatureTwo: "التواصل مع مترجمين متطوعين قريبين", requesterAction: "التسجيل كمستخدم ←",
    interpreterBadge: "مترجم", interpreterTitle: "مترجم متطوع", interpreterBody: "للمتحدثين بعدة لغات ممن يرغبون في مساعدة الآخرين في المواقف العاجلة واليومية.", interpreterFeatureOne: "التسجيل وتقديم المؤهلات في مكان واحد", interpreterFeatureTwo: "استلام الطلبات وبناء سجل خدمة", interpreterAction: "التسجيل كمتطوع ←",
    privacy: "معلوماتك محمية وفق معيار الخصوصية BR-04 Shield.",
  },
} as const;

export function RegisterRoleModal({
  isOpen,
  onClose,
  onSelectUser,
  onSelectInterpreter,
}: RegisterRoleModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const [locale] = useStoredLocale();
  const copy = roleCopy[locale];

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    }
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="role-modal-title"
      dir={locale === "ar" ? "rtl" : "ltr"}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-[#092f45]/70 backdrop-blur-xs animate-in fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        ref={dialogRef}
        className="relative my-auto w-full max-w-2xl rounded-3xl border border-[#d6e0e4] bg-white p-6 sm:p-8 shadow-[0_24px_64px_rgba(9,47,69,0.28)]"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-[#5c727d] transition-all hover:bg-slate-200 hover:text-[#092f45] cursor-pointer rtl:left-5 rtl:right-auto"
          aria-label={copy.close}
        >
          <XMarkIcon className="h-5 w-5" aria-hidden="true" />
        </button>

        {/* Header */}
        <div className="text-center max-w-lg mx-auto">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#b9d9d6] bg-[#edf7f5] px-3 py-1 text-xs font-black uppercase tracking-wider text-[#087f80]">
            <SparklesIcon className="h-3.5 w-3.5" />
            {copy.eyebrow}
          </span>
          <h2 id="role-modal-title" className="mt-3 text-2xl font-black text-[#10283a] sm:text-3xl">
            {copy.title}
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-[#64777e]">
            {copy.intro}
          </p>
        </div>

        {/* Role Cards Grid */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Card 1: User / Requester */}
          <div
            onClick={onSelectUser}
            className="group relative flex flex-col justify-between rounded-2xl border-2 border-[#e2ebee] bg-white p-5 sm:p-6 transition-all hover:border-[#087f80] hover:shadow-md cursor-pointer hover:-translate-y-0.5"
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#edf7f5] text-[#087f80] group-hover:bg-[#087f80] group-hover:text-white transition-colors">
                  <UserIcon className="h-6 w-6" />
                </div>
                <span className="rounded-full border border-[#cbd7dc] bg-[#f8fafb] px-2.5 py-0.5 text-[11px] font-bold text-[#53656c]">
                  {copy.requesterBadge}
                </span>
              </div>

              <h3 className="mt-4 text-lg font-black text-[#10283a] group-hover:text-[#087f80] transition-colors">
                {copy.requesterTitle}
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-[#64777e]">
                {copy.requesterBody}
              </p>

              <ul className="mt-4 space-y-1.5 text-xs text-[#526a74]">
                <li className="flex items-center gap-1.5">
                  <span className="text-[#087557] font-bold">✓</span>
                  <span>{copy.requesterFeatureOne}</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="text-[#087557] font-bold">✓</span>
                  <span>{copy.requesterFeatureTwo}</span>
                </li>
              </ul>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onSelectUser();
              }}
              className="mt-6 inline-flex w-full min-h-11 items-center justify-center rounded-xl border border-[#087f80] bg-[#edf7f5] px-4 py-2.5 text-xs font-extrabold text-[#087f80] group-hover:bg-[#087f80] group-hover:text-white transition-colors cursor-pointer"
            >
              {copy.requesterAction}
            </button>
          </div>

          {/* Card 2: Volunteer Interpreter */}
          <div
            onClick={onSelectInterpreter}
            className="group relative flex flex-col justify-between rounded-2xl border-2 border-[#143748] bg-[#092f45] p-5 sm:p-6 text-white transition-all hover:border-[#8ed5c4] hover:shadow-lg cursor-pointer hover:-translate-y-0.5"
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-[#8ed5c4] group-hover:bg-[#8ed5c4] group-hover:text-[#092f45] transition-colors">
                  <AcademicCapIcon className="h-6 w-6" />
                </div>
                <span className="rounded-full border border-[#8ed5c4]/40 bg-[#087f80] px-2.5 py-0.5 text-[11px] font-extrabold text-white">
                  {copy.interpreterBadge}
                </span>
              </div>

              <h3 className="mt-4 text-lg font-black text-white group-hover:text-[#8ed5c4] transition-colors">
                {copy.interpreterTitle}
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-300">
                {copy.interpreterBody}
              </p>

              <ul className="mt-4 space-y-1.5 text-xs text-slate-300">
                <li className="flex items-center gap-1.5">
                  <span className="text-[#8ed5c4] font-bold">✓</span>
                  <span>{copy.interpreterFeatureOne}</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="text-[#8ed5c4] font-bold">✓</span>
                  <span>{copy.interpreterFeatureTwo}</span>
                </li>
              </ul>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onSelectInterpreter();
              }}
              className="mt-6 inline-flex w-full min-h-11 items-center justify-center rounded-xl bg-[#087f80] px-4 py-2.5 text-xs font-extrabold text-white group-hover:bg-[#8ed5c4] group-hover:text-[#092f45] transition-colors cursor-pointer"
            >
              {copy.interpreterAction}
            </button>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-[#73848a]">
          <ShieldCheckIcon className="h-4 w-4 text-[#087557]" />
          <span>
            {copy.privacy}
          </span>
        </div>
      </div>
    </div>
  );
}
