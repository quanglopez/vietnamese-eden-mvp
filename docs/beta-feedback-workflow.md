# Beta Feedback Normalization Workflow — Vietnamese Eden MVP

**Created:** 2026-06-04 (ALE-169)
**Purpose:** Standardize Cohort 2+ beta feedback intake, categorization, priority scoring, and weekly reporting.
**Scope:** Docs/workflow only — no app code.

Related docs:
- [beta-feedback-round-2.md](./beta-feedback-round-2.md) — Cohort 2 feedback tracker (live)
- [beta-feedback-plan.md](./beta-feedback-plan.md) — Overall beta plan
- [manual-feedback-intake.md](./manual-feedback-intake.md) — Manual intake (chat, no form)
- [feedback-triage.md](./feedback-triage.md) — Triage process + Linear template
- [project-status.md](./project-status.md) — Source of truth for current state

Feedback source of truth (Google Sheet):
https://docs.google.com/spreadsheets/d/15dJSsUpHUTsm96NNb2GIltsx1MnNuNlsWD04EP5jjx4/

---

## 1. Intake Sources

| Source | Channel | Normalize path | Doc |
|--------|---------|---------------|-----|
| **Google Form** | Form URL gửi user | Form response → sheet → manual triage | [beta-feedback-plan.md](./beta-feedback-plan.md) §5 |
| **Google Sheet** | Direct entry / CSV | Sheet row → NORM YAML | [manual-feedback-intake.md](./manual-feedback-intake.md) §4 |
| **Manual chat** | Telegram, Zalo, email, DM | RAW block → NORM YAML | [manual-feedback-intake.md](./manual-feedback-intake.md) §3–4 |
| **Dogfood internal** | Team chat, voice notes | RAW block → NORM YAML | Same as manual chat |

**Rule:** Every feedback entry, regardless of source, MUST be normalized to a NORM entry before triage. No triage from raw text alone.

---

## 2. Feedback Categories (Unified)

| Category | Code | Definition | Example | Default action |
|----------|------|-----------|---------|---------------|
| **Bug** | `bug` | Reproducible technical error — crash, 500, data loss, wrong output | "Remix fail JSON parse" | Linear issue (P0/P1/P2/P3) |
| **UX confusion** | `ux` | User doesn't understand next step; not a technical bug | "Không thấy nút remix" | Doc/copy fix first; Linear if ≥2 users |
| **Feature request** | `fr` | New capability ask | "Auto-post TikTok" | Backlog FR: issue; no commitment |
| **AI quality** | `ai` | Output wrong, unnatural, off-tone | "Hook lệch, không tiếng Việt tự nhiên" | Tag `ai-quality` in Linear; tune prompt/provider |
| **Pricing** | `price` | Reaction to pricing / willingness to pay | "Chưa đáng 200k/tháng" | Record insight; no code action |
| **Positive signal** | `positive` | Praise, delight, "this is great" | "Breakdown cực hay, đúng ý mình" | Record insight; share with team; product testimonial |

**Compound entries:** When feedback spans multiple categories (e.g., bug + AI quality), assign the **most severe** as primary and note secondary categories. Example: `primary: bug (P1), secondary: ai`.

---

## 3. Priority Scoring Rubric (P0–P3)

| Priority | Label | Criteria | Action | SLA |
|----------|-------|----------|--------|-----|
| **P0** | Critical | Blocks core flow, data loss, security issue, auth broken for all users | Hotfix immediately; notify cohort | 4h |
| **P1** | High | Major bug affecting ≥30% of users; core feature unusable for segment | Fix in current sprint | 24h |
| **P2** | Medium | Minor bug with workaround; polish issue; single-user report | Backlog; fix if time permits | 48h |
| **P3** | Low | Cosmetic, nice-to-have, edge case | Backlog; close as "won't fix" if never reported again | None |

### P0 escalation triggers

Any ONE of these → automatic P0:
- App returns 500 for core flow (breakdown, remix, calendar)
- User data lost (content, board, workspace gone after refresh)
- Auth broken (cannot login, cannot signup)
- Security vulnerability (RLS bypass, leaked data)

### Priority × Frequency matrix

| | High impact | Medium impact | Low impact |
|---|------------|--------------|-----------|
| **≥3 users** | P0 | P1 | P1 |
| **2 users** | P1 | P1 | P2 |
| **1 user** | P1 | P2 | P3 |
| **Unclear freq** | P1 | P2 | P3 |

### Priority override rule

If a pattern from Round 1 was marked **Resolved** (e.g., CJK leakage ALE-148) and reappears in Round 2 → automatic **P0 regression** issue, hold cohort expansion.

---

## 4. Normalized Feedback Entry Format

Every feedback entry, regardless of source, is stored as a NORM entry. For cohort tracking, append to `beta-feedback-round-2.md` §5 (Normalized Feedback Section).

```markdown
### NORM-2026MMDD-NNN

| Field | Value |
|-------|-------|
| **Source** | Google Form / Sheet / Telegram / Zalo / Email / Dogfood |
| **Cohort** | cohort-2 |
| **User** | name or handle (anonymized) |
| **Persona** | Creator / Freelancer / Agency / Audit-only |
| **Date received** | 2026-MM-DD |
| **Device** | Desktop / Mobile / Both / Unknown |
| **Screenshots** | None / filename (not committed) |

#### Verbatim quote(s)
> "[Exact user words, Vietnamese, keep emoji and typos]"
> "[Second quote if multiple messages]"

#### Classification

| Dimension | Value |
|-----------|-------|
| **Primary category** | `bug` / `ux` / `fr` / `ai` / `price` / `positive` |
| **Secondary category** | (optional) |
| **Priority** | P0 / P1 / P2 / P3 |
| **Reproducible** | Yes / No / Not tried |
| **Repro steps** | URL + actions (if attempted) |
| **Related issues** | ALE-XXX (if duplicate/related) |

#### Suggested action
- [ ] Create Linear issue (title: `P#: ...`)
- [ ] Add to existing issue (ALE-XXX)
- [ ] Doc/onboarding change only
- [ ] Record insight only (no code)
- [ ] Reply to user (template: [feedback-triage.md §5](./feedback-triage.md#5-phản-hồi-mẫu-cho-user))
```

---

## 5. Weekly Summary Template

Run every Monday (or after 7 days of active cohort). Paste into a new section in `beta-feedback-round-2.md` or as a standalone weekly doc.

```markdown
## Weekly Summary — YYYY-MM-DD to YYYY-MM-DD

### This week's numbers

| Metric | This week | Cohort total |
|--------|-----------|-------------|
| New responses | N | N |
| Completed full flow | N | N |
| Partial flow | N | N |
| Audit-only | N | N |
| Dropped / no response | N | N |
| New P0 bugs | N | N |
| New P1 bugs | N | N |
| New P2/P3 issues | N | N |
| Positive signals | N | N |

### New feedback this week

| # | User | Category | Priority | Summary | Action |
|---|------|----------|----------|---------|--------|
| 1 | Name | bug | P1 | Remix JSON parse fail mobile | ALE-XXX |
| 2 | Name | positive | — | "Breakdown quality is amazing" | Testimonial |
| ... | ... | ... | ... | ... | ... |

### Patterns to watch

| Pattern | Count this week | Count total | Trend vs last week | Risk |
|---------|----------------|-------------|-------------------|------|
| Voice Profile confusion | N | N | ↑ / ↓ / = | Low / Med / High |
| CJK leakage | N | N | ↑ / ↓ / = | Low / Med / High |
| *(new pattern)* | N | N | NEW | ... |

### Action items for next week

1. **Urgent (this week):** ...
2. **Sprint backlog:** ...
3. **Docs/onboarding updates:** ...
4. **Reply pending:** N users awaiting response

### Decision gate status

| Criterion | Target | Actual | Status |
|-----------|--------|--------|--------|
| Completed full flow | ≥5 | N | ⬜ / ✅ |
| P0 bugs | 0 | N | ⬜ / ✅ |
| P1 bugs | ≤2 | N | ⬜ / ✅ |
| No regression on R1 fixes | All hold | — | ⬜ / ✅ |
| CJK retry rate (ALE-152) | <1/3 | N | ⬜ / ✅ |

**Gate verdict:** WAITING / GO / NO-GO
```

---

## 6. End-to-End Workflow

```
User feedback arrives (any channel)
  │
  ├─→ 1. INTAKE: Save raw verbatim (RAW-YYYYMMDD-NNN)
  │     Docs: manual-feedback-intake.md §3
  │
  ├─→ 2. NORMALIZE: Convert to NORM entry
  │     Docs: §4 above (this file)
  │     Rule: missing fields → "Unknown", never fabricate
  │
  ├─→ 3. CLASSIFY: Assign primary category + priority
  │     Docs: §2–3 above (this file)
  │     Cross-ref: feedback-triage.md §2–3
  │
  ├─→ 4. REPRODUCE: Attempt to reproduce on production
  │     Docs: feedback-triage.md §1 step 2
  │     Rule: can't repro → "Not tried", don't guess P0
  │
  ├─→ 5. ACTION:
  │     ├─ P0/P1 bug → Linear issue immediately
  │     ├─ P2/P3 → Backlog Linear issue
  │     ├─ UX confusion → Doc/copy change; Linear if ≥2 users
  │     ├─ AI quality → Tag `ai-quality`; tune prompt
  │     ├─ Feature request → Backlog FR: issue
  │     ├─ Pricing → Record insight only
  │     └─ Positive signal → Record insight; share with team
  │
  ├─→ 6. REPLY: Send template response to user
  │     Docs: feedback-triage.md §5
  │     SLA: P0=4h, P1=24h, rest=24–48h
  │
  └─→ 7. TRACK: Update beta-feedback-round-2.md §5 + §7
        Weekly: Run §5 summary template (above)
        Gate check: After 5 completed OR 7–10 days
```

---

## 7. Integrity Rules (Anti-fabrication)

| # | Rule |
|---|------|
| 1 | **Unknown is valid** — missing field → `Unknown`, never guess a score |
| 2 | **Keep verbatim quotes** — every NORM entry must have ≥1 user quote |
| 3 | **Don't infer WTP** — only record pricing if user explicitly mentions money |
| 4 | **Bug ≠ confusion** — can't reproduce → `reproduced: Unknown`, don't assign P0 |
| 5 | **No secrets** — never paste passwords, API keys, session tokens in RAW/NORM/Linear |
| 6 | **No synthetic feedback** — every entry maps to a real user message; never invent "test user" data |
| 7 | **Cross-reference before creating** — search Linear for duplicates before creating new issue |

---

## 8. Doc Index

| Doc | Role | When to use |
|-----|------|-------------|
| **beta-feedback-workflow.md** (this file) | Master workflow | Start here for any feedback task |
| **beta-feedback-round-2.md** | Cohort 2 tracker | Record responses, run weekly summary |
| **beta-feedback-plan.md** | Beta strategy | Cohort selection, form questions §5 |
| **feedback-triage.md** | Triage process | Category → action mapping, Linear templates, reply templates |
| **manual-feedback-intake.md** | Manual intake | RAW→NORM conversion, chat prompt templates |
| **project-status.md** | Project state | Current active issue, decision gate, changelog |
