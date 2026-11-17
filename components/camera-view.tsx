"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import type { DemoLot } from "@/lib/demo-lots";
import { Icon } from "./icon";

type Props = { lot: DemoLot; onBack: () => void; onBook: () => void };

export function CameraView({ lot, onBack, onBook }: Props) {
  const [frame, setFrame] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setFrame((value) => value + 1), 3000);
    return () => clearInterval(timer);
  }, []);
  const boxes = Array.from({ length: 23 }, (_, index) => {
    const row = index < 8 ? 0 : index < 15 ? 1 : 2;
    const column = row === 0 ? index : row === 1 ? index - 8 : index - 15;
    const count = row === 1 ? 7 : 8;
    const type = (index + frame) % 9 === 4 ? "ev" : (index * 7 + frame) % 10 < (1 - lot.avail / lot.total) * 10 ? "occ" : "free";
    return { id: index, type, top: [8, 38, 72][row], height: [22, 26, 22][row], left: 6 + column * 88 / count + 1, width: 88 / count - 1.5 };
  });
  return (
    <section className="view active" id="view-camera">
      <div className="cam-view">
        <Image id="camBg" src="/assets/cctv.jpg" alt="Simulated parking camera image" fill sizes="100vw" unoptimized />
        <div className="cam-scan" />
        <div className="cam-overlay">{boxes.map((box) => <div key={box.id} className={`det-box ${box.type}`} style={{ left: `${box.left}%`, top: `${box.top}%`, width: `${box.width}%`, height: `${box.height}%` }}><span className="tag">{box.type.toUpperCase()} {box.id + 1}</span></div>)}</div>
        <div className="cam-hud"><button className="icon-btn" onClick={onBack} aria-label="Back"><Icon name="back" /></button><div className="live-badge">SIMULATED · CAM 01</div></div>
        <div className="cam-bottom"><div className="cam-info"><div className="nm">{lot.name} · Demo camera</div><div className="sub">Static image and simulated detection</div></div><button className="btn btn-primary" onClick={onBook}>Choose demo spot</button></div>
      </div>
    </section>
  );
}
