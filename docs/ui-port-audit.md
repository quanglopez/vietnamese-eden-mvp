# UI Port Audit: s-ng-t-o-vi-t → vietnamese-eden-mvp

> **Issue:** ALE-65  
> **Ngày audit:** 2026-05-31 (cập nhật sau ALE-140)  
> **Prototype:** `C:\Users\ADMIN\s-ng-t-o-vi-t` (TanStack Start + Vite 7 + Tailwind v4 + Lovable)  
> **Production:** `C:\Users\ADMIN\vietnamese-eden-mvp` (Next.js 14 App Router + Tailwind v3 + Supabase)  
> **Tài liệu liên quan:** `docs/ui-port-plan.md` (kế hoạch port chi tiết hơn)

**Mục đích:** Xác định page/component nào port từ UI prototype sang production, thứ tự ưu tiên, và checklist cho ALE-66 trở đi.

---

## Trạng thái hiện tại (sau ALE-140)

| Hạng mục | Trạng thái |
|----------|------------|
| AppShell + AppSidebar | ✅ Đã port → `src/components/custom/app/` |
| Dashboard UI | ✅ Đã port (mock data) → `(app)/dashboard` |
| Design tokens (brand, gradient, surface) | ✅ Đã thêm vào `globals.css` + `tailwind.config.ts` |
| AddContentModal | ✅ UI port; logic AI/breakdown **chưa** wire |
| Middleware protected routes | ✅ `/dashboard`, `/boards`, `/breakdown`, `/voice`, `/remix`, `/calendar` |
| Boards / Breakdown / Voice / Remix / Calendar | ⏳ Placeholder `ComingSoonPage` |
| Board CRUD + Supabase query | ❌ Chưa (ALE-67+) |

---

## 4.1 Danh sách page cần port

### Inventory — `s-ng-t-o-vi-t/src/routes/`

| # | File | URL TanStack | Nội dung chính | Quyết định | Milestone |
|---|------|--------------|----------------|------------|-----------|
| 1 | `__root.tsx` | — | QueryClient, error boundary, meta | **DROP** | — |
| 2 | `index.tsx` | `/` | Landing: hero, features, boards showcase, pricing teaser, footer | **DEFER** | M7 |
| 3 | `dashboard.tsx` | `/dashboard` | Stats cards, trending posts, recent boards, AI suggestion, streak | **PORT** | M1 |
| 4 | `boards.tsx` | `/boards` | Search, filter tabs, board card grid, nút tạo board | **PORT** | M1 |
| 5 | `boards.$boardId.tsx` | `/boards/$boardId` | Gradient header, platform filter, content grid (4:5 cards) | **PORT** | M2 |
| 6 | `breakdown.$postId.tsx` | `/breakdown/$postId` | Hook / Angle / Structure / CTA / Why viral sections | **DEFER** | M3 |
| 7 | `voice.tsx` | `/voice` | Textarea profile, sliders trait, upload, preview | **DEFER** | M4 |
| 8 | `remix.tsx` | `/remix` | Source picker, variant captions, copy/regenerate | **DEFER** | M5 |
| 9 | `calendar.tsx` | `/calendar` | 30-day grid, type badges, export CSV, AI generate | **DEFER** | M6 |
| 10 | `pricing.tsx` | `/pricing` | 3 gói giá, standalone (không AppShell) | **DEFER** | M7 |

### Giải thích PORT / DEFER / DROP

| Nhãn | Ý nghĩa |
|------|---------|
| **PORT** | Core MVP Swipe Board — làm trong M1–M2 (ALE-66 → ALE-68) |
| **DEFER** | Có giá trị UI cao nhưng **không block** MVP core; port ở M3–M7 |
| **DROP** | Không port (framework TanStack, `routeTree.gen.ts`, Lovable error reporting) |

### Production-only routes (giữ nguyên)

| Route | File | Ghi chú |
|-------|------|---------|
| `/login`, `/signup`, `/forgot-password` | `src/app/(auth)/` | Supabase auth — **không port từ prototype** |
| `/auth/callback` | `src/app/auth/callback/route.ts` | OAuth |
| `/api/health/supabase` | API route | Health check |

---

## 4.2 Danh sách component cần port

### Custom components (prototype `src/components/`)

| Component | File prototype | Quyết định | Production path | Ghi chú |
|-----------|----------------|------------|-----------------|---------|
| **AppShell** | `app-shell.tsx` | **PORT** ✅ | `src/components/custom/app/app-shell.tsx` | Sidebar + header + search + modal trigger |
| **AppSidebar** | `app-sidebar.tsx` | **PORT** ✅ | `src/components/custom/app/app-sidebar.tsx` | `usePathname()` thay `useRouterState`; session Supabase |
| **AddContentModal** | `add-content-modal.tsx` | **PORT** ⚠️ | `src/components/custom/app/add-content-modal.tsx` | UI xong; wire insert + navigate ở ALE-69/70 |
| **AppSessionProvider** | — | **NEW** ✅ | `src/components/custom/app/app-session-provider.tsx` | Không có trong prototype; cần cho user footer |

### Page-specific UI (tái tạo khi đến milestone — không copy file)

| Nguồn route | Component logic cần tách | Milestone |
|-------------|--------------------------|-----------|
| `dashboard.tsx` | `DashboardView` (stats, trending, boards sidebar, streak) | M1 ✅ mock |
| `boards.tsx` | `BoardsListView` (search, tabs, grid, create CTA) | M1 |
| `boards.$boardId.tsx` | `BoardDetailView` (gradient hero, filters, content grid) | M2 |
| `breakdown.$postId.tsx` | `BreakdownSections` (5 section cards + actions) | M3 |
| `voice.tsx` | `VoiceProfileForm` (textarea + sliders + upload) | M4 |
| `remix.tsx` | `RemixWorkspace` (source panel + variant list) | M5 |
| `calendar.tsx` | `CalendarGrid` (7-col grid + type legend) | M6 |
| `index.tsx` | `landing/*` sections | M7 |
| `pricing.tsx` | `PricingPlans` | M7 |

### shadcn/ui primitives

**Production hiện có (12):** `button`, `card`, `input`, `textarea`, `badge`, `avatar`, `dropdown-menu`, `dialog`, `sheet`, `tabs`, `table`, `label`

**Prototype có ~49 components — không copy raw.** Dùng `npx shadcn@latest add` khi cần:

| Phase | Cần thêm |
|-------|----------|
| M1 boards | `skeleton`, `separator`, `scroll-area`, `sonner` |
| M2 board detail | (đã đủ cơ bản) |
| M4 voice | `slider`, `select`, `progress` |
| M6 calendar | `calendar`, `popover` |
| Polish | `breadcrumb`, `sidebar` (shadcn), `chart` (nếu dashboard charts) |

---

## 4.3 Route mapping (TanStack → Next.js App Router)

**Layout group thực tế trong production:** `src/app/(app)/` (không dùng `/dashboard/boards` nested URL).

| TanStack route | URL công khai | Next.js App Router | Trạng thái |
|----------------|---------------|-------------------|------------|
| `/dashboard` | `/dashboard` | `src/app/(app)/dashboard/page.tsx` | ✅ UI port |
| `/boards` | `/boards` | `src/app/(app)/boards/page.tsx` | ⏳ placeholder |
| `/boards/$boardId` | `/boards/[boardId]` | `src/app/(app)/boards/[boardId]/page.tsx` | ⏳ placeholder |
| `/breakdown/$postId` | `/breakdown/[postId]` | `src/app/(app)/breakdown/[postId]/page.tsx` | ⏳ placeholder |
| `/breakdown` (index) | `/breakdown` | `src/app/(app)/breakdown/page.tsx` | ⏳ placeholder |
| `/voice` | `/voice` | `src/app/(app)/voice/page.tsx` | ⏳ placeholder |
| `/remix` | `/remix` | `src/app/(app)/remix/page.tsx` | ⏳ placeholder |
| `/calendar` | `/calendar` | `src/app/(app)/calendar/page.tsx` | ⏳ placeholder |
| `/pricing` | `/pricing` | `src/app/pricing/page.tsx` *(public, chưa tạo)* | M7 |
| `/` landing | `/` | `src/app/page.tsx` | ⏳ placeholder mỏng |
| — | — | `src/app/(app)/layout.tsx` | ✅ auth guard + session |

### Pattern chuyển đổi

```
TanStack createFileRoute("/boards/$boardId")
  → Next.js src/app/(app)/boards/[boardId]/page.tsx

Route.useParams() / params={{ boardId }}
  → props params: { boardId: string }  (Next 14)

Link @tanstack/react-router
  → Link next/link  + href="/boards/[id]"

useNavigate() / navigate({ to, params })
  → useRouter().push() / redirect()

useRouterState → pathname
  → usePathname()
```

---

## 4.4 Keep vs Drop — nhận xét

### KEEP / PORT (giá trị UI cao, đã hoặc sẽ port)

| Item | Lý do |
|------|-------|
| **AppShell + AppSidebar** | Layout xuyên suốt app; đã port ALE-140 |
| **AddContentModal** | Entry point thêm content; tab URL + text có UX tốt |
| **Dashboard stats + trending grid** | First impression sau login; mock OK cho M1 |
| **Board list card grid** | Core Swipe Board UX |
| **Board detail gradient header** | Brand identity + context board |
| **CSS utilities** | `bg-gradient-brand`, `shadow-glow`, `font-display`, `bg-surface-elev` — đã port |
| **Platform gradient map** | Thumbnail cards TikTok/IG/YT — copy className từ `mock-data.ts` |

### DEFER (milestone sau, không bỏ hẳn)

| Item | Lý do defer |
|------|-------------|
| Breakdown 5-section layout | Cần `content_analyses` + AI Edge Function (M3) |
| Voice sliders + upload | Cần `voice_profiles` API (M4) |
| Remix variant generator | Cần `generated_outputs` (M5) |
| Calendar 30-day grid | Cần `content_calendar_items` (M6) |
| Landing + Pricing | Marketing/billing — sau MVP core (M7) |

### DROP (không port)

| Item | Lý do |
|------|-------|
| `__root.tsx`, TanStack Router, Vinxi/Nitro config | Thay bằng Next.js `layout.tsx` |
| `routeTree.gen.ts` | File-based routing |
| `lib/lovable-error-reporting.ts` | Lovable-specific |
| `lib/mock-data.ts` *(copy nguyên)* | Chỉ tham khảo shape; data từ Supabase |
| Copy nguyên folder `components/ui/` prototype | Style drift (new-york vs radix-nova); dùng shadcn CLI |

### CSS / theme cần giữ (đã port ALE-140)

| Class / token | Mô tả |
|---------------|-------|
| `bg-gradient-brand` | Primary CTA, logo, streak bars |
| `bg-gradient-brand-soft` | AI suggestion banner |
| `text-gradient-brand` | Streak counter |
| `shadow-glow` | Nút primary |
| `shadow-card` | Card hover |
| `bg-surface` / `bg-surface-elev` | Input, cards |
| `font-display` | Headings (Outfit via `next/font`) |
| `from-brand` … `to-brand-4` | Stats icons, board headers |

```typescript
// Platform gradients — port vào lib/ui/platform-styles.ts khi cần
const platformGradient = {
  TikTok: "from-[#ff0050] to-[#00f2ea]",
  Instagram: "from-[#f7931e] to-[#e84393]",
  YouTube: "from-[#ff0000] to-[#ff6b35]",
  Facebook: "from-[#1877f2] to-[#6c5ce7]",
  Threads: "from-[#1a1a1a] to-[#444444]",
};
```

---

## 4.5 Thứ tự port khuyến nghị

### Milestone map

| Milestone | Phạm vi | Linear issues |
|-----------|---------|---------------|
| **M1** | Foundation + Dashboard + Board list | ALE-66 ✅ (≈ ALE-140), ALE-67 |
| **M2** | Board detail + content grid | ALE-68 |
| **M3** | Add content (text + URL) + Breakdown UI | ALE-69, ALE-70, breakdown page |
| **M4** | Voice profile | — |
| **M5** | Remix AI | — |
| **M6** | Content calendar | — |
| **M7** | Landing + Pricing + onboarding polish | — |

### Thứ tự thực thi

1. **Foundation** — AppShell + AppSidebar + tokens + `(app)/layout` ✅
2. **Dashboard** — UI đầy đủ, mock → Supabase read sau ✅
3. **Board list** — port `boards.tsx`, query `boards` table
4. **Board detail** — port `boards.$boardId.tsx`, query junction + `content_items`
5. **AddContentModal** — text insert (ALE-69), URL detect (ALE-70)
6. **Breakdown** — port sections khi có analysis API
7. **Voice → Remix → Calendar → Landing/Pricing**

---

## Checklist port (tick khi xong)

- [x] **ALE-65**: Audit xong — báo cáo này
- [x] **ALE-66** / **ALE-140**: Port AppShell layout sang Next.js
  - [x] Tạo `src/app/(app)/layout.tsx` với auth guard + session
  - [x] Port `AppShell` + `AppSidebar` + refactor `usePathname()`
  - [x] Thêm CSS custom tokens (`globals.css`, `tailwind.config.ts`)
  - [x] Port Dashboard UI (`dashboard-view.tsx`, mock data)
  - [x] AddContentModal UI (chưa wire Supabase)
  - [x] Mở rộng middleware protected prefixes
  - [ ] Responsive mobile sidebar → Sheet/Drawer *(chưa)*
  - [x] Auth routes không bị phá
  - [x] `npm run lint && npm run type-check && npm run build` pass
- [ ] **ALE-67**: Port board list UI
  - [ ] Thay placeholder `(app)/boards/page.tsx`
  - [ ] Port JSX từ `boards.tsx` (search, tabs, grid, create CTA)
  - [ ] Query `boards` từ Supabase theo `workspace_id`
  - [ ] Empty state, loading skeleton
  - [ ] Dialog/form "Tạo board mới"
  - [ ] RLS test pass
- [ ] **ALE-68**: Port board detail page
  - [ ] Thay placeholder `(app)/boards/[boardId]/page.tsx`
  - [ ] Port gradient header + filter bar + content grid
  - [ ] Query `content_items` qua `board_content_items`
  - [ ] Empty state, not-found, unauthorized
- [ ] **ALE-69**: Form thêm content bằng text
  - [ ] Wire AddContentModal tab "Paste text"
  - [ ] Validation: `source_text` không rỗng
  - [ ] Insert `content_items` + link `board_content_items`
  - [ ] Redirect về board detail; toast success/error
- [ ] **ALE-70**: Form thêm content bằng URL
  - [ ] Wire AddContentModal tab "Dán link"
  - [ ] URL validation + auto-detect platform
  - [ ] Status `pending` / `manual_required` nếu chưa extract
  - [ ] Thông báo rõ cho user

---

## Phân tích nhanh từng prototype page

### `dashboard.tsx` (M1 — ✅ UI port)
- 4 stat cards với gradient icon + trend
- Trending grid 4 posts → link breakdown
- AI suggestion banner → link remix
- Sidebar: recent boards + 12-day streak

### `boards.tsx` (M1 — ALE-67)
- Toolbar: search + filter tabs (Tất cả/Cá nhân/Team/Client)
- Card grid: emoji, gradient cover, post count, avatars
- Dashed "Tạo bảng mới" card

### `boards.$boardId.tsx` (M2 — ALE-68)
- Hero gradient với emoji, mô tả, Share + Remix CTA
- Platform filter chips + grid/list toggle
- Content cards aspect 4:5 với platform badge, hook, metrics

### `breakdown.$postId.tsx` (M3)
- 5 sections: Hook, Angle, Structure, CTA, Why viral
- Actions: Copy, Remix, Back to board

### `voice.tsx` (M4)
- Textarea "Bạn là ai?"
- 4 trait sliders
- Upload samples + preview generated tone

### `remix.tsx` (M5)
- Sticky source panel (post thumbnail + hook)
- 3 variant cards với copy/regenerate

### `calendar.tsx` (M6)
- Month nav + Export CSV + AI generate
- 7-column grid, type color badges (Hook/Story/Educate/Sell/Trend/BTS)

### `pricing.tsx` + `index.tsx` (M7)
- Pricing: 3 tiers standalone page
- Landing: full marketing funnel (~400 lines JSX)

---

## Mock → Supabase schema mapping

| Prototype (`mock-data.ts`) | Supabase table | Ghi chú |
|----------------------------|----------------|---------|
| `boards[]` | `boards` | emoji/color → metadata JSON hoặc columns mở rộng |
| `Post` | `content_items` + `board_content_items` | `platform` enum lowercase trong DB |
| Breakdown sections | `content_analyses` | hook, angle, structure, cta |
| Voice sliders/text | `voice_profiles` | tone, style_notes |
| Remix variants | `generated_outputs` | content, status |
| `calendar30[]` | `content_calendar_items` | scheduled_at, platform |

---

## Rủi ro & lưu ý

1. **Tailwind v3 vs v4** — Production dùng v3; port tokens qua CSS variables + `@layer utilities`, không copy `@theme inline`.
2. **TanStack → Next.js** — Chỉ port JSX + className; không port loaders/router.
3. **shadcn style drift** — Production `radix-nova`; prototype `new-york`. Luôn `shadcn add` trên production.
4. **Auth** — `(app)/layout.tsx` + middleware; không duplicate guard logic.
5. **RLS** — Mọi query boards/content phải test cross-workspace.
6. **Mobile** — Prototype sidebar `hidden md:flex` only; Sheet drawer là gap ALE-66 còn lại.
7. **Rebrand** — Vinrl → **Vietnamese Eden** trong mọi copy UI.

---

## Output

File audit này **đầy đủ** cho team bắt đầu **Phase 2: ALE-67 (Board list)**.  
Phase 1 foundation (ALE-66 / ALE-140) đã hoàn thành trên production repo.

*Tài liệu tham chiếu prototype:*
- Routes: `s-ng-t-o-vi-t/src/routes/*.tsx`
- Components: `s-ng-t-o-vi-t/src/components/app-*.tsx`
- Design: `s-ng-t-o-vi-t/src/styles.css`
- Mock types: `s-ng-t-o-vi-t/src/lib/mock-data.ts`
