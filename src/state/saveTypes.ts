import type { InventoryLot } from '../engine/types';

/** Serialised save payload. Bump version on breaking shape changes. */
export interface SaveGame {
  version: 1;
  seed: number;
  day: number;
  tier: number;
  cash: number;
  reputation: number;
  lots: InventoryLot[];
  /** Collected character card ids. Optional for pre-Phase-2 saves. */
  collected?: string[];
}

export interface Persistence {
  save(game: SaveGame): Promise<void>;
  load(): Promise<SaveGame | null>;
  clear(): Promise<void>;
}
