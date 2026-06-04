import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { computeCoreFlowFromEventTypes } from "@/types/beta-testers";

describe("computeCoreFlowFromEventTypes", () => {
  it("returns not_started when no core events", () => {
    assert.equal(computeCoreFlowFromEventTypes([]), "not_started");
  });

  it("returns completed when all four core events present", () => {
    assert.equal(
      computeCoreFlowFromEventTypes([
        "board_create",
        "content_add",
        "breakdown_run",
        "remix_run",
      ]),
      "completed",
    );
  });

  it("returns in_progress when some but not all core events", () => {
    assert.equal(computeCoreFlowFromEventTypes(["board_create"]), "in_progress");
    assert.equal(
      computeCoreFlowFromEventTypes(["board_create", "content_add"]),
      "in_progress",
    );
  });

  it("ignores non-core event types", () => {
    assert.equal(computeCoreFlowFromEventTypes(["login", "signup"]), "not_started");
  });
});
