"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ShieldCheckIcon, ArrowLeftIcon, ClockIcon } from "@heroicons/react/24/outline";

import {
  InterpreterApplicant,
  IncidentReport,
  IncidentSeverity,
  ManagerNavSection,
  ManagerActivity,
  ProfileChangeRequest,
} from "./types";

import { ManagerHeader } from "./components/manager-header";
import { ManagerDrawer } from "./components/manager-drawer";
import { ManagerRailBar } from "./components/manager-rail-bar";
import { ManagerKpiCards } from "./components/manager-kpi-cards";
import { ApplicantsTable } from "./components/applicants-table";
import { IncidentReportsView } from "./components/incident-reports-view";
import { OperationsHistoryView } from "./components/operations-history-view";
import { ProfileChangeRequestsView } from "./components/profile-change-requests-view";
import { ApplicantDetailModal } from "./components/applicant-detail-modal";
import { LoginModal } from "@/app/components/auth/login-modal";
import { WorkspaceLoadingSkeleton } from "@/app/components/workspace-loading-skeleton";

import {
  getRedirectPathByRole,
  type UserProfile,
} from "@/app/lib/auth-types";
import { getCurrentUserProfile } from "@/app/lib/supabase-auth";
import { createClient } from "@/utils/supabase/client";
import { useStoredLocale } from "@/app/lib/locale";
import { getManagerTranslation } from "./locales";
import { parseManagerTimestamp } from "./utils";
import {
  getManagerApplicationsAction,
  getManagerAuditLogsAction,
  getManagerProfileChangeRequestsAction,
  getManagerReportsAction,
  reviewApplicationAction,
  reviewProfileChangeRequestAction,
  updateManagerReportAction,
} from "./actions/manager-actions";

type ManagerDashboardProps = {
  embedded?: boolean;
  embeddedUser?: UserProfile | null;
  embeddedNavSection?: ManagerNavSection;
  onEmbeddedNavSectionChange?: (section: ManagerNavSection) => void;
  onEmbeddedCountsChange?: (counts: {
    pendingApplicantCount: number;
    approvedApplicantCount: number;
    pendingProfileChangeCount: number;
    rejectedApplicantCount: number;
    pendingManagerReportCount: number;
    managerActivitiesCount: number;
  }) => void;
};

export default function ManagerDashboard({
  embedded = false,
  embeddedUser = null,
  embeddedNavSection,
  onEmbeddedNavSectionChange,
  onEmbeddedCountsChange,
}: ManagerDashboardProps = {}) {
  const router = useRouter();
  const [locale] = useStoredLocale();
  const t = getManagerTranslation(locale);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [authChecked, setAuthChecked] = useState(Boolean(embedded && embeddedUser));
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(embeddedUser);

  const [applicants, setApplicants] = useState<InterpreterApplicant[]>([]);
  const [applicantsLoadError, setApplicantsLoadError] = useState<string | null>(null);
  const [reports, setReports] = useState<IncidentReport[]>([]);
  const [reportsLoadError, setReportsLoadError] = useState<string | null>(null);
  const [profileChangeRequests, setProfileChangeRequests] = useState<ProfileChangeRequest[]>([]);
  const [profileChangeRequestsLoadError, setProfileChangeRequestsLoadError] = useState<string | null>(null);
  const [loadingApplicants, setLoadingApplicants] = useState(false);
  const [activities, setActivities] = useState<ManagerActivity[]>([]);
  const [activitiesLoadError, setActivitiesLoadError] = useState<string | null>(null);
  const [loadingActivities, setLoadingActivities] = useState(false);

  const loadApplications = async () => {
    setLoadingApplicants(true);
    try {
      const res = await getManagerApplicationsAction();
      if (res.success && res.data) {
        setApplicants(res.data);
        setApplicantsLoadError(null);
      } else {
        setApplicants([]);
        setApplicantsLoadError(res.error || "Unable to load interpreter applications from Supabase.");
      }
    } catch (err) {
      console.error("Failed to load applicants from Supabase:", err);
      setApplicants([]);
      setApplicantsLoadError("Unable to load interpreter applications from Supabase.");
    } finally {
      setLoadingApplicants(false);
    }
  };

  const loadReports = async () => {
    try {
      const res = await getManagerReportsAction();
      if (res.success && res.data) {
        setReports(res.data);
        setReportsLoadError(null);
      } else {
        setReports([]);
        setReportsLoadError(res.error || "Unable to load reports from Supabase.");
      }
    } catch (err) {
      console.error("Failed to load reports from Supabase:", err);
      setReports([]);
      setReportsLoadError("Unable to load reports from Supabase.");
    }
  };

  const loadProfileChangeRequests = async () => {
    try {
      const res = await getManagerProfileChangeRequestsAction();
      if (res.success && res.data) {
        setProfileChangeRequests(res.data);
        setProfileChangeRequestsLoadError(null);
      } else {
        setProfileChangeRequests([]);
        setProfileChangeRequestsLoadError(
          res.error || "Unable to load profile change requests from Supabase.",
        );
      }
    } catch (err) {
      console.error("Failed to load profile change requests from Supabase:", err);
      setProfileChangeRequests([]);
      setProfileChangeRequestsLoadError("Unable to load profile change requests from Supabase.");
    }
  };

  const loadActivities = async () => {
    setLoadingActivities(true);
    try {
      const res = await getManagerAuditLogsAction();
      if (res.success && res.data) {
        setActivities(res.data);
        setActivitiesLoadError(null);
      } else {
        setActivities([]);
        setActivitiesLoadError(res.error || "Unable to load operations history from Supabase.");
      }
    } catch (err) {
      console.error("Failed to load operations history from Supabase:", err);
      setActivities([]);
      setActivitiesLoadError("Unable to load operations history from Supabase.");
    } finally {
      setLoadingActivities(false);
    }
  };

  useEffect(() => {
    const supabase = createClient();
    let disposed = false;

    const checkManagerSession = async () => {
      const result = await getCurrentUserProfile(supabase);
      if (disposed) return;

      if (!result.profile) {
        router.replace("/#top");
        return;
      }

      if (result.profile.role !== "Manager" && result.profile.role !== "Admin") {
        router.replace(getRedirectPathByRole(result.profile.role));
        return;
      }

      setCurrentUser(result.profile);
      setAuthChecked(true);
      void loadApplications();
      void loadReports();
      void loadProfileChangeRequests();
      void loadActivities();
    };

    void checkManagerSession();
    const { data: authListener } = supabase.auth.onAuthStateChange(() => {
      window.setTimeout(() => void checkManagerSession(), 0);
    });

    return () => {
      disposed = true;
      authListener.subscription.unsubscribe();
    };
  }, [router]);

  const handleSignOut = () => {
    void createClient().auth.signOut();
    setCurrentUser(null);
    router.push("/");
  };

  const handleLoginSuccess = (user: UserProfile) => {
    setCurrentUser(user);
    setIsLoginModalOpen(false);
    if (user.role !== "Manager") {
      router.push(getRedirectPathByRole(user.role));
    }
  };

  const [currentTime] = useState(() => Date.now());
  const decisionSequence = useRef(0);
  const [statusDecisionOrder, setStatusDecisionOrder] = useState<Record<string, number>>({});
  const [selectedApplicantId, setSelectedApplicantId] = useState<string | null>(null);

  // Navigation & View State
  const [navSection, setNavSection] = useState<ManagerNavSection>("queue");
  const visibleNavSection = embeddedNavSection ?? navSection;
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  // Search & Multi-Select Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [filterMenuOpen, setFilterMenuOpen] = useState(false);

  const toggleLanguage = (lang: string) => {
    setSelectedLanguages((prev) =>
      prev.includes(lang) ? prev.filter((l) => l !== lang) : [...prev, lang]
    );
  };

  const toggleCategory = (cat: string) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  // Filtered applicants based on current navSection + search query + languages + categories
  const displayedApplicants = useMemo(() => {
    const filtered = applicants.filter((app) => {
      // 1. Filter by navigation section
      if (visibleNavSection === "queue" && app.status !== "Pending" && app.status !== "Under Review") {
        return false;
      }
      if (visibleNavSection === "approved" && app.status !== "Approved") {
        return false;
      }
      if (visibleNavSection === "rejected" && app.status !== "Rejected") {
        return false;
      }

      // 2. Search query match
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !query ||
        app.name.toLowerCase().includes(query) ||
        app.id.toLowerCase().includes(query) ||
        app.country.toLowerCase().includes(query) ||
        app.contactChannels.toLowerCase().includes(query) ||
        app.primaryLanguage.toLowerCase().includes(query) ||
        app.spokenLanguages.some((lang) => lang.toLowerCase().includes(query)) ||
        app.specialtyCategories.some((cat) => cat.toLowerCase().includes(query));

      // 3. Multi-select Language filter (Strict AND narrowing)
      const matchesLanguage =
        selectedLanguages.length === 0 ||
        selectedLanguages.every((selectedLang) => {
          const target = selectedLang.trim().toLowerCase();
          const primary = app.primaryLanguage.trim().toLowerCase();
          const spoken = app.spokenLanguages.map((l) => l.trim().toLowerCase());
          return primary.includes(target) || spoken.some((l) => l.includes(target));
        });

      // 4. Multi-select Category filter (Strict AND narrowing)
      const matchesCategory =
        selectedCategories.length === 0 ||
        selectedCategories.every((selectedCat) =>
          app.specialtyCategories.some(
            (cat) => cat.trim().toLowerCase() === selectedCat.trim().toLowerCase()
          )
        );

      return matchesSearch && matchesLanguage && matchesCategory;
    });

    return filtered.sort((left, right) => {
      const isDecisionList = visibleNavSection === "approved" || visibleNavSection === "rejected";
      if (isDecisionList) {
        const leftDecision = statusDecisionOrder[left.id];
        const rightDecision = statusDecisionOrder[right.id];

        if (leftDecision !== undefined || rightDecision !== undefined) {
          if (leftDecision === undefined) return -1;
          if (rightDecision === undefined) return 1;
          return leftDecision - rightDecision;
        }
      }

      return parseManagerTimestamp(right.appliedDate, currentTime) - parseManagerTimestamp(left.appliedDate, currentTime);
    });
  }, [applicants, visibleNavSection, searchQuery, selectedLanguages, selectedCategories, statusDecisionOrder, currentTime]);

  // Selected applicant for the centered pop-up modal
  const selectedApplicant = useMemo(() => {
    return applicants.find((a) => a.id === selectedApplicantId) || null;
  }, [applicants, selectedApplicantId]);

  const handleOpenDetailModal = (applicant: InterpreterApplicant) => {
    setSelectedApplicantId(applicant.id);
    setDetailModalOpen(true);
  };

  const markStatusDecision = (id: string) => {
    decisionSequence.current += 1;
    setStatusDecisionOrder((current) => ({
      ...current,
      [id]: decisionSequence.current,
    }));
  };

  // Handle Approve (FR-43)
  const handleApprove = async (id: string) => {
    markStatusDecision(id);
    const reviewedAt = new Date().toISOString();
    // Optimistic UI update
    setApplicants((prev) =>
      prev.map((app) =>
        app.id === id
          ? { ...app, status: "Approved", backgroundCheck: "Passed", reviewedAt }
          : app,
      ),
    );

    try {
      const res = await reviewApplicationAction(id, "approved");
      if (!res.success) {
        console.error("Failed to approve in Supabase:", res.error);
      } else {
        void loadActivities();
      }
    } catch (err) {
      console.error("Failed to persist approval:", err);
    }

  };

  // Handle Reject (FR-44, FR-45)
  const handleReject = async (id: string, reason: string) => {
    markStatusDecision(id);
    const reviewedAt = new Date().toISOString();
    // Optimistic UI update
    setApplicants((prev) =>
      prev.map((app) =>
        app.id === id ? { ...app, status: "Rejected", rejectionReason: reason, reviewedAt } : app,
      ),
    );

    try {
      const res = await reviewApplicationAction(id, "rejected", reason);
      if (!res.success) {
        console.error("Failed to reject in Supabase:", res.error);
      } else {
        void loadActivities();
      }
    } catch (err) {
      console.error("Failed to persist rejection:", err);
    }

  };

  const handleApproveProfileChange = async (requestId: string): Promise<void> => {
    const result = await reviewProfileChangeRequestAction(requestId, "approved");
    if (!result.success) throw new Error(result.error || "Failed to approve profile change request.");
    const reviewerRole = currentUser?.role || "Manager";

    markStatusDecision(requestId);
    setProfileChangeRequests((current) =>
      current.map((request) =>
          request.id === requestId
          ? { ...request, status: "Approved", reviewNote: `Approved by ${reviewerRole}.`, reviewedAt: new Date().toISOString() }
          : request,
      ),
    );

    void loadApplications();
    void loadActivities();
  };

  const handleRequestProfileChange = async (requestId: string, note: string): Promise<void> => {
    const result = await reviewProfileChangeRequestAction(requestId, "changes_requested", note);
    if (!result.success) throw new Error(result.error || "Failed to request profile changes.");

    markStatusDecision(requestId);
    setProfileChangeRequests((current) =>
      current.map((request) =>
        request.id === requestId
          ? { ...request, status: "Changes Requested", reviewNote: note, reviewedAt: new Date().toISOString() }
          : request,
      ),
    );

    void loadActivities();

  };

  const handleRejectProfileChange = async (requestId: string, note: string): Promise<void> => {
    const result = await reviewProfileChangeRequestAction(requestId, "rejected", note);
    if (!result.success) throw new Error(result.error || "Failed to reject profile change request.");

    markStatusDecision(requestId);
    setProfileChangeRequests((current) =>
      current.map((request) =>
        request.id === requestId
          ? { ...request, status: "Rejected", reviewNote: note, reviewedAt: new Date().toISOString() }
          : request,
      ),
    );

    void loadActivities();

  };

  // Handle Incident Report Escalation to Admin (FR-53 -> FR-76)
  const handleEscalateReport = async (
    reportId: string,
    severity: IncidentSeverity,
    assessmentNote: string
  ) => {
    const target = reports.find((r) => r.id === reportId);
    if (!target || target.status !== "Pending Investigation") return;

    const actorRole = currentUser?.role || "Manager";
    const actionNote =
      assessmentNote.trim() ||
      `Escalated by ${actorRole} (${severity.toUpperCase()}) to Admin Portal for user account lock evaluation (FR-78).`;

    setReports((prev) =>
      prev.map((r) =>
        r.id === reportId
          ? {
              ...r,
              severity,
              status: "Escalated to Admin",
              actionTaken: actionNote,
              updatedAt: new Date().toISOString(),
            }
          : r
      )
    );
    const persisted = await updateManagerReportAction(reportId, {
      mode: "escalate",
      severity,
      note: actionNote,
    });
    if (!persisted.success && /^REP-\d+$/i.test(reportId)) {
      console.error("Failed to persist report escalation:", persisted.error);
    }
    if (persisted.success) void loadActivities();

  };

  // Handle self-resolution of a system report by Manager
  const handleResolveReport = async (reportId: string, resolutionNote: string) => {
    const target = reports.find((r) => r.id === reportId);
    const actorRole = currentUser?.role || "Manager";
    const actionNote = `Resolved by ${actorRole}: ${resolutionNote}`;

    setReports((prev) =>
      prev.map((r) =>
        r.id === reportId
          ? {
              ...r,
              status: "Resolved",
              actionTaken: actionNote,
              updatedAt: new Date().toISOString(),
            }
          : r
      )
    );

    if (target) {
      const persisted = await updateManagerReportAction(reportId, {
        mode: "resolve",
        note: actionNote,
      });
      if (!persisted.success && /^REP-\d+$/i.test(reportId)) {
        console.error("Failed to persist report resolution:", persisted.error);
      }
      if (persisted.success) void loadActivities();

    }
  };

  // Counts for Badges & Cards
  const pendingCount = applicants.filter((a) => a.status === "Pending" || a.status === "Under Review").length;
  const approvedCount = applicants.filter((a) => a.status === "Approved").length;
  const rejectedCount = applicants.filter((a) => a.status === "Rejected").length;
  const pendingProfileChangeCount = profileChangeRequests.filter(
    (request) => request.status === "Pending Review",
  ).length;
  const pendingReportCount = reports.filter((r) => r.status === "Pending Investigation").length;

  useEffect(() => {
    if (!embedded || !onEmbeddedCountsChange) return;

    onEmbeddedCountsChange({
      pendingApplicantCount: pendingCount,
      approvedApplicantCount: approvedCount,
      pendingProfileChangeCount,
      rejectedApplicantCount: rejectedCount,
      pendingManagerReportCount: pendingReportCount,
      managerActivitiesCount: activities.length,
    });
  }, [
    activities.length,
    approvedCount,
    embedded,
    onEmbeddedCountsChange,
    pendingCount,
    pendingProfileChangeCount,
    pendingReportCount,
    rejectedCount,
  ]);

  if (!authChecked) {
    return <WorkspaceLoadingSkeleton variant="table" />;
  }

  const setManagerNavSection = (section: ManagerNavSection) => {
    setNavSection(section);
    onEmbeddedNavSectionChange?.(section);
  };

  return (
    <div
      className={`${
        embedded
          ? "flex min-h-full w-full flex-col bg-[#f7f9fa]"
          : "flex h-screen w-full flex-row overflow-hidden"
      } text-[#092f45] antialiased`}
    >
      {/* Universal Slide-out Pop-up Sidebar Drawer */}
      {!embedded && (
        <ManagerDrawer
          isOpen={isMobileDrawerOpen}
          onClose={() => setIsMobileDrawerOpen(false)}
          navSection={navSection}
          setNavSection={setManagerNavSection}
          pendingCount={pendingCount}
          approvedCount={approvedCount}
          pendingProfileChangeCount={pendingProfileChangeCount}
          rejectedCount={rejectedCount}
          pendingReportCount={pendingReportCount}
          activitiesCount={activities.length}
          t={t.navigation}
          header={t.header}
        />
      )}

      {/* Compact Left Rail Bar (Single Source of Navigation - Rail Bar Only) */}
      {!embedded && (
        <ManagerRailBar
          onMenuClick={() => setIsMobileDrawerOpen((prev) => !prev)}
          navSection={navSection}
          setNavSection={setManagerNavSection}
          pendingCount={pendingCount}
          approvedCount={approvedCount}
          pendingProfileChangeCount={pendingProfileChangeCount}
          rejectedCount={rejectedCount}
          pendingReportCount={pendingReportCount}
          t={t.navigation}
        />
      )}

      {/* Right Column: Top Header + Main Content Workspace */}
      <div className={`${embedded ? "flex min-h-full flex-col" : "flex h-full flex-1 flex-col overflow-hidden"} min-w-0`}>
        {!embedded && (
          <ManagerHeader
            onMenuClick={() => setIsMobileDrawerOpen((prev) => !prev)}
            currentUser={currentUser}
            onSignOut={handleSignOut}
          />
        )}

        {/* Administrator Supervisory Override Banner */}
        {currentUser?.role === "Admin" && (
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-300 bg-amber-50 px-4 py-2 text-xs font-semibold text-amber-900 shadow-xs">
            <div className="flex items-center gap-2">
              <ShieldCheckIcon className="h-4 w-4 text-amber-700 shrink-0" />
              <span>
                <strong>{embedded ? "Manager View:" : "Administrator Mode:"}</strong>{" "}
                {embedded
                  ? "Operations are available inside the Admin Console."
                  : "You have full supervisory override authority across all operational queues."}
              </span>
            </div>
            {!embedded && (
              <Link
                href="/admin"
                className="inline-flex items-center gap-1.5 rounded-lg border border-amber-300 bg-white px-3 py-1 text-[11px] font-bold text-amber-800 shadow-2xs hover:bg-amber-100/50 transition-colors"
              >
                <ArrowLeftIcon className="h-3 w-3" />
                <span>Return to Admin Console</span>
              </Link>
            )}
          </div>
        )}

        {/* Content Workspace - Pure Clean White Canvas */}
        <div
          className={`${
            embedded ? "overflow-visible" : "overflow-y-auto"
          } flex-1 min-w-0 flex flex-col bg-white`}
        >
          <main
            className={`${
              embedded ? "p-0" : "p-4 sm:p-6 md:p-8"
            } flex-1 space-y-5 sm:space-y-6`}
            aria-busy={loadingApplicants}
          >
            {/* Top Page Heading with Hairline Divider (Admin Standard) */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-200">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-[#092f45]">
                  {embedded && visibleNavSection === "queue"
                    ? "Operations Console"
                    : t.headings[visibleNavSection]?.title ??
                      (visibleNavSection === "change-requests" ? t.navigation.changeRequests : "Manager Dashboard")}
                </h2>
                <p className="mt-0.5 text-xs text-slate-500">
                  {embedded && visibleNavSection === "queue"
                    ? "Manager operations inside the Admin Console."
                    : t.headings[visibleNavSection]?.subtitle ??
                    (visibleNavSection === "change-requests"
                      ? t.navigation.changeRequests
                      : "")}
                </p>
              </div>
              {visibleNavSection === "reports" && (
                <span className="self-start sm:self-auto rounded-full bg-amber-50 border border-amber-200 px-2.5 py-0.5 text-xs font-bold text-amber-800">
                  Pending: {pendingReportCount}
                </span>
              )}
              {visibleNavSection === "history" && (
                <span className="self-start sm:self-auto inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-700 border border-slate-200">
                  <ClockIcon className="h-3.5 w-3.5 text-[#087f80]" />
                  Total: {activities.length}
                </span>
              )}
            </div>

            {/* Interactive Segmented KPI Overview Cards */}
            <ManagerKpiCards
              navSection={visibleNavSection}
              setNavSection={setManagerNavSection}
              pendingCount={pendingCount}
              approvedCount={approvedCount}
              pendingProfileChangeCount={pendingProfileChangeCount}
              rejectedCount={rejectedCount}
              pendingReportCount={pendingReportCount}
              t={t.kpi}
            />

            {visibleNavSection === "reports" && reportsLoadError && (
              <div
                role="alert"
                className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-800"
              >
                <p className="font-bold">Reports could not be loaded from Supabase.</p>
                <p className="mt-1 break-words">{reportsLoadError}</p>
              </div>
            )}

            {(visibleNavSection === "queue" || visibleNavSection === "approved" || visibleNavSection === "rejected") && applicantsLoadError && (
              <div
                role="alert"
                className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-800"
              >
                <p className="font-bold">Interpreter applications could not be loaded from Supabase.</p>
                <p className="mt-1 break-words">{applicantsLoadError}</p>
              </div>
            )}

            {/* VIEW 1: Volunteer Applicants Table (Queue, Approved, Rejected) */}
            {(visibleNavSection === "queue" || visibleNavSection === "approved" || visibleNavSection === "rejected") && (
              <ApplicantsTable
                applicants={displayedApplicants}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                selectedLanguages={selectedLanguages}
                toggleLanguage={toggleLanguage}
                resetLanguages={() => setSelectedLanguages([])}
                selectedCategories={selectedCategories}
                toggleCategory={toggleCategory}
                resetCategories={() => setSelectedCategories([])}
                filterMenuOpen={filterMenuOpen}
                setFilterMenuOpen={setFilterMenuOpen}
                onSelectApplicant={handleOpenDetailModal}
                t={t.table}
                locale={locale}
              />
            )}

            {/* VIEW 2: Profile Change Requests */}
            {visibleNavSection === "change-requests" && (
              <>
                {profileChangeRequestsLoadError && (
                  <p role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-semibold text-red-800">
                    {profileChangeRequestsLoadError}
                  </p>
                )}
                <ProfileChangeRequestsView
                  requests={profileChangeRequests}
                  statusDecisionOrder={statusDecisionOrder}
                  onApprove={handleApproveProfileChange}
                  onRequestChanges={handleRequestProfileChange}
                  onReject={handleRejectProfileChange}
                />
              </>
            )}

            {/* VIEW 3: System Reports */}
            {visibleNavSection === "reports" && (
              <IncidentReportsView
                reports={reports}
                onEscalate={handleEscalateReport}
                onResolve={handleResolveReport}
              />
            )}

            {/* VIEW 4: Operations Activity History Timeline */}
            {/* VIEW 3: Operations Activity History Timeline */}
            {visibleNavSection === "history" && (
              <>
                {activitiesLoadError && (
                  <p role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-semibold text-red-800">
                    {activitiesLoadError}
                  </p>
                )}
                {loadingActivities && (
                  <p role="status" className="mb-4 text-xs font-semibold text-slate-500">
                    Loading operations history...
                  </p>
                )}
                <OperationsHistoryView activities={activities} />
              </>
            )}
          </main>
        </div>
      </div>

      {/* Centered Pop-up Modal (30% / 70% Split) & Reject Dialog */}
      <ApplicantDetailModal
        isOpen={detailModalOpen}
        applicant={selectedApplicant}
        onClose={() => setDetailModalOpen(false)}
        onApprove={handleApprove}
        onReject={handleReject}
        locale={locale}
      />

      {/* Login & Switch Account Modal */}
      {!embedded && (
        <LoginModal
          isOpen={isLoginModalOpen}
          onClose={() => setIsLoginModalOpen(false)}
          onSuccess={handleLoginSuccess}
        />
      )}
    </div>
  );
}
