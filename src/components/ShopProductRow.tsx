import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors, spacing } from '../config/theme';
import type { Product } from '../commerce/types';

export function ShopProductRow({ product }: { product: Product }) {
  const { t } = useTranslation();
  return (
    <View style={styles.card}>
      <View style={styles.art}>
        <Text style={styles.artGlyph}>{t(`shop.categoryGlyph.${product.category}`)}</Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.name}>{t(product.nameKey)}</Text>
        <Text style={styles.desc}>{t(product.descriptionKey)}</Text>
      </View>
      <Text style={styles.xpTag}>{t('shop.xpTag', { xp: product.xpTag })}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.line,
    padding: spacing.m,
    marginBottom: spacing.m,
  },
  art: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.m,
  },
  artGlyph: { fontSize: 22 },
  info: { flex: 1 },
  name: { fontSize: 15, fontWeight: '700', color: colors.ink },
  desc: { fontSize: 12, color: colors.inkSoft, marginTop: 2 },
  xpTag: { fontSize: 13, fontWeight: '800', color: colors.accent, marginLeft: spacing.s },
});
