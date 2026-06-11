/**
 * Data-driven event engine. Event definitions live in /src/content/events.json;
 * everything here is pure functions over that data.
 */
import { pickWeighted } from './rng';

export interface EventRequirement {
  minCash?: number;
  minReputation?: number;
  /** Requires a named character's disposition at or above a value. */
  minDisposition?: { characterId: string; value: number };
}

export interface EventEffects {
  cash?: number;
  reputation?: number;
  stamina?: number;
  /** Disposition deltas by character id. */
  dispositions?: Record<string, number>;
  /** Characters who join the collection. */
  collect?: string[];
  /** Story flags to set (e.g. secret_broth). */
  setFlags?: string[];
  /** Critic visits survived (+1 on success) — Michelin gate. */
  critics?: number;
  /** Equity percentage handed to investors; lowers endgame score. */
  equity?: number;
}

export interface EventChoice {
  id: string;
  textKey: string;
  resultKey: string;
  requirement?: EventRequirement;
  effects: EventEffects;
}

export interface GameEventDef {
  id: string;
  titleKey: string;
  bodyKey: string;
  /** Featured character, shown with the event. */
  characterId?: string;
  minTier: number;
  maxTier: number;
  weight: number;
  /** Fires at most once per playthrough. */
  once?: boolean;
  /** Only eligible while this flag is set. */
  requiresFlag?: string;
  choices: EventChoice[];
}

export interface EventContext {
  tier: number;
  cash: number;
  reputation: number;
  dispositions: Record<string, number>;
  flags: string[];
  firedEvents: string[];
}

export function eligibleEvents(defs: GameEventDef[], ctx: EventContext): GameEventDef[] {
  return defs.filter(
    (e) =>
      ctx.tier >= e.minTier &&
      ctx.tier <= e.maxTier &&
      (!e.once || !ctx.firedEvents.includes(e.id)) &&
      (!e.requiresFlag || ctx.flags.includes(e.requiresFlag)) &&
      e.choices.some((c) => choiceAvailable(c, ctx))
  );
}

/** Picks tonight's event, or undefined when none is eligible. */
export function selectEvent(
  defs: GameEventDef[],
  ctx: EventContext,
  roll: number
): GameEventDef | undefined {
  return pickWeighted(eligibleEvents(defs, ctx), (e) => e.weight, roll);
}

export function choiceAvailable(choice: EventChoice, ctx: EventContext): boolean {
  const req = choice.requirement;
  if (!req) return true;
  if (req.minCash !== undefined && ctx.cash < req.minCash) return false;
  if (req.minReputation !== undefined && ctx.reputation < req.minReputation) return false;
  if (req.minDisposition) {
    const d = ctx.dispositions[req.minDisposition.characterId] ?? DEFAULT_DISPOSITION;
    if (d < req.minDisposition.value) return false;
  }
  return true;
}

export const DEFAULT_DISPOSITION = 50;

export interface EffectTarget {
  cash: number;
  reputation: number;
  stamina: number;
  dispositions: Record<string, number>;
  collected: string[];
  flags: string[];
  criticsSurvived: number;
  equityGiven: number;
}

/** Applies choice effects immutably, clamping reputation 0..100 and dispositions 0..100. */
export function applyEffects(state: EffectTarget, effects: EventEffects): EffectTarget {
  const dispositions = { ...state.dispositions };
  for (const [id, delta] of Object.entries(effects.dispositions ?? {})) {
    dispositions[id] = clamp(0, 100, (dispositions[id] ?? DEFAULT_DISPOSITION) + delta);
  }
  return {
    cash: state.cash + (effects.cash ?? 0),
    reputation: clamp(0, 100, state.reputation + (effects.reputation ?? 0)),
    stamina: Math.max(0, state.stamina + (effects.stamina ?? 0)),
    dispositions,
    collected: [...new Set([...state.collected, ...(effects.collect ?? [])])],
    flags: [...new Set([...state.flags, ...(effects.setFlags ?? [])])],
    criticsSurvived: state.criticsSurvived + (effects.critics ?? 0),
    equityGiven: clamp(0, 100, state.equityGiven + (effects.equity ?? 0)),
  };
}

function clamp(lo: number, hi: number, n: number): number {
  return Math.max(lo, Math.min(hi, n));
}
