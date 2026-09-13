"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import {
  ArrowLeftOnRectangleIcon,
  Bars3Icon,
  CheckBadgeIcon,
  CheckCircleIcon,
  ChevronDownIcon,
  DocumentCheckIcon,
  DocumentMagnifyingGlassIcon,
  KeyIcon,
  LanguageIcon,
  LockClosedIcon,
  ShieldCheckIcon,
  SparklesIcon,
  StarIcon,
  TagIcon,
  UserCircleIcon,
  UserGroupIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { BrandMark } from "@/app/components/brand-mark";
import { SiteFooter } from "@/app/components/site-footer";
import { clearMockUserSession, getMockUserSession, getRedirectPathByRole } from "@/app/lib/mock-auth";

export type SystemRole = "User" | "Interpreter" | "Manager" | "Admin";

export type AdminUserRecord = {
  id: string;
  name: string;
  email: string;
  phone: string;
  primaryLanguage: string;
  spokenLanguages: string[];
  role: SystemRole;
  isLocked: boolean;
  lockReason?: string;
  registeredAt: string;
  lastActive: string;
  // Interpreter specific fields if role === 'Interpreter'
  interpreterStats?: {
    verificationStatus: "Approved" | "Pending" | "Under Review" | "Suspended";
    completedMissions: number;
    rating: number; // e.g. 4.9
    specialties: string[];
    responseTimeAvg: string; // e.g. '2.4 mins'
    feedbackHighlights: string[];
  };
};

export type AuditLogEntry = {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  targetUser: string;
  severity: "info" | "warning" | "danger";
  details: string;
};

const initialUsers: AdminUserRecord[] = [
  {
    id: "USR-001",
    name: "Ilham Khamsikeaw",
    email: "ilham@gmail.com",
    phone: "011-110-1100",
    primaryLanguage: "Thai",
    spokenLanguages: ["Thai", "English"],
    role: "Admin",
    isLocked: false,
    registeredAt: "2026-08-01 09:00",
    lastActive: "Just now",
  },
  {
    id: "USR-002",
    name: "Taofix yayueri",
    email: "tyayuxri@gmail.com",
    phone: "089-112-3344",
    primaryLanguage: "Thai",
    spokenLanguages: ["Thai", "English", "Japanese"],
    role: "Manager",
    isLocked: false,
    registeredAt: "2026-08-10 14:15",
    lastActive: "10 mins ago",
  },
  {
    id: "USR-003",
    name: "Pakorn Hnusawang",
    email: "pakorn@gmail.com",
    phone: "081-234-5678",
    primaryLanguage: "Thai",
    spokenLanguages: ["Thai", "English", "Mandarin Chinese"],
    role: "Interpreter",
    isLocked: false,
    registeredAt: "2026-08-15 11:20",
    lastActive: "15 mins ago",
    interpreterStats: {
      verificationStatus: "Approved",
      completedMissions: 48,
      rating: 4.95,
      specialties: ["Medical", "Emergency", "Tourism"],
      responseTimeAvg: "1.8 mins",
      feedbackHighlights: [
        "Extremely swift arrival at hospital ER.",
        "Calm, fluent medical translation during surgery intake.",
      ],
    },
  },
  {
    id: "USR-004",
    name: "Lin Wei Chen",
    email: "linwei.c@interpreter.tw",
    phone: "092-987-6543",
    primaryLanguage: "Mandarin Chinese",
    spokenLanguages: ["Mandarin Chinese", "English", "Thai (Conversational)"],
    role: "Interpreter",
    isLocked: false,
    registeredAt: "2026-08-20 16:30",
    lastActive: "1 hour ago",
    interpreterStats: {
      verificationStatus: "Approved",
      completedMissions: 34,
      rating: 4.88,
      specialties: ["Police station", "Legal Documentation", "Immigration"],
      responseTimeAvg: "2.5 mins",
      feedbackHighlights: [
        "Handled difficult police statement translation flawlessly.",
        "Very patient with elderly tourists.",
      ],
    },
  },
  {
    id: "USR-005",
    name: "John Alexander Smith",
    email: "john.smith@uktraveler.co.uk",
    phone: "+44-7700-900077",
    primaryLanguage: "English",
    spokenLanguages: ["English", "French"],
    role: "User",
    isLocked: false,
    registeredAt: "2026-09-01 10:05",
    lastActive: "2 hours ago",
  },
  {
    id: "USR-006",
    name: "Aisha Tanaka",
    email: "aisha.tanaka@tokyomail.jp",
    phone: "086-555-7788",
    primaryLanguage: "Japanese",
    spokenLanguages: ["Japanese", "English", "Thai"],
    role: "Interpreter",
    isLocked: false,
    registeredAt: "2026-08-25 13:40",
    lastActive: "30 mins ago",
    interpreterStats: {
      verificationStatus: "Approved",
      completedMissions: 29,
      rating: 4.92,
      specialties: ["Hospital", "Consular Support", "General Help"],
      responseTimeAvg: "2.1 mins",
      feedbackHighlights: [
        "Supported pregnant tourist in labor ward with utmost empathy.",
      ],
    },
  },
  {
    id: "USR-007",
    name: "Markus Schneider",
    email: "markus.s@deutschland.de",
    phone: "+49-151-555234",
    primaryLanguage: "German",
    spokenLanguages: ["German", "English"],
    role: "User",
    isLocked: true,
    lockReason: "Multiple false SOS distress alerts reported by emergency services",
    registeredAt: "2026-09-02 08:12",
    lastActive: "1 day ago",
  },
  {
    id: "USR-008",
    name: "Chatchai Charoenrat",
    email: "chatchai.c@khvi-support.org",
    phone: "083-444-9988",
    primaryLanguage: "Thai",
    spokenLanguages: ["Thai", "English"],
    role: "Manager",
    isLocked: false,
    registeredAt: "2026-08-18 10:00",
    lastActive: "4 hours ago",
  },
];

const initialAuditLogs: AuditLogEntry[] = [
  {
    id: "AUD-901",
    timestamp: "2026-09-08 11:45:10",
    actor: "Ilham Khamsikeaw (Admin)",
    action: "ACCOUNT_SUSPEND",
    targetUser: "Markus Schneider (USR-007)",
    severity: "danger",
    details: "Suspended account due to repeated false alarms triggering volunteer dispatch.",
  },
  {
    id: "AUD-902",
    timestamp: "2026-09-08 10:15:32",
    actor: "Kornkanok Wongsuwan (Manager)",
    action: "VOLUNTEER_APPROVE",
    targetUser: "Lin Wei Chen (USR-004)",
    severity: "info",
    details: "Verified police & legal interpreter credentials. Promoted to Active Interpreter tier.",
  },
  {
    id: "AUD-903",
    timestamp: "2026-09-08 09:30:18",
    actor: "Ilham Khamsikeaw (Admin)",
    action: "ROLE_CHANGE",
    targetUser: "Chatchai Charoenrat (USR-008)",
    severity: "warning",
    details: "Promoted from User to Manager role for Bangkok Metropolitan operations.",
  },
  {
    id: "AUD-904",
    timestamp: "2026-09-07 17:20:00",
    actor: "System Engine",
    action: "QUALITY_METRIC_RECALCULATE",
    targetUser: "All Interpreters",
    severity: "info",
    details: "Automated monthly interpreter rating and mission response time indexing executed.",
  },
];

const AVAILABLE_LANGUAGES = [
  "Thai",
  "English",
  "Mandarin Chinese",
  "Japanese",
  "German",
  "French",
  "Spanish",
  "Korean",
  "Russian",
  "Arabic",
];

const AVAILABLE_CATEGORIES = [
  "Medical",
  "Emergency",
  "Tourism",
  "Police station",
  "Legal Documentation",
  "Immigration",
  "Hospital",
  "Consular Support",
  "General Help",
];

function AdminHeader({ onMenuClick, onSignOut }: { onMenuClick?: () => void; onSignOut: () => void }) {
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (!profileMenuRef.current?.contains(event.target as Node)) {
        setProfileMenuOpen(false);
      }
    };
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  return (
    <header className="sticky top-0 z-30 border-b border-[#dbe3e7] bg-[#fbfdfc]/95 shadow-[0_8px_24px_rgba(21,52,67,0.06)] backdrop-blur">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-3 px-4 py-3 sm:px-8 lg:px-12">
        {/* Brand & Mobile Drawer Button */}
        <div className="flex items-center gap-3 sm:gap-6">
          <button
            type="button"
            onClick={onMenuClick}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#c9d8de] bg-white text-[#092f45] shadow-xs hover:border-[#087f80] hover:bg-[#edf7f5] hover:text-[#087f80] transition-colors md:hidden focus:outline-none focus:ring-2 focus:ring-[#087f80]/30"
            aria-label="Open Navigation Menu"
          >
            <Bars3Icon className="h-5 w-5" />
          </button>
          <BrandMark subtitle="Community interpreter map" />
        </div>

        {/* Navigation / Actions */}
        <div className="flex items-center gap-3">
          {/* Quick Stats Pill */}
          

          {/* Profile Section with Ilham Khamsikeaw */}
          <div ref={profileMenuRef} className="relative">
            <button
              type="button"
              onClick={() => setProfileMenuOpen((prev) => !prev)}
              className="flex items-center gap-2.5 rounded-lg border border-[#c9d8de] bg-white px-3 py-1.5 shadow-sm transition-all hover:border-[#087f80] hover:bg-[#edf7f5] focus:outline-none focus:ring-2 focus:ring-[#087f80]/30"
              aria-expanded={profileMenuOpen}
              aria-haspopup="menu"
            >
              <div className="relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border border-[#087f80] bg-[#092f45] text-xs font-extrabold text-white">
                IK
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-xs font-extrabold leading-tight text-[#10283a]">Ilham Khamsikeaw</p>
                <p className="text-[11px] font-semibold text-[#087f80]">Super Admin</p>
              </div>
              <ChevronDownIcon
                className={`h-4 w-4 text-[#5e7783] transition-transform ${
                  profileMenuOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Profile Dropdown Menu */}
            {profileMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 rounded-xl border border-[#d6e0e4] bg-white p-2 shadow-[0_18px_36px_rgba(19,52,68,0.16)] animate-in fade-in zoom-in-95">
                <div className="border-b border-[#eef3f5] px-3 py-2.5">
                  <p className="text-sm font-extrabold text-[#153447]">Ilham Khamsikeaw</p>
                  <p className="text-xs text-[#6a808a]">ilham.k@khvi-admin.org</p>
                  <span className="mt-2 inline-flex items-center gap-1 rounded-md bg-[#e6f4ef] px-2 py-0.5 text-[11px] font-bold text-[#087557]">
                    <CheckBadgeIcon className="h-3.5 w-3.5" />
                    Authorized Root Admin
                  </span>
                </div>
                <div className="py-1">
                  <Link
                    href="#profile"
                    onClick={() => setProfileMenuOpen(false)}
                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-bold text-[#2d4957] transition-colors hover:bg-[#f2f7f9] hover:text-[#087f80]"
                  >
                    <UserCircleIcon className="h-4 w-4" />
                    Admin Profile & Settings
                  </Link>
                  <Link
                    href="#audit-log"
                    onClick={() => setProfileMenuOpen(false)}
                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-bold text-[#2d4957] transition-colors hover:bg-[#f2f7f9] hover:text-[#087f80]"
                  >
                    <DocumentCheckIcon className="h-4 w-4" />
                    Audit Log
                  </Link>
                </div>
                <div className="border-t border-[#eef3f5] pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setProfileMenuOpen(false);
                      onSignOut();
                    }}
                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-bold text-[#d93829] transition-colors hover:bg-[#fff2f0]"
                  >
                    <ArrowLeftOnRectangleIcon className="h-4 w-4" />
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default function AdminPage() {
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);
  const [activeTab, setActiveTab] = useState<"users" | "interpreters" | "audit">("users");
  const [users, setUsers] = useState<AdminUserRecord[]>(initialUsers);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(initialAuditLogs);

  // Filters
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<SystemRole | "All">("All");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<"All" | "Active" | "Locked">("All");
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);
  const languageDropdownRef = useRef<HTMLDivElement>(null);

  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const categoryDropdownRef = useRef<HTMLDivElement>(null);

  // Search
  const [searchQuery, setSearchQuery] = useState("");

  // Modal State
  const [selectedUser, setSelectedUser] = useState<AdminUserRecord | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [tempRole, setTempRole] = useState<SystemRole>("User");
  const [tempIsLocked, setTempIsLocked] = useState(false);
  const [tempLockReason, setTempLockReason] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Click outside multi-select dropdowns
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        languageDropdownRef.current &&
        !languageDropdownRef.current.contains(event.target as Node)
      ) {
        setIsLanguageDropdownOpen(false);
      }
      if (
        categoryDropdownRef.current &&
        !categoryDropdownRef.current.contains(event.target as Node)
      ) {
        setIsCategoryDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const session = getMockUserSession();

    if (session?.role !== "Admin") {
      router.replace(session ? getRedirectPathByRole(session.role) : "/#top");
      return;
    }

    queueMicrotask(() => setAuthChecked(true));
  }, [router]);

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
          isLocked: tempIsLocked,
          lockReason: tempIsLocked ? tempLockReason.trim() : undefined,
        };
      }
      return u;
    });

    setUsers(updatedUsers);

    // Add Audit Log
    const newLog: AuditLogEntry = {
      id: `AUD-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toISOString().replace("T", " ").slice(0, 19),
      actor: "Ilham Khamsikeaw (Admin)",
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
    if (selectedLanguages.includes(lang)) {
      setSelectedLanguages(selectedLanguages.filter((l) => l !== lang));
    } else {
      setSelectedLanguages([...selectedLanguages, lang]);
    }
  };

  const toggleCategoryFilter = (cat: string) => {
    if (selectedCategories.includes(cat)) {
      setSelectedCategories(selectedCategories.filter((c) => c !== cat));
    } else {
      setSelectedCategories([...selectedCategories, cat]);
    }
  };

  // Filtered Users
  const filteredUsers = users.filter((u) => {
    // Role filter
    if (selectedRoleFilter !== "All" && u.role !== selectedRoleFilter) {
      return false;
    }
    // Status filter
    if (selectedStatusFilter === "Active" && u.isLocked) return false;
    if (selectedStatusFilter === "Locked" && !u.isLocked) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = u.name.toLowerCase().includes(q);
      const matchEmail = u.email.toLowerCase().includes(q);
      const matchId = u.id.toLowerCase().includes(q);
      const matchPhone = u.phone.includes(q);
      if (!matchName && !matchEmail && !matchId && !matchPhone) return false;
    }

    // Language filter (checks primaryLanguage or any spokenLanguages)
    if (selectedLanguages.length > 0) {
      const userLangs = [u.primaryLanguage, ...u.spokenLanguages];
      const hasAny = selectedLanguages.some((l) => userLangs.includes(l));
      if (!hasAny) return false;
    }

    // Category filter (checks interpreter specialties)
    if (selectedCategories.length > 0) {
      if (!u.interpreterStats) return false;
      const hasCat = selectedCategories.some((c) => u.interpreterStats?.specialties.includes(c));
      if (!hasCat) return false;
    }

    return true;
  });

  // Filtered Interpreters
  const interpreterRanking = users
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

  // Quick stats
  const totalUsersCount = users.length;
  const totalInterpretersCount = users.filter((u) => u.role === "Interpreter").length;
  const lockedUsersCount = users.filter((u) => u.isLocked).length;
  const totalAdminsCount = users.filter((u) => u.role === "Admin" || u.role === "Manager").length;

  if (!authChecked) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7f9fa] text-[#092f45]" aria-busy="true">
        <p role="status" className="text-sm font-bold">Checking admin session…</p>
      </main>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#f7f9fa] text-[#092f45] antialiased">
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

      {/* Top Header with Hamburger for Mobile Drawer */}
      <AdminHeader
        onMenuClick={() => setIsMobileDrawerOpen(true)}
        onSignOut={() => {
          clearMockUserSession();
          setAuthChecked(false);
          router.replace("/#top");
        }}
      />

      {/* Mobile Slide-out Sidebar Drawer (Pop-up from left) */}
      {isMobileDrawerOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden animate-in fade-in duration-200">
          {/* Backdrop overlay */}
          <div
            onClick={() => setIsMobileDrawerOpen(false)}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
          />

          {/* Drawer content sliding from left */}
          <aside className="relative z-10 flex h-full w-[80%] max-w-xs flex-col justify-between bg-white p-5 shadow-2xl animate-in slide-in-from-left duration-250 border-r border-slate-200">
            <div className="space-y-6">
              {/* Drawer Top Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#092f45] text-white">
                    <ShieldCheckIcon className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-extrabold text-[#092f45]">Admin Console</h3>
                    <p className="text-[10px] text-slate-400">Navigation Menu</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsMobileDrawerOpen(false)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                  aria-label="Close menu"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>

              {/* Navigation Links */}
              <div>
                <p className="px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">Main Administration</p>
                <nav className="mt-2 space-y-1.5">
                  <button
                    onClick={() => {
                      setActiveTab("users");
                      setIsMobileDrawerOpen(false);
                    }}
                    className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-bold transition-all ${
                      activeTab === "users"
                        ? "bg-[#087f80] text-white shadow-md shadow-[#087f80]/20"
                        : "text-slate-600 hover:bg-slate-100 hover:text-[#092f45]"
                    }`}
                  >
                    <UserGroupIcon className="h-4 w-4" />
                    <span>All Users & Roles</span>
                    <span
                      className={`ml-auto rounded-full px-2 py-0.5 text-[10px] font-extrabold ${
                        activeTab === "users" ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {totalUsersCount}
                    </span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab("interpreters");
                      setIsMobileDrawerOpen(false);
                    }}
                    className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-bold transition-all ${
                      activeTab === "interpreters"
                        ? "bg-[#087f80] text-white shadow-md shadow-[#087f80]/20"
                        : "text-slate-600 hover:bg-slate-100 hover:text-[#092f45]"
                    }`}
                  >
                    <SparklesIcon className="h-4 w-4" />
                    <span>Interpreter Index</span>
                    <span
                      className={`ml-auto rounded-full px-2 py-0.5 text-[10px] font-extrabold ${
                        activeTab === "interpreters" ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {totalInterpretersCount}
                    </span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab("audit");
                      setIsMobileDrawerOpen(false);
                    }}
                    className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-bold transition-all ${
                      activeTab === "audit"
                        ? "bg-[#087f80] text-white shadow-md shadow-[#087f80]/20"
                        : "text-slate-600 hover:bg-slate-100 hover:text-[#092f45]"
                    }`}
                  >
                    <DocumentMagnifyingGlassIcon className="h-4 w-4" />
                    <span>Audit Trail</span>
                    <span
                      className={`ml-auto rounded-full px-2 py-0.5 text-[10px] font-extrabold ${
                        activeTab === "audit" ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {auditLogs.length}
                    </span>
                  </button>
                </nav>
              </div>

              {/* Recent Security Activity in Mobile Drawer */}
              <div>
                <div className="flex items-center justify-between px-2">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Recent Security Activity</p>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab("audit");
                      setIsMobileDrawerOpen(false);
                    }}
                    className="text-[10px] font-bold text-[#087f80] hover:underline"
                  >
                    View All
                  </button>
                </div>

                <div className="mt-2 space-y-2">
                  {auditLogs.slice(0, 3).map((log) => (
                    <div
                      key={log.id}
                      className="rounded-xl border border-slate-200/80 bg-slate-50 p-2.5 text-[11px] transition-colors hover:bg-slate-100/70"
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span
                          className={`rounded px-1.5 py-0.2 text-[9px] font-extrabold uppercase ${
                            log.severity === "danger"
                              ? "bg-red-100 text-[#f04f3e]"
                              : log.severity === "warning"
                              ? "bg-amber-100 text-amber-700"
                              : "bg-teal-100 text-[#087f80]"
                          }`}
                        >
                          {log.action}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {log.timestamp.slice(11, 16)}
                        </span>
                      </div>
                      <p className="mt-1 font-bold text-slate-700 truncate text-[11px]">{log.targetUser}</p>
                      <p className="text-[10px] text-slate-500 line-clamp-2 leading-tight mt-0.5">
                        {log.details}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Environment Info */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-500">
              <p className="font-semibold text-slate-700 text-[11px]">Environment: Production</p>
              <p className="text-[10px]">KHVI Node: BKK-CORE-01</p>
              <p className="text-[10px]">Compliance: PDPA / ISO 27001</p>
            </div>
          </aside>
        </div>
      )}

      {/* Body Container: Sidebar (Desktop) + Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden md:flex-row">
        {/* Left Sidebar (Desktop only) */}
        <aside className="hidden w-64 flex-shrink-0 border-r border-slate-200 bg-white p-4 md:flex md:flex-col justify-between">
          <div className="space-y-6">
            <div>
              <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">Main Administration</p>
              <nav className="mt-2 space-y-1">
                <button
                  onClick={() => setActiveTab("users")}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-all ${
                    activeTab === "users"
                      ? "bg-[#087f80] text-white shadow-md shadow-[#087f80]/20"
                      : "text-slate-600 hover:bg-slate-100 hover:text-[#092f45]"
                  }`}
                >
                  <UserGroupIcon className="h-5 w-5" />
                  <span>All User & Roles</span>
                  <span
                    className={`ml-auto rounded-full px-2 py-0.5 text-xs font-bold ${
                      activeTab === "users" ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {totalUsersCount}
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab("interpreters")}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-all ${
                    activeTab === "interpreters"
                      ? "bg-[#087f80] text-white shadow-md shadow-[#087f80]/20"
                      : "text-slate-600 hover:bg-slate-100 hover:text-[#092f45]"
                  }`}
                >
                  <SparklesIcon className="h-5 w-5" />
                  <span>Interpreter Index</span>
                  <span
                    className={`ml-auto rounded-full px-2 py-0.5 text-xs font-bold ${
                      activeTab === "interpreters" ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {totalInterpretersCount}
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab("audit")}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-all ${
                    activeTab === "audit"
                      ? "bg-[#087f80] text-white shadow-md shadow-[#087f80]/20"
                      : "text-slate-600 hover:bg-slate-100 hover:text-[#092f45]"
                  }`}
                >
                  <DocumentMagnifyingGlassIcon className="h-5 w-5" />
                  <span>Audit Trail</span>
                  <span
                    className={`ml-auto rounded-full px-2 py-0.5 text-xs font-bold ${
                      activeTab === "audit" ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {auditLogs.length}
                  </span>
                </button>
              </nav>
            </div>

            <div>
              <div className="flex items-center justify-between px-3">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Recent Security Activity</p>
                <button
                  type="button"
                  onClick={() => setActiveTab("audit")}
                  className="text-[10px] font-bold text-[#087f80] hover:underline"
                >
                  View All
                </button>
              </div>

              <div className="mt-2 space-y-2">
                {auditLogs.slice(0, 3).map((log) => (
                  <div
                    key={log.id}
                    className="rounded-xl border border-slate-200/80 bg-slate-50 p-2.5 text-xs transition-colors hover:bg-slate-100/70"
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span
                        className={`rounded px-1.5 py-0.2 text-[9px] font-extrabold uppercase ${
                          log.severity === "danger"
                            ? "bg-red-100 text-[#f04f3e]"
                            : log.severity === "warning"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-teal-100 text-[#087f80]"
                        }`}
                      >
                        {log.action}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {log.timestamp.slice(11, 16)}
                      </span>
                    </div>
                    <p className="mt-1 font-bold text-slate-700 truncate text-[11px]">{log.targetUser}</p>
                    <p className="text-[10px] text-slate-500 line-clamp-2 leading-tight mt-0.5">
                      {log.details}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-500">
            <p className="font-semibold text-slate-700">Environment: Production</p>
            <p className="text-[11px]">KHVI Node: BKK-CORE-01</p>
            <p className="text-[11px]">Compliance: PDPA / ISO 27001</p>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 space-y-5 sm:space-y-6">
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
            <div className="space-y-4">
              {/* Filter Controls Bar */}
              <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
                {/* Search Bar */}
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by name, email, phone or ID..."
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-10 pr-4 text-xs text-slate-800 placeholder-slate-400 focus:border-[#087f80] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#087f80]"
                  />
                  <DocumentMagnifyingGlassIcon className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-2 text-slate-400 hover:text-slate-600"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {/* Role Filter */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-500">Role:</span>
                    <select
                      value={selectedRoleFilter}
                      onChange={(e) => setSelectedRoleFilter(e.target.value as SystemRole | "All")}
                      className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-semibold text-slate-700 focus:border-[#087f80] focus:outline-none"
                    >
                      <option value="All">All Roles</option>
                      <option value="User">User</option>
                      <option value="Interpreter">Interpreter</option>
                      <option value="Manager">Manager</option>
                      <option value="Admin">Admin</option>
                    </select>
                  </div>

                  {/* Status Filter */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-500">Status:</span>
                    <select
                      value={selectedStatusFilter}
                      onChange={(e) => setSelectedStatusFilter(e.target.value as "All" | "Active" | "Locked")}
                      className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-semibold text-slate-700 focus:border-[#087f80] focus:outline-none"
                    >
                      <option value="All">All Statuses</option>
                      <option value="Active">Active (Normal)</option>
                      <option value="Locked">Locked / Suspended</option>
                    </select>
                  </div>

                  {/* Language Filter Dropdown styled with manager design language */}
                  <div className="relative" ref={languageDropdownRef}>
                    <button
                      type="button"
                      onClick={() => setIsLanguageDropdownOpen(!isLanguageDropdownOpen)}
                      className="flex items-center gap-2 rounded-lg border border-[#c9d8de] bg-white px-3 py-1.5 text-xs font-bold text-[#2d4957] shadow-sm transition-all hover:border-[#087f80] hover:bg-[#edf7f5] focus:outline-none focus:ring-2 focus:ring-[#087f80]/30"
                    >
                      <LanguageIcon className="h-4 w-4 text-[#087f80]" />
                      <span>Languages</span>
                      {selectedLanguages.length > 0 && (
                        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#087f80] text-[10px] font-extrabold text-white">
                          {selectedLanguages.length}
                        </span>
                      )}
                      <ChevronDownIcon
                        className={`h-3.5 w-3.5 text-[#5e7783] transition-transform ${
                          isLanguageDropdownOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {isLanguageDropdownOpen && (
                      <div className="absolute right-0 z-40 mt-1 w-60 rounded-xl border border-[#d6e0e4] bg-white p-2.5 shadow-[0_18px_36px_rgba(19,52,68,0.16)] animate-in fade-in zoom-in-95">
                        <div className="mb-2 flex items-center justify-between border-b border-[#eef3f5] px-1 pb-1.5 text-[11px] font-extrabold text-[#153447] uppercase">
                          <span>Filter Languages</span>
                          {selectedLanguages.length > 0 && (
                            <button
                              onClick={() => setSelectedLanguages([])}
                              className="text-[10px] font-bold text-[#d93829] hover:underline"
                            >
                              Reset
                            </button>
                          )}
                        </div>
                        <div className="max-h-52 space-y-1 overflow-y-auto">
                          {AVAILABLE_LANGUAGES.map((lang) => {
                            const isChecked = selectedLanguages.includes(lang);
                            return (
                              <label
                                key={lang}
                                className={`flex cursor-pointer items-center justify-between rounded-lg px-2 py-1.5 text-xs font-semibold transition-colors ${
                                  isChecked
                                    ? "bg-[#edf7f5] text-[#087557]"
                                    : "text-[#2d4957] hover:bg-[#f2f7f9]"
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() => toggleLanguageFilter(lang)}
                                    className="h-3.5 w-3.5 rounded border-[#c9d8de] text-[#087f80] focus:ring-[#087f80]"
                                  />
                                  <span>{lang}</span>
                                </div>
                                {isChecked && <span className="h-1.5 w-1.5 rounded-full bg-[#087f80]" />}
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Category Specialty Multi-Select Dropdown */}
                  <div className="relative" ref={categoryDropdownRef}>
                    <button
                      type="button"
                      onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                      className="flex items-center gap-2 rounded-lg border border-[#c9d8de] bg-white px-3 py-1.5 text-xs font-bold text-[#2d4957] shadow-sm transition-all hover:border-[#087f80] hover:bg-[#edf7f5] focus:outline-none focus:ring-2 focus:ring-[#087f80]/30"
                    >
                      <TagIcon className="h-4 w-4 text-[#087f80]" />
                      <span>Categories</span>
                      {selectedCategories.length > 0 && (
                        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#087f80] text-[10px] font-extrabold text-white">
                          {selectedCategories.length}
                        </span>
                      )}
                      <ChevronDownIcon
                        className={`h-3.5 w-3.5 text-[#5e7783] transition-transform ${
                          isCategoryDropdownOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {isCategoryDropdownOpen && (
                      <div className="absolute right-0 z-40 mt-1 w-64 rounded-xl border border-[#d6e0e4] bg-white p-2.5 shadow-[0_18px_36px_rgba(19,52,68,0.16)] animate-in fade-in zoom-in-95">
                        <div className="mb-2 flex items-center justify-between border-b border-[#eef3f5] px-1 pb-1.5 text-[11px] font-extrabold text-[#153447] uppercase">
                          <span>Filter Specialties</span>
                          {selectedCategories.length > 0 && (
                            <button
                              onClick={() => setSelectedCategories([])}
                              className="text-[10px] font-bold text-[#d93829] hover:underline"
                            >
                              Reset
                            </button>
                          )}
                        </div>
                        <div className="max-h-52 space-y-1 overflow-y-auto">
                          {AVAILABLE_CATEGORIES.map((cat) => {
                            const isChecked = selectedCategories.includes(cat);
                            return (
                              <label
                                key={cat}
                                className={`flex cursor-pointer items-center justify-between rounded-lg px-2 py-1.5 text-xs font-semibold transition-colors ${
                                  isChecked
                                    ? "bg-[#edf7f5] text-[#087557]"
                                    : "text-[#2d4957] hover:bg-[#f2f7f9]"
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() => toggleCategoryFilter(cat)}
                                    className="h-3.5 w-3.5 rounded border-[#c9d8de] text-[#087f80] focus:ring-[#087f80]"
                                  />
                                  <span>{cat}</span>
                                </div>
                                {isChecked && <span className="h-1.5 w-1.5 rounded-full bg-[#087f80]" />}
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Users Table */}
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-600">
                    <thead className="border-b border-slate-100 bg-slate-50/80 font-bold uppercase tracking-wider text-slate-500">
                      <tr>
                        <th className="py-3.5 pl-6 pr-3">User & Contact</th>
                        <th className="px-3 py-3.5">Role</th>
                        <th className="px-3 py-3.5">Primary Language</th>
                        <th className="px-3 py-3.5">Spoken Languages</th>
                        <th className="px-3 py-3.5">Security Status</th>
                        <th className="py-3.5 pl-3 pr-6 text-right">Last Active</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredUsers.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-12 text-center text-slate-400">
                            <UserCircleIcon className="mx-auto h-10 w-10 text-slate-300" />
                            <p className="mt-2 text-sm font-semibold">No users matching the filters</p>
                            <p className="text-xs text-slate-400">Try adjusting your search criteria or resetting filters.</p>
                          </td>
                        </tr>
                      ) : (
                        filteredUsers.map((u) => (
                          <tr
                            key={u.id}
                            onClick={() => handleOpenUserDetail(u)}
                            className={`cursor-pointer transition-colors hover:bg-teal-50/40 ${u.isLocked ? "bg-red-50/30 hover:bg-red-50/50" : ""}`}
                          >
                            {/* User & Contact */}
                            <td className="py-4 pl-6 pr-3">
                              <div className="font-bold text-[#092f45]">{u.name}</div>
                              <div className="text-[11px] text-slate-500">{u.email}</div>
                              <div className="text-[10px] text-slate-400">ID: {u.id} • {u.phone}</div>
                            </td>

                            {/* Role Badge */}
                            <td className="px-3 py-4">
                              <span
                                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                                  u.role === "Admin"
                                    ? "bg-purple-100 text-purple-700"
                                    : u.role === "Manager"
                                    ? "bg-blue-100 text-blue-700"
                                    : u.role === "Interpreter"
                                    ? "bg-teal-100 text-[#087f80]"
                                    : "bg-slate-100 text-slate-600"
                                }`}
                              >
                                {u.role}
                              </span>
                            </td>

                            {/* Primary Language */}
                            <td className="px-3 py-4 font-semibold text-[#092f45]">{u.primaryLanguage}</td>

                            {/* Spoken Languages */}
                            <td className="px-3 py-4">
                              <div className="flex flex-wrap gap-1">
                                {u.spokenLanguages.map((lang) => (
                                  <span
                                    key={lang}
                                    className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600"
                                  >
                                    {lang}
                                  </span>
                                ))}
                              </div>
                            </td>

                            {/* Security Status */}
                            <td className="px-3 py-4">
                              {u.isLocked ? (
                                <div className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-[11px] font-bold text-[#f04f3e]">
                                  <LockClosedIcon className="h-3 w-3" />
                                  <span>Locked</span>
                                </div>
                              ) : (
                                <div className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-700">
                                  <CheckCircleIcon className="h-3 w-3" />
                                  <span>Active</span>
                                </div>
                              )}
                            </td>

                            {/* Last Active */}
                            <td className="py-4 pl-3 pr-6 text-right text-slate-500 text-[11px] font-medium">
                              {u.lastActive}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: INTERPRETER RANKING & QUALITY INDEX (TABLE LIST VIEW) */}
          {activeTab === "interpreters" && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                    <h3 className="text-sm font-bold text-[#092f45]">Interpreter Quality & Ratings</h3>
                    <p className="text-xs text-slate-500">
                      Calculated from user reviews, SOS response velocity, and completed emergency missions.
                    </p>
                  </div>
                  <div className="text-xs font-semibold text-teal-700 bg-teal-50 border border-teal-200 px-3 py-1 rounded-full w-fit">
                    Sorted by Rating (Descending)
                  </div>
                </div>

                <div className="mt-4 overflow-hidden rounded-xl border border-slate-200">
                  <table className="w-full text-left text-xs text-slate-600">
                    <thead className="border-b border-slate-100 bg-slate-50/80 font-bold uppercase tracking-wider text-slate-500">
                      <tr>
                        <th className="py-3.5 pl-6 pr-3">Rank & Interpreter</th>
                        <th className="px-3 py-3.5">Specialty Domains</th>
                        <th className="px-3 py-3.5 text-center">Completed Missions</th>
                        <th className="px-3 py-3.5 text-center">Avg SOS Dispatch</th>
                        <th className="py-3.5 pl-3 pr-6 text-right">Avg Rating</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {interpreterRanking.map((interp, idx) => (
                        <tr
                          key={interp.id}
                          onClick={() => handleOpenUserDetail(interp)}
                          className="cursor-pointer transition-colors hover:bg-teal-50/40"
                        >
                          {/* Rank & Name */}
                          <td className="py-4 pl-6 pr-3">
                            <div className="flex items-center gap-3">
                              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#087f80]/10 text-xs font-extrabold text-[#087f80]">
                                #{idx + 1}
                              </span>
                              <div>
                                <div className="font-bold text-[#092f45]">{interp.name}</div>
                                <div className="text-[11px] text-slate-500">
                                  {interp.primaryLanguage} Specialist • {interp.email}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Specialty Domains */}
                          <td className="px-3 py-4">
                            <div className="flex flex-wrap gap-1">
                              {interp.interpreterStats?.specialties.map((spec) => (
                                <span
                                  key={spec}
                                  className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600"
                                >
                                  {spec}
                                </span>
                              ))}
                            </div>
                          </td>

                          {/* Completed Missions */}
                          <td className="px-3 py-4 text-center font-semibold text-slate-800">
                            {interp.interpreterStats?.completedMissions} trips
                          </td>

                          {/* Avg SOS Dispatch */}
                          <td className="px-3 py-4 text-center font-bold text-emerald-600">
                            {interp.interpreterStats?.responseTimeAvg}
                          </td>

                          {/* Avg Rating */}
                          <td className="py-4 pl-3 pr-6 text-right">
                            <span className="inline-flex items-center gap-1 font-extrabold text-amber-600">
                              <StarIcon className="h-4 w-4 fill-amber-500 text-amber-500" />
                              <span>{interp.interpreterStats?.rating}</span>
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: AUDIT TRAIL */}
          {activeTab === "audit" && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-[#092f45]">System Security Audit Trail</h3>
                    <p className="text-xs text-slate-500">
                      Immutable log of all administrative actions, role updates, and user account restrictions.
                    </p>
                  </div>
                  <div className="text-xs font-semibold text-slate-500">
                    Showing last {auditLogs.length} audit records
                  </div>
                </div>

                <div className="mt-4 overflow-hidden rounded-xl border border-slate-200">
                  <table className="w-full text-left text-xs text-slate-600">
                    <thead className="border-b border-slate-100 bg-slate-50 font-bold uppercase tracking-wider text-slate-500">
                      <tr>
                        <th className="py-3 pl-4 pr-2">Timestamp</th>
                        <th className="px-2 py-3">Severity</th>
                        <th className="px-2 py-3">Actor</th>
                        <th className="px-2 py-3">Action</th>
                        <th className="px-2 py-3">Target Subject</th>
                        <th className="py-3 pl-2 pr-4">Details</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {auditLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-slate-50/60 font-mono text-[11px]">
                          <td className="py-3 pl-4 pr-2 text-slate-500 whitespace-nowrap">{log.timestamp}</td>
                          <td className="px-2 py-3">
                            <span
                              className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ${
                                log.severity === "danger"
                                  ? "bg-red-100 text-[#f04f3e]"
                                  : log.severity === "warning"
                                  ? "bg-amber-100 text-amber-700"
                                  : "bg-teal-100 text-[#087f80]"
                              }`}
                            >
                              {log.severity}
                            </span>
                          </td>
                          <td className="px-2 py-3 font-semibold text-[#092f45]">{log.actor}</td>
                          <td className="px-2 py-3 font-bold text-slate-700">{log.action}</td>
                          <td className="px-2 py-3 text-slate-600">{log.targetUser}</td>
                          <td className="py-3 pl-2 pr-4 text-slate-500 font-sans text-xs">{log.details}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Centered Modal: User Role & Suspension Editor (Stacked on Mobile, 30%/70% on Desktop) */}
      {isEditModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-3 sm:p-4 backdrop-blur-xs animate-in fade-in">
          <div className="relative flex h-[92vh] sm:h-[85vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl sm:rounded-3xl bg-white shadow-2xl animate-in zoom-in-95">
            {/* Modal Header */}
            <div className="flex min-h-[3.5rem] items-center justify-between border-b border-slate-200 px-4 sm:px-6 py-2.5">
              <div className="flex items-center gap-2.5 sm:gap-3">
                <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-[#092f45] text-white flex-shrink-0">
                  <ShieldCheckIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-[#092f45] leading-tight">Admin Security Console • User Account Control</h3>
                  <p className="text-[10px] sm:text-xs text-slate-400">ID: {selectedUser.id} • Registered {selectedUser.registeredAt}</p>
                </div>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors flex-shrink-0"
              >
                <XMarkIcon className="h-5 w-5 sm:h-6 sm:w-6" />
              </button>
            </div>

            {/* Modal Body: Stacked on Mobile / 30% Left Profile + 70% Right Editor on Desktop */}
            <div className="flex flex-1 flex-col md:flex-row overflow-hidden">
              {/* Profile Card (Collapsible/Scrollable top section on mobile, 32% sidebar on desktop) */}
              <div className="w-full md:w-[32%] max-h-56 md:max-h-none flex-shrink-0 border-b md:border-b-0 md:border-r border-slate-200 bg-slate-50 p-4 sm:p-6 overflow-y-auto space-y-4 sm:space-y-6">
                <div className="text-center">
                  <div className="mx-auto flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-[#092f45] text-lg sm:text-xl font-bold text-white shadow-md">
                    {selectedUser.name.slice(0, 2).toUpperCase()}
                  </div>
                  <h4 className="mt-3 text-base font-bold text-[#092f45]">{selectedUser.name}</h4>
                  <p className="text-xs text-slate-500">{selectedUser.email}</p>
                  <p className="text-xs text-slate-500">{selectedUser.phone}</p>

                  <div className="mt-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold bg-white border border-slate-200 shadow-xs">
                    <span className="text-slate-400">Current Role:</span>
                    <span className="text-[#087f80]">{selectedUser.role}</span>
                  </div>
                </div>

                <div className="space-y-3 border-t border-slate-200 pt-4 text-xs">
                  <div>
                    <span className="font-bold text-slate-400 uppercase text-[10px]">Primary Language:</span>
                    <p className="font-semibold text-slate-800 mt-0.5">{selectedUser.primaryLanguage}</p>
                  </div>
                  <div>
                    <span className="font-bold text-slate-400 uppercase text-[10px]">Spoken Languages:</span>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {selectedUser.spokenLanguages.map((l) => (
                        <span key={l} className="rounded bg-white border border-slate-200 px-1.5 py-0.5 text-[10px] text-slate-700">
                          {l}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="font-bold text-slate-400 uppercase text-[10px]">Account Security Status:</span>
                    <p className={`mt-0.5 font-bold ${selectedUser.isLocked ? "text-[#f04f3e]" : "text-emerald-600"}`}>
                      {selectedUser.isLocked ? "Suspended (Locked)" : "Active / Operational"}
                    </p>
                  </div>
                </div>

                {selectedUser.interpreterStats && (
                  <div className="rounded-xl border border-teal-200 bg-teal-50/60 p-3 text-xs space-y-2">
                    <p className="font-bold text-teal-800 flex items-center gap-1">
                      <SparklesIcon className="h-4 w-4" />
                      <span>Interpreter Metrics</span>
                    </p>
                    <div className="flex justify-between text-slate-600">
                      <span>Missions:</span>
                      <span className="font-bold text-slate-900">{selectedUser.interpreterStats.completedMissions}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Rating:</span>
                      <span className="font-bold text-amber-600">★ {selectedUser.interpreterStats.rating}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* 70% Right RBAC Editor Workspace */}
              <div className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto space-y-5 sm:space-y-6">
                {/* Section 1: Role RBAC Assignment */}
                <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs space-y-3 sm:space-y-4">
                  <div className="flex items-center gap-2">
                    <KeyIcon className="h-5 w-5 text-[#087f80]" />
                    <h4 className="text-sm font-bold text-[#092f45]">RBAC Role Assignment</h4>
                  </div>
                  <p className="text-xs text-slate-500">
                    Assign system permissions. Role transitions update system access policies across all client interfaces.
                  </p>

                  <div className="grid grid-cols-2 gap-2 sm:gap-3 sm:grid-cols-4">
                    {(["User", "Interpreter", "Manager", "Admin"] as SystemRole[]).map((r) => {
                      const isSelected = tempRole === r;
                      return (
                        <button
                          key={r}
                          type="button"
                          onClick={() => setTempRole(r)}
                          className={`rounded-xl border p-2.5 sm:p-3 text-left transition-all ${
                            isSelected
                              ? "border-[#087f80] bg-[#087f80]/10 text-[#087f80] ring-2 ring-[#087f80]/30"
                              : "border-slate-200 bg-slate-50/60 text-slate-700 hover:bg-slate-100"
                          }`}
                        >
                          <p className="text-xs font-bold">{r}</p>
                          <p className="mt-1 text-[10px] text-slate-500">
                            {r === "Admin"
                              ? "Super Backoffice"
                              : r === "Manager"
                              ? "Ops & Verifications"
                              : r === "Interpreter"
                              ? "Claim Missions"
                              : "Standard Requester"}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Section 2: Account Lock & Suspension Control */}
                <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs space-y-3 sm:space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <LockClosedIcon className="h-5 w-5 text-[#f04f3e]" />
                      <h4 className="text-sm font-bold text-[#092f45]">Account Suspension & Lockout</h4>
                    </div>

                    <label className="relative inline-flex cursor-pointer items-center">
                      <input
                        type="checkbox"
                        checked={tempIsLocked}
                        onChange={(e) => setTempIsLocked(e.target.checked)}
                        className="peer sr-only"
                      />
                      <div className="peer h-6 w-11 rounded-full bg-slate-200 after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-[#f04f3e] peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
                    </label>
                  </div>

                  <p className="text-xs text-slate-500">
                    When suspended, the user cannot log in, initiate SOS requests, accept translator calls, or access backoffice dashboards.
                  </p>

                  {tempIsLocked && (
                    <div className="space-y-2 animate-in fade-in">
                      <label className="block text-xs font-bold text-[#f04f3e]">
                        Reason for Account Suspension (Mandatory for Audit Trail):
                      </label>
                      <textarea
                        rows={3}
                        value={tempLockReason}
                        onChange={(e) => setTempLockReason(e.target.value)}
                        placeholder="e.g. Disciplinary breach, false distress signal generation, or security compromise..."
                        className="w-full rounded-xl border border-red-300 bg-red-50/20 p-3 text-xs text-slate-800 placeholder-slate-400 focus:border-[#f04f3e] focus:outline-none focus:ring-1 focus:ring-[#f04f3e]"
                      />
                    </div>
                  )}
                </div>

                {/* Section 3: Interpreter Feedback & Quality Log */}
                {selectedUser.interpreterStats && (
                  <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-[#092f45]">Recent Performance Reviews</h4>
                      <span className="inline-flex items-center gap-1 font-bold text-xs text-amber-600 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
                        <StarIcon className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                        <span>Rating {selectedUser.interpreterStats.rating} / 5.0</span>
                      </span>
                    </div>
                    <div className="space-y-2">
                      {selectedUser.interpreterStats.feedbackHighlights.map((fb, idx) => (
                        <div key={idx} className="rounded-lg bg-slate-50 border border-slate-200/60 p-3 text-xs text-slate-600">
                          “{fb}”
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex min-h-[3.5rem] flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 border-t border-slate-200 bg-slate-50 px-4 sm:px-6 py-2.5 sm:py-3">
              <span className="text-[11px] sm:text-xs text-slate-400 text-center sm:text-left">
                Action will be permanently recorded in System Audit Trail
              </span>
              <div className="flex items-center justify-end gap-2 sm:gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="w-full sm:w-auto rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveUserChanges}
                  className="w-full sm:w-auto rounded-xl bg-[#087f80] px-5 py-2 text-xs font-bold text-white shadow-md shadow-[#087f80]/20 hover:bg-[#087f80]/90 transition-all"
                >
                  Save Security Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Global Footer */}
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
  );
}

