# DBT335 Final Project Report

## SwapSpot: Voice-First Parking Finder Demonstration

**Written Information Systems Blueprint — Draft based on the current codebase**

| Report field | Detail |
|---|---|
| Institution / course | Thammasat University, Faculty of Architecture and Planning — DBT335 Digital and Information Technology |
| Project | SwapSpot |
| Group |  |
| Team members |  |
| Submission date |  |
| Report status | Codebase-grounded draft; blank fields require project-team input |

> **Scope and evidence note.** This draft describes what is implemented in the repository as inspected. SwapSpot is explicitly a demonstration: parking availability, location, booking, camera detection, and route previews are simulated. No live parking, operator, payment, navigation, AI, database, or IoT service is connected. Organizational facts and operational measurements not present in the codebase are left blank rather than inferred.

## Executive Summary

SwapSpot is a browser-based, voice-first parking finder demonstration built with Next.js, React, and TypeScript. It presents 16 simulated parking lots in central Bangkok, with prices, opening hours, features, and availability. Users can search by typed or spoken requests, filter and sort suitable lots, view their positions on a Leaflet map using OpenStreetMap tiles, inspect simulated parking spaces, and see a simulated route preview. Browser speech APIs provide voice input and output where supported. Parking preferences are stored in browser local storage.

The current implementation is a front-end prototype, not an organizational information system connected to parking operators. Lot data is bundled in source code; availability changes are random client-side updates; spot booking and parking sessions exist only in application memory; and the camera view overlays generated detection boxes on a static image. The codebase contains no production database, user accounts, role-based access control, BI dashboard, manager approval queue, cloud data pipeline, or live sensor feed. Accordingly, the report documents the prototype's observable data structures and logic, while leaving organizational, governance, performance, cost, and rollout details blank where they cannot be established from the repository.

# Chapter 1: Organizational Context and As-Is Audit

## 1.1 Organization and Operational Profile

| Profile item | Detail |
|---|---|
| Product / system | SwapSpot — Voice Parking Assistant |
| Current system type | Front-end demonstration / prototype |
| Intended operational domain | Finding and reviewing parking options |
| Demonstrated geography | Central Bangkok (simulated lot records and initial map location) |
| Parking operators represented in sample data | Siam Piwat, Central Pattana, MBK Group, Platinum, ICONSIAM, The Mall Group, Terminal 21, City Parking, Silom Complex, Pantip, Big C, Chula, Mercure, BTS, and River City |
| Legal organization / enterprise operating SwapSpot |  |
| Internal departments and reporting lines |  |
| Staff roles and responsibilities |  |
| External operator agreements / data owners |  |
| Existing production systems |  |

The codebase does not establish a real operating organization, its departments, staff, operator agreements, or current production systems. Operator names in the sample lot records are data labels only; they do not prove an integration or commercial relationship.

## 1.2 Problem Diagnosis and Information Silos

The repository does not document current parking-operator workflows, manual spreadsheets, chat processes, service-level expectations, error rates, or decision delays. These organizational pain points therefore remain:

| Audit question | Detail |
|---|---|
| Current manual process and information silos |  |
| Operational bottlenecks evidenced by stakeholder research |  |
| Existing duplicate data entry |  |
| Current decision-visibility gaps |  |
| Evidence source / interview date |  |

Within the prototype itself, the principal limitation is that the displayed parking information is not sourced from operators. Lot metadata is defined in a static source array, availability is initialized to 20% of capacity and then varied randomly in the browser, and user-selected spots are simulated. The interface itself warns that it must not be used for real reservations or driving directions.

## 1.3 As-Is Information Flow

The following is the implemented **demo flow**, not a verified organizational As-Is workflow:

```text
User types or speaks a request
        |
        v
Browser UI captures text / Web Speech API provides transcript
        |
        v
Rule-based intent parsing
  - identify lot name / alias
  - read requested price, distance, and feature constraints
  - identify search, price, booking, or route intent
        |
        v
Client-side filter and sort over bundled simulated lot data
        |
        +--> map / lot details / simulated route view
        +--> simulated spot grid / in-memory parking timer
        |
        v
Spoken and/or displayed response
```

No operator system, staff queue, external parking API, or persistent transaction store appears in this flow. The observed data bottlenecks and duplicate-entry points across real teams are:

| As-Is organizational finding | Detail |
|---|---|
| Staff handoffs / swimlanes |  |
| Data duplication across teams |  |
| Measured delays or errors |  |
| Existing management visibility |  |

# Chapter 2: DIKW, Database Design, and To-Be Flow

## 2.1 DIKW Transformation Matrix

The matrix below maps only data and transformations observable in the demo. It does not assert that the outputs represent live operational truth.

| DIKW level | SwapSpot demonstration |
|---|---|
| Data | Bundled lot attributes (`id`, name, coordinates, total spaces, simulated available spaces, price, features, address, hours, operator label, and rating); user-entered or recognized request text; preferences; generated spot states; in-memory session timestamps. |
| Information | Filtered lots that meet price, distance, EV, accessibility, and covered-parking preferences; displayed price and distance; availability count and status; opening-state display. |
| Knowledge | Rule-derived classifications: `full` when availability is zero; `bad` below 8% available; `warn` below 20%; otherwise `ok`. Requests can be interpreted as search, price, feature, reservation, or navigation intents using regular expressions and lot-name aliases. |
| Wisdom / organizational action |  |

The current application provides user-facing presentation and rule-based responses. No managerial decision policy, operational knowledge base, or organizational action protocol is encoded.

## 2.2 Current Data Model and ERD

There is no relational database or deployed ERD in the repository. The following diagram represents in-memory TypeScript objects only:

```text
DemoLot
  id (string, unique in bundled sample)
  | 1
  |------< Spot[] (generated in browser and grouped by lot id)
  |
  | 1
  |------< ParkingSession (at most one active session in UI state)
             lotId -> DemoLot.id
             spotId -> Spot.id

Settings -> browser localStorage key "swapspot_settings"
           (one browser/device preference object; not a user account)
```

### Data Dictionary: `DemoLot`

The lot object is defined by `DemoLot` as `Lot` plus display and sample metadata. All rows are bundled demonstration data.

| Field | Type | Meaning / example | Key / persistence |
|---|---|---|---|
| `id` | string | Short lot identifier, e.g. `sp` | Sample identifier; no database key |
| `name` | string | `Siam Paragon Garage` |  |
| `lat` | number | Latitude, e.g. `13.7464` | Simulated map coordinate |
| `lng` | number | Longitude, e.g. `100.5340` | Simulated map coordinate |
| `total` | number | Total spaces in sample, e.g. `2600` |  |
| `avail` | number | Initial sample is rounded to 20% of `total`; then simulated | Client-side state |
| `price` | number | Hourly sample price in baht, e.g. `60` |  |
| `ev` | number | Sample EV-space count, e.g. `12` |  |
| `disabled` | number | Sample accessible-space count, e.g. `28` |  |
| `covered` | boolean | Whether sample lot is marked covered |  |
| `daily` | number | Sample daily maximum, e.g. `300` |  |
| `hours` | string | Sample opening hours, e.g. `10:00–22:00` |  |
| `addr` | string | Sample address text |  |
| `security` | boolean | Sample security indicator |  |
| `rating` | number | Sample rating, e.g. `4.6` |  |
| `op` | string | Sample operator label, e.g. `Siam Piwat` |  |
| `freeWithPurchase` | boolean (optional) | Present on sample lot where applicable |  |

### Data Dictionary: Other Runtime Objects

| Object / field | Type | Meaning | Persistence |
|---|---|---|---|
| `Coordinates.lat`, `Coordinates.lng` | number | Current demo map position | React state |
| `Spot.id` | string | Generated identifier `P1`–`P12` | React state, keyed by lot |
| `Spot.state` | `"free" \| "occ" \| "booked" \| "mine"` | Simulated spot condition | React state |
| `ParkingSession.lotId` | string | Selected demo lot id | React state |
| `ParkingSession.spotId` | string | Selected demo spot id | React state |
| `ParkingSession.startedAt` | number | Start time in epoch milliseconds | React state |
| `ParkingSession.durationMs` | number | Demo session duration; UI initializes to two hours | React state |
| `Settings.maxPrice`, `Settings.radius` | number | Search limits; defaults are ฿100/hour and 3 km | localStorage |
| `Settings.needEv`, `needDisabled`, `needCovered` | boolean | Required lot features | localStorage |
| `Settings.voiceOut`, `wakeWord`, `voiceName`, `rate`, `muted` | boolean / string / number | Voice preferences | localStorage |
| `Settings.lightTheme` | boolean | Theme preference | localStorage |

No production PK/FK constraints, database column types, sample database rows, retention rules, or migration scripts are present. The object identifiers and links above describe application state and should not be read as a deployed database schema.

## 2.3 To-Be Organizational Information Flow

The repository does not specify a target operator integration, shared organizational database, staff workflow, approval path, or executive reporting system. The implementation-supported flow remains the client-side demo flow in Section 1.3.

| To-Be design item | Detail |
|---|---|
| Authoritative parking-availability source |  |
| Operator data exchange / API contract |  |
| Shared production database and ownership |  |
| Staff exception and correction workflow |  |
| Executive reporting data flow |  |

# Chapter 3: Cloud / IoT Stack and Automation

## 3.1 Implemented System Architecture

```text
User browser
  ├─ Next.js App Router / React / TypeScript UI
  ├─ Rule-based intent and parking calculations
  ├─ In-memory lot availability, spot and session state
  ├─ Browser localStorage for preferences
  ├─ Web Speech API (browser-dependent recognition / synthesis)
  ├─ Leaflet map
  │    └─ OpenStreetMap tile requests
  └─ Google Fonts stylesheet requests

Bundled application assets and sample lot data

No application server API, live operator API, database, MQTT broker,
RFID reader, vehicle sensor, production cloud storage, or AI service is
connected in the current repository.
```

The project uses Next.js, React, and TypeScript. Leaflet and OpenStreetMap support the map display. The README describes Vercel as a possible deployment path and instructs the team to validate a preview over HTTPS; an actual deployed environment or production cloud configuration is not established by the codebase.

| Infrastructure element | Current evidence |
|---|---|
| User touchpoint | Browser-based application; typed input and microphone interaction |
| Location source | Static initial demo coordinates; selecting an “I am at” named lot derives a nearby simulated position |
| Transport / backend API |  |
| Cloud runtime currently configured |  |
| Application database |  |
| IoT / MQTT / RFID integration |  |
| Live camera input |  |
| Third-party map tiles | OpenStreetMap tile endpoint configured in the Leaflet map |
| Speech service | Browser Web Speech APIs; recognition behavior and any remote processing depend on browser |

## 3.2 Algorithmic Logic and Workflow Automation

There is no connected AI model. The assistant uses deterministic client-side rules:

1. Convert request text to lowercase.
2. Match known lot names and aliases.
3. Extract numeric distance and baht limits where a supported unit is present.
4. Detect intents and feature requests using regular expressions.
5. Filter sample lots by requested features, price, and calculated distance.
6. Sort by price for “cheapest” requests, then by distance.
7. Prefer lots marked open when any open candidate exists.
8. Present a simulated result, details, or route preview.

| Sense → Context → Reason → Act | Implemented behavior |
|---|---|
| Sense | Typed request or browser-recognized speech transcript |
| Context | Bundled lot records, static / simulated location, settings, and current UI state |
| Reason | Alias matching, regular-expression intent parsing, Haversine distance, preference filtering, sorting, and availability labels |
| Act | Display response, update selected lot, show map/detail/spot view, or show a simulated route; optional speech synthesis |

Business process selected for automation and measured operational benefit |  |

## 3.3 Human-in-the-Loop (HITL)

The map can ask the user to confirm whether to show a simulated route. A simulated spot selection also requires a user action. These interactions do not approve or execute a real reservation, payment, payout, dispute, safety alert, or operator instruction.

| High-impact action requiring human approval | Approval role / queue |
|---|---|
| Real reservation, payment, operator dispatch, dispute, or emergency alert |  |

# Chapter 4: BI Cockpit and Decision Storytelling

## 4.1 KPI Dictionary

The repository has no BI dashboard, reporting warehouse, accountable KPI owner, or business target. The following are code-supported demo measures and formulas only.

| Candidate measure | Formula in / supported by code | Source | Target | Accountable owner |
|---|---|---|---|---|
| Simulated availability rate | `avail / total × 100` (when `total > 0`) | `DemoLot.avail`, `DemoLot.total` |  |  |
| Simulated available spaces | `avail` | `DemoLot.avail` |  |  |
| Distance to lot | Haversine distance using Earth radius 6,371 km | Lot and current demo coordinates |  |  |
| Hourly sample price | `price` baht/hour; zero is displayed as Free | `DemoLot.price` |  |  |
| Matching lots | Count of lots satisfying selected price, radius, EV, accessible, and covered constraints | Lot sample + settings / request |  |  |
| Estimated demo session fee | `max(0, round(elapsedMilliseconds / 3,600,000 × hourlyPrice))` | In-memory session + sample lot price |  |  |
| Availability status | `full` if `avail = 0`; `bad` if `avail/total < 0.08`; `warn` if `< 0.20`; otherwise `ok` | Lot sample |  |  |

These values are not operational KPIs: availability is simulated, sample prices are not verified transactions, and the estimated fee is not billed.

## 4.2 Dashboard Views

The application includes a map, lot list, detail, settings, simulated route, spot grid, and camera demonstration views. These are product-interface views, not an executive or operational BI dashboard. No charted historical data, live dashboard URL, or exported dashboard screenshot is configured.

| Dashboard deliverable | Detail |
|---|---|
| Executive BI dashboard URL |  |
| Operational BI dashboard URL |  |
| Dashboard screenshots / annotations |  |
| Backup walkthrough video URL |  |

## 4.3 Decision-Trigger Playbooks

Current code behavior can be documented, but management diagnosis and organizational action are not defined by the repository.

| Trigger / rule observable in prototype | UI response | Manager diagnosis / organizational action |
|---|---|---|
| Availability reaches zero | Lot status is `full` |  |
| Availability ratio is below 8% | Lot status is `bad` / “Almost full” |  |
| Availability ratio is from 8% to below 20% | Lot status is `warn` / “Filling fast” |  |
| Availability ratio is at least 20% | Lot status is `ok` / “Plenty available” |  |
| A search finds no matching demo lot | Assistant prompts the user to widen the search radius |  |

# Chapter 5: Cybersecurity, PDPA, and Digital Ethics

## 5.1 Data Footprint and Privacy Inventory

| Data category | Present in current codebase | Classification / handling evidenced |
|---|---|---|
| Identity fields such as name, email, phone, or account ID |  |  |
| Static sample lot coordinates and addresses | Yes | Bundled sample data; not user geolocation |
| User location | Simulated coordinates; no browser geolocation API is evident | In application state |
| Search text / transcript | Captured in UI state for interaction | No application-server persistence is evidenced |
| Voice audio | Browser speech recognition is used where available | Browser behavior may involve a remote recognition service; provider, retention, and processing location are not specified |
| Parking preferences | Yes | Browser localStorage under `swapspot_settings` |
| Spot selection and session timer | Yes | In-memory application state; lost on reload |
| Payment credentials / financial tokens |  |  |
| Biometric identifiers / PDPA Section 26 sensitive data |  |  |
| Live IoT movement telemetry |  |  |

The implementation does not define user identity fields, payment processing, biometric collection, or live vehicle telemetry. This is a codebase inventory only and is not a legal determination or a complete PDPA assessment.

## 5.2 Data Minimization Audit

No account-registration or personal-data intake form exists in the inspected application. The repository does not document a prior form or identify three non-essential personal fields that were deliberately removed.

| Form / field intentionally removed | Rationale / evidence |
|---|---|
|  |  |
|  |  |
|  |  |

## 5.3 CIA Controls and Threat Mapping

| CIA objective / threat | Current evidence in codebase | Control / gap |
|---|---|---|
| Confidentiality — unauthorized account access | No account or authentication implementation is present | Authentication and RBAC policy:  |
| Confidentiality — exposed stored preferences | Preferences are in browser localStorage | Encryption-at-rest / key-management design:  |
| Confidentiality — microphone use | Browser requests speech recognition capability; user permission is required | Consent copy, retention controls, and speech-provider configuration:  |
| Integrity — malformed saved preferences | Settings parser checks object shape, types, and finite numbers; invalid saved data triggers a warning and defaults | Server-side validation / audit trail:  |
| Integrity — inaccurate lot status | Lot records and availability are simulated; availability drifts randomly in client state | Source verification and reconciliation controls:  |
| Availability — network / map tile failure | Map displays an error if tiles fail to load | Offline operating procedure / alternate map source:  |
| Availability — browser or device failure |  |  |
| Encryption in transit / deployment configuration | README recommends HTTPS validation for a deployment preview; no deployment configuration is evidenced here | Production TLS configuration and ownership:  |
| 72-hour breach notification plan |  |  |
| AI fairness / bias controls | No AI model or protected-attribute decision logic is present |  |

## 5.4 Privacy, Ethics, and Operational Safeguards

The visible interface labels the experience as a demo and warns users that availability, booking, navigation, location, and camera detection are simulated. This is an important limitation notice, not a substitute for privacy notices, consent management, access control, or incident-response procedures.

| Governance requirement | Detail |
|---|---|
| Data controller / processor roles |  |
| Lawful basis, notice, and consent process |  |
| Retention and deletion schedule |  |
| Data-subject request handling |  |
| Security incident owner and escalation contacts |  |
| Breach assessment and notification procedure |  |
| Human review for automated decisions |  |

# Chapter 6: Transformation Roadmap and Change Management

## 6.1 Phased Implementation Plan

Only the prototype phase is implemented. The README identifies Firebase Authentication and Neon PostgreSQL as possible future technologies, but states they are not configured or implemented. Real parking-provider and routing integrations remain undecided; real payments and camera integration are out of scope for the first release as described in the README.

| Phase | Codebase-grounded status / scope | Owner | Target date |
|---|---|---|---|
| Phase 1 — Demo / prototype | Implemented: browser UI, simulated central-Bangkok lots, rule-based voice/text interaction, simulated map, spots, session, and camera |  |  |
| Phase 2 — Core organizational information system |  |  |  |
| Phase 3 — Future scale / emerging technology |  |  |  |

Potential future platform references in current project documentation:

| Candidate / decision item | Detail |
|---|---|
| Firebase Authentication | Mentioned as planned; not configured or implemented |
| Neon PostgreSQL | Mentioned as planned; not configured or implemented |
| Parking operator / routing provider | Undecided |
| Production payments / live camera | Out of scope for the first release per README |

## 6.2 Change Management and Continuity

The codebase does not specify staff onboarding, training, stakeholder communications, adoption measures, resistance management, support ownership, or a cloud/Wi-Fi outage fallback SOP.

| Change / continuity item | Detail |
|---|---|
| Staff, operator, and partner training plan |  |
| Communications and adoption measures |  |
| Support and escalation ownership |  |
| Offline / network-failure fallback SOP |  |
| Manual reconciliation after outage |  |

## 6.3 Feasibility and Expected Impact

The repository contains no hosting quote, API pricing, operator fees, labor baseline, time-saved study, error-reduction measurement, revenue data, or adoption forecast. Therefore, a numeric ROI or efficiency claim cannot be supported.

| Feasibility / ROI input | Detail |
|---|---|
| Cloud, tooling, and integration costs |  |
| Current staff hours / process baseline |  |
| Expected hours saved |  |
| Current error rate / expected reduction |  |
| Turnaround-time baseline / target |  |
| Revenue or strategic impact |  |
| ROI calculation and measurement period |  |

# Technical Appendix

## A. Example Runtime Data (Demonstration Only)

The following JSON is an illustrative shape from the source-defined lot and spot objects; it is not a database export or live operator record.

```json
{
  "lot": {
    "id": "sp",
    "name": "Siam Paragon Garage",
    "lat": 13.7464,
    "lng": 100.534,
    "total": 2600,
    "avail": 520,
    "price": 60,
    "daily": 300,
    "hours": "10:00–22:00",
    "addr": "991 Rama I Rd, Pathum Wan",
    "ev": 12,
    "disabled": 28,
    "covered": true,
    "security": true,
    "rating": 4.6,
    "op": "Siam Piwat"
  },
  "spot": {
    "id": "P1",
    "state": "free"
  },
  "parkingSession": {
    "lotId": "sp",
    "spotId": "P1",
    "startedAt": 0,
    "durationMs": 7200000
  }
}
```

The lot's initial `avail` is computed by rounding `total × 0.2`. The spot state and session are generated or created in browser state and do not represent a real reservation.

## B. SQL Schema

No SQL schema, migration, or database connection is present in the current codebase.

## C. Dashboard and Video Links

| Deliverable | URL |
|---|---|
| Live BI dashboard |  |
| Backup demo video |  |

## D. Team Domain Ownership

| Team member | Domain / chapter ownership | Evidence / deliverable |
|---|---|---|
|  |  |  |
|  |  |  |
|  |  |  |

## E. Codebase Evidence

Key implementation files reviewed for this draft:

- `README.md` — project scope, demo limitations, technologies, and deployment notes.
- `lib/demo-lots.ts` — bundled parking-lot sample data.
- `lib/parking.ts` — lot, coordinate, preference, distance, and availability rules.
- `lib/intent.ts` and `lib/voice.ts` — deterministic request parsing and wake-word acceptance.
- `lib/session.ts` — generated spot states and session timer calculation.
- `lib/settings.ts` — settings shape, defaults, and validation.
- `components/swapspot.tsx` — application state, simulated updates, query handling, session actions, and localStorage usage.
- `components/parking-map.tsx` — Leaflet map and OpenStreetMap tile configuration.
- `components/use-speech.ts` — browser speech recognition and synthesis.
- `components/camera-view.tsx` and `components/navigation-view.tsx` — simulated camera and route experiences.

## Submission Readiness Note

This draft reflects the current prototype, but it does not yet satisfy all guideline requirements for a complete organizational IS blueprint. In particular, organizational research, verified As-Is / To-Be workflows, a production ERD and database, operational APIs and IoT, manager-owned KPIs and targets, BI dashboard evidence, PDPA governance proof, a breach plan, rollout ownership, and quantified ROI are not established in the inspected codebase. Those fields remain blank for the project team to complete with verified evidence.
