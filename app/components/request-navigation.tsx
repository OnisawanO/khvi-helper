"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCopyLocale } from "./app-shell";
export function RequestNavigation() {
  const path = usePathname();
  const zh = useCopyLocale() === "zh";
  return <div className="border-b border-(--khvi-teal)/20 px-6 py-4">
    <nav aria-label="Requester navigation" className="mx-auto flex max-w-6xl flex-wrap gap-5 text-sm">
      {[[zh ? "欢迎" : "Welcome", "/welcome"], [zh ? "创建请求" : "New request", "/request-help"], [zh ? "我的请求" : "My requests", "/my-requests"]].map(([label, href]) =>
        <Link key={href} href={href} aria-current={path === href || path.startsWith(href + "/") ? "page" : undefined} className="py-1 aria-[current=page]:font-bold aria-[current=page]:underline">{label}</Link>)}
    </nav>
    <p className="mx-auto mt-3 max-w-6xl text-xs leading-5 text-(--khvi-ink)/70">{zh ? "试用模式：请求仅保存在此浏览器中，不会发送给真实口译员。请勿填写敏感信息。" : "Preview: requests are saved only in this browser and are not sent to real interpreters. Please use sample information."}</p>
  </div>;
}
