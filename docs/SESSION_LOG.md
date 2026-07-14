# Session Log — condensed history of the founding chat

A distilled record of the conversation that built this project, so a new
session inherits the *why*, not just the code. Chronological.

## Build (one session, 2026-07-14)

1. **Scaffold** — empty repo → `create-expo-app` (SDK 56, blank-typescript),
   strict TS, portrait-only, folder structure per brief §10.
   Note: `npx expo install` can't reach the Expo API from the cloud sandbox;
   versions were taken from `expo/bundledNativeModules.json` instead.
2. **Phase 1** — pure engine (rng/money/market/inventory/economy) + Zustand
   store + SQLite persistence behind an injectable bridge + 4 screens.
   Bugs fixed along the way: an invisible NBSP-vs-space mismatch in VND
   strings (now explicit ` ` everywhere), and a save/load test that
   was clobbering its own fixture because newGame persists immediately.
3. **Phase 2** — CharacterDef schema + 24 characters + Card Viewer (63:88
   ratio, silhouettes for unmet characters) + `npm run export-cards`.
   Fixed a zustand render-loop hazard: never build closures inside
   `useShallow` selectors.
4. **Phase 3** — data-driven event engine (22 events, weighted, tier-gated,
   once-flags, requirement-gated choices), dispositions (default 50),
   ability hooks with real economic effect, tier gates incl. INVESTOR@70
   for T4 / CHEF@60 for T5, Michelin = 2 survived critic events at T5,
   T6 empire dashboard with idle quarters + prestige (equity drags bonus).
5. **Phase 4** — CommerceProvider interface + MockCommerceProvider +
   shop preview screen, all behind COMMERCE_ENABLED=false.
   Final state: 63 tests, clean typecheck, iOS/Android bundles verified.

## Distribution discussion (same session, later)

- Owner asked how to run on iPhone → Expo Go steps given.
- Asked for a "downloadable instance" → explained signing reality (no
  credentials in the cloud env; checked). Added `eas.json`,
  bundle id `com.phoking.life`, `DISTRIBUTION.md`.
- Asked about avoiding the $99 Apple account → documented: Android APK
  sideload (best), iOS Simulator (free w/ Xcode), 7-day free-Apple-ID
  installs, and **browser**.
- Chose Mac-first, then asked about running without Xcode → added full web
  support: `react-native-web`/`react-dom` + `sqlitePersistence.web.ts`
  (AsyncStorage/localStorage swap-in via Metro platform resolution).
  Verified the exported web bundle renders the title screen with zero
  console errors in jsdom (Playwright browsers are blocked by the sandbox
  network allowlist).
- Owner's `npm run web` failed → screenshot showed `npm: command not found`:
  **Node.js wasn't installed on the Mac**. Sent him to nodejs.org LTS pkg,
  restart Terminal, `node --version`, then `npm install && npm run web`,
  Chrome at localhost:8081.

## Open thread when this log was written

- Winston was installing Node and about to make his first real playtest in
  Chrome. No feedback received yet. Expect tuning work next (see
  HANDOFF.md §6) and possibly more "walk me through it" terminal support.
