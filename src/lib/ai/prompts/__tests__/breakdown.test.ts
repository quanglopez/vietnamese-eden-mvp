import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { buildBreakdownUserPrompt } from "@/lib/ai/prompts/breakdown";
import { METADATA_AUTO_MARKER } from "@/lib/content/analysis-source-quality";

describe("buildBreakdownUserPrompt", () => {
  it("thêm dòng nguồn dữ liệu khi có sourceQuality", () => {
    const prompt = buildBreakdownUserPrompt({
      title: "Video test",
      platform: "YouTube",
      rawContent: "Nội dung phân tích",
      sourceQuality: "metadata_only",
    });

    assert.match(prompt, /Nguồn dữ liệu phân tích: Metadata only/);
    assert.match(prompt, /metadata\/description/);
  });

  it("không thêm dòng nguồn khi sourceQuality null", () => {
    const prompt = buildBreakdownUserPrompt({
      title: "Video test",
      platform: "YouTube",
      rawContent: "Nội dung phân tích",
      sourceQuality: null,
    });

    assert.doesNotMatch(prompt, /Nguồn dữ liệu phân tích:/);
  });

  it("giữ marker metadata trong rawContent (tương thích ALE-158)", () => {
    const rawContent = `${METADATA_AUTO_MARKER} — test\n\nTiêu đề: Demo`;
    const prompt = buildBreakdownUserPrompt({
      title: "Demo",
      platform: "YouTube",
      rawContent,
      sourceQuality: "metadata_only",
    });

    assert.ok(prompt.includes(METADATA_AUTO_MARKER));
  });
});
