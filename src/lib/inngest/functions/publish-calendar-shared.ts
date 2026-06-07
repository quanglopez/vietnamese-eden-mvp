import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// =============================================================================
// ENV + Supabase (service role — bypasses RLS)
// =============================================================================

let _publishSupabase: SupabaseClient | null = null;
function getPublishSupabase(): SupabaseClient {
  if (!_publishSupabase) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) throw new Error("Thiếu NEXT_PUBLIC_SUPABASE_URL hoặc SUPABASE_SERVICE_ROLE_KEY");
    _publishSupabase = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
  }
  return _publishSupabase;
}

// =============================================================================
// Types
// =============================================================================

export type CalendarScheduledEventData = {
  calendarItemId: string;
  workspaceId: string;
  scheduledAt: string;
};

export type CalendarPlatform = "tiktok" | "instagram" | "facebook";

export type CalendarItemForPublish = {
  id: string;
  workspace_id: string;
  generated_output_id: string | null;
  content_item_id: string | null;
  title: string;
  platform: CalendarPlatform | "youtube" | "other";
  status: "scheduled" | "published" | "skipped" | "failed";
  scheduled_at: string;
  notes: string | null;
  created_by: string | null;
};

export type ResolvedPublishContent = {
  body: string;
  title: string;
  mediaUrl: string | null;
  mediaUrls: string[];
};

type UserConnectedAccountRow = {
  connected_account_id: string;
  status: string;
};

const HTTP_URL_PATTERN = /https?:\/\/[^\s)\]"']+/g;
const VIDEO_URL_PATTERN = /\.(mp4|mov|webm|m4v)(\?|$)/i;

// =============================================================================
// Calendar + content resolution
// =============================================================================

export async function fetchCalendarItemForPublish(
  calendarItemId: string,
  workspaceId: string,
): Promise<CalendarItemForPublish> {
  const { data, error } = await getPublishSupabase()
    .from("content_calendar_items")
    .select(
      "id, workspace_id, generated_output_id, content_item_id, title, platform, status, scheduled_at, notes, created_by",
    )
    .eq("id", calendarItemId)
    .eq("workspace_id", workspaceId)
    .single();

  if (error) {
    throw new Error(`Không thể tải mục lịch: ${error.message}`);
  }
  if (!data) {
    throw new Error("Không tìm thấy mục lịch nội dung");
  }
  if (data.status !== "scheduled") {
    throw new Error(`Trạng thái mục là "${data.status}" — hủy đăng bài.`);
  }

  return data as CalendarItemForPublish;
}

export async function resolvePublishContent(
  calendarItem: CalendarItemForPublish,
  workspaceId: string,
): Promise<ResolvedPublishContent> {
  let body = calendarItem.title;
  let title = calendarItem.title;
  let sourceUrl: string | null = null;

  if (calendarItem.generated_output_id) {
    const { data, error } = await getPublishSupabase()
      .from("generated_outputs")
      .select("content, title")
      .eq("id", calendarItem.generated_output_id)
      .eq("workspace_id", workspaceId)
      .single();

    if (error) {
      throw new Error(`Không thể tải bản output AI: ${error.message}`);
    }

    body = data?.content ?? calendarItem.title;
    title = data?.title ?? calendarItem.title;
  } else if (calendarItem.content_item_id) {
    const { data, error } = await getPublishSupabase()
      .from("content_items")
      .select("raw_content, title, source_url")
      .eq("id", calendarItem.content_item_id)
      .eq("workspace_id", workspaceId)
      .single();

    if (error) {
      throw new Error(`Không thể tải content item: ${error.message}`);
    }

    body = data?.raw_content ?? data?.title ?? calendarItem.title;
    title = data?.title ?? calendarItem.title;
    sourceUrl = data?.source_url ?? null;
  }

  const mediaUrls = extractMediaUrls(body, sourceUrl);
  const mediaUrl = mediaUrls[0] ?? null;

  return {
    body: body.trim(),
    title: title.trim() || calendarItem.title,
    mediaUrl,
    mediaUrls,
  };
}

function extractMediaUrls(text: string, sourceUrl: string | null): string[] {
  const found = new Set<string>();

  if (sourceUrl && isHttpUrl(sourceUrl)) {
    found.add(normalizeUrl(sourceUrl));
  }

  const matches = text.match(HTTP_URL_PATTERN) ?? [];
  for (const match of matches) {
    found.add(normalizeUrl(match));
  }

  return [...found];
}

function isHttpUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

function normalizeUrl(url: string): string {
  return url.replace(/[.,;:!?)]+$/, "");
}

export function isVideoMediaUrl(url: string): boolean {
  if (VIDEO_URL_PATTERN.test(url)) {
    return true;
  }
  const lower = url.toLowerCase();
  return (
    lower.includes("tiktok.com") ||
    lower.includes("/reel/") ||
    lower.includes("/reels/") ||
    lower.includes("video")
  );
}

// =============================================================================
// Connected accounts (Composio OAuth mapping)
// =============================================================================

export async function getConnectedAccountId(
  userId: string,
  provider: CalendarPlatform,
): Promise<string> {
  const { data, error } = await getPublishSupabase()
    .from("user_connected_accounts")
    .select("connected_account_id, status")
    .eq("user_id", userId)
    .eq("provider", provider)
    .eq("status", "active")
    .maybeSingle();

  if (error) {
    throw new Error(`Không thể lấy tài khoản ${provider} đã kết nối: ${error.message}`);
  }

  const row = data as UserConnectedAccountRow | null;
  if (!row?.connected_account_id) {
    throw new Error(
      `Chưa kết nối tài khoản ${provider}. Vui lòng liên kết OAuth trong Eden trước khi lên lịch.`,
    );
  }

  return row.connected_account_id;
}

export function requirePublishUserId(
  calendarItem: CalendarItemForPublish,
  platformLabel: string,
): string {
  if (!calendarItem.created_by) {
    throw new Error(
      `Mục lịch thiếu người tạo — không thể xác định tài khoản ${platformLabel} để đăng.`,
    );
  }
  return calendarItem.created_by;
}

// =============================================================================
// Status updates
// =============================================================================

export async function updateCalendarPublishStatus(params: {
  calendarItemId: string;
  success: boolean;
  successNote: string;
  failureNote: string;
}): Promise<void> {
  const { calendarItemId, success, successNote, failureNote } = params;
  const newStatus = success ? "published" : "failed";
  const note = success ? successNote : failureNote;

  const { error } = await getPublishSupabase()
    .from("content_calendar_items")
    .update({
      status: newStatus,
      notes: note,
      updated_at: new Date().toISOString(),
    })
    .eq("id", calendarItemId);

  if (error) {
    throw new Error(`Không thể cập nhật trạng thái lịch: ${error.message}`);
  }
}

export function isTargetPlatform(
  calendarItem: CalendarItemForPublish,
  platform: CalendarPlatform,
): boolean {
  return calendarItem.platform === platform;
}
