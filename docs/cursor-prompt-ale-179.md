```markdown
# Cursor prompt — ALE-179 Feedback-to-Linear candidate generator (Option A MVP)

> **COPY THIS ENTIRE BLOCK INTO Cursor Composer/Agent**  
> (in repo `vietnamese-eden-mvp`)

## Scope
Generate a Linear issue candidate draft from ALE-173 feedback entries in `/admin/feedback`. The draft must be a **preview markdown only** — no auto-creation of Linear issues. Owner must manually copy it into Linear and create the issue.

## Context
- Feedback inbox is at `/admin/feedback` (admin-only page)
- Existing v1 process is manual: create/edit/delete entries, manual paste import, keyword-based category suggestion
- No Google Sheets webhook/OAuth
- No AI classification
- Linear issue creation must remain owner-approved/manual in v1
- High risk: cannot auto-create issues; must stay manual
- Migration may be needed only to store candidate status/metadata — stop if needed and request migration approval
- If migration needed, stop implementation and propose SQL review plan separately

## Planning steps
1. Inspect current feedback implementation
   - `feedback_entries` table/schema
   - `/admin/feedback` page UI
   - `feedback` queries/actions
   - existing `category` / `severity` fields
   - existing admin UI patterns
   - existing Linear references/docs (see `linear-issue-orchestrator` skill)

2. Decide if ALE-179 can be implemented without migration
   - Option A (MVP — no migration): Generate candidate draft on front-end/preview as serialized markdown from existing feedback data
   - Option B (Migration + persisted candidate): Store draft in new table/column
   - Option C (Linear API integration): Out of scope for v1 — must be rejected unless owner explicitly approves

3. Recommend Option A/MVP as lowest risk
   - No persistence beyond existing feedback fields
   - Owner review gate explicitly visible
   - No Linear API calls, no Google Sheets/OAuth, no AI classification

## Workflow outline (no code yet)
1. On `/admin/feedback` page, add **"Generate Linear candidate"** action button next to each entry or at top
2. Clicking opens **preview modal** showing:
   - Suggested title (auto-generated from feedback summary)
   - Severity (select dropdown: P0 blocker, P1 major bug, P2 polish, UX confusion, AI quality issue, Feature request, Pricing objection, Positive signal)
   - Category (dropdown with existing categories)
   - Raw feedback summary (trimmed)
   - Analyst notes (fixed text)
   - Evidence / source (link to feedback entry)
   - Suggested acceptance criteria (template)
   - Duplicate hint (list similar entries by keyword/category, warn only)
   - Recommended Linear project (e.g., M12 — Beta Launch & Activation)
   - Full copyable markdown format
3. **Copy markdown** button copies raw markdown to clipboard (no network request)
4. **Strong UI disclaimer**:
   - “Đây chỉ là bản nháp. Chưa tạo Linear issue. Chỉ sao chép markdown để dán vào Linear.”
   - No Linear API call, no auto-creation
5. Duplicate detection:
   - Group by (title, severity, category) + keyword match — show count and “Warning: possible duplicate” if >1
   - Do NOT auto-dedupe

## Pointers
- Maximum 3 sections (max 350 tokens from `related.context`): “Current State”, “Required Panels”, “Optional Notes”
- References cited in Linear must be deeply read, not just named.
- Do NOT commit or create branch yet — wait for owner confirmation after review.
- Use `skill_view` to read `linear-issue-orchestrator` and `cursor-prompt-writer` for patterns.
- Follow `linear-issue-orchestrator` migration warnings: **do not add DB columns unless migration plan approved**.
- The issue mentions “owner review gate is explicit” — must be part of UI.
- Output must be exactly Markdown, not HTML — Linear strips HTML.

## Verify commands (run only if implementing)
```bash
npm run lint
npx tsc --noEmit
npm run build
```

## Manual smoke (no implementation yet)
- /admin/feedback loads (existing functionality)
- Generate Linear candidate opens preview modal
- Copy markdown works (clipboard)
- Disclaimer visible
- Duplicate hints show when multiple entries match
- No network request to Linear
- Existing create/edit/delete/import still works
- /admin/beta-launch loads
- /admin/analytics loads
- /dashboard loads
- /boards loads
- no console errors
```
