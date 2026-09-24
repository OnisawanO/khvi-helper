import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import {
  AUTH_PERSISTENCE_COOKIE,
  AUTH_PERSISTENT_UNTIL_COOKIE,
  getAuthPersistence,
  getPersistentMaxAge,
  getPersistentUntil,
  type AuthPersistence,
} from "./auth-persistence";

function isSupabaseAuthCookie(name: string) {
  return /^sb-.+-auth-token(?:\.\d+)?$/.test(name);
}

function deleteCookieOptions() {
  return {
    path: "/",
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    expires: new Date(0),
    maxAge: 0,
  };
}

function withoutCookieLifetime(options: Record<string, unknown>) {
  const sessionOptions = { ...options };
  delete sessionOptions.expires;
  delete sessionOptions.maxAge;
  return sessionOptions;
}

function applyCookieLifetime(
  options: Record<string, unknown>,
  persistence: AuthPersistence,
  persistentUntil: number | null,
) {
  if (options.maxAge === 0) return options;
  if (persistence !== "persistent" || !persistentUntil) return withoutCookieLifetime(options);

  const maxAge = getPersistentMaxAge(persistentUntil);
  return {
    ...options,
    expires: new Date(persistentUntil * 1000),
    maxAge,
  };
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });
  const configuredPersistence = getAuthPersistence(request.cookies.get(AUTH_PERSISTENCE_COOKIE)?.value);
  const persistentUntil = getPersistentUntil(request.cookies.get(AUTH_PERSISTENT_UNTIL_COOKIE)?.value);
  const persistence: AuthPersistence = configuredPersistence === "persistent" && persistentUntil
    ? "persistent"
    : "session";

  if (persistence === "persistent" && getPersistentMaxAge(persistentUntil) <= 0) {
    const expiredAuthCookieNames = request.cookies
      .getAll()
      .filter(({ name }) => isSupabaseAuthCookie(name))
      .map(({ name }) => name);
    expiredAuthCookieNames.forEach((name) => request.cookies.delete(name));

    const expiredResponse = NextResponse.next({ request });
    expiredAuthCookieNames.forEach((name) => expiredResponse.cookies.set(name, "", deleteCookieOptions()));
    expiredResponse.cookies.set(AUTH_PERSISTENCE_COOKIE, "", deleteCookieOptions());
    expiredResponse.cookies.set(AUTH_PERSISTENT_UNTIL_COOKIE, "", deleteCookieOptions());
    return expiredResponse;
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));

          supabaseResponse = NextResponse.next({
            request,
          });

          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(
              name,
              value,
              applyCookieLifetime(options, persistence, persistentUntil),
            ),
          );

          Object.entries(headers).forEach(([key, value]) =>
            supabaseResponse.headers.set(key, value),
          );
        },
      },
    },
  );

  // Keep the session cookie refreshed before Server Components render.
  await supabase.auth.getClaims();

  return supabaseResponse;
}
