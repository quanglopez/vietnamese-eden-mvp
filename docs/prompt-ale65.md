# ALE-65: Audit UI từ repo s-ng-t-o-vi-t để chọn component cần port

Bạn là Senior Frontend Engineer đang làm việc trên dự án **Vietnamese Eden MVP**.

## Context

- **Production repo** (`vietnamese-eden-mvp`): Next.js 14 App Router + TypeScript strict + Tailwind v3 + shadcn/ui + Supabase. Đã có auth flow, database schema 10 bảng, Supabase connection.
- **UI prototype repo** (`s-ng-t-o-vi-t`): TanStack Start + Vite 7 + React 19 + Tailwind 4 + shadcn/ui. Có UI Lovable đẹp nhưng chưa có Supabase.
- Quyết định: Dùng prototype làm nguồn tham khảo UI, port từng page/component sang production. Không port framework TanStack.

## Nhiệm vụ ngay bây giờ

### Bước 1: Kiểm tra file audit đã có
File audit đã được tạo tại `docs/ui-port-audit.md`. Đọc file này và xác nhận nó đầy đủ. Nếu thiếu gì, bổ sung.

### Bước 2: Phân tích prototype pages
Đọc các file trong `../s-ng-t-o-vi-t/src/routes/`:
- `dashboard.tsx` — Dashboard overview với stats cards, trending posts, recent boards, AI suggestion
- `boards.tsx` — Board list với search, filter tabs, card grid, create board button
- `boards.$boardId.tsx` — Board detail với gradient header, content items grid
- `breakdown.$postId.tsx` — AI breakdown detail (Hook/Angle/Structure/CTA)
- `remix.tsx` — Remix AI generator
- `voice.tsx` — Voice profile
- `calendar.tsx` — Content calendar 30 ngày
- `pricing.tsx` — Pricing page

### Bước 3: Phân tích prototype components
Đọc các file trong `../s-ng-t-o-vi-t/src/components/`:
- `app-shell.tsx` — Layout wrapper (sidebar + header + content + AddContentModal)
- `app-sidebar.tsx` — Navigation sidebar + logo + CTA + user profile
- `add-content-modal.tsx` — Modal thêm content (URL tab + text tab)

### Bước 4: Tạo báo cáo chi tiết
Tạo/update file `docs/ui-port-audit.md` với các phần:

#### 4.1 Danh sách page cần port
- Liệt kê tất cả routes
- Đánh dấu PORT (core MVP) vs DROP (non-core / milestone sau)
- Gắn milestone M1–M7 cho từng page

#### 4.2 Danh sách component cần port
- Custom components: AppShell, AppSidebar, AddContentModal → PORT
- shadcn/ui primitives → đã có sẵn, không cần port
- Page-specific components → tái tạo khi đến milestone

#### 4.3 Route mapping
- TanStack route → Next.js App Router route
- Ví dụ: `/boards/$boardId` → `/dashboard/boards/[boardId]/page.tsx`

#### 4.4 Keep vs Drop nhận xét
- Component nào giữ (giá trị UI cao)
- Component nào bỏ (dễ tạo lại hoặc milestone sau)
- CSS classes custom cần port (gradients, shadows, surface, font-display)

#### 4.5 Thứ tự port khuyến nghị
1. Foundation: AppShell + AppSidebar layout
2. Pages: dashboard → boards → board detail
3. Features: AddContentModal (text + URL)
4. Milestones sau: breakdown (M3), voice (M4), remix (M5), calendar (M6), landing (M7)

### Bước 5: Tạo checklist markdown
Trong audit file, tạo checklist có thể tick từng item:

```markdown
- [ ] ALE-65: Audit xong
- [ ] ALE-66: Port AppShell layout
  - [ ] Tạo `(dashboard)/layout.tsx`
  - [ ] Refactor navigation → usePathname()
  - [ ] Thêm CSS custom tokens
  - [ ] Responsive mobile
  - [ ] Auth route không bị phá
  - [ ] lint, type-check, build pass
- [ ] ALE-67: Port board list
  - [ ] Query boards từ Supabase
  - [ ] Empty state
  - [ ] Create board button
- [ ] ALE-68: Port board detail
  - [ ] Route [boardId]
  - [ ] Query content_items
  - [ ] Gradient header
- [ ] ALE-69: Add content text form
  - [ ] Modal/page form
  - [ ] Validation
  - [ ] Insert + link board
- [ ] ALE-70: Add content URL form
  - [ ] URL input
  - [ ] Platform detect
  - [ ] Status pending
```

## Quy tắc

- TypeScript strict, không dùng `any`
- Giữ auth flow hiện tại trong middleware.ts
- npm run lint, type-check, build phải pass
- Tiếng Việt cho toàn bộ UI
- shadcn/ui primitives đã có sẵn — dùng `npx shadcn add` nếu thiếu component nào

## Output cuối cùng

File `docs/ui-port-audit.md` đầy đủ + checklist, sẵn sàng cho team bắt đầu port Phase 1 (ALE-66).
