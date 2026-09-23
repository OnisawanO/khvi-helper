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
  isProfileUpdate?: boolean;
};
