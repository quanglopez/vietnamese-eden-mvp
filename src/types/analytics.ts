export const ANALYTICS_EVENT_TYPES = [
  "signup",
  "login",
  "board_create",
  "content_add",
  "breakdown_run",
  "remix_run",
  "calendar_add",
] as const;

export type AnalyticsEventType = (typeof ANALYTICS_EVENT_TYPES)[number];

/**
 * Auth funnel events are stored with workspace_id = null (Option A).
 * They are not included in workspace-scoped admin counts until a separate
 * platform-level query exists (service role / SQL), not via getWorkspaceAnalyticsCounts.
 */
export const AUTH_ANALYTICS_EVENT_TYPES = ["signup", "login"] as const;

/** Scalar metadata only — never raw content, titles, AI text, or credentials. */
export type AnalyticsMetadata = Record<string, string | number | boolean>;

export type CohortEvent = {
  persona: string; // BetaPersona or "unattributed"
  eventType: AnalyticsEventType;
  count: number;
};

export type ConfidenceLevel = "high" | "medium" | "low";
