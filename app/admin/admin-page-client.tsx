"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState, useMemo } from "react";
import { CheckCircleIcon, UserPlusIcon } from "@heroicons/react/24/outline";
import { LoginModal } from "@/app/components/auth/login-modal";
import { getRedirectPathByRole } from "@/app/lib/mock-auth";
import { getCurrentUserProfile } from "@/app/lib/supabase-auth";
import { createClient } from "@/utils/supabase/client";
import type { UserProfile } from "@/app/lib/mock-auth";

import {
  AdminActiveTab,
  AccountStatus,
  AdminUserRecord,
  SystemRole,
  SystemSettingsConfig,
} from "./types";
import { AdminHeader } from "./components/admin-header";
import { AdminDrawer } from "./components/admin-drawer";
import { AdminRailBar } from "./components/admin-rail-bar";
import { AdminKpiCards } from "./components/admin-kpi-cards";
import { ReportsKpiCards, ReportStatusFilter } from "./components/reports-kpi-cards";
import { UserEditModal } from "./components/user-edit-modal";
import { StaffAccountModal, type StaffAccountFormData } from "./components/staff-account-modal";
import { AccountActionDialog } from "./components/account-action-dialog";
import {
  RoleAssignmentAlertDialog,
  type RoleAssignmentAlertKind,
} from "./components/role-assignment-alert-dialog";
import { UsersTable } from "./components/users-table";
import { EscalatedReportsTable } from "./components/escalated-reports-table";
import { AuditTrailTable } from "./components/audit-trail-table";
import { PlatformPoliciesView } from "./components/platform-policies-view";
import ManagerDashboard from "@/app/manager/page";
import { PlatformOverviewView } from "./components/platform-overview-view";
import { useGovernanceStore } from "@/app/lib/governance-store";
import type { ManagerNavSection } from "@/app/manager/types";
import {
  getAdminReportsAction,
  getAdminUsersAction,
  getAdminAuditLogsAction,
  getAdminPlatformSettingsAction,
  updateAdminPlatformSettingsAction,
  createManagerAccountAction,
  grantAdminAccessAction,
  revokeInterpreterAccessAction,
  resolveAdminReportAction,
  enforceAccountRestrictionAction,
  updateUserSecurityAction,
} from "./actions/admin-actions";

export default function AdminPage() {
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);
  const [activeTab, setActiveTab] = useState<AdminActiveTab>(() => {
    if (typeof window === "undefined") return "overview";
    return new URLSearchParams(window.location.search).get("view") === "manager-operations"
      ? "manager-operations"
      : "overview";
  });
  const [managerSection, setManagerSection] = useState<ManagerNavSection>(() => {
    if (typeof window === "undefined") return "queue";
    const section = new URLSearchParams(window.location.search).get("section");
    return section === "approved" ||
      section === "rejected" ||
      section === "change-requests" ||
      section === "reports" ||
      section === "history"
      ? section
      : "queue";
  });
  const [managerCounts, setManagerCounts] = useState({
    pendingApplicantCount: 0,
    approvedApplicantCount: 0,
    pendingProfileChangeCount: 0,
    rejectedApplicantCount: 0,
    pendingManagerReportCount: 0,
    managerActivitiesCount: 0,
  });
  const [auditViewMode, setAuditViewMode] = useState<"table" | "activity">("table");

  // Synchronized Shared Governance Store across Admin & Manager
  const {
    users,
    reports,
    auditLogs,
    setUsers,
    setReports,
    setAuditLogs,
    updateUser,
    lockUser,
    revokeInterpreter,
    resolveReport,
  } = useGovernanceStore();

  // Filters
  const [selectedRoles, setSelectedRoles] = useState<SystemRole[]>([]);
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<"Directory" | "All" | "Active" | "SoftSuspended" | "PermanentlyBanned" | "AppealPending">("Directory");
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
  const [isActionDialogOpen, setIsActionDialogOpen] = useState(false);
  const [roleAssignmentAlert, setRoleAssignmentAlert] = useState<RoleAssignmentAlertKind | null>(null);

  // Platform System Settings State
  const [systemSettings, setSystemSettings] = useState<SystemSettingsConfig | null>(null);

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [reportsLoadError, setReportsLoadError] = useState<string | null>(null);
  const [usersLoadError, setUsersLoadError] = useState<string | null>(null);
  const [auditLogsLoadError, setAuditLogsLoadError] = useState<string | null>(null);
  const [systemSettingsLoadError, setSystemSettingsLoadError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isStaffAccountModalOpen, setIsStaffAccountModalOpen] = useState(false);

  const handleSetActiveTab = (tab: AdminActiveTab) => {
    setActiveTab(tab);
    router.replace(tab === "manager-operations" ? "/admin?view=manager-operations" : "/admin", {
      scroll: false,
    });
  };

  const handleSetManagerSection = (section: ManagerNavSection) => {
    setManagerSection(section);
    setActiveTab("manager-operations");
    router.replace(`/admin?view=manager-operations&section=${section}`, { scroll: false });
  };

  const handleManagerCountsChange = useCallback((counts: typeof managerCounts) => {
    setManagerCounts(counts);
  }, []);

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

      // Load every Admin data source from Supabase. Empty results are valid and
      // must not fall back to client-side seed data.
      void loadSupabaseUsers();
      void loadSupabaseReports();
      void loadSupabaseAuditLogs();
      void loadSupabasePlatformSettings();
    };

    const loadSupabaseUsers = async () => {
      try {
        const res = await getAdminUsersAction();
        if (res.success && res.data) {
          setUsers(res.data);
          setUsersLoadError(null);
        } else {
          setUsers([]);
          setUsersLoadError(res.error || "Unable to load users from Supabase.");
        }
      } catch (err) {
        console.error("Failed to load users from Supabase:", err);
        setUsers([]);
        setUsersLoadError("Unable to load users from Supabase.");
      }
    };

    const loadSupabaseReports = async () => {
      try {
        const res = await getAdminReportsAction();
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

    const loadSupabaseAuditLogs = async () => {
      try {
        const res = await getAdminAuditLogsAction();
        if (res.success && res.data) {
          setAuditLogs(res.data);
          setAuditLogsLoadError(null);
        } else {
          setAuditLogs([]);
          setAuditLogsLoadError(res.error || "Unable to load audit logs from Supabase.");
        }
      } catch (err) {
        console.error("Failed to load audit logs from Supabase:", err);
        setAuditLogs([]);
        setAuditLogsLoadError("Unable to load audit logs from Supabase.");
      }
    };

    const loadSupabasePlatformSettings = async () => {
      try {
        const res = await getAdminPlatformSettingsAction();
        if (res.success && res.data) {
          setSystemSettings(res.data);
          setSystemSettingsLoadError(null);
        } else {
          setSystemSettings(null);
          setSystemSettingsLoadError(res.error || "Unable to load platform settings from Supabase.");
        }
      } catch (err) {
        console.error("Failed to load platform settings from Supabase:", err);
        setSystemSettings(null);
        setSystemSettingsLoadError("Unable to load platform settings from Supabase.");
      }
    };

    void checkAdminSession();
    const { data: authListener } = supabase.auth.onAuthStateChange(() => {
      window.setTimeout(() => void checkAdminSession(), 0);
    });

    return () => {
      disposed = true;
      authListener.subscription.unsubscribe();
    };
  }, [router, setAuditLogs, setReports, setUsers]);

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

  const refreshAuditLogs = async () => {
    const result = await getAdminAuditLogsAction();
    if (result.success && result.data) {
      setAuditLogs(result.data);
      setAuditLogsLoadError(null);
    } else {
      setAuditLogsLoadError(result.error || "Unable to refresh audit logs from Supabase.");
    }
  };

  const refreshUsers = async () => {
    const result = await getAdminUsersAction();
    if (result.success && result.data) {
      setUsers(result.data);
      setUsersLoadError(null);
    } else {
      setUsers([]);
      setUsersLoadError(result.error || "Unable to refresh users from Supabase.");
    }
  };

  const handleOpenUserDetail = (user: AdminUserRecord) => {
    setSelectedUser(user);
    setTempRole(user.role);
    setTempIsLocked(user.isLocked);
    setTempLockReason(user.lockReason || "");
    setIsEditModalOpen(true);
  };

  const handleGrantAdminAccess = async (targetUser: AdminUserRecord) => {
    if (currentUser?.adminLevel !== "primary") {
      showToast("Only the Primary Admin can grant Admin access.");
      return;
    }

    if (targetUser.role !== "Manager") {
      showToast("Only a Manager can receive delegated Admin access.");
      return;
    }

    if (targetUser.isLocked) {
      showToast("Unlock the Manager account before granting Admin access.");
      return;
    }

    const confirmed = window.confirm(
      `Grant delegated Admin access to ${targetUser.name}? This changes the account from Manager to Admin, but it will not become the Primary Admin.`
    );
    if (!confirmed) return;

    const result = await grantAdminAccessAction(targetUser.id);
    if (!result.success) {
      showToast(`Admin access was not granted: ${result.error || "Unknown error"}`);
      return;
    }

    const updatedUser: AdminUserRecord = {
      ...targetUser,
      role: "Admin",
      adminLevel: "delegated",
      isLocked: false,
      lockReason: undefined,
      accountStatus: "Active",
    };
    updateUser(
      updatedUser,
      "ADMIN_ACCESS_GRANTED",
      "Manager promoted to delegated Admin. Primary Admin privileges were not granted.",
      `${currentUser.name} (Admin)`
    );
    void refreshUsers();
    void refreshAuditLogs();
    setIsEditModalOpen(false);
    setSelectedUser(null);
    showToast(`${targetUser.name} now has delegated Admin access.`);
  };

  const handleCreateManagerAccount = async (input: StaffAccountFormData) => {
    const result = await createManagerAccountAction(input);
    if (result.success) {
      showToast("Manager account created successfully.");
      await refreshUsers();
      await refreshAuditLogs();
    }
    return result;
  };

  // Open Safety Action Dialog (Lock / Hard Ban)
  const handleOpenActionDialog = (user: AdminUserRecord) => {
    if (currentUser?.adminLevel !== "primary") {
      showToast("Only the Primary Admin can change account security settings.");
      return;
    }
    if (user.accountStatus === "Banned" || user.restrictionType === "hard") {
      showToast("Permanent bans require a separate Primary Admin review flow.");
      return;
    }
    setIsEditModalOpen(false);
    setSelectedUser(null);
    setActionTargetUser(user);
    setIsActionDialogOpen(true);
  };

  const handleResolveSystemReport = (reportId: string, note: string) => {
    const actionNote = `System issue resolved by Admin: ${note}`;
    resolveReport(
      reportId,
      "Resolved",
      actionNote,
      `${currentUser?.name || "Super Admin"} (Admin)`
    );
    void resolveAdminReportAction(reportId, "fixed", actionNote).then((result) => {
      if (!result.success && /^REP-\d+$/i.test(reportId)) {
        console.error("Failed to persist system report resolution:", result.error);
      }
      void refreshAuditLogs();
    });
    showToast(`System report ${reportId} has been marked as resolved.`);
  };

  // Confirm Permanent Hard Ban (Strict Safety Confirmation)
  const handleConfirmHardBan = async (userId: string, reason: string): Promise<boolean> => {
    const target = users.find((u) => u.id === userId);
    const result = await enforceAccountRestrictionAction(userId, "hard_ban", reason);
    if (!result.success) {
      showToast(`Permanent ban failed: ${result.error || "Unknown error"}`);
      return false;
    }

    lockUser(userId, `[PERMANENT BAN] ${reason}`, true, `${currentUser?.name || "Super Admin"} (Admin)`);
    void refreshUsers();
    void refreshAuditLogs();
    showToast(`Account ${target?.name || userId} has been permanently hard banned.`);
    return true;
  };

  const handleRevokeInterpreter = async (targetUser: AdminUserRecord, reason: string) => {
    if (currentUser?.adminLevel !== "primary") {
      showToast("Only the Primary Admin can revoke interpreter access.");
      return;
    }

    const result = await revokeInterpreterAccessAction(targetUser.id, reason);
    if (!result.success) {
      showToast(`Interpreter access was not revoked: ${result.error || "Unknown error"}`);
      return;
    }

    revokeInterpreter(targetUser.id, reason, `${currentUser?.name || "Super Admin"} (Admin)`);
    void refreshUsers();
    void refreshAuditLogs();
    setIsEditModalOpen(false);
    showToast(`Successfully revoked accreditation for ${targetUser.name}. Demoted to standard User.`);
  };

  const handleSaveUserChanges = async () => {
    if (!selectedUser) return;

    const isPrimaryAdmin = currentUser?.role === "Admin" && currentUser.adminLevel === "primary";
    const isDelegatedAdmin = currentUser?.role === "Admin" && currentUser.adminLevel === "delegated";
    const delegatedManagedRoles: SystemRole[] = ["User", "Interpreter"];

    if (!isPrimaryAdmin && !isDelegatedAdmin) {
      showToast("This Admin account cannot change roles or account security settings.");
      return;
    }

    if (selectedUser.role === "Admin") {
      showToast("Admin accounts are read-only in User Directory.");
      return;
    }

    if (selectedUser.accountStatus === "Banned" || selectedUser.restrictionType === "hard") {
      showToast("Permanent bans require Primary Admin review before any change.");
      return;
    }

    if (
      isDelegatedAdmin &&
      (!delegatedManagedRoles.includes(selectedUser.role) ||
        !delegatedManagedRoles.includes(tempRole))
    ) {
      showToast("Delegated Admin can manage only User and Interpreter accounts.");
      return;
    }

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
      restrictionType: tempRole === "Admin" ? "none" : tempIsLocked ? "soft" : "none",
      restrictionReason: tempRole === "Admin" ? undefined : tempIsLocked ? tempLockReason.trim() : undefined,
      restrictionAt: tempRole === "Admin" ? undefined : tempIsLocked ? new Date().toISOString() : undefined,
      restrictionByUserId: undefined,
      accountStatus: (tempRole === "Admin" ? "Active" : tempIsLocked ? "Locked" : "Active") as AccountStatus,
    };

    showToast(`Updating privileges for ${selectedUser.name}...`);

    try {
      const res = await updateUserSecurityAction(
        selectedUser.id,
        tempRole,
        tempRole === "Admin" ? false : tempIsLocked,
        tempLockReason.trim()
      );
      if (!res.success) {
        if (res.error === "Interpreter role requires an approved interpreter application.") {
          setRoleAssignmentAlert("no_approved_application");
        } else if (res.error === "Interpreter access was revoked; Primary Admin review is required before restoring it.") {
          setRoleAssignmentAlert("revoked_access");
        } else {
          showToast(`Security changes were not saved: ${res.error || "Unknown error"}`);
        }
        return;
      }

      updateUser(
        updatedUser,
        tempIsLocked !== selectedUser.isLocked
          ? tempIsLocked ? "ACCOUNT_SUSPEND" : "ACCOUNT_UNLOCKED"
          : tempRole !== selectedUser.role ? "ROLE_CHANGE" : "ACCOUNT_UPDATE",
        `Role set to ${tempRole}. Locked: ${tempIsLocked ? "Yes (" + tempLockReason.trim() + ")" : "No"}.`,
        `${currentUser?.name || "Super Admin"} (Admin)`
      );
      setIsEditModalOpen(false);
      void refreshUsers();
      void refreshAuditLogs();
      showToast(`Successfully saved security changes for ${selectedUser.name}.`);
    } catch (err) {
      console.error("Failed to update user security in Supabase:", err);
      showToast("Security changes could not be saved. Please try again.");
    }
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
      const isHardBanned = u.restrictionType === "hard" || u.accountStatus === "Banned";
      const isSoftSuspended = u.isLocked && !isHardBanned;
      if (selectedStatusFilter === "Directory" && isHardBanned) return false;
      if (selectedStatusFilter === "Active" && (u.isLocked || isHardBanned)) return false;
      if (selectedStatusFilter === "SoftSuspended" && !isSoftSuspended) return false;
      if (selectedStatusFilter === "PermanentlyBanned" && !isHardBanned) return false;
      if (selectedStatusFilter === "AppealPending" && (!u.isLocked || !u.hasPendingAppeal)) return false;

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
      // Restricted users are always sorted to the bottom of the operational directory.
      const aHardBanned = a.restrictionType === "hard" || a.accountStatus === "Banned";
      const bHardBanned = b.restrictionType === "hard" || b.accountStatus === "Banned";
      if (aHardBanned && !bHardBanned) return 1;
      if (!aHardBanned && bHardBanned) return -1;
      if (a.isLocked && !b.isLocked) return 1;
      if (!a.isLocked && b.isLocked) return -1;
      return 0;
    });
  }, [users, selectedRoles, selectedStatusFilter, selectedVerificationStatuses, searchQuery, selectedLanguages, selectedCategories]);

  // Quick stats
  const totalUsersCount = users.length;
  const totalInterpretersCount = useMemo(() => users.filter((u) => u.role === "Interpreter").length, [users]);
  const lockedUsersCount = useMemo(
    () => users.filter((u) => u.isLocked && u.restrictionType !== "hard" && u.accountStatus !== "Banned").length,
    [users]
  );
  const hardBannedUsersCount = useMemo(
    () => users.filter((u) => u.restrictionType === "hard" || u.accountStatus === "Banned").length,
    [users]
  );
  
  // Reports stats
  const totalReportsCount = reports.length;
  const pendingReportsCount = useMemo(() => reports.filter((r) => r.status === "Escalated to Admin").length, [reports]);
  const resolvedReportsCount = useMemo(() => reports.filter((r) => r.status === "Resolved").length, [reports]);
  const dismissedReportsCount = useMemo(() => reports.filter((r) => r.status === "Dismissed").length, [reports]);

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
        setActiveTab={handleSetActiveTab}
        totalUsersCount={totalUsersCount}
        pendingReportsCount={pendingReportsCount}
        auditLogsCount={auditLogs.length}
        managerSection={managerSection}
        setManagerSection={handleSetManagerSection}
        {...managerCounts}
      />

      {/* 1. Full-Height Left Rail Bar (Continuous single block from top to bottom) */}
      <AdminRailBar
        onMenuClick={() => setIsMobileDrawerOpen((prev) => !prev)}
        activeTab={activeTab}
        setActiveTab={handleSetActiveTab}
        totalUsersCount={totalUsersCount}
        pendingReportsCount={pendingReportsCount}
        auditLogsCount={auditLogs.length}
        managerSection={managerSection}
        setManagerSection={handleSetManagerSection}
        {...managerCounts}
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
                onNavigateTab={handleSetActiveTab}
                onRefresh={async () => {
                  await refreshUsers();
                  await refreshAuditLogs();
                  showToast("Platform overview metrics refreshed from database.");
                }}
              />
            )}

            {/* TAB 1: ALL USERS & ROLES */}
            {activeTab === "users" && (
              <div className="flex flex-col gap-3 border-b border-slate-200 pb-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-[#092f45]">
                    User Directory
                  </h2>
                  <p className="mt-1 text-xs text-slate-500">Manage user access, staff roles, and account security.</p>
                </div>
                {currentUser?.adminLevel === "primary" && (
                  <button
                    type="button"
                    onClick={() => setIsStaffAccountModalOpen(true)}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#087f80] px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-[#076f70] focus:outline-none focus:ring-2 focus:ring-[#087f80]/30 focus:ring-offset-2"
                  >
                    <UserPlusIcon className="h-4 w-4" aria-hidden="true" />
                    Add Staff Account
                  </button>
                )}
              </div>
            )}

            {/* Header Interactive KPI Overview Cards for Users */}
            {activeTab === "users" && (
              <AdminKpiCards
                totalUsersCount={totalUsersCount}
                totalInterpretersCount={totalInterpretersCount}
                lockedUsersCount={lockedUsersCount}
                hardBannedUsersCount={hardBannedUsersCount}
                selectedStatusFilter={selectedStatusFilter}
                setSelectedStatusFilter={setSelectedStatusFilter}
                selectedRoles={selectedRoles}
                toggleRoleFilter={toggleRoleFilter}
                resetRoles={() => setSelectedRoles([])}
              />
            )}

            {/* TAB 2: REPORTS */}
            {activeTab === "reports" && (
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-slate-200">
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-[#092f45]">
                    System Reports
                  </h2>
                </div>
              </div>
            )}

            {/* Header Interactive KPI Overview Cards for Reports */}
            {activeTab === "reports" && (
              <ReportsKpiCards
                totalReportsCount={totalReportsCount}
                pendingReportsCount={pendingReportsCount}
                resolvedReportsCount={resolvedReportsCount}
                dismissedReportsCount={dismissedReportsCount}
                selectedStatusFilter={selectedReportStatusFilter}
                onSelectStatusFilter={setSelectedReportStatusFilter}
              />
            )}

            {activeTab === "reports" && reportsLoadError && (
              <div
                role="alert"
                className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-800"
              >
                <p className="font-bold">Reports could not be loaded from Supabase.</p>
                <p className="mt-1 break-words">{reportsLoadError}</p>
              </div>
            )}

            {activeTab === "users" && usersLoadError && (
              <div
                role="alert"
                className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-800"
              >
                <p className="font-bold">Users could not be loaded from Supabase.</p>
                <p className="mt-1 break-words">{usersLoadError}</p>
              </div>
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

            {/* TAB 2: SYSTEM REPORTS */}
            {activeTab === "reports" && (
              <EscalatedReportsTable
                reports={reports}
                onResolveSystemReport={handleResolveSystemReport}
                selectedStatusFilter={selectedReportStatusFilter}
                onSelectStatusFilter={setSelectedReportStatusFilter}
              />
            )}

            {/* TAB 3: IMMUTABLE AUDIT TRAIL LOGS */}
            {activeTab === "audit" && (
              auditLogsLoadError ? (
                <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-800">
                  <p className="font-bold">Audit trail could not be loaded from Supabase.</p>
                  <p className="mt-1 break-words">{auditLogsLoadError}</p>
                </div>
              ) : (
                <AuditTrailTable
                  auditLogs={auditLogs}
                  auditViewMode={auditViewMode}
                  setAuditViewMode={setAuditViewMode}
                />
              )
            )}

            {/* TAB 4: PLATFORM GOVERNANCE & POLICIES */}
            {activeTab === "policies" && (
              systemSettings ? (
                <PlatformPoliciesView
                  settings={systemSettings}
                  onSave={async (newSettings) => {
                    const result = await updateAdminPlatformSettingsAction(newSettings);
                    if (!result.success) {
                      showToast(`Platform policies could not be saved: ${result.error || "Unknown error"}`);
                      return;
                    }
                    setSystemSettings(newSettings);
                    await refreshAuditLogs();
                    showToast("Platform policies successfully updated and recorded in Audit Trail.");
                  }}
                />
              ) : (
                <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-800">
                  <p className="font-bold">Platform policies are not available from Supabase.</p>
                  <p className="mt-1 break-words">{systemSettingsLoadError || "The platform settings row has not been initialized."}</p>
                </div>
              )
            )}

            {activeTab === "manager-operations" && (
              <ManagerDashboard
                embedded
                embeddedUser={currentUser}
                embeddedNavSection={managerSection}
                onEmbeddedNavSectionChange={handleSetManagerSection}
                onEmbeddedCountsChange={handleManagerCountsChange}
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
        canManageSecurity={
          currentUser?.role === "Admin" &&
          (currentUser.adminLevel === "primary" || currentUser.adminLevel === "delegated")
        }
        isPrimaryAdmin={currentUser?.role === "Admin" && currentUser.adminLevel === "primary"}
        onGrantAdminAccess={handleGrantAdminAccess}
        onRevokeInterpreter={handleRevokeInterpreter}
        onDirectHardBan={(u) => handleOpenActionDialog(u)}
      />

      <RoleAssignmentAlertDialog
        isOpen={roleAssignmentAlert !== null}
        kind={roleAssignmentAlert || "no_approved_application"}
        onClose={() => setRoleAssignmentAlert(null)}
      />

      {/* Centered Modal: Account Action Dialog (Permanent Hard Ban with Strict Confirmation) */}
      <AccountActionDialog
        isOpen={isActionDialogOpen}
        user={actionTargetUser}
        onClose={() => {
          setIsActionDialogOpen(false);
          setActionTargetUser(null);
        }}
        onConfirmHardBan={handleConfirmHardBan}
      />

      <StaffAccountModal
        isOpen={isStaffAccountModalOpen}
        onClose={() => setIsStaffAccountModalOpen(false)}
        onSubmit={handleCreateManagerAccount}
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
