/**
 * Model benchmark harness — MiMo V2.5 vs DeepSeek V4 Pro
 *
 * Compares two OpenAI-compatible chat models on Vietnamese Eden-specific prompts.
 * No hardcoded URLs, model IDs, or API keys — everything comes from env vars.
 *
 * Usage:
 *   # Dry-run (syntax check, no API calls)
 *   npm run benchmark:models -- --dry-run
 *
 *   # Real run
 *   npm run benchmark:models
 */

import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";

// =============================================================================
// ENV
// =============================================================================

// Load .env.local if present, then override with process.env
dotenv.config({ path: ".env.local" });
dotenv.config();

function required(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required env var: ${name}`);
  return v;
}

const RUNS = parseInt(process.env.BENCH_RUNS_PER_TASK ?? "3", 10);
const TIMEOUT_MS = parseInt(process.env.BENCH_TIMEOUT_MS ?? "60000", 10);
const OUTPUT_DIR = process.env.BENCH_OUTPUT_DIR ?? "benchmarks/results";

interface ModelConfig {
  name: string;
  baseUrl: string;
  apiKey: string;
  model: string;
}

function loadModels(): [ModelConfig, ModelConfig] {
  return [
    {
      name: "MiMo V2.5",
      baseUrl: required("BENCH_MIMO_BASE_URL"),
      apiKey: required("BENCH_MIMO_API_KEY"),
      model: required("BENCH_MIMO_MODEL"),
    },
    {
      name: "DeepSeek V4 Pro",
      baseUrl: required("BENCH_DEEPSEEK_BASE_URL"),
      apiKey: required("BENCH_DEEPSEEK_API_KEY"),
      model: required("BENCH_DEEPSEEK_MODEL"),
    },
  ];
}

// =============================================================================
// TYPES
// =============================================================================

interface Task {
  id: string;
  category: string;
  systemPrompt: string;
  userPrompt: string;
}

interface RunResult {
  model: string;
  taskId: string;
  run: number;
  latencyMs: number;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  response: string;
  error?: string;
}

interface ModelSummary {
  model: string;
  totalLatencyMs: number;
  avgLatencyMs: number;
  totalTokens: number;
  avgTokens: number;
  errorCount: number;
  taskResults: Record<string, { avgLatencyMs: number; avgTokens: number }>;
}

// =============================================================================
// LOAD TASKS
// =============================================================================

function loadTasks(): Task[] {
  const tasksPath = path.resolve(__dirname, "tasks/vietnamese-eden-mvp.json");
  if (!fs.existsSync(tasksPath)) {
    throw new Error(`Tasks file not found: ${tasksPath}`);
  }
  const raw = JSON.parse(fs.readFileSync(tasksPath, "utf-8"));
  if (!Array.isArray(raw) || raw.length === 0) {
    throw new Error("Tasks file must be a non-empty array");
  }
  for (const t of raw) {
    if (!t.id || !t.category || !t.systemPrompt || !t.userPrompt) {
      throw new Error(
        `Invalid task entry — missing id/category/systemPrompt/userPrompt: ${JSON.stringify(t)}`,
      );
    }
  }
  return raw as Task[];
}

// =============================================================================
// API CALL
// =============================================================================

async function callModel(
  config: ModelConfig,
  task: Task,
): Promise<Omit<RunResult, "model" | "taskId" | "run">> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const t0 = performance.now();
    const resp = await fetch(`${config.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        model: config.model,
        messages: [
          { role: "system", content: task.systemPrompt },
          { role: "user", content: task.userPrompt },
        ],
        max_tokens: 2048,
        temperature: 0.7,
      }),
      signal: controller.signal,
    });
    clearTimeout(timer);
    const latencyMs = Math.round(performance.now() - t0);

    if (!resp.ok) {
      const body = await resp.text();
      throw new Error(`HTTP ${resp.status}: ${body.slice(0, 300)}`);
    }

    const json = (await resp.json()) as {
      choices: { message: { content: string } }[];
      usage: { prompt_tokens: number; completion_tokens: number; total_tokens: number };
    };

    return {
      latencyMs,
      promptTokens: json.usage.prompt_tokens,
      completionTokens: json.usage.completion_tokens,
      totalTokens: json.usage.total_tokens,
      response: json.choices[0]?.message?.content ?? "",
    };
  } catch (err: unknown) {
    clearTimeout(timer);
    const message = err instanceof Error ? err.message : String(err);
    return {
      latencyMs: 0,
      promptTokens: 0,
      completionTokens: 0,
      totalTokens: 0,
      response: "",
      error: message,
    };
  }
}

// =============================================================================
// RUNNER
// =============================================================================

async function runBenchmark(
  models: [ModelConfig, ModelConfig],
  tasks: Task[],
  dryRun: boolean,
): Promise<void> {
  console.log(`\n=== Model Benchmark Harness ===`);
  console.log(`Models: ${models[0].name} vs ${models[1].name}`);
  console.log(`Tasks: ${tasks.length}  |  Runs per task: ${RUNS}  |  Timeout: ${TIMEOUT_MS}ms`);
  console.log(`Dry run: ${dryRun}\n`);

  if (dryRun) {
    for (const t of tasks) {
      console.log(`  [DRY-RUN] ${t.id} (${t.category})`);
    }
    console.log(`\n✅ Dry-run complete — ${tasks.length} tasks validated. No API calls made.`);
    return;
  }

  const allResults: RunResult[] = [];

  for (const task of tasks) {
    console.log(`\n--- Task: ${task.id} (${task.category}) ---`);

    for (let run = 1; run <= RUNS; run++) {
      for (const model of models) {
        process.stdout.write(`  ${model.name} run ${run}/${RUNS} ... `);
        const result = await callModel(model, task);
        allResults.push({ model: model.name, taskId: task.id, run, ...result });

        if (result.error) {
          console.log(`❌ ${result.error}`);
        } else {
          console.log(
            `✅ ${result.latencyMs}ms | ${result.promptTokens}+${result.completionTokens}=${result.totalTokens} tokens`,
          );
        }
      }
    }
  }

  // Summaries
  const summaries = buildSummaries(allResults, models);
  printSummary(summaries);

  // Write results
  const ts = new Date().toISOString().replace(/[:.]/g, "-");
  const outPath = path.resolve(OUTPUT_DIR, `bench-${ts}.json`);
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  fs.writeFileSync(
    outPath,
    JSON.stringify({ timestamp: new Date().toISOString(), summaries, results: allResults }, null, 2),
  );
  console.log(`\n📁 Full results saved to: ${outPath}`);
}

// =============================================================================
// SUMMARIES
// =============================================================================

function buildSummaries(
  results: RunResult[],
  models: [ModelConfig, ModelConfig],
): ModelSummary[] {
  return models.map((m) => {
    const modelResults = results.filter((r) => r.model === m.name);
    const errors = modelResults.filter((r) => r.error);
    const ok = modelResults.filter((r) => !r.error);

    const totalLatency = ok.reduce((s, r) => s + r.latencyMs, 0);
    const totalTokens = ok.reduce((s, r) => s + r.totalTokens, 0);

    const taskResults: Record<string, { avgLatencyMs: number; avgTokens: number }> = {};
    const taskIds = Array.from(new Set(ok.map((r) => r.taskId)));
    for (const tid of taskIds) {
      const tResults = ok.filter((r) => r.taskId === tid);
      taskResults[tid] = {
        avgLatencyMs: Math.round(tResults.reduce((s, r) => s + r.latencyMs, 0) / tResults.length),
        avgTokens: Math.round(tResults.reduce((s, r) => s + r.totalTokens, 0) / tResults.length),
      };
    }

    return {
      model: m.name,
      totalLatencyMs: totalLatency,
      avgLatencyMs: Math.round(totalLatency / (ok.length || 1)),
      totalTokens,
      avgTokens: Math.round(totalTokens / (ok.length || 1)),
      errorCount: errors.length,
      taskResults,
    };
  });
}

function printSummary(summaries: ModelSummary[]): void {
  console.log("\n\n=== SUMMARY ===\n");

  for (const s of summaries) {
    console.log(`  ${s.model}`);
    console.log(`    Avg latency: ${s.avgLatencyMs}ms  |  Avg tokens: ${s.avgTokens}`);
    console.log(`    Errors: ${s.errorCount}`);
    for (const [tid, tr] of Object.entries(s.taskResults)) {
      console.log(`      ${tid}: ${tr.avgLatencyMs}ms / ${tr.avgTokens} tokens`);
    }
    console.log();
  }

  // Head-to-head
  const [a, b] = summaries;
  if (a && b && a.errorCount === 0 && b.errorCount === 0) {
    const latencyDiff = ((b.avgLatencyMs / a.avgLatencyMs) * 100 - 100).toFixed(1);
    const fasterModel = a.avgLatencyMs < b.avgLatencyMs ? a.model : b.model;
    console.log(
      `  ⚡ ${fasterModel} is ${Math.abs(Number(latencyDiff))}% faster (avg latency)`,
    );
    console.log();
  }
}

// =============================================================================
// MAIN
// =============================================================================

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");

  if (dryRun) {
    // Don't require API keys for dry-run
    const tasks = loadTasks();
    await runBenchmark(
      [
        { name: "MiMo V2.5", baseUrl: "mock", apiKey: "mock", model: "mock" },
        { name: "DeepSeek V4 Pro", baseUrl: "mock", apiKey: "mock", model: "mock" },
      ],
      tasks,
      true,
    );
    return;
  }

  const models = loadModels();
  const tasks = loadTasks();
  await runBenchmark(models, tasks, false);
}

main().catch((err) => {
  console.error("FATAL:", err);
  process.exit(1);
});
