"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { CheckCircleIcon } from "@heroicons/react/24/outline";
import { LoginModal } from "@/app/components/auth/login-modal";
import { getRedirectPathByRole } from "@/app/lib/mock-auth";
import { getCurrentUserProfile } from "@/app/lib/supabase-auth";
import { createClient } from "@/utils/supabase/client";
import type { UserProfile } from "@/app/lib/mock-auth";

import {
  AdminActiveTab,
  AccountStatus,
  AdminUserRecord,
  AuditLogEntry,
  SystemRole,
  SystemSettingsConfig,
} from "./types";
import { initialSystemSettings } from "./mock-data";
import { AdminHeader } from "./components/admin-header";
import { AdminDrawer } from "./components/admin-drawer";
import { AdminRailBar } from "./components/admin-rail-bar";
import { AdminKpiCards } from "./components/admin-kpi-cards";
import { ReportsKpiCards, ReportStatusFilter } from "./components/reports-kpi-cards";
import { UserEditModal } from "./components/user-edit-modal";
import { AccountActionDialog } from "./components/account-action-dialog";
import { UsersTable } from "./components/users-table";
import { EscalatedReportsTable } from "./components/escalated-reports-table";
import { AuditTrailTable } from "./components/audit-trail-table";
import { PlatformPoliciesView } from "./components/platform-policies-view";
import { PlatformOverviewView } from "./components/platform-overview-view";
import { useGovernanceStore } from "@/app/lib/governance-store";

export default function AdminPage() {
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);
  const [activeTab, setActiveTab] = useState<AdminActiveTab>("overview");
  const [auditViewMode, setAuditViewMode] = useState<"table" | "activity">("table");

  // Synchronized Shared Governance Store across Admin & Manager
  const {
    users,
    reports,
    auditLogs,
    updateUser,
    lockUser,
    unlockUser,
    revokeInterpreter,
    resolveReport,
    addAuditLog,
    reloadFromStorage,
  } = useGovernanceStore();

  // Filters
  const [selectedRoles, setSelectedRoles] = useState<SystemRole[]>([]);
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<"All" | "Active" | "Locked">("All");
  const [selectedVerificationStatuses, setSelectedVerificationStatuses] = useState<string[]>([]);
  const [selectedReportStatusFilter, setSelectedReportStatusFilter] = useState<ReportStatusFilter>("Pending");
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [filterMenuOpen, setFilterMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // User Edit Modal State
  const [selectedUser, setSelectedUser] = useState<AdminUserRecord | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [tempRole, setTempRole] = useState<SystemRole>("User");
  const [tempIsLocked, setTempIsLocked] = useState(false);
  const [tempLockReason, setTempLockReason] = useState("");

  // Account Action Dialog (Hard Ban / Soft Lock) State
  const [actionTargetUser, setActionTargetUser] = useState<AdminUserRecord | null>(null);
  const [actionReportId, setActionReportId] = useState<string | null>(null);
  const [isActionDialogOpen, setIsActionDialogOpen] = useState(false);

  // Platform System Settings State
  const [systemSettings, setSystemSettings] = useState<SystemSettingsConfig>(initialSystemSettings);

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    let disposed = false;

    const checkAdminSession = async () => {
      const result = await getCurrentUserProfile(supabase);
      if (disposed) return;

      if (!result.profile) {
        router.replace("/#top");
        return;
      }

      if (result.profile.role !== "Admin") {
        router.replace(getRedirectPathByRole(result.profile.role));
        return;
      }

      setCurrentUser(result.profile);
      setAuthChecked(true);
    };

    void checkAdminSession();
    const { data: authListener } = supabase.auth.onAuthStateChange(() => {
      window.setTimeout(() => void checkAdminSession(), 0);
    });

    return () => {
      disposed = true;
      authListener.subscription.unsubscribe();
    };
  }, [router]);

  const handleLoginSuccess = (user: UserProfile) => {
    setCurrentUser(user);
    setIsLoginModalOpen(false);
    if (user.role !== "Admin") {
      router.replace(getRedirectPathByRole(user.role));
      return;
    }
    showToast(`Logged in as ${user.name}`);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const handleOpenUserDetail = (user: AdminUserRecord) => {
    setSelectedUser(user);
    setTempRole(user.role);
    setTempIsLocked(user.isLocked);
    setTempLockReason(user.lockReason || "");
    setIsEditModalOpen(true);
  };

  // Open Safety Action Dialog (Lock / Hard Ban)
  const handleOpenActionDialog = (user: AdminUserRecord, reportId?: string) => {
    setActionTargetUser(user);
    setActionReportId(reportId || null);
    setIsActionDialogOpen(true);
  };

  // 1. Confirm Temporary Soft Lock
  const handleConfirmLock = (userId: string, reason: string) => {
    lockUser(userId, reason, false, `${currentUser?.name || "Super Admin"} (Admin)`);
    if (actionReportId) {
      resolveReport(actionReportId, "Resolved (Locked)", `Suspended by Admin: ${reason}`, `${currentUser?.name || "Super Admin"} (Admin)`);
    }
    const target = users.find((u) => u.id === userId);
    showToast(`Account for ${target?.name || userId} has been temporarily suspended.`);
  };

  // 2. Confirm Permanent Hard Ban (Strict Safety Confirmation)
  const handleConfirmHardBan = (userId: string, reason: string) => {
    lockUser(userId, `[PERMANENT BAN] ${reason}`, true, `${currentUser?.name || "Super Admin"} (Admin)`);
    if (actionReportId) {
      resolveReport(actionReportId, "Resolved (Hard Banned)", `Permanently Banned by Super Admin: ${reason}`, `${currentUser?.name || "Super Admin"} (Admin)`);
    }
    const target = users.find((u) => u.id === userId);
    showToast(`Account ${target?.name || userId} has been permanently hard banned.`);
  };

  // 3. Confirm Unlock
  const handleConfirmUnlock = (userId: string, reportId?: string) => {
    unlockUser(userId, `${currentUser?.name || "Super Admin"} (Admin)`);
    if (reportId) {
      resolveReport(
        reportId,
        "Resolved (Unlocked)",
        `Account restriction lifted and restored to Active by Admin.`,
        `${currentUser?.name || "Super Admin"} (Admin)`
      );
    }
    const target = users.find((u) => u.id === userId);
    showToast(`Account for ${target?.name || userId} has been successfully unlocked.`);
  };

  const handleRevokeInterpreter = (targetUser: AdminUserRecord, reason: string) => {
    revokeInterpreter(targetUser.id, reason, `${currentUser?.name || "Super Admin"} (Admin)`);
    setIsEditModalOpen(false);
    showToast(`Successfully revoked accreditation for ${targetUser.name}. Demoted to standard User.`);
  };

  const handleSaveUserChanges = () => {
    if (!selectedUser) return;

    // Security Business Rule: Admin accounts cannot be suspended or locked
    if (tempRole === "Admin" && tempIsLocked) {
      alert("Administrator accounts cannot be locked or suspended for platform continuity and system safety.");
      return;
    }

    // Validation
    if (tempIsLocked && !tempLockReason.trim()) {
      alert("Please provide an enforcement reason for this account suspension (Required for audit logging).");
      return;
    }

    const updatedUser: AdminUserRecord = {
      ...selectedUser,
      role: tempRole,
      isLocked: tempRole === "Admin" ? false : tempIsLocked,
      lockReason: tempRole === "Admin" ? undefined : tempIsLocked ? tempLockReason.trim() : undefined,
      accountStatus: (tempRole === "Admin" ? "Active" : tempIsLocked ? (selectedUser.accountStatus === "Banned" ? "Banned" : "Locked") : "Active") as AccountStatus,
    };

    updateUser(
      updatedUser,
      tempIsLocked !== selectedUser.isLocked
        ? tempIsLocked ? "ACCOUNT_SUSPEND" : "ACCOUNT_UNLOCKED"
        : tempRole !== selectedUser.role ? "ROLE_CHANGE" : "ACCOUNT_UPDATE",
      `Role set to ${tempRole}. Locked: ${tempIsLocked ? "Yes (" + tempLockReason.trim() + ")" : "No"}.`,
      `${currentUser?.name || "Super Admin"} (Admin)`
    );

    setIsEditModalOpen(false);
    showToast(`Successfully updated privileges for ${selectedUser.name} with Audit Log entry.`);
  };

  const toggleRoleFilter = (role: SystemRole) => {
    setSelectedRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );
  };

  const toggleLanguageFilter = (lang: string) => {
    setSelectedLanguages((prev) =>
      prev.includes(lang) ? prev.filter((l) => l !== lang) : [...prev, lang]
    );
  };

  const toggleCategoryFilter = (cat: string) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const toggleVerificationStatusFilter = (status: string) => {
    setSelectedVerificationStatuses((prev) =>
      prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]
    );
  };

  // Filtered Users
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      if (selectedRoles.length > 0 && !selectedRoles.includes(u.role)) {
        return false;
      }
      if (selectedStatusFilter === "Active" && u.isLocked) return false;
      if (selectedStatusFilter === "Locked" && !u.isLocked) return false;

      if (selectedVerificationStatuses.length > 0) {
        if (!u.interpreterStats) return false;
        if (!selectedVerificationStatuses.includes(u.interpreterStats.verificationStatus)) return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = u.name.toLowerCase().includes(q);
        const matchEmail = u.email.toLowerCase().includes(q);
        const matchId = u.id.toLowerCase().includes(q);
        const matchPhone = u.phone.includes(q);
        if (!matchName && !matchEmail && !matchId && !matchPhone) return false;
      }

      if (selectedLanguages.length > 0) {
        const userLangs = [u.primaryLanguage, ...u.spokenLanguages];
        const hasAny = selectedLanguages.some((l) => userLangs.includes(l));
        if (!hasAny) return false;
      }

      if (selectedCategories.length > 0) {
        if (!u.interpreterStats) return false;
        const hasCat = selectedCategories.some((c) => u.interpreterStats?.specialties.includes(c));
        if (!hasCat) return false;
      }

      return true;
    }).sort((a, b) => {
      // Locked users are always sorted to the bottom of the table
      if (a.isLocked && !b.isLocked) return 1;
      if (!a.isLocked && b.isLocked) return -1;
      return 0;
    });
  }, [users, selectedRoles, selectedStatusFilter, selectedVerificationStatuses, searchQuery, selectedLanguages, selectedCategories]);

  // Quick stats
  const totalUsersCount = users.length;
  const totalInterpretersCount = useMemo(() => users.filter((u) => u.role === "Interpreter").length, [users]);
  const lockedUsersCount = useMemo(() => users.filter((u) => u.isLocked).length, [users]);
  const totalAdminsCount = useMemo(() => users.filter((u) => u.role === "Admin" || u.role === "Manager").length, [users]);
  
  // Reports stats
  const totalReportsCount = reports.length;
  const pendingReportsCount = useMemo(() => reports.filter((r) => r.status === "Escalated to Admin").length, [reports]);
  const lockedReportsCount = useMemo(() => reports.filter((r) => r.status === "Resolved (Locked)").length, [reports]);
  const hardBannedReportsCount = useMemo(() => reports.filter((r) => r.status === "Resolved (Hard Banned)").length, [reports]);

  if (!authChecked) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7f9fa] text-[#092f45]" aria-busy="true">
        <p role="status" className="text-sm font-bold">Checking admin sessionโ€ฆ</p>
      </main>
    );
  }

  return (
    <div className="flex h-screen w-full flex-row overflow-hidden bg-[#f7f9fa] text-[#092f45] antialiased">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-3 rounded-xl border border-[#087f80]/30 bg-white p-4 shadow-2xl shadow-[#087f80]/20 animate-in fade-in slide-in-from-top-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#087f80]/10 text-[#087f80]">
            <CheckCircleIcon className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#087f80]">System Success</p>
            <p className="text-sm font-medium text-[#092f45]">{toastMessage}</p>
          </div>
        </div>
      )}

      {/* Universal Slide-out Pop-up Sidebar Drawer */}
      <AdminDrawer
        isOpen={isMobileDrawerOpen}
        onClose={() => setIsMobileDrawerOpen(false)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        totalUsersCount={totalUsersCount}
        pendingReportsCount={pendingReportsCount}
        auditLogsCount={auditLogs.length}
      />

      {/* 1. Full-Height Left Rail Bar (Continuous single block from top to bottom) */}
      <AdminRailBar
        onMenuClick={() => setIsMobileDrawerOpen((prev) => !prev)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        totalUsersCount={totalUsersCount}
        pendingReportsCount={pendingReportsCount}
        auditLogsCount={auditLogs.length}
      />

      {/* 2. Main Right Container: Header + Content Workspace + Footer */}
      <div className="flex flex-1 flex-col h-full overflow-hidden min-w-0">
        {/* Global Top Header */}
        <AdminHeader
          onMenuClick={() => setIsMobileDrawerOpen((prev) => !prev)}
          onSignOut={() => {
            void createClient().auth.signOut();
            setCurrentUser(null);
            setAuthChecked(false);
            router.replace("/#top");
          }}
          onChangeAccount={() => setIsLoginModalOpen(true)}
          currentUser={currentUser}
        />

        {/* Content Workspace Scroll Area - Pure Clean White Canvas */}
        <div className="flex-1 overflow-y-auto min-w-0 flex flex-col bg-white">
          <main className="flex-1 p-4 sm:p-6 md:p-8 space-y-5 sm:space-y-6">
            {/* TAB 0: SYSTEM & OPERATIONS OVERVIEW (ANALYTICS & CHARTS) */}
            {activeTab === "overview" && (
              <PlatformOverviewView
                users={users}
                reports={reports}
                auditLogs={auditLogs}
                onNavigateTab={(tab) => setActiveTab(tab)}
                onRefresh={() => {
                  reloadFromStorage();
                  showToast("Platform overview metrics refreshed.");
                }}
              />
            )}

            {/* Header Interactive KPI Overview Cards for Users */}
            {activeTab === "users" && (
              <AdminKpiCards
                totalUsersCount={totalUsersCount}
                totalInterpretersCount={totalInterpretersCount}
                lockedUsersCount={lockedUsersCount}
                totalAdminsCount={totalAdminsCount}
                selectedStatusFilter={selectedStatusFilter}
                setSelectedStatusFilter={setSelectedStatusFilter}
                selectedRoles={selectedRoles}
                toggleRoleFilter={toggleRoleFilter}
                resetRoles={() => setSelectedRoles([])}
              />
            )}

            {/* Header Interactive KPI Overview Cards for Escalated Reports */}
            {activeTab === "reports" && (
              <ReportsKpiCards
                totalReportsCount={totalReportsCount}
                pendingReportsCount={pendingReportsCount}
                lockedReportsCount={lockedReportsCount}
                hardBannedReportsCount={hardBannedReportsCount}
                selectedStatusFilter={selectedReportStatusFilter}
                onSelectStatusFilter={setSelectedReportStatusFilter}
              />
            )}

            {/* TAB 1: ALL USERS & ROLES */}
            {activeTab === "users" && (
              <UsersTable
                users={filteredUsers}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                selectedRoles={selectedRoles}
                toggleRoleFilter={toggleRoleFilter}
                resetRoles={() => setSelectedRoles([])}
                selectedStatusFilter={selectedStatusFilter}
                setSelectedStatusFilter={setSelectedStatusFilter}
                selectedVerificationStatuses={selectedVerificationStatuses}
                toggleVerificationStatusFilter={toggleVerificationStatusFilter}
                resetVerificationStatuses={() => setSelectedVerificationStatuses([])}
                selectedLanguages={selectedLanguages}
                toggleLanguageFilter={toggleLanguageFilter}
                resetLanguages={() => setSelectedLanguages([])}
                selectedCategories={selectedCategories}
                toggleCategoryFilter={toggleCategoryFilter}
                resetCategories={() => setSelectedCategories([])}
                filterMenuOpen={filterMenuOpen}
                setFilterMenuOpen={setFilterMenuOpen}
                onSelectUser={handleOpenUserDetail}
              />
            )}

            {/* TAB 2: ESCALATED INCIDENT REPORTS (FROM MANAGERS) */}
            {activeTab === "reports" && (
              <EscalatedReportsTable
                reports={reports}
                users={users}
                onTakeAction={(targetUser, reportId) => handleOpenActionDialog(targetUser, reportId)}
                onOpenUserDetail={handleOpenUserDetail}
                onUnlockUser={(userId, reportId) => handleConfirmUnlock(userId, reportId)}
                selectedStatusFilter={selectedReportStatusFilter}
                onSelectStatusFilter={setSelectedReportStatusFilter}
              />
            )}

            {/* TAB 3: IMMUTABLE AUDIT TRAIL LOGS */}
            {activeTab === "audit" && (
              <AuditTrailTable
                auditLogs={auditLogs}
                auditViewMode={auditViewMode}
                setAuditViewMode={setAuditViewMode}
              />
            )}

            {/* TAB 4: PLATFORM GOVERNANCE & POLICIES */}
            {activeTab === "policies" && (
              <PlatformPoliciesView
                settings={systemSettings}
                onSave={(newSettings) => {
                  setSystemSettings(newSettings);
                  const newLog: AuditLogEntry = {
                    id: `AUD-${Date.now().toString().slice(-4)}`,
                    timestamp: new Date().toISOString().replace("T", " ").slice(0, 19),
                    actor: `${currentUser?.name || "Super Admin"} (Admin)`,
                    action: "SYSTEM_POLICY_UPDATE",
                    targetUser: "Platform Configuration",
                    severity: "warning",
                    details: `SOS Radius: ${newSettings.sosDispatchRadiusKm}km, Min Rating: ${newSettings.interpreterMinRatingThreshold}, Ticket SLA: ${newSettings.autoEscalateTicketMinutes}m, Languages: ${newSettings.languagesCatalog.length}, Taxonomies: ${newSettings.specialtyCategories.length}`,
                  };
                  addAuditLog(newLog);
                  showToast("Platform policies successfully updated and recorded in Audit Trail.");
                }}
              />
            )}
          </main>
        </div>
      </div>

      {/* Centered Modal: User Role & Suspension Editor */}
      <UserEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        user={selectedUser}
        tempRole={tempRole}
        setTempRole={setTempRole}
        tempIsLocked={tempIsLocked}
        setTempIsLocked={setTempIsLocked}
        tempLockReason={tempLockReason}
        setTempLockReason={setTempLockReason}
        onSave={handleSaveUserChanges}
        incidentReports={reports}
        onRevokeInterpreter={handleRevokeInterpreter}
        onDirectHardBan={(u) => handleOpenActionDialog(u)}
      />

      {/* Centered Modal: Account Action Dialog (Hard Ban / Soft Lock with Strict Confirmation) */}
      <AccountActionDialog
        isOpen={isActionDialogOpen}
        user={actionTargetUser}
        onClose={() => {
          setIsActionDialogOpen(false);
          setActionTargetUser(null);
          setActionReportId(null);
        }}
        onConfirmLock={handleConfirmLock}
        onConfirmHardBan={handleConfirmHardBan}
        onConfirmUnlock={handleConfirmUnlock}
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
