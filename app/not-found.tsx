import Link from "next/link";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#fbf8f1] px-6 text-[#10283a]">
      <section className="w-full max-w-lg rounded-[22px] border border-[#e6ddd0] bg-white p-8 text-center shadow-[0_18px_45px_rgba(66,60,45,0.08)]">
        <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#0d8587]">Still building...</p>
        <h1 className="mt-3 text-3xl font-extrabold tracking-[-0.04em]">หน้านี้กำลังอยู่ระหว่างการพัฒนา</h1>
        <p className="mt-3 text-sm leading-7 text-[#6c797d]">ตอนนี้สามารถดู landing page ของ KHVI Helper ได้จากหน้าแรก</p>
        <Link className="mt-6 inline-flex h-11 items-center gap-2 rounded-xl bg-[#092f45] px-5 text-sm font-extrabold text-white" href="/"><ArrowLeftIcon aria-hidden="true" className="h-4 w-4" />กลับหน้าแรก</Link>
      </section>
    </main>
  );
}
