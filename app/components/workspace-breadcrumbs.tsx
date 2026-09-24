"use client";

import { Fragment } from "react";
import Link from "next/link";
import { ChevronRightIcon } from "@heroicons/react/20/solid";
import { useUiLocale } from "./app-shell";

export type BreadcrumbItem = {
  label: string;
  href?: string;
};

const breadcrumbTranslations: Record<string, { en: string; th: string; zh: string; es: string; ar: string }> = {
  "หน้าหลัก": { en: "Home", th: "หน้าหลัก", zh: "首页", es: "Inicio", ar: "الرئيسية" },
  "ระบบล่ามจิตอาสา": { en: "Volunteer system", th: "ระบบล่ามจิตอาสา", zh: "志愿口译系统", es: "Sistema de voluntariado", ar: "نظام المترجمين المتطوعين" },
  "สถานะใบสมัครล่ามอาสา": { en: "Volunteer application status", th: "สถานะใบสมัครล่ามอาสา", zh: "志愿口译员申请状态", es: "Estado de la solicitud", ar: "حالة طلب التطوع" },
  "สมัครล่ามจิตอาสา": { en: "Volunteer application", th: "สมัครล่ามจิตอาสา", zh: "申请志愿口译员", es: "Solicitud de voluntariado", ar: "طلب التطوع" },
  "สมัครล่ามอาสา": { en: "Volunteer application", th: "สมัครล่ามอาสา", zh: "申请志愿口译员", es: "Solicitud de voluntariado", ar: "طلب التطوع" },
  "ลงทะเบียนล่ามจิตอาสา": { en: "Volunteer interpreter registration", th: "ลงทะเบียนล่ามจิตอาสา", zh: "注册志愿口译员", es: "Registro de intérprete voluntario", ar: "تسجيل المترجم المتطوع" },
  "แดชบอร์ด": { en: "Dashboard", th: "แดชบอร์ด", zh: "控制台", es: "Panel", ar: "لوحة التحكم" },
  "จัดการล่าม": { en: "Manage interpreters", th: "จัดการล่าม", zh: "管理口译员", es: "Gestionar intérpretes", ar: "إدارة المترجمين" },
  "แถบนำทางสถานะใบสมัคร": { en: "Application status navigation", th: "แถบนำทางสถานะใบสมัคร", zh: "申请状态导航", es: "Navegación del estado", ar: "تنقل حالة الطلب" },
  "แถบนำทางระบบล่ามอาสา": { en: "Volunteer system navigation", th: "แถบนำทางระบบล่ามอาสา", zh: "志愿口译系统导航", es: "Navegación del sistema", ar: "تنقل نظام المتطوعين" },
  "แถบนำทางลงทะเบียนล่ามอาสา": { en: "Volunteer registration navigation", th: "แถบนำทางลงทะเบียนล่ามอาสา", zh: "志愿口译员注册导航", es: "Navegación del registro", ar: "تنقل التسجيل" },
};

export function WorkspaceBreadcrumbs({
  ariaLabel = "Breadcrumb",
  currentLabel,
  homeHref,
  homeLabel,
  items,
  className = "",
}: {
  ariaLabel?: string;
  currentLabel?: string;
  homeHref?: string;
  homeLabel?: string;
  items?: BreadcrumbItem[];
  className?: string;
}) {
  const locale = useUiLocale();
  const translate = (text: string) => {
    return breadcrumbTranslations[text]?.[locale] ?? text;
  };

  const breadcrumbItems: BreadcrumbItem[] =
    items ??
    [
      ...(homeHref && homeLabel ? [{ label: homeLabel, href: homeHref }] : []),
      ...(currentLabel ? [{ label: currentLabel }] : []),
    ];

  return (
    <nav
      aria-label={translate(ariaLabel)}
      className={`overflow-x-auto rounded-(--khvi-radius-md) border border-(--khvi-teal)/20 bg-white px-4 py-3 shadow-xs ${className}`.trim()}
    >
      <ol className="flex min-w-max items-center gap-2 text-sm">
        {breadcrumbItems.map((item, index) => {
          const isLast = index === breadcrumbItems.length - 1;
          const displayLabel = translate(item.label);

          return (
            <Fragment key={`${item.label}-${index}`}>
              {index > 0 && (
                <li aria-hidden="true">
                  <ChevronRightIcon aria-hidden="true" className="rtl-directional-icon h-4 w-4 text-(--khvi-ink)/40" />
                </li>
              )}
              <li>
                {isLast || !item.href ? (
                  <span aria-current={isLast ? "page" : undefined} className="font-semibold text-(--khvi-ink)/70">
                    {displayLabel}
                  </span>
                ) : (
                  <Link
                    className="font-bold text-[#087f80] underline-offset-4 transition-colors hover:text-[#0a6465] hover:underline"
                    href={item.href}
                  >
                    {displayLabel}
                  </Link>
                )}
              </li>
            </Fragment>
          );
        })}
      </ol>
    </nav>
  );
}
