import React, { useMemo, useState } from "react";
import { Image, ImageBackground, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { pikuImages } from "../../assets/brand";
import { sendChildMessage, verifyChildPin } from "../../api/mobileApi";
import { Avatar } from "../../components/common/Avatar";
import { PikuButton } from "../../components/common/PikuButton";
import { PikuCard } from "../../components/common/PikuCard";
import { PikuTextField } from "../../components/common/PikuTextField";
import { useAsyncAction } from "../../hooks/useAsyncAction";
import { colors, radius, shadows, spacing, typography } from "../../theme/tokens";
import type { ChatMessage, ChildProfile } from "../../types/domain";
import type { Navigate } from "../../navigation/types";

const starters = ["Tell me a fun fact", "Why do we dream?", "How do rainbows form?"];

type FullScreenBackProps = {
  canGoBack?: boolean;
  onBack?: () => void;
};

export function ChildPinScreen({ canGoBack, child, navigate, onBack }: FullScreenBackProps & { child: ChildProfile; navigate: Navigate }): React.JSX.Element {
  const [pin, setPin] = useState("");
  const verify = useAsyncAction(async () => {
    const result = await verifyChildPin(child.id, pin);
    if (!result.verified) throw new Error("Try that PIN again.");
    navigate("childChat", { child });
  });

  return (
    <View style={styles.pinScreen}>
      {canGoBack && onBack ? <BackCircle onPress={onBack} /> : null}
      <Avatar name={child.display_name} size={92} />
      <Text style={styles.chatTitle}>Hi {child.display_name}</Text>
      <Text style={styles.chatSubtitle}>Enter your child PIN to open your PikuAI space.</Text>
      <PikuTextField label="Child PIN" value={pin} onChangeText={setPin} keyboardType="number-pad" secureTextEntry maxLength={4} />
      {verify.error ? <Text style={styles.error}>{verify.error}</Text> : null}
      <PikuButton label="Open Chat" onPress={() => void verify.run()} loading={verify.loading} />
    </View>
  );
}

export function ChildChatScreen({ canGoBack, child, navigate, onBack }: FullScreenBackProps & { child: ChildProfile; navigate: Navigate }): React.JSX.Element {
  const [threadId, setThreadId] = useState<string | undefined>();
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: "hello", role: "assistant", text: `Hi ${child.display_name}! What shall we explore today?`, time: "Today" }
  ]);
  const send = useAsyncAction(async (text: string) => {
    if (!text.trim()) return;
    const childMessage: ChatMessage = { id: `child-${Date.now()}`, role: "child", text: text.trim(), time: "Now" };
    setMessages((current) => [...current, childMessage]);
    setDraft("");
    const response = await sendChildMessage({ childProfileId: child.id, threadId, message: text.trim() });
    setThreadId(response.thread_id);
    setMessages((current) => [
      ...current,
      { id: response.message_id, role: "assistant", text: response.answer_text, time: "Now", policyBucket: response.policy_bucket }
    ]);
  });

  const visibleMessages = useMemo(() => messages.slice(-6), [messages]);

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.chatScreen}>
      <ImageBackground source={pikuImages.chatBackground} resizeMode="cover" style={styles.sky}>
        <View style={styles.chatHeader}>
          <Pressable onPress={canGoBack && onBack ? onBack : () => navigate("childPicker")} style={styles.roundButton}>
            <Text style={styles.roundText}>‹</Text>
          </Pressable>
          <View style={styles.headerCopy}>
            <Text style={styles.chatTitle}>Hi {child.display_name}!</Text>
            <Text style={styles.chatSubtitle}>What shall we explore today?</Text>
          </View>
          <Image source={pikuImages.icon} style={styles.mascot} />
        </View>
        <View style={styles.starterRow}>
          {starters.map((starter) => (
            <Pressable key={starter} onPress={() => void send.run(starter)} style={styles.starterPill}>
              <Text style={styles.starterText}>{starter}</Text>
            </Pressable>
          ))}
        </View>
        <View style={styles.messageList}>
          {visibleMessages.map((message) => (
            <View key={message.id} style={[styles.bubble, message.role === "child" ? styles.childBubble : styles.assistantBubble]}>
              <Text style={styles.bubbleText}>{message.text}</Text>
              {message.policyBucket ? <Text style={styles.policyText}>{message.policyBucket}</Text> : null}
            </View>
          ))}
          {send.error ? <Text style={styles.error}>{send.error}</Text> : null}
        </View>
      </ImageBackground>
      <View style={styles.composer}>
        <TextInput
          placeholder="Type a message..."
          placeholderTextColor={colors.textMuted}
          value={draft}
          onChangeText={setDraft}
          style={styles.input}
        />
        <PikuButton label="Voice" onPress={() => navigate("voiceChat", { child })} variant="secondary" style={styles.modeButton} />
        <PikuButton label="Send" onPress={() => void send.run(draft)} loading={send.loading} style={styles.sendButton} />
      </View>
    </KeyboardAvoidingView>
  );
}

function BackCircle({ onPress }: { onPress: () => void }): React.JSX.Element {
  return (
    <Pressable accessibilityLabel="Go back" accessibilityRole="button" onPress={onPress} style={styles.pinBackButton}>
      <Text style={styles.roundText}>‹</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  assistantBubble: {
    alignSelf: "flex-start",
    backgroundColor: colors.surface,
    borderBottomLeftRadius: radius.sm
  },
  bubble: {
    borderRadius: radius.lg,
    maxWidth: "82%",
    padding: spacing.md,
    ...shadows.card
  },
  bubbleText: {
    ...typography.body,
    color: colors.text
  },
  chatHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.md
  },
  chatScreen: {
    backgroundColor: colors.brandLilac,
    flex: 1
  },
  chatSubtitle: {
    ...typography.body,
    color: colors.surface
  },
  chatTitle: {
    ...typography.title,
    color: colors.surface
  },
  childBubble: {
    alignSelf: "flex-end",
    backgroundColor: colors.blueSoft,
    borderBottomRightRadius: radius.sm
  },
  composer: {
    alignItems: "center",
    backgroundColor: colors.brandLilac,
    flexDirection: "row",
    gap: spacing.xs,
    padding: spacing.md
  },
  error: {
    ...typography.small,
    color: colors.danger,
    textAlign: "center"
  },
  headerCopy: {
    flex: 1
  },
  input: {
    ...typography.body,
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    color: colors.text,
    flex: 1,
    minHeight: 48,
    paddingHorizontal: spacing.md
  },
  mascot: {
    height: 86,
    width: 86
  },
  messageList: {
    flex: 1,
    gap: spacing.sm,
    justifyContent: "flex-end"
  },
  modeButton: {
    minHeight: 48,
    width: 76
  },
  pinScreen: {
    alignItems: "center",
    backgroundColor: colors.brandPurple,
    flex: 1,
    justifyContent: "center",
    padding: spacing.xl
  },
  pinBackButton: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.85)",
    borderRadius: radius.pill,
    height: 44,
    justifyContent: "center",
    left: spacing.lg,
    position: "absolute",
    top: spacing.xl,
    width: 44
  },
  policyText: {
    ...typography.tiny,
    color: colors.green,
    marginTop: spacing.xs
  },
  roundButton: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.85)",
    borderRadius: radius.pill,
    height: 44,
    justifyContent: "center",
    width: 44
  },
  roundText: {
    color: colors.brandPurple,
    fontSize: 32,
    fontWeight: "900",
    lineHeight: 34,
    marginTop: -3
  },
  sendButton: {
    minHeight: 48,
    width: 72
  },
  sky: {
    flex: 1,
    overflow: "hidden",
    padding: spacing.md
  },
  starterPill: {
    backgroundColor: "rgba(255,255,255,0.86)",
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs
  },
  starterRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
    marginBottom: spacing.md
  },
  starterText: {
    ...typography.small,
    color: colors.brandPurple
  }
});
