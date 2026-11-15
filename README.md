# SwapSpot — Voice Parking Finder Assistant

A hands-free, voice-first parking finder web app built for use while driving. Talk to it like an AI assistant instead of calling parking lots to ask for free spots. It listens through your mic, answers through your speaker, and can navigate you to the best available lot.

**Live demo:** https://my.dolawork.site/p/HFxhhI7Vqt4hHGmjxvOlU8Btg7f

## Features

- **Voice input & output** — Web Speech API (SpeechRecognition + SpeechSynthesis). Optional "Hey SwapSpot" wake-word mode. Spacebar = push-to-talk.
- **Conversational AI** — multi-turn: "I'm at Siam Paragon, find parking" → recommends the best lot → asks "Should I navigate you there? (yes/no)" → confirm by voice to start turn-by-turn.
- **Animated mascot** — reacts to state (bounces while AI speaks, pulses while listening).
- **Barrier-gate loading animation** — plays while searching for spots.
- **Live map** — Leaflet + OpenStreetMap (no API key), dark-tile styling that doesn't invert colored markers, dashed route preview on lot selection, quick-action bar (Navigate / Choose Spot / Live Camera / Details).
- **Spot-level booking** — "Your Parking" grid (P1–P12) with Available / Occupied / Booked states; tap to book a real spot.
- **Parking session timer** — circular countdown dial, Today/Tomorrow/Later tabs, Park/End toggle, auto-computed fee.
- **Live AI camera view** — CCTV-style feed with simulated detection boxes (green = free, red = occupied, yellow = EV), scanning line, LIVE badge, auto-refresh.
- **16 simulated lots** in central Bangkok with live-updating availability, prices, EV/accessible/covered features, filters, and preferences (max price, radius, EV/accessible/covered required) saved to localStorage.
- **Light / dark theme** toggle.

## Tech stack

- Vanilla HTML5 / CSS3 / JavaScript (no build step, no framework)
- Leaflet.js 1.9.4 (CDN) for maps
- Web Speech API for voice
- Google Fonts (Manrope + JetBrains Mono)

## Run locally

Voice (mic) requires a **secure context** — serve over `https://` or `http://localhost`:

```bash
git clone https://github.com/<your-username>/swapspot.git
cd swapspot
python3 -m http.server 8080
# open http://localhost:8080
```

Or just open `index.html` — voice falls back to a typed prompt if the microphone is unavailable.

Use Chrome or Edge for best speech recognition; Firefox shows a text fallback.

## Project structure

```
swapspot/
├── index.html      # single self-contained app (embedded CSS + JS)
└── assets/
    ├── mascot.gif    # animated AI assistant mascot
    ├── barrier.gif   # loading animation (parking barrier lifting)
    └── cctv.jpg      # background for the live AI-camera detection view
```

## Notes

- Availability, navigation, and camera detection are simulated demo data. The architecture is ready to plug into real parking-operator APIs, computer-vision spot detection, and routing engines.
- No API keys required.

## License

MIT — see [LICENSE](LICENSE).
