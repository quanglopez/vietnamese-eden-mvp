import { inngest } from "../client";
import { youTubeUploadVideo } from "@/lib/composio/tools";
import {
  fetchCalendarItemForPublish,
  getConnectedAccountId,
  isTargetPlatform,
  isVideoMediaUrl,
  requirePublishUserId,
  resolvePublishContent,
  updateCalendarPublishStatus,
  type CalendarScheduledEventData,
} from "./publish-calendar-shared";

export const publishToYouTube = inngest.createFunction(
  {
    id: "publish-to-youtube",
    name: "Publish scheduled content to YouTube",
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

    if (!isTargetPlatform(calendarItem, "youtube")) {
      return { calendarItemId, skipped: true, reason: "Không phải nền tảng YouTube" };
    }

    const publishContent = await step.run("resolve-content", async () => {
      return resolvePublishContent(calendarItem, workspaceId);
    });

    const videoUrl = publishContent.mediaUrl;
    if (!videoUrl || !isVideoMediaUrl(videoUrl)) {
      await step.run("mark-failed-no-video", async () => {
        await updateCalendarPublishStatus({
          calendarItemId,
          success: false,
          successNote: "",
          failureNote:
            "YouTube yêu cầu URL video công khai (media_url hoặc source_url). Không tìm thấy video hợp lệ.",
        });
      });
      return { calendarItemId, status: "failed", reason: "missing_video_url" };
    }

    const userId = requirePublishUserId(calendarItem, "YouTube");

    const connectedAccountId = await step.run("fetch-connected-account", async () => {
      return getConnectedAccountId(userId, "youtube");
    });

    const composioResult = await step.run("composio-publish", async () => {
      return youTubeUploadVideo({
        title: publishContent.title || publishContent.body.slice(0, 100),
        description: publishContent.body.slice(0, 5000),
        videoUrl,
        privacyStatus: "public",
        connectedAccountId,
      });
    });

    await step.run("update-status", async () => {
      const isSuccess = composioResult.success === true;
      await updateCalendarPublishStatus({
        calendarItemId,
        success: isSuccess,
        successNote: `Đã đăng YouTube qua Composio lúc ${new Date().toISOString()}`,
        failureNote: `Composio YouTube thất bại: ${composioResult.error ?? "lỗi không xác định"}`,
      });
    });

    return {
      calendarItemId,
      status: composioResult.success ? "published" : "failed",
      publishedAt: new Date().toISOString(),
    };
  },
);
