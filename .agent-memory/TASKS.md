# Project Tasks — Tooling & Infrastructure

## Headroom Proxy Evaluation

- [x] Install Headroom in isolated sandbox (`C:\Users\ADMIN\headroom-lab`)
- [x] Test proxy connectivity with 9Router (pass-through mode)
- [x] Document findings and create config guides
- [ ] **WAITING:** Windows wheel with Rust core for compression
- [ ] After Rust core available: re-test with optimization enabled
- [ ] After re-test pass: manually configure Cursor to use Headroom proxy
- [ ] After re-test pass: test Codex CLI through Headroom
- [ ] After re-test pass: evaluate MCP integration

## Rollback Note

If Headroom proxy causes issues:
1. Stop proxy: `taskkill /F /IM headroom.exe`
2. Revert Cursor/Codex `OPENAI_BASE_URL` to `http://localhost:20128/v1`
3. No data loss — Headroom is a transparent proxy, no state stored
