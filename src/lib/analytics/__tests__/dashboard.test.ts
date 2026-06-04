import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  buildAnalyticsFunnel,
  buildDailyActivity,
  countAnalyticsEvents,
} from "@/lib/analytics/queries";
import type { AnalyticsEventType } from "@/types/analytics";

describe("analytics dashboard helpers", () => {
  it("counts only known event types", () => {
    const counts = countAnalyticsEvents([
      { event_type: "board_create" as AnalyticsEventType },
      { event_type: "board_create" as AnalyticsEventType },
      { event_type: "content_add" as AnalyticsEventType },
    ]);

    assert.equal(counts.board_create, 2);
    assert.equal(counts.content_add, 1);
    assert.equal(counts.remix_run, 0);
  });

  it("builds daily activity buckets without metadata", () => {
    const rows = buildDailyActivity(
      [
        { event_type: "content_add", created_at: "2026-06-03T08:00:00.000Z" },
        { event_type: "remix_run", created_at: "2026-06-03T09:00:00.000Z" },
      ],
      2,
      new Date("2026-06-04T12:00:00.000Z"),
    );

    assert.deepEqual(rows.map((row) => row.date), ["2026-06-03", "2026-06-04"]);
    assert.equal(rows[0]?.total, 2);
    assert.equal(rows[0]?.events.content_add, 1);
    assert.equal(rows[0]?.events.remix_run, 1);
    assert.equal(rows[1]?.total, 0);
  });

  it("builds funnel drop-off without divide-by-zero", () => {
    const funnel = buildAnalyticsFunnel({
      signup: 0,
      login: 0,
      board_create: 2,
      content_add: 1,
      breakdown_run: 0,
      remix_run: 0,
      calendar_add: 0,
    });

    assert.equal(funnel[0]?.conversionRate, 0);
    assert.equal(funnel[1]?.dropOffFromPrevious, 0);
    assert.equal(funnel[2]?.dropOffFromPrevious, 50);
  });
});
