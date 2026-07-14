# Project Brief: Pho King Life (original, verbatim)

A mobile-first tycoon/management sim in React Native. Build in phases; do not
start a later phase until the earlier phase compiles, runs, and passes its
acceptance criteria.

## 1. Concept

Pho King Life follows a boy in Ho Chi Minh City who grafts his way from street
food beginner to global noodle magnate. The player manages money, ingredients,
staff, reputation and relationships. Progression runs through six tiers:

- Tier 1: Street cart (one dish, cash only, dodging trouble)
- Tier 2: Pavement stall (regulars, first employee)
- Tier 3: Shophouse eatery (lease, landlord, kitchen staff)
- Tier 4: Restaurant (chef hierarchy, critics, investors)
- Tier 5: Michelin star (quality systems, press, expansion capital)
- Tier 6: Global empire: Pho King instant noodles (brand licensing,
  distribution, endgame)

Tone: warm, funny, streetwise. The title's pun is intentional; keep written
content cheeky but never explicit. No profanity in game text.

## 2. Tech stack and architecture

- React Native with Expo (managed workflow), TypeScript strict mode.
- State: Zustand. Persistence: expo-sqlite for save games; AsyncStorage for
  settings.
- No backend in Phases 1 to 4. All commerce and account features sit behind a
  TypeScript interface with a mock implementation (see Section 7).
- All game content (characters, events, items, dialogue, level thresholds,
  prices) lives in JSON data files under /src/content. No content hard-coded
  in components. This is non-negotiable; the card game and localisation
  depend on it.
- Brand name is a config constant (BRAND_NAME in /src/config/brand.ts), not a
  string literal scattered through the code. Default "Pho King".
- Localisation scaffold from day one: all strings through an i18n layer
  (i18next). Ship English; structure for Vietnamese.
- Target devices: iOS and Android phones, portrait orientation, offline-first.

## 3. Core loop (Phase 1)

Day cycle:
- Morning: buy ingredients at the wet market (prices fluctuate daily; quality
  grades A/B/C affect dish quality and spoilage).
- Service: customers arrive on a timer; player assembles bowls (broth,
  noodles, protein, garnish) against simple timing/selection mechanics; speed
  and ingredient quality drive satisfaction.
- Evening: count takings, pay costs, review reputation change, save.

Core resources: Cash (VND, thousands separators), Reputation (0 to 100,
drives customer volume and unlock gates), Stamina (depletes through the day;
poor stamina causes mistakes), Ingredient inventory (perishable; spoils after
N days by grade).

Acceptance criteria Phase 1: playable day loop on a simulated street cart;
save/load works; ten consecutive in-game days without crash; cash and
reputation maths verified by unit tests.

## 4. Characters and the card schema (Phase 2)

Every character is an instance of a single Character schema designed for
later export as physical trading cards. Schema fields: id, name, nickname,
faction (GANG | LANDLORD | STAFF | CHEF | INVESTOR | ALLY | CRITIC |
OFFICIAL | FAMILY), rarity (COMMON | UNCOMMON | RARE | EPIC | LEGENDARY),
stats (power, charm, hustle, loyalty, each 1 to 10), ability (short rules
text), flavourText (one line), artworkSlot (file reference, 63x88 aspect),
unlockCondition (tier or event reference).

Write 24 launch characters minimum, spread across factions and rarities.
Build a Card Viewer screen in-game. Export tool: npm run export-cards emits
all character data as JSON plus a print-ready manifest.

## 5. Events, antagonists and allies (Phase 3)

Event engine: data-driven random and triggered events with weighted
probability by tier; each event offers 2 to 4 choices with stat/resource
consequences. Seed events: gang shakedown, landlord rent hike/eviction,
employee theft or no-show, chef walkout before a critic's visit, health
inspector visit, investor pitches (equity affects endgame score), rival
undercutting.

Relationship system: characters hold a disposition score toward the player;
choices move it; high disposition unlocks abilities (discounts, protection,
capital, skills training).

Acceptance criteria Phase 3: 20+ events live; relationship effects
measurable; a player can reach Tier 4 in roughly 60 to 90 minutes of play.

## 6. Progression and endgame

Tier gates combine cash, reputation and named-character relationships (e.g.
Tier 4 requires one INVESTOR at disposition 70+). Michelin star at Tier 5
requires sustained dish quality, a trained chef roster and surviving two
critic events. Tier 6 converts the playthrough into an empire dashboard:
factories, markets, brand value; light idle mechanics; prestige loop allowing
restart with permanent bonuses.

## 7. Commerce layer: interface only (Phase 4)

Do not build payments, ordering or fulfilment. Define and mock
CommerceProvider (getCatalogue, getDiscountForXP, redeemXP, placeOrder).
Ship MockCommerceProvider returning canned data behind a feature flag
(COMMERCE_ENABLED=false by default). UI: a "Pho King Shop" screen that
renders the catalogue and shows XP-to-discount conversion, clearly labelled
as preview. No real prices, no payment UI, no personal data collection. The
real provider arrives later and must slot in without UI changes.

## 8. Out of scope

No multiplayer. No ads. No in-app purchases. No analytics SDKs. No user
accounts. No real commerce. No copyrighted characters or assets; all art
placeholder or original. Do not imitate Pokemon trade dress in the card
designs; original frame, layout and iconography only.

## 9. Working rules

TypeScript strict; no `any`. Component files under 200 lines; extract hooks.
Economy and progression maths in pure functions with tests. Commit per
feature. At the end of each phase, produce a short PHASE_NOTES.md stating
what was built, known issues and how to run it.
