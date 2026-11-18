import assert from "node:assert/strict";
import test from "node:test";
import { parseSettings } from "../lib/settings";

test("loads legacy settings and fills newly introduced defaults", () => {
  const settings = parseSettings('{"needEv":true,"radius":5,"voiceName":"Samantha"}');
  assert.equal(settings.needEv, true);
  assert.equal(settings.radius, 5);
  assert.equal(settings.voiceName, "Samantha");
  assert.equal(settings.lightTheme, false);
});

test("rejects malformed or incorrectly typed stored settings", () => {
  assert.throws(() => parseSettings("{"));
  assert.throws(() => parseSettings('{"radius":"near"}'));
  assert.throws(() => parseSettings("[]"));
});
