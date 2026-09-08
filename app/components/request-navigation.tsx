"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCopyLocale } from "./app-shell";
export function RequestNavigation() {
  const path = usePathname();
  const zh = useCopyLocale() === "zh";
  const shouldHideNavigation =
    path === "/welcome" || path === "/request-help" || path.startsWith("/my-requests");
  const scrollToMainContent = () => requestAnimationFrame(() => document.getElementById("main-content")?.scrollIntoView({ block: "start" }));
  const navItems = [
    [zh ? "创建请求" : "New request", "/request-help#main-content", "/request-help"],
    [zh ? "我的请求" : "My requests", "/my-requests#main-content", "/my-requests"],
  ];
  if (shouldHideNavigation) return null;

  return <div className="border-b border-(--khvi-teal)/20 px-6 py-4">
    <nav aria-label="Requester navigation" className="mx-auto flex max-w-6xl flex-wrap gap-5 text-sm">
      {navItems.map(([label, href, baseHref]) =>
        <Link key={href} href={href} scroll aria-current={path === baseHref || path.startsWith(baseHref + "/") ? "page" : undefined} className="py-1 aria-[current=page]:font-bold aria-[current=page]:underline" onClick={scrollToMainContent}>{label}</Link>)}
    </nav>
    <p className="mx-auto mt-3 max-w-6xl text-xs leading-5 text-(--khvi-ink)/70">{zh ? "试用模式：请求仅保存在此浏览器中，不会发送给真实口译员。请勿填写敏感信息。" : "Preview: requests are saved only in this browser and are not sent to real interpreters. Please use sample information."}</p>
  </div>;
}
