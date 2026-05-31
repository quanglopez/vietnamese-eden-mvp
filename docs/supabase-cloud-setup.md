# Supabase Cloud setup — kết nối Vercel dev/beta

**Production URL (Vercel):** https://vietnamese-eden-mvp.vercel.app/

**Repo:** https://github.com/quanglopez/vietnamese-eden-mvp

Tài liệu này hướng dẫn owner tạo **Supabase Cloud dev project**, apply migrations, cấu hình auth, và paste env vào Vercel. Agent **không** deploy Supabase nếu chưa có credentials.

Liên quan: [deploy-checklist.md](./deploy-checklist.md) · [production-env.md](./production-env.md) · [production-smoke-test.md](./production-smoke-test.md)

---

## 0. Trạng thái hiện tại (ALE-79)

| Thành phần | Trạng thái |
|------------|------------|
| Vercel deploy | ✅ https://vietnamese-eden-mvp.vercel.app/ trả 200 |
| Supabase trên Vercel | ❌ `GET /api/health/supabase` báo thiếu env (cần owner cấu hình) |
| Local Supabase | ✅ Migrations trong `supabase/migrations/` |

---

## 1. Migrations cần apply (đọc từ repo)

Chạy **đúng thứ tự** — không bỏ file, không đảo thứ tự.

| # | File | Mục đích |
|---|------|----------|
| 1 | `supabase/migrations/20260530120000_health_check.sql` | Bảng `health_check` + RLS (probe kết nối) |
| 2 | `supabase/migrations/20260530130000_initial_schema.sql` | Schema MVP: enums, 10 bảng, RLS, triggers |
| 3 | `supabase/migrations/20260531120000_beta_waitlist.sql` | Bảng `beta_waitlist` (landing form, insert-only) |

### Schema MVP (sau migration #2)

**Enums:** `platform_type`, `workspace_role`, `analysis_status`, `output_status`, `calendar_status`

**Bảng:**

| Bảng | Vai trò |
|------|---------|
| `profiles` | Profile user (link `auth.users`) |
| `workspaces` | Workspace cá nhân/agency |
| `workspace_members` | Thành viên + role |
| `boards` | Bảng cảm hứng / swipe board |
| `content_items` | Nội dung (text/URL) |
| `board_content_items` | Liên kết item ↔ board |
| `content_analyses` | Kết quả AI Breakdown |
| `voice_profiles` | Giọng văn |
| `generated_outputs` | Output Remix |
| `content_calendar_items` | Lịch đăng |

**Triggers quan trọng:**

- `on_auth_user_created` → `handle_new_user()` — tạo `profiles` + workspace khi signup
- `handle_new_workspace()` — thêm owner vào `workspace_members`

**Bảng thêm (migration #3):** `beta_waitlist` — RLS cho phép `anon` insert, không public read.

---

## 2. Checklist — tạo Supabase Cloud dev project

### Bước 1 — Project

- [ ] Đăng nhập https://supabase.com/dashboard
- [ ] **New project**
  - Name: `vietnamese-eden-dev` (hoặc tên team)
  - Database password: lưu password manager (**không** commit)
  - Region: `Southeast Asia (Singapore)` hoặc gần user nhất
- [ ] Đợi trạng thái **Active**
- [ ] Ghi **Project ref** (Settings → General) cho CLI

### Bước 2 — Apply migrations

**Cách A — Supabase CLI (khuyến nghị)**

```bash
cd vietnamese-eden-mvp
npx supabase login
npx supabase link --project-ref <YOUR_PROJECT_REF>
npx supabase db push
```

**Cách B — SQL Editor (Dashboard)**

1. Mở **SQL Editor** → New query
2. Copy/paste **toàn bộ** nội dung file migration #1 → Run
3. Lặp lại cho file #2, rồi #3
4. Nếu lỗi “already exists” — project đã có schema; dùng project mới hoặc repair thủ công

### Bước 3 — Xác minh schema

Dashboard → **Table Editor**:

- [ ] `profiles`, `workspaces`, `boards`, `content_items`
- [ ] `content_analyses`, `voice_profiles`, `generated_outputs`, `content_calendar_items`
- [ ] `beta_waitlist`
- [ ] `health_check`

Dashboard → **Database** → **Policies**: RLS **enabled** trên các bảng trên.

### Bước 4 — Auth settings

**Authentication** → **Providers**

- [ ] **Email** enabled (confirm email: bật/tắt theo nhu cầu beta)
- [ ] **Google** — *optional*; không bắt buộc MVP

**Authentication** → **URL Configuration**

| Field | Giá trị |
|-------|---------|
| **Site URL** | `https://vietnamese-eden-mvp.vercel.app` |

**Redirect URLs** — thêm từng dòng (Save):

```
https://vietnamese-eden-mvp.vercel.app/auth/callback
http://127.0.0.1:3000/auth/callback
http://localhost:3000/auth/callback
```

**Vercel Preview (nếu test PR):**

```
https://*.vercel.app/**
```

Hoặc thêm URL preview cụ thể, ví dụ:

```
https://vietnamese-eden-mvp-git-main-quanglopez.vercel.app/auth/callback
```

> Supabase khớp redirect **chính xác** hoặc theo wildcard tùy cấu hình project. Nếu OAuth/email báo `redirect_uri_mismatch`, thêm đúng URL đang dùng.

### Bước 5 — Lấy API keys

**Project Settings** → **API**

| Copy vào Vercel | Field |
|-----------------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `anon` `public` |
| `SUPABASE_SERVICE_ROLE_KEY` | `service_role` *(optional — app routes hiện **không** dùng)* |

---

## 3. Cấu hình Vercel Environment Variables

Project: **vietnamese-eden-mvp** → Settings → Environment Variables.

### Production (bắt buộc)

| Variable | Value | Sensitive |
|----------|-------|-----------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://<ref>.supabase.co` | No |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon key từ Supabase | No |
| `NEXT_PUBLIC_SITE_URL` | `https://vietnamese-eden-mvp.vercel.app` | No |
| `OPENAI_API_KEY` | OpenAI secret key | **Yes** |
| `AI_USE_MOCK` | `false` | No |
| `OPENAI_MODEL` | `gpt-4o-mini` | No |

### Preview (nếu dùng)

- Cùng Supabase dev project **hoặc** project riêng (team quyết định)
- `NEXT_PUBLIC_SITE_URL` = URL preview chính **hoặc** production URL nếu chỉ test auth trên prod
- `AI_USE_MOCK` = `false` (Vercel luôn `NODE_ENV=production` → mock **không** chạy)

### Không bắt buộc runtime

| Variable | Ghi chú |
|----------|---------|
| `SUPABASE_SERVICE_ROLE_KEY` | Chỉ script admin tương lai; không cần cho app hiện tại |

Sau khi save env → **Redeploy** Production (Deployments → … → Redeploy).

---

## 4. Xác minh kết nối (sau redeploy)

```bash
# Kỳ vọng: status ok
curl -s https://vietnamese-eden-mvp.vercel.app/api/health/supabase
```

```json
{ "status": "ok", "supabase": { ... } }
```

Nếu vẫn lỗi:

- Kiểm tra env đã gán đúng **Production** environment
- Redeploy xong chưa
- URL/anon key copy đủ, không có khoảng trắng thừa

Tiếp theo: chạy [production-smoke-test.md](./production-smoke-test.md).

---

## 5. Google OAuth (optional)

Không bắt buộc cho beta email/password.

Nếu bật:

1. Google Cloud Console → OAuth 2.0 Client
2. Authorized redirect URI: `https://<PROJECT_REF>.supabase.co/auth/v1/callback`
3. Supabase Dashboard → Authentication → Google → Client ID + Secret
4. Thêm redirect app: `https://vietnamese-eden-mvp.vercel.app/auth/callback`

Biến `SUPABASE_AUTH_EXTERNAL_GOOGLE_*` trong `.env.example` dùng cho **local** `config.toml`, không thay Dashboard Cloud.

---

## 6. Bảo mật & vận hành

- [ ] Không commit `.env.local` / service role vào git
- [ ] Dùng project **dev** tách khỏi production data sau này
- [ ] Không restore dump production vào dev
- [ ] Rotate key nếu lỡ lộ `service_role` hoặc `OPENAI_API_KEY`
- [ ] Waitlist: chỉ insert public; đọc waitlist qua Dashboard hoặc service role

---

## 7. Troubleshooting

| Triệu chứng | Nguyên nhân / fix |
|-------------|-------------------|
| Health API: Supabase chưa cấu hình | Thiếu env trên Vercel → thêm + redeploy |
| Signup OK nhưng không có board | Migration #2 chưa chạy / trigger `handle_new_user` lỗi |
| `redirect_uri_mismatch` | Thêm URL `/auth/callback` đúng domain |
| Waitlist: bảng chưa migrate | Chạy migration #3 |
| AI lỗi thiếu key | Set `OPENAI_API_KEY`, `AI_USE_MOCK=false` |
| Email confirm không về | Supabase Auth templates / SMTP (Cloud mặc định có giới hạn) |

---

## 8. Owner checklist (tóm tắt 1 trang)

1. [ ] Tạo Supabase project dev  
2. [ ] `db push` 3 migrations  
3. [ ] Site URL + Redirect URLs (Vercel + local)  
4. [ ] Paste 4 env bắt buộc vào Vercel + redeploy  
5. [ ] `curl` health → `ok`  
6. [ ] Chạy production smoke test doc  
