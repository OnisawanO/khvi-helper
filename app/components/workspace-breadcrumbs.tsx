"use client";

import { Fragment } from "react";
import Link from "next/link";
import { ChevronRightIcon } from "@heroicons/react/20/solid";
import { useUiLocale } from "./app-shell";

export type BreadcrumbItem = {
  label: string;
  href?: string;
};

const breadcrumbTranslations: Record<string, { en: string; zh: string }> = {
  "หน้าหลัก": { en: "Home", zh: "首页" },
  "ระบบล่ามจิตอาสา": { en: "Volunteer system", zh: "志愿口译系统" },
  "สถานะใบสมัครล่ามอาสา": { en: "Volunteer application status", zh: "志愿口译员申请状态" },
  "สมัครล่ามจิตอาสา": { en: "Volunteer application", zh: "申请志愿口译员" },
  "สมัครล่ามอาสา": { en: "Volunteer application", zh: "申请志愿口译员" },
  "ลงทะเบียนล่ามจิตอาสา": { en: "Volunteer interpreter registration", zh: "注册志愿口译员" },
  "แดชบอร์ด": { en: "Dashboard", zh: "控制台" },
  "จัดการล่าม": { en: "Manage interpreters", zh: "管理口译员" },
  "แถบนำทางสถานะใบสมัคร": { en: "Application status navigation", zh: "申请状态导航" },
  "แถบนำทางระบบล่ามอาสา": { en: "Volunteer system navigation", zh: "志愿口译系统导航" },
  "แถบนำทางลงทะเบียนล่ามอาสา": { en: "Volunteer registration navigation", zh: "志愿口译员注册导航" },
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
    if (locale === "th" || !breadcrumbTranslations[text]) return text;
    return locale === "zh" ? breadcrumbTranslations[text].zh : breadcrumbTranslations[text].en;
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
                  <ChevronRightIcon aria-hidden="true" className="h-4 w-4 text-(--khvi-ink)/40" />
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
