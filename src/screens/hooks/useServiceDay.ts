import { useCallback, useEffect, useMemo, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { dishes, gameConfig, ingredientsById } from '../../content';
import { patienceMultiplier } from '../../engine/abilities';
import { freshness } from '../../engine/inventory';
import type { Grade, IngredientCategory } from '../../engine/types';
import { useGameStore, type ServeResult } from '../../state/gameStore';

const TICK_MS = 200;

export interface ServeOption {
  ingredientId: string;
  grade: Grade;
  servings: number;
  freshness: number;
}

export type Picks = Partial<Record<IngredientCategory, { ingredientId: string; grade: Grade }>>;

/**
 * Runs one service shift: customers queue up one at a time with a patience
 * timer; the player picks a lot per dish component and serves. All economy
 * maths stays in the store/engine — this hook only orchestrates timing.
 */
export function useServiceDay() {
  const dish = dishes[0];
  const { lots, day, customersToday, ledger, collected, serveBowl, customerWalked, closeService } =
    useGameStore(
      useShallow((s) => ({
        lots: s.lots,
        day: s.day,
        customersToday: s.customersToday,
        ledger: s.ledger,
        collected: s.collected,
        serveBowl: s.serveBowl,
        customerWalked: s.customerWalked,
        closeService: s.closeService,
      }))
    );

  const visits = ledger.served + ledger.walkedAway;
  const queueDone = visits >= customersToday;
  const patienceWindow = gameConfig.patienceSeconds * patienceMultiplier(collected);

  const [patienceLeft, setPatienceLeft] = useState(patienceWindow);
  const [picks, setPicks] = useState<Picks>({});
  const [lastResult, setLastResult] = useState<ServeResult | null>(null);

  // Patience countdown while a customer is waiting.
  useEffect(() => {
    if (queueDone) return;
    const id = setInterval(() => setPatienceLeft((p) => Math.max(0, p - TICK_MS / 1000)), TICK_MS);
    return () => clearInterval(id);
  }, [queueDone, visits]);

  // Patience ran out: the customer walks, the next one steps up.
  useEffect(() => {
    if (queueDone || patienceLeft > 0) return;
    customerWalked();
    setPicks({});
    setPatienceLeft(patienceWindow);
  }, [patienceLeft, queueDone, customerWalked, patienceWindow]);

  /** Available lots per dish component, grouped by ingredient and grade. */
  const optionsByCategory = useMemo(() => {
    const map = new Map<IngredientCategory, ServeOption[]>();
    for (const category of dish.components) map.set(category, []);
    for (const lot of lots) {
      const def = ingredientsById[lot.ingredientId];
      const group = def && map.get(def.category);
      if (!group) continue;
      const existing = group.find(
        (o) => o.ingredientId === lot.ingredientId && o.grade === lot.grade
      );
      if (existing) {
        existing.servings += lot.servings;
        existing.freshness = Math.max(existing.freshness, freshness(lot, day, def));
      } else {
        group.push({
          ingredientId: lot.ingredientId,
          grade: lot.grade,
          servings: lot.servings,
          freshness: freshness(lot, day, def),
        });
      }
    }
    return map;
  }, [lots, day, dish.components]);

  const pick = useCallback((category: IngredientCategory, option: ServeOption) => {
    setPicks((p) => ({ ...p, [category]: { ingredientId: option.ingredientId, grade: option.grade } }));
  }, []);

  const canServe = dish.components.every((c) => picks[c] !== undefined);

  const serve = useCallback(() => {
    if (!canServe) return;
    const ordered = dish.components.map((c) => picks[c]!);
    const speed = patienceLeft / patienceWindow;
    setLastResult(serveBowl(ordered, speed));
    setPicks({});
    setPatienceLeft(patienceWindow);
  }, [canServe, dish.components, picks, patienceLeft, serveBowl, patienceWindow]);

  return {
    dish,
    customersToday,
    visits,
    queueDone,
    patienceFraction: patienceLeft / patienceWindow,
    optionsByCategory,
    picks,
    pick,
    canServe,
    serve,
    lastResult,
    closeService,
  };
}
