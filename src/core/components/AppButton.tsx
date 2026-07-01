import React from 'react';
import { Pressable, StyleSheet, Text, ViewStyle, StyleProp, Image, ImageSourcePropType } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../theme/colors';
import { radius } from '../theme/spacing';
import { shadows } from '../theme/shadows';
import { typography } from '../theme/typography';

type Props = {
  label: string;
  onPress?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'pill';
  disabled?: boolean;
  icon?: ImageSourcePropType;
  style?: StyleProp<ViewStyle>;
};

export function AppButton({ label, onPress, variant = 'primary', disabled, icon, style }: Props) {
  const isPrimary = variant === 'primary';
  const content = (textStyle?: object) => (
    <>
      {icon ? <Image source={icon} style={styles.icon} /> : null}
      <Text style={[styles.text, textStyle, (variant === 'secondary' || variant === 'ghost') && styles.textSecondary, variant === 'danger' && styles.textDanger]}>{label}</Text>
    </>
  );

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        isPrimary ? styles.primary : styles[variant],
        disabled && styles.disabled,
        pressed && !disabled && (isPrimary ? styles.primaryPressed : styles.pressed),
        style
      ]}
    >
      {({ pressed }) => isPrimary ? (
        <LinearGradient colors={pressed ? ['#547a82', '#476b72'] : ['#628b93', '#628b93']} style={styles.primaryFill}>
          {content(styles.primaryText)}
        </LinearGradient>
      ) : content()}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 48,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    paddingHorizontal: 18,
    gap: 8
  },
  primary: {
    minHeight: 54,
    width: '100%',
    maxWidth: 320,
    paddingHorizontal: 0,
    overflow: 'hidden',
    alignSelf: 'center',
    backgroundColor: '#628b93',
    ...shadows.teal
  },
  secondary: {
    backgroundColor: 'rgba(255,255,255,0.82)',
    borderWidth: 1,
    borderColor: colors.atlasLine
  },
  ghost: {
    backgroundColor: 'transparent'
  },
  danger: {
    backgroundColor: '#fff7f5',
    borderWidth: 1,
    borderColor: '#f1c7be'
  },
  pill: {
    backgroundColor: colors.tealSoft,
    borderWidth: 1,
    borderColor: colors.tealLine,
    minHeight: 36
  },
  disabled: {
    opacity: 0.5
  },
  pressed: {
    opacity: 0.86,
    transform: [{ scale: 0.985 }]
  },
  primaryPressed: {
    transform: [{ scale: 0.985 }]
  },
  primaryFill: {
    width: '100%',
    minHeight: 54,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    paddingHorizontal: 24,
    gap: 8
  },
  text: {
    color: colors.white,
    fontFamily: typography.fontFamily,
    fontSize: 14,
    fontWeight: '800'
  },
  primaryText: {
    fontSize: 15,
    letterSpacing: 1
  },
  textSecondary: {
    color: colors.tealDeep
  },
  textDanger: {
    color: colors.danger
  },
  icon: {
    width: 17,
    height: 17,
    resizeMode: 'contain'
  }
});
