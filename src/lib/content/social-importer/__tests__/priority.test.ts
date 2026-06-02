import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { pickAnalysisInput } from "@/lib/content/social-importer/priority";
import type { SocialImportResult } from "@/lib/content/social-importer/types";

function baseResult(
  overrides: Partial<SocialImportResult> = {},
): SocialImportResult {
  return {
    platform: "youtube",
    sourceUrl: "https://www.youtube.com/watch?v=test",
    sourceQuality: "metadata_only",
    warnings: [],
    fetchedAt: new Date().toISOString(),
    ...overrides,
  };
}

describe("pickAnalysisInput", () => {
  it("ưu tiên transcript hơn caption, paste và metadata", () => {
    const result = pickAnalysisInput(
      baseResult({
        transcriptText: "a".repeat(100),
        captionText: "caption đủ dài ".repeat(10),
        metadataText: "Tiêu đề: Demo",
        title: "Demo",
      }),
      "paste text đủ dài ".repeat(10),
    );

    assert.equal(result.quality, "transcript");
    assert.equal(result.input?.length, 100);
  });

  it("ưu tiên caption khi không có transcript đủ dài", () => {
    const caption = `caption đủ dài cho phân tích AI. ${"x".repeat(40)}`;
    const result = pickAnalysisInput(
      baseResult({
        transcriptText: "ngắn",
        captionText: caption,
      }),
      null,
    );

    assert.equal(result.quality, "caption");
    assert.equal(result.input, caption);
  });

  it("ưu tiên paste text hơn metadata", () => {
    const paste = `nội dung paste đủ dài từ user. ${"y".repeat(40)}`;
    const result = pickAnalysisInput(
      baseResult({
        title: "Chỉ có tiêu đề",
      }),
      paste,
    );

    assert.equal(result.quality, "paste_text");
    assert.equal(result.input, paste);
  });

  it("dùng metadata khi chỉ có title/author", () => {
    const result = pickAnalysisInput(
      baseResult({
        title: "Video hay",
        author: "Kênh ABC",
      }),
      null,
    );

    assert.equal(result.quality, "metadata_only");
    assert.match(result.input ?? "", /Video hay/);
    assert.match(result.input ?? "", /Kênh ABC/);
  });

  it("trả manual_required và UNSUPPORTED_URL khi không có nguồn nào", () => {
    const result = pickAnalysisInput(baseResult(), null);

    assert.equal(result.quality, "manual_required");
    assert.equal(result.input, null);
    assert.ok(
      result.warnings.some((warning) => warning.code === "UNSUPPORTED_URL"),
    );
  });

  it("transcript ngắn hơn 100 ký tự rơi xuống caption", () => {
    const caption = `caption đủ dài vượt ngưỡng 50 ký tự. ${"z".repeat(40)}`;
    const result = pickAnalysisInput(
      baseResult({
        transcriptText: "quá ngắn",
        captionText: caption,
      }),
      null,
    );

    assert.equal(result.quality, "caption");
    assert.equal(result.input, caption);
  });

  it("caption ngắn hơn 50 ký tự rơi xuống paste text", () => {
    const paste = "paste đủ dài từ tab Paste text của user trên board";
    const result = pickAnalysisInput(
      baseResult({
        captionText: "ngắn",
      }),
      paste,
    );

    assert.equal(result.quality, "paste_text");
    assert.equal(result.input, paste);
  });

  it("metadata một phần nhưng không đủ → METADATA_ONLY warning", () => {
    const result = pickAnalysisInput(
      baseResult({
        author: "Kênh demo",
      }),
      null,
    );

    assert.equal(result.quality, "manual_required");
    assert.ok(
      result.warnings.some((warning) => warning.code === "METADATA_ONLY"),
    );
  });
});
