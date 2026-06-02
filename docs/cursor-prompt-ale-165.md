# ALE-165 — Content Detail Page Polish

## Context

- **Project**: Vietnamese Eden MVP (Next.js 14 App Router, TypeScript strict, Tailwind, shadcn/ui, Supabase)
- **Issue**: ALE-165 — "M9 — Content detail page polish"
- **Linear State**: Backlog → In Progress (sau khi bắt đầu)
- **Previous Done**: ALE-162 (tags truly Done), ALE-159 (URL analysis pipeline Done)
- **DO NOT**: Quay lại ALE-159, phá các flow đã pass (Paste text, AI Breakdown, Remix, Voice Profile, Calendar, Board search/filter/platform/tag, Source quality badges, Add content, Breakdown link)

## Linear Scope Gốc

> Content detail page gom source, breakdown, remix outputs, calendar usage vào một view gọn gàng.
>
> Acceptance Criteria:
> - Content detail page gom source, breakdown, remix outputs, calendar usage.
> - CTA rõ: Analyze, Remix, Add to Calendar.
> - SourceQuality badge visible.
> - Empty states rõ (chưa breakdown, chưa remix, chưa calendar).
> - npm run lint/type-check/build pass.

## Current Repo State (So sánh)

| Feature | Status | File/Notes |
|---------|--------|-----------|
| Breakdown display | ✅ Có | `BreakdownSections` + `BreakdownStatusBanner` trong `breakdown-view.tsx` |
| Remix CTA (link) | ✅ Có | Link đến `/remix/[id]` trong `BreakdownView` |
| SourceQuality badge | ✅ Có | `SourceQualityBadge` nhưng chỉ conditional (blocked/metadata_only) — không luôn visible |
| Source metadata display | ✅ Có | `ContentMediaCover` + `sourceUrl` overlay |
| Tags on detail | ✅ Có | `ContentItemDetail` type có `tags: ManualTag[]` |
| **Remix outputs on detail** | ❌ **Thiếu** | Phải vào `/remix/[id]` để xem outputs |
| **Calendar usage on detail** | ❌ **Thiếu** | Phải vào `/calendar` để xem scheduled items |
| **Add to Calendar CTA** | ❌ **Thiếu** | `AddToCalendarDialog` component đã có nhưng chưa gắn vào detail page |
| **Unified "content detail" view** | ❌ **Thiếu** | Trang hiện tại là "AI Breakdown" không phải unified detail |
| **Empty states remix/calendar** | ❌ **Thiếu** | Không có "chưa remix" / "chưa calendar" trên detail page |

## Implementation Scope (Hẹp)

### Goal
Biến `/breakdown/[contentItemId]` từ trang "AI Breakdown" thành **unified Content Detail Page** — một view gọn gàng gom source info, breakdown, remix outputs, calendar usage.

### 1. Server Page (`src/app/(app)/breakdown/[contentItemId]/page.tsx`)
- Giữ URL `/breakdown/[id]` (tránh đổi route gây regression).
- **Thêm queries song song** (parallel `Promise.all` để không tăng TTFB):
  - `listGeneratedOutputsByItemId(supabase, contentItemId)` → remix outputs
  - `listCalendarItemsForWorkspace(supabase, workspaceId)` → calendar items (filter client-side hoặc thêm server filter `content_item_id`)
- Pass thêm `outputs` và `calendarItems` xuống `BreakdownView`.
- SourceQuality badge **luôn** được tính toán và truyền xuống (không chỉ khi blocked).

### 2. Client View (`src/components/custom/breakdown/breakdown-view.tsx`)
- Restructure layout: đảm bảo **CTA rõ ở top** — Analyze, Remix, Add to Calendar.
- **Thêm Remix Outputs section** — hiển thị list gọn (title, formatLabel, toneLabel, createdAt) với link đến `/remix/[id]`.
- **Thêm Calendar Usage section** — hiển thị calendar items liên quan content item này (scheduledAt, status, channelLabel).
- **Thêm "Add to Calendar" CTA** — dùng `AddToCalendarDialog` component đã có (`src/components/custom/calendar/add-to-calendar-dialog.tsx`).
- **SourceQuality badge luôn visible** — đặt ở header/source section, không conditional.
- **Empty states**:
  - Breakdown: giữ nguyên ("Bấm Phân tích AI")
  - Remix: "Chưa có remix. Tạo remix từ AI Breakdown."
  - Calendar: "Chưa lên lịch. Thêm vào Content Calendar."

### 3. Không đổi
- **Không đổi DB schema** — dùng bảng `generated_outputs` và `content_calendar_items` đã có.
- **Không đổi AI provider/prompt** — analysis flow giữ nguyên.
- **Không đổi migration/RLS** — nếu query calendar cần RLS check, dùng `supabase` server client đã có.
- **Không đổi các trang riêng lẻ** — `/remix/[id]`, `/calendar` vẫn tồn tại (detail page là tổng hợp, không thay thế).

## Files Có Thể Cần Xem/Sửa

1. `src/app/(app)/breakdown/[contentItemId]/page.tsx` — thêm queries, pass data
2. `src/components/custom/breakdown/breakdown-view.tsx` — restructure layout, thêm sections
3. `src/components/custom/calendar/add-to-calendar-dialog.tsx` — verify props, integrate
4. `src/components/custom/remix/remix-output-list.tsx` — tham khảo cho compact list
5. `src/lib/content/remix-queries.ts` — `listGeneratedOutputsByItemId` đã có
6. `src/lib/calendar/queries.ts` — cần hàm filter calendar items by content_item_id
7. `src/types/analysis.ts` — `ContentItemDetail` đã có `tags`
8. `src/types/remix.ts` — `GeneratedOutputView`
9. `src/types/calendar.ts` — `CalendarItemView`

## Acceptance Criteria

- [ ] Content detail page hiển thị source info (thumbnail, title, platform, sourceUrl, tags) ở top/left.
- [ ] SourceQuality badge **luôn** visible trên detail page.
- [ ] Breakdown section hiển thị đúng (nếu đã analyze) hoặc empty state rõ (nếu chưa).
- [ ] Remix outputs section hiển thị list gọn (nếu có) hoặc empty state rõ.
- [ ] Calendar usage section hiển thị scheduled items (nếu có) hoặc empty state rõ.
- [ ] CTA rõ: Analyze, Remix, Add to Calendar — đều hoạt động.
- [ ] Click "Analyze" chạy analysis và refresh view.
- [ ] Click "Remix" link đến `/remix/[id]`.
- [ ] Click "Add to Calendar" mở dialog tạo calendar item.
- [ ] `npm run lint` pass.
- [ ] `npm run type-check` pass.
- [ ] `npm run build` pass.

## Test / Smoke Checklist

1. Mở board → click content card → detail page load.
2. Source metadata (thumbnail, title, platform, sourceUrl, tags) hiển thị đúng.
3. SourceQuality badge visible.
4. Breakdown sections hiển thị (nếu đã analyze).
5. Empty state breakdown nếu chưa analyze.
6. Remix outputs list hiển thị (nếu có).
7. Empty state remix nếu chưa có.
8. Calendar usage hiển thị (nếu có).
9. Empty state calendar nếu chưa có.
10. "Add to Calendar" CTA mở dialog.
11. "Analyze" CTA hoạt động.
12. "Remix" CTA link đúng `/remix/[id]`.
13. Build, lint, type-check pass.

## Risk / Regression Areas

| Risk | Mitigation |
|------|-----------|
| TTFB tăng do thêm queries | Dùng `Promise.all([...])` song song, không sequential |
| Calendar query cần workspaceId | Lấy từ `item.workspaceId` (đã có trong `ContentItemDetail`) |
| AddToCalendarDialog cần `generated_output_id` | Truyền `contentItemId` nếu dialog hỗ trợ tạo từ source |
| Remix empty state có thể confuse | Copy rõ ràng: "Chưa có remix → đi phân tích AI trước" |
| Breakdown view file lớn | Tách sections con thành component riêng nếu cần |

## Next Steps Sau Implement

1. Chạy smoke checklist trên production.
2. Comment Linear ALE-165 với kết quả smoke.
3. Move ALE-165 → Done nếu PASS.
4. Chuyển sang ALE-166+ (theo project plan).

## Notes
- Calendar vẫn là **manual scheduling**, không auto-post.
- URL import là **metadata/oEmbed best-effort**, không claim transcript đầy đủ.
- Không thêm dependency mới.
- Giữ nguyên `data-testid` đã có cho Browser Use smoke compatibility.
