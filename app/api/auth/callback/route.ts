import { NextResponse } from "next/server";
import { getRedirectPathByRole } from "@/app/lib/auth-types";
import { getCurrentUserProfile } from "@/app/lib/supabase-auth";
import { createRouteHandlerClient } from "@/utils/supabase/server";

function redirectTo(request: Request, path: string) {
  return NextResponse.redirect(new URL(path, request.url));
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const flow = url.searchParams.get("flow");
  const isRecovery = flow === "recovery" || url.searchParams.get("type") === "recovery";
  const { supabase, applyToResponse } = await createRouteHandlerClient();
  const code = url.searchParams.get("code");
  const flowId = url.searchParams.get("sb_flow_id");

  if (!code || url.searchParams.get("error") || url.searchParams.get("error_code")) {
    const response = redirectTo(request, isRecovery ? "/reset-password?error=invalid-link" : "/login?auth_error=invalid-link");
    return applyToResponse(response, { clearPersistence: true, recovery: false });
  }

  const { error } = await supabase.auth.exchangeCodeForSession(
    code,
    flowId ? { flowId } : undefined,
  );

  if (error) {
    const response = redirectTo(request, isRecovery ? "/reset-password?error=invalid-link" : "/login?auth_error=invalid-link");
    return applyToResponse(response, { clearPersistence: true, recovery: false });
  }

  if (isRecovery) {
    const response = redirectTo(request, "/reset-password");
    return applyToResponse(response, { recovery: true });
  }

  const profileResult = await getCurrentUserProfile(supabase);
  if (!profileResult.profile) {
    await supabase.auth.signOut();
    const response = redirectTo(request, "/login?auth_error=profile");
    return applyToResponse(response, { clearPersistence: true, recovery: false });
  }

  const response = redirectTo(request, getRedirectPathByRole(profileResult.profile.role));
  return applyToResponse(response, { persistence: "persistent" });
}
