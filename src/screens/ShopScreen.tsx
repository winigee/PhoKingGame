import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useShallow } from 'zustand/react/shallow';
import { PrimaryButton } from '../components/PrimaryButton';
import { ShopProductRow } from '../components/ShopProductRow';
import { BRAND_NAME } from '../config/brand';
import { colors, spacing } from '../config/theme';
import { commerceProvider } from '../commerce/mockProvider';
import type { DiscountQuote, Product } from '../commerce/types';
import { xpForProgress } from '../commerce/xp';
import { useGameStore } from '../state/gameStore';

/**
 * "Pho King Shop" preview: renders the mock catalogue and the XP→discount
 * conversion. Clearly labelled preview; no prices, no payments, no data
 * collection. A real CommerceProvider must slot in without UI changes.
 */
export function ShopScreen({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation();
  const { lifetimeServed, reputation } = useGameStore(
    useShallow((s) => ({ lifetimeServed: s.lifetimeServed, reputation: s.reputation }))
  );
  const xp = xpForProgress(lifetimeServed, reputation);
  const [products, setProducts] = useState<Product[]>([]);
  const [quote, setQuote] = useState<DiscountQuote | null>(null);

  useEffect(() => {
    let mounted = true;
    void commerceProvider.getCatalogue().then((items) => mounted && setProducts(items));
    void commerceProvider.getDiscountForXP(xp).then((q) => mounted && setQuote(q));
    return () => {
      mounted = false;
    };
  }, [xp]);

  return (
    <View style={styles.container}>
      <View style={styles.banner}>
        <Text style={styles.bannerText}>{t('shop.previewBanner')}</Text>
      </View>
      <ScrollView contentContainerStyle={styles.body}>
        <Text style={styles.title}>{t('shop.title', { brand: BRAND_NAME })}</Text>
        <View style={styles.xpPanel}>
          <Text style={styles.xp}>{t('shop.yourXp', { xp })}</Text>
          {quote && (
            <Text style={styles.discount}>
              {t('shop.discountNow', { percent: quote.discountPercent })}
              {quote.nextStepXp !== undefined &&
                ` · ${t('shop.nextStep', { xp: quote.nextStepXp })}`}
            </Text>
          )}
        </View>
        {products.map((p) => (
          <ShopProductRow key={p.id} product={p} />
        ))}
        <Text style={styles.smallPrint}>{t('shop.smallPrint')}</Text>
      </ScrollView>
      <View style={styles.footer}>
        <PrimaryButton label={t('common.back')} onPress={onClose} variant="ghost" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  banner: { backgroundColor: colors.gold, padding: spacing.s, alignItems: 'center' },
  bannerText: { color: '#FFF', fontWeight: '800', fontSize: 12, letterSpacing: 1 },
  body: { padding: spacing.l },
  title: { fontSize: 26, fontWeight: '900', color: colors.ink, marginBottom: spacing.m },
  xpPanel: {
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.line,
    padding: spacing.l,
    marginBottom: spacing.l,
  },
  xp: { fontSize: 18, fontWeight: '800', color: colors.accent },
  discount: { fontSize: 13, color: colors.inkSoft, marginTop: spacing.xs },
  smallPrint: { fontSize: 11, color: colors.inkSoft, marginTop: spacing.l, textAlign: 'center' },
  footer: { padding: spacing.l, borderTopWidth: 1, borderTopColor: colors.line },
});
