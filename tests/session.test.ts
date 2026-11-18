import assert from "node:assert/strict";
import test from "node:test";
import { sessionRemaining } from "../lib/session";

test("session timer counts down and never returns a negative duration", () => {
  const session = { lotId: "sp", spotId: "P1", startedAt: 1000, durationMs: 120000 };
  assert.equal(sessionRemaining(session, 31000), 90000);
  assert.equal(sessionRemaining(session, 122000), 0);
  assert.equal(sessionRemaining(session, 0), 120000);
});
