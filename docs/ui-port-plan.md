# UI Port Plan — s-ng-t-o-vi-t → vietnamese-eden-mvp

> **Audit date:** 2026-05-30  
> **Prototype:** `C:\Users\ADMIN\s-ng-t-o-vi-t` (TanStack Start + Vite + Lovable)  
> **Production:** `C:\Users\ADMIN\vietnamese-eden-mvp` (Next.js 14 App Router + Supabase)  
> **Phạm vi doc:** Chỉ lập kế hoạch port UI — **không** đổi auth, Supabase, schema, không copy TanStack framework.

---

## 1. Tóm tắt executive

Prototype **Vinrl** có 10 route UI hoàn chỉnh (mock data), design system riêng (brand gradient, Outfit/Figtree), và shell app (sidebar + header). Production **Vietnamese Eden** đã có foundation: auth Supabase, schema 10 bảng, dashboard placeholder, landing tối giản.

**Chiến lược:** Port **layout shell + từng feature page** sang Next.js App Router, giữ auth/middleware hiện tại, thay mock-data bằng Supabase ở các issue sau. **Không** port `__root.tsx`, TanStack Router, Nitro/Vinxi.

---

## 2. Inventory — Prototype (`s-ng-t-o-vi-t`)

### 2.1 Routes / Pages

| # | TanStack route file | URL | Mô tả | Dùng AppShell? |
|---|---------------------|-----|--------|----------------|
| 1 | `index.tsx` | `/` | Marketing landing (Hero, Features, Boards showcase, CTA, Footer) — brand **Vinrl** | Không |
| 2 | `dashboard.tsx` | `/dashboard` | Tổng quan: stats cards, trending posts, boards snapshot | Có |
| 3 | `boards.tsx` | `/boards` | Danh sách bảng cảm hứng + filter + tạo bảng | Có |
| 4 | `boards.$boardId.tsx` | `/boards/:boardId` | Chi tiết board + grid post viral | Có |
| 5 | `breakdown.$postId.tsx` | `/breakdown/:postId` | AI Breakdown (Hook, Angle, Structure, CTA) | Có |
| 6 | `voice.tsx` | `/voice` | Voice Profile (textarea, sliders, upload) | Có |
| 7 | `remix.tsx` | `/remix` | Remix AI — chọn source + variants caption | Có |
| 8 | `calendar.tsx` | `/calendar` | Lịch nội dung 30 ngày | Có |
| 9 | `pricing.tsx` | `/pricing` | Bảng giá 3 gói (standalone, không shell) | Không |
| 10 | `__root.tsx` | — | Root layout, QueryClient, 404/error — **TanStack only** | — |

**Ghi chú:** Prototype **không có** `/login`, `/signup` — auth nằm ở production.

### 2.2 Custom components (non-shadcn)

| Component | File | Vai trò |
|-----------|------|---------|
| **AppShell** | `app-shell.tsx` | Layout authenticated: sidebar + sticky header + search + nút Thêm + modal |
| **AppSidebar** | `app-sidebar.tsx` | Nav chính, trial CTA, user footer |
| **AddContentModal** | `add-content-modal.tsx` | Dialog thêm URL/caption → navigate breakdown |

### 2.3 shadcn/ui — Prototype (49 files)

Đã cài đầy đủ: accordion, alert, avatar, badge, breadcrumb, button, calendar, card, carousel, chart, checkbox, collapsible, command, context-menu, dialog, drawer, dropdown-menu, form, hover-card, input, input-otp, label, menubar, navigation-menu, pagination, popover, progress, radio-group, resizable, scroll-area, select, separator, sheet, sidebar, skeleton, slider, sonner, switch, table, tabs, textarea, toggle, toggle-group, tooltip.

### 2.4 Data / styling phụ thuộc prototype

| Asset | File | Ghi chú |
|-------|------|---------|
| Mock posts/boards/calendar | `src/lib/mock-data.ts` | Thay bằng Supabase ở sprint data |
| Design tokens | `src/styles.css` | Tailwind v4, oklch, `--brand`, `font-display`, `bg-gradient-brand`, `shadow-glow` |
| Fonts | Google Fonts | Outfit (display) + Figtree (body) |
| Brand name | UI copy | **Vinrl** → rebrand **Vietnamese Eden** khi port |

---

## 3. Inventory — Production (`vietnamese-eden-mvp`)

### 3.1 App Router hiện tại

| Route | File | Trạng thái |
|-------|------|------------|
| `/` | `src/app/page.tsx` | Landing placeholder (3 feature cards) |
| `/login` | `src/app/(auth)/login/page.tsx` | Auth form — **giữ nguyên** |
| `/signup` | `src/app/(auth)/signup/page.tsx` | Auth form — **giữ nguyên** |
| `/forgot-password` | `src/app/(auth)/forgot-password/page.tsx` | Auth — **giữ nguyên** |
| `/auth/callback` | `src/app/auth/callback/route.ts` | OAuth callback — **giữ nguyên** |
| `/dashboard` | `src/app/dashboard/page.tsx` | Placeholder post-login (Card + sign out) |
| `/api/health/supabase` | `src/app/api/health/supabase/route.ts` | Health — **giữ nguyên** |

**Middleware:** bảo vệ `/dashboard` → redirect `/login` (mở rộng thêm prefix sau khi port).

### 3.2 Custom components

| Component | Path |
|-----------|------|
| Auth forms | `src/components/custom/auth/*` |
| QueryProvider | `src/components/custom/query-provider.tsx` |

### 3.3 shadcn/ui — Production (11 components)

`button`, `card`, `input`, `textarea`, `badge`, `avatar`, `dropdown-menu`, `dialog`, `sheet`, `tabs`, `table`, `label`

**Style:** `radix-nova`, baseColor `slate`, Tailwind **v3** + HSL CSS variables (`globals.css`).

---

## 4. Quyết định port — Page by page

| Prototype page | Quyết định | Lý do |
|----------------|------------|--------|
| `/` landing | **Port (nâng cấp)** | Production landing quá mỏng; prototype có marketing đầy đủ — adapt copy **Vietnamese Eden**, link `/signup` |
| `/dashboard` | **Port (thay thế placeholder)** | Issue tiếp theo ưu tiên; giữ auth server-side + thêm AppShell |
| `/boards` | **Port** | Map `boards` table + RLS |
| `/boards/:id` | **Port** | Map `board_content_items` + `content_items` |
| `/breakdown/:postId` | **Port** | Map `content_analyses` |
| `/voice` | **Port** | Map `voice_profiles` |
| `/remix` | **Port** | Map `generated_outputs` |
| `/calendar` | **Port** | Map `content_calendar_items` |
| `/pricing` | **Port (phase 2)** | Marketing/billing — không block MVP core; có thể public route |
| `__root.tsx` | **Bỏ** | Thay bằng `src/app/layout.tsx` + `(app)/layout.tsx` |
| TanStack `routeTree.gen.ts` | **Bỏ** | Next.js file-based routing |

### Pages production giữ nguyên (không port từ prototype)

- `/login`, `/signup`, `/forgot-password`, `/auth/callback` — đã có Supabase Auth (ALE-64)
- `/api/health/supabase`

---

## 5. Components tái sử dụng

### 5.1 Port gần như nguyên (đổi import routing)

| Component | Effort | Thay đổi cần |
|-----------|--------|--------------|
| **AppShell** | Medium | `"use client"`; bỏ TanStack; `Link` → `next/link` |
| **AppSidebar** | Medium | `useRouterState` → `usePathname()`; `Link` → `next/link`; user từ Supabase session |
| **AddContentModal** | Medium | `useNavigate` → `useRouter().push()`; `"use client"` |

### 5.2 Port theo page (copy JSX + className, tách Server/Client)

| Source route | Tách thành (production) |
|--------------|-------------------------|
| `dashboard.tsx` | `dashboard-stats.tsx`, `trending-posts-grid.tsx` (client) + page server fetch |
| `boards.tsx` | `boards-list.tsx` |
| `boards.$boardId.tsx` | `board-header.tsx`, `content-grid.tsx` |
| `breakdown.$postId.tsx` | `breakdown-sections.tsx` |
| `voice.tsx` | `voice-profile-form.tsx` (client — sliders) |
| `remix.tsx` | `remix-workspace.tsx` (client) |
| `calendar.tsx` | `calendar-grid.tsx` |
| `index.tsx` | `landing/*` sections (có thể server components) |
| `pricing.tsx` | `pricing-plans.tsx` |

### 5.3 shadcn — cần bổ sung vào production (theo thứ tự port)

**Phase 1 (dashboard + boards):** `slider`, `separator`, `skeleton`, `scroll-area`, `sonner`  
**Phase 2 (voice + remix):** `slider` (đã có), `select`, `progress`  
**Phase 3 (calendar):** `calendar` (react-day-picker), `popover`  
**Optional polish:** `sidebar` (shadcn), `breadcrumb`, `chart` (recharts đã có trong prototype deps — thêm vào production nếu dashboard charts)

**Không copy nguyên** folder `ui/` từ prototype — chạy `npx shadcn@latest add <component>` trên production để khớp Next.js RSC.

### 5.4 Không port

- `lib/lovable-error-reporting.ts` — Lovable-specific
- `lib/mock-data.ts` — chỉ tham khảo shape type; data từ Supabase
- TanStack Router loaders / `createFileRoute` / `Route.useParams()`
- Vinxi/Nitro config (`vite.config.ts` deploy plugin)

---

## 6. Route mapping — Prototype → Next.js App Router

```
Prototype (TanStack)              Production (Next.js 14)
─────────────────────────────────────────────────────────────
/                                 src/app/page.tsx
/dashboard                        src/app/(app)/dashboard/page.tsx
/boards                           src/app/(app)/boards/page.tsx
/boards/$boardId                  src/app/(app)/boards/[boardId]/page.tsx
/breakdown/$postId                src/app/(app)/breakdown/[postId]/page.tsx
/voice                            src/app/(app)/voice/page.tsx
/remix                            src/app/(app)/remix/page.tsx
/calendar                         src/app/(app)/calendar/page.tsx
/pricing                          src/app/pricing/page.tsx  (public)

Auth (production only):
/login                            src/app/(auth)/login/page.tsx        ✓ exists
/signup                           src/app/(auth)/signup/page.tsx       ✓ exists
/forgot-password                  src/app/(auth)/forgot-password/...   ✓ exists
/auth/callback                    src/app/auth/callback/route.ts       ✓ exists
```

### Layout groups đề xuất

```
src/app/
├── layout.tsx                 # Root: Inter, QueryProvider, globals
├── page.tsx                   # Public landing
├── pricing/page.tsx           # Public pricing
├── (auth)/                    # Existing — không đụng
├── (app)/
│   ├── layout.tsx             # NEW: AppShell wrapper (client boundary)
│   ├── dashboard/page.tsx     # Replace current /dashboard
│   ├── boards/...
│   ├── breakdown/...
│   ├── voice/...
│   ├── remix/...
│   └── calendar/...
└── auth/callback/...
```

**Middleware** (`src/lib/supabase/middleware.ts`): mở rộng `PROTECTED_PREFIXES`:

```ts
const PROTECTED_PREFIXES = [
  "/dashboard",
  "/boards",
  "/breakdown",
  "/voice",
  "/remix",
  "/calendar",
];
```

(`/pricing` giữ public.)

---

## 7. Thứ tự port khuyến nghị

| Sprint / Issue | Deliverable | Phụ thuộc |
|----------------|-------------|-----------|
| **P0 — Shell** | `(app)/layout.tsx`, port `AppShell` + `AppSidebar`, design tokens cơ bản | — |
| **P0 — Dashboard** | Thay `dashboard/page.tsx` placeholder bằng UI prototype + mock/Supabase read | Shell |
| **P1 — Boards** | `/boards`, `/boards/[boardId]` + shadcn `skeleton`, `scroll-area` | Shell, CRUD boards issue |
| **P1 — Add content** | Port `AddContentModal` | Boards, content_items API |
| **P2 — Breakdown** | `/breakdown/[postId]` | content_analyses API |
| **P2 — Voice** | `/voice` + `slider` shadcn | voice_profiles API |
| **P3 — Remix** | `/remix` | generated_outputs API |
| **P3 — Calendar** | `/calendar` + shadcn `calendar` | content_calendar_items API |
| **P4 — Landing** | Nâng cấp `/` từ prototype `index.tsx` | — |
| **P4 — Pricing** | `/pricing` public | Billing product decision |

**Issue ngay sau doc này (dashboard):** Sprint **P0 — Shell + Dashboard** — acceptance: logged-in user thấy UI giống prototype dashboard (mock OK), sidebar nav hoạt động, sign out vẫn work.

---

## 8. Rủi ro khi port TanStack/Vite → Next.js

| Rủi ro | Mức | Mitigation |
|--------|-----|------------|
| **Routing API** — `Link`/`useNavigate`/`Route.useParams()` | Cao | Map sang `next/link`, `useRouter`, `params` prop / `useParams()` |
| **RSC vs Client** — prototype 100% client | Cao | `"use client"` cho shell, forms, sliders; server components cho layout wrapper + data fetch |
| **TanStack Query** — root QueryClient trong `__root` | Trung bình | Giữ `QueryProvider` trong `layout.tsx` (đã có) |
| **CSS design system** — Tailwind v4 + oklch vs v3 HSL | Cao | Port tokens `--brand`, utilities `gradient-brand` vào `globals.css` hoặc migrate Tailwind v4 (issue riêng) |
| **Fonts** — Outfit/Figtree vs Inter | Thấp | Thêm `next/font/google` cho display + body; giữ Inter làm fallback OK |
| **Mock → Supabase** — types khác schema | Trung bình | Map `Post` mock → `content_items` Row; không copy mock-data.ts |
| **Metadata/SEO** — `head()` TanStack | Trung bình | `export const metadata` hoặc `generateMetadata` per page |
| **Modal navigation** — AddContentModal dùng router | Trung bình | `router.push('/breakdown/' + id)` |
| **Brand mismatch** Vinrl vs Vietnamese Eden | Thấp | Find-replace copy trong lúc port |
| **shadcn style drift** — new-york/nova vs radix versions | Trung bình | Add components qua CLI production; đừng copy file ui/ raw |
| **Protected routes** — prototype không auth | Trung bình | Middleware đã có; mở rộng prefixes |
| **Hydration** — random IDs, dates | Thấp | Suppress hoặc fixed seed cho demo |

---

## 9. Tailwind / shadcn — khác biệt cần biết

| Khía cạnh | Prototype | Production |
|-----------|-----------|------------|
| Tailwind | **v4** (`@import "tailwindcss"`, `@theme inline`) | **v3** (`tailwind.config.ts`, `@tailwind` directives) |
| CSS file | `src/styles.css` | `src/app/globals.css` |
| shadcn style | `new-york` | `radix-nova` |
| RSC | `rsc: false` | `rsc: true` |
| Color format | oklch + custom `--brand`, `--surface` | HSL shadcn slate |
| Custom utilities | `.bg-gradient-brand`, `.shadow-glow`, `.font-display` | Chưa có — **phải port tokens trước UI** |
| Components count | ~40 | 11 |

### Khuyến nghị design migration (issue riêng, trước dashboard polish)

1. Thêm CSS variables `--brand`, `--brand-2`, `--surface`, `--surface-elev` vào `globals.css` (HSL hoặc oklch tùy Tailwind version).
2. Thêm utility classes `.bg-gradient-brand`, `.font-display` via `@layer utilities`.
3. Load fonts: `Outfit` + `Figtree` qua `next/font` (hoặc giữ Inter nếu product chọn đơn giản hóa).
4. Chạy `shadcn add` cho components thiếu — **không** copy nguyên prototype `button.tsx` (API khác nova vs new-york).

---

## 10. Type mapping — Mock → Supabase schema

| Mock (`mock-data.ts`) | Supabase table | Ghi chú |
|-----------------------|----------------|---------|
| `boards[]` | `boards` | emoji/color → columns mới hoặc JSON metadata (issue schema extension) |
| `Post` | `content_items` + `board_content_items` | platform enum lowercase trong DB |
| Breakdown sections | `content_analyses` | hook, angle, structure, cta |
| Voice sliders/text | `voice_profiles` | tone, style_notes, sample_count |
| Remix variants | `generated_outputs` | content, status |
| `calendar30[]` | `content_calendar_items` | scheduled_at, platform |

---

## 11. Checklist issue Dashboard (issue kế tiếp)

Dùng checklist này khi bắt đầu port dashboard:

- [ ] Tạo `src/app/(app)/layout.tsx` với AppShell (client)
- [ ] Di chuyển dashboard từ `src/app/dashboard/` → `src/app/(app)/dashboard/`
- [ ] Cập nhật middleware protected prefixes
- [ ] Port design tokens tối thiểu (brand gradient, surface)
- [ ] Port JSX `dashboard.tsx` — stats + trending grid
- [ ] Sidebar nav links trỏ đúng Next routes (disabled state cho routes chưa port)
- [ ] User footer sidebar: email/name từ Supabase session
- [ ] Giữ `SignOutButton` / auth flow ALE-64
- [ ] Mock data tạm hoặc empty state nếu chưa wire API
- [ ] `npm run lint && npm run type-check && npm run build`

---

## 12. Tài liệu tham chiếu nhanh

| Cần xem | Prototype path |
|---------|----------------|
| Dashboard UI | `src/routes/dashboard.tsx` |
| App layout | `src/components/app-shell.tsx`, `app-sidebar.tsx` |
| Design system | `src/styles.css` |
| Mock types | `src/lib/mock-data.ts` |
| Landing | `src/routes/index.tsx` |

| Cần xem | Production path |
|---------|-----------------|
| Auth (don't touch) | `src/app/(auth)/`, `middleware.ts` |
| Schema | `docs/database/ERD.md` |
| Types | `src/types/database.ts` |

---

*Document owner: Vietnamese Eden MVP · Foundation milestone · UI port planning only.*
