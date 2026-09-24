"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
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

  revalidatePath("/user/volunteer/apply");
  revalidatePath("/user/volunteer/status");
  revalidatePath("/user/volunteer/dashboard");
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
  revalidatePath("/user/volunteer/status");
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
  revalidatePath("/user/volunteer/status");
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
  revalidatePath("/user/volunteer/status");
  revalidatePath("/user");
  revalidatePath("/interpreter");
  revalidatePath("/interpreter/find-requests");
  return { ok: true, data: undefined };
}

export type UpdateInterpreterProfileInput = {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  extraContact: string;
  assignedArea: string;
  languages: {
    code: string;
    level?: string;
    isPrimary?: boolean;
  }[];
  categoryCodes: string[];
  certificateFileName: string;
  certificateUrl: string;
};

export async function updateInterpreterProfileAction(
  input: UpdateInterpreterProfileInput
): Promise<InterpreterApplicationActionResult<{ applicationId: string }>> {
  const supabase = await createClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    return { ok: false, error: "Your session has expired. Please sign in again." };
  }

  const userId = userData.user.id;
  const languageCodes = input.languages.map((l) => l.code);

  // 1. Try calling the RPC first
  const { data: rpcData, error: rpcError } = await supabase.rpc("submit_interpreter_application", {
    p_first_name: input.firstName,
    p_last_name: input.lastName,
    p_phone: input.phone,
    p_email: input.email,
    p_extra_contact: input.extraContact,
    p_assigned_area: input.assignedArea,
    p_language_codes: languageCodes,
    p_category_codes: input.categoryCodes,
    p_certificate_file_name: input.certificateFileName,
    p_certificate_url: input.certificateUrl,
  });

  let applicationId: string | null = rpcData ? String(rpcData) : null;

  if (rpcError) {
    let adminClient;
    try {
      adminClient = createAdminClient();
    } catch {
      adminClient = null;
    }
    const dbClient = adminClient ?? supabase;

    const { data: appRow, error: findError } = await dbClient
      .from("interpreter_applications")
      .select("application_id")
      .eq("user_id", userId)
      .neq("status", "cancelled")
      .order("application_id", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (findError || !appRow) {
      return { ok: false, error: friendlyError(rpcError) };
    }

    applicationId = String(appRow.application_id);

    const updatePayload = {
      applicant_name: `${input.firstName.trim()} ${input.lastName.trim()}`,
      phone: input.phone.trim(),
      email: input.email.trim(),
      extra_contact: input.extraContact.trim() || null,
      assigned_area: input.assignedArea.trim() || null,
      certificate_file_name: input.certificateFileName.trim(),
      certificate_url: input.certificateUrl.trim() || null,
      status: "pending",
      reject_reason: null,
      revision_note: null,
      cancellation_reason: null,
      cancelled_at: null,
      cancelled_by_user_id: null,
      reviewed_at: null,
      reviewed_by_user_id: null,
      submitted_at: new Date().toISOString(),
      is_profile_update: true,
    };
    let { error: updateError } = await dbClient
      .from("interpreter_applications")
      .update(updatePayload)
      .eq("application_id", Number(applicationId));

    if (updateError?.code === "42703" && updateError.message.includes("is_profile_update")) {
      const legacyPayload: Partial<typeof updatePayload> = { ...updatePayload };
      delete legacyPayload.is_profile_update;
      const legacyResult = await dbClient
        .from("interpreter_applications")
        .update(legacyPayload)
        .eq("application_id", Number(applicationId));
      updateError = legacyResult.error;
    }

    if (updateError) {
      return { ok: false, error: friendlyError(updateError) };
    }

    await dbClient.from("interpreter_application_languages").delete().eq("application_id", Number(applicationId));
    const { data: dbLangs } = await dbClient.from("languages").select("language_id, language_code").in("language_code", languageCodes);
    if (dbLangs && dbLangs.length > 0) {
      const langRows = input.languages.flatMap((l) => {
        const found = dbLangs.find((dl) => dl.language_code === l.code);
        if (!found) return [];
        return [{
          application_id: Number(applicationId),
          language_id: found.language_id,
          language_level: l.level || "Conversational",
          is_primary: Boolean(l.isPrimary),
        }];
      });
      if (langRows.length > 0) {
        await dbClient.from("interpreter_application_languages").insert(langRows);
      }
    }

    await dbClient.from("interpreter_application_categories").delete().eq("application_id", Number(applicationId));
    const { data: dbCats } = await dbClient.from("categories").select("category_id, category_code").in("category_code", input.categoryCodes);
    if (dbCats && dbCats.length > 0) {
      const catRows = dbCats.map((c) => ({
        application_id: Number(applicationId),
        category_id: c.category_id,
      }));
      await dbClient.from("interpreter_application_categories").insert(catRows);
    }

    await dbClient.from("profiles").update({
      first_name: input.firstName.trim(),
      last_name: input.lastName.trim(),
      phone: input.phone.trim(),
    }).eq("user_id", userId);
  } else if (applicationId) {
    try {
      let adminClient;
      try {
        adminClient = createAdminClient();
      } catch {
        adminClient = null;
      }
      const dbClient = adminClient ?? supabase;
      const { data: dbLangs } = await dbClient.from("languages").select("language_id, language_code").in("language_code", languageCodes);
      if (dbLangs && dbLangs.length > 0) {
        for (const l of input.languages) {
          const found = dbLangs.find((dl) => dl.language_code === l.code);
          if (found) {
            await dbClient
              .from("interpreter_application_languages")
              .update({
                language_level: l.level || "Conversational",
                is_primary: Boolean(l.isPrimary),
              })
              .eq("application_id", Number(applicationId))
              .eq("language_id", found.language_id);
          }
        }
      }
    } catch {
      // Continue gracefully
    }
  }

  revalidatePath("/profile");
  revalidatePath("/user/volunteer/status");
  revalidatePath("/manager");
  return { ok: true, data: { applicationId: applicationId ?? "" } };
}
