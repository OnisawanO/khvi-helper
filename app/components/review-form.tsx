"use client";

import { useState, useTransition } from "react";
import { submitReviewAction } from "@/app/actions/review-actions";
import { useCopyLocale } from "@/app/components/app-shell";
import type { Review } from "@/app/lib/mock-requests";

const copy = {
  en: {
    title: "Review this interpreter",
    submitted: "Your review",
    rating: "Rating",
    comment: "Comment (optional)",
    placeholder: "Share a short comment about the help you received.",
    submit: "Submit review",
    submitting: "Submitting…",
    required: "Choose a rating before submitting.",
    success: "Review submitted.",
    outOf: "out of 5",
  },
  th: {
    title: "รีวิวล่าม",
    submitted: "รีวิวของคุณ",
    rating: "คะแนน",
    comment: "ความคิดเห็น (ไม่บังคับ)",
    placeholder: "แบ่งปันความคิดเห็นสั้น ๆ เกี่ยวกับการช่วยเหลือที่ได้รับ",
    submit: "ส่งรีวิว",
    submitting: "กำลังส่ง…",
    required: "กรุณาเลือกคะแนนก่อนส่งรีวิว",
    success: "ส่งรีวิวแล้ว",
    outOf: "จาก 5",
  },
  zh: {
    title: "评价口译员",
    submitted: "你的评价",
    rating: "评分",
    comment: "评论（可选）",
    placeholder: "分享你对本次帮助的简短评价。",
    submit: "提交评价",
    submitting: "正在提交…",
    required: "提交前请选择评分。",
    success: "评价已提交。",
    outOf: "满分 5 分",
  },
} as const;

export function ReviewForm({
  bookingId,
  interpreterName,
  existingReview,
}: {
  bookingId: string;
  interpreterName: string;
  existingReview: Review | null | undefined;
}) {
  const copyLocale = useCopyLocale();
  const t = copy[copyLocale];
  const [review, setReview] = useState<Review | null | undefined>(existingReview);
  const [rating, setRating] = useState(existingReview?.rating ?? 0);
  const [comment, setComment] = useState(existingReview?.comment ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function submit() {
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

      const now = new Date().toISOString();
      setReview({
        reviewId: result.data.reviewId,
        bookingId,
        reviewerId: "current-user",
        revieweeId: "interpreter",
        rating,
        comment: comment.trim() || null,
        createdAt: now,
        createdAtLabel: t.success,
      });
    });
  }

  return (
    <section className="border border-[#d6e0e4] bg-white p-5 sm:p-6" aria-labelledby="review-title">
      <h2 id="review-title" className="text-base font-extrabold text-[#173646]">{review ? t.submitted : t.title}</h2>
      <p className="mt-1 text-sm text-[#64777e]">{interpreterName}</p>

      {review ? (
        <div className="mt-4" aria-live="polite">
          <p className="font-bold text-[#e0952f]">{"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)} <span className="ml-2 text-sm text-[#52676f]">{review.rating} {t.outOf}</span></p>
          {review.comment && <p className="mt-3 text-sm leading-6 text-[#52676f]">{review.comment}</p>}
          <p className="mt-3 text-xs font-bold text-[#087557]">{review.createdAtLabel || t.success}</p>
        </div>
      ) : (
        <div className="mt-4 space-y-4">
          <fieldset>
            <legend className="text-sm font-bold text-[#294554]">{t.rating}</legend>
            <div className="mt-2 flex gap-2" role="radiogroup" aria-label={t.rating}>
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  role="radio"
                  aria-checked={rating === value}
                  aria-label={`${value} ${t.outOf}`}
                  className={`text-2xl ${rating >= value ? "text-[#e0952f]" : "text-[#b9c8ce]"}`}
                  onClick={() => setRating(value)}
                >
                  ★
                </button>
              ))}
            </div>
          </fieldset>

          <label className="block text-sm font-bold text-[#294554]">
            {t.comment}
            <textarea
              className="mt-2 min-h-24 w-full rounded-lg border border-[#cbd7dc] px-3 py-2 text-sm font-normal"
              maxLength={1000}
              value={comment}
              placeholder={t.placeholder}
              onChange={(event) => setComment(event.target.value)}
            />
          </label>

          {error && <p role="alert" className="text-sm font-bold text-[#c33a2a]">{error}</p>}
          <button
            type="button"
            className="min-h-11 rounded-lg bg-[#087f80] px-4 py-2 text-sm font-extrabold text-white hover:bg-[#066a6a] disabled:opacity-60"
            disabled={isPending}
            onClick={submit}
          >
            {isPending ? t.submitting : t.submit}
          </button>
        </div>
      )}
    </section>
  );
}
