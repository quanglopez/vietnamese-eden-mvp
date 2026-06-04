import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { getAiHealthStatus } from "@/lib/ai/health-check";
import { mapAiProviderError } from "@/lib/ai/error-messages";
import { AiProviderError } from "@/lib/ai/errors";
import { buildRateLimitMessage, calculateRetryAfterSeconds, RATE_LIMITS } from "@/lib/ai/rate-limit";

describe("getAiHealthStatus", () => {
  it("returns config-level readiness without exposing env values", () => {
    const result = getAiHealthStatus({
      AI_PROVIDER: "openai",
      AI_MODEL: "gpt-4o-mini",
      OPENAI_API_KEY: "sk-secret-value",
      OPENAI_BASE_URL: "https://example.test/v1",
    });

    assert.equal(result.ok, true);
    assert.equal(result.provider, "configured");
    assert.equal(result.kind, "openai");
    assert.equal(result.model, "gpt-4o-mini");
    assert.equal(JSON.stringify(result).includes("sk-secret-value"), false);
    assert.equal(JSON.stringify(result).includes("example.test"), false);
  });

  it("marks missing provider config as not ready", () => {
    const result = getAiHealthStatus({ AI_PROVIDER: "xiaomi" });

    assert.equal(result.ok, false);
    assert.equal(result.provider, "missing_config");
    assert.equal(result.kind, "xiaomi");
  });
});

describe("mapAiProviderError", () => {
  it("maps provider 5xx errors without leaking raw body", () => {
    const message = mapAiProviderError(
      new AiProviderError("Provider error 500: {\"token\":\"secret\",\"body\":\"raw\"}", "provider_error"),
      "phân tích",
    );

    assert.match(message, /AI đang quá tải|Máy chủ AI/);
    assert.equal(message.includes("secret"), false);
    assert.equal(message.includes("raw"), false);
  });

  it("maps rate limit errors with retry guidance", () => {
    const message = mapAiProviderError(
      new AiProviderError("429 Too Many Requests", "provider_error"),
      "remix",
    );

    assert.match(message, /quá nhiều yêu cầu/i);
    assert.match(message, /thử lại/i);
  });
});

describe("rate-limit helpers", () => {
  it("calculates retry-after from oldest request in the active window", () => {
    const now = new Date("2026-06-04T00:05:00.000Z");
    const oldest = new Date("2026-06-04T00:01:00.000Z");

    assert.equal(calculateRetryAfterSeconds(oldest, RATE_LIMITS.breakdown.windowMinutes, now), 60);
  });

  it("builds Vietnamese retry guidance", () => {
    const message = buildRateLimitMessage("voice", 125);

    assert.match(message, /giọng văn/);
    assert.match(message, /3 phút/);
  });
});
