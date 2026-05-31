# ALE-66: Port dashboard layout sang Next.js app

Bạn là Senior Frontend Engineer đang làm việc trên dự án **Vietnamese Eden MVP**.

## Context

- **Production repo** (`vietnamese-eden-mvp`): Next.js 14 App Router + TypeScript strict + Tailwind v3 + shadcn/ui + Supabase
- Đã hoàn thành: Next.js setup, Supabase connection, database schema 10 bảng, auth flow
- **UI prototype** (`s-ng-t-o-vi-t`): TanStack Start + Tailwind 4 + shadcn/ui với UI Lovable đẹp
- **Audit file**: `docs/ui-port-audit.md` đã có đầy đủ thông tin cần port

## Nhiệm vụ

Port **dashboard layout** từ UI prototype sang production repo Next.js. Production repo hiện chỉ có dashboard placeholder — cần layout hoàn chỉnh với sidebar, header, content area.

### Files tham khảo từ prototype
- `../s-ng-t-o-vi-t/src/components/app-shell.tsx` — Layout wrapper
- `../s-ng-t-o-vi-t/src/components/app-sidebar.tsx` — Navigation sidebar
- `../s-ng-t-o-vi-t/src/routes/dashboard.tsx` — Dashboard page content

## Yêu cầu cụ thể

### 1. Tạo Dashboard Layout (`app/(dashboard)/layout.tsx`)
- **Sidebar** (desktop): Fixed left, width 64 (16rem), border-r, bg-sidebar
  - Logo "Vinrl" + tagline "AI content workspace"
  - Navigation items:
    - `/dashboard` → "Tổng quan" (LayoutDashboard icon)
    - `/dashboard/boards` → "Bảng cảm hứng" (FolderHeart icon)
    - `/dashboard/voice` → "Giọng văn" (Mic icon) — disabled/hidden nếu chưa có
    - `/dashboard/remix` → "Remix AI" (Wand2 icon) — disabled/hidden nếu chưa có
    - `/dashboard/calendar` → "Lịch 30 ngày" (CalendarDays icon) — disabled/hidden nếu chưa có
  - CTA button: "Thêm nội dung" (mở modal — placeholder handler)
  - Trial banner: "Bạn còn 7 ngày dùng thử" + button "Xem gói"
  - User profile section: avatar + name + role
- **Header** (sticky top):
  - Title + subtitle (passed từ page)
  - Search input (placeholder only, chưa cần functional)
  - Notification bell button
  - "Thêm" button (mở modal)
- **Content area**: px-6 lg:px-10 py-8, max-w-[1400px]
- **Mobile**: Sidebar ẩn, dùng Sheet/Drawer từ shadcn để toggle menu

### 2. Port CSS custom tokens
Thêm vào `tailwind.config.ts`:
```typescript
theme: {
  extend: {
    colors: {
      brand: {
        DEFAULT: '#8B5CF6',
        2: '#A78BFA',
        3: '#C4B5FD',
        4: '#DDD6FE',
      },
      sidebar: {
        DEFAULT: 'hsl(var(--sidebar-background))',
        foreground: 'hsl(var(--sidebar-foreground))',
        accent: 'hsl(var(--sidebar-accent))',
      },
      surface: {
        DEFAULT: 'hsl(var(--surface))',
        elev: 'hsl(var(--surface-elev))',
      },
    },
    boxShadow: {
      glow: '0 4px 20px rgba(139, 92, 246, 0.3)',
      card: '0 8px 30px rgba(0,0,0,0.08)',
    },
    fontFamily: {
      display: ['Inter', 'system-ui', 'sans-serif'],
    },
  },
}
```
Thêm CSS variables vào `app/globals.css`:
```css
:root {
  --surface: 0 0% 98%;
  --surface-elev: 0 0% 100%;
  --sidebar-background: 0 0% 98%;
  --sidebar-foreground: 240 5.3% 26.1%;
  --sidebar-accent: 240 4.8% 95.9%;
}
.dark {
  --surface: 240 3.7% 15.9%;
  --surface-elev: 240 3.7% 10%;
}
```

### 3. Port Dashboard Page (`app/(dashboard)/page.tsx`)
Giữ placeholder data ban đầu, nối Supabase sau:
- **Stats cards** (4 cards): Post đã lưu, AI breakdown, Remix đã tạo, Tổng view trend
  - Mỗi card: gradient icon + value + trend label
  - Dùng mock numbers ban đầu
- **Trending section**: Grid 2 cột, card với gradient thumbnail + platform badge + views + hook text
  - Mock 4 items
- **AI Suggestion banner**: Gradient soft bg + icon + text + "Remix ngay" button + "Để sau" button
- **Sidebar**: Recent boards (4 items) + Streak counter (12 ngày + bar chart)

### 4. Responsive
- Desktop: sidebar cố định bên trái
- Tablet: sidebar thu gọn hoặc overlay
- Mobile: sidebar ẩn, dùng Sheet từ shadcn/ui với hamburger menu

### 5. Auth compatibility
- KHÔNG sửa `middleware.ts`
- KHÔNG phá auth flow hiện tại
- Layout phải hoạt động đúng với protected route
- Server Component mặc định — chỉ "use client" cho interactive parts

### 6. Build pass
```bash
npm run lint
npm run type-check
npm run build
```
Phải pass hết.

## Files cần tạo/sửa

```
app/
  (dashboard)/
    layout.tsx          ← NEW — AppShell + AppSidebar
    page.tsx            ← NEW — Dashboard content
  globals.css           ← UPDATE — thêm CSS variables
components/
  dashboard/
    dashboard-layout.tsx    ← NEW — layout wrapper
    dashboard-sidebar.tsx   ← NEW — sidebar nav
    stats-card.tsx          ← NEW — reusable stats card
    trending-card.tsx       ← NEW — trending content card
    ai-suggestion.tsx       ← NEW — AI banner
    recent-boards.tsx       ← NEW — sidebar recent boards
    streak-widget.tsx       ← NEW — streak counter
lib/
  dashboard-data.ts       ← NEW — mock data + types
tailwind.config.ts        ← UPDATE — thêm theme extensions
```

## Quy tắc

- TypeScript strict, không `any`
- Server Components mặc định, "use client" chỉ khi cần hooks/interactivity
- shadcn/ui primitives đã có — dùng Button, Input, Card, Badge, Sheet, Skeleton, Separator, ScrollArea
- Lucide icons
- Tiếng Việt toàn bộ UI copy
- Gradient classes dùng brand colors
- `font-display` cho headings và stats numbers

## Output

Sau khi xong, user chạy `npm run lint && npm run type-check && npm run build` và phải pass.
Cập nhật ALE-66 trên Linear sang state "In Progress" hoặc "Done" khi hoàn thành.
