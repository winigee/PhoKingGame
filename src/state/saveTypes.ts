import type { EmpireState } from '../engine/empire';
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
  /** Phase 3 fields; all optional so earlier saves keep loading. */
  dispositions?: Record<string, number>;
  flags?: string[];
  firedEvents?: string[];
  criticsSurvived?: number;
  equityGiven?: number;
  empire?: EmpireState;
  prestigeBonus?: number;
}

export interface Persistence {
  save(game: SaveGame): Promise<void>;
  load(): Promise<SaveGame | null>;
  clear(): Promise<void>;
}
