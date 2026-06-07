import { slackSendMessage } from "@/lib/composio/tools";
import { inngest } from "../client";
import {
  fetchNotificationDestination,
  logComposioNotificationFailure,
  parseNotificationEvent,
} from "./notify-shared";

export const notifySlack = inngest.createFunction(
  {
    id: "notify-slack",
    name: "Send Slack notification for breakdown or publish",
    retries: 0,
  },
  [{ event: "content/analysis-completed" }, { event: "calendar/published" }],
  async ({ event, step }) => {
    const parsed = parseNotificationEvent(event);
    if (!parsed) {
      return { sent: false, reason: "unknown_event" };
    }

    const userId = parsed.data.userId;

    const destination = await step.run("fetch-slack-account", async () => {
      return fetchNotificationDestination(userId, "slack");
    });

    if (!destination) {
      return { sent: false, reason: "no_slack_account" };
    }

    const sendResult = await step.run("slack-send-message", async () => {
      return slackSendMessage({
        channelId: destination.destinationId,
        message: parsed.message,
        connectedAccountId: destination.connectedAccountId,
      });
    });

    if (sendResult.success !== true) {
      logComposioNotificationFailure("slack", { userId, eventName: event.name }, sendResult.error);
      return { sent: false, reason: "composio_failed", error: sendResult.error };
    }

    return {
      sent: true,
      provider: "slack" as const,
      eventName: event.name,
      userId,
      kind: parsed.kind,
    };
  },
);
