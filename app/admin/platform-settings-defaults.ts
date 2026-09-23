import type { SystemSettingsConfig } from "./types";

/**
 * Baseline configuration used to seed and reset the persisted platform policy
 * row. This is configuration, not dashboard data.
 */
export const DEFAULT_PLATFORM_SETTINGS: SystemSettingsConfig = {
  sosDispatchRadiusKm: 15,
  autoEscalateTicketMinutes: 20,
  allowGuestSosRequests: false,
  interpreterMinRatingThreshold: 3.5,
  mandatoryIdVerification: true,
  maxFalseAlarmsBeforeAutoLock: 3,
  languagesCatalog: [
    "Thai",
    "English",
    "Mandarin Chinese",
    "Japanese",
    "German",
    "French",
    "Spanish",
    "Korean",
    "Russian",
    "Arabic",
  ],
  specialtyCategories: [
    "Medical",
    "Emergency",
    "Tourism",
    "Police station",
    "Legal Documentation",
    "Immigration",
    "Hospital",
    "Consular Support",
    "General Help",
  ],
};
