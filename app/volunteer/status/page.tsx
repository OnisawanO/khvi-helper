"use client";

import { useEffect, useState } from "react";
import { WorkspaceShell } from "@/app/components/workspace-shell";
import { getMockUserSession } from "@/app/lib/mock-auth";
import {
  cancelInterpreterApplication,
  reuploadInterpreterCertificate,
  useMyInterpreterApplication,
} from "@/app/lib/interpreter-application";
import { ApplicationStatusPanel } from "@/components/volunteer/ApplicationStatusPanel";

export default function VolunteerStatusPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const session = getMockUserSession();
    queueMicrotask(() => setUserId(session?.userId ?? null));
  }, []);

  const { application, ready } = useMyInterpreterApplication(userId);

  return (
    <WorkspaceShell>
      <main id="main-content" className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6">
        {!ready || !userId ? (
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
                try {
                  setError(null);
                  cancelInterpreterApplication(application.id, userId, reason);
                } catch (cancelError) {
                  setError(cancelError instanceof Error ? cancelError.message : "ถอนใบสมัครไม่สำเร็จ");
                }
              }}
              onReupload={(fileName) => {
                try {
                  setError(null);
                  reuploadInterpreterCertificate(application.id, fileName);
                } catch (uploadError) {
                  setError(uploadError instanceof Error ? uploadError.message : "อัปโหลดเอกสารไม่สำเร็จ");
                }
              }}
            />
          </>
        )}
      </main>
    </WorkspaceShell>
  );
}
