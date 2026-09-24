import { ApplicationForm, type InitialProfile } from "@/components/volunteer/ApplicationForm";
import { VolunteerApplyHeader } from "@/components/volunteer/VolunteerApplyHeader";
import { WorkspaceShell } from "@/app/components/workspace-shell";
import { WorkspaceBreadcrumbs } from "@/app/components/workspace-breadcrumbs";
import { loadInterpreterApplicationReferences } from "@/app/lib/real-interpreter-application-data";
import { loadMyInterpreterApplication } from "@/app/lib/real-interpreter-application-data";
import { splitDisplayName } from "@/app/lib/auth-types";
import { requireWorkspaceAccountRole } from "@/app/lib/workspace-auth";

export default async function VolunteerApplyPage() {
  const { profile, supabase } = await requireWorkspaceAccountRole("User");
  const [application, { languages, categories }] = await Promise.all([
    loadMyInterpreterApplication(supabase),
    loadInterpreterApplicationReferences(),
  ]);
  if (application?.status === "approved") {
    return <WorkspaceShell initialUser={profile} requiredAccountRole="User"><main id="main-content" className="mx-auto max-w-3xl px-5 py-12 sm:px-8"><section className="rounded-(--khvi-radius-md) border border-(--khvi-coral)/30 bg-white p-6"><h1 className="text-xl font-bold">สถานะล่ามอาสาถูกยกเลิกแล้ว</h1><p className="mt-3 text-sm leading-7">คุณไม่สามารถยื่นใบสมัครล่ามอาสาใหม่ได้</p><a className="mt-5 inline-flex min-h-11 items-center rounded-(--khvi-radius-sm) border border-(--khvi-teal) px-4 text-sm font-bold text-(--khvi-teal)" href="/user/volunteer/status#main-content">ดูสถานะใบสมัคร</a></section></main></WorkspaceShell>;
  }
  const nameParts = splitDisplayName(profile.name);
  const initialProfile: InitialProfile = {
    firstName: nameParts.firstName,
    lastName: nameParts.lastName,
    phone: profile.phone,
    email: profile.email,
  };

  return (
    <WorkspaceShell initialUser={profile} requiredAccountRole="User">
      <main id="main-content" className="mx-auto w-full max-w-[1400px] px-5 py-8 sm:px-8 lg:px-10">
        {/* Navigation Breadcrumb */}
        <WorkspaceBreadcrumbs
          ariaLabel="แถบนำทางระบบล่ามอาสา"
          items={[
            { label: "หน้าหลัก", href: "/user" },
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
