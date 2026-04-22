import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { pikuImages } from "../../assets/brand";
import { colors, radius } from "../../theme/tokens";
import { initials } from "../../utils/format";

type AvatarProps = {
  name?: string;
  size?: number;
  variant?: "brand" | "child" | "parent";
};

export function Avatar({ name = "PikuAI", size = 48, variant = "child" }: AvatarProps): React.JSX.Element {
  if (variant === "brand") {
    return <Image source={pikuImages.icon} style={[styles.image, { height: size, width: size, borderRadius: size * 0.24 }]} />;
  }
  return (
    <View style={[styles.avatar, variant === "parent" && styles.parent, { height: size, width: size, borderRadius: size * 0.32 }]}>
      <Text style={[styles.text, { fontSize: Math.max(12, size * 0.34) }]}>{initials(name) || "P"}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    alignItems: "center",
    backgroundColor: colors.yellowSoft,
    borderColor: colors.surface,
    borderWidth: 2,
    justifyContent: "center"
  },
  image: {
    backgroundColor: colors.brandLilac
  },
  parent: {
    backgroundColor: colors.purpleSoft
  },
  text: {
    color: colors.brandPurple,
    fontWeight: "900"
  }
});
