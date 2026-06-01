# Cursor prompt — ALE-153 Prevent non-Vietnamese language leakage in metadata-only AI Breakdown

> **Copy prompt bên dưới và paste vào Cursor chat (Composer/Agent) trong repo `vietnamese-eden-mvp`.**
>
> **Linear issue:** [ALE-153](https://linear.app/alexgpt/issue/ALE-153/prevent-non-vietnamese-language-leakage-in-metadata-only-ai-breakdown) (P1, Backlog)
>
> **Bối cảnh:** commit `3c41f6e` (M8 spec) đã push. ALE-154 implementation chưa start. Trước khi mở rộng M8 importer, cần xử lý guard chống non-Vietnamese leakage. Lỗi thật đã thấy: `pontos` (Portuguese) trong section "Vì sao hiệu quả" của breakdown `3Bfx4osqbfE`.

---

## Prompt (copy từ đây)

```
You are implementing ALE-153 for the Vietnamese Eden MVP repo. This is a P1 production bug: AI Breakdown for metadata-only YouTube content occasionally leaks non-Vietnamese tokens (e.g. Portuguese "pontos") into output. CJK guard from ALE-148 only catches East Asian characters and is wired into Remix only — it does NOT cover Breakdown.

READ FIRST (mandatory before any code):
- src/lib/ai/json.ts — containsNonVietnameseChars + assertRemixVariantsNoCjk (lines 163-185). Read these so you know the existing pattern.
- src/lib/ai/prompts/breakdown.ts — BREAKDOWN_SYSTEM_PROMPT + buildBreakdownUserPrompt. The prompt currently says "Viết bằng tiếng Việt" but does not enforce.
- src/lib/content/analysis-actions.ts — runContentAnalysisAction (server action that calls analyzeContentText). The single entry point for breakdown.
- src/lib/ai/client.ts — find analyzeContentText function. Read it to know where to inject validation. DO NOT modify the AI provider logic (xiaomi/openai/mock).
- src/lib/ai/errors.ts — existing error classes (AiProviderError, RemixContentError). You will likely add a new error class or reuse pattern.
- src/lib/ai/providers/openai-compatible.ts — reference for how the Remix retry pattern works (ALE-148 model). You will mirror it for breakdown.
- .cursorrules — repo coding conventions. All copy in Vietnamese.

REPRODUCTION (verified on production 2026-06-01)
1. Production: https://vietnamese-eden-mvp.vercel.app/
2. Account: ggonevn@gmail.com (smoke account)
3. Open board ✨ youtube (id 226fef41-ece4-4561-975e-32e771d492df)
4. Click card "I built a complete business operating system..." -> breakdown/bafcb7dd-8c29-42be-95bd-eeb0e05a2ae5
5. Click "Phan tich AI" -> wait ~75s
6. Inspect "Vi sao hieu qua" section -> contains token "pontos" (Portuguese)

SCOPE OF THIS ISSUE
- Detect non-Vietnamese token leakage in AI Breakdown output (metadata-only path AND paste-text path)
- Retry 1x with stricter Vietnamese-only prompt if leak detected
- If retry still fails, raise user-facing error in Vietnamese
- Do NOT touch Remix CJK validator (assertRemixVariantsNoCjk). Do NOT touch AI provider internals.
- Do NOT add new npm deps.

OUT OF SCOPE
- Schema change to content_analyses table (deferred — use existing fields)
- New M8 importer types (deferred to ALE-154/155/156/157)
- Source quality badge UI (deferred to ALE-158)
- English token filtering — English IS allowed in Vietnamese content (e.g. "AI", "marketing", "video"). Only catch non-Vietnamese languages OTHER than English.

HARD CONSTRAINTS
1. TypeScript strict — no `any`. No `// @ts-ignore`.
2. Paste text breakdown must still work (paste text is real user content — must not be filtered).
3. URL-only metadata-only breakdown is the primary target — needs the guard.
4. Open the door to reusing containsNonVietnameseChars / adding containsNonVietnameseTokens — your call which approach is cleaner. Both acceptable.
5. All error messages, log messages, test names = Vietnamese.
6. npm run lint && npm run type-check && npm run build must pass before commit.

RECOMMENDED APPROACH (you decide the exact shape)

### Step 1 — Detection
Add to src/lib/ai/json.ts (or new file src/lib/ai/quality/language-leak.ts — your call):
- New function: `containsNonVietnameseTokens(text: string, options?: { ignorePunctuation?: boolean }): { ok: true } | { ok: false; tokens: string[]; reason: string }`
- Detection rules (apply in order, return on first match):
  1. CJK blocks (delegate to existing containsNonVietnameseChars) — catches CJK
  2. Romance accented chars not in Vietnamese: ã é í ó ú ñ ç (Spanish/Portuguese/French), đã có â ă ư ô ơ ư ơ đ of Vietnamese
     - Specifically: detect non-Vietnamese diacritics. Vietnamese uses: à á ả ã ạ â ầ ấ ẩ ẫ ậ ă ằ ắ ẳ ẵ ặ è é ẻ ẽ ẹ ê ề ế ể ễ ệ ì í ỉ ĩ ị ò ó ỏ õ ọ ô ồ ố ổ ỗ ộ ơ ờ ớ ở ỡ ợ ù ú ủ ũ ụ ư ừ ứ ử ữ ự ỳ ý ỷ ỹ ỵ đ
     - Anything else accented: reject
  3. Stray stopwords from Romance languages. Maintain a small list:
     - Portuguese: para como mais muito onde quando porque ja ja foi sao nao tem pelo pela pelo pelo (high signal)
     - Spanish: pero como mas muy donde cuando porque ya fue son no tiene por la (high signal)
     - French: les des une est pour dans que pas qui plus (medium signal)
     - DO NOT add English stopwords (English is allowed)
  4. Word boundary check: only match if surrounded by whitespace or punctuation (avoid false positives inside Vietnamese words like "marketing" containing "ma")
- Be conservative — false positives (rejecting valid Vietnamese) are worse than false negatives (letting one stray word through). When in doubt, do not flag.

### Step 2 — Apply guard
Two options, pick the cleaner one:
- Option A: Add `assertBreakdownNoNonVietnamese(result: BreakdownAnalysisResult): void` in src/lib/ai/json.ts (parallel to assertRemixVariantsNoCjk). Iterate hook/angle/structure/cta/emotion/target_audience/why_it_works/remix_suggestions.
- Option B: Inline check in src/lib/content/analysis-actions.ts after analyzeContentText returns.

Recommend Option A for symmetry with Remix pattern.

### Step 3 — Retry pattern
Mirror ALE-148 model (src/lib/ai/providers/openai-compatible.ts). Two options:
- Option X: At call site in analysis-actions.ts, catch the error, retry once with stricter prompt. Requires plumbing retry flag through analyzeContentText signature.
- Option Y: Inside analyzeContentText (or its caller in src/lib/ai/client.ts) — wrap the call with try/catch + retry. Keep retry count = 1 max.

Recommend Option Y for encapsulation. If you go with Y, find the function that calls the AI provider for breakdown (likely in src/lib/ai/client.ts or src/lib/ai/providers/openai-compatible.ts) and add retry around the parse/validate step.

### Step 4 — Stricter prompt on retry
Add a "VIETNAMESE_ONLY_REPAIR_SUFFIX" constant (similar to existing REMIX_CJK_REPAIR_USER_SUFFIX in prompts/remix.ts):
- Vietnamese language only. No foreign words except common English tech terms already in Vietnamese (AI, marketing, video, etc.).
- No Portuguese/Spanish/French/Foreign Latin-script words.

When retrying, append this suffix to the user prompt (or system prompt — your call, document the choice in JSDoc).

### Step 5 — Error handling
Add a new error class `BreakdownContentError` in src/lib/ai/errors.ts (parallel to RemixContentError):
- message: "Phat hien ky tu/tu khong phai tieng Viet trong phan tich. Vui long thu lai." (or similar — match tone of existing error messages)
- In analysis-actions.ts catch block, return this as user-facing error in ActionResult.

### Step 6 — Tests
Add unit tests:
- src/lib/ai/__tests__/language-leak.test.ts (or extend existing json.test.ts)
- Test cases:
  - "Viết bằng tiếng Việt có token pontos ở giữa" -> reject with reason mentioning 'pontos'
  - "Video này dùng AI để edit" -> accept (English 'AI' allowed)
  - "Marketing cho người mới" -> accept (English 'Marketing' allowed)
  - "Học cách làm giàu nhanh chóng" -> accept (no foreign token)
  - "El problema es muy simple" -> reject (Spanish)
  - "C'est la vie en rose" -> reject (French)
  - "Đây là một 东西 trong content" -> reject (CJK from existing detector)
  - "" -> accept (empty)
- Mock-friendly so tests run without API calls

DELIVERABLES — small commits, easy to review

### Commit 1 — Detector
- src/lib/ai/quality/language-leak.ts (or extend json.ts)
- containsNonVietnameseTokens function with comprehensive JSDoc
- Test file: src/lib/ai/__tests__/language-leak.test.ts
- No callers yet
- Lint/type-check/build pass
- Commit message: `feat(ALE-153): add non-Vietnamese token detector for AI breakdown`

### Commit 2 — Apply + retry
- src/lib/ai/json.ts — add assertBreakdownNoNonVietnamese (parallel to assertRemixVariantsNoCjk)
- src/lib/ai/errors.ts — add BreakdownContentError
- src/lib/ai/prompts/breakdown.ts — add BREAKDOWN_VIETNAMESE_ONLY_REPAIR_SUFFIX
- src/lib/ai/client.ts — wrap analyzeContentText with retry-once-on-leak
- analysis-actions.ts — catch BreakdownContentError, return user-friendly ActionResult error
- Test: leak detection + retry in unit test if feasible (or document manual smoke)
- Lint/type-check/build pass
- Commit message: `feat(ALE-153): wire non-Vietnamese guard + retry to breakdown pipeline`

### Commit 3 — Smoke docs
- docs/production-smoke-test.md — add small section under ALE-152: "ALE-153 guard shipped, manual smoke on 3Bfx4osqbfE re-run confirms no pontos in new breakdown"
- (You do NOT need to run the production smoke — just document the command for human to run)
- Commit message: `docs(ALE-153): record guard shipped`

AFTER EACH COMMIT
- Run npm run lint && npm run type-check && npm run build
- Fix any new errors
- Commit with format `<type>(ALE-153): <description>`

DONE WHEN
- All 3 commits pushed to a feature branch
- lint/type-check/build all pass
- Manual smoke evidence documented (or attached in PR):
  - YouTube watch?v=3Bfx4osqbfE re-analysis: "Vi sao hieu qua" no longer contains "pontos"
  - YouTube /shorts/UZSEmfaNRqg re-analysis: same check
  - Paste text breakdown (Khac - Van ban demo): works unchanged
  - Remix (Facebook 5 variants): still passes CJK guard
- ALE-153 ready to mark Done in Linear

CRITICAL: DO NOT TOUCH
- src/lib/ai/json.ts's existing containsNonVietnameseChars — only ADD new function next to it
- src/lib/ai/json.ts's existing assertRemixVariantsNoCjk — must remain functional
- src/lib/ai/providers/openai-compatible.ts — do not modify provider internals
- src/lib/ai/providers/xiaomi.ts — same
- src/lib/ai/providers/mock.ts — same
- DB schema (content_analyses table)
```

---

## Notes for the human running this in Cursor

1. **Create a feature branch first**:
   ```
   git checkout -b fix/ale-153-non-vietnamese-leakage
   ```
2. **Run commits 1 -> 2 -> 3 sequentially** in Cursor, review diff after each
3. **Manual smoke before marking ALE-153 Done**:
   - Re-run breakdown on `3Bfx4osqbfE` (URL: `/breakdown/bafcb7dd-8c29-42be-95bd-eeb0e05a2ae5` after login)
   - Re-run on `/breakdown/09d7176c-4d8d-4c4c-b864-c5b3db6416e2` (YouTube Shorts)
   - Re-run on `/breakdown/279580a2-1347-4836-8cb0-8bb39ffd6f5e` (Paste text — must work unchanged)
   - Quick test 1 remix generation (Facebook 5 variants) — must still pass CJK guard
4. **Recommended next after ALE-153 Done**: ALE-154 (M8 architecture foundation) using the spec at `docs/social-url-importer-plan.md` and the Cursor prompt at `docs/cursor-prompt-ale-154.md`.
5. **Edge case to be aware of**: The first breakdown attempt might still leak once (leak detection works post-parse), and retry should clean it. Total user wait: ~150s instead of ~75s in the rare leak case. This is acceptable for now — if leak rate > 30%, file follow-up issue to investigate model prompt or model swap.
