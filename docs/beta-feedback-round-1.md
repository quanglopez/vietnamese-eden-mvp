# ALE-90 — Beta Feedback Round 1 Triage

**Generated:** 2026-05-31  
**Analyst:** AI Beta Feedback Analyst (Hermes Agent)  
**Source:** Google Sheet — Normalized Feedback (5 responses)  
**Scope:** Không sửa code, chỉ phân tích evidence để quyết định sprint tiếp theo.

---

## 1. Dataset Summary

| Metric | Value |
|--------|-------|
| Total responses | 5 |
| Completed flow (Partial) | 1 |
| Not completed (No) | 2 |
| Unknown status | 2 |
| Completion rate (known) | 1/3 = 33% |

### Persona Distribution
- Creator / beta tester theo checklist: 1
- Creator/Freelancer hoặc Agency user tiềm năng: 1
- UX-aware beta reviewer: 1
- AI-assisted UX auditor: 1
- Medical student / digital marketing: 1

---

## 2. Score Summary

| Feature | Average | n |
|---------|---------|---|
| AI Breakdown | 4.25/5 | 2 |
| Remix | 4.00/5 | 2 |
| Voice Profile | 3.25/5 | 2 |
| Calendar | 3.50/5 | 2 |

**Note:** Chỉ 2/5 user có score cụ thể (test.eden.vn và Hoang chau). 3 user còn lại là audit/landing review nên không chấm điểm.

---

## 3. Pricing Signal

- **Lowest:** 99k/tháng
- **Highest:** 799k/tháng
- **Common range (solo/freelancer):** 99k–299k/tháng
- **Common range (agency):** 299k–799k/tháng

### Pricing Quotes (feedback thật)
- **test.eden.vn:** "199k/tháng, đề xuất free trial 7 ngày"
- **Hoang chau:** "Creator/Freelancer 99-199k, Agency 299-499k. Nên có Free vĩnh viễn giới hạn số remix"
- **van khanh:** "99-199k freelancer, 299-499k agency (nếu có auto-post/team)"
- **tung nguyen:** "149-299k solo, 499-799k agency 2-3 người — nhưng cần end-to-end workflow trước"

---

## 4. Top Repeated Problems

| Problem | Count | Severity | Evidence |
|---------|-------|----------|----------|
| Voice Profile: unclear setup guidance (no min length hint, no examples) | 3 | P1 | test.eden.vn: "thiếu hướng dẫn minimum 500 ký tự"; Hoang chau: "không rõ cần bao nhiêu ký tự"; van khanh: "cần ví dụ rõ ràng" |
| AI tasks: missing progress indicator during long operations | 2 | P0 | test.eden.vn: "90 giây không có progress bar"; Hoang chau: "không biết đang chạy hay lỗi" |
| Voice Profile: UX issues (hard to find, unclear value) | 2 | P1 | test.eden.vn: "icon microphone nhỏ, dễ bỏ qua"; tung nguyen: "chưa rõ value proposition" |
| Calendar: confusion about auto-post vs internal scheduling | 2 | P1 | test.eden.vn: "cần giải thích chưa tự động đăng"; tung nguyen: "chưa auto-post nên chưa thấy tiện" |
| Landing: unclear product differentiation from ChatGPT/Claude | 2 | P2 | thi mau: "chưa nói rõ KHÁC GÌ"; tung nguyen: "khác biệt chưa mạnh" |
| Remix: variants too similar to each other or original | 2 | P1 | test.eden.vn: "output lặp cấu trúc"; tung nguyen: "bị na ná nhau" |
| Content add: unclear paste text vs save link | 2 | P1 | Hoang chau: "chưa rõ phân biệt"; thi mau: "không rõ lưu link vs paste" |

**Key insight:** >=2 users gặp cùng vấn đề dễ nhất: AI tasks không có progress indicator + Voice Profile thiếu guidance.

---

## 5. Top Positive Signals

| Signal | Count | Evidence User |
|--------|-------|---------------|
| Board creation + content add: very easy, <30s | 2 | test.eden.vn, Hoang chau |
| Core workflow idea: strong market fit for VN creators | 3 | van khanh, thi mau, tung nguyen |
| AI Breakdown: good hook/angle/CTA analysis | 2 | test.eden.vn, Hoang chau |
| Remix: natural, friendly Vietnamese output | 2 | test.eden.vn, Hoang chau |
| Landing page: clear hero messaging | 2 | van khanh, thi mau |

---

## 6. AI Quality Issues

| Issue | Count | Evidence | Suggested Fix |
|-------|-------|----------|---------------|
| AI Breakdown mislabel emotion ("hưng phấn" vs "tin tưởng") | 1 | test.eden.vn | Improve prompt context for emotion detection in Vietnamese |
| Remix variants too similar to original structure | 2 | test.eden.vn, tung nguyen | Add structural diversity constraint in remix prompt |
| Tone Gần gũi sometimes too rigid/formulaic | 1 | Hoang chau | Tune temperature/prompt for casual Vietnamese tone |
| Tone Chuyên gia too stiff (ChatGPT-like) | 1 | Hoang chau | Add expert persona examples for Vietnamese authority tone |
| AI Breakdown risk of being too theoretical | 1 | van khanh | Add cultural context examples in prompt; test with Vietnamese viral content |
| Remix: variants too similar to each other (na ná) | 1 | tung nguyen | Increase angle diversity in remix generation |

---

## 7. UX Confusion

| Issue | Count | Evidence | Suggested Fix |
|-------|-------|----------|---------------|
| AI tasks: missing progress indicator (90s wait, user refreshes) | 2 | test.eden.vn, Hoang chau | Add progress bar or "Analyzing..." loading state with cancel option |
| Voice Profile: unclear setup guidance | 3 | test.eden.vn, Hoang chau, van khanh | Add inline hint: "Minimum 500 characters", provide 2-3 examples |
| Voice Profile: hard to find in sidebar (small mic icon) | 2 | test.eden.vn, Hoang chau | Move to top section or use label "Voice Coach" instead of icon-only |
| Content add: unclear paste text vs save link | 2 | Hoang chau, thi mau | Add tooltips or helper text |
| Calendar: confusion about auto-post | 2 | test.eden.vn, tung nguyen | Add banner: "Calendar is for scheduling only — manual post" |
| Landing: unclear differentiation from ChatGPT | 2 | thi mau, tung nguyen | Add comparison section: workflow vs standalone AI |
| Auth: Google OAuth shown but not working | 1 | thi mau | Hide button or show "Coming soon" disabled state |
| Pricing page: empty placeholder | 1 | tung nguyen | Add real pricing tiers or hide until ready |

---

## 8. Recommended Linear Issues

### P0 — Blocker
**ALE-90.1: Add AI progress indicator + preserve input on Voice Profile failure**
- Priority: P0
- Category: UX/Bug
- Evidence: 2/2 users who tested Voice Profile bị mất dữ liệu khi refresh. test.eden.vn: "90 giây không có progress bar khiến user tưởng lỗi và refresh làm mất dữ liệu"
- Acceptance criteria:
  - Hiển thị loading state rõ ràng khi AI đang xử lý (>3s)
  - Progress bar hoặc step indicator
  - Input text được preserve nếu API fail/user refresh
  - Error toast rõ ràng khi 500, không silent fail

### P1 — Bug lớn
**ALE-90.2: Fix intermittent 500 on POST /api/voice-profile**
- Priority: P1
- Category: Backend bug
- Evidence: test.eden.vn báo lỗi 500 tại /voice-profile
- Acceptance criteria:
  - Voice Profile API trả về 200 với rate >95%
  - Log error chi tiết trong Supabase/Sentry
  - Retry mechanism cho user nếu fail

**ALE-90.3: Improve Voice Profile onboarding (min length hint + examples)**
- Priority: P1
- Category: UX
- Evidence: 3 users confused: "không rõ cần bao nhiêu ký tự", "thiếu hướng dẫn minimum 500 ký tự"
- Acceptance criteria:
  - Inline text: "Nhập ít nhất 500 ký tự về phong cách viết của bạn"
  - Character count (0/500+)
  - 2-3 sample voice profiles

**ALE-90.4: Clarify Calendar is internal scheduling only**
- Priority: P1
- Category: UX
- Evidence: test.eden.vn + tung nguyen confused về auto-post
- Acceptance criteria:
  - Banner hoặc helper text trong Calendar

### P1 — Feature gap
**ALE-90.5: Add monthly view + drag-and-drop to Calendar**
- Priority: P1
- Category: Feature
- Evidence: test.eden.vn: "Không có monthly calendar view. Không có drag-and-drop"
- Acceptance criteria:
  - Toggle list vs monthly grid
  - Drag-and-drop items between dates

### P1 — AI Quality
**ALE-90.6: Reduce Remix output similarity (diversify variant structure)**
- Priority: P1
- Category: AI Quality
- Evidence: test.eden.vn + tung nguyen: variants too similar
- Acceptance criteria:
  - Remix prompt thêm constraint
  - Test với 5 sample, no 2 variants share same opening 3 sentences

### P2 — Polish
**ALE-90.7: Improve landing page differentiation from ChatGPT**
- Priority: P2
- Category: Marketing/UX
- Evidence: thi mau + tung nguyen
- Acceptance criteria:
  - Thêm section so sánh workflow vs standalone AI
  - Visual workflow diagram

**ALE-90.8: Fix Google OAuth button (hide or disable)**
- Priority: P2
- Category: UX
- Evidence: thi mau: "Google OAuth chưa hoạt động nhưng nút vẫn hiển thị"
- Acceptance criteria:
  - Hide button or disable with "Sắp ra mắt" tooltip

---

## 9. Next Sprint Recommendation

Chọn tối đa 5 việc nên làm trước (Ranked):

### #1 — P0: Progressive loading + input preservation for Voice Profile
**Why:** 2/2 người test Voice Profile bị mất dữ liệu. Blocker trải nghiệm core feature.

### #2 — P1: Fix Voice Profile 500 error + add retry
**Why:** Bug production. User đã report endpoint cụ thể.

### #3 — P1: Voice Profile guided onboarding (min chars + examples)
**Why:** 3/5 users gặp friction. Fix đơn giản, ROI cao.

### #4 — P1: Add AI progress indicators across Breakdown/Remix/Voice
**Why:** Pattern lặp lại >=2 users. User không biết AI đang chạy hay crash.

### #5 — P1: Clarify Calendar purpose + add monthly view
**Why:** 2 users confused về auto-post. Monthly view là feature request dễ implement.

---

## 10. Beta Readiness Conclusion

### Có nên mở rộng beta không?
**⚠️ CẢNH BÁO: Chưa nên mở rộng sang cohort lớn hơn.**

**Evidence:**
- Chỉ 1/5 user hoàn thành partial flow. 2/5 audit-only.
- Voice Profile — bước quan trọng nhất — bị P0 bug (mất dữ liệu) + P1 bug (500 error).
- Core AI được đánh giá tốt (Breakdown 4.25, Remix 4.0) nhưng chỉ 2 user chấm.
- Pricing signals hợp lý (99k-299k solo, 299k-799k agency).

### Cần fix gì trước khi mở rộng?
| # | Fix | Priority |
|---|-----|----------|
| 1 | **Voice Profile: loading state + preserve input** | P0 |
| 2 | **Voice Profile: fix 500 error + retry** | P1 |
| 3 | **Voice Profile: onboarding guidance** | P1 |
| 4 | **AI progress indicators** | P1 |
| 5 | **Calendar: clarify + monthly view** | P1 |

### Khi nào nên mở rộng?
Khi >=3 users hoàn thành full flow (bao gồm Voice Profile) không gặp bug.

---

## Appendix: Tách rõ feedback vs suy luận

### Phần này là feedback thật từ user (ghi từ Google Sheet):
- Mọi quote trong bảng "Evidence"
- Scores cụ thể (4, 4.5, 3, v.v.)
- Bug reports cụ thể (POST 500, mất dữ liệu)
- Pricing quotes verbatim

### Phần này là suy luận của analyst:
- Priority classification (P0/P1/P2)
- Recommended sprint order (#1-#5)
- "Beta readiness conclusion"
- Suggested fixes
- Issue titles và acceptance criteria
