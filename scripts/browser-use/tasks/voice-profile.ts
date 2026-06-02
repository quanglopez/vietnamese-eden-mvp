// Task: Voice Profile — Voice selector renders
// ALE-160 smoke task. No production impact.

import type { Page } from "@playwright/test";
import type { SmokeContext, SmokeResult, SmokeStep } from "../types";

export default async function runVoiceProfile(context: SmokeContext): Promise<SmokeResult> {
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

    await step("Navigate voice profile", async () => {
      await page.click('[data-testid="nav-voice-profile"], [data-testid="settings-link"]');
      await page.waitForSelector('[data-testid="voice-selector"]', { timeout: 10_000 });
    });

    await step("Voice options visible", async () => {
      const voices = page.locator('[data-testid="voice-option"]');
      const count = await voices.count();
      if (count === 0) throw new Error("No voice options found");
    });
  } catch {
    // fail fast
  }

  const allPass = steps.every((s) => s.status === "PASS");
  return { taskName: "voice-profile", status: allPass ? "PASS" : "FAIL", steps, durationMs: Date.now() - t0,
    summary: allPass ? "Voice selector renders"
      : "Voice Profile FAIL: " + steps.filter((s) => s.status === "FAIL").map((s) => s.name).join(", "),
  };
}
