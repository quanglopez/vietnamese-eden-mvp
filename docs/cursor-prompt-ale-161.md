# Cursor Prompt — ALE-161: Board search + platform filter + empty states

**Linear:** [ALE-161](https://linear.app/alexgpt/issue/ALE-161)  
**Branch:** `feat/ale-161-board-search-filter`  
**Scope:** Board detail page UI only. Không thay đổi Supabase schema.

---

## Context

Vietnamese Eden MVP hiện có `/(app)/dashboard` hiển thị board content trong các card. Owner muốn thêm search, platform filter và empty states cho board detail page trước khi làm tag system.

---

## Current State

Board detail page hiển thị list `ContentCardItem`. Mỗi card có:
- `imageUrl`
- `title` (ví dạng: "Đánh giá iPhone 16")
- `platform` badge (ví dạng: "TikTok", "YouTube", "Instagram", "Facebook", "LinkedIn", "Other")
- `analysisStatus` badge (unread/read/needs_update)

---

## Acceptance Criteria

### Search
1. **Search input** ở trên header board (hoặc sticky trên đầu list).
2. **Search term:** match `title`, `raw_content`, `source_url` — **case-insensitive contains**.
3. Search triggers **on input** (debounce 300ms, không ấn Enter).
4. Clear button (×) visible khi search có text.

### Platform Filter
5. **Filter toggle group** hoặc **dropdown**: TikTok, Instagram, YouTube, Facebook, LinkedIn, Other.
6. Cho phép **multi-select** (checkbox style, hoặc shift-click).
7. Default: **all selected** (hoặc "All" toggle).
8. Chỉ hiển thị content có `platform` trong selected filter.

### Empty States
9. Nếu **không match search:**
   ```
   "Không tìm thấy content với từ khóa 'iphone'"
   ```
10. Nếu **không content cho platform đã chọn** (không liên quan search):
    ```
    "Không có content TikTok trong board này"
    ```
    (Thay "TikTok" bằng platform name tương ứng. Nếu nhiều platforms: "Không có content TikTok, Instagram trong board này")
11. ⚠️ **Không fallback show all** khi filter/filter empty. Phải giữ trạng thái search/filter hiện tại.

### Preserve Actions
12. Add content button + breakdown button + remix button **vẫn visible** trên header trong mọi trạng thái.
13. URL importer badges (source quality: orange/red/blue/green/yellow) **không regression** sau khi filter.

### Performance
14. Filter/search **client-side** (không gọi Supabase mỗi lần filter). Data đã loaded.
15. Nếu board > 200 items, thêm lazy scroll / pagination (tuỳ chọn, có thể để cho issue sau).

### Accessibility
16. Search input có `aria-label="Tìm kiếm content"`.
17. Filter có `aria-label` per platform toggle.

---

## UI Style

- Dùng `shadcn/ui` components có sẵn (Input, Badge, ToggleGroup, ScrollArea).
- Filter toggle: nhỏ gọn, inline với search (row flex wrap).
- Empty state: icon `SearchX` từ lucide-react, text muted, giữa màn hình.
- Mobile: search full width, filter horizontal scroll.

---

## Edge Cases

| Case | Expected |
|------|----------|
| Search + platform filter cùng lúc | Kết hợp cả 2 (AND logic) |
| Search rỗng + filter all | Hiện all content |
| Search text sau đó đổi filter | Giữ search text, áp filter mới |
| URL import badge visible khi search | Badge vẫn render đúng màu (regression test) |
| Board 0 content | "Chưa có content trong board này" (không phải empty search) |

---

## Technical Notes

- **Location:** Component board list (hoặc `ContentList` / `BoardDetail`).
- **State:** `searchQuery: string`, `activePlatforms: Platform[]` (default all).
- **Derived:** `filteredItems = items.filter(item => matchesSearch(item, searchQuery) && activePlatforms.includes(item.platform))`.
- **URL params:** Có thể sync search/filter vào URL query (optional, bonus).
- **Types:** Nếu `platform` type chưa có enum, define `type Platform = 'tiktok' | 'instagram' | 'youtube' | 'facebook' | 'linkedin' | 'other'`.

---

## Guard Rails

- Không thay đổi Supabase schema.
- Không thay đổi AI Breakdown / Remix logic.
- Không thêm API route mới.
- Chỉ client-side UI. Nếu cần server-filter, để cho ALE-163 (saved views).

---

## Verification

```bash
npm run lint
npm run type-check
npm run build
```

---

## Related

- [ALE-162](https://linear.app/alexgpt/issue/ALE-162) — Manual tags (đè lên card + filter, tiếp theo)
- [ALE-163](https://linear.app/alexgpt/issue/ALE-163) — Saved views (lưu search/filter/tag, sau đó)
- [ALE-164](https://linear.app/alexgpt/issue/ALE-164) — Bulk actions (cuối)
- [M9 project status](../../docs/project-status.md)
