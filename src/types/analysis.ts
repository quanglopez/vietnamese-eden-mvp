export type AnalysisStatus = "pending" | "completed" | "failed";

/** JSON lưu trong cột content_analyses.summary */
export type AnalysisSummaryPayload = {
  emotion: string;
  target_audience: string;
  why_it_works: string;
  remix_suggestions: string[];
};

export type ContentAnalysisView = {
  id: string;
  contentItemId: string;
  hook: string;
  angle: string;
  structure: string;
  cta: string;
  emotion: string;
  targetAudience: string;
  whyItWorks: string;
  remixSuggestions: string[];
  aiModel: string | null;
  status: AnalysisStatus;
  analyzedAt: string | null;
};

export type ContentItemDetail = {
  id: string;
  workspaceId: string;
  title: string;
  platform: import("@/types/content").PlatformType;
  sourceUrl: string | null;
  rawContent: string | null;
  authorName: string | null;
  savedAt: string;
  boardId: string | null;
};
