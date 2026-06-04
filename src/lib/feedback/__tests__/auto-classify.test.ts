import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  formatWeeklySummaryMarkdown,
  parseImportText,
  suggestCategory,
} from "@/lib/feedback/auto-classify";
import { buildWeeklySummary } from "@/lib/feedback/queries";
import { labelForCategory } from "@/types/feedback";
import type { FeedbackEntryRow } from "@/types/feedback";

describe("suggestCategory", () => {
  it("suggests bug for error keywords", () => {
    assert.equal(suggestCategory("App bị lỗi 500 khi remix"), "bug");
  });

  it("suggests positive for praise keywords", () => {
    assert.equal(suggestCategory("Breakdown cực hay, tuyệt vời"), "positive");
  });

  it("returns null when no keyword match", () => {
    assert.equal(suggestCategory("xyz abc random"), null);
  });
});

describe("parseImportText", () => {
  it("parses line-per-entry import", () => {
    const rows = parseImportText("Lỗi remix fail\nTính năng auto post");
    assert.equal(rows.length, 2);
    assert.equal(rows[0]?.category, "bug");
  });

  it("parses pipe-delimited override", () => {
    const rows = parseImportText("Some summary|positive|p2");
    assert.equal(rows[0]?.category, "positive");
    assert.equal(rows[0]?.priority, "p2");
  });
});

describe("formatWeeklySummaryMarkdown", () => {
  it("includes totals in markdown", () => {
    const md = formatWeeklySummaryMarkdown({
      periodLabel: "01/06 – 08/06",
      total: 3,
      untriaged: 1,
      triaged: 2,
      actioned: 0,
      closed: 0,
      byCategory: { bug: 1, ux: 0, fr: 0, ai: 1, price: 0, positive: 1 },
      byPriority: { p0: 0, p1: 1, p2: 0, p3: 0, unset: 2 },
    });
    assert.match(md, /Tổng mục \(7 ngày\) \| 3/);
    assert.match(md, /bug \| 1/);
  });
});

describe("labelForCategory", () => {
  it("returns Vietnamese label for bug", () => {
    assert.equal(labelForCategory("bug"), "Lỗi");
  });
});

describe("buildWeeklySummary", () => {
  it("counts entries in last 7 days only", () => {
    const now = Date.now();
    const recent: FeedbackEntryRow = {
      id: "1",
      workspace_id: "w",
      beta_tester_id: null,
      created_by: null,
      source: "manual_chat",
      source_ref: null,
      reporter_name: null,
      reporter_persona: null,
      cohort: "cohort-2",
      raw_summary: "Test",
      verbatim_quotes: [],
      category: "bug",
      priority: "p1",
      status: "untriaged",
      linear_issue_id: null,
      action_notes: null,
      replied_to_user: false,
      device: null,
      reproducible: null,
      notes: null,
      triaged_at: null,
      created_at: new Date(now).toISOString(),
      updated_at: new Date(now).toISOString(),
    };
    const old: FeedbackEntryRow = {
      ...recent,
      id: "2",
      created_at: new Date(now - 10 * 24 * 60 * 60 * 1000).toISOString(),
    };
    const stats = buildWeeklySummary([recent, old], 7);
    assert.equal(stats.total, 1);
    assert.equal(stats.byCategory.bug, 1);
  });
});
