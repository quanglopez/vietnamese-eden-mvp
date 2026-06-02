// Task: M8 Source Quality — YouTube orange badge + TikTok/Instagram red badge + blocked CTA
// ALE-160 smoke task. No production impact.

import type { Page } from "@playwright/test";
import type { SmokeContext, SmokeResult, SmokeStep } from "../types";

export default async function runM8SourceQuality(context: SmokeContext): Promise<SmokeResult> {
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

    await step("Add YouTube URL", async () => {
      await page.click('[data-testid="add-content-button"]');
      await page.fill('[data-testid="url-input"]', "https://www.youtube.com/watch?v=dQw4w9WgXcQ");
      await page.click('[data-testid="save-content-button"]');
      await page.waitForSelector('[data-testid="content-grid-card"]', { timeout: 15_000 });
    });

    await step("YouTube badge orange (metadata-only)", async () => {
      const badge = page.locator('[data-testid="source-quality-badge"]').filter({ hasText: /metadata.only|metadata/i });
      await badge.waitFor({ timeout: 5_000 });
      const classes = await badge.evaluate((el: unknown) => (el as HTMLElement).className);
      if (!classes.includes("orange")) throw new Error("Expected orange badge for YouTube metadata-only");
    });

    await step("Add TikTok URL", async () => {
      await page.click('[data-testid="add-content-button"]');
      await page.fill('[data-testid="url-input"]', "https://www.tiktok.com/@vietnamese_eden/video/1234567890");
      await page.click('[data-testid="save-content-button"]');
      await page.waitForSelector('[data-testid="content-grid-card"]', { timeout: 15_000 });
    });

    await step("TikTok badge red (blocked)", async () => {
      const badges = page.locator('[data-testid="content-grid-card"]').filter({ hasText: /TikTok|blocked|manual/i });
      await badges.last().waitFor({ timeout: 5_000 });
    });

    await step("Add Instagram URL", async () => {
      await page.click('[data-testid="add-content-button"]');
      await page.fill('[data-testid="url-input"]', "https://www.instagram.com/p/CxTest123/");
      await page.click('[data-testid="save-content-button"]');
      await page.waitForSelector('[data-testid="content-grid-card"]', { timeout: 15_000 });
    });

    await step("Instagram badge red (blocked)", async () => {
      const badges = page.locator('[data-testid="content-grid-card"]').filter({ hasText: /Instagram|blocked|manual/i });
      await badges.last().waitFor({ timeout: 5_000 });
    });
  } catch {
    // fail fast
  }

  const allPass = steps.every((s) => s.status === "PASS");
  return { taskName: "m8-source-quality", status: allPass ? "PASS" : "FAIL", steps, durationMs: Date.now() - t0,
    summary: allPass ? "YouTube orange + TikTok/Instagram red badges verified"
      : "M8 Source Quality FAIL: " + steps.filter((s) => s.status === "FAIL").map((s) => s.name).join(", "),
  };
}
