// Task: Remix — Remix button generates output, no CJK leakage
// ALE-160 smoke task. No production impact.

import type { Page } from "@playwright/test";
import type { SmokeContext, SmokeResult, SmokeStep } from "../types";

export default async function runRemix(context: SmokeContext): Promise<SmokeResult> {
  const steps: SmokeStep[] = [];
  const page: Page = context.page;
  const c = context.config;
  const t0 = Date.now();

  async function step(name: string, fn: () => Promise<void>): Promise<void> {
    const s0 = Date.now();
    try {
      await fn();
      steps.push({ name, status: "PASS", durationMs: Date.now() - s0 });
      context.log("PASS " + name);
    } catch (err) {
      const error = err instanceof Error ? err.message : String(err);
      steps.push({ name, status: "FAIL", durationMs: Date.now() - s0, error });
      context.log("FAIL " + name + ": " + error);
      throw err;
    }
  }

  try {
    await step("Login", async () => {
      await page.goto(c.baseUrl + "/login", { waitUntil: "networkidle" });
      await page.fill('[data-testid="login-email"]', c.testEmail);
      await page.fill('[data-testid="login-password"]', c.testPassword);
      await page.click('[data-testid="login-submit"]');
      await page.waitForURL(/\/(dashboard|dashboards)/, { timeout: 15_000 });
    });

    await step("Remix button visible", async () => {
      await page.waitForSelector('[data-testid="remix-button"]', { timeout: 10_000 });
    });

    await step("Generate remix", async () => {
      await page.click('[data-testid="remix-button"]');
      await page.click('[data-testid="remix-variant-facebook"]');
      await page.waitForSelector('[data-testid="remix-output"]', { timeout: 20_000 });
    });

    await step("No CJK in output", async () => {
      const text = await page.locator('[data-testid="remix-output"]').innerText();
      const hasCJK = /[\u3040-\u312F\u3400-\u4DBF\u4E00-\u9FFF]/.test(text);
      if (hasCJK) throw new Error("CJK characters detected in remix output");
    });

    await step("Title not generic", async () => {
      const title = await page.locator('[data-testid="remix-title"]').innerText();
      const generic = /ti\u00Eau \u0111\u1EC1|title|v\u1EBB \u0111\u1EB9p|m\u1EA3nh|generic/i;
      if (generic.test(title)) throw new Error("Remix title appears generic: " + title);
    });
  } catch {
    // fail fast
  }

  const allPass = steps.every((s) => s.status === "PASS");
  return { taskName: "remix", status: allPass ? "PASS" : "FAIL", steps, durationMs: Date.now() - t0,
    summary: allPass ? "Remix generates, no CJK, title specific"
      : "Remix FAIL: " + steps.filter((s) => s.status === "FAIL").map((s) => s.name).join(", "),
  };
}
