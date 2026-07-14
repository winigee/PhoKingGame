# HANDOFF — Pho King Life

**Read this first.** This document lets a new developer (human or Claude)
pick the project up with zero prior context. It captures the state of the
build, every decision that isn't obvious from the code, and what to do next.

Last updated: 2026-07-14 · Branch: `claude/pensive-hopper-5sc9wo` · All work
is committed and pushed; nothing lives outside this repo.

---

## 1. What this is

A mobile-first tycoon sim (React Native + Expo SDK 56, TypeScript strict):
street-cart phở vendor in Ho Chi Minh City grows into a global instant-noodle
empire. The full original specification is in `docs/PROJECT_BRIEF.md` — it is
the contract; re-read it before large changes.

**All four phases of the brief are built, tested and pushed:**

| Phase | Deliverable | Status |
|---|---|---|
| 1 | Core day loop (market → service → evening), SQLite saves, economy tests | ✅ done |
| 2 | Character/card system, 24-character roster, Card Viewer, export tool | ✅ done |
| 3 | Event engine (22 events), relationships, tier gates, Michelin, empire endgame | ✅ done |
| 4 | CommerceProvider interface + mock + flagged-off shop preview | ✅ done |

Detailed per-phase notes and known issues: `PHASE_NOTES.md`.
Device/browser distribution options: `DISTRIBUTION.md`.

**Verification state:** 63 jest tests green, `tsc --noEmit` clean, Metro
bundles verified for iOS, Android and web. **Nobody has playtested on a real
device yet** — pacing, patience timers and event frequency are tuned by
simulation only. Treat the current tuning as first-draft.

## 2. Commands

```bash
npm install
npm start            # Expo dev server (Expo Go on phone: scan QR)
npm run web          # run in a browser (Chrome) at localhost:8081
npm test             # 63 unit tests
npm run typecheck    # tsc --noEmit
npm run export-cards # emit dist/cards/ for the physical card designer
```

## 3. Architecture (and the rules that shaped it)

```
/src/engine    pure functions only — no React, no Expo imports. All maths
               (market prices, spoilage, satisfaction, reputation, events,
               progression, empire/prestige) lives here and is unit-tested.
/src/content   ALL game content as JSON: ingredients, dishes, characters,
               events, tier gates, shop catalogue, tuning constants.
               index.ts exposes typed accessors. NEVER hard-code content in
               components — the card export and localisation depend on this.
/src/state     gameStore.ts (Zustand) is the single game state machine.
               Phases: TITLE → MORNING → SERVICE → (EVENT) → EVENING →
               MORNING… and EMPIRE at tier 6. Persistence goes through
               saveBridge.ts (an injectable interface) so the store runs
               headless in tests. sqlitePersistence.ts is the native impl;
               sqlitePersistence.web.ts (AsyncStorage/localStorage) is
               swapped in automatically by Metro on web builds.
/src/screens   one component per phase + hooks/ for extracted logic
               (useServiceDay.ts owns all service-shift timing).
/src/components shared UI. Keep every component file under 200 lines.
/src/commerce  CommerceProvider interface, MockCommerceProvider, XP calc.
/src/config    brand.ts (BRAND_NAME — never inline the name), flags.ts
               (COMMERCE_ENABLED=false), theme.ts.
/src/i18n      i18next; en.json is complete (including all event prose),
               vi.json is a partial scaffold with per-key fallback to en.
scripts/       export-cards.mjs (plain node, no ts-node dependency).
```

Key non-obvious decisions:

- **Seeded determinism.** Market prices and daily RNG derive from
  `seed ^ hash(day)` (mulberry32 in `engine/rng.ts`) so reloading a save
  never rerolls prices. Keep new randomness on this pattern.
- **Save compatibility.** `SaveGame` (state/saveTypes.ts) stays at
  `version: 1`; every field added after Phase 1 is optional and defaulted on
  load (`?? fallback`). Follow that pattern or bump the version and migrate.
- **Relationships are measurable.** Ability hooks live in
  `engine/abilities.ts` (Sang −10% market prices, Tuấn +20% patience,
  secret-broth +10% quality, happy Chef Bảo +20% quality) and are consulted
  by the store/service hook. Add new character abilities there, pure.
- **Events are data.** `engine/events.ts` is generic; all 22 events are JSON
  in `content/events.json` with text keys resolving into `i18n/locales/en.json`.
  A test (`events.test.ts`) fails if any key is missing — keep it that way.
- **VND formatting** uses a non-breaking space before ₫, written as an
  explicit ` ` escape in code AND tests (an invisible-character
  mismatch already bit us once — don't "clean it up").
- **Zustand selectors:** always `useShallow` for object selectors, and never
  create closures inside the selector (render-loop hazard). Select stable
  action references directly.

## 4. Environment gotchas (for Claude Code cloud sessions)

- `npx expo install` cannot reach the Expo API from the sandbox — look up
  compatible versions in `node_modules/expo/bundledNativeModules.json` and
  `npm install` them directly.
- No `gh` CLI in cloud sessions; use the GitHub MCP tools.
- Playwright browser downloads are blocked by the network allowlist; jsdom
  works for smoke-testing the exported web bundle.
- Verify UI changes by bundling: `npx expo export --platform <ios|android|web>`.

## 5. Owner context (Winston, winstongreen@gmail.com)

- Uses a Mac (older macOS, bash shell) + Chrome; has an iPhone and access to
  a Galaxy phone. As of the last session Node.js was just installed on the
  Mac; Xcode status unknown.
- Current play path: **browser via `npm run web`** (verified working in a
  headless DOM; Winston is the first real-browser player).
- No Apple Developer account yet. Plan of record: playtest in
  browser/simulator now, sideload the Android APK (`eas build --platform
  android --profile preview`) for real-device feel, TestFlight later.
  `eas.json` is configured; no Expo account is wired into any environment.
- Winston is non-technical about dev tooling — walk him through terminal
  steps with short bullets, and diagnose from screenshots patiently.

## 6. What to do next (roadmap, in rough priority order)

1. **First real playtest support.** Winston is about to play in Chrome.
   Expect tuning requests: day pacing (~3–4 min/day target), patience
   window, event frequency (55%/day), tier gate costs.
2. **Balance pass from real play** — all knobs are in
   `content/gameConfig.json` and `content/tiers.json`; change data, not code.
3. **Known issues** (also in PHASE_NOTES.md): guaranteed critic-visit timer
   at Tier 5 (star currently luck-gated); XP spend ledger before real
   commerce; per-locale character/event content for the Vietnamese pass;
   mid-day stamina recovery item.
4. **Nice-to-haves sketched but unbuilt:** more dishes unlocking by tier,
   staff hiring as a system (currently events-only), sound, real art in the
   `artworkSlot` paths, settings screen (locale toggle exists in
   state/settings.ts but has no UI).

## 7. Handing this to a new Claude account/session

The repo is self-contained. In the new account:

1. Give the account access to `winigee/PhoKingGame` (GitHub → repo →
   Settings → Collaborators, or install the Claude GitHub app on it).
2. Start a session on branch `claude/pensive-hopper-5sc9wo` (or merge it to
   `main` first — it's the only branch with content).
3. Paste this as the first message:

> Read HANDOFF.md, docs/PROJECT_BRIEF.md and PHASE_NOTES.md in this repo,
> then confirm the test suite passes (npm install && npm test &&
> npm run typecheck). You are continuing this project exactly where the
> previous session left off — same working rules (see brief §9). My next
> goal is: [describe what you want].

`CLAUDE.md` in the repo root already points new Claude sessions at this
document automatically.
