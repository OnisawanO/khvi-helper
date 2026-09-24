import type { Metadata } from "next";
import { AppShell } from "@/app/components/app-shell";
import { WorkspaceBreadcrumbs } from "@/app/components/workspace-breadcrumbs";
import { CombinedInterpreterRegisterForm } from "@/components/volunteer/CombinedInterpreterRegisterForm";
import { loadPublicInterpreterApplicationReferences } from "@/app/lib/real-interpreter-application-data";
import { VolunteerApplyHeader } from "@/components/volunteer/VolunteerApplyHeader";

export const metadata: Metadata = {
  title: "ลงทะเบียนล่ามจิตอาสา · KHVI Helper",
  description: "สมัครสมาชิกบัญชีผู้ใช้และยื่นเอกสารคุณสมบัติล่ามจิตอาสาในขั้นตอนเดียว",
};

export default async function CombinedInterpreterRegisterPage() {
  const { languages, categories } = await loadPublicInterpreterApplicationReferences();

  return (
    <AppShell hidePrimaryAction>
      <main id="main-content" className="mx-auto w-full max-w-[1200px] px-5 py-8 sm:px-8 lg:px-10">
        {/* Navigation Breadcrumb */}
        <WorkspaceBreadcrumbs
          ariaLabel="แถบนำทางลงทะเบียนล่ามอาสา"
          items={[
            { label: "หน้าหลัก", href: "/" },
            { label: "ลงทะเบียนล่ามจิตอาสา" },
          ]}
          className="mb-6"
        />

        {/* Header Banner */}
        <VolunteerApplyHeader />

        {/* Combined Registration Form */}
        <CombinedInterpreterRegisterForm
          availableLanguages={languages}
          availableCategories={categories}
        />
      </main>
    </AppShell>
  );
}

