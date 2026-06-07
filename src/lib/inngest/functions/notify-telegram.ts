import { telegramSendMessage } from "@/lib/composio/tools";
import { inngest } from "../client";
import {
  fetchNotificationDestination,
  logComposioNotificationFailure,
  parseNotificationEvent,
  truncateForTelegram,
} from "./notify-shared";

export const notifyTelegram = inngest.createFunction(
  {
    id: "notify-telegram",
    name: "Send Telegram notification for breakdown or publish",
    retries: 0,
  },
  [{ event: "content/analysis-completed" }, { event: "calendar/published" }],
  async ({ event, step }) => {
    const parsed = parseNotificationEvent(event);
    if (!parsed) {
      return { sent: false, reason: "unknown_event" };
    }

    const userId = parsed.data.userId;
    const message = truncateForTelegram(parsed.message);

    const destination = await step.run("fetch-telegram-account", async () => {
      return fetchNotificationDestination(userId, "telegram");
    });

    if (!destination) {
      return { sent: false, reason: "no_telegram_account" };
    }

    const sendResult = await step.run("telegram-send-message", async () => {
      return telegramSendMessage({
        chatId: destination.destinationId,
        message,
        connectedAccountId: destination.connectedAccountId,
      });
    });

    if (sendResult.success !== true) {
      logComposioNotificationFailure(
        "telegram",
        { userId, eventName: event.name },
        sendResult.error,
      );
      return { sent: false, reason: "composio_failed", error: sendResult.error };
    }

    return {
      sent: true,
      provider: "telegram" as const,
      eventName: event.name,
      userId,
      kind: parsed.kind,
    };
  },
);
