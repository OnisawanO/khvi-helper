"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "./app-shell";
import { WorkspaceAccountActions } from "./workspace-account-actions";
import {
  getRedirectPathByRole,
  type UserProfile,
} from "@/app/lib/mock-auth";
import { getCurrentUserProfile } from "@/app/lib/supabase-auth";
import { authApi } from "@/app/lib/auth-client";
import {
  getInterpreterWorkspaceMode,
  getWorkspaceRoleForMode,
  subscribeInterpreterWorkspaceMode,
  type InterpreterWorkspaceMode,
} from "@/app/lib/workspace-mode";
import { createClient } from "@/utils/supabase/client";

export type WorkspaceRole = "User" | "Interpreter";

function isWorkspaceUser(user: UserProfile | null): user is UserProfile & { role: WorkspaceRole } {
  return user?.role === "User" || user?.role === "Interpreter";
}

export function WorkspaceShell({ children, requiredRole, requiredAccountRole, alternatePath }: {
  children: ReactNode;
  requiredRole?: WorkspaceRole;
  requiredAccountRole?: WorkspaceRole;
  alternatePath?: string;
}) {
  const router = useRouter();
  const [user, setUser] = useState<(UserProfile & { role: WorkspaceRole }) | null>(null);
  const [interpreterMode, setInterpreterMode] = useState<InterpreterWorkspaceMode>("helper");

  useEffect(() => {
    const supabase = createClient();
    let disposed = false;
    let refreshTimer: number | null = null;

    const refreshBookingViews = () => {
      if (disposed || document.visibilityState !== "visible") return;
      if (refreshTimer !== null) window.clearTimeout(refreshTimer);
      refreshTimer = window.setTimeout(() => {
        refreshTimer = null;
        router.refresh();
      }, 200);
    };

    const refreshSession = async () => {
      const result = await getCurrentUserProfile(supabase);
      if (disposed) return;

      if (isWorkspaceUser(result.profile)) {
        if (requiredAccountRole && result.profile.role !== requiredAccountRole) {
          setUser(null);
          router.replace(getRedirectPathByRole(result.profile.role));
          return;
        }

        const nextMode = getInterpreterWorkspaceMode(result.profile);
        const activeRole = getWorkspaceRoleForMode(result.profile, nextMode);
        setInterpreterMode(nextMode);

        if (requiredRole && activeRole !== requiredRole) {
          setUser(null);
          router.replace(alternatePath ?? getRedirectPathByRole(result.profile.role));
          return;
        }

        setUser(result.profile);
        return;
      }

      setUser(null);
      if (result.profile?.role === "Manager" || result.profile?.role === "Admin") {
        router.replace(getRedirectPathByRole(result.profile.role));
      } else {
        router.replace("/#top");
      }
    };

    void refreshSession();
    const { data: authListener } = supabase.auth.onAuthStateChange(() => {
      window.setTimeout(() => void refreshSession(), 0);
    });
    const unsubscribeWorkspaceMode = subscribeInterpreterWorkspaceMode(() => {
      window.setTimeout(() => void refreshSession(), 0);
    });
    const bookingChannel = supabase
      .channel(`workspace-bookings-${crypto.randomUUID()}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "bookings" },
        refreshBookingViews,
      )
      .subscribe();
    const bookingPoll = window.setInterval(refreshBookingViews, 10_000);
    const onWindowFocus = () => {
      void refreshSession();
      refreshBookingViews();
    };
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") refreshBookingViews();
    };
    window.addEventListener("focus", onWindowFocus);
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      disposed = true;
      if (refreshTimer !== null) window.clearTimeout(refreshTimer);
      window.clearInterval(bookingPoll);
      void supabase.removeChannel(bookingChannel);
      authListener.subscription.unsubscribe();
      unsubscribeWorkspaceMode();
      window.removeEventListener("focus", onWindowFocus);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [alternatePath, requiredAccountRole, requiredRole, router]);

  if (!user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-(--khvi-paper)" aria-busy="true">
        <p role="status">Loading your workspace…</p>
      </main>
    );
  }

  const role = getWorkspaceRoleForMode(user, interpreterMode) ?? user.role;

  return (
    <div className="min-h-screen bg-(--khvi-paper) text-(--khvi-ink)">
      <AppShell
        welcomeRole={role}
        accountRole={user.role}
        accountActions={
          <WorkspaceAccountActions
            user={user}
            onSignOut={async () => {
              await authApi.logout();
              setUser(null);
              router.replace("/#top");
            }}
          />
        }
      >
        {children}
      </AppShell>
    </div>
  );
}
