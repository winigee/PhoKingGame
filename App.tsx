import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, StyleSheet } from 'react-native';
import './src/i18n';
import { colors } from './src/config/theme';
import { EveningScreen } from './src/screens/EveningScreen';
import { MarketScreen } from './src/screens/MarketScreen';
import { ServiceScreen } from './src/screens/ServiceScreen';
import { TitleScreen } from './src/screens/TitleScreen';
import { useGameStore } from './src/state/gameStore';
import { setPersistence } from './src/state/saveBridge';
import { sqlitePersistence } from './src/state/sqlitePersistence';

setPersistence(sqlitePersistence);

export default function App() {
  const phase = useGameStore((s) => s.phase);

  return (
    <SafeAreaView style={styles.root}>
      {phase === 'TITLE' && <TitleScreen />}
      {phase === 'MORNING' && <MarketScreen />}
      {phase === 'SERVICE' && <ServiceScreen />}
      {phase === 'EVENING' && <EveningScreen />}
      <StatusBar style="dark" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
});
