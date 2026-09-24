"use client";

import { useUiLocale } from "@/app/components/app-shell";
import type { Locale } from "@/app/components/site-header";

const copy: Record<Locale, { portal: string; onboarding: string; title: string; body: string; badge: string }> = {
  en: { portal: "Volunteer Portal", onboarding: "• KHVI Helper Volunteer Onboarding", title: "Manage Profile & Volunteer Interpreter Application", body: "Register language proficiencies and submit credentials to join the crisis response network", badge: "✓ Data Dictionary 100%" },
  th: { portal: "พอร์ทัลอาสาสมัคร", onboarding: "• การรับรองอาสาสมัคร KHVI Helper", title: "จัดการโปรไฟล์และสมัครล่ามจิตอาสา", body: "ลงทะเบียนทักษะทางภาษาและยื่นเอกสารเพื่อร่วมเป็นเครือข่ายช่วยเหลือผู้ประสบภัย", badge: "✓ ข้อมูลอ้างอิงครบ 100%" },
  zh: { portal: "志愿者门户", onboarding: "• KHVI Helper 志愿者注册", title: "管理个人资料并申请志愿口译员", body: "登记语言技能并提交资质证明，加入应急救援志愿网络", badge: "✓ 数据字典 100%" },
  es: { portal: "Portal de voluntariado", onboarding: "• Incorporación de voluntarios de KHVI Helper", title: "Gestionar perfil y solicitud de intérprete voluntario", body: "Registra tus idiomas y presenta tus credenciales para unirte a la red de respuesta ante crisis", badge: "✓ Diccionario de datos 100%" },
  ar: { portal: "بوابة المتطوعين", onboarding: "• انضمام متطوعي KHVI Helper", title: "إدارة الملف الشخصي وطلب الانضمام كمترجم متطوع", body: "سجّل مهاراتك اللغوية وقدّم المؤهلات للانضمام إلى شبكة الاستجابة للأزمات", badge: "✓ قاموس البيانات 100٪" },
};

export function VolunteerApplyHeader() {
  const locale = useUiLocale();
  const t = copy[locale];

  return (
    <div className="rounded-(--khvi-radius-md) border border-[#143748] bg-[#092f45] p-6 text-white shadow-sm sm:p-7 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-(--khvi-radius-sm) border border-[#8ed5c4]/40 bg-[#087f80] px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-white">
              {t.portal}
            </span>
            <span className="text-xs text-slate-300">{t.onboarding}</span>
          </div>
          <h1 className="mt-2 text-xl font-extrabold tracking-tight text-white sm:text-2xl">
            {t.title}
          </h1>
          <p className="mt-1 text-xs text-slate-300 sm:text-sm">
            {t.body}
          </p>
        </div>

        {/* Badges */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="rounded-(--khvi-radius-sm) border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-bold text-[#8ed5c4]">
            {t.badge}
          </span>
        </div>
      </div>
    </div>
  );
}

