"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createDemoLots, type DemoLot } from "@/lib/demo-lots";
import { formatPrice, isOpen, lotDistance, statusLabel } from "@/lib/display";
import { parseIntent } from "@/lib/intent";
import { distanceKm, matchesPreferences, type Coordinates } from "@/lib/parking";
import { createDemoSpots, sessionRemaining, type ParkingSession, type Spot } from "@/lib/session";
import { defaultSettings, parseSettings, SETTINGS_KEY, type Settings } from "@/lib/settings";
import { CameraView } from "./camera-view";
import { DetailView } from "./detail-view";
import { DriveView } from "./drive-view";
import { Icon } from "./icon";
import { MapView, type LotFilter } from "./map-view";
import { NavigationView } from "./navigation-view";
import { SettingsView } from "./settings-view";
import { SpotsView } from "./spots-view";
import { useSpeech } from "./use-speech";

type View = "drive" | "map" | "detail" | "nav" | "settings" | "spots" | "camera";
const views: View[] = ["drive", "map", "detail", "nav", "settings", "spots", "camera"];
const initialLocation = { lat: 13.746, lng: 100.535 };

export function SwapSpot() {
  const [view, setView] = useState<View>("drive");
  const [lots, setLots] = useState<DemoLot[]>(createDemoLots);
  const [location, setLocation] = useState<Coordinates>(initialLocation);
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<LotFilter>("all");
  const [live, setLive] = useState(true);
  const [query, setQuery] = useState("");
  const [answer, setAnswer] = useState("Demo ready. Tap the button or say “Hey SwapSpot” to ask for parking.");
  const [toast, setToast] = useState("");
  const [loading, setLoading] = useState(false);
  const [pending, setPending] = useState<string | null>(null);
  const [spotData, setSpotData] = useState<Record<string, Spot[]>>({});
  const [session, setSession] = useState<ParkingSession | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const queryTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handler = useRef<(text: string) => void>(() => {});

  const showToast = useCallback((message: string) => {
    setToast(message);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 3000);
  }, []);

  const speech = useSpeech({
    voiceOut: settings.voiceOut,
    muted: settings.muted,
    wakeWord: settings.wakeWord,
    voiceName: settings.voiceName,
    rate: settings.rate,
    expectingResponse: pending !== null,
    onCommand: (text) => handler.current(text),
    onError: showToast,
  });
  const { speak, start: startListening, stop: stopListening, cancelSpeech, setTranscript } = speech;

  useEffect(() => {
    try {
      const saved = localStorage.getItem(SETTINGS_KEY);
      // Browser storage is only available after hydration.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (saved) setSettings(parseSettings(saved));
    } catch (error) {
      console.warn("Could not load saved settings", error);
      showToast("Could not load saved settings; using defaults.");
    }
    setSettingsLoaded(true);
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
      if (queryTimer.current) clearTimeout(queryTimer.current);
    };
  }, [showToast]);

  useEffect(() => {
    if (!settingsLoaded) return;
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (error) {
      console.warn("Could not save settings", error);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      showToast("Could not save settings on this device.");
    }
    document.body.classList.toggle("light", settings.lightTheme);
  }, [settings, settingsLoaded, showToast]);

  useEffect(() => {
    if (!live) return;
    const timer = setInterval(() => {
      setLots((current) => current.map((lot) => {
        const drift = (Math.random() - 0.48) * Math.max(3, lot.total * 0.004);
        return { ...lot, avail: Math.max(0, Math.min(lot.total, Math.round(lot.avail + drift))) };
      }));
    }, 6000);
    return () => clearInterval(timer);
  }, [live]);

  useEffect(() => {
    const syncHash = () => {
      const value = window.location.hash.slice(1);
      if (views.includes(value as View)) setView(value as View);
      else if (!value) setView("drive");
    };
    syncHash();
    window.addEventListener("hashchange", syncHash);
    return () => window.removeEventListener("hashchange", syncHash);
  }, []);

  const go = useCallback((next: View) => {
    setView(next);
    window.location.hash = next;
  }, []);

  const say = useCallback((text: string) => {
    setAnswer(text);
    speak(text);
  }, [speak]);

  const selected = lots.find((lot) => lot.id === selectedId) ?? null;
  const matchingLots = useMemo(() => lots
    .filter((lot) => matchesPreferences(lot, location, settings))
    .sort((a, b) => distanceKm(location, a) - distanceKm(location, b)), [lots, location, settings]);
  const visibleLots = useMemo(() => matchingLots.filter((lot) => {
    if (query && !`${lot.name} ${lot.addr}`.toLowerCase().includes(query.toLowerCase())) return false;
    if (filter === "open" && !isOpen(lot)) return false;
    if (filter === "free" && lot.price !== 0) return false;
    if (filter === "ev" && !lot.ev) return false;
    if (filter === "disabled" && !lot.disabled) return false;
    if (filter === "covered" && !lot.covered) return false;
    return filter !== "cheap" || lot.price <= 40;
  }), [matchingLots, filter, query]);

  const selectLot = useCallback((id: string) => setSelectedId(id), []);
  const prepareSpots = useCallback((lot: DemoLot) => {
    setSpotData((current) => current[lot.id] ? current : {
      ...current,
      [lot.id]: createDemoSpots(lot.avail / lot.total),
    });
  }, []);

  const openAction = useCallback((action: "nav" | "spots" | "camera" | "detail") => {
    if (!selected) {
      showToast("Choose a demo lot first.");
      return;
    }
    if (action === "spots") prepareSpots(selected);
    if (action === "nav") say("This is a simulated route preview, not driving directions.");
    go(action);
  }, [selected, showToast, prepareSpots, say, go]);

  const endSession = useCallback((expired = false) => {
    if (!session) return;
    const lot = lots.find((item) => item.id === session.lotId);
    const cost = Math.max(0, Math.round((Date.now() - session.startedAt) / 3600000 * (lot?.price ?? 0)));
    setSpotData((current) => ({
      ...current,
      [session.lotId]: (current[session.lotId] ?? []).map((spot) => spot.id === session.spotId ? { ...spot, state: "free" } : spot),
    }));
    setSession(null);
    say(`${expired ? "Demo time is up. " : ""}Demo parking ended. Estimated fee ${cost} baht.`);
    showToast(`Demo parking ended · estimated ฿${cost}`);
  }, [session, lots, say, showToast]);

  useEffect(() => {
    if (!session) return;
    const timer = setInterval(() => {
      if (sessionRemaining(session, Date.now()) === 0) endSession(true);
    }, 1000);
    return () => clearInterval(timer);
  }, [session, endSession]);

  const bookSpot = useCallback((spotId: string) => {
    if (!selected) return;
    if (session) {
      showToast("End the current demo session before choosing another spot.");
      return;
    }
    const spot = spotData[selected.id]?.find((item) => item.id === spotId);
    if (!spot || spot.state !== "free") {
      showToast("No available demo spot selected.");
      return;
    }
    setSpotData((current) => ({ ...current, [selected.id]: current[selected.id].map((item) => item.id === spotId ? { ...item, state: "mine" } : item) }));
    setSession({ lotId: selected.id, spotId, startedAt: Date.now(), durationMs: 2 * 3600000 });
    say(`Demo spot ${spotId} selected at ${selected.name}. No real reservation was made.`);
    showToast(`Demo spot ${spotId} selected`);
  }, [selected, session, spotData, say, showToast]);

  const processQuery = useCallback((text: string) => {
    const intent = parseIntent(text, lots);
    if (pending && intent.yes && !intent.no && !intent.navigate) {
      const target = lots.find((lot) => lot.id === pending);
      setPending(null);
      if (target) {
        setSelectedId(target.id);
        say(`Showing a simulated route to ${target.name}. This is not driving navigation.`);
        go("nav");
      }
      return;
    }
    if (pending && intent.no && !intent.yes) {
      setPending(null);
      say("Okay, no demo route.");
      return;
    }
    setPending(null);
    if (intent.repeat) {
      say(speech.lastAnswer.current || "There is nothing to repeat yet.");
      return;
    }
    if (intent.cancel) {
      if (view === "nav") go("drive");
      say("Demo navigation cancelled.");
      return;
    }
    if (intent.help) {
      say("Ask for nearby parking, prices, EV charging, accessible spots, or a simulated route.");
      return;
    }
    if (intent.greeting && !intent.nearest && !intent.navigate && !intent.lot) {
      say("Hello! This is a parking demonstration. Ask me to find parking or check prices.");
      return;
    }
    let position = location;
    if (intent.atLocation && intent.lot) {
      position = { lat: intent.lot.lat + 0.0022, lng: intent.lot.lng + 0.0015 };
      setLocation(position);
    }
    const radius = intent.maxDistance ?? settings.radius;
    let candidates = lots.filter((lot) =>
      (!intent.ev || lot.ev > 0) && (!intent.disabled || lot.disabled > 0) &&
      (!intent.covered || lot.covered) && (!intent.free || lot.price === 0) &&
      (intent.maxPrice === null || lot.price <= intent.maxPrice) && distanceKm(position, lot) <= radius,
    );
    candidates.sort((a, b) => (intent.cheapest ? a.price - b.price : 0) || distanceKm(position, a) - distanceKm(position, b));
    const open = candidates.filter((lot) => isOpen(lot));
    if (open.length) candidates = open;
    if (intent.lot && !intent.navigate && !intent.nearest && !intent.reserve) {
      const lot = intent.lot;
      say(intent.priceQuery
        ? `Demo: ${lot.name} charges ${formatPrice(lot)}${lot.daily ? `, or ฿${lot.daily} daily maximum` : ""}.`
        : `Demo: ${lot.name} has ${lot.avail} of ${lot.total} simulated spots open. ${statusLabel(lot)}. ${formatPrice(lot)}.`);
      return;
    }
    if (intent.navigate) {
      const target = intent.lot ?? candidates.find((lot) => lot.avail > 0);
      if (!target) { say("No matching demo lot found."); return; }
      setSelectedId(target.id);
      say(`Showing a simulated route to ${target.name}. This is not driving navigation.`);
      go("nav");
      return;
    }
    if (intent.reserve) {
      const target = intent.lot ?? candidates.find((lot) => lot.avail > 0);
      if (!target) { say("No demo lot is available."); return; }
      setSelectedId(target.id);
      say(`This is a demo. No real spot has been held at ${target.name}.`);
      return;
    }
    const target = candidates.find((lot) => lot.avail > 0);
    if (!target) {
      say("No matching demo parking found. Try widening the search radius.");
      return;
    }
    setSelectedId(target.id);
    setPending(target.id);
    say(`Demo: ${target.name} has ${target.avail} simulated spots, ${formatPrice(target)}, ${lotDistance(target, position)} away. Show a simulated route? Say yes or no.`);
    go("map");
  }, [lots, pending, location, settings.radius, say, speech.lastAnswer, view, go]);

  const submitQuery = useCallback((text: string) => {
    setTranscript(text);
    setLoading(true);
    if (queryTimer.current) clearTimeout(queryTimer.current);
    queryTimer.current = setTimeout(() => {
      setLoading(false);
      processQuery(text);
    }, 800);
  }, [processQuery, setTranscript]);

  useEffect(() => {
    handler.current = submitQuery;
  }, [submitQuery]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target;
      if (event.code !== "Space" || event.repeat || (target instanceof HTMLElement && (target.isContentEditable || ["INPUT", "SELECT", "TEXTAREA", "BUTTON"].includes(target.tagName)))) return;
      event.preventDefault();
      if (speech.listening) stopListening();
      else startListening();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [speech.listening, startListening, stopListening]);

  const changeSetting = useCallback(<K extends keyof Settings>(key: K, value: Settings[K]) => {
    setSettings((current) => ({ ...current, [key]: value }));
    if (key === "wakeWord") {
      if (value) startListening();
      else stopListening();
    }
  }, [startListening, stopListening]);

  return (
    <>
      <div id="app">
        <header className="topbar">
          <div className="brand"><div className="brand-mark">P</div><span>Swap<b>Spot</b></span></div>
          <div className="status-pills"><div className="pill">Demo location</div><div className={`pill ${speech.listening ? "on" : ""}`}>Mic</div><div className={`pill ${speech.speaking ? "on" : ""}`}>Voice</div><div className="pill">Simulated data</div></div>
          <button className={`icon-btn ${settings.muted ? "active" : ""}`} title="Mute voice" onClick={() => { changeSetting("muted", !settings.muted); if (!settings.muted) cancelSpeech(); }}><Icon name="volume" /></button>
          <button className="icon-btn" title="Settings" onClick={() => go("settings")}><Icon name="settings" /></button>
        </header>
        <div className="demo-banner">DEMO ONLY · No real reservations or driving directions</div>
        {!speech.supported && <div id="micWarn" className="show">Voice input is not supported. Type a request below.</div>}
        {view === "drive" && <DriveView nearest={matchingLots[0] ?? null} location={location} answer={answer} transcript={speech.transcript} listening={speech.listening} speaking={speech.speaking} onNearest={(id) => { setSelectedId(id); go("detail"); }} onMicrophone={() => speech.listening ? stopListening() : startListening()} onCommand={submitQuery} />}
        {view === "map" && <MapView allLots={lots} lots={visibleLots} location={location} selected={selected} filter={filter} query={query} live={live} pending={pending === selected?.id} onSelect={selectLot} onFilter={setFilter} onQuery={setQuery} onBack={() => go("drive")} onToggleLive={() => { setLive((value) => !value); showToast(live ? "Simulated updates paused." : "Simulated updates on."); }} onLocate={() => showToast("Location is simulated.")} onAnswer={submitQuery} onAction={openAction} />}
        {view === "settings" && <SettingsView settings={settings} voices={speech.voices} onChange={changeSetting} onBack={() => go("drive")} />}
        {view === "detail" && selected && <DetailView lot={selected} location={location} onBack={() => go("map")} onAction={openAction} />}
        {view === "nav" && selected && <NavigationView lot={selected} location={location} onCancel={() => go("drive")} />}
        {view === "spots" && selected && <SpotsView lot={selected} spots={spotData[selected.id] ?? []} session={session} onBack={() => go("detail")} onBook={bookSpot} onEnd={endSession} />}
        {view === "camera" && selected && <CameraView lot={selected} onBack={() => go("detail")} onBook={() => { prepareSpots(selected); go("spots"); }} />}
        {["detail", "nav", "spots", "camera"].includes(view) && !selected && <section className="view active"><div className="settings"><p>Select a demo lot first.</p><button className="btn btn-primary" onClick={() => go("map")}>Open map</button></div></section>}
      </div>
      {toast && <div id="toast" className="show" role="status">{toast}</div>}
      {loading && <div id="loader" className="show"><div className="loader-card"><Image src="/assets/barrier.gif" width={150} height={132} alt="Opening barrier" unoptimized /><div className="lt">Finding a demo spot…</div><div className="ls">Simulated data</div><div className="loader-dots"><span /><span /><span /></div></div></div>}
    </>
  );
}
