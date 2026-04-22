import React from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, type StyleProp, type ViewStyle } from "react-native";
import { colors, radius, spacing, typography } from "../../theme/tokens";

type PikuButtonProps = {
  label: string;
  onPress: () => void;
  icon?: string;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function PikuButton({
  label,
  onPress,
  icon,
  variant = "primary",
  disabled,
  loading,
  style
}: PikuButtonProps): React.JSX.Element {
  const inactive = disabled || loading;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: inactive }}
      disabled={inactive}
      onPress={onPress}
      style={({ pressed }) => [styles.button, styles[variant], inactive && styles.disabled, pressed && styles.pressed, style]}
    >
      {loading ? <ActivityIndicator color={variant === "primary" ? colors.surface : colors.brandPurple} /> : null}
      {!loading && icon ? <Text style={[styles.icon, variant === "primary" && styles.primaryText]}>{icon}</Text> : null}
      <Text style={[styles.label, variant === "primary" && styles.primaryText, variant === "danger" && styles.dangerText]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    borderRadius: radius.md,
    flexDirection: "row",
    gap: spacing.xs,
    justifyContent: "center",
    minHeight: 52,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm
  },
  danger: {
    backgroundColor: colors.dangerSoft,
    borderColor: colors.dangerSoft,
    borderWidth: 1
  },
  dangerText: {
    color: colors.danger
  },
  disabled: {
    opacity: 0.58
  },
  ghost: {
    backgroundColor: "transparent"
  },
  icon: {
    color: colors.brandPurple,
    fontSize: 18,
    fontWeight: "900"
  },
  label: {
    ...typography.body,
    color: colors.brandPurple,
    fontWeight: "800",
    textAlign: "center"
  },
  pressed: {
    transform: [{ scale: 0.99 }]
  },
  primary: {
    backgroundColor: colors.brandBlue
  },
  primaryText: {
    color: colors.surface
  },
  secondary: {
    backgroundColor: colors.surface,
    borderColor: colors.brandLilacDeep,
    borderWidth: 1
  }
});
