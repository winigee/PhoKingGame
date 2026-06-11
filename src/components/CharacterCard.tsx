import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors } from '../config/theme';
import { CARD_ASPECT_RATIO, type CharacterDef, type Rarity } from '../engine/characters';

const RARITY_COLOR: Record<Rarity, string> = {
  COMMON: '#8D8D8D',
  UNCOMMON: '#3E8E5A',
  RARE: '#2E6FB7',
  EPIC: '#7B4FB0',
  LEGENDARY: '#C9A227',
};

interface Props {
  character: CharacterDef;
  /** Uncollected cards render as silhouettes. */
  collected: boolean;
  /** Larger layout for the detail view. */
  large?: boolean;
}

/**
 * Renders a character as a trading card at the physical 63x88 aspect ratio.
 * This component doubles as the design reference for the printed cards:
 * original frame and iconography only.
 */
export function CharacterCard({ character, collected, large }: Props) {
  const { t } = useTranslation();
  const rarityColor = RARITY_COLOR[character.rarity];
  if (!collected) {
    return (
      <View style={[styles.card, styles.cardLocked]}>
        <Text style={[styles.lockedMark, large && styles.lockedMarkLarge]}>?</Text>
        <Text style={styles.lockedLabel}>{t('cards.locked')}</Text>
      </View>
    );
  }
  return (
    <View style={[styles.card, { borderColor: rarityColor }]}>
      <View style={[styles.header, { backgroundColor: rarityColor }]}>
        <Text style={[styles.name, large && styles.nameLarge]} numberOfLines={1}>
          {character.name}
        </Text>
        <Text style={styles.faction}>{t(`faction.${character.faction}`)}</Text>
      </View>
      <View style={styles.art}>
        <Text style={[styles.artInitial, large && styles.artInitialLarge]}>
          {character.name.charAt(0)}
        </Text>
        <Text style={styles.nickname} numberOfLines={1}>
          “{character.nickname}”
        </Text>
      </View>
      <View style={styles.statsRow}>
        <Stat label={t('cards.stat.power')} value={character.stats.power} />
        <Stat label={t('cards.stat.charm')} value={character.stats.charm} />
        <Stat label={t('cards.stat.hustle')} value={character.stats.hustle} />
        <Stat label={t('cards.stat.loyalty')} value={character.stats.loyalty} />
      </View>
      <View style={styles.body}>
        <Text style={[styles.ability, large && styles.abilityLarge]} numberOfLines={large ? 0 : 3}>
          {character.ability}
        </Text>
        {large && <Text style={styles.flavour}>{character.flavourText}</Text>}
      </View>
      <View style={[styles.footer, { backgroundColor: rarityColor }]}>
        <Text style={styles.rarity}>{t(`rarity.${character.rarity}`)}</Text>
      </View>
    </View>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    aspectRatio: CARD_ASPECT_RATIO,
    width: '100%',
    backgroundColor: colors.card,
    borderRadius: 10,
    borderWidth: 2,
    overflow: 'hidden',
  },
  cardLocked: {
    borderColor: colors.line,
    backgroundColor: '#EFE8DA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockedMark: { fontSize: 36, fontWeight: '900', color: colors.inkSoft },
  lockedMarkLarge: { fontSize: 72 },
  lockedLabel: { fontSize: 11, color: colors.inkSoft, marginTop: 4 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  name: { color: '#FFF', fontWeight: '900', fontSize: 13, flexShrink: 1 },
  nameLarge: { fontSize: 20 },
  faction: { color: '#FFF', fontSize: 9, fontWeight: '700', marginLeft: 4 },
  art: {
    flex: 1.2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  artInitial: { fontSize: 40, fontWeight: '900', color: colors.line },
  artInitialLarge: { fontSize: 88 },
  nickname: { fontSize: 11, fontStyle: 'italic', color: colors.inkSoft },
  statsRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.line,
  },
  stat: { flex: 1, alignItems: 'center', paddingVertical: 3 },
  statLabel: { fontSize: 8, color: colors.inkSoft },
  statValue: { fontSize: 13, fontWeight: '800', color: colors.ink },
  body: { flex: 1, padding: 6 },
  ability: { fontSize: 9, color: colors.ink },
  abilityLarge: { fontSize: 14 },
  flavour: { fontSize: 12, fontStyle: 'italic', color: colors.inkSoft, marginTop: 8 },
  footer: { paddingVertical: 2, alignItems: 'center' },
  rarity: { color: '#FFF', fontSize: 9, fontWeight: '800', letterSpacing: 1 },
});
