"use client";

import type { DemoLot } from "@/lib/demo-lots";
import { lotDistance } from "@/lib/display";
import type { Coordinates } from "@/lib/parking";
import { ParkingMap } from "./parking-map";
import { Icon } from "./icon";

type Props = { lot: DemoLot; location: Coordinates; onCancel: () => void };

export function NavigationView({ lot, location, onCancel }: Props) {
  return (
    <section className="view active" id="view-nav">
      <div className="nav-view">
        <div className="nav-top"><div className="nav-dest">Demo route → {lot.name}</div><button className="icon-btn" onClick={onCancel} title="Cancel"><Icon name="close" /></button></div>
        <div className="nav-main"><div className="nav-arrow"><Icon name="navigate" /></div><div className="nav-dist">{lotDistance(lot, location)}</div><div className="nav-street">Simulated preview — not driving directions</div></div>
        <div className="nav-mini-map"><ParkingMap lots={[lot]} location={location} selected={lot} onSelect={() => {}} /></div>
        <div className="hint-box">No real route or reservation is provided. Do not use this preview for navigation.</div>
        <div className="cta-row"><button className="btn btn-ghost" onClick={onCancel}>Close demo route</button></div>
      </div>
    </section>
  );
}
