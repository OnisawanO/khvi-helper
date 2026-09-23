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
  appliedDate: string;
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

export type HelpTicket = {
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

export type IncidentSeverity = "critical" | "high" | "medium";

export type IncidentReport = {
  id: string;
  reporterName: string;
  reporterRole: "User" | "Interpreter";
  reportedUserName: string;
  reportedUserRole: "User" | "Interpreter";
  bookingId: string;
  reason: string;
  originalReason?: string;
  originalLanguage?: string;
  severity?: IncidentSeverity;
  createdAt: string;
  status: "Pending Investigation" | "Escalated to Admin" | "Resolved";
  actionTaken?: string;
};

export type ManagerNavSection = "queue" | "approved" | "rejected" | "tickets" | "reports" | "history";

export type ManagerActivity = {
  id: string;
  timestamp: string;
  type: "approval" | "rejection" | "ticket_reply" | "report_escalation" | "report_resolved";
  targetName: string;
  description: string;
};
