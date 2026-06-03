// Task: Auth — Login test account and verify dashboard redirect
// ALE-160 smoke task. No production impact.

import type { Page } from "@playwright/test";
import type { SmokeContext, SmokeResult, SmokeStep } from "../types";

export default async function runAuth(context: SmokeContext): Promise<SmokeResult> {
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
    await step("Navigate /login", async () => {
      await page.goto(c.baseUrl + "/login", { waitUntil: "networkidle" });
      await page.waitForSelector('input[type="email"]', { timeout: 10_000 });
    });

    await step("Fill credentials", async () => {
      await page.fill('input[type="email"]', c.testEmail);
      await page.fill('input[type="password"]', c.testPassword);
    });

    await step("Submit login", async () => {
      await page.click('button:has-text("Đăng nhập")');
      await page.waitForURL(/\/(dashboard|boards)/, { timeout: 15_000 });
    });

    await step("Verify session", async () => {
      const cookies = await page.context().cookies();
      const hasSession = cookies.some(
        (cookie) => cookie.name.includes("sb-") || cookie.name === "supabase-auth-token"
      );
      if (!hasSession) throw new Error("No auth session cookie found");
    });
  } catch {
    // fail fast; screenshot handled by runner
  }

  const allPass = steps.every((s) => s.status === "PASS");
  return {
    taskName: "auth",
    status: allPass ? "PASS" : "FAIL",
    steps,
    durationMs: Date.now() - t0,
    summary: allPass
      ? "Login OK → dashboard, session cookie set"
      : "Login FAIL: " + steps.filter((s) => s.status === "FAIL").map((s) => s.name).join(", "),
  };
}
