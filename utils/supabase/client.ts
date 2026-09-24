import { createBrowserClient } from "@supabase/ssr";
import type { CookieOptions } from "@supabase/ssr";
import {
  AUTH_PERSISTENCE_COOKIE,
  AUTH_PERSISTENT_UNTIL_COOKIE,
  getAuthPersistence,
  getPersistentMaxAge,
  getPersistentUntil,
} from "./auth-persistence";

let browserClient: ReturnType<typeof createBrowserClient> | undefined;

function readBrowserCookies() {
  if (typeof document === "undefined") return [];

  return document.cookie
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const separator = part.indexOf("=");
      const rawName = separator >= 0 ? part.slice(0, separator) : part;
      const rawValue = separator >= 0 ? part.slice(separator + 1) : "";

      return {
        name: decodeURIComponent(rawName),
        value: decodeURIComponent(rawValue),
      };
    });
}

function writeBrowserCookie(name: string, value: string, options: CookieOptions) {
  const cookies = readBrowserCookies();
  const persistence = getAuthPersistence(cookies.find((cookie) => cookie.name === AUTH_PERSISTENCE_COOKIE)?.value);
  const persistentUntil = getPersistentUntil(
    cookies.find((cookie) => cookie.name === AUTH_PERSISTENT_UNTIL_COOKIE)?.value,
  );
  const parts = [`${encodeURIComponent(name)}=${encodeURIComponent(value)}`];
  const path = options.path ?? "/";

  parts.push(`Path=${path}`);
  if (options.domain) parts.push(`Domain=${options.domain}`);
  if (options.sameSite) {
    const sameSite = options.sameSite === true ? "Strict" : String(options.sameSite);
    parts.push(`SameSite=${sameSite.charAt(0).toUpperCase()}${sameSite.slice(1)}`);
  }
  if (options.secure) parts.push("Secure");

  if (options.maxAge === 0) {
    parts.push("Max-Age=0");
  } else if (persistence === "persistent" && persistentUntil) {
    parts.push(`Max-Age=${getPersistentMaxAge(persistentUntil)}`);
  }

  document.cookie = parts.join("; ");
}

export function createClient() {
  if (!browserClient) {
    browserClient = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      {
        cookies: {
          getAll: readBrowserCookies,
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => writeBrowserCookie(name, value, options));
          },
        },
      },
    );
  }

  return browserClient;
}
