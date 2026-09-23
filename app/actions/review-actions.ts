"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";

type ReviewActionSuccess<T = undefined> = { ok: true; data: T };
type ReviewActionFailure = { ok: false; error: string };
export type ReviewActionResult<T = undefined> = ReviewActionSuccess<T> | ReviewActionFailure;

function friendlyError(error: { message?: string } | null): string {
  const message = error?.message ?? "";
  const known: Record<string, string> = {
    not_authenticated: "Your session has expired. Please sign in again.",
    booking_not_found: "This request could not be found.",
    review_not_allowed: "Only the requester can review a completed assignment.",
    review_rating_invalid: "Choose a rating from 1 to 5 stars.",
    review_comment_too_long: "Keep your comment within 1,000 characters.",
    review_already_exists: "You have already reviewed this assignment.",
  };

  for (const [code, copy] of Object.entries(known)) {
    if (message.includes(code)) return copy;
  }

  return "Could not submit the review. Please try again.";
}

export async function submitReviewAction(input: {
  bookingId: string;
  rating: number;
  comment: string;
}): Promise<ReviewActionResult<{ reviewId: string }>> {
  const bookingId = Number(input.bookingId);
  if (!Number.isSafeInteger(bookingId) || bookingId < 1) {
    return { ok: false, error: "This request could not be found." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("create_review", {
    p_booking_id: bookingId,
    p_rating: input.rating,
    p_comment: input.comment,
  });

  if (error || data === null || data === undefined) {
    return { ok: false, error: friendlyError(error) };
  }

  revalidatePath(`/user/my-requests/${bookingId}`);
  revalidatePath("/user/my-requests");
  revalidatePath("/interpreter/my-assignments");
  revalidatePath("/user");
  revalidatePath("/interpreter");
  revalidatePath("/admin");
  revalidatePath("/manager");

  return { ok: true, data: { reviewId: String(data) } };
}
