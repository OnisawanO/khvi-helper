"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { attachRequester, useRequests } from "@/app/lib/request-store";
import type { UserProfile } from "@/app/lib/mock-auth";
import { getWorkspaceActorSession } from "@/app/lib/workspace-mode";
import { RequestDetail } from "./request-detail";

export function StoredRequestDetail({ requestId }: { requestId: string }) {
  const { requests, ready } = useRequests();
  const [viewer] = useState<UserProfile | null>(() => getWorkspaceActorSession());
  const request = requests.find((r) => r.requestId === requestId);

  useEffect(() => {
    if (viewer?.role === "User" && request && !request.requester) {
      attachRequester(requestId, viewer);
    }
  }, [request, requestId, viewer]);

  const hasAccess = viewer?.role === "User"
    ? !request?.requester || request.requester.userId === viewer.userId
    : viewer?.role === "Interpreter" && request?.interpreterId === viewer.userId;

  if (ready && request && viewer && hasAccess) return <RequestDetail request={request} viewer={viewer} />;
  return <main id="main-content" className="mx-auto w-full max-w-3xl flex-1 px-6 py-16">
    <h1 className="text-2xl font-bold">{ready && viewer ? "Request not found on this device" : "Loading your request…"}</h1>
    {ready && viewer && <><p className="my-4">This preview only opens requests owned by you or assigned to you in this browser.</p><Link className="underline" href={viewer.role === "Interpreter" ? "/my-assignments#main-content" : "/my-requests#main-content"}>Back to requests</Link></>}
  </main>;
}
