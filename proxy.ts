import { type NextRequest } from "next/server";
import { updateSession } from "@/utils/supabase/middleware";

export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    "/user/:path*",
    "/interpreter/:path*",
    "/manager/:path*",
    "/admin/:path*",
    "/profile/:path*",
    "/welcome/:path*",
    "/request-help/:path*",
    "/my-requests/:path*",
    "/find-requests/:path*",
    "/my-assignments/:path*",
    "/api/auth/logout",
    "/api/auth/reset-password",
    "/api/interpreter-certificate/:path*",
  ],
};
