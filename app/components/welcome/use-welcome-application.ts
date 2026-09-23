"use client";

import { useEffect, useState } from "react";
import { loadMyInterpreterApplicationAction } from "@/app/actions/interpreter-application-actions";
import { useInterpreterAccess } from "@/app/components/app-shell";
import type { InterpreterApplication } from "@/app/lib/interpreter-application";

export function useWelcomeApplication(userId: string) {
  const interpreterAccess = useInterpreterAccess();
  const [applicationResult, setApplicationResult] = useState<{
    userId: string;
    application: InterpreterApplication | null;
    loaded: boolean;
    verified: boolean;
  }>({ userId, application: null, loaded: false, verified: false });

  useEffect(() => {
    let disposed = false;
    let requestId = 0;
    const refreshApplication = async () => {
      const currentRequest = ++requestId;
      const result = await loadMyInterpreterApplicationAction();
      if (!disposed && currentRequest === requestId) {
        setApplicationResult({
          userId,
          application: result.ok ? result.data : null,
          loaded: true,
          verified: result.ok,
        });
      }
    };

    void refreshApplication();
    window.addEventListener("focus", refreshApplication);
    return () => {
      disposed = true;
      window.removeEventListener("focus", refreshApplication);
    };
  }, [userId]);

  const applicationLoaded = applicationResult.userId === userId && applicationResult.loaded;
  const activeApplication = applicationLoaded && applicationResult.verified
    ? applicationResult.application
    : null;
  const applicationStatus = applicationLoaded && applicationResult.verified
    ? activeApplication?.status ?? null
    : interpreterAccess.applicationStatus;

  return {
    activeApplication,
    applicationLoaded,
    applicationStatus,
    applicationVerified: applicationResult.verified,
    interpreterAccess,
  };
}
