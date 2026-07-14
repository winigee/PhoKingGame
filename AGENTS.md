# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v56.0.0/ before writing any code.

# Project context — START HERE

New to this repo (or a fresh Claude session)? Read, in order:

1. `HANDOFF.md` — current state, architecture, decisions, gotchas, roadmap
2. `docs/PROJECT_BRIEF.md` — the original specification (the contract)
3. `PHASE_NOTES.md` — per-phase deliverables and known issues
4. `docs/SESSION_LOG.md` — condensed history of how we got here

# Working rules (from the brief; non-negotiable)

- TypeScript strict; no `any`. Component files under 200 lines; extract hooks.
- ALL game content in JSON under `/src/content` — never hard-coded in components.
- All user-facing strings through i18next (`/src/i18n`); brand name only via
  `BRAND_NAME` in `/src/config/brand.ts`.
- Economy/progression maths = pure functions in `/src/engine` with jest tests.
- Commit per feature. Before pushing: `npm test && npm run typecheck`, and
  verify bundling with `npx expo export --platform web` when UI changed.
- Game text stays cheeky but never explicit; no profanity.
