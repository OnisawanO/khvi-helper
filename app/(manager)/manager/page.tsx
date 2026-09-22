"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ShieldCheckIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";

import {
  InterpreterApplicant,
  HelpTicket,
  IncidentReport,
  ManagerNavSection,
  ManagerActivity,
} from "./types";
import {
  initialApplicants,
  initialTickets,
  initialReports,
  initialManagerActivities,
} from "./mock-data";

import { ManagerHeader } from "./components/manager-header";
import { ManagerDrawer } from "./components/manager-drawer";
import { ManagerRailBar } from "./components/manager-rail-bar";
import { ApplicantsTable } from "./components/applicants-table";
import { HelpTicketsView } from "./components/help-tickets-view";
import { IncidentReportsView } from "./components/incident-reports-view";
import { OperationsHistoryView } from "./components/operations-history-view";
import { ApplicantDetailModal } from "./components/applicant-detail-modal";
import { LoginModal } from "@/app/components/auth/login-modal";

import {
  getRedirectPathByRole,
  type UserProfile,
} from "@/app/lib/mock-auth";
import { getCurrentUserProfile } from "@/app/lib/supabase-auth";
import { createClient } from "@/utils/supabase/client";
import {
  useInterpreterApplications,
  reviewInterpreterApplication,
  type InterpreterApplication as StoreApplication,
} from "@/app/lib/interpreter-application";
import {
  loadManagerInterpreterApplicationsAction,
  reviewInterpreterApplicationAction,
} from "@/app/actions/interpreter-application-actions";
import { governanceStore } from "@/app/lib/governance-store";

function toInterpreterApplicant(app: StoreApplication): InterpreterApplicant {
  const primary = app.primaryLanguage || (app.languages[0]?.name ?? "ไทย (Thai)");
  const spoken = app.languages.map((l) => l.name);
  const categories = app.categories.map((c) => c.name);

  let status: InterpreterApplicant["status"] = "Pending";
  if (app.status === "approved") status = "Approved";
  else if (app.status === "rejected") status = "Rejected";
  else if (app.status === "under_review" || app.status === "needs_revision") status = "Under Review";

  const firstDoc = app.documents[0];
  const docName = firstDoc?.name || app.certificateFileName || "document.pdf";
  const ext = docName.split(".").pop()?.toLowerCase();
  const format = ext === "png" || ext === "jpg" ? ext : "pdf";

  return {
    id: app.id,
    name: app.applicantName,
    age: app.age || 25,
    country: app.assignedArea || "Thailand",
    primaryLanguage: primary,
    spokenLanguages: spoken.length > 0 ? spoken : [primary],
    specialtyCategories: categories.length > 0 ? categories : ["General Communication"],
    experienceSummary: app.workHistory.map((w) => w.description).join("; ") || "ความพร้อมช่วยเหลือฉุกเฉินและประสานงานทั่วไป",
    contactChannels: [app.phone, app.extraContact].filter(Boolean).join(" | ") || app.email,
    appliedDate: app.submittedAt || "Recently",
    status,
    rejectionReason: app.rejectReason,
    backgroundCheck: "Passed",
    proficiencyScore: app.languages.map((l) => `${l.name} (${l.level || l.type || "Proficient"})`).join(", "),
    document: {
      name: docName,
      type: firstDoc?.type || "cert",
      format,
      size: firstDoc?.size || "2.0 MB",
      url: firstDoc?.url || app.certificateUrl,
    },
  };
}

export default function ManagerDashboard() {
  const router = useRouter();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [realApplicants, setRealApplicants] = useState<InterpreterApplicant[] | null>(null);

  const { applications } = useInterpreterApplications();

  useEffect(() => {
    if (!authChecked) return;

    let disposed = false;
    const loadApplicants = async () => {
      const result = await loadManagerInterpreterApplicationsAction();
      if (disposed) return;
      setRealApplicants(result.ok ? result.data : []);
      if (!result.ok) console.error("Failed to load real interpreter applications:", result.error);
    };

    void loadApplicants();
    return () => {
      disposed = true;
    };
  }, [authChecked]);

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

  const localApplicants = useMemo<InterpreterApplicant[]>(() => {
    if (applications && applications.length > 0) {
      return applications.map(toInterpreterApplicant);
    }
    return initialApplicants;
  }, [applications]);
  const applicants = realApplicants ?? localApplicants;

  const [tickets, setTickets] = useState<HelpTicket[]>(initialTickets);
  const [reports, setReports] = useState<IncidentReport[]>(initialReports);
  const [activities, setActivities] = useState<ManagerActivity[]>(initialManagerActivities);
  const [selectedApplicantId, setSelectedApplicantId] = useState<string | null>(null);

  // Navigation & View State
  const [navSection, setNavSection] = useState<ManagerNavSection>("queue");
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  // Response text for tickets
  const [activeReplyingTicketId, setActiveReplyingTicketId] = useState<string | null>(null);
  const [ticketReplyText, setTicketReplyText] = useState("");

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
    return applicants.filter((app) => {
      // 1. Filter by navigation section
      if (navSection === "queue" && app.status !== "Pending" && app.status !== "Under Review") {
        return false;
      }
      if (navSection === "approved" && app.status !== "Approved") {
        return false;
      }
      if (navSection === "rejected" && app.status !== "Rejected") {
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
  }, [applicants, navSection, searchQuery, selectedLanguages, selectedCategories]);

  // Selected applicant for the centered pop-up modal
  const selectedApplicant = useMemo(() => {
    return applicants.find((a) => a.id === selectedApplicantId) || null;
  }, [applicants, selectedApplicantId]);

  const handleOpenDetailModal = (applicant: InterpreterApplicant) => {
    setSelectedApplicantId(applicant.id);
    setDetailModalOpen(true);
  };

  // Handle Approve (FR-43)
  const handleApprove = async (id: string) => {
    const target = applicants.find((a) => a.id === id);
    if (realApplicants !== null) {
      const result = await reviewInterpreterApplicationAction({ applicationId: id, decision: "approved" });
      if (!result.ok) {
        console.error("Failed to persist approval:", result.error);
        return;
      }
      const refreshed = await loadManagerInterpreterApplicationsAction();
      if (refreshed.ok) setRealApplicants(refreshed.data);
    } else if (currentUser) {
      try {
        reviewInterpreterApplication(id, currentUser, { status: "approved" });
      } catch (err) {
        console.error("Failed to persist approval:", err);
      }
    }
    if (target) {
      setActivities((prev) => [
        {
          id: `ACT-APP-${id}-${prev.length + 1}`,
          timestamp: "Just now",
          type: "approval",
          targetName: target.name,
          description: `Approved volunteer interpreter application (${target.primaryLanguage}, ${target.specialtyCategories.join(", ")}).`,
        },
        ...prev,
      ]);
    }
  };

  // Handle Reject (FR-44, FR-45)
  const handleReject = async (id: string, reason: string) => {
    const target = applicants.find((a) => a.id === id);
    if (realApplicants !== null) {
      const result = await reviewInterpreterApplicationAction({ applicationId: id, decision: "rejected", note: reason });
      if (!result.ok) {
        console.error("Failed to persist rejection:", result.error);
        return;
      }
      const refreshed = await loadManagerInterpreterApplicationsAction();
      if (refreshed.ok) setRealApplicants(refreshed.data);
    } else if (currentUser) {
      try {
        reviewInterpreterApplication(id, currentUser, { status: "rejected", reason });
      } catch (err) {
        console.error("Failed to persist rejection:", err);
      }
    }
    if (target) {
      setActivities((prev) => [
        {
          id: `ACT-REJ-${id}-${prev.length + 1}`,
          timestamp: "Just now",
          type: "rejection",
          targetName: target.name,
          description: `Rejected application: ${reason}`,
        },
        ...prev,
      ]);
    }
  };

  // Handle Help Request Response (FR-52)
  const handleSendTicketReply = (ticketId: string) => {
    if (!ticketReplyText.trim()) return;
    const target = tickets.find((t) => t.id === ticketId);
    setTickets((prev) =>
      prev.map((t) =>
        t.id === ticketId
          ? {
              ...t,
              status: "Resolved",
              response: ticketReplyText.trim(),
            }
          : t
      )
    );
    if (target) {
      setActivities((prev) => [
        {
          id: `ACT-TCK-${ticketId}-${prev.length + 1}`,
          timestamp: "Just now",
          type: "ticket_reply",
          targetName: `${target.requesterName} (${target.id})`,
          description: `Replied & resolved help ticket: "${ticketReplyText.trim()}"`,
        },
        ...prev,
      ]);
    }
    setActiveReplyingTicketId(null);
    setTicketReplyText("");
  };

  // Handle Incident Report Escalation to Admin (FR-53 -> FR-76)
  const handleEscalateReport = (reportId: string) => {
    const target = reports.find((r) => r.id === reportId);
    setReports((prev) =>
      prev.map((r) =>
        r.id === reportId
          ? {
              ...r,
              status: "Escalated to Admin",
              actionTaken: "Escalated by Manager to Admin Portal for user account lock evaluation (FR-78).",
            }
          : r
      )
    );
    if (target) {
      // Sync to shared governance store for Admin Portal real-time pickup
      governanceStore.escalateReportToAdmin(
        {
          id: target.id,
          reporterName: target.reporterName,
          reporterRole: target.reporterRole,
          reportedUserId: target.reportedUserRole === "Interpreter" ? "USR-005" : "USR-006",
          reportedUserName: target.reportedUserName,
          reportedUserRole: target.reportedUserRole,
          bookingId: target.bookingId,
          reason: target.reason,
          severity: "high",
          createdAt: target.createdAt,
          status: "Escalated to Admin",
          actionTaken: "Escalated by Manager for Super Admin review and account restriction.",
        },
        `${currentUser?.name || "Manager Coordinator"} (Manager)`
      );

      setActivities((prev) => [
        {
          id: `ACT-REP-${reportId}-${prev.length + 1}`,
          timestamp: "Just now",
          type: "report_escalation",
          targetName: `${target.reportedUserName} (${target.id})`,
          description: `Escalated incident report regarding "${target.reason}" to Super Admin for account lock review.`,
        },
        ...prev,
      ]);
    }
  };

  // Counts for Badges & Cards
  const pendingCount = applicants.filter((a) => a.status === "Pending" || a.status === "Under Review").length;
  const approvedCount = applicants.filter((a) => a.status === "Approved").length;
  const rejectedCount = applicants.filter((a) => a.status === "Rejected").length;
  const openTicketCount = tickets.filter((t) => t.status === "Open" || t.status === "In Progress").length;
  const pendingReportCount = reports.filter((r) => r.status === "Pending Investigation").length;

  if (!authChecked) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7f9fa] text-[#092f45]" aria-busy="true">
        <p role="status" className="text-sm font-bold">Checking manager session…</p>
      </main>
    );
  }

  return (
    <div className="flex h-screen w-full flex-row overflow-hidden bg-[#f7f9fa] text-[#092f45] antialiased">
      {/* Universal Slide-out Pop-up Sidebar Drawer */}
      <ManagerDrawer
        isOpen={isMobileDrawerOpen}
        onClose={() => setIsMobileDrawerOpen(false)}
        navSection={navSection}
        setNavSection={setNavSection}
        pendingCount={pendingCount}
        approvedCount={approvedCount}
        rejectedCount={rejectedCount}
        openTicketCount={openTicketCount}
        pendingReportCount={pendingReportCount}
        activitiesCount={activities.length}
      />

      {/* Compact Left Rail Bar (Single Source of Navigation - Rail Bar Only) */}
      <ManagerRailBar
        onMenuClick={() => setIsMobileDrawerOpen((prev) => !prev)}
        navSection={navSection}
        setNavSection={setNavSection}
        pendingCount={pendingCount}
        approvedCount={approvedCount}
        rejectedCount={rejectedCount}
        openTicketCount={openTicketCount}
        pendingReportCount={pendingReportCount}
      />

      {/* Right Column: Top Header + Main Content Workspace */}
      <div className="flex flex-1 flex-col h-full overflow-hidden min-w-0">
        <ManagerHeader
          onMenuClick={() => setIsMobileDrawerOpen((prev) => !prev)}
          currentUser={currentUser}
          onSignOut={handleSignOut}
          onChangeAccount={() => setIsLoginModalOpen(true)}
        />

        {/* Administrator Supervisory Override Banner */}
        {currentUser?.role === "Admin" && (
          <div className="flex items-center justify-between border-b border-amber-300 bg-amber-50 px-4 py-2 text-xs font-semibold text-amber-900 shadow-xs">
            <div className="flex items-center gap-2">
              <ShieldCheckIcon className="h-4 w-4 text-amber-700 shrink-0" />
              <span>
                <strong>Administrator Mode:</strong> You have full supervisory override authority across all operational queues.
              </span>
            </div>
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 rounded-lg border border-amber-300 bg-white px-3 py-1 text-[11px] font-bold text-amber-800 shadow-2xs hover:bg-amber-100/50 transition-colors"
            >
              <ArrowLeftIcon className="h-3 w-3" />
              <span>Return to Admin Console</span>
            </Link>
          </div>
        )}

        {/* Content Workspace */}
        <div className="flex-1 overflow-y-auto min-w-0 flex flex-col">
          <main className="flex-1 p-4 sm:p-6 md:p-8 space-y-5 sm:space-y-6">
            {/* VIEW 1: Volunteer Applicants Table (Queue, Approved, Rejected) */}
            {(navSection === "queue" || navSection === "approved" || navSection === "rejected") && (
              <ApplicantsTable
                navSection={navSection}
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
                onApprove={handleApprove}
              />
            )}

            {/* VIEW 2: Live Help Requests (FR-51, FR-52) */}
            {navSection === "tickets" && (
              <HelpTicketsView
                tickets={tickets}
                activeReplyingTicketId={activeReplyingTicketId}
                setActiveReplyingTicketId={setActiveReplyingTicketId}
                ticketReplyText={ticketReplyText}
                setTicketReplyText={setTicketReplyText}
                onSendReply={handleSendTicketReply}
              />
            )}

            {/* VIEW 3: Incident Reports & Disputes (FR-53) */}
            {navSection === "reports" && (
              <IncidentReportsView
                reports={reports}
                onEscalate={handleEscalateReport}
              />
            )}

            {/* VIEW 4: Operations Activity History Timeline */}
            {navSection === "history" && (
              <OperationsHistoryView activities={activities} />
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
      />

      {/* Login & Switch Account Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onSuccess={handleLoginSuccess}
      />
    </div>
  );
}
