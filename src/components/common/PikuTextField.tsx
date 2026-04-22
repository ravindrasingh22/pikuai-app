import React from "react";
import { StyleSheet, Text, TextInput, type TextInputProps, View } from "react-native";
import { colors, radius, spacing, typography } from "../../theme/tokens";

type PikuTextFieldProps = TextInputProps & {
  label: string;
};

export function PikuTextField({ label, style, ...props }: PikuTextFieldProps): React.JSX.Element {
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        placeholderTextColor={colors.textMuted}
        style={[styles.input, style]}
        {...props}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    ...typography.body,
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: radius.md,
    borderWidth: 1,
    color: colors.text,
    minHeight: 50,
    paddingHorizontal: spacing.md
  },
  label: {
    ...typography.small,
    color: colors.textSoft,
    marginBottom: spacing.xs
  },
  wrap: {
    marginBottom: spacing.sm
  }
});
