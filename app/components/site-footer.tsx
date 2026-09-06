import { BrandMark } from "./brand-mark";

export function SiteFooter() {
  return (
    <footer className="border-t border-white/10 bg-[#06273a] px-5 py-10 text-white sm:px-8 lg:px-12 lg:py-12">
      <div className="mx-auto max-w-[1320px]">
        <div className="grid gap-10 md:grid-cols-[1.5fr_0.75fr_0.75fr_1.1fr]">
          <div>
            <BrandMark light />
            <p className="mt-5 max-w-xs text-sm leading-6 text-white/60">Trusted language support for people, communities, and moments that matter.</p>
            <p className="mt-4 text-xs font-bold uppercase tracking-[0.12em] text-[#8ed5c4]">Built for clearer communication</p>
          </div>
          <nav aria-label="Footer explore">
            <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-white/45">Explore</p>
            <div className="mt-4 space-y-3 text-sm font-semibold text-white/75">
              <a className="block transition-colors hover:text-white" href="#find-interpreter">Find an interpreter</a>
              <a className="block transition-colors hover:text-white" href="#how-it-works">How it works</a>
              <a className="block transition-colors hover:text-white" href="#community">Community</a>
            </div>
          </nav>
          <nav aria-label="Footer support">
            <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-white/45">Support</p>
            <div className="mt-4 space-y-3 text-sm font-semibold text-white/75">
              <a className="block transition-colors hover:text-white" href="#safety">Trust &amp; safety</a>
              <a className="block transition-colors hover:text-white" href="/request-help">Request help</a>
              <a className="block transition-colors hover:text-white" href="/sign-in">Sign in</a>
            </div>
          </nav>
          <div className="border-l border-white/10 pl-0 md:pl-7">
            <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-white/45">Need help now?</p>
            <p className="mt-4 text-sm leading-6 text-white/65">Start a request and connect with a verified interpreter near you.</p>
            <a className="mt-5 inline-flex h-10 items-center rounded-lg bg-[#ef6747] px-4 text-xs font-extrabold text-white transition-colors hover:bg-[#f0785b]" href="/request-help">Request urgent help</a>
          </div>
        </div>
        <div className="mt-10 flex flex-col gap-3 border-t border-white/10 pt-5 text-xs text-white/45 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 KHVI Helper. Volunteer Interpreter Network.</p>
          <p>Private by default · Designed for real-world support</p>
        </div>
      </div>
    </footer>
  );
}
