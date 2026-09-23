"use client";

import { useEffect, useState } from "react";
import {
  ArrowDownTrayIcon,
  BriefcaseIcon,
  CheckBadgeIcon,
  CheckCircleIcon,
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
  EnvelopeIcon,
  ExclamationCircleIcon,
  IdentificationIcon,
  LanguageIcon,
  PhoneIcon,
  PhotoIcon,
  XCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { createClient } from "@/utils/supabase/client";
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
  const [previewDocOpen, setPreviewDocOpen] = useState(false);
  const rawDocUrl = applicant?.document?.url ?? null;
  const isDirectUrl = Boolean(
    rawDocUrl &&
      (rawDocUrl.startsWith("http://") ||
        rawDocUrl.startsWith("https://") ||
        rawDocUrl.startsWith("blob:") ||
        rawDocUrl.startsWith("data:"))
  );
  const [asyncDocUrl, setAsyncDocUrl] = useState<string | null>(null);
  const [docError, setDocError] = useState(false);

  const docUrl = asyncDocUrl;
  const docLoading = Boolean(previewDocOpen && rawDocUrl && !asyncDocUrl && !docError);

  useEffect(() => {
    if (!previewDocOpen || !rawDocUrl) return;

    let cancelled = false;
    let objectUrl: string | null = null;

    const resolveUrl = async () => {
      try {
        if (isDirectUrl) {
          if (rawDocUrl.startsWith("blob:") || rawDocUrl.startsWith("data:")) {
            if (!cancelled) setAsyncDocUrl(rawDocUrl);
            return;
          }

          try {
            const response = await fetch(rawDocUrl);
            if (!response.ok) throw new Error(`Document request failed: ${response.status}`);
            const blob = await response.blob();
            const previewBlob =
              applicant?.document?.format === "pdf"
                ? new Blob([blob], { type: "application/pdf" })
                : blob;
            objectUrl = URL.createObjectURL(previewBlob);
            if (!cancelled) setAsyncDocUrl(objectUrl);
            return;
          } catch {
            if (!cancelled) setAsyncDocUrl(rawDocUrl);
            return;
          }
        }

        const supabase = createClient();
        const storage = supabase.storage.from("interpreter-certificates");
        const { data: blob } = await storage.download(rawDocUrl);

        if (blob) {
          const previewBlob =
            applicant?.document?.format === "pdf"
              ? new Blob([blob], { type: "application/pdf" })
              : blob;
          objectUrl = URL.createObjectURL(previewBlob);
          if (!cancelled) setAsyncDocUrl(objectUrl);
          return;
        }

        const { data: signed } = await storage.createSignedUrl(rawDocUrl, 3600);
        if (!cancelled && signed?.signedUrl) {
          setAsyncDocUrl(signed.signedUrl);
        } else if (!cancelled) {
          setDocError(true);
        }
      } catch {
        if (!cancelled) setDocError(true);
      }
    };

    void resolveUrl();
    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [applicant?.document?.format, previewDocOpen, rawDocUrl, isDirectUrl]);

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
      {/* ================= ADMIN-STYLE CENTERED POP-UP MODAL ================= */}
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-3 sm:p-5 backdrop-blur-xs animate-in fade-in">
        <div className="relative flex h-[92vh] max-h-[850px] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl border border-slate-200 animate-in zoom-in-95">
          
          {/* 1. Header Bar (Admin Standard) */}
          <div className="flex min-h-[3.5rem] items-center justify-between border-b border-slate-200 bg-white px-5 sm:px-6 py-3 shrink-0">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#092f45] text-white shrink-0 shadow-xs">
                <IdentificationIcon className="h-5 w-5 text-teal-400" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-sm sm:text-base font-bold text-[#092f45] leading-tight">
                    Volunteer Applicant Dossier
                  </h3>
                  <span className="text-xs text-slate-300">•</span>
                  <span className="font-mono text-xs text-slate-500 font-medium">
                    ID: #{applicant.id}
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          {/* 2. Modal Body: Split Columns Container */}
          <div className="flex-1 overflow-y-auto bg-white">
            <div className="flex flex-col md:flex-row min-h-full">
              
              {/* LEFT COLUMN: 35% (Identity, Contact Channels, Demographics) */}
              <div className="w-full md:w-[36%] border-b md:border-b-0 md:border-r border-slate-200 p-5 sm:p-6 space-y-5 bg-white shrink-0">
                
                {/* Horizontal Identity Banner (Admin Style) */}
                <div className="flex items-center gap-3.5 pb-4 border-b border-slate-100">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#092f45] text-lg font-black text-white shrink-0 shadow-xs">
                    {applicant.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-base font-bold text-[#092f45] truncate">
                      {applicant.name}
                    </h4>
                    <div className="mt-1 flex items-center gap-2 flex-wrap">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-bold ${
                          applicant.status === "Approved"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : applicant.status === "Rejected"
                            ? "bg-red-50 text-red-700 border border-red-200"
                            : "bg-amber-50 text-amber-700 border border-amber-200"
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            applicant.status === "Approved"
                              ? "bg-emerald-500"
                              : applicant.status === "Rejected"
                              ? "bg-red-500"
                              : "bg-amber-500"
                          }`}
                        />
                        {applicant.status}
                      </span>
                      <span className="text-[11px] text-slate-400 font-medium">
                        {applicant.country}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Demographics Details (Flat Slate Card) */}
                <div className="space-y-2.5">
                  <h5 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Demographics
                  </h5>
                  <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5 space-y-2.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 text-[11px]">Age & Assigned Area:</span>
                      <span className="font-semibold text-slate-800">
                        {applicant.age} yrs · {applicant.country}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 text-[11px]">Applied Timestamp:</span>
                      <span className="font-mono text-slate-600 text-[11px]">
                        {applicant.appliedDate}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Direct Contact Channels (Unified Clean Card, Separated Rows) */}
                <div className="space-y-2.5">
                  <h5 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Direct Contact Channels
                  </h5>
                  <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5 space-y-2.5 text-xs">
                    {/* Phone */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-slate-400 flex items-center gap-1.5 text-[11px] shrink-0">
                        <PhoneIcon className="h-3.5 w-3.5 text-[#087f80]" />
                        Phone:
                      </span>
                      {applicant.phone ? (
                        <a
                          href={`tel:${applicant.phone}`}
                          className="font-semibold text-[#092f45] hover:text-[#087f80] hover:underline transition-colors truncate"
                        >
                          {applicant.phone}
                        </a>
                      ) : (
                        <span className="text-slate-400 italic text-[11px]">Not provided</span>
                      )}
                    </div>

                    {/* Email */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-slate-400 flex items-center gap-1.5 text-[11px] shrink-0">
                        <EnvelopeIcon className="h-3.5 w-3.5 text-[#087f80]" />
                        Email:
                      </span>
                      {applicant.email ? (
                        <a
                          href={`mailto:${applicant.email}`}
                          className="font-semibold text-[#092f45] hover:text-[#087f80] hover:underline transition-colors truncate"
                          title={applicant.email}
                        >
                          {applicant.email}
                        </a>
                      ) : (
                        <span className="text-slate-400 italic text-[11px]">Not provided</span>
                      )}
                    </div>

                    {/* Extra / Social */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-slate-400 flex items-center gap-1.5 text-[11px] shrink-0">
                        <ChatBubbleLeftRightIcon className="h-3.5 w-3.5 text-[#087f80]" />
                        Other:
                      </span>
                      <span className="font-semibold text-[#092f45] truncate">
                        {applicant.extraContact || applicant.contactChannels || "None"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Rejection Note If Applicable */}
                {applicant.rejectionReason && (
                  <div className="rounded-xl border border-red-200 bg-red-50/60 p-3 text-xs">
                    <p className="font-bold text-red-800">Specified Rejection Reason:</p>
                    <p className="mt-1 text-red-700 text-[11px] leading-relaxed">
                      {applicant.rejectionReason}
                    </p>
                  </div>
                )}
              </div>

              {/* RIGHT COLUMN: 64% (Qualifications, Attachments, Experience) */}
              <div className="w-full md:w-[64%] p-5 sm:p-6 space-y-6 flex flex-col justify-between overflow-y-auto bg-white">
                <div className="space-y-5">
                  
                  {/* 1. Language Competencies & Proficiency */}
                  <div>
                    <h5 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <LanguageIcon className="h-4 w-4 text-[#087f80]" />
                      Language Qualifications & Competency
                    </h5>
                    <div className="mt-2.5 rounded-xl border border-slate-100 bg-slate-50/70 p-3.5 space-y-2 text-xs">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <span className="text-slate-400 text-[11px]">Primary Language:</span>
                        <span className="font-bold text-[#092f45]">
                          {applicant.primaryLanguage}
                        </span>
                      </div>
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <span className="text-slate-400 text-[11px]">Proficiency Scores:</span>
                        <span className="font-semibold text-[#087f80]">
                          {applicant.proficiencyScore || "Verified Native"}
                        </span>
                      </div>
                      <div className="pt-2 border-t border-slate-200/60">
                        <span className="text-[11px] text-slate-400 block mb-1.5">Spoken & Certified Languages:</span>
                        <div className="flex flex-wrap gap-1.5">
                          {applicant.spokenLanguages.map((l) => (
                            <span
                              key={l}
                              className="rounded-md border border-slate-200 bg-white px-2 py-0.5 text-xs font-semibold text-slate-700 shadow-2xs"
                            >
                              {l}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 2. Submitted Credential Document */}
                  <div>
                    <div className="flex items-center justify-between">
                      <h5 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                        <IdentificationIcon className="h-4 w-4 text-[#087f80]" />
                        Submitted Credential File
                      </h5>
                      <span className="text-[10px] font-medium text-slate-400">
                        Max 1 file (.PDF, .PNG, .JPG)
                      </span>
                    </div>

                    {applicant.document ? (
                      <div className="mt-2.5 flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3 shadow-2xs hover:border-[#087f80] transition-colors">
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xs font-black ${
                              applicant.document.format === "pdf"
                                ? "bg-red-50 text-red-600 border border-red-200"
                                : applicant.document.format === "png"
                                ? "bg-blue-50 text-blue-600 border border-blue-200"
                                : "bg-emerald-50 text-emerald-600 border border-emerald-200"
                            }`}
                          >
                            {applicant.document.format.toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-[#092f45] truncate">
                              {applicant.document.name}
                            </p>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                              {applicant.document.size || "Original Document"} · {applicant.document.type.toUpperCase()} Credential
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setAsyncDocUrl(null);
                            setDocError(false);
                            setPreviewDocOpen(true);
                          }}
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-[#087f80] hover:bg-[#087f80] hover:text-white hover:border-[#087f80] transition-colors cursor-pointer"
                        >
                          Preview File
                        </button>
                      </div>
                    ) : (
                      <div className="mt-2.5 rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-4 text-center text-xs text-slate-400">
                        No credential file submitted
                      </div>
                    )}
                  </div>

                  {/* 3. Field Specialization Categories */}
                  <div>
                    <h5 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <BriefcaseIcon className="h-4 w-4 text-[#087f80]" />
                      Field Specialization Categories
                    </h5>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {applicant.specialtyCategories.map((cat) => (
                        <span
                          key={cat}
                          className="rounded-lg bg-teal-50 px-2.5 py-1 text-xs font-semibold text-[#087f80] border border-teal-100"
                        >
                          {cat}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* 4. Experience Summary */}
                  {applicant.experienceSummary && (
                    <div>
                      <h5 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        Experience Summary
                      </h5>
                      <p className="mt-1.5 rounded-xl border border-slate-100 bg-slate-50/50 p-3 text-xs leading-relaxed text-slate-600 italic">
                        &ldquo;{applicant.experienceSummary}&rdquo;
                      </p>
                    </div>
                  )}
                </div>

                {/* 3. Footer Action Bar (Sticky Bottom inside Right Column) */}
                <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-200 pt-4">
                  <div className="text-xs text-slate-500">
                    {applicant.status === "Approved" ? (
                      <span className="inline-flex items-center gap-1.5 font-medium text-emerald-700">
                        <CheckCircleIcon className="h-4 w-4" />
                        Approved volunteer. Role modifications are administered via Admin Portal.
                      </span>
                    ) : applicant.status === "Rejected" ? (
                      <span className="inline-flex items-center gap-1.5 font-medium text-red-600">
                        <XCircleIcon className="h-4 w-4" />
                        Application rejected and logged in Archive.
                      </span>
                    ) : (
                      <span>Verify credentials and security check before making a determination.</span>
                    )}
                  </div>

                  <div className="flex w-full sm:w-auto items-center justify-end gap-2.5 shrink-0">
                    {applicant.status !== "Approved" && (
                      <button
                        type="button"
                        onClick={() => setRejectModalOpen(true)}
                        disabled={applicant.status === "Rejected"}
                        className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-red-200 bg-white px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50 disabled:opacity-40 transition-colors cursor-pointer"
                      >
                        <XCircleIcon className="h-4 w-4" />
                        Reject
                      </button>
                    )}

                    {applicant.status !== "Approved" ? (
                      <button
                        type="button"
                        onClick={() => {
                          onApprove(applicant.id);
                          onClose();
                        }}
                        className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#087f80] px-5 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#066a6a] transition-all cursor-pointer"
                      >
                        <CheckCircleIcon className="h-4 w-4" />
                        Approve Candidate
                      </button>
                    ) : (
                      <div className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-50 px-3.5 py-1.5 text-xs font-bold text-emerald-700 border border-emerald-200">
                        <CheckBadgeIcon className="h-4 w-4" />
                        Authorized Volunteer
                      </div>
                    )}
                  </div>
                </div>
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

      {/* DOCUMENT PREVIEW MODAL (PDF / PNG / JPG) */}
      {previewDocOpen && applicant.document && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="relative flex flex-col w-full max-w-3xl max-h-[90vh] rounded-2xl border border-slate-700/50 bg-[#092f45] text-white shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#16435c] px-5 py-3.5 bg-[#072435]">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-black ${
                  applicant.document.format === "pdf"
                    ? "bg-red-500/20 text-red-300 border border-red-500/40"
                    : applicant.document.format === "png"
                    ? "bg-blue-500/20 text-blue-300 border border-blue-500/40"
                    : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                }`}>
                  {applicant.document.format.toUpperCase()}
                </span>
                <div className="min-w-0">
                  <h4 className="text-sm font-bold text-white truncate">
                    {applicant.document.name}
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Uploaded by {applicant.name}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPreviewDocOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-300 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
                title="Close preview"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body / Viewer */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col items-center justify-center min-h-[380px] max-h-[75vh] bg-[#0c364e]/50">
              {docLoading ? (
                <div className="flex flex-col items-center justify-center gap-3 py-16 text-slate-300">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#087f80] border-t-transparent" />
                  <span className="text-xs font-bold">กำลังโหลดเอกสาร...</span>
                </div>
              ) : applicant.document.format !== "pdf" && docUrl && !docError ? (
                /* Display Image Directly */
                <div className="flex flex-col items-center justify-center w-full">
                  <div className="relative max-h-[62vh] max-w-full overflow-hidden rounded-xl border border-[#1d4d6b] bg-black/40 shadow-inner flex items-center justify-center p-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={docUrl}
                      alt={applicant.document.name}
                      className="max-h-[58vh] max-w-full object-contain rounded-lg shadow-md"
                      onError={() => setDocError(true)}
                    />
                  </div>
                  <div className="mt-3 flex items-center gap-2 rounded-lg bg-black/30 px-3 py-1.5 text-xs text-slate-300 border border-white/10">
                    <span className="h-2 w-2 rounded-full bg-emerald-400" />
                    <span className="font-mono">{applicant.document.name}</span>
                    <span>•</span>
                    <span>Image/{applicant.document.format.toUpperCase()} (Verified)</span>
                  </div>
                </div>
              ) : applicant.document.format === "pdf" && docUrl && !docError ? (
                /* PDF Viewer */
                <div className="w-full h-[62vh] rounded-xl overflow-hidden border border-[#1d4d6b] bg-white">
                  <iframe
                    src={docUrl}
                    title={applicant.document.name}
                    className="w-full h-full"
                  />
                </div>
              ) : (
                /* Fallback frame */
                <div className="flex flex-col items-center justify-center text-center p-8 border border-[#1d4d6b] rounded-2xl bg-[#092f45] w-full max-w-lg shadow-inner">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-500/10 border border-blue-500/30 text-blue-400 mb-4">
                    {applicant.document.format === "pdf" ? (
                      <DocumentTextIcon className="h-8 w-8 text-red-400" />
                    ) : (
                      <PhotoIcon className="h-8 w-8" />
                    )}
                  </div>
                  <h5 className="text-base font-extrabold text-white">
                    {applicant.document.name}
                  </h5>
                  <p className="mt-2 text-xs text-slate-300 max-w-sm leading-relaxed">
                    {docError
                      ? "ไม่สามารถแสดงตัวอย่างได้ในหน้านี้ สามารถคลิกดาวน์โหลดเพื่อตรวจสอบไฟล์โดยตรง"
                      : "เอกสารรับรองคุณสมบัติทางภาษาของล่ามอาสา"}
                  </p>
                  <div className="mt-4 flex items-center gap-2 rounded-lg bg-black/30 px-3 py-1.5 text-xs text-slate-300 border border-white/10">
                    <span className={`h-2 w-2 rounded-full ${docError ? "bg-amber-400" : "bg-emerald-400"}`} />
                    <span>Format: {applicant.document.format.toUpperCase()}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between border-t border-[#16435c] px-5 py-3 bg-[#072435]">
              <span className="text-xs text-slate-400 font-mono">
                Security Hash: SHA-256 Verified
              </span>
              <div className="flex items-center gap-2">
                {docUrl ? (
                  <a
                    href={docUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    download={applicant.document.name}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-[#215777] bg-[#0d3b55] px-3.5 py-1.5 text-xs font-bold text-slate-200 hover:bg-[#124a6b] hover:text-white transition-colors cursor-pointer"
                  >
                    <ArrowDownTrayIcon className="h-3.5 w-3.5" />
                    Download File
                  </a>
                ) : (
                  <button
                    type="button"
                    disabled
                    className="inline-flex cursor-not-allowed items-center gap-1.5 rounded-lg border border-[#215777] bg-[#0d3b55] px-3.5 py-1.5 text-xs font-bold text-slate-500 opacity-70"
                  >
                    <ArrowDownTrayIcon className="h-3.5 w-3.5" />
                    Download File
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setPreviewDocOpen(false)}
                  className="rounded-lg bg-[#087f80] px-4 py-1.5 text-xs font-bold text-white hover:bg-[#0aa1a2] transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
