import type { SupabaseClient } from "@supabase/supabase-js";

export type InterpreterRating = {
  average: number | null;
  reviewCount: number;
};

export async function loadMyInterpreterRating(supabase: SupabaseClient, interpreterId: string): Promise<InterpreterRating> {
  const { data, error } = await supabase.rpc("get_interpreter_rating", {
    p_interpreter_id: interpreterId,
  });
  if (error) throw error;

  const row = Array.isArray(data) ? data[0] : null;
  // The deployed RPC returns no row when the interpreter has no reviews.
  if (!row) return { average: null, reviewCount: 0 };
  const reviewCount = Number(row?.review_count);
  const average = row?.average_rating == null ? null : Number(row.average_rating);

  if (!Number.isSafeInteger(reviewCount) || reviewCount < 0 || (reviewCount > 0 && (average === null || !Number.isFinite(average) || average < 1 || average > 5))) {
    throw new Error("Invalid interpreter rating summary");
  }

  return { average: reviewCount === 0 ? null : average, reviewCount };
}
