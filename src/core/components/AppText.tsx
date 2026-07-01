import React from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

type Variant = 'title' | 'h1' | 'h2' | 'h3' | 'body' | 'small' | 'tiny' | 'label';

const variantStyle: Record<Variant, object> = {
  title: { fontSize: typography.title, lineHeight: 34, fontWeight: '800', color: colors.ink },
  h1: { fontSize: typography.h1, lineHeight: 30, fontWeight: '800', color: colors.ink },
  h2: { fontSize: typography.h2, lineHeight: 26, fontWeight: '800', color: colors.ink },
  h3: { fontSize: typography.h3, lineHeight: 22, fontWeight: '800', color: colors.ink },
  body: { fontSize: typography.body, lineHeight: 21, fontWeight: '500', color: colors.text },
  small: { fontSize: typography.small, lineHeight: 17, fontWeight: '600', color: colors.muted },
  tiny: { fontSize: typography.tiny, lineHeight: 14, fontWeight: '700', color: colors.muted },
  label: { fontSize: typography.tiny, lineHeight: 14, fontWeight: '800', color: colors.tealDeep, letterSpacing: 1.2, textTransform: 'uppercase' }
};

export function AppText({ variant = 'body', style, ...props }: TextProps & { variant?: Variant }) {
  return <Text {...props} style={[styles.base, variantStyle[variant], style]} />;
}

const styles = StyleSheet.create({
  base: {
    fontFamily: typography.fontFamily
  }
});
