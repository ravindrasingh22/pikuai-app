import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { AppText } from './AppText';
import { colors } from '../theme/colors';
import { radius } from '../theme/spacing';

export function OptionChip({ label, active, onPress }: { label: string; active?: boolean; onPress?: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.chip, active && styles.active]}>
      <AppText variant="tiny" style={[styles.text, active && styles.activeText]}>{label}</AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: { minHeight: 34, borderRadius: radius.pill, paddingHorizontal: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.78)', borderWidth: 1, borderColor: colors.atlasLine },
  active: { backgroundColor: colors.teal, borderColor: colors.teal },
  text: { color: colors.tealDark },
  activeText: { color: colors.white }
});
