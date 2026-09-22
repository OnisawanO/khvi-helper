"use client";

import { useSyncExternalStore } from "react";
import type { UserProfile } from "./mock-auth";

export type ApplicationStatus =
  | "pending"
  | "under_review"
  | "needs_revision"
  | "approved"
  | "rejected"
  | "cancelled";

export type ApplicationDocument = {
  name: string;
  type: "id" | "cert" | "cv" | "police";
  size: string;
  url?: string;
};

export type ApplicationLanguage = {
  id: string;
  name: string;
  nameTh?: string;
  nameZh?: string;
  type?: string;
  level?: string;
};

export type ApplicationCategory = {
  id: number;
  name: string;
  nameTh?: string;
  nameZh?: string;
  icon?: string;
};

export type WorkHistoryEntry = {
  id: number;
  description: string;
  startDate: string;
  endDate: string;
  organization?: string;
};

export type InterpreterApplication = {
  id: string;
  userId: string;
  applicantName: string;
  phone: string;
  email: string;
  age: number;
  extraContact: string;
  primaryLanguage: string;
  languages: ApplicationLanguage[];
  categories: ApplicationCategory[];
  workHistory: WorkHistoryEntry[];
  certificateFileName: string;
  certificateUrl: string;
  documents: ApplicationDocument[];
  submittedAt: string;
  reviewedAt?: string;
  reviewedByManagerId?: string;
  reviewedByManagerName?: string;
  status: ApplicationStatus;
  rejectReason?: string;
  revisionNote?: string;
  cancellationReason?: string;
  cancelledAt?: string;
  cancelledByUserId?: string;
  assignedArea: string;
  isAvailable: boolean;
};

export type ApplicationInput = {
  applicantName: string;
  phone: string;
  email: string;
  age: number;
  extraContact: string;
  languages: ApplicationLanguage[];
  categories: ApplicationCategory[];
  certificateFileName: string;
  certificateUrl: string;
  assignedArea?: string;
};

export type ReviewDecision =
  | { status: "approved" }
  | { status: "needs_revision"; note: string }
  | { status: "rejected"; reason: string };

const KEY = "khvi-interpreter-applications-v1";
const EVENT = "khvi-interpreter-applications-changed";
let cachedRaw: string | null = null;
let cached: InterpreterApplication[] = [];
const empty: InterpreterApplication[] = [];

const seedApplications: InterpreterApplication[] = [
  {
    id: "APP-2026-0913-048",
    userId: "mock-user-id-001",
    applicantName: "ปกรณ์ กิจเจริญชัย (Pakorn Kitcharoenchai)",
    phone: "081-234-5678",
    email: "pakorn.k@example.com",
    age: 28,
    extraContact: "@pakorn_trans (LINE ID)",
    primaryLanguage: "ไทย (Thai)",
    languages: [
      { id: "th", name: "ไทย (Thai)", type: "Primary", level: "Native" },
      { id: "en", name: "อังกฤษ (English)", type: "Fluent", level: "IELTS 7.5" },
      { id: "zh", name: "จีน (Chinese)", type: "HSK 5", level: "242 คะแนน" },
    ],
    categories: [
      { id: 9, name: "การสื่อสารทั่วไปและชีวิตประจำวัน (General & Daily Life)", icon: "💬" },
      { id: 1, name: "การแพทย์และโรงพยาบาล (Healthcare & Hospital)", icon: "🏥" },
    ],
    workHistory: [
      {
        id: 1,
        description: "ล่ามอาสาสมัครโรงพยาบาลศิริราช แผนกผู้ป่วยนอกชาวต่างชาติ",
        startDate: "2024-01-10",
        endDate: "2025-12-20",
        organization: "โรงพยาบาลศิริราช",
      },
    ],
    certificateFileName: "hsk5_and_ielts_certificate.pdf",
    certificateUrl: "",
    documents: [{ name: "hsk5_and_ielts_certificate.pdf", type: "cert", size: "ยังไม่ระบุ" }],
    submittedAt: "13 ก.ย. 2026, 21:30 น.",
    status: "pending",
    assignedArea: "กรุงเทพมหานครและปริมณฑล",
    isAvailable: false,
  },
  {
    id: "APP-2026-0913-047",
    userId: "mock-interpreter-id-002",
    applicantName: "ศิริพร บุญรักษา (Siriporn Boonraksa)",
    phone: "089-765-4321",
    email: "siriporn.b@example.com",
    age: 34,
    extraContact: "siriporn_bkk (WeChat)",
    primaryLanguage: "ไทย (Thai)",
    languages: [
      { id: "th", name: "ไทย (Thai)", type: "Primary", level: "Native" },
      { id: "zh", name: "จีน (Chinese)", type: "HSK 6", level: "Fluent" },
    ],
    categories: [
      { id: 4, name: "อุบัติเหตุและกู้ชีพฉุกเฉิน (Emergency SOS)", icon: "🚨" },
      { id: 6, name: "การท่องเที่ยวและการเดินทาง (Tourism & Transit)", icon: "✈️" },
    ],
    workHistory: [],
    certificateFileName: "tour_guide_and_hsk6_license.pdf",
    certificateUrl: "",
    documents: [{ name: "tour_guide_and_hsk6_license.pdf", type: "cert", size: "ยังไม่ระบุ" }],
    submittedAt: "13 ก.ย. 2026, 20:15 น.",
    reviewedAt: "13 ก.ย. 2026, 21:10 น.",
    reviewedByManagerId: "mock-manager-id-003",
    reviewedByManagerName: "วิภา ตรวจสอบ (Manager)",
    status: "approved",
    assignedArea: "สมุทรปราการ / สุวรรณภูมิ",
    isAvailable: false,
  },
  {
    id: "APP-2026-0913-045",
    userId: "mock-applicant-id-045",
    applicantName: "กมลวรรณ วงศ์สว่าง (Kamonwan Wongsawang)",
    phone: "084-555-1234",
    email: "kamonwan.w@example.com",
    age: 23,
    extraContact: "kamonwan_es (LINE ID)",
    primaryLanguage: "ไทย (Thai)",
    languages: [
      { id: "th", name: "ไทย (Thai)", type: "Primary", level: "Native" },
      { id: "es", name: "สเปน (Spanish)", type: "DELE B1", level: "Intermediate" },
    ],
    categories: [{ id: 9, name: "การสื่อสารทั่วไปและชีวิตประจำวัน (General & Daily Life)", icon: "💬" }],
    workHistory: [],
    certificateFileName: "dele_b1_incomplete_scan.jpg",
    certificateUrl: "",
    documents: [{ name: "dele_b1_incomplete_scan.jpg", type: "cert", size: "ยังไม่ระบุ" }],
    submittedAt: "13 ก.ย. 2026, 16:20 น.",
    reviewedAt: "13 ก.ย. 2026, 17:05 น.",
    reviewedByManagerId: "mock-manager-id-003",
    reviewedByManagerName: "วิภา ตรวจสอบ (Manager)",
    status: "needs_revision",
    revisionNote: "เอกสารผลสอบ DELE ไม่เห็นตราประทับและหมายเลขประจำตัวผู้สอบ กรุณาแนบไฟล์ PDF ต้นฉบับ",
    assignedArea: "เชียงใหม่ (เมือง)",
    isAvailable: false,
  },
  {
    id: "APP-2026-0913-044",
    userId: "mock-applicant-id-044",
    applicantName: "สมชาย รักสงบ (Somchai Raksangob)",
    phone: "086-111-2233",
    email: "somchai.r@example.com",
    age: 45,
    extraContact: "@somchai (LINE)",
    primaryLanguage: "ไทย (Thai)",
    languages: [
      { id: "th", name: "ไทย (Thai)", type: "Primary", level: "Native" },
      { id: "en", name: "อังกฤษ (English)", type: "Basic", level: "A2" },
    ],
    categories: [{ id: 2, name: "สถานีตำรวจและคดีความ (Police & Legal)", icon: "👮" }],
    workHistory: [],
    certificateFileName: "unverified_id_card.png",
    certificateUrl: "",
    documents: [{ name: "unverified_id_card.png", type: "id", size: "ยังไม่ระบุ" }],
    submittedAt: "12 ก.ย. 2026, 14:00 น.",
    reviewedAt: "12 ก.ย. 2026, 15:30 น.",
    reviewedByManagerId: "mock-manager-id-003",
    reviewedByManagerName: "วิภา ตรวจสอบ (Manager)",
    status: "rejected",
    rejectReason: "เอกสารไม่ตรงกับคุณวุฒิภาษาที่ขอรับรอง และระดับภาษา A2 ยังไม่เพียงพอ",
    assignedArea: "ภูเก็ต (ป่าตอง)",
    isAvailable: false,
  },
];

function isStatus(value: unknown): value is ApplicationStatus {
  return value === "pending" || value === "under_review" || value === "needs_revision" || value === "approved" || value === "rejected";
}

function isApplication(value: unknown): value is InterpreterApplication {
  if (!value || typeof value !== "object") return false;
  const application = value as Partial<InterpreterApplication>;
  return typeof application.id === "string"
    && typeof application.userId === "string"
    && typeof application.applicantName === "string"
    && typeof application.phone === "string"
    && typeof application.email === "string"
    && typeof application.age === "number"
    && Array.isArray(application.languages)
    && Array.isArray(application.categories)
    && Array.isArray(application.documents)
    && isStatus(application.status)
    && typeof application.isAvailable === "boolean";
}

function read(): InterpreterApplication[] {
  const raw = localStorage.getItem(KEY);
  if (raw === cachedRaw) return cached;

  if (!raw) {
    cachedRaw = null;
    cached = seedApplications;
    return cached;
  }

  const value: unknown = JSON.parse(raw);
  if (!Array.isArray(value) || !value.every(isApplication)) throw new Error("Invalid saved interpreter applications");
  cachedRaw = raw;
  cached = value;
  return cached;
}

function snapshot() {
  try {
    return read();
  } catch {
    return empty;
  }
}

function subscribe(callback: () => void) {
  window.addEventListener(EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

function save(applications: InterpreterApplication[]) {
  const serialized = JSON.stringify(applications);
  cachedRaw = serialized;
  cached = applications;
  localStorage.setItem(KEY, serialized);
  window.dispatchEvent(new Event(EVENT));
}

function applicationId() {
  const year = new Date().getFullYear();
  const suffix = String(Date.now()).slice(-6);
  return `APP-${year}-${suffix}`;
}

function nowLabel() {
  return new Date().toLocaleString("th-TH", { dateStyle: "medium", timeStyle: "short" });
}

export function useInterpreterApplications() {
  const applications = useSyncExternalStore(subscribe, snapshot, () => empty);
  const ready = useSyncExternalStore(subscribe, () => true, () => false);
  return { applications, ready };
}

export function useMyInterpreterApplication(userId: string | null | undefined) {
  const { applications, ready } = useInterpreterApplications();
  const application = userId
    ? applications.find((item) => item.userId === userId) ?? null
    : null;
  return { application, ready };
}

export function getMyInterpreterApplication(userId: string) {
  return read().find((item) => item.userId === userId) ?? null;
}

export function submitInterpreterApplication(user: UserProfile, input: ApplicationInput) {
  const applicantName = input.applicantName.trim();
  const phone = input.phone.trim();
  const certificateFileName = input.certificateFileName.trim();

  if (!applicantName || !phone || !input.languages.length || !input.categories.length || !certificateFileName) {
    throw new Error("Complete your name, phone, languages, categories and certificate before submitting.");
  }

  const current = read();
  const existing = current.find((item) => item.userId === user.userId);
  const existingActiveApplication = existing?.status === "cancelled" ? null : existing;
  const submittedAt = nowLabel();
  const next: InterpreterApplication = {
    id: existingActiveApplication?.id ?? applicationId(),
    userId: user.userId,
    applicantName,
    phone,
    email: input.email.trim() || user.email,
    age: input.age,
    extraContact: input.extraContact.trim(),
    primaryLanguage: input.languages[0]?.name ?? "",
    languages: input.languages,
    categories: input.categories,
    workHistory: existingActiveApplication?.workHistory ?? [],
    certificateFileName,
    certificateUrl: input.certificateUrl,
    documents: [{ name: certificateFileName, type: "cert", size: "ยังไม่ระบุ", url: input.certificateUrl || undefined }],
    submittedAt: existingActiveApplication?.submittedAt ?? submittedAt,
    reviewedAt: existingActiveApplication?.reviewedAt,
    reviewedByManagerId: existingActiveApplication?.reviewedByManagerId,
    reviewedByManagerName: existingActiveApplication?.reviewedByManagerName,
    status: "pending",
    rejectReason: undefined,
    revisionNote: undefined,
    cancellationReason: undefined,
    cancelledAt: undefined,
    cancelledByUserId: undefined,
    assignedArea: input.assignedArea?.trim() || existingActiveApplication?.assignedArea || "ยังไม่ได้ระบุพื้นที่",
    isAvailable: false,
  };

  const applicationToSave = existingActiveApplication
    ? { ...next, id: existingActiveApplication.id, submittedAt: existingActiveApplication.submittedAt }
    : next;
  save(existingActiveApplication
    ? current.map((item) => item.id === existingActiveApplication.id ? applicationToSave : item)
    : [applicationToSave, ...current]);
  return applicationToSave;
}

export function reuploadInterpreterCertificate(applicationIdValue: string, fileName: string) {
  const trimmedFileName = fileName.trim();
  if (!trimmedFileName) throw new Error("Choose a certificate file before uploading.");
  const current = read();
  const application = current.find((item) => item.id === applicationIdValue);
  if (!application) throw new Error("Application not found.");

  const updated = {
    ...application,
    certificateFileName: trimmedFileName,
    certificateUrl: "",
    documents: [{ name: trimmedFileName, type: "cert" as const, size: "ยังไม่ระบุ" }],
    status: "under_review" as const,
    revisionNote: undefined,
    rejectReason: undefined,
    reviewedAt: undefined,
    reviewedByManagerId: undefined,
    reviewedByManagerName: undefined,
  };
  save(current.map((item) => item.id === application.id ? updated : item));
  return updated;
}

export function reviewInterpreterApplication(applicationIdValue: string, manager: UserProfile, decision: ReviewDecision) {
  const current = read();
  const application = current.find((item) => item.id === applicationIdValue);
  if (!application) throw new Error("Application not found.");
  if (application.status === "cancelled") throw new Error("Cancelled applications cannot be reviewed.");
  if (application.status === "approved" && decision.status !== "approved") {
    throw new Error("Approved applications require an Admin action to be revoked.");
  }
  if (decision.status === "needs_revision" && !decision.note.trim()) throw new Error("Add a revision note.");
  if (decision.status === "rejected" && !decision.reason.trim()) throw new Error("Add a rejection reason.");

  const updated: InterpreterApplication = {
    ...application,
    status: decision.status,
    reviewedAt: nowLabel(),
    reviewedByManagerId: manager.userId,
    reviewedByManagerName: manager.name,
    revisionNote: decision.status === "needs_revision" ? decision.note.trim() : undefined,
    rejectReason: decision.status === "rejected" ? decision.reason.trim() : undefined,
    isAvailable: decision.status === "approved" ? application.isAvailable : false,
  };
  save(current.map((item) => item.id === application.id ? updated : item));
  return updated;
}

export function cancelInterpreterApplication(applicationIdValue: string, userId: string, reason = "") {
  const current = read();
  const application = current.find((item) => item.id === applicationIdValue);
  if (!application || application.userId !== userId) throw new Error("Application not found.");
  if (!["pending", "under_review", "needs_revision"].includes(application.status)) {
    throw new Error("This application can no longer be cancelled.");
  }

  const updated: InterpreterApplication = {
    ...application,
    status: "cancelled",
    cancellationReason: reason.trim() || "ผู้สมัครขอถอนใบสมัคร",
    cancelledAt: nowLabel(),
    cancelledByUserId: userId,
    isAvailable: false,
  };
  save(current.map((item) => item.id === application.id ? updated : item));
  return updated;
}

export function setInterpreterAvailability(applicationIdValue: string, userId: string, available: boolean) {
  const current = read();
  const application = current.find((item) => item.id === applicationIdValue);
  if (!application || application.userId !== userId) throw new Error("Application not found.");
  if (application.status !== "approved") throw new Error("Only approved interpreters can change availability.");
  const updated = { ...application, isAvailable: available };
  save(current.map((item) => item.id === application.id ? updated : item));
  return updated;
}

export function toLegacyApplicant(application: InterpreterApplication) {
  return {
    id: application.id,
    name: application.applicantName,
    age: application.age,
    country: application.assignedArea,
    primaryLanguage: application.primaryLanguage,
    spokenLanguages: application.languages.map((language) => language.name),
    specialtyCategories: application.categories.map((category) => category.name),
    experienceSummary: application.workHistory.map((entry) => entry.organization ? `${entry.description} (${entry.organization})` : entry.description).join("; ") || "No experience history submitted.",
    contactChannels: [application.extraContact, application.phone, application.email].filter(Boolean).join(" · "),
    appliedDate: application.submittedAt,
    status: application.status === "approved" ? "Approved" : application.status === "rejected" ? "Rejected" : application.status === "needs_revision" ? "Needs Revision" : application.status === "under_review" ? "Under Review" : "Pending",
    rejectionReason: application.rejectReason,
    documents: application.documents.map((document) => ({ name: document.name, type: document.type, size: document.size })),
    backgroundCheck: application.status === "rejected" ? "Requires Review" : "Pending",
    proficiencyScore: application.languages.map((language) => language.level).filter(Boolean).join(", "),
  };
}
