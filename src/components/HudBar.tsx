import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useShallow } from 'zustand/react/shallow';
import { formatVND } from '../engine/money';
import { useGameStore } from '../state/gameStore';
import { colors, spacing } from '../config/theme';

/** Top-of-screen status strip: day, cash, reputation, stamina. */
export function HudBar() {
  const { t } = useTranslation();
  const { day, cash, reputation, stamina } = useGameStore(
    useShallow((s) => ({
      day: s.day,
      cash: s.cash,
      reputation: s.reputation,
      stamina: s.stamina,
    }))
  );
  return (
    <View style={styles.bar}>
      <Text style={styles.day}>{t('common.day', { day })}</Text>
      <View style={styles.stats}>
        <Text style={styles.cash}>{formatVND(cash)}</Text>
        <Text style={styles.stat}>
          ★ {reputation} ⚡ {stamina}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.l,
    paddingVertical: spacing.m,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  day: { fontSize: 16, fontWeight: '800', color: colors.ink },
  stats: { alignItems: 'flex-end' },
  cash: { fontSize: 16, fontWeight: '700', color: colors.good },
  stat: { fontSize: 13, color: colors.inkSoft },
});
