import React, { useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useShallow } from 'zustand/react/shallow';
import { CharacterCard } from '../components/CharacterCard';
import { PrimaryButton } from '../components/PrimaryButton';
import { colors, spacing } from '../config/theme';
import { characters } from '../content';
import type { CharacterDef } from '../engine/characters';
import { useGameStore } from '../state/gameStore';

/**
 * The player's collection rendered as trading cards. Doubles as the design
 * reference for the physical card set (see npm run export-cards).
 */
export function CardViewerScreen() {
  const { t } = useTranslation();
  const { collected, setCardViewerOpen } = useGameStore(
    useShallow((s) => ({ collected: s.collected, setCardViewerOpen: s.setCardViewerOpen }))
  );
  const [selected, setSelected] = useState<CharacterDef | null>(null);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('cards.title')}</Text>
        <Text style={styles.count}>
          {t('cards.collected', { have: collected.length, total: characters.length })}
        </Text>
      </View>
      <FlatList
        data={characters}
        keyExtractor={(c) => c.id}
        numColumns={3}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.grid}
        renderItem={({ item }) => (
          <Pressable style={styles.cell} onPress={() => setSelected(item)}>
            <CharacterCard character={item} collected={collected.includes(item.id)} />
          </Pressable>
        )}
      />
      <View style={styles.footer}>
        <PrimaryButton label={t('common.back')} onPress={() => setCardViewerOpen(false)} variant="ghost" />
      </View>

      <Modal visible={selected !== null} transparent animationType="fade">
        <Pressable style={styles.modalBackdrop} onPress={() => setSelected(null)}>
          <View style={styles.modalCard}>
            {selected && (
              <CharacterCard
                character={selected}
                collected={collected.includes(selected.id)}
                large
              />
            )}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    padding: spacing.l,
  },
  title: { fontSize: 24, fontWeight: '900', color: colors.ink },
  count: { fontSize: 14, color: colors.inkSoft },
  grid: { paddingHorizontal: spacing.m, paddingBottom: spacing.l },
  row: { gap: spacing.s, marginBottom: spacing.s },
  cell: { flex: 1 / 3 },
  footer: { padding: spacing.l, borderTopWidth: 1, borderTopColor: colors.line },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  modalCard: { width: '80%' },
});
