"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";

type AccountActionSuccess = { ok: true };
type AccountActionFailure = { ok: false; error: string };

export type AccountActionResult = AccountActionSuccess | AccountActionFailure;

function friendlyError(error: { message?: string } | null): string {
  const message = error?.message ?? "";
  const known: Record<string, string> = {
    not_authenticated: "Your session has expired. Please sign in again.",
    profile_not_found: "Your profile could not be found.",
    active_bookings_exist: "Finish or cancel your active requests or assignments before deleting your account.",
    account_deletion_not_configured: "Permanent account deletion is not configured on the server.",
    certificate_cleanup_failed: "Your interpreter documents could not be removed. The account was not deleted.",
    permanent_account_deletion_failed: "The account could not be deleted permanently. Please try again.",
  };

  for (const [code, copy] of Object.entries(known)) {
    if (message.includes(code)) return copy;
  }

  return "Could not delete your account. Please try again.";
}

const CERTIFICATE_BUCKET = "interpreter-certificates";
const STORAGE_PAGE_SIZE = 100;

async function removeInterpreterCertificates(
  admin: ReturnType<typeof createAdminClient>,
  userId: string,
) {
  const bucket = admin.storage.from(CERTIFICATE_BUCKET);
  const paths: string[] = [];
  let offset = 0;

  while (true) {
    const { data, error } = await bucket.list(userId, {
      limit: STORAGE_PAGE_SIZE,
      offset,
      sortBy: { column: "name", order: "asc" },
    });

    if (error) throw new Error("certificate_cleanup_failed", { cause: error });

    const entries = data ?? [];
    for (const entry of entries) {
      if (entry.id) paths.push(`${userId}/${entry.name}`);
    }

    if (entries.length < STORAGE_PAGE_SIZE) break;
    offset += entries.length;
  }

  for (let index = 0; index < paths.length; index += STORAGE_PAGE_SIZE) {
    const { error } = await bucket.remove(paths.slice(index, index + STORAGE_PAGE_SIZE));
    if (error) throw new Error("certificate_cleanup_failed", { cause: error });
  }
}

export async function deleteOwnAccountAction(): Promise<AccountActionResult> {
  const supabase = await createClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError || !userData.user) {
    return { ok: false, error: friendlyError({ message: "not_authenticated" }) };
  }

  let admin: ReturnType<typeof createAdminClient>;
  try {
    admin = createAdminClient();
  } catch (error) {
    return { ok: false, error: friendlyError(error as Error) };
  }

  const { error: preparationError } = await supabase.rpc("begin_permanent_account_deletion");

  if (preparationError) return { ok: false, error: friendlyError(preparationError) };

  try {
    await removeInterpreterCertificates(admin, userData.user.id);

    const { error: deletionError } = await admin.auth.admin.deleteUser(userData.user.id, false);
    if (deletionError) {
      throw new Error("permanent_account_deletion_failed", { cause: deletionError });
    }
  } catch (error) {
    await supabase.rpc("cancel_permanent_account_deletion");
    return { ok: false, error: friendlyError(error as Error) };
  }

  await supabase.auth.signOut({ scope: "local" });

  revalidatePath("/");
  revalidatePath("/profile");
  revalidatePath("/user");
  revalidatePath("/user/request-help");
  revalidatePath("/user/my-requests");
  revalidatePath("/interpreter");
  revalidatePath("/interpreter/request-help");
  revalidatePath("/interpreter/my-requests");
  revalidatePath("/interpreter/find-requests");
  revalidatePath("/interpreter/my-assignments");

  return { ok: true };
}
