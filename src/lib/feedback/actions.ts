"use server";

import { revalidatePath } from "next/cache";

import { parseImportText } from "@/lib/feedback/auto-classify";
import { createClient } from "@/lib/supabase/server";
import type {
  FeedbackCategory,
  FeedbackDevice,
  FeedbackPriority,
  FeedbackReporterPersona,
  FeedbackReproducible,
  FeedbackSource,
  FeedbackStatus,
} from "@/types/feedback";
import type { Database } from "@/types/database";

export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

function mapDbError(message: string): string {
  if (message.includes("feedback_entries_raw_summary_len")) {
    return "Tóm tắt phản hồi phải có ít nhất 3 ký tự.";
  }
  if (message.includes("_check")) {
    return "Giá trị không hợp lệ (nguồn, danh mục, ưu tiên hoặc trạng thái).";
  }
  return message;
}

function parseQuotes(text: string): string[] {
  return text
    .split(/\n+/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

function triagedTimestampForStatus(
  status: FeedbackStatus,
  existingTriagedAt: string | null,
): string | null | undefined {
  if (status === "untriaged") {
    return null;
  }
  if (!existingTriagedAt) {
    return new Date().toISOString();
  }
  return undefined;
}

export type CreateFeedbackInput = {
  workspaceId: string;
  source: FeedbackSource;
  sourceRef?: string;
  reporterName?: string;
  reporterPersona?: FeedbackReporterPersona | null;
  cohort?: string;
  rawSummary: string;
  verbatimQuotes?: string;
  category: FeedbackCategory;
  priority?: FeedbackPriority | null;
  status?: FeedbackStatus;
  betaTesterId?: string | null;
  linearIssueId?: string;
  actionNotes?: string;
  repliedToUser?: boolean;
  device?: FeedbackDevice | null;
  reproducible?: FeedbackReproducible | null;
  notes?: string;
};

export type UpdateFeedbackInput = {
  entryId: string;
  workspaceId: string;
  source?: FeedbackSource;
  sourceRef?: string | null;
  reporterName?: string | null;
  reporterPersona?: FeedbackReporterPersona | null;
  cohort?: string;
  rawSummary?: string;
  verbatimQuotes?: string;
  category?: FeedbackCategory;
  priority?: FeedbackPriority | null;
  status?: FeedbackStatus;
  betaTesterId?: string | null;
  linearIssueId?: string | null;
  actionNotes?: string | null;
  repliedToUser?: boolean;
  device?: FeedbackDevice | null;
  reproducible?: FeedbackReproducible | null;
  notes?: string | null;
};

export async function createFeedbackEntryAction(
  input: CreateFeedbackInput,
): Promise<ActionResult<{ id: string }>> {
  const rawSummary = input.rawSummary.trim();
  if (rawSummary.length < 3) {
    return { success: false, error: "Tóm tắt phải có ít nhất 3 ký tự." };
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Bạn cần đăng nhập." };
  }

  const status = input.status ?? "untriaged";
  const triagedAt = triagedTimestampForStatus(status, null);

  const { data, error } = await supabase
    .from("feedback_entries")
    .insert({
      workspace_id: input.workspaceId,
      created_by: user.id,
      beta_tester_id: input.betaTesterId ?? null,
      source: input.source,
      source_ref: input.sourceRef?.trim() || null,
      reporter_name: input.reporterName?.trim() || null,
      reporter_persona: input.reporterPersona ?? null,
      cohort: input.cohort?.trim() || "cohort-2",
      raw_summary: rawSummary,
      verbatim_quotes: input.verbatimQuotes ? parseQuotes(input.verbatimQuotes) : [],
      category: input.category,
      priority: input.priority ?? null,
      status,
      triaged_at: triagedAt ?? null,
      linear_issue_id: input.linearIssueId?.trim() || null,
      action_notes: input.actionNotes?.trim() || null,
      replied_to_user: input.repliedToUser ?? false,
      device: input.device ?? null,
      reproducible: input.reproducible ?? null,
      notes: input.notes?.trim() || null,
    })
    .select("id")
    .single();

  if (error) {
    return { success: false, error: mapDbError(error.message) };
  }

  revalidatePath("/admin/feedback");
  return { success: true, data: { id: data.id } };
}

export async function updateFeedbackEntryAction(
  input: UpdateFeedbackInput,
): Promise<ActionResult<{ id: string }>> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Bạn cần đăng nhập." };
  }

  const { data: existing, error: fetchError } = await supabase
    .from("feedback_entries")
    .select("status, triaged_at")
    .eq("id", input.entryId)
    .eq("workspace_id", input.workspaceId)
    .maybeSingle();

  if (fetchError || !existing) {
    return { success: false, error: "Không tìm thấy mục phản hồi." };
  }

  const patch: Database["public"]["Tables"]["feedback_entries"]["Update"] = {};

  if (input.source !== undefined) patch.source = input.source;
  if (input.sourceRef !== undefined) patch.source_ref = input.sourceRef;
  if (input.reporterName !== undefined) patch.reporter_name = input.reporterName;
  if (input.reporterPersona !== undefined) patch.reporter_persona = input.reporterPersona;
  if (input.cohort !== undefined) patch.cohort = input.cohort;
  if (input.rawSummary !== undefined) {
    const summary = input.rawSummary.trim();
    if (summary.length < 3) {
      return { success: false, error: "Tóm tắt phải có ít nhất 3 ký tự." };
    }
    patch.raw_summary = summary;
  }
  if (input.verbatimQuotes !== undefined) {
    patch.verbatim_quotes = parseQuotes(input.verbatimQuotes);
  }
  if (input.category !== undefined) patch.category = input.category;
  if (input.priority !== undefined) patch.priority = input.priority;
  if (input.betaTesterId !== undefined) patch.beta_tester_id = input.betaTesterId;
  if (input.linearIssueId !== undefined) patch.linear_issue_id = input.linearIssueId;
  if (input.actionNotes !== undefined) patch.action_notes = input.actionNotes;
  if (input.repliedToUser !== undefined) patch.replied_to_user = input.repliedToUser;
  if (input.device !== undefined) patch.device = input.device;
  if (input.reproducible !== undefined) patch.reproducible = input.reproducible;
  if (input.notes !== undefined) patch.notes = input.notes;

  if (input.status !== undefined) {
    patch.status = input.status;
    const triagedAt = triagedTimestampForStatus(input.status, existing.triaged_at);
    if (triagedAt !== undefined) {
      patch.triaged_at = triagedAt;
    }
  }

  if (Object.keys(patch).length === 0) {
    return { success: false, error: "Không có thay đổi để lưu." };
  }

  const { data, error } = await supabase
    .from("feedback_entries")
    .update(patch)
    .eq("id", input.entryId)
    .eq("workspace_id", input.workspaceId)
    .select("id")
    .single();

  if (error) {
    return { success: false, error: mapDbError(error.message) };
  }

  revalidatePath("/admin/feedback");
  return { success: true, data: { id: data.id } };
}

export async function deleteFeedbackEntryAction(input: {
  entryId: string;
  workspaceId: string;
}): Promise<ActionResult<{ id: string }>> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Bạn cần đăng nhập." };
  }

  const { data, error } = await supabase
    .from("feedback_entries")
    .delete()
    .eq("id", input.entryId)
    .eq("workspace_id", input.workspaceId)
    .select("id")
    .single();

  if (error) {
    return { success: false, error: mapDbError(error.message) };
  }

  revalidatePath("/admin/feedback");
  return { success: true, data: { id: data.id } };
}

export async function importFeedbackEntriesAction(input: {
  workspaceId: string;
  text: string;
  defaultSource?: FeedbackSource;
}): Promise<ActionResult<{ created: number; skipped: number }>> {
  const rows = parseImportText(input.text);
  if (rows.length === 0) {
    return { success: false, error: "Không có dòng hợp lệ để nhập." };
  }

  let created = 0;
  let skipped = 0;

  for (const row of rows) {
    if (!row.category) {
      skipped += 1;
      continue;
    }
    const result = await createFeedbackEntryAction({
      workspaceId: input.workspaceId,
      source: input.defaultSource ?? "google_form",
      rawSummary: row.rawSummary,
      category: row.category,
      priority: row.priority,
      status: "untriaged",
    });
    if (result.success) {
      created += 1;
    } else {
      skipped += 1;
    }
  }

  if (created === 0) {
    return {
      success: false,
      error: `Không nhập được mục nào (${skipped} bỏ qua). Gợi ý: thêm từ khóa hoặc chỉ định danh mục (bug|ux|fr|ai|price|positive).`,
    };
  }

  return { success: true, data: { created, skipped } };
}
