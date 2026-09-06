"use client";

import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import { BrandMark } from "./brand-mark";

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 border-b border-[#dbe3e7] bg-[#fbfdfc]/95 shadow-[0_8px_24px_rgba(21,52,67,0.06)] backdrop-blur">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-6 px-5 py-3.5 sm:px-8 lg:px-12">
        <BrandMark />
        <nav className="hidden items-center gap-7 text-[13px] font-extrabold text-[#39525d] lg:flex" aria-label="Primary navigation">
          <a className="transition-colors hover:text-[#0d8587]" href="#find-interpreter">Find an interpreter</a>
          <a className="transition-colors hover:text-[#0d8587]" href="#how-it-works">How it works</a>
          <a className="transition-colors hover:text-[#0d8587]" href="#safety">Trust &amp; safety</a>
          <a className="transition-colors hover:text-[#0d8587]" href="#community">Community</a>
        </nav>
        <div className="flex items-center gap-2 sm:gap-3">
          <a className="hidden h-10 items-center rounded-lg border border-[#cbd7dc] bg-white px-3 text-xs font-extrabold text-[#425761] transition-colors hover:border-[#8fbfc1] hover:text-[#0d8587] sm:flex" href="/language" title="Change language">EN / ไทย</a>
          <a className="hidden h-10 items-center rounded-lg border border-[#123b4f] px-4 text-xs font-extrabold text-[#123b4f] transition-colors hover:bg-[#edf3f1] sm:flex" href="/sign-in">Sign in</a>
          <a className="flex h-10 items-center rounded-lg bg-[#092f45] px-4 text-xs font-extrabold text-white shadow-[0_6px_14px_rgba(9,47,69,0.16)] transition-colors hover:bg-[#0c4960] sm:px-5" href="/request-help">Get help</a>
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#cbd7dc] bg-white text-lg text-[#123b4f] transition-colors hover:border-[#8fbfc1] hover:text-[#0d8587] lg:hidden"
            aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <XMarkIcon aria-hidden="true" className="h-5 w-5" /> : <Bars3Icon aria-hidden="true" className="h-5 w-5" />}
          </button>
        </div>
      </div>
      {menuOpen && (
        <nav id="mobile-navigation" className="border-t border-[#e3eaed] bg-white px-5 py-3 lg:hidden" aria-label="Mobile navigation">
          <div className="mx-auto flex max-w-[1440px] flex-col gap-1 sm:px-3">
            <a className="rounded-lg px-3 py-3 text-sm font-extrabold text-[#39525d] transition-colors hover:bg-[#eef5f7] hover:text-[#0d8587]" href="#find-interpreter" onClick={() => setMenuOpen(false)}>Find an interpreter</a>
            <a className="rounded-lg px-3 py-3 text-sm font-extrabold text-[#39525d] transition-colors hover:bg-[#eef5f7] hover:text-[#0d8587]" href="#how-it-works" onClick={() => setMenuOpen(false)}>How it works</a>
            <a className="rounded-lg px-3 py-3 text-sm font-extrabold text-[#39525d] transition-colors hover:bg-[#eef5f7] hover:text-[#0d8587]" href="#safety" onClick={() => setMenuOpen(false)}>Trust &amp; safety</a>
            <a className="rounded-lg px-3 py-3 text-sm font-extrabold text-[#39525d] transition-colors hover:bg-[#eef5f7] hover:text-[#0d8587]" href="#community" onClick={() => setMenuOpen(false)}>Community</a>
            <a className="rounded-lg px-3 py-3 text-sm font-extrabold text-[#39525d] transition-colors hover:bg-[#eef5f7] hover:text-[#0d8587]" href="/language" onClick={() => setMenuOpen(false)}>EN / ไทย</a>
            <a className="rounded-lg px-3 py-3 text-sm font-extrabold text-[#39525d] transition-colors hover:bg-[#eef5f7] hover:text-[#0d8587]" href="/sign-in" onClick={() => setMenuOpen(false)}>Sign in</a>
          </div>
        </nav>
      )}
    </header>
  );
}
