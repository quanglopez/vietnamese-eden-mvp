# AGENTS.md — Vietnamese Eden MVP

Hướng dẫn cho AI agent (Hermes, Cursor, Claude Code, Codex, v.v.) khi làm việc trong project này.

## Trước khi bắt đầu bất kỳ task nào

1. **Đọc `.agent-memory/INSTRUCTIONS.md`** — nắm quy tắc làm việc
2. **Đọc `.agent-memory/MEMORY.md`** — hiểu project, tech stack, constraints
3. **Đọc `.agent-memory/DECISIONS.md`** — nắm các quyết định đã có, tránh làm ngược

## Sau khi làm xong

- **Ghi quyết định mới** vào `.agent-memory/DECISIONS.md`
- **Cập nhật task status** trong `.agent-memory/TASKS.md`
- **Ghi lỗi đáng nhớ** vào `.agent-memory/ERRORS.md`

## Quy tắc bảo mật tuyệt đối

- **KHÔNG ghi API key, password, token thật** vào bất kỳ file nào
- Chỉ ghi tên biến env (ví dụ: `SUPABASE_SERVICE_ROLE_KEY`)
- Nếu cần key: hướng dẫn owner tự thêm bằng GUI editor, không dùng CLI

## Khi không chắc chắn

- **Hỏi owner trước khi làm** — đặc biệt với thay đổi production, migration, merge
- **Không tự ý merge PR** nếu chưa có "Confirm merge PR #..."
- **Không tự ý move Linear issue** Done (tự động khi merge PR)
- **Không tự ý xóa code lớn** nếu chưa giải thích

## Git workflow

```
1. Tạo branch từ main
2. Code + test (lint, type-check, build)
3. Commit
4. Push + tạo Draft PR
5. Owner review → confirm → mark ready
6. Owner confirm merge → merge
7. Production smoke
```

Không tự động merge. Luôn chờ owner confirm.

## Liên hệ

Nếu có câu hỏi về project: đọc `.agent-memory/` trước, hỏi owner sau.
