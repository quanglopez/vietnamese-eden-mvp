# Decision Log — Vietnamese Eden MVP

Ghi lại mọi quyết định kỹ thuật/sản phẩm quan trọng.

Format: Date | Decision | Reason | Alternatives | Status

---

## 2026-06-05 | ALE-174 postmortem: procedural guardrail breach

**Decision**: Ghi nhận guardrail breach (merge không có owner confirm), thêm postmortem vào docs.

**Reason**: PR #22 bị merge mà không có explicit owner confirmation. Impact: không có technical impact, pricing flag vẫn off. Corrective: Hermes/Cursor phải dừng ở READY TO MERGE, chờ owner confirm.

**Alternatives**: Rollback production (không cần thiết vì không có impact).

**Status**: Applied. Postmortem trong docs/project-status.md.

---

## 2026-06-05 | M12 planning: sequencing ALE-176 → ALE-182

**Decision**: Thứ tự triển khai M12: ALE-176 (Beta Launch Command Center) → ALE-177 (Onboarding guide) → ALE-178 → ... → ALE-182.

**Reason**: ALE-176 là foundation dashboard, các issue sau phụ thuộc vào dữ liệu từ nó.

**Alternatives**: Parallel development (phức tạp hơn, merge conflict risk).

**Status**: In progress. ALE-176 done, ALE-177 pending.

---

## 2026-06-05 | ALE-176: no migration needed

**Decision**: Không cần migration cho ALE-176. Tái sử dụng các bảng có sẵn (beta_testers, analytics_events, feedback_entries, profiles) và query helpers hiện có.

**Reason**: Command center là read-only dashboard, chỉ compose dữ liệu từ các nguồn đã có.

**Alternatives**: Tạo bảng mới (không cần thiết).

**Status**: Applied.

---

## 2026-06-05 | ALE-176: inline Tailwind error banner

**Decision**: Dùng Tailwind inline thay vì `@/components/ui/alert`.

**Reason**: Component `@/components/ui/alert` không tồn tại trong project.

**Alternatives**: Tạo component alert mới (overkill cho 1 error banner).

**Status**: Applied.

---

## 2026-06-05 | Agent memory system: file-based first

**Decision**: Dùng `.agent-memory/` folder (markdown files) làm memory system cho Hermes/Cursor.

**Reason**: Nhẹ, không cần cài đặt, không cần API key, dễ version control, dễ rollback.

**Alternatives**: Memanto (cần Moorcheh API key), Mem0 (cần cloud API key), Pinecone/Weaviate (quá nặng).

**Status**: Applied.
