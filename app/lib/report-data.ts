import type { SupabaseClient } from "@supabase/supabase-js";

export type ReportSeverity = "medium" | "high" | "critical";
export type ReportDatabaseStatus = "new" | "in_progress" | "escalated" | "resolved" | "dismissed";
export type ReportResolutionAction = "none" | "fixed" | "warned";

export type ReportRow = {
  report_id: number | string;
  report_type: "system";
  category: string | null;
  title: string | null;
  description: string | null;
  severity: ReportSeverity;
  status: ReportDatabaseStatus;
  resolution_action: ReportResolutionAction | null;
  resolution_note: string | null;
  created_at: string;
  updated_at: string | null;
  resolved_at: string | null;
  reporter_id: string | null;
  assigned_to: string | null;
  booking_id: number | string | null;
};

export type ReportProfileRow = {
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  role: string | null;
};

export const REPORT_COLUMNS = [
  "report_id",
  "report_type",
  "category",
  "title",
  "description",
  "severity",
  "status",
  "resolution_action",
  "resolution_note",
  "created_at",
  "updated_at",
  "resolved_at",
  "reporter_id",
  "assigned_to",
  "booking_id",
].join(", ");

export function formatReportId(reportId: number | string): string {
  return `REP-${String(reportId)}`;
}

export function parseReportId(reportId: string): number | null {
  const value = reportId.trim().replace(/^REP-/i, "");
  if (!/^\d+$/.test(value)) return null;

  const parsed = Number(value);
  return Number.isSafeInteger(parsed) ? parsed : null;
}

export function getReportProfileName(profile?: ReportProfileRow): string {
  if (!profile) return "Unknown reporter";
  return [profile.first_name, profile.last_name].filter(Boolean).join(" ").trim() || "KHVI User";
}

export async function loadReportRows(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from("reports")
    .select(REPORT_COLUMNS)
    .eq("report_type", "system")
    .order("created_at", { ascending: false });

  if (error) return { rows: [] as ReportRow[], profiles: [] as ReportProfileRow[], error };

  const rows = (data ?? []) as unknown as ReportRow[];
  const profileIds = Array.from(
    new Set(
      rows.flatMap((row) => [row.reporter_id, row.assigned_to].filter(Boolean) as string[])
    )
  );

  if (profileIds.length === 0) {
    return { rows, profiles: [] as ReportProfileRow[], error: null };
  }

  const { data: profiles, error: profileError } = await supabase
    .from("profiles")
    .select("user_id, first_name, last_name, role")
    .in("user_id", profileIds);

  return {
    rows,
    profiles: (profiles ?? []) as ReportProfileRow[],
    error: profileError,
  };
}
