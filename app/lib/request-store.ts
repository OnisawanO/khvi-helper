"use client";

import { useSyncExternalStore } from "react";
import { CATEGORIES, LANGUAGES, type HelpRequest } from "./mock-requests";

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

export function createRequest(input: Pick<HelpRequest, "languageId" | "categoryId" | "description" | "urgency" | "exactAddress" | "latitude" | "longitude">, scheduledAt: string): string {
  const currentTime = new Date();
  const now = currentTime.getTime();
  const current = read();
  const requestId = String(Math.max(1000, ...current.map((r) => Number(r.requestId))) + 1);
  const appointment = input.urgency === "Scheduled" ? appointmentFromValue(scheduledAt) : null;
  if (input.urgency === "Scheduled" && (appointment === null || appointment.getTime() <= now + 30 * 60 * 1000 || appointment.getTime() > now + 24 * 60 * 60 * 1000)) throw new Error("Choose an appointment between 30 minutes and 24 hours from now.");
  const request: HelpRequest = {
    ...input, requestId, status: "Open", areaName: "Meeting point provided",
    createdAtLabel: new Date(now).toLocaleString(),
    scheduledAtLabel: appointment === null ? null : appointment.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    expiresAt: new Date(appointment?.getTime() ?? now + 1800000).toISOString(),
    expiresInSeconds: null, claimedAtLabel: null, startedAtLabel: null,
    userConfirmedDoneAtLabel: null, interpreterConfirmedDoneAtLabel: null,
    cancelledBy: null, cancelReason: null, interpreter: null,
  };
  save([request, ...current]);
  return requestId;
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
