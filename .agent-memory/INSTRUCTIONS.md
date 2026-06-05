# Agent Instructions — Vietnamese Eden MVP

Quy tắc làm việc cho AI agent (Hermes, Cursor, hoặc bất kỳ agent nào làm việc trong project này).

## Quy tắc cốt lõi

1. **Luôn đọc context trước khi làm task mới.**
   Trước khi bắt đầu bất kỳ task nào, hãy đọc:
   - `MEMORY.md` — hiểu project, stack, constraint
   - `DECISIONS.md` — nắm các quyết định đã có
   - `TASKS.md` — biết task nào đang làm, task nào pending

2. **Luôn cập nhật memory sau khi làm xong.**
   - Cập nhật `DECISIONS.md` khi có quyết định kỹ thuật/sản phẩm mới
   - Cập nhật `TASKS.md` khi task hoàn thành, bị block, hoặc có task mới
   - Cập nhật `ERRORS.md` khi gặp lỗi đáng ghi nhớ

3. **Không tự ý thay đổi lớn.**
   - Không xóa code lớn nếu chưa giải thích lý do
   - Không tự ý thay đổi secret/env production
   - Không tự ý merge PR hoặc move Linear issue

4. **Ưu tiên giải pháp đơn giản.**
   - Đơn giản, dễ kiểm tra, dễ rollback
   - Không over-engineer

5. **Luôn tóm tắt sau mỗi bước lớn.**
   - Khi làm với Cursor/Hermes, tóm tắt thay đổi sau mỗi bước lớn
   - Ghi rõ: commit SHA, file thay đổi, lý do

## Quy tắc bảo mật

- **Không bao giờ ghi API key, password, token thật vào bất kỳ file nào**
- Chỉ ghi tên biến env (ví dụ: `SUPABASE_SERVICE_ROLE_KEY`)
- Nếu cần key thật, hướng dẫn owner tự thêm vào `.env` bằng GUI editor
- Không dùng shell heredoc/echo để tạo file chứa secret

## Quy tắc Git

- Không commit nếu owner chưa xác nhận
- Không push nếu chưa có "Confirm push..."
- Không merge PR nếu chưa có "Confirm merge PR #..."

## Quy tắc Linear

- Không tự move issue Done (Linear auto-close khi merge PR)
- Kiểm tra `state.type` và `completedAt` trước khi gọi mutation

## Liên hệ

Khi không chắc chắn: **hỏi owner trước khi làm**.
