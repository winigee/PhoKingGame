import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors, spacing } from '../config/theme';
import { formatVND } from '../engine/money';
import { totalServings } from '../engine/inventory';
import type { Grade, IngredientDef } from '../engine/types';
import { useGameStore } from '../state/gameStore';

const GRADES: Grade[] = ['A', 'B', 'C'];

/** One ingredient in the wet market: name, stock, and a buy button per grade. */
export function MarketRow({ ingredient }: { ingredient: IngredientDef }) {
  const { t } = useTranslation();
  const cash = useGameStore((s) => s.cash);
  const buyBatch = useGameStore((s) => s.buyBatch);
  const stock = useGameStore((s) => totalServings(s.lots, ingredient.id));
  const entry = useGameStore((s) => s.market.find((m) => m.ingredientId === ingredient.id));
  if (!entry) return null;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.name}>{t(ingredient.nameKey)}</Text>
        {stock > 0 && <Text style={styles.stock}>{t('market.inStock', { count: stock })}</Text>}
      </View>
      <View style={styles.grades}>
        {GRADES.map((grade) => {
          const price = entry.prices[grade];
          const affordable = cash >= price;
          return (
            <Pressable
              key={grade}
              style={[styles.gradeButton, !affordable && styles.gradeDisabled]}
              disabled={!affordable}
              onPress={() => buyBatch(ingredient.id, grade)}
            >
              <Text style={styles.gradeLabel}>{t('market.grade', { grade })}</Text>
              <Text style={styles.price}>{formatVND(price)}</Text>
              <Text style={styles.life}>{t('market.shelfLife', { days: ingredient.shelfLife[grade] })}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: spacing.m,
    marginBottom: spacing.m,
    borderWidth: 1,
    borderColor: colors.line,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.s },
  name: { fontSize: 16, fontWeight: '700', color: colors.ink },
  stock: { fontSize: 12, color: colors.good },
  grades: { flexDirection: 'row', gap: spacing.s },
  gradeButton: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: spacing.s,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.line,
  },
  gradeDisabled: { opacity: 0.4 },
  gradeLabel: { fontSize: 13, fontWeight: '800', color: colors.accent },
  price: { fontSize: 13, color: colors.ink, marginTop: 2 },
  life: { fontSize: 11, color: colors.inkSoft, marginTop: 2 },
});
