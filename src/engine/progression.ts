/**
 * Tier gates and the Michelin/endgame checks. Gate data lives in
 * /src/content/tiers.json.
 */
import type { CharacterDef, Faction } from './characters';
import { DEFAULT_DISPOSITION } from './events';

export interface RelationshipGate {
  /** Any character of this faction at the disposition, or... */
  faction?: Faction;
  /** ...one specific character. */
  characterId?: string;
  minDisposition: number;
}

export interface TierGate {
  tier: number;
  nameKey: string;
  cash: number;
  reputation: number;
  relationship?: RelationshipGate;
  /** Tier 6 additionally needs the Michelin star. */
  requiresMichelin?: boolean;
}

export interface ProgressionState {
  tier: number;
  cash: number;
  reputation: number;
  dispositions: Record<string, number>;
  collected: string[];
  criticsSurvived: number;
  flags: string[];
}

export const MICHELIN_FLAG = 'michelin_star';
/** Critic events survived to earn the star at Tier 5. */
export const MICHELIN_CRITICS_REQUIRED = 2;

export function relationshipMet(
  gate: RelationshipGate,
  state: ProgressionState,
  characters: CharacterDef[]
): boolean {
  const disposition = (id: string) => state.dispositions[id] ?? DEFAULT_DISPOSITION;
  if (gate.characterId) {
    return (
      state.collected.includes(gate.characterId) &&
      disposition(gate.characterId) >= gate.minDisposition
    );
  }
  if (gate.faction) {
    return characters.some(
      (c) =>
        c.faction === gate.faction &&
        state.collected.includes(c.id) &&
        disposition(c.id) >= gate.minDisposition
    );
  }
  return false;
}

/** The gate for the next tier if every condition is met, else undefined. */
export function nextTierGate(
  state: ProgressionState,
  gates: TierGate[],
  characters: CharacterDef[]
): TierGate | undefined {
  const gate = gates.find((g) => g.tier === state.tier + 1);
  if (!gate) return undefined;
  if (state.cash < gate.cash || state.reputation < gate.reputation) return undefined;
  if (gate.relationship && !relationshipMet(gate.relationship, state, characters)) return undefined;
  if (gate.requiresMichelin && !state.flags.includes(MICHELIN_FLAG)) return undefined;
  return gate;
}

/** At Tier 5, surviving enough critic visits earns the star. */
export function earnedMichelin(state: ProgressionState): boolean {
  return (
    state.tier >= 5 &&
    state.criticsSurvived >= MICHELIN_CRITICS_REQUIRED &&
    !state.flags.includes(MICHELIN_FLAG)
  );
}
