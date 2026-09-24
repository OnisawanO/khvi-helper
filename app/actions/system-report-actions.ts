"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";

const systemReportCategories = new Set([
  "account_access",
  "requests_bookings",
  "map_location",
  "language_display",
  "other",
]);

type SystemReportInput = {
  category: string;
  title: string;
  description: string;
  bookingId: string;
};

type SystemReportActionResult = { ok: true } | { ok: false; error: string };

export async function submitSystemReportAction(
  input: SystemReportInput,
): Promise<SystemReportActionResult> {
  const category = input.category.trim();
  const title = input.title.trim();
  const description = input.description.trim();
  const bookingIdValue = input.bookingId.trim();

  if (!systemReportCategories.has(category)) {
    return { ok: false, error: "Choose a system area." };
  }

  if (title.length < 1 || title.length > 200) {
    return { ok: false, error: "Keep the subject between 1 and 200 characters." };
  }

  if (description.length < 1 || description.length > 5000) {
    return { ok: false, error: "Keep the description between 1 and 5,000 characters." };
  }

  let bookingId: number | null = null;
  if (bookingIdValue) {
    if (!/^\d+$/.test(bookingIdValue)) {
      return { ok: false, error: "Enter a valid booking ID or leave it blank." };
    }

    bookingId = Number(bookingIdValue);
    if (!Number.isSafeInteger(bookingId) || bookingId < 1) {
      return { ok: false, error: "Enter a valid booking ID or leave it blank." };
    }
  }

  const supabase = await createClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();
  const user = userData.user;

  if (userError || !user) {
    return { ok: false, error: "Sign in to report a system issue." };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role, is_locked")
    .eq("user_id", user.id)
    .maybeSingle();

  if (profileError || !profile || profile.is_locked || !["User", "Interpreter"].includes(profile.role)) {
    return { ok: false, error: "Only active User and Interpreter accounts can send system reports." };
  }

  if (bookingId !== null) {
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .select("booking_id")
      .eq("booking_id", bookingId)
      .or(`user_id.eq.${user.id},interpreter_id.eq.${user.id}`)
      .maybeSingle();

    if (bookingError || !booking) {
      return { ok: false, error: "You can only link a booking that belongs to you." };
    }
  }

  const { error: insertError } = await supabase.from("reports").insert({
    category,
    title,
    description,
    reporter_id: user.id,
    booking_id: bookingId,
  });

  if (insertError) {
    return { ok: false, error: "Could not send the report. Please try again." };
  }

  revalidatePath("/manager");
  revalidatePath("/admin");

  return { ok: true };
}
