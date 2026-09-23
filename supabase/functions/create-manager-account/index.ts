import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

type CreateManagerAccountInput = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  preferredUiLanguage: "th" | "en" | "zh" | "my" | "vi";
  temporaryPassword: string;
};

type FunctionResult = {
  success: boolean;
  data?: { userId: string };
  error?: string;
};

const json = (body: FunctionResult, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

Deno.serve(async (request) => {
  if (request.method !== "POST") {
    return json({ success: false, error: "Method not allowed." }, 405);
  }

  const authorization = request.headers.get("Authorization");
  const accessToken = authorization?.replace(/^Bearer\s+/i, "").trim();
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!accessToken || !supabaseUrl || !serviceRoleKey) {
    return json({ success: false, error: "Trusted provisioning service is not configured." }, 503);
  }

  const adminSupabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: authUser, error: authError } = await adminSupabase.auth.getUser(accessToken);
  if (authError || !authUser.user) {
    return json({ success: false, error: "Unauthorized session." }, 401);
  }

  const { data: callerProfile, error: callerError } = await adminSupabase
    .from("profiles")
    .select("role, admin_level, is_locked")
    .eq("user_id", authUser.user.id)
    .maybeSingle();

  if (callerError) {
    return json({ success: false, error: `Unable to load the caller profile: ${callerError.message}` }, 500);
  }

  if (!callerProfile) {
    return json({ success: false, error: "The authenticated user does not have a profile." }, 403);
  }

  const callerRole = String(callerProfile.role ?? "").trim();
  const callerAdminLevel = String(callerProfile.admin_level ?? "").trim().toLowerCase();

  if (callerRole !== "Admin") {
    return json({ success: false, error: `Primary Admin check failed: current role is ${callerRole || "empty"}.` }, 403);
  }

  if (callerAdminLevel !== "primary") {
    return json({ success: false, error: `Primary Admin check failed: current admin_level is ${callerAdminLevel || "null"}.` }, 403);
  }

  if (callerProfile.is_locked) {
    return json({ success: false, error: "Primary Admin check failed: the account is locked." }, 403);
  }

  let input: CreateManagerAccountInput;
  try {
    input = (await request.json()) as CreateManagerAccountInput;
  } catch {
    return json({ success: false, error: "Invalid request body." }, 400);
  }

  const firstName = input.firstName?.trim();
  const lastName = input.lastName?.trim();
  const email = input.email?.trim().toLowerCase();
  const phone = input.phone?.replace(/\D/g, "");

  if (!firstName || !lastName || !email || !phone || !input.dateOfBirth) {
    return json({ success: false, error: "Complete all required staff account fields." }, 400);
  }

  if (!/^0\d{9}$/.test(phone)) {
    return json({ success: false, error: "Phone number must contain 10 digits and start with 0." }, 400);
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return json({ success: false, error: "Enter a valid email address." }, 400);
  }

  if (!input.temporaryPassword || input.temporaryPassword.length < 8) {
    return json({ success: false, error: "Temporary password must be at least 8 characters." }, 400);
  }

  if (!["th", "en", "zh", "my", "vi"].includes(input.preferredUiLanguage)) {
    return json({ success: false, error: "Unsupported preferred UI language." }, 400);
  }

  const { data: createdAuthUser, error: createAuthError } = await adminSupabase.auth.admin.createUser({
    email,
    password: input.temporaryPassword,
    email_confirm: true,
    user_metadata: {
      full_name: `${firstName} ${lastName}`,
      first_name: firstName,
      last_name: lastName,
      phone,
      date_of_birth: input.dateOfBirth,
      preferred_ui_language: input.preferredUiLanguage,
    },
  });

  if (createAuthError || !createdAuthUser.user) {
    return json({ success: false, error: createAuthError?.message || "Unable to create Auth user." }, 400);
  }

  const { error: profileError } = await adminSupabase
    .from("profiles")
    .update({
      first_name: firstName,
      last_name: lastName,
      phone,
      date_of_birth: input.dateOfBirth,
      preferred_ui_language: input.preferredUiLanguage,
      role: "Manager",
      admin_level: null,
      is_locked: false,
      lock_reason: null,
    })
    .eq("user_id", createdAuthUser.user.id);

  if (profileError) {
    await adminSupabase.auth.admin.deleteUser(createdAuthUser.user.id);
    return json({ success: false, error: `Staff profile setup failed: ${profileError.message}` }, 500);
  }

  return json({ success: true, data: { userId: createdAuthUser.user.id } });
});
