// Browser Use QA Smoke Test — config loader
// Reads .env.browser-use or .env.browser-use.example. Requires env check.

import { config } from "dotenv";
import { resolve } from "node:path";
import type { SmokeConfig } from "./types";

const ALLOWED_DOMAINS = [
  "vietnamese-eden-mvp.vercel.app",
  "localhost:3000",
  "127.0.0.1:3000",
];

function isAllowedUrl(url: string): boolean {
  try {
    const u = new URL(url);
    return ALLOWED_DOMAINS.some((d) => u.hostname === d || u.host === d);
  } catch {
    return false;
  }
}

export function loadConfig(): SmokeConfig {
  // Load .env.browser-use if present (local QA only)
  const envPath = resolve(process.cwd(), ".env.browser-use");
  config({ path: envPath, override: true });

  const baseUrl = process.env["BROWSER_USE_BASE_URL"];
  const testEmail = process.env["BROWSER_USE_TEST_EMAIL"] ?? "";
  const testPassword = process.env["BROWSER_USE_TEST_PASSWORD"] ?? "";
  const screenshotDir = process.env["BROWSER_USE_SCREENSHOT_DIR"] ?? resolve(process.cwd(), "scripts/browser-use/screenshots");
  const headless = (process.env["BROWSER_USE_HEADLESS"] ?? "true") === "true";
  const browser = (process.env["BROWSER_USE_BROWSER"] ?? "chromium") as SmokeConfig["browser"];

  // Use example fallback for baseUrl if not set (developer-friendly, still no credentials)
  const resolvedBaseUrl = baseUrl || "https://vietnamese-eden-mvp.vercel.app";

  if (!isAllowedUrl(resolvedBaseUrl)) {
    throw new Error(
      `Forbidden target URL "${resolvedBaseUrl}". Only allowed domains: ${ALLOWED_DOMAINS.join(", ")}`
    );
  }

  if (!testEmail || !testPassword) {
    throw new Error(
      "Missing test account credentials. Create .env.browser-use from .env.browser-use.example"
    );
  }

  return {
    baseUrl: resolvedBaseUrl.replace(/\/$/, ""),
    testEmail,
    testPassword,
    screenshotDir,
    headless,
    browser,
  };
}
