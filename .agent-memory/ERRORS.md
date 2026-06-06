# Project Errors & Known Issues

## Headroom Proxy — 2026-06-05

### Rust Core Missing (Windows)

**Error:** `ModuleNotFoundError: No module named 'headroom._core'`

**Impact:** Proxy refuses to start unless `HEADROOM_REQUIRE_RUST_CORE=false` is set. Without Rust core, compression/optimization is disabled — proxy acts as transparent pass-through only.

**Resolution:** Workaround applied (set env var). Waiting for Windows wheel with Rust core.

### Streaming Incompatibility with 9Router

**Error:** `proxy_error` (502) on chat completion requests without explicit `stream: false`.

**Cause:** 9Router auto-streams all responses. Headroom's direct transparent proxy path cannot handle streaming responses — it expects a complete JSON response.

**Workaround:** Add `"stream": false` to all requests. Not viable for Cursor/Codex which default to streaming.

**Resolution:** Pending. May be fixed when Rust core is available (optimization path may handle streaming differently).

### anyllm Backend Cannot Use Custom API URL

**Error:** `proxy_error` when using `--backend anyllm`

**Cause:** `create_proxy_backend()` creates AnyLLMBackend without passing `api_base`. The any-llm SDK connects to api.openai.com instead of the configured `--openai-api-url`.

**Resolution:** Use default backend (transparent pass-through). Do not use `--backend anyllm` with 9Router.
