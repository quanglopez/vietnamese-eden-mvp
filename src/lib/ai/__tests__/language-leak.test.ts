import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { assertBreakdownNoNonVietnamese } from "@/lib/ai/json";
import { BreakdownContentError } from "@/lib/ai/errors";
import { containsNonVietnameseTokens } from "@/lib/ai/quality/language-leak";
import type { BreakdownAnalysisResult } from "@/lib/ai/prompts/breakdown";

describe("containsNonVietnameseTokens", () => {
  it("từ chối token tiếng Bồ Đào Nha pontos", () => {
    const result = containsNonVietnameseTokens(
      "Viết bằng tiếng Việt có token pontos ở giữa",
    );
    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.ok(result.tokens.includes("pontos"));
      assert.match(result.reason, /pontos/i);
    }
  });

  it("chấp nhận thuật ngữ Anh AI", () => {
    const result = containsNonVietnameseTokens("Video này dùng AI để edit");
    assert.equal(result.ok, true);
  });

  it("chấp nhận từ Marketing tiếng Anh", () => {
    const result = containsNonVietnameseTokens("Marketing cho người mới");
    assert.equal(result.ok, true);
  });

  it("chấp nhận câu tiếng Việt thuần", () => {
    const result = containsNonVietnameseTokens("Học cách làm giàu nhanh chóng");
    assert.equal(result.ok, true);
  });

  it("từ chối câu tiếng Tây Ban Nha", () => {
    const result = containsNonVietnameseTokens("El problema es muy simple");
    assert.equal(result.ok, false);
  });

  it("từ chối câu tiếng Pháp", () => {
    const result = containsNonVietnameseTokens("Cette solution est très simple");
    assert.equal(result.ok, false);
  });

  it("từ chối ký tự CJK", () => {
    const result = containsNonVietnameseTokens("Đây là một 东西 trong content");
    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.ok(result.tokens.includes("CJK"));
    }
  });

  it("chấp nhận chuỗi rỗng", () => {
    const result = containsNonVietnameseTokens("");
    assert.equal(result.ok, true);
  });
});

describe("assertBreakdownNoNonVietnamese", () => {
  const validBreakdown: BreakdownAnalysisResult = {
    hook: "Hook tiếng Việt dùng AI marketing",
    angle: "Góc chia sẻ thực chiến",
    structure: "1. Mở đầu\n2. Nội dung\n3. CTA",
    cta: "Comment để nhận checklist",
    emotion: "Tò mò",
    target_audience: "Creator Việt Nam",
    why_it_works: "Công thức quen thuộc trên video ngắn",
    remix_suggestions: ["Đổi hook sang số liệu", "Thêm proof social"],
  };

  it("chấp nhận breakdown tiếng Việt hợp lệ", () => {
    assert.doesNotThrow(() => assertBreakdownNoNonVietnamese(validBreakdown));
  });

  it("từ chối breakdown có pontos trong why_it_works", () => {
    assert.throws(
      () =>
        assertBreakdownNoNonVietnamese({
          ...validBreakdown,
          why_it_works: "Video hay vì tích lũy pontos uy tín",
        }),
      BreakdownContentError,
    );
  });
});
