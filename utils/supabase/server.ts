import { createServerClient } from "@supabase/ssr";
import type { CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { NextResponse } from "next/server";
import {
  AUTH_PERSISTENCE_COOKIE,
  AUTH_PERSISTENT_UNTIL_COOKIE,
  AUTH_RECOVERY_COOKIE,
  createPersistentUntil,
  getAuthPersistence,
  getPersistentMaxAge,
  getPersistentUntil,
  type AuthPersistence,
} from "./auth-persistence";

function withoutCookieLifetime(options: CookieOptions): CookieOptions {
  const sessionOptions = { ...options };
  delete sessionOptions.expires;
  delete sessionOptions.maxAge;
  return sessionOptions;
}

function withPersistentLifetime(options: CookieOptions, persistentUntil: number | null): CookieOptions {
  if (options.maxAge === 0 || !persistentUntil) return options;

  const maxAge = getPersistentMaxAge(persistentUntil);
  if (maxAge <= 0) {
    return { ...options, expires: new Date(0), maxAge: 0 };
  }

  return {
    ...options,
    expires: new Date(persistentUntil * 1000),
    maxAge,
  };
}

function applyCookieLifetime(
  options: CookieOptions,
  persistence: AuthPersistence,
  persistentUntil: number | null,
): CookieOptions {
  if (options.maxAge === 0) return options;
  return persistence === "persistent"
    ? withPersistentLifetime(options, persistentUntil)
    : withoutCookieLifetime(options);
}

function sessionCookieOptions(): CookieOptions {
  return {
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  };
}

function persistentCookieOptions(persistentUntil: number): CookieOptions {
  return {
    ...sessionCookieOptions(),
    expires: new Date(persistentUntil * 1000),
    maxAge: getPersistentMaxAge(persistentUntil),
  };
}

function deleteCookieOptions(): CookieOptions {
  return {
    ...sessionCookieOptions(),
    expires: new Date(0),
    maxAge: 0,
  };
}

export async function createClient() {
  const cookieStore = await cookies();
  const configuredPersistence = getAuthPersistence(cookieStore.get(AUTH_PERSISTENCE_COOKIE)?.value);
  const persistentUntil = getPersistentUntil(cookieStore.get(AUTH_PERSISTENT_UNTIL_COOKIE)?.value);
  const persistence: AuthPersistence = configuredPersistence === "persistent" && persistentUntil
    ? "persistent"
    : "session";

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(
                name,
                value,
                applyCookieLifetime(options, persistence, persistentUntil),
              );
            });
          } catch {
            // Server Components cannot write cookies. The proxy refreshes them.
          }
        },
      },
    },
  );
}

export async function createRouteHandlerClient() {
  const cookieStore = await cookies();
  const pendingCookies: { name: string; value: string; options: CookieOptions }[] = [];
  const pendingHeaders: Record<string, string> = {};
  const configuredPersistence = getAuthPersistence(cookieStore.get(AUTH_PERSISTENCE_COOKIE)?.value);
  const currentPersistentUntil = getPersistentUntil(cookieStore.get(AUTH_PERSISTENT_UNTIL_COOKIE)?.value);
  const currentPersistence: AuthPersistence = configuredPersistence === "persistent" && currentPersistentUntil
    ? "persistent"
    : "session";

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet, headers) {
          pendingCookies.push(...cookiesToSet);
          Object.assign(pendingHeaders, headers);
        },
      },
    },
  );

  return {
    supabase,
    applyToResponse(
      response: NextResponse,
      options: {
        persistence?: AuthPersistence;
        recovery?: boolean;
        clearPersistence?: boolean;
      } = {},
    ) {
      const persistence = options.persistence;
      const persistentUntil = persistence === "persistent"
        ? createPersistentUntil()
        : currentPersistentUntil;
      const responsePersistence = persistence ?? currentPersistence;

      pendingCookies.forEach(({ name, value, options: cookieOptions }) => {
        response.cookies.set(
          name,
          value,
          applyCookieLifetime(cookieOptions, responsePersistence, persistentUntil),
        );
      });

      Object.entries(pendingHeaders).forEach(([name, value]) => response.headers.set(name, value));

      if (persistence) {
        if (persistence === "persistent") {
          const nextPersistentUntil = persistentUntil ?? createPersistentUntil();
          response.cookies.set(
            AUTH_PERSISTENCE_COOKIE,
            "persistent",
            persistentCookieOptions(nextPersistentUntil),
          );
          response.cookies.set(
            AUTH_PERSISTENT_UNTIL_COOKIE,
            String(nextPersistentUntil),
            persistentCookieOptions(nextPersistentUntil),
          );
        } else {
          response.cookies.set(AUTH_PERSISTENCE_COOKIE, "session", sessionCookieOptions());
          response.cookies.set(AUTH_PERSISTENT_UNTIL_COOKIE, "", deleteCookieOptions());
        }
      } else if (options.clearPersistence) {
        response.cookies.set(AUTH_PERSISTENCE_COOKIE, "", deleteCookieOptions());
        response.cookies.set(AUTH_PERSISTENT_UNTIL_COOKIE, "", deleteCookieOptions());
      }

      if (options.recovery === true) {
        response.cookies.set(AUTH_RECOVERY_COOKIE, "1", sessionCookieOptions());
      } else if (options.recovery === false) {
        response.cookies.set(AUTH_RECOVERY_COOKIE, "", deleteCookieOptions());
      }

      return response;
    },
  };
}
