"use client";

import type { DemoLot } from "@/lib/demo-lots";
import { useState } from "react";
import { formatPrice, isOpen, lotDistance, statusClass, statusLabel } from "@/lib/display";
import type { Coordinates } from "@/lib/parking";
import { Icon } from "./icon";
import { ParkingMap } from "./parking-map";

export type LotFilter = "all" | "open" | "free" | "ev" | "disabled" | "covered" | "cheap";

type Props = {
  allLots: DemoLot[];
  lots: DemoLot[];
  location: Coordinates;
  selected: DemoLot | null;
  filter: LotFilter;
  query: string;
  live: boolean;
  pending: boolean;
  onSelect: (id: string) => void;
  onFilter: (filter: LotFilter) => void;
  onQuery: (query: string) => void;
  onBack: () => void;
  onToggleLive: () => void;
  onLocate: () => void;
  onAnswer: (answer: "yes" | "no") => void;
  onAction: (action: "nav" | "spots" | "camera" | "detail") => void;
};

const filters: [LotFilter, string][] = [["all", "All"], ["open", "Open now"], ["free", "Free"], ["ev", "EV charging"], ["disabled", "Accessible"], ["covered", "Covered"], ["cheap", "Under ฿40/hr"]];

export function MapView({ allLots, lots, location, selected, filter, query, live, pending, onSelect, onFilter, onQuery, onBack, onToggleLive, onLocate, onAnswer, onAction }: Props) {
  const [recenter, setRecenter] = useState(0);
  return (
    <section className="view active" id="view-map">
      <div className="map-view">
        <ParkingMap lots={allLots} location={location} selected={selected} onSelect={onSelect} recenter={recenter} />
        <div className="map-overlay">
          <div className="map-top">
            <button className="fab" title="Back to drive view" onClick={onBack}><Icon name="back" /></button>
            <label className="map-search"><Icon name="search" /><input value={query} onChange={(event) => onQuery(event.target.value)} placeholder="Search lot or area…" aria-label="Search lot or area" /></label>
            <div className="map-fabs">
              <button className="fab" title="Center simulated location" onClick={() => { setRecenter((value) => value + 1); onLocate(); }}>◎</button>
              <button className={`fab ${live ? "active" : ""}`} title="Toggle simulated updates" aria-pressed={live} onClick={onToggleLive}>↻</button>
            </div>
          </div>
          {selected && <div className="map-action show">
            <div className="ma-info"><div className="ma-name">{selected.name}</div><div className="ma-sub">{selected.avail} free · {formatPrice(selected)} · {lotDistance(selected, location)} · {statusLabel(selected)}</div>
              {pending && <div className="demo-confirm"><span>Show demo route?</span> <button onClick={() => onAnswer("yes")}>Yes</button> <button onClick={() => onAnswer("no")}>No</button></div>}
            </div>
            <div className="ma-btns">
              <button className="ma-btn primary" title="Simulated navigation" onClick={() => onAction("nav")}><Icon name="navigate" /></button>
              <button className="ma-btn ai" title="Choose simulated spot" onClick={() => onAction("spots")}><Icon name="spots" /></button>
              <button className="ma-btn cam" title="Simulated camera" onClick={() => onAction("camera")}><Icon name="camera" /></button>
              <button className="ma-btn ma-detail" title="Details" onClick={() => onAction("detail")}>›</button>
            </div>
          </div>}
          <div className="lots-sheet">
            <div className="sheet-handle" /><div className="sheet-head"><div className="t">Nearby parking <span>{lots.length} lots</span></div></div>
            <div className="filter-row">{filters.map(([id, label]) => <button key={id} className={`filter-chip ${filter === id ? "on" : ""}`} onClick={() => onFilter(id)}>{label}</button>)}</div>
            <div className="lots-list">
              {lots.map((lot) => <button className={`lot-row ${selected?.id === lot.id ? "sel" : ""}`} key={lot.id} onClick={() => onSelect(lot.id)}>
                <div className="avail-badge"><div className={`n ${statusClass(lot)}`}>{lot.avail > 99 ? "99+" : lot.avail}</div><div className="l">free</div></div>
                <div className="info"><div className="nm">{lot.name}</div><div className="dt"><span>{lotDistance(lot, location)}</span><span>{isOpen(lot) ? "Open now" : "Closed"}</span>{lot.ev > 0 && <span>EV</span>}{lot.disabled > 0 && <span>Accessible</span>}{lot.covered && <span>Covered</span>}</div></div>
                <div className="price">{lot.price === 0 ? "FREE" : `฿${lot.price}`}<small>/hr</small></div>
              </button>)}
              {!lots.length && <div>No lots match your filters. Adjust settings or radius.</div>}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
