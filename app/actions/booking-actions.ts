"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";

type ActionSuccess<T = undefined> = { ok: true; data: T };
type ActionFailure = { ok: false; error: string; code?: string };
export type BookingActionResult<T = undefined> = ActionSuccess<T> | ActionFailure;

function friendlyError(error: { message?: string } | null): string {
  const message = error?.message ?? "";
  const known: Record<string, string> = {
    not_authenticated: "Your session has expired. Please sign in again.",
    booking_not_found: "This request could not be found.",
    booking_not_available: "This request is no longer available.",
    active_workspace_task_exists: "You already have an active request or assignment. Finish it before starting another.",
    active_assignment_exists: "You already have an active request or assignment. Finish it before starting another.",
    cannot_claim_own_booking: "You cannot claim your own request.",
    interpreter_role_required: "Only an approved interpreter can claim a request.",
    interpreter_skill_mismatch: "This request does not match your approved skills.",
    booking_confirmation_not_allowed: "This request cannot be confirmed in its current state.",
    booking_start_not_allowed: "The requester must confirm you before work can start.",
    booking_completion_not_allowed: "Work must be in progress before it can be completed.",
    booking_actor_not_allowed: "You do not have access to this request.",
    cancel_reason_required: "Add a reason before cancelling.",
    booking_cannot_be_cancelled: "This request cannot be cancelled.",
    booking_cannot_be_withdrawn: "This assignment cannot be withdrawn.",
    booking_update_not_allowed: "This request can no longer be edited.",
    scheduled_at_required: "Choose an appointment time.",
    scheduled_at_must_be_next_day_or_later: "Choose tomorrow or a later appointment date.",
    unsupported_reference_value: "The selected language or category is no longer available.",
    invalid_coordinates: "The browser returned an invalid location.",
    location_update_not_allowed: "This mission does not accept your location.",
  };

  for (const [code, copy] of Object.entries(known)) {
    if (message.includes(code)) return copy;
  }

  return "Could not save this change. Please try again.";
}

function errorCode(error: { message?: string } | null): string | undefined {
  const message = error?.message ?? "";
  return Object.keys({
    not_authenticated: true,
    booking_not_found: true,
    booking_not_available: true,
    cannot_claim_own_booking: true,
    interpreter_role_required: true,
    interpreter_skill_mismatch: true,
    active_workspace_task_exists: true,
    active_assignment_exists: true,
    booking_confirmation_not_allowed: true,
    booking_start_not_allowed: true,
    booking_completion_not_allowed: true,
    booking_actor_not_allowed: true,
    cancel_reason_required: true,
    booking_cannot_be_cancelled: true,
    booking_cannot_be_withdrawn: true,
    booking_update_not_allowed: true,
    scheduled_at_required: true,
    scheduled_at_must_be_next_day_or_later: true,
    unsupported_reference_value: true,
    invalid_coordinates: true,
    location_update_not_allowed: true,
  }).find((code) => message.includes(code));
}

async function runVoidRpc(functionName: string, args: Record<string, unknown>): Promise<BookingActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.rpc(functionName, args);
  if (error) return { ok: false, error: friendlyError(error), code: errorCode(error) };

  revalidatePath("/request-help");
  revalidatePath("/my-requests");
  revalidatePath("/my-assignments");
  revalidatePath("/find-requests");
  revalidatePath("/welcome");
  const bookingId = Number(args.p_booking_id);
  if (Number.isSafeInteger(bookingId) && bookingId > 0) {
    revalidatePath(`/my-requests/${bookingId}`);
  }
  return { ok: true, data: undefined };
}

export async function createBookingAction(input: {
  languageId: string;
  categoryId: string;
  description: string;
  urgency: "Immediate" | "Scheduled";
  exactAddress: string;
  latitude: number | null;
  longitude: number | null;
  scheduledAt: string | null;
}): Promise<BookingActionResult<{ requestId: string }>> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("create_booking", {
    p_language_code: input.languageId,
    p_category_code: input.categoryId,
    p_description: input.description,
    p_location_name: "Approximate area",
    p_exact_address: input.exactAddress,
    p_latitude: input.latitude,
    p_longitude: input.longitude,
    p_urgency: input.urgency === "Scheduled" ? "scheduled" : "immediate",
    p_scheduled_at: input.scheduledAt,
  });

  if (error || data === null || data === undefined) {
    return { ok: false, error: friendlyError(error), code: errorCode(error) };
  }

  revalidatePath("/my-requests");
  revalidatePath("/find-requests");
  revalidatePath("/my-assignments");
  revalidatePath("/welcome");
  return { ok: true, data: { requestId: String(data) } };
}

export async function claimBookingAction(bookingId: string): Promise<BookingActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.rpc("claim_booking", { p_booking_id: Number(bookingId) });
  if (error) return { ok: false, error: friendlyError(error), code: errorCode(error) };
  revalidatePath("/find-requests");
  revalidatePath("/my-assignments");
  revalidatePath("/my-requests");
  revalidatePath(`/my-requests/${bookingId}`);
  revalidatePath("/welcome");
  return { ok: true, data: undefined };
}

export async function confirmBookingInterpreterAction(bookingId: string) {
  return runVoidRpc("confirm_booking_interpreter", { p_booking_id: Number(bookingId) });
}

export async function startBookingAction(bookingId: string) {
  return runVoidRpc("start_booking", { p_booking_id: Number(bookingId) });
}

export async function confirmBookingCompletionAction(bookingId: string) {
  return runVoidRpc("confirm_booking_completion", { p_booking_id: Number(bookingId) });
}

export async function cancelBookingAction(bookingId: string, reason: string) {
  return runVoidRpc("cancel_booking", { p_booking_id: Number(bookingId), p_reason: reason });
}

export async function updateBookingDetailsAction(input: {
  bookingId: string;
  languageId: string;
  categoryId: string;
  description: string;
  locationName: string;
}) {
  return runVoidRpc("update_booking_details", {
    p_booking_id: Number(input.bookingId),
    p_language_code: input.languageId,
    p_category_code: input.categoryId,
    p_description: input.description,
    p_location_name: input.locationName,
    p_exact_address: input.locationName,
  });
}

export async function saveMissionLocationAction(input: {
  bookingId: string;
  latitude: number;
  longitude: number;
}) {
  return runVoidRpc("save_mission_location", {
    p_booking_id: Number(input.bookingId),
    p_latitude: input.latitude,
    p_longitude: input.longitude,
  });
}
