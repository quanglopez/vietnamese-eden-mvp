# Production & Vercel environment variables

Tham chiếu đầy đủ cho deploy beta. Copy tên biến vào Vercel → **Settings** → **Environment Variables**. **Không** commit giá trị thật.

---

## Bắt buộc (Vercel Production + Preview)

| Variable | Scope | Mô tả | Ví dụ placeholder |
|----------|-------|--------|-------------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Production, Preview | Supabase Project URL | `https://xxxxxxxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Production, Preview | Anon public key | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `NEXT_PUBLIC_SITE_URL` | Production, Preview | URL gốc app (auth email + callback server-side) | Production: `https://your-app.vercel.app` |
| `OPENAI_API_KEY` | Production, Preview | OpenAI API key (server-only) | `sk-...` |
| `AI_USE_MOCK` | Production | Phải `false` | `false` |
| `AI_USE_MOCK` | Preview | `false` (mock không chạy trên Vercel) | `false` |

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
| `OPENAI_MODEL` | All | Model OpenAI | `gpt-4o-mini` |

---

## Tuỳ chọn (app hiện không bắt buộc runtime)

| Variable | Khi nào cần |
|----------|-------------|
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
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4o-mini
```

File mẫu: [.env.example](../.env.example)

---

## Vercel — gợi ý cấu hình nhanh

### Production

```
NEXT_PUBLIC_SUPABASE_URL=https://<ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon>
NEXT_PUBLIC_SITE_URL=https://<your-production-domain>
OPENAI_API_KEY=<secret>
AI_USE_MOCK=false
OPENAI_MODEL=gpt-4o-mini
```

### Preview (cùng Supabase dev)

```
NEXT_PUBLIC_SUPABASE_URL=https://<ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon>
NEXT_PUBLIC_SITE_URL=https://<main-preview-or-prod-url>
OPENAI_API_KEY=<secret>
AI_USE_MOCK=false
OPENAI_MODEL=gpt-4o-mini
```

Đánh dấu **Sensitive** cho `OPENAI_API_KEY` và mọi service role key.

---

## Hành vi khi thiếu biến

| Thiếu | Hành vi |
|-------|---------|
| Supabase URL/anon | Auth/app DB lỗi; `/api/health/supabase` → 503 |
| `OPENAI_API_KEY` (Vercel) | Breakdown/Remix/Voice trả lỗi tiếng Việt qua `AiProviderError` |
| `AI_USE_MOCK=true` trên Vercel | **Không** có hiệu lực (production NODE_ENV) |
| Migration waitlist chưa apply | Waitlist form: message migrate, không crash |

---

## Security checklist

- [ ] Không commit `.env.local`
- [ ] Không log `OPENAI_API_KEY` / `service_role`
- [ ] Vercel: chỉ team members có quyền xem env
- [ ] Supabase: RLS bật trên mọi bảng app (trừ waitlist insert-only)
- [ ] Dùng project Supabase **dev** tách biệt production sau này
