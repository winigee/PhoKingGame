/** XP earned by playing; the shop preview converts it into discount quotes. */
export function xpForProgress(lifetimeServed: number, reputation: number): number {
  return lifetimeServed * 10 + reputation * 20;
}
