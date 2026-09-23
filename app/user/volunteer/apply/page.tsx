import { ApplicationForm, type InitialProfile } from "@/components/volunteer/ApplicationForm";
import { VolunteerApplyHeader } from "@/components/volunteer/VolunteerApplyHeader";
import { WorkspaceShell } from "@/app/components/workspace-shell";
import { WorkspaceBreadcrumbs } from "@/app/components/workspace-breadcrumbs";
import { loadInterpreterApplicationReferences } from "@/app/lib/real-interpreter-application-data";
import { loadMyInterpreterApplication } from "@/app/lib/real-interpreter-application-data";
import { getCurrentUserProfile } from "@/app/lib/supabase-auth";
import { requireWorkspaceAccountRole } from "@/app/lib/workspace-auth";

export default async function VolunteerApplyPage() {
  const { supabase } = await requireWorkspaceAccountRole("User");
  const [profileResult, application] = await Promise.all([
    getCurrentUserProfile(supabase),
    loadMyInterpreterApplication(supabase),
  ]);
  if (profileResult.profile?.role === "User" && application?.status === "approved") {
    return <WorkspaceShell requiredAccountRole="User"><main id="main-content" className="mx-auto max-w-3xl px-5 py-12 sm:px-8"><section className="rounded-(--khvi-radius-md) border border-(--khvi-coral)/30 bg-white p-6"><h1 className="text-xl font-bold">สถานะล่ามอาสาถูกยกเลิกแล้ว</h1><p className="mt-3 text-sm leading-7">คุณไม่สามารถยื่นใบสมัครล่ามอาสาใหม่ได้</p><a className="mt-5 inline-flex min-h-11 items-center rounded-(--khvi-radius-sm) border border-(--khvi-teal) px-4 text-sm font-bold text-(--khvi-teal)" href="/user/volunteer/status#main-content">ดูสถานะใบสมัคร</a></section></main></WorkspaceShell>;
  }
  const { languages, categories } = await loadInterpreterApplicationReferences();

  let initialProfile: InitialProfile | null = null;
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (userData?.user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("first_name, last_name, phone")
        .eq("user_id", userData.user.id)
        .maybeSingle();

      if (profile) {
        initialProfile = {
          firstName: profile.first_name || "",
          lastName: profile.last_name || "",
          phone: profile.phone || "",
          email: userData.user.email || "",
        };
      }
    }
  } catch {
    // Supabase server client not configured or error
  }

  return (
    <WorkspaceShell requiredAccountRole="User">
      <main id="main-content" className="mx-auto w-full max-w-[1400px] px-5 py-8 sm:px-8 lg:px-10">
        {/* Navigation Breadcrumb */}
        <WorkspaceBreadcrumbs
          ariaLabel="แถบนำทางระบบล่ามอาสา"
          items={[
            { label: "หน้าหลัก", href: "/user#welcome-user" },
            { label: "สมัครล่ามจิตอาสา" },
          ]}
          className="mb-6"
        />

        {/* Centered Header Banner */}
        <VolunteerApplyHeader />

        {/* Application Form */}
        <ApplicationForm
          availableLanguages={languages}
          availableCategories={categories}
          initialProfile={initialProfile}
        />
      </main>
    </WorkspaceShell>
  );
}
