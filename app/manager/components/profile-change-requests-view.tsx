"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  AdjustmentsHorizontalIcon,
  ArrowDownTrayIcon,
  CheckIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ClockIcon,
  DocumentCheckIcon,
  DocumentMagnifyingGlassIcon,
  DocumentTextIcon,
  IdentificationIcon,
  PhotoIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { createClient } from "@/utils/supabase/client";
import type {
  ProfileChangeRequest,
  ProfileChangeRequestStatus,
  ProfileChangeRequestType,
} from "../types";
import { parseManagerTimestamp } from "../utils";

interface ProfileChangeRequestsViewProps {
  requests: ProfileChangeRequest[];
  statusDecisionOrder: Record<string, number>;
  onApprove: (requestId: string) => Promise<void>;
  onRequestChanges: (requestId: string, note: string) => Promise<void>;
  onReject: (requestId: string, note: string) => Promise<void>;
}

const statusOptions: Array<{ id: ProfileChangeRequestStatus; label: string }> = [
  { id: "Pending Review", label: "Pending review" },
  { id: "Changes Requested", label: "Changes requested" },
  { id: "Approved", label: "Approved" },
  { id: "Rejected", label: "Rejected" },
];

const requestTypeOptions: Array<{
  id: ProfileChangeRequestType;
  label: string;
}> = [
  { id: "language", label: "Language" },
  { id: "category", label: "Category" },
  { id: "both", label: "Both" },
];

const statusStyles: Record<
  ProfileChangeRequestStatus,
  { className: string; dotClassName: string }
> = {
  "Pending Review": {
    className: "border-amber-200 bg-amber-50 text-amber-800",
    dotClassName: "bg-amber-500",
  },
  "Changes Requested": {
    className: "border-orange-200 bg-orange-50 text-orange-800",
    dotClassName: "bg-orange-500",
  },
  Approved: {
    className: "border-emerald-200 bg-emerald-50 text-emerald-800",
    dotClassName: "bg-emerald-500",
  },
  Rejected: {
    className: "border-red-200 bg-red-50 text-red-800",
    dotClassName: "bg-red-500",
  },
};

const requestTypeStyles: Record<
  ProfileChangeRequestType,
  { label: string; className: string }
> = {
  language: {
    label: "Language update",
    className: "border-sky-200 bg-sky-50 text-sky-800",
  },
  category: {
    label: "Category update",
    className: "border-violet-200 bg-violet-50 text-violet-800",
  },
  both: {
    label: "Language & category update",
    className: "border-teal-200 bg-teal-50 text-teal-800",
  },
};

function formatSubmittedAt(value: string) {
  const parsed = new Date(value.replace(" ", "T"));
  if (Number.isNaN(parsed.getTime())) return value;

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(parsed);
}

function getEvidenceFormatLabel(file: ProfileChangeRequest["evidenceFiles"][number]) {
  if (file.format === "pdf") return "PDF";
  const extension = file.name.split(".").pop()?.toUpperCase();
  return extension && extension !== file.name ? extension : "IMAGE";
}

function getRequestSummary(request: ProfileChangeRequest, requested: boolean) {
  if (request.requestType !== "both") {
    return (requested ? request.requestedValues : request.currentValues).join(", ");
  }

  const languages = (requested ? request.requestedLanguages : request.currentLanguages) ?? [];
  const categories = (requested ? request.requestedCategories : request.currentCategories) ?? [];
  return "Languages: " + languages.join(", ") + " · Categories: " + categories.join(", ");
}

function getCombinedValues(request: ProfileChangeRequest, requested: boolean, kind: "language" | "category") {
  if (request.requestType !== "both") return [];
  return kind === "language"
    ? (requested ? request.requestedLanguages : request.currentLanguages) ?? []
    : (requested ? request.requestedCategories : request.currentCategories) ?? [];
}

function ChangeComparison({
  label,
  currentValues,
  requestedValues,
}: {
  label: string;
  currentValues: string[];
  requestedValues: string[];
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
      <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">{label}</p>
      <div className="mt-2 grid gap-2 sm:grid-cols-2">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Current</p>
          <p className="mt-1 text-sm font-semibold text-[#244253]">{currentValues.join(", ") || "—"}</p>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wide text-sky-700">Requested</p>
          <p className="mt-1 text-sm font-semibold text-sky-900">{requestedValues.join(", ") || "—"}</p>
        </div>
      </div>
    </div>
  );
}

export function ProfileChangeRequestsView({
  requests,
  statusDecisionOrder,
  onApprove,
  onRequestChanges,
  onReject,
}: ProfileChangeRequestsViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatuses, setSelectedStatuses] = useState<
    ProfileChangeRequestStatus[]
  >([]);
  const [selectedTypes, setSelectedTypes] = useState<ProfileChangeRequestType[]>(
    [],
  );
  const [currentTime] = useState(() => Date.now());
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 3;
  const [filterMenuOpen, setFilterMenuOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] =
    useState<ProfileChangeRequest | null>(null);
  const [previewFile, setPreviewFile] = useState<ProfileChangeRequest["evidenceFiles"][number] | null>(null);
  const [rejectNote, setRejectNote] = useState("");
  const [changeRequestNote, setChangeRequestNote] = useState("");
 const [isRejecting, setIsRejecting] = useState(false);
 const [isRequestingChanges, setIsRequestingChanges] = useState(false);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);
 const [asyncEvidenceUrl, setAsyncEvidenceUrl] = useState<string | null>(null);
  const [evidenceError, setEvidenceError] = useState(false);
  const filterMenuRef = useRef<HTMLDivElement>(null);

  const rawEvidenceUrl = previewFile?.url ?? null;
  const isDirectEvidenceUrl = Boolean(
    rawEvidenceUrl &&
      (rawEvidenceUrl.startsWith("http://") ||
        rawEvidenceUrl.startsWith("https://") ||
        rawEvidenceUrl.startsWith("blob:") ||
        rawEvidenceUrl.startsWith("data:")),
  );
  const evidenceUrl = asyncEvidenceUrl;
  const evidenceLoading = Boolean(
    previewFile && rawEvidenceUrl && !asyncEvidenceUrl && !evidenceError,
  );

  const canReview = (request: ProfileChangeRequest) =>
    request.status === "Pending Review" || request.status === "Changes Requested";

 const openRequest = (request: ProfileChangeRequest) => {
   setSelectedRequest(request);
   setIsRejecting(false);
   setIsRequestingChanges(false);
   setRejectNote("");
   setChangeRequestNote("");
    setReviewError(null);
 };

  const openEvidencePreview = (file: ProfileChangeRequest["evidenceFiles"][number]) => {
    setAsyncEvidenceUrl(null);
    setEvidenceError(false);
    setPreviewFile(file);
  };

  const approveSelectedRequest = async () => {
    if (!selectedRequest || !canReview(selectedRequest) || isSubmittingReview) return;
    setIsSubmittingReview(true);
    setReviewError(null);
    try {
      await onApprove(selectedRequest.id);
      setSelectedRequest(null);
    } catch (error) {
      setReviewError(error instanceof Error ? error.message : "Unable to approve this request.");
    } finally {
      setIsSubmittingReview(false);
    }
 };

  const requestChangesSelectedRequest = async () => {
    if (!selectedRequest || !canReview(selectedRequest) || !changeRequestNote.trim() || isSubmittingReview) return;
    setIsSubmittingReview(true);
    setReviewError(null);
    try {
      await onRequestChanges(selectedRequest.id, changeRequestNote.trim());
      setSelectedRequest(null);
      setChangeRequestNote("");
      setIsRequestingChanges(false);
    } catch (error) {
      setReviewError(error instanceof Error ? error.message : "Unable to request changes.");
    } finally {
      setIsSubmittingReview(false);
    }
 };

  const rejectSelectedRequest = async () => {
    if (!selectedRequest || !canReview(selectedRequest) || !rejectNote.trim() || isSubmittingReview) return;
    setIsSubmittingReview(true);
    setReviewError(null);
    try {
      await onReject(selectedRequest.id, rejectNote.trim());
      setSelectedRequest(null);
      setRejectNote("");
      setIsRejecting(false);
    } catch (error) {
      setReviewError(error instanceof Error ? error.message : "Unable to reject this request.");
    } finally {
      setIsSubmittingReview(false);
    }
 };

  useEffect(() => {
    if (!previewFile || !rawEvidenceUrl) return;

    let cancelled = false;
    let objectUrl: string | null = null;

    const resolveEvidenceUrl = async () => {
      try {
        if (isDirectEvidenceUrl) {
          if (rawEvidenceUrl.startsWith("blob:") || rawEvidenceUrl.startsWith("data:")) {
            if (!cancelled) setAsyncEvidenceUrl(rawEvidenceUrl);
            return;
          }

          const response = await fetch(rawEvidenceUrl);
          if (!response.ok) throw new Error(`Evidence request failed: ${response.status}`);
          const blob = await response.blob();
          const previewBlob =
            previewFile.format === "pdf"
              ? new Blob([blob], { type: "application/pdf" })
              : blob;
          objectUrl = URL.createObjectURL(previewBlob);
          if (!cancelled) setAsyncEvidenceUrl(objectUrl);
          return;
        }

        const supabase = createClient();
        const storage = supabase.storage.from("interpreter-certificates");
        const { data: blob } = await storage.download(rawEvidenceUrl);

        if (blob) {
          const previewBlob =
            previewFile.format === "pdf"
              ? new Blob([blob], { type: "application/pdf" })
              : blob;
          objectUrl = URL.createObjectURL(previewBlob);
          if (!cancelled) setAsyncEvidenceUrl(objectUrl);
          return;
        }

        const { data: signed } = await storage.createSignedUrl(rawEvidenceUrl, 3600);
        if (!cancelled && signed?.signedUrl) {
          setAsyncEvidenceUrl(signed.signedUrl);
        } else if (!cancelled) {
          setEvidenceError(true);
        }
      } catch {
        if (!cancelled && isDirectEvidenceUrl) {
          setAsyncEvidenceUrl(rawEvidenceUrl);
        } else if (!cancelled) {
          setEvidenceError(true);
        }
      }
    };

    void resolveEvidenceUrl();
    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [previewFile, rawEvidenceUrl, isDirectEvidenceUrl]);

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (!filterMenuRef.current?.contains(event.target as Node)) {
        setFilterMenuOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  const filteredRequests = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    const filtered = requests.filter((request) => {
      const searchableText = [
        request.id,
        request.interpreterId,
        request.interpreterName,
        request.requestType,
        request.reason,
        ...request.currentValues,
        ...request.requestedValues,
        ...(request.currentLanguages ?? []),
        ...(request.requestedLanguages ?? []),
        ...(request.currentCategories ?? []),
        ...(request.requestedCategories ?? []),
        ...request.evidenceFiles.map((file) => file.name),
      ]
        .join(" ")
        .toLowerCase();

      const matchesSearch = !query || searchableText.includes(query);
      const matchesStatus =
        selectedStatuses.length === 0 || selectedStatuses.includes(request.status);
      const matchesType =
        selectedTypes.length === 0 || selectedTypes.includes(request.requestType);

      return matchesSearch && matchesStatus && matchesType;
    });

    return filtered.sort((left, right) => {
      const leftDecision = statusDecisionOrder[left.id];
      const rightDecision = statusDecisionOrder[right.id];

      if (leftDecision !== undefined || rightDecision !== undefined) {
        if (leftDecision === undefined) return -1;
        if (rightDecision === undefined) return 1;
        return leftDecision - rightDecision;
      }

      return parseManagerTimestamp(right.submittedAt, currentTime) - parseManagerTimestamp(left.submittedAt, currentTime);
    });
  }, [requests, searchQuery, selectedStatuses, selectedTypes, statusDecisionOrder, currentTime]);

  const activeFilterCount = selectedStatuses.length + selectedTypes.length;

  const toggleStatus = (status: ProfileChangeRequestStatus) => {
    setSelectedStatuses((current) =>
      current.includes(status)
        ? current.filter((item) => item !== status)
        : [...current, status],
    );
    setCurrentPage(1);
  };

  const toggleType = (type: ProfileChangeRequestType) => {
    setSelectedTypes((current) =>
      current.includes(type)
        ? current.filter((item) => item !== type)
        : [...current, type],
    );
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedStatuses([]);
    setSelectedTypes([]);
    setCurrentPage(1);
  };

  const totalPages = Math.max(1, Math.ceil(filteredRequests.length / pageSize));
  const validCurrentPage = Math.min(currentPage, totalPages);
  const paginatedRequests = useMemo(() => {
    const startIndex = (validCurrentPage - 1) * pageSize;
    return filteredRequests.slice(startIndex, startIndex + pageSize);
  }, [filteredRequests, validCurrentPage]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative min-w-0 flex-1">
          <label htmlFor="profile-change-request-search" className="sr-only">
            Search profile change requests
          </label>
          <input
            id="profile-change-request-search"
            name="profile-change-request-search"
            type="search"
            value={searchQuery}
            onChange={(event) => {
              setSearchQuery(event.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search request ID, interpreter or evidence…"
            autoComplete="off"
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-10 text-xs text-slate-800 placeholder-slate-400 focus:border-[#087f80] focus:outline-none focus:ring-2 focus:ring-[#087f80]/20"
          />
          <DocumentMagnifyingGlassIcon
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setCurrentPage(1);
              }}
              aria-label="Clear search"
              title="Clear search"
              className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#087f80]/40"
            >
              <XMarkIcon aria-hidden="true" className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="relative shrink-0" ref={filterMenuRef}>
          <button
            type="button"
            onClick={() => setFilterMenuOpen((open) => !open)}
            aria-expanded={filterMenuOpen}
            aria-haspopup="dialog"
            className={`flex w-full items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-xs font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#087f80]/40 sm:w-auto ${
              activeFilterCount > 0
                ? "border-[#087f80] bg-[#edf7f5] text-[#087f80]"
                : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
            }`}
          >
            <AdjustmentsHorizontalIcon aria-hidden="true" className="h-4 w-4" />
            <span>Filter</span>
            {activeFilterCount > 0 && (
              <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-[#087f80] px-1 text-[9px] font-black text-white">
                {activeFilterCount}
              </span>
            )}
            <ChevronDownIcon
              aria-hidden="true"
              className={`h-3.5 w-3.5 transition-transform ${filterMenuOpen ? "rotate-180" : ""}`}
            />
          </button>

          {filterMenuOpen && (
            <div
              role="dialog"
              aria-label="Filter profile change requests"
              className="fixed inset-x-4 top-28 z-50 max-h-[80vh] overflow-y-auto rounded-2xl border border-[#d3dfe3] bg-white p-4 shadow-[0_16px_40px_rgba(9,47,69,0.18)] sm:absolute sm:inset-x-auto sm:right-0 sm:top-full sm:mt-2 sm:w-80"
            >
              <div className="flex items-center justify-between border-b border-[#edf2f5] pb-3">
                <span className="flex items-center gap-1.5 text-xs font-black text-[#112d3f]">
                  <AdjustmentsHorizontalIcon
                    aria-hidden="true"
                    className="h-4 w-4 text-[#087f80]"
                  />
                  Filter Requests
                </span>
                {activeFilterCount > 0 && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="rounded-md px-1.5 py-1 text-[11px] font-bold text-[#f04f3e] hover:bg-red-50 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f04f3e]/40"
                  >
                    Clear all ({activeFilterCount})
                  </button>
                )}
              </div>

              <div className="mt-4">
                <p className="mb-2 flex items-center gap-1.5 text-[11px] font-bold text-[#557180]">
                  <ClockIcon aria-hidden="true" className="h-3.5 w-3.5 text-[#087f80]" />
                  Status
                </p>
                <div className="grid grid-cols-1 gap-1.5">
                  {statusOptions.map((option) => {
                    const isSelected = selectedStatuses.includes(option.id);
                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => toggleStatus(option.id)}
                        aria-pressed={isSelected}
                        className={`flex items-center gap-2 rounded-lg border px-2.5 py-2 text-left text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#087f80]/40 ${
                          isSelected
                            ? "border-[#087f80] bg-[#edf7f5] text-[#087f80]"
                            : "border-[#e0eaee] bg-[#f9fbfb] text-[#244253] hover:bg-white"
                        }`}
                      >
                        <span
                          className={`flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded border ${
                            isSelected
                              ? "border-[#087f80] bg-[#087f80] text-white"
                              : "border-[#b8cbd2] bg-white"
                          }`}
                        >
                          {isSelected && <CheckIcon aria-hidden="true" className="h-2.5 w-2.5 stroke-[3]" />}
                        </span>
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-4 border-t border-[#edf2f5] pt-4">
                <p className="mb-2 flex items-center gap-1.5 text-[11px] font-bold text-[#557180]">
                  <DocumentCheckIcon aria-hidden="true" className="h-3.5 w-3.5 text-[#087f80]" />
                  Request type
                </p>
                <div className="grid grid-cols-3 gap-1.5">
                  {requestTypeOptions.map((option) => {
                    const isSelected = selectedTypes.includes(option.id);
                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => toggleType(option.id)}
                        aria-pressed={isSelected}
                        className={`rounded-lg border px-2.5 py-2 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#087f80]/40 ${
                          isSelected
                            ? "border-[#087f80] bg-[#edf7f5] text-[#087f80]"
                            : "border-[#e0eaee] bg-[#f9fbfb] text-[#244253] hover:bg-white"
                        }`}
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-[#edf2f5] pt-3 text-[11px] text-[#698492]">
                <span>
                  Showing <strong className="text-[#102938]">{filteredRequests.length}</strong> request(s)
                </span>
                <button
                  type="button"
                  onClick={() => setFilterMenuOpen(false)}
                  className="rounded-lg bg-[#087f80] px-4 py-1.5 text-xs font-bold text-white hover:bg-[#066a6a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#087f80]/40"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {filteredRequests.length === 0 ? (
        <section className="rounded-2xl border border-slate-200 bg-slate-50/70 p-8 text-center">
          <DocumentMagnifyingGlassIcon aria-hidden="true" className="mx-auto h-10 w-10 text-slate-300" />
          <h4 className="mt-3 text-sm font-extrabold text-[#092f45]">No matching requests</h4>
          <p className="mx-auto mt-1 max-w-md text-xs leading-5 text-slate-500">
            Change the search or clear the filters to view other profile requests.
          </p>
          {activeFilterCount > 0 || searchQuery ? (
            <button
              type="button"
              onClick={clearFilters}
              className="mt-4 rounded-lg border border-[#087f80] bg-white px-3 py-2 text-xs font-bold text-[#087f80] hover:bg-[#edf7f5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#087f80]/40"
            >
              Clear search and filters
            </button>
          ) : null}
        </section>
      ) : (
        <div className="border-y border-slate-200">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse text-left text-xs text-slate-600">
              <thead className="border-b border-slate-200 bg-slate-50/75 font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="w-[42%] py-3.5 pl-3 pr-4">Request</th>
                  <th className="w-[42%] px-3.5 py-3.5">Requested changes</th>
                  <th className="w-[16%] py-3.5 pr-4 pl-3.5 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedRequests.map((request) => {
            const statusStyle = statusStyles[request.status];
            const typeStyle = requestTypeStyles[request.requestType];
            const requestedSummary = getRequestSummary(request, true);
            const currentSummary = getRequestSummary(request, false);

                  return (
                    <tr
                key={request.id}
                role="button"
                tabIndex={0}
                aria-label={`Open profile change request ${request.id}`}
                onClick={() => openRequest(request)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    openRequest(request);
                  }
                }}
                      className="group cursor-pointer transition-colors hover:bg-teal-50/40 focus-visible:bg-teal-50/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#087f80]/40"
              >
                      <td className="w-[42%] py-3.5 pl-3 pr-4 align-top">
                        <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-sm font-extrabold text-[#092f45]">{request.id}</h4>
                      <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${typeStyle.className}`}>
                        {typeStyle.label}
                      </span>
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500">
                      <span className="font-semibold text-[#244253]">{request.interpreterName}</span>
                      <span className="text-slate-300">•</span>
                      <span>{request.interpreterId}</span>
                      <span className="text-slate-300">•</span>
                      <span>{formatSubmittedAt(request.submittedAt)}</span>
                    </div>
                    <p className="mt-1 line-clamp-1 text-xs text-slate-500" title={request.reason}>
                      {request.reason}
                    </p>
                        </div>
                      </td>

                      <td className="w-[42%] px-3.5 py-3.5 align-top">
                        <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Requested</p>
                    <p className="mt-1 truncate text-xs font-semibold text-[#244253]" title={requestedSummary}>
                      {requestedSummary}
                    </p>
                    <p className="mt-0.5 truncate text-[11px] text-slate-400" title={currentSummary}>
                      From {currentSummary}
                    </p>
                        </div>
                      </td>

                      <td className="w-[16%] py-3.5 pr-4 pl-3.5 text-center align-top">
                        <span className={`inline-flex w-fit items-center gap-1.5 rounded-full border px-2 py-1 text-[10px] font-bold ${statusStyle.className}`}>
                          <span aria-hidden="true" className={`h-1.5 w-1.5 rounded-full ${statusStyle.dotClassName}`} />
                          {request.status}
                        </span>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {filteredRequests.length > 0 && (
        <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-200 bg-slate-50/70 px-4 py-3 text-xs text-slate-500 sm:flex-row">
          <div>
            Showing <strong className="text-[#092f45]">{(validCurrentPage - 1) * pageSize + 1}</strong> to{" "}
            <strong className="text-[#092f45]">{Math.min(validCurrentPage * pageSize, filteredRequests.length)}</strong> of{" "}
            <strong className="text-[#092f45]">{filteredRequests.length}</strong> request(s)
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={validCurrentPage <= 1}
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-[#092f45] shadow-2xs transition-all hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              title="Previous page"
            >
              <ChevronLeftIcon aria-hidden="true" className="h-3.5 w-3.5" />
              <span>Previous</span>
            </button>

            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
                <button
                  key={pageNumber}
                  type="button"
                  onClick={() => setCurrentPage(pageNumber)}
                  aria-current={validCurrentPage === pageNumber ? "page" : undefined}
                  className={`flex h-8 w-8 items-center justify-center rounded-xl text-xs font-bold transition-all ${
                    validCurrentPage === pageNumber
                      ? "bg-[#087f80] text-white shadow-xs"
                      : "border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  {pageNumber}
                </button>
              ))}
            </div>

            <button
              type="button"
              disabled={validCurrentPage >= totalPages}
              onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
              className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-[#092f45] shadow-2xs transition-all hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              title="Next page"
            >
              <span>Next</span>
              <ChevronRightIcon aria-hidden="true" className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {selectedRequest && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-3 sm:p-5 backdrop-blur-xs animate-in fade-in"
          role="dialog"
          aria-modal="true"
          aria-labelledby="profile-change-request-dialog-title"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSelectedRequest(null);
          }}
        >
          <div className="relative flex h-[92vh] max-h-[850px] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl animate-in zoom-in-95">
            <div className="flex shrink-0 items-start justify-between border-b border-slate-100 px-5 py-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-sky-700">Profile change request</p>
                <h3 id="profile-change-request-dialog-title" className="mt-1 text-lg font-extrabold text-[#092f45]">
                  {selectedRequest.id}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedRequest(null)}
                aria-label="Close request details"
                title="Close request details"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#087f80]/40"
              >
                <XMarkIcon aria-hidden="true" className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <span className="font-bold text-[#244253]">{selectedRequest.interpreterName}</span>
                <span>({selectedRequest.interpreterId})</span>
                <span className={`rounded-full border px-2 py-0.5 font-bold ${statusStyles[selectedRequest.status].className}`}>
                  {selectedRequest.status}
                </span>
              </div>

              {selectedRequest.requestType === "both" ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  <ChangeComparison
                    label="Service languages"
                    currentValues={getCombinedValues(selectedRequest, false, "language")}
                    requestedValues={getCombinedValues(selectedRequest, true, "language")}
                  />
                  <ChangeComparison
                    label="Matching categories"
                    currentValues={getCombinedValues(selectedRequest, false, "category")}
                    requestedValues={getCombinedValues(selectedRequest, true, "category")}
                  />
                </div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl bg-slate-50 p-3">
                    <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Current values</p>
                    <p className="mt-1 text-sm font-semibold text-[#244253]">{selectedRequest.currentValues.join(", ")}</p>
                  </div>
                  <div className="rounded-xl bg-sky-50 p-3">
                    <p className="text-[10px] font-bold uppercase tracking-wide text-sky-700">Requested values</p>
                    <p className="mt-1 text-sm font-semibold text-sky-900">{selectedRequest.requestedValues.join(", ")}</p>
                  </div>
                </div>
              )}

              <div>
                <p className="text-xs font-bold text-[#244253]">Reason for change</p>
                <p className="mt-1 text-sm leading-6 text-slate-600 break-words">{selectedRequest.reason}</p>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    <IdentificationIcon aria-hidden="true" className="h-4 w-4 text-[#087f80]" />
                    Submitted Credential Files
                  </p>
                  <span className="text-[10px] font-medium text-slate-400">PDF, PNG, JPG</span>
                </div>
                <div className="mt-2 space-y-2">
                  {selectedRequest.evidenceFiles.map((file) => (
                    <div
                      key={file.name}
                      className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3 shadow-2xs transition-colors hover:border-[#087f80]"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xs font-black ${
                            file.format === "pdf"
                              ? "border border-red-200 bg-red-50 text-red-600"
                              : "border border-blue-200 bg-blue-50 text-blue-600"
                          }`}
                        >
                          {getEvidenceFormatLabel(file)}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-xs font-bold text-[#092f45]" title={file.name}>
                            {file.name}
                          </p>
                          <p className="mt-0.5 text-[11px] text-slate-400">
                            {file.size} · {file.format === "pdf" ? "PDF" : "Image"} Credential
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => openEvidencePreview(file)}
                        className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-[#087f80] transition-colors hover:border-[#087f80] hover:bg-[#087f80] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#087f80]/40"
                      >
                        Preview File
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {selectedRequest.reviewNote && (
                <div className="rounded-xl border border-orange-100 bg-orange-50/60 p-3">
                  <p className="text-xs font-bold text-orange-800">Manager note</p>
                  <p className="mt-1 text-sm leading-6 text-orange-900">{selectedRequest.reviewNote}</p>
                </div>
              )}
            </div>

            <div className="shrink-0 border-t border-slate-100 px-5 py-4">
              {isRejecting && canReview(selectedRequest) && (
                <div className="mb-4">
                  <label htmlFor="profile-change-reject-note" className="text-xs font-bold text-[#244253]">
                    Rejection reason
                  </label>
                  <textarea
                    id="profile-change-reject-note"
                    value={rejectNote}
                    onChange={(event) => setRejectNote(event.target.value)}
                    rows={3}
                    placeholder="Explain what evidence or information is missing."
                    className="mt-2 w-full resize-y rounded-xl border border-red-200 px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-red-400 focus:ring-2 focus:ring-red-500/20"
                  />
                </div>
              )}

              {isRequestingChanges && canReview(selectedRequest) && (
                <div className="mb-4">
                  <label htmlFor="profile-change-request-note" className="text-xs font-bold text-[#244253]">
                    Changes requested note
                  </label>
                  <textarea
                    id="profile-change-request-note"
                    value={changeRequestNote}
                    onChange={(event) => setChangeRequestNote(event.target.value)}
                    rows={3}
                    placeholder="Explain what evidence or information the interpreter needs to update."
                    className="mt-2 w-full resize-y rounded-xl border border-amber-200 px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-500/20"
                  />
                </div>
              )}

              {reviewError && (
                <p role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-800">
                  {reviewError}
                </p>
              )}

              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
                <button
                  type="button"
                  onClick={() => setSelectedRequest(null)}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#087f80]/40"
                >
                  Close review
                </button>

                {canReview(selectedRequest) && (
                  <div className="flex flex-col gap-2 sm:flex-row">
                    {!isRejecting && !isRequestingChanges ? (
                      <>
                        <button
                          type="button"
                          onClick={() => setIsRejecting(true)}
                          className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-xs font-bold text-red-800 hover:bg-red-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/40"
                        >
                          Reject request
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setIsRequestingChanges(true);
                            setIsRejecting(false);
                            setRejectNote("");
                          }}
                          className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-xs font-bold text-amber-800 hover:bg-amber-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/40"
                        >
                          Request changes
                        </button>
                        <button
                          type="button"
                          onClick={approveSelectedRequest}
                          disabled={isSubmittingReview}
                          className="rounded-lg bg-emerald-700 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40"
                        >
                          Approve changes
                        </button>
                      </>
                    ) : isRejecting ? (
                      <button
                        type="button"
                        onClick={rejectSelectedRequest}
                        disabled={!rejectNote.trim() || isSubmittingReview}
                        className="rounded-lg bg-red-700 px-4 py-2 text-xs font-bold text-white hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/40"
                      >
                        Confirm rejection
                      </button>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            setIsRequestingChanges(false);
                            setChangeRequestNote("");
                          }}
                          className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#087f80]/40"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={requestChangesSelectedRequest}
                          disabled={!changeRequestNote.trim() || isSubmittingReview}
                          className="rounded-lg bg-amber-600 px-4 py-2 text-xs font-bold text-white hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/40"
                        >
                          Send request
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {previewFile && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="relative flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-slate-700/50 bg-[#092f45] text-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#16435c] bg-[#072435] px-5 py-3.5">
              <div className="flex min-w-0 items-center gap-2.5">
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-black ${
                    previewFile.format === "pdf"
                      ? "border border-red-500/40 bg-red-500/20 text-red-300"
                      : "border border-blue-500/40 bg-blue-500/20 text-blue-300"
                  }`}
                >
                  {getEvidenceFormatLabel(previewFile)}
                </span>
                <div className="min-w-0">
                  <h4 className="truncate text-sm font-bold text-white">{previewFile.name}</h4>
                  <p className="text-[11px] text-slate-400">Uploaded with {selectedRequest?.id ?? "profile change request"}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPreviewFile(null)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
                title="Close preview"
                aria-label="Close preview"
              >
                <XMarkIcon aria-hidden="true" className="h-5 w-5" />
              </button>
            </div>

            <div className="flex min-h-[380px] max-h-[75vh] flex-1 flex-col items-center justify-center overflow-y-auto bg-[#0c364e]/50 p-4 sm:p-6">
              {evidenceLoading ? (
                <div className="flex flex-col items-center justify-center gap-3 py-16 text-slate-300">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#087f80] border-t-transparent" />
                  <span className="text-xs font-bold">Loading document...</span>
                </div>
              ) : previewFile.format !== "pdf" && evidenceUrl && !evidenceError ? (
                <div className="flex w-full flex-col items-center justify-center">
                  <div className="relative flex max-h-[62vh] max-w-full items-center justify-center overflow-hidden rounded-xl border border-[#1d4d6b] bg-black/40 p-2 shadow-inner">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={evidenceUrl}
                      alt={previewFile.name}
                      className="max-h-[58vh] max-w-full rounded-lg object-contain shadow-md"
                      onError={() => setEvidenceError(true)}
                    />
                  </div>
                  <div className="mt-3 flex items-center gap-2 rounded-lg border border-white/10 bg-black/30 px-3 py-1.5 text-xs text-slate-300">
                    <span className="h-2 w-2 rounded-full bg-emerald-400" />
                    <span className="font-mono">{previewFile.name}</span>
                    <span>·</span>
                    <span>Image/{getEvidenceFormatLabel(previewFile)} (Verified)</span>
                  </div>
                </div>
              ) : previewFile.format === "pdf" && evidenceUrl && !evidenceError ? (
                <div className="h-[62vh] w-full overflow-hidden rounded-xl border border-[#1d4d6b] bg-white">
                  <iframe src={evidenceUrl} title={previewFile.name} className="h-full w-full" />
                </div>
              ) : (
                <div className="flex w-full max-w-lg flex-col items-center justify-center rounded-2xl border border-[#1d4d6b] bg-[#092f45] p-8 text-center shadow-inner">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-blue-500/30 bg-blue-500/10 text-blue-400">
                    {previewFile.format === "pdf" ? (
                      <DocumentTextIcon aria-hidden="true" className="h-8 w-8 text-red-400" />
                    ) : (
                      <PhotoIcon aria-hidden="true" className="h-8 w-8" />
                    )}
                  </div>
                  <h5 className="text-base font-extrabold text-white">{previewFile.name}</h5>
                  <p className="mt-2 max-w-sm text-xs leading-relaxed text-slate-300">
                    {evidenceError
                      ? "This document could not be loaded in the preview. Download the file to inspect it directly."
                      : "A preview URL is not available for this attachment."}
                  </p>
                  <div className="mt-4 flex items-center gap-2 rounded-lg border border-white/10 bg-black/30 px-3 py-1.5 text-xs text-slate-300">
                    <span className={`h-2 w-2 rounded-full ${evidenceError ? "bg-amber-400" : "bg-emerald-400"}`} />
                    <span>Format: {getEvidenceFormatLabel(previewFile)}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between border-t border-[#16435c] bg-[#072435] px-5 py-3">
              <span className="font-mono text-xs text-slate-400">Credential evidence</span>
              <div className="flex items-center gap-2">
                {evidenceUrl ? (
                  <a
                    href={evidenceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    download={previewFile.name}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-[#215777] bg-[#0d3b55] px-3.5 py-1.5 text-xs font-bold text-slate-200 transition-colors hover:bg-[#124a6b] hover:text-white"
                  >
                    <ArrowDownTrayIcon aria-hidden="true" className="h-3.5 w-3.5" />
                    Download File
                  </a>
                ) : (
                  <button
                    type="button"
                    disabled
                    className="inline-flex cursor-not-allowed items-center gap-1.5 rounded-lg border border-[#215777] bg-[#0d3b55] px-3.5 py-1.5 text-xs font-bold text-slate-500 opacity-70"
                  >
                    <ArrowDownTrayIcon aria-hidden="true" className="h-3.5 w-3.5" />
                    Download File
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setPreviewFile(null)}
                  className="rounded-lg bg-[#087f80] px-4 py-1.5 text-xs font-bold text-white transition-colors hover:bg-[#0aa1a2]"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
