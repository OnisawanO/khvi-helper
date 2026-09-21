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

type QueryError = { code?: string } | null;

function isPermissionDenied(error: QueryError): boolean {
  return error?.code === "42501";
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
  const [{ data: privateData, error: privateError }, { data: contactData, error: contactError }, { data: locationData, error: locationError }] = await Promise.all([
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
  const status = statusMap[row.status];
  const urgency = urgencyMap[row.urgency];

  if (!languageId || !categoryId || !status || !urgency) return null;

  const requesterContact = contactFor(details.contacts, "requester");
  const interpreterContact = contactFor(details.contacts, "interpreter");
  const expiry = new Date(row.expires_at).getTime();
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

async function loadRows(supabase: SupabaseClient, mode: "requester" | "interpreter-open" | "interpreter-assigned") {
  const profileResult = await getCurrentUserProfile(supabase);
  if (!profileResult.profile) return [];

  let query = supabase
    .from("bookings")
    .select(BOOKING_COLUMNS)
    .order("created_at", { ascending: false });

  if (mode === "requester") {
    query = query.eq("user_id", profileResult.profile.userId);
  } else if (mode === "interpreter-open") {
    query = query
      .eq("status", "open")
      .neq("user_id", profileResult.profile.userId);
  } else {
    query = query.eq("interpreter_id", profileResult.profile.userId);
  }

  const { data, error } = await query;
  if (error) throw error;

  const references = await loadReferences(supabase);
  const rows = (data ?? []) as unknown as BookingRow[];
  const requests = await Promise.all(rows.map(async (row) => {
    const details = await loadDetails(supabase, Number(row.booking_id));
    return toRequest(row, references, details);
  }));

  return requests.filter((request): request is HelpRequest => request !== null);
}

export async function loadRequesterRequests(supabase?: SupabaseClient) {
  return loadRows(supabase ?? await createClient(), "requester");
}

export async function loadOpenInterpreterRequests(supabase?: SupabaseClient) {
  return loadRows(supabase ?? await createClient(), "interpreter-open");
}

export async function loadInterpreterAssignments(supabase?: SupabaseClient) {
  return loadRows(supabase ?? await createClient(), "interpreter-assigned");
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
    ? { request, locations: toMissionLocations(details.locations, booking.user_id, booking.interpreter_id) }
    : null;
}
