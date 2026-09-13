"use client";

import { useState } from "react";
import {
  BriefcaseIcon,
  CheckBadgeIcon,
  CheckCircleIcon,
  DocumentTextIcon,
  ExclamationCircleIcon,
  IdentificationIcon,
  LanguageIcon,
  PhoneIcon,
  ShieldCheckIcon,
  XCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { InterpreterApplicant } from "../types";

type ApplicantDetailModalProps = {
  isOpen: boolean;
  applicant: InterpreterApplicant | null;
  onClose: () => void;
  onApprove: (id: string) => void;
  onReject: (id: string, reason: string) => void;
};

export function ApplicantDetailModal({
  isOpen,
  applicant,
  onClose,
  onApprove,
  onReject,
}: ApplicantDetailModalProps) {
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  if (!isOpen || !applicant) return null;

  const handleConfirmReject = () => {
    if (!rejectReason.trim()) return;
    onReject(applicant.id, rejectReason.trim());
    setRejectReason("");
    setRejectModalOpen(false);
    onClose();
  };

  return (
    <>
      {/* ================= CENTERED POP-UP MODAL (30% / 70% SPLIT) ================= */}
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-in fade-in">
        <div className="relative flex w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-[#d6e0e4] bg-white shadow-[0_24px_56px_rgba(15,38,54,0.25)] sm:flex-row max-h-[90vh]">
          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute right-3.5 top-3.5 z-10 rounded-lg p-1.5 text-[#6c8591] hover:bg-[#edf3f6] hover:text-[#112d3e] transition-colors cursor-pointer"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>

          {/* LEFT COLUMN: 30% (Profile, Photo, Contacts, Demographics) */}
          <div className="w-full sm:w-[32%] border-b sm:border-b-0 sm:border-r border-[#e3ebef] bg-[#f8fbfc] p-6 flex flex-col justify-between">
            <div>
              {/* Avatar & Name */}
              <div className="flex flex-col items-center text-center">
                <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-[#092f45] text-2xl font-black text-white shadow-md">
                  {applicant.name.slice(0, 2).toUpperCase()}
                </div>
                <h3 className="mt-3 text-base font-black text-[#102d3f]">
                  {applicant.name}
                </h3>
                <p className="text-xs text-[#637d8a]">
                  Application ID: <strong className="text-[#087f80]">#{applicant.id}</strong>
                </p>
                <span
                  className={`mt-2 inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-extrabold ${
                    applicant.status === "Approved"
                      ? "bg-[#e7f5f0] text-[#087557]"
                      : applicant.status === "Rejected"
                      ? "bg-[#fff1ef] text-[#d93829]"
                      : "bg-[#fef4e8] text-[#b36916]"
                  }`}
                >
                  {applicant.status}
                </span>
              </div>

              {/* Demographics & Check Badges */}
              <div className="mt-6 space-y-3 text-xs border-t border-[#e8f0f3] pt-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#8198a4]">
                    Nationality & Age
                  </span>
                  <p className="font-extrabold text-[#17384a]">
                    {applicant.country} · {applicant.age} years old
                  </p>
                </div>

                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#8198a4]">
                    Background Validation
                  </span>
                  <div className="mt-1 flex items-center gap-1.5">
                    <ShieldCheckIcon className="h-4 w-4 text-[#087557]" />
                    <span className="font-extrabold text-[#087557]">
                      {applicant.backgroundCheck}
                    </span>
                  </div>
                </div>

                {/* Direct Contact Channels */}
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#8198a4]">
                    Contact Channels
                  </span>
                  <div className="mt-1.5 space-y-1.5 text-xs text-[#2b4857]">
                    <div className="flex items-center gap-2 rounded-lg bg-white p-2 border border-[#e1ebef]">
                      <PhoneIcon className="h-3.5 w-3.5 text-[#087f80]" />
                      <span className="font-bold truncate">{applicant.contactChannels}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 text-[10px] text-[#869caa]">
              Submission timestamp: {applicant.appliedDate}
            </div>
          </div>

          {/* RIGHT COLUMN: 70% (Qualifications, Attachments, Experience, Decision Actions) */}
          <div className="w-full sm:w-[68%] p-6 flex flex-col justify-between overflow-y-auto">
            <div className="space-y-5">
              {/* 1. Language Competencies */}
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-[#637f8d] flex items-center gap-1.5">
                  <LanguageIcon className="h-4 w-4 text-[#087f80]" />
                  Language Qualifications & Proficiency
                </h4>
                <div className="mt-2 rounded-xl border border-[#e2ecf0] bg-[#fafcfd] p-3">
                  <p className="text-xs text-[#204051]">
                    Primary Language: <strong className="text-[#092f45]">{applicant.primaryLanguage}</strong>
                  </p>
                  <p className="mt-1 text-xs text-[#204051]">
                    Proficiency Scores: <strong className="text-[#087f80]">{applicant.proficiencyScore || "Verified Native"}</strong>
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {applicant.spokenLanguages.map((l) => (
                      <span
                        key={l}
                        className="rounded-md border border-[#d6e3e8] bg-white px-2 py-0.5 text-[11px] font-semibold text-[#224050]"
                      >
                        {l}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* 2. Submitted Credential Files */}
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-[#637f8d] flex items-center gap-1.5">
                  <IdentificationIcon className="h-4 w-4 text-[#087f80]" />
                  Submitted Credential Documents ({applicant.documents.length})
                </h4>
                <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {applicant.documents.map((doc) => (
                    <div
                      key={doc.name}
                      className="flex items-center justify-between rounded-xl border border-[#dce6eb] bg-white p-2.5 transition-colors hover:border-[#087f80]"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <DocumentTextIcon className="h-4 w-4 text-[#087f80] shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-[#143242] truncate">{doc.name}</p>
                          <p className="text-[10px] text-[#7b93a0]">{doc.size}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => alert(`Opening preview of ${doc.name}`)}
                        className="text-[11px] font-extrabold text-[#087f80] hover:underline px-2 py-1 cursor-pointer"
                      >
                        Preview
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* 3. Field Specialization / Categories */}
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-[#637f8d] flex items-center gap-1.5">
                  <BriefcaseIcon className="h-4 w-4 text-[#087f80]" />
                  Field Specialization & Categories
                </h4>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {applicant.specialtyCategories.map((cat) => (
                    <span
                      key={cat}
                      className="rounded-md bg-[#edf7f5] px-2.5 py-1 text-xs font-bold text-[#087f80]"
                    >
                      {cat}
                    </span>
                  ))}
                </div>
              </div>

              {/* Rejection Note If Applicable */}
              {applicant.rejectionReason && (
                <div className="rounded-xl border border-[#f8c9c4] bg-[#fff5f4] p-3 text-xs">
                  <p className="font-extrabold text-[#d93829]">Specified Rejection Reason:</p>
                  <p className="mt-1 text-[#b8291b]">{applicant.rejectionReason}</p>
                </div>
              )}
            </div>

            {/* Bottom Action Bar */}
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-[#edf2f5] pt-4">
              <div className="text-xs text-[#627d8c]">
                {applicant.status === "Approved" ? (
                  <span className="inline-flex items-center gap-1.5 font-medium text-[#087557]">
                    <CheckCircleIcon className="h-4 w-4" />
                    Approved volunteers are locked. Revocation or role suspension is managed by Admin (FR-76–83).
                  </span>
                ) : applicant.status === "Rejected" ? (
                  <span className="inline-flex items-center gap-1.5 font-medium text-[#c0392b]">
                    <XCircleIcon className="h-4 w-4" />
                    Application rejected. Re-review or status alteration requires Manager escalation.
                  </span>
                ) : (
                  <span>Review all credentials before approving or rejecting candidate.</span>
                )}
              </div>

              <div className="flex w-full sm:w-auto items-center justify-end gap-3">
                {/* Manager cannot reject once Approved (Admin manages revocation/lock FR-76 to 83) */}
                {applicant.status !== "Approved" && (
                  <button
                    type="button"
                    onClick={() => setRejectModalOpen(true)}
                    disabled={applicant.status === "Rejected"}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-xl border border-[#f2a299] bg-[#fff6f5] px-5 py-2.5 text-xs font-black text-[#d93829] hover:bg-[#ffeceb] disabled:opacity-50 cursor-pointer"
                  >
                    <XCircleIcon className="h-4 w-4" />
                    Reject Application
                  </button>
                )}

                {applicant.status !== "Approved" ? (
                  <button
                    type="button"
                    onClick={() => {
                      onApprove(applicant.id);
                      onClose();
                    }}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#087557] px-6 py-2.5 text-xs font-black text-white shadow-xs hover:bg-[#066148] cursor-pointer"
                  >
                    <CheckCircleIcon className="h-4 w-4" />
                    Approve Application
                  </button>
                ) : (
                  <div className="inline-flex items-center gap-1.5 rounded-xl bg-[#e7f5f0] px-4 py-2 text-xs font-bold text-[#087557]">
                    <CheckBadgeIcon className="h-4 w-4" />
                    Authorized Interpreter
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* REJECT MODAL (FR-44, FR-45) */}
      {rejectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-[#d6e0e4] bg-white p-6 shadow-[0_24px_48px_rgba(17,40,58,0.2)] animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-[#e9f0f3] pb-3">
              <div className="flex items-center gap-2">
                <ExclamationCircleIcon className="h-5 w-5 text-[#d93829]" />
                <h4 className="text-base font-extrabold text-[#112b3c]">
                  Reject Interpreter Application
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setRejectModalOpen(false)}
                className="text-[#728b97] hover:text-[#112b3c] cursor-pointer"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <p className="mt-3 text-xs leading-relaxed text-[#59717d]">
              Managers must provide an explicit explanation when rejecting an applicant. This reason will be logged and notified to the applicant.
            </p>

            <div className="mt-4">
              <label htmlFor="modal-reject-reason" className="block text-xs font-extrabold text-[#143141]">
                Rejection Reason (Required)
              </label>
              <textarea
                id="modal-reject-reason"
                rows={3}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g. Incomplete proof of medical language certification, or contact verification failed."
                className="mt-1.5 w-full rounded-lg border border-[#cddae0] p-2.5 text-xs text-[#133040] focus:border-[#087f80] focus:outline-none"
              />
            </div>

            <div className="mt-6 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setRejectModalOpen(false)}
                className="rounded-lg border border-[#cddae0] bg-white px-4 py-2 text-xs font-bold text-[#455f6d] hover:bg-[#f0f4f6] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                disabled={!rejectReason.trim()}
                className="rounded-lg bg-[#d93829] px-4 py-2 text-xs font-extrabold text-white hover:bg-[#b8291b] disabled:opacity-50 cursor-pointer"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

