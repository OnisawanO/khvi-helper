import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/server";
import { getCurrentUserProfile } from "@/app/lib/supabase-auth";
import {
  LANGUAGES,
  type CategoryId,
  type HelpRequest,
  type InterpreterContact,
  type LanguageId,
  type RequesterContact,
  type RequestStatus,
  type Urgency,
} from "@/app/lib/mock-requests";
import { isActiveHelpRequest } from "@/app/lib/workspace-activity";

export type RealMissionLocation = {
  actorId: string;
  latitude: number;
  longitude: number;
  updatedAtLabel: string;
  accuracyMeters?: number;
};

export type RealMissionLocations = {
  requester?: RealMissionLocation;
  interpreter?: RealMissionLocation;
};

export type WorkspaceActivity = {
  requester: HelpRequest | null;
  assignment: HelpRequest | null;
};

type BookingRow = {
  booking_id: number;
  user_id: string;
  language_id: number;
  category_id: number;
  description: string;
  location_name: string;
  area_latitude: number | null;
  area_longitude: number | null;
  urgency: string;
  status: string;
  scheduled_at: string | null;
  expires_at: string;
  interpreter_id: string | null;
  claimed_at: string | null;
  requester_confirmed_at: string | null;
  started_at: string | null;
  ended_at: string | null;
  user_confirmed_done_at: string | null;
  interpreter_confirmed_done_at: string | null;
  cancelled_by: string | null;
  cancel_reason: string | null;
  created_at: string;
};

type PrivateDetails = {
  booking_id: number;
  exact_address: string;
  latitude: number | null;
  longitude: number | null;
};

type ContactRow = {
  contact_role: "requester" | "interpreter";
  user_id: string;
  display_name: string;
  phone: string | null;
  extra_contact: string | null;
};

type LocationRow = {
  actor_id: string;
  latitude: number;
  longitude: number;
  updated_at: string;
};

type QueryError = { code?: string; message?: string } | null;

function isPermissionDenied(error: QueryError): boolean {
  return error?.code === "42501" || Boolean(error?.message?.includes("not_authorized"));
}

const BOOKING_COLUMNS = [
  "booking_id",
  "user_id",
  "language_id",
  "category_id",
  "description",
  "location_name",
  "area_latitude",
  "area_longitude",
  "urgency",
  "status",
  "scheduled_at",
  "expires_at",
  "interpreter_id",
  "claimed_at",
  "requester_confirmed_at",
  "started_at",
  "ended_at",
  "user_confirmed_done_at",
  "interpreter_confirmed_done_at",
  "cancelled_by",
  "cancel_reason",
  "created_at",
].join(",");

const statusMap: Record<string, RequestStatus> = {
  open: "Open",
  claimed: "Claimed",
  in_progress: "InProgress",
  completed: "Completed",
  cancelled: "Cancelled",
  expired: "Expired",
};

const urgencyMap: Record<string, Urgency> = {
  immediate: "Immediate",
  scheduled: "Scheduled",
};

const cancelledByMap: Record<string, HelpRequest["cancelledBy"]> = {
  user: "User",
  interpreter: "Interpreter",
  manager: "Manager",
  system: "System",
};

function formatTimestamp(value: string | null): string | null {
  if (!value) return null;
  const timestamp = new Date(value);
  if (!Number.isFinite(timestamp.getTime())) return null;
  return timestamp.toLocaleString("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Bangkok",
  });
}

function numberOrNull(value: number | null | undefined): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

async function loadReferences(supabase: SupabaseClient) {
  const [{ data: languages, error: languageError }, { data: categories, error: categoryError }] = await Promise.all([
    supabase.from("languages").select("language_id, language_code").eq("is_active", true),
    supabase.from("categories").select("category_id, category_code").eq("is_active", true),
  ]);

  if (languageError) throw languageError;
  if (categoryError) throw categoryError;

  return {
    languages: new Map((languages ?? []).map((row) => [Number(row.language_id), row.language_code as LanguageId])),
    categories: new Map((categories ?? []).map((row) => [Number(row.category_id), row.category_code as CategoryId])),
  };
}

async function loadDetails(supabase: SupabaseClient, bookingId: number) {
  const [
    { data: privateData, error: privateError },
    { data: contactData, error: contactError },
    { data: locationData, error: locationError },
  ] = await Promise.all([
    supabase.rpc("get_booking_private_details", { p_booking_id: bookingId }),
    supabase.rpc("get_booking_contacts", { p_booking_id: bookingId }),
    supabase.rpc("get_mission_locations", { p_booking_id: bookingId }),
  ]);

  if (privateError && !isPermissionDenied(privateError)) throw privateError;
  if (contactError && !isPermissionDenied(contactError)) throw contactError;
  if (locationError && !isPermissionDenied(locationError)) throw locationError;

  const privateDetails = privateError
    ? undefined
    : (Array.isArray(privateData) ? privateData[0] : privateData) as PrivateDetails | undefined;
  const contacts = (contactError ? [] : contactData ?? []) as ContactRow[];
  const locations = (locationError ? [] : locationData ?? []) as LocationRow[];

  return {
    privateDetails,
    contacts,
    locations,
  };
}

function contactFor(contacts: ContactRow[], role: ContactRow["contact_role"]): ContactRow | undefined {
  return contacts.find((contact) => contact.contact_role === role);
}

function toMissionLocations(rows: LocationRow[], requesterId: string, interpreterId: string | null): RealMissionLocations {
  const result: RealMissionLocations = {};
  for (const row of rows) {
    const point: RealMissionLocation = {
      actorId: row.actor_id,
      latitude: Number(row.latitude),
      longitude: Number(row.longitude),
      updatedAtLabel: formatTimestamp(row.updated_at) ?? row.updated_at,
    };
    if (row.actor_id === requesterId) result.requester = point;
    if (interpreterId && row.actor_id === interpreterId) result.interpreter = point;
  }
  return result;
}

function toRequest(
  row: BookingRow,
  references: Awaited<ReturnType<typeof loadReferences>>,
  details: Awaited<ReturnType<typeof loadDetails>>,
): HelpRequest | null {
  const languageId = references.languages.get(Number(row.language_id));
  const categoryId = references.categories.get(Number(row.category_id));
  const rawStatus = statusMap[row.status];
  const urgency = urgencyMap[row.urgency];

  if (!languageId || !categoryId || !rawStatus || !urgency) return null;

  const requesterContact = contactFor(details.contacts, "requester");
  const interpreterContact = contactFor(details.contacts, "interpreter");
  const expiry = new Date(row.expires_at).getTime();
  const status = rawStatus === "Open" && Number.isFinite(expiry) && expiry <= Date.now()
    ? "Expired"
    : rawStatus;
  const expiresInSeconds = status === "Open" && Number.isFinite(expiry)
    ? Math.max(0, Math.floor((expiry - Date.now()) / 1000))
    : null;

  const requester: RequesterContact | null = requesterContact
    ? {
        userId: requesterContact.user_id,
        name: requesterContact.display_name,
        phone: requesterContact.phone ?? "",
      }
    : null;

  const interpreter: InterpreterContact | null = interpreterContact
    ? {
        name: interpreterContact.display_name,
        primaryLanguage: LANGUAGES.find((language) => language.id === languageId)?.en ?? languageId,
        phone: interpreterContact.phone ?? "",
        extraContact: interpreterContact.extra_contact ?? "",
        averageRating: 0,
        completedJobCount: 0,
      }
    : null;

  return {
    requestId: String(row.booking_id),
    languageId,
    categoryId,
    description: row.description,
    urgency,
    status,
    areaName: row.location_name,
    exactAddress: details.privateDetails?.exact_address ?? "",
    latitude: numberOrNull(details.privateDetails?.latitude) ?? numberOrNull(row.area_latitude),
    longitude: numberOrNull(details.privateDetails?.longitude) ?? numberOrNull(row.area_longitude),
    expiresAt: row.expires_at,
    createdAt: row.created_at,
    createdAtLabel: formatTimestamp(row.created_at) ?? row.created_at,
    scheduledAtLabel: formatTimestamp(row.scheduled_at),
    expiresInSeconds,
    claimedAtLabel: formatTimestamp(row.claimed_at),
    startedAtLabel: formatTimestamp(row.started_at),
    userConfirmedDoneAtLabel: formatTimestamp(row.user_confirmed_done_at),
    interpreterConfirmedDoneAtLabel: formatTimestamp(row.interpreter_confirmed_done_at),
    requester,
    interpreterId: row.interpreter_id,
    requesterConfirmedAtLabel: formatTimestamp(row.requester_confirmed_at),
    endedAtLabel: formatTimestamp(row.ended_at),
    cancelledBy: row.cancelled_by ? cancelledByMap[row.cancelled_by] ?? null : null,
    cancelReason: row.cancel_reason,
    interpreter,
  };
}

export type OpenRequestsDiagnostic =
  | { status: "no_session"; message: string }
  | { status: "no_profile"; message: string }
  | { status: "not_interpreter"; message: string; role?: string }
  | { status: "application_not_approved"; message: string; applicationStatus: string | null }
  | { status: "no_matching_skills"; message: string; approvedLanguageCount: number; approvedCategoryCount: number; openRequestsCount: number }
  | { status: "db_error"; message: string; error: string }
  | { status: "success"; message: string };

export type OpenRequestsResult = {
  requests: HelpRequest[];
  diagnostic: OpenRequestsDiagnostic;
};

async function loadRows(supabase: SupabaseClient, mode: "requester" | "interpreter-assigned") {
  const profileResult = await getCurrentUserProfile(supabase);
  if (!profileResult.profile) {
    console.warn(`[real-request-data] loadRows (${mode}): No profile found for session`);
    return [];
  }

  let query = supabase
    .from("bookings")
    .select(BOOKING_COLUMNS)
    .order("created_at", { ascending: false });

  if (mode === "requester") {
    query = query.eq("user_id", profileResult.profile.userId);
  } else {
    query = query.eq("interpreter_id", profileResult.profile.userId);
  }

  const { data, error } = await query;
  if (error) {
    console.error(`[real-request-data] loadRows (${mode}) query error:`, error.message);
    throw error;
  }

  const references = await loadReferences(supabase);
  const rows = (data ?? []) as unknown as BookingRow[];
  const requests = await Promise.all(rows.map(async (row) => {
    const details = await loadDetails(supabase, Number(row.booking_id));
    return toRequest(row, references, details);
  }));

  return requests.filter((request): request is HelpRequest => request !== null);
}

export async function loadRequesterRequests(supabase?: SupabaseClient): Promise<HelpRequest[]> {
  try {
    return await loadRows(supabase ?? await createClient(), "requester");
  } catch (error) {
    console.error("[real-request-data] loadRequesterRequests error:", error);
    return [];
  }
}

export async function loadInterpreterAssignments(supabase?: SupabaseClient): Promise<HelpRequest[]> {
  try {
    return await loadRows(supabase ?? await createClient(), "interpreter-assigned");
  } catch (error) {
    console.error("[real-request-data] loadInterpreterAssignments error:", error);
    return [];
  }
}

export async function loadWorkspaceActivity(supabase?: SupabaseClient): Promise<WorkspaceActivity> {
  const client = supabase ?? (await createClient());
  const [requesterRequests, assignments] = await Promise.all([
    loadRequesterRequests(client),
    loadInterpreterAssignments(client),
  ]);

  return {
    requester: requesterRequests.find(isActiveHelpRequest) ?? null,
    assignment: assignments.find(isActiveHelpRequest) ?? null,
  };
}

export async function loadOpenInterpreterRequests(supabaseClient?: SupabaseClient): Promise<OpenRequestsResult> {
  const supabase = supabaseClient ?? (await createClient());

  // a. Check session
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData?.user) {
    console.warn("[real-request-data] loadOpenInterpreterRequests: No authenticated user session");
    return {
      requests: [],
      diagnostic: {
        status: "no_session",
        message: "No authenticated session. Please sign in as an interpreter.",
      },
    };
  }

  const userId = userData.user.id;

  // b. Check profile
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role, is_locked")
    .eq("user_id", userId)
    .maybeSingle();

  if (profileError || !profile) {
    console.error("[real-request-data] loadOpenInterpreterRequests: Profile lookup failed for user", userId, profileError?.message);
    return {
      requests: [],
      diagnostic: {
        status: "no_profile",
        message: "User profile was not found. Please verify user creation trigger.",
      },
    };
  }

  // c. Check role
  if (profile.role !== "Interpreter") {
    console.warn("[real-request-data] loadOpenInterpreterRequests: Non-interpreter role accessed open pool:", profile.role);
    return {
      requests: [],
      diagnostic: {
        status: "not_interpreter",
        role: profile.role,
        message: `Account role is currently "${profile.role}". An approved "Interpreter" role is required.`,
      },
    };
  }

  // d. Check approved interpreter application
  const { data: applications, error: appError } = await supabase
    .from("interpreter_applications")
    .select("application_id, status, interpreter_application_languages(language_id), interpreter_application_categories(category_id)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (appError) {
    console.error("[real-request-data] loadOpenInterpreterRequests: Application lookup error:", appError.message);
  }

  const approvedApp = applications?.find((a) => a.status === "approved");
  if (!approvedApp) {
    const latestStatus = applications?.[0]?.status ?? null;
    console.info("[real-request-data] loadOpenInterpreterRequests: No approved application. Latest status:", latestStatus);
    return {
      requests: [],
      diagnostic: {
        status: "application_not_approved",
        applicationStatus: latestStatus,
        message: latestStatus
          ? `Interpreter application status is "${latestStatus}". Requests become visible after approval.`
          : "No interpreter application submitted. Please submit an application and await manager approval.",
      },
    };
  }

  // e. Query open bookings with current user's authenticated client (subject to RLS)
  const { data: bookingRows, error: bookingError } = await supabase
    .from("bookings")
    .select(BOOKING_COLUMNS)
    .eq("status", "open")
    .neq("user_id", userId)
    .order("created_at", { ascending: false });

  if (bookingError) {
    console.error("[real-request-data] loadOpenInterpreterRequests: Database query error:", bookingError.message);
    return {
      requests: [],
      diagnostic: {
        status: "db_error",
        error: bookingError.message,
        message: "Failed to query open requests from the database.",
      },
    };
  }

  const rows = (bookingRows ?? []) as unknown as BookingRow[];
  const references = await loadReferences(supabase);

  const requests = (
    await Promise.all(
      rows.map(async (row) => {
        const details = await loadDetails(supabase, Number(row.booking_id));
        return toRequest(row, references, details);
      }),
    )
  ).filter((request): request is HelpRequest => request !== null);

  if (requests.length === 0) {
    const appLangs = (approvedApp.interpreter_application_languages ?? []) as { language_id: number }[];
    const appCats = (approvedApp.interpreter_application_categories ?? []) as { category_id: number }[];
    return {
      requests: [],
      diagnostic: {
        status: "no_matching_skills",
        approvedLanguageCount: appLangs.length,
        approvedCategoryCount: appCats.length,
        openRequestsCount: 0,
        message: "No open requests currently match your approved language and category skills.",
      },
    };
  }

  return {
    requests,
    diagnostic: {
      status: "success",
      message: `Loaded ${requests.length} open requests successfully.`,
    },
  };
}

export async function loadBookingById(
  bookingId: string,
  supabase?: SupabaseClient,
) {
  const numericId = Number(bookingId);
  if (!Number.isSafeInteger(numericId) || numericId < 1) return null;

  const client = supabase ?? await createClient();
  const { data, error } = await client
    .from("bookings")
    .select(BOOKING_COLUMNS)
    .eq("booking_id", numericId)
    .maybeSingle();

  if (error || !data) return null;

  const references = await loadReferences(client);
  const details = await loadDetails(client, numericId);
  const request = toRequest(data as unknown as BookingRow, references, details);

  const booking = data as unknown as BookingRow;
  return request
    ? {
        request,
        requesterId: booking.user_id,
        locations: toMissionLocations(details.locations, booking.user_id, booking.interpreter_id),
      }
    : null;
}
