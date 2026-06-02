// Task: AI Breakdown — Paste text + analyze renders blue badge
// ALE-160 smoke task. No production impact.

import type { Page } from "@playwright/test";
import type { SmokeContext, SmokeResult, SmokeStep } from "../types";

export default async function runAiBreakdown(context: SmokeContext): Promise<SmokeResult> {
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

    await step("Open add content", async () => {
      await page.click('[data-testid="add-content-button"]');
      await page.waitForSelector('[data-testid="paste-text-tab"]', { timeout: 5_000 });
    });

    await step("Paste content text", async () => {
      await page.click('[data-testid="paste-text-tab"]');
      await page.fill('[data-testid="paste-textarea"]', "Hook: đẹp tự nhiên không cần makeup. Angle: skincare routine buổi sáng.");
      await page.fill('[data-testid="content-title-input"]', "Smoke AI Breakdown ALE-160");
      await page.click('[data-testid="save-content-button"]');
      await page.waitForSelector('[data-testid="content-grid-card"]', { timeout: 10_000 });
    });

    await step("Open breakdown", async () => {
      await page.click('[data-testid="content-grid-card"]:has-text("Smoke AI Breakdown") [data-testid="analyze-button"]');
      await page.waitForSelector('[data-testid="breakdown-section"]', { timeout: 30_000 });
    });

    await step("Badge blue (Paste text)", async () => {
      const badge = page.locator('[data-testid="source-quality-badge"]').filter({ hasText: /caption|Paste.text/i });
      await badge.waitFor({ timeout: 5_000 });
      const classes = await badge.evaluate((el: unknown) => (el as HTMLElement).className);
      if (!classes.includes("blue")) throw new Error("Expected blue badge for paste text");
    });
  } catch {
    // fail fast
  }

  const allPass = steps.every((s) => s.status === "PASS");
  return { taskName: "ai-breakdown", status: allPass ? "PASS" : "FAIL", steps, durationMs: Date.now() - t0,
    summary: allPass ? "Paste text → AI breakdown renders with blue badge"
      : "AI Breakdown FAIL: " + steps.filter((s) => s.status === "FAIL").map((s) => s.name).join(", "),
  };
}
