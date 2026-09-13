export type ApplicantDocument = {
  name: string;
  type: "id" | "cert" | "cv" | "police";
  size: string;
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
  documents: ApplicantDocument[];
  backgroundCheck: "Passed" | "Pending" | "Requires Review";
  proficiencyScore?: string;
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

export type IncidentReport = {
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

export type ManagerNavSection = "queue" | "approved" | "rejected" | "tickets" | "reports";

