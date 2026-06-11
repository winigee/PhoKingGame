import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { GAME_TITLE } from '../config/brand';
import { colors, spacing } from '../config/theme';
import { PrimaryButton } from '../components/PrimaryButton';
import { useGameStore } from '../state/gameStore';
import { getPersistence } from '../state/saveBridge';

export function TitleScreen() {
  const { t } = useTranslation();
  const newGame = useGameStore((s) => s.newGame);
  const continueGame = useGameStore((s) => s.continueGame);
  const [hasSave, setHasSave] = useState(false);

  useEffect(() => {
    let mounted = true;
    void getPersistence()
      .load()
      .then((save) => mounted && setHasSave(save !== null));
    return () => {
      mounted = false;
    };
  }, []);

  const onNewGame = () => {
    if (hasSave) {
      Alert.alert(GAME_TITLE, t('title.confirmOverwrite'), [
        { text: t('common.cancel'), style: 'cancel' },
        { text: t('common.ok'), style: 'destructive', onPress: () => void newGame() },
      ]);
    } else {
      void newGame();
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{GAME_TITLE}</Text>
      <Text style={styles.tagline}>{t('title.tagline')}</Text>
      <View style={styles.buttons}>
        {hasSave && <PrimaryButton label={t('title.continue')} onPress={() => void continueGame()} />}
        <PrimaryButton
          label={t('title.newGame')}
          onPress={onNewGame}
          variant={hasSave ? 'ghost' : 'primary'}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  title: { fontSize: 40, fontWeight: '900', color: colors.accent },
  tagline: { fontSize: 16, color: colors.inkSoft, marginTop: spacing.s, marginBottom: spacing.xl },
  buttons: { alignSelf: 'stretch', marginTop: spacing.xl },
});
