import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, StyleSheet } from 'react-native';
import './src/i18n';
import { colors } from './src/config/theme';
import { CardViewerScreen } from './src/screens/CardViewerScreen';
import { EmpireScreen } from './src/screens/EmpireScreen';
import { EveningScreen } from './src/screens/EveningScreen';
import { EventScreen } from './src/screens/EventScreen';
import { MarketScreen } from './src/screens/MarketScreen';
import { ServiceScreen } from './src/screens/ServiceScreen';
import { TitleScreen } from './src/screens/TitleScreen';
import { useGameStore } from './src/state/gameStore';
import { setPersistence } from './src/state/saveBridge';
import { sqlitePersistence } from './src/state/sqlitePersistence';

setPersistence(sqlitePersistence);

export default function App() {
  const phase = useGameStore((s) => s.phase);
  const cardViewerOpen = useGameStore((s) => s.cardViewerOpen);

  return (
    <SafeAreaView style={styles.root}>
      {cardViewerOpen ? (
        <CardViewerScreen />
      ) : (
        <>
          {phase === 'TITLE' && <TitleScreen />}
          {phase === 'MORNING' && <MarketScreen />}
          {phase === 'SERVICE' && <ServiceScreen />}
          {phase === 'EVENT' && <EventScreen />}
          {phase === 'EVENING' && <EveningScreen />}
          {phase === 'EMPIRE' && <EmpireScreen />}
        </>
      )}
      <StatusBar style="dark" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
});
