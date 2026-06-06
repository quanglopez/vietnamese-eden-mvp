import { inngest } from "../client";
import { createClient } from "@supabase/supabase-js";
import { composioExecute } from "../../composio";

// =============================================================================
// ENV
// =============================================================================

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
}

// Service-role client bypasses RLS for backend jobs
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// =============================================================================
// INNGEST FUNCTION
// =============================================================================

export const publishToFacebook = inngest.createFunction(
  {
    id: "publish-to-facebook",
    name: "Publish scheduled content to Facebook",
    retries: 3,
  },
  { event: "calendar/scheduled" },
  async ({ event, step }) => {
    const { calendarItemId, workspaceId, scheduledAt } = event.data as {
      calendarItemId: string;
      workspaceId: string;
      scheduledAt: string;
    };

    // STEP 1 — Sleep until the scheduled publish time
    await step.sleepUntil("wait-for-schedule", new Date(scheduledAt));

    // STEP 2 — Fetch calendar item + generated output content
    const calendarItem = await step.run("fetch-calendar-item", async () => {
      const { data, error } = await supabase
        .from("content_calendar_items")
        .select(
          `id, workspace_id, generated_output_id, content_item_id, title, platform, status, scheduled_at, notes, created_by`,
        )
        .eq("id", calendarItemId)
        .eq("workspace_id", workspaceId)
        .single();

      if (error) throw new Error(`Supabase fetch failed: ${error.message}`);
      if (!data) throw new Error("Calendar item not found");
      if (data.status !== "scheduled") {
        throw new Error(`Item status is "${data.status}" — aborting publish.`);
      }

      return data;
    });

    // STEP 3 — Resolve the actual text to publish
    const publishBody = await step.run("resolve-content", async () => {
      if (calendarItem.generated_output_id) {
        const { data, error } = await supabase
          .from("generated_outputs")
          .select("content, title")
          .eq("id", calendarItem.generated_output_id)
          .eq("workspace_id", workspaceId)
          .single();

        if (error) throw new Error(`Failed to fetch generated output: ${error.message}`);
        return data?.content ?? calendarItem.title;
      }

      if (calendarItem.content_item_id) {
        const { data, error } = await supabase
          .from("content_items")
          .select("raw_content, title")
          .eq("id", calendarItem.content_item_id)
          .eq("workspace_id", workspaceId)
          .single();

        if (error) throw new Error(`Failed to fetch content item: ${error.message}`);
        return data?.raw_content ?? data?.title ?? calendarItem.title;
      }

      return calendarItem.title;
    });

    // STEP 4 — Call Composio to publish
    const connectedAccountId = process.env.COMPOSIO_FACEBOOK_CONNECTED_ACCOUNT_ID ?? "";
    const facebookPageId = process.env.COMPOSIO_FACEBOOK_PAGE_ID ?? "";

    if (!connectedAccountId || !facebookPageId) {
      throw new Error("Missing Composio Facebook connected account or page ID. Set env vars.");
    }

    const composioResult = await step.run("composio-publish", async () => {
      return composioExecute({
        actionName: "FACEBOOK_POST_POST",
        params: {
          page_id: facebookPageId,
          message: publishBody.slice(0, 2200),
        },
        connectedAccountId,
      });
    });

    // STEP 5 — Mark published (or failed) in Supabase
    await step.run("update-status", async () => {
      const isSuccess = composioResult.success === true;
      const newStatus = isSuccess ? "published" : "failed";
      const note = isSuccess
        ? `Published via Composio at ${new Date().toISOString()}`
        : `Composio failed: ${composioResult.error ?? "unknown error"}`;

      const { error } = await supabase
        .from("content_calendar_items")
        .update({
          status: newStatus,
          notes: note,
          updated_at: new Date().toISOString(),
        })
        .eq("id", calendarItemId);

      if (error) throw new Error(`Failed to update calendar status: ${error.message}`);
    });

    if (composioResult.success === true && calendarItem.created_by) {
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
