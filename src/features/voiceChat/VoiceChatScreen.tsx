import React, { useMemo, useState } from "react";
import { Image, Platform, Pressable, ScrollView, StatusBar, StyleSheet, Text, TextInput, View } from "react-native";
import { pikuImages } from "../../assets/brand";
import { sendChildMessage } from "../../api/mobileApi";
import { PikuButton } from "../../components/common/PikuButton";
import { useAsyncAction } from "../../hooks/useAsyncAction";
import { colors, radius, shadows, spacing, typography } from "../../theme/tokens";
import type { ChildProfile } from "../../types/domain";
import type { Navigate } from "../../navigation/types";

const topSafeInset = Platform.OS === "android" ? StatusBar.currentHeight ?? 0 : 54;
const samplePrompts = ["Why do rainbows happen?", "Tell me about the moon", "How do birds fly?"];

type VoiceState = "idle" | "listening" | "review" | "answered";

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
  const [voiceState, setVoiceState] = useState<VoiceState>("idle");
  const [transcript, setTranscript] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);
  const [policyBucket, setPolicyBucket] = useState<string | null>(null);
  const listening = voiceState === "listening";

  const bars = useMemo(
    () => Array.from({ length: 26 }).map((_, index) => 8 + ((index * (listening ? 9 : 5)) % (listening ? 38 : 20))),
    [listening]
  );

  const submit = useAsyncAction(async () => {
    const normalized = transcript.trim();
    if (!normalized) {
      throw new Error("Say or type something before sending.");
    }
    const response = await sendChildMessage({
      answerMode: "short_answer",
      childProfileId: child.id,
      message: normalized
    });
    setAnswer(response.answer_text);
    setPolicyBucket(response.policy_bucket);
    setVoiceState("answered");
  });

  const startListening = (): void => {
    setAnswer(null);
    setPolicyBucket(null);
    setVoiceState("listening");
  };

  const stopListening = (): void => {
    setVoiceState("review");
  };

  const usePrompt = (prompt: string): void => {
    setTranscript(prompt);
    setAnswer(null);
    setPolicyBucket(null);
    setVoiceState("review");
  };

  const reset = (): void => {
    setTranscript("");
    setAnswer(null);
    setPolicyBucket(null);
    setVoiceState("idle");
  };

  return (
    <View style={[styles.screen, { paddingTop: topSafeInset + spacing.lg }]}>
      <View style={styles.topRow}>
        <PikuButton label="Back" onPress={canGoBack && onBack ? onBack : () => navigate("childChat", { child })} variant="ghost" style={styles.closeButton} />
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Voice Chat</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.micWrap}>
          <Pressable accessibilityRole="button" onPress={listening ? stopListening : startListening} style={[styles.micRing, listening && styles.micRingActive]}>
            <Text style={styles.mic}>{listening ? "■" : "M"}</Text>
          </Pressable>
          <Pressable accessibilityLabel="Go to welcome" accessibilityRole="button" onPress={() => navigate("welcome", { resetHistory: true })} style={styles.chickTap}>
            <Image source={pikuImages.icon} style={styles.chick} />
          </Pressable>
        </View>

        <Text style={styles.title}>{listening ? "Listening..." : voiceState === "answered" ? "Piku answered" : "Tap to talk"}</Text>
        <Text style={styles.subtitle}>
          {listening ? "Tap stop when you are done. Speech-to-text can be connected here when the native module is added." : `Voice is parent-managed for ${child.display_name}.`}
        </Text>

        <View style={styles.waveform}>
          {bars.map((height, index) => (
            <View key={index} style={[styles.wave, listening && styles.waveActive, { height }]} />
          ))}
        </View>

        <View style={styles.promptRow}>
          {samplePrompts.map((prompt) => (
            <Pressable key={prompt} onPress={() => usePrompt(prompt)} style={styles.promptPill}>
              <Text style={styles.promptText}>{prompt}</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.transcriptCard}>
          <Text style={styles.label}>Transcript</Text>
          <TextInput
            multiline
            onChangeText={(value) => {
              setTranscript(value);
              if (voiceState === "idle") setVoiceState("review");
            }}
            placeholder="Your spoken words will appear here. You can type or edit before sending."
            placeholderTextColor={colors.textMuted}
            style={styles.transcript}
            value={transcript}
          />
          {submit.error ? <Text style={styles.error}>{submit.error}</Text> : null}
        </View>

        {answer ? (
          <View style={styles.answerCard}>
            <Text style={styles.answerLabel}>Piku says</Text>
            <Text style={styles.answerText}>{answer}</Text>
            {policyBucket ? <Text style={styles.policy}>{policyBucket}</Text> : null}
          </View>
        ) : null}
      </ScrollView>

      <View style={styles.actions}>
        {listening ? (
          <PikuButton label="Stop" onPress={stopListening} variant="secondary" style={styles.action} />
        ) : (
          <PikuButton label="Record" onPress={startListening} variant="secondary" style={styles.action} />
        )}
        <PikuButton label="Send" onPress={() => void submit.run()} loading={submit.loading} style={styles.action} />
        <PikuButton label="Clear" onPress={reset} variant="ghost" style={styles.action} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  action: {
    flex: 1
  },
  actions: {
    backgroundColor: colors.brandPurpleDark,
    flexDirection: "row",
    gap: spacing.xs,
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    width: "100%"
  },
  answerCard: {
    backgroundColor: colors.blueSoft,
    borderColor: "#bfd2ff",
    borderRadius: radius.lg,
    borderWidth: 1,
    maxWidth: 520,
    padding: spacing.md,
    width: "100%"
  },
  answerLabel: {
    ...typography.small,
    color: colors.brandBlue,
    marginBottom: spacing.xs
  },
  answerText: {
    ...typography.body,
    color: colors.text
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
    height: 78,
    width: 78
  },
  chickTap: {
    bottom: -10,
    position: "absolute",
    right: 12
  },
  closeButton: {
    minHeight: 40,
    minWidth: 88
  },
  content: {
    alignItems: "center",
    gap: spacing.md,
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
    width: "100%"
  },
  error: {
    ...typography.small,
    color: colors.danger,
    marginTop: spacing.xs
  },
  label: {
    ...typography.small,
    color: colors.textMuted
  },
  mic: {
    color: colors.surface,
    fontSize: 54,
    fontWeight: "900"
  },
  micRing: {
    alignItems: "center",
    backgroundColor: colors.brandPurpleDark,
    borderColor: "#f3bbff",
    borderRadius: 100,
    borderWidth: 6,
    height: 176,
    justifyContent: "center",
    width: 176,
    ...shadows.lift
  },
  micRingActive: {
    backgroundColor: colors.brandBlue,
    borderColor: colors.surface
  },
  micWrap: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 208
  },
  policy: {
    ...typography.tiny,
    color: colors.green,
    marginTop: spacing.xs
  },
  promptPill: {
    backgroundColor: "rgba(255,255,255,0.14)",
    borderColor: "rgba(255,255,255,0.22)",
    borderRadius: radius.pill,
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs
  },
  promptRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
    justifyContent: "center"
  },
  promptText: {
    ...typography.small,
    color: colors.surface
  },
  screen: {
    alignItems: "center",
    backgroundColor: colors.brandPurpleDark,
    flex: 1
  },
  subtitle: {
    ...typography.body,
    color: "rgba(255,255,255,0.82)",
    maxWidth: 520,
    textAlign: "center"
  },
  title: {
    color: colors.surface,
    fontSize: 30,
    fontWeight: "900",
    textAlign: "center"
  },
  topRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    width: "100%"
  },
  transcript: {
    ...typography.body,
    color: colors.text,
    minHeight: 96,
    paddingVertical: spacing.sm
  },
  transcriptCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    maxWidth: 520,
    padding: spacing.md,
    width: "100%",
    ...shadows.lift
  },
  wave: {
    backgroundColor: "rgba(255,255,255,0.48)",
    borderRadius: 4,
    width: 4
  },
  waveActive: {
    backgroundColor: colors.surface
  },
  waveform: {
    alignItems: "center",
    flexDirection: "row",
    gap: 4,
    height: 44,
    justifyContent: "center"
  }
});
