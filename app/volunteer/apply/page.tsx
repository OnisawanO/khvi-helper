import { ApplicationForm } from "@/components/volunteer/ApplicationForm";
import { WorkspaceShell } from "@/app/components/workspace-shell";
import { WorkspaceBreadcrumbs } from "@/app/components/workspace-breadcrumbs";
import { loadInterpreterApplicationReferences } from "@/app/lib/real-interpreter-application-data";
import { loadMyInterpreterApplication } from "@/app/lib/real-interpreter-application-data";
import { getCurrentUserProfile } from "@/app/lib/supabase-auth";
import { createClient } from "@/utils/supabase/server";

export default async function VolunteerApplyPage() {
  const supabase = await createClient();
  const [profileResult, application] = await Promise.all([
    getCurrentUserProfile(supabase),
    loadMyInterpreterApplication(supabase),
  ]);
  if (profileResult.profile?.role === "User" && application?.status === "approved") {
    return <WorkspaceShell><main id="main-content" className="mx-auto max-w-3xl px-5 py-12 sm:px-8"><section className="rounded-(--khvi-radius-md) border border-(--khvi-coral)/30 bg-white p-6"><h1 className="text-xl font-bold">สถานะล่ามอาสาถูกยกเลิกแล้ว</h1><p className="mt-3 text-sm leading-7">คุณไม่สามารถยื่นใบสมัครล่ามอาสาใหม่ได้</p><a className="mt-5 inline-flex min-h-11 items-center rounded-(--khvi-radius-sm) border border-(--khvi-teal) px-4 text-sm font-bold text-(--khvi-teal)" href="/volunteer/status#main-content">ดูสถานะใบสมัคร</a></section></main></WorkspaceShell>;
  }
  const { languages, categories } = await loadInterpreterApplicationReferences();

  return (
    <WorkspaceShell>
      <main id="main-content" className="mx-auto w-full max-w-[1400px] px-5 py-8 sm:px-8 lg:px-10">
        {/* Navigation Breadcrumb */}
        <WorkspaceBreadcrumbs
          ariaLabel="แถบนำทางระบบล่ามอาสา"
          items={[
            { label: "หน้าหลัก", href: "/welcome#welcome-user" },
            { label: "ระบบล่ามจิตอาสา", href: "/volunteer/dashboard" },
            { label: "สมัครล่ามจิตอาสา" },
          ]}
          className="mb-6"
        />

        {/* Centered Header Banner */}
        <div className="rounded-(--khvi-radius-md) border border-[#143748] bg-[#092f45] p-6 text-white shadow-sm sm:p-7 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-(--khvi-radius-sm) border border-[#8ed5c4]/40 bg-[#087f80] px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-white">
                  Volunteer Portal
                </span>
                <span className="text-xs text-slate-300">• KHVI Helper Volunteer Onboarding</span>
              </div>
              <h1 className="mt-2 text-xl font-extrabold tracking-tight text-white sm:text-2xl">
                จัดการโปรไฟล์และสมัครล่ามจิตอาสา
              </h1>
              <p className="mt-1 text-xs text-slate-300 sm:text-sm">
                ลงทะเบียนทักษะทางภาษาและยื่นเอกสารเพื่อร่วมเป็นเครือข่ายช่วยเหลือผู้ประสบภัย
              </p>
            </div>

            {/* Badges */}
            <div className="flex items-center gap-2 shrink-0">
              <span className="rounded-(--khvi-radius-sm) border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-bold text-[#8ed5c4]">
                ✓ Data Dictionary 100%
              </span>
              <span className="rounded-(--khvi-radius-sm) border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-bold text-white/80">
                🔒 BR-04 Shield
              </span>
            </div>
          </div>
        </div>

        {/* Application Form */}
        <ApplicationForm
          availableLanguages={languages}
          availableCategories={categories}
        />
      </main>
    </WorkspaceShell>
  );
}
