"use client";

import { useEffect, useRef, useState } from "react";
import type { Map as LeafletMap } from "leaflet";
import type { DemoLot } from "@/lib/demo-lots";
import { availabilityStatus, type Coordinates } from "@/lib/parking";

type Props = {
  lots: DemoLot[];
  location: Coordinates;
  selected: DemoLot | null;
  onSelect: (id: string) => void;
  recenter?: number;
};

export function ParkingMap({ lots, location, selected, onSelect, recenter = 0 }: Props) {
  const container = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let disposed = false;
    let map: LeafletMap | null = null;
    import("leaflet").then((L) => {
      if (disposed || !container.current) return;
      map = L.map(container.current, { zoomControl: false }).setView([13.746, 100.535], 14);
      L.control.zoom({ position: "topright" }).addTo(map);
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).on("tileerror", () => setFailed(true)).addTo(map);
      mapRef.current = map;
      setReady(true);
    }).catch((error: unknown) => {
      if (!disposed) {
        console.error("Could not initialize the map", error);
        setFailed(true);
      }
    });
    return () => {
      disposed = true;
      mapRef.current = null;
      map?.remove();
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!ready || !map) return;
    let disposed = false;
    let layer: import("leaflet").LayerGroup | null = null;
    import("leaflet").then((L) => {
      if (disposed) return;
      layer = L.layerGroup().addTo(map);
      L.marker([location.lat, location.lng], {
        icon: L.divIcon({ className: "", html: '<div class="user-marker"></div>', iconSize: [18, 18], iconAnchor: [9, 9] }),
      }).addTo(layer);
      for (const lot of lots) {
        const status = availabilityStatus(lot);
        const icon = L.divIcon({
          className: "",
          html: `<div class="lot-marker mk-${status}"><span>${lot.avail > 99 ? "99+" : lot.avail}</span></div>`,
          iconSize: [38, 38],
          iconAnchor: [19, 34],
        });
        const tooltip = document.createElement("span");
        tooltip.textContent = `${lot.name} · ${lot.avail} free`;
        L.marker([lot.lat, lot.lng], { icon })
          .bindTooltip(tooltip, { direction: "top", className: "lot-tip", offset: [0, -30] })
          .on("click", () => onSelect(lot.id))
          .addTo(layer);
      }
      if (selected) {
        L.polyline([[location.lat, location.lng], [selected.lat, selected.lng]], {
          color: "#22D3EE", weight: 4, opacity: 0.85, dashArray: "1 10",
        }).addTo(layer);
      }
    }).catch((error: unknown) => {
      if (!disposed) {
        console.error("Could not update map markers", error);
        setFailed(true);
      }
    });
    return () => {
      disposed = true;
      layer?.remove();
    };
  }, [ready, lots, location, selected, onSelect]);

  useEffect(() => {
    const map = mapRef.current;
    const lat = selected?.lat;
    const lng = selected?.lng;
    if (!ready || !map || lat === undefined || lng === undefined) return;
    map.fitBounds([[location.lat, location.lng], [lat, lng]], { padding: [70, 70] });
  }, [ready, selected?.lat, selected?.lng, location.lat, location.lng]);

  useEffect(() => {
    if (recenter > 0) mapRef.current?.flyTo([location.lat, location.lng], 15);
  }, [recenter, location.lat, location.lng]);

  return <><div id="map" ref={container} aria-label="Map of simulated parking lots" />{failed && <p className="map-error" role="alert">Some map content could not be loaded. Check your connection.</p>}</>;
}
