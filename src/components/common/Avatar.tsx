import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { pikuImages } from "../../assets/brand";
import { colors, radius } from "../../theme/tokens";
import { initials } from "../../utils/format";

type AvatarProps = {
  avatarKey?: string;
  iconMode?: "emoji" | "initials";
  name?: string;
  size?: number;
  variant?: "brand" | "child" | "parent";
};

const avatarIconByKey: Record<string, string> = {
  kid: "😊",
  star: "⭐",
  rocket: "🚀"
};

const avatarImageByKey = {
  boy: pikuImages.boyIcon,
  girl: pikuImages.girlIcon
} as const;

export function Avatar({ avatarKey, iconMode = "emoji", name = "PikuAI", size = 48, variant = "child" }: AvatarProps): React.JSX.Element {
  if (variant === "brand") {
    return <Image source={pikuImages.icon} style={[styles.image, { height: size, width: size, borderRadius: size * 0.24 }]} />;
  }
  const avatarImage = variant === "child" && (avatarKey === "boy" || avatarKey === "girl") ? avatarImageByKey[avatarKey] : null;
  if (avatarImage) {
    return (
      <View style={[styles.avatar, { height: size, width: size, borderRadius: size * 0.32 }]}>
        <Image source={avatarImage} resizeMode="contain" style={{ height: size * 0.78, width: size * 0.78 }} />
      </View>
    );
  }
  const icon = variant === "child" && iconMode === "emoji" && avatarKey ? avatarIconByKey[avatarKey] : null;
  return (
    <View style={[styles.avatar, variant === "parent" && styles.parent, { height: size, width: size, borderRadius: size * 0.32 }]}>
      <Text style={[styles.text, Boolean(icon) && styles.iconText, { fontSize: Math.max(12, size * (icon ? 0.48 : 0.34)) }]}>{icon ?? initials(name) ?? "P"}</Text>
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
  iconText: {
    color: colors.text
  },
  parent: {
    backgroundColor: colors.purpleSoft
  },
  text: {
    color: colors.brandPurple,
    fontWeight: "900"
  }
});
