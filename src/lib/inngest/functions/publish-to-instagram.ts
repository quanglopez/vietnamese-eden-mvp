import { inngest } from "../client";
import { instagramPostMedia } from "@/lib/composio/tools";
import {
  fetchCalendarItemForPublish,
  getConnectedAccountId,
  isTargetPlatform,
  requirePublishUserId,
  resolvePublishContent,
  updateCalendarPublishStatus,
  type CalendarScheduledEventData,
} from "./publish-calendar-shared";

export const publishToInstagram = inngest.createFunction(
  {
    id: "publish-to-instagram",
    name: "Publish scheduled content to Instagram",
    retries: 3,
  },
  { event: "calendar/scheduled" },
  async ({ event, step }) => {
    const { calendarItemId, workspaceId, scheduledAt } =
      event.data as CalendarScheduledEventData;

    await step.sleepUntil("wait-for-schedule", new Date(scheduledAt));

    const calendarItem = await step.run("fetch-calendar-item", async () => {
      return fetchCalendarItemForPublish(calendarItemId, workspaceId);
    });

    if (!isTargetPlatform(calendarItem, "instagram")) {
      return {
        calendarItemId,
        skipped: true,
        reason: "Không phải nền tảng Instagram",
      };
    }

    const publishContent = await step.run("resolve-content", async () => {
      return resolvePublishContent(calendarItem, workspaceId);
    });

    const caption = publishContent.body.slice(0, 2200);
    const mediaUrl = publishContent.mediaUrl;
    const mediaUrls =
      publishContent.mediaUrls.length > 1 ? publishContent.mediaUrls : undefined;

    const userId = requirePublishUserId(calendarItem, "Instagram");

    const connectedAccountId = await step.run("fetch-connected-account", async () => {
      return getConnectedAccountId(userId, "instagram");
    });

    const composioResult = await step.run("composio-publish", async () => {
      return instagramPostMedia({
        caption,
        mediaUrl,
        mediaUrls,
        connectedAccountId,
      });
    });

    await step.run("update-status", async () => {
      const isSuccess = composioResult.success === true;
      await updateCalendarPublishStatus({
        calendarItemId,
        success: isSuccess,
        successNote: `Đã đăng Instagram qua Composio lúc ${new Date().toISOString()}`,
        failureNote: `Composio Instagram thất bại: ${composioResult.error ?? "lỗi không xác định"}`,
      });
    });

    return {
      calendarItemId,
      status: composioResult.success ? "published" : "failed",
      publishedAt: new Date().toISOString(),
    };
  },
);
