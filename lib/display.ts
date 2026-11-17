import type { DemoLot } from "./demo-lots";
import { availabilityStatus, distanceKm, type Coordinates } from "./parking";

export function formatDistance(km: number): string {
  return km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`;
}

export function formatPrice(lot: DemoLot): string {
  return lot.price === 0 ? "Free" : `฿${lot.price}/hr`;
}

export function statusLabel(lot: DemoLot): string {
  return {
    ok: "Plenty available",
    warn: "Filling fast",
    bad: "Almost full",
    full: "Full",
  }[availabilityStatus(lot)];
}

export function statusClass(lot: DemoLot): string {
  return { ok: "st-ok", warn: "st-warn", bad: "st-bad", full: "st-bad" }[availabilityStatus(lot)];
}

export function lotDistance(lot: DemoLot, location: Coordinates): string {
  return formatDistance(distanceKm(location, lot));
}

export function isOpen(lot: DemoLot, now = new Date()): boolean {
  if (lot.hours === "24 hours") return true;
  const match = lot.hours.match(/(\d+):(\d+)–(\d+):(\d+)/);
  if (!match) return false;
  const minutes = now.getHours() * 60 + now.getMinutes();
  return minutes >= Number(match[1]) * 60 + Number(match[2]) && minutes <= Number(match[3]) * 60 + Number(match[4]);
}
