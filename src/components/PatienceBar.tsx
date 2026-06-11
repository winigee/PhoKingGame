import React from 'react';
import { StyleSheet, View } from 'react-native';
import { colors } from '../config/theme';

/** Shrinking bar showing how long the current customer will wait. */
export function PatienceBar({ fraction }: { fraction: number }) {
  const pct = Math.max(0, Math.min(1, fraction));
  const color = pct > 0.5 ? colors.good : pct > 0.25 ? colors.gold : colors.bad;
  return (
    <View style={styles.track}>
      <View style={[styles.fill, { width: `${pct * 100}%`, backgroundColor: color }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.line,
    overflow: 'hidden',
  },
  fill: { height: '100%', borderRadius: 4 },
});
