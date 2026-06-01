# Production smoke test — Vercel + Supabase Cloud

**Base URL:** [https://vietnamese-eden-mvp.vercel.app/](https://vietnamese-eden-mvp.vercel.app/)

Chạy sau khi hoàn tất [supabase-cloud-setup.md](./supabase-cloud-setup.md) (env Vercel + migrations + auth URLs).

**Thời gian ước tính:** 20–30 phút (lần đầu, gồm signup/email).

**Không cần** commit secret. Dùng tài khoản test riêng.

---

## ALE-146 — Production smoke after beta fixes (2026-06-01)

| Field | Value |
|-------|--------|
| **Test date** | 2026-06-01 |
| **Environment** | Production `https://vietnamese-eden-mvp.vercel.app/` + mobile 375×812 (CDP) |
| **Commit tested** | `7185b51` — `feat: clarify calendar manual scheduling UX` |
| **Health** | `GET /api/health/supabase` → `{"status":"ok","supabase":{"ok":true}}` |
| **Account** | `ale146smoke20260531@example.com` (workspace "Workspace của ALE-146", board Smoke Board ALE-146) |
| **AI provider** | `xiaomi:mimo-v2.5` (observed on breakdown) |

### Phase 1 — Auth & onboarding

| Step | Result | Notes |
|------|--------|-------|
| 1 Landing `/` | **PASS** | Hero, CTAs, waitlist form; load <3s |
| 2 Signup | **NOT RUN** | Reused existing smoke account |
| 3 Login | **PASS** | → `/dashboard` ~5s |
| 4 Google OAuth | **FAIL** | Button "Tiếp tục với Google" visible & enabled (ALE-90.8 known limitation) |
| 5 Forgot password | **PASS** | `beta.test@example.com` → "Email đã được gửi", no Invalid input |

### Phase 2 — Board & content

| Step | Result | Notes |
|------|--------|-------|
| 6 Dashboard → boards | **PASS** | Smoke Board ALE-146 listed |
| 7 Create board | **NOT RUN** | Board pre-created in prior session |
| 8 Add content (paste) | **PASS** | "Hook beauty ALE-146" card present |
| 9 Content card actions | **PASS** | "Phân tích AI" visible |

### Phase 3 — AI breakdown (ALE-141)

| Step | Result | Notes |
|------|--------|-------|
| 10 Navigate breakdown | **PASS** | `/breakdown/242fd785-…` |
| 11 Loading state | **PASS** | Overlay: Bước 1/4, progress bar, "AI đang phân tích…" on re-run |
| 12 Breakdown result | **PASS** | Hook, Angle, Cấu trúc, CTA + extras render |
| 13 Model label | **PASS** | `Model: xiaomi:mimo-v2.5` |
| 14 Error handling | **NOT RUN** | No API failure observed |

### Phase 4 — Remix (ALE-144)

| Step | Result | Notes |
|------|--------|-------|
| 15 Navigate remix | **PASS** | Form visible |
| 16 Configure remix | **PASS** | Facebook + Gần gũi + 5 variants submitted |
| 17 Loading state | **PASS** | ALE-141 overlay on remix (~120s wait) |
| 18 5 variants returned | **PASS** | Exactly 5, no JSON parse error |
| 19 Title uniqueness | **PARTIAL** | Card headers use "Biến thể 1–5"; opening lines unique (see below) |
| 20 Opening diversity | **PASS** | 5 distinct styles: before/after, 2s hook, story, question, beginner list |
| 21 CTA diversity | **PASS** | Inbox/DM, tag friend, save, reply, comment 1/2/3 |
| 22 Vietnamese naturalness | **PARTIAL** | Mostly natural; variant 3 contains stray Chinese `的东西` |
| 23 Remix 10 variants | **NOT RUN** | Slider could not be set to 10 via browser automation (React state stuck at 5) |
| 24 Copy/export | **PASS** | Copy, Export all .txt/.md per variant |

**ALE-144 variant openings (first sentence):**

| # | Opening |
|---|---------|
| 1 | Bạn có 2 giây để giữ người xem ở lại. |
| 2 | Một story ngắn, đúng nhịp, có thể cứu cả video của bạn. |
| 3 | Bạn tạo video hay mà không ai comment? |
| 4 | Trước khi biết 3 mẹo này, video của mình cũng chìm nghỉm. |
| 5 | Nếu bạn mới bắt đầu làm content beauty và thấy hoang mang… |

**ALE-144 variant CTAs (last sentence):**

| # | CTA |
|---|-----|
| 1 | Tag ngay 1 người bạn… |
| 2 | Save lại để lần sau… |
| 3 | Reply cho mình biết suy nghĩ… |
| 4 | Inbox mình để mình gửi nhé! |
| 5 | Comment số 1, 2 hoặc 3… |

### Phase 5 — Voice profile (ALE-90.3 / ALE-142)

| Step | Result | Notes |
|------|--------|-------|
| 25 Navigate `/voice` | **PASS** | No 404 |
| 26 Guidance hint | **PASS** | "Tối thiểu 500 ký tự…" |
| 27 Character counter | **PASS** | Updates live (`9 / 500+`) |
| 28 Sample examples | **PASS** | 2 samples + collapsible "Xem ví dụ mẫu" |
| 29 Validation (<100 chars) | **PASS** | Submit disabled until ≥500 chars |
| 30 Submit valid | **PASS** | Profile "ALE-146 Smoke Voice" saved |
| 31 Loading state | **PASS** | ALE-141 overlay ~80s |
| 32 Error handling | **NOT RUN** | No 500 observed |
| 33 Remix with voice | **PARTIAL** | Voice selectable in remix form; did not re-generate 3 variants with voice |

### Phase 6 — Calendar (ALE-145)

| Step | Result | Notes |
|------|--------|-------|
| 34 Add to calendar dialog | **PASS** | Opens from remix card |
| 35 Dialog description | **PASS** | "Calendar là công cụ nhắc lịch — … tự đăng thủ công" |
| 36 Form note | **PASS** | Copy-paste + manual posting note before submit |
| 37 Submit | **PASS** | "ALE-146 Calendar Smoke Test" saved |
| 38 Verify in calendar | **PASS** | Under "Sắp tới (1)" |
| 39 Refresh persistence | **PASS** | Item persists after reload |
| 40 Card badge | **PASS** | "Nhắc lịch — không tự động đăng" |
| 41 Empty state | **NOT RUN** | 1 item present; not deleted for empty-state test |
| 42 Dashboard footnote | **PASS** | "(Chỉ nhắc lịch — không auto-post)" on dashboard quick link |

### Phase 7 — Mobile 375px

| Step | Result | Notes |
|------|--------|-------|
| 43 Landing mobile | **PASS** | No horizontal overflow (375px) |
| 44 Login mobile | **PASS** | Form usable |
| 45 Dashboard mobile | **PASS** | Shell + board list visible |
| 46 Remix mobile | **PASS*** | scrollWidth 380 vs 375 (~5px; acceptable) |
| 47 Calendar mobile | **PASS** | Usable, tabs work |

### Xiaomi MiMo latency (observed)

| Operation | Latency | Notes |
|-----------|---------|-------|
| Breakdown re-run | ~45s | ALE-141 overlay visible entire wait |
| Remix 5 variants | ~120s | Within expected 30–120s band |
| Voice profile train | ~80s | Overlay Bước 1/4 |
| Remix 10 variants | **NOT RUN** | — |

### Beta readiness verdict (ALE-146)

| Area | Score | Notes |
|------|-------|-------|
| Auth/Signup | 7/10 | Login OK; Google OAuth still visible (FAIL step 4) |
| Board/Content | 9/10 | Core flow OK |
| AI Breakdown | 9/10 | Overlay + xiaomi label OK |
| Remix (5 variants) | 7/10 | Diversity good; card labels + Chinese char leak |
| Remix (10 variants) | —/10 | NOT RUN |
| Voice Profile | 9/10 | ALE-90.3 guidance PASS |
| Calendar | 10/10 | ALE-145 no-auto-post PASS |
| Mobile | 9/10 | Minor remix scroll |
| **Overall** | **8/10** | Core beta flow works |

### Decision

- [ ] **ALL PASS**
- [x] **ANY FAIL / PARTIAL** → follow-up issues before next cohort

**Follow-ups (ALE-147+):**

1. **ALE-147** — Strip non-Vietnamese characters from remix output (variant 3: `的东西`)
2. **ALE-148** — Replace generic "Biến thể N" card titles with AI-generated unique titles (ALE-144)
3. **ALE-90.8** — Hide or disable Google OAuth until configured
4. Re-run remix 10-variant smoke manually (automation could not move slider)

**Verdict:** **NO-GO** for expanding beta cohort until ALE-147 (naturalness) is fixed. Core MVP path (board → breakdown → remix → voice → calendar) is **functional** on production.

---

## ALE-148 — Remix CJK leakage fix (2026-05-30)

| Field | Value |
|-------|--------|
| **Issue** | Remix output sometimes contains Chinese/Japanese/Korean glyphs (e.g. `的东西` in ALE-146 variant 3) |
| **Root cause** | Xiaomi MiMo V2.5 (Chinese-origin LLM) occasionally leaks CJK when prompted for Vietnamese |
| **Fix** | Strengthen `REMIX_SYSTEM_PROMPT` + user prompt; post-parse CJK validation in `src/lib/ai/json.ts`; auto-retry once in remix provider |

### Code changes

| File | Change |
|------|--------|
| `src/lib/ai/prompts/remix.ts` | `QUY TẮC NGÔN NGỮ TUYỆT ĐỐI` (100% Vietnamese, no CJK); user prompt reminder; `REMIX_CJK_REPAIR_USER_SUFFIX` on retry |
| `src/lib/ai/json.ts` | `containsNonVietnameseChars()`, `assertRemixVariantsNoCjk()` after parse (ALE-87 repair logic unchanged) |
| `src/lib/ai/providers/openai-compatible.ts` | Retry once on `RemixContentError` or JSON `invalid_response` (max 1 retry) |
| `src/lib/ai/errors.ts` | `RemixContentError` for upstream retry + user-facing message |

### Verification checklist (post-deploy)

| Check | Status | Notes |
|-------|--------|-------|
| Prompt includes 100% Vietnamese / no CJK rule | **PASS** | Code review |
| JSON parse + ALE-87 repair unchanged | **PASS** | No changes to `parseAiJsonText` / extract logic |
| CJK in output → reject + retry once | **PASS** | `assertRemixVariantsNoCjk` + provider retry |
| After retry exhausted → clear user error | **PASS** | Message: "Phát hiện ký tự không phải tiếng Việt…" |
| ALE-144 diversity rules preserved | **PASS** | Diversity block untouched |
| `npm run lint` | **PASS** | 2026-05-30 local |
| `npm run type-check` | **PASS** | 2026-05-30 local |
| `npm run build` | **PASS** | 2026-05-30 local (`NODE_OPTIONS=--max-old-space-size=8192`) |
| Xiaomi 5 variants × 5 batches (25 total) — no CJK | **PARTIAL** | 1 batch (5 variants) on production — PASS |
| Xiaomi 10 variants × 2 batches (20 total) — no CJK | **NOT RUN** | Slider automation blocked (ALE-146) |
| OpenAI fallback 3 variants — no CJK | **NOT RUN** | Requires `AI_PROVIDER=openai` env |
| Production smoke post-deploy | **PASS** | See section below (2026-06-01) |

### Re-test ALE-146 failure case

After deploy, re-run remix on same content (`Hook beauty ALE-146`) with Facebook + Gần gũi + 5 variants. Confirm variant 3 (and all others) contain **no** CJK glyphs in title or content body.

### Production smoke (2026-06-01)

| Field | Value |
|-------|--------|
| **Commit tested** | `ab8b984` — `fix: prevent CJK character leakage in remix output` |
| **Environment** | Production `https://vietnamese-eden-mvp.vercel.app/` |
| **Account** | `ale146smoke20260531@example.com` |
| **Content** | `Hook beauty ALE-146` (`242fd785-2b2f-469e-aa9c-e404e2977b23`) |
| **Provider** | Xiaomi MiMo V2.5 (inferred from prior ALE-146 session; breakdown unchanged) |
| **Deploy** | Live ~4 min after push; new remix batches saved successfully |

#### Remix Facebook · Gần gũi · 5 variants

| Check | Result | Notes |
|-------|--------|-------|
| Generation completed | **PASS** | ~60s latency; ALE-141 overlay visible |
| 5 variants returned | **PASS** | Saved at 07:25 1 thg 6, 2026 |
| CJK in title/content | **PASS** | 0/5 new variants contain CJK |
| ALE-146 variant 3 regression | **PASS** | Old batch (06:55) had `的东西`; new batch variant 3 clean |
| Retry/error visible to user | **NONE** | First attempt succeeded; no error banner |

**New variant 3 opening (Facebook, 07:25):** *"Đây là quy tắc CTA mình đã test suốt 3 tháng qua…"* — no CJK.

#### Remix TikTok · Gần gũi · 5 variants

| Check | Result | Notes |
|-------|--------|-------|
| Generation completed | **PASS** | ~105s latency |
| 5 variants returned | **PASS** | Saved at 07:26 1 thg 6, 2026 |
| CJK in title/content | **PASS** | 0/5 variants contain CJK |
| Retry/error visible to user | **NONE** | First attempt succeeded |

#### Remix 10 variants

| Check | Result | Notes |
|-------|--------|-------|
| 10-variant generation | **NOT RUN** | Slider React state stuck at 5 via browser automation (same as ALE-146) |

#### Verdict

**PASS** for ALE-148 CJK fix on production (`ab8b984`). 10/10 newly generated variants (Facebook 5 + TikTok 5) contain no CJK glyphs. Legacy pre-fix outputs may still show CJK in list until user regenerates.

---

## ALE-149 — Replace generic remix variant titles (2026-06-01)

| Field | Value |
|-------|--------|
| **Commit tested** | `01d5de3` — `fix: replace generic remix variant titles` |
| **Environment** | Production `https://vietnamese-eden-mvp.vercel.app/` |
| **Account** | `ale146smoke20260531@example.com` |
| **Content** | `Hook beauty ALE-146` (`242fd785-2b2f-469e-aa9c-e404e2977b23`) |
| **Provider** | Xiaomi MiMo V2.5 (inferred; breakdown unchanged) |
| **Deploy** | Live on production before smoke; new remix batches saved successfully |

### Re-test ALE-146 / ALE-144 failure case

After deploy, re-run remix on same content with Facebook + Gần gũi + 5 variants. Confirm card titles are **not** generic (`Biến thể N`, `Bản 1`, `Variant 2`, `Remix 3`) and each card shows an **angle badge**.

### Production smoke (2026-06-01)

#### Remix Facebook · Gần gũi · 5 variants

| Check | Result | Notes |
|-------|--------|-------|
| Generation completed | **PASS** | ~261s latency; overlay visible |
| 5 variants returned | **PASS** | Saved at 08:37 1 thg 6, 2026 |
| Generic titles | **PASS** | 0/5 new variants use `Biến thể N` or other generic patterns |
| AI descriptive / angle fallback titles | **PASS** | e.g. `Bí quyết: Nói lợi ích trong 2 giây đầu`, `3 mẹo hook beauty đã được kiểm chứng` |
| Angle badge on each card | **PASS** | Bí quyết, Hook/Opener, Trước/sau, Myth-Busting, Story 15 giây |
| CJK in title/content | **PASS** | 0/5 new variants contain CJK |
| Retry/error visible to user | **NONE** | First attempt succeeded |

**New titles (Facebook, 08:37):**

1. `Bí quyết: Nói lợi ích trong 2 giây đầu` — badge: Bí quyết
2. `3 mẹo hook beauty đã được kiểm chứng` — badge: Hook/Opener
3. `Trước/sau: 3 hook beauty thay đổi kết quả` — badge: Trước/sau
4. `Hậu trường smoke test ALE-146` — badge: Myth-Busting
5. `Story 15 giây: Cách kể chuyện giữ view` — badge: Story 15 giây

#### Remix TikTok · Gần gũi · 5 variants

| Check | Result | Notes |
|-------|--------|-------|
| Generation completed | **PASS** | Saved at 08:44 1 thg 6, 2026 |
| 5 variants returned | **PASS** | |
| Generic titles | **PASS** | 0/5 new variants generic |
| AI descriptive / angle fallback titles | **PASS** | e.g. `3 bước hook beauty không cần drama`, `Câu chuyện 15 giây thay đổi cách hook` |
| Angle badge on each card | **PASS** | Hook/Opener, Data/Stat, Myth-Busting, Before/After, List/Tips |
| CJK in title/content | **PASS** | 0/5 variants contain CJK |
| Retry/error visible to user | **NONE** | First attempt succeeded |

**New titles (TikTok, 08:44):**

1. `3 bước hook beauty không cần drama` — badge: Hook/Opener
2. `Bí quyết hook beauty từ người đã test` — badge: Data/Stat
3. `Trước/sau khi áp dụng 3 mẹo hook` — badge: Myth-Busting
4. `Câu chuyện 15 giây thay đổi cách hook` — badge: Before/After
5. `3 hook beauty đã test trên 1 video smoke` — badge: List/Tips

#### Remix 10 variants

| Check | Result | Notes |
|-------|--------|-------|
| 10-variant generation | **NOT RUN** | Slider React state stuck at 5 via browser automation (same as ALE-146/148) |

#### Verdict

**PASS** for ALE-149 on production (`01d5de3`). 10/10 newly generated variants (Facebook 5 + TikTok 5) have non-generic descriptive titles and visible angle badges. CJK regression check passed on new batches. Legacy pre-fix outputs may still show generic `Biến thể N` titles in list until user regenerates.

---

## ALE-88 — Beta readiness hardening (2026-05-31)

| Field | Value |
|-------|--------|
| **Test date** | 2026-05-31 |
| **Environment** | Production + mobile 375×812 |
| **Commit** | `8dfae12` (docs baseline); code unchanged |
| **Docs added** | `beta-onboarding.md`, `known-limitations.md` |

### Production smoke (desktop)

| Flow | Result | Notes |
|------|--------|-------|
| Landing `/` | **PASS** | Hero + CTA |
| Waitlist `#waitlist` | **PASS** | `Gửi đăng ký beta` ~4s |
| Signup | **NOT RUN** (session exists) | ALE-82/85 verified |
| Login | **PASS** | ~4.2s → dashboard |
| Dashboard | **PASS** | |
| Board + content | **PASS** | Reused smoke board |
| AI Breakdown | **PASS** | Cached `xiaomi:mimo-v2.5`; cold ~15–45s (ALE-86) |
| Remix 5 variants | **PASS** | Already 8+ from prior; no parse error |
| Remix 10 variants | **PASS** | UI max 10; **~30s** observed (8→23 total); no rate limit |
| Voice profile | **PASS** | `Voice ALE-86` exists |
| Calendar + refresh | **PASS** | `ALE-86 Calendar Smoke` persists |

### Mobile 375px

| Page | Result |
|------|--------|
| Landing | **PASS** |
| Login / Signup | **PASS** (card `h2`, no horizontal overflow) |
| Dashboard | **PASS** |
| Board detail | **PASS** |
| Remix | **PASS*** minor horizontal scroll |
| Calendar | **PASS*** minor horizontal scroll |

### Xiaomi MiMo latency (observed, production)

| Operation | Latency | Notes |
|-----------|---------|-------|
| Breakdown (cold) | ~15–45s | ALE-86 manual wait |
| Breakdown (cached UI) | <1s | DB已有 analysis |
| Remix 5 variants | ~60–120s | ALE-87 after JSON fix |
| Remix 10 variants | **~30s** | ALE-88 single run; varies with load |
| Rate limit | **None observed** | Session 2026-05-31 |

*Cost/token:* phụ thuộc Xiaomi billing; không log trong app.

### Forgot-password `+` email

| Test | Result |
|------|--------|
| `beta+plus@example.com` | Form submit; message hướng kiểm tra email / Supabase có thể reject — **P2** documented |

### Beta readiness (ALE-88)

| Verdict | |
|---------|--|
| **Ready for 10–20 beta users** | Core flow + docs onboarding/limitations |

---

## ALE-87 — Harden remix JSON parsing + production retest (2026-05-31)

| Field | Value |
|-------|--------|
| **Test date** | 2026-05-31 |
| **Commit** | `0bfe448` — `fix: harden AI JSON parsing for Xiaomi remix outputs` |
| **Environment** | Production — https://vietnamese-eden-mvp.vercel.app/ |

### Root cause (remix 5-variant fail)

| Issue | Detail |
|-------|--------|
| Parser cũ | Regex tham lam `\{[\s\S]*\}` — dễ cắt sai JSON lớn (5 variants) |
| Model output | Đôi khi markdown fence / text thừa / trailing comma |

### Fix shipped

| Item | File |
|------|------|
| Balanced-bracket JSON extract + fence strip | `src/lib/ai/json.ts` |
| Shared parse for all chat completions | `src/lib/ai/chat-completions.ts` |
| Strict remix prompt + 1× JSON repair retry | `prompts/remix.ts`, `openai-compatible.ts` |

### Production retest — Remix 5 variants

| Step | Result |
|------|--------|
| Login | **PASS** |
| Remix `/remix/[id]` | **PASS** |
| Format Facebook + Tone Gần gũi + **5 biến thể** | **PASS** — không lỗi parse |
| Outputs | **5 biến thể mới** (tổng 8 sau session trước: 3 TikTok + 5 Facebook) |
| Hard refresh | **PASS** — `Biến thể đã tạo (8)` còn |
| Copy tất cả | **Available** |

### Beta readiness (ALE-87)

| Scope | Verdict |
|-------|---------|
| Remix 5-variant (Xiaomi) | **Beta-ready** |
| Full MVP E2E | **Beta-ready** (core flow) |

---

## ALE-86 — Xiaomi MiMo V2.5 deploy + production AI retest (2026-05-31)

| Field | Value |
|-------|--------|
| **Test date** | 2026-05-31 |
| **Environment** | Production — https://vietnamese-eden-mvp.vercel.app/ |
| **GitHub `main`** | `21ec18e` (AI provider abstraction + Xiaomi; commit message docs-only) |
| **Vercel env** | `AI_PROVIDER=xiaomi`, `AI_MODEL=mimo-v2.5`, `XIAOMI_API_KEY`, `XIAOMI_BASE_URL`, `AI_USE_MOCK=false` |
| **Method** | Playwright MCP |
| **Account** | Login `ale85prodretest20260531@example.com` |

### AI provider verification

| Signal | Result |
|--------|--------|
| Breakdown model label | **`Model: xiaomi:mimo-v2.5`** |
| Error prefix OpenAI | **No** — Xiaomi active on production |
| OpenAI-compatible API | **Yes** — `chat-completions` + custom `XIAOMI_BASE_URL` |

### Production retest checklist

| # | Step | Result | Notes |
|---|------|--------|-------|
| 1 | Login | **PASS** | `/login` → `/dashboard` |
| 2 | Board | **PASS** | Reused `Smoke Board ALE-85` |
| 3 | Add content | **PASS** | Existing text item |
| 4 | AI Breakdown | **PASS** | Hook/Angle/Structure/CTA + `xiaomi:mimo-v2.5` |
| 5 | Remix | **PASS** (caveat) | 5 biến thể Facebook → `Không parse được JSON từ Xiaomi MiMo`; **3 biến thể TikTok PASS** |
| 6 | Voice Profile | **PASS** | `Voice ALE-86` saved, tone summary hiển thị |
| 7 | Add to Calendar | **PASS** | `ALE-86 Calendar Smoke` từ remix output |
| 8 | Refresh Calendar | **PASS** | Hard reload — `Sắp tới (1)` còn item |

### Beta readiness (ALE-86)

| Scope | Verdict |
|-------|---------|
| P0 RLS | **Cleared** |
| Workspace → board → content | **Beta-ready** |
| AI Breakdown (Xiaomi) | **Beta-ready** |
| Remix (Xiaomi) | **Mostly ready** — flaky JSON khi 5 biến thể / một số format |
| Voice (Xiaomi) | **Beta-ready** |
| Calendar | **Beta-ready** |

**Overall:** Full MVP E2E **PASS** với caveat remix 5-variant.

### Follow-up

- Retest remix 5 biến thể sau khi harden JSON parse (Linear follow-up, không block beta core).

---

## ALE-85 — RLS confirmed + full MVP production retest (2026-05-31)

| Field | Value |
|-------|--------|
| **Test date** | 2026-05-31 |
| **Environment** | Production — https://vietnamese-eden-mvp.vercel.app/ |
| **Method** | Playwright MCP (automated) |
| **Tester** | Agent — ALE-85 production retest |
| **Account** | New signup `ale85prodretest20260531@example.com` (no email confirm gate) |

### RLS / migration context (owner)

| Policy | Table | Status (owner) |
|--------|-------|----------------|
| `profiles_insert_own` | `profiles` | **Already exists** on Supabase Cloud |
| `workspaces_select_owner` | `workspaces` | **Already exists** on Supabase Cloud |

Không apply lại migration #4 trong lần test này — xác nhận policy đã có trước khi retest.

### Production retest checklist

| # | Step | Result | Notes |
|---|------|--------|-------|
| 1 | Login | **PASS** | Signup → `/dashboard` (tương đương login; confirm email không bật) |
| 2 | Dashboard | **PASS** | Shell MVP, CTA boards/voice/calendar |
| 3 | Create workspace | **PASS** | **Tạo workspace** → header `Workspace của ALE-85` — không lỗi RLS |
| 4 | Create board | **PASS** | `Smoke Board ALE-85` → `/boards/4e2e3376-3b8b-4bd8-bbc9-e9307d3d69c9` |
| 5 | Add content (text) | **PASS** | Paste text → toast + card `Hook beauty ALE-85` |
| 6 | AI Breakdown | **FAIL** | UI: `OpenAI API lỗi (500): internal_error` |
| 7 | Remix | **NOT RUN** | Blocked — chưa có breakdown |
| 8 | Voice Profile | **FAIL** | `/voice` → `Phân tích & lưu profile` → cùng OpenAI 500 |
| 9 | Add to Calendar | **NOT RUN** | Không có remix output |
| 10 | Refresh Calendar | **NOT RUN** | — |

### Network / routes (failures)

| Route | Method | Status | Response / error |
|-------|--------|--------|------------------|
| `/breakdown/[contentItemId]` | POST (server action) | **200** (HTTP) | Server action trả `{ success: false, error: "OpenAI API lỗi (500): … internal_error" }` — không phải RLS |
| `/voice` | POST (server action) | **200** (HTTP) | Cùng OpenAI 500 |

**Supabase auth:** `GET …/auth/v1/user` → **200** trong session.

**RLS tables exercised (PASS):** `workspaces` (insert/select owner), `boards`, `content_items` — không thấy policy violation.

### AI provider on production (observed)

| Signal | Finding |
|--------|---------|
| Error message prefix | **`OpenAI API lỗi`** — production deploy **chưa** dùng Xiaomi MiMo (ALE-85/86 code chưa deploy hoặc Vercel vẫn `AI_PROVIDER=openai`) |
| Missing key | **No** — gọi được API, trả 500 `internal_error` |
| Xiaomi env | **NOT VERIFIED** on live app |

### Beta readiness (ALE-85 retest)

| Scope | Verdict |
|-------|---------|
| Marketing + waitlist + auth | **Beta-ready** |
| Workspace → board → content | **Beta-ready** |
| **P0 RLS** | **Cleared** — workspace/board/content không lỗi policy |
| Full MVP (AI → remix → calendar) | **Not beta-ready** — OpenAI 500 |

### Follow-up

1. Deploy ALE-85/86 AI provider + set Vercel `AI_PROVIDER=xiaomi`, `XIAOMI_*`, hoặc fix OpenAI key/quota.
2. Retest steps 6–10 sau deploy.

---

## ALE-84 — Workspace RLS migration + MVP retest (2026-05-31)

| Field | Value |
|-------|--------|
| **Test date** | 2026-05-31 |
| **Environment** | Production — https://vietnamese-eden-mvp.vercel.app/ |
| **GitHub `main`** | `3dcc31f` (`fix: add workspace owner RLS migration`) + `3153bd3` (migration file + project status docs) |
| **Method** | Playwright MCP production |

### Migration review (`20260531140000_workspace_owner_select.sql`)

| Check | Result |
|-------|--------|
| Chỉ RLS policies | **Yes** — 2× `CREATE POLICY` |
| DROP / DELETE / TRUNCATE data | **No** |
| ALTER schema / bảng khác | **No** |
| An toàn production | **Yes** |

### Migration apply status (Supabase Cloud)

| Status | Evidence |
|--------|----------|
| **APPLIED** | Production retest: signup → workspace UI hiện (`Workspace của …`, **Tạo bảng mới**) — không còn lỗi RLS `workspaces` |

### Production retest MVP (sau migration apply)

| Step | Result | Notes |
|------|--------|-------|
| Login / signup | **PASS** | Signup → `/dashboard` |
| Dashboard | **PASS** | Demo MVP shell |
| Create workspace | **PASS** | Auto hoặc **Tạo workspace** — không lỗi RLS |
| Create board | **PASS** | Board list + open `/boards/[id]` |
| Board detail | **PASS** | Grid load sau "Đang tải bảng…" |
| Add content (text) | **PASS** | Modal **Thêm content** → Paste text → **Lưu vào bảng** |
| Add content (URL) | **NOT RUN** | — |
| AI breakdown | **FAIL** | `OpenAI API lỗi (500): internal_error` — key có vẻ set nhưng API trả 500 |
| Remix + copy/export | **NOT RUN** | Blocked bởi breakdown |
| Voice profile | **NOT RUN** / inconclusive | Session test riêng; cần retest khi AI OK |
| Calendar + refresh | **NOT RUN** | Lịch trống (chưa có output từ remix) |

### AI feature result (ALE-84)

| Test | Result |
|------|--------|
| Breakdown gọi OpenAI | **FAIL** — HTTP 500 `internal_error` từ OpenAI |
| Remix | **NOT RUN** |
| `OPENAI_API_KEY` trên Vercel | **Likely set** (app gọi API, không báo thiếu key) — **quota/model/config issue** |

### Calendar result

**NOT RUN** — không có remix output để đưa vào lịch.

### Bugs found

| ID | Severity | Mô tả |
|----|----------|--------|
| — | **Resolved** | P0 workspace RLS — migration #4 applied |
| **P1** | Blocker AI | OpenAI 500 trên production breakdown |
| P2 | — | Forgot-password `+` email (từ ALE-83) |

### Beta readiness (ALE-84)

| Scope | Verdict |
|-------|---------|
| Marketing + waitlist + auth | **Beta-ready** |
| App shell (workspace → board → content) | **Beta-ready** |
| Full MVP (AI → remix → calendar) | **Not beta-ready** — OpenAI production 500 |

### Owner SQL (reference — đã apply)

File: `supabase/migrations/20260531140000_workspace_owner_select.sql`

### Follow-up

- **ALE-85** (đề xuất): Fix/verify OpenAI trên Vercel → retest breakdown → remix → voice → calendar.

---

## ALE-83 — Full MVP production E2E smoke (2026-05-31)


| Field           | Value                                                                                                                     |
| --------------- | ------------------------------------------------------------------------------------------------------------------------- |
| **Test date**   | 2026-05-31                                                                                                                |
| **Environment** | Production — [https://vietnamese-eden-mvp.vercel.app/](https://vietnamese-eden-mvp.vercel.app/) (Vercel + Supabase Cloud) |
| **Method**      | Playwright MCP (automated forms + navigation)                                                                             |
| **Tester**      | Agent ALE-83                                                                                                              |


### Steps tested — pass/fail


| #    | Flow                                  | Result      | Notes                                                                                                              |
| ---- | ------------------------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------ |
| 1    | Landing `/`                           | **PASS**    | Hero, CTA, sections load                                                                                           |
| 2    | Waitlist                              | **PASS**    | Toast "Đã ghi nhận" (migration `beta_waitlist` OK)                                                                 |
| 3    | Signup                                | **PASS**    | → `/dashboard`                                                                                                     |
| 4    | Email confirmation                    | **N/A**     | Confirm **tắt** trên project dev (session ngay sau signup)                                                         |
| 5    | Login                                 | **PASS**    | Sau `clearCookies`, login → `/dashboard`                                                                           |
| 6    | Forgot password                       | **PARTIAL** | Form submit OK; Supabase reject email có `+` (`Email address … is invalid`) — dùng email không `+` để test recover |
| 7    | Dashboard                             | **PASS**    | Shell + "Bắt đầu demo MVP"                                                                                         |
| 8    | Create board                          | **BLOCKED** | Chưa có workspace                                                                                                  |
| 9–19 | Board → AI → Remix → Voice → Calendar | **NOT RUN** | Blocked bởi workspace bootstrap                                                                                    |
| 20   | Mobile 375px                          | **PASS**    | Landing h1 + CTA + login form visible                                                                              |


### AI feature result


| Test                       | Result                                                                               |
| -------------------------- | ------------------------------------------------------------------------------------ |
| Breakdown (text)           | **NOT RUN** — blocked                                                                |
| URL-only no AI             | **NOT RUN** — blocked                                                                |
| Remix + copy/export        | **NOT RUN** — blocked                                                                |
| Voice profile + remix      | **NOT RUN** — blocked                                                                |
| `OPENAI_API_KEY` on Vercel | **NOT VERIFIED** (no content item created). Health OK; cần retest sau fix workspace. |


### Calendar result

**NOT RUN** — blocked at workspace/board step.

### Mobile result

**PASS (basic)** — 375×812: landing readable, CTA tappable, login form usable. Chưa test board grid / calendar trên mobile (blocked).

### Bugs found


| ID     | Severity | Mô tả                                                                                                                                                               |
| ------ | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **P0** | Blocker  | **Tạo workspace** trên production: `new row violates row-level security policy for table "workspaces"`. User mới không vào được boards → toàn bộ MVP app flow dừng. |
| P2     | Config   | Forgot-password: email dạng `user+tag@domain` bị Supabase Auth recover từ chối.                                                                                     |
| —      | Expected | `handle_new_user` chỉ tạo `profiles`, không auto workspace — cần "Tạo workspace" (hiện fail RLS).                                                                   |


**Root cause (P0):** `INSERT … RETURNING` trên `workspaces` cần policy **SELECT** cho owner sau insert. Policy hiện chỉ `is_workspace_member(id)`; nếu trigger `on_workspace_created` chưa chạy/không đọc được row → client báo lỗi RLS.

**Fix prepared (chưa apply Cloud lúc test):**

- SQL: `supabase/migrations/20260531140000_workspace_owner_select.sql` (`workspaces_select_owner`, `profiles_insert_own`)
- Code: `createDefaultWorkspaceAction` upsert `profiles` trước khi insert workspace

**Owner:** chạy migration #4 trong SQL Editor → redeploy Vercel (code upsert) → **retest ALE-83** steps 8–19.

### Blockers

1. **P0** — Workspace RLS bootstrap (bảng trên).
2. AI E2E chưa verify (phụ thuộc #1).

### Beta readiness conclusion


| Scope                            | Verdict                                                          |
| -------------------------------- | ---------------------------------------------------------------- |
| Landing + waitlist + auth        | **Beta-ready**                                                   |
| Full MVP (board → AI → calendar) | **Not beta-ready** cho đến khi fix workspace trên Cloud + retest |


### Follow-up Linear

- **ALE-84** (đề xuất): Apply `20260531140000_workspace_owner_select.sql` + production retest MVP flow + OpenAI breakdown/remix.

---

## ALE-82 — Waitlist migration + production retest (2026-05-31)

**Deploy tested:** [https://vietnamese-eden-mvp.vercel.app/](https://vietnamese-eden-mvp.vercel.app/)

**Infra:** Migration `20260531120000_beta_waitlist.sql` đã apply trên Supabase Cloud (SQL Editor).

**Phương pháp:** Playwright — fill form + submit (signup/login/waitlist).

### Tóm tắt


| Hạng mục                      | Kết quả                                                                 |
| ----------------------------- | ----------------------------------------------------------------------- |
| Health `/api/health/supabase` | **PASS** — `status: ok`, `supabase.ok: true`                            |
| Waitlist `/#waitlist`         | **PASS** — toast **"Đã ghi nhận — cảm ơn bạn!"**, không còn lỗi migrate |
| Signup `/signup`              | **PASS** — submit → `/dashboard` (email confirm tắt trên project dev)   |
| Login `/login`                | **PASS** — user vừa signup → `/dashboard`                               |
| Form validation               | **PASS** — không có "Invalid input"                                     |
| Forgot-password               | **NOT RUN**                                                             |
| MVP flow (board → calendar)   | **NOT RUN**                                                             |


### Beta readiness (sau ALE-82)


| Verdict                                      | Lý do                                                           |
| -------------------------------------------- | --------------------------------------------------------------- |
| **Sẵn sàng beta công khai (landing + auth)** | Waitlist insert + signup/login OK trên production URL           |
| **Chưa verify**                              | AI breakdown/remix, calendar E2E, mobile 375px, forgot-password |


### Ghi chú tester

- Email waitlist test mẫu: `ale82wl+<timestamp>@example.com`
- Xác nhận row: Supabase Table Editor → `public.beta_waitlist`
- Trùng email: kỳ vọng message tiếng Việt "Email đã tồn tại" (unique index)

---

## ALE-81 — Hotfix form validation (2026-05-31)

**Deploy tested:** [https://vietnamese-eden-mvp.vercel.app/](https://vietnamese-eden-mvp.vercel.app/) (commits `b045245`, `5f3f603` on `main`)

**Phương pháp:** `curl` health + Playwright (fill form fields, submit)

### Tóm tắt


| Hạng mục                      | Kết quả                                                                                         |
| ----------------------------- | ----------------------------------------------------------------------------------------------- |
| Health `/api/health/supabase` | **PASS**                                                                                        |
| Signup `/signup`              | **PASS** — zod messages tiếng Việt; submit → `/dashboard` (email confirm tắt trên Supabase dev) |
| Login `/login`                | **PASS** — đăng nhập user vừa tạo → `/dashboard`                                                |
| Waitlist client validation    | **PASS** — không còn "Invalid input" trên mọi field                                             |
| Waitlist server insert        | **BLOCKED** tại thời điểm ALE-81 — đã **PASS** sau ALE-82 (migration Cloud)                     |
| Forgot-password form          | **NOT RUN** (cùng `auth.ts` + `Input` forwardRef — kỳ vọng PASS)                                |
| MVP flow đầy đủ               | **NOT RUN**                                                                                     |


### Fix đã deploy


| Thay đổi                                   | File                                          |
| ------------------------------------------ | --------------------------------------------- |
| `import { z } from "zod/v4"` cho RHF forms | `src/lib/validations/auth.ts`, `waitlist.ts`  |
| `React.forwardRef` cho input binding       | `src/components/ui/input.tsx`, `textarea.tsx` |
| Gitignore Playwright artifacts             | `.gitignore` → `.playwright-mcp/`             |


**Commits:** `fix: resolve production form validation` · `fix: add forwardRef to Textarea for waitlist form`

### Beta readiness (sau ALE-81)


| Verdict                          | Lý do                                                    |
| -------------------------------- | -------------------------------------------------------- |
| **Sẵn sàng beta hạn chế (auth)** | Signup/login hoạt động trên production                   |
| **Chưa đủ cho waitlist landing** | Migration `beta_waitlist` chưa apply trên Supabase Cloud |


### Follow-up

1. Owner: `supabase db push` / apply migration ALE-77 trên Cloud → retest waitlist success toast
2. **ALE-82**: E2E Playwright production (optional)
3. Dọn repo: `.playwright-mcp/` đã gitignore; có thể xóa artifacts khỏi history commit `b045245` (non-blocking)

---

## ALE-80 — Kết quả chạy thực tế (2026-05-31)

**Deploy tested:** [https://vietnamese-eden-mvp.vercel.app/](https://vietnamese-eden-mvp.vercel.app/) (Vercel Production, Supabase Cloud env đã cấu hình)

**Phương pháp:** `curl` + Playwright MCP (keyboard input trên form)

### Tóm tắt


| Hạng mục                      | Kết quả                                                          |
| ----------------------------- | ---------------------------------------------------------------- |
| Health `/api/health/supabase` | **PASS** — `{"status":"ok","supabase":{"ok":true,"rowCount":1}}` |
| Landing `/`                   | **PASS** — 200, nội dung tiếng Việt đầy đủ                       |
| Auth routes HTTP              | **PASS** — `/login`, `/signup` → 200                             |
| Protected route               | **PASS** — `/dashboard` redirect login (middleware)              |
| Waitlist submit               | **FAIL** trên deploy hiện tại — validation "Invalid input"       |
| Signup / Login                | **FAIL** trên deploy hiện tại — cùng lỗi form                    |
| MVP flow (board → calendar)   | **NOT RUN** — blocked bởi auth/forms                             |


### Blocking bug (production deploy hiện tại)

**Triệu chứng:** Mọi form dùng `zodResolver` (signup, login, waitlist) hiển thị lỗi **"Invalid input"** trên từng field khi submit — không gọi Supabase auth / waitlist insert.

**Nguyên nhân:** Zod v4 schema từ `import { z } from "zod"` không tương thích đúng với `@hookform/resolvers/zod` trong **production bundle** (dev build OK).

**Fix đã verify local (chưa deploy Vercel):**

- `import { z } from "zod/v4"` trong `src/lib/validations/auth.ts`, `waitlist.ts`
- `Input` component `forwardRef` cho react-hook-form

Sau fix, `npm run build` + signup trên `localhost:3020` → **"Kiểm tra email của bạn"** (Supabase signup OK).

**Khuyến nghị:** Deploy fix lên Vercel → chạy lại mục 2–8 checklist bên dưới.

### Beta readiness


| Verdict                          | Lý do                                                  |
| -------------------------------- | ------------------------------------------------------ |
| **Chưa sẵn sàng beta công khai** | Form auth/waitlist broken trên URL production hiện tại |
| **Sẵn sàng sau 1 deploy**        | Supabase + health OK; fix form đã có trên branch local |


### Follow-up Linear gợi ý

1. **ALE-81** (hoặc hotfix): Deploy zod/v4 + Input forwardRef
2. **ALE-82**: E2E Playwright production sau hotfix (cần email confirm hoặc tắt confirm tạm trên Supabase dev)
3. Manual: Owner xác nhận email Supabase + chạy full flow 15 phút

---

## 0. Pre-flight (bắt buộc)


| #   | Kiểm tra                                                                               | Pass?    | Ghi chú                                 |
| --- | -------------------------------------------------------------------------------------- | -------- | --------------------------------------- |
| 0.1 | `curl -s https://vietnamese-eden-mvp.vercel.app/api/health/supabase` → `"status":"ok"` | ☑ ALE-80 | `checkedAt` 2026-05-31                  |
| 0.2 | Vercel env: `NEXT_PUBLIC_SITE_URL=https://vietnamese-eden-mvp.vercel.app`              | ☑        | Giả định owner đã set (health OK)       |
| 0.3 | Vercel env: `AI_USE_MOCK=false` + `OPENAI_API_KEY` set                                 | ☐        | Chưa verify AI trên prod (blocked auth) |
| 0.4 | Supabase redirect: `https://vietnamese-eden-mvp.vercel.app/auth/callback`              | ☐        | Chưa verify signup E2E                  |
| 0.5 | Trình duyệt: Chrome/Edge, cửa sổ ẩn danh (tránh session cũ)                            | ☑        | Playwright                              |


**Probe nhanh (không cần login):**

```bash
curl -s -o NUL -w "landing:%{http_code}\n" https://vietnamese-eden-mvp.vercel.app/
curl -s https://vietnamese-eden-mvp.vercel.app/api/health/supabase
```

---

## 1. Landing page (public)

**URL:** [https://vietnamese-eden-mvp.vercel.app/](https://vietnamese-eden-mvp.vercel.app/)


| #   | Hành động                              | Kỳ vọng                                                  | Pass?    |
| --- | -------------------------------------- | -------------------------------------------------------- | -------- |
| 1.1 | Mở `/`                                 | Hero tiếng Việt, CTA "Dùng thử bản beta" / "Xem demo"    | ☑        |
| 1.2 | Scroll các section                     | Problem, How it works, Features, Use cases, Pricing, FAQ | ☑        |
| 1.3 | Header **Đăng nhập**                   | → `/login`                                               | ☑        |
| 1.4 | **Tham gia beta** / scroll `#waitlist` | Form name / email / use case hiện                        | ☑        |
| 1.5 | Submit waitlist (email test mới)       | Success hoặc lỗi email trùng (tiếng Việt)                | ☑ ALE-82 |
| 1.6 | DevTools Console                       | Không lỗi JS đỏ blocking                                 | ☑        |
| 1.7 | Mobile ~375px                          | Layout đọc được, nút bấm được                            | ☐        |


**Data mẫu waitlist:**

- Họ tên: `Smoke Test`
- Email: `smoke+<ngày>@example.com` (email thật bạn kiểm tra được nếu cần)
- Use case: `Creator beauty TikTok, cần remix caption tiếng Việt cho beta.`

Xác nhận DB (optional): Supabase Table Editor → `beta_waitlist` có 1 row.

---

## 2. Signup / Login


| #   | Hành động                      | Kỳ vọng                                   | Pass?                                                   |
| --- | ------------------------------ | ----------------------------------------- | ------------------------------------------------------- |
| 2.1 | `/signup` — đăng ký user mới   | Form OK, không crash                      | ☑ ALE-82                                                |
| 2.2 | Email confirmation (nếu bật)   | Link mở → `/auth/callback` → `/dashboard` | ☐ (confirm tắt trên dev — signup → dashboard trực tiếp) |
| 2.3 | `/login` — đăng nhập           | Vào `/dashboard`                          | ☑ ALE-82                                                |
| 2.4 | Mở `/dashboard` khi chưa login | Redirect `/login?next=...`                | ☑ (middleware SSR)                                      |
| 2.5 | Google OAuth (nếu đã cấu hình) | Login thành công                          | ☐ / N/A                                                 |


**Lỗi thường gặp:** redirect mismatch → sửa Supabase Redirect URLs.

---

## 3. Dashboard & Boards


| #   | Hành động                                  | Kỳ vọng                         | Pass? |
| --- | ------------------------------------------ | ------------------------------- | ----- |
| 3.1 | `/dashboard`                               | Load shell, không 500           | ☐     |
| 3.2 | CTA tới boards / sidebar **Bảng cảm hứng** | `/boards`                       | ☐     |
| 3.3 | **Tạo board** tên `Smoke Board <date>`     | Board xuất hiện list            | ☐     |
| 3.4 | Mở board detail                            | Grid content trống hoặc có item | ☐     |


Nếu không tạo được board: kiểm tra `handle_new_user` / `workspace_members` (migration #2).

---

## 4. Add content


| #   | Hành động                                       | Kỳ vọng                  | Pass? |
| --- | ----------------------------------------------- | ------------------------ | ----- |
| 4.1 | **Paste text** — dán đoạn tiếng Việt ≥ 50 ký tự | Card content mới         | ☐     |
| 4.2 | **Dán link** — URL TikTok/FB (không text)       | Card "chỉ URL" / hint rõ | ☐     |
| 4.3 | Refresh trang board                             | Items còn                | ☐     |


**Text mẫu:**

```
3 mẹo hook beauty viral: nói lợi ích trong 2 giây, story 15s, CTA comment nhận checklist.
```

---

## 5. AI Breakdown


| #   | Hành động                           | Kỳ vọng                                | Pass? |
| --- | ----------------------------------- | -------------------------------------- | ----- |
| 5.1 | Item **có text** → **Phân tích AI** | `/breakdown/[id]` load                 | ☐     |
| 5.2 | Chạy phân tích                      | Hook, Angle, Structure, CTA hiển thị   | ☐     |
| 5.3 | Item **URL-only** → breakdown       | Banner vàng, không gọi AI / message rõ | ☐     |
| 5.4 | Thiếu `OPENAI_API_KEY` (nếu test)   | Message tiếng Việt, app không crash    | ☐     |


---

## 6. Remix Generator


| #   | Hành động                          | Kỳ vọng              | Pass? |
| --- | ---------------------------------- | -------------------- | ----- |
| 6.1 | Từ breakdown → **Tạo remix**       | `/remix/[id]`        | ☐     |
| 6.2 | Chọn format + tone, tạo 5 biến thể | ≥1 output hiển thị   | ☐     |
| 6.3 | **Copy** một output                | Toast / clipboard OK | ☐     |
| 6.4 | **Export .txt** hoặc .md           | File tải về          | ☐     |


---

## 7. Voice profile


| #   | Hành động                      | Kỳ vọng                          | Pass? |
| --- | ------------------------------ | -------------------------------- | ----- |
| 7.1 | `/voice` → tạo profile mới     | Form + lưu thành công            | ☐     |
| 7.2 | Dán ≥500 ký tự mẫu caption TV  | Summary / tone hiển thị          | ☐     |
| 7.3 | Remix lại content đã breakdown | Chọn voice profile → outputs mới | ☐     |


---

## 8. Content Calendar


| #   | Hành động                          | Kỳ vọng                     | Pass? |
| --- | ---------------------------------- | --------------------------- | ----- |
| 8.1 | Từ remix output → **Đưa vào lịch** | Chọn ngày + kênh → toast OK | ☐     |
| 8.2 | `/calendar`                        | Item scheduled hiển thị     | ☐     |
| 8.3 | **Hard refresh** (F5)              | Item vẫn còn                | ☐     |
| 8.4 | Đổi trạng thái (vd. Đã đăng)       | UI cập nhật                 | ☐     |


---

## 9. Regression nhanh (routes)


| Route                        | Kỳ vọng                           | Pass? |
| ---------------------------- | --------------------------------- | ----- |
| `/login`                     | 200                               | ☐     |
| `/signup`                    | 200                               | ☐     |
| `/forgot-password`           | 200                               | ☐     |
| `/` (logged out)             | Landing, không redirect dashboard | ☐     |
| `/pricing` (logged in)       | App shell, không 404              | ☐     |
| `/breakdown`, `/remix` (hub) | Hub + CTA boards                  | ☐     |


---

## 10. Kết quả smoke test


| Môi trường                       | Ngày       | Tester       | Kết quả                                |
| -------------------------------- | ---------- | ------------ | -------------------------------------- |
| Production (Vercel)              | 2026-05-31 | Agent ALE-80 | **Fail** — forms broken; infra OK      |
| Production (Vercel)              | 2026-05-31 | Agent ALE-82 | **Pass** — waitlist + signup + login   |
| Local prod build :3020 (sau fix) | 2026-05-31 | Agent ALE-80 | Signup → email confirm screen **Pass** |


**Blocking issues (ghi ID Linear nếu có):**

1. **Zod + zodResolver trên production bundle** — signup/login/waitlist → "Invalid input" (fix: `zod/v4` import, chưa deploy)

**Non-blocking / follow-up:**

1. Mobile 375px chưa test
2. AI breakdown/remix/calendar — chờ auth fix + deploy
3. Tắt email confirm tạm trên Supabase dev để E2E tự động hóa

---

## 11. So sánh local demo


|          | Local (`AI_USE_MOCK=true`) | Production Vercel                        |
| -------- | -------------------------- | ---------------------------------------- |
| AI       | Mock                       | OpenAI thật (cần key)                    |
| Supabase | `127.0.0.1:54321`          | Cloud project                            |
| Site URL | `http://127.0.0.1:3000`    | `https://vietnamese-eden-mvp.vercel.app` |


Script demo ngắn local: [demo-script.md](./demo-script.md)