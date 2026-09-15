"use client";

import { useSyncExternalStore } from "react";
import {
  CATEGORIES,
  LANGUAGES,
  type HelpRequest,
  type InterpreterContact,
} from "./mock-requests";
import type { UserProfile } from "./mock-auth";

const KEY = "khvi-requester-v1";
const EVENT = "khvi-requests-changed";
let cachedRaw: string | null = null;
let cached: HelpRequest[] = [];
const empty: HelpRequest[] = [];

function read(): HelpRequest[] {
  const raw = localStorage.getItem(KEY);
  if (raw === cachedRaw) return cached;
  const value: unknown = raw ? JSON.parse(raw) : [];
  if (!Array.isArray(value) || !value.every((r) => r && typeof r.requestId === "string" &&
    LANGUAGES.some((l) => l.id === r.languageId) && CATEGORIES.some((c) => c.id === r.categoryId) &&
    typeof r.exactAddress === "string" && typeof r.description === "string" &&
    ["Open", "Claimed", "InProgress", "Completed", "Cancelled", "Expired"].includes(r.status))) {
    throw new Error("Invalid saved requests");
  }
  cachedRaw = raw;
  cached = value;
  return cached;
}

function snapshot() {
  try { return read(); } catch { return empty; }
}

function save(requests: HelpRequest[]) {
  localStorage.setItem(KEY, JSON.stringify(requests));
  window.dispatchEvent(new Event(EVENT));
}

export function expireRequests(requests: HelpRequest[], now: number): HelpRequest[] {
  return requests.map((r) => r.status === "Open" && r.expiresAt && Date.parse(r.expiresAt) <= now
    ? { ...r, status: "Expired", expiresInSeconds: null, cancelledBy: "System", cancelReason: "No interpreter accepted before the request deadline." }
    : r);
}

function subscribe(callback: () => void) {
  window.addEventListener(EVENT, callback);
  window.addEventListener("storage", callback);
  const timer = window.setInterval(() => {
    try {
      const current = read();
      const next = expireRequests(current, Date.now());
      if (next.some((r, i) => r !== current[i])) save(next);
    } catch { /* Preserve unreadable data; a write reports the error. */ }
  }, 1000);
  return () => {
    window.removeEventListener(EVENT, callback);
    window.removeEventListener("storage", callback);
    window.clearInterval(timer);
  };
}

export function useRequests() {
  const requests = useSyncExternalStore(subscribe, snapshot, () => empty);
  const ready = useSyncExternalStore(subscribe, () => true, () => false);
  return { requests, ready };
}

export function appointmentFromValue(value: string): Date | null {
  const appointment = new Date(value);
  return Number.isFinite(appointment.getTime()) ? appointment : null;
}

function startOfNextCalendarDay(now: Date) {
  return new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
}

export function createRequest(input: Pick<HelpRequest, "languageId" | "categoryId" | "description" | "urgency" | "exactAddress" | "latitude" | "longitude">, scheduledAt: string): string {
  const currentTime = new Date();
  const now = currentTime.getTime();
  const current = read();
  const requestId = String(Math.max(1000, ...current.map((r) => Number(r.requestId))) + 1);
  const appointment = input.urgency === "Scheduled" ? appointmentFromValue(scheduledAt) : null;
  if (input.urgency === "Scheduled" && (appointment === null || appointment.getTime() < startOfNextCalendarDay(currentTime).getTime())) throw new Error("Choose an appointment on the next calendar day or later.");
  const request: HelpRequest = {
    ...input, requestId, status: "Open", areaName: "Meeting point provided",
    createdAt: currentTime.toISOString(),
    createdAtLabel: new Date(now).toLocaleString(),
    scheduledAtLabel: appointment === null ? null : appointment.toLocaleString([], { dateStyle: "medium", timeStyle: "short" }),
    expiresAt: new Date(appointment?.getTime() ?? now + 1800000).toISOString(),
    expiresInSeconds: null, claimedAtLabel: null, startedAtLabel: null,
    userConfirmedDoneAtLabel: null, interpreterConfirmedDoneAtLabel: null,
    requester: null, interpreterId: null, requesterConfirmedAtLabel: null, endedAtLabel: null,
    cancelledBy: null, cancelReason: null, interpreter: null,
  };
  save([request, ...current]);
  return requestId;
}

type PreviewActor = Pick<UserProfile, "userId" | "name" | "phone" | "role">;

function nowLabel() {
  return new Date().toLocaleString();
}

function updateStoredRequest(id: string, transform: (request: HelpRequest, requests: HelpRequest[]) => HelpRequest) {
  const current = expireRequests(read(), Date.now());
  const request = current.find((item) => item.requestId === id);
  if (!request) throw new Error("Request not found.");
  const updated = transform(request, current);
  save(current.map((item) => item.requestId === id ? updated : item));
}

function isRequester(request: HelpRequest, actor: PreviewActor) {
  return actor.role === "User" && (!request.requester || request.requester.userId === actor.userId);
}

function isAssignedInterpreter(request: HelpRequest, actor: PreviewActor) {
  return actor.role === "Interpreter" && request.interpreterId === actor.userId;
}

export function attachRequester(id: string, actor: PreviewActor) {
  if (actor.role !== "User") return;
  updateStoredRequest(id, (request) => request.requester
    ? request
    : { ...request, requester: { userId: actor.userId, name: actor.name, phone: actor.phone } });
}

/** Requesters may edit their own request until the assigned interpreter starts work. */
export function updateRequestDetailsBeforeStart(
  id: string,
  actor: PreviewActor,
  input: Pick<HelpRequest, "languageId" | "categoryId" | "description" | "exactAddress">,
) {
  const description = input.description.trim();
  const exactAddress = input.exactAddress.trim();

  if (!LANGUAGES.some((language) => language.id === input.languageId)) {
    throw new Error("Choose a supported language.");
  }
  if (!CATEGORIES.some((category) => category.id === input.categoryId)) {
    throw new Error("Choose a supported category.");
  }
  if (description.length > 500) throw new Error("Notes must be 500 characters or fewer.");
  if (!exactAddress) throw new Error("Add a meeting point.");
  if (exactAddress.length > 200) throw new Error("Meeting point must be 200 characters or fewer.");

  updateStoredRequest(id, (request) => {
    if (!isRequester(request, actor)) throw new Error("Only the requester can edit this request.");
    if (request.status !== "Open" && request.status !== "Claimed") {
      throw new Error("This request can only be edited before work starts.");
    }

    return {
      ...request,
      languageId: input.languageId,
      categoryId: input.categoryId,
      description,
      exactAddress,
      requester: request.requester ?? { userId: actor.userId, name: actor.name, phone: actor.phone },
    };
  });
}

export function claimRequest(id: string, actor: PreviewActor) {
  if (actor.role !== "Interpreter") throw new Error("Only an interpreter can claim a request.");
  updateStoredRequest(id, (request, requests) => {
    if (request.status !== "Open") throw new Error("This request is no longer available.");
    if (request.requester?.userId === actor.userId) throw new Error("You cannot claim your own request.");
    const hasActiveAssignment = requests.some((item) =>
      item.requestId !== id &&
      item.interpreterId === actor.userId &&
      (item.status === "Claimed" || item.status === "InProgress"));
    if (hasActiveAssignment) throw new Error("Finish or withdraw from your active assignment first.");

    const language = LANGUAGES.find((item) => item.id === request.languageId);
    const interpreter: InterpreterContact = {
      name: actor.name,
      primaryLanguage: language?.en ?? request.languageId,
      phone: actor.phone,
      extraContact: "K-HVI preview account",
      averageRating: 5,
      completedJobCount: 0,
    };

    return {
      ...request,
      status: "Claimed",
      claimedAtLabel: nowLabel(),
      requesterConfirmedAtLabel: null,
      interpreterId: actor.userId,
      interpreter,
      expiresInSeconds: null,
      cancelledBy: null,
      cancelReason: null,
    };
  });
}

export function confirmInterpreterSelection(id: string, actor: PreviewActor) {
  updateStoredRequest(id, (request) => {
    if (!isRequester(request, actor)) throw new Error("Only the requester can confirm this interpreter.");
    if (request.status !== "Claimed" || !request.interpreter) throw new Error("There is no interpreter to confirm.");
    if (request.requesterConfirmedAtLabel) return request;
    return { ...request, requesterConfirmedAtLabel: nowLabel() };
  });
}

export function startRequest(id: string, actor: PreviewActor) {
  updateStoredRequest(id, (request) => {
    if (!isAssignedInterpreter(request, actor)) throw new Error("Only the assigned interpreter can start this request.");
    if (request.status !== "Claimed") throw new Error("This request cannot be started.");
    if (!request.requesterConfirmedAtLabel) throw new Error("Wait for the requester to confirm you first.");
    return { ...request, status: "InProgress", startedAtLabel: nowLabel() };
  });
}

export function confirmRequestCompletion(id: string, actor: PreviewActor) {
  updateStoredRequest(id, (request) => {
    if (request.status !== "InProgress") throw new Error("Work must start before completion can be confirmed.");
    const label = nowLabel();
    let updated = request;
    if (isRequester(request, actor)) {
      updated = { ...request, userConfirmedDoneAtLabel: request.userConfirmedDoneAtLabel ?? label };
    } else if (isAssignedInterpreter(request, actor)) {
      updated = { ...request, interpreterConfirmedDoneAtLabel: request.interpreterConfirmedDoneAtLabel ?? label };
    } else {
      throw new Error("You do not have access to confirm this request.");
    }

    return updated.userConfirmedDoneAtLabel && updated.interpreterConfirmedDoneAtLabel
      ? { ...updated, status: "Completed", endedAtLabel: updated.endedAtLabel ?? label }
      : updated;
  });
}

export function cancelMission(id: string, actor: PreviewActor, reason: string) {
  const trimmedReason = reason.trim();
  if (!trimmedReason) throw new Error("Add a reason before cancelling.");
  updateStoredRequest(id, (request) => {
    if (isRequester(request, actor)) {
      if (["Completed", "Cancelled", "Expired"].includes(request.status)) throw new Error("This request cannot be cancelled.");
      return { ...request, status: "Cancelled", cancelledBy: "User", cancelReason: trimmedReason };
    }

    if (!isAssignedInterpreter(request, actor)) throw new Error("Only the assigned interpreter can withdraw.");
    if (request.status === "Claimed") {
      const stillOpen = !request.expiresAt || Date.parse(request.expiresAt) > Date.now();
      return stillOpen
        ? {
            ...request,
            status: "Open",
            interpreterId: null,
            interpreter: null,
            claimedAtLabel: null,
            requesterConfirmedAtLabel: null,
            cancelledBy: null,
            cancelReason: null,
          }
        : { ...request, status: "Expired", cancelledBy: "System", cancelReason: "The original request deadline passed." };
    }
    if (request.status === "InProgress") {
      return { ...request, status: "Cancelled", cancelledBy: "Interpreter", cancelReason: trimmedReason };
    }
    throw new Error("This assignment cannot be withdrawn.");
  });
}

export function updateRequest(id: string, action: "cancel" | "confirm", reason = "") {
  const current = expireRequests(read(), Date.now());
  const request = current.find((r) => r.requestId === id);
  if (!request) throw new Error("Request not found.");
  let updated: HelpRequest;
  if (action === "cancel") {
    if (!["Open", "Claimed", "InProgress"].includes(request.status) || !reason.trim()) throw new Error("This request cannot be cancelled.");
    updated = { ...request, status: "Cancelled", cancelledBy: "User", cancelReason: reason.trim() };
  } else {
    if (request.status !== "InProgress") throw new Error("Work must start before you confirm completion.");
    updated = { ...request, userConfirmedDoneAtLabel: request.userConfirmedDoneAtLabel ?? new Date().toLocaleString(), status: request.interpreterConfirmedDoneAtLabel ? "Completed" : "InProgress" };
  }
  save(current.map((r) => r.requestId === id ? updated : r));
}
