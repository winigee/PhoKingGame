import { characters } from '../../content';
import { FACTIONS, RARITIES, unlockedByTier, validateCharacter } from '../characters';

describe('launch character roster', () => {
  it('has at least 24 characters with unique ids', () => {
    expect(characters.length).toBeGreaterThanOrEqual(24);
    expect(new Set(characters.map((c) => c.id)).size).toBe(characters.length);
  });

  it('every character passes schema validation', () => {
    const problems = characters.flatMap(validateCharacter);
    expect(problems).toEqual([]);
  });

  it('covers every faction and every rarity', () => {
    const factions = new Set(characters.map((c) => c.faction));
    const rarities = new Set(characters.map((c) => c.rarity));
    expect([...FACTIONS].every((f) => factions.has(f))).toBe(true);
    expect([...RARITIES].every((r) => rarities.has(r))).toBe(true);
  });

  it('artwork slots are unique file refs', () => {
    const slots = characters.map((c) => c.artworkSlot);
    expect(new Set(slots).size).toBe(slots.length);
    for (const slot of slots) expect(slot).toMatch(/^art\/characters\/[a-z0-9_]+\.png$/);
  });
});

describe('unlockedByTier', () => {
  it('grows monotonically with tier and excludes event unlocks', () => {
    let previous = 0;
    for (let tier = 1; tier <= 6; tier++) {
      const unlocked = unlockedByTier(characters, tier);
      expect(unlocked.length).toBeGreaterThanOrEqual(previous);
      previous = unlocked.length;
      for (const c of unlocked) expect(c.unlockCondition.type).toBe('tier');
    }
    expect(unlockedByTier(characters, 1).length).toBeGreaterThan(0);
  });
});
