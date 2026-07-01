import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import { shadows } from '../theme/shadows';

export function Island({ children, style, strong = false }: { children: React.ReactNode; style?: StyleProp<ViewStyle>; strong?: boolean }) {
  return <View style={[styles.island, strong && styles.strong, style]}>{children}</View>;
}

export function MiniCard({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.mini, style]}>{children}</View>;
}

export function StatCard({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.stat, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  island: {
    borderRadius: radius.lg,
    backgroundColor: 'rgba(255,255,252,0.88)',
    borderWidth: 1,
    borderColor: 'rgba(92,132,137,0.18)',
    padding: spacing.xl,
    ...shadows.island
  },
  strong: {
    backgroundColor: 'rgba(255,255,252,0.96)',
    borderColor: 'rgba(0,127,121,0.26)'
  },
  mini: {
    borderRadius: radius.md,
    backgroundColor: 'rgba(255,255,255,0.84)',
    borderWidth: 1,
    borderColor: colors.atlasLine,
    padding: spacing.lg,
    ...shadows.soft
  },
  stat: {
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.82)',
    borderWidth: 1,
    borderColor: colors.atlasLine,
    padding: spacing.md,
    minHeight: 78
  }
});
