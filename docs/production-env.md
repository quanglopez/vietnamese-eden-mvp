# Production & Vercel environment variables

**App URL:** https://vietnamese-eden-mvp.vercel.app/

Tham chiếu đầy đủ cho deploy beta. Copy tên biến vào Vercel → **Settings** → **Environment Variables**. **Không** commit giá trị thật.

Setup Supabase Cloud: [supabase-cloud-setup.md](./supabase-cloud-setup.md)

---

## Bắt buộc (Vercel Production + Preview)

| Variable | Scope | Mô tả | Ví dụ placeholder |
|----------|-------|--------|-------------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Production, Preview | Supabase Project URL | `https://xxxxxxxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Production, Preview | Anon public key | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `NEXT_PUBLIC_SITE_URL` | Production, Preview | URL gốc app (auth email + callback server-side) | Production: `https://your-app.vercel.app` |
| `AI_PROVIDER` | Production, Preview | `xiaomi` (mặc định prod) hoặc `openai` (rollback) | `xiaomi` |
| `AI_USE_MOCK` | Production, Preview | Phải `false` | `false` |
| `AI_MODEL` | Production, Preview | Model AI (Xiaomi: `mimo-v2.5`) | `mimo-v2.5` |
| `XIAOMI_API_KEY` | Production, Preview | Khi `AI_PROVIDER=xiaomi` | *(Sensitive)* |
| `XIAOMI_BASE_URL` | Production, Preview | Base OpenAI-compatible (không hardcode trong app) | `https://api.xiaomimimo.com/v1` *(xác nhận trên Xiaomi dashboard)* |

### OpenAI fallback (rollback)

| Variable | Khi nào |
|----------|---------|
| `OPENAI_API_KEY` | Bắt buộc khi `AI_PROVIDER=openai` |
| `OPENAI_MODEL` | Tuỳ chọn; default `gpt-4o-mini` |

### `NEXT_PUBLIC_SITE_URL` theo môi trường

| Môi trường | Giá trị |
|------------|---------|
| Local | `http://127.0.0.1:3000` |
| Vercel Production | URL production cố định (custom domain hoặc `*.vercel.app` production) |
| Vercel Preview | **Khuyến nghị:** set URL preview chính, hoặc dùng [Vercel System Environment Variables](https://vercel.com/docs/projects/environment-variables/system-environment-variables) |

**Client auth:** `getAuthCallbackUrl()` dùng `window.location.origin` trên browser → OAuth/email từ client thường khớp domain đang mở. **Server** vẫn cần `NEXT_PUBLIC_SITE_URL` đúng nếu có logic build URL phía server.

Preview deployments có URL động (`xxx-git-branch-team.vercel.app`). Cần:

1. Thêm từng preview URL vào Supabase **Redirect URLs**, **hoặc**
2. Wildcard `https://*.vercel.app/**` (nếu project Supabase hỗ trợ), **và**
3. Cân nhắc `NEXT_PUBLIC_SITE_URL` per-preview (Vercel cho phép override) hoặc chỉ test auth trên Production URL.

---

## Khuyến nghị

| Variable | Scope | Mô tả | Default |
|----------|-------|--------|---------|
| `AI_MODEL` | All | Override model | `mimo-v2.5` (xiaomi) / `gpt-4o-mini` (openai) |
| `OPENAI_MODEL` | openai only | Legacy override nếu không set `AI_MODEL` | `gpt-4o-mini` |

---

## Tuỳ chọn (app hiện không bắt buộc runtime)

| Variable | Khi nào cần |
|----------|-------------|
| `OPENAI_BASE_URL` | Proxy / Azure OpenAI khi `AI_PROVIDER=openai` |
| `SUPABASE_SERVICE_ROLE_KEY` | Script admin / bypass RLS — **không** dùng trong route app hiện tại |
| `SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID` | Supabase **local** (`config.toml`) |
| `SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET` | Supabase **local** — Cloud config Google trên Dashboard |

---

## Local development only (`.env.local`)

```env
NEXT_PUBLIC_SITE_URL=http://127.0.0.1:3000
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<from supabase status>
SUPABASE_SERVICE_ROLE_KEY=<from supabase status>
AI_USE_MOCK=true
# Khi test Xiaomi local (AI_USE_MOCK=false):
# AI_PROVIDER=xiaomi
# XIAOMI_API_KEY=...
# XIAOMI_BASE_URL=https://api.xiaomimimo.com/v1
# AI_MODEL=mimo-v2.5
```

File mẫu: [.env.example](../.env.example)

---

## Vercel — gợi ý cấu hình nhanh

### Production (Xiaomi MiMo — ALE-85/86)

```
NEXT_PUBLIC_SUPABASE_URL=https://<ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon>
NEXT_PUBLIC_SITE_URL=https://<your-production-domain>
AI_PROVIDER=xiaomi
AI_USE_MOCK=false
AI_MODEL=mimo-v2.5
XIAOMI_API_KEY=<secret>
XIAOMI_BASE_URL=https://api.xiaomimimo.com/v1
```

### Rollback OpenAI

```
AI_PROVIDER=openai
AI_USE_MOCK=false
OPENAI_API_KEY=<secret>
OPENAI_MODEL=gpt-4o-mini
```

Đánh dấu **Sensitive** cho `XIAOMI_API_KEY`, `OPENAI_API_KEY`, và mọi service role key.

---

## Hành vi khi thiếu biến

| Thiếu | Hành vi |
|-------|---------|
| Supabase URL/anon | Auth/app DB lỗi; `/api/health/supabase` → 503 |
| `XIAOMI_API_KEY` hoặc `XIAOMI_BASE_URL` khi `AI_PROVIDER=xiaomi` | Message: *XIAOMI_BASE_URL hoặc Xiaomi API contract chưa được cấu hình* — app không crash |
| `OPENAI_API_KEY` khi `AI_PROVIDER=openai` | Breakdown/Remix/Voice trả lỗi tiếng Việt qua `AiProviderError` |
| `AI_USE_MOCK=true` trên Vercel | **Không** có hiệu lực (production NODE_ENV) |
| Migration waitlist chưa apply | Waitlist form: message migrate, không crash |

Code: `src/lib/ai/provider.ts` — mock chỉ khi `AI_USE_MOCK=true` **và** `NODE_ENV !== "production"`.

---

## Security checklist

- [ ] Không commit `.env.local`
- [ ] Không log `XIAOMI_API_KEY` / `OPENAI_API_KEY` / `service_role`
- [ ] Vercel: chỉ team members có quyền xem env
- [ ] Supabase: RLS bật trên mọi bảng app (trừ waitlist insert-only)
- [ ] Dùng project Supabase **dev** tách biệt production sau này
