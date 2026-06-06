# Project Decisions Log

## 2026-06-05: Test Headroom Proxy in Sandbox

**Decision:** Test Headroom (context compression proxy) in isolated sandbox before wiring into Cursor/9Router workflow.

**Reason:** Cursor and Hermes Agent frequently read long logs (build output, migration results, smoke test reports). Context fills quickly with verbose tool output. Headroom promises token compression by stripping redundant content from prompts sent to LLMs.

**Status:** Testing (sandbox only — not integrated into daily workflow).

**Outcome so far:**
- Headroom v0.20.15 installed in `C:\Users\ADMIN\headroom-lab\.venv` (isolated from Hermes venv)
- Proxy works as transparent pass-through with 9Router (non-streaming only)
- Compression NOT available: Rust core (`headroom._core`) missing from Windows pre-built wheel
- Recommendation: wait for Windows wheel with Rust core; use direct 9Router in the meantime

**Rollback:** No changes to production config. 9Router continues as primary LLM gateway.

**References:**
- `C:\Users\ADMIN\headroom-lab\HEADROOM_TEST_LOG.md`
- `C:\Users\ADMIN\headroom-lab\HEADROOM_9ROUTER_SETUP.md`
- `C:\Users\ADMIN\headroom-lab\HEADROOM_CURSOR_CODEX_CLAUDE_CONFIG.md`
