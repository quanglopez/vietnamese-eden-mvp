# Cursor Prompt — ALE-144: Improve Remix Diversity and Vietnamese Naturalness

## Issue
**Linear:** [ALE-144](https://linear.app/alexgpt/issue/ALE-144/ale-90d-improve-remix-diversity-and-vietnamese-naturalness)  
**Priority:** P2  
**Beta Evidence:** 3/5 users report Remix variants: repetition (na ná), generic structure, machine-translation tone. Remix là core value feature, cần polish trước khi mở rộng beta.

---

## Problem Statement

Hiện tại `REMIX_SYSTEM_PROMPT` trong `src/lib/ai/prompts/remix.ts` có hướng dẫn:
- "Mỗi biến thể phải khác nhau rõ rệt (góc mở, CTA, cấu trúc)" — nhưng chưa cụ thể enough
- "Viết hoàn toàn bằng tiếng Việt tự nhiên" — nhưng AI vẫn output tone dịch máy/sáo rỗng
- Chưa có format-specific guidance (TikTok script vs Facebook post vs LinkedIn)
- Các variant đôi khi lặp lại cùng hook hoặc cấu trúc

**Goal:** Rewrite prompt để AI tạo variants thực sự khác biệt, tự nhiên hơn, và phù hợp format.

---

## Current Code Audit

### `src/lib/ai/prompts/remix.ts`
- `remixVariantsSchema` — zod schema với `variants: array({ title, content })`
- `REMIX_SYSTEM_PROMPT` — system prompt hiện tại (see file)
- `buildRemixUserPrompt` — builds user prompt với breakdown + voice profile + raw content
- `REMIX_JSON_REPAIR_USER_SUFFIX` — suffix cho retry khi JSON lỗi

### `src/lib/ai/json.ts` (ALE-87 hardened)
- `stripMarkdownCodeFences` — strip ```json blocks
- `removeSimpleTrailingCommas` — fix trailing commas
- `extractBalancedJsonSlice` — extract balanced JSON with string-aware parsing
- `parseAiJsonText` / `parseAiJsonOrThrow` — parse + validate
- **CRITICAL:** Parser này rất robust, đã handle nhiều edge case. **Không được sửa.**

### `src/lib/ai/providers/openai-compatible.ts`
- `OpenAiCompatibleRemixGeneratorProvider.generateVariants` — gọi `chatJsonCompletion` với `REMIX_SYSTEM_PROMPT` + user prompt
- Retry logic: nếu `invalid_response`, thử lại với `REMIX_JSON_REPAIR_USER_SUFFIX` + temperature 0.5
- Temperature: 0.7 (normal), 0.5 (repair)
- Validate: `remixVariantsSchema.safeParse`, check `variants.length >= variantCount`

### `src/lib/ai/providers/xiaomi.ts` + `openai.ts`
- Xiaomi và OpenAI đều dùng `OpenAiCompatibleRemixGeneratorProvider`
- Chỉ khác `ChatCompletionConfig` (API key, baseUrl, model)
- **Không sửa provider logic** — chỉ sửa prompt

---

## Files to Modify

### Primary (sửa prompt):
- `src/lib/ai/prompts/remix.ts` — rewrite `REMIX_SYSTEM_PROMPT` + enhance `buildRemixUserPrompt`

### Read-only (không sửa, chỉ reference):
- `src/lib/ai/json.ts` — parser đã harden
- `src/lib/ai/providers/openai-compatible.ts` — provider logic
- `src/lib/content/remix-actions.ts` — action wrapper

---

## Acceptance Criteria

### AC1: Diversity requirements in system prompt
Rewrite `REMIX_SYSTEM_PROMPT` để thêm requirements cụ thể:

**Mỗi biến thể PHẢI khác nhau ở ít nhất 2 trong 4 yếu tố:**
1. **Angle / Góc tiếp cận** — ví dụ: biến thể 1 dùng "storytelling", biến thể 2 dùng "listicle tips", biến thể 3 dùng "controversial opinion", biến thể 4 dùng "before/after"
2. **Opening / Mở bài** — hook khác nhau: question, fact shocking, story opener, quote, direct address
3. **CTA / Kêu gọi hành động** — khác nhau: comment, share, click link, save, tag friend, reply với keyword
4. **Structure / Cấu trúc** — khác nhau: short form (1-2 câu), medium (3-5 câu có xuống dòng), long form (có intro-body-cta rõ)

**Thêm vào prompt:**
```
QUY TẮC DIVERSITY (bắt buộc):
- Mỗi biến thể phải có angle khác nhau rõ rệt. KHÔNG được lặp lại cùng một góc nhìn.
- Mỗi biến thể phải có hook/opening khác nhau. KHÔNG được dùng cùng một câu mở đầu.
- Mỗi biến thể phải có CTA khác nhau. KHÔNG được lặp "comment ngay" ở mọi variant.
- Mỗi biến thể phải có cấu trúc khác nhau: ngắn gọn vs chi tiết vs list vs story.
- Các title phải phản ánh angle riêng, không generic như "Biến thể 1", "Bản 2".
```

### AC2: Vietnamese naturalness
Thêm vào system prompt:

```
QUY TẮC TIẾNG VIỆT TỰ NHIÊN (bắt buộc):
- Viết như người Việt nói chuyện hàng ngày — không sáo rỗng, không dùng từ hoa mỹ quá mức.
- Tránh cụm từ "dịch máy" như: "hãy để tôi nói cho bạn biết", "trong thời đại ngày nay", "điều quan trọng là" ở mọi variant.
- Dùng từ lóng, emoji, dấu chấm than một cách tự nhiên nếu phù hợp tone.
- Nếu format là TikTok script: viết ngắn, nói được, dùng từ đời thường. Tránh văn viết dài dòng.
- Nếu format là Facebook/LinkedIn: giữ xuống dòng dễ đọc, mỗi đoạn 1-2 câu, dùng bullet hoặc number nếu phù hợp.
- Nếu có Voice Profile: bám sát giọng nhưng KHÔNG copy-paste y nguyên từ sample. Học style rồi viết mới.
```

### AC3: Format-specific instructions
Trong `buildRemixUserPrompt`, thêm format-specific block sau `Format: ${formatLabel}`:

```typescript
const formatGuidance: Record<string, string> = {
  tiktok_script: "Format: TikTok script ngắn, nói được, 15-60 giây. Mỗi variant phải khác hook và flow. Tránh văn viết dài.",
  youtube_shorts_script: "Format: YouTube Shorts script, 30-90 giây. Hook mạnh trong 3 giây đầu. CTA rõ ràng ở cuối.",
  facebook_post: "Format: Facebook post, xuống dòng dễ đọc, emoji tự nhiên, không wall-of-text. Hook ở dòng đầu.",
  linkedin_post: "Format: LinkedIn post, professional nhưng không khô khan. Storytelling hoặc insight. Xuống dòng mỗi 1-2 câu.",
  email: "Format: Email, có subject line, greeting ngắn, body scannable, CTA rõ. Professional but warm.",
};
```

Insert into user prompt:
```
formatGuidance[format] ? ["", `📐 ${formatGuidance[format]}`].join("\n") : null,
```

### AC4: No JSON parser changes
- **Không sửa** `src/lib/ai/json.ts`
- **Không sửa** schema `remixVariantsSchema` — giữ `z.object({ variants: z.array(z.object({ title, content })) })`
- **Không sửa** `extractJsonCandidate`, `parseAiJsonText`, `parseAiJsonOrThrow`
- JSON repair suffix giữ nguyên

### AC5: Keep providers intact
- **Không sửa** `src/lib/ai/providers/xiaomi.ts`
- **Không sửa** `src/lib/ai/providers/openai.ts`
- **Không sửa** `src/lib/ai/providers/openai-compatible.ts`
- **Không sửa** `src/lib/ai/providers/mock-remix.ts` (nhưng có thể cập nhật mock data nếu muốn)
- Temperature logic giữ nguyên: 0.7 (normal), 0.5 (repair)

### AC6: Test 5 and 10 variants
Thêm test plan trong comment hoặc separate test file:

**Manual test checklist (run on production or local):**
1. Create content item with paste text (≥ 50 chars)
2. Run AI Breakdown
3. Open Remix page
4. Test **5 variants**:
   - [ ] All 5 titles are different (not generic)
   - [ ] All 5 have different openings
   - [ ] All 5 have different CTAs
   - [ ] At least 2 different structures visible
   - [ ] Vietnamese sounds natural (no "dịch máy" tone)
5. Test **10 variants**:
   - [ ] Same diversity criteria as above
   - [ ] No repeated hooks across variants
   - [ ] No "comment ngay" or similar CTA in all 10
   - [ ] Format matches selected (TikTok short, FB readable, etc.)
6. Test with Voice Profile:
   - [ ] Variants reflect voice tone but are not copy-paste

**Optional:** Add a simple Node script or curl command to test via API directly if needed.

### AC7: Build & type safety
- `npm run lint` pass
- `npm run type-check` pass
- `npm run build` pass hoặc `NODE_OPTIONS=--max-old-space-size=8192 npm run build` nếu OOM

---

## Constraints

- ❌ **Không sửa** `src/lib/ai/json.ts` (parser đã harden ALE-87)
- ❌ **Không sửa** `remixVariantsSchema` (zod schema)
- ❌ **Không sửa** provider files (`xiaomi.ts`, `openai.ts`, `openai-compatible.ts`, `mock-remix.ts`)
- ❌ **Không sửa** `src/lib/content/remix-actions.ts`
- ❌ **Không đổi** database schema
- ❌ **Không đổi** API endpoints
- ❌ **Không commit** secrets/API keys
- ✅ **Chỉ sửa** `src/lib/ai/prompts/remix.ts` (system prompt + user prompt builder)
- ✅ **Có thể thêm** format guidance constants trong cùng file
- ✅ **Có thể thêm** test plan comments

---

## Testing Strategy

### Mock test (fast, no API cost):
```bash
# Run mock provider test
npm run dev
# Navigate to /remix/[contentItemId] with mock data
# Check variant diversity in UI
```

### Production test (real AI):
```bash
# Deploy to Vercel or test locally with real Xiaomi/OpenAI keys
# Create content → Breakdown → Remix with 5 variants
# Copy-paste all 5 variants into a doc
# Check:
# - Are titles different and descriptive?
# - Are openings different?
# - Are CTAs different?
# - Is Vietnamese natural?
# - Does format match (TikTok short vs FB readable)?
```

### Regression test:
```bash
# Ensure JSON parser still works
npm run test:ai-json  # if exists, or manual test with edge cases
```

---

## Expected Output

Provide:
1. Modified `src/lib/ai/prompts/remix.ts` with:
   - New `REMIX_SYSTEM_PROMPT` (diversity + naturalness + format guidance)
   - Enhanced `buildRemixUserPrompt` with format-specific block
   - `formatGuidance` constant
2. Brief summary of prompt changes
3. Test verification steps for 5 and 10 variants
4. Confirmation: no parser changes, no provider changes, no schema changes
