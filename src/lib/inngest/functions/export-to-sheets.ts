import { z } from "zod";

import { googleSheetsAppendRow } from "@/lib/composio/tools";
import { inngest } from "../client";
import {
  buildSheetRow,
  loadCalendarExportItems,
  MAX_EXPORT_BATCH,
} from "./export-shared";

const sheetsExportEventSchema = z.object({
  workspaceId: z.string().uuid(),
  contentCalendarItemIds: z.array(z.string().uuid()).min(1),
  sheetsConnectedAccountId: z.string().min(1),
  spreadsheetId: z.string().min(1),
  range: z.string().min(1),
});

export const exportToSheets = inngest.createFunction(
  {
    id: "export-to-sheets",
    name: "Export calendar items to Google Sheets",
    retries: 2,
  },
  { event: "export/sheets-requested" },
  async ({ event, step }) => {
    const parsed = sheetsExportEventSchema.parse(event.data);
    const batchIds = parsed.contentCalendarItemIds.slice(0, MAX_EXPORT_BATCH);

    const exportItems = await step.run("fetch-export-items", async () => {
      return loadCalendarExportItems(batchIds, parsed.workspaceId);
    });

    if (exportItems.length === 0) {
      return {
        workspaceId: parsed.workspaceId,
        exported: 0,
        skipped: batchIds.length,
      };
    }

    const rows = exportItems.map((item) => buildSheetRow(item));

    for (let index = 0; index < rows.length; index += 1) {
      const row = rows[index];
      if (!row) {
        continue;
      }

      await step.run(`sheets-append-row-${index}`, async () => {
        const appendResult = await googleSheetsAppendRow({
          spreadsheetId: parsed.spreadsheetId,
          range: parsed.range,
          values: [row],
          connectedAccountId: parsed.sheetsConnectedAccountId,
        });

        if (appendResult.success !== true) {
          throw new Error(
            appendResult.error ??
              `Không thể ghi dòng ${index + 1} vào Google Sheets.`,
          );
        }

        return { rowIndex: index };
      });

      if (index < rows.length - 1) {
        await step.sleep(`rate-limit-sheets-${index}`, "1s");
      }
    }

    return {
      workspaceId: parsed.workspaceId,
      exported: rows.length,
      skipped: batchIds.length - exportItems.length,
    };
  },
);
