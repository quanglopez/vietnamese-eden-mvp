import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";

import { isPricingEnabled } from "@/lib/pricing/feature-flag";

const original = process.env.NEXT_PUBLIC_PRICING_ENABLED;

afterEach(() => {
  if (original === undefined) {
    delete process.env.NEXT_PUBLIC_PRICING_ENABLED;
  } else {
    process.env.NEXT_PUBLIC_PRICING_ENABLED = original;
  }
});

describe("isPricingEnabled", () => {
  it("returns false when unset", () => {
    delete process.env.NEXT_PUBLIC_PRICING_ENABLED;
    assert.equal(isPricingEnabled(), false);
  });

  it("returns false when explicitly false", () => {
    process.env.NEXT_PUBLIC_PRICING_ENABLED = "false";
    assert.equal(isPricingEnabled(), false);
  });

  it("returns true only when exactly true", () => {
    process.env.NEXT_PUBLIC_PRICING_ENABLED = "true";
    assert.equal(isPricingEnabled(), true);
  });
});
