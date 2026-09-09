import type { Metadata } from "next";
import { Welcome } from "./welcome";
export const metadata: Metadata = { title: "Welcome | KHVI" };
export default function WelcomePage() {
  return <Welcome />;
}
