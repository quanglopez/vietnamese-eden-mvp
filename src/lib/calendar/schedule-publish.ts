"use server";

import { inngest } from "@/lib/inngest";

/**
 * Trigger Inngest publish job when user schedules a content item.
 *
 * Call this from your calendar UI after creating/updating the
 * content_calendar_items row with status = "scheduled".
 *
 * The Supabase trigger (migration 20260606150000) will ALSO fire
 * automatically on any status change TO "scheduled". This function
 * is a manual fallback or for immediate optimistic feedback.
 */
export async function schedulePublishEvent(params: {
  calendarItemId: string;
  workspaceId: string;
  scheduledAt: string; // ISO 8601
}) {
  const { calendarItemId, workspaceId, scheduledAt } = params;

  const { ids } = await inngest.send({
    name: "calendar/scheduled",
    data: {
      calendarItemId,
      workspaceId,
      scheduledAt,
    },
  });

  return { sent: true, eventIds: ids };
}
