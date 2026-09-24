"use client";

import { useEffect, useRef } from "react";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { useUiLocale } from "./app-shell";

const copy = {
  th: {
    title: "ยังมีงานที่กำลังดำเนินการอยู่",
    body: "คุณมีคำขอความช่วยเหลือหรืองานล่ามที่ยังไม่เสร็จ จึงยังรับงานใหม่ไม่ได้ กรุณาดำเนินงานเดิมให้เสร็จหรือยกเลิกก่อน",
    close: "ปิด",
  },
  en: {
    title: "You already have an active task",
    body: "You have an unfinished help request or interpreter assignment. Finish or cancel it before claiming another request.",
    close: "Close",
  },
  zh: {
    title: "已有进行中的任务",
    body: "您有未完成的求助或口译任务。请先完成或取消当前任务，再接取新的任务。",
    close: "关闭",
  },
  es: {
    title: "Ya tienes una tarea activa",
    body: "Tienes una solicitud de ayuda o una asignación de interpretación sin terminar. Termínala o cancélala antes de aceptar otra solicitud.",
    close: "Cerrar",
  },
  ar: {
    title: "لديك مهمة نشطة بالفعل",
    body: "لديك طلب مساعدة أو مهمة ترجمة فورية غير مكتملة. أكملها أو ألغها قبل استلام طلب آخر.",
    close: "إغلاق",
  },
} as const;

export function ActiveTaskDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const locale = useUiLocale();
  const t = copy[locale];

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      aria-labelledby="active-assignment-dialog-title"
      aria-describedby="active-assignment-dialog-body"
      className="m-auto w-[min(26rem,calc(100vw-2rem))] rounded-(--khvi-radius-md) border border-(--khvi-teal)/25 bg-(--khvi-surface) p-6 text-center shadow-[0_24px_70px_rgba(16,40,58,0.26)] backdrop:bg-(--khvi-navy)/45 backdrop:backdrop-blur-sm"
    >
      <ExclamationTriangleIcon aria-hidden="true" className="mx-auto h-10 w-10 text-(--khvi-coral)" />
      <h2 id="active-assignment-dialog-title" className="mt-4 text-xl font-extrabold text-(--khvi-navy)">{t.title}</h2>
      <p id="active-assignment-dialog-body" className="mt-3 text-sm leading-7 text-(--khvi-ink)/80">{t.body}</p>
      <button type="button" onClick={() => dialogRef.current?.close()} className="mt-5 min-h-11 rounded-(--khvi-radius-sm) bg-(--khvi-navy) px-5 text-sm font-bold text-white hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--khvi-sun)">{t.close}</button>
    </dialog>
  );
}
