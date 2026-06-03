import * as fs from "node:fs";
import * as path from "node:path";
import { chromium, firefox, webkit } from "@playwright/test";
import type { Browser, BrowserContext, Page } from "@playwright/test";
import type { SmokeConfig, SmokeResult, SmokeTaskFn } from "./types";
import { loadConfig } from "./config";

const TASKS: Record<string, () => Promise<{ default: SmokeTaskFn }>> = {
  auth: () => import("./tasks/auth"),
  board: () => import("./tasks/board"),
  "ai-breakdown": () => import("./tasks/ai-breakdown"),
  remix: () => import("./tasks/remix"),
  "voice-profile": () => import("./tasks/voice-profile"),
  calendar: () => import("./tasks/calendar"),
  "m8-source-quality": () => import("./tasks/m8-source-quality"),
  tags: () => import("./tasks/tags"),
  "saved-views": () => import("./tasks/saved-views"),
  "content-detail": () => import("./tasks/content-detail"),
};

const ALL_TASKS = Object.keys(TASKS);

async function selectBrowser(config: SmokeConfig): Promise<Browser> {
  const factory = config.browser === "firefox" ? firefox : config.browser === "webkit" ? webkit : chromium;
  return factory.launch({ headless: config.headless });
}

async function runTask(
  taskName: string,
  config: SmokeConfig,
  browser: Browser
): Promise<SmokeResult> {
  const ctx: BrowserContext = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const page: Page = await ctx.newPage();
  const logs: string[] = [];

  const context = {
    page,
    config,
    log: (msg: string) => {
      logs.push(msg);
      console.log(`[${taskName}] ${msg}`);
    },
  };

  const t0 = Date.now();
  let result: SmokeResult;

  try {
    const mod = await TASKS[taskName]();
    result = await mod.default(context);
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err);
    result = {
      taskName,
      status: "FAIL",
      steps: [{ name: "Exception", status: "FAIL", durationMs: Date.now() - t0, error }],
      durationMs: Date.now() - t0,
      summary: "Uncaught exception: " + error,
    };
  }

  if (result.status === "FAIL") {
    const ts = new Date().toISOString().replace(/[:.]/g, "-");
    const screenshotPath = path.join(config.screenshotDir, `fail-${taskName}-${ts}.png`);
    try {
      fs.mkdirSync(path.dirname(screenshotPath), { recursive: true });
      await page.screenshot({ path: screenshotPath, fullPage: true });
      result.screenshotPath = screenshotPath;
    } catch {
      /* ignore screenshot error */
    }
  }

  await ctx.close();
  return result;
}

function markdownReport(results: SmokeResult[], startedAt: string): string {
  const total = results.length;
  const passed = results.filter((r) => r.status === "PASS").length;
  const failed = results.filter((r) => r.status === "FAIL").length;
  const skipped = results.filter((r) => r.status === "SKIPPED").length;

  const lines: string[] = [
    "# Smoke Report — ALE-160",
    "",
    `| Metric | Value |`,
    `|--------|-------|`,
    `| Started | ${startedAt} |`,
    `| Total tasks | ${total} |`,
    `| ✅ PASS | ${passed} |`,
    `| ❌ FAIL | ${failed} |`,
    `| ⏭️ SKIPPED | ${skipped} |`,
    `| Duration | ${results.reduce((acc, r) => acc + r.durationMs, 0)}ms |`,
    "",
    "## Results",
    "",
    `| Task | Status | Summary |`,
    `|------|--------|---------|`,
    ...results.map((r) => {
      const icon = r.status === "PASS" ? "✅" : r.status === "FAIL" ? "❌" : "⏭️";
      return `| ${r.taskName} | ${icon} ${r.status} | ${r.summary} |`;
    }),
    "",
  ];

  for (const r of results) {
    if (r.steps.length === 0) continue;
    lines.push(`### ${r.taskName} — ${r.status}`);
    lines.push("");
    lines.push(`| Step | Status | Duration | Note |`);
    lines.push(`|------|--------|----------|------|`);
    for (const s of r.steps) {
      lines.push(`| ${s.name} | ${s.status} | ${s.durationMs}ms | ${s.note ?? "—"} |`);
    }
    lines.push("");
    if (r.screenshotPath) {
      lines.push(`> 📸 Screenshot: \`${r.screenshotPath}\``);
      lines.push("");
    }
    if (r.steps.some((s) => s.error)) {
      lines.push("**Errors:**");
      for (const s of r.steps) {
        if (s.error) lines.push(`- ${s.name}: ${s.error}`);
      }
      lines.push("");
    }
  }

  lines.push(`---`);
  lines.push(`**Verdict:** ${failed === 0 ? "ALL PASS ✅" : `${failed}/${total} FAIL ❌`}`);
  lines.push("");

  return lines.join("\n");
}

function printConsoleReport(results: SmokeResult[], startedAt: string): void {
  console.log("\n" + "=".repeat(60));
  console.log("Smoke Report — ALE-160");
  console.log("=".repeat(60));
  console.log(`Started: ${startedAt}`);
  const total = results.length;
  const passed = results.filter((r) => r.status === "PASS").length;
  const failed = results.filter((r) => r.status === "FAIL").length;
  console.log(`Results: ${passed}/${total} PASS, ${failed} FAIL\n`);
  for (const r of results) {
    const icon = r.status === "PASS" ? "✅" : "❌";
    console.log(`${icon} ${r.taskName} — ${r.summary}`);
    if (r.screenshotPath) {
      console.log(`    📸 ${r.screenshotPath}`);
    }
  }
  console.log("=".repeat(60));
}

async function main(): Promise<void> {
  const startedAt = new Date().toISOString();
  const config = loadConfig();

  const rawTasks = process.argv.slice(2);
  const taskNames = rawTasks.length > 0 ? rawTasks : ALL_TASKS;

  const unknown = taskNames.filter((t) => !TASKS[t]);
  if (unknown.length > 0) {
    console.error("Unknown task(s):", unknown.join(", "));
    console.error("Available:", ALL_TASKS.join(", "));
    process.exit(1);
  }

  const browser = await selectBrowser(config);
  const results: SmokeResult[] = [];

  for (const name of taskNames) {
    console.log(`\n▶ Running task: ${name}`);
    const result = await runTask(name, config, browser);
    results.push(result);
  }

  await browser.close();

  const report = markdownReport(results, startedAt);
  const reportPath = path.join(config.screenshotDir, `report-${startedAt.replace(/[:.]/g, "-")}.md`);
  try {
    fs.mkdirSync(path.dirname(reportPath), { recursive: true });
    fs.writeFileSync(reportPath, report, "utf-8");
    console.log(`\n📄 Markdown report saved: ${reportPath}`);
  } catch {
    console.error("Failed to write markdown report");
  }

  printConsoleReport(results, startedAt);

  const failedCount = results.filter((r) => r.status === "FAIL").length;
  process.exit(failedCount > 0 ? 1 : 0);
}

main().catch((error: unknown) => {
  console.error("Smoke runner error:", error instanceof Error ? error.message : String(error));
  process.exit(1);
});

export { markdownReport };
