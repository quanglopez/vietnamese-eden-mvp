"use server";

import type { ActionResult } from "@/lib/boards/actions";
import { isValidUuid } from "@/lib/boards/utils";
import { inngest } from "@/lib/inngest";
import { MAX_EXPORT_BATCH } from "@/lib/export/constants";
import { createClient } from "@/lib/supabase/server";

type ExportTriggerResult = {
  eventIds: string[];
  itemCount: number;
};

function validateCalendarItemIds(ids: string[]): string | null {
  if (ids.length === 0) {
    return "Chọn ít nhất một mục lịch để xuất.";
  }
  if (ids.length > MAX_EXPORT_BATCH) {
    return `Tối đa ${MAX_EXPORT_BATCH} mục mỗi lần xuất.`;
  }
  if (!ids.every(isValidUuid)) {
    return "Danh sách mục lịch không hợp lệ.";
  }
  return null;
}

async function assertCalendarItemsInWorkspace(
  workspaceId: string,
  calendarItemIds: string[],
): Promise<ActionResult<{ validIds: string[] }>> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Bạn cần đăng nhập để xuất dữ liệu." };
  }

  const { data: membership, error: membershipError } = await supabase
    .from("workspace_members")
    .select("workspace_id")
    .eq("workspace_id", workspaceId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (membershipError) {
    return { success: false, error: membershipError.message };
  }
  if (!membership) {
    return { success: false, error: "Bạn không có quyền truy cập workspace này." };
  }

  const { data, error } = await supabase
    .from("content_calendar_items")
    .select("id")
    .eq("workspace_id", workspaceId)
    .in("id", calendarItemIds);

  if (error) {
    return { success: false, error: error.message };
  }

  const foundIds = new Set((data ?? []).map((row) => row.id));
  const validIds = calendarItemIds.filter((id) => foundIds.has(id));

  if (validIds.length === 0) {
    return { success: false, error: "Không tìm thấy mục lịch hợp lệ trong workspace." };
  }

  return { success: true, data: { validIds } };
}

export async function requestNotionExportAction(input: {
  workspaceId: string;
  contentCalendarItemIds: string[];
  notionConnectedAccountId: string;
  notionParentPageId: string;
}): Promise<ActionResult<ExportTriggerResult>> {
  const {
    workspaceId,
    contentCalendarItemIds,
    notionConnectedAccountId,
    notionParentPageId,
  } = input;

  if (!isValidUuid(workspaceId)) {
    return { success: false, error: "Workspace không hợp lệ." };
  }

  const idsError = validateCalendarItemIds(contentCalendarItemIds);
  if (idsError) {
    return { success: false, error: idsError };
  }

  if (!notionConnectedAccountId.trim()) {
    return { success: false, error: "Thiếu tài khoản Notion đã kết nối." };
  }
  if (!notionParentPageId.trim()) {
    return { success: false, error: "Thiếu trang Notion đích." };
  }

  const access = await assertCalendarItemsInWorkspace(workspaceId, contentCalendarItemIds);
  if (!access.success) {
    return access;
  }

  const { ids } = await inngest.send({
    name: "export/notion-requested",
    data: {
      workspaceId,
      contentCalendarItemIds: access.data.validIds,
      notionConnectedAccountId: notionConnectedAccountId.trim(),
      notionParentPageId: notionParentPageId.trim(),
    },
  });

  return {
    success: true,
    data: {
      eventIds: ids,
      itemCount: access.data.validIds.length,
    },
  };
}

export async function requestSheetsExportAction(input: {
  workspaceId: string;
  contentCalendarItemIds: string[];
  sheetsConnectedAccountId: string;
  spreadsheetId: string;
  range: string;
}): Promise<ActionResult<ExportTriggerResult>> {
  const {
    workspaceId,
    contentCalendarItemIds,
    sheetsConnectedAccountId,
    spreadsheetId,
    range,
  } = input;

  if (!isValidUuid(workspaceId)) {
    return { success: false, error: "Workspace không hợp lệ." };
  }

  const idsError = validateCalendarItemIds(contentCalendarItemIds);
  if (idsError) {
    return { success: false, error: idsError };
  }

  if (!sheetsConnectedAccountId.trim()) {
    return { success: false, error: "Thiếu tài khoản Google Sheets đã kết nối." };
  }
  if (!spreadsheetId.trim()) {
    return { success: false, error: "Thiếu spreadsheet ID." };
  }
  if (!range.trim()) {
    return { success: false, error: "Thiếu phạm vi (range) sheet." };
  }

  const access = await assertCalendarItemsInWorkspace(workspaceId, contentCalendarItemIds);
  if (!access.success) {
    return access;
  }

  const { ids } = await inngest.send({
    name: "export/sheets-requested",
    data: {
      workspaceId,
      contentCalendarItemIds: access.data.validIds,
      sheetsConnectedAccountId: sheetsConnectedAccountId.trim(),
      spreadsheetId: spreadsheetId.trim(),
      range: range.trim(),
    },
  });

  return {
    success: true,
    data: {
      eventIds: ids,
      itemCount: access.data.validIds.length,
    },
  };
}
