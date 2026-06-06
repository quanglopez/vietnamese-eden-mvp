# Model Benchmark Harness — Vietnamese Eden MVP

So sánh hiệu năng hai model AI trên các prompt đặc trưng của Vietnamese Eden.

## Models

| Model | Env vars |
|---|---|
| **MiMo V2.5** | `BENCH_MIMO_BASE_URL`, `BENCH_MIMO_API_KEY`, `BENCH_MIMO_MODEL` |
| **DeepSeek V4 Pro** | `BENCH_DEEPSEEK_BASE_URL`, `BENCH_DEEPSEEK_API_KEY`, `BENCH_DEEPSEEK_MODEL` |

## Setup

Copy the block below to `.env.local` and fill in your real API keys:

```env
# MiMo V2.5
BENCH_MIMO_BASE_URL=https://api.xiaomimimo.com/v1
BENCH_MIMO_API_KEY=sk-your-real-key
BENCH_MIMO_MODEL=mimo-v2.5-pro

# DeepSeek V4 Pro
BENCH_DEEPSEEK_BASE_URL=https://api.deepseek.com/v1
BENCH_DEEPSEEK_API_KEY=sk-your-real-key
BENCH_DEEPSEEK_MODEL=deepseek-v4-pro

# Output
BENCH_OUTPUT_DIR=benchmarks/results
BENCH_RUNS_PER_TASK=3
BENCH_TIMEOUT_MS=60000
```

See `.env.example` for template (no real keys).

## Usage

```bash
# Dry-run — syntax check, no API calls
npm run benchmark:models -- --dry-run

# Real run — compares both models on all 6 tasks
npm run benchmark:models
```

## Output

Results saved as JSON to `benchmarks/results/bench-<timestamp>.json`:

```json
{
  "timestamp": "2026-06-06T12:00:00.000Z",
  "summaries": [
    {
      "model": "MiMo V2.5",
      "avgLatencyMs": 2450,
      "avgTokens": 520,
      "errorCount": 0,
      "taskResults": {
        "breakdown-hook": { "avgLatencyMs": 2200, "avgTokens": 480 }
      }
    },
    {
      "model": "DeepSeek V4 Pro",
      "avgLatencyMs": 3100,
      "avgTokens": 610,
      "errorCount": 0,
      "taskResults": { "breakdown-hook": { "avgLatencyMs": 2900, "avgTokens": 550 } }
    }
  ],
  "results": [ /* raw per-run results */ ]
}
```

## Tasks

6 curated Vietnamese Eden-specific prompts across 3 categories:

| Category | Task | Count |
|---|---|---|
| AI Breakdown | HOOK, ANGLE, CTA analysis | 3 |
| Remix Generator | Tone shift, platform adaptation | 2 |
| Voice Profile | Writing style analysis + JSON output | 1 |

## Interpreting results

- **Latency** thấp hơn = UI responsive hơn (quan trọng cho Remix)
- **Tokens** cao hơn = output dài hơn (có thể là verbosity, không phải chất lượng)
- **Errors** = model không khả dụng hoặc timeout
- So sánh chất lượng output thủ công — benchmark này chỉ đo performance, không đo accuracy

## Guardrails

- Không hardcode API keys, URL, model ID
- Không dùng data người dùng thật
- Không ảnh hưởng production app
- Script chạy local, không deploy
