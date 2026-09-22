import type { AuthApiResponse } from "./api/auth-response";
import type { Locale } from "@/app/components/site-header";
import type { RegisterInput, UserProfile, UserRole } from "./mock-auth";

async function apiFetch<T>(endpoint: string, init?: RequestInit): Promise<AuthApiResponse<T>> {
  try {
    const response = await fetch(endpoint, {
      ...init,
      headers: {
        Accept: "application/json",
        ...init?.headers,
      },
    });

    return (await response.json()) as AuthApiResponse<T>;
  } catch (error) {
    return {
      ok: false,
      error: {
        code: "network_error",
        message: error instanceof Error ? error.message : "Network error. Please try again.",
      },
    };
  }
}

export const authApi = {
  async login(payload: { email: string; password: string; locale: Locale }) {
    return apiFetch<{ user: UserProfile; redirectPath: string }>("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  },

  async register(payload: RegisterInput) {
    return apiFetch<{ user: UserProfile; redirectPath: string }>("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  },

  async logout() {
    return apiFetch<{ signedOut: boolean }>("/api/auth/logout", {
      method: "POST",
    });
  },

  async requestPasswordReset(email: string, locale: Locale) {
    return apiFetch<{ sent: boolean }>("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, locale }),
    });
  },

  async resetPassword(password: string, confirmPassword: string, locale: Locale) {
    return apiFetch<{ updated: boolean }>("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password, confirmPassword, locale }),
    });
  },

  async fastLogin(role: UserRole) {
    return apiFetch<{ user: UserProfile; role: UserRole; redirectPath: string }>("/api/auth/fast-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    });
  },
};
