"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "./app-shell";
import { WorkspaceAccountActions } from "./workspace-account-actions";
import {
  AUTH_SESSION_STORAGE_KEY,
  clearMockUserSession,
  getMockUserSession,
  getRedirectPathByRole,
  type UserProfile,
} from "@/app/lib/mock-auth";
import { getActiveWorkspaceRole, subscribeInterpreterWorkspaceMode, type WorkspaceRole } from "@/app/lib/workspace-mode";

function isWorkspaceUser(user: UserProfile | null): user is UserProfile & { role: WorkspaceRole } {
  return user?.role === "User" || user?.role === "Interpreter";
}

export function WorkspaceShell({ children, requiredRole, alternatePath }: {
  children: ReactNode;
  requiredRole?: WorkspaceRole;
  alternatePath?: string;
}) {
  const router = useRouter();
  const [workspace, setWorkspace] = useState<{ user: UserProfile & { role: WorkspaceRole }; activeRole: WorkspaceRole } | null>(null);

  useEffect(() => {
    const refreshSession = () => {
      const session = getMockUserSession();

      if (isWorkspaceUser(session)) {
        const activeRole = getActiveWorkspaceRole(session) ?? session.role;
        if (requiredRole && activeRole !== requiredRole) {
          setWorkspace(null);
          router.replace(alternatePath ?? getRedirectPathByRole(activeRole));
          return;
        }

        setWorkspace({ user: session, activeRole });
        return;
      }

      setWorkspace(null);
      if (session?.role === "Manager" || session?.role === "Admin") {
        router.replace(getRedirectPathByRole(session.role));
      } else {
        router.replace("/#top");
      }
    };

    const onStorage = (event: StorageEvent) => {
      if (event.key === AUTH_SESSION_STORAGE_KEY || event.key === null) {
        refreshSession();
      }
    };

    queueMicrotask(refreshSession);
    const unsubscribeMode = subscribeInterpreterWorkspaceMode(refreshSession);
    window.addEventListener("storage", onStorage);
    window.addEventListener("focus", refreshSession);

    return () => {
      unsubscribeMode();
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("focus", refreshSession);
    };
  }, [alternatePath, requiredRole, router]);

  if (!workspace) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-(--khvi-paper)" aria-busy="true">
        <p role="status">Loading your workspace…</p>
      </main>
    );
  }

  const { user, activeRole } = workspace;

  return (
    <div className="min-h-screen bg-(--khvi-paper) text-(--khvi-ink)">
      <AppShell
        welcomeRole={activeRole}
        accountActions={
          <WorkspaceAccountActions
            user={user}
            onSignOut={() => {
              clearMockUserSession();
              setWorkspace(null);
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
