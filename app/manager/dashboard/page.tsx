"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SiteHeader, type Locale } from "@/app/components/site-header";
import { SiteFooter } from "@/app/components/site-footer";
import { persistPreferredUiLanguage, useStoredLocale } from "@/app/lib/locale";
import { getCurrentUserProfile } from "@/app/lib/supabase-auth";
import { getRedirectPathByRole } from "@/app/lib/mock-auth";
import { createClient } from "@/utils/supabase/client";
import { ManagerMetrics } from "./components/ManagerMetrics";
import {
  ApplicationDetailModal,
  type InterpreterApplication,
  type ApplicationStatus,
} from "./components/ApplicationDetailModal";

const headerCopy = {
  brandSubtitle: "Community interpreter map",
  languageLabel: "Language",
  signIn: "Sign in",
  primaryAction: "Create pin",
  nav: [
    ["Map preview", "/#map-preview"],
    ["How it works", "/#how-it-works"],
    ["Safety", "/#safety"],
    ["Roles", "/#roles"],
  ] as const,
};

const footerCopy = {
  description: "A map-based language help platform for situations where communication needs to be clear and timely.",
  note: "Built for safer coordination",
  explore: "Explore",
  safety: "Safety",
  needHelp: "Need help?",
  needHelpBody: "Start by creating a request pin with the language, category, and location where help is needed.",
  footerCta: "Create a help request pin",
  privacy: "Sensitive details stay hidden until a job is claimed",
  links: {
    map: "/#map-preview",
    how: "/#how-it-works",
    roles: "/#roles",
    privacy: "/#safety",
    request: "/user/request-help",
    signIn: "/sign-in",
  },
};

const initialApplications: InterpreterApplication[] = [
  {
    id: "APP-2026-0913-048",
    userId: 1048,
    applicantName: "ปกรณ์ กิจเจริญชัย (Pakorn Kitcharoenchai)",
    phone: "081-234-5678",
    email: "pakorn.k@example.com",
    age: 28,
    extraContact: "@pakorn_trans (LINE ID)",
    primaryLanguage: "ไทย (Thai)",
    languages: [
      { id: "th", name: "ไทย (Thai)", type: "Primary (ภาษาหลัก)" },
      { id: "en", name: "อังกฤษ (English)", type: "Fluent", level: "IELTS 7.5" },
      { id: "zh", name: "จีน (Chinese)", type: "HSK 5", level: "242 คะแนน" },
    ],
    categories: [
      { id: 9, name: "การสื่อสารทั่วไปและชีวิตประจำวัน (General & Daily Life)", icon: "💬" },
      { id: 1, name: "การแพทย์และโรงพยาบาล (Healthcare & Hospital)", icon: "🏥" },
      { id: 2, name: "สถานีตำรวจและคดีความ (Police & Legal)", icon: "👮" },
    ],
    workHistory: [
      {
        id: 1,
        description: "ล่ามอาสาสมัครโรงพยาบาลศิริราช แผนกผู้ป่วยนอกชาวต่างชาติ",
        startDate: "2024-01-10",
        endDate: "2025-12-20",
        organization: "โรงพยาบาลศิริราช",
      },
      {
        id: 2,
        description: "ผู้ประสานงานภาษาจีนในงานสัมมนาการค้าระหว่างประเทศ",
        startDate: "2023-05-01",
        endDate: "2023-11-30",
        organization: "สมาคมการค้าไทย-จีน",
      },
    ],
    certificateFileName: "hsk5_and_ielts_certificate.pdf",
    certificateUrl: "https://storage.khvi.org/certificates/hsk5_and_ielts_certificate.pdf",
    submittedAt: "13 ก.ย. 2026, 21:30 น.",
    status: "pending",
    assignedArea: "กรุงเทพมหานครและปริมณฑล",
  },
  {
    id: "APP-2026-0913-047",
    userId: 1047,
    applicantName: "ศิริพร บุญรักษา (Siriporn Boonraksa)",
    phone: "089-765-4321",
    email: "siriporn.b@example.com",
    age: 34,
    extraContact: "siriporn_bkk (WeChat)",
    primaryLanguage: "ไทย (Thai)",
    languages: [
      { id: "th", name: "ไทย (Thai)", type: "Primary (ภาษาหลัก)" },
      { id: "zh", name: "จีน (Chinese)", type: "HSK 6", level: "Fluent" },
    ],
    categories: [
      { id: 4, name: "อุบัติเหตุและกู้ชีพฉุกเฉิน (Accidents & Emergency SOS)", icon: "🚨" },
      { id: 6, name: "การท่องเที่ยวและการเดินทาง (Tourism & Transit)", icon: "✈️" },
    ],
    workHistory: [
      {
        id: 3,
        description: "มัคคุเทศก์และล่ามภาษาจีนประจำศูนย์ช่วยเหลือนักท่องเที่ยวสุวรรณภูมิ",
        startDate: "2021-03-01",
        endDate: "2025-08-31",
        organization: "ศูนย์บริการนักท่องเที่ยว ททท.",
      },
    ],
    certificateFileName: "tour_guide_and_hsk6_license.pdf",
    certificateUrl: "https://storage.khvi.org/certificates/tour_guide_and_hsk6_license.pdf",
    submittedAt: "13 ก.ย. 2026, 20:15 น.",
    status: "approved",
    reviewedAt: "13 ก.ย. 2026, 21:10 น.",
    reviewedByManagerId: 901,
    reviewedByManagerName: "ธนากร สุขประเสริฐ (Manager)",
    assignedArea: "สมุทรปราการ / สุวรรณภูมิ",
  },
  {
    id: "APP-2026-0913-046",
    userId: 1046,
    applicantName: "อับดุลเลาะห์ มามะ (Abdullah Mama)",
    phone: "082-998-1122",
    email: "abdullah.m@example.com",
    age: 29,
    extraContact: "@abdullah_arb (Telegram)",
    primaryLanguage: "ไทย (Thai)",
    languages: [
      { id: "th", name: "ไทย (Thai)", type: "Primary (ภาษาหลัก)" },
      { id: "ar", name: "อาหรับ (Arabic)", type: "Native / C2", level: "Fluent" },
      { id: "en", name: "อังกฤษ (English)", type: "B2", level: "Conversational" },
    ],
    categories: [
      { id: 1, name: "การแพทย์และโรงพยาบาล (Healthcare & Hospital)", icon: "🏥" },
      { id: 3, name: "หน่วยงานราชการและตรวจคนเข้าเมือง (Government & Immigration)", icon: "🏛️" },
    ],
    workHistory: [
      {
        id: 4,
        description: "ผู้ประสานงานผู้ป่วยอาหรับ โรงพยาบาลบำรุงราษฎร์",
        startDate: "2022-06-01",
        endDate: "2024-12-31",
        organization: "Bumrungrad Hospital",
      },
    ],
    certificateFileName: "arabic_degree_cert.pdf",
    certificateUrl: "https://storage.khvi.org/certificates/arabic_degree_cert.pdf",
    submittedAt: "13 ก.ย. 2026, 18:40 น.",
    status: "pending",
    assignedArea: "กรุงเทพมหานคร (สุขุมวิท / เพลินจิต)",
  },
  {
    id: "APP-2026-0913-045",
    userId: 1045,
    applicantName: "กมลวรรณ วงศ์สว่าง (Kamonwan Wongsawang)",
    phone: "084-555-1234",
    email: "kamonwan.w@example.com",
    age: 23,
    extraContact: "kamonwan_es (LINE ID)",
    primaryLanguage: "ไทย (Thai)",
    languages: [
      { id: "th", name: "ไทย (Thai)", type: "Primary (ภาษาหลัก)" },
      { id: "es", name: "สเปน (Spanish)", type: "DELE B1", level: "Intermediate" },
    ],
    categories: [
      { id: 9, name: "การสื่อสารทั่วไปและชีวิตประจำวัน (General & Daily Life)", icon: "💬" },
    ],
    workHistory: [],
    certificateFileName: "dele_b1_incomplete_scan.jpg",
    certificateUrl: "https://storage.khvi.org/certificates/dele_b1_incomplete_scan.jpg",
    submittedAt: "13 ก.ย. 2026, 16:20 น.",
    status: "needs_revision",
    reviewedAt: "13 ก.ย. 2026, 17:05 น.",
    reviewedByManagerId: 901,
    reviewedByManagerName: "ธนากร สุขประเสริฐ (Manager)",
    revisionNote: "เอกสารผลสอบ DELE ไม่เห็นตราประทับและหมายเลขประจำตัวผู้สอบ กรุณาแนบไฟล์ PDF ต้นฉบับเพื่อความปลอดภัย",
    assignedArea: "เชียงใหม่ (เมือง)",
  },
  {
    id: "APP-2026-0913-044",
    userId: 1044,
    applicantName: "สมชาย รักสงบ (Somchai Raksangob)",
    phone: "086-111-2233",
    email: "somchai.r@example.com",
    age: 45,
    extraContact: "@somchai (LINE)",
    primaryLanguage: "ไทย (Thai)",
    languages: [
      { id: "th", name: "ไทย (Thai)", type: "Primary (ภาษาหลัก)" },
      { id: "en", name: "อังกฤษ (English)", type: "Basic", level: "A2" },
    ],
    categories: [
      { id: 2, name: "สถานีตำรวจและคดีความ (Police & Legal)", icon: "👮" },
    ],
    workHistory: [],
    certificateFileName: "unverified_id_card.png",
    certificateUrl: "https://storage.khvi.org/certificates/unverified_id_card.png",
    submittedAt: "12 ก.ย. 2026, 14:00 น.",
    status: "rejected",
    reviewedAt: "12 ก.ย. 2026, 15:30 น.",
    reviewedByManagerId: 901,
    reviewedByManagerName: "ธนากร สุขประเสริฐ (Manager)",
    rejectReason: "เอกสารที่แนบไม่ตรงกับคุณวุฒิภาษาที่ขอรับรอง และระดับภาษา A2 ยังไม่เพียงพอสำหรับการแปลในสถานีตำรวจหรือคดีความ",
    assignedArea: "ภูเก็ต (ป่าตอง)",
  },
];

export default function ManagerDashboardPage() {
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);
  const [locale, setLocale] = useStoredLocale();

  useEffect(() => {
    const supabase = createClient();
    let disposed = false;

    const checkSession = async () => {
      const result = await getCurrentUserProfile(supabase);
      if (disposed) return;

      if (!result.profile) {
        router.replace("/#top");
        return;
      }

      if (result.profile.role !== "Manager") {
        router.replace(getRedirectPathByRole(result.profile.role));
        return;
      }

      setLocale(result.profile.preferredUiLanguage);
      setAuthChecked(true);
    };

    void checkSession();
    const { data: authListener } = supabase.auth.onAuthStateChange(() => {
      window.setTimeout(() => void checkSession(), 0);
    });

    return () => {
      disposed = true;
      authListener.subscription.unsubscribe();
    };
  }, [router, setLocale]);

  const handleLocaleChange = (nextLocale: Locale) => {
    setLocale(nextLocale);
    void persistPreferredUiLanguage(nextLocale).catch((error: unknown) => {
      console.error("Unable to persist preferred UI language", error);
    });
  };

  const [applications, setApplications] = useState<InterpreterApplication[]>(initialApplications);
  const [selectedApp, setSelectedApp] = useState<InterpreterApplication | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | "all">("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  // Feedback Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Metrics calculation
  const metrics = useMemo(() => {
    const total = applications.length;
    const pending = applications.filter((a) => a.status === "pending" || a.status === "under_review").length;
    const approved = applications.filter((a) => a.status === "approved").length;
    const needsRevision = applications.filter((a) => a.status === "needs_revision").length;
    const rejected = applications.filter((a) => a.status === "rejected").length;
    return { total, pending, approved, needsRevision, rejected };
  }, [applications]);

  // Filtered applications list
  const filteredApplications = useMemo(() => {
    return applications.filter((app) => {
      // Status filter
      if (statusFilter !== "all") {
        if (statusFilter === "pending") {
          if (app.status !== "pending" && app.status !== "under_review") return false;
        } else if (app.status !== statusFilter) {
          return false;
        }
      }

      // Category filter
      if (categoryFilter !== "all") {
        const hasCategory = app.categories.some((c) => c.name.toLowerCase().includes(categoryFilter.toLowerCase()));
        if (!hasCategory) return false;
      }

      // Search query (matches name, ID, phone, email, languages)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = app.applicantName.toLowerCase().includes(q);
        const matchesId = app.id.toLowerCase().includes(q);
        const matchesEmail = app.email.toLowerCase().includes(q);
        const matchesPhone = app.phone.includes(q);
        const matchesArea = app.assignedArea.toLowerCase().includes(q);
        const matchesLang = app.languages.some((l) => l.name.toLowerCase().includes(q));

        if (!matchesName && !matchesId && !matchesEmail && !matchesPhone && !matchesArea && !matchesLang) {
          return false;
        }
      }

      return true;
    });
  }, [applications, statusFilter, categoryFilter, searchQuery]);

  // Handlers for Decisions
  const handleApprove = (appId: string) => {
    const current = new Date();
    const formattedTime = `${current.getDate()} ก.ย. 2026, ${current.getHours().toString().padStart(2, "0")}:${current.getMinutes().toString().padStart(2, "0")} น.`;

    setApplications((prev) =>
      prev.map((app) => {
        if (app.id === appId) {
          return {
            ...app,
            status: "approved",
            reviewedAt: formattedTime,
            reviewedByManagerId: 901,
            reviewedByManagerName: "ธนากร สุขประเสริฐ (Manager)",
            rejectReason: undefined,
            revisionNote: undefined,
          };
        }
        return app;
      })
    );

    setIsDetailModalOpen(false);
    showToast(`อนุมัติใบสมัครรหัส ${appId} สำเร็จ (ปลดล็อกสิทธิ์รับงานตามกฎ BR-02)`);
  };

  const handleRequestRevision = (appId: string, note: string) => {
    const current = new Date();
    const formattedTime = `${current.getDate()} ก.ย. 2026, ${current.getHours().toString().padStart(2, "0")}:${current.getMinutes().toString().padStart(2, "0")} น.`;

    setApplications((prev) =>
      prev.map((app) => {
        if (app.id === appId) {
          return {
            ...app,
            status: "needs_revision",
            reviewedAt: formattedTime,
            reviewedByManagerId: 901,
            reviewedByManagerName: "ธนากร สุขประเสริฐ (Manager)",
            revisionNote: note,
          };
        }
        return app;
      })
    );

    setIsDetailModalOpen(false);
    showToast(`ส่งคำขอเอกสารเพิ่มเติมสำหรับใบสมัคร ${appId} เรียบร้อยแล้ว`);
  };

  const handleReject = (appId: string, reason: string) => {
    const current = new Date();
    const formattedTime = `${current.getDate()} ก.ย. 2026, ${current.getHours().toString().padStart(2, "0")}:${current.getMinutes().toString().padStart(2, "0")} น.`;

    setApplications((prev) =>
      prev.map((app) => {
        if (app.id === appId) {
          return {
            ...app,
            status: "rejected",
            reviewedAt: formattedTime,
            reviewedByManagerId: 901,
            reviewedByManagerName: "ธนากร สุขประเสริฐ (Manager)",
            rejectReason: reason,
          };
        }
        return app;
      })
    );

    setIsDetailModalOpen(false);
    showToast(`บันทึกการปฏิเสธใบสมัคร ${appId} พร้อมเหตุผลแล้ว`);
  };

  const handleOpenDetail = (app: InterpreterApplication) => {
    setSelectedApp(app);
    setIsDetailModalOpen(true);
  };

  const handleResetData = () => {
    setApplications(initialApplications);
    showToast("รีเซ็ตข้อมูลทดสอบกลับสู่ค่าเริ่มต้นแล้ว");
  };

  if (!authChecked) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7f9fa] text-[#10283a]" aria-busy="true">
        <p role="status">กำลังตรวจสอบ session...</p>
      </main>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#f7f9fa] text-[#10283a] antialiased">
      <SiteHeader
        copy={headerCopy}
        locale={locale}
        onLocaleChange={handleLocaleChange}
      />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 border border-[#087f80] bg-[#087f80] px-5 py-3.5 text-white shadow-xl animate-in fade-in duration-200">
          <svg className="h-5 w-5 shrink-0 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
          <span className="text-xs sm:text-sm font-extrabold">{toastMessage}</span>
        </div>
      )}

      <main className="flex-1 mx-auto w-full max-w-[1440px] px-4 py-8 sm:px-8 lg:px-12">
        {/* Navigation Breadcrumb */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2 text-xs text-[#64777e]">
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="inline-flex items-center gap-1 font-bold text-[#087f80] hover:text-[#096f70] transition-colors"
            >
              <span>← หน้าหลัก KHVI Helper</span>
            </Link>
            <span>/</span>
            <Link
              href="/user/volunteer/status"
              className="text-[#64777e] hover:text-[#10283a] transition-colors"
            >
              Volunteer Status
            </Link>
          </div>
          <div className="flex items-center gap-2 font-mono text-[#73848a]">
            <span className="border border-[#d8e4e7] bg-white px-2 py-0.5 text-[11px]">
              Persona 6: Manager Portal (FR-40–46)
            </span>
          </div>
        </div>

        {/* Top Header Card */}
        <header className="border border-[#143748] bg-[#092f45] px-6 py-5 text-white shadow-sm mb-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex flex-wrap items-baseline gap-2">
                <h1 className="text-xl font-black tracking-tight text-white sm:text-2xl">
                  KHVI Manager Portal
                </h1>
                <span className="text-xs font-semibold text-slate-300 sm:text-sm">
                  | ศูนย์ตรวจสอบและอนุมัติล่ามจิตอาสา
                </span>
              </div>
              <p className="mt-1 text-xs text-[#8ed5c4] sm:text-sm">
                เข้าใช้งานโดย: ธนากร สุขประเสริฐ (ผู้จัดการศูนย์ประสานงาน)
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="border border-[#8ed5c4]/40 bg-[#087f80] px-3 py-1 text-xs font-bold text-white">
                🛡️ Verification Rule BR-02
              </span>
              <button
                type="button"
                onClick={handleResetData}
                title="รีเซ็ตข้อมูลตัวอย่างกลับเป็นค่าเริ่มต้น"
                className="border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold text-slate-200 hover:bg-white/20 transition-colors"
              >
                🔄 รีเซ็ตข้อมูลทดสอบ
              </button>
            </div>
          </div>
        </header>

        {/* Summary Metrics Section */}
        <section className="mb-6" aria-label="สถิติภาพรวมการตรวจสอบ">
          <ManagerMetrics
            total={metrics.total}
            pending={metrics.pending}
            approved={metrics.approved}
            needsRevision={metrics.needsRevision}
            rejected={metrics.rejected}
            avgReviewTime="35 นาที"
          />
        </section>

        {/* Search, Filter & Tabs Section */}
        <section className="border border-[#d6e0e4] bg-white p-4 sm:p-5 shadow-xs mb-6 space-y-4">
          {/* Status Filter Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 border-b border-[#edf2f4] pb-3">
            <span className="text-xs font-bold text-[#53656c] mr-2">สถานะ:</span>
            <button
              type="button"
              onClick={() => setStatusFilter("all")}
              className={`px-3 py-1.5 text-xs font-bold transition-colors ${
                statusFilter === "all"
                  ? "border border-[#092f45] bg-[#092f45] text-white shadow-xs"
                  : "border border-[#d6e0e4] bg-[#f8fafb] text-[#53656c] hover:bg-[#edf2f4]"
              }`}
            >
              ทั้งหมด ({metrics.total})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("pending")}
              className={`px-3 py-1.5 text-xs font-bold transition-colors ${
                statusFilter === "pending"
                  ? "border border-[#d97706] bg-[#d97706] text-white shadow-xs"
                  : "border border-[#d6e0e4] bg-[#f8fafb] text-[#53656c] hover:bg-[#edf2f4]"
              }`}
            >
              ⏳ รอตรวจสอบ ({metrics.pending})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("approved")}
              className={`px-3 py-1.5 text-xs font-bold transition-colors ${
                statusFilter === "approved"
                  ? "border border-[#087557] bg-[#087557] text-white shadow-xs"
                  : "border border-[#d6e0e4] bg-[#f8fafb] text-[#53656c] hover:bg-[#edf2f4]"
              }`}
            >
              ✓ อนุมัติแล้ว ({metrics.approved})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("needs_revision")}
              className={`px-3 py-1.5 text-xs font-bold transition-colors ${
                statusFilter === "needs_revision"
                  ? "border border-[#b45309] bg-[#b45309] text-white shadow-xs"
                  : "border border-[#d6e0e4] bg-[#f8fafb] text-[#53656c] hover:bg-[#edf2f4]"
              }`}
            >
              ⚠️ ขอเอกสารเพิ่ม ({metrics.needsRevision})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("rejected")}
              className={`px-3 py-1.5 text-xs font-bold transition-colors ${
                statusFilter === "rejected"
                  ? "border border-[#f04f3e] bg-[#f04f3e] text-white shadow-xs"
                  : "border border-[#d6e0e4] bg-[#f8fafb] text-[#53656c] hover:bg-[#edf2f4]"
              }`}
            >
              ✕ ไม่อนุมัติ ({metrics.rejected})
            </button>
          </div>

          {/* Search Inputs and Category Select */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ค้นหาชื่อผู้สมัคร, ภาษา, เบอร์โทร หรือรหัสใบสมัคร (APP-...)"
                className="w-full border border-[#cbd7dc] bg-white px-3.5 py-2 text-xs text-[#10283a] focus:border-[#087f80] focus:outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-[#73848a] hover:text-[#10283a]"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="border border-[#cbd7dc] bg-white px-3 py-2 text-xs font-medium text-[#10283a] focus:border-[#087f80] focus:outline-none"
              >
                <option value="all">ทุกหมวดหมู่งาน</option>
                <option value="การแพทย์">การแพทย์/โรงพยาบาล</option>
                <option value="ตำรวจ">สถานีตำรวจ/คดีความ</option>
                <option value="ฉุกเฉิน">ฉุกเฉิน/SOS</option>
                <option value="ทั่วไป">การสื่อสารทั่วไป</option>
                <option value="ท่องเที่ยว">การท่องเที่ยว</option>
              </select>

              {(searchQuery || statusFilter !== "all" || categoryFilter !== "all") && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setStatusFilter("all");
                    setCategoryFilter("all");
                  }}
                  className="border border-[#cbd7dc] bg-[#f8fafb] px-3 py-2 text-xs font-bold text-[#53656c] hover:bg-[#edf2f4] transition-colors shrink-0"
                >
                  ล้างตัวกรอง
                </button>
              )}
            </div>
          </div>
        </section>

        {/* Applications List / Data Table */}
        <section className="border border-[#d6e0e4] bg-white shadow-xs mb-8">
          <div className="flex items-center justify-between border-b border-[#d6e0e4] bg-[#f8fafb] px-5 py-3.5">
            <div className="flex items-center gap-2">
              <span className="inline-block h-4 w-1.5 bg-[#087f80]" />
              <h2 className="text-sm font-extrabold text-[#10283a]">
                รายการใบสมัครล่ามจิตอาสา (Interpreter Applications)
              </h2>
              <span className="font-mono text-xs text-[#64777e]">
                ({filteredApplications.length} รายการ)
              </span>
            </div>
            <span className="text-[11px] text-[#64777e]">
              คลิกแถวหรือปุ่ม &quot;ตรวจสอบ&quot; เพื่อเปิดหน้าต่างตัดสินใจ
            </span>
          </div>

          {filteredApplications.length === 0 ? (
            <div className="p-12 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center border border-[#cbd7dc] bg-[#f8fafb] text-xl">
                📂
              </div>
              <h3 className="text-sm font-extrabold text-[#10283a]">
                ไม่พบใบสมัครที่ตรงตามเงื่อนไขการค้นหา
              </h3>
              <p className="mt-1 text-xs text-[#64777e]">
                ลองเปลี่ยนคำค้นหาหรือปรับตัวกรองสถานะใหม่
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setStatusFilter("all");
                  setCategoryFilter("all");
                }}
                className="mt-4 border border-[#cbd7dc] bg-white px-4 py-2 text-xs font-bold text-[#10283a] hover:bg-[#f8fafb]"
              >
                แสดงใบสมัครทั้งหมด
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[#e2ebee] bg-[#fbfdfd] text-[#53656c] font-bold uppercase tracking-wider text-[11px]">
                    <th className="px-4 py-3">รหัสใบสมัคร / วันที่</th>
                    <th className="px-4 py-3">ผู้สมัคร (USER)</th>
                    <th className="px-4 py-3">ภาษาที่ให้บริการ</th>
                    <th className="px-4 py-3">หมวดหมู่งาน</th>
                    <th className="px-4 py-3">เอกสารรับรอง</th>
                    <th className="px-4 py-3">สถานะ (BR-02)</th>
                    <th className="px-4 py-3 text-right">การดำเนินการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#edf2f4]">
                  {filteredApplications.map((app) => (
                    <tr
                      key={app.id}
                      onClick={() => handleOpenDetail(app)}
                      className="hover:bg-[#f4f9f8] cursor-pointer transition-colors"
                    >
                      {/* Column 1: Application ID and submitted date */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className="font-mono font-extrabold text-[#10283a] block">
                          {app.id}
                        </span>
                        <span className="text-[11px] text-[#64777e]">
                          {app.submittedAt}
                        </span>
                      </td>

                      {/* Column 2: Applicant Identity */}
                      <td className="px-4 py-3.5">
                        <div className="font-bold text-[#10283a]">{app.applicantName}</div>
                        <div className="text-[11px] text-[#64777e] flex items-center gap-2 mt-0.5">
                          <span>{app.phone}</span>
                          <span>•</span>
                          <span>{app.assignedArea}</span>
                        </div>
                      </td>

                      {/* Column 3: Languages */}
                      <td className="px-4 py-3.5">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {app.languages.map((lang) => (
                            <span
                              key={lang.id}
                              className="inline-block border border-[#8ed5c4] bg-[#edf7f5] px-1.5 py-0.5 text-[10px] font-bold text-[#087557]"
                            >
                              {lang.name.split(" ")[0]}
                              {lang.type && ` (${lang.type.split(" ")[0]})`}
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* Column 4: Categories */}
                      <td className="px-4 py-3.5">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {app.categories.slice(0, 2).map((cat) => (
                            <span
                              key={cat.id}
                              className="inline-block border border-[#d6e0e4] bg-[#f8fafb] px-1.5 py-0.5 text-[10px] font-medium text-[#53656c]"
                            >
                              {cat.icon} {cat.name.split(" ")[0]}
                            </span>
                          ))}
                          {app.categories.length > 2 && (
                            <span className="text-[10px] text-[#73848a] self-center">
                              +{app.categories.length - 2}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Column 5: Certificate */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className="font-mono text-[11px] text-[#087f80] font-semibold block truncate max-w-[140px]">
                          📄 {app.certificateFileName}
                        </span>
                        <span className="text-[10px] text-[#73848a]">แนบแล้ว</span>
                      </td>

                      {/* Column 6: Status */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        {app.status === "approved" ? (
                          <span className="inline-block border border-[#087557] bg-[#edf7f5] px-2 py-0.5 text-[11px] font-extrabold text-[#087557]">
                            ✓ อนุมัติแล้ว
                          </span>
                        ) : app.status === "needs_revision" ? (
                          <span className="inline-block border border-[#d97706] bg-[#fffbeb] px-2 py-0.5 text-[11px] font-extrabold text-[#b45309]">
                            ⚠️ ขอเอกสารเพิ่ม
                          </span>
                        ) : app.status === "rejected" ? (
                          <span className="inline-block border border-[#f04f3e] bg-[#fff1f2] px-2 py-0.5 text-[11px] font-extrabold text-[#f04f3e]">
                            ✕ ไม่อนุมัติ
                          </span>
                        ) : (
                          <span className="inline-block border border-[#087f80] bg-[#edf7f5] px-2 py-0.5 text-[11px] font-extrabold text-[#087f80]">
                            ⏳ รอตรวจสอบ
                          </span>
                        )}
                      </td>

                      {/* Column 7: Actions */}
                      <td className="px-4 py-3.5 text-right whitespace-nowrap">
                        <div
                          className="flex items-center justify-end gap-1.5"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            onClick={() => handleOpenDetail(app)}
                            className="border border-[#087f80] bg-white px-2.5 py-1 text-[11px] font-bold text-[#087f80] hover:bg-[#edf7f5] transition-colors"
                          >
                            🔍 ตรวจสอบ
                          </button>

                          {app.status !== "approved" && (
                            <button
                              type="button"
                              onClick={() => handleApprove(app.id)}
                              className="border border-[#087557] bg-[#087557] px-2.5 py-1 text-[11px] font-extrabold text-white hover:bg-[#065e46] transition-colors"
                            >
                              ✓ อนุมัติ
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Business Rule & Audit Notice Callout */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-[#10283a]">
          <div className="border border-[#b9d9d6] bg-[#edf7f5] p-5 shadow-xs space-y-1.5">
            <h3 className="font-extrabold text-[#087557] text-sm">
              ระเบียบการอนุมัติสิทธิ์ (Verification Rule BR-02)
            </h3>
            <p className="leading-relaxed text-[#53656c]">
              เมื่อ Manager กดอนุมัติใบสมัคร ระบบจะเปิดสิทธิ์ให้ล่ามจิตอาสาสามารถเปิดสวิตช์ความพร้อมรับงาน (is_available) และกดรับภารกิจ SOS บนกระดานได้ทันที
            </p>
          </div>

          <div className="border border-[#cbd7dc] bg-white p-5 shadow-xs space-y-1.5">
            <h3 className="font-extrabold text-[#10283a] text-sm">
              บันทึกกิจกรรมและประวัติการตรวจสอบ (Audit Trail NFR-07)
            </h3>
            <p className="leading-relaxed text-[#53656c]">
              ทุกการตัดสินใจอนุมัติ ขอเอกสารเพิ่ม หรือปฏิเสธ จะถูกบันทึกรหัส Manager ID วันที่และเวลาลงในระบบอย่างโปร่งใส เพื่อการตรวจสอบย้อนหลัง
            </p>
          </div>
        </section>
      </main>

      {/* Application Inspection & Review Modal */}
      <ApplicationDetailModal
        application={selectedApp}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        onApprove={handleApprove}
        onRequestRevision={handleRequestRevision}
        onReject={handleReject}
      />

      <SiteFooter copy={footerCopy} brandSubtitle={headerCopy.brandSubtitle} />
    </div>
  );
}

