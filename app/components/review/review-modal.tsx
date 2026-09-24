"use client";

import { useEffect, useRef, useState, useTransition, type FormEvent } from "react";
import { CheckCircleIcon, StarIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { submitReviewAction } from "@/app/actions/review-actions";
import { useUiLocale } from "@/app/components/app-shell";
import type { Review } from "@/app/lib/request-types";

export type SubmittedReview = {
  rating: number;
  comment: string;
};

type ReviewModalProps = {
  open: boolean;
  bookingId: string;
  interpreterName: string;
  interpreterLanguage: string;
  completedAt: string | null;
  existingReview?: Review | null;
  onClose: () => void;
  onSubmitted: (review: SubmittedReview) => void;
};

const copy = {
  en: {
    eyebrow: "Completed job",
    title: "How was your interpreter?",
    intro: "Your feedback helps the KHVI community find dependable language support.",
    ratingLegend: "Select a rating",
    starLabel: (rating: number) => `${rating} out of 5 stars`,
    commentLabel: "Share a note (optional)",
    commentHint: "Tell us what helped you most during this session.",
    submit: "Submit review",
    saving: "Saving…",
    cancel: "Not now",
    close: "Close review dialog",
    completed: "Completed",
    successTitle: "Thanks for your review",
    successBody: "Your feedback is ready for this completed job.",
    done: "Done",
    required: "Choose a star rating before submitting.",
  },
  th: {
    eyebrow: "งานเสร็จสิ้นแล้ว",
    title: "คุณรู้สึกอย่างไรกับการช่วยเหลือของล่าม?",
    intro: "ความคิดเห็นของคุณช่วยให้ชุมชนเลือกใช้บริการล่ามที่ไว้ใจได้",
    ratingLegend: "เลือกคะแนน",
    starLabel: (rating: number) => `${rating} จาก 5 ดาว`,
    commentLabel: "เขียนความคิดเห็นเพิ่มเติม (ไม่บังคับ)",
    commentHint: "บอกสิ่งที่ช่วยให้การสื่อสารครั้งนี้ราบรื่นขึ้น",
    submit: "ส่งรีวิว",
    saving: "กำลังบันทึก…",
    cancel: "ไว้ทีหลัง",
    close: "ปิดหน้าต่างรีวิว",
    completed: "เสร็จสิ้น",
    successTitle: "ขอบคุณสำหรับรีวิว",
    successBody: "เตรียมความคิดเห็นของคุณสำหรับงานนี้แล้ว",
    done: "เรียบร้อย",
    required: "กรุณาเลือกคะแนนก่อนส่งรีวิว",
  },
  zh: {
    eyebrow: "任务已完成",
    title: "这次口译服务怎么样？",
    intro: "你的反馈可以帮助社区找到可靠的语言支持。",
    ratingLegend: "选择评分",
    starLabel: (rating: number) => `${rating} / 5 星`,
    commentLabel: "补充说明（可选）",
    commentHint: "告诉我们这次服务中最有帮助的部分。",
    submit: "提交评价",
    saving: "正在保存…",
    cancel: "稍后再说",
    close: "关闭评价窗口",
    completed: "已完成",
    successTitle: "感谢你的评价",
    successBody: "这条评价已准备好用于本次已完成的任务。",
    done: "完成",
    required: "提交前请选择星级。",
  },
  es: {
    eyebrow: "Trabajo completado",
    title: "¿Cómo fue tu intérprete?",
    intro: "Tu opinión ayuda a la comunidad de KHVI a encontrar apoyo lingüístico confiable.",
    ratingLegend: "Elige una calificación",
    starLabel: (rating: number) => `${rating} de 5 estrellas`,
    commentLabel: "Comparte una nota (opcional)",
    commentHint: "Cuéntanos qué te ayudó más durante esta sesión.",
    submit: "Enviar reseña",
    saving: "Guardando…",
    cancel: "Ahora no",
    close: "Cerrar el cuadro de reseña",
    completed: "Completado",
    successTitle: "Gracias por tu reseña",
    successBody: "Tu reseña se ha guardado para este trabajo completado.",
    done: "Listo",
    required: "Elige una calificación antes de enviar la reseña.",
  },
  ar: {
    eyebrow: "مهمة مكتملة",
    title: "كيف كانت خدمة المترجم؟",
    intro: "تساعد ملاحظاتك مجتمع KHVI على العثور على دعم لغوي موثوق.",
    ratingLegend: "اختر تقييمًا",
    starLabel: (rating: number) => `${rating} من 5 نجوم`,
    commentLabel: "أضف ملاحظة (اختياري)",
    commentHint: "أخبرنا بما كان أكثر فائدة خلال هذه الجلسة.",
    submit: "إرسال التقييم",
    saving: "جارٍ الحفظ…",
    cancel: "ليس الآن",
    close: "إغلاق نافذة التقييم",
    completed: "مكتمل",
    successTitle: "شكرًا على تقييمك",
    successBody: "تم حفظ تقييمك لهذه المهمة المكتملة.",
    done: "تم",
    required: "اختر تقييمًا بالنجوم قبل الإرسال.",
  },
} as const;

function getCopy(locale: ReturnType<typeof useUiLocale>) {
  return copy[locale];
}

export function ReviewModal({
  open,
  bookingId,
  interpreterName,
  interpreterLanguage,
  completedAt,
  existingReview,
  onClose,
  onSubmitted,
}: ReviewModalProps) {
  const locale = useUiLocale();
  const t = getCopy(locale);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const [rating, setRating] = useState(existingReview?.rating ?? 0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState(existingReview?.comment ?? "");
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(Boolean(existingReview));
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!open) return;

    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (rating < 1 || rating > 5) {
      setError(t.required);
      return;
    }

    setError(null);
    startTransition(async () => {
      const result = await submitReviewAction({ bookingId, rating, comment });
      if (!result.ok) {
        setError(result.error);
        return;
      }

      const review = { rating, comment: comment.trim() };
      setSubmitted(true);
      onSubmitted(review);
    });
  }

  const visibleRating = hoveredRating || rating;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#092f45]/60 p-4 backdrop-blur-[2px]"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        aria-labelledby="review-modal-title"
        aria-modal="true"
        className="relative max-h-[min(760px,calc(100vh-2rem))] w-full max-w-[620px] overflow-y-auto rounded-[var(--khvi-radius-lg)] bg-(--khvi-surface) shadow-(--khvi-shadow-raised)"
        role="dialog"
      >
        <div className="border-b border-[#dbe7e8] bg-[#f3faf6] px-6 py-6 sm:px-8">
          <button
            ref={closeButtonRef}
            aria-label={t.close}
            className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#cfe0df] bg-white text-[#315363] transition-colors hover:border-[#087f80] hover:text-[#087f80] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-(--khvi-sun)"
            type="button"
            onClick={onClose}
          >
            <XMarkIcon aria-hidden="true" className="h-5 w-5" />
          </button>
          <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#087557]">{t.eyebrow}</p>
          <h2 id="review-modal-title" className="mt-2 max-w-[470px] text-2xl font-extrabold tracking-tight text-(--khvi-navy) sm:text-3xl">
            {submitted ? t.successTitle : t.title}
          </h2>
          <p className="mt-2 max-w-[500px] text-sm leading-6 text-[#52676f]">
            {submitted ? t.successBody : t.intro}
          </p>
        </div>

        <div className="px-6 py-6 sm:px-8 sm:py-7">
          <div className="flex items-center gap-3 rounded-xl border border-[#dbe7e8] bg-[#fbfdfd] p-4">
            <span aria-hidden="true" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#dff2ea] text-[#087557]">
              <span className="text-lg font-extrabold">{interpreterName.slice(0, 1).toUpperCase()}</span>
            </span>
            <div className="min-w-0">
              <p className="truncate text-base font-extrabold text-[#173646]">{interpreterName}</p>
              <p className="mt-0.5 text-xs font-bold text-[#5c8073]">{interpreterLanguage}</p>
            </div>
            <span className="ml-auto shrink-0 rounded-full bg-[#e6f4ef] px-3 py-1 text-xs font-extrabold text-[#087557]">
              {t.completed}
            </span>
          </div>

          {completedAt && <p className="mt-3 text-xs font-semibold text-[#73848a]">{completedAt}</p>}

          {submitted ? (
            <div className="mt-8 text-center">
              <CheckCircleIcon aria-hidden="true" className="mx-auto h-14 w-14 text-[#087557]" />
              <div className="mt-4 flex justify-center gap-1" aria-label={t.starLabel(rating)}>
                {Array.from({ length: 5 }, (_, index) => (
                  <StarIcon
                    key={index}
                    aria-hidden="true"
                    className={`h-7 w-7 ${index < rating ? "fill-[#f0a35f] text-[#e0952f]" : "text-[#cbd7dc]"}`}
                  />
                ))}
              </div>
              {comment && <p className="mx-auto mt-4 max-w-[440px] text-sm leading-7 text-[#52676f]">“{comment}”</p>}
              <button
                className="mt-7 inline-flex min-h-11 items-center justify-center rounded-lg bg-(--khvi-navy) px-6 text-sm font-extrabold text-white transition-colors hover:bg-[#0c4960] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-(--khvi-sun)"
                type="button"
                onClick={onClose}
              >
                {t.done}
              </button>
            </div>
          ) : (
            <form className="mt-8" onSubmit={handleSubmit}>
              <fieldset>
                <legend className="text-sm font-extrabold text-[#173646]">{t.ratingLegend}</legend>
                <div className="mt-3 flex gap-1" onMouseLeave={() => setHoveredRating(0)}>
                  {Array.from({ length: 5 }, (_, index) => {
                    const starRating = index + 1;
                    return (
                      <button
                        key={starRating}
                        aria-label={t.starLabel(starRating)}
                        aria-pressed={rating === starRating}
                        className="rounded-lg p-1 text-[#cbd7dc] transition-colors hover:text-[#e0952f] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-(--khvi-sun)"
                        type="button"
                        onClick={() => {
                          setRating(starRating);
                          setError(null);
                        }}
                        onMouseEnter={() => setHoveredRating(starRating)}
                      >
                        <StarIcon aria-hidden="true" className={`h-9 w-9 ${starRating <= visibleRating ? "fill-[#f0a35f] text-[#e0952f]" : ""}`} />
                      </button>
                    );
                  })}
                </div>
              </fieldset>

              <div className="mt-7">
                <label className="text-sm font-extrabold text-[#173646]" htmlFor="review-comment">
                  {t.commentLabel}
                </label>
                <textarea
                  id="review-comment"
                  aria-describedby="review-comment-hint review-comment-count"
                  className="mt-2 min-h-32 w-full resize-y rounded-xl border border-[#cbd7dc] bg-white px-4 py-3 text-sm font-semibold text-(--khvi-ink) placeholder:text-[#8a9aa0] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-(--khvi-sun)"
                  maxLength={1000}
                  placeholder={t.commentHint}
                  value={comment}
                  onChange={(event) => setComment(event.target.value)}
                />
                <div className="mt-1.5 flex items-start justify-between gap-4 text-xs leading-5 text-[#73848a]">
                  <span id="review-comment-hint">{t.commentHint}</span>
                  <span id="review-comment-count" className="shrink-0">{comment.length}/1000</span>
                </div>
              </div>

              {error && <p className="mt-4 text-sm font-bold text-(--khvi-coral)" role="alert">{error}</p>}

              <div className="mt-7 grid gap-2 sm:grid-cols-[1fr_auto] sm:flex-row-reverse">
                <button
                  className="inline-flex min-h-12 items-center justify-center rounded-lg bg-(--khvi-navy) px-5 text-sm font-extrabold text-white transition-colors hover:bg-[#0c4960] disabled:cursor-not-allowed disabled:opacity-45 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-(--khvi-sun)"
                  disabled={rating === 0 || isPending}
                  type="submit"
                >
                  {isPending ? t.saving : t.submit}
                </button>
                <button
                  className="inline-flex min-h-12 items-center justify-center rounded-lg border border-[#cbd7dc] bg-white px-5 text-sm font-extrabold text-[#315363] transition-colors hover:border-[#087f80] hover:text-[#087f80] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-(--khvi-sun)"
                  type="button"
                  onClick={onClose}
                >
                  {t.cancel}
                </button>
              </div>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}
