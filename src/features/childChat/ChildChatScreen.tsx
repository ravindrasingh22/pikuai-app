import React, { useEffect, useMemo, useRef, useState } from "react";
import { Image, ImageBackground, KeyboardAvoidingView, Platform, Pressable, ScrollView, StatusBar, StyleSheet, Text, TextInput, View } from "react-native";
import { pikuImages } from "../../assets/brand";
import { isAuthExpiredError } from "../../api/client";
import { sendChildMessage, verifyChildPin } from "../../api/mobileApi";
import { Avatar } from "../../components/common/Avatar";
import { PikuButton } from "../../components/common/PikuButton";
import { PikuCard } from "../../components/common/PikuCard";
import { PikuTextField } from "../../components/common/PikuTextField";
import { useAsyncAction } from "../../hooks/useAsyncAction";
import { colors, radius, shadows, spacing, typography } from "../../theme/tokens";
import type { ChatMessage, ChildProfile, TranscriptThread, VoiceExchange } from "../../types/domain";
import type { Navigate } from "../../navigation/types";

const starters = ["Tell me a fun fact", "Why do we dream?", "How do rainbows form?"];
const topSafeInset = Platform.OS === "android" ? StatusBar.currentHeight ?? 0 : 54;

type FullScreenBackProps = {
  canGoBack?: boolean;
  onBack?: () => void;
  onSessionExpired?: () => void;
};

type LocalChatThread = {
  id: string;
  title: string;
  threadId?: string;
  updatedAt: number;
  messages: ChatMessage[];
};

export function ChildPinScreen({ canGoBack, child, navigate, onBack, onSessionExpired }: FullScreenBackProps & { child: ChildProfile; navigate: Navigate }): React.JSX.Element {
  const [pin, setPin] = useState("");
  const handleChildBack = (): void => {
    navigate("childPicker", { resetHistory: true });
  };
  const verify = useAsyncAction(async () => {
    let result: { verified: boolean; child_profile_id: string };
    try {
      result = await verifyChildPin(child.id, pin);
    } catch (caught) {
      if (isAuthExpiredError(caught)) {
        onSessionExpired?.();
      }
      throw caught;
    }
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

export function ChildChatScreen({
  canGoBack,
  child,
  navigate,
  onBack,
  onSessionExpired,
  onThreadPersisted,
  onVoiceExchangeConsumed,
  transcriptThreads,
  voiceExchanges
}: FullScreenBackProps & {
  child: ChildProfile;
  navigate: Navigate;
  onThreadPersisted?: () => void;
  onVoiceExchangeConsumed?: () => void;
  transcriptThreads?: TranscriptThread[];
  voiceExchanges?: VoiceExchange[];
}): React.JSX.Element {
  const [draft, setDraft] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const messageScrollRef = useRef<ScrollView | null>(null);
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
  const persistedThreads = useMemo(
    () => transcriptThreadsToLocalThreads(transcriptThreads ?? [], child.id, welcomeMessage),
    [child.id, transcriptThreads, welcomeMessage]
  );
  const [threads, setThreads] = useState<LocalChatThread[]>([
    ...persistedThreads,
    createEmptyLocalThread(initialLocalThreadId, welcomeMessage)
  ]);
  const [activeLocalThreadId, setActiveLocalThreadId] = useState<string>(persistedThreads[0]?.id ?? initialLocalThreadId);
  const consumedVoiceExchangeKey = useRef<string | null>(null);

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
    const newThread = createEmptyLocalThread(localId, welcomeMessage);
    setThreads((current) => [newThread, ...current]);
    setActiveLocalThreadId(localId);
    setDrawerOpen(false);
    setDraft("");
  };

  const openThread = (localThreadId: string): void => {
    setActiveLocalThreadId(localThreadId);
    setDrawerOpen(false);
  };

  useEffect(() => {
    if (!persistedThreads.length) return;
    setThreads((current) => {
      const unsavedThreads = current.filter((thread) => !thread.threadId && thread.messages.length > 1);
      return [...persistedThreads, ...unsavedThreads, createEmptyLocalThread(initialLocalThreadId, welcomeMessage)];
    });
    setActiveLocalThreadId((current) =>
      persistedThreads.some((thread) => thread.id === current) ? current : persistedThreads[0].id
    );
  }, [initialLocalThreadId, persistedThreads, welcomeMessage]);

  useEffect(() => {
    if (!voiceExchanges?.length) return;
    const exchangeKey = voiceExchanges.map((exchange) => exchange.id).join("|");
    if (consumedVoiceExchangeKey.current === exchangeKey) return;
    consumedVoiceExchangeKey.current = exchangeKey;
    const targetLocalThreadId = voiceExchanges[0]?.sourceLocalThreadId ?? activeLocalThreadId;
    const voiceMessages = voiceExchanges.flatMap((exchange) => [
      { id: `${exchange.id}-child`, role: "child" as const, text: exchange.childText, time: "Now", isVoice: true },
      {
        id: `${exchange.id}-assistant`,
        role: "assistant" as const,
        text: exchange.answerText,
        time: "Now",
        isVoice: true,
        policyBucket: exchange.policyBucket
      }
    ]);
    setThreads((current) =>
      current.map((thread) =>
        thread.id === targetLocalThreadId
          ? {
              ...thread,
              messages: [...thread.messages, ...voiceMessages],
              threadId: voiceExchanges[voiceExchanges.length - 1]?.threadId ?? thread.threadId,
              title: thread.title === "New chat" ? makeThreadTitle(voiceExchanges[0]?.childText ?? "") : thread.title,
              updatedAt: Date.now()
            }
          : thread
      )
    );
    setActiveLocalThreadId(targetLocalThreadId);
    onThreadPersisted?.();
    onVoiceExchangeConsumed?.();
  }, [activeLocalThreadId, onThreadPersisted, onVoiceExchangeConsumed, voiceExchanges]);

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
              title: thread.title === "New chat" ? makeThreadTitle(normalized) : thread.title,
              updatedAt: Date.now()
            }
          : thread
      )
    );
    setDraft("");
    let response: Awaited<ReturnType<typeof sendChildMessage>>;
    try {
      response = await sendChildMessage({ childProfileId: child.id, threadId: activeThread.threadId, message: normalized });
    } catch (caught) {
      if (isAuthExpiredError(caught)) {
        onSessionExpired?.();
      }
      throw caught;
    }
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
    onThreadPersisted?.();
  });

  const visibleMessages = useMemo(() => activeThread?.messages.slice(-6) ?? [], [activeThread]);
  const showStarterPrompts = (activeThread?.messages.length ?? 0) <= 1;

  useEffect(() => {
    const handle = setTimeout(() => messageScrollRef.current?.scrollToEnd({ animated: true }), 80);
    return () => clearTimeout(handle);
  }, [activeLocalThreadId, visibleMessages.length, send.loading]);

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
          <Pressable accessibilityLabel="Go to welcome" accessibilityRole="button" onPress={() => navigate("welcome", { resetHistory: true })}>
            <Image source={pikuImages.icon} style={styles.mascot} />
          </Pressable>
        </View>
        {drawerOpen ? (
          <View style={styles.drawerOverlay}>
            <Pressable onPress={() => setDrawerOpen(false)} style={styles.drawerBackdrop} />
            <View style={styles.drawerPanel}>
              <Text style={styles.drawerTitle}>My Chats</Text>
              <Text style={styles.drawerSubtitle}>Pick an old chat or start a new one</Text>
              <PikuButton label="+ New Chat" onPress={startNewChat} variant="secondary" />
              <ScrollView contentContainerStyle={styles.drawerList} style={styles.drawerScroll}>
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
              <Pressable accessibilityRole="button" onPress={handleChildBack} style={styles.drawerBackButton}>
                <Text style={styles.drawerBackText}>Back to Children</Text>
              </Pressable>
            </View>
          </View>
        ) : null}
        <ScrollView
          contentContainerStyle={styles.messageListContent}
          onContentSizeChange={() => messageScrollRef.current?.scrollToEnd({ animated: true })}
          ref={messageScrollRef}
          showsVerticalScrollIndicator={false}
          style={styles.messageList}
        >
          {visibleMessages.map((message) => (
            <View key={message.id} style={[styles.messageRow, message.role === "child" && styles.childMessageRow]}>
              {message.role === "child" ? (
                <Avatar avatarKey={child.avatar_key} name={child.display_name} size={34} />
              ) : (
                <Image source={pikuImages.icon} style={styles.assistantAvatar} resizeMode="cover" />
              )}
              <View
                style={[
                  styles.bubble,
                  message.role === "child" ? styles.childBubble : styles.assistantBubble,
                  message.isVoice && (message.role === "child" ? styles.childVoiceBubble : styles.assistantVoiceBubble)
                ]}
              >
                <Text style={[styles.bubbleText, message.isVoice && styles.voiceBubbleText]}>{message.text}</Text>
                {message.isVoice ? (
                  <Text style={[styles.voiceMeta, message.role === "child" && styles.childVoiceMeta]}>
                    {message.role === "child" ? `${child.display_name} said by voice` : "PikuAI voice response"}
                  </Text>
                ) : null}
                {message.policyBucket ? <Text style={styles.policyText}>{message.policyBucket}</Text> : null}
              </View>
            </View>
          ))}
          {showStarterPrompts ? (
            <View style={styles.messageRow}>
              <Image source={pikuImages.icon} style={styles.assistantAvatar} resizeMode="cover" />
              <View style={[styles.bubble, styles.assistantBubble, styles.starterBubble]}>
                <Text style={styles.starterIntro}>Try one of these:</Text>
                <View style={styles.starterRow}>
                  {starters.map((starter) => (
                    <Pressable key={starter} onPress={() => void send.run(starter)} style={styles.starterPill}>
                      <Text style={styles.starterText}>{starter}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            </View>
          ) : null}
          {send.error ? <Text style={styles.error}>{send.error}</Text> : null}
        </ScrollView>
      </ImageBackground>
      <View style={styles.composer}>
        <View style={styles.inputBar}>
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
          <Pressable
            accessibilityLabel="Start voice chat"
            accessibilityRole="button"
            onPress={() => navigate("voiceChat", { child, voiceThread: { localThreadId: activeThread.id, threadId: activeThread.threadId } })}
            style={styles.micCircle}
          >
            <Image source={pikuImages.micIcon} style={styles.micComposerIcon} resizeMode="contain" />
          </Pressable>
          <Pressable accessibilityLabel="Send message" accessibilityRole="button" onPress={() => void send.run(draft)} style={styles.sendCircle}>
            <Text style={styles.sendArrow}>{">"}</Text>
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

function makeThreadTitle(text: string): string {
  const normalized = text.trim().replace(/\s+/g, " ");
  if (!normalized) return "Voice chat";
  return normalized.length > 34 ? `${normalized.slice(0, 31)}...` : normalized;
}

function createEmptyLocalThread(id: string, welcomeMessage: ChatMessage): LocalChatThread {
  return {
    id,
    title: "New chat",
    updatedAt: Date.now(),
    messages: [welcomeMessage]
  };
}

function transcriptThreadsToLocalThreads(
  transcriptThreads: TranscriptThread[],
  childId: string,
  welcomeMessage: ChatMessage
): LocalChatThread[] {
  return transcriptThreads
    .filter((thread) => thread.child_profile_id === childId)
    .map((thread) => {
      const messages = thread.messages.map((message): ChatMessage => ({
        id: message.id,
        isVoice: message.input_mode === "voice",
        role: message.sender_type === "child" ? "child" : "assistant",
        text: message.rendered_text,
        time: formatMessageTime(message.created_at),
        policyBucket: message.policy_bucket
      }));
      return {
        id: thread.id,
        threadId: thread.id,
        title: thread.title || makeThreadTitle(messages.find((message) => message.role === "child")?.text ?? ""),
        updatedAt: timestampToMillis(thread.updated_at ?? thread.created_at),
        messages: messages.length ? messages : [welcomeMessage]
      };
    });
}

function timestampToMillis(value?: string): number {
  const parsed = value ? Date.parse(value) : Number.NaN;
  return Number.isNaN(parsed) ? Date.now() : parsed;
}

function formatMessageTime(value?: string): string {
  if (!value) return "Now";
  const parsed = Date.parse(value);
  if (Number.isNaN(parsed)) return "Now";
  return new Date(parsed).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

function BackCircle({ onPress }: { onPress: () => void }): React.JSX.Element {
  return (
    <Pressable accessibilityLabel="Go back" accessibilityRole="button" onPress={onPress} style={styles.pinBackButton}>
      <Text style={styles.roundText}>‹</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  assistantAvatar: {
    borderColor: "rgba(255,255,255,0.88)",
    borderRadius: 17,
    borderWidth: 2,
    height: 34,
    width: 34
  },
  assistantBubble: {
    alignSelf: "flex-start",
    backgroundColor: colors.surface,
    borderBottomLeftRadius: radius.sm
  },
  assistantVoiceBubble: {
    borderColor: "rgba(109,40,217,0.24)",
    borderWidth: 1
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
  voiceBubbleText: {
    fontStyle: "italic"
  },
  voiceMeta: {
    ...typography.tiny,
    color: colors.textMuted,
    fontStyle: "italic",
    marginTop: spacing.xs
  },
  drawerBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(58,32,142,0.5)"
  },
  drawerList: {
    gap: 6,
    paddingBottom: spacing.sm,
    paddingTop: spacing.xs
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
    display: "flex",
    minHeight: "72%",
    padding: spacing.sm,
    width: "74%"
  },
  drawerScroll: {
    flex: 1,
    minHeight: 0
  },
  drawerBackButton: {
    alignItems: "center",
    backgroundColor: colors.brandPurple,
    borderRadius: radius.md,
    minHeight: 44,
    justifyContent: "center",
    marginTop: spacing.sm,
    paddingHorizontal: spacing.sm
  },
  drawerBackText: {
    ...typography.body,
    color: colors.surface,
    fontWeight: "900"
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
    marginBottom: spacing.xs
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
  childVoiceBubble: {
    backgroundColor: "#eef5ff",
    borderColor: "rgba(46,112,255,0.22)",
    borderWidth: 1
  },
  childVoiceMeta: {
    color: colors.brandBlue
  },
  composer: {
    alignItems: "center",
    backgroundColor: "#ab91ff",
    borderTopColor: "rgba(255,255,255,0.4)",
    borderTopWidth: 1,
    gap: spacing.xs,
    paddingBottom: Platform.OS === "ios" ? 34 : spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingTop: spacing.xs
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
    color: colors.text,
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    maxHeight: 78,
    minHeight: 36,
    paddingHorizontal: spacing.xs,
    paddingVertical: 6
  },
  inputBar: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    borderColor: "rgba(120,88,246,0.16)",
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.xs,
    minHeight: 48,
    paddingHorizontal: spacing.xs,
    paddingVertical: 4,
    width: "100%",
    ...shadows.card
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
  mascot: {
    height: 72,
    width: 72
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
  micCircle: {
    alignItems: "center",
    backgroundColor: "#fff1c7",
    borderRadius: radius.pill,
    height: 38,
    justifyContent: "center",
    width: 38
  },
  micComposerIcon: {
    height: 25,
    width: 22
  },
  sendArrow: {
    color: colors.surface,
    fontSize: 24,
    fontWeight: "900",
    lineHeight: 28
  },
  sendCircle: {
    alignItems: "center",
    backgroundColor: colors.brandPurple,
    borderRadius: radius.pill,
    height: 38,
    justifyContent: "center",
    width: 38
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
  sky: {
    flex: 1,
    overflow: "hidden",
    padding: spacing.md
  },
  starterPill: {
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs
  },
  starterBubble: {
    gap: spacing.xs,
    maxWidth: "100%"
  },
  starterIntro: {
    ...typography.small,
    color: colors.textSoft,
    fontWeight: "800"
  },
  starterRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs
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
