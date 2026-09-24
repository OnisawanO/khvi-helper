import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { AUTH_PERSISTENCE_COOKIE, getAuthPersistence } from "./auth-persistence";

function withoutCookieLifetime(options: Record<string, unknown>) {
  const sessionOptions = { ...options };
  delete sessionOptions.expires;
  delete sessionOptions.maxAge;
  return sessionOptions;
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });
  const persistence = getAuthPersistence(request.cookies.get(AUTH_PERSISTENCE_COOKIE)?.value);

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
              persistence === "session" ? withoutCookieLifetime(options) : options,
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
