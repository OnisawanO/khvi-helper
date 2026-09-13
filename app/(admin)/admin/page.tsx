"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import {
  CheckBadgeIcon,
  CheckCircleIcon,
  KeyIcon,
  LockClosedIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";
import { SiteFooter } from "@/app/components/site-footer";
import { LoginModal } from "@/app/components/auth/login-modal";
import {
  clearMockUserSession,
  getMockUserSession,
  getRedirectPathByRole,
  UserProfile,
  DEFAULT_MOCK_USERS,
} from "@/app/lib/mock-auth";

import { AdminActiveTab, AdminUserRecord, AuditLogEntry, SystemRole } from "./types";
import { initialUsers, initialAuditLogs } from "./mock-data";
import { AdminHeader } from "./components/admin-header";
import { AdminDrawer } from "./components/admin-drawer";
import { AdminRailBar } from "./components/admin-rail-bar";
import { UserEditModal } from "./components/user-edit-modal";
import { UsersTable } from "./components/users-table";
import { InterpretersTable } from "./components/interpreters-table";
import { AuditTrailTable } from "./components/audit-trail-table";

export default function AdminPage() {
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);
  const [activeTab, setActiveTab] = useState<AdminActiveTab>("users");
  const [auditViewMode, setAuditViewMode] = useState<"table" | "activity">("table");
  const [users, setUsers] = useState<AdminUserRecord[]>(initialUsers);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(initialAuditLogs);

  // Filters
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<SystemRole | "All">("All");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<"All" | "Active" | "Locked">("All");
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Modal State
  const [selectedUser, setSelectedUser] = useState<AdminUserRecord | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [tempRole, setTempRole] = useState<SystemRole>("User");
  const [tempIsLocked, setTempIsLocked] = useState(false);
  const [tempLockReason, setTempLockReason] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [currentUser, setCurrentUser] = useState<UserProfile | null>(
    DEFAULT_MOCK_USERS.Admin
  );
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  useEffect(() => {
    const session = getMockUserSession();

    if (session?.role !== "Admin") {
      router.replace(session ? getRedirectPathByRole(session.role) : "/#top");
      return;
    }

    queueMicrotask(() => {
      setCurrentUser(session);
      setAuthChecked(true);
    });
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

  const handleSaveUserChanges = () => {
    if (!selectedUser) return;

    // Security Business Rule: Admin accounts cannot be suspended or locked
    if (tempRole === "Admin" && tempIsLocked) {
      alert("บัญชีระดับผู้ดูแลระบบ (Admin) ไม่สามารถถูกระงับหรือล็อกบัญชีได้ เพื่อความปลอดภัยและความต่อเนื่องในการจัดการระบบ");
      return;
    }

    // Validation
    if (tempIsLocked && !tempLockReason.trim()) {
      alert("กรุณาระบุเหตุผลในการระงับหรือล็อกบัญชีนี้ (Required for security audit)");
      return;
    }

    const updatedUsers = users.map((u) => {
      if (u.id === selectedUser.id) {
        return {
          ...u,
          role: tempRole,
          isLocked: tempRole === "Admin" ? false : tempIsLocked,
          lockReason: tempRole === "Admin" ? undefined : tempIsLocked ? tempLockReason.trim() : undefined,
        };
      }
      return u;
    });

    setUsers(updatedUsers);

    // Add Audit Log
    const newLog: AuditLogEntry = {
      id: `AUD-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toISOString().replace("T", " ").slice(0, 19),
      actor: `${currentUser?.name || "Ilham Khamsikeaw"} (Admin)`,
      action:
        tempIsLocked !== selectedUser.isLocked
          ? tempIsLocked
            ? "ACCOUNT_SUSPEND"
            : "ACCOUNT_UNLOCKED"
          : tempRole !== selectedUser.role
          ? "ROLE_CHANGE"
          : "ACCOUNT_UPDATE",
      targetUser: `${selectedUser.name} (${selectedUser.id})`,
      severity: tempIsLocked ? "danger" : tempRole === "Admin" ? "warning" : "info",
      details: `Role set to ${tempRole}. Locked: ${tempIsLocked ? "Yes (" + tempLockReason.trim() + ")" : "No"}.`,
    };

    setAuditLogs([newLog, ...auditLogs]);
    setIsEditModalOpen(false);
    showToast(`อัปเดตข้อมูลและสิทธิ์ของ ${selectedUser.name} สำเร็จแล้ว พร้อมบันทึก Audit Log`);
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

  // Filtered Users
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      if (selectedRoleFilter !== "All" && u.role !== selectedRoleFilter) {
        return false;
      }
      if (selectedStatusFilter === "Active" && u.isLocked) return false;
      if (selectedStatusFilter === "Locked" && !u.isLocked) return false;

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
    });
  }, [users, selectedRoleFilter, selectedStatusFilter, searchQuery, selectedLanguages, selectedCategories]);

  // Filtered Interpreters
  const interpreterRanking = useMemo(() => {
    return users
      .filter((u) => {
        if (u.role !== "Interpreter" || !u.interpreterStats) return false;
        if (selectedLanguages.length > 0) {
          const userLangs = [u.primaryLanguage, ...u.spokenLanguages];
          const hasAny = selectedLanguages.some((l) => userLangs.includes(l));
          if (!hasAny) return false;
        }
        if (selectedCategories.length > 0) {
          const hasCat = selectedCategories.some((c) => u.interpreterStats?.specialties.includes(c));
          if (!hasCat) return false;
        }
        return true;
      })
      .sort((a, b) => (b.interpreterStats?.rating || 0) - (a.interpreterStats?.rating || 0));
  }, [users, selectedLanguages, selectedCategories]);

  // Quick stats
  const totalUsersCount = users.length;
  const totalInterpretersCount = useMemo(() => users.filter((u) => u.role === "Interpreter").length, [users]);
  const lockedUsersCount = useMemo(() => users.filter((u) => u.isLocked).length, [users]);
  const totalAdminsCount = useMemo(() => users.filter((u) => u.role === "Admin" || u.role === "Manager").length, [users]);

  if (!authChecked) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7f9fa] text-[#092f45]" aria-busy="true">
        <p role="status" className="text-sm font-bold">Checking admin session…</p>
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
        selectedStatusFilter={selectedStatusFilter}
        setSelectedStatusFilter={setSelectedStatusFilter}
        totalUsersCount={totalUsersCount}
        lockedUsersCount={lockedUsersCount}
        totalInterpretersCount={totalInterpretersCount}
        auditLogsCount={auditLogs.length}
      />

      {/* 1. Full-Height Left Rail Bar (Continuous single block from top to bottom) */}
      <AdminRailBar
        onMenuClick={() => setIsMobileDrawerOpen((prev) => !prev)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedStatusFilter={selectedStatusFilter}
        setSelectedStatusFilter={setSelectedStatusFilter}
        totalUsersCount={totalUsersCount}
        lockedUsersCount={lockedUsersCount}
        totalInterpretersCount={totalInterpretersCount}
        auditLogsCount={auditLogs.length}
      />

      {/* 2. Main Right Container: Header + Content Workspace + Footer */}
      <div className="flex flex-1 flex-col h-full overflow-hidden min-w-0">
        {/* Global Top Header */}
        <AdminHeader
          onMenuClick={() => setIsMobileDrawerOpen((prev) => !prev)}
          onSignOut={() => {
            clearMockUserSession();
            setAuthChecked(false);
            router.replace("/#top");
          }}
          onChangeAccount={() => setIsLoginModalOpen(true)}
          currentUser={currentUser}
        />

        {/* Content Workspace Scroll Area */}
        <div className="flex-1 overflow-y-auto min-w-0 flex flex-col">
            <main className="flex-1 p-4 sm:p-6 md:p-8 space-y-5 sm:space-y-6">
              {/* Header KPI Summary Cards */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-md">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total System Users</p>
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                      <UserGroupIcon className="h-5 w-5" />
                    </div>
                  </div>
                  <p className="mt-2 text-3xl font-extrabold text-[#092f45]">{totalUsersCount}</p>
                  <p className="mt-1 text-xs text-slate-500">All registered profiles across roles</p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-md">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Active Interpreters</p>
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-50 text-[#087f80]">
                      <CheckBadgeIcon className="h-5 w-5" />
                    </div>
                  </div>
                  <p className="mt-2 text-3xl font-extrabold text-[#087f80]">{totalInterpretersCount}</p>
                  <p className="mt-1 text-xs text-slate-500">Certified volunteer translators</p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-md">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Suspended / Locked</p>
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-[#f04f3e]">
                      <LockClosedIcon className="h-5 w-5" />
                    </div>
                  </div>
                  <p className="mt-2 text-3xl font-extrabold text-[#f04f3e]">{lockedUsersCount}</p>
                  <p className="mt-1 text-xs text-slate-500">Accounts restricted by admin</p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-md">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Privileged Staff</p>
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
                      <KeyIcon className="h-5 w-5" />
                    </div>
                  </div>
                  <p className="mt-2 text-3xl font-extrabold text-purple-700">{totalAdminsCount}</p>
                  <p className="mt-1 text-xs text-slate-500">Managers & Backoffice Admins</p>
                </div>
              </div>

              {/* TAB 1: ALL USERS & ROLES */}
              {activeTab === "users" && (
                <UsersTable
                  users={filteredUsers}
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  selectedRoleFilter={selectedRoleFilter}
                  setSelectedRoleFilter={setSelectedRoleFilter}
                  selectedStatusFilter={selectedStatusFilter}
                  setSelectedStatusFilter={setSelectedStatusFilter}
                  selectedLanguages={selectedLanguages}
                  toggleLanguageFilter={toggleLanguageFilter}
                  resetLanguages={() => setSelectedLanguages([])}
                  isLanguageDropdownOpen={isLanguageDropdownOpen}
                  setIsLanguageDropdownOpen={setIsLanguageDropdownOpen}
                  selectedCategories={selectedCategories}
                  toggleCategoryFilter={toggleCategoryFilter}
                  resetCategories={() => setSelectedCategories([])}
                  isCategoryDropdownOpen={isCategoryDropdownOpen}
                  setIsCategoryDropdownOpen={setIsCategoryDropdownOpen}
                  onSelectUser={handleOpenUserDetail}
                />
              )}

              {/* TAB 2: INTERPRETER RANKING & QUALITY INDEX */}
              {activeTab === "interpreters" && (
                <InterpretersTable
                  interpreters={interpreterRanking}
                  onSelectUser={handleOpenUserDetail}
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
            </main>

            {/* Global Footer inside right column */}
            <SiteFooter
              copy={{
                description: "KHVI Central Administration & Security Console for Super Admins and Root Operators.",
                note: "Internal Backoffice Governance Node",
                explore: "Admin System",
                safety: "Security Policies",
                needHelp: "Infrastructure Help",
                needHelpBody: "For database or auth infrastructure emergency escalation, contact the DevSecOps on-call lead.",
                footerCta: "Export System Logs",
                privacy: "All administrative operations, role reassignments, and account state modifications are logged under immutable audit trails.",
                links: {
                  map: "System Overview",
                  how: "RBAC Matrix",
                  roles: "Access Control",
                  privacy: "Data Protection & PDPA",
                  request: "Incident Response",
                  signIn: "Switch Account",
                },
              }}
              brandSubtitle="Admin Console"
            />
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
