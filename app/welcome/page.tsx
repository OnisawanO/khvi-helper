import type { Metadata } from "next";
import { AppShell } from "@/app/components/app-shell";
import { Welcome } from "./welcome";
export const metadata: Metadata = { title: "Welcome | KHVI" };
export default function WelcomePage() {
  return <div id="top"><AppShell><Welcome /></AppShell></div>;
}
