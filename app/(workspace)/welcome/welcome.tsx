"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AppShell } from "@/app/components/app-shell";
import { WorkspaceAccountActions } from "@/app/components/workspace-account-actions";
import { WelcomeDashboard } from "@/app/components/welcome-dashboard";
import {
  AUTH_SESSION_STORAGE_KEY, clearMockUserSession, getMockUserSession,
  getRedirectPathByRole, type UserProfile,
} from "@/app/lib/mock-auth";

export function Welcome() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    const refreshSession = () => {
      const session = getMockUserSession();
      if (!session || !["User", "Interpreter", "Manager", "Admin"].includes(session.role)) {
        setUser(null);
        router.replace("/#top");
      } else if (session.role === "Manager" || session.role === "Admin") {
        setUser(null);
        router.replace(getRedirectPathByRole(session.role));
      } else {
        setUser(session);
        const roleHash = session.role === "Interpreter" ? "#welcome-Interpreter" : "#welcome-user";
        if (!window.location.hash || window.location.hash === "#top" || window.location.hash === "#welcome-guide") {
          window.history.replaceState(null, "", roleHash);
        }
      }
    };
    const onStorage = (event: StorageEvent) => {
      if (event.key === AUTH_SESSION_STORAGE_KEY || event.key === null) refreshSession();
    };
    queueMicrotask(refreshSession);
    window.addEventListener("storage", onStorage);
    window.addEventListener("focus", refreshSession);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("focus", refreshSession);
    };
  }, [router]);

  if (!user) return <main className="flex min-h-screen items-center justify-center bg-(--khvi-paper)" aria-busy="true"><p role="status">Loading your workspace…</p></main>;

  return <div id={user.role === "Interpreter" ? "welcome-Interpreter" : "welcome-user"} className="min-h-screen bg-(--khvi-paper) text-(--khvi-ink)">
    <AppShell welcomeRole={user.role === "Interpreter" ? "Interpreter" : "User"} accountActions={<WorkspaceAccountActions user={user} onSignOut={() => {
      clearMockUserSession();
      setUser(null);
      router.replace("/#top");
    }} />}>
      <WelcomeDashboard user={user} />
    </AppShell>
  </div>;
}
