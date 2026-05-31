# Deploy checklist — Vercel + Supabase Cloud (dev/beta)

Repo: https://github.com/quanglopez/vietnamese-eden-mvp

Mục tiêu: bản **beta/dev** trên Vercel, database **Supabase Cloud** (project dev riêng — không dùng production data thật).

**Production URL:** https://vietnamese-eden-mvp.vercel.app/

**Chi tiết Supabase + smoke test:** [supabase-cloud-setup.md](./supabase-cloud-setup.md) · [production-smoke-test.md](./production-smoke-test.md)

> **Lưu ý:** Checklist này không chứa secret. Mọi key chỉ nhập trong Supabase Dashboard / Vercel Environment Variables.

---

## A. Pre-deploy audit (local)

Chạy trên máy dev trước khi import Vercel:

```bash
npm run lint
npm run type-check
npm run build
```

| Kiểm tra | Kỳ vọng |
|----------|---------|
| `package.json` scripts | `build`, `lint`, `type-check` có sẵn |
| Build | `next build` pass, không lỗi TypeScript |
| `.env.local` | **Không** commit; copy từ `.env.example` |
| Secrets trong git | `git status` không có `.env.local`; `git diff` không có API key |

**Kết quả audit (cập nhật khi làm issue ALE-78):** chạy lại ba lệnh trên trước mỗi deploy.

---

## B. Supabase Cloud — dev project

### B.1 Tạo project (checklist)

- [ ] Đăng nhập [Supabase Dashboard](https://supabase.com/dashboard)
- [ ] **New project** → tên gợi ý: `vietnamese-eden-dev`
- [ ] Region gần VN (vd. `ap-southeast-1` Singapore)
- [ ] Lưu **database password** vào password manager (không commit)
- [ ] Chờ project **Active**

### B.2 Chạy migrations (theo thứ tự)

Áp dụng toàn bộ file trong `supabase/migrations/`:

| # | File | Nội dung |
|---|------|----------|
| 1 | `20260530120000_health_check.sql` | Bảng health check |
| 2 | `20260530130000_initial_schema.sql` | Schema MVP (10 bảng + RLS + triggers `handle_new_user`) |
| 3 | `20260531120000_beta_waitlist.sql` | Beta waitlist (public insert-only) |

**Cách apply (chọn một):**

```bash
# CLI (khuyến nghị) — sau khi supabase link
npx supabase link --project-ref <PROJECT_REF>
npx supabase db push
```

Hoặc: Dashboard → **SQL Editor** → chạy lần lượt từng migration file (chỉ khi không dùng CLI).

- [ ] Xác nhận bảng: `profiles`, `workspaces`, `boards`, `content_items`, `beta_waitlist`, …
- [ ] **Không** import/restore dump production vào project dev

### B.3 Env vars lấy từ Supabase Cloud

Dashboard → **Project Settings** → **API**:

| Vercel / `.env` key | Supabase field |
|---------------------|----------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `anon` `public` key |
| `SUPABASE_SERVICE_ROLE_KEY` | `service_role` key (optional — app runtime **chưa** dùng) |

### B.4 Auth redirect URLs (Dashboard)

**Authentication** → **URL Configuration**:

| Mục | Giá trị gợi ý |
|-----|----------------|
| **Site URL** | URL chính của app (xem bảng dưới) |
| **Redirect URLs** | Thêm từng URL **chính xác** (và wildcard nếu team bật) |

**Danh sách cần cấu hình:**

| Môi trường | Site URL (gợi ý) | Redirect URL |
|------------|------------------|----------------|
| Local dev | `http://127.0.0.1:3000` | `http://127.0.0.1:3000/auth/callback` |
| Local alt | — | `http://localhost:3000/auth/callback` |
| Vercel Production | `https://<production-domain>` | `https://<production-domain>/auth/callback` |
| Vercel Preview | `https://<branch>-<team>.vercel.app` | `https://<branch>-<team>.vercel.app/auth/callback` |

Gợi ý wildcard (nếu Supabase project cho phép): `https://*.vercel.app/**`

**Email confirmation / reset password:** Supabase gửi link về Site URL; đảm bảo `NEXT_PUBLIC_SITE_URL` trên Vercel khớp domain user mở app.

### B.5 Google OAuth (optional)

- **Không bắt buộc** cho beta — email/password đủ cho MVP.
- Nếu bật: Google Cloud Console → OAuth client → Authorized redirect URI:
  - `https://<PROJECT_REF>.supabase.co/auth/v1/callback`
- Supabase → **Authentication** → **Providers** → Google → bật + dán Client ID/Secret.
- App `.env` (`SUPABASE_AUTH_EXTERNAL_*`) chủ yếu cho **Supabase local** trong `config.toml`; Cloud cấu hình trên Dashboard.

### B.6 Beta waitlist trên Cloud

- Cần migration `beta_waitlist` đã apply.
- Form landing dùng **anon insert** (RLS) — không cần `SERVICE_ROLE` cho waitlist.
- Nếu chưa migrate: form báo lỗi rõ (không crash app).

### B.7 Smoke test Supabase (sau migrate)

```bash
# Cập nhật .env.local trỏ Cloud dev, rồi:
npm run supabase:test
npm run auth:test   # optional
```

Hoặc mở: `GET https://<vercel-domain>/api/health/supabase`

---

## C. Vercel deploy

### C.1 Import repo

- [ ] [Vercel Dashboard](https://vercel.com) → **Add New** → **Project**
- [ ] Import `quanglopez/vietnamese-eden-mvp`
- [ ] Framework: **Next.js** (auto-detect)
- [ ] Root Directory: `.` (repo root)

### C.2 Build settings

| Setting | Value |
|---------|--------|
| Build Command | `npm run build` (default) |
| Output Directory | `.next` (default Next.js) |
| Install Command | `npm install` |
| Node.js Version | 20.x (khuyến nghị) |

Không cần `vercel.json` cho MVP — App Router mặc định đủ.

### C.3 Environment variables

Xem chi tiết: [docs/production-env.md](./production-env.md)

**Production (Vercel Production):**

- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `NEXT_PUBLIC_SITE_URL` = URL production (vd. `https://vietnamese-eden.vercel.app`)
- [ ] `AI_PROVIDER` = `xiaomi` (hoặc `openai` rollback)
- [ ] `AI_USE_MOCK` = `false`
- [ ] `AI_MODEL` = `mimo-v2.5`
- [ ] `XIAOMI_API_KEY` + `XIAOMI_BASE_URL` (khi dùng xiaomi)
- [ ] `OPENAI_API_KEY` (chỉ khi `AI_PROVIDER=openai`)

**Preview (Vercel Preview):**

- [ ] Cùng Supabase dev project **hoặc** project preview riêng (team quyết định)
- [ ] `NEXT_PUBLIC_SITE_URL` = **URL preview cố định** hoặc set per-deployment trong Vercel (xem production-env.md)
- [ ] `AI_PROVIDER` + Xiaomi hoặc OpenAI keys (xem mục AI bên dưới)
- [ ] Không set `AI_USE_MOCK=true` expecting mock trên Vercel

> **Quan trọng:** Trên Vercel, `NODE_ENV=production` kể cả Preview → `AI_USE_MOCK=true` **không** bật mock. Phải cấu hình provider thật (`xiaomi` hoặc `openai`).

### C.4 Deploy

- [ ] Deploy **Preview** từ branch `main` hoặc PR
- [ ] Sau khi ổn → promote / deploy **Production**
- [ ] **Không** hardcode secret trong repo hoặc `vercel.json`

### C.5 Smoke test sau deploy

| # | Bước | Kỳ vọng |
|---|------|---------|
| 1 | Mở `/` | Landing tiếng Việt, waitlist form |
| 2 | Submit waitlist | Success hoặc lỗi email trùng / migrate rõ |
| 3 | `/signup` → xác nhận email (nếu bật) | Redirect `/auth/callback` → `/dashboard` |
| 4 | `/login` | Vào app |
| 5 | Tạo board → content → breakdown | AI chạy (có key) hoặc message thiếu key |
| 6 | `/api/health/supabase` | `{ "status": "ok" }` |
| 7 | Mobile width ~375px | Landing + login readable |

Chi tiết demo app: [docs/demo-script.md](./demo-script.md)

---

## D. AI production readiness

| Env | `AI_USE_MOCK` | `AI_PROVIDER` | Hành vi |
|-----|---------------|---------------|---------|
| Local dev | `true` | any | Mock provider |
| Local dev | `false` | `xiaomi` | Xiaomi (cần `XIAOMI_*`) |
| Local dev | `false` | `openai` | OpenAI (cần `OPENAI_API_KEY`) |
| Vercel (Preview/Prod) | `false` | `xiaomi` / `openai` | Provider thật; thiếu config → message tiếng Việt, không crash |

Code: `src/lib/ai/provider.ts` — mock chỉ khi `AI_USE_MOCK=true` **và** `NODE_ENV !== "production"`.

---

## E. Không làm trong issue deploy

- Stripe / billing
- Auto-posting MXH
- URL scraping
- Deploy tự động nếu chưa có quyền Vercel/Supabase (cần owner xác nhận)

---

## F. Rollback / troubleshooting

| Triệu chứng | Gợi ý |
|-------------|--------|
| Auth redirect mismatch | Thêm đúng `/auth/callback` URL trên Supabase |
| `Invalid login credentials` | User chưa confirm email / sai project Supabase |
| Waitlist lỗi bảng | `supabase db push` migration waitlist |
| AI luôn lỗi trên Vercel | Kiểm tra `AI_PROVIDER`, `XIAOMI_*` hoặc `OPENAI_API_KEY`; không rely `AI_USE_MOCK` |
| Rollback AI | `AI_PROVIDER=openai` + `OPENAI_API_KEY` trên Vercel |
| Build fail trên Vercel | Chạy `npm run build` local; xem log env thiếu |

---

## G. Owner actions (deploy thật)

Cần bạn (project owner) cung cấp / thực hiện:

1. Quyền **Vercel** import repo `quanglopez/vietnamese-eden-mvp`
2. **Supabase Cloud** project dev + chạy migrations
3. Paste env vars vào Vercel (không gửi key qua chat công khai)
4. Cấu hình auth redirect URLs cho domain Vercel
5. Xiaomi MiMo: `XIAOMI_API_KEY`, `XIAOMI_BASE_URL`, `AI_PROVIDER=xiaomi` (hoặc OpenAI rollback)

Agent **không** tự deploy khi chưa có credentials / xác nhận.
