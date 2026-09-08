import type { Locale } from "@/app/components/site-header";

export type UserRole = "User" | "Interpreter" | "Manager" | "Admin";

export interface UserProfile {
  userId: string;
  name: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  role: UserRole;
  isLocked: boolean;
  preferredUiLanguage: Locale;
  createdAt: string;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  dateOfBirth: string;
  preferredUiLanguage: Locale;
}

export interface ValidationErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  phone?: string;
  dateOfBirth?: string;
  preferredUiLanguage?: string;
  general?: string;
}

export const AUTH_SESSION_STORAGE_KEY = "khvi_mock_auth_user";

export function calculateAge(dateOfBirthString: string): number | null {
  if (!dateOfBirthString) return null;

  const birthDate = new Date(dateOfBirthString);
  if (isNaN(birthDate.getTime())) return null;

  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age >= 0 ? age : null;
}

export function validateRegisterInput(input: RegisterInput): ValidationErrors {
  const errors: ValidationErrors = {};

  const trimmedName = input.name?.trim() || "";
  if (!trimmedName) {
    errors.name = "กรุณากรอกชื่อ-นามสกุล";
  } else if (trimmedName.length < 2) {
    errors.name = "ชื่อต้องมีความยาวอย่างน้อย 2 ตัวอักษร";
  }

  const trimmedEmail = input.email?.trim() || "";
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!trimmedEmail) {
    errors.email = "กรุณากรอกอีเมล";
  } else if (!emailRegex.test(trimmedEmail)) {
    errors.email = "รูปแบบอีเมลไม่ถูกต้อง";
  }

  if (!input.password) {
    errors.password = "กรุณากำหนดรหัสผ่าน";
  } else if (input.password.length < 8) {
    errors.password = "รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร";
  }

  if (!input.confirmPassword) {
    errors.confirmPassword = "กรุณายืนยันรหัสผ่าน";
  } else if (input.password !== input.confirmPassword) {
    errors.confirmPassword = "รหัสผ่านไม่ตรงกัน";
  }

  const cleanedPhone = (input.phone || "").replace(/[\s-]/g, "");
  const phoneRegex = /^0\d{8,9}$/;
  if (!cleanedPhone) {
    errors.phone = "กรุณากรอกเบอร์โทรศัพท์";
  } else if (!phoneRegex.test(cleanedPhone)) {
    errors.phone = "กรุณากรอกเบอร์โทรศัพท์ที่ถูกต้อง (เช่น 0812345678)";
  }

  if (!input.dateOfBirth) {
    errors.dateOfBirth = "กรุณาเลือกวันเดือนปีเกิด";
  } else {
    const age = calculateAge(input.dateOfBirth);
    if (age === null) {
      errors.dateOfBirth = "วันเดือนปีเกิดไม่ถูกต้อง";
    } else if (age < 13) {
      errors.dateOfBirth = "ผู้ใช้งานต้องมีอายุอย่างน้อย 13 ปีขึ้นไป";
    } else if (age > 120) {
      errors.dateOfBirth = "กรุณาระบุวันเดือนปีเกิดที่ถูกต้อง";
    }
  }

  const validLocales: Locale[] = ["th", "en", "zh", "my", "vi"];
  if (!input.preferredUiLanguage || !validLocales.includes(input.preferredUiLanguage)) {
    errors.preferredUiLanguage = "กรุณาเลือกภาษาหน้าจอที่รองรับ";
  }

  return errors;
}

export function saveMockUserSession(user: UserProfile): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(AUTH_SESSION_STORAGE_KEY, JSON.stringify(user));
  } catch {
    // Gracefully handle storage errors
  }
}

export function getMockUserSession(): UserProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = window.localStorage.getItem(AUTH_SESSION_STORAGE_KEY);
    if (!stored) return null;
    return JSON.parse(stored) as UserProfile;
  } catch {
    return null;
  }
}

export function clearMockUserSession(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(AUTH_SESSION_STORAGE_KEY);
  } catch {
    // Gracefully handle storage errors
  }
}

export async function registerMockUser(input: RegisterInput): Promise<{
  success: boolean;
  user?: UserProfile;
  errors?: ValidationErrors;
}> {
  const validationErrors = validateRegisterInput(input);
  if (Object.keys(validationErrors).length > 0) {
    return { success: false, errors: validationErrors };
  }

  const mockUserId = typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `user-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

  const newUser: UserProfile = {
    userId: mockUserId,
    name: input.name.trim(),
    email: input.email.trim().toLowerCase(),
    phone: input.phone.trim(),
    dateOfBirth: input.dateOfBirth,
    role: "User",
    isLocked: false,
    preferredUiLanguage: input.preferredUiLanguage,
    createdAt: new Date().toISOString(),
  };

  saveMockUserSession(newUser);

  return {
    success: true,
    user: newUser,
  };
}

export const DEFAULT_MOCK_USERS: Record<UserRole, UserProfile & { password: string }> = {
  User: {
    userId: "mock-user-id-001",
    name: "สมชาย มีความหวัง (General User)",
    email: "user@khvi.org",
    phone: "0812345678",
    dateOfBirth: "1995-05-12",
    role: "User",
    isLocked: false,
    preferredUiLanguage: "th",
    createdAt: "2026-01-01T00:00:00.000Z",
    password: "password123",
  },
  Interpreter: {
    userId: "mock-interpreter-id-002",
    name: "หลิน หลิน (Volunteer Interpreter)",
    email: "volunteer@khvi.org",
    phone: "0898765432",
    dateOfBirth: "1992-08-20",
    role: "Interpreter",
    isLocked: false,
    preferredUiLanguage: "zh",
    createdAt: "2026-01-02T00:00:00.000Z",
    password: "password123",
  },
  Manager: {
    userId: "mock-manager-id-003",
    name: "วิภา ตรวจสอบ (Manager)",
    email: "manager@khvi.org",
    phone: "0823456789",
    dateOfBirth: "1988-11-15",
    role: "Manager",
    isLocked: false,
    preferredUiLanguage: "th",
    createdAt: "2026-01-03T00:00:00.000Z",
    password: "password123",
  },
  Admin: {
    userId: "mock-admin-id-004",
    name: "ธีรเดช ผู้ดูแลระบบ (Admin)",
    email: "admin@khvi.org",
    phone: "0834567890",
    dateOfBirth: "1985-03-30",
    role: "Admin",
    isLocked: false,
    preferredUiLanguage: "en",
    createdAt: "2026-01-04T00:00:00.000Z",
    password: "password123",
  },
};

export function getRedirectPathByRole(role: UserRole): string {
  switch (role) {
    case "User":
      return "/request-help";
    case "Interpreter":
      return "/volunteer/dashboard";
    case "Manager":
      return "/manager";
    case "Admin":
      return "/admin";
    default:
      return "/";
  }
}

export async function loginMockUser(
  email: string,
  password: string
): Promise<{
  success: boolean;
  user?: UserProfile;
  errors?: ValidationErrors;
}> {
  const trimmedEmail = email?.trim().toLowerCase() || "";
  const errors: ValidationErrors = {};

  if (!trimmedEmail) {
    errors.email = "กรุณากรอกอีเมล";
  }
  if (!password) {
    errors.password = "กรุณากรอกรหัสผ่าน";
  }

  if (Object.keys(errors).length > 0) {
    return { success: false, errors };
  }

  // Check against default mock users
  const matchedUser = Object.values(DEFAULT_MOCK_USERS).find(
    (u) => u.email.toLowerCase() === trimmedEmail
  );

  if (matchedUser) {
    if (matchedUser.password !== password) {
      return { success: false, errors: { general: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" } };
    }
    const profile: UserProfile = {
      userId: matchedUser.userId,
      name: matchedUser.name,
      email: matchedUser.email,
      phone: matchedUser.phone,
      dateOfBirth: matchedUser.dateOfBirth,
      role: matchedUser.role,
      isLocked: matchedUser.isLocked,
      preferredUiLanguage: matchedUser.preferredUiLanguage,
      createdAt: matchedUser.createdAt,
    };
    saveMockUserSession(profile);
    return { success: true, user: profile };
  }

  // Also check if current active session user matches
  const currentSession = getMockUserSession();
  if (currentSession && currentSession.email.toLowerCase() === trimmedEmail) {
    saveMockUserSession(currentSession);
    return { success: true, user: currentSession };
  }

  // Default fallback for any valid format email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmedEmail)) {
    return { success: false, errors: { email: "รูปแบบอีเมลไม่ถูกต้อง" } };
  }

  const dynamicUser: UserProfile = {
    userId: `user-${Date.now()}`,
    name: trimmedEmail.split("@")[0],
    email: trimmedEmail,
    phone: "0800000000",
    dateOfBirth: "2000-01-01",
    role: "User",
    isLocked: false,
    preferredUiLanguage: "th",
    createdAt: new Date().toISOString(),
  };

  saveMockUserSession(dynamicUser);
  return { success: true, user: dynamicUser };
}

export function quickLoginAsRole(role: UserRole): UserProfile {
  const target = DEFAULT_MOCK_USERS[role];
  const profile: UserProfile = {
    userId: target.userId,
    name: target.name,
    email: target.email,
    phone: target.phone,
    dateOfBirth: target.dateOfBirth,
    role: target.role,
    isLocked: target.isLocked,
    preferredUiLanguage: target.preferredUiLanguage,
    createdAt: target.createdAt,
  };
  saveMockUserSession(profile);
  return profile;
}

