# SwapSpot — Voice Parking Finder Demo

A voice-first parking finder demonstration built with Next.js. **Location, parking availability, bookings, camera detection, and route previews are simulated. Do not use the demo for real reservations or driving directions.**

## Features

- **Voice input & output** — Web Speech API (SpeechRecognition + SpeechSynthesis), optional "Hey SwapSpot" continuous listening, and spacebar push-to-talk. A typed input is also available.
- **Rule-based conversation** — asks for parking, prices, or features and offers a simulated route preview. No AI service is connected.
- **Animated mascot** — reacts to state (bounces while AI speaks, pulses while listening).
- **Barrier-gate loading animation** — plays while searching for spots.
- **Map** — Leaflet + OpenStreetMap tiles (no API key), with a dashed simulated route preview and actions for spot selection, demo camera, and details.
- **Simulated spot booking** — "Your Parking" grid (P1–P12) with Available / Occupied / Booked states; selections do not reserve a real spot.
- **Parking session timer** — a two-hour demo countdown, Park/End toggle, and estimated fee. The session is held in memory and is lost on reload.
- **Demo camera view** — static image with simulated detection boxes and auto-refresh; it is not a live feed.
- **16 simulated lots** in central Bangkok with live-updating availability, prices, EV/accessible/covered features, filters, and preferences (max price, radius, EV/accessible/covered required) saved to localStorage.
- **Light / dark theme** toggle.

## Tech stack

- Next.js App Router, React, and TypeScript
- Leaflet.js and OpenStreetMap tiles for maps
- Web Speech API for voice
- Google Fonts (Manrope + JetBrains Mono)

## Run locally

Use Node.js 20.19+, 22.13+, or 24+. Install dependencies and start the development server:

```bash
git clone https://github.com/<your-username>/swapspot.git
cd swapspot
npm ci
npm run dev
# open http://localhost:3000
```

Run `npm test`, `npm run lint`, `npm run typecheck`, and `npm run build` to validate the app. For a local production build, run `npm run build` followed by `npm start`.

Microphone access requires HTTPS or localhost and user permission. Browser speech-recognition support varies; use the typed input when it is unavailable. Depending on the browser, speech recognition may use a remote service. Continuous listening starts when enabled or when the microphone is activated.

## Deploy to Vercel

1. Import the Git repository into Vercel and select the repository root. Vercel detects the Next.js framework and build settings.
2. Deploy a preview and verify the map, typed and voice input, settings, and simulated flows over HTTPS.
3. Configure the production branch and domain after preview validation. This demo currently requires no environment variables.

Keep future Firebase, Neon, and provider credentials in Vercel environment variables, scoped separately to preview and production; never commit secrets. The public OpenStreetMap tile service has a [usage policy](https://operations.osmfoundation.org/policies/tiles/) and no availability guarantee, so select a suitable tile service for production.

## Project structure

```
swapspot/
├── app/            # Next.js layout and page
├── components/     # client-side React views and browser integrations
├── lib/            # demo data and domain logic
├── public/assets/  # images and animations
├── styles.css      # app styles
├── tests/          # focused domain tests
└── index.html      # original standalone demo, retained for reference
```

## Notes

- Firebase Authentication and Neon PostgreSQL are planned but not configured or implemented.
- Real parking-operator and routing providers are undecided. Real payments and camera integration are out of scope for the first release.
- No real parking reservation, barrier control, location tracking, navigation, or payment is performed.

## License

MIT — see [LICENSE](LICENSE).
