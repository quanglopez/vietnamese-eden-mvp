import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import { createEmptyAnalyticsCounts } from "@/lib/analytics/queries";
import type { AnalyticsEventCounts } from "@/lib/analytics/queries";

type AuthEventType = "login" | "signup";

export type PlatformAuthAnalytics = {
  counts: Pick<AnalyticsEventCounts, AuthEventType>;
  error: string | null;
};

/**
 * Platform-wide auth aggregates for workspace admins. Returns counts only:
 * no user_id, email, metadata, or raw analytics rows leave this server helper.
 */
export async function getPlatformAuthCounts(days = 30): Promise<PlatformAuthAnalytics> {
  const counts = createEmptyAnalyticsCounts();
  const since = new Date();
  since.setDate(since.getDate() - days);

  try {
    const supabase = createAdminClient();
    const [loginResult, signupResult] = await Promise.all([
      supabase
        .from("analytics_events")
        .select("id", { count: "exact", head: true })
        .eq("event_type", "login")
        .is("workspace_id", null)
        .gte("created_at", since.toISOString()),
      supabase
        .from("analytics_events")
        .select("id", { count: "exact", head: true })
        .eq("event_type", "signup")
        .is("workspace_id", null)
        .gte("created_at", since.toISOString()),
    ]);

    const error = loginResult.error?.message ?? signupResult.error?.message ?? null;
    if (error) {
      return { counts: { login: 0, signup: 0 }, error };
    }

    counts.login = loginResult.count ?? 0;
    counts.signup = signupResult.count ?? 0;

    return { counts: { login: counts.login, signup: counts.signup }, error: null };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Không đọc được thống kê đăng nhập.";
    return { counts: { login: 0, signup: 0 }, error: message };
  }
}

export async function getAllTimePlatformAuthCounts(): Promise<PlatformAuthAnalytics> {
  const counts = createEmptyAnalyticsCounts();

  try {
    const supabase = createAdminClient();
    const [loginResult, signupResult] = await Promise.all([
      supabase
        .from("analytics_events")
        .select("id", { count: "exact", head: true })
        .eq("event_type", "login")
        .is("workspace_id", null),
      supabase
        .from("analytics_events")
        .select("id", { count: "exact", head: true })
        .eq("event_type", "signup")
        .is("workspace_id", null),
    ]);

    const error = loginResult.error?.message ?? signupResult.error?.message ?? null;
    if (error) {
      return { counts: { login: 0, signup: 0 }, error };
    }

    counts.login = loginResult.count ?? 0;
    counts.signup = signupResult.count ?? 0;

    return { counts: { login: counts.login, signup: counts.signup }, error: null };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Không đọc được thống kê đăng nhập.";
    return { counts: { login: 0, signup: 0 }, error: message };
  }
}
