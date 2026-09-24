export const AUTH_PERSISTENCE_COOKIE = "khvi-auth-persistence";
export const AUTH_RECOVERY_COOKIE = "khvi-auth-recovery";

export const AUTH_PERSISTENT_MAX_AGE = 400 * 24 * 60 * 60;

export type AuthPersistence = "persistent" | "session";

export function getAuthPersistence(value: string | undefined): AuthPersistence {
  return value === "session" ? "session" : "persistent";
}
