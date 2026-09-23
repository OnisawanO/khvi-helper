export type ApplicantDocumentFormat = "pdf" | "png" | "jpg";

export type ApplicantDocument = {
  name: string;
  type: "id" | "cert" | "cv" | "police";
  format: ApplicantDocumentFormat;
  size: string;
  url?: string;
};

export type InterpreterApplicant = {
  id: string;
  name: string;
  age: number;
  country: string;
  primaryLanguage: string;
  spokenLanguages: string[];
  specialtyCategories: string[];
  experienceSummary: string;
  contactChannels: string;
  phone?: string;
  email?: string;
  extraContact?: string;
  appliedDate: string;
  reviewedAt?: string;
  status: "Pending" | "Under Review" | "Approved" | "Rejected";
  rejectionReason?: string;
  document: ApplicantDocument;
  documents?: ApplicantDocument[]; // Optional backwards compatibility
  backgroundCheck: "Passed" | "Pending" | "Requires Review";
  proficiencyScore?: string;
  rating?: number;
  reviewCount?: number;
  completedMissions?: number;
  isProfileUpdate?: boolean;
};

export type IncidentSeverity = "critical" | "high" | "medium";

export type IncidentReport = {
  id: string;
  reporterName: string;
  reporterRole: "User" | "Interpreter";
  bookingId?: string;
  category?: string;
  systemArea?: string;
  reason: string;
  originalReason?: string;
  originalLanguage?: string;
  severity?: IncidentSeverity;
  createdAt: string;
  updatedAt?: string;
  status: "Pending Investigation" | "Escalated to Admin" | "Resolved";
  actionTaken?: string;
};

export type ProfileChangeRequestType = "language" | "category" | "both";
export type ProfileChangeRequestStatus =
  | "Pending Review"
  | "Changes Requested"
  | "Approved"
  | "Rejected";

export type ProfileChangeRequest = {
  id: string;
  interpreterId: string;
  interpreterName: string;
  requestType: ProfileChangeRequestType;
  currentValues: string[];
  requestedValues: string[];
  currentLanguages?: string[];
  requestedLanguages?: string[];
  currentCategories?: string[];
  requestedCategories?: string[];
  reason: string;
  evidenceFiles: Array<{
    name: string;
    format: "pdf" | "image";
    size: string;
    url?: string;
  }>;
  submittedAt: string;
  reviewedAt?: string;
  status: ProfileChangeRequestStatus;
  reviewNote?: string;
};

export type ManagerNavSection = "queue" | "approved" | "rejected" | "change-requests" | "reports" | "history";

export type ManagerActivity = {
  id: string;
  timestamp: string;
  type: "approval" | "rejection" | "change_request" | "report_escalation" | "report_resolved" | "system_action";
  targetName: string;
  description: string;
};
