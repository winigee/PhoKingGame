# Pho King Life

A mobile-first tycoon/management sim: a boy in Ho Chi Minh City grafts his
way from street-cart phở beginner to global noodle magnate. React Native +
Expo (managed), TypeScript strict, offline-first, portrait.

## Quick start
```bash
npm install
npm start            # Expo dev server — scan the QR with Expo Go
npm test             # jest unit tests (engine, store, content, commerce)
npm run typecheck    # tsc --noEmit
npm run export-cards # emit dist/cards/ for the physical card designer
```

## Layout
- `/src/engine` — pure game maths (market, inventory, economy, events,
  progression, empire), fully unit-tested
- `/src/content` — ALL game content as JSON (ingredients, dishes, 24
  characters, 22 events, tier gates, shop catalogue, tuning)
- `/src/state` — Zustand store, SQLite saves, AsyncStorage settings
- `/src/screens`, `/src/components` — UI (components < 200 lines, hooks extracted)
- `/src/commerce` — CommerceProvider interface + mock (flagged off)
- `/src/config` — brand name, feature flags, theme
- `/src/i18n` — i18next; English complete, Vietnamese scaffold

See `PHASE_NOTES.md` for what each phase delivered and known issues.
