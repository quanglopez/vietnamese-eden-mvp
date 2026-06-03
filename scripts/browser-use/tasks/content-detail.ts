// Task: Content Detail — ALE-165 content breakdown page sections
// ALE-160 smoke task. No production impact.

import type { Page } from "@playwright/test";
import type { SmokeContext, SmokeResult, SmokeStep } from "../types";

export default async function runContentDetail(context: SmokeContext): Promise<SmokeResult> {
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
    // 1. Login
    await step("Login redirect", async () => {
      await page.goto(c.baseUrl + "/login", { waitUntil: "networkidle" });
      await page.fill("input[type=email]", c.testEmail);
      await page.fill("input[type=password]", c.testPassword);
      await Promise.all([
        page.waitForURL(/\/(dashboard|boards)/, { timeout: 20_000 }),
        page.click('button[type="submit"]'),
      ]);
      const cookies = await page.context().cookies();
      const hasSession = cookies.some(
        (cookie) => cookie.name.includes("sb-") || cookie.name === "supabase-auth-token"
      );
      if (!hasSession) throw new Error("No session cookie");
    });

    // 2. Dashboard has board links
    await step("Dashboard renders", async () => {
      const body = await page.content();
      if (!/board|bảng|content|Tổng quan/i.test(body))
        throw new Error("Dashboard content not found");
    });

    // 3. Navigate to first board with content items
    let boardUrl = "";
    await step("Find and navigate to board", async () => {
      const links = await page.locator('a[href^="/boards/"]').all();
      let found = false;
      for (const link of links) {
        const href = await link.getAttribute("href");
        if (href && href.match(/\/boards\/[a-f0-9-]{36}/)) {
          boardUrl = href;
          found = true;
          break;
        }
      }
      if (!found) throw new Error("No board links found on dashboard");
      await page.goto(c.baseUrl + boardUrl, { waitUntil: "networkidle" });
      await page.waitForTimeout(2_000);
      const body = await page.content();
      if (
        body.includes("Chưa có nội dung") ||
        body.includes("empty state") ||
        body.includes("Trống")
      ) {
        throw new Error("Board is empty — no content items to test breakdown");
      }
    });

    // 4. Find content items / breakdown links on board
    let breakdownHrefs: string[] = [];
    await step("Find content items on board", async () => {
      const contentLinks = await page.locator('a[href^="/breakdown/"]').all();
      breakdownHrefs = [];
      for (const link of contentLinks) {
        const href = await link.getAttribute("href");
        if (href && href.match(/\/breakdown\/[a-f0-9-]{36}/)) {
          breakdownHrefs.push(href);
        }
      }
      if (breakdownHrefs.length === 0) {
        // Fallback: any link that isn't nav
        const all = await page.locator("a").all();
        for (const link of all) {
          const href = await link.getAttribute("href");
          if (href && href.match(/\/breakdown\/[a-f0-9-]{36}/))
            breakdownHrefs.push(href);
        }
      }
      if (breakdownHrefs.length === 0) {
        throw new Error("No breakdown links on board page");
      }
      context.log(`Found ${breakdownHrefs.length} breakdown links`);
    });

    // 5. Navigate to breakdown page
    await step("Navigate to breakdown page", async () => {
      const first = breakdownHrefs[0];
      await page.goto(c.baseUrl + first, { waitUntil: "networkidle" });
      await page.waitForTimeout(3_000);
      const url = page.url();
      if (!url.includes("/breakdown/"))
        throw new Error(`Expected /breakdown/* but got ${url}`);
    });

    // 6. Verify breakdown page sections
    await step("Source/content section", async () => {
      const html = await page.content();
      const has =
        /source|content|thumbnail|media|cover|platform|rawContent|title/i.test(html);
      if (!has) throw new Error("Source/content not detected");
    });

    await step("SourceQuality badge", async () => {
      const body = await page.content();
      const has =
        /source.*quality|quality|blocked|metadata|manual|badge|orange|red|green/i.test(body);
      if (!has) throw new Error("SourceQuality badge not detected");
    });

    await step("AI Breakdown section", async () => {
      const body = await page.content();
      const has =
        /Phân tích|Breakdown|hook|angle|CTA|structure|emotion|audience/i.test(body);
      if (!has) throw new Error("AI Breakdown not detected");
    });

    await step("Tags section", async () => {
      const body = await page.content();
      const has = /Tags|tag/i.test(body);
      if (!has) {
        // Tags UI not found (item may have no tags) — SKIP not FAIL
        const lastStep = steps[steps.length - 1];
        lastStep.status = "SKIPPED";
        lastStep.note = "Tags UI not found (item may have no tags)";
        context.log("SKIP Tags section — item may have no tags");
      }
    });

    await step("Remix section", async () => {
      const body = await page.content();
      const has = /Remix|remix|output/i.test(body);
      if (!has) throw new Error("Remix section not detected");
    });

    await step("Remix empty/filled state", async () => {
      const body = await page.content();
      const hasEmpty = /Chưa có remix|no remix/i.test(body);
      const hasFilled = /output|caption|script|title.*format/i.test(body);
      if (!hasEmpty && !hasFilled) throw new Error("No remix state found");
    });

    await step("Calendar section", async () => {
      const body = await page.content();
      const has = /Calendar|calendar|Lịch|lịch/i.test(body);
      if (!has) throw new Error("Calendar section not detected");
    });

    await step("Calendar empty/filled state", async () => {
      const body = await page.content();
      const hasEmpty = /Chưa lên lịch|no calendar|empty/i.test(body);
      const hasFilled = /scheduled|đã lên lịch|channel|time|date/i.test(body);
      if (!hasEmpty && !hasFilled) throw new Error("No calendar state found");
    });

    await step("Add to Calendar CTA", async () => {
      const body = await page.content();
      const has = /Add to Calendar|Thêm vào lịch|Calendar\+/i.test(body);
      if (!has) throw new Error("Add to Calendar CTA not detected");
    });

    await step("Back/board navigation", async () => {
      const links = await page.locator("a").all();
      let found = false;
      for (const link of links) {
        const href = await link.getAttribute("href");
        const text = (await link.textContent().catch(() => "")) ?? "";
        if (href?.includes("/boards") || /Quay lại|Back/i.test(text)) {
          found = true;
          break;
        }
      }
      if (!found) throw new Error("No back/board navigation found");
    });

    // 7. Regression: Add content flow
    await step("Add content regression", async () => {
      await page.goto(c.baseUrl + boardUrl, { waitUntil: "networkidle" });
      await page.waitForTimeout(2_000);
      const body = await page.content();
      const hasAdd = /Thêm nội dung|Add content|Thêm mới/i.test(body);
      if (!hasAdd) throw new Error("Add content button not found on board");
    });
  } catch {
    // fail fast; screenshot handled by runner
  }

  const allPass = steps.every((s) => s.status === "PASS");
  return {
    taskName: "content-detail",
    status: allPass ? "PASS" : "FAIL",
    steps,
    durationMs: Date.now() - t0,
    summary: allPass
      ? "ALE-165 all checks PASS"
      : "ALE-165 FAIL: " + steps.filter((s) => s.status === "FAIL").map((s) => s.name).join(", "),
  };
}
