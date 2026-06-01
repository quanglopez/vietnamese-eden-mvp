import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { containsNonVietnameseTokens } from "@/lib/ai/quality/language-leak";

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
