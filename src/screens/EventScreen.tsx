import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useShallow } from 'zustand/react/shallow';
import { HudBar } from '../components/HudBar';
import { EventChoiceButton } from '../components/EventChoiceButton';
import { PrimaryButton } from '../components/PrimaryButton';
import { colors, spacing } from '../config/theme';
import { charactersById } from '../content';
import { choiceAvailable } from '../engine/events';
import { pendingEvent, useGameStore } from '../state/gameStore';

/** Evening event: 2–4 choices with visible requirements and consequences. */
export function EventScreen() {
  const { t } = useTranslation();
  const state = useGameStore((s) => s);
  const { chooseEventOption, dismissEvent } = useGameStore(
    useShallow((s) => ({ chooseEventOption: s.chooseEventOption, dismissEvent: s.dismissEvent }))
  );
  const event = pendingEvent(state);
  if (!event) return null;

  const featured = event.characterId ? charactersById[event.characterId] : undefined;
  const resolved = state.lastChoiceResultKey !== null;

  return (
    <View style={styles.container}>
      <HudBar />
      <ScrollView contentContainerStyle={styles.body}>
        <Text style={styles.kicker}>{t('event.header')}</Text>
        <Text style={styles.title}>{t(event.titleKey)}</Text>
        {featured && (
          <Text style={styles.featured}>
            {featured.name} “{featured.nickname}” · {t(`faction.${featured.faction}`)}
          </Text>
        )}
        <Text style={styles.bodyText}>{t(event.bodyKey)}</Text>

        {resolved ? (
          <Text style={styles.result}>{t(state.lastChoiceResultKey!)}</Text>
        ) : (
          event.choices.map((choice) => (
            <EventChoiceButton
              key={choice.id}
              choice={choice}
              available={choiceAvailable(choice, {
                tier: state.tier,
                cash: state.cash,
                reputation: state.reputation,
                dispositions: state.dispositions,
                flags: state.flags,
                firedEvents: state.firedEvents,
              })}
              onPress={() => chooseEventOption(choice.id)}
            />
          ))
        )}
      </ScrollView>
      {resolved && (
        <View style={styles.footer}>
          <PrimaryButton label={t('event.continue')} onPress={dismissEvent} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  body: { padding: spacing.xl },
  kicker: { fontSize: 12, fontWeight: '800', color: colors.accent, letterSpacing: 2 },
  title: { fontSize: 26, fontWeight: '900', color: colors.ink, marginVertical: spacing.s },
  featured: { fontSize: 13, color: colors.inkSoft, marginBottom: spacing.m },
  bodyText: { fontSize: 16, color: colors.ink, lineHeight: 24, marginBottom: spacing.xl },
  result: {
    fontSize: 16,
    color: colors.ink,
    lineHeight: 24,
    fontStyle: 'italic',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: spacing.l,
    borderWidth: 1,
    borderColor: colors.line,
  },
  footer: { padding: spacing.l, borderTopWidth: 1, borderTopColor: colors.line },
});
