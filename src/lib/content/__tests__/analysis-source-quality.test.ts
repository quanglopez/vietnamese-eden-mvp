import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  getSourceQualityDescription,
  getSourceQualityFromItem,
  getSourceQualityLabel,
  METADATA_AUTO_MARKER,
} from "@/lib/content/analysis-source-quality";
import type { PlatformType } from "@/types/content";

const LONG_PASTE = "a".repeat(100);

function item(
  overrides: Partial<{
    rawContent: string | null;
    sourceUrl: string | null;
    platform: PlatformType;
  }> = {},
) {
  return {
    rawContent: null as string | null,
    sourceUrl: null as string | null,
    platform: "youtube" as PlatformType,
    ...overrides,
  };
}

describe("getSourceQualityFromItem", () => {
  it("paste_text: rawContent đủ dài và không có sourceUrl", () => {
    assert.equal(
      getSourceQualityFromItem(item({ rawContent: LONG_PASTE, sourceUrl: null })),
      "paste_text",
    );
  });

  it("metadata_only: có sourceUrl và rawContent chứa marker metadata", () => {
    const raw = `${METADATA_AUTO_MARKER} — test\n\nTiêu đề: Demo`;
    assert.equal(
      getSourceQualityFromItem(
        item({ sourceUrl: "https://youtube.com/watch?v=x", rawContent: raw }),
      ),
      "metadata_only",
    );
  });

  it("metadata_only: có sourceUrl và rawContent rỗng", () => {
    assert.equal(
      getSourceQualityFromItem(
        item({ sourceUrl: "https://youtube.com/watch?v=x", rawContent: null }),
      ),
      "metadata_only",
    );
  });

  it("blocked: TikTok có URL, không có rawContent", () => {
    assert.equal(
      getSourceQualityFromItem(
        item({
          platform: "tiktok",
          sourceUrl: "https://tiktok.com/@u/video/1",
          rawContent: null,
        }),
      ),
      "blocked",
    );
  });

  it("blocked: Instagram có URL, rawContent rỗng", () => {
    assert.equal(
      getSourceQualityFromItem(
        item({
          platform: "instagram",
          sourceUrl: "https://instagram.com/reel/abc",
          rawContent: "   ",
        }),
      ),
      "blocked",
    );
  });

  it("manual_required: không URL và không rawContent", () => {
    assert.equal(
      getSourceQualityFromItem(item({ sourceUrl: null, rawContent: null })),
      "manual_required",
    );
  });

  it("paste_text thắng metadata_only khi text dài không có marker dù có URL", () => {
    const pasted = `${LONG_PASTE} nội dung user dán thủ công không qua enrich`;
    assert.equal(
      getSourceQualityFromItem(
        item({
          sourceUrl: "https://youtube.com/watch?v=x",
          rawContent: pasted,
        }),
      ),
      "paste_text",
    );
  });
});

describe("getSourceQualityLabel", () => {
  it("ánh xạ đúng nhãn tiếng Việt", () => {
    assert.equal(getSourceQualityLabel("paste_text"), "Paste text");
    assert.equal(getSourceQualityLabel("metadata_only"), "Metadata only");
    assert.equal(getSourceQualityLabel("blocked"), "Cần dán thủ công");
    assert.equal(getSourceQualityLabel("transcript"), "Transcript đầy đủ");
  });
});

describe("getSourceQualityDescription", () => {
  it("metadata_only và blocked có mô tả; paste_text null", () => {
    assert.ok(getSourceQualityDescription("metadata_only"));
    assert.ok(getSourceQualityDescription("blocked"));
    assert.equal(getSourceQualityDescription("paste_text"), null);
    assert.equal(getSourceQualityDescription("transcript"), null);
  });
});
