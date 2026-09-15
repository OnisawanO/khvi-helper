export type VolunteerApplicationStatus = "under_review" | "approved" | "needs_revision" | "rejected";

export type VolunteerApplicationSummary = {
  applicationId: string;
  userId: string;
  applicantName: string;
  status: VolunteerApplicationStatus;
  submittedAt: string;
  phone?: string;
  extraContact?: string;
  languages?: Array<{ id: string; name: string; type?: string }>;
  categories?: Array<{ id: number; name: string; icon?: string }>;
  certificateFileName?: string;
  assignedArea?: string;
};

const STORAGE_KEY = "khvi-volunteer-applications-v1";
const CHANGE_EVENT = "khvi-volunteer-applications-changed";

function readApplications(): VolunteerApplicationSummary[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];

    return parsed.filter((application): application is VolunteerApplicationSummary => (
      typeof application === "object"
      && application !== null
      && typeof (application as VolunteerApplicationSummary).applicationId === "string"
      && typeof (application as VolunteerApplicationSummary).userId === "string"
      && typeof (application as VolunteerApplicationSummary).applicantName === "string"
      && ["under_review", "approved", "needs_revision", "rejected"].includes((application as VolunteerApplicationSummary).status)
      && typeof (application as VolunteerApplicationSummary).submittedAt === "string"
    ));
  } catch {
    return [];
  }
}

export function getVolunteerApplication(userId: string): VolunteerApplicationSummary | null {
  return readApplications().find((application) => application.userId === userId) ?? null;
}

export function submitVolunteerApplication(input: Omit<VolunteerApplicationSummary, "applicationId" | "status" | "submittedAt">): VolunteerApplicationSummary {
  const applications = readApplications();
  const existing = applications.find((application) => application.userId === input.userId);
  const now = new Date();
  const application: VolunteerApplicationSummary = {
    applicationId: existing?.applicationId ?? `APP-${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
    userId: input.userId,
    applicantName: input.applicantName,
    status: existing?.status ?? "under_review",
    submittedAt: existing?.submittedAt ?? now.toISOString(),
    phone: input.phone,
    extraContact: input.extraContact,
    languages: input.languages,
    categories: input.categories,
    certificateFileName: input.certificateFileName,
    assignedArea: input.assignedArea,
  };
  const nextApplications = [application, ...applications.filter((item) => item.userId !== input.userId)];

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextApplications));
  window.dispatchEvent(new Event(CHANGE_EVENT));
  return application;
}

export function subscribeVolunteerApplications(listener: () => void): () => void {
  if (typeof window === "undefined") return () => undefined;

  const handleStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) listener();
  };

  window.addEventListener(CHANGE_EVENT, listener);
  window.addEventListener("storage", handleStorage);

  return () => {
    window.removeEventListener(CHANGE_EVENT, listener);
    window.removeEventListener("storage", handleStorage);
  };
}
