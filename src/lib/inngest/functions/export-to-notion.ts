import { z } from "zod";

import { notionAppendBlocks, notionCreatePage } from "@/lib/composio/tools";
import { inngest } from "../client";
import {
  buildNotionBreakdownBlocks,
  extractNotionPageId,
  loadCalendarExportItems,
  MAX_EXPORT_BATCH,
  toExportSafeText,
} from "./export-shared";

const notionExportEventSchema = z.object({
  workspaceId: z.string().uuid(),
  contentCalendarItemIds: z.array(z.string().uuid()).min(1),
  notionConnectedAccountId: z.string().min(1),
  notionParentPageId: z.string().min(1),
});

type NotionExportResult = {
  calendarItemId: string;
  notionPageId: string;
};

export const exportToNotion = inngest.createFunction(
  {
    id: "export-to-notion",
    name: "Export calendar items to Notion",
    retries: 2,
  },
  { event: "export/notion-requested" },
  async ({ event, step }) => {
    const parsed = notionExportEventSchema.parse(event.data);
    const batchIds = parsed.contentCalendarItemIds.slice(0, MAX_EXPORT_BATCH);

    const exportItems = await step.run("fetch-export-items", async () => {
      return loadCalendarExportItems(batchIds, parsed.workspaceId);
    });

    if (exportItems.length === 0) {
      return {
        workspaceId: parsed.workspaceId,
        exported: 0,
        skipped: batchIds.length,
        results: [] as NotionExportResult[],
      };
    }

    const results: NotionExportResult[] = [];

    for (const item of exportItems) {
      const notionPageId = await step.run(`notion-create-page-${item.id}`, async () => {
        const createResult = await notionCreatePage({
          parentPageId: parsed.notionParentPageId,
          title: toExportSafeText(item.title, "Không có tiêu đề"),
          connectedAccountId: parsed.notionConnectedAccountId,
        });

        if (createResult.success !== true) {
          throw new Error(
            createResult.error ?? `Không thể tạo trang Notion cho "${item.title}".`,
          );
        }

        return extractNotionPageId(createResult.data);
      });

      await step.sleep(`rate-limit-after-create-${item.id}`, "1s");

      await step.run(`notion-append-blocks-${item.id}`, async () => {
        const blocks = buildNotionBreakdownBlocks(item.breakdown);
        const appendResult = await notionAppendBlocks({
          pageId: notionPageId,
          blocks,
          connectedAccountId: parsed.notionConnectedAccountId,
        });

        if (appendResult.success !== true) {
          throw new Error(
            appendResult.error ?? `Không thể thêm nội dung Notion cho "${item.title}".`,
          );
        }

        return { appended: blocks.length };
      });

      await step.sleep(`rate-limit-after-append-${item.id}`, "1s");

      results.push({
        calendarItemId: item.id,
        notionPageId,
      });
    }

    return {
      workspaceId: parsed.workspaceId,
      exported: results.length,
      skipped: batchIds.length - exportItems.length,
      results,
    };
  },
);
