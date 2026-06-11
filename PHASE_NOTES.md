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

## Phase 2 — Characters and cards

### What was built
- Single `CharacterDef` schema (`/src/engine/characters.ts`): id, name,
  nickname, faction (9 factions), rarity (5 tiers), stats
  (power/charm/hustle/loyalty 1–10), ability rules text, flavour text,
  artwork slot (63×88 aspect), unlock condition (tier or event reference).
  Includes a `validateCharacter` checker used by tests.
- 24 launch characters in `/src/content/characters.json` spanning every
  faction and rarity — including the brief's seeds: Minh "The Hammer"
  (feeds-his-mother enforcer), Mr Phúc the rent-radar landlord, Chef Bảo who
  quits over garnish, Quang the noodle-obsessed critic, and Auntie Chín the
  quiet investor with deep pockets and deeper conditions.
- Card Viewer screen: collection grid (silhouettes for unmet characters) and
  a tap-to-zoom large card. The card component renders at the physical 63:88
  ratio and is the design reference for print; original frame and iconography.
- Collection state lives in the store and persists in the save payload
  (backwards-compatible optional field). Tier-gated characters join the
  collection automatically each morning; event unlocks land with Phase 3.
- Export tool: `npm run export-cards` writes `dist/cards/cards.json`,
  `print-manifest.json` (card size, bleed, counts) and `cards.csv` for proofing.

### Known issues
- Character ability/flavour text is English-only in the content file; card
  text localisation needs per-locale content variants (planned with vi pass).
- Placeholder art: cards render an initial monogram; artworkSlot paths are
  reserved for the designer handoff.

### How to run
```bash
npm run export-cards   # emits dist/cards/ for the card designer
```
