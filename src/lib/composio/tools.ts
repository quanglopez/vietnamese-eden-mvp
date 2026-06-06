import {
  composioExecute,
  type ComposioExecuteOptions,
} from "@/lib/composio";

export type ComposioExecuteParams = ComposioExecuteOptions;

// =============================================================================
// Composio Tool Registry — Thin REST Wrappers
// =============================================================================
// Không dùng @composio/sdk v3 (alpha) vì lỗi type hệ thống:
//   • TS18028 private identifiers in node_modules
//   • TS1259 zod esModuleInterop conflict
//   • #files module resolution failure
//
// Thay vào đó: gọi trực tiếp Composio REST API qua composioExecute()
// từ src/lib/composio.ts (đã có, đang chạy Facebook publish).
// =============================================================================

// ---------------------------------------------------------------------------
// 1. SOCIAL MEDIA — Facebook
// ---------------------------------------------------------------------------

export async function facebookPostMessage(params: {
  pageId: string;
  message: string;
  connectedAccountId: string;
}) {
  return composioExecute({
    actionName: "FACEBOOK_POST_POST",
    params: {
      page_id: params.pageId,
      message: params.message.slice(0, 2200),
    },
    connectedAccountId: params.connectedAccountId,
  });
}

// ---------------------------------------------------------------------------
// 2. SOCIAL MEDIA — TikTok
// ---------------------------------------------------------------------------

export async function tikTokPostVideo(params: {
  title: string;
  videoUrl: string;
  privacyLevel?: "public" | "private" | "friends";
  connectedAccountId: string;
}) {
  return composioExecute({
    actionName: "TIKTOK_VIDEO_UPLOAD",
    params: {
      title: params.title.slice(0, 100),
      video_url: params.videoUrl,
      privacy_level: params.privacyLevel ?? "public",
    },
    connectedAccountId: params.connectedAccountId,
  });
}

// ---------------------------------------------------------------------------
// 2b. SOCIAL MEDIA — Instagram
// ---------------------------------------------------------------------------

type InstagramMediaType = "photo" | "video" | "reels" | "carousel";

function extractComposioCreationId(data: unknown): string {
  if (typeof data === "object" && data !== null && "id" in data) {
    const id = (data as { id: unknown }).id;
    if (typeof id === "string" && id.length > 0) {
      return id;
    }
  }
  throw new Error("Không lấy được creation_id từ phản hồi Composio Instagram.");
}

function inferInstagramMediaType(url: string): InstagramMediaType {
  const lower = url.toLowerCase();
  if (lower.includes("/reel/") || lower.includes("/reels/")) {
    return "reels";
  }
  if (/\.(mp4|mov|webm|m4v)(\?|$)/i.test(url)) {
    return "video";
  }
  return "photo";
}

export async function instagramPostMedia(params: {
  caption: string;
  mediaUrl?: string | null;
  mediaUrls?: string[];
  connectedAccountId: string;
}) {
  const caption = params.caption.slice(0, 2200);
  const urls =
    params.mediaUrls && params.mediaUrls.length > 0
      ? params.mediaUrls
      : params.mediaUrl
        ? [params.mediaUrl]
        : [];

  if (urls.length === 0) {
    return composioExecute({
      actionName: "INSTAGRAM_POST_PUBLISH_MEDIA",
      params: {
        caption,
        text: caption,
      },
      connectedAccountId: params.connectedAccountId,
    });
  }

  if (urls.length === 1) {
    const mediaUrl = urls[0] as string;
    const mediaType = inferInstagramMediaType(mediaUrl);
    const isVideo = mediaType === "video" || mediaType === "reels";

    const containerResult = await composioExecute({
      actionName: "INSTAGRAM_CREATE_MEDIA_CONTAINER",
      params: {
        ...(isVideo ? { video_url: mediaUrl } : { image_url: mediaUrl }),
        caption,
        ...(mediaType === "reels" ? { media_type: "REELS" as const } : {}),
      },
      connectedAccountId: params.connectedAccountId,
    });

    if (containerResult.success !== true) {
      return containerResult;
    }

    const creationId = extractComposioCreationId(containerResult.data);

    return composioExecute({
      actionName: "INSTAGRAM_POST_IG_USER_MEDIA_PUBLISH",
      params: {
        creation_id: creationId,
        max_wait_seconds: isVideo ? 120 : 60,
      },
      connectedAccountId: params.connectedAccountId,
    });
  }

  const childIds: string[] = [];
  for (const url of urls.slice(0, 10)) {
    const isVideo = inferInstagramMediaType(url) !== "photo";
    const childResult = await composioExecute({
      actionName: "INSTAGRAM_CREATE_MEDIA_CONTAINER",
      params: {
        ...(isVideo ? { video_url: url } : { image_url: url }),
        is_carousel_item: true,
      },
      connectedAccountId: params.connectedAccountId,
    });

    if (childResult.success !== true) {
      return childResult;
    }

    childIds.push(extractComposioCreationId(childResult.data));
  }

  const carouselResult = await composioExecute({
    actionName: "INSTAGRAM_CREATE_CAROUSEL_CONTAINER",
    params: {
      children: childIds,
      caption,
    },
    connectedAccountId: params.connectedAccountId,
  });

  if (carouselResult.success !== true) {
    return carouselResult;
  }

  return composioExecute({
    actionName: "INSTAGRAM_POST_IG_USER_MEDIA_PUBLISH",
    params: {
      creation_id: extractComposioCreationId(carouselResult.data),
      max_wait_seconds: 120,
    },
    connectedAccountId: params.connectedAccountId,
  });
}

// ---------------------------------------------------------------------------
// 3. SOCIAL MEDIA — LinkedIn
// ---------------------------------------------------------------------------

export async function linkedInPostShare(params: {
  text: string;
  visibility?: "PUBLIC" | "CONNECTIONS";
  connectedAccountId: string;
}) {
  return composioExecute({
    actionName: "LINKEDIN_SHARE_POST",
    params: {
      text: params.text.slice(0, 3000),
      visibility: params.visibility ?? "PUBLIC",
    },
    connectedAccountId: params.connectedAccountId,
  });
}

// ---------------------------------------------------------------------------
// 4. NOTION — Append blocks to page
// ---------------------------------------------------------------------------

export async function notionAppendBlocks(params: {
  pageId: string;
  blocks: Array<{
    type: "heading_1" | "heading_2" | "heading_3" | "paragraph" | "bulleted_list_item";
    text: string;
  }>;
  connectedAccountId: string;
}) {
  return composioExecute({
    actionName: "NOTION_APPEND_BLOCK_CHILDREN",
    params: {
      page_id: params.pageId,
      children: params.blocks.map((b) => ({
        object: "block",
        type: b.type,
        [b.type]: { rich_text: [{ type: "text", text: { content: b.text } }] },
      })),
    },
    connectedAccountId: params.connectedAccountId,
  });
}

export async function notionCreatePage(params: {
  parentPageId: string;
  title: string;
  properties?: Record<string, unknown>;
  connectedAccountId: string;
}) {
  return composioExecute({
    actionName: "NOTION_CREATE_PAGE",
    params: {
      parent: { page_id: params.parentPageId },
      properties: {
        title: {
          title: [{ type: "text", text: { content: params.title } }],
        },
        ...params.properties,
      },
    },
    connectedAccountId: params.connectedAccountId,
  });
}

// ---------------------------------------------------------------------------
// 5. GOOGLE SHEETS — Append row
// ---------------------------------------------------------------------------

export async function googleSheetsAppendRow(params: {
  spreadsheetId: string;
  range: string;
  values: string[][];
  connectedAccountId: string;
}) {
  return composioExecute({
    actionName: "GOOGLESHEETS_ADD_SHEET_ROW",
    params: {
      spreadsheet_id: params.spreadsheetId,
      range: params.range,
      values: params.values,
    },
    connectedAccountId: params.connectedAccountId,
  });
}

// ---------------------------------------------------------------------------
// 6. TELEGRAM — Send message
// ---------------------------------------------------------------------------

export async function telegramSendMessage(params: {
  chatId: string;
  message: string;
  connectedAccountId: string;
}) {
  return composioExecute({
    actionName: "TELEGRAM_SEND_MESSAGE",
    params: {
      chat_id: params.chatId,
      text: params.message.slice(0, 4096),
    },
    connectedAccountId: params.connectedAccountId,
  });
}

// ---------------------------------------------------------------------------
// 7. SLACK — Send message
// ---------------------------------------------------------------------------

export async function slackSendMessage(params: {
  channelId: string;
  message: string;
  connectedAccountId: string;
}) {
  return composioExecute({
    actionName: "SLACK_SEND_MESSAGE",
    params: {
      channel_id: params.channelId,
      text: params.message,
    },
    connectedAccountId: params.connectedAccountId,
  });
}

// ---------------------------------------------------------------------------
// 8. WEB / SCRAPING — Tavily search (for auto-research)
// ---------------------------------------------------------------------------

export async function tavilySearch(params: {
  query: string;
  searchDepth?: "basic" | "advanced";
  maxResults?: number;
  connectedAccountId: string;
}) {
  return composioExecute({
    actionName: "TAVILY_SEARCH",
    params: {
      query: params.query,
      search_depth: params.searchDepth ?? "basic",
      max_results: params.maxResults ?? 10,
    },
    connectedAccountId: params.connectedAccountId,
  });
}

export async function firecrawlScrape(params: {
  url: string;
  connectedAccountId: string;
}) {
  return composioExecute({
    actionName: "FIRECRAWL_SCRAPE",
    params: {
      url: params.url,
      formats: ["markdown"],
    },
    connectedAccountId: params.connectedAccountId,
  });
}

// ---------------------------------------------------------------------------
// Connected Account Helpers
// ---------------------------------------------------------------------------

const COMPOSIO_BASE_URL = "https://backend.composio.dev/api/v3.1";
const COMPOSIO_API_KEY = process.env.COMPOSIO_API_KEY ?? "";

/**
 * Tạo OAuth initiation link cho user.
 * User click → redirect to Facebook/TikTok/LinkedIn OAuth → callback về Eden.
 */
export async function createConnectedAccountLink(params: {
  appName: string;       // "FACEBOOK", "TIKTOK", "LINKEDIN", "NOTION", "GOOGLESHEETS", "TELEGRAM", "SLACK"
  userId: string;         // Eden user ID (để map với entityId trong Composio)
  redirectUri: string;     // e.g. "https://vietnamese-eden-mvp.vercel.app/api/composio/callback"
}) {
  const url = new URL(`${COMPOSIO_BASE_URL}/connectedAccounts`);
  const body = {
    appName: params.appName,
    entityId: params.userId,
    authMode: "OAUTH2",
    redirectUri: params.redirectUri,
  };

  const res = await fetch(url.toString(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": COMPOSIO_API_KEY,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Composio connected account failed (${res.status}): ${text.slice(0, 200)}`);
  }

  return res.json() as Promise<{
    connectedAccountId: string;
    connectionStatus: "initiated" | "active";
    redirectUrl?: string;
  }>;
}

/**
 * Lấy danh sách connected accounts của 1 user.
 */
export async function listConnectedAccounts(userId: string) {
  const url = new URL(`${COMPOSIO_BASE_URL}/connectedAccounts`);
  url.searchParams.set("entityId", userId);

  const res = await fetch(url.toString(), {
    headers: { "x-api-key": COMPOSIO_API_KEY },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Composio list accounts failed (${res.status}): ${text.slice(0, 200)}`);
  }

  return res.json() as Promise<
    Array<{
      id: string;
      appName: string;
      status: "active" | "initiated" | "failed";
      createdAt: string;
    }>
  >;
}
