import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  buildLinearCandidateDraft,
  findDuplicateHints,
  resolveSeverityLabel,
  suggestLinearTitle,
} from "@/lib/feedback/linear-candidate";
import type { FeedbackEntryRow } from "@/types/feedback";

function makeEntry(overrides: Partial<FeedbackEntryRow> = {}): FeedbackEntryRow {
  return {
    id: "entry-1",
    workspace_id: "ws-1",
    beta_tester_id: null,
    created_by: null,
    source: "manual_chat",
    source_ref: null,
    reporter_name: "Tester A",
    reporter_persona: "creator",
    cohort: "cohort-2",
    raw_summary: "Remix bị lỗi trên mobile khi upload video",
    verbatim_quotes: [],
    category: "bug",
    priority: "p1",
    status: "untriaged",
    linear_issue_id: null,
    action_notes: null,
    replied_to_user: false,
    device: "mobile",
    reproducible: "yes",
    notes: "Cần kiểm tra flow upload.",
    triaged_at: null,
    created_at: "2026-06-04T10:00:00.000Z",
    updated_at: "2026-06-04T10:00:00.000Z",
    ...overrides,
  };
}

describe("resolveSeverityLabel", () => {
  it("maps priority when present", () => {
    assert.equal(resolveSeverityLabel(makeEntry({ priority: "p0" })), "P0 blocker");
  });

  it("falls back to category when priority missing", () => {
    assert.equal(
      resolveSeverityLabel(makeEntry({ priority: null, category: "ux" })),
      "UX confusion",
    );
  });
});

describe("suggestLinearTitle", () => {
  it("includes priority tag and summary", () => {
    const title = suggestLinearTitle(makeEntry());
    assert.match(title, /^\[P1\]/);
    assert.match(title, /Remix bị lỗi/);
  });
});

describe("findDuplicateHints", () => {
  it("warns on category match with keyword overlap", () => {
    const entry = makeEntry({ id: "a", raw_summary: "Remix lỗi upload video mobile" });
    const other = makeEntry({
      id: "b",
      raw_summary: "Remix upload video bị crash mobile",
      category: "bug",
      priority: "p2",
    });

    const hints = findDuplicateHints(entry, [entry, other]);
    assert.equal(hints.length, 1);
    assert.equal(hints[0]?.entryId, "b");
  });

  it("returns empty when no overlap", () => {
    const entry = makeEntry({ id: "a", raw_summary: "abc xyz random" });
    const other = makeEntry({
      id: "b",
      raw_summary: "totally different words here",
      category: "fr",
    });

    assert.equal(findDuplicateHints(entry, [entry, other]).length, 0);
  });
});

describe("buildLinearCandidateDraft", () => {
  it("includes owner review gate and markdown sections", () => {
    const draft = buildLinearCandidateDraft(makeEntry(), [makeEntry()]);
    assert.match(draft.markdown, /Owner review required before issue creation/);
    assert.match(draft.markdown, /Đây chỉ là bản nháp/);
    assert.match(draft.markdown, /M12 — Beta Launch & Activation/);
    assert.match(draft.markdown, /Raw feedback summary/);
    assert.match(draft.markdown, /Duplicate hints/);
    assert.match(draft.markdown, /No API call was made/);
    assert.equal(draft.title.length > 0, true);
  });
});
