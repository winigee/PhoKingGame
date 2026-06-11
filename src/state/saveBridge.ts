import type { Persistence, SaveGame } from './saveTypes';

/**
 * The store talks to persistence through this bridge so the game logic can
 * run (and be tested) without expo-sqlite. App start registers the SQLite
 * implementation; tests register an in-memory one.
 */
let impl: Persistence = {
  save: async (_game: SaveGame) => undefined,
  load: async () => null,
  clear: async () => undefined,
};

export function setPersistence(persistence: Persistence): void {
  impl = persistence;
}

export function getPersistence(): Persistence {
  return impl;
}
