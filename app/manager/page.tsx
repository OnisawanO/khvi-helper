"use client";

import { useEffect, useState, useRef } from "react";
import {
  ArrowLeftOnRectangleIcon,
  BriefcaseIcon,
  ChatBubbleLeftRightIcon,
  CheckBadgeIcon,
  CheckCircleIcon,
  ChevronDownIcon,
  ClockIcon,
  DocumentCheckIcon,
  DocumentMagnifyingGlassIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  LanguageIcon,
  UserCircleIcon,
  UserGroupIcon,
  XCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { BrandMark } from "../components/brand-mark";
import { SiteFooter } from "../components/site-footer";

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
};

const initialApplicants: InterpreterApplicant[] = [
  {
    id: "APP-101",
    name: "Sompong Vorakul",
    age: 32,
    country: "Thailand",
    primaryLanguage: "Thai",
    spokenLanguages: ["Thai", "English", "Mandarin Chinese"],
    specialtyCategories: ["Medical", "Tourism"],
    experienceSummary: "5 years volunteer medical translator at community clinics and emergency relief stations.",
    contactChannels: "Line: sompong_v | Tel: 081-234-5678",
    appliedDate: "2026-09-07 14:20",
    status: "Pending",
  },
  {
    id: "APP-102",
    name: "Lin Wei Chen",
    age: 28,
    country: "Taiwan",
    primaryLanguage: "Mandarin Chinese",
    spokenLanguages: ["Mandarin Chinese", "English", "Thai (Conversational)"],
    specialtyCategories: ["Police station", "Legal Documentation"],
    experienceSummary: "Certified legal and administrative interpreter in Taipei, fluent in consular procedures.",
    contactChannels: "WeChat: linwei_tw | Email: linwei@example.com",
    appliedDate: "2026-09-07 11:05",
    status: "Under Review",
  },
  {
    id: "APP-103",
    name: "Aung Myo Zaw",
    age: 26,
    country: "Myanmar",
    primaryLanguage: "Burmese",
    spokenLanguages: ["Burmese", "Thai", "English"],
    specialtyCategories: ["Labour Assistance", "Medical"],
    experienceSummary: "Active interpreter for Myanmar migrant worker health center in Samut Sakhon.",
    contactChannels: "Viber: aungmyo_zaw | Tel: 089-876-5432",
    appliedDate: "2026-09-06 18:40",
    status: "Pending",
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
  },
];

function ManagerHeader() {
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
      <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4 px-5 py-3.5 sm:px-8 lg:px-12">
        {/* Brand */}
        <div className="flex items-center gap-6">
          <BrandMark subtitle="Community interpreter map" />
        </div>

        {/* Navigation / Actions */}
        <div className="flex items-center gap-3">
          {/* Quick Stats Pill */}
          <div className="hidden items-center gap-2 rounded-lg border border-[#e1e9ed] bg-white px-3 py-1.5 text-xs text-[#486370] lg:flex">
            <span className="inline-block h-2 w-2 rounded-full bg-[#087f80]" />
            <span className="font-bold">System Status: Normal</span>
          </div>

          {/* Profile Section (Replaces Sign In and Create Pin) */}
          <div ref={profileMenuRef} className="relative">
            <button
              type="button"
              onClick={() => setProfileMenuOpen((prev) => !prev)}
              className="flex items-center gap-2.5 rounded-lg border border-[#c9d8de] bg-white px-3 py-1.5 shadow-sm transition-all hover:border-[#087f80] hover:bg-[#edf7f5] focus:outline-none focus:ring-2 focus:ring-[#087f80]/30"
              aria-expanded={profileMenuOpen}
              aria-haspopup="menu"
            >
              <div className="relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border border-[#087f80] bg-[#092f45] text-xs font-extrabold text-white">
                TY
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-xs font-extrabold leading-tight text-[#10283a]">Taofix yayueri</p>
                <p className="text-[11px] font-semibold text-[#087f80]">Regional Manager</p>
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
                  <a
                    href="#audit-log"
                    onClick={() => setProfileMenuOpen(false)}
                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-bold text-[#2d4957] transition-colors hover:bg-[#f2f7f9] hover:text-[#087f80]"
                  >
                    <DocumentCheckIcon className="h-4 w-4" />
                    Audit Log
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
  const [selectedApplicant, setSelectedApplicant] = useState<InterpreterApplicant | null>(initialApplicants[0]);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [activeTab, setActiveTab] = useState<"applicants" | "tickets">("applicants");

  // Handle Approve
  const handleApprove = (id: string) => {
    setApplicants((prev) =>
      prev.map((app) => (app.id === id ? { ...app, status: "Approved" } : app))
    );
    if (selectedApplicant?.id === id) {
      setSelectedApplicant((prev) => (prev ? { ...prev, status: "Approved" } : null));
    }
  };

  // Handle Reject
  const handleConfirmReject = () => {
    if (!selectedApplicant || !rejectReason.trim()) return;
    setApplicants((prev) =>
      prev.map((app) =>
        app.id === selectedApplicant.id
          ? { ...app, status: "Rejected", rejectionReason: rejectReason }
          : app
      )
    );
    setSelectedApplicant((prev) =>
      prev ? { ...prev, status: "Rejected", rejectionReason: rejectReason } : null
    );
    setRejectModalOpen(false);
    setRejectReason("");
  };

  // Counts for KPI
  const pendingCount = applicants.filter((a) => a.status === "Pending" || a.status === "Under Review").length;
  const openTicketCount = tickets.filter((t) => t.status === "Open").length;

  return (
    <main className="min-h-screen bg-[#f7f9fa] text-[#10283a]">
      <ManagerHeader />

      <div className="mx-auto max-w-[1440px] px-5 py-8 sm:px-8 lg:px-12">
        {/* Page Heading & Metrics Band */}
        <div className="flex flex-col gap-4 border-b border-[#dce5ea] pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded bg-[#087f80]/10 px-2 py-0.5 text-xs font-extrabold text-[#087f80]">
                Operations Console
              </span>
            </div>
            <h1 className="mt-1 text-2xl font-extrabold text-[#122b3e] sm:text-3xl">
              Operations & Verification Overview
            </h1>
            <p className="mt-1 text-sm text-[#5a717c]">
              Review volunteer interpreter credentials, approve applications, and handle live mission assistance.
            </p>
          </div>

          {/* Quick Action Navigation Tabs */}
          <div className="flex items-center gap-2 rounded-xl border border-[#d6e0e4] bg-white p-1 shadow-sm">
            <button
              type="button"
              onClick={() => setActiveTab("applicants")}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-extrabold transition-colors ${
                activeTab === "applicants"
                  ? "bg-[#092f45] text-white shadow-sm"
                  : "text-[#47606e] hover:bg-[#f0f4f6]"
              }`}
            >
              <UserGroupIcon className="h-4 w-4" />
              <span>Interpreter Applications</span>
              {pendingCount > 0 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#f0a35f] text-[10px] font-extrabold text-[#3a2007]">
                  {pendingCount}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("tickets")}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-extrabold transition-colors ${
                activeTab === "tickets"
                  ? "bg-[#092f45] text-white shadow-sm"
                  : "text-[#47606e] hover:bg-[#f0f4f6]"
              }`}
            >
              <ChatBubbleLeftRightIcon className="h-4 w-4" />
              <span>Support & Help Tickets</span>
              {openTicketCount > 0 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#f04f3e] text-[10px] font-extrabold text-white">
                  {openTicketCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* 3 Metric Cards */}
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="border border-[#d7e2e6] bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#5e7783]">Pending Approvals</span>
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#edf7f5] text-[#087f80]">
                <DocumentMagnifyingGlassIcon className="h-5 w-5" />
              </span>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-[#11293a]">{pendingCount}</span>
              <span className="text-xs font-semibold text-[#8a9ea7]">applicants awaiting review</span>
            </div>
            <p className="mt-2 text-xs text-[#526d79]">
              Requires language & background validation before granting access to live missions.
            </p>
          </div>

          <div className="border border-[#d7e2e6] bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#5e7783]">Active Help Requests</span>
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#fff1ef] text-[#f04f3e]">
                <ExclamationCircleIcon className="h-5 w-5" />
              </span>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-[#f04f3e]">{openTicketCount}</span>
              <span className="text-xs font-semibold text-[#8a9ea7]">urgent tickets open</span>
            </div>
            <p className="mt-2 text-xs text-[#526d79]">
              Live escalation from users or volunteer interpreters during active assignments.
            </p>
          </div>

          <div className="border border-[#d7e2e6] bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#5e7783]">Verified Active Pool</span>
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#f0f4f6] text-[#092f45]">
                <CheckBadgeIcon className="h-5 w-5" />
              </span>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-[#092f45]">48</span>
              <span className="text-xs font-semibold text-[#8a9ea7]">interpreters on duty</span>
            </div>
            <p className="mt-2 text-xs text-[#526d79]">
              Across 8 languages in Greater Bangkok and high-demand tourist sectors.
            </p>
          </div>
        </div>

        {/* MAIN SECTION 1: INTERPRETER VERIFICATION */}
        {activeTab === "applicants" && (
          <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* Left: Applicant List */}
            <div className="lg:col-span-5">
              <div className="border border-[#d7e2e6] bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between pb-3 border-b border-[#e6edf0]">
                  <div className="flex items-center gap-2">
                    <UserGroupIcon className="h-5 w-5 text-[#087f80]" />
                    <h2 className="text-base font-extrabold text-[#153447]">
                      Applicant Queue ({applicants.length})
                    </h2>
                  </div>
                  <span className="text-xs text-[#6e848e]">Sorted by submission date</span>
                </div>

                <div className="mt-3 space-y-2">
                  {applicants.map((app) => {
                    const isSelected = selectedApplicant?.id === app.id;
                    return (
                      <button
                        type="button"
                        key={app.id}
                        onClick={() => setSelectedApplicant(app)}
                        className={`w-full text-left p-3.5 border transition-all rounded-lg ${
                          isSelected
                            ? "border-[#087f80] bg-[#f2f9f8] shadow-sm"
                            : "border-[#e0e8ec] hover:border-[#b8ccd4] bg-white"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-extrabold text-sm text-[#143141]">{app.name}</p>
                            <p className="text-xs text-[#597482]">
                              {app.country} · Age {app.age}
                            </p>
                          </div>
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                              app.status === "Approved"
                                ? "bg-[#e6f4ef] text-[#087557]"
                                : app.status === "Rejected"
                                ? "bg-[#fff0ee] text-[#d93829]"
                                : "bg-[#fef4e8] text-[#b36916]"
                            }`}
                          >
                            {app.status}
                          </span>
                        </div>

                        <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                          <span className="inline-flex items-center gap-1 rounded bg-[#e8f1f5] px-2 py-0.5 text-[11px] font-semibold text-[#183d50]">
                            <LanguageIcon className="h-3 w-3" />
                            {app.primaryLanguage}
                          </span>
                          {app.specialtyCategories.map((spec) => (
                            <span
                              key={spec}
                              className="rounded bg-[#f5f7f8] border border-[#e1e9ed] px-1.5 py-0.5 text-[10px] text-[#4d6775]"
                            >
                              {spec}
                            </span>
                          ))}
                        </div>

                        <div className="mt-2 text-[11px] text-[#8ca0aa] flex items-center gap-1">
                          <ClockIcon className="h-3.5 w-3.5" />
                          Applied: {app.appliedDate}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right: Detailed Dossier & Review Actions */}
            <div className="lg:col-span-7">
              {selectedApplicant ? (
                <div className="border border-[#d7e2e6] bg-white p-6 shadow-sm">
                  {/* Dossier Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#e8f0f3] pb-5">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-xl font-extrabold text-[#112c3e]">
                          {selectedApplicant.name}
                        </h3>
                        <span className="text-xs text-[#718995]">
                          Application ID: #{selectedApplicant.id}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-[#536d7a]">
                        Origin: {selectedApplicant.country} | Age: {selectedApplicant.age} | Submission: {selectedApplicant.appliedDate}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`px-3 py-1 rounded-md text-xs font-extrabold ${
                          selectedApplicant.status === "Approved"
                            ? "bg-[#e6f4ef] text-[#087557]"
                            : selectedApplicant.status === "Rejected"
                            ? "bg-[#fff0ee] text-[#d93829]"
                            : "bg-[#fef4e8] text-[#b36916]"
                        }`}
                      >
                        Status: {selectedApplicant.status}
                      </span>
                    </div>
                  </div>

                  {/* Candidate Attributes Grid */}
                  <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="border border-[#e7eef1] bg-[#fafcfd] p-4 rounded-lg">
                      <p className="text-xs font-bold text-[#6a828e] flex items-center gap-1">
                        <LanguageIcon className="h-4 w-4 text-[#087f80]" />
                        Primary & Spoken Languages
                      </p>
                      <p className="mt-1 text-sm font-extrabold text-[#123142]">
                        Primary: {selectedApplicant.primaryLanguage}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {selectedApplicant.spokenLanguages.map((lang) => (
                          <span
                            key={lang}
                            className="bg-white border border-[#cedde3] px-2 py-0.5 rounded text-xs font-semibold text-[#284858]"
                          >
                            {lang}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="border border-[#e7eef1] bg-[#fafcfd] p-4 rounded-lg">
                      <p className="text-xs font-bold text-[#6a828e] flex items-center gap-1">
                        <BriefcaseIcon className="h-4 w-4 text-[#087f80]" />
                        Specialty Domains
                      </p>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {selectedApplicant.specialtyCategories.map((cat) => (
                          <span
                            key={cat}
                            className="bg-[#edf7f5] text-[#087f80] border border-[#beddd9] px-2 py-1 rounded text-xs font-bold"
                          >
                            {cat}
                          </span>
                        ))}
                      </div>
                      <p className="mt-2 text-[11px] text-[#7a909a]">
                        Qualified to claim targeted emergency pins within these categories.
                      </p>
                    </div>
                  </div>

                  {/* Work Experience (FR-36) */}
                  <div className="mt-5 border border-[#e7eef1] bg-[#fafcfd] p-4 rounded-lg">
                    <p className="text-xs font-bold text-[#6a828e] flex items-center gap-1">
                      <DocumentCheckIcon className="h-4 w-4 text-[#087f80]" />
                      Experience Summary & Qualifications
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-[#233d4b]">
                      {selectedApplicant.experienceSummary}
                    </p>
                  </div>

                  {/* Verified Contact Details (FR-37) */}
                  <div className="mt-5 border border-[#e7eef1] bg-[#fafcfd] p-4 rounded-lg">
                    <p className="text-xs font-bold text-[#6a828e]">
                      Direct Contact Channels
                    </p>
                    <p className="mt-1 text-sm font-semibold text-[#183949]">
                      {selectedApplicant.contactChannels}
                    </p>
                  </div>

                  {/* If already rejected, show reason */}
                  {selectedApplicant.rejectionReason && (
                    <div className="mt-5 border border-[#f8c9c4] bg-[#fff5f4] p-4 rounded-lg">
                      <p className="text-xs font-bold text-[#d93829]">
                        Rejection Reason Specified
                      </p>
                      <p className="mt-1 text-sm text-[#b8291b]">
                        {selectedApplicant.rejectionReason}
                      </p>
                    </div>
                  )}

                  {/* Manager Decision Actions (FR-43 to FR-46) */}
                  <div className="mt-8 border-t border-[#e8f0f3] pt-5 flex flex-col sm:flex-row items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setRejectModalOpen(true)}
                      disabled={selectedApplicant.status === "Rejected"}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg border border-[#f2a299] bg-[#fff6f5] px-5 py-2.5 text-xs font-extrabold text-[#d93829] transition-colors hover:bg-[#ffeceb] disabled:opacity-50"
                    >
                      <XCircleIcon className="h-4 w-4" />
                      Reject Application
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApprove(selectedApplicant.id)}
                      disabled={selectedApplicant.status === "Approved"}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-[#087557] px-6 py-2.5 text-xs font-extrabold text-white shadow-sm transition-colors hover:bg-[#066148] disabled:opacity-50"
                    >
                      <CheckCircleIcon className="h-4 w-4" />
                      Approve as Volunteer Interpreter
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex h-96 items-center justify-center border border-dashed border-[#ccd9df] bg-white p-8 text-center text-sm text-[#738b97]">
                  Select an applicant from the queue to view credentials and make an approval decision.
                </div>
              )}
            </div>
          </div>
        )}

        {/* MAIN SECTION 2: LIVE SUPPORT & ESCALATION TICKETS (FR-51, FR-52) */}
        {activeTab === "tickets" && (
          <div className="mt-8">
            <div className="border border-[#d7e2e6] bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-[#e8f0f3] pb-4">
                <div>
                  <h2 className="text-lg font-extrabold text-[#112e40]">
                    Mission Support Desk
                  </h2>
                  <p className="mt-1 text-xs text-[#5f7885]">
                    Real-time tickets filed by requesters or volunteer interpreters needing manager intervention.
                  </p>
                </div>
                <span className="rounded-lg bg-[#edf7f5] px-3 py-1 text-xs font-bold text-[#087f80]">
                  Live Monitoring Active
                </span>
              </div>

              <div className="mt-5 space-y-4">
                {tickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    className={`border p-5 rounded-xl transition-colors ${
                      ticket.urgency === "urgent"
                        ? "border-[#f8c1b9] bg-[#fff8f7]"
                        : "border-[#dce7eb] bg-white"
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span
                          className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                            ticket.urgency === "urgent"
                              ? "bg-[#f04f3e] text-white"
                              : "bg-[#edf4f7] text-[#092f45]"
                          }`}
                        >
                          <ExclamationTriangleIcon className="h-5 w-5" />
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-extrabold text-[#153447]">
                              {ticket.title}
                            </h3>
                            <span className="text-xs font-semibold text-[#8096a1]">
                              Ticket #{ticket.id}
                            </span>
                          </div>
                          <p className="text-xs text-[#5b7381]">
                            From: <strong className="text-[#153447]">{ticket.requesterName}</strong> ({ticket.requesterRole}) · Related Mission: {ticket.missionId} · {ticket.createdAt}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="rounded-md border border-[#cbe0e8] bg-white px-2.5 py-1 text-[11px] font-extrabold text-[#12394d]">
                          Status: {ticket.status}
                        </span>
                      </div>
                    </div>

                    <p className="mt-4 text-xs leading-relaxed text-[#2f4b59] bg-white/70 border border-[#e4ecf0] p-3 rounded-lg">
                      {ticket.detail}
                    </p>

                    <div className="mt-4 flex flex-wrap items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => alert(`Opening live chat with ${ticket.requesterName} for mission ${ticket.missionId}`)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-[#087f80] bg-white px-3.5 py-1.5 text-xs font-bold text-[#087f80] hover:bg-[#edf7f5]"
                      >
                        <ChatBubbleLeftRightIcon className="h-4 w-4" />
                        Contact Requester
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setTickets((prev) =>
                            prev.map((t) => (t.id === ticket.id ? { ...t, status: "Resolved" } : t))
                          );
                        }}
                        disabled={ticket.status === "Resolved"}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-[#092f45] px-4 py-1.5 text-xs font-extrabold text-white hover:bg-[#0c4960] disabled:opacity-50"
                      >
                        <CheckCircleIcon className="h-4 w-4" />
                        Resolve Case
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

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
    </main>
  );
}

