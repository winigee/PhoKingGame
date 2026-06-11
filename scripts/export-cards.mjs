#!/usr/bin/env node
/**
 * Card export tool: npm run export-cards
 *
 * Emits everything a card designer needs into dist/cards/:
 *   cards.json          full character data (the single source of truth)
 *   print-manifest.json physical print spec: card size, bleed, counts by rarity/faction
 *   cards.csv           flat sheet for proofing copy
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = join(root, 'dist', 'cards');
const { characters } = JSON.parse(
  readFileSync(join(root, 'src', 'content', 'characters.json'), 'utf8')
);

mkdirSync(outDir, { recursive: true });

writeFileSync(join(outDir, 'cards.json'), JSON.stringify({ characters }, null, 2));

const countBy = (key) =>
  characters.reduce((acc, c) => ({ ...acc, [c[key]]: (acc[c[key]] ?? 0) + 1 }), {});

writeFileSync(
  join(outDir, 'print-manifest.json'),
  JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      cardSizeMm: { width: 63, height: 88 },
      bleedMm: 3,
      safeAreaMm: 2,
      artworkAspectRatio: '63:88',
      totalCards: characters.length,
      byRarity: countBy('rarity'),
      byFaction: countBy('faction'),
      notes:
        'Original frame, layout and iconography only — do not imitate existing trading card trade dress.',
    },
    null,
    2
  )
);

const esc = (s) => `"${String(s).replaceAll('"', '""')}"`;
const header = 'id,name,nickname,faction,rarity,power,charm,hustle,loyalty,ability,flavourText,artworkSlot,unlockCondition';
const rows = characters.map((c) =>
  [
    c.id,
    esc(c.name),
    esc(c.nickname),
    c.faction,
    c.rarity,
    c.stats.power,
    c.stats.charm,
    c.stats.hustle,
    c.stats.loyalty,
    esc(c.ability),
    esc(c.flavourText),
    c.artworkSlot,
    esc(JSON.stringify(c.unlockCondition)),
  ].join(',')
);
writeFileSync(join(outDir, 'cards.csv'), [header, ...rows].join('\n') + '\n');

console.log(`Exported ${characters.length} cards to ${outDir}`);
