import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Gets the user's most recent meaningful activity timestamp.
 * Checks analytics_events for any event, returns earliest if none found (new user fallback).
 */
export async function getUserLastActivityDate(
  supabase: SupabaseClient,
  userId: string
): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from("analytics_events")
      .select("created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (error && process.env.NODE_ENV !== "production") {
      console.warn("[getUserLastActivityDate]:", error.message);
    }

    return data?.created_at ?? null;
  } catch (err) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[getUserLastActivityDate] unexpected error:", err);
    }
    return null;
  }
}
