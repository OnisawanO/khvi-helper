export type SystemRole = "User" | "Interpreter" | "Manager" | "Admin";

export type AccountStatus = "Active" | "Locked" | "Banned";

export type AdminUserRecord = {
  id: string;
  name: string;
  email: string;
  phone: string;
  primaryLanguage: string;
  spokenLanguages: string[];
  role: SystemRole;
  isLocked: boolean;
  lockReason?: string;
  accountStatus?: AccountStatus; // Active, Locked (Temporary), Banned (Permanent Hard Ban)
  registeredAt: string;
  lastActive: string;
  // Interpreter specific fields if role === 'Interpreter'
  interpreterStats?: {
    verificationStatus: "Approved" | "Pending" | "Under Review" | "Suspended";
    completedMissions: number;
    rating: number; // e.g. 4.9
    specialties: string[];
    responseTimeAvg: string; // e.g. '2.4 mins'
    feedbackHighlights: string[];
  };
};

export type AdminIncidentReport = {
  id: string;
  reporterName: string;
  reporterRole: "User" | "Interpreter";
  reportedUserId: string;
  reportedUserName: string;
  reportedUserRole: "User" | "Interpreter";
  bookingId: string;
  reason: string; // English translated reason for admin decision-making
  originalReason?: string; // Original reason in user's native language
  originalLanguage?: string; // e.g., "Spanish", "Thai", "Russian", "Japanese"
  severity: "high" | "critical" | "medium";
  createdAt: string;
  status: "Escalated to Admin" | "Resolved (Locked)" | "Resolved (Hard Banned)" | "Dismissed";
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

export type AdminActiveTab = "users" | "reports" | "audit";

