"use client";

import Link from "next/link";
import type { Locale } from "@/app/components/site-header";
import { useStoredLocale } from "@/app/lib/locale";

const copy: Record<Locale, { prompt: string; link: string }> = {
  en: { prompt: "Want to register as a volunteer interpreter?", link: "Register as an interpreter →" },
  th: { prompt: "ต้องการสมัครเป็นล่ามจิตอาสาใช่หรือไม่?", link: "ลงทะเบียนล่ามที่นี่ →" },
  zh: { prompt: "想注册成为志愿口译员吗？", link: "在这里注册口译员 →" },
  es: { prompt: "¿Quieres registrarte como intérprete voluntario?", link: "Registrarse como intérprete →" },
  ar: { prompt: "هل تريد التسجيل كمترجم متطوع؟", link: "تسجيل مترجم متطوع ←" },
};

export function VolunteerRegisterBanner() {
  const [locale] = useStoredLocale();
  const t = copy[locale];

  return (
    <div className="mb-4 flex items-center justify-between gap-2 rounded-xl border border-[#b9d9d6] bg-[#edf7f5] p-3.5 text-center text-xs text-[#087557] shadow-xs">
      <span>{t.prompt}</span>
      <Link href="/register/interpreter" className="rounded-lg bg-[#087f80] px-3 py-1 text-xs font-extrabold text-white transition-colors hover:bg-[#0c6b6c]">
        {t.link}
      </Link>
    </div>
  );
}
