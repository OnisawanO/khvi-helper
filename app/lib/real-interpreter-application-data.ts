import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/server";
import { getCurrentUserProfile } from "@/app/lib/supabase-auth";
import type {
  ApplicationCategory,
  ApplicationDocument,
  ApplicationLanguage,
  InterpreterApplication,
  WorkHistoryEntry,
} from "@/app/lib/interpreter-application";
import type { InterpreterApplicant } from "@/app/(manager)/manager/types";

type ApplicationRow = {
  application_id: number;
  user_id: string;
  applicant_name: string;
  phone: string;
  email: string;
  age: number | null;
  extra_contact: string | null;
  assigned_area: string | null;
  certificate_file_name: string;
  certificate_url: string | null;
  work_history: unknown;
  documents: unknown;
  status: string;
  reject_reason: string | null;
  revision_note: string | null;
  cancellation_reason: string | null;
  submitted_at: string;
  reviewed_at: string | null;
  reviewed_by_user_id: string | null;
  cancelled_at: string | null;
  cancelled_by_user_id: string | null;
};

type LanguageLink = {
  language_id: number;
  language_level: string | null;
  is_primary: boolean;
};

type CategoryLink = { category_id: number };

type ReferenceRow = {
  language_id: number;
  language_code: string;
  language_name: string;
  language_name_th: string | null;
  language_name_zh: string | null;
};

type CategoryReferenceRow = {
  category_id: number;
  category_code: string;
  category_name: string;
  category_name_th: string | null;
  category_name_zh: string | null;
  icon: string | null;
};

export type InterpreterApplicationReference = {
  id: string;
  name: string;
  nameTh: string;
  nameZh: string;
  icon?: string;
};

const APPLICATION_COLUMNS = [
  "application_id",
  "user_id",
  "applicant_name",
  "phone",
  "email",
  "age",
  "extra_contact",
  "assigned_area",
  "certificate_file_name",
  "certificate_url",
  "work_history",
  "documents",
  "status",
  "reject_reason",
  "revision_note",
  "cancellation_reason",
  "submitted_at",
  "reviewed_at",
  "reviewed_by_user_id",
  "cancelled_at",
  "cancelled_by_user_id",
].join(",");

function formatTimestamp(value: string | null): string {
  if (!value) return "";
  const timestamp = new Date(value);
  if (!Number.isFinite(timestamp.getTime())) return value;
  return timestamp.toLocaleString("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Bangkok",
  });
}

function applicationStatus(value: string): InterpreterApplication["status"] {
  if (["pending", "under_review", "needs_revision", "approved", "rejected", "cancelled"].includes(value)) {
    return value as InterpreterApplication["status"];
  }
  return "pending";
}

function fileFormat(fileName: string): "pdf" | "png" | "jpg" {
  const extension = fileName.split(".").pop()?.toLowerCase();
  if (extension === "png") return "png";
  if (extension === "jpg" || extension === "jpeg") return "jpg";
  return "pdf";
}

function asWorkHistory(value: unknown): WorkHistoryEntry[] {
  if (!Array.isArray(value)) return [];
  return value.filter((entry): entry is WorkHistoryEntry => {
    if (!entry || typeof entry !== "object") return false;
    const item = entry as Partial<WorkHistoryEntry>;
    return typeof item.id === "number"
      && typeof item.description === "string"
      && typeof item.startDate === "string"
      && typeof item.endDate === "string";
  });
}

async function references(supabase: SupabaseClient) {
  const [{ data: languageData, error: languageError }, { data: categoryData, error: categoryError }] = await Promise.all([
    supabase.from("languages").select("language_id, language_code, language_name, language_name_th, language_name_zh").eq("is_active", true),
    supabase.from("categories").select("category_id, category_code, category_name, category_name_th, category_name_zh, icon").eq("is_active", true),
  ]);

  if (languageError) throw languageError;
  if (categoryError) throw categoryError;

  return {
    languages: new Map((languageData ?? []).map((row) => [Number(row.language_id), row as ReferenceRow])),
    categories: new Map((categoryData ?? []).map((row) => [Number(row.category_id), row as CategoryReferenceRow])),
  };
}

export async function loadInterpreterApplicationReferences(supabase?: SupabaseClient) {
  const client = supabase ?? await createClient();
  const profileResult = await getCurrentUserProfile(client);
  if (!profileResult.profile) {
    return { languages: [], categories: [] };
  }
  const reference = await references(client);
  return {
    languages: [...reference.languages.values()].map((item) => ({
      id: item.language_code,
      name: item.language_name,
      nameTh: item.language_name_th ?? item.language_name,
      nameZh: item.language_name_zh ?? item.language_name,
    } satisfies InterpreterApplicationReference)),
    categories: [...reference.categories.values()].map((item) => ({
      id: item.category_code,
      name: item.category_name,
      nameTh: item.category_name_th ?? item.category_name,
      nameZh: item.category_name_zh ?? item.category_name,
      icon: item.icon ?? undefined,
    } satisfies InterpreterApplicationReference)),
  };
}

async function links(supabase: SupabaseClient, applicationId: number) {
  const [{ data: languageData, error: languageError }, { data: categoryData, error: categoryError }] = await Promise.all([
    supabase.from("interpreter_application_languages").select("language_id, language_level, is_primary").eq("application_id", applicationId),
    supabase.from("interpreter_application_categories").select("category_id").eq("application_id", applicationId),
  ]);
  if (languageError) throw languageError;
  if (categoryError) throw categoryError;
  return {
    languages: (languageData ?? []) as LanguageLink[],
    categories: (categoryData ?? []) as CategoryLink[],
  };
}

function toApplication(
  row: ApplicationRow,
  relation: Awaited<ReturnType<typeof links>>,
  reference: Awaited<ReturnType<typeof references>>,
): InterpreterApplication {
  const languages: ApplicationLanguage[] = relation.languages.flatMap((link) => {
      const item = reference.languages.get(Number(link.language_id));
      if (!item) return [];
      return [{
        id: item.language_code,
        name: item.language_name,
        type: link.is_primary ? "Primary" : "Fluent",
        level: link.language_level ?? undefined,
      }];
    });
  const categories: ApplicationCategory[] = relation.categories.flatMap((link) => {
      const item = reference.categories.get(Number(link.category_id));
      return item ? [{ id: Number(item.category_id), name: item.category_name, icon: item.icon ?? undefined }] : [];
    });
  const document: ApplicationDocument = {
    name: row.certificate_file_name,
    type: "cert",
    size: "",
    url: row.certificate_url ?? undefined,
  };

  return {
    id: String(row.application_id),
    userId: row.user_id,
    applicantName: row.applicant_name,
    phone: row.phone,
    email: row.email,
    age: row.age ?? 0,
    extraContact: row.extra_contact ?? "",
    primaryLanguage: languages.find((language) => language.type === "Primary")?.name ?? languages[0]?.name ?? "",
    languages,
    categories,
    workHistory: asWorkHistory(row.work_history),
    certificateFileName: row.certificate_file_name,
    certificateUrl: row.certificate_url ?? "",
    documents: [document],
    submittedAt: formatTimestamp(row.submitted_at),
    reviewedAt: row.reviewed_at ? formatTimestamp(row.reviewed_at) : undefined,
    reviewedByManagerId: row.reviewed_by_user_id ?? undefined,
    status: applicationStatus(row.status),
    rejectReason: row.reject_reason ?? undefined,
    revisionNote: row.revision_note ?? undefined,
    cancellationReason: row.cancellation_reason ?? undefined,
    cancelledAt: row.cancelled_at ? formatTimestamp(row.cancelled_at) : undefined,
    cancelledByUserId: row.cancelled_by_user_id ?? undefined,
    assignedArea: row.assigned_area ?? "",
    isAvailable: row.status === "approved",
  };
}

export async function loadMyInterpreterApplication(supabase?: SupabaseClient) {
  const client = supabase ?? await createClient();
  const profileResult = await getCurrentUserProfile(client);
  if (!profileResult.profile) return null;

  const { data, error } = await client
    .from("interpreter_applications")
    .select(APPLICATION_COLUMNS)
    .eq("user_id", profileResult.profile.userId)
    .order("application_id", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;

  const reference = await references(client);
  const relation = await links(client, Number((data as unknown as ApplicationRow).application_id));
  return toApplication(data as unknown as ApplicationRow, relation, reference);
}

function toManagerApplicant(application: InterpreterApplication): InterpreterApplicant {
  const document = application.documents[0] ?? {
    name: application.certificateFileName,
    type: "cert" as const,
    format: fileFormat(application.certificateFileName),
    size: "",
    url: application.certificateUrl || undefined,
  };
  return {
    id: application.id,
    name: application.applicantName,
    age: application.age,
    country: application.assignedArea || "Not specified",
    primaryLanguage: application.primaryLanguage,
    spokenLanguages: application.languages.map((language) => language.name),
    specialtyCategories: application.categories.map((category) => category.name),
    experienceSummary: application.workHistory.map((entry) => entry.organization ? `${entry.description} (${entry.organization})` : entry.description).join("; ") || "No experience history submitted.",
    contactChannels: [application.phone, application.email, application.extraContact].filter(Boolean).join(" · "),
    appliedDate: application.submittedAt,
    status: application.status === "approved" ? "Approved" : application.status === "rejected" ? "Rejected" : application.status === "under_review" ? "Under Review" : "Pending",
    rejectionReason: application.rejectReason,
    document: {
      name: document.name,
      type: document.type,
      format: fileFormat(document.name),
      size: document.size,
      url: document.url,
    },
    documents: application.documents.map((item) => ({
      name: item.name,
      type: item.type,
      format: fileFormat(item.name),
      size: item.size,
      url: item.url,
    })),
    backgroundCheck: "Pending",
    proficiencyScore: application.languages.map((language) => language.level).filter(Boolean).join(", "),
  };
}

export async function loadManagerInterpreterApplications(supabase?: SupabaseClient) {
  const client = supabase ?? await createClient();
  const profileResult = await getCurrentUserProfile(client);
  if (!profileResult.profile || !["Manager", "Admin"].includes(profileResult.profile.role)) return [];

  const { data, error } = await client
    .from("interpreter_applications")
    .select(APPLICATION_COLUMNS)
    .neq("status", "cancelled")
    .order("submitted_at", { ascending: false });
  if (error) throw error;

  const reference = await references(client);
  return Promise.all((data ?? []).map(async (row) => {
    const relation = await links(client, Number((row as unknown as ApplicationRow).application_id));
    const app = toApplication(row as unknown as ApplicationRow, relation, reference);
    const managerApp = toManagerApplicant(app);

    const certPath = (row as unknown as ApplicationRow).certificate_url;
    if (typeof certPath === "string" && certPath.length > 0 && !certPath.startsWith("http://") && !certPath.startsWith("https://")) {
      try {
        const { data: signed } = await client.storage
          .from("interpreter-certificates")
          .createSignedUrl(certPath, 60 * 60 * 24);
        const signedUrl = signed?.signedUrl;
        if (signedUrl) {
          managerApp.document.url = signedUrl;
          if (managerApp.documents && managerApp.documents[0]) {
            managerApp.documents[0].url = signedUrl;
          }
        }
      } catch {
        // Fallback handled on client
      }
    }

    return managerApp;
  }));
}
