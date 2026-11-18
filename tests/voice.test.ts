import assert from "node:assert/strict";
import test from "node:test";
import { acceptsWakeCommand } from "../lib/voice";

test("continuous listening accepts the wake phrase and pending answers", () => {
  assert.equal(acceptsWakeCommand("hey swapspot find parking", false), true);
  assert.equal(acceptsWakeCommand("Hey Swap Spot, find parking", false), true);
  assert.equal(acceptsWakeCommand("find parking", false), false);
  assert.equal(acceptsWakeCommand("yes", false), false);
  assert.equal(acceptsWakeCommand("yes", true), true);
  assert.equal(acceptsWakeCommand("ไม่", true), true);
});
