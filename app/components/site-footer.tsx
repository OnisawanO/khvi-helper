import Link from "next/link";
import { BrandMark } from "./brand-mark";
import type { Locale } from "./site-header";

type FooterCopy = {
  description: string;
  note: string;
  explore: string;
  safety: string;
  needHelp: string;
  needHelpBody: string;
  footerCta: string;
  privacy: string;
  links: {
    map: string;
    how: string;
    roles: string;
    privacy: string;
    request: string;
    signIn: string;
  };
};

type SiteFooterProps = {
  copy: FooterCopy;
  brandSubtitle: string;
  locale?: Locale;
  workspace?: boolean;
};

const footerBrandLabels: Record<Locale, string> = {
  en: "KHVI home",
  th: "หน้าหลัก KHVI",
  zh: "KHVI 首页",
  es: "Página principal de KHVI",
  ar: "الصفحة الرئيسية لـ KHVI",
};

export function SiteFooter({ copy, brandSubtitle, locale = "en", workspace = false }: SiteFooterProps) {
  const brandAriaLabel = footerBrandLabels[locale];

  if (workspace) return (
    <footer className="border-t border-(--khvi-teal)/20 bg-(--khvi-surface) px-5 py-7 sm:px-8 lg:px-12">
      <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-6">
        <BrandMark subtitle={brandSubtitle} ariaLabel={brandAriaLabel} />
      </div>
    </footer>
  );
  return (
    <footer className="border-t border-white/10 bg-[#06273a] px-5 py-10 text-white sm:px-8 lg:px-12 lg:py-12">
      <div className="mx-auto max-w-[1480px]">
        <div className="grid gap-10 md:grid-cols-[1.5fr_0.75fr_0.75fr_1.1fr]">
          <div>
            <BrandMark light subtitle={brandSubtitle} ariaLabel={brandAriaLabel} />
            <p className="mt-5 max-w-xs text-sm leading-6 text-white/60">{copy.description}</p>
            <p className="mt-4 text-xs font-bold text-[#8ed5c4]">{copy.note}</p>
          </div>
          <nav aria-label="Footer explore">
            <p className="text-xs font-extrabold text-white/45">{copy.explore}</p>
            <div className="mt-4 space-y-3 text-sm font-semibold text-white/75">
              <Link className="block transition-colors hover:text-white" href="/#map-preview">{copy.links.map}</Link>
              <Link className="block transition-colors hover:text-white" href="/#roles">{copy.links.roles}</Link>
            </div>
          </nav>
          <nav aria-label="Footer safety">
            <p className="text-xs font-extrabold text-white/45">{copy.safety}</p>
            <div className="mt-4 space-y-3 text-sm font-semibold text-white/75">
              <Link className="block transition-colors hover:text-white" href="/user/request-help#main-content">{copy.links.request}</Link>
              <Link className="block transition-colors hover:text-white" href="/sign-in">{copy.links.signIn}</Link>
            </div>
          </nav>
          <div className="border-l border-white/10 pl-0 md:pl-7">
            <p className="text-xs font-extrabold text-white/45">{copy.needHelp}</p>
            <p className="mt-4 text-sm leading-6 text-white/65">{copy.needHelpBody}</p>
            <Link className="mt-5 inline-flex h-10 items-center rounded-lg bg-[#ef6747] px-4 text-xs font-extrabold text-white transition-colors hover:bg-[#f0785b]" href="/user/request-help#main-content">{copy.footerCta}</Link>
          </div>
        </div>
        <div className="mt-10 flex flex-col gap-3 border-t border-white/10 pt-5 text-xs text-white/45 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 K-HVI. Volunteer Interpreter Network.</p>
          <p>{copy.privacy}</p>
        </div>
      </div>
    </footer>
  );
}
