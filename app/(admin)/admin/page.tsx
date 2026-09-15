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
import { LoginModal } from "@/app/components/auth/login-modal";
import { getRedirectPathByRole } from "@/app/lib/mock-auth";
import { getCurrentUserProfile } from "@/app/lib/supabase-auth";
import { createClient } from "@/utils/supabase/client";
import type { UserProfile } from "@/app/lib/mock-auth";

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
  const [selectedRoles, setSelectedRoles] = useState<SystemRole[]>([]);
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<"All" | "Active" | "Locked">("All");
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [filterMenuOpen, setFilterMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Modal State
  const [selectedUser, setSelectedUser] = useState<AdminUserRecord | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [tempRole, setTempRole] = useState<SystemRole>("User");
  const [tempIsLocked, setTempIsLocked] = useState(false);
  const [tempLockReason, setTempLockReason] = useState("");
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

  // Filtered Users
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      if (selectedRoles.length > 0 && !selectedRoles.includes(u.role)) {
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
    }).sort((a, b) => {
      // Locked users are always sorted to the bottom of the table
      if (a.isLocked && !b.isLocked) return 1;
      if (!a.isLocked && b.isLocked) return -1;
      return 0;
    });
  }, [users, selectedRoles, selectedStatusFilter, searchQuery, selectedLanguages, selectedCategories]);

  // Filtered Interpreters (Active & Unlocked Only)
  const interpreterRanking = useMemo(() => {
    return users
      .filter((u) => {
        if (u.role !== "Interpreter" || !u.interpreterStats || u.isLocked) return false;
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
        totalUsersCount={totalUsersCount}
        totalInterpretersCount={totalInterpretersCount}
        auditLogsCount={auditLogs.length}
      />

      {/* 1. Full-Height Left Rail Bar (Continuous single block from top to bottom) */}
      <AdminRailBar
        onMenuClick={() => setIsMobileDrawerOpen((prev) => !prev)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        totalUsersCount={totalUsersCount}
        totalInterpretersCount={totalInterpretersCount}
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

        {/* Content Workspace Scroll Area */}
        <div className="flex-1 overflow-y-auto min-w-0 flex flex-col">
            <main className="flex-1 p-4 sm:p-6 md:p-8 space-y-5 sm:space-y-6">
              {/* Header KPI Summary Cards (Interactive Filter Shortcuts) */}
              <div className="grid grid-cols-2 gap-2.5 sm:gap-4 lg:grid-cols-4">
                {/* 1. Total Users (Reset All Filters) */}
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("users");
                    setSelectedRoles([]);
                    setSelectedStatusFilter("All");
                    setSelectedLanguages([]);
                    setSelectedCategories([]);
                    setSearchQuery("");
                  }}
                  className={`rounded-2xl border p-3.5 sm:p-5 text-left transition-all cursor-pointer ${
                    activeTab === "users" && selectedRoles.length === 0 && selectedStatusFilter === "All"
                      ? "border-[#087f80] bg-white shadow-md ring-2 ring-[#087f80]/20"
                      : "border-slate-200 bg-white shadow-xs hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
                  }`}
                  title="Click to view all users"
                >
                  <div className="flex items-center justify-between gap-1">
                    <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400 truncate">Total Users</p>
                    <div className="flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                      <UserGroupIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                    </div>
                  </div>
                  <p className="mt-1.5 sm:mt-2 text-2xl sm:text-3xl font-extrabold text-[#092f45]">{totalUsersCount}</p>
                  <p className="mt-0.5 sm:mt-1 text-[10px] sm:text-xs text-slate-500 truncate">All registered profiles</p>
                </button>

                {/* 2. Interpreters (Filter by Interpreter Role) */}
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("users");
                    setSelectedRoles(["Interpreter"]);
                    setSelectedStatusFilter("All");
                  }}
                  className={`rounded-2xl border p-3.5 sm:p-5 text-left transition-all cursor-pointer ${
                    activeTab === "users" && selectedRoles.length === 1 && selectedRoles[0] === "Interpreter"
                      ? "border-[#087f80] bg-[#edf7f5]/40 shadow-md ring-2 ring-[#087f80]/30"
                      : "border-slate-200 bg-white shadow-xs hover:-translate-y-0.5 hover:border-teal-300 hover:shadow-md"
                  }`}
                  title="Click to filter certified interpreters"
                >
                  <div className="flex items-center justify-between gap-1">
                    <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400 truncate">Interpreters</p>
                    <div className="flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-[#087f80]">
                      <CheckBadgeIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                    </div>
                  </div>
                  <p className="mt-1.5 sm:mt-2 text-2xl sm:text-3xl font-extrabold text-[#087f80]">{totalInterpretersCount}</p>
                  <p className="mt-0.5 sm:mt-1 text-[10px] sm:text-xs text-slate-500 truncate">Certified volunteers</p>
                </button>

                {/* 3. Suspended (Filter by Locked Status) */}
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("users");
                    setSelectedStatusFilter("Locked");
                    setSelectedRoles([]);
                  }}
                  className={`rounded-2xl border p-3.5 sm:p-5 text-left transition-all cursor-pointer ${
                    activeTab === "users" && selectedStatusFilter === "Locked"
                      ? "border-[#f04f3e] bg-red-50/40 shadow-md ring-2 ring-[#f04f3e]/30"
                      : "border-slate-200 bg-white shadow-xs hover:-translate-y-0.5 hover:border-red-300 hover:shadow-md"
                  }`}
                  title="Click to filter suspended accounts"
                >
                  <div className="flex items-center justify-between gap-1">
                    <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400 truncate">Suspended</p>
                    <div className="flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-lg bg-red-50 text-[#f04f3e]">
                      <LockClosedIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                    </div>
                  </div>
                  <p className="mt-1.5 sm:mt-2 text-2xl sm:text-3xl font-extrabold text-[#f04f3e]">{lockedUsersCount}</p>
                  <p className="mt-0.5 sm:mt-1 text-[10px] sm:text-xs text-slate-500 truncate">Restricted accounts</p>
                </button>

                {/* 4. Staff (Filter by Manager & Admin Roles) */}
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("users");
                    setSelectedRoles(["Manager", "Admin"]);
                    setSelectedStatusFilter("All");
                  }}
                  className={`rounded-2xl border p-3.5 sm:p-5 text-left transition-all cursor-pointer ${
                    activeTab === "users" && selectedRoles.includes("Manager") && selectedRoles.includes("Admin")
                      ? "border-purple-600 bg-purple-50/40 shadow-md ring-2 ring-purple-600/30"
                      : "border-slate-200 bg-white shadow-xs hover:-translate-y-0.5 hover:border-purple-300 hover:shadow-md"
                  }`}
                  title="Click to filter staff (Managers & Admins)"
                >
                  <div className="flex items-center justify-between gap-1">
                    <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400 truncate">Staff</p>
                    <div className="flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
                      <KeyIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                    </div>
                  </div>
                  <p className="mt-1.5 sm:mt-2 text-2xl sm:text-3xl font-extrabold text-purple-700">{totalAdminsCount}</p>
                  <p className="mt-0.5 sm:mt-1 text-[10px] sm:text-xs text-slate-500 truncate">Managers & Admins</p>
                </button>
              </div>

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
