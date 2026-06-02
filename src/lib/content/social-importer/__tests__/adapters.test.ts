import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { FacebookImporter } from "@/lib/content/social-importer/adapters/facebook";
import {
  InstagramImporter,
  type InstagramOEmbedFetchResult,
} from "@/lib/content/social-importer/adapters/instagram";
import { LinkedInImporter } from "@/lib/content/social-importer/adapters/linkedin";
import {
  TikTokImporter,
  type TikTokOEmbedFetchResult,
} from "@/lib/content/social-importer/adapters/tiktok";
import { UnknownUrlImporter } from "@/lib/content/social-importer/adapters/unknown";
import { YouTubeImporter } from "@/lib/content/social-importer/adapters/youtube";
import { ADAPTERS, importSocialUrl } from "@/lib/content/social-importer/index";

const YOUTUBE_URL = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
const YOUTUBE_VIDEO_ID = "dQw4w9WgXcQ";
const YOUTUBE_THUMB = `https://img.youtube.com/vi/${YOUTUBE_VIDEO_ID}/hqdefault.jpg`;
const TIKTOK_URL = "https://www.tiktok.com/@creator/video/1234567890";
const TIKTOK_INVALID_URL = "https://www.tiktok.com/";
const TIKTOK_LONG_TITLE = `Caption TikTok đủ dài để phân tích. ${"x".repeat(40)}`;
const TIKTOK_SHORT_TITLE = "TikTok ngắn";
const TIKTOK_THUMB = "https://p16-sign.tiktokcdn.com/thumb.jpeg";

function tikTokImporterWithOEmbed(result: TikTokOEmbedFetchResult) {
  return new TikTokImporter({
    fetchOEmbed: async () => result,
  });
}
const INSTAGRAM_URL = "https://www.instagram.com/reel/ABC123/";
const INSTAGRAM_INVALID_URL = "https://www.instagram.com/";
const INSTAGRAM_LONG_TITLE = `Caption Instagram đủ dài để phân tích. ${"z".repeat(40)}`;
const INSTAGRAM_SHORT_TITLE = "IG ngắn";
const INSTAGRAM_THUMB = "https://instagram.cdn/thumb.jpg";

function instagramImporterWithOEmbed(result: InstagramOEmbedFetchResult) {
  return new InstagramImporter({
    fetchOEmbed: async () => result,
  });
}
const FACEBOOK_URL = "https://www.facebook.com/watch/?v=123";
const LINKEDIN_URL = "https://www.linkedin.com/posts/user_activity-123";
const OTHER_URL = "https://example.com/page";

describe("YouTubeImporter", () => {
  const importer = new YouTubeImporter({
    fetchMetadata: async () => ({
      title: "Tiêu đề test",
      author: "Kênh test",
      description: null,
      thumbnailUrl: YOUTUBE_THUMB,
    }),
    transcriptFetcher: { fetchTranscript: async () => null },
  });

  it("canHandle nhận diện URL YouTube", () => {
    assert.equal(importer.canHandle(YOUTUBE_URL), true);
    assert.equal(importer.canHandle(OTHER_URL), false);
  });

  it("import trả metadata_only và cảnh báo METADATA_ONLY (mock, không HTTP)", async () => {
    const result = await importer.import(YOUTUBE_URL);
    assert.equal(result.platform, "youtube");
    assert.equal(result.sourceQuality, "metadata_only");
    assert.equal(result.canonicalUrl, YOUTUBE_URL);
    assert.ok(result.warnings.some((warning) => warning.code === "METADATA_ONLY"));
    assert.ok(
      result.warnings.some((warning) => warning.code === "TRANSCRIPT_UNAVAILABLE"),
    );
    assert.equal(result.transcriptText, undefined);
  });
});

describe("TikTokImporter", () => {
  it("canHandle nhận diện URL TikTok", () => {
    const importer = new TikTokImporter();
    assert.equal(importer.canHandle(TIKTOK_URL), true);
    assert.equal(importer.canHandle(YOUTUBE_URL), false);
  });

  it("import oEmbed success → caption khi title đủ dài", async () => {
    const importer = tikTokImporterWithOEmbed({
      ok: true,
      title: TIKTOK_LONG_TITLE,
      author: "@creator",
      thumbnailUrl: TIKTOK_THUMB,
    });
    const result = await importer.import(TIKTOK_URL);
    assert.equal(result.sourceQuality, "caption");
    assert.equal(result.captionText, TIKTOK_LONG_TITLE);
    assert.equal(result.transcriptText, undefined);
    assert.equal(result.title, TIKTOK_LONG_TITLE);
    assert.equal(result.author, "@creator");
    assert.equal(result.thumbnailUrl, TIKTOK_THUMB);
    assert.ok(result.warnings.some((w) => w.code === "CAPTION_UNAVAILABLE"));
  });

  it("import oEmbed success → metadata_only khi title ngắn", async () => {
    const importer = tikTokImporterWithOEmbed({
      ok: true,
      title: TIKTOK_SHORT_TITLE,
      author: "@creator",
      thumbnailUrl: TIKTOK_THUMB,
    });
    const result = await importer.import(TIKTOK_URL);
    assert.equal(result.sourceQuality, "metadata_only");
    assert.equal(result.captionText, undefined);
    assert.equal(result.transcriptText, undefined);
    assert.ok(result.warnings.some((w) => w.code === "METADATA_ONLY"));
    assert.ok(result.warnings.some((w) => w.code === "TRANSCRIPT_UNAVAILABLE"));
  });

  it("import oEmbed 403 → blocked, không throw", async () => {
    const importer = tikTokImporterWithOEmbed({ ok: false, status: 403 });
    const result = await importer.import(TIKTOK_URL);
    assert.equal(result.sourceQuality, "blocked");
    assert.ok(result.warnings.some((w) => w.code === "PLATFORM_BLOCKED"));
    assert.equal(result.captionText, undefined);
  });

  it("import oEmbed 429 → blocked + RATE_LIMITED", async () => {
    const importer = tikTokImporterWithOEmbed({ ok: false, status: 429 });
    const result = await importer.import(TIKTOK_URL);
    assert.equal(result.sourceQuality, "blocked");
    assert.ok(result.warnings.some((w) => w.code === "RATE_LIMITED"));
  });

  it("import oEmbed network fail → blocked, không throw", async () => {
    const importer = tikTokImporterWithOEmbed({ ok: false });
    const result = await importer.import(TIKTOK_URL);
    assert.equal(result.sourceQuality, "blocked");
    assert.ok(result.warnings.some((w) => w.code === "PLATFORM_BLOCKED"));
  });

  it("import URL TikTok không hợp lệ → manual_required", async () => {
    const importer = tikTokImporterWithOEmbed({
      ok: true,
      title: TIKTOK_LONG_TITLE,
      author: null,
      thumbnailUrl: null,
    });
    const result = await importer.import(TIKTOK_INVALID_URL);
    assert.equal(result.sourceQuality, "manual_required");
    assert.ok(result.warnings.some((w) => w.code === "UNSUPPORTED_URL"));
  });
});

describe("InstagramImporter", () => {
  it("canHandle nhận diện URL Instagram", () => {
    const importer = new InstagramImporter();
    assert.equal(importer.canHandle(INSTAGRAM_URL), true);
    assert.equal(importer.canHandle(OTHER_URL), false);
  });

  it("import oEmbed success → caption khi title đủ dài", async () => {
    const importer = instagramImporterWithOEmbed({
      ok: true,
      title: INSTAGRAM_LONG_TITLE,
      author: "@creator",
      thumbnailUrl: INSTAGRAM_THUMB,
    });
    const result = await importer.import(INSTAGRAM_URL);
    assert.equal(result.sourceQuality, "caption");
    assert.equal(result.captionText, INSTAGRAM_LONG_TITLE);
    assert.equal(result.transcriptText, undefined);
    assert.ok(result.warnings.some((w) => w.code === "CAPTION_UNAVAILABLE"));
  });

  it("import oEmbed success → metadata_only khi title ngắn", async () => {
    const importer = instagramImporterWithOEmbed({
      ok: true,
      title: INSTAGRAM_SHORT_TITLE,
      author: "@creator",
      thumbnailUrl: INSTAGRAM_THUMB,
    });
    const result = await importer.import(INSTAGRAM_URL);
    assert.equal(result.sourceQuality, "metadata_only");
    assert.equal(result.captionText, undefined);
    assert.equal(result.transcriptText, undefined);
    assert.ok(result.warnings.some((w) => w.code === "METADATA_ONLY"));
  });

  it("import oEmbed fail → blocked + LOGIN_REQUIRED, không throw", async () => {
    const importer = instagramImporterWithOEmbed({ ok: false, status: 403 });
    const result = await importer.import(INSTAGRAM_URL);
    assert.equal(result.sourceQuality, "blocked");
    assert.ok(result.warnings.some((w) => w.code === "LOGIN_REQUIRED"));
    assert.ok(result.warnings.some((w) => w.code === "PLATFORM_BLOCKED"));
  });

  it("import oEmbed 429 → blocked + RATE_LIMITED", async () => {
    const importer = instagramImporterWithOEmbed({ ok: false, status: 429 });
    const result = await importer.import(INSTAGRAM_URL);
    assert.ok(result.warnings.some((w) => w.code === "RATE_LIMITED"));
  });

  it("import URL Instagram không hợp lệ → manual_required", async () => {
    const importer = instagramImporterWithOEmbed({
      ok: true,
      title: INSTAGRAM_LONG_TITLE,
      author: null,
      thumbnailUrl: null,
    });
    const result = await importer.import(INSTAGRAM_INVALID_URL);
    assert.equal(result.sourceQuality, "manual_required");
    assert.ok(result.warnings.some((w) => w.code === "UNSUPPORTED_URL"));
  });
});

describe("FacebookImporter", () => {
  const importer = new FacebookImporter();

  it("canHandle nhận diện URL Facebook", () => {
    assert.equal(importer.canHandle(FACEBOOK_URL), true);
    assert.equal(importer.canHandle(OTHER_URL), false);
  });

  it("import trả manual_required", async () => {
    const result = await importer.import(FACEBOOK_URL);
    assert.equal(result.platform, "facebook");
    assert.equal(result.sourceQuality, "manual_required");
    assert.ok(result.warnings.some((warning) => warning.code === "UNSUPPORTED_URL"));
  });
});

describe("LinkedInImporter", () => {
  const importer = new LinkedInImporter();

  it("canHandle nhận diện URL LinkedIn", () => {
    assert.equal(importer.canHandle(LINKEDIN_URL), true);
    assert.equal(importer.canHandle(YOUTUBE_URL), false);
  });

  it("import trả manual_required", async () => {
    const result = await importer.import(LINKEDIN_URL);
    assert.equal(result.platform, "linkedin");
    assert.equal(result.sourceQuality, "manual_required");
  });
});

describe("UnknownUrlImporter", () => {
  const importer = new UnknownUrlImporter();

  it("canHandle luôn true", () => {
    assert.equal(importer.canHandle(OTHER_URL), true);
    assert.equal(importer.canHandle(YOUTUBE_URL), true);
  });

  it("import trả unknown và manual_required", async () => {
    const result = await importer.import(OTHER_URL);
    assert.equal(result.platform, "unknown");
    assert.equal(result.sourceQuality, "manual_required");
  });
});

describe("importSocialUrl registry", () => {
  it("registry có đúng 6 adapter theo thứ tự spec", () => {
    assert.equal(ADAPTERS.length, 6);
    assert.ok(ADAPTERS[0] instanceof YouTubeImporter);
    assert.ok(ADAPTERS[ADAPTERS.length - 1] instanceof UnknownUrlImporter);
  });

  it("importSocialUrl: YouTube là adapter đầu tiên khớp URL watch", () => {
    const first = ADAPTERS[0];
    assert.ok(first);
    assert.ok(first.canHandle(YOUTUBE_URL));
    assert.ok(first instanceof YouTubeImporter);
  });

  it("importSocialUrl fallback Unknown cho URL lạ", async () => {
    const result = await importSocialUrl(OTHER_URL);
    assert.equal(result.platform, "unknown");
  });
});
