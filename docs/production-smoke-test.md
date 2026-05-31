# Production smoke test — Vercel + Supabase Cloud

**Base URL:** [https://vietnamese-eden-mvp.vercel.app/](https://vietnamese-eden-mvp.vercel.app/)

Chạy sau khi hoàn tất [supabase-cloud-setup.md](./supabase-cloud-setup.md) (env Vercel + migrations + auth URLs).

**Thời gian ước tính:** 20–30 phút (lần đầu, gồm signup/email).

**Không cần** commit secret. Dùng tài khoản test riêng.

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