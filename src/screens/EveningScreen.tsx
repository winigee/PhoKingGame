import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useShallow } from 'zustand/react/shallow';
import { HudBar } from '../components/HudBar';
import { PrimaryButton } from '../components/PrimaryButton';
import { colors, spacing } from '../config/theme';
import { gameConfig } from '../content';
import { formatVND } from '../engine/money';
import { reputationAfterDay } from '../engine/economy';
import { useGameStore } from '../state/gameStore';

export function EveningScreen() {
  const { t } = useTranslation();
  const { ledger, tier, reputation, sleep } = useGameStore(
    useShallow((s) => ({ ledger: s.ledger, tier: s.tier, reputation: s.reputation, sleep: s.sleep }))
  );
  const dailyCost = gameConfig.dailyCostByTier[Math.min(tier - 1, gameConfig.dailyCostByTier.length - 1)];
  const net = ledger.takings - dailyCost;
  const repDelta = reputationAfterDay(reputation, ledger, gameConfig) - reputation;
  const avgSat = ledger.served > 0 ? ledger.satisfactionTotal / ledger.served : 0;

  return (
    <View style={styles.container}>
      <HudBar />
      <View style={styles.body}>
        <Text style={styles.title}>{t('evening.title')}</Text>
        <Row label={t('evening.served')} value={String(ledger.served)} />
        <Row label={t('evening.walkedAway')} value={String(ledger.walkedAway)} />
        <Row label={t('evening.avgSatisfaction')} value={`${Math.round(avgSat * 100)}%`} />
        <View style={styles.divider} />
        <Row label={t('evening.takings')} value={formatVND(ledger.takings)} good />
        <Row label={t('evening.marketSpend')} value={formatVND(-ledger.marketSpend)} bad />
        <Row label={t('evening.dailyCosts')} value={formatVND(-dailyCost)} bad />
        <View style={styles.divider} />
        <Row label={t('evening.net')} value={formatVND(net)} good={net >= 0} bad={net < 0} />
        <Row
          label={t('evening.reputationChange')}
          value={repDelta >= 0 ? `+${repDelta}` : String(repDelta)}
          good={repDelta >= 0}
          bad={repDelta < 0}
        />
      </View>
      <View style={styles.footer}>
        <PrimaryButton label={t('evening.sleep')} onPress={() => void sleep()} />
      </View>
    </View>
  );
}

function Row({ label, value, good, bad }: { label: string; value: string; good?: boolean; bad?: boolean }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, good && styles.good, bad && styles.bad]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  body: { flex: 1, padding: spacing.xl },
  title: { fontSize: 24, fontWeight: '900', color: colors.ink, marginBottom: spacing.l },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.s },
  label: { fontSize: 15, color: colors.inkSoft },
  value: { fontSize: 15, fontWeight: '700', color: colors.ink },
  good: { color: colors.good },
  bad: { color: colors.bad },
  divider: { height: 1, backgroundColor: colors.line, marginVertical: spacing.s },
  footer: { padding: spacing.l, borderTopWidth: 1, borderTopColor: colors.line },
});
