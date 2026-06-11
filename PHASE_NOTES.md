# Phase Notes

## Phase 1 — Core day loop

### What was built
- Expo (SDK 56) managed-workflow app, TypeScript strict, portrait-only.
- Day cycle: **Morning** wet market (daily fluctuating prices, grade A/B/C with
  per-grade shelf life) → **Service** (customers on a patience timer; player
  assembles broth/noodles/protein/garnish from purchased lots) → **Evening**
  settlement (takings, costs, reputation change) → save & sleep.
- Resources: cash (VND, dot thousands separators), reputation 0–100 (drives
  customer volume), stamina (drains per bowl; low stamina causes fumbled
  bowls), perishable lot-based inventory (spoils after N days by grade,
  freshness decays daily and feeds dish quality).
- Engine maths (`/src/engine`) is pure functions, fully unit-tested: market
  pricing (seeded, deterministic per save — no reroll on reload), spoilage,
  bowl quality/satisfaction/tips, mistake chance, customer volume,
  end-of-day reputation and settlement.
- State in Zustand (`/src/state/gameStore.ts`). Saves in expo-sqlite behind a
  `Persistence` bridge so game logic runs headless in tests; settings go to
  AsyncStorage. Single save slot, versioned JSON payload.
- All tunables and content in `/src/content/*.json`; brand name in
  `/src/config/brand.ts`; all strings through i18next (English complete,
  Vietnamese scaffold with per-key fallback).

### Acceptance criteria
- Playable day loop on the street cart: ✅ (market → service → evening → next day)
- Save/load works: ✅ (round-trip covered by `gameStore.test.ts`)
- Ten consecutive in-game days without crash: ✅ (headless store simulation test)
- Cash and reputation maths verified by unit tests: ✅ (27 tests)

### Known issues
- Stamina currently only recovers by sleeping; no mid-day recovery item yet.
- Single dish (Phở Bò) as per Tier 1 design; dish unlocks arrive with tiers.
- Customer patience is a flat config value; later tiers should vary by persona.

### How to run
```bash
npm install
npm start          # Expo dev server; scan QR with Expo Go (iOS/Android)
npm test           # jest unit tests
npm run typecheck  # tsc --noEmit
```
