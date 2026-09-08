import type { Metadata } from "next";
import { AppShell } from "@/app/components/app-shell";
import { MapView } from "./map-view";

export const metadata: Metadata = {
  title: "SOS map | K-HVI",
  description: "Find open language help requests that match an approved interpreter's skills.",
};

export default function MapPage() {
  return (
    <AppShell>
      <MapView />
    </AppShell>
  );
}
