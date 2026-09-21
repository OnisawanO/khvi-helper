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
import { createClient } from "@/utils/supabase/client";

export type WorkspaceRole = "User" | "Interpreter";

function isWorkspaceUser(user: UserProfile | null): user is UserProfile & { role: WorkspaceRole } {
  return user?.role === "User" || user?.role === "Interpreter";
}

export function WorkspaceShell({ children, requiredRole, alternatePath }: {
  children: ReactNode;
  requiredRole?: WorkspaceRole;
  alternatePath?: string;
}) {
  const router = useRouter();
  const [user, setUser] = useState<(UserProfile & { role: WorkspaceRole }) | null>(null);

  useEffect(() => {
    const supabase = createClient();
    let disposed = false;

    const refreshSession = async () => {
      const result = await getCurrentUserProfile(supabase);
      if (disposed) return;

      if (isWorkspaceUser(result.profile)) {
        if (requiredRole && result.profile.role !== requiredRole) {
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
    const onWindowFocus = () => void refreshSession();
    window.addEventListener("focus", onWindowFocus);

    return () => {
      disposed = true;
      authListener.subscription.unsubscribe();
      window.removeEventListener("focus", onWindowFocus);
    };
  }, [alternatePath, requiredRole, router]);

  if (!user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-(--khvi-paper)" aria-busy="true">
        <p role="status">Loading your workspace…</p>
      </main>
    );
  }

  const role = user.role;

  return (
    <div className="min-h-screen bg-(--khvi-paper) text-(--khvi-ink)">
      <AppShell
        welcomeRole={role}
        accountActions={
          <WorkspaceAccountActions
            user={user}
            onSignOut={() => {
              void createClient().auth.signOut();
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
