export type Coordinates = { lat: number; lng: number };

export type Lot = Coordinates & {
  id: string;
  name: string;
  total: number;
  avail: number;
  price: number;
  ev: number;
  disabled: number;
  covered: boolean;
};

export type ParkingPreferences = {
  maxPrice: number;
  radius: number;
  needEv: boolean;
  needDisabled: boolean;
  needCovered: boolean;
};

export function distanceKm(a: Coordinates, b: Coordinates): number {
  const radians = Math.PI / 180;
  const latitude = (b.lat - a.lat) * radians;
  const longitude = (b.lng - a.lng) * radians;
  const h =
    Math.sin(latitude / 2) ** 2 +
    Math.cos(a.lat * radians) * Math.cos(b.lat * radians) * Math.sin(longitude / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

export function matchesPreferences(
  lot: Lot,
  location: Coordinates,
  preferences: ParkingPreferences,
): boolean {
  return (
    (!preferences.needEv || lot.ev > 0) &&
    (!preferences.needDisabled || lot.disabled > 0) &&
    (!preferences.needCovered || lot.covered) &&
    lot.price <= preferences.maxPrice &&
    distanceKm(location, lot) <= preferences.radius
  );
}

export function availabilityStatus(lot: Lot): "full" | "bad" | "warn" | "ok" {
  if (lot.avail === 0) return "full";
  const ratio = lot.avail / lot.total;
  if (ratio < 0.08) return "bad";
  if (ratio < 0.2) return "warn";
  return "ok";
}
