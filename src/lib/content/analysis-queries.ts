import type { SupabaseClient } from "@supabase/supabase-js";

import type { AnalysisSummaryPayload, ContentAnalysisView, ContentItemDetail } from "@/types/analysis";
import type { Database } from "@/types/database";
import type { PlatformType } from "@/types/content";

function parseSummaryPayload(summary: string | null): AnalysisSummaryPayload | null {
  if (!summary) {
    return null;
  }
  try {
    const parsed = JSON.parse(summary) as AnalysisSummaryPayload;
    if (
      typeof parsed.emotion === "string" &&
      typeof parsed.target_audience === "string" &&
      typeof parsed.why_it_works === "string" &&
      Array.isArray(parsed.remix_suggestions)
    ) {
      return parsed;
    }
    return null;
  } catch {
    return {
      emotion: "",
      target_audience: "",
      why_it_works: summary,
      remix_suggestions: [],
      emotional_triggers: [],
      viral_signals: [],
    };
  }
}

function mapAnalysisRow(row: {
  id: string;
  content_item_id: string;
  hook: string | null;
  angle: string | null;
  structure: string | null;
  cta: string | null;
  summary: string | null;
  ai_model: string | null;
  status: "pending" | "completed" | "failed";
  analyzed_at: string | null;
}): ContentAnalysisView | null {
  if (!row.hook || !row.angle || !row.structure || !row.cta) {
    return null;
  }

  const extra = parseSummaryPayload(row.summary);

  return {
    id: row.id,
    contentItemId: row.content_item_id,
    hook: row.hook,
    angle: row.angle,
    structure: row.structure,
    cta: row.cta,
    emotion: extra?.emotion ?? "",
    targetAudience: extra?.target_audience ?? "",
    whyItWorks: extra?.why_it_works ?? "",
    remixSuggestions: extra?.remix_suggestions ?? [],
    emotionalTriggers: extra?.emotional_triggers ?? [],
    viralSignals: extra?.viral_signals ?? [],
    aiModel: row.ai_model,
    status: row.status,
    analyzedAt: row.analyzed_at,
  };
}

export async function getContentItemById(
  supabase: SupabaseClient<Database>,
  contentItemId: string,
): Promise<{ item: ContentItemDetail | null; error: string | null }> {
  const { data, error } = await supabase
    .from("content_items")
    .select(
      `
      id,
      workspace_id,
      title,
      platform,
      source_url,
      raw_content,
      author_name,
      saved_at,
      content_item_tags (
        tags (
          id,
          name,
          color
        )
      )
    `,
    )
    .eq("id", contentItemId)
    .maybeSingle();

  if (error) {
    return { item: null, error: error.message };
  }
  if (!data) {
    return { item: null, error: null };
  }

  type ContentItemWithTagsRow = {
    id: string;
    workspace_id: string;
    title: string;
    platform: PlatformType;
    source_url: string | null;
    raw_content: string | null;
    author_name: string | null;
    saved_at: string;
    content_item_tags:
      | {
          tags: {
            id: string;
            name: string;
            color: string | null;
          } | null;
        }[]
      | null;
  };
  const row = data as ContentItemWithTagsRow;

  const { data: boardLink } = await supabase
    .from("board_content_items")
    .select("board_id")
    .eq("content_item_id", contentItemId)
    .order("added_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return {
    item: {
      id: row.id,
      workspaceId: row.workspace_id,
      title: row.title,
      platform: row.platform,
      sourceUrl: row.source_url,
      rawContent: row.raw_content,
      authorName: row.author_name,
      savedAt: row.saved_at,
      boardId: boardLink?.board_id ?? null,
      tags: (row.content_item_tags ?? [])
        .map((row) => row.tags)
        .filter((tag): tag is { id: string; name: string; color: string | null } => Boolean(tag))
        .map((tag) => ({
          id: tag.id,
          name: tag.name,
          color: tag.color,
        })),
    },
    error: null,
  };
}

export async function getContentAnalysisByItemId(
  supabase: SupabaseClient<Database>,
  contentItemId: string,
): Promise<{ analysis: ContentAnalysisView | null; error: string | null }> {
  const { data, error } = await supabase
    .from("content_analyses")
    .select(
      "id, content_item_id, hook, angle, structure, cta, summary, ai_model, status, analyzed_at",
    )
    .eq("content_item_id", contentItemId)
    .maybeSingle();

  if (error) {
    return { analysis: null, error: error.message };
  }
  if (!data) {
    return { analysis: null, error: null };
  }

  return { analysis: mapAnalysisRow(data), error: null };
}

export function buildSummaryPayload(result: {
  emotion: string;
  target_audience: string;
  why_it_works: string;
  remix_suggestions: string[];
  emotional_triggers?: string[];
  viral_signals?: string[];
}): string {
  const payload: AnalysisSummaryPayload = {
    emotion: result.emotion,
    target_audience: result.target_audience,
    why_it_works: result.why_it_works,
    remix_suggestions: result.remix_suggestions,
    emotional_triggers: result.emotional_triggers ?? [],
    viral_signals: result.viral_signals ?? [],
  };
  return JSON.stringify(payload);
}

export async function getWorkspaceAnalysisCount(
  supabase: SupabaseClient<Database>,
  workspaceId: string,
): Promise<number> {
  const { count, error } = await supabase
    .from("content_analyses")
    .select("id", { count: "exact", head: true })
    .eq("workspace_id", workspaceId)
    .eq("status", "completed");

  if (error) {
    return 0;
  }
  return count ?? 0;
}
