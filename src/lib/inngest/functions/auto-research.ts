import { z } from "zod";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { detectPlatformFromUrl, generateTitleFromUrl, normalizeSourceUrl } from "@/lib/content/platform-detect";
import { insertAndLinkContentItem } from "@/lib/content/link-content";
import { firecrawlScrape, tavilySearch } from "@/lib/composio/tools";
import type { PlatformType } from "@/types/content";
import { inngest } from "../client";

// =============================================================================
// ENV — Supabase service role (bypass RLS cho job nền)
// =============================================================================

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

let _supabase: SupabaseClient | null = null;
function getSupabase(): SupabaseClient {
  if (!_supabase) {
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) throw new Error("Thiếu NEXT_PUBLIC_SUPABASE_URL hoặc SUPABASE_SERVICE_ROLE_KEY");
    _supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
  }
  return _supabase;
}

/** Client không gắn Database — truy vấn bảng chưa có trong generated types */
let _supabaseUntyped: SupabaseClient | null = null;
function getSupabaseUntyped(): SupabaseClient {
  if (!_supabaseUntyped) {
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) throw new Error("Thiếu NEXT_PUBLIC_SUPABASE_URL hoặc SUPABASE_SERVICE_ROLE_KEY");
    _supabaseUntyped = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
  }
  return _supabaseUntyped;
}

// =============================================================================
// Hằng số truy vấn mặc định (Vietnamese viral content)
// =============================================================================

const DEFAULT_RESEARCH_QUERIES = [
  "viral TikTok Vietnam 2024",
  "trending content creator Việt Nam",
] as const;

const AUTO_RESEARCH_CRON = "TZ=Asia/Ho_Chi_Minh 0 9 * * *";

// =============================================================================
// Zod — validate payload sự kiện & kết quả Composio
// =============================================================================

const researchRequestEventSchema = z.object({
  workspaceId: z.string().uuid(),
  userId: z.string().uuid(),
  boardId: z.string().uuid(),
  connectedAccountId: z.string().min(1).optional(),
  query: z.string().min(3).optional(),
});

type ResearchRequestEventData = z.infer<typeof researchRequestEventSchema>;

const tavilyResultItemSchema = z.object({
  url: z.string().url(),
  title: z.string().optional(),
  content: z.string().optional(),
});

const tavilySearchResponseSchema = z.object({
  results: z.array(tavilyResultItemSchema).default([]),
});

const firecrawlScrapeResultSchema = z.object({
  markdown: z.string().optional(),
  content: z.string().optional(),
  metadata: z
    .object({
      title: z.string().optional(),
      sourceURL: z.string().optional(),
      ogTitle: z.string().optional(),
    })
    .optional(),
});

type ScrapedContentItem = {
  title: string;
  platform: PlatformType;
  rawContent: string;
  sourceUrl: string;
};

type ScrapeStepResult =
  | { ok: true; item: ScrapedContentItem }
  | { ok: false; sourceUrl: string; error: string };

type ConnectedAccountRow = {
  connected_account_id: string;
  status: string;
};

// =============================================================================
// INNGEST — Auto-research viral content → Swipe Board
// =============================================================================

export const autoResearch = inngest.createFunction(
  {
    id: "auto-research",
    name: "Auto-research nội dung viral Việt Nam",
    retries: 2,
    // Giới hạn 1 lượt search / phút / workspace
    throttle: {
      limit: 1,
      period: "1m",
      key: "event.data.workspaceId",
    },
  },
  [{ event: "research/request" }, { cron: AUTO_RESEARCH_CRON }],
  async ({ event, step }) => {
    const context = resolveResearchContext(event.data);

    const connectedAccountId = await step.run("resolve-connected-account", async () => {
      return resolveConnectedAccountId(context.userId, context.connectedAccountId);
    });

    const searchQuery =
      context.query ??
      DEFAULT_RESEARCH_QUERIES[new Date().getUTCDate() % DEFAULT_RESEARCH_QUERIES.length] ??
      DEFAULT_RESEARCH_QUERIES[0];

    const resultUrls = await step.run("search", async () => {
      const searchResponse = await tavilySearch({
        query: searchQuery,
        searchDepth: "advanced",
        maxResults: 10,
        connectedAccountId,
      });

      if (searchResponse.success !== true) {
        throw new Error(
          `Tavily search thất bại: ${searchResponse.error ?? "lỗi không xác định"}`,
        );
      }

      const parsed = tavilySearchResponseSchema.safeParse(unwrapComposioPayload(searchResponse.data));
      if (!parsed.success) {
        throw new Error("Phản hồi Tavily không hợp lệ — thiếu danh sách results.");
      }

      const uniqueUrls = [...new Set(parsed.data.results.map((row) => normalizeSourceUrl(row.url)))];
      return uniqueUrls.slice(0, 10);
    });

    const scrapedItems: ScrapedContentItem[] = [];

    for (let index = 0; index < resultUrls.length; index += 1) {
      const sourceUrl = resultUrls[index];
      if (!sourceUrl) continue;

      const scrapeOutcome = await step.run(`scrape-${index}`, async (): Promise<ScrapeStepResult> => {
        try {
          const item = await scrapeUrl(sourceUrl, connectedAccountId, searchQuery);
          return { ok: true, item };
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          console.warn("[auto-research] Scrape thất bại cho URL:", sourceUrl, message);
          return { ok: false, sourceUrl, error: message };
        }
      });

      if (scrapeOutcome.ok) {
        scrapedItems.push(scrapeOutcome.item);
      }
    }

    const insertedIds = await step.run("insert", async () => {
      const ids: string[] = [];
      const now = new Date().toISOString();

      for (const item of scrapedItems) {
        try {
          const normalizedUrl = normalizeSourceUrl(item.sourceUrl);

          const { data: existing } = await getSupabase()
            .from("content_items")
            .select("id")
            .eq("workspace_id", context.workspaceId)
            .eq("source_url", normalizedUrl)
            .maybeSingle();

          if (existing?.id) {
            console.info("[auto-research] Bỏ qua URL đã tồn tại:", normalizedUrl);
            continue;
          }

          const linkResult = await insertAndLinkContentItem(getSupabase(), {
            boardId: context.boardId,
            workspaceId: context.workspaceId,
            userId: context.userId,
            title: item.title,
            platform: item.platform,
            sourceUrl: normalizedUrl,
            rawContent: item.rawContent,
          });

          if ("error" in linkResult) {
            console.warn(
              "[auto-research] Không thể lưu content item:",
              normalizedUrl,
              linkResult.error,
            );
            continue;
          }

          const { error: metaError } = await getSupabaseUntyped()
            .from("content_items")
            .update({
              saved_at: now,
              source_quality: "auto_research",
            })
            .eq("id", linkResult.contentItemId);

          if (metaError) {
            console.warn(
              "[auto-research] Không thể gán saved_at/source_quality:",
              metaError.message,
            );
          }

          ids.push(linkResult.contentItemId);
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          console.warn("[auto-research] Insert thất bại:", item.sourceUrl, message);
        }
      }

      return ids;
    });

    return {
      workspaceId: context.workspaceId,
      boardId: context.boardId,
      query: searchQuery,
      searchedUrls: resultUrls.length,
      scrapedCount: scrapedItems.length,
      insertedIds,
    };
  },
);

// =============================================================================
// Helpers
// =============================================================================

function resolveResearchContext(rawData: unknown): ResearchRequestEventData {
  const manual = researchRequestEventSchema.safeParse(rawData);
  if (manual.success) {
    return manual.data;
  }

  const workspaceId = process.env.AUTO_RESEARCH_WORKSPACE_ID;
  const userId = process.env.AUTO_RESEARCH_USER_ID;
  const boardId = process.env.AUTO_RESEARCH_BOARD_ID;

  if (!workspaceId || !userId || !boardId) {
    throw new Error(
      "Cron auto-research thiếu AUTO_RESEARCH_WORKSPACE_ID, AUTO_RESEARCH_USER_ID hoặc AUTO_RESEARCH_BOARD_ID.",
    );
  }

  return {
    workspaceId,
    userId,
    boardId,
    connectedAccountId: process.env.COMPOSIO_TAVILY_CONNECTED_ACCOUNT_ID,
    query: DEFAULT_RESEARCH_QUERIES[0],
  };
}

async function resolveConnectedAccountId(
  userId: string,
  fromEvent?: string,
): Promise<string> {
  if (fromEvent) {
    return fromEvent;
  }

  const envFallback = process.env.COMPOSIO_TAVILY_CONNECTED_ACCOUNT_ID;
  if (envFallback) {
    return envFallback;
  }

  const { data, error } = await getSupabaseUntyped()
    .from("user_connected_accounts")
    .select("connected_account_id, status")
    .eq("user_id", userId)
    .in("provider", ["tavily", "firecrawl"])
    .eq("status", "active")
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(`Không thể lấy tài khoản Composio research: ${error.message}`);
  }

  const row = data as ConnectedAccountRow | null;
  if (!row?.connected_account_id) {
    throw new Error(
      "Chưa kết nối Tavily/Firecrawl trên Composio. Cung cấp connectedAccountId trong sự kiện hoặc COMPOSIO_TAVILY_CONNECTED_ACCOUNT_ID.",
    );
  }

  return row.connected_account_id;
}

function unwrapComposioPayload(data: unknown): unknown {
  if (typeof data === "object" && data !== null && "data" in data) {
    return (data as { data: unknown }).data;
  }
  return data;
}

async function scrapeUrl(
  sourceUrl: string,
  connectedAccountId: string,
  fallbackTitle: string,
): Promise<ScrapedContentItem> {
  const normalizedUrl = normalizeSourceUrl(sourceUrl);
  const { platform } = detectPlatformFromUrl(normalizedUrl);

  // Route social platforms through importSocialUrl — Firecrawl always fails on these
  if (platform === "youtube" || platform === "tiktok" || platform === "instagram") {
    const { importSocialUrl } = await import("@/lib/content/social-importer");
    const result = await importSocialUrl(normalizedUrl);
    const rawContent = (result.transcriptText ?? result.captionText ?? result.metadataText ?? "").trim();
    if (rawContent.length < 20) {
      throw new Error(`Nội dung ${platform} quá ngắn hoặc bị blocked — hãy dán text thủ công.`);
    }
    return {
      title: (result.title ?? generateTitleFromUrl(normalizedUrl) ?? fallbackTitle).slice(0, 200),
      platform,
      rawContent: rawContent.slice(0, 50_000),
      sourceUrl: normalizedUrl,
    };
  }

  const scrapeResponse = await firecrawlScrape({
    url: normalizedUrl,
    connectedAccountId,
  });

  if (scrapeResponse.success !== true) {
    throw new Error(scrapeResponse.error ?? "Firecrawl scrape thất bại");
  }

  const parsed = firecrawlScrapeResultSchema.safeParse(unwrapComposioPayload(scrapeResponse.data));
  if (!parsed.success) {
    throw new Error("Phản hồi Firecrawl không hợp lệ — thiếu markdown/content.");
  }

  const markdown = parsed.data.markdown ?? parsed.data.content ?? "";
  const title =
    parsed.data.metadata?.title ??
    parsed.data.metadata?.ogTitle ??
    generateTitleFromUrl(normalizedUrl) ??
    fallbackTitle;

  const rawContent = markdown.trim();
  if (rawContent.length < 20) {
    throw new Error("Nội dung scrape quá ngắn hoặc rỗng.");
  }

  return {
    title: title.slice(0, 200),
    platform,
    rawContent: rawContent.slice(0, 50_000),
    sourceUrl: normalizedUrl,
  };
}
