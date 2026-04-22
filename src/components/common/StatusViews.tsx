import React from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { colors, spacing, typography } from "../../theme/tokens";
import { PikuButton } from "./PikuButton";

export function LoadingState({ label = "Loading PikuAI..." }: { label?: string }): React.JSX.Element {
  return (
    <View style={styles.center}>
      <ActivityIndicator color={colors.brandPurple} size="large" />
      <Text style={styles.text}>{label}</Text>
    </View>
  );
}

export function EmptyState({ title, body, actionLabel, onAction }: {
  title: string;
  body: string;
  actionLabel?: string;
  onAction?: () => void;
}): React.JSX.Element {
  return (
    <View style={styles.center}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.text}>{body}</Text>
      {actionLabel && onAction ? <PikuButton label={actionLabel} onPress={onAction} variant="secondary" /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    alignItems: "center",
    gap: spacing.sm,
    justifyContent: "center",
    padding: spacing.xl
  },
  text: {
    ...typography.body,
    color: colors.textSoft,
    textAlign: "center"
  },
  title: {
    ...typography.section,
    color: colors.text,
    textAlign: "center"
  }
});
