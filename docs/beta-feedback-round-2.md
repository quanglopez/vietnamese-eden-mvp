# ALE-151 — Beta Feedback Round 2 Triage (Cohort 2)

**Generated:** 2026-06-01  
**Analyst:** AI Beta Feedback Analyst (Hermes Agent)  
**Source:** Cohort 2 beta users (10–20 invited)  
**Scope:** Không sửa code, không chạm app. Chỉ thu thập, phân tích evidence, tạo Linear issues từ feedback thật.

---

## 0. Cohort 2 Setup

| Field | Value |
|-------|-------|
| Cohort | **Cohort 2** |
| Cohort size target | **10–20 users** |
| Invite date | _TBD — điền sau khi gửi invite đầu tiên_ |
| App version | ALE-151 (smoke PASS, GO) |
| Production URL | https://vietnamese-eden-mvp.vercel.app/ |
| Invite message | `docs/beta-invite-message.md` |
| Decision gate | **After 5 completed tests** OR **after 7–10 days** (whichever first) |
| Decision criteria | >= 4/5 users complete full flow without P0 bug → Cohort 3 GO |
| Watch items (from ALE-151) | ALE-152 (CJK retry flakiness, P2), ALE-153 (Calendar channel display, P3) |

---

## 1. User / Persona Table

_Điền khi nhận response. Format: name, role, persona type, invite date, response date, status._

| # | Name / Handle | Role | Persona type | Invite date | Response date | Status |
|---|---------------|------|--------------|-------------|---------------|--------|
| 1 | _TBD_ | _TBD_ | _Creator / Freelancer / Agency / Audit-only_ | _TBD_ | _TBD_ | _Invited / Accepted / In progress / Completed / Dropped_ |
| 2 | _TBD_ | _TBD_ | _…_ | _TBD_ | _TBD_ | _…_ |
| 3 | _TBD_ | _TBD_ | _…_ | _TBD_ | _TBD_ | _…_ |
| 4 | _TBD_ | _TBD_ | _…_ | _TBD_ | _TBD_ | _…_ |
| 5 | _TBD_ | _TBD_ | _…_ | _TBD_ | _TBD_ | _…_ |
| 6 | _TBD_ | _TBD_ | _…_ | _TBD_ | _TBD_ | _…_ |
| 7 | _TBD_ | _TBD_ | _…_ | _TBD_ | _TBD_ | _…_ |
| 8 | _TBD_ | _TBD_ | _…_ | _TBD_ | _TBD_ | _…_ |
| 9 | _TBD_ | _TBD_ | _…_ | _TBD_ | _TBD_ | _…_ |
| 10 | _TBD_ | _TBD_ | _…_ | _TBD_ | _TBD_ | _…_ |
| 11–20 | _(optional)_ | | | | | |

**Persona types (round-1 reference):**
- Creator (làm content thật, muốn workflow end-to-end)
- Freelancer (làm content cho 2–3 client)
- Agency user (team 2–3 người)
- UX-aware beta reviewer (review cho có feedback)
- AI-assisted UX auditor (audit AI quality)
- Audit-only (chỉ review landing, không test app)

---

## 2. Completion Metrics

| Metric | Target | Actual | Notes |
|--------|--------|--------|-------|
| Total invited | 10–20 | _TBD_ | |
| Responded (≥ 1 message) | ≥ 8 | _TBD_ | |
| Completed full flow (Breakdown + Remix + Calendar) | ≥ 5 | _TBD_ | Decision gate |
| Partial (≥ 1 core feature) | _TBD_ | _TBD_ | |
| Audit-only (no app test) | _TBD_ | _TBD_ | |
| Dropped / no response | _TBD_ | _TBD_ | |
| Reported P0 bug | 0 | _TBD_ | Critical |
| Reported P1 bug | ≤ 2 | _TBD_ | Acceptable |
| Encountered CJK error (ALE-152 watch) | _TBD_ | _TBD_ | Watch: < 1/3 rate |
| Encountered Calendar display bug (ALE-153 watch) | _TBD_ | _TBD_ | Watch |

**Completion rate** = (Completed full flow) / (Total responded) — target ≥ 5/8 = 62.5%

---

## 3. Score Summary

_Scores từ user chấm (1–5 scale). Round-1 baseline: Breakdown 4.25, Remix 4.0, Voice 3.25, Calendar 3.5._

| Feature | Round-1 avg | Round-2 avg | n | Delta | Notes |
|---------|-------------|-------------|---|-------|-------|
| AI Breakdown | 4.25 | _TBD_ | _TBD_ | _TBD_ | |
| Remix (FB) | 4.00 | _TBD_ | _TBD_ | _TBD_ | |
| Remix (TikTok) | _NEW_ | _TBD_ | _TBD_ | _TBD_ | New in cohort 2 |
| Voice Profile | 3.25 | _TBD_ | _TBD_ | _TBD_ | Post ALE-142 fix |
| Calendar | 3.50 | _TBD_ | _TBD_ | _TBD_ | Post ALE-145 fix |
| Overall UX | _TBD_ | _TBD_ | _TBD_ | _TBD_ | |
| AI Quality | _TBD_ | _TBD_ | _TBD_ | _TBD_ | |

**Note:** Round-2 dùng cùng rubric 1–5 để so sánh với round-1. Nếu user không chấm, đánh dấu "n/a".

---

## 4. Raw Feedback Section

_Ghi verbatim từ response. KHÔNG edit, KHÔNG paraphrase. Quote trong ngoặc kép._

### User 1: _[name]_
- **Response date:** _TBD_
- **Role:** _TBD_
- **Status:** _TBD_
- **Raw feedback:**
  > _TBD_

### User 2: _[name]_
- _TBD_

_(Add more users as responses come in.)_

---

## 5. Normalized Feedback Section

_Phân loại feedback theo category. Mỗi entry: severity, summary, evidence quote, user._

| # | User | Category | Severity (P0/P1/P2/P3) | Summary | Evidence (verbatim) |
|---|------|----------|------------------------|---------|---------------------|
| 1 | _TBD_ | _Bug / UX / AI Quality / Pricing / Feature_ | _P0/P1/P2/P3_ | _TBD_ | > _TBD_ |
| 2 | _TBD_ | _…_ | _…_ | _…_ | > _…_ |
| 3 | _TBD_ | _…_ | _…_ | _…_ | > _…_ |

**Severity rubric:**
- **P0** — Blocker, data loss, app crash, security issue. Must fix before cohort 3.
- **P1** — Major bug / friction. Fix in next sprint.
- **P2** — Polish / minor bug. Track, fix if time.
- **P3** — Cosmetic / nice-to-have. Backlog.

---

## 6. Pattern Summary

_Các pattern xuất hiện ≥ 2 lần. Match với round-1 để xem có regression không._

| Pattern | Round-1 count | Round-2 count | Trend | Action |
|---------|---------------|---------------|-------|--------|
| Voice Profile: unclear guidance | 3 | _TBD_ | ↑ / ↓ / = | Verify ALE-142 fix holds |
| AI tasks: missing progress indicator | 2 | _TBD_ | ↑ / ↓ / = | |
| Calendar: auto-post confusion | 2 | _TBD_ | ↑ / ↓ / = | Verify ALE-145 fix holds |
| Landing: differentiation unclear | 2 | _TBD_ | ↑ / ↓ / = | |
| Remix: variants too similar | 2 | _TBD_ | ↑ / ↓ / = | |
| Content add: paste vs link unclear | 2 | _TBD_ | ↑ / ↓ / = | |
| CJK leakage in remix (ALE-152) | 0 | _TBD_ | NEW watch | < 1/3 rate |
| Calendar channel display (ALE-153) | 0 | _TBD_ | NEW watch | |
| _(new pattern from round-2)_ | — | _TBD_ | NEW | |

**Regression rule:** Nếu pattern đã "Resolved" ở round-1 (ALE-90.3, ALE-90.4) lại xuất hiện → tạo P0 issue ngay, hold cohort 3.

---

## 7. Linear Issues Created from Feedback

_Linear issues tạo từ feedback round-2. Format: key, title, priority, evidence, status._

| # | Linear key | Title | Priority | Status | Evidence |
|---|-----------|-------|----------|--------|----------|
| 1 | _TBD_ | _TBD_ | _P0/P1/P2/P3_ | _Backlog / In Progress / Done_ | _TBD_ |
| 2 | _TBD_ | _TBD_ | _…_ | _…_ | _…_ |
| 3 | _TBD_ | _TBD_ | _…_ | _…_ | _…_ |

**Pre-existing watch items (từ ALE-151, không tạo mới ở đây):**
- **ALE-152** — Track Xiaomi CJK retry flakiness (P2, monitor only)
- **ALE-153** — Fix Calendar channel display mapping (P3, cosmetic)

**Update watch items khi có evidence:**
- Nếu CJK error rate > 1/3 → update ALE-152 với evidence, promote lên P1
- Nếu Calendar display bug > 2 users report → update ALE-153 với evidence, schedule fix

---

## 8. Decision: Cohort 3 GO / NO-GO

**Decision date:** _TBD — sau 5 completed tests hoặc 7–10 days (whichever first)_

### Criteria

| Criterion | Target | Actual | Pass? |
|-----------|--------|--------|-------|
| Completed full flow | ≥ 5 users | _TBD_ | _Y/N_ |
| P0 bugs reported | 0 | _TBD_ | _Y/N_ |
| P1 bugs reported | ≤ 2 | _TBD_ | _Y/N_ |
| No regression on ALE-90.3, ALE-90.4, ALE-148, ALE-149, ALE-150 | All hold | _TBD_ | _Y/N_ |
| CJK retry rate (ALE-152) | < 1/3 | _TBD_ | _Y/N_ |

### Verdict

- **GO** nếu ≥ 4/5 criteria pass.
- **NO-GO** nếu bất kỳ criterion fail → list blockers, fix, then re-evaluate.

---

## 9. Next Sprint Recommendation

_Chọn tối đa 5 issues ưu tiên cho sprint tiếp theo (sau cohort 2)._

| # | Linear key | Title | Priority | Why |
|---|-----------|-------|----------|-----|
| 1 | _TBD_ | _TBD_ | _P0_ | _Evidence từ >=2 users_ |
| 2 | _TBD_ | _TBD_ | _P1_ | _…_ |
| 3 | _TBD_ | _TBD_ | _P1_ | _…_ |
| 4 | _TBD_ | _TBD_ | _P2_ | _…_ |
| 5 | _TBD_ | _TBD_ | _P2_ | _…_ |

---

## Appendix: Phân biệt feedback thật vs suy luận

### Phần này là feedback thật từ user (verbatim từ response):
- Mọi quote trong bảng "Evidence" (section 5, 6, 7)
- Scores cụ thể (4, 4.5, 3, v.v.)
- Bug reports cụ thể (error message, route, timestamp)
- Pricing quotes verbatim

### Phần này là suy luận của analyst:
- Priority classification (P0/P1/P2/P3)
- Pattern matching với round-1
- "Decision: Cohort 3 GO/NO-GO"
- "Next sprint recommendation"
- "Update watch items" interpretation
