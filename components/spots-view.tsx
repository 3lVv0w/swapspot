"use client";

import { useEffect, useState } from "react";
import type { DemoLot } from "@/lib/demo-lots";
import { sessionRemaining, type ParkingSession, type Spot } from "@/lib/session";
import { Icon } from "./icon";

type Props = {
  lot: DemoLot;
  spots: Spot[];
  session: ParkingSession | null;
  onBack: () => void;
  onBook: (spotId: string) => void;
  onEnd: (expired?: boolean) => void;
};

export function SpotsView({ lot, spots, session, onBack, onBook, onEnd }: Props) {
  const [now, setNow] = useState(() => Date.now());
  const [day, setDay] = useState("Today");
  useEffect(() => {
    if (!session) return;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [session]);
  const remaining = session ? sessionRemaining(session, now) : 0;
  const minutes = Math.floor(remaining / 60000);
  const seconds = Math.floor((remaining % 60000) / 1000);
  const close = lot.hours.match(/(\d{1,2}:\d{2})$/)?.[1] ?? "22:00";

  return (
    <section className="view active" id="view-spots">
      <div className="spots-view">
        <div className="spots-head"><button className="back-btn" onClick={onBack}><Icon name="back" /> Back</button><div className="spots-title">Your Parking<span>{lot.name} · demo</span></div><div /></div>
        <div className="spot-legend"><span>🟢 Available</span><span>🔴 Occupied</span><span>🟡 Booked</span></div>
        <div className="spot-grid">
          {spots.map((spot) => <button key={spot.id} className={`spot-cell ${spot.state === "mine" ? "free mine sel" : spot.state}`} onClick={() => spot.state === "mine" ? onEnd() : onBook(spot.id)} aria-label={`${spot.id}: ${spot.state}`}>
            <span className="sp-id">{spot.id}</span>
            {spot.state === "free" && <><span className="sp-status">Available</span><span className="sp-sub">Tap to simulate booking</span></>}
            {spot.state === "mine" && <><span className="sp-status">Your demo spot</span><span className="sp-sub">Tap to end</span></>}
            {spot.state === "occ" && <span>Occupied</span>}
            {spot.state === "booked" && <span className="bk">Booked</span>}
          </button>)}
        </div>
        <div className="session-card">
          <div className="session-row"><div className="lbl">{session ? "Demo parking session" : "Closing Time"}</div><button className={`btn-park ${session ? "ended" : ""}`} onClick={() => session ? onEnd() : onBook(spots.find((spot) => spot.state === "free")?.id ?? "")}>{session ? "End" : "Park"}</button></div>
          <div className="day-tabs">{["Today", "Tomorrow", "Later"].map((item) => <button key={item} className={`day-tab ${day === item ? "on" : ""}`} onClick={() => setDay(item)}>{item}</button>)}</div>
          <div className="dial-wrap"><div className="dial">
            <svg width="200" height="200" viewBox="0 0 200 200" aria-hidden="true"><circle cx="100" cy="100" r="86" fill="none" stroke="var(--surface3)" strokeWidth="14" strokeDasharray="3 7" /><circle cx="100" cy="100" r="86" fill="none" stroke="var(--ok)" strokeWidth="14" strokeLinecap="round" strokeDasharray="540" strokeDashoffset={session ? 540 * (1 - remaining / session.durationMs) : 135} /></svg>
            <div className="dial-center"><div className="t">{session ? `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}` : close}</div><div className="s">{session ? `Parking · ${session.spotId}` : "Until close"}</div></div>
          </div><div className="dial-alert">Demo timer only</div></div>
        </div>
      </div>
    </section>
  );
}
