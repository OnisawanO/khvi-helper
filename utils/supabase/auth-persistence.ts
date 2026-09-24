export const AUTH_PERSISTENCE_COOKIE = "khvi-auth-persistence";
export const AUTH_PERSISTENT_UNTIL_COOKIE = "khvi-auth-persistent-until";
export const AUTH_RECOVERY_COOKIE = "khvi-auth-recovery";

export const AUTH_PERSISTENT_MAX_AGE = 15 * 24 * 60 * 60;

export type AuthPersistence = "persistent" | "session";

export function getAuthPersistence(value: string | undefined): AuthPersistence {
  return value === "persistent" ? "persistent" : "session";
}

export function createPersistentUntil(now = Date.now()): number {
  return Math.floor(now / 1000) + AUTH_PERSISTENT_MAX_AGE;
}

export function getPersistentUntil(value: string | undefined): number | null {
  if (!value || !/^\d+$/.test(value)) return null;

  const until = Number(value);
  return Number.isSafeInteger(until) && until > 0 ? until : null;
}

export function getPersistentMaxAge(until: number | null, now = Date.now()): number {
  if (!until) return 0;

  const remaining = until - Math.floor(now / 1000);
  return Math.max(0, Math.min(AUTH_PERSISTENT_MAX_AGE, remaining));
}
