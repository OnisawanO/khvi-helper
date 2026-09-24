import type { HelpRequest, RequestStatus } from "./request-types";

const ACTIVE_REQUEST_STATUSES: readonly RequestStatus[] = ["Open", "Claimed", "InProgress"];

export function isActiveHelpRequest(request: HelpRequest): boolean {
  if (!ACTIVE_REQUEST_STATUSES.includes(request.status)) return false;
  if (request.status !== "Open" || !request.expiresAt) return true;
  const expiresAt = Date.parse(request.expiresAt);
  return !Number.isFinite(expiresAt) || expiresAt > Date.now();
}
