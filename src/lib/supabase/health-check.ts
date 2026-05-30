import { createClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database";

export type HealthCheckResult = {
  ok: boolean;
  rowCount: number;
  checkedAt: string;
};

export async function runHealthCheckQuery(): Promise<HealthCheckResult> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "Supabase chưa được cấu hình. Thêm NEXT_PUBLIC_SUPABASE_URL và NEXT_PUBLIC_SUPABASE_ANON_KEY vào .env.local",
    );
  }

  const supabase = createClient<Database>(url, anonKey);

  const { data, error } = await supabase
    .from("health_check")
    .select("id, status, checked_at")
    .limit(1);

  if (error) {
    throw new Error(`Supabase health check failed: ${error.message}`);
  }

  return {
    ok: true,
    rowCount: data?.length ?? 0,
    checkedAt: new Date().toISOString(),
  };
}
