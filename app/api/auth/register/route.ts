import { apiError, apiSuccess } from "@/app/lib/api/auth-response";
import { isRecord, normalizeEmail, normalizeLocale } from "@/app/lib/api/auth-utils";
import { getAuthCopy } from "@/app/lib/auth-copy";
import { getRedirectPathByRole, validateRegisterInput, type RegisterInput } from "@/app/lib/auth-types";
import { getAuthErrorMessage, getCurrentUserProfile } from "@/app/lib/supabase-auth";
import { createRouteHandlerClient } from "@/utils/supabase/server";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiError("invalid_request", "คำขอไม่ถูกต้อง", 400);
  }

  if (!isRecord(body)) {
    return apiError("invalid_request", "คำขอไม่ถูกต้อง", 400);
  }

  const requestedLocale = body.preferredUiLanguage ?? body.locale;
  const locale = normalizeLocale(requestedLocale);
  const preferredUiLanguage = typeof requestedLocale === "string"
    ? requestedLocale as RegisterInput["preferredUiLanguage"]
    : "" as RegisterInput["preferredUiLanguage"];
  const input: RegisterInput = {
    firstName: typeof body.firstName === "string" ? body.firstName.trim() : "",
    lastName: typeof body.lastName === "string" ? body.lastName.trim() : "",
    email: normalizeEmail(body.email),
    password: typeof body.password === "string" ? body.password : "",
    confirmPassword: typeof body.confirmPassword === "string" ? body.confirmPassword : "",
    phone: typeof body.phone === "string" ? body.phone.trim() : "",
    dateOfBirth: typeof body.dateOfBirth === "string" ? body.dateOfBirth : "",
    preferredUiLanguage,
  };
  const validationErrors = validateRegisterInput(input, locale);
  const copy = getAuthCopy(locale);

  if (Object.keys(validationErrors).length > 0) {
    return apiError(
      "validation_error",
      Object.values(validationErrors).find(Boolean) || copy.register.genericError,
      400,
      validationErrors,
    );
  }

  const { supabase, applyToResponse } = await createRouteHandlerClient();
  const { data, error } = await supabase.auth.signUp({
    email: input.email,
    password: input.password,
    options: {
      data: {
        full_name: [input.firstName, input.lastName].join(" ").trim(),
        first_name: input.firstName,
        last_name: input.lastName,
        phone: input.phone,
        date_of_birth: input.dateOfBirth,
        preferred_ui_language: input.preferredUiLanguage,
      },
    },
  });

  const isExistingUser = Boolean(
    data.user?.identities?.length === 0
    || error?.code === "user_already_exists"
    || error?.message?.toLowerCase().includes("already registered")
    || error?.message?.toLowerCase().includes("already been registered"),
  );

  if (error || !data.user || isExistingUser) {
    if (data.session) await supabase.auth.signOut();
    return apiError(
      isExistingUser ? "email_exists" : "registration_failed",
      isExistingUser ? copy.errors.emailExists : getAuthErrorMessage(error, "register", locale),
      isExistingUser ? 409 : 400,
    );
  }

  if (!data.session) {
    const response = apiError("session_unavailable", copy.register.genericError, 503);
    return applyToResponse(response, { clearPersistence: true, recovery: false });
  }

  const profileResult = await getCurrentUserProfile(supabase);
  if (!profileResult.profile) {
    await supabase.auth.signOut();
    const response = apiError("profile_unavailable", copy.register.profileError, 500);
    return applyToResponse(response, { clearPersistence: true, recovery: false });
  }

  const response = apiSuccess(
    {
      user: profileResult.profile,
      redirectPath: getRedirectPathByRole(profileResult.profile.role),
      email: input.email,
    },
    201,
  );
  return applyToResponse(response, { persistence: "persistent", recovery: false });
}
