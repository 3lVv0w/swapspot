"use client";

import type { DemoLot } from "@/lib/demo-lots";
import { formatPrice, lotDistance, statusClass, statusLabel } from "@/lib/display";
import type { Coordinates } from "@/lib/parking";
import { Icon } from "./icon";

type Props = {
  lot: DemoLot;
  location: Coordinates;
  onBack: () => void;
  onAction: (action: "nav" | "spots" | "camera") => void;
};

export function DetailView({ lot, location, onBack, onAction }: Props) {
  const occupied = Math.round((1 - lot.avail / lot.total) * 100);
  return (
    <section className="view active" id="view-detail">
      <div className="detail">
        <div className="back-row"><button className="back-btn" onClick={onBack}><Icon name="back" /> Back to map</button></div>
        <div className="detail-hero">
          <h2>{lot.name}</h2><div className="addr">{lot.addr}</div>
          <div className="occ-stats">
            <div className="occ-stat"><div className={`v ${statusClass(lot)}`}>{lot.avail}</div><div className="k">Demo free spots</div></div>
            <div className="occ-stat"><div className="v">{lot.total}</div><div className="k">Total</div></div>
            <div className="occ-stat"><div className={`v ${statusClass(lot)}`}>{statusLabel(lot)}</div><div className="k">Status</div></div>
          </div>
          <div className="occ-bar"><div style={{ width: `${occupied}%`, background: "var(--ok)" }} /></div>
          <div className="occ-bar-labels"><span>Empty</span><span>{occupied}% occupied</span><span>Full</span></div>
        </div>
        <div className="grid-2">
          {[["Hourly rate", formatPrice(lot)], ["Daily max", lot.daily ? `฿${lot.daily}` : "—"], ["Open hours", lot.hours], ["Distance", lotDistance(lot, location)], ["Operator", lot.op], ["Rating", `★ ${lot.rating} / 5`]].map(([label, value]) => (
            <div className="info-card" key={label}><div className="k">{label}</div><div className="v">{value}</div></div>
          ))}
        </div>
        <div className="info-card"><div className="k">Features</div><div className="feats">
          <span className={`feat ${lot.ev ? "" : "off"}`}>EV charging · {lot.ev}</span>
          <span className={`feat ${lot.disabled ? "" : "off"}`}>Accessible · {lot.disabled}</span>
          <span className={`feat ${lot.covered ? "" : "off"}`}>Covered</span>
          <span className={`feat ${lot.security ? "" : "off"}`}>Security</span>
        </div></div>
        <div className="cta-row">
          <button className="btn btn-ghost" onClick={() => onAction("camera")} title="Simulated camera"><Icon name="camera" /></button>
          <button className="btn btn-ai" onClick={() => onAction("spots")}><Icon name="spots" /> Choose spot</button>
          <button className="btn btn-primary" onClick={() => onAction("nav")}><Icon name="navigate" /> Demo route</button>
        </div>
      </div>
    </section>
  );
}
