# Agent Memory — Vietnamese Eden MVP

Bộ memory files cho AI agent (Hermes, Cursor) làm việc trong project này.

## Cách dùng với Hermes

### Cách 1: Đọc thủ công (khuyên dùng)

Trước mỗi session mới, bảo Hermes:

```
Đọc .agent-memory/MEMORY.md và .agent-memory/TASKS.md trước khi làm gì.
```

Hermes sẽ dùng `read_file` để load context.

### Cách 2: Dùng Hermes memory tool (built-in)

Hermes có sẵn `memory` tool để lưu facts vào persistent storage. Dùng cho những facts ngắn, thường xuyên cần (như user preferences, environment quirks). File-based memory dùng cho context dài hơn (project overview, decision log, task list).

### Cách 3: Kết hợp cả hai

- **Hermes memory tool**: User preferences, environment facts (ít thay đổi, cần mỗi turn)
- **`.agent-memory/` files**: Project context, decision log, task tracking, error log (dài, thay đổi thường xuyên)

## Cách dùng với Cursor

Thêm vào `.cursorrules` hoặc `AGENTS.md`:

```
Always read .agent-memory/INSTRUCTIONS.md before starting any task.
Always read .agent-memory/MEMORY.md to understand project context.
Always read .agent-memory/DECISIONS.md to understand past decisions.
Update .agent-memory/TASKS.md when tasks change status.
Update .agent-memory/ERRORS.md when encountering noteworthy errors.
```

## File structure

```
.agent-memory/
  README.md          — File này
  INSTRUCTIONS.md    — Quy tắc làm việc cho AI agent
  MEMORY.md          — Project overview, tech stack, constraints
  DECISIONS.md       — Decision log (ADR-style)
  TASKS.md           — Task tracking (backlog/in-progress/done/blocked)
  ERRORS.md          — Error log + prevention
```

## Nguyên tắc

- **Không lưu secret** vào bất kỳ file nào trong folder này
- **Không commit** nếu chưa có owner confirm
- **Cập nhật ngay** sau mỗi quyết định/task/lỗi quan trọng
- **Ngắn gọn, có cấu trúc** — dễ đọc, dễ parse
