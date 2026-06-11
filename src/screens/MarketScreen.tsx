import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useShallow } from 'zustand/react/shallow';
import { HudBar } from '../components/HudBar';
import { MarketRow } from '../components/MarketRow';
import { PrimaryButton } from '../components/PrimaryButton';
import { colors, spacing } from '../config/theme';
import { ingredients } from '../content';
import { useGameStore } from '../state/gameStore';

export function MarketScreen() {
  const { t } = useTranslation();
  const { spoiledToday, openForService, setCardViewerOpen } = useGameStore(
    useShallow((s) => ({
      spoiledToday: s.spoiledToday,
      openForService: s.openForService,
      setCardViewerOpen: s.setCardViewerOpen,
    }))
  );

  return (
    <View style={styles.container}>
      <HudBar />
      <ScrollView contentContainerStyle={styles.list}>
        <Text style={styles.title}>{t('market.title')}</Text>
        <Text style={styles.subtitle}>{t('market.subtitle')}</Text>
        {spoiledToday.length > 0 && (
          <Text style={styles.spoiled}>
            {t('market.spoiledOvernight', {
              items: spoiledToday.map((id) => t(`ingredient.${id}`)).join(', '),
            })}
          </Text>
        )}
        {ingredients.map((ingredient) => (
          <MarketRow key={ingredient.id} ingredient={ingredient} />
        ))}
      </ScrollView>
      <View style={styles.footer}>
        <PrimaryButton label={t('market.openCart')} onPress={openForService} />
        <PrimaryButton label={t('cards.title')} onPress={() => setCardViewerOpen(true)} variant="ghost" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  list: { padding: spacing.l, paddingBottom: spacing.xl },
  title: { fontSize: 24, fontWeight: '900', color: colors.ink },
  subtitle: { fontSize: 14, color: colors.inkSoft, marginBottom: spacing.m },
  spoiled: {
    color: colors.bad,
    backgroundColor: '#FBEAE5',
    padding: spacing.m,
    borderRadius: 8,
    marginBottom: spacing.m,
  },
  footer: { padding: spacing.l, borderTopWidth: 1, borderTopColor: colors.line },
});
