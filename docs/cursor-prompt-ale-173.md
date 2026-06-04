# Cursor Prompt — ALE-173: Feedback Inbox Automation

**Issue:** ALE-173 — M11 — Feedback inbox automation
**Linear:** https://linear.app/alexgpt/issue/ALE-173/m11-feedback-inbox-automation
**Branch:** `anh555056/ale-173-m11-feedback-inbox-automation`
**Base:** `main` (current HEAD: `c48695b`)

---

## 1. What to build

Add admin-only feedback inbox at `/admin/feedback` that turns manual/Google Form feedback into structured NORM entries stored in Supabase. This replaces the current markdown/Google Sheet workflow with an in-app feedback management system.

### Core features:

1. **`feedback_entries` table** — stores normalized feedback entries
2. **Admin CRUD** — create, view, update feedback entries at `/admin/feedback`
3. **Manual import** — paste raw feedback text → create NORM entry
4. **Auto-suggest category** — simple keyword matching (no AI)
5. **Filter/triage view** — untriaged vs triaged, by category, by priority
6. **Weekly summary stats** — count by category/priority/week
7. **Sidebar entry** — "Phản hồi" in admin nav section

---

## 2. Data model — `feedback_entries`

```sql
CREATE TABLE feedback_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,

  -- Source tracking
  source TEXT NOT NULL CHECK (source IN ('google_form', 'manual_chat', 'email', 'dogfood', 'other')),
  source_ref TEXT,  -- Google Form response ID, chat message link, etc.

  -- Reporter (anonymized — no PII in public)
  reporter_name TEXT,  -- anonymized name or handle
  reporter_persona TEXT CHECK (reporter_persona IN ('creator', 'freelancer', 'agency', 'educator', 'beauty_lifestyle', 'other')),
  cohort TEXT DEFAULT 'cohort-2',

  -- NORM fields
  raw_summary TEXT NOT NULL,  -- owner-written summary of user feedback
  verbatim_quotes TEXT[],  -- array of user quotes (Vietnamese, keep emoji/typos)
  category TEXT NOT NULL CHECK (category IN ('bug', 'ux', 'fr', 'ai', 'price', 'positive')),
  priority TEXT CHECK (priority IN ('p0', 'p1', 'p2', 'p3')),
  status TEXT NOT NULL DEFAULT 'untriaged' CHECK (status IN ('untriaged', 'triaged', 'actioned', 'closed')),

  -- Action tracking
  linear_issue_id TEXT,  -- ALE-XXX if linked
  action_notes TEXT,  -- what was done
  replied_to_user BOOLEAN DEFAULT FALSE,

  -- Metadata
  device TEXT CHECK (device IN ('desktop', 'mobile', 'both', 'unknown')),
  reproducible TEXT CHECK (reproducible IN ('yes', 'no', 'not_tried')),
  notes TEXT,  -- internal admin notes (NOT shown in public UI)

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS: admin-only CRUD
ALTER TABLE feedback_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can manage feedback entries"
  ON feedback_entries
  FOR ALL
  USING (is_workspace_admin(workspace_id))
  WITH CHECK (is_workspace_admin(workspace_id));

-- Index for triage queries
CREATE INDEX idx_feedback_entries_status ON feedback_entries(workspace_id, status);
CREATE INDEX idx_feedback_entries_category ON feedback_entries(workspace_id, category);
CREATE INDEX idx_feedback_entries_priority ON feedback_entries(workspace_id, priority);
```

### Enums (inline CHECK constraints, same pattern as beta_testers)

No separate enum tables needed. Use TEXT with CHECK constraints (matches ALE-172 pattern).

---

## 3. Auto-suggest category (keyword matching)

Simple rule-based category suggestion — NO AI, NO LLM call.

```typescript
// src/lib/feedback/auto-classify.ts

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  bug: ['lỗi', 'error', 'crash', 'fail', 'không được', '500', 'broken', 'mất data', 'không lưu'],
  ux: ['khó hiểu', 'không thấy', 'không biết', 'confusing', 'ở đâu', 'bấm nào', 'không tìm'],
  fr: ['muốn', 'ước', 'thêm', 'có thể', 'auto', 'tự động', 'feature', 'tính năng'],
  ai: ['AI', 'hook', 'remix', 'giọng', 'tiếng Việt', 'máy', 'không tự nhiên', 'chất lượng'],
  price: ['giá', 'đắt', 'rẻ', 'trả phí', '200k', 'pricing', 'cost', 'worth'],
  positive: ['hay', 'tuyệt', 'thích', 'good', 'great', 'tốt', 'ưng', 'đỉnh', 'amazing'],
};

export function suggestCategory(text: string): string | null {
  const lower = text.toLowerCase();
  const scores: Record<string, number> = {};

  for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    scores[cat] = keywords.filter((kw) => lower.includes(kw.toLowerCase())).length;
  }

  const best = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];
  return best && best[1] > 0 ? best[0] : null;
}
```

---

## 4. Files to create/change

### New files:

| File | Purpose |
|------|---------|
| `src/app/(app)/admin/feedback/page.tsx` | Admin feedback page (server component) |
| `src/components/custom/admin/feedback-form.tsx` | Create/edit feedback dialog (client component) |
| `src/components/custom/admin/feedback-table.tsx` | Feedback list with filters (client component) |
| `src/components/custom/admin/feedback-summary.tsx` | Weekly summary stats widget |
| `src/lib/feedback/actions.ts` | Server actions: create, update, delete, import |
| `src/lib/feedback/queries.ts` | Server queries: list, filter, stats |
| `src/lib/feedback/auto-classify.ts` | Keyword-based category suggestion |
| `src/types/feedback.ts` | TypeScript types for feedback_entries |
| `src/lib/feedback/__tests__/auto-classify.test.ts` | Unit tests for auto-classify |
| `supabase/migrations/20260604140000_feedback_entries.sql` | Migration |

### Modified files:

| File | Change |
|------|--------|
| `src/types/database.ts` | Add `feedback_entries` table type |
| `src/components/custom/app/app-sidebar.tsx` | Add "Phản hồi" link in admin nav section |

### Files NOT to change:

- No changes to landing, dashboard, boards, calendar, remix, breakdown
- No changes to beta-testers
- No changes to analytics
- No email automation
- No Google Form/Sheet API integration (v1 is manual import only)

---

## 5. Admin/Security model

**Same pattern as ALE-172 (beta testers):**

- RLS: `is_workspace_admin(workspace_id)` for ALL operations
- No public/anon access
- `notes` field: admin-only, NOT rendered in any public UI
- `verbatim_quotes`: admin-only, NOT rendered outside admin page
- `reporter_name`: anonymized, NOT linked to user email in public UI

**Privacy checklist:**

- [ ] `notes` column never rendered outside `/admin/feedback`
- [ ] `verbatim_quotes` never rendered outside `/admin/feedback`
- [ ] No console.log of reporter_name, notes, or quotes
- [ ] Table view shows summary only (category, priority, status) — no raw quotes
- [ ] Detail view (edit dialog) shows full data — admin only
- [ ] No service role usage
- [ ] Weekly summary uses aggregate counts only — no individual data

---

## 6. Google Form/Sheet integration (v1 = manual only)

**Current state:** Google Sheet at `15dJSsUpHUTsm96NNb2GIltsx1MnNuNlsWD04EP5jjx4` stores feedback.

**v1 approach: Manual import**
- Admin copies rows from Google Sheet
- Pastes into "Import feedback" textarea (CSV-like: one entry per line, or structured paste)
- App parses and creates `feedback_entries` rows
- Auto-suggests category from raw_summary text

**Future (NOT in this PR):**
- Google Sheets API webhook
- CSV file upload
- Google Form webhook

---

## 7. Vietnamese UI copy

All UI text must be in Vietnamese:

| Element | Vietnamese |
|---------|-----------|
| Page title | "Phản hồi beta" |
| Subtitle | "Quản lý feedback cohort — chỉ owner/admin workspace" |
| Create button | "Thêm phản hồi" |
| Import button | "Nhập từ Sheet" |
| Status: untriaged | "Chưa phân loại" |
| Status: triaged | "Đã phân loại" |
| Status: actioned | "Đã xử lý" |
| Status: closed | "Đã đóng" |
| Category: bug | "Lỗi" |
| Category: ux | "UX" |
| Category: fr | "Tính năng" |
| Category: ai | "AI" |
| Category: price | "Giá" |
| Category: positive | "Tích cực" |
| Priority: p0 | "P0 — Nghiêm trọng" |
| Priority: p1 | "P1 — Cao" |
| Priority: p2 | "P2 — Trung bình" |
| Priority: p3 | "P3 — Thấp" |
| Filter: all | "Tất cả" |
| Filter: untriaged | "Chưa phân loại" |
| Privacy note | "Ghi chú nội bộ: chỉ hiển thị khi chỉnh sửa." |

---

## 8. Sidebar integration

Add "Phản hồi" link in the admin nav section of `app-sidebar.tsx`, AFTER "Quản tester":

```tsx
// In the admin-only section of AppSidebar
{
  href: "/admin/feedback",
  label: "Phản hồi",
  icon: MessageSquare,  // or Inbox
}
```

---

## 9. Verification checklist

Before requesting review:

```bash
npm run lint          # PASS
npm run type-check    # PASS
npm run build         # PASS
npx tsx --test src/lib/feedback/__tests__/auto-classify.test.ts  # PASS
```

---

## 10. Migration safety

**Migration must be reviewed by Hermes before apply.**

- Table is empty (no data migration needed)
- RLS uses existing `is_workspace_admin()` helper
- No foreign keys to auth.users (only workspaces)
- CHECK constraints for enums (same pattern as beta_testers)
- Indexes on status, category, priority for triage queries

---

## 11. Scope limits

### IN scope:
- feedback_entries table + RLS
- Admin CRUD at /admin/feedback
- Manual import (paste from Sheet)
- Auto-suggest category (keyword matching)
- Filter by status/category/priority
- Weekly summary stats (count by category, count by priority)
- Vietnamese UI copy
- Sidebar entry

### OUT of scope (do NOT implement):
- Google Sheets API integration
- Google Form webhook
- CSV file upload
- AI auto-classification (LLM)
- Email notification on new feedback
- Auto-create Linear issue from feedback
- User-facing feedback form (Google Form is sufficient)
- Public feedback submission page
- Real-time updates (polling is fine)

---

## 12. Pattern reference — ALE-172 (beta testers)

Follow the exact same patterns from ALE-172:

1. **Server actions** — `"use server"`, `ActionResult<T>` type, `mapDbError()` for Vietnamese errors
2. **Queries** — separate `queries.ts` file, Supabase client from `@/lib/supabase/server`
3. **Types** — separate `types/feedback.ts`, extend `Database` type
4. **Page** — server component that fetches data, passes to client components
5. **Form** — Radix Dialog (shadcn), client component with `useActionState`
6. **Table** — client component with filters, sortable columns
7. **RLS** — `is_workspace_admin(workspace_id)` same as beta_testers
8. **Migration** — SQL file in `supabase/migrations/`, enable RLS, add policies

---

## 13. Smoke checklist (for Hermes review after implementation)

| # | Test | Expected |
|---|------|----------|
| 1 | Login as workspace admin | Dashboard loads |
| 2 | Navigate to /admin/feedback | "Phản hồi beta" page loads, empty state |
| 3 | Create feedback entry | Dialog opens, fill all fields, save → table shows 1 entry |
| 4 | Auto-suggest category | Paste Vietnamese text → category auto-selected |
| 5 | Update status (untriaged → triaged) | Status column updates |
| 6 | Update priority | Priority column updates |
| 7 | Filter by status | "Chưa phân loại" filter works |
| 8 | Filter by category | "Lỗi" filter works |
| 9 | Import from Sheet (paste) | Paste CSV-like text → multiple entries created |
| 10 | Vietnamese labels render | All labels in Vietnamese |
| 11 | Sidebar "Phản hồi" works | Link navigates to /admin/feedback |
| 12 | /admin/analytics unaffected | Page loads normally |
| 13 | /admin/beta-testers unaffected | Page loads normally |
| 14 | /dashboard unaffected | Page loads normally |
| 15 | No email/notes visible outside admin | Privacy check |
| 16 | No console/runtime errors | Zero JS errors |
| 17 | Delete entry (if window.confirm) | Code-reviewed + SQL verified |
