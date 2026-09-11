"use client";

import Link from "next/link";
import { useRequests } from "@/app/lib/request-store";
import { RequestDetail } from "./request-detail";

export function StoredRequestDetail({ requestId }: { requestId: string }) {
  const { requests, ready } = useRequests();
  const request = requests.find((r) => r.requestId === requestId);
  if (ready && request) return <RequestDetail request={request} />;
  return <main id="main-content" className="mx-auto w-full max-w-3xl flex-1 px-6 py-16">
    <h1 className="text-2xl font-bold">{ready ? "Request not found on this device" : "Loading your request…"}</h1>
    {ready && <><p className="my-4">Requests in this preview are saved in the browser where you created them.</p><Link className="underline" href="/my-requests#main-content">Back to my requests</Link></>}
  </main>;
}
