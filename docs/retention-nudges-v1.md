# Retention Nudges v1 — Vietnamese Eden MVP

**Cập nhật:** 2026-06-06 (ALE-182)
**Issue:** [ALE-182](https://linear.app/alexgpt/issue/ALE-182/m12-retention-nudges-v1)
**Milestone:** M12 — Beta Launch & Activation
**Loại:** Planning-first, docs-only. Không có code app, không migration, không automation.

---

## 1. Mục đích & Phạm vi

**Mục đích:** Giữ beta testers quay lại app sau lần đầu sử dụng, giảm drop-off giữa signup → first value, và tái kích hoạt testers đã inactive 7+ ngày.

**Phạm vi ALE-182 (v1):**
- Document retention nudge strategy
- Đề xuất 1 lightweight in-app nudge ("Tiếp tục từ lần trước")
- Template follow-up cho inactive testers (7 ngày không activity)
- **Không** gửi automated email/Telegram/Zalo
- **Không** tạo scheduled job/cron
- **Không** thay đổi schema/migration
- **Không** code app trong scope này (nudge proposal là design doc, implementation cầu ALE khác)

---

## 2. Vấn đề Retention

### 2.1 Dữ liệu hiện tại

Qua M8–M12, các pattern rõ ràng từ Cohort 1 + Cohort 2:

| Pattern | Chi tiết | Nguồn |
|---------|----------|-------|
| Drop-off cao sau signup | Nhiều testers tạo account nhưng không chạy core flow (board → content → breakdown) | analytics_events: signup date >> breakdown_run date |
| Confusion Paste text vs URL | Testers thêm URL-only content, thấy AI không phân tích, bỏ cuộc | ALE-158, ALE-159, feedback Cohort 1 |
| AI latency gây thoát | Breakdown 30–90s, Remix 30–120s — testers refresh hoặc thoát | known-limitations.md §AI |
| Solo use, không có return trigger | Không có email reminder, không có in-app nudge, không có re-engagement mechanism | — |

### 2.2 Funnel hiện tại

```
Signup ████████████████ 100%
Login   ███████████████░  ~90%
Board   ██████████████░░  ~80%
Content ████████████░░░░  ~65%
Break   ██████████░░░░░░  ~50%
Remix   ███████░░░░░░░░░  ~30%
Calendar ████░░░░░░░░░░░░  ~15%
```

**Target (M12):** Board ≥60%, Remix ≥30%, Calendar ≥20% (from M12 planning brief).

### 2.3 Khoảng cách Retention

| Khoảng cách | Mô tả | Ảnh hưởng |
|-------------|-------|-----------|
| **Signup → Board** | Tester đăng nhập, thấy dashboard trống, không biết下一步 | Nhiều testers không tạo board đầu tiên |
| **Board → Breakdown** | Tester có content nhưng không bấm phân tích (AI chậm, UX không rõ) | Drop-off lớn nhất trong funnel |
| **Day 3+ inactivity** | Tester dùng 1–2 lần rồi không quay lại | Risk mất toàn bộ cohort |
| **Day 7+ inactivity** | Tester quên app hoàn toàn | Cần re-engagement thủ công |

---

## 3. Phân khúc Người dùng

| Segment | Định nghĩa | Hành vi | Nudge phù hợp |
|---------|-------------|---------|----------------|
| **New tester** | Vừa signup, chưa tạo board | Cần activation, không retention | First-run guidance (ALE-180 đã ship) |
| **Active tester** | Đã chạy core flow (≥1 breakdown hoặc remix) trong 7 ngày qua | Đang dùng app, không cần nudge | Streak reinforcement (M13+) |
| **At-risk tester** | Signup rồi nhưng <3 actions trong 7 ngày | Có dấu hiệu bỏ cuộc | In-app nudge + manual follow-up |
| **Inactive tester** | Không activity trong 7+ ngày | Đã rời app | Manual follow-up template |
| **Power tester** | ≥5 breakdown + ≥3 remix + ≥1 calendar item trong 14 ngày | Core user, cần retain | Thank-you + feature preview (M13+) |

---

## 4. Quy tắc Kích hoạt (Trigger Rules)

### 4.1 In-app nudge triggers

| Nudge | Trigger | Segment | Giới hạn |
|-------|---------|---------|----------|
| "Tiếp tục từ lần trước" | Tester quay lại app sau 1+ ngày, có ≥1 board chưa hoàn thành | At-risk + Active (returning) | Hiện 1 lần mỗi session, không hiện nếu tester đã active trong 3 ngày liên tiếp |
| Empty state hint (ALE-180) | Dashboard trống, board trống, breakdown trống | New tester | Đã implementship |
| "Thử nội dung mẫu" (ALE-180) | Board trống, breakdown trống | New tester | Đã ship |

### 4.2 Manual follow-up triggers

| Trigger | Hành động | Segment | Kênh |
|---------|-----------|---------|------|
| Invite >48h, chưa Account | Gửi follow-up message | Invited but not signed up | Telegram/Zalo (thủ công) |
| Account >48h, chưa Breakdown | Nhắn reminder + tip | New tester stuck | Telegram/Zalo (thủ công) |
| 7 ngày không activity (không analytics_event) | Gửi re-engagement message | Inactive tester | Telegram/Zalo/email (thủ công) |
| Completed core flow | Gửi cảm ơn + form feedback | Active tester → completed | Telegram/Zalo (thủ công) |

**Quan trọng:** Tất cả follow-up là **thủ công**. Owner tự gửi dựa trên template. Không automation, không cron job, không scheduled email.

Triggers §4.2 được tham chiếu và mở rộng từ [beta-support-checklist.md §Follow-up Triggers](./beta-support-checklist.md).

---

## 5. Đề xuất In-app Nudge: "Tiếp tục từ lần trước"

### 5.1 Mô tả

 Khi tester quay lại app sau 1+ ngày không sử dụng, hiển thị section **"Tiếp tục từ lần trước"** trên dashboard. Section này hiển thị board gần nhất có activity chưa hoàn thành (ví dụ: board có content nhưng chưa breakdown, hoặc có breakdown nhưng chưa remix).

### 5.2 UX spec

```
┌─────────────────────────────────────────────┐
│  Tiếp tục từ lần trước                      │
│                                              │
│  📋 "Hook skincare viral test"              │
│  Board đã có 3 nội dung · Chưa phân tích AI │
│  [Mở board →]                               │
│                                              │
│  📋 "Content Facebook tuần này"             │
│  Đã phân tích · Chưa tạo remix              │
│  [Tạo remix →]                              │
└─────────────────────────────────────────────┘
```

### 5.3 Data source

Sử dụng data từ các bảng đã tồn tại:
- `workspaces` → `boards` → `content_items` — lấy board gần nhất có activity
- `analytics_events` — kiểm tra last activity timestamp (event types: `board_created`, `content_added`, `breakdown_run`, `remix_created`, `calendar_added`)

**Không cần table mới.** Query logic:
1. Lấy `user_id` từ session
2. Lấy boards của user, sort by `updated_at DESC`
3. Với mỗi board, kiểm tra trong funnel: có content chưa breakdown? có breakdown chưa remix? có remix chưa calendar?
4. Hiển thị top 2–3 boards với CTA phù hợp

### 5.4 Vietnamese copy variants

| Vị trí | Copy | Variant |
|--------|------|---------|
| Section title | "Tiếp tục từ lần trước" | Primary |
| | "Tiếp tục nào" | Ngắn gọn |
| | "Bạn đã quay lại!" | Thân thiện |
| Board CTA — chưa breakdown | "Chưa phân tích AI" | Default |
| | "Phân tích ngay" | Action |
| Board CTA — chưa remix | "Chưa tạo remix" | Default |
| | "Tạo remix →" | Action |
| Board CTA — chưa calendar | "Chưa lên lịch" | Default |
| | "Thêm vào lịch →" | Action |
| Empty state (no boards) | "Bắt đầu bằng cách tạo board đầu tiên" | — |
| Board subtitle — có N nội dung | "{N} nội dung" | — |

### 5.5 Implementation notes (cho ALE tương lai)

- Component: `ContinueWhereYouLeftOff` — server component hoặc client component with `useEffect`
- Placement: Dashboard page, trên cùng (trước Onboarding Checklist khi tester chưa hoàn thành core flow, sau khi đã xong)
- Thứ tự ưu tiên Hiển thị: boards có CTA quan trọng nhất trước (breakdown > remix > calendar)
- Cache: Client-side state (zustand) — không cần server cache cho beta population
- A/B: v1 chỉ 1 variant (primary), A/B test cho M13+
- Accessibility: Thiết kế đáp ứng, contrast ≥ 4.5:1, keyboard navigable

**Scope ALE-182:** Chỉ đề xuất. Không code. Implementation vào ALE khác sau khi owner review.

---

## 6. Follow-up Templates cho Inactive Testers (7 ngày không hoạt động)

### 6.1 Template: Re-engagement sau 7 ngày không hoạt động

**Kênh:** Telegram / Zalo / Email (thủ công, owner gửi)

```
Chào [Tên] 👋

Bạn đã dùng Vietnamese Eden cách đây 7 ngày. Mình muốn check nhanh — có bước nào khó hoặc chậm không?

💡 Cách nhanh nhất quay lại:
1. Mở app: https://vietnamese-eden-mvp.vercel.app/dashboard
2. Bấm "Tiếp tục từ lần trước" (board của bạn vẫn còn)
3. Thử **Paste text** nếu chưa phân tích AI — chỉ cần 1–2 phút

Nếu bạn có 5 phút, mình rất muốn nghe ý kiến của bạn:
https://docs.google.com/forms/d/1JkPFQji46AIJISC4oKNY92QgovarNzafUgqVzQ1hMe4/

Không có thời gian? Reply "bỏ qua" và mình không nhắn lại.
Cảm ơn bạn 🙏
```

### 6.2 Template: Re-engagement sau 14 ngày (escalation nhẹ)

```
Chào [Tên],

Mình nhắn lại vì Vietnamese Eden vừa có update — AI phân tích nhanh hơn và remix ổn hơn.

Nếu bạn muốn thử lại, chỉ cần mở app và chọn board cũ của bạn:
https://vietnamese-eden-mvp.vercel.app/dashboard

Hoặc tạo board mới với **Paste text** — copy 1 caption TikTok/Facebook vào, AI sẽ phân tích hook + CTA.

Gặp lỗi gì thì chụp màn hình gửi mình nhé.

Nếu không còn hứng thú, reply "dừng" và mình xóa bạn khỏi danh sách.

Cảm ơn,
[Tên team]
```

### 6.3 Template: Re-engagement sau hoàn thành core flow (kích hoạt loop)

```
Chào [Tên] 🎉

Bạn đã phân tích + remix content trên Vietnamese Eden — nicely done!

Bước tiếp theo để tận dụng tối đa:
• **Thêm vào lịch** — lên lịch đăng thủ công theo lịch bạn đã tạo
• **Tạo Voice Profile** — dán 2–3 caption cũ, AI sẽ remix theo giọng của bạn
• **Thử board mới** — lưu thêm content inspiration

Moï link: https://vietnamese-eden-mvp.vercel.app/dashboard

Có gì muốn cải thiện? Chụp màn hình hoặc nhắn mình 🙏
```

### 6.4 Template: Thank-you sau feedback

```
Chào [Tên], cảm ơn bạn đã gửi feedback! 🙌

Mình đang ghi nhận:
• [Tóm tắt 1–2 điểm chính từ feedback của họ]

Mình sẽ update khi có thay đổi liên quan. Nếu bạn muốn tiếp tục dùng app:
https://vietnamese-eden-mvp.vercel.app/dashboard

Cảm ơn lần nữa,
[Tên team]
```

---

## 7. KHÔNG Tự động hóa

| # | Rule | Lí do |
|---|------|--------|
| 1 | **Không gửi automated email** | Chưa có email infrastructure, chưa có consent |
| 2 | **Không gửi automated Telegram/Zalo** | Chưa có bot infrastructure, spam risk cao |
| 3 | **Không scheduled job / cron** | v1 là manual, không cần server-side scheduling |
| 4 | **Không tạo nudge tracking table mới** | Sử dụng `analytics_events` + `boards` để xác định activity |
| 5 | **Không thay đổi migration/schema** | v1 zero migration |
| 6 | **Owner review mọi follow-up trước khi gửi** | Guardrail cho closed beta |
| 7 | **Không A/B test trong v1** | Population quá nhỏ |
| 8 | **In-app nudge chỉ hiện khi tester tự quay lại** | Không push notification, không email trigger |

---

## 8. Kế hoạch Đo lường

### 8.1 Metrics theo dõi

| Metric | Nguồn | Baseline (pre-nudge) | Target (post-nudge, 14 ngày) |
|--------|-------|----------------------|-------------------------------|
| Day-1 return rate | `analytics_events` (login event, day+1) | Unknown | +5–10% |
| Day-7 return rate | `analytics_events` (login event, day+7) | Unknown | +3–5% |
| Core flow completion (signup → calendar) | `analytics_events` funnel | ~15% (estimated) | +5% |
| "Continue" CTA click rate | `analytics_events` (nueva event type nếu implement) | N/A | N/A (v1, docs-only) |
| Follow-up response rate | Manual tracking in [beta-support-checklist.md](./beta-support-checklist.md) | Unknown | ≥30% |

### 8.2 Phương pháp đo

1. **Pre-nudge baseline:** Chạy SQL query trong Supabase để xác định Day-1, Day-7 return rate hiện tại (trước khi nudge implement)
2. **Post-nudge comparison:** Sau khi in-app nudge ship (ALE tương lai), so sánh return rate 14 ngày
3. **Follow-up tracking:** Ghi response rate vào [beta-support-checklist.md](./beta-support-checklist.md) Notes column khi gửi follow-up thủ công
4. **Weekly report:** Báo cáo trong [weekly-beta-report-template.md](./weekly-beta-report-template.md) §Activation Metrics

### 8.3 Supabase SQL — Baseline queries

```sql
-- Day-1 return rate (users who logged in 1 day after signup)
WITH first_login AS (
  SELECT user_id, MIN(created_at) AS first_at
  FROM analytics_events
  WHERE event_type = 'login'
  GROUP BY user_id
),
day1_return AS (
  SELECT COUNT(DISTINCT fl.user_id) AS returned
  FROM first_login fl
  JOIN analytics_events ae
    ON ae.user_id = fl.user_id
    AND ae.event_type = 'login'
    AND ae.created_at BETWEEN fl.first_at + INTERVAL '1 day'
                           AND fl.first_at + INTERVAL '2 days'
)
SELECT
  (SELECT COUNT(*) FROM first_login) AS total_users,
  (SELECT returned FROM day1_return) AS day1_returned,
  ROUND((SELECT returned FROM day1_return)::numeric /
        (SELECT COUNT(*) FROM first_login) * 100, 1) AS day1_return_pct;

-- Day-7 return rate
WITH first_login AS (
  SELECT user_id, MIN(created_at) AS first_at
  FROM analytics_events
  WHERE event_type = 'login'
  GROUP BY user_id
),
day7_return AS (
  SELECT COUNT(DISTINCT fl.user_id) AS returned
  FROM first_login fl
  JOIN analytics_events ae
    ON ae.user_id = fl.user_id
    AND ae.event_type = 'login'
    AND ae.created_at BETWEEN fl.first_at + INTERVAL '6 days'
                           AND fl.first_at + INTERVAL '8 days'
)
SELECT
  (SELECT COUNT(*) FROM first_login) AS total_users,
  (SELECT returned FROM day7_return) AS day7_returned,
  ROUND((SELECT returned FROM day7_return)::numeric /
        (SELECT COUNT(*) FROM first_login) * 100, 1) AS day7_return_pct;

-- Inactive 7+ days (candidates for manual follow-up)
SELECT bt.name, bt.email, bt.persona, bt.core_flow_status,
       MAX(ae.created_at) AS last_activity
FROM beta_testers bt
LEFT JOIN analytics_events ae ON ae.user_id = bt.user_id
WHERE bt.invite_status IN ('invited', 'accepted')
GROUP BY bt.id, bt.name, bt.email, bt.persona, bt.core_flow_status
HAVING MAX(ae.created_at) < NOW() - INTERVAL '7 days'
   OR MAX(ae.created_at) IS NULL
ORDER BY last_activity ASC NULLS FIRST;
```

---

## 9. Guardrails

| # | Guardrail | Chi tiết |
|---|-----------|----------|
| 1 | **Docs-only** | ALE-182 chỉ tạo tài liệu. Không code app, không migration, không automation. |
| 2 | **Owner review trước implement** | In-app nudge proposal cần owner confirm trước khi tạo ALE implement. |
| 3 | **Privacy** | Templates sử dụng `[Tên]` placeholder. Không lưu PII trong docs. Follow-up tracking chỉ ghi tester-XX. |
| 4 | **Vietnamese copy** | Tất cả in-app và follow-up copy bằng tiếng Việt. English chỉ trong data queries và docs nội bộ. |
| 5 | **Baseline trước đã** | Chạy baseline SQL queries trước khi ship nudge. Không đo thì không cải thiện được. |
| 6 | **Không spam** | Maximum 1 follow-up mỗi 7 ngày cho mỗi tester. Không gửi lại nếu chưa reply. |
| 7 | **Opt-out rõ ràng** | Mỗi template phải có 1 câu opt-out ("reply 'bỏ qua'" hoặc "reply 'dừng'"). |

---

## 10. Ghi chú Triển khai Tương lai

| Item | Giới thiệu | Phạm vi | Dependency |
|------|-------------|---------|------------|
| In-app "Continue" component | M13+ | Dashboard section, `ContinueWhereYouLeftOff` component | ALE mới (owner review design trước) |
| `analytics_events` nudge tracking | M13+ | Event type mới: `nudge_shown`, `nudge_clicked` | Cùng ALE implement component |
| Email follow-up automation | M14+ | Transactional email (Resend/SendGrid) | Owner consent, email infrastructure |
| Telegram/Zalo bot follow-up | M14+ | Bot API, opt-in consent | Owner consent, bot infrastructure |
| A/B test nudge variants | M14+ | Copy test, placement test | Sufficient population (≥50 testers) |
| Weekly digest email | M15+ | Summary email với top insights | Email infrastructure, ≥30 active testers |
| Push notification (browser) | M16+ | `Notification API`, service worker | Owner review, consent UX |

---

## 11. Tài liệu Liên quan

| Doc | Dùng khi |
|-----|----------|
| [beta-tester-onboarding-guide.md](./beta-tester-onboarding-guide.md) | Gửi cho tester mới — guide + invite + FAQ |
| [beta-support-checklist.md](./beta-support-checklist.md) | Checklist onboarding từng tester + follow-up triggers |
| [beta-invite-message.md](./beta-invite-message.md) | Mẫu tin nhắn invite/follow-up/cảm ơn |
| [weekly-beta-report-template.md](./weekly-beta-report-template.md) | Báo cáo tuần — activation metrics + retention |
| [m12-planning-brief.md](./m12-planning-brief.md) | M12 full planning brief |
| [project-status.md](./project-status.md) | Source of truth dự án |
| [known-limitations.md](./known-limitations.md) | Giới hạn beta |

---

*Document version: 1.0 — ALE-182 — Created 2026-06-06*
*Milestone: M12 — Beta Launch & Activation*
*Issue: [ALE-182](https://linear.app/alexgpt/issue/ALE-182/m12-retention-nudges-v1)*