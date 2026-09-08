"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import {
  AdjustmentsHorizontalIcon,
  ArchiveBoxXMarkIcon,
  ArrowLeftOnRectangleIcon,
  ArrowPathIcon,
  Bars3Icon,
  BriefcaseIcon,
  ChatBubbleLeftRightIcon,
  CheckBadgeIcon,
  CheckCircleIcon,
  CheckIcon,
  ChevronDownIcon,
  DocumentTextIcon,
  EllipsisHorizontalIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  IdentificationIcon,
  InboxStackIcon,
  LanguageIcon,
  MagnifyingGlassIcon,
  PaperAirplaneIcon,
  PhoneIcon,
  ShieldCheckIcon,
  ShieldExclamationIcon,
  UserCircleIcon,
  XCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { BrandMark } from "../components/brand-mark";
import { SiteFooter } from "../components/site-footer";

type ApplicantDocument = {
  name: string;
  type: "id" | "cert" | "cv" | "police";
  size: string;
};

type InterpreterApplicant = {
  id: string;
  name: string;
  age: number;
  country: string;
  primaryLanguage: string;
  spokenLanguages: string[];
  specialtyCategories: string[];
  experienceSummary: string;
  contactChannels: string;
  appliedDate: string;
  status: "Pending" | "Under Review" | "Approved" | "Rejected";
  rejectionReason?: string;
  documents: ApplicantDocument[];
  backgroundCheck: "Passed" | "Pending" | "Requires Review";
  proficiencyScore?: string;
};

type HelpTicket = {
  id: string;
  requesterName: string;
  requesterRole: "User" | "Interpreter";
  category: "Safety" | "Communication" | "No-Show" | "Other";
  missionId: string;
  title: string;
  detail: string;
  createdAt: string;
  status: "Open" | "In Progress" | "Resolved";
  urgency: "urgent" | "normal";
  response?: string;
};

type IncidentReport = {
  id: string;
  reporterName: string;
  reporterRole: "User" | "Interpreter";
  reportedUserName: string;
  reportedUserRole: "User" | "Interpreter";
  bookingId: string;
  reason: string;
  createdAt: string;
  status: "Pending Investigation" | "Escalated to Admin" | "Resolved";
  actionTaken?: string;
};

const initialApplicants: InterpreterApplicant[] = [
  {
    id: "APP-101",
    name: "Sompong Vorakul",
    age: 32,
    country: "Thailand",
    primaryLanguage: "Thai",
    spokenLanguages: ["Thai", "Mandarin Chinese"],
    specialtyCategories: ["Medical", "Tourism"],
    experienceSummary: "5 years volunteer medical translator at community clinics and emergency relief stations in Bangkok.",
    contactChannels: "Line: sompong_v | Tel: 081-234-5678",
    appliedDate: "2026-09-07 14:20",
    status: "Pending",
    backgroundCheck: "Passed",
    proficiencyScore: "Native Thai, HSK 5 (Mandarin)",
    documents: [
      { name: "Thai_National_ID.pdf", type: "id", size: "1.4 MB" },
      { name: "Medical_Interpreting_Cert.pdf", type: "cert", size: "2.1 MB" },
      { name: "CV_Sompong_2026.pdf", type: "cv", size: "850 KB" },
    ],
  },
  {
    id: "APP-102",
    name: "Lin Wei Chen",
    age: 28,
    country: "Taiwan",
    primaryLanguage: "Mandarin Chinese",
    spokenLanguages: ["Mandarin Chinese", "English"],
    specialtyCategories: ["Police station", "Legal Documentation"],
    experienceSummary: "Certified legal and administrative interpreter in Taipei, fluent in consular procedures and consular crisis aid.",
    contactChannels: "WeChat: linwei_tw | Email: linwei@example.com",
    appliedDate: "2026-09-07 11:05",
    status: "Under Review",
    backgroundCheck: "Passed",
    proficiencyScore: "TOCFL Level 6 (Native), IELTS 8.0",
    documents: [
      { name: "Passport_Scan_LinWei.pdf", type: "id", size: "2.3 MB" },
      { name: "Legal_Translation_License.pdf", type: "cert", size: "3.5 MB" },
      { name: "Police_Clearance_Cert.pdf", type: "police", size: "1.1 MB" },
    ],
  },
  {
    id: "APP-103",
    name: "Aung Myo Zaw",
    age: 26,
    country: "Myanmar",
    primaryLanguage: "Burmese",
    spokenLanguages: ["Burmese"],
    specialtyCategories: ["Labour Assistance", "Medical"],
    experienceSummary: "Active frontline interpreter for Myanmar migrant worker health clinic and hospital emergency ward in Samut Sakhon.",
    contactChannels: "Viber: aungmyo_zaw | Tel: 089-876-5432",
    appliedDate: "2026-09-06 18:40",
    status: "Pending",
    backgroundCheck: "Passed",
    proficiencyScore: "Native Burmese Fluency",
    documents: [
      { name: "Alien_Registration_Card.pdf", type: "id", size: "980 KB" },
      { name: "Community_Health_Volunteer_Cert.pdf", type: "cert", size: "1.8 MB" },
      { name: "Resume_AungMyo.pdf", type: "cv", size: "620 KB" },
    ],
  },
  {
    id: "APP-104",
    name: "Nguyen Thi Mai",
    age: 30,
    country: "Vietnam",
    primaryLanguage: "Vietnamese",
    spokenLanguages: ["Vietnamese"],
    specialtyCategories: ["Tourism", "Police station"],
    experienceSummary: "Tourism and immigration assistance coordinator for Vietnamese travelers and expatriates.",
    contactChannels: "Zalo: mai_nguyen | Tel: 092-345-6789",
    appliedDate: "2026-09-05 09:15",
    status: "Under Review",
    backgroundCheck: "Requires Review",
    proficiencyScore: "C2 Vietnamese (Native)",
    documents: [
      { name: "Passport_MaiNguyen.pdf", type: "id", size: "1.9 MB" },
      { name: "Tourism_Guild_Badge.pdf", type: "cert", size: "1.2 MB" },
    ],
  },
  {
    id: "APP-105",
    name: "Kenji Tanaka",
    age: 35,
    country: "Japan",
    primaryLanguage: "Japanese",
    spokenLanguages: ["Japanese", "English"],
    specialtyCategories: ["Medical", "Tourism"],
    experienceSummary: "Former consular aid assistant in Bangkok, experienced with disaster evacuation and hospital referrals.",
    contactChannels: "Line: kenji_t | Email: kenji.tanaka@example.jp",
    appliedDate: "2026-09-04 16:30",
    status: "Approved",
    backgroundCheck: "Passed",
    proficiencyScore: "JLPT N1 (Native), TOEIC 920",
    documents: [
      { name: "Consular_Affidavit.pdf", type: "id", size: "2.8 MB" },
      { name: "Medical_Volunteering_Record.pdf", type: "cert", size: "1.5 MB" },
    ],
  },
  {
    id: "APP-106",
    name: "Elena Rostova",
    age: 29,
    country: "Russia",
    primaryLanguage: "Russian",
    spokenLanguages: ["Russian", "English"],
    specialtyCategories: ["Tourism"],
    experienceSummary: "Hospitality assistance volunteer for Russian tourists in Phuket and Pattaya area.",
    contactChannels: "Telegram: elena_rost | Tel: 095-112-2334",
    appliedDate: "2026-09-03 13:00",
    status: "Rejected",
    rejectionReason: "Incomplete documentation: missing primary identity verification and criminal record clearance certificate.",
    backgroundCheck: "Requires Review",
    proficiencyScore: "Native Russian, IELTS 7.5",
    documents: [
      { name: "Resume_Draft.pdf", type: "cv", size: "450 KB" },
    ],
  },
];

const initialTickets: HelpTicket[] = [
  {
    id: "HLP-801",
    requesterName: "Mei Ling Zhang",
    requesterRole: "User",
    category: "Communication",
    missionId: "MSN-4421",
    title: "Interpreter cannot arrive at emergency room in time",
    detail: "Current traffic blockage around Din Daeng. Need immediate alternative interpreter or remote phone assist.",
    createdAt: "10 mins ago",
    status: "Open",
    urgency: "urgent",
  },
  {
    id: "HLP-802",
    requesterName: "David Miller",
    requesterRole: "Interpreter",
    category: "Safety",
    missionId: "MSN-4418",
    title: "Requester location appears different from map coordinate",
    detail: "Arrived at Bang Rak junction, but requester notes mention a building 1 km further east.",
    createdAt: "35 mins ago",
    status: "In Progress",
    urgency: "normal",
    response: "Manager contacted requester via WhatsApp to send real-time pinpoint location.",
  },
];

const initialReports: IncidentReport[] = [
  {
    id: "REP-301",
    reporterName: "Dr. Somchai (ER Chula)",
    reporterRole: "User",
    reportedUserName: "Alexei V.",
    reportedUserRole: "Interpreter",
    bookingId: "BKG-9920",
    reason: "Interpreter failed to show up without prior cancellation notice during emergency patient admission.",
    createdAt: "2026-09-07 19:40",
    status: "Pending Investigation",
  },
  {
    id: "REP-302",
    reporterName: "Kanya S. (Volunteer)",
    reporterRole: "Interpreter",
    reportedUserName: "Tourist John D.",
    reportedUserRole: "User",
    bookingId: "BKG-9844",
    reason: "Verbal misconduct and demanding off-platform private guiding beyond medical translation scope.",
    createdAt: "2026-09-06 14:15",
    status: "Escalated to Admin",
    actionTaken: "Escalated to Admin Portal for user account lock evaluation (FR-78, FR-80).",
  },
];

function ManagerHeader({ onMenuClick }: { onMenuClick?: () => void }) {
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
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#c9d8de] bg-white text-[#092f45] shadow-xs hover:border-[#087f80] hover:bg-[#edf7f5] hover:text-[#087f80] transition-colors md:hidden focus:outline-none focus:ring-2 focus:ring-[#087f80]/30 cursor-pointer"
            aria-label="Open Navigation Menu"
          >
            <Bars3Icon className="h-5 w-5" />
          </button>
          <BrandMark subtitle="Community interpreter map" />
        </div>

        {/* Account Profile */}
        <div className="flex items-center gap-4">

          <div className="relative" ref={profileMenuRef}>
            <button
              type="button"
              onClick={() => setProfileMenuOpen(!profileMenuOpen)}
              className="flex items-center gap-2.5 rounded-xl border border-[#d6e0e4] bg-white px-3 py-1.5 transition-colors hover:border-[#087f80]"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#092f45] text-xs font-black text-white">
                TY
              </div>
              <div className="text-left hidden md:block">
                <p className="text-xs font-black leading-tight text-[#143141]">Taofix yayueri</p>
                <p className="text-[10px] font-bold text-[#087f80]">Regional Manager</p>
              </div>
              <ChevronDownIcon
                className={`h-4 w-4 text-[#6e848e] transition-transform ${
                  profileMenuOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Profile Dropdown Menu */}
            {profileMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 rounded-xl border border-[#d6e0e4] bg-white p-2 shadow-[0_18px_36px_rgba(19,52,68,0.16)] animate-in fade-in zoom-in-95">
                <div className="border-b border-[#eef3f5] px-3 py-2.5">
                  <p className="text-sm font-extrabold text-[#153447]">Taofix yayueri</p>
                  <p className="text-xs text-[#6a808a]">tyayuxri@gmail.com</p>
                  <span className="mt-2 inline-flex items-center gap-1 rounded-md bg-[#e6f4ef] px-2 py-0.5 text-[11px] font-bold text-[#087557]">
                    <CheckBadgeIcon className="h-3.5 w-3.5" />
                    Verified Staff
                  </span>
                </div>
                <div className="py-1">
                  <a
                    href="#profile"
                    onClick={() => setProfileMenuOpen(false)}
                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-bold text-[#2d4957] transition-colors hover:bg-[#f2f7f9] hover:text-[#087f80]"
                  >
                    <UserCircleIcon className="h-4 w-4" />
                    Manager Profile & Settings
                  </a>
                </div>
                <div className="border-t border-[#eef3f5] pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setProfileMenuOpen(false);
                      alert("Simulating sign out");
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

export default function ManagerDashboard() {
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

  // Rejection Modal State
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

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
  const handleConfirmReject = () => {
    if (!selectedApplicant || !rejectReason.trim()) return;
    setApplicants((prev) =>
      prev.map((app) =>
        app.id === selectedApplicant.id
          ? { ...app, status: "Rejected", rejectionReason: rejectReason }
          : app
      )
    );
    setRejectModalOpen(false);
    setRejectReason("");
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
    <div className="flex min-h-screen flex-col bg-[#f7f9fa] text-[#092f45] antialiased">
      <ManagerHeader onMenuClick={() => setIsMobileDrawerOpen(true)} />

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
                    <h3 className="text-xs font-extrabold text-[#092f45]">Manager Console</h3>
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

              {/* Navigation Links in Mobile Drawer */}
              <div>
                <p className="px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Interpreter Verification
                </p>
                <nav className="mt-2 space-y-1.5">
                  <button
                    onClick={() => {
                      setNavSection("queue");
                      setIsMobileDrawerOpen(false);
                    }}
                    className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-bold transition-all ${
                      navSection === "queue"
                        ? "bg-[#087f80] text-white shadow-md shadow-[#087f80]/20"
                        : "text-slate-600 hover:bg-slate-100 hover:text-[#092f45]"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <InboxStackIcon className="h-4 w-4" />
                      <span>Application Queue</span>
                    </div>
                    {pendingCount > 0 && (
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold ${
                          navSection === "queue"
                            ? "bg-white/20 text-white"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {pendingCount}
                      </span>
                    )}
                  </button>

                  <button
                    onClick={() => {
                      setNavSection("approved");
                      setIsMobileDrawerOpen(false);
                    }}
                    className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-bold transition-all ${
                      navSection === "approved"
                        ? "bg-[#087f80] text-white shadow-md shadow-[#087f80]/20"
                        : "text-slate-600 hover:bg-slate-100 hover:text-[#092f45]"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <CheckCircleIcon className="h-4 w-4" />
                      <span>Approved Volunteers</span>
                    </div>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold ${
                        navSection === "approved"
                          ? "bg-white/20 text-white"
                          : "bg-teal-100 text-[#087f80]"
                      }`}
                    >
                      {approvedCount}
                    </span>
                  </button>

                  <button
                    onClick={() => {
                      setNavSection("rejected");
                      setIsMobileDrawerOpen(false);
                    }}
                    className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-bold transition-all ${
                      navSection === "rejected"
                        ? "bg-[#087f80] text-white shadow-md shadow-[#087f80]/20"
                        : "text-slate-600 hover:bg-slate-100 hover:text-[#092f45]"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <ArchiveBoxXMarkIcon className="h-4 w-4" />
                      <span>Rejected Applications</span>
                    </div>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold ${
                        navSection === "rejected"
                          ? "bg-white/20 text-white"
                          : "bg-red-100 text-[#d93829]"
                      }`}
                    >
                      {rejectedCount}
                    </span>
                  </button>
                </nav>
              </div>

              {/* Group 2 in Mobile Drawer */}
              <div className="border-t border-slate-100 pt-3">
                <p className="px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Support & Escalations
                </p>
                <nav className="mt-2 space-y-1.5">
                  <button
                    onClick={() => {
                      setNavSection("tickets");
                      setIsMobileDrawerOpen(false);
                    }}
                    className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-bold transition-all ${
                      navSection === "tickets"
                        ? "bg-[#087f80] text-white shadow-md shadow-[#087f80]/20"
                        : "text-slate-600 hover:bg-slate-100 hover:text-[#092f45]"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <ChatBubbleLeftRightIcon className="h-4 w-4" />
                      <span>Help Requests (Live)</span>
                    </div>
                    {openTicketCount > 0 && (
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold ${
                          navSection === "tickets"
                            ? "bg-white/20 text-white"
                            : "bg-red-100 text-[#f04f3e]"
                        }`}
                      >
                        {openTicketCount}
                      </span>
                    )}
                  </button>

                  <button
                    onClick={() => {
                      setNavSection("reports");
                      setIsMobileDrawerOpen(false);
                    }}
                    className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-bold transition-all ${
                      navSection === "reports"
                        ? "bg-[#087f80] text-white shadow-md shadow-[#087f80]/20"
                        : "text-slate-600 hover:bg-slate-100 hover:text-[#092f45]"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <ShieldExclamationIcon className="h-4 w-4" />
                      <span>Incident Reports</span>
                    </div>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold ${
                        navSection === "reports"
                          ? "bg-white/20 text-white"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {pendingReportCount}
                    </span>
                  </button>
                </nav>
              </div>
            </div>

            {/* Quick KPI & Environment in Mobile Drawer */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-500">
              <p className="font-semibold text-slate-700 text-[11px]">Regional Hub: Bangkok Central</p>
              <p className="text-[10px]">Verified Active Pool: 48 interpreters</p>
              <p className="text-[10px]">Compliance: PDPA / ISO 27001</p>
            </div>
          </aside>
        </div>
      )}

      {/* Body Container: Sidebar (Desktop) + Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden md:flex-row">
        {/* Left Sidebar (Desktop only - matches admin style) */}
        <aside className="hidden w-64 flex-shrink-0 border-r border-slate-200 bg-white p-4 md:flex md:flex-col justify-between">
          <div className="space-y-6">
            {/* Hub Header Card */}
            <div className="flex items-center gap-3 px-2 py-1">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#092f45] font-extrabold text-white shadow-xs">
                KH
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-[#112d3f]">Regional Hub</h3>
                <p className="text-[11px] text-slate-500">Bangkok Operations</p>
              </div>
            </div>

            {/* Group 1: Verification Hub */}
            <div>
              <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Interpreter Verification
              </p>
              <nav className="mt-2 space-y-1">
                <button
                  type="button"
                  onClick={() => setNavSection("queue")}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-semibold transition-all cursor-pointer ${
                    navSection === "queue"
                      ? "bg-[#087f80] text-white shadow-md shadow-[#087f80]/20"
                      : "text-slate-600 hover:bg-slate-100 hover:text-[#092f45]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <InboxStackIcon className="h-5 w-5" />
                    <span>Application Queue</span>
                  </div>
                  {pendingCount > 0 && (
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                        navSection === "queue"
                          ? "bg-white/20 text-white"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {pendingCount}
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setNavSection("approved")}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-semibold transition-all cursor-pointer ${
                    navSection === "approved"
                      ? "bg-[#087f80] text-white shadow-md shadow-[#087f80]/20"
                      : "text-slate-600 hover:bg-slate-100 hover:text-[#092f45]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <CheckCircleIcon className="h-5 w-5" />
                    <span>Approved Volunteers</span>
                  </div>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                      navSection === "approved"
                        ? "bg-white/20 text-white"
                        : "bg-teal-100 text-[#087f80]"
                    }`}
                  >
                    {approvedCount}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setNavSection("rejected")}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-semibold transition-all cursor-pointer ${
                    navSection === "rejected"
                      ? "bg-[#087f80] text-white shadow-md shadow-[#087f80]/20"
                      : "text-slate-600 hover:bg-slate-100 hover:text-[#092f45]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <ArchiveBoxXMarkIcon className="h-5 w-5" />
                    <span>Rejected Archive</span>
                  </div>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                      navSection === "rejected"
                        ? "bg-white/20 text-white"
                        : "bg-red-100 text-[#d93829]"
                    }`}
                  >
                    {rejectedCount}
                  </span>
                </button>
              </nav>
            </div>

            {/* Group 2: Support & Escalations */}
            <div>
              <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Support & Escalations
              </p>
              <nav className="mt-2 space-y-1">
                <button
                  type="button"
                  onClick={() => setNavSection("tickets")}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-semibold transition-all cursor-pointer ${
                    navSection === "tickets"
                      ? "bg-[#087f80] text-white shadow-md shadow-[#087f80]/20"
                      : "text-slate-600 hover:bg-slate-100 hover:text-[#092f45]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <ChatBubbleLeftRightIcon className="h-5 w-5" />
                    <span>Help Requests</span>
                  </div>
                  {openTicketCount > 0 && (
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                        navSection === "tickets"
                          ? "bg-white/20 text-white"
                          : "bg-red-100 text-[#f04f3e]"
                      }`}
                    >
                      {openTicketCount}
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setNavSection("reports")}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-semibold transition-all cursor-pointer ${
                    navSection === "reports"
                      ? "bg-[#087f80] text-white shadow-md shadow-[#087f80]/20"
                      : "text-slate-600 hover:bg-slate-100 hover:text-[#092f45]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <ShieldExclamationIcon className="h-5 w-5" />
                    <span>Incident Reports</span>
                  </div>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                      navSection === "reports"
                        ? "bg-white/20 text-white"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {pendingReportCount}
                  </span>
                </button>
              </nav>
            </div>
          </div>

          {/* Quick Info / Environment Footer Box */}
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-500">
            <p className="font-semibold text-slate-700">Environment: Operational</p>
            <p className="text-[11px]">KHVI Node: BKK-CORE-01</p>
            <p className="text-[11px]">Pool: 48 Interpreters on Duty</p>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 space-y-5 sm:space-y-6">
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

            {/* Clean Table List (Styling matched to user image) */}
            {(navSection === "queue" || navSection === "approved" || navSection === "rejected") && (
              <div className="rounded-2xl border border-[#d8e3e7] bg-white shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-[#edf2f5] text-[11px] font-bold text-[#718b97] bg-[#fafcfd]">
                        <th className="py-3.5 pl-5 pr-3">Applicant & Time</th>
                        <th className="py-3.5 px-3">Primary Pair</th>
                        <th className="py-3.5 px-3">Specialty Domains</th>
                        <th className="py-3.5 px-3">Background</th>
                        <th className="py-3.5 px-3">Status</th>
                        <th className="py-3.5 pr-5 pl-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#f0f4f6] text-xs">
                      {displayedApplicants.length > 0 ? (
                        displayedApplicants.map((app) => (
                          <tr
                            key={app.id}
                            onClick={() => handleOpenDetailModal(app)}
                            className="group hover:bg-[#f6fafa] transition-colors cursor-pointer"
                          >
                            {/* Applicant & Time */}
                            <td className="py-3 pl-5 pr-3">
                              <div className="flex items-center gap-3">
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#092f45] text-xs font-black text-white shadow-2xs">
                                  {app.name.slice(0, 2).toUpperCase()}
                                </div>
                                <div>
                                  <p className="font-extrabold text-sm text-[#143243] group-hover:text-[#087f80] transition-colors">
                                    {app.name}
                                  </p>
                                  <p className="text-[11px] text-[#718995]">
                                    {app.appliedDate.split(" ")[1]} · {app.country}
                                  </p>
                                </div>
                              </div>
                            </td>

                            {/* Primary Pair */}
                            <td className="py-3 px-3">
                              <span className="font-bold text-[#1f3e4f]">
                                {app.primaryLanguage} - English
                              </span>
                              <p className="text-[10px] text-[#77919e]">
                                +{app.spokenLanguages.length - 1} other language(s)
                              </p>
                            </td>

                            {/* Specialty Domains */}
                            <td className="py-3 px-3">
                              <div className="flex flex-wrap gap-1">
                                {app.specialtyCategories.map((spec) => (
                                  <span
                                    key={spec}
                                    className="rounded-md bg-[#edf7f5] px-2 py-0.5 text-[10px] font-bold text-[#087f80]"
                                  >
                                    {spec}
                                  </span>
                                ))}
                              </div>
                            </td>

                            {/* Background Check */}
                            <td className="py-3 px-3">
                              <span
                                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                                  app.backgroundCheck === "Passed"
                                    ? "bg-[#e8f5f1] text-[#087557]"
                                    : "bg-[#fef5e8] text-[#b56e18]"
                                }`}
                              >
                                <ShieldCheckIcon className="h-3.5 w-3.5" />
                                {app.backgroundCheck}
                              </span>
                            </td>

                            {/* Status with Dot Indicator */}
                            <td className="py-3 px-3">
                              <span
                                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-extrabold ${
                                  app.status === "Approved"
                                    ? "bg-[#e7f5f0] text-[#087557]"
                                    : app.status === "Rejected"
                                    ? "bg-[#fff1ef] text-[#d93829]"
                                    : app.status === "Under Review"
                                    ? "bg-[#e8f2f8] text-[#1a5b82]"
                                    : "bg-[#fef4e8] text-[#b36916]"
                                }`}
                              >
                                <span
                                  className={`h-1.5 w-1.5 rounded-full ${
                                    app.status === "Approved"
                                      ? "bg-[#087557]"
                                      : app.status === "Rejected"
                                      ? "bg-[#d93829]"
                                      : app.status === "Under Review"
                                      ? "bg-[#1a5b82]"
                                      : "bg-[#b36916]"
                                  }`}
                                />
                                {app.status}
                              </span>
                            </td>

                            {/* Action Buttons */}
                            <td className="py-3 pr-5 pl-3 text-right">
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
                          <td colSpan={6} className="py-12 text-center text-xs text-[#708996]">
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
              <div className="rounded-2xl border border-[#d8e3e7] bg-white p-6 shadow-xs space-y-4">
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
              <div className="rounded-2xl border border-[#d8e3e7] bg-white p-6 shadow-xs space-y-4">
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
        </div>

      {/* ================= CENTERED POP-UP MODAL (30% / 70% SPLIT) ================= */}
      {detailModalOpen && selectedApplicant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="relative flex w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-[#d6e0e4] bg-white shadow-[0_24px_56px_rgba(15,38,54,0.25)] sm:flex-row max-h-[90vh]">
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setDetailModalOpen(false)}
              className="absolute right-3.5 top-3.5 z-10 rounded-lg p-1.5 text-[#6c8591] hover:bg-[#edf3f6] hover:text-[#112d3e] transition-colors cursor-pointer"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>

            {/* LEFT COLUMN: 30% (Profile, Photo, Contacts, Demographics) */}
            <div className="w-full sm:w-[32%] border-b sm:border-b-0 sm:border-r border-[#e3ebef] bg-[#f8fbfc] p-6 flex flex-col justify-between">
              <div>
                {/* Avatar & Name */}
                <div className="flex flex-col items-center text-center">
                  <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-[#092f45] text-2xl font-black text-white shadow-md">
                    {selectedApplicant.name.slice(0, 2).toUpperCase()}
                  </div>
                  <h3 className="mt-3 text-base font-black text-[#102d3f]">
                    {selectedApplicant.name}
                  </h3>
                  <p className="text-xs text-[#637d8a]">
                    Application ID: <strong className="text-[#087f80]">#{selectedApplicant.id}</strong>
                  </p>
                  <span
                    className={`mt-2 inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-extrabold ${
                      selectedApplicant.status === "Approved"
                        ? "bg-[#e7f5f0] text-[#087557]"
                        : selectedApplicant.status === "Rejected"
                        ? "bg-[#fff1ef] text-[#d93829]"
                        : "bg-[#fef4e8] text-[#b36916]"
                    }`}
                  >
                    {selectedApplicant.status}
                  </span>
                </div>

                {/* Demographics & Check Badges */}
                <div className="mt-6 space-y-3 text-xs border-t border-[#e8f0f3] pt-4">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#8198a4]">
                      Nationality & Age
                    </span>
                    <p className="font-extrabold text-[#17384a]">
                      {selectedApplicant.country} · {selectedApplicant.age} years old
                    </p>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#8198a4]">
                      Background Validation
                    </span>
                    <div className="mt-1 flex items-center gap-1.5">
                      <ShieldCheckIcon className="h-4 w-4 text-[#087557]" />
                      <span className="font-extrabold text-[#087557]">
                        {selectedApplicant.backgroundCheck}
                      </span>
                    </div>
                  </div>

                  {/* Direct Contact Channels */}
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#8198a4]">
                      Contact Channels
                    </span>
                    <div className="mt-1.5 space-y-1.5 text-xs text-[#2b4857]">
                      <div className="flex items-center gap-2 rounded-lg bg-white p-2 border border-[#e1ebef]">
                        <PhoneIcon className="h-3.5 w-3.5 text-[#087f80]" />
                        <span className="font-bold truncate">{selectedApplicant.contactChannels}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 text-[10px] text-[#869caa]">
                Submission timestamp: {selectedApplicant.appliedDate}
              </div>
            </div>

            {/* RIGHT COLUMN: 70% (Qualifications, Attachments, Experience, Decision Actions) */}
            <div className="w-full sm:w-[68%] p-6 flex flex-col justify-between overflow-y-auto">
              <div className="space-y-5">
                {/* 1. Language Competencies */}
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-[#637f8d] flex items-center gap-1.5">
                    <LanguageIcon className="h-4 w-4 text-[#087f80]" />
                    Language Qualifications & Proficiency
                  </h4>
                  <div className="mt-2 rounded-xl border border-[#e2ecf0] bg-[#fafcfd] p-3">
                    <p className="text-xs text-[#204051]">
                      Primary Language: <strong className="text-[#092f45]">{selectedApplicant.primaryLanguage}</strong>
                    </p>
                    <p className="mt-1 text-xs text-[#204051]">
                      Proficiency Scores: <strong className="text-[#087f80]">{selectedApplicant.proficiencyScore || "Verified Native"}</strong>
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {selectedApplicant.spokenLanguages.map((l) => (
                        <span
                          key={l}
                          className="rounded-md border border-[#d6e3e8] bg-white px-2 py-0.5 text-[11px] font-semibold text-[#224050]"
                        >
                          {l}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 2. Submitted Credential Files */}
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-[#637f8d] flex items-center gap-1.5">
                    <IdentificationIcon className="h-4 w-4 text-[#087f80]" />
                    Submitted Credential Documents ({selectedApplicant.documents.length})
                  </h4>
                  <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {selectedApplicant.documents.map((doc) => (
                      <div
                        key={doc.name}
                        className="flex items-center justify-between rounded-xl border border-[#dce6eb] bg-white p-2.5 transition-colors hover:border-[#087f80]"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <DocumentTextIcon className="h-4 w-4 text-[#087f80] shrink-0" />
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-[#143242] truncate">{doc.name}</p>
                            <p className="text-[10px] text-[#7b93a0]">{doc.size}</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => alert(`Opening preview of ${doc.name}`)}
                          className="text-[11px] font-extrabold text-[#087f80] hover:underline px-2 py-1 cursor-pointer"
                        >
                          Preview
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 3. Work Experience & Field Specialization */}
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-[#637f8d] flex items-center gap-1.5">
                    <BriefcaseIcon className="h-4 w-4 text-[#087f80]" />
                    Field Specialization & Background Summary
                  </h4>
                  <p className="mt-2 rounded-xl border border-[#e2ecf0] bg-[#fafcfd] p-3 text-xs leading-relaxed text-[#2c4755]">
                    {selectedApplicant.experienceSummary}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {selectedApplicant.specialtyCategories.map((cat) => (
                      <span
                        key={cat}
                        className="rounded-md bg-[#edf7f5] px-2 py-0.5 text-[11px] font-bold text-[#087f80]"
                      >
                        {cat}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Rejection Note If Applicable */}
                {selectedApplicant.rejectionReason && (
                  <div className="rounded-xl border border-[#f8c9c4] bg-[#fff5f4] p-3 text-xs">
                    <p className="font-extrabold text-[#d93829]">Specified Rejection Reason:</p>
                    <p className="mt-1 text-[#b8291b]">{selectedApplicant.rejectionReason}</p>
                  </div>
                )}
              </div>

              {/* Bottom Action Bar */}
              <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-[#edf2f5] pt-4">
                <div className="text-xs text-[#627d8c]">
                  {selectedApplicant.status === "Approved" ? (
                    <span className="inline-flex items-center gap-1.5 font-medium text-[#087557]">
                      <CheckCircleIcon className="h-4 w-4" />
                      Approved volunteers are locked. Revocation or role suspension is managed by Admin (FR-76–83).
                    </span>
                  ) : selectedApplicant.status === "Rejected" ? (
                    <span className="inline-flex items-center gap-1.5 font-medium text-[#c0392b]">
                      <XCircleIcon className="h-4 w-4" />
                      Application rejected. Re-review or status alteration requires Manager escalation.
                    </span>
                  ) : (
                    <span>Review all credentials before approving or rejecting candidate.</span>
                  )}
                </div>

                <div className="flex w-full sm:w-auto items-center justify-end gap-3">
                  {/* Manager cannot reject once Approved (Admin manages revocation/lock FR-76 to 83) */}
                  {selectedApplicant.status !== "Approved" && (
                    <button
                      type="button"
                      onClick={() => {
                        setDetailModalOpen(false);
                        setRejectModalOpen(true);
                      }}
                      disabled={selectedApplicant.status === "Rejected"}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-xl border border-[#f2a299] bg-[#fff6f5] px-5 py-2.5 text-xs font-black text-[#d93829] hover:bg-[#ffeceb] disabled:opacity-50 cursor-pointer"
                    >
                      <XCircleIcon className="h-4 w-4" />
                      Reject Application
                    </button>
                  )}

                  {selectedApplicant.status !== "Approved" ? (
                    <button
                      type="button"
                      onClick={() => {
                        handleApprove(selectedApplicant.id);
                        setDetailModalOpen(false);
                      }}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#087557] px-6 py-2.5 text-xs font-black text-white shadow-xs hover:bg-[#066148] cursor-pointer"
                    >
                      <CheckCircleIcon className="h-4 w-4" />
                      Approve Application
                    </button>
                  ) : (
                    <div className="inline-flex items-center gap-1.5 rounded-xl bg-[#e7f5f0] px-4 py-2 text-xs font-bold text-[#087557]">
                      <CheckBadgeIcon className="h-4 w-4" />
                      Authorized Interpreter
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

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
                className="text-[#728b97] hover:text-[#112b3c]"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <p className="mt-3 text-xs leading-relaxed text-[#59717d]">
              Managers must provide an explicit explanation when rejecting an applicant. This reason will be logged and notified to the applicant.
            </p>

            <div className="mt-4">
              <label htmlFor="reason" className="block text-xs font-extrabold text-[#143141]">
                Rejection Reason (Required)
              </label>
              <textarea
                id="reason"
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
                className="rounded-lg border border-[#cddae0] bg-white px-4 py-2 text-xs font-bold text-[#455f6d] hover:bg-[#f0f4f6]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                disabled={!rejectReason.trim()}
                className="rounded-lg bg-[#d93829] px-4 py-2 text-xs font-extrabold text-white hover:bg-[#b8291b] disabled:opacity-50"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FOOTER */}
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
  );
}

