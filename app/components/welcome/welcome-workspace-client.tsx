"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AppShell } from "@/app/components/app-shell";
import { WorkspaceAccountActions } from "@/app/components/workspace-account-actions";
import {
  getInterpreterWorkspaceMode,
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
import { InterpreterWelcome } from "@/app/interpreter/interpreter-welcome";
import { UserWelcome } from "@/app/user/user-welcome";

export function WelcomeWorkspaceClient({
  viewRole,
  inlineInterpreterModes = false,
  initialProfile,
  initialOpenRequests = [],
  initialAssignments = [],
  initialRequesterRequests = [],
  initialDiagnostic,
  initialReferenceCatalog = { languages: [], categories: [] },
  initialInterpreterRating = null,
}: {
  viewRole: "User" | "Interpreter";
  inlineInterpreterModes?: boolean;
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
  const [interpreterMode, setInterpreterMode] = useState<InterpreterWorkspaceMode>(
    viewRole === "Interpreter" ? "helper" : "requester",
  );

  useEffect(() => {
    const supabase = createClient();
    let disposed = false;

    const refreshSession = async () => {
      const result = await getCurrentUserProfile(supabase);
      if (disposed) return;

      if (!result.profile) {
        setUser(null);
        router.replace("/#top");
      } else if (result.profile.role === "Manager" || result.profile.role === "Admin") {
        setUser(null);
        router.replace(getRedirectPathByRole(result.profile.role));
      } else if (viewRole === "Interpreter" && result.profile.role !== "Interpreter") {
        setUser(null);
        router.replace("/user");
      } else {
        setUser(result.profile);
        if (result.profile.role === "Interpreter") {
          if (inlineInterpreterModes) {
            setInterpreterMode(getInterpreterWorkspaceMode(result.profile));
          } else {
            setInterpreterWorkspaceMode(result.profile.userId, interpreterMode);
          }
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
  }, [inlineInterpreterModes, interpreterMode, router, viewRole]);

  if (!user) {
    return <main className="flex min-h-screen items-center justify-center bg-(--khvi-paper)" aria-busy="true"><p role="status">Loading your workspace…</p></main>;
  }

  function changeInterpreterMode(mode: InterpreterWorkspaceMode) {
    if (!user) return;
    if (mode === interpreterMode) return;
    setInterpreterMode(mode);
    setInterpreterWorkspaceMode(user.userId, mode);
    if (inlineInterpreterModes) {
      window.history.replaceState(
        null,
        "",
        mode === "helper" ? "/interpreter#welcome-Interpreter" : "/interpreter#welcome-user",
      );
      return;
    }
    router.push(mode === "helper" ? "/interpreter" : "/user");
  }

  const rating = user.userId === initialProfile?.userId ? initialInterpreterRating : null;
  const activeRole = inlineInterpreterModes && user.role === "Interpreter"
    ? interpreterMode === "helper" ? "Interpreter" : "User"
    : viewRole;

  return (
    <div id={activeRole === "Interpreter" ? "welcome-Interpreter" : "welcome-user"} className="min-h-screen bg-(--khvi-paper) text-(--khvi-ink)">
      <AppShell
        welcomeRole={activeRole}
        accountRole={user.role}
        accountActions={(
          <WorkspaceAccountActions
            user={user}
            onSignOut={async () => {
              await authApi.logout();
              setUser(null);
              router.replace("/#top");
            }}
          />
        )}
      >
        {activeRole === "Interpreter" ? (
          <InterpreterWelcome
            user={user}
            interpreterMode={interpreterMode}
            onInterpreterModeChange={changeInterpreterMode}
            openRequests={initialOpenRequests}
            assignments={initialAssignments}
            diagnostic={initialDiagnostic}
            referenceCatalog={initialReferenceCatalog}
            interpreterRating={rating}
          />
        ) : (
          <UserWelcome
            user={user}
            interpreterMode={interpreterMode}
            onInterpreterModeChange={changeInterpreterMode}
            requesterRequests={initialRequesterRequests}
            referenceCatalog={initialReferenceCatalog}
            interpreterRating={rating}
          />
        )}
      </AppShell>
    </div>
  );
}
