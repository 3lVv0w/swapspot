import assert from "node:assert/strict";
import test from "node:test";
import { availabilityStatus, distanceKm, matchesPreferences, type Lot } from "../lib/parking";

const location = { lat: 13.746, lng: 100.535 };
const lot: Lot = {
  ...location,
  id: "demo",
  name: "Demo",
  total: 100,
  avail: 20,
  price: 40,
  ev: 1,
  disabled: 0,
  covered: true,
};
const preferences = {
  maxPrice: 40,
  radius: 3,
  needEv: true,
  needDisabled: false,
  needCovered: true,
};

test("distance is zero for the same coordinates and symmetric", () => {
  const other = { lat: 13.75, lng: 100.54 };
  assert.equal(distanceKm(location, location), 0);
  assert.ok(Math.abs(distanceKm(location, other) - distanceKm(other, location)) < 1e-10);
  assert.ok(distanceKm(location, other) > 0.69 && distanceKm(location, other) < 0.71);
});

test("preferences enforce features, price and distance", () => {
  assert.equal(matchesPreferences(lot, location, preferences), true);
  assert.equal(matchesPreferences(lot, location, { ...preferences, needDisabled: true }), false);
  assert.equal(matchesPreferences(lot, location, { ...preferences, maxPrice: 39 }), false);
  assert.equal(matchesPreferences(lot, { ...location, lat: location.lat + 0.1 }, preferences), false);
});

test("availability boundaries match the demo", () => {
  assert.equal(availabilityStatus({ ...lot, avail: 0 }), "full");
  assert.equal(availabilityStatus({ ...lot, avail: 7 }), "bad");
  assert.equal(availabilityStatus({ ...lot, avail: 8 }), "warn");
  assert.equal(availabilityStatus({ ...lot, avail: 20 }), "ok");
});
