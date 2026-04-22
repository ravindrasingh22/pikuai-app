import React, { useState } from "react";
import { Image, StyleSheet, Text, TextInput, View } from "react-native";
import { pikuImages } from "../../assets/brand";
import { PikuButton } from "../../components/common/PikuButton";
import { colors, radius, shadows, spacing, typography } from "../../theme/tokens";
import type { ChildProfile } from "../../types/domain";
import type { Navigate } from "../../navigation/types";

export function VoiceChatScreen({
  canGoBack,
  child,
  navigate,
  onBack
}: {
  canGoBack?: boolean;
  child: ChildProfile;
  navigate: Navigate;
  onBack?: () => void;
}): React.JSX.Element {
  const [transcript, setTranscript] = useState("Why do some animals hibernate in winter?");

  return (
    <View style={styles.screen}>
      <PikuButton label="Back" onPress={canGoBack && onBack ? onBack : () => navigate("childChat", { child })} variant="ghost" style={styles.closeButton} />
      <View style={styles.badge}>
        <Text style={styles.badgeText}>Voice Chat</Text>
      </View>
      <View style={styles.micWrap}>
        <View style={styles.micRing}>
          <Text style={styles.mic}>M</Text>
        </View>
        <Image source={pikuImages.icon} style={styles.chick} />
      </View>
      <Text style={styles.title}>Listening...</Text>
      <View style={styles.transcriptCard}>
        <Text style={styles.label}>Live transcript</Text>
        <TextInput
          multiline
          value={transcript}
          onChangeText={setTranscript}
          style={styles.transcript}
          placeholderTextColor={colors.textMuted}
        />
        <View style={styles.waveform}>
          {Array.from({ length: 22 }).map((_, index) => (
            <View key={index} style={[styles.wave, { height: 6 + ((index * 7) % 28) }]} />
          ))}
        </View>
      </View>
      <View style={styles.actions}>
        <PikuButton label="Cancel" onPress={() => navigate("childChat", { child })} variant="secondary" style={styles.action} />
        <PikuButton label="Send" onPress={() => navigate("childChat", { child })} style={styles.action} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  action: {
    flex: 1
  },
  actions: {
    flexDirection: "row",
    gap: spacing.md,
    width: "100%"
  },
  badge: {
    alignSelf: "center",
    backgroundColor: "rgba(255,255,255,0.12)",
    borderColor: "rgba(255,255,255,0.26)",
    borderRadius: radius.pill,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs
  },
  badgeText: {
    ...typography.small,
    color: colors.surface
  },
  chick: {
    bottom: -10,
    height: 78,
    position: "absolute",
    right: 12,
    width: 78
  },
  closeButton: {
    alignSelf: "flex-start"
  },
  label: {
    ...typography.small,
    color: colors.textMuted
  },
  mic: {
    color: colors.surface,
    fontSize: 58,
    fontWeight: "900"
  },
  micRing: {
    alignItems: "center",
    backgroundColor: colors.brandPurpleDark,
    borderColor: "#f3bbff",
    borderRadius: 100,
    borderWidth: 6,
    height: 180,
    justifyContent: "center",
    width: 180,
    ...shadows.lift
  },
  micWrap: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: spacing.xl,
    minHeight: 210
  },
  screen: {
    alignItems: "center",
    backgroundColor: colors.brandPurpleDark,
    flex: 1,
    gap: spacing.lg,
    justifyContent: "center",
    padding: spacing.lg
  },
  title: {
    color: colors.surface,
    fontSize: 30,
    fontWeight: "900"
  },
  transcript: {
    ...typography.section,
    color: colors.text,
    minHeight: 88,
    paddingVertical: spacing.sm
  },
  transcriptCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    maxWidth: 520,
    padding: spacing.lg,
    width: "100%",
    ...shadows.lift
  },
  wave: {
    backgroundColor: colors.brandLilacDeep,
    borderRadius: 4,
    width: 3
  },
  waveform: {
    alignItems: "center",
    flexDirection: "row",
    gap: 4,
    justifyContent: "center"
  }
});
