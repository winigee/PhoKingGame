import * as SQLite from 'expo-sqlite';
import type { Persistence, SaveGame } from './saveTypes';

const DB_NAME = 'phoking.db';
const SLOT = 1;

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

async function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (!dbPromise) {
    dbPromise = (async () => {
      const db = await SQLite.openDatabaseAsync(DB_NAME);
      await db.execAsync(
        `CREATE TABLE IF NOT EXISTS saves (
          slot INTEGER PRIMARY KEY,
          payload TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );`
      );
      return db;
    })();
  }
  return dbPromise;
}

export const sqlitePersistence: Persistence = {
  async save(game: SaveGame): Promise<void> {
    const db = await getDb();
    await db.runAsync(
      'INSERT OR REPLACE INTO saves (slot, payload, updated_at) VALUES (?, ?, ?)',
      SLOT,
      JSON.stringify(game),
      new Date().toISOString()
    );
  },

  async load(): Promise<SaveGame | null> {
    const db = await getDb();
    const row = await db.getFirstAsync<{ payload: string }>(
      'SELECT payload FROM saves WHERE slot = ?',
      SLOT
    );
    if (!row) return null;
    try {
      const parsed = JSON.parse(row.payload) as SaveGame;
      return parsed.version === 1 ? parsed : null;
    } catch {
      return null;
    }
  },

  async clear(): Promise<void> {
    const db = await getDb();
    await db.runAsync('DELETE FROM saves WHERE slot = ?', SLOT);
  },
};
