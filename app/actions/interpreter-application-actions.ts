"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import {
  loadManagerInterpreterApplications,
  loadMyInterpreterApplication,
} from "@/app/lib/real-interpreter-application-data";

type ActionSuccess<T = undefined> = { ok: true; data: T };
type ActionFailure = { ok: false; error: string };
export type InterpreterApplicationActionResult<T = undefined> = ActionSuccess<T> | ActionFailure;

function friendlyError(error: { message?: string } | null): string {
  const message = error?.message ?? "";
  const known: Record<string, string> = {
    not_authenticated: "Your session has expired. Please sign in again.",
    applicant_name_required: "Enter your first and last name.",
    applicant_phone_required: "Enter a phone number.",
    application_language_required: "Select at least one language.",
    application_category_required: "Select at least one service category.",
    application_certificate_required: "Attach a certificate file before submitting.",
    unsupported_language: "One selected language is no longer available.",
    unsupported_category: "One selected category is no longer available.",
    approved_application_exists: "Your interpreter application is already approved.",
    manager_role_required: "Only a Manager or Admin can review applications.",
    invalid_review_decision: "This review decision is not supported.",
    review_note_required: "Add a note before requesting changes or rejecting the application.",
    application_not_found: "This application could not be found.",
    cancelled_application_not_reviewable: "Cancelled applications cannot be reviewed.",
    approved_application_requires_admin: "Only an Admin can change an approved application.",
    application_cancel_not_allowed: "This application can no longer be cancelled.",
    application_reupload_not_allowed: "This application is not waiting for a new document.",
    invalid_certificate_path: "The uploaded certificate could not be linked to your account.",
  };

  for (const [code, copy] of Object.entries(known)) {
    if (message.includes(code)) return copy;
  }
  return "Could not save this application change. Please try again.";
}

export async function uploadInterpreterCertificateAction(formData: FormData): Promise<InterpreterApplicationActionResult<{ path: string; fileName: string }>> {
  const fileValue = formData.get("file");
  if (!fileValue || typeof fileValue === "string" || typeof fileValue.arrayBuffer !== "function") {
    return { ok: false, error: "Choose a certificate file before uploading." };
  }

  const file = fileValue as File;
  if (file.size <= 0 || file.size > 10 * 1024 * 1024) {
    return { ok: false, error: "Certificate files must be between 1 byte and 10 MB." };
  }
  if (!["application/pdf", "image/jpeg", "image/png"].includes(file.type)) {
    return { ok: false, error: "Only PDF, JPG, and PNG certificate files are supported." };
  }

  const supabase = await createClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) return { ok: false, error: "Your session has expired. Please sign in again." };

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
  const path = `${userData.user.id}/${crypto.randomUUID()}-${safeName}`;
  const { error } = await supabase.storage
    .from("interpreter-certificates")
    .upload(path, file, { contentType: file.type, upsert: false });
  if (error) return { ok: false, error: "The certificate upload failed. Please try again." };

  return { ok: true, data: { path, fileName: file.name } };
}

export async function loadMyInterpreterApplicationAction() {
  try {
    return { ok: true as const, data: await loadMyInterpreterApplication() };
  } catch (error) {
    return { ok: false as const, error: friendlyError(error as { message?: string }) };
  }
}

export async function loadManagerInterpreterApplicationsAction() {
  try {
    return { ok: true as const, data: await loadManagerInterpreterApplications() };
  } catch (error) {
    return { ok: false as const, error: friendlyError(error as { message?: string }) };
  }
}

export async function submitInterpreterApplicationAction(input: {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  extraContact: string;
  assignedArea: string;
  languageCodes: string[];
  categoryCodes: string[];
  certificateFileName: string;
  certificateUrl: string;
}): Promise<InterpreterApplicationActionResult<{ applicationId: string }>> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("submit_interpreter_application", {
    p_first_name: input.firstName,
    p_last_name: input.lastName,
    p_phone: input.phone,
    p_email: input.email,
    p_extra_contact: input.extraContact,
    p_assigned_area: input.assignedArea,
    p_language_codes: input.languageCodes,
    p_category_codes: input.categoryCodes,
    p_certificate_file_name: input.certificateFileName,
    p_certificate_url: input.certificateUrl,
  });
  if (error || data === null || data === undefined) return { ok: false, error: friendlyError(error) };

  revalidatePath("/volunteer/apply");
  revalidatePath("/volunteer/status");
  revalidatePath("/volunteer/dashboard");
  revalidatePath("/manager");
  return { ok: true, data: { applicationId: String(data) } };
}

export async function cancelInterpreterApplicationAction(applicationId: string, reason: string): Promise<InterpreterApplicationActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.rpc("cancel_interpreter_application", {
    p_application_id: Number(applicationId),
    p_reason: reason,
  });
  if (error) return { ok: false, error: friendlyError(error) };
  revalidatePath("/volunteer/status");
  revalidatePath("/manager");
  return { ok: true, data: undefined };
}

export async function reuploadInterpreterCertificateAction(input: {
  applicationId: string;
  fileName: string;
  fileUrl: string;
}): Promise<InterpreterApplicationActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.rpc("reupload_interpreter_certificate", {
    p_application_id: Number(input.applicationId),
    p_certificate_file_name: input.fileName,
    p_certificate_url: input.fileUrl,
  });
  if (error) return { ok: false, error: friendlyError(error) };
  revalidatePath("/volunteer/status");
  revalidatePath("/manager");
  return { ok: true, data: undefined };
}

export async function reviewInterpreterApplicationAction(input: {
  applicationId: string;
  decision: "approved" | "needs_revision" | "rejected";
  note?: string;
}): Promise<InterpreterApplicationActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.rpc("review_interpreter_application", {
    p_application_id: Number(input.applicationId),
    p_decision: input.decision,
    p_note: input.note ?? null,
  });
  if (error) return { ok: false, error: friendlyError(error) };
  revalidatePath("/manager");
  revalidatePath("/volunteer/status");
  revalidatePath("/welcome");
  revalidatePath("/find-requests");
  return { ok: true, data: undefined };
}
