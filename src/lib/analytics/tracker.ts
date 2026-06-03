"use server";

import { createClient } from "@/lib/supabase/server";
import type { AnalyticsEventType, AnalyticsMetadata } from "@/types/analytics";
import type { Json } from "@/types/database";

const FORBIDDEN_METADATA_KEY =
  /^(raw_content|rawcontent|title|content|password|token|api_key|apikey|secret|email|authorization|remix_text|ai_output|hook|angle|structure|cta|summary)$/i;

const FORBIDDEN_METADATA_SUBSTRING =
  /password|api[_-]?key|secret|authorization|bearer|raw_content|remix_text/i;

function sanitizeAnalyticsMetadata(metadata: AnalyticsMetadata): Json {
  const safe: Record<string, string | number | boolean> = {};

  for (const [key, value] of Object.entries(metadata)) {
    if (FORBIDDEN_METADATA_KEY.test(key) || FORBIDDEN_METADATA_SUBSTRING.test(key)) {
      continue;
    }
    if (typeof value === "string" && FORBIDDEN_METADATA_SUBSTRING.test(value)) {
      continue;
    }
    if (
      typeof value === "string" ||
      typeof value === "number" ||
      typeof value === "boolean"
    ) {
      safe[key] = value;
    }
  }

  return safe;
}

export type TrackEventOptions = {
  workspaceId?: string | null;
};

/**
 * Analytics insert. Never throws; safe to await in server actions.
 *
 * - Server actions: `await trackEvent(...)` so the insert completes before the
 *   request ends (still non-blocking for UX — errors are swallowed).
 * - Client auth forms: `void trackEvent(...)` is acceptable (best-effort; do not
 *   delay redirect). signup/login use workspace_id = null (see AUTH_ANALYTICS_EVENT_TYPES).
 *
 * Requires an authenticated session (skipped silently when absent).
 */
export async function trackEvent(
  eventType: AnalyticsEventType,
  metadata?: AnalyticsMetadata,
  options?: TrackEventOptions,
): Promise<void> {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return;
    }

    const { error } = await supabase.from("analytics_events").insert({
      user_id: user.id,
      workspace_id: options?.workspaceId ?? null,
      event_type: eventType,
      metadata: sanitizeAnalyticsMetadata(metadata ?? {}),
    });

    if (error && process.env.NODE_ENV !== "production") {
      console.warn(`[analytics] ${eventType}:`, error.message);
    }
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      const message = error instanceof Error ? error.message : "unknown error";
      console.warn(`[analytics] ${eventType}:`, message);
    }
  }
}
