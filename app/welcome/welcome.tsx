"use client";
import Link from "next/link";
import { useRequests } from "@/app/lib/request-store";
import { useCopyLocale } from "@/app/components/app-shell";

export function Welcome() {
  const { requests, ready } = useRequests();
  const zh = useCopyLocale() === "zh";
  const active = requests.filter((r) => ["Open", "Claimed", "InProgress"].includes(r.status));
  return <main id="main-content" className="mx-auto w-full max-w-5xl flex-1 px-6 py-12">
    <p className="font-semibold text-(--khvi-teal)">KHVI Helper</p>
    <h1 className="mt-3 text-3xl font-bold sm:text-4xl">{zh ? "您需要语言帮助吗？" : "Need help communicating?"}</h1>
    <p className="mt-4 max-w-2xl leading-7">{zh ? "选择语言、事项和见面地点，然后查看请求进度。" : "Choose the language, situation and meeting point. Track your request and contact your interpreter once they accept."}</p>
    <div className="mt-8 flex flex-wrap gap-3">
      <Link href="/request-help" className="rounded-lg bg-(--khvi-navy) px-6 py-3 font-bold text-white">{zh ? "创建求助请求" : "Create a help request"}</Link>
      <Link href="/my-requests" className="rounded-lg border border-(--khvi-teal) px-6 py-3 font-bold">{zh ? "我的请求" : "My requests"}</Link>
    </div>
    {ready && active.length > 0 && <section className="mt-10 border-y border-(--khvi-teal)/30 py-6">
      <h2 className="text-xl font-bold">{zh ? "继续查看请求" : "Continue your request"} ({active.length})</h2>
      <p className="my-3">{active[0].exactAddress}</p>
      <Link className="font-bold text-(--khvi-teal) underline" href={`/my-requests/${active[0].requestId}`}>{zh ? "查看状态" : "View latest request status"} →</Link>
    </section>}
    <ol className="mt-10 grid gap-6 sm:grid-cols-3">
      {(zh ? [
        ["1. 提交请求", "填写语言、事项、地点和时间。"],
        ["2. 等待接单", "接单后显示口译员联系方式。"],
        ["3. 确认完成", "双方确认后，请求才会完成。"],
      ] : [
        ["1. Create your request", "Add one language, one category, a meeting point and a time."],
        ["2. Wait for an interpreter", "After an interpreter accepts, contact them to arrange the meeting."],
        ["3. Confirm completion", "Once the work is done, both of you confirm to close the request."],
      ]).map(([title, body]) => <li key={title}><h2 className="font-bold">{title}</h2><p className="mt-2 text-sm leading-6">{body}</p></li>)}
    </ol>
  </main>;
}
