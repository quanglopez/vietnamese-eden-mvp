// Task: Board — Verify dashboard loads, content cards exist
// ALE-160 smoke task. No production impact.

import type { Page } from "@playwright/test";
import type { SmokeContext, SmokeResult, SmokeStep } from "../types";

export default async function runBoard(context: SmokeContext): Promise<SmokeResult> {
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
    await step("Navigate /dashboard", async () => {
      await page.goto(c.baseUrl + "/dashboard", { waitUntil: "networkidle" });
      await page.waitForSelector('[data-testid="content-grid-card"]', { timeout: 10_000 });
    });

    await step("Cards visible", async () => {
      const cards = page.locator('[data-testid="content-grid-card"]');
      const count = await cards.count();
      if (count === 0) throw new Error("No content cards found");
    });

    await step("Search input renders", async () => {
      await page.waitForSelector('[data-testid="content-search-input"]', { timeout: 5_000 });
    });
  } catch {
    // fail fast
  }

  const allPass = steps.every((s) => s.status === "PASS");
  return {
    taskName: "board",
    status: allPass ? "PASS" : "FAIL",
    steps,
    durationMs: Date.now() - t0,
    summary: allPass
      ? "Dashboard loads, cards and search rendered"
      : "Board FAIL: " + steps.filter((s) => s.status === "FAIL").map((s) => s.name).join(", "),
  };
}
