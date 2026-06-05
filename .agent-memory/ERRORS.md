# Error Log — Vietnamese Eden MVP

Ghi lại lỗi đáng nhớ để tránh lặp lại.

Format: Error | Context | Root Cause | Fix | Prevention

---

## dotenv truncate value at `#`

**Error**: Password `Cao@#123` bị truncate thành `Cao@`.

**Context**: Đọc `.env.browser-use` bằng dotenv, password chứa ký tự `#`.

**Root cause**: `dotenv` xem `#` là inline comment, cắt mọi thứ sau nó.

**Fix**: Quote giá trị trong `.env`: `BROWSER_USE_TEST_PASSWORD="Cao@#123"`.

**Prevention**: Luôn quote value chứa `#` trong `.env` files.

---

## Vercel Preview missing SUPABASE_SERVICE_ROLE_KEY

**Error**: "Thiếu NEXT_PUBLIC_SUPABASE_URL hoặc SUPABASE_SERVICE_ROLE_KEY trong .env.local".

**Context**: ALE-176 preview smoke test. Dashboard render nhưng data không load.

**Root cause**: Vercel Preview environment không tự động kế thừa env vars từ Production.

**Fix**: Thêm `SUPABASE_SERVICE_ROLE_KEY` vào Vercel Dashboard → Project Settings → Environment Variables → Preview.

**Prevention**: Sau mỗi lần thêm env var mới, kiểm tra cả 3 environment (Production, Preview, Development) trên Vercel.

---

## CodeRabbit review pending

**Error/Note**: CodeRabbit check hiển thị "pending" sau khi mark ready.

**Context**: PR #23 sau khi mark ready, CodeRabbit bắt đầu review (bình thường).

**Root cause**: Không phải lỗi — CodeRabbit cần thời gian để chạy review.

**Fix**: Không cần fix. Đợi CodeRabbit hoàn thành hoặc merge nếu review từ bot không blocking.

**Prevention**: N/A — đây là hành vi bình thường.

---

## Template

```
## [Error name]

**Error**: [Mô tả ngắn]

**Context**: [Đang làm gì, môi trường nào]

**Root cause**: [Nguyên nhân gốc]

**Fix**: [Cách sửa]

**Prevention**: [Cách tránh lặp lại]
```
