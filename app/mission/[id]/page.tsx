import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getMockBooking } from "@/lib/mock-data";
import { MissionRoomView } from "./mission-room-view";

export const metadata: Metadata = {
  title: "Mission tracking room | K-HVI",
  description: "Track mission status, unlock contact details after a claim, and confirm job completion.",
};

export default async function MissionPage({ params }: PageProps<"/mission/[id]">) {
  const { id } = await params;

  if (!id || !/^[a-zA-Z0-9-]+$/.test(id)) {
    notFound();
  }

  const booking = getMockBooking(id);

  if (!booking) {
    notFound();
  }

  return <MissionRoomView initialBooking={booking} />;
}
