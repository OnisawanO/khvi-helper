"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  AdjustmentsHorizontalIcon,
  ArchiveBoxXMarkIcon,
  ArrowLeftOnRectangleIcon,
  ArrowPathIcon,
  ArrowsRightLeftIcon,
  Bars3Icon,
  BriefcaseIcon,
  ChatBubbleLeftRightIcon,
  CheckBadgeIcon,
  CheckCircleIcon,
  CheckIcon,
  ChevronDownIcon,
  Cog6ToothIcon,
  EllipsisHorizontalIcon,
  ExclamationTriangleIcon,
  InboxStackIcon,
  LanguageIcon,
  MagnifyingGlassIcon,
  PaperAirplaneIcon,
  PhoneIcon,
  ShieldCheckIcon,
  ShieldExclamationIcon,
  UserCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { BrandMark } from "@/app/components/brand-mark";
import { SiteFooter } from "@/app/components/site-footer";
import { UserAvatar } from "@/app/components/user-avatar";

import { InterpreterApplicant, HelpTicket, IncidentReport } from "./types";
import {
  initialApplicants,
  initialTickets,
  initialReports,
  formatBadgeCount,
} from "./mock-data";
import { ApplicantDetailModal } from "./components/applicant-detail-modal";
import { LoginModal } from "@/app/components/auth/login-modal";
import {
  getMockUserSession,
  clearMockUserSession,
  getRedirectPathByRole,
  DEFAULT_MOCK_USERS,
  type UserProfile,
} from "@/app/lib/mock-auth";

function ManagerTopHeader({
  onMenuClick,
  currentUser,
  onSignOut,
  onChangeAccount,
}: {
  onMenuClick?: () => void;
  currentUser: UserProfile | null;
  onSignOut: () => void;
  onChangeAccount: () => void;
}) {
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target as Node)
      ) {
        setProfileMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-30 border-b border-[#dbe3e7] bg-[#fbfdfc]/95 shadow-[0_8px_24px_rgba(21,52,67,0.06)] backdrop-blur select-none">
      <div className="flex w-full items-center justify-between gap-3 px-2.5 py-2.5 sm:px-4 md:px-5">
        {/* Brand & Sidebar Toggle Button (Aligned with sidebar edge for unified block feel) */}
        <div className="flex items-center gap-2.5 sm:gap-3.5">
          {/* Unified Sidebar Pop-up / Drawer Toggle Button */}
          <button
            type="button"
            onClick={onMenuClick}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#c9d8de] bg-white text-[#092f45] shadow-xs hover:border-[#087f80] hover:bg-[#edf7f5] hover:text-[#087f80] transition-colors focus:outline-none focus:ring-2 focus:ring-[#087f80]/30 cursor-pointer"
            aria-label="Toggle Navigation Menu"
            title="Toggle Navigation Menu (เปิด/ปิด เมนู)"
          >
            <Bars3Icon className="h-5 w-5" />
          </button>

          {/* Brand Mark with Subtitle */}
          <BrandMark
            subtitle="Interpreter Operations Hub"
            href="/manager"
            ariaLabel="KHVI Manager Home"
          />
        </div>

        {/* Right Section: Profile & Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Profile Card with Dropdown Menu */}
          <div ref={profileMenuRef} className="relative">
            <button
              type="button"
              onClick={() => setProfileMenuOpen((prev) => !prev)}
              className="flex items-center gap-2.5 rounded-xl border border-[#c9d8de] bg-white px-3 py-1.5 shadow-2xs transition-all hover:border-[#087f80] hover:bg-[#edf7f5] focus:outline-none focus:ring-2 focus:ring-[#087f80]/30 cursor-pointer"
              aria-expanded={profileMenuOpen}
              aria-haspopup="menu"
            >
              {/* Round Initial Avatar */}
              <UserAvatar user={currentUser ?? DEFAULT_MOCK_USERS.Manager} size="sm" className="border border-[#087f80]" />
              <div className="text-left hidden sm:block">
                <p className="text-xs font-extrabold leading-tight text-[#10283a]">
                  {currentUser?.name || "วิภา ตรวจสอบ"}
                </p>
                <p className="text-[11px] font-semibold text-[#087f80]">
                  {currentUser?.role === "Manager" ? "Regional Manager" : currentUser?.role || "Regional Manager"}
                </p>
              </div>
              <ChevronDownIcon
                className={`h-4 w-4 text-[#5e7783] transition-transform ${
                  profileMenuOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Profile Dropdown Menu */}
            {profileMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-[#d6e0e4] bg-white p-2 shadow-[0_18px_36px_rgba(19,52,68,0.16)] animate-in fade-in zoom-in-95 z-50">
                <div className="border-b border-[#eef3f5] px-3 py-2.5">
                  <p className="text-sm font-extrabold text-[#153447]">
                    {currentUser?.name || "วิภา ตรวจสอบ"}
                  </p>
                  <p className="text-xs text-[#6a808a] truncate">
                    {currentUser?.email || "manager@khvi.org"}
                  </p>
                  <span className="mt-2 inline-flex items-center gap-1 rounded-md bg-[#e6f4ef] px-2 py-0.5 text-[11px] font-bold text-[#087557]">
                    <CheckBadgeIcon className="h-3.5 w-3.5" />
                    Verified Regional Manager
                  </span>
                </div>
                <div className="py-1 space-y-0.5">
                  <a
                    href="/profile#main-content"
                    onClick={() => setProfileMenuOpen(false)}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-[#2d4957] transition-colors hover:bg-[#f2f7f9] hover:text-[#087f80] cursor-pointer"
                  >
                    <UserCircleIcon className="h-4 w-4" />
                    Profile
                  </a>
                  <button
                    type="button"
                    onClick={() => {
                      setProfileMenuOpen(false);
                      onChangeAccount();
                    }}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-[#2d4957] transition-colors hover:bg-[#f2f7f9] hover:text-[#087f80] cursor-pointer"
                  >
                    <ArrowsRightLeftIcon className="h-4 w-4" />
                    Change account
                  </button>
                </div>
                <div className="border-t border-[#eef3f5] pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setProfileMenuOpen(false);
                      onSignOut();
                    }}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-[#d93829] transition-colors hover:bg-[#fff2f0] cursor-pointer"
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

export default function ManagerDashboard() {
  const router = useRouter();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(
    DEFAULT_MOCK_USERS.Manager
  );

  useEffect(() => {
    const session = getMockUserSession();
    if (session) {
      queueMicrotask(() => {
        setCurrentUser(session);
      });
    }
  }, []);

  const handleSignOut = () => {
    clearMockUserSession();
    setCurrentUser(null);
    router.push("/?signin=true");
  };

  const handleLoginSuccess = (user: UserProfile) => {
    setCurrentUser(user);
    setIsLoginModalOpen(false);
    if (user.role !== "Manager") {
      router.push(getRedirectPathByRole(user.role));
    }
  };

  const [applicants, setApplicants] = useState<InterpreterApplicant[]>(initialApplicants);
  const [tickets, setTickets] = useState<HelpTicket[]>(initialTickets);
  const [reports, setReports] = useState<IncidentReport[]>(initialReports);
  const [selectedApplicantId, setSelectedApplicantId] = useState<string | null>(initialApplicants[0].id);
  
  // Navigation & View State (Strictly Manager scope: Verification + Support)
  const [navSection, setNavSection] = useState<
    "queue" | "approved" | "rejected" | "tickets" | "reports"
  >("queue");
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
  const filterMenuRef = useRef<HTMLDivElement>(null);

  // Toggle selection helpers
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

  // Close filter dropdown on outside click
  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (!filterMenuRef.current?.contains(event.target as Node)) {
        setFilterMenuOpen(false);
      }
    };
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, []);

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

      // 2. Search query match (Search text matches name, ID, country, or contact)
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

      // 3. Multi-select Language filter: if any selected, applicant MUST know ALL chosen languages (Strict AND narrowing)
      const matchesLanguage =
        selectedLanguages.length === 0 ||
        selectedLanguages.every((selectedLang) => {
          const target = selectedLang.trim().toLowerCase();
          const primary = app.primaryLanguage.trim().toLowerCase();
          const spoken = app.spokenLanguages.map((l) => l.trim().toLowerCase());
          return primary.includes(target) || spoken.some((l) => l.includes(target));
        });

      // 4. Multi-select Category filter: if any selected, applicant MUST have ALL chosen categories (Strict AND narrowing)
      const matchesCategory =
        selectedCategories.length === 0 ||
        selectedCategories.every((selectedCat) =>
          app.specialtyCategories.some(
            (cat) => cat.trim().toLowerCase() === selectedCat.trim().toLowerCase()
          )
        );

      // BOTH language filter AND category filter must be satisfied concurrently (AND logic)
      return matchesSearch && matchesLanguage && matchesCategory;
    });
  }, [applicants, navSection, searchQuery, selectedLanguages, selectedCategories]);

  // Selected applicant for the centered pop-up modal
  const selectedApplicant = useMemo(() => {
    return applicants.find((a) => a.id === selectedApplicantId) || null;
  }, [applicants, selectedApplicantId]);

  // Handle row click to open centered 30/70 detail modal
  const handleOpenDetailModal = (applicant: InterpreterApplicant) => {
    setSelectedApplicantId(applicant.id);
    setDetailModalOpen(true);
  };

  // Handle Approve (FR-43)
  const handleApprove = (id: string) => {
    setApplicants((prev) =>
      prev.map((app) => (app.id === id ? { ...app, status: "Approved" } : app))
    );
  };

  // Handle Reject (FR-44, FR-45)
  const handleReject = (id: string, reason: string) => {
    setApplicants((prev) =>
      prev.map((app) =>
        app.id === id
          ? { ...app, status: "Rejected", rejectionReason: reason }
          : app
      )
    );
  };

  // Handle Help Request Response (FR-52)
  const handleSendTicketReply = (ticketId: string) => {
    if (!ticketReplyText.trim()) return;
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
    setActiveReplyingTicketId(null);
    setTicketReplyText("");
  };

  // Handle Incident Report Escalation to Admin (FR-53 -> FR-76)
  const handleEscalateReport = (reportId: string) => {
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
  };

  // Counts for Badges
  const pendingCount = applicants.filter((a) => a.status === "Pending" || a.status === "Under Review").length;
  const approvedCount = applicants.filter((a) => a.status === "Approved").length;
  const rejectedCount = applicants.filter((a) => a.status === "Rejected").length;
  const openTicketCount = tickets.filter((t) => t.status === "Open" || t.status === "In Progress").length;
  const pendingReportCount = reports.filter((r) => r.status === "Pending Investigation").length;

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-[#f7f9fa] text-[#092f45] antialiased">
      {/* 1. Global Top Header (Matching Admin portal standard) */}
      <ManagerTopHeader
        onMenuClick={() => setIsMobileDrawerOpen((prev) => !prev)}
        currentUser={currentUser}
        onSignOut={handleSignOut}
        onChangeAccount={() => setIsLoginModalOpen(true)}
      />

      {/* Main Container below Header: Pop-up Sidebar Drawer + Main Content Workspace */}
      <div className="relative flex flex-1 flex-row overflow-hidden min-h-0">
        {/* Universal Slide-out Pop-up Sidebar Drawer (Overlay across mobile, tablet, and desktop) */}
        <div
          className={`fixed inset-0 z-50 transition-all duration-300 ${
            isMobileDrawerOpen
              ? "visible pointer-events-auto"
              : "invisible pointer-events-none delay-300"
          }`}
          aria-hidden={!isMobileDrawerOpen}
        >
          {/* Backdrop overlay with smooth fade in/out */}
          <div
            onClick={() => setIsMobileDrawerOpen(false)}
            className={`fixed inset-0 bg-slate-950/50 backdrop-blur-xs transition-opacity duration-300 ${
              isMobileDrawerOpen ? "opacity-100" : "opacity-0"
            }`}
          />

          {/* Drawer content sliding smoothly from left with elegant shadow (Navy Dark Theme) */}
          <aside
            className={`relative z-10 flex h-full w-[290px] max-w-[85vw] flex-col justify-between bg-[#092f45] text-white p-4 shadow-2xl border-r border-[#16435c] transition-transform duration-300 [transition-timing-function:cubic-bezier(0.2,0,0,1)] select-none ${
              isMobileDrawerOpen ? "translate-x-0" : "-translate-x-full"
            }`}
          >
            <div className="space-y-4">
              {/* Drawer Top Header */}
              <div className="flex items-center justify-between border-b border-[#16435c] pb-3">
                <Link
                  href="/"
                  onClick={() => setIsMobileDrawerOpen(false)}
                  className="group flex items-center gap-3 rounded-2xl transition-transform hover:scale-105"
                  title="KHVI Home (กลับสู่หน้าหลัก)"
                >
                  <div className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[#087f80]/40 bg-[#0d3b55] shadow-xs group-hover:border-[#087f80]">
                    <Image
                      src="/khvi-logo.jpg"
                      alt="KHVI logo"
                      fill
                      sizes="36px"
                      className="scale-[2.2] object-cover object-[50%_54%]"
                      priority
                    />
                  </div>
                  <div>
                    <span className="block text-sm font-black tracking-tight text-white">KHVI</span>
                    <span className="block truncate text-[10px] font-bold text-[#4d8a93]">Operations Hub</span>
                  </div>
                </Link>
                <button
                  type="button"
                  onClick={() => setIsMobileDrawerOpen(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-300 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
                  aria-label="Close menu"
                  title="Close menu (ปิดเมนู)"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>

              {/* Navigation Links (Dark Navy Inverted Theme) */}
              <div>
                <p className="px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Verification
                </p>
                <nav className="mt-1 space-y-1">
                  <button
                    onClick={() => {
                      setNavSection("queue");
                      setIsMobileDrawerOpen(false);
                    }}
                    className={`flex w-full h-10 items-center justify-between rounded-2xl px-3 text-xs font-bold transition-all cursor-pointer ${
                      navSection === "queue"
                        ? "bg-[#087f80] text-white shadow-md"
                        : "text-slate-200 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <InboxStackIcon className="h-5 w-5 text-slate-300" />
                      <span>Application Queue</span>
                    </div>
                    {pendingCount > 0 && (
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold ${
                          navSection === "queue"
                            ? "bg-white/20 text-white"
                            : "bg-[#087f80] text-white"
                        }`}
                      >
                        {formatBadgeCount(pendingCount)}
                      </span>
                    )}
                  </button>

                  <button
                    onClick={() => {
                      setNavSection("approved");
                      setIsMobileDrawerOpen(false);
                    }}
                    className={`flex w-full h-10 items-center justify-between rounded-2xl px-3 text-xs font-bold transition-all cursor-pointer ${
                      navSection === "approved"
                        ? "bg-[#087f80] text-white shadow-md"
                        : "text-slate-200 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <CheckCircleIcon className="h-5 w-5 text-slate-300" />
                      <span>Approved Volunteers</span>
                    </div>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold ${
                        navSection === "approved"
                          ? "bg-white/20 text-white"
                          : "bg-teal-900/60 text-teal-300 border border-teal-700/50"
                      }`}
                    >
                      {formatBadgeCount(approvedCount)}
                    </span>
                  </button>

                  <button
                    onClick={() => {
                      setNavSection("rejected");
                      setIsMobileDrawerOpen(false);
                    }}
                    className={`flex w-full h-10 items-center justify-between rounded-2xl px-3 text-xs font-bold transition-all cursor-pointer ${
                      navSection === "rejected"
                        ? "bg-[#087f80] text-white shadow-md"
                        : "text-slate-200 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <ArchiveBoxXMarkIcon className="h-5 w-5 text-slate-300" />
                      <span>Rejected Archive</span>
                    </div>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold ${
                        navSection === "rejected"
                          ? "bg-white/20 text-white"
                          : "bg-red-900/50 text-red-300 border border-red-800/50"
                      }`}
                    >
                      {formatBadgeCount(rejectedCount)}
                    </span>
                  </button>
                </nav>
              </div>

              {/* Group 2: Escalation Desk */}
              <div>
                <p className="px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Escalation Desk
                </p>
                <nav className="mt-1 space-y-1">
                  <button
                    onClick={() => {
                      setNavSection("tickets");
                      setIsMobileDrawerOpen(false);
                    }}
                    className={`flex w-full h-10 items-center justify-between rounded-2xl px-3 text-xs font-bold transition-all cursor-pointer ${
                      navSection === "tickets"
                        ? "bg-[#087f80] text-white shadow-md"
                        : "text-slate-200 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <ChatBubbleLeftRightIcon className="h-5 w-5 text-slate-300" />
                      <span>Live Help Requests</span>
                    </div>
                    {openTicketCount > 0 && (
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold ${
                          navSection === "tickets"
                            ? "bg-white/20 text-white"
                            : "bg-[#f04f3e] text-white animate-pulse"
                        }`}
                      >
                        {formatBadgeCount(openTicketCount)}
                      </span>
                    )}
                  </button>

                  <button
                    onClick={() => {
                      setNavSection("reports");
                      setIsMobileDrawerOpen(false);
                    }}
                    className={`flex w-full h-10 items-center justify-between rounded-2xl px-3 text-xs font-bold transition-all cursor-pointer ${
                      navSection === "reports"
                        ? "bg-[#087f80] text-white shadow-md"
                        : "text-slate-200 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <ShieldExclamationIcon className="h-5 w-5 text-slate-300" />
                      <span>Incident Reports</span>
                    </div>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold ${
                        navSection === "reports"
                          ? "bg-white/20 text-white"
                          : "bg-amber-900/60 text-amber-300 border border-amber-700/50"
                      }`}
                    >
                      {formatBadgeCount(pendingReportCount)}
                    </span>
                  </button>
                </nav>
              </div>
            </div>

            {/* Bottom Section in Drawer: Settings */}
            <div className="mt-auto pt-3 border-t border-[#16435c]">
              {/* Settings Button */}
              <button
                type="button"
                onClick={() => alert("Manager System Settings & Preferences")}
                className="flex w-full items-center gap-3 rounded-2xl px-3 py-2 text-xs font-bold text-slate-300 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
                title="Manager Settings"
              >
                <Cog6ToothIcon className="h-5 w-5 shrink-0" />
                <span>Settings</span>
              </button>
            </div>
          </aside>
        </div>

        {/* 2. Compact Left Rail Bar (Dark Navy Theme - Consistent & Unified) */}
        <aside className="hidden md:flex flex-col w-[68px] shrink-0 items-center justify-between border-r border-[#16435c] bg-[#092f45] py-4 z-20 select-none shadow-[4px_0_16px_rgba(0,0,0,0.15)]">
          {/* Top: Section Quick Buttons with Notification Badges */}
          <div className="flex flex-col items-center gap-4 w-full px-2">
            {/* Verification Group */}
            <div className="flex flex-col items-center gap-2.5 w-full">
              {/* Queue (Pending review with badge) */}
              <button
                type="button"
                onClick={() => setNavSection("queue")}
                className={`relative flex h-10 w-10 items-center justify-center rounded-2xl transition-all cursor-pointer ${
                  navSection === "queue"
                    ? "bg-[#087f80] text-white shadow-md"
                    : "text-slate-300 hover:bg-white/10 hover:text-white"
                }`}
                title="Application Queue (Pending Review)"
                aria-label="Application Queue"
              >
                <InboxStackIcon className="h-5 w-5" />
                {pendingCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#087f80] px-1 text-[10px] font-black text-white ring-2 ring-[#092f45]">
                    {formatBadgeCount(pendingCount)}
                  </span>
                )}
              </button>

              {/* Approved Volunteers */}
              <button
                type="button"
                onClick={() => setNavSection("approved")}
                className={`relative flex h-10 w-10 items-center justify-center rounded-2xl transition-all cursor-pointer ${
                  navSection === "approved"
                    ? "bg-[#087f80] text-white shadow-md"
                    : "text-slate-300 hover:bg-white/10 hover:text-white"
                }`}
                title="Approved Volunteer Interpreters"
                aria-label="Approved Volunteer Interpreters"
              >
                <CheckCircleIcon className="h-5 w-5" />
                {approvedCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-teal-900/80 px-1 text-[9px] font-extrabold text-teal-300 ring-1 ring-[#092f45] border border-teal-700/50">
                    {formatBadgeCount(approvedCount)}
                  </span>
                )}
              </button>

              {/* Rejected Archive */}
              <button
                type="button"
                onClick={() => setNavSection("rejected")}
                className={`relative flex h-10 w-10 items-center justify-center rounded-2xl transition-all cursor-pointer ${
                  navSection === "rejected"
                    ? "bg-[#087f80] text-white shadow-md"
                    : "text-slate-300 hover:bg-white/10 hover:text-white"
                }`}
                title="Rejected Applicant Archive"
                aria-label="Rejected Applicant Archive"
              >
                <ArchiveBoxXMarkIcon className="h-5 w-5" />
                {rejectedCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-900/80 px-1 text-[9px] font-bold text-red-300 ring-1 ring-[#092f45] border border-red-800/50">
                    {formatBadgeCount(rejectedCount)}
                  </span>
                )}
              </button>
            </div>

            <div className="h-px w-8 bg-[#16435c]" />

            {/* Escalation Desk Group */}
            <div className="flex flex-col items-center gap-2.5 w-full">
              {/* Live Help Requests (Tickets with badge) */}
              <button
                type="button"
                onClick={() => setNavSection("tickets")}
                className={`relative flex h-10 w-10 items-center justify-center rounded-2xl transition-all cursor-pointer ${
                  navSection === "tickets"
                    ? "bg-[#087f80] text-white shadow-md"
                    : "text-slate-300 hover:bg-white/10 hover:text-white"
                }`}
                title="Live Help Requests"
                aria-label="Live Help Requests"
              >
                <ChatBubbleLeftRightIcon className="h-5 w-5" />
                {openTicketCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#f04f3e] px-1 text-[10px] font-black text-white ring-2 ring-[#092f45] animate-pulse">
                    {formatBadgeCount(openTicketCount)}
                  </span>
                )}
              </button>

              {/* Incident Reports */}
              <button
                type="button"
                onClick={() => setNavSection("reports")}
                className={`relative flex h-10 w-10 items-center justify-center rounded-2xl transition-all cursor-pointer ${
                  navSection === "reports"
                    ? "bg-[#087f80] text-white shadow-md"
                    : "text-slate-300 hover:bg-white/10 hover:text-white"
                }`}
                title="Incident Reports"
                aria-label="Incident Reports"
              >
                <ShieldExclamationIcon className="h-5 w-5" />
                {pendingReportCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-500 px-1 text-[10px] font-black text-white ring-2 ring-[#092f45]">
                    {formatBadgeCount(pendingReportCount)}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Bottom Rail Actions */}
          <div className="flex flex-col items-center w-full px-2">
            {/* Settings button */}
            <button
              type="button"
              onClick={() => alert("Manager System Settings & Preferences")}
              className="flex h-10 w-10 items-center justify-center rounded-2xl text-slate-300 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
              title="Settings"
              aria-label="Settings"
            >
              <Cog6ToothIcon className="h-5 w-5" />
            </button>
          </div>
        </aside>

        {/* Right Column: Main Content Workspace + Footer */}
        <div className="flex flex-1 flex-col h-full overflow-hidden min-w-0">
        {/* Main Content Workspace (Flex column with min-h-full ensures sticky footer at bottom) */}
        <div className="flex-1 overflow-y-auto min-w-0 flex flex-col">
          <main className="flex-1 p-4 sm:p-6 md:p-8 space-y-5 sm:space-y-6">
            {/* View Header with Search & Filter */}
            {(navSection === "queue" || navSection === "approved" || navSection === "rejected") && (
              <div className="rounded-2xl border border-[#d8e3e7] bg-white p-5 shadow-xs">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h1 className="text-lg font-extrabold text-[#112d3f] sm:text-xl">
                      {navSection === "queue" && "Volunteer Interpreter Queue (Pending Review)"}
                      {navSection === "approved" && "Approved Volunteer Interpreters"}
                      {navSection === "rejected" && "Rejected Applicant Archive"}
                    </h1>
                    <p className="mt-1 text-xs text-[#637d8a]">
                      {navSection === "queue" && "Click any row to inspect candidate credentials in centered pop-up and make a decision."}
                      {navSection === "approved" && "List of certified volunteers authorized to receive live mission broadcasts."}
                      {navSection === "rejected" && "Historical record of rejected applicants and specified rejection reasons."}
                    </p>
                  </div>

                  {/* Search and Combined Filter Button */}
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Search Input */}
                    <div className="relative">
                      <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#7e97a3]" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search name, language, category, ID..."
                        className="w-48 sm:w-60 rounded-xl border border-[#ccdbe1] bg-[#f9fbfb] py-1.5 pl-8 pr-3 text-xs text-[#143141] placeholder-[#7d95a2] focus:border-[#087f80] focus:bg-white focus:outline-none shadow-xs"
                      />
                    </div>

                    {/* Filter Button with Image-matched Adjustments Icon */}
                    <div className="relative" ref={filterMenuRef}>
                      <button
                        type="button"
                        onClick={() => setFilterMenuOpen(!filterMenuOpen)}
                        className={`inline-flex items-center gap-2 rounded-xl border px-3 py-1.5 text-xs font-bold transition-colors cursor-pointer shadow-xs ${
                          selectedLanguages.length > 0 || selectedCategories.length > 0
                            ? "border-[#087f80] bg-[#edf7f5] text-[#087f80]"
                            : "border-[#ccdbe1] bg-white text-[#254454] hover:bg-[#f7fafb]"
                        }`}
                      >
                        <AdjustmentsHorizontalIcon className="h-4 w-4" />
                        <span>Filter</span>
                        {(selectedLanguages.length > 0 || selectedCategories.length > 0) && (
                          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#087f80] text-[9px] font-black text-white">
                            {selectedLanguages.length + selectedCategories.length}
                          </span>
                        )}
                        <ChevronDownIcon className={`h-3 w-3 transition-transform ${filterMenuOpen ? "rotate-180" : ""}`} />
                      </button>

                      {/* Filter Popover Menu (Multi-Select) */}
                      {filterMenuOpen && (
                        <div className="absolute right-0 top-full mt-2 z-40 w-80 sm:w-96 rounded-2xl border border-[#d3dfe3] bg-white p-4 shadow-[0_16px_40px_rgba(9,47,69,0.14)] space-y-4 animate-in fade-in">
                          <div className="flex items-center justify-between border-b border-[#edf2f5] pb-2.5">
                            <span className="text-xs font-black text-[#112d3f] flex items-center gap-1.5">
                              <AdjustmentsHorizontalIcon className="h-4 w-4 text-[#087f80]" />
                              Multi-Select Filter
                            </span>
                            {(selectedLanguages.length > 0 || selectedCategories.length > 0) && (
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedLanguages([]);
                                  setSelectedCategories([]);
                                }}
                                className="text-[11px] font-bold text-[#f04f3e] hover:underline cursor-pointer"
                              >
                                Clear all ({selectedLanguages.length + selectedCategories.length})
                              </button>
                            )}
                          </div>

                          {/* 1. Multi-Select Languages */}
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <label className="text-[11px] font-bold text-[#557180] flex items-center gap-1">
                                <LanguageIcon className="h-3.5 w-3.5 text-[#087f80]" />
                                Languages (เลือกได้มากกว่าหนึ่งภาษา)
                              </label>
                              {selectedLanguages.length > 0 && (
                                <button
                                  type="button"
                                  onClick={() => setSelectedLanguages([])}
                                  className="text-[10px] text-[#087f80] hover:underline cursor-pointer font-bold"
                                >
                                  Reset ({selectedLanguages.length})
                                </button>
                              )}
                            </div>
                            <div className="grid grid-cols-2 gap-1.5 max-h-36 overflow-y-auto pr-1">
                              {[
                                { id: "Thai", label: "Thai (ไทย)" },
                                { id: "Burmese", label: "Burmese (พม่า)" },
                                { id: "Mandarin", label: "Mandarin (จีนกลาง)" },
                                { id: "English", label: "English (อังกฤษ)" },
                                { id: "Vietnamese", label: "Vietnamese (เวียดนาม)" },
                                { id: "Japanese", label: "Japanese (ญี่ปุ่น)" },
                                { id: "Russian", label: "Russian (รัสเซีย)" },
                              ].map((lang) => {
                                const isChecked = selectedLanguages.includes(lang.id);
                                return (
                                  <label
                                    key={lang.id}
                                    onClick={() => toggleLanguage(lang.id)}
                                    className={`flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-xs font-semibold cursor-pointer transition-colors ${
                                      isChecked
                                        ? "border-[#087f80] bg-[#edf7f5] text-[#087f80]"
                                        : "border-[#e0eaee] bg-[#f9fbfb] text-[#244253] hover:bg-white"
                                    }`}
                                  >
                                    <span
                                      className={`flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded border ${
                                        isChecked
                                          ? "border-[#087f80] bg-[#087f80] text-white"
                                          : "border-[#b8cbd2] bg-white"
                                      }`}
                                    >
                                      {isChecked && <CheckIcon className="h-2.5 w-2.5 stroke-[3]" />}
                                    </span>
                                    <span className="truncate">{lang.label}</span>
                                  </label>
                                );
                              })}
                            </div>
                          </div>

                          {/* 2. Multi-Select Categories (Optional per user requirement) */}
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <label className="text-[11px] font-bold text-[#557180] flex items-center gap-1">
                                <BriefcaseIcon className="h-3.5 w-3.5 text-[#087f80]" />
                                Specialty Categories (เลือกได้มากกว่าหนึ่ง - Optional)
                              </label>
                              {selectedCategories.length > 0 && (
                                <button
                                  type="button"
                                  onClick={() => setSelectedCategories([])}
                                  className="text-[10px] text-[#087f80] hover:underline cursor-pointer font-bold"
                                >
                                  Reset ({selectedCategories.length})
                                </button>
                              )}
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-36 overflow-y-auto pr-1">
                              {[
                                { id: "Medical", label: "Medical (การแพทย์)" },
                                { id: "Tourism", label: "Tourism (การท่องเที่ยว)" },
                                { id: "Police station", label: "Police Station (ตำรวจ)" },
                                { id: "Legal Documentation", label: "Legal (เอกสารกฎหมาย)" },
                                { id: "Labour Assistance", label: "Labour (แรงงาน)" },
                              ].map((cat) => {
                                const isChecked = selectedCategories.includes(cat.id);
                                return (
                                  <label
                                    key={cat.id}
                                    onClick={() => toggleCategory(cat.id)}
                                    className={`flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-xs font-semibold cursor-pointer transition-colors ${
                                      isChecked
                                        ? "border-[#087f80] bg-[#edf7f5] text-[#087f80]"
                                        : "border-[#e0eaee] bg-[#f9fbfb] text-[#244253] hover:bg-white"
                                    }`}
                                  >
                                    <span
                                      className={`flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded border ${
                                        isChecked
                                          ? "border-[#087f80] bg-[#087f80] text-white"
                                          : "border-[#b8cbd2] bg-white"
                                      }`}
                                    >
                                      {isChecked && <CheckIcon className="h-2.5 w-2.5 stroke-[3]" />}
                                    </span>
                                    <span className="truncate">{cat.label}</span>
                                  </label>
                                );
                              })}
                            </div>
                          </div>

                          {/* Active Filter Summary and Apply */}
                          <div className="border-t border-[#edf2f5] pt-3 flex items-center justify-between">
                            <span className="text-[11px] text-[#698492]">
                              Found: <strong className="text-[#102938]">{displayedApplicants.length}</strong> candidates
                            </span>
                            <button
                              type="button"
                              onClick={() => setFilterMenuOpen(false)}
                              className="rounded-lg bg-[#087f80] px-4 py-1.5 text-xs font-bold text-white hover:bg-[#066a6a] cursor-pointer"
                            >
                              Done
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Reset Button (Visible if active filter or search) */}
                    {(searchQuery || selectedLanguages.length > 0 || selectedCategories.length > 0) && (
                      <button
                        type="button"
                        onClick={() => {
                          setSearchQuery("");
                          setSelectedLanguages([]);
                          setSelectedCategories([]);
                        }}
                        className="inline-flex items-center gap-1 rounded-xl border border-[#d3e0e5] bg-[#f2f7f9] px-2.5 py-1.5 text-xs font-bold text-[#325263] hover:bg-[#e4eff2] cursor-pointer"
                      >
                        <ArrowPathIcon className="h-3 w-3" />
                        Reset
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Clean Table List with Grid Dividers (Matched to Admin style, min-h-[480px] for elegant default proportions) */}
            {(navSection === "queue" || navSection === "approved" || navSection === "rejected") && (
              <div className="min-h-[480px] rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col justify-between">
                <div className="overflow-x-auto flex-1">
                  <table className="w-full text-left border-collapse text-xs text-slate-600">
                    <thead className="border-b border-slate-200 bg-slate-50/90 font-bold uppercase tracking-wider text-slate-500">
                      <tr>
                        <th className="py-3.5 pl-5 pr-4 w-[26%]">Applicant & Time</th>
                        <th className="px-3.5 py-3.5 w-[18%]">Primary Pair</th>
                        <th className="px-3.5 py-3.5 w-[22%]">Specialty Domains</th>
                        <th className="px-3.5 py-3.5 w-[13%] text-center">Background</th>
                        <th className="px-3.5 py-3.5 w-[11%] text-center">Status</th>
                        <th className="py-3.5 pr-5 pl-3 text-right w-[10%]">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {displayedApplicants.length > 0 ? (
                        displayedApplicants.map((app) => (
                          <tr
                            key={app.id}
                            onClick={() => handleOpenDetailModal(app)}
                            className="group hover:bg-teal-50/40 transition-colors cursor-pointer"
                          >
                            {/* Applicant & Time */}
                            <td className="py-3.5 pl-5 pr-4">
                              <div className="flex items-center gap-3">
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#092f45] text-xs font-black text-white shadow-2xs">
                                  {app.name.slice(0, 2).toUpperCase()}
                                </div>
                                <div>
                                  <p className="font-bold text-sm text-[#092f45] group-hover:text-[#087f80] transition-colors">
                                    {app.name}
                                  </p>
                                  <p className="text-[11px] text-slate-500 font-mono">
                                    {app.appliedDate.split(" ")[1]} · {app.country}
                                  </p>
                                </div>
                              </div>
                            </td>

                            {/* Primary Pair */}
                            <td className="px-3.5 py-3.5">
                              <span className="font-bold text-[#092f45]">
                                {app.primaryLanguage} - Mandarin Chinese
                              </span>
                              <p className="text-[10px] text-slate-400 mt-0.5">
                                +{app.spokenLanguages.length - 1} other language(s)
                              </p>
                            </td>

                            {/* Specialty Domains */}
                            <td className="px-3.5 py-3.5">
                              <div className="flex flex-wrap gap-1">
                                {app.specialtyCategories.map((spec) => (
                                  <span
                                    key={spec}
                                    className="rounded-md bg-[#edf7f5] px-2 py-0.5 text-[10px] font-bold text-[#087f80] border border-teal-200/50"
                                  >
                                    {spec}
                                  </span>
                                ))}
                              </div>
                            </td>

                            {/* Background Check */}
                            <td className="px-3.5 py-3.5 text-center">
                              <span
                                className={`inline-flex items-center justify-center gap-1 min-w-[84px] rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${
                                  app.backgroundCheck === "Passed"
                                    ? "bg-[#e8f5f1] text-[#087557] border-[#087557]/20"
                                    : "bg-[#fef5e8] text-[#b56e18] border-[#b56e18]/20"
                                }`}
                              >
                                <ShieldCheckIcon className="h-3 w-3 shrink-0" />
                                <span>{app.backgroundCheck}</span>
                              </span>
                            </td>

                            {/* Status with Dot Indicator */}
                            <td className="px-3.5 py-3.5 text-center">
                              <span
                                className={`inline-flex items-center justify-center gap-1.5 min-w-[92px] rounded-full px-2.5 py-1 text-[10px] font-extrabold border ${
                                  app.status === "Approved"
                                    ? "bg-[#e7f5f0] text-[#087557] border-[#087557]/20"
                                    : app.status === "Rejected"
                                    ? "bg-[#fff1ef] text-[#d93829] border-[#d93829]/20"
                                    : app.status === "Under Review"
                                    ? "bg-[#e8f2f8] text-[#1a5b82] border-[#1a5b82]/20"
                                    : "bg-[#fef4e8] text-[#b36916] border-[#b36916]/20"
                                }`}
                              >
                                <span
                                  className={`h-1.5 w-1.5 rounded-full shrink-0 ${
                                    app.status === "Approved"
                                      ? "bg-[#087557]"
                                      : app.status === "Rejected"
                                      ? "bg-[#d93829]"
                                      : app.status === "Under Review"
                                      ? "bg-[#1a5b82]"
                                      : "bg-[#b36916]"
                                  }`}
                                />
                                <span>{app.status}</span>
                              </span>
                            </td>

                            {/* Action Buttons */}
                            <td className="py-3.5 pr-5 pl-3 text-right">
                              <div
                                className="flex items-center justify-end gap-1"
                                onClick={(e) => e.stopPropagation()}
                              >
                                {app.status !== "Approved" && (
                                  <button
                                    type="button"
                                    title="Quick Approve"
                                    onClick={() => handleApprove(app.id)}
                                    className="rounded-lg p-1.5 text-[#087557] hover:bg-[#e7f5f0] transition-colors cursor-pointer"
                                  >
                                    <CheckCircleIcon className="h-4 w-4" />
                                  </button>
                                )}
                                <button
                                  type="button"
                                  title="Contact Applicant"
                                  onClick={() => alert(`Direct contact for ${app.name}: ${app.contactChannels}`)}
                                  className="rounded-lg p-1.5 text-[#3e5b6a] hover:bg-[#edf3f6] transition-colors cursor-pointer"
                                >
                                  <PhoneIcon className="h-4 w-4" />
                                </button>
                                <button
                                  type="button"
                                  title="Inspect Dossier"
                                  onClick={() => handleOpenDetailModal(app)}
                                  className="rounded-lg p-1.5 text-[#3e5b6a] hover:bg-[#edf3f6] transition-colors cursor-pointer"
                                >
                                  <EllipsisHorizontalIcon className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} className="py-12 text-center text-xs text-slate-400">
                            No applicants found matching this criteria.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Tickets View (Support Desk - FR-51, FR-52, BR-08) */}
            {navSection === "tickets" && (
              <div className="min-h-[480px] rounded-2xl border border-[#d8e3e7] bg-white p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-[#edf2f4] pb-4">
                  <div>
                    <h2 className="text-base font-extrabold text-[#112d3f]">
                      Live Mission Assistance & Support Requests (FR-51, FR-52)
                    </h2>
                    <p className="mt-1 text-xs text-[#637d8b]">
                      Urgent assistance tickets filed by users or interpreters requiring active coordinator dispatch.
                    </p>
                  </div>
                  <span className="rounded-full bg-[#edf7f5] px-3 py-1 text-xs font-bold text-[#087f80]">
                    Active Escalations: {openTicketCount}
                  </span>
                </div>

                <div className="space-y-3">
                  {tickets.map((ticket) => (
                    <div
                      key={ticket.id}
                      className="rounded-xl border border-[#dbe6ec] p-4 transition-colors hover:border-[#087f80] bg-white"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-2.5">
                          <span
                            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg mt-0.5 ${
                              ticket.urgency === "urgent" ? "bg-[#f04f3e] text-white" : "bg-[#edf4f7] text-[#092f45]"
                            }`}
                          >
                            <ExclamationTriangleIcon className="h-4 w-4" />
                          </span>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-extrabold text-sm text-[#143242]">{ticket.title}</h3>
                              <span className="rounded-md bg-[#edf4f7] px-2 py-0.5 text-[10px] font-bold text-[#092f45]">
                                {ticket.category}
                              </span>
                            </div>
                            <p className="text-[11px] text-[#6b8491] mt-0.5">
                              #{ticket.id} · Mission: <strong className="text-[#087f80]">{ticket.missionId}</strong> · From {ticket.requesterName} ({ticket.requesterRole}) · {ticket.createdAt}
                            </p>
                          </div>
                        </div>
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[11px] font-extrabold ${
                            ticket.status === "Resolved"
                              ? "bg-[#e8f5f1] text-[#087557]"
                              : ticket.status === "In Progress"
                              ? "bg-[#e8f2f8] text-[#1a5b82]"
                              : "bg-[#fff1ef] text-[#f04f3e]"
                          }`}
                        >
                          {ticket.status}
                        </span>
                      </div>

                      <p className="mt-3 text-xs text-[#355261] bg-[#f8fbfc] p-3 rounded-lg border border-[#e4ecf0] leading-relaxed">
                        {ticket.detail}
                      </p>

                      {/* Previous response if resolved */}
                      {ticket.response && (
                        <div className="mt-2.5 rounded-lg border border-[#cbe4dc] bg-[#f2f9f6] p-3 text-xs text-[#144f3d]">
                          <strong className="font-extrabold text-[#087557]">Manager Response (Recorded):</strong>
                          <p className="mt-1">{ticket.response}</p>
                        </div>
                      )}

                      {/* Reply Input Form */}
                      {activeReplyingTicketId === ticket.id ? (
                        <div className="mt-3 space-y-2 border-t border-[#edf2f5] pt-3">
                          <textarea
                            value={ticketReplyText}
                            onChange={(e) => setTicketReplyText(e.target.value)}
                            placeholder="Type resolution dispatch or reply note for the requester..."
                            rows={2}
                            className="w-full rounded-xl border border-[#cddce2] p-2.5 text-xs text-[#143242] focus:border-[#087f80] focus:outline-none"
                          />
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setActiveReplyingTicketId(null);
                                setTicketReplyText("");
                              }}
                              className="rounded-lg px-3 py-1.5 text-xs font-semibold text-[#66818f] hover:bg-[#edf2f5] cursor-pointer"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSendTicketReply(ticket.id)}
                              disabled={!ticketReplyText.trim()}
                              className="inline-flex items-center gap-1.5 rounded-lg bg-[#087f80] px-4 py-1.5 text-xs font-bold text-white hover:bg-[#066869] disabled:opacity-50 cursor-pointer"
                            >
                              <PaperAirplaneIcon className="h-3.5 w-3.5" />
                              Send & Resolve Ticket
                            </button>
                          </div>
                        </div>
                      ) : (
                        ticket.status !== "Resolved" && (
                          <div className="mt-3 flex justify-end">
                            <button
                              type="button"
                              onClick={() => {
                                setActiveReplyingTicketId(ticket.id);
                                setTicketReplyText("");
                              }}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-[#cde0e7] bg-white px-3.5 py-1.5 text-xs font-bold text-[#087f80] hover:bg-[#f0f6f8] cursor-pointer"
                            >
                              <ChatBubbleLeftRightIcon className="h-3.5 w-3.5" />
                              Respond to Requester
                            </button>
                          </div>
                        )
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reports & Disputes View (FR-53) */}
            {navSection === "reports" && (
              <div className="min-h-[480px] rounded-2xl border border-[#d8e3e7] bg-white p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-[#edf2f4] pb-4">
                  <div>
                    <h2 className="text-base font-extrabold text-[#112d3f]">
                      Incident Reports & Disputes (FR-53)
                    </h2>
                    <p className="mt-1 text-xs text-[#647f8d]">
                      Misconduct reports filed by users or interpreters for operational triage and Admin escalation.
                    </p>
                  </div>
                  <span className="rounded-full bg-[#fef5e8] px-3 py-1 text-xs font-bold text-[#b56e18]">
                    Pending Cases: {pendingReportCount}
                  </span>
                </div>

                <div className="space-y-3">
                  {reports.map((report) => (
                    <div
                      key={report.id}
                      className="rounded-xl border border-[#dbe6ec] p-4 transition-colors hover:border-[#087f80] bg-white"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-2.5">
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#fff1ef] text-[#d93829] mt-0.5">
                            <ShieldExclamationIcon className="h-4 w-4" />
                          </span>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-extrabold text-sm text-[#143242]">
                                Incident #{report.id}
                              </h3>
                              <span className="text-xs text-[#6b8491]">
                                Booking Ref: <strong className="text-[#087f80]">{report.bookingId}</strong>
                              </span>
                            </div>
                            <p className="text-[11px] text-[#6b8491] mt-0.5">
                              Reported by: <strong className="text-[#102938]">{report.reporterName}</strong> ({report.reporterRole}) · Against: <strong className="text-[#c0392b]">{report.reportedUserName}</strong> ({report.reportedUserRole}) · {report.createdAt}
                            </p>
                          </div>
                        </div>

                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[11px] font-extrabold ${
                            report.status === "Resolved"
                              ? "bg-[#e8f5f1] text-[#087557]"
                              : report.status === "Escalated to Admin"
                              ? "bg-[#eef2f6] text-[#2c4755]"
                              : "bg-[#fef4e8] text-[#b36916]"
                          }`}
                        >
                          {report.status}
                        </span>
                      </div>

                      <div className="mt-3 rounded-lg border border-[#e4ecf0] bg-[#f8fbfc] p-3 text-xs leading-relaxed text-[#355261]">
                        <p className="font-bold text-[#143141]">Reported Issue:</p>
                        <p className="mt-0.5">{report.reason}</p>
                      </div>

                      {report.actionTaken && (
                        <div className="mt-2.5 rounded-lg border border-[#e2e8f0] bg-[#f8fafc] p-2.5 text-xs text-[#334155]">
                          <strong className="font-bold text-[#0f172a]">Action Status:</strong> {report.actionTaken}
                        </div>
                      )}

                      {/* Action buttons */}
                      {report.status === "Pending Investigation" && (
                        <div className="mt-3 flex items-center justify-end gap-2 border-t border-[#edf2f5] pt-3">
                          <button
                            type="button"
                            onClick={() => handleEscalateReport(report.id)}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-[#092f45] px-4 py-1.5 text-xs font-bold text-white hover:bg-[#12425e] cursor-pointer"
                          >
                            <ShieldCheckIcon className="h-3.5 w-3.5 text-[#f59e0b]" />
                            Escalate to Admin Portal (Lock Account FR-78)
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </main>

          {/* FOOTER inside right column */}
          <SiteFooter
            copy={{
              description: "KHVI Operational Management Portal for authorized managers and team leads.",
              note: "Internal Operations Hub",
              explore: "Console",
              safety: "Security Policy",
              needHelp: "Operations Support",
              needHelpBody: "For system administrator escalation, contact the root admin channel.",
              footerCta: "View Audit Log",
              privacy: "All manager actions are strictly logged for compliance and security audit.",
              links: {
                map: "Overview",
                how: "Verification SOP",
                roles: "Role Hierarchy",
                privacy: "Privacy Standard",
                request: "Support Desk",
                signIn: "Switch Account",
              },
            }}
            brandSubtitle="Operations Console"
          />
        </div>
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

