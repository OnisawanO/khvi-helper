import { ApplicationForm, type InitialProfile } from "@/components/volunteer/ApplicationForm";
import { VolunteerApplyHeader } from "@/components/volunteer/VolunteerApplyHeader";
import { WorkspaceShell } from "@/app/components/workspace-shell";
import { WorkspaceBreadcrumbs } from "@/app/components/workspace-breadcrumbs";
import { loadInterpreterApplicationReferences } from "@/app/lib/real-interpreter-application-data";
import { createClient } from "@/utils/supabase/server";

export default async function VolunteerApplyPage() {
  const { languages, categories } = await loadInterpreterApplicationReferences();

  let initialProfile: InitialProfile | null = null;
  try {
    const supabase = await createClient();
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
    <WorkspaceShell>
      <main id="main-content" className="mx-auto w-full max-w-[1400px] px-5 py-8 sm:px-8 lg:px-10">
        {/* Navigation Breadcrumb */}
        <WorkspaceBreadcrumbs
          ariaLabel="แถบนำทางระบบล่ามอาสา"
          items={[
            { label: "หน้าหลัก", href: "/welcome#welcome-user" },
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
