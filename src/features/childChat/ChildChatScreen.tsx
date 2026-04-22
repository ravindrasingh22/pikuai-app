import React, { useMemo, useState } from "react";
import { Image, ImageBackground, KeyboardAvoidingView, Platform, Pressable, ScrollView, StatusBar, StyleSheet, Text, TextInput, View } from "react-native";
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
const topSafeInset = Platform.OS === "android" ? StatusBar.currentHeight ?? 0 : 54;

type FullScreenBackProps = {
  canGoBack?: boolean;
  onBack?: () => void;
};

type LocalChatThread = {
  id: string;
  title: string;
  threadId?: string;
  updatedAt: number;
  messages: ChatMessage[];
};

export function ChildPinScreen({ canGoBack, child, navigate, onBack }: FullScreenBackProps & { child: ChildProfile; navigate: Navigate }): React.JSX.Element {
  const [pin, setPin] = useState("");
  const handleChildBack = (): void => {
    navigate("childPicker", { resetHistory: true });
  };
  const verify = useAsyncAction(async () => {
    const result = await verifyChildPin(child.id, pin);
    if (!result.verified) throw new Error("Try that PIN again.");
    navigate("childChat", { child });
  });

  return (
    <View style={[styles.pinScreen, { paddingTop: topSafeInset + spacing.lg }]}>
      <BackCircle onPress={handleChildBack} />
      <Pressable accessibilityLabel="Go to welcome" accessibilityRole="button" onPress={() => navigate("welcome", { resetHistory: true })}>
        <Image source={pikuImages.icon} style={styles.pinLogo} resizeMode="contain" />
      </Pressable>
      <Avatar name={child.display_name} size={92} />
      <Text style={styles.chatTitle}>Hi {child.display_name}</Text>
      <Text style={styles.chatSubtitle}>Enter your child PIN to open your PikuAI space.</Text>
      <PikuTextField label="Child PIN" value={pin} onChangeText={setPin} keyboardType="number-pad" secureTextEntry maxLength={4} />
      {verify.error ? <Text style={styles.error}>{verify.error}</Text> : null}
      <PikuButton label="Open Chat" onPress={() => void verify.run()} loading={verify.loading} />
      <PikuButton label="Back to Children" onPress={handleChildBack} variant="ghost" style={styles.bottomBackButton} />
    </View>
  );
}

export function ChildChatScreen({ canGoBack, child, navigate, onBack }: FullScreenBackProps & { child: ChildProfile; navigate: Navigate }): React.JSX.Element {
  const [draft, setDraft] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const handleChildBack = (): void => {
    navigate("childPicker", { resetHistory: true });
  };
  const welcomeMessage: ChatMessage = useMemo(() => ({
    id: "hello",
    role: "assistant",
    text: `Hi ${child.display_name}! What shall we explore today?`,
    time: "Today"
  }), [child.display_name]);
  const initialLocalThreadId = useMemo(() => `chat-${Date.now()}`, []);
  const [threads, setThreads] = useState<LocalChatThread[]>([
    {
      id: initialLocalThreadId,
      title: "New chat",
      updatedAt: Date.now(),
      messages: [welcomeMessage]
    }
  ]);
  const [activeLocalThreadId, setActiveLocalThreadId] = useState<string>(initialLocalThreadId);

  const activeThread = useMemo(
    () => threads.find((thread) => thread.id === activeLocalThreadId) ?? threads[0],
    [activeLocalThreadId, threads]
  );

  const sortedThreads = useMemo(
    () => [...threads].sort((left, right) => right.updatedAt - left.updatedAt),
    [threads]
  );

  const startNewChat = (): void => {
    const localId = `chat-${Date.now()}`;
    const newThread: LocalChatThread = {
      id: localId,
      title: "New chat",
      updatedAt: Date.now(),
      messages: [welcomeMessage]
    };
    setThreads((current) => [newThread, ...current]);
    setActiveLocalThreadId(localId);
    setDrawerOpen(false);
    setDraft("");
  };

  const openThread = (localThreadId: string): void => {
    setActiveLocalThreadId(localThreadId);
    setDrawerOpen(false);
  };

  const send = useAsyncAction(async (text: string) => {
    const normalized = text.trim();
    if (!normalized || !activeThread) return;
    const childMessage: ChatMessage = { id: `child-${Date.now()}`, role: "child", text: normalized, time: "Now" };
    setThreads((current) =>
      current.map((thread) =>
        thread.id === activeThread.id
          ? {
              ...thread,
              messages: [...thread.messages, childMessage],
              title: thread.title === "New chat" ? normalized.slice(0, 34) : thread.title,
              updatedAt: Date.now()
            }
          : thread
      )
    );
    setDraft("");
    const response = await sendChildMessage({ childProfileId: child.id, threadId: activeThread.threadId, message: normalized });
    setThreads((current) =>
      current.map((thread) =>
        thread.id === activeThread.id
          ? {
              ...thread,
              threadId: response.thread_id,
              updatedAt: Date.now(),
              messages: [
                ...thread.messages,
                { id: response.message_id, role: "assistant", text: response.answer_text, time: "Now", policyBucket: response.policy_bucket }
              ]
            }
          : thread
      )
    );
  });

  const visibleMessages = useMemo(() => activeThread?.messages.slice(-6) ?? [], [activeThread]);

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.chatScreen}>
      <ImageBackground source={pikuImages.chatBackground} resizeMode="cover" style={[styles.sky, { paddingTop: topSafeInset + spacing.sm }]}>
        <View style={styles.chatHeader}>
          <Pressable onPress={() => setDrawerOpen(true)} style={styles.roundButton}>
            <Text style={styles.roundText}>☰</Text>
          </Pressable>
          <View style={styles.headerCopy}>
            <Text style={styles.chatTitle}>Hi {child.display_name}!</Text>
            <Text style={styles.chatSubtitle}>What shall we explore today?</Text>
          </View>
          <Avatar avatarKey={child.avatar_key} name={child.display_name} size={52} />
        </View>
        <View style={styles.starterRow}>
          {starters.map((starter) => (
            <Pressable key={starter} onPress={() => void send.run(starter)} style={styles.starterPill}>
              <Text style={styles.starterText}>{starter}</Text>
            </Pressable>
          ))}
        </View>
        {drawerOpen ? (
          <View style={styles.drawerOverlay}>
            <Pressable onPress={() => setDrawerOpen(false)} style={styles.drawerBackdrop} />
            <View style={styles.drawerPanel}>
              <Text style={styles.drawerTitle}>My Chats</Text>
              <Text style={styles.drawerSubtitle}>Pick an old chat or start a new one</Text>
              <PikuButton label="+ New Chat" onPress={startNewChat} variant="secondary" />
              <ScrollView contentContainerStyle={styles.drawerList}>
                {sortedThreads.map((thread) => {
                  const active = thread.id === activeThread?.id;
                  return (
                    <Pressable key={thread.id} onPress={() => openThread(thread.id)} style={[styles.threadRow, active && styles.threadRowActive]}>
                      <Text style={[styles.threadRowTitle, active && styles.threadRowTitleActive]} numberOfLines={1}>{thread.title}</Text>
                      <Text style={styles.threadRowMeta}>{thread.messages.length} messages</Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>
          </View>
        ) : null}
        <ScrollView contentContainerStyle={styles.messageListContent} showsVerticalScrollIndicator={false} style={styles.messageList}>
          {visibleMessages.map((message) => (
            <View key={message.id} style={[styles.messageRow, message.role === "child" && styles.childMessageRow]}>
              {message.role === "child" ? <Avatar avatarKey={child.avatar_key} name={child.display_name} size={34} /> : null}
              <View style={[styles.bubble, message.role === "child" ? styles.childBubble : styles.assistantBubble]}>
                <Text style={styles.bubbleText}>{message.text}</Text>
                {message.policyBucket ? <Text style={styles.policyText}>{message.policyBucket}</Text> : null}
              </View>
            </View>
          ))}
          {send.error ? <Text style={styles.error}>{send.error}</Text> : null}
        </ScrollView>
      </ImageBackground>
      <View style={styles.composer}>
        <TextInput
          blurOnSubmit={false}
          enablesReturnKeyAutomatically
          onSubmitEditing={() => void send.run(draft)}
          placeholder="Type a message..."
          placeholderTextColor={colors.textMuted}
          returnKeyType="send"
          value={draft}
          onChangeText={setDraft}
          style={styles.input}
        />
        <PikuButton label="Voice" onPress={() => navigate("voiceChat", { child })} variant="secondary" style={styles.modeButton} />
        <PikuButton label="Send" onPress={() => void send.run(draft)} loading={send.loading} style={styles.sendButton} />
      </View>
      <View style={styles.chatBottomAction}>
        <PikuButton label="Back to Children" onPress={handleChildBack} variant="ghost" style={styles.bottomBackButton} />
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
  bottomBackButton: {
    alignSelf: "stretch",
    marginTop: spacing.sm
  },
  chatBottomAction: {
    backgroundColor: colors.brandLilac,
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xs
  },
  drawerBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(58,32,142,0.5)"
  },
  drawerList: {
    gap: 6,
    paddingVertical: spacing.xs
  },
  drawerOverlay: {
    ...StyleSheet.absoluteFillObject,
    top: 118,
    justifyContent: "flex-start",
    zIndex: 20
  },
  drawerPanel: {
    backgroundColor: "rgba(247,241,255,0.7)",
    borderBottomRightRadius: radius.lg,
    borderColor: "rgba(216,198,255,0.72)",
    borderWidth: 1,
    minHeight: "72%",
    padding: spacing.sm,
    width: "74%"
  },
  drawerSubtitle: {
    color: colors.textSoft,
    fontSize: 10,
    fontWeight: "600",
    lineHeight: 14,
    marginBottom: spacing.xs
  },
  drawerTitle: {
    color: colors.brandPurple,
    fontSize: 18,
    fontWeight: "900",
    lineHeight: 23,
    marginBottom: 2
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
  childMessageRow: {
    alignSelf: "flex-end",
    flexDirection: "row-reverse"
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
  messageList: {
    flex: 1,
    minHeight: 0
  },
  messageListContent: {
    gap: spacing.sm,
    justifyContent: "flex-end",
    minHeight: "100%",
    paddingBottom: spacing.sm,
    paddingTop: spacing.sm
  },
  messageRow: {
    alignItems: "flex-end",
    alignSelf: "flex-start",
    flexDirection: "row",
    gap: spacing.xs,
    maxWidth: "92%"
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
    top: topSafeInset + spacing.sm,
    width: 44
  },
  pinLogo: {
    borderRadius: 16,
    height: 58,
    marginBottom: spacing.sm,
    width: 58
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
  },
  threadRow: {
    backgroundColor: "#fff9e8",
    borderColor: "#ffe2a6",
    borderRadius: radius.md,
    borderWidth: 1,
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xs
  },
  threadRowActive: {
    backgroundColor: "#e7f0ff",
    borderColor: "#bfd2ff"
  },
  threadRowMeta: {
    color: colors.textMuted,
    fontSize: 9,
    fontWeight: "700",
    lineHeight: 12,
    marginTop: 2
  },
  threadRowTitle: {
    color: colors.text,
    fontSize: 11,
    fontWeight: "800"
  },
  threadRowTitleActive: {
    color: colors.brandBlue
  }
});
