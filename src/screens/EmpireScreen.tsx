import React from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useShallow } from 'zustand/react/shallow';
import { PrimaryButton } from '../components/PrimaryButton';
import { BRAND_NAME } from '../config/brand';
import { colors, spacing } from '../config/theme';
import { empireConfig } from '../content';
import { factoryCost, marketCost, prestigeBonusPercent, quarterProfit } from '../engine/empire';
import { formatVND } from '../engine/money';
import { useGameStore } from '../state/gameStore';

/** Tier 6: the playthrough becomes an instant-noodle empire dashboard. */
export function EmpireScreen() {
  const { t } = useTranslation();
  const s = useGameStore(
    useShallow((st) => ({
      cash: st.cash,
      empire: st.empire,
      equityGiven: st.equityGiven,
      prestigeBonus: st.prestigeBonus,
      lastQuarterProfit: st.lastQuarterProfit,
      buildFactory: st.buildFactory,
      enterMarket: st.enterMarket,
      runQuarter: st.runQuarter,
      prestigeReset: st.prestigeReset,
    }))
  );
  const nextFactory = factoryCost(s.empire.factories, empireConfig);
  const nextMarket = marketCost(s.empire.markets, empireConfig);
  const bonus = prestigeBonusPercent(s.empire, s.equityGiven);

  const confirmPrestige = () => {
    Alert.alert(t('empire.title', { brand: BRAND_NAME }), t('empire.prestigeConfirm'), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('common.ok'), onPress: () => void s.prestigeReset() },
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.body}>
      <Text style={styles.title}>{t('empire.title', { brand: BRAND_NAME })}</Text>
      <Text style={styles.subtitle}>{t('empire.subtitle')}</Text>
      {s.prestigeBonus > 0 && (
        <Text style={styles.badge}>{t('empire.prestigeBadge', { bonus: s.prestigeBonus })}</Text>
      )}

      <View style={styles.panel}>
        <Row label={t('common.cash')} value={formatVND(s.cash)} />
        <Row label={t('empire.factories')} value={String(s.empire.factories)} />
        <Row label={t('empire.markets')} value={String(s.empire.markets)} />
        <Row label={t('empire.brandValue')} value={String(s.empire.brandValue)} />
        <Row label={t('empire.equity')} value={`${s.equityGiven}%`} />
      </View>

      {s.lastQuarterProfit > 0 && (
        <Text style={styles.profit}>
          {t('empire.quarterResult', { profit: formatVND(s.lastQuarterProfit) })}
        </Text>
      )}

      <PrimaryButton label={t('empire.runQuarter')} onPress={() => void s.runQuarter()} />
      <PrimaryButton
        label={t('empire.buildFactory', { cost: formatVND(nextFactory) })}
        onPress={s.buildFactory}
        disabled={s.cash < nextFactory}
        variant="ghost"
      />
      <PrimaryButton
        label={t('empire.enterMarket', { cost: formatVND(nextMarket) })}
        onPress={s.enterMarket}
        disabled={s.cash < nextMarket}
        variant="ghost"
      />
      <View style={styles.spacer} />
      <Text style={styles.hint}>
        {t('empire.quarterResult', { profit: formatVND(quarterProfit(s.empire, empireConfig)) })}
      </Text>
      <PrimaryButton label={t('empire.prestige', { bonus })} onPress={confirmPrestige} />
    </ScrollView>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  body: { padding: spacing.xl },
  title: { fontSize: 30, fontWeight: '900', color: colors.accent },
  subtitle: { fontSize: 14, color: colors.inkSoft, marginBottom: spacing.l },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.gold,
    color: '#FFF',
    fontWeight: '800',
    fontSize: 12,
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.xs,
    borderRadius: 12,
    marginBottom: spacing.m,
    overflow: 'hidden',
  },
  panel: {
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.line,
    padding: spacing.l,
    marginBottom: spacing.l,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.xs },
  rowLabel: { fontSize: 14, color: colors.inkSoft },
  rowValue: { fontSize: 14, fontWeight: '700', color: colors.ink },
  profit: { color: colors.good, fontWeight: '700', marginBottom: spacing.m },
  hint: { fontSize: 12, color: colors.inkSoft, textAlign: 'center', marginBottom: spacing.s },
  spacer: { height: spacing.xl },
});
