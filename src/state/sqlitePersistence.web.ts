/**
 * Web build of the save system. Metro picks this file over
 * sqlitePersistence.ts when bundling for the browser, where expo-sqlite is
 * unavailable; saves go to AsyncStorage (localStorage) instead.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Persistence, SaveGame } from './saveTypes';

const KEY = 'phoking.save.slot1';

export const sqlitePersistence: Persistence = {
  async save(game: SaveGame): Promise<void> {
    await AsyncStorage.setItem(KEY, JSON.stringify(game));
  },

  async load(): Promise<SaveGame | null> {
    try {
      const raw = await AsyncStorage.getItem(KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as SaveGame;
      return parsed.version === 1 ? parsed : null;
    } catch {
      return null;
    }
  },

  async clear(): Promise<void> {
    await AsyncStorage.removeItem(KEY);
  },
};
