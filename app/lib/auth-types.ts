import type { Locale } from "@/app/components/site-header";
import { getAuthCopy } from "@/app/lib/auth-copy";

export type UserRole = "User" | "Interpreter" | "Manager" | "Admin";
export type AdminLevel = "primary" | "delegated";

export interface UserProfile {
  userId: string;
  name: string;
  avatarUrl?: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  role: UserRole;
  adminLevel?: AdminLevel;
  isLocked: boolean;
  preferredUiLanguage: Locale;
  serviceLanguageIds?: string[];
  matchingCategoryIds?: string[];
  createdAt: string;
}

export interface RegisterInput {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  dateOfBirth: string;
  preferredUiLanguage: Locale;
}

export interface ValidationErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  phone?: string;
  dateOfBirth?: string;
  preferredUiLanguage?: string;
  general?: string;
}

export function getDisplayName(name: string): string {
  const displayName = name.replace(/\s*\((?:General User|Volunteer Interpreter)\)\s*$/i, "").trim();
  return displayName || name;
}

export function splitDisplayName(name: string): { firstName: string; lastName: string } {
  const cleanName = getDisplayName(name).replace(/\s+\([^)]*\)$/, "").trim();
  const [firstName = "", ...lastNameParts] = cleanName.split(/\s+/);
  return { firstName, lastName: lastNameParts.join(" ") };
}

export function calculateAge(dateOfBirthString: string): number | null {
  if (!dateOfBirthString) return null;

  const birthDate = new Date(dateOfBirthString);
  if (isNaN(birthDate.getTime())) return null;

  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) age--;
  return age >= 0 ? age : null;
}

export function validateRegisterInput(input: RegisterInput, locale: Locale = "th"): ValidationErrors {
  const errors: ValidationErrors = {};
  const copy = getAuthCopy(locale).validation;
  const firstName = input.firstName?.trim() || "";
  const lastName = input.lastName?.trim() || "";
  const email = input.email?.trim() || "";

  if (!firstName) errors.firstName = copy.firstNameRequired;
  else if (firstName.length < 2) errors.firstName = copy.firstNameMin;

  if (!lastName) errors.lastName = copy.lastNameRequired;
  else if (lastName.length < 2) errors.lastName = copy.lastNameMin;

  if (!email) errors.email = copy.emailRequired;
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = copy.emailInvalid;

  if (!input.password) errors.password = copy.passwordRequired;
  else if (input.password.length < 8) errors.password = copy.passwordMin;

  if (!input.confirmPassword) errors.confirmPassword = copy.confirmPasswordRequired;
  else if (input.password !== input.confirmPassword) errors.confirmPassword = copy.passwordsMismatch;

  const phone = (input.phone || "").replace(/[\s-]/g, "");
  if (!phone) errors.phone = copy.phoneRequired;
  else if (!/^0\d{8,9}$/.test(phone)) errors.phone = copy.phoneInvalid;

  if (!input.dateOfBirth) errors.dateOfBirth = copy.dateOfBirthRequired;
  else {
    const age = calculateAge(input.dateOfBirth);
    if (age === null) errors.dateOfBirth = copy.dateOfBirthInvalid;
    else if (age < 13) errors.dateOfBirth = copy.minimumAge;
    else if (age > 120) errors.dateOfBirth = copy.dateOfBirthRange;
  }

  const validLocales: Locale[] = ["th", "en", "zh", "es", "ar"];
  if (!input.preferredUiLanguage || !validLocales.includes(input.preferredUiLanguage)) {
    errors.preferredUiLanguage = copy.localeInvalid;
  }

  return errors;
}

export function getRedirectPathByRole(role: UserRole): string {
  switch (role) {
    case "User": return "/user";
    case "Interpreter": return "/interpreter";
    case "Manager": return "/manager";
    case "Admin": return "/admin";
    default: return "/";
  }
}
