"use client";

import { useEffect, useState } from "react";
import { WorkspaceShell } from "@/app/components/workspace-shell";
import {
  cancelInterpreterApplicationAction,
  loadMyInterpreterApplicationAction,
  reuploadInterpreterCertificateAction,
  uploadInterpreterCertificateAction,
} from "@/app/actions/interpreter-application-actions";
import type { InterpreterApplication } from "@/app/lib/interpreter-application";
import { ApplicationStatusPanel } from "@/components/volunteer/ApplicationStatusPanel";

export default function VolunteerStatusPage() {
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
    <WorkspaceShell>
      <main id="main-content" className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6">
        {!ready ? (
          <section className="border border-[#d6e0e4] bg-white p-8 text-center text-sm text-[#64777e] shadow-sm">
            กำลังโหลดข้อมูลใบสมัคร...
          </section>
        ) : !application ? (
          <section className="border border-[#d6e0e4] bg-white p-8 text-center shadow-sm">
            <p className="text-sm font-extrabold text-[#10283a]">ยังไม่มีใบสมัครล่ามอาสา</p>
            <p className="mt-2 text-xs text-[#64777e]">เริ่มกรอกข้อมูลเพื่อส่งให้ Manager ตรวจสอบคุณสมบัติ</p>
            <a
              href="/volunteer/apply#main-content"
              className="mt-5 inline-flex min-h-11 items-center justify-center bg-[#092f45] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#0c4960]"
            >
              ไปหน้าใบสมัคร
            </a>
          </section>
        ) : (
          <>
            {error && (
              <div role="alert" className="mb-4 border border-[#f8c5be] bg-[#fff1f2] p-3 text-sm font-bold text-[#b8291b]">
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
                  void reloadApplication();
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
