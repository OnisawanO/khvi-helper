"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AppShell } from "@/app/components/app-shell";
import { WorkspaceAccountActions } from "@/app/components/workspace-account-actions";
import { WelcomeDashboard } from "@/app/components/welcome-dashboard";
import {
  getInterpreterWorkspaceMode,
  getWorkspaceRoleForMode,
  setInterpreterWorkspaceMode,
  type InterpreterWorkspaceMode,
} from "@/app/lib/workspace-mode";
import { getRedirectPathByRole, type UserProfile } from "@/app/lib/mock-auth";
import { getCurrentUserProfile } from "@/app/lib/supabase-auth";
import { authApi } from "@/app/lib/auth-client";
import { createClient } from "@/utils/supabase/client";
import type { OpenRequestsDiagnostic } from "@/app/lib/real-request-data";
import type { HelpRequest } from "@/app/lib/mock-requests";
import type { ReferenceCatalog } from "@/app/lib/reference-catalog";
import type { InterpreterRating } from "@/app/lib/real-interpreter-rating";

export function Welcome({
  requiredRole,
  initialProfile,
  initialOpenRequests = [],
  initialAssignments = [],
  initialRequesterRequests = [],
  initialDiagnostic,
  initialReferenceCatalog = { languages: [], categories: [] },
  initialInterpreterRating = null,
}: {
  requiredRole: "User" | "Interpreter";
  initialProfile?: UserProfile | null;
  initialOpenRequests?: HelpRequest[];
  initialAssignments?: HelpRequest[];
  initialRequesterRequests?: HelpRequest[];
  initialDiagnostic?: OpenRequestsDiagnostic;
  initialReferenceCatalog?: ReferenceCatalog;
  initialInterpreterRating?: InterpreterRating | null;
}) {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(initialProfile ?? null);
  // Keep the first server/client render deterministic. The persisted mode is
  // restored in refreshSession after hydration completes.
  const [interpreterMode, setInterpreterMode] = useState<InterpreterWorkspaceMode>("helper");

  useEffect(() => {
    const supabase = createClient();
    let disposed = false;

    const refreshSession = async () => {
      const result = await getCurrentUserProfile(supabase);
      if (disposed) return;

      if (!result.profile) {
        setUser(null);
        router.replace("/#top");
      } else if (result.profile.role !== requiredRole) {
        setUser(null);
        router.replace(getRedirectPathByRole(result.profile.role));
      } else {
        setUser(result.profile);
        const nextMode = getInterpreterWorkspaceMode(result.profile);
        setInterpreterMode(nextMode);
        const activeRole = getWorkspaceRoleForMode(result.profile, nextMode);
        const roleHash = activeRole === "Interpreter" ? "#welcome-Interpreter" : "#welcome-user";
        if (!window.location.hash || window.location.hash === "#top" || window.location.hash === "#welcome-guide") {
          window.history.replaceState(null, "", roleHash);
        }
      }
    };
    void refreshSession();
    const { data: authListener } = supabase.auth.onAuthStateChange(() => {
      window.setTimeout(() => void refreshSession(), 0);
    });
    const onWindowFocus = () => {
      void refreshSession();
      router.refresh();
    };
    window.addEventListener("focus", onWindowFocus);
    return () => {
      disposed = true;
      authListener.subscription.unsubscribe();
      window.removeEventListener("focus", onWindowFocus);
    };
  }, [requiredRole, router]);

  if (!user) return <main className="flex min-h-screen items-center justify-center bg-(--khvi-paper)" aria-busy="true"><p role="status">Loading your workspace…</p></main>;

  const activeRole = getWorkspaceRoleForMode(user, interpreterMode) ?? "User";

  function changeInterpreterMode(mode: InterpreterWorkspaceMode) {
    if (!user) return;
    if (mode === interpreterMode) return;
    setInterpreterMode(mode);
    setInterpreterWorkspaceMode(user.userId, mode);
    window.history.replaceState(null, "", mode === "helper" ? "#welcome-Interpreter" : "#welcome-user");
  }

  return <div id={activeRole === "Interpreter" ? "welcome-Interpreter" : "welcome-user"} className="min-h-screen bg-(--khvi-paper) text-(--khvi-ink)">
    <AppShell welcomeRole={activeRole} accountRole={user.role} accountActions={<WorkspaceAccountActions user={user} onSignOut={async () => {
      await authApi.logout();
      setUser(null);
      router.replace("/#top");
    }} />}>
      <WelcomeDashboard
        user={user}
        interpreterMode={interpreterMode}
        onInterpreterModeChange={changeInterpreterMode}
        openRequests={initialOpenRequests}
        assignments={initialAssignments}
        requesterRequests={initialRequesterRequests}
        diagnostic={initialDiagnostic}
        referenceCatalog={initialReferenceCatalog}
        interpreterRating={user.userId === initialProfile?.userId ? initialInterpreterRating : null}
      />
    </AppShell>
  </div>;
}
