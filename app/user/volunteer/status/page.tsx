"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useStoredLocale } from "@/app/lib/locale";
import { WorkspaceShell } from "@/app/components/workspace-shell";
import { WorkspaceBreadcrumbs } from "@/app/components/workspace-breadcrumbs";
import {
  cancelInterpreterApplicationAction,
  loadMyInterpreterApplicationAction,
  reuploadInterpreterCertificateAction,
  uploadInterpreterCertificateAction,
} from "@/app/actions/interpreter-application-actions";
import type { InterpreterApplication } from "@/app/lib/interpreter-application-types";
import { ApplicationStatusPanel } from "@/components/volunteer/ApplicationStatusPanel";

const statusCopy = {
  en: { loading: "Loading application data...", empty: "No volunteer application yet", emptyBody: "Start an application to submit your credentials for Manager review", home: "Back to Home", apply: "Go to application form" },
  th: { loading: "กำลังโหลดข้อมูลใบสมัคร...", empty: "ยังไม่มีใบสมัครล่ามอาสา", emptyBody: "เริ่มกรอกข้อมูลเพื่อส่งให้ Manager ตรวจสอบคุณสมบัติ", home: "กลับสู่หน้าหลัก", apply: "ไปหน้าใบสมัคร" },
  zh: { loading: "正在加载申请数据...", empty: "暂无志愿口译员申请", emptyBody: "开始填写以提交管理员审核资质", home: "返回首页", apply: "前往申请页面" },
  es: { loading: "Cargando los datos de la solicitud...", empty: "Aún no tienes una solicitud de voluntariado", emptyBody: "Inicia una solicitud para enviar tus credenciales a revisión del gestor", home: "Volver al inicio", apply: "Ir al formulario" },
  ar: { loading: "جارٍ تحميل بيانات الطلب...", empty: "لا يوجد طلب تطوع حتى الآن", emptyBody: "ابدأ طلبًا لإرسال مؤهلاتك إلى مراجعة المدير", home: "العودة إلى الرئيسية", apply: "الانتقال إلى نموذج الطلب" },
} as const;

export default function VolunteerStatusPage() {
  // This page owns its state above WorkspaceShell, so read the shared persisted
  // locale directly instead of consuming a provider that is rendered below it.
  const [locale] = useStoredLocale();
  const t = statusCopy[locale];
  const router = useRouter();
  const [application, setApplication] = useState<InterpreterApplication | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let disposed = false;

    const loadApplication = async () => {
      const result = await loadMyInterpreterApplicationAction();
      if (disposed) return;
      if (result.ok) {
        setApplication(result.data);
      } else {
        setError(result.error);
      }
      setReady(true);
    };

    void loadApplication();
    return () => {
      disposed = true;
    };
  }, []);

  const reloadApplication = async () => {
    const result = await loadMyInterpreterApplicationAction();
    if (result.ok) {
      setApplication(result.data);
      setError(null);
    } else {
      setError(result.error);
    }
  };

  return (
    <WorkspaceShell requiredAccountRole="User">
      <main id="main-content" className="mx-auto w-full max-w-[1400px] px-5 py-8 sm:px-8 lg:px-10">
        {/* Navigation Breadcrumb */}
        <WorkspaceBreadcrumbs
          ariaLabel="แถบนำทางระบบล่ามอาสา"
          items={[
            { label: "หน้าหลัก", href: "/user" },
            { label: "สถานะใบสมัครล่ามอาสา" },
          ]}
          className="mb-6"
        />

        {!ready ? (
          <section className="rounded-(--khvi-radius-md) border border-[#d6e0e4] bg-white p-8 text-center text-sm text-[#64777e] shadow-sm">
            {t.loading}
          </section>
        ) : error && !application ? (
          <section role="alert" className="rounded-(--khvi-radius-md) border border-[#f8c5be] bg-[#fff1f2] p-8 text-center text-sm font-bold text-[#b8291b]">
            {error}
          </section>
        ) : !application ? (
          <section className="rounded-(--khvi-radius-md) border border-[#d6e0e4] bg-white p-8 text-center shadow-sm">
            <p className="text-sm font-extrabold text-[#10283a]">
              {t.empty}
            </p>
            <p className="mt-2 text-xs text-[#64777e]">
              {t.emptyBody}
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-3">
              <a
                href="/user"
                className="inline-flex min-h-11 items-center justify-center rounded-(--khvi-radius-sm) border border-[#cbd7dc] bg-white px-5 py-2.5 text-sm font-bold text-[#53656c] hover:bg-[#f4f7f8]"
              >
                {t.home}
              </a>
              <a
                href="/user/volunteer/apply#main-content"
                className="inline-flex min-h-11 items-center justify-center rounded-(--khvi-radius-sm) bg-[#092f45] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#0c4960]"
              >
                {t.apply}
              </a>
            </div>
          </section>
        ) : (
          <>
            {error && (
              <div role="alert" className="mb-4 rounded-(--khvi-radius-sm) border border-[#f8c5be] bg-[#fff1f2] p-3 text-sm font-bold text-[#b8291b]">
                {error}
              </div>
            )}
            <ApplicationStatusPanel
              application={application}
              onCancel={(reason) => {
                setError(null);
                void cancelInterpreterApplicationAction(application.id, reason).then((result) => {
                  if (!result.ok) {
                    setError(result.error);
                    return;
                  }
                  router.push("/user");
                });
              }}
              onReupload={(file) => {
                setError(null);
                const uploadData = new FormData();
                uploadData.set("file", file);
                void uploadInterpreterCertificateAction(uploadData).then((uploadResult) => {
                  if (!uploadResult.ok) {
                    setError(uploadResult.error);
                    return;
                  }
                  void reuploadInterpreterCertificateAction({
                    applicationId: application.id,
                    fileName: uploadResult.data.fileName,
                    fileUrl: uploadResult.data.path,
                  }).then((result) => {
                    if (!result.ok) {
                      setError(result.error);
                      return;
                    }
                    void reloadApplication();
                  });
                });
              }}
            />
          </>
        )}
      </main>
    </WorkspaceShell>
  );
}
