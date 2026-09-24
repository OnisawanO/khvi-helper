import { createServerClient } from "@supabase/ssr";
import type { CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { NextResponse } from "next/server";
import {
  AUTH_PERSISTENCE_COOKIE,
  AUTH_PERSISTENT_MAX_AGE,
  AUTH_RECOVERY_COOKIE,
  getAuthPersistence,
  type AuthPersistence,
} from "./auth-persistence";

function withoutCookieLifetime(options: CookieOptions): CookieOptions {
  const sessionOptions = { ...options };
  delete sessionOptions.expires;
  delete sessionOptions.maxAge;
  return sessionOptions;
}

function markerCookieOptions(persistence: AuthPersistence): CookieOptions {
  return {
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    ...(persistence === "persistent" ? { maxAge: AUTH_PERSISTENT_MAX_AGE } : {}),
  };
}

export async function createClient() {
  const cookieStore = await cookies();
  const persistence = getAuthPersistence(cookieStore.get(AUTH_PERSISTENCE_COOKIE)?.value);

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
                persistence === "session" ? withoutCookieLifetime(options) : options,
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

      pendingCookies.forEach(({ name, value, options: cookieOptions }) => {
        response.cookies.set(
          name,
          value,
          persistence === "session" ? withoutCookieLifetime(cookieOptions) : cookieOptions,
        );
      });

      Object.entries(pendingHeaders).forEach(([name, value]) => response.headers.set(name, value));

      if (persistence) {
        response.cookies.set(AUTH_PERSISTENCE_COOKIE, persistence, markerCookieOptions(persistence));
      } else if (options.clearPersistence) {
        response.cookies.set(AUTH_PERSISTENCE_COOKIE, "", { ...markerCookieOptions("session"), maxAge: 0 });
      }

      if (options.recovery === true) {
        response.cookies.set(AUTH_RECOVERY_COOKIE, "1", markerCookieOptions("session"));
      } else if (options.recovery === false) {
        response.cookies.set(AUTH_RECOVERY_COOKIE, "", { ...markerCookieOptions("session"), maxAge: 0 });
      }

      return response;
    },
  };
}
