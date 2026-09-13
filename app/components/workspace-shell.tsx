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
    const refreshSession = () => {
      const session = getMockUserSession();

      if (isWorkspaceUser(session)) {
        if (requiredRole && session.role !== requiredRole) {
          setUser(null);
          router.replace(alternatePath ?? getRedirectPathByRole(session.role));
          return;
        }

        setUser(session);
        return;
      }

      setUser(null);
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
    window.addEventListener("storage", onStorage);
    window.addEventListener("focus", refreshSession);

    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("focus", refreshSession);
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
            onSignOut={() => {
              clearMockUserSession();
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
