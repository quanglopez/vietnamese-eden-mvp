# Auth (ALE-64)

## Routes

| Route | Mô tả |
|-------|--------|
| `/login` | Email/password + Google OAuth |
| `/signup` | Đăng ký + email confirmation |
| `/forgot-password` | Gửi link reset mật khẩu |
| `/auth/callback` | OAuth + email confirmation callback |
| `/dashboard` | Protected — redirect `/login` nếu chưa auth |

## Local setup

1. `npm run supabase:start` (hoặc `supabase stop` rồi `start` sau khi đổi config)
2. Email confirmation: xem Mailpit tại http://127.0.0.1:54324
3. Google OAuth (optional): tạo OAuth client tại Google Cloud Console
   - Authorized redirect URI: `http://127.0.0.1:54321/auth/v1/callback`
   - Thêm vào `.env.local`:
     ```
     SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID=...
     SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET=...
     ```
   - Restart Supabase: `npx supabase stop && npx supabase start`

## Test flow

```bash
# Đăng ký → email trong Mailpit → click link → /dashboard
npm run dev

# Protected route redirect
curl -I http://localhost:3000/dashboard  # → 307 /login
```
