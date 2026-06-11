/**
 * Concrete in-game hooks for character abilities. Each helper is pure; the
 * store and service hook consult these so relationship effects are
 * measurable in the economy.
 */
import { DEFAULT_DISPOSITION } from './events';

const disposition = (d: Record<string, number>, id: string) => d[id] ?? DEFAULT_DISPOSITION;

/** Sang "First Pick": disposition 60+ knocks 10% off market prices. */
export function marketPriceMultiplier(
  dispositions: Record<string, number>,
  collected: string[]
): number {
  return collected.includes('supplier_sang') && disposition(dispositions, 'supplier_sang') >= 60
    ? 0.9
    : 1;
}

/** Tuấn "Speedy": customers wait 20% longer once he's on the team. */
export function patienceMultiplier(collected: string[]): number {
  return collected.includes('tuan_speedy') ? 1.2 : 1;
}

/**
 * Dish quality multiplier: Grandma Yến's secret broth is permanent (+10%);
 * Chef Bảo adds +20% while kept happy (disposition 60+).
 */
export function qualityMultiplier(
  flags: string[],
  dispositions: Record<string, number>,
  collected: string[]
): number {
  let m = 1;
  if (flags.includes('secret_broth')) m *= 1.1;
  if (collected.includes('chef_bao') && disposition(dispositions, 'chef_bao') >= 60) m *= 1.2;
  return m;
}
