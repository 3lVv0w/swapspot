import assert from "node:assert/strict";
import test from "node:test";
import { createDemoLots } from "../lib/demo-lots";
import { findLotByName, parseIntent } from "../lib/intent";

const lots = createDemoLots();

test("recognizes aliases without mistaking spot for a lot code", () => {
  assert.equal(findLotByName("is central world full", lots)?.id, "cw");
  assert.equal(findLotByName("find a spot", lots), null);
});

test("extracts distance, features, and a pending yes or no", () => {
  const intent = parseIntent("cheapest EV parking within 500 meters", lots);
  assert.equal(intent.cheapest, true);
  assert.equal(intent.ev, true);
  assert.equal(intent.maxDistance, 0.5);
  assert.equal(parseIntent("yes", lots).yes, true);
  assert.equal(parseIntent("no", lots).no, true);
});
