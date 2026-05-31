# Feedback triage — Vietnamese Eden MVP beta

**Mục đích:** Chuyển feedback cohort 1 thành hành động rõ (fix / backlog / trả lời user).  
**Sau cohort:** issue **ALE-90** — Triage beta feedback round 1.

Liên quan: [beta-feedback-plan.md](./beta-feedback-plan.md) · [manual-feedback-intake.md](./manual-feedback-intake.md) · Linear team Alexgpt

Feedback source of truth:

[https://docs.google.com/spreadsheets/d/15dJSsUpHUTsm96NNb2GIltsx1MnNuNlsWD04EP5jjx4/](https://docs.google.com/spreadsheets/d/15dJSsUpHUTsm96NNb2GIltsx1MnNuNlsWD04EP5jjx4/)

---

## 1. Quy trình triage (15 phút / feedback)

1. **Ghi nhận** — copy nguyên văn user + screenshot + URL + thời gian.
2. **Tái hiện** — owner hoặc agent thử 1 lần trên production.
3. **Phân loại** — 1 primary label (bảng §2).
4. **Mức ưu tiên** — P0 / P1 / P2 / no-code (reply only).
5. **Linear** — tạo issue nếu P0/P1/P2 cần code; link feedback gốc.
6. **Trả lời user** — trong 24h (P0: 4h).

---

## 2. Phân loại


| Category              | Định nghĩa                                                  | Ví dụ                                      | Hành động mặc định                     |
| --------------------- | ----------------------------------------------------------- | ------------------------------------------ | -------------------------------------- |
| **P0 blocker**        | Không dùng được core flow; mất data; auth hỏng hàng loạt    | Không tạo workspace; breakdown fail 100%   | Hotfix + thông báo cohort              |
| **P1 bug lớn**        | Flow chính fail thường xuyên hoặc 1 segment không dùng được | Remix fail > 50%; calendar không lưu       | Linear sprint hiện tại                 |
| **P2 polish**         | UI/copy/perf nhỏ, có workaround                             | Scroll ngang nhẹ mobile; typo              | Backlog                                |
| **UX confusion**      | User không hiểu bước tiếp theo; không phải bug kỹ thuật     | “Không thấy nút remix”                     | Cải thiện copy/onboarding; doc         |
| **Feature request**   | Yêu cầu capability mới                                      | Auto-post TikTok; scrape caption từ link   | Backlog; không cam kết beta            |
| **Pricing objection** | Phản ứng giá / willingness to pay                           | “Chưa đáng 200k/tháng”                     | Ghi insights; không fix code           |
| **AI quality issue**  | Output sai, máy, không đúng giọng                           | Hook lệch; remix không tiếng Việt tự nhiên | Tag `ai-quality`; tune prompt/provider |


**Quy tắc gộp:**

- Bug + confusion → ưu tiên **P0/P1** nếu tái hiện được.  
- AI quality + feature (“AI phải post hộ”) → tách **AI quality** vs **Feature request**.  
- Nhiều user cùng confusion → nâng lên **P1 UX** (onboarding).

---

## 3. Priority matrix


|                   | Impact cao | Impact thấp     |
| ----------------- | ---------- | --------------- |
| **Tần suất cao**  | P0 / P1    | P1 / P2         |
| **Tần suất thấp** | P1         | P2 / reply only |


---

## 4. Template Linear issue từ feedback

Copy vào Linear (team **Alexgpt**). Thay `[...]`.

```markdown
## Summary
[1 câu: user không làm được gì]

## Category
[ ] P0 blocker  [ ] P1 bug  [ ] P2 polish  [ ] UX confusion
[ ] Feature request  [ ] Pricing  [ ] AI quality

## Reporter
- Beta cohort 1
- Contact: [email/Telegram — không paste password]
- Tested at: [datetime VN]

## Steps to reproduce
1. URL: https://vietnamese-eden-mvp.vercel.app/...
2. Account: [email user đồng ý chia sẻ]
3. ...

## Expected
[Theo beta-onboarding]

## Actual
[Message UI / screenshot]

## Environment
- Browser: [Chrome mobile / desktop]
- Device: [375px / desktop]

## Feedback verbatim
> [quote user]

## Triage notes
- Reproduced: Yes / No / Partial
- Related: ALE-___
- Suggested fix scope: [1 dòng]
```

**Title convention:**

- `P0:` / `P1:` / `P2:` prefix cho bug  
- `UX:` confusion  
- `AI:` quality  
- `FR:` feature request

**Labels gợi ý:** `beta-feedback`, `cohort-1`, `ai-quality`, `ux`, `mobile`

---

## 5. Phản hồi mẫu cho user

**P0/P1 đã ghi nhận:**

```
Cảm ơn bạn đã báo. Team đã tạo ticket và ưu tiên xử lý.
Mình sẽ nhắn lại khi fix lên production (dự kiến [khung thời gian]).
```

**UX confusion:**

```
Cảm ơn — đúng là bước này chưa rõ. Bạn thử: [1–2 câu hướng dẫn + link onboarding §X].
Mình sẽ cải thiện copy trên app ở bản sau.
```

**Feature request:**

```
Ý tưởng hay — mình ghi nhận cho roadmap.
Bản beta hiện chưa có [feature]; bạn có thể workaround bằng […].
```

**AI quality:**

```
Cảm ơn feedback chất lượng AI. Bạn có thể gửi thêm 1 ví dụ input/output để team chỉnh prompt?
Remix 5 biến thể thường ổn định hơn 10 biến thể về tốc độ và chất lượng.
```

---

## 6. Báo cáo cuối cohort 1 (ALE-90)


| Metric                   | Số  |
| ------------------------ | --- |
| Invited                  |     |
| Signed up                |     |
| Completed mandatory flow |     |
| P0 open / closed         |     |
| Top 3 UX confusion       |     |
| Top 3 AI quality themes  |     |
| Go / no-go expand beta   |     |


Điền sau khi đóng form feedback — paste vào `docs/production-smoke-test.md` hoặc comment Linear ALE-90.