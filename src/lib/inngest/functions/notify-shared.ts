import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";

import { getPlatformLabel } from "@/lib/content/platform-styles";
import type { PlatformType } from "@/types/content";

// =============================================================================
// ENV — Supabase service role
// =============================================================================

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("Thiếu NEXT_PUBLIC_SUPABASE_URL hoặc SUPABASE_SERVICE_ROLE_KEY");
}

/** Client không gắn Database — bảng user_connected_accounts chưa có trong generated types */
export const notifySupabase: SupabaseClient = createClient(
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } },
);

// =============================================================================
// Event schemas
// =============================================================================

export const analysisCompletedEventSchema = z.object({
  workspaceId: z.string().uuid(),
  userId: z.string().uuid(),
  contentItemId: z.string().uuid(),
  title: z.string().min(1),
});

export const calendarPublishedEventSchema = z.object({
  workspaceId: z.string().uuid(),
  userId: z.string().uuid(),
  calendarItemId: z.string().uuid(),
  title: z.string().min(1),
  platform: z.enum(["tiktok", "facebook", "instagram", "youtube", "other"]),
});

export type AnalysisCompletedEventData = z.infer<typeof analysisCompletedEventSchema>;
export type CalendarPublishedEventData = z.infer<typeof calendarPublishedEventSchema>;

export type NotificationProvider = "slack" | "telegram";

type UserConnectedAccountRow = {
  connected_account_id: string;
  status: string;
  channel_id?: string | null;
  chat_id?: string | null;
  destination_id?: string | null;
};

export type NotificationDestination = {
  connectedAccountId: string;
  destinationId: string;
};

const TELEGRAM_MESSAGE_MAX = 4096;
const TELEGRAM_ELLIPSIS = "...";

export function toNotificationSafeText(value: string): string {
  return value.normalize("NFC").replace(/\0/g, "").trim();
}

export function truncateForTelegram(message: string): string {
  const safe = toNotificationSafeText(message);
  if (safe.length <= TELEGRAM_MESSAGE_MAX) {
    return safe;
  }
  return (
    safe.slice(0, TELEGRAM_MESSAGE_MAX - TELEGRAM_ELLIPSIS.length) + TELEGRAM_ELLIPSIS
  );
}

function resolveDestination(
  primary: string | null | undefined,
  fallback: string | null | undefined,
  envFallback: string | undefined,
): string | null {
  if (primary?.trim()) {
    return primary.trim();
  }
  if (fallback?.trim()) {
    return fallback.trim();
  }
  if (envFallback?.trim()) {
    return envFallback.trim();
  }
  return null;
}

export async function fetchNotificationDestination(
  userId: string,
  provider: NotificationProvider,
): Promise<NotificationDestination | null> {
  const { data, error } = await notifySupabase
    .from("user_connected_accounts")
    .select("connected_account_id, status, channel_id, chat_id, destination_id")
    .eq("user_id", userId)
    .eq("provider", provider)
    .eq("status", "active")
    .maybeSingle();

  if (error) {
    console.warn(`[notify-${provider}] Không thể tải tài khoản: ${error.message}`);
    return null;
  }

  if (!data) {
    return null;
  }

  const row = data as UserConnectedAccountRow;
  if (!row.connected_account_id) {
    return null;
  }

  const destinationId =
    provider === "slack"
      ? resolveDestination(
          row.channel_id,
          row.destination_id,
          process.env.COMPOSIO_SLACK_CHANNEL_ID,
        )
      : resolveDestination(
          row.chat_id,
          row.destination_id,
          process.env.COMPOSIO_TELEGRAM_CHAT_ID,
        );

  if (!destinationId) {
    return null;
  }

  return {
    connectedAccountId: row.connected_account_id,
    destinationId,
  };
}

export function buildAnalysisCompletedMessage(title: string): string {
  return `🎉 Phân tích xong: ${toNotificationSafeText(title)}`;
}

export function buildCalendarPublishedMessage(
  title: string,
  platform: CalendarPublishedEventData["platform"],
): string {
  const platformLabel = getPlatformLabel(platform as PlatformType);
  return `📅 Đã publish: ${toNotificationSafeText(title)} lên ${platformLabel}`;
}

export function parseNotificationEvent(event: {
  name: string;
  data?: unknown;
}):
  | { kind: "analysis"; data: AnalysisCompletedEventData; message: string }
  | { kind: "publish"; data: CalendarPublishedEventData; message: string }
  | null {
  if (event.data === undefined) {
    return null;
  }

  if (event.name === "content/analysis-completed") {
    const data = analysisCompletedEventSchema.parse(event.data);
    return {
      kind: "analysis",
      data,
      message: buildAnalysisCompletedMessage(data.title),
    };
  }

  if (event.name === "calendar/published") {
    const data = calendarPublishedEventSchema.parse(event.data);
    return {
      kind: "publish",
      data,
      message: buildCalendarPublishedMessage(data.title, data.platform),
    };
  }

  return null;
}

export function logComposioNotificationFailure(
  provider: NotificationProvider,
  context: { userId: string; eventName: string },
  error: string | undefined,
): void {
  console.error(
    `[notify-${provider}] Gửi thông báo thất bại (${context.eventName}, user=${context.userId}): ${error ?? "unknown error"}`,
  );
}
