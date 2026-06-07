# Claude Code prompt — Smoke test E2E publish pipeline

> **Copy the prompt in the block below and paste into Claude Code.**
> **Mandatory context: đọc các file được liệt kê trong READ FIRST trước khi làm bất cứ điều gì.**
> **Production URL: https://vietnamese-eden-mvp.vercel.app**

---

## Prompt (copy from here)

```
Bạn là QA engineer đang smoke test E2E publish pipeline của Vietnamese Eden MVP.

READ FIRST (bắt buộc trước khi làm bất cứ điều gì):
- src/lib/inngest/functions/analyze-content.ts
- src/lib/inngest/functions/publish-calendar-shared.ts
- src/lib/calendar/actions.ts
- src/components/custom/calendar/add-to-calendar-dialog.tsx
- src/components/custom/breakdown/breakdown-view.tsx
- supabase/migrations/ (xem các migration gần nhất)

GOAL
Viết và chạy smoke test script để verify toàn bộ pipeline:
  Paste URL → Transcript/Metadata → AI Breakdown → Add to Calendar → Publish Now

KHÔNG làm:
- Không thay đổi production code
- Không push code mới
- Không tạo Linear issues mới
- Không thay đổi DB schema

STACK
- Next.js 14 App Router, TypeScript
- Supabase project ref: romaiooigximznlrpsze
- Inngest production env (event key từ INNGEST_EVENT_KEY trong .env.local)
- Demo user: ggonevn@gmail.com
- Demo workspace ID: d694d44d-f4a5-4493-b585-ff2424a9ac5b
- Demo user ID: b19f7163-15bc-49b1-b469-f0a244563393
- Production URL: https://vietnamese-eden-mvp.vercel.app

SMOKE TEST STEPS

### Step 1 — Tạo content item với YouTube URL
Dùng Supabase service role key (SUPABASE_SERVICE_ROLE_KEY từ .env.local) để:
- INSERT vào content_items: platform=youtube, source_url=https://www.youtube.com/watch?v=dQw4w9WgXcQ, workspace_id=d694d44d-f4a5-4493-b585-ff2424a9ac5b, saved_by=b19f7163-15bc-49b1-b469-f0a244563393
- Verify row tồn tại

### Step 2 — Trigger AI Breakdown
- Gửi Inngest event: POST https://inn.gs/e/<INNGEST_EVENT_KEY>
- Event name: content/analysis-requested
- Data: { contentItemId: <id từ step 1>, workspaceId: "d694d44d-f4a5-4493-b585-ff2424a9ac5b", userId: "b19f7163-15bc-49b1-b469-f0a244563393" }
- Poll content_analyses table mỗi 10s, tối đa 120s
- PASS: status = "completed" AND summary JSON có emotional_triggers[] và viral_signals[]
- FAIL: status = "failed" hoặc timeout

### Step 3 — Verify breakdown fields
Query content_analyses WHERE content_item_id = <id>:
- PASS: hook, angle, cta, emotion, targetAudience, whyItWorks đều có giá trị
- PASS: summary JSON có emotional_triggers (array, ít nhất 1 item) và viral_signals (array, ít nhất 1 item)
- FAIL: bất kỳ field nào null/empty

### Step 4 — Tạo calendar item (Add to Calendar)
- INSERT vào content_calendar_items: content_item_id=<id>, workspace_id=d694d44d, platform=facebook, title="Smoke test", scheduled_at=now(), publish_status=scheduled, notes='{"channel":"facebook"}'
- Verify row tồn tại với đúng platform

### Step 5 — Verify Inngest calendar/scheduled event
- Check xem schedulePublishEvent có được gọi không bằng cách query content_calendar_items.publish_status
- Sau 30s: PASS nếu publish_status = "published" hoặc "failed" (nghĩa là Inngest đã xử lý)
- Nếu vẫn "scheduled" sau 60s: WARN — Inngest chưa trigger publish

### Step 6 — Verify generated_outputs
Query generated_outputs WHERE source_content_item_id = <id>:
- Nếu có rows: PASS — remix đã chạy
- Nếu không có: INFO — remix chưa chạy (manual step, không phải lỗi)

### Step 7 — Verify Storage upload (optional)
- Upload 1 file ảnh nhỏ (1x1 PNG) lên Supabase Storage bucket calendar-media
- Verify public URL accessible
- PASS: HTTP 200 khi GET public URL
- FAIL: 403/404

HARD CONSTRAINTS
1. Dùng fetch() hoặc axios trực tiếp, không dùng Inngest SDK để gửi event
2. Inngest event endpoint: https://inn.gs/e/<key> (KHÔNG phải /api/inngest)
3. Tất cả Supabase calls dùng service_role key (bypass RLS)
4. Script phải idempotent — chạy nhiều lần không tạo data trùng lặp (dùng upsert hoặc cleanup sau mỗi run)
5. Output kết quả rõ ràng: ✅ PASS / ❌ FAIL / ⚠️ WARN cho mỗi step

OUTPUT FORMAT
- Lưu script vào scripts/smoke-test-pipeline.ts
- Chạy với: npx tsx scripts/smoke-test-pipeline.ts
- In ra report dạng:
  Step 1 — Create content item: ✅ PASS (id: <uuid>)
  Step 2 — AI Breakdown: ✅ PASS (completed at <timestamp>)
  Step 3 — Breakdown fields: ✅ PASS (emotional_triggers: 4, viral_signals: 3)
  Step 4 — Calendar item: ✅ PASS
  Step 5 — Publish trigger: ⚠️ WARN (status still scheduled after 60s)
  Step 6 — Generated outputs: ℹ️ INFO (0 outputs — manual remix step)
  Step 7 — Storage upload: ✅ PASS
  
  OVERALL: 6/7 PASS, 1 WARN, 0 FAIL

DONE WHEN
- Script chạy không có lỗi runtime (exit 0)
- Steps 1, 2, 3, 4 đều PASS
- Report được print ra terminal
- Nếu Step 5 WARN: ghi chú rõ "Inngest publish trigger cần debug riêng"
```

---

## Notes cho người chạy

1. Cần có `.env.local` với SUPABASE_SERVICE_ROLE_KEY và INNGEST_EVENT_KEY
2. Chạy từ root của project: `npx tsx scripts/smoke-test-pipeline.ts`
3. Nếu Step 2 fail (AI Breakdown timeout): kiểm tra Inngest Dashboard → Runs tab xem error
4. Nếu Step 5 warn: kiểm tra `src/lib/calendar/schedule-publish.ts` xem schedulePublishEvent có được gọi không
5. Cleanup: script sẽ tạo test data trong DB — có thể xóa thủ công sau khi smoke xong
