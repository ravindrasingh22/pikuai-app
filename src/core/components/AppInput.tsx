import React from 'react';
import { TextInput, TextInputProps, StyleSheet, View } from 'react-native';
import { AppText } from './AppText';
import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

type Props = TextInputProps & {
  label?: string;
  helper?: string;
};

export function AppInput({ label, helper, style, ...props }: Props) {
  return (
    <View style={styles.wrap}>
      {label ? <AppText variant="small" style={styles.label}>{label}</AppText> : null}
      {helper ? <AppText variant="tiny" style={styles.helper}>{helper}</AppText> : null}
      <TextInput
        placeholderTextColor="#9fb0b5"
        {...props}
        style={[styles.input, style]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 6 },
  label: { color: colors.inkMid, fontWeight: '800' },
  helper: { color: colors.muted, marginTop: -2 },
  input: {
    minHeight: 48,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderWidth: 1,
    borderColor: colors.atlasLine,
    paddingHorizontal: spacing.lg,
    color: colors.ink,
    fontFamily: typography.fontFamily,
    fontWeight: '700'
  }
});
