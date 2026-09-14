export type SystemRole = "User" | "Interpreter" | "Manager" | "Admin";

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

export type AuditLogEntry = {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  targetUser: string;
  severity: "info" | "warning" | "danger";
  details: string;
};

export type AdminActiveTab = "users" | "interpreters" | "audit";

