"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { HelpRequest } from "@/app/lib/mock-requests";

const RequesterRequestsContext = createContext<HelpRequest[] | null>(null);

export function RequesterRequestsProvider({ children, initialRequests }: { children: ReactNode; initialRequests: HelpRequest[] }) {
  return (
    <RequesterRequestsContext.Provider value={initialRequests}>
      {children}
    </RequesterRequestsContext.Provider>
  );
}

export function useRequesterRequests() {
  const requests = useContext(RequesterRequestsContext);
  if (!requests) {
    throw new Error("Requester requests must be rendered inside RequesterRequestsProvider");
  }
  return requests;
}
