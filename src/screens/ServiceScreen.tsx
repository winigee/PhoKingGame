import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { HudBar } from '../components/HudBar';
import { PatienceBar } from '../components/PatienceBar';
import { PickGrid } from '../components/PickGrid';
import { PrimaryButton } from '../components/PrimaryButton';
import { colors, spacing } from '../config/theme';
import { formatVND } from '../engine/money';
import { useServiceDay } from './hooks/useServiceDay';

export function ServiceScreen() {
  const { t } = useTranslation();
  const day = useServiceDay();

  return (
    <View style={styles.container}>
      <HudBar />
      <View style={styles.header}>
        <Text style={styles.title}>{t('service.title')}</Text>
        <Text style={styles.queue}>
          {t('service.customersWaiting', { count: Math.max(0, day.customersToday - day.visits) })}
        </Text>
      </View>

      {day.queueDone ? (
        <View style={styles.doneBox}>
          <Text style={styles.doneText}>{t('service.queueDone')}</Text>
        </View>
      ) : (
        <>
          <View style={styles.customerBox}>
            <Text style={styles.order}>{t('service.customerOrder', { dish: t(day.dish.nameKey) })}</Text>
            <PatienceBar fraction={day.patienceFraction} />
          </View>
          <ScrollView style={styles.picker} contentContainerStyle={styles.pickerContent}>
            <PickGrid
              components={day.dish.components}
              optionsByCategory={day.optionsByCategory}
              picks={day.picks}
              onPick={day.pick}
            />
          </ScrollView>
        </>
      )}

      {day.lastResult && (
        <Text style={[styles.feedback, day.lastResult.mistake && styles.feedbackBad]}>
          {day.lastResult.mistake ? t('service.mistake') : satisfactionEmoji(day.lastResult.satisfaction)}{' '}
          +{formatVND(day.lastResult.revenue)}
        </Text>
      )}

      <View style={styles.footer}>
        {!day.queueDone && (
          <PrimaryButton label={t('service.serve')} onPress={day.serve} disabled={!day.canServe} />
        )}
        <PrimaryButton
          label={day.queueDone ? t('common.next') : t('service.endEarly')}
          onPress={day.closeService}
          variant={day.queueDone ? 'primary' : 'ghost'}
        />
      </View>
    </View>
  );
}

function satisfactionEmoji(sat: number): string {
  if (sat >= 0.8) return '😍';
  if (sat >= 0.6) return '🙂';
  if (sat >= 0.4) return '😐';
  return '😠';
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    paddingHorizontal: spacing.l,
    paddingTop: spacing.m,
  },
  title: { fontSize: 24, fontWeight: '900', color: colors.ink },
  queue: { fontSize: 14, color: colors.inkSoft },
  customerBox: { paddingHorizontal: spacing.l, paddingTop: spacing.s },
  order: { fontSize: 16, color: colors.ink, marginBottom: spacing.xs },
  picker: { flex: 1 },
  pickerContent: { padding: spacing.l },
  doneBox: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  doneText: { fontSize: 20, fontWeight: '700', color: colors.good },
  feedback: { textAlign: 'center', fontSize: 15, color: colors.good, paddingVertical: spacing.xs },
  feedbackBad: { color: colors.bad },
  footer: { padding: spacing.l, borderTopWidth: 1, borderTopColor: colors.line },
});
