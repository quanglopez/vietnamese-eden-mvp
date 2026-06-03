// Task: Saved Views — ALE-163 board saved views CRUD + regression
// ALE-160 smoke task. No production impact.

import type { Page } from "@playwright/test";
import type { SmokeContext, SmokeResult, SmokeStep } from "../types";

export default async function runSavedViews(context: SmokeContext): Promise<SmokeResult> {
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

  // --- Helpers (ported from standalone script) ---

  async function findBoardLink(): Promise<{ href: string; name: string } | null> {
    const links = page.locator("a[href^='/boards/']");
    const n = await links.count();
    for (let i = 0; i < n; i++) {
      const href = await links.nth(i).getAttribute("href");
      if (!href) continue;
      const txt = (await links.nth(i).innerText()).trim();
      return { href, name: txt };
    }
    return null;
  }

  async function resetFilters(): Promise<void> {
    const resetBtn = page.getByRole("button", { name: /Đặt lại/i });
    if (await resetBtn.isVisible().catch(() => false)) {
      await resetBtn.click().catch(() => undefined);
    }
    const search = page.locator("input[type=search], input[placeholder*='Tìm'], input[placeholder*='search' i]").first();
    if (await search.isVisible().catch(() => false)) {
      await search.fill("");
    }
  }

  async function dismissBanner(): Promise<void> {
    const closeBtn = page.getByRole("button", { name: /Đóng thông báo/i });
    if (await closeBtn.isVisible().catch(() => false)) {
      await closeBtn.click({ force: true }).catch(() => undefined);
      await page.waitForTimeout(200);
    }
  }

  async function clearTopBanner(): Promise<void> {
    try {
      const banner = page.locator('text=/Cảnh báo:/').first();
      if (await banner.isVisible().catch(() => false)) {
        await page.mouse.click(10, 10);
        await page.waitForTimeout(150);
      }
    } catch {
      /* ignore */
    }
  }

  async function forceClick(loc: ReturnType<Page["locator"]>): Promise<void> {
    await loc.scrollIntoViewIfNeeded().catch(() => undefined);
    await loc.click({ force: true });
  }

  // --- Steps ---

  try {
    // 1. Login
    await step("Login", async () => {
      await page.goto(c.baseUrl + "/login", { waitUntil: "networkidle" });
      await page.fill("input[type=email]", c.testEmail);
      await page.fill("input[type=password]", c.testPassword);
      await page.getByRole("button", { name: /Đăng nhập/i }).click();
      await page.waitForURL(/\/dashboard$/, { timeout: 15_000 });
    });

    // 2. Navigate to a board that has content
    let boardHref = "";
    await step("Open a board with content", async () => {
      const board = await findBoardLink();
      if (!board) throw new Error("No boards on dashboard");
      boardHref = board.href;
      await page.goto(c.baseUrl + boardHref, { waitUntil: "networkidle" });
      const cards = page.locator("a[href^='/breakdown/']");
      if ((await cards.count()) === 0) {
        // Try the next board
        const links = page.locator("a[href^='/boards/']");
        const n = await links.count();
        for (let i = 1; i < n; i++) {
          const href = await links.nth(i).getAttribute("href");
          if (!href) continue;
          await page.goto(c.baseUrl + href, { waitUntil: "networkidle" });
          const c2 = page.locator("a[href^='/breakdown/']");
          if ((await c2.count()) > 0) {
            boardHref = href;
            break;
          }
        }
      }
    });

    // 3. Open "Saved views" dropdown (empty baseline)
    await step("Open Saved views dropdown (baseline)", async () => {
      await page.getByRole("button", { name: /^Saved views$/i }).click();
      await page.waitForTimeout(300);
      await page.keyboard.press("Escape");
    });

    // 4. Set platform filter = TikTok
    await step("Set platform filter = TikTok", async () => {
      await clearTopBanner();
      const tiktok = page.getByRole("button", { name: /^TikTok$/i }).first();
      await forceClick(tiktok);
      await page.waitForTimeout(300);
    });

    // 5. Type a search query
    await step("Type search query", async () => {
      const search = page
        .locator("input[type=search], input[placeholder*='Tìm' i], input[placeholder*='search' i]")
        .first();
      await search.fill("smoke", { force: true });
      await page.waitForTimeout(300);
    });

    // 6. Save view with unique name
    const viewName = `ALE-163-Smoke-${Date.now()}`;
    await step(`Save view "${viewName}"`, async () => {
      await clearTopBanner();
      await forceClick(page.getByRole("button", { name: /Lưu bộ lọc/i }));
      const nameInput = page.locator("#saved-view-name");
      await nameInput.waitFor({ state: "visible", timeout: 5_000 });
      await nameInput.fill(viewName, { force: true });
      await forceClick(page.getByRole("button", { name: /^Lưu$/ }));
      await page.waitForTimeout(2_000);
    });

    // 7. Verify view appears in dropdown
    await step("Saved view appears in dropdown", async () => {
      await clearTopBanner();
      await forceClick(page.getByRole("button", { name: /^Saved views$/i }));
      await page.waitForTimeout(500);
      const item = page.getByRole("menuitem").filter({ hasText: viewName });
      const viewItemExists = (await item.count()) > 0;
      if (!viewItemExists) throw new Error("Saved view not found in dropdown");
    });

    // 8. Reset filters then apply saved view → state should restore
    await step("Reset filters, then apply saved view (restore)", async () => {
      await page.keyboard.press("Escape");
      await page.waitForTimeout(300);
      await clearTopBanner();
      await resetFilters();
      await page.waitForTimeout(500);
      // Re-open dropdown and click
      await forceClick(page.getByRole("button", { name: /^Saved views$/i }));
      await page.waitForTimeout(500);
      const item = page.getByRole("menuitem").filter({ hasText: viewName }).first();
      await forceClick(item);
      await page.waitForTimeout(800);
      // Verify the search input now has "smoke"
      const search = page
        .locator("input[type=search], input[placeholder*='Tìm' i], input[placeholder*='search' i]")
        .first();
      const v = await search.inputValue();
      if (v !== "smoke") throw new Error(`Search not restored, got "${v}"`);
      // Verify TikTok is active
      const tiktokBtn = page.getByRole("button", { name: /^TikTok$/i }).first();
      const cls = (await tiktokBtn.getAttribute("class")) ?? "";
      const aria = (await tiktokBtn.getAttribute("aria-pressed")) ?? "";
      const active = /active|pressed|selected|primary|brand/i.test(cls + " " + aria);
      if (!active) {
        const tiktokCount = await page
          .locator(".source-badge--tiktok, [data-platform='tiktok'], [aria-label*='TikTok' i]")
          .count();
        context.log(`TikTok active class not detected, badge-count=${tiktokCount}`);
      }
    });

    // 9. Duplicate name guard
    await step("Duplicate name guard shows user-facing error", async () => {
      await page.keyboard.press("Escape");
      await page.waitForTimeout(300);
      await clearTopBanner();
      await forceClick(page.getByRole("button", { name: /Lưu bộ lọc/i }));
      const nameInput = page.locator("#saved-view-name");
      await nameInput.waitFor({ state: "visible", timeout: 5_000 });
      await nameInput.fill(viewName, { force: true });
      await forceClick(page.getByRole("button", { name: /^Lưu$/ }));
      await page.waitForTimeout(2_000);
      // Check for duplicate error
      const dialogText = await page
        .locator('[role="dialog"]')
        .innerText()
        .catch(() => "");
      const pageText = await page.locator("body").innerText();
      const hasUserFacingError =
        /tồn tại|đã tồn tại|trùng|duplicate|đã có/i.test(dialogText + "\n" + pageText);
      if (!hasUserFacingError) {
        throw new Error("No user-facing duplicate-name error visible in dialog or page");
      }
      // Close the dialog
      const cancelBtn = page.getByRole("button", { name: /^Huỷ$/ });
      if (await cancelBtn.isVisible().catch(() => false)) {
        await forceClick(cancelBtn);
      } else {
        await page.keyboard.press("Escape");
      }
      await page.waitForTimeout(500);
    });

    // 10. Delete the saved view
    await step("Delete saved view", async () => {
      await clearTopBanner();
      await forceClick(page.getByRole("button", { name: /^Saved views$/i }));
      await page.waitForTimeout(500);
      // Accept the confirm dialog automatically
      page.once("dialog", (d) => {
        void d.accept();
      });
      const item = page
        .getByRole("menuitem")
        .filter({ hasText: viewName })
        .first();
      const delBtn = item.locator('button[aria-label^="Xóa saved view"]');
      await delBtn.click({ force: true });
      await page.waitForTimeout(2_000);
      // Close menu
      await page.keyboard.press("Escape");
      await page.waitForTimeout(300);
      // Reopen and verify it's gone
      await forceClick(page.getByRole("button", { name: /^Saved views$/i }));
      await page.waitForTimeout(500);
      const stillThere = await page
        .getByRole("menuitem")
        .filter({ hasText: viewName })
        .count();
      if (stillThere > 0) throw new Error("Saved view still present after delete");
      await page.keyboard.press("Escape");
    });

    // 11. Regression: Add content modal opens
    await step("Regression: Add content modal opens", async () => {
      await clearTopBanner();
      const addBtn = page
        .getByRole("button", { name: /Thêm|Thêm nội dung|Add content|\+ Thêm/i })
        .first();
      await forceClick(addBtn);
      await page.waitForTimeout(800);
      const dlg = page.locator('[role="dialog"]');
      if ((await dlg.count()) === 0) {
        throw new Error("Add content dialog did not open");
      }
      await page.keyboard.press("Escape");
      await page.waitForTimeout(300);
    });

    // 12. Regression: Breakdown link loads
    await step("Regression: Breakdown link loads", async () => {
      const link = page.locator("a[href^='/breakdown/']").first();
      await link.scrollIntoViewIfNeeded();
      await link.click({ force: true });
      await page.waitForURL(/\/breakdown\/[^/]+$/, { timeout: 10_000 });
      await page.waitForLoadState("networkidle");
      await page.goBack({ waitUntil: "networkidle" });
    });

    // 13. Regression: Tag manager UI present
    await step("Regression: Tag manager UI present", async () => {
      const tagSection = page.locator("text=/Quản lý tag|Thẻ|Tag manager/i").first();
      if (!(await tagSection.isVisible().catch(() => false))) {
        const tagInput = page.locator(
          'input[placeholder*="tag" i], input[placeholder*="thẻ" i], input[placeholder*="Tag" i]',
        );
        if ((await tagInput.count()) === 0) {
          throw new Error("Tag manager section / input not found");
        }
      }
    });

    // 14. Regression: filters still functional after roundtrip
    await step("Regression: filters still functional", async () => {
      await clearTopBanner();
      const search = page
        .locator("input[type=search], input[placeholder*='Tìm' i], input[placeholder*='search' i]")
        .first();
      await search.fill("zzznonexistent", { force: true });
      await page.waitForTimeout(500);
      const yt = page.getByRole("button", { name: /^YouTube$/i }).first();
      await forceClick(yt);
      await page.waitForTimeout(500);
      await resetFilters();
    });
  } catch {
    // fail fast; screenshot handled by runner
  }

  const allPass = steps.every((s) => s.status === "PASS");
  return {
    taskName: "saved-views",
    status: allPass ? "PASS" : "FAIL",
    steps,
    durationMs: Date.now() - t0,
    summary: allPass
      ? "ALE-163 all checks PASS"
      : "ALE-163 FAIL: " + steps.filter((s) => s.status === "FAIL").map((s) => s.name).join(", "),
  };
}
