"use client";

import { useSyncExternalStore } from "react";
import type { UserProfile } from "./mock-auth";
import type { HelpRequest } from "./mock-requests";

const KEY = "khvi-mission-locations-v1";
const EVENT = "khvi-mission-locations-changed";

export type MissionLocationPoint = {
  actorId: string;
  latitude: number;
  longitude: number;
  updatedAtLabel: string;
};

export type MissionLocationRecord = {
  requester?: MissionLocationPoint;
  interpreter?: MissionLocationPoint;
};

type MissionLocationState = Record<string, MissionLocationRecord>;

const emptyState: MissionLocationState = {};
const emptyRecord: MissionLocationRecord = {};
let cachedRaw: string | null = null;
let cached: MissionLocationState = emptyState;

function isPoint(value: unknown): value is MissionLocationPoint {
  if (!value || typeof value !== "object") return false;
  const point = value as MissionLocationPoint;
  return typeof point.actorId === "string"
    && Number.isFinite(point.latitude)
    && point.latitude >= -90
    && point.latitude <= 90
    && Number.isFinite(point.longitude)
    && point.longitude >= -180
    && point.longitude <= 180
    && typeof point.updatedAtLabel === "string";
}

function read(): MissionLocationState {
  const raw = localStorage.getItem(KEY);
  if (raw === cachedRaw) return cached;

  const value: unknown = raw ? JSON.parse(raw) : {};
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("Invalid saved mission locations.");
  }

  const entries = Object.entries(value as Record<string, unknown>);
  const valid = entries.every(([, record]) => {
    if (!record || typeof record !== "object" || Array.isArray(record)) return false;
    const candidate = record as MissionLocationRecord;
    return (!candidate.requester || isPoint(candidate.requester))
      && (!candidate.interpreter || isPoint(candidate.interpreter));
  });
  if (!valid) throw new Error("Invalid saved mission locations.");

  cachedRaw = raw;
  cached = value as MissionLocationState;
  return cached;
}

function snapshot() {
  try {
    return read();
  } catch {
    return emptyState;
  }
}

function subscribe(callback: () => void) {
  window.addEventListener(EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

function save(state: MissionLocationState) {
  localStorage.setItem(KEY, JSON.stringify(state));
  window.dispatchEvent(new Event(EVENT));
}

export function useMissionLocations(requestId: string): MissionLocationRecord {
  const state = useSyncExternalStore(subscribe, snapshot, () => emptyState);
  return state[requestId] ?? emptyRecord;
}

export function saveMissionLocation(
  request: HelpRequest,
  actor: Pick<UserProfile, "userId" | "role">,
  latitude: number,
  longitude: number,
) {
  if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90
    || !Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
    throw new Error("The browser returned an invalid location.");
  }

  const point: MissionLocationPoint = {
    actorId: actor.userId,
    latitude,
    longitude,
    updatedAtLabel: new Date().toLocaleString(),
  };
  const current = read();
  const record = current[request.requestId] ?? {};

  if (actor.role === "User") {
    if (request.requester && request.requester.userId !== actor.userId) {
      throw new Error("Only the requester can share this location.");
    }
    if (!["Open", "Claimed", "InProgress"].includes(request.status)) {
      throw new Error("This request no longer accepts location updates.");
    }
    save({ ...current, [request.requestId]: { ...record, requester: point } });
    return;
  }

  if (actor.role === "Interpreter") {
    if (request.interpreterId !== actor.userId) {
      throw new Error("Only the assigned interpreter can share this location.");
    }
    if (request.status !== "Claimed" && request.status !== "InProgress") {
      throw new Error("This assignment no longer accepts location updates.");
    }
    save({ ...current, [request.requestId]: { ...record, interpreter: point } });
    return;
  }

  throw new Error("This role cannot share a mission location.");
}
