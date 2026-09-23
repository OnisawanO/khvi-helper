export type SystemRole = "User" | "Interpreter" | "Manager" | "Admin";
export type AdminLevel = "primary" | "delegated";

export type AccountStatus = "Active" | "Locked" | "Banned";
export type AccountRestrictionType = "none" | "soft" | "hard";
export type InterpreterAccessStatus = "active" | "revoked";

export type UserStatusFilter =
  | "Directory"
  | "All"
  | "Active"
  | "SoftSuspended"
  | "PermanentlyBanned"
  | "AppealPending";

export type InterpreterApplicationStatus =
  | "Pending"
  | "Under Review"
  | "Needs Revision"
  | "Approved"
  | "Rejected"
  | "Cancelled"
  | "Suspended";

export type InterpreterApplicationSummary = {
  id: string;
  status: InterpreterApplicationStatus;
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  languages: string[];
  categories: string[];
};

export type AdminUserRecord = {
  id: string;
  name: string;
  email: string;
  phone: string;
  dateOfBirth?: string;
  preferredUiLanguage?: string;
  primaryLanguage: string;
  spokenLanguages: string[];
  role: SystemRole;
  adminLevel?: AdminLevel;
  isLocked: boolean;
  lockReason?: string;
  restrictionType?: AccountRestrictionType;
  restrictionReason?: string;
  restrictionAt?: string;
  restrictionByUserId?: string;
  interpreterAccessStatus?: InterpreterAccessStatus;
  accountStatus?: AccountStatus; // Active, Locked (Temporary), Banned (Permanent Hard Ban)
  // Appeal fields for soft-banned users
  hasPendingAppeal?: boolean;
  appealReason?: string;
  appealSubmittedAt?: string;
  appealCategory?: "Accidental" | "Device Issue" | "Misunderstanding" | "Other";
  registeredAt: string;
  lastActive: string;
  applicationSummary?: InterpreterApplicationSummary;
  // Interpreter-specific fields. Values are populated only from connected data.
  interpreterStats?: {
    verificationStatus: InterpreterApplicationStatus | "Not Available";
    completedMissions: number;
    rating?: number;
    reviewCount?: number;
    specialties: string[];
    responseTimeAvg?: string;
    feedbackHighlights?: string[];
  };
};

export type AdminIncidentReport = {
  id: string;
  reporterName: string;
  reporterRole: "User" | "Interpreter";
  bookingId?: string;
  category?: string;
  systemArea?: string;
  reason: string; // English translated reason for admin decision-making
  originalReason?: string; // Original reason in user's native language
  originalLanguage?: string; // e.g., "Spanish", "Thai", "Russian", "Japanese"
  severity: "high" | "critical" | "medium";
  createdAt: string;
  status: "Escalated to Admin" | "Resolved" | "Dismissed";
  actionTaken?: string;
};

export type AuditLogEntry = {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  targetUser: string;
  severity: "info" | "warning" | "danger";
  details: string;
};

export type AdminActiveTab =
  | "overview"
  | "users"
  | "reports"
  | "audit"
  | "policies"
  | "manager-operations";

export type SystemSettingsConfig = {
  // 1. Emergency Dispatch & SOS Policy
  sosDispatchRadiusKm: number;
  autoEscalateTicketMinutes: number;
  allowGuestSosRequests: boolean;

  // 2. Interpreter Accreditation & Platform Safeguards
  interpreterMinRatingThreshold: number;
  mandatoryIdVerification: boolean;
  maxFalseAlarmsBeforeAutoLock: number;

  // 3. Taxonomies & Catalogs
  languagesCatalog: string[];
  specialtyCategories: string[];

  // Metadata
  lastUpdated?: string;
  updatedBy?: string;
};
