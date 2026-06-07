import { inngest } from "../client";
import {
  fetchCalendarItemForPublish,
  resolvePublishContent,
  getConnectedAccountId,
  requirePublishUserId,
  updateCalendarPublishStatus,
  isTargetPlatform,
} from "./publish-calendar-shared";
import { linkedInPostShare } from "../../composio/tools";

export const publishToLinkedIn = inngest.createFunction(
  {
    id: "publish-to-linkedin",
    name: "Publish scheduled content to LinkedIn",
    retries: 3,
  },
  { event: "calendar/scheduled" },
  async ({ event, step }) => {
    const { calendarItemId, workspaceId, scheduledAt } = event.data as {
      calendarItemId: string;
      workspaceId: string;
      scheduledAt: string;
    };

    // STEP 1 — Sleep until scheduled time
    await step.sleepUntil("wait-for-schedule", new Date(scheduledAt));

    // STEP 2 — Fetch calendar item
    const calendarItem = await step.run("fetch-calendar-item", async () => {
      return fetchCalendarItemForPublish(calendarItemId, workspaceId);
    });

    if (!isTargetPlatform(calendarItem, "linkedin")) {
      return { calendarItemId, status: "skipped", reason: "not_linkedin" };
    }

    // STEP 3 — Resolve content
    const content = await step.run("resolve-content", async () => {
      return resolvePublishContent(calendarItem, workspaceId);
    });

    // STEP 4 — Get connected account
    const userId = requirePublishUserId(calendarItem, "LinkedIn");
    const connectedAccountId = await step.run("get-connected-account", async () => {
      return getConnectedAccountId(userId, "linkedin");
    });

    // STEP 5 — Publish via Composio
    const composioResult = await step.run("composio-publish", async () => {
      return linkedInPostShare({
        text: content.body.slice(0, 3000),
        visibility: "PUBLIC",
        connectedAccountId,
      });
    });

    // STEP 6 — Update status
    await step.run("update-status", async () => {
      return updateCalendarPublishStatus({
        calendarItemId,
        success: composioResult.success,
        successNote: `Published via Composio at ${new Date().toISOString()}`,
        failureNote: `Composio failed: ${composioResult.error ?? "unknown error"}`,
      });
    });

    // STEP 7 — Notify
    if (composioResult.success && calendarItem.created_by) {
      await step.sendEvent("notify-calendar-published", {
        name: "calendar/published",
        data: {
          workspaceId,
          userId: calendarItem.created_by,
          calendarItemId,
          title: calendarItem.title,
          platform: calendarItem.platform,
        },
      });
    }

    return {
      calendarItemId,
      status: composioResult.success ? "published" : "failed",
      publishedAt: new Date().toISOString(),
    };
  },
);