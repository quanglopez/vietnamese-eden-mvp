import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  resolveCanonicalYouTubeUrl,
  YouTubeImporter,
} from "@/lib/content/social-importer/adapters/youtube";
import {
  extractYouTubeVideoId,
  getYouTubeThumbnailUrl,
} from "@/lib/content/url-metadata";
import type { UrlEmbedMetadata } from "@/lib/content/url-metadata";

const VIDEO_ID = "dQw4w9WgXcQ";
const CANONICAL = `https://www.youtube.com/watch?v=${VIDEO_ID}`;
const THUMB = `https://img.youtube.com/vi/${VIDEO_ID}/hqdefault.jpg`;

const URL_FORMS = [
  `https://www.youtube.com/watch?v=${VIDEO_ID}`,
  `https://youtu.be/${VIDEO_ID}`,
  `https://www.youtube.com/shorts/${VIDEO_ID}`,
  `https://www.youtube.com/embed/${VIDEO_ID}`,
] as const;

const MOCK_META: UrlEmbedMetadata = {
  title: "Never Gonna Give You Up",
  author: "Rick Astley",
  description: null,
  thumbnailUrl: THUMB,
};

function importerWithMeta(meta: UrlEmbedMetadata | null) {
  return new YouTubeImporter({
    fetchMetadata: async () => meta,
    transcriptFetcher: {
      fetchTranscript: async () => null,
    },
  });
}

describe("YouTube URL parsing (helpers)", () => {
  it("bốn dạng URL trích cùng video ID", () => {
    for (const url of URL_FORMS) {
      assert.equal(extractYouTubeVideoId(url), VIDEO_ID, url);
    }
  });

  it("bốn dạng URL chuẩn hóa về watch?v=", () => {
    for (const url of URL_FORMS) {
      assert.equal(resolveCanonicalYouTubeUrl(url), CANONICAL, url);
    }
  });

  it("thumbnail ổn định theo video ID", () => {
    assert.equal(getYouTubeThumbnailUrl(VIDEO_ID), THUMB);
  });
});

describe("YouTubeImporter.import (mock, không HTTP)", () => {
  it("trả metadata_only với title, author, thumbnail, canonical", async () => {
    const importer = importerWithMeta(MOCK_META);
    const result = await importer.import(URL_FORMS[0]);

    assert.equal(result.platform, "youtube");
    assert.equal(result.sourceQuality, "metadata_only");
    assert.equal(result.canonicalUrl, CANONICAL);
    assert.equal(result.title, MOCK_META.title);
    assert.equal(result.author, MOCK_META.author);
    assert.equal(result.thumbnailUrl, THUMB);
    assert.equal(result.transcriptText, undefined);
    assert.ok(result.metadataText?.includes("Tiêu đề:"));
    assert.ok(result.analysisInput?.includes("Metadata tự động từ link"));
    assert.ok(result.analysisInput?.includes(CANONICAL));
  });

  it("cảnh báo METADATA_ONLY và TRANSCRIPT_UNAVAILABLE khi không có transcript", async () => {
    const importer = importerWithMeta(MOCK_META);
    const result = await importer.import(URL_FORMS[1]);

    assert.ok(result.warnings.some((w) => w.code === "METADATA_ONLY"));
    assert.ok(result.warnings.some((w) => w.code === "TRANSCRIPT_UNAVAILABLE"));
  });

  it("oEmbed thất bại vẫn có thumbnail từ video ID", async () => {
    const importer = importerWithMeta(null);
    const result = await importer.import(
      `https://www.youtube.com/shorts/${VIDEO_ID}`,
    );

    assert.equal(result.sourceQuality, "metadata_only");
    assert.equal(result.thumbnailUrl, THUMB);
    assert.equal(result.canonicalUrl, CANONICAL);
    assert.ok(result.warnings.some((w) => w.code === "METADATA_ONLY"));
  });

  it("URL YouTube không parse được → manual_required", async () => {
    const importer = importerWithMeta(MOCK_META);
    const badUrl = "https://www.youtube.com/watch";
    const result = await importer.import(badUrl);

    assert.equal(result.sourceQuality, "manual_required");
    assert.ok(result.warnings.some((w) => w.code === "UNSUPPORTED_URL"));
  });

  it("transcript từ fetcher mock chỉ gán khi đủ dài (≥100 ký tự)", async () => {
    const short = "a".repeat(50);
    const long = "b".repeat(100);

    const shortImporter = new YouTubeImporter({
      fetchMetadata: async () => MOCK_META,
      transcriptFetcher: { fetchTranscript: async () => short },
    });
    const shortResult = await shortImporter.import(URL_FORMS[0]);
    assert.equal(shortResult.transcriptText, undefined);

    const longImporter = new YouTubeImporter({
      fetchMetadata: async () => MOCK_META,
      transcriptFetcher: { fetchTranscript: async () => long },
    });
    const longResult = await longImporter.import(URL_FORMS[0]);
    assert.equal(longResult.transcriptText, long);
    assert.ok(
      !longResult.warnings.some((w) => w.code === "TRANSCRIPT_UNAVAILABLE"),
    );
  });
});
