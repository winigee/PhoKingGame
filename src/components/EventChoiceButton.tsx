import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import type { TFunction } from 'i18next';
import { useTranslation } from 'react-i18next';
import { colors, spacing } from '../config/theme';
import { charactersById } from '../content';
import { formatVND } from '../engine/money';
import type { EventChoice } from '../engine/events';

interface Props {
  choice: EventChoice;
  available: boolean;
  onPress: () => void;
}

export function EventChoiceButton({ choice, available, onPress }: Props) {
  const { t } = useTranslation();
  return (
    <Pressable
      style={[styles.button, !available && styles.buttonLocked]}
      disabled={!available}
      onPress={onPress}
    >
      <Text style={[styles.text, !available && styles.textLocked]}>{t(choice.textKey)}</Text>
      {!available && choice.requirement && (
        <Text style={styles.hint}>{t('event.locked', { hint: requirementHint(choice, t) })}</Text>
      )}
    </Pressable>
  );
}

function requirementHint(choice: EventChoice, t: TFunction): string {
  const req = choice.requirement;
  if (!req) return '';
  if (req.minDisposition) {
    const who = charactersById[req.minDisposition.characterId];
    return t('event.hintDisposition', {
      name: who?.name ?? req.minDisposition.characterId,
      value: req.minDisposition.value,
    });
  }
  if (req.minReputation !== undefined) return t('event.hintRep', { value: req.minReputation });
  if (req.minCash !== undefined) return t('event.hintCash', { amount: formatVND(req.minCash) });
  return '';
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.accent,
    borderRadius: 12,
    padding: spacing.l,
    marginBottom: spacing.m,
  },
  buttonLocked: { borderColor: colors.line, opacity: 0.7 },
  text: { fontSize: 15, fontWeight: '600', color: colors.ink },
  textLocked: { color: colors.inkSoft },
  hint: { fontSize: 12, color: colors.bad, marginTop: spacing.xs },
});
