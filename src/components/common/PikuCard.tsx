import React from "react";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { colors, radius, shadows, spacing } from "../../theme/tokens";

type PikuCardProps = {
  children: React.ReactNode;
  tone?: "default" | "blue" | "purple" | "green" | "yellow" | "pink";
  style?: StyleProp<ViewStyle>;
};

export function PikuCard({ children, tone = "default", style }: PikuCardProps): React.JSX.Element {
  return <View style={[styles.card, toneStyles[tone], style]}>{children}</View>;
}

const toneStyles = StyleSheet.create({
  blue: { backgroundColor: colors.blueSoft },
  default: { backgroundColor: colors.surface },
  green: { backgroundColor: colors.greenSoft },
  pink: { backgroundColor: colors.pinkSoft },
  purple: { backgroundColor: colors.purpleSoft },
  yellow: { backgroundColor: colors.yellowSoft }
});

const styles = StyleSheet.create({
  card: {
    borderColor: colors.line,
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.md,
    ...shadows.card
  }
});
