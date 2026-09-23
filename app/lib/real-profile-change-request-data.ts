import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  ProfileChangeRequest,
  ProfileChangeRequestStatus,
  ProfileChangeRequestType,
} from "@/app/(manager)/manager/types";

type ProfileChangeRequestRow = {
  request_id: number;
  interpreter_user_id: string;
  application_id: number;
  request_type: string;
  current_languages: unknown;
  requested_languages: unknown;
  current_categories: unknown;
  requested_categories: unknown;
  reason: string;
  evidence_files: unknown;
  status: string;
  review_note: string | null;
  submitted_at: string;
  reviewed_at: string | null;
};

type ProfileRow = {
  user_id: string;
  first_name: string;
  last_name: string;
};

type JsonObject = Record<string, unknown>;

function jsonObjects(value: unknown): Array<JsonObject | string> {
  if (!Array.isArray(value)) return [];
  return value.filter(
    (item): item is JsonObject | string =>
      typeof item === "string" || (typeof item === "object" && item !== null),
  );
}

function valueNames(value: unknown): string[] {
  return jsonObjects(value)
    .map((item) => {
      if (typeof item === "string") return item;
      return typeof item.name === "string" ? item.name : "";
    })
    .filter(Boolean);
}

function mapRequestType(value: string): ProfileChangeRequestType {
  if (value === "language" || value === "category" || value === "both") return value;
  throw new Error(`Unsupported profile change request type: ${value}`);
}

function mapRequestStatus(value: string): ProfileChangeRequestStatus {
  const statuses: Record<string, ProfileChangeRequestStatus> = {
    pending_review: "Pending Review",
    changes_requested: "Changes Requested",
    approved: "Approved",
    rejected: "Rejected",
  };
  const status = statuses[value];
  if (!status) throw new Error(`Unsupported profile change request status: ${value}`);
  return status;
}

function mapEvidenceFiles(value: unknown): ProfileChangeRequest["evidenceFiles"] {
  return jsonObjects(value).flatMap((item) => {
    if (typeof item === "string") {
      return [{ name: item, format: "image" as const, size: "", url: undefined }];
    }

    if (typeof item.name !== "string" || item.name.trim() === "") return [];
    const format = item.format === "pdf" ? "pdf" : "image";
    const storagePath = typeof item.storage_path === "string" ? item.storage_path : undefined;
    const directUrl = typeof item.url === "string" ? item.url : undefined;
    return [{
      name: item.name,
      format,
      size: typeof item.size === "string" ? item.size : "",
      url: storagePath ?? directUrl,
    }];
  });
}

function displayInterpreterId(applicationId: number) {
  return `INT-${String(applicationId).padStart(3, "0")}`;
}

export async function loadManagerProfileChangeRequests(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from("interpreter_profile_change_requests")
    .select(
      "request_id, interpreter_user_id, application_id, request_type, current_languages, requested_languages, current_categories, requested_categories, reason, evidence_files, status, review_note, submitted_at, reviewed_at",
    )
    .order("submitted_at", { ascending: false });

  if (error) throw error;

  const rows = (data ?? []) as ProfileChangeRequestRow[];
  const userIds = Array.from(new Set(rows.map((row) => row.interpreter_user_id)));
  const profilesById = new Map<string, ProfileRow>();

  if (userIds.length > 0) {
    const { data: profiles, error: profileError } = await supabase
      .from("profiles")
      .select("user_id, first_name, last_name")
      .in("user_id", userIds);

    if (profileError) throw profileError;
    for (const profile of (profiles ?? []) as ProfileRow[]) {
      profilesById.set(profile.user_id, profile);
    }
  }

  return rows.map((row): ProfileChangeRequest => {
    const requestType = mapRequestType(row.request_type);
    const currentLanguages = valueNames(row.current_languages);
    const requestedLanguages = valueNames(row.requested_languages);
    const currentCategories = valueNames(row.current_categories);
    const requestedCategories = valueNames(row.requested_categories);
    const profile = profilesById.get(row.interpreter_user_id);
    const interpreterName = [profile?.first_name, profile?.last_name].filter(Boolean).join(" ") || "Interpreter";
    const currentValues = requestType === "category" ? currentCategories : requestType === "language" ? currentLanguages : [...currentLanguages, ...currentCategories];
    const requestedValues = requestType === "category" ? requestedCategories : requestType === "language" ? requestedLanguages : [...requestedLanguages, ...requestedCategories];

    return {
      id: `PCR-${String(row.request_id).padStart(3, "0")}`,
      interpreterId: displayInterpreterId(row.application_id),
      interpreterName,
      requestType,
      currentValues,
      requestedValues,
      currentLanguages,
      requestedLanguages,
      currentCategories,
      requestedCategories,
      reason: row.reason,
      evidenceFiles: mapEvidenceFiles(row.evidence_files),
      submittedAt: row.submitted_at,
      reviewedAt: row.reviewed_at ?? undefined,
      status: mapRequestStatus(row.status),
      reviewNote: row.review_note ?? undefined,
    };
  });
}
