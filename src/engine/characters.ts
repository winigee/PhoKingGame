/**
 * Character/card schema. Every character in the game is one of these; the
 * same data drives the in-game Card Viewer and the physical card export
 * (npm run export-cards). Card aspect ratio is the standard 63x88mm.
 */

export const CARD_SIZE_MM = { width: 63, height: 88 } as const;
export const CARD_ASPECT_RATIO = CARD_SIZE_MM.width / CARD_SIZE_MM.height;

export const FACTIONS = [
  'GANG',
  'LANDLORD',
  'STAFF',
  'CHEF',
  'INVESTOR',
  'ALLY',
  'CRITIC',
  'OFFICIAL',
  'FAMILY',
] as const;
export type Faction = (typeof FACTIONS)[number];

export const RARITIES = ['COMMON', 'UNCOMMON', 'RARE', 'EPIC', 'LEGENDARY'] as const;
export type Rarity = (typeof RARITIES)[number];

export interface CharacterStats {
  power: number;
  charm: number;
  hustle: number;
  loyalty: number;
}

export type UnlockCondition =
  | { type: 'tier'; tier: number }
  | { type: 'event'; eventId: string };

export interface CharacterDef {
  id: string;
  name: string;
  nickname: string;
  faction: Faction;
  rarity: Rarity;
  stats: CharacterStats;
  /** Short rules text describing their in-game effect. */
  ability: string;
  /** One line of personality. */
  flavourText: string;
  /** Art file reference; placeholder until final art lands. */
  artworkSlot: string;
  unlockCondition: UnlockCondition;
}

const STAT_KEYS: (keyof CharacterStats)[] = ['power', 'charm', 'hustle', 'loyalty'];

/** Returns a list of problems with a character record; empty means valid. */
export function validateCharacter(c: CharacterDef): string[] {
  const problems: string[] = [];
  if (!c.id || !/^[a-z0-9_]+$/.test(c.id)) problems.push(`bad id: ${c.id}`);
  if (!c.name) problems.push(`${c.id}: missing name`);
  if (!FACTIONS.includes(c.faction)) problems.push(`${c.id}: bad faction ${c.faction}`);
  if (!RARITIES.includes(c.rarity)) problems.push(`${c.id}: bad rarity ${c.rarity}`);
  for (const key of STAT_KEYS) {
    const v = c.stats?.[key];
    if (!Number.isInteger(v) || v < 1 || v > 10) problems.push(`${c.id}: stat ${key}=${v}`);
  }
  if (!c.ability) problems.push(`${c.id}: missing ability`);
  if (!c.flavourText) problems.push(`${c.id}: missing flavourText`);
  if (!c.artworkSlot) problems.push(`${c.id}: missing artworkSlot`);
  const u = c.unlockCondition;
  if (!u || (u.type === 'tier' && (u.tier < 1 || u.tier > 6)) || (u.type === 'event' && !u.eventId)) {
    problems.push(`${c.id}: bad unlockCondition`);
  }
  return problems;
}

/** Characters unlocked purely by reaching a tier (event unlocks come from the event engine). */
export function unlockedByTier(all: CharacterDef[], tier: number): CharacterDef[] {
  return all.filter((c) => c.unlockCondition.type === 'tier' && c.unlockCondition.tier <= tier);
}
