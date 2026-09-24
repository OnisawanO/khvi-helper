export type RequestStatus = "Open" | "Claimed" | "InProgress" | "Completed" | "Cancelled" | "Expired";
export type Urgency = "Immediate" | "Scheduled";
export type CancelledBy = "User" | "Interpreter" | "Manager" | "System";

export type LanguageId = string;
export type CategoryId = string;

export type InterpreterContact = {
  name: string;
  primaryLanguage: string;
  phone: string;
  extraContact: string;
  averageRating: number;
  reviewCount?: number;
  completedJobCount: number;
};

export type Review = {
  reviewId: string;
  bookingId: string;
  reviewerId: string;
  revieweeId: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  createdAtLabel: string;
};

export type RequesterContact = {
  userId: string;
  name: string;
  phone: string;
};

export type HelpRequest = {
  requestId: string;
  languageId: LanguageId;
  categoryId: CategoryId;
  description: string;
  urgency: Urgency;
  status: RequestStatus;
  areaName: string;
  exactAddress: string;
  latitude: number | null;
  longitude: number | null;
  expiresAt?: string;
  createdAt: string;
  createdAtLabel: string;
  scheduledAtLabel: string | null;
  expiresInSeconds: number | null;
  claimedAtLabel: string | null;
  startedAtLabel: string | null;
  userConfirmedDoneAtLabel: string | null;
  interpreterConfirmedDoneAtLabel: string | null;
  requester?: RequesterContact | null;
  interpreterId?: string | null;
  requesterConfirmedAtLabel?: string | null;
  endedAtLabel?: string | null;
  cancelledBy: CancelledBy | null;
  cancelReason: string | null;
  interpreter: InterpreterContact | null;
  review?: Review | null;
};

export const STATUS_FILTERS = [
  { id: "completed", statuses: ["Completed"] },
  { id: "in-progress", statuses: ["InProgress"] },
  { id: "open", statuses: ["Open"] },
  { id: "claimed", statuses: ["Claimed"] },
  { id: "closed", statuses: ["Cancelled", "Expired"] },
  { id: "all", statuses: null },
] as const satisfies readonly { id: string; statuses: readonly RequestStatus[] | null }[];

export type StatusFilterId = (typeof STATUS_FILTERS)[number]["id"];

export function resolveStatusFilter(value: string | string[] | undefined): StatusFilterId {
  const candidate = Array.isArray(value) ? value[0] : value;
  return STATUS_FILTERS.find((filter) => filter.id === candidate)?.id ?? "all";
}

export function isContactUnlocked(status: RequestStatus): boolean {
  return status === "Claimed" || status === "InProgress" || status === "Completed";
}

export function approximateCoordinates(request: HelpRequest): string {
  if (request.latitude === null || request.longitude === null) return "Coordinates not provided";
  return `${request.latitude.toFixed(2)}, ${request.longitude.toFixed(2)}`;
}

export function exactCoordinates(request: HelpRequest): string {
  if (request.latitude === null || request.longitude === null) return "Coordinates not provided";
  return `${request.latitude.toFixed(5)}, ${request.longitude.toFixed(5)}`;
}

export {
  CATEGORIES,
  LANGUAGES,
  categoryLabel,
  languageLabel,
} from "./request-catalog";
