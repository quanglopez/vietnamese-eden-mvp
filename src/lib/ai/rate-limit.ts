import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database";

export type AiRateLimitAction = "breakdown" | "remix" | "voice";

export const RATE_LIMITS = {
  breakdown: { maxRequests: 10, windowMinutes: 5, label: "phân tích" },
  remix: { maxRequests: 5, windowMinutes: 5, label: "remix" },
  voice: { maxRequests: 3, windowMinutes: 10, label: "giọng văn" },
} as const satisfies Record<
  AiRateLimitAction,
  { maxRequests: number; windowMinutes: number; label: string }
>;

export type AiRateLimitResult =
  | { allowed: true }
  | { allowed: false; retryAfterSeconds: number; message: string };

export async function checkAiRateLimit(
  supabase: SupabaseClient<Database>,
  userId: string,
  action: AiRateLimitAction,
): Promise<AiRateLimitResult> {
  const limit = RATE_LIMITS[action];
  const now = new Date();
  const windowStart = new Date(now.getTime() - limit.windowMinutes * 60 * 1000);

  await cleanupOldRateLimitRows(supabase, userId);

  const { count, error: countError } = await supabase
    .from("ai_rate_limits")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("action", action)
    .gte("requested_at", windowStart.toISOString());

  if (countError) {
    console.warn("AI rate limit count failed", { action, code: countError.code });
    return {
      allowed: false,
      retryAfterSeconds: 60,
      message:
        "Tạm thời chưa kiểm tra được giới hạn AI. Hãy thử lại sau 1 phút.",
    };
  }

  if ((count ?? 0) >= limit.maxRequests) {
    const { data } = await supabase
      .from("ai_rate_limits")
      .select("requested_at")
      .eq("user_id", userId)
      .eq("action", action)
      .gte("requested_at", windowStart.toISOString())
      .order("requested_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    const retryAfterSeconds = calculateRetryAfterSeconds(
      data?.requested_at ? new Date(data.requested_at) : windowStart,
      limit.windowMinutes,
      now,
    );

    return {
      allowed: false,
      retryAfterSeconds,
      message: buildRateLimitMessage(action, retryAfterSeconds),
    };
  }

  const { error: insertError } = await supabase
    .from("ai_rate_limits")
    .insert({ user_id: userId, action });

  if (insertError) {
    console.warn("AI rate limit insert failed", { action, code: insertError.code });
    return {
      allowed: false,
      retryAfterSeconds: 60,
      message:
        "Tạm thời chưa ghi nhận được lượt dùng AI. Hãy thử lại sau 1 phút.",
    };
  }

  return { allowed: true };
}

export function calculateRetryAfterSeconds(
  oldestRequestAt: Date,
  windowMinutes: number,
  now = new Date(),
): number {
  const resetAt = oldestRequestAt.getTime() + windowMinutes * 60 * 1000;
  return Math.max(1, Math.ceil((resetAt - now.getTime()) / 1000));
}

export function buildRateLimitMessage(action: AiRateLimitAction, retryAfterSeconds: number): string {
  const minutes = Math.max(1, Math.ceil(retryAfterSeconds / 60));
  return `Bạn đã gửi quá nhiều yêu cầu ${RATE_LIMITS[action].label}. Hãy chờ khoảng ${minutes} phút rồi thử lại.`;
}

async function cleanupOldRateLimitRows(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<void> {
  const olderThan = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { error } = await supabase
    .from("ai_rate_limits")
    .delete()
    .eq("user_id", userId)
    .lt("requested_at", olderThan);

  if (error) {
    console.warn("AI rate limit cleanup failed", { code: error.code });
  }
}
