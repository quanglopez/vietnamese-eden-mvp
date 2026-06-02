// Browser Use QA Smoke Test Runner — types
// ALE-160: No production impact. Not a scraper backend.

export type SmokeStatus = "PASS" | "FAIL" | "SKIPPED";

export interface SmokeStep {
  name: string;
  status: SmokeStatus;
  durationMs: number;
  note?: string;
  error?: string;
}

export interface SmokeResult {
  taskName: string;
  status: SmokeStatus;
  steps: SmokeStep[];
  durationMs: number;
  screenshotPath?: string;
  summary: string;
}

export interface SmokeConfig {
  baseUrl: string;
  testEmail: string;
  testPassword: string;
  screenshotDir: string;
  headless: boolean;
  browser: "chromium" | "firefox" | "webkit";
}

export type SmokeTaskFn = (context: SmokeContext) => Promise<SmokeResult>;

export interface SmokeContext {
  page: any; // playwright Page (lazy import avoids type dep issues)
  config: SmokeConfig;
  log: (message: string) => void;
}
