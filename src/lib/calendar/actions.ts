"use server";

import { revalidatePath } from "next/cache";

import { trackEvent } from "@/lib/analytics/tracker";
import type { ActionResult } from "@/lib/boards/actions";
import { isValidUuid } from "@/lib/boards/utils";
import {
  buildScheduledAtIso,
  CALENDAR_STATUS_OPTIONS,
  channelToPlatform,
} from "@/lib/calendar/constants";
import { buildCalendarNotes } from "@/lib/calendar/notes";
import { schedulePublishEvent } from "@/lib/calendar/schedule-publish";
import { createClient } from "@/lib/supabase/server";
import { getCurrentWorkspace } from "@/lib/workspaces/queries";
import type { CalendarChannel, CalendarStatus } from "@/types/calendar";

const CHANNEL_SET = new Set<CalendarChannel>([
  "facebook",
  "instagram",
  "linkedin",
  "tiktok",
  "youtube_shorts",
  "email",
  "blog",
  "other",
]);

const STATUS_SET = new Set<CalendarStatus>(
  CALENDAR_STATUS_OPTIONS.map((o) => o.value),
);

export async function addToCalendarAction(input: {
  generatedOutputId: string;
  contentItemId: string;
  title: string;
  scheduledDate: string;
  scheduledTime?: string;
  channel: CalendarChannel;
  status?: CalendarStatus;
  notes?: string;
  publishNow?: boolean;
  mediaUrl?: string;
}): Promise<ActionResult<{ calendarItemId: string }>> {
  const {
    generatedOutputId,
    contentItemId,
    title,
    scheduledDate,
    scheduledTime,
    channel,
    status = "scheduled",
    publishNow,
    mediaUrl,
  } = input;

  if (!isValidUuid(generatedOutputId) || !isValidUuid(contentItemId)) {
    return { success: false, error: "Dữ liệu không hợp lệ." };
  }
  if (!title.trim()) {
    return { success: false, error: "Tiêu đề không được để trống." };
  }
  if (!scheduledDate) {
    return { success: false, error: "Chọn ngày lên lịch." };
  }
  if (!CHANNEL_SET.has(channel)) {
    return { success: false, error: "Kênh không hợp lệ." };
  }
  if (!STATUS_SET.has(status)) {
    return { success: false, error: "Trạng thái không hợp lệ." };
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Bạn cần đăng nhập." };
  }

  const { workspace, error: workspaceError } = await getCurrentWorkspace(supabase, user.id);
  if (workspaceError) {
    return { success: false, error: workspaceError };
  }
  if (!workspace) {
    return { success: false, error: "Không tìm thấy workspace." };
  }

  const { data: output, error: outputError } = await supabase
    .from("generated_outputs")
    .select("id, workspace_id")
    .eq("id", generatedOutputId)
    .maybeSingle();

  if (outputError) {
    return { success: false, error: outputError.message };
  }
  if (!output) {
    return { success: false, error: "Không tìm thấy remix output." };
  }

  let scheduledAt: Date;
  if (publishNow) {
    scheduledAt = new Date();
  } else {
    try {
      scheduledAt = new Date(buildScheduledAtIso(scheduledDate, scheduledTime));
    } catch {
      return { success: false, error: "Ngày hoặc giờ không hợp lệ." };
    }
  }

  const resolvedStatus: CalendarStatus = publishNow ? "scheduled" : status;

  const { data, error } = await supabase
    .from("content_calendar_items")
    .insert({
      workspace_id: workspace.id,
      generated_output_id: generatedOutputId,
      content_item_id: contentItemId,
      title: title.trim(),
      platform: channelToPlatform(channel),
      scheduled_at: scheduledAt.toISOString(),
      status: resolvedStatus,
      notes: buildCalendarNotes(channel, input.notes),
      created_by: user.id,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ...(mediaUrl != null ? { media_url: mediaUrl } as any : {}),
    })
    .select("id")
    .single();

  if (error || !data) {
    return { success: false, error: error?.message ?? "Không thể thêm vào lịch." };
  }

  // Trigger Inngest publish job cho cả publishNow và scheduled thông thường
  await schedulePublishEvent({
    calendarItemId: data.id,
    workspaceId: workspace.id,
    scheduledAt: scheduledAt.toISOString(),
  });

  revalidateCalendarPaths(contentItemId);
  await trackEvent(
    "calendar_add",
    { calendar_item_id: data.id, channel },
    { workspaceId: workspace.id },
  );
  return { success: true, data: { calendarItemId: data.id } };
}

export async function updateCalendarStatusAction(
  calendarItemId: string,
  status: CalendarStatus,
): Promise<ActionResult<{ calendarItemId: string }>> {
  if (!isValidUuid(calendarItemId)) {
    return { success: false, error: "Calendar item không hợp lệ." };
  }
  if (!STATUS_SET.has(status)) {
    return { success: false, error: "Trạng thái không hợp lệ." };
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Bạn cần đăng nhập." };
  }

  const { data, error } = await supabase
    .from("content_calendar_items")
    .update({ status })
    .eq("id", calendarItemId)
    .select("id, content_item_id")
    .single();

  if (error || !data) {
    return { success: false, error: error?.message ?? "Không thể cập nhật trạng thái." };
  }

  revalidatePath("/calendar");
  if (data.content_item_id) {
    revalidateCalendarPaths(data.content_item_id);
  }
  return { success: true, data: { calendarItemId: data.id } };
}

export async function deleteCalendarItemAction(
  calendarItemId: string,
): Promise<ActionResult<{ calendarItemId: string }>> {
  if (!isValidUuid(calendarItemId)) {
    return { success: false, error: "Calendar item không hợp lệ." };
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Bạn cần đăng nhập." };
  }

  const { data: existing } = await supabase
    .from("content_calendar_items")
    .select("id, content_item_id")
    .eq("id", calendarItemId)
    .maybeSingle();

  const { error } = await supabase.from("content_calendar_items").delete().eq("id", calendarItemId);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/calendar");
  if (existing?.content_item_id) {
    revalidateCalendarPaths(existing.content_item_id);
  }
  return { success: true, data: { calendarItemId } };
}

function revalidateCalendarPaths(contentItemId: string) {
  revalidatePath(`/remix/${contentItemId}`);
  revalidatePath("/calendar");
}
