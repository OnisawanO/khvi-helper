import type { Metadata } from "next";
import { ProfileSettings } from "./profile-settings";

export const metadata: Metadata = {
  title: "Profile & Settings | KHVI",
  description: "Manage your KHVI profile and role-specific workspace settings.",
};

export default function ProfilePage() {
  return <ProfileSettings />;
}
