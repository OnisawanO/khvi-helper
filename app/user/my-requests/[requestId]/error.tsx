"use client";

import Link from "next/link";
import { useEffect } from "react";
import { ArrowPathIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";

export default function RequestDetailError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error("Request detail failed to load", error);
  }, [error]);

  return (
    <main className="flex min-h-[70vh] items-center justify-center bg-(--khvi-paper) px-5 py-12 text-(--khvi-ink)">
      <section className="w-full max-w-xl rounded-(--khvi-radius-md) border border-(--khvi-teal)/25 bg-white p-6 sm:p-8" role="alert">
        <p className="text-sm font-bold text-(--khvi-coral)">Mission temporarily unavailable</p>
        <h1 className="mt-2 text-2xl font-extrabold">โหลดรายละเอียดภารกิจไม่สำเร็จ</h1>
        <p className="mt-3 text-sm leading-7 text-(--khvi-ink)/70">
          ระบบไม่สามารถโหลดข้อมูลภารกิจได้ในขณะนี้ ลองใหม่อีกครั้ง หรือกลับไปเลือกรายการจากหน้าคำขอและงานของคุณ
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={retry}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-(--khvi-radius-sm) bg-(--khvi-navy) px-5 py-3 text-sm font-bold text-white hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--khvi-sun)"
          >
            <ArrowPathIcon aria-hidden="true" className="h-5 w-5" />
            ลองอีกครั้ง
          </button>
          <Link
            href="/user#main-content"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-(--khvi-radius-sm) border border-(--khvi-teal)/35 bg-white px-5 py-3 text-sm font-bold hover:bg-(--khvi-paper) focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--khvi-sun)"
          >
            <ArrowLeftIcon aria-hidden="true" className="h-5 w-5" />
            กลับหน้าติดตามภารกิจ
          </Link>
        </div>
      </section>
    </main>
  );
}
