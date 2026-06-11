import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors, spacing } from '../config/theme';
import type { IngredientCategory } from '../engine/types';
import { ingredientsById } from '../content';
import type { Picks, ServeOption } from '../screens/hooks/useServiceDay';

interface Props {
  components: IngredientCategory[];
  optionsByCategory: Map<IngredientCategory, ServeOption[]>;
  picks: Picks;
  onPick: (category: IngredientCategory, option: ServeOption) => void;
}

/** Bowl assembly: one row per dish component, one chip per available lot. */
export function PickGrid({ components, optionsByCategory, picks, onPick }: Props) {
  const { t } = useTranslation();
  return (
    <View>
      {components.map((category) => {
        const options = optionsByCategory.get(category) ?? [];
        const picked = picks[category];
        return (
          <View key={category} style={styles.section}>
            <Text style={styles.category}>
              {t('service.pickComponent', { category: t(`service.category.${category}`) })}
            </Text>
            {options.length === 0 ? (
              <Text style={styles.empty}>{t('service.outOfStock')}</Text>
            ) : (
              <View style={styles.chips}>
                {options.map((option) => {
                  const selected =
                    picked?.ingredientId === option.ingredientId && picked?.grade === option.grade;
                  return (
                    <Pressable
                      key={`${option.ingredientId}-${option.grade}`}
                      style={[styles.chip, selected && styles.chipSelected]}
                      onPress={() => onPick(category, option)}
                    >
                      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
                        {t(ingredientsById[option.ingredientId].nameKey)} · {option.grade} ×
                        {option.servings}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginBottom: spacing.m },
  category: { fontSize: 13, fontWeight: '800', color: colors.inkSoft, marginBottom: spacing.xs },
  empty: { fontSize: 13, color: colors.bad, fontStyle: 'italic' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.s },
  chip: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 16,
    paddingVertical: spacing.s,
    paddingHorizontal: spacing.m,
  },
  chipSelected: { backgroundColor: colors.accent, borderColor: colors.accentDark },
  chipText: { fontSize: 13, color: colors.ink },
  chipTextSelected: { color: '#FFF', fontWeight: '700' },
});
