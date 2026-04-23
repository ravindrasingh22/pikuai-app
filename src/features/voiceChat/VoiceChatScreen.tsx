import React, { useEffect, useRef, useState } from "react";
import Voice, { type SpeechErrorEvent, type SpeechResultsEvent } from "@react-native-voice/voice";
import * as Speech from "expo-speech";
import { Image, ImageBackground, Platform, Pressable, ScrollView, StatusBar, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { pikuImages } from "../../assets/brand";
import { isAuthExpiredError } from "../../api/client";
import { sendChildMessage } from "../../api/mobileApi";
import { Avatar } from "../../components/common/Avatar";
import { useAsyncAction } from "../../hooks/useAsyncAction";
import { colors, radius, shadows, spacing, typography } from "../../theme/tokens";
import type { ChildProfile } from "../../types/domain";
import type { VoiceExchange } from "../../types/domain";
import type { Navigate } from "../../navigation/types";

const topSafeInset = Platform.OS === "android" ? StatusBar.currentHeight ?? 0 : 54;
const pauseSubmitMs = 5000;
const voiceDisabledUntilByChildId: Record<string, number> = {};
const voiceRemainingByChildId: Record<string, { dayKey: string; remainingSeconds: number }> = {};

type VoiceState = "idle" | "listening" | "thinking" | "answered" | "disabled";

type WebMediaDevices = {
  getUserMedia?: (constraints: { audio: boolean }) => Promise<{ getTracks: () => Array<{ stop: () => void }> }>;
};

declare const navigator: {
  mediaDevices?: WebMediaDevices;
} | undefined;

export function VoiceChatScreen({
  child,
  initialLocalThreadId,
  initialThreadId,
  navigate,
  onThreadPersisted,
  onSessionExpired
}: {
  canGoBack?: boolean;
  child: ChildProfile;
  initialLocalThreadId?: string;
  initialThreadId?: string;
  navigate: Navigate;
  onBack?: () => void;
  onSessionExpired?: () => void;
  onThreadPersisted?: () => void;
}): React.JSX.Element {
  const { height } = useWindowDimensions();
  const compact = height < 760;
  const initialSeconds = getVoiceRemainingSeconds(child);
  const disabledUntil = voiceDisabledUntilByChildId[child.id] ?? 0;
  const [remainingSeconds, setRemainingSeconds] = useState(disabledUntil > Date.now() ? 0 : initialSeconds);
  const [voiceState, setVoiceState] = useState<VoiceState>(disabledUntil > Date.now() || initialSeconds <= 0 ? "disabled" : "idle");
  const [transcript, setTranscript] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);
  const [displayedAnswer, setDisplayedAnswer] = useState("");
  const [policyBucket, setPolicyBucket] = useState<string | null>(null);
  const [voiceExchanges, setVoiceExchanges] = useState<VoiceExchange[]>([]);
  const [voiceConsent, setVoiceConsent] = useState<"unknown" | "granted" | "denied" | "unsupported">("unknown");
  const [consentMessage, setConsentMessage] = useState<string | null>(null);
  const pauseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const answerTypingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const transcriptScrollRef = useRef<ScrollView | null>(null);
  const submittedPromptRef = useRef("");
  const disabledRef = useRef(false);
  const transcriptRef = useRef("");
  const voiceExchangesRef = useRef<VoiceExchange[]>([]);
  const backendThreadIdRef = useRef(initialThreadId);
  const activeScreenRef = useRef(true);
  const autoStartedRef = useRef(false);
  const listening = voiceState === "listening";
  const disabled = voiceState === "disabled";

  useEffect(() => {
    disabledRef.current = disabled;
    transcriptRef.current = transcript;
  }, [disabled, transcript]);

  useEffect(() => {
    if (!listening) return;
    const interval = setInterval(() => {
      setRemainingSeconds((current) => {
        if (current <= 1) {
          clearInterval(interval);
          void stopListening();
          voiceDisabledUntilByChildId[child.id] = nextLocalDayStart();
          voiceRemainingByChildId[child.id] = { dayKey: todayKey(), remainingSeconds: 0 };
          setVoiceState("disabled");
          return 0;
        }
        const nextRemaining = current - 1;
        voiceRemainingByChildId[child.id] = { dayKey: todayKey(), remainingSeconds: nextRemaining };
        return nextRemaining;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [child.id, listening]);

  const submitPrompt = useAsyncAction(async (prompt: string) => {
    const normalized = prompt.trim();
    if (!normalized || normalized === submittedPromptRef.current || disabled) return;
    submittedPromptRef.current = normalized;
    clearPauseTimer();
    if (Platform.OS !== "web") {
      try {
        await Voice.stop();
      } catch {
        // Native recognition may already have stopped after the final result.
      }
    }
    setVoiceState("thinking");
    let response: Awaited<ReturnType<typeof sendChildMessage>>;
    try {
      response = await sendChildMessage({
        answerMode: "short_answer",
        childProfileId: child.id,
        inputMode: "voice",
        threadId: backendThreadIdRef.current,
        message: normalized
      });
    } catch (caught) {
      if (isAuthExpiredError(caught)) onSessionExpired?.();
      throw caught;
    }
    setAnswer(response.answer_text);
    setPolicyBucket(response.policy_bucket);
    backendThreadIdRef.current = response.thread_id;
    const exchange: VoiceExchange = {
      id: `voice-${Date.now()}`,
      answerText: response.answer_text,
      childText: normalized,
      policyBucket: response.policy_bucket,
      sourceLocalThreadId: initialLocalThreadId,
      threadId: response.thread_id
    };
    voiceExchangesRef.current = [...voiceExchangesRef.current, exchange];
    setVoiceExchanges(voiceExchangesRef.current);
    onThreadPersisted?.();
    setVoiceState("answered");
    speakAnswer(response.answer_text, () => {
      if (activeScreenRef.current && !disabledRef.current) {
        void startListening({ preserveAnswer: true });
      }
    });
  });

  const startListening = async (options?: { preserveAnswer?: boolean }): Promise<void> => {
    if (disabled) return;
    const consent = await ensureMicConsent();
    if (!consent) return;
    stopSpeech();
    if (!options?.preserveAnswer) {
      setAnswer(null);
      setDisplayedAnswer("");
      setPolicyBucket(null);
    }
    setTranscript("");
    transcriptRef.current = "";
    submittedPromptRef.current = "";
    try {
      if (Platform.OS !== "web") {
        try {
          await Voice.cancel();
        } catch {
          // Ignore stale recognizer state before starting a new native session.
        }
        await Voice.start("en-US");
      }
      setVoiceState("listening");
      setConsentMessage("Listening now. Pause for 5 seconds and Piku will answer.");
    } catch {
      setVoiceState("idle");
      setVoiceConsent("denied");
      setConsentMessage("Microphone or speech recognition could not start. Check device permissions and rebuild the dev app.");
    }
  };

  const stopListening = async (): Promise<void> => {
    clearPauseTimer();
    if (Platform.OS !== "web") {
      try {
        await Voice.stop();
      } catch {
        // Voice may already be stopped by the OS after a final speech result.
      }
    }
    setVoiceState(transcriptRef.current.trim() ? "answered" : "idle");
  };

  const cancelVoice = (): void => {
    clearPauseTimer();
    if (Platform.OS !== "web") {
      void Voice.cancel().catch(() => undefined);
    }
    stopSpeech();
    const completedExchanges = voiceExchangesRef.current.length ? voiceExchangesRef.current : voiceExchanges;
    navigate("childChat", completedExchanges.length ? { child, resetHistory: true, voiceExchanges: completedExchanges } : { child, resetHistory: true });
  };

  async function ensureMicConsent(): Promise<boolean> {
    if (voiceConsent === "granted") return true;
    const result = await requestMicConsent();
    setVoiceConsent(result);
    if (result === "granted") {
      setConsentMessage("Microphone is enabled. Pause for 5 seconds and Piku will answer.");
      return true;
    }
    if (result === "denied") {
      setConsentMessage("Microphone permission was not granted. Enable it in device settings to talk.");
      return false;
    }
    setConsentMessage("Speech recognition is not available on this device. Check microphone permissions and speech services.");
    return false;
  }

  function schedulePauseSubmit(value: string): void {
    clearPauseTimer();
    if (!value.trim()) return;
    pauseTimerRef.current = setTimeout(() => {
      void submitPrompt.run(value);
    }, pauseSubmitMs);
  }

  function clearPauseTimer(): void {
    if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current);
    pauseTimerRef.current = null;
  }

  function clearAnswerTypingTimer(): void {
    if (answerTypingTimerRef.current) clearTimeout(answerTypingTimerRef.current);
    answerTypingTimerRef.current = null;
  }

  function handleSpeechText(value?: string): void {
    const normalized = value?.trim();
    if (!normalized || disabledRef.current) return;
    setTranscript(normalized);
    setAnswer(null);
    setDisplayedAnswer("");
    setPolicyBucket(null);
    setVoiceState("listening");
    schedulePauseSubmit(normalized);
  }

  useEffect(() => {
    return () => {
      activeScreenRef.current = false;
      clearPauseTimer();
      clearAnswerTypingTimer();
    };
  }, []);

  useEffect(() => {
    const handle = setTimeout(() => transcriptScrollRef.current?.scrollToEnd({ animated: true }), 60);
    return () => clearTimeout(handle);
  }, [transcript, displayedAnswer, submitPrompt.loading]);

  useEffect(() => {
    clearAnswerTypingTimer();
    if (!answer) {
      setDisplayedAnswer("");
      return;
    }
    let index = 0;
    setDisplayedAnswer("");
    const typeNext = (): void => {
      index += 1;
      setDisplayedAnswer(answer.slice(0, index));
      if (index < answer.length) {
        answerTypingTimerRef.current = setTimeout(typeNext, 18);
      }
    };
    answerTypingTimerRef.current = setTimeout(typeNext, 40);
    return () => clearAnswerTypingTimer();
  }, [answer]);

  useEffect(() => {
    if (Platform.OS === "web") {
      return () => clearPauseTimer();
    }
    Voice.onSpeechStart = () => {
      setVoiceConsent("granted");
      setConsentMessage("Listening now. Pause for 5 seconds and Piku will answer.");
      setVoiceState("listening");
    };
    Voice.onSpeechPartialResults = (event: SpeechResultsEvent) => {
      handleSpeechText(event.value?.[0]);
    };
    Voice.onSpeechResults = (event: SpeechResultsEvent) => {
      handleSpeechText(event.value?.[0]);
    };
    Voice.onSpeechError = (event: SpeechErrorEvent) => {
      const message = event.error?.message?.trim();
      setVoiceState(transcriptRef.current.trim() ? "answered" : "idle");
      setConsentMessage(message ? `Speech recognition stopped: ${message}` : "Speech recognition stopped. Tap the mic to try again.");
    };
    Voice.onSpeechEnd = () => {
      if (!transcriptRef.current.trim()) setVoiceState("idle");
    };
    return () => {
      clearPauseTimer();
      stopSpeech();
      void Voice.destroy().catch(() => undefined).finally(() => Voice.removeAllListeners());
    };
  }, []);

  useEffect(() => {
    if (autoStartedRef.current || disabled) return;
    autoStartedRef.current = true;
    const handle = setTimeout(() => {
      void startListening();
    }, 250);
    return () => clearTimeout(handle);
  }, [disabled]);

  return (
    <ImageBackground source={pikuImages.voiceChatBackground} resizeMode="cover" style={[styles.screen, { paddingTop: topSafeInset + spacing.sm }]}>
      <View style={styles.topRow}>
        <Pressable accessibilityLabel="Close voice chat" accessibilityRole="button" onPress={cancelVoice} style={styles.closeCircle}>
          <Text style={styles.closeText}>×</Text>
        </Pressable>
        <View style={styles.badge}>
          <Text style={styles.badgeIcon}>▮</Text>
          <Text style={styles.badgeText}>Voice Chat</Text>
        </View>
        <View style={[styles.timerPill, remainingSeconds <= 60 && styles.timerPillDanger]}>
          <Text style={styles.timerText}>{formatTimer(remainingSeconds)}</Text>
        </View>
      </View>

      <View style={[styles.content, compact && styles.contentCompact]}>
        <View style={styles.childContext}>
          <Avatar avatarKey={child.avatar_key} name={child.display_name} size={38} />
          <Text style={styles.childContextText}>{child.display_name} · Age {child.age_band}</Text>
        </View>

        <View style={[styles.micWrap, compact && styles.micWrapCompact]}>
          <Pressable
            accessibilityRole="button"
            disabled={disabled}
            onPress={listening ? () => void stopListening() : () => void startListening()}
            style={[styles.micRing, compact && styles.micRingCompact, listening && styles.micRingActive, disabled && styles.micRingDisabled]}
          >
            <Text style={styles.mic}>🎙</Text>
          </Pressable>
          <Image source={pikuImages.icon} style={[styles.chick, compact && styles.chickCompact]} />
        </View>

        <Text style={styles.title}>{disabled ? "Voice chat paused" : listening ? "Listening..." : voiceState === "thinking" ? "Thinking..." : voiceState === "answered" ? "Piku is speaking" : "Connecting..."}</Text>
        <Text style={styles.subtitle}>
          {disabled ? "Voice time is finished for today." : consentMessage ?? "Speak naturally. Piku will answer after a short pause."}
        </Text>

        <View style={styles.transcriptCard}>
          <Text style={styles.label}>Live transcript</Text>
          <ScrollView
            contentContainerStyle={styles.transcriptContent}
            onContentSizeChange={() => transcriptScrollRef.current?.scrollToEnd({ animated: true })}
            ref={transcriptScrollRef}
            showsVerticalScrollIndicator={false}
            style={styles.transcriptScroll}
          >
            <Text style={styles.transcriptSpeaker}>
              {voiceState === "thinking" || answer ? "PikuAI" : child.display_name}
            </Text>
            <Text style={styles.transcriptText}>
              {voiceState === "thinking"
                ? "Thinking..."
                : answer
                  ? displayedAnswer
                  : transcript || (listening ? "Listening..." : "Waiting for speech...")}
            </Text>
          </ScrollView>
          {submitPrompt.error ? <Text style={styles.error}>{submitPrompt.error}</Text> : null}
        </View>
        {policyBucket ? <Text style={styles.policy}>{policyBucket}</Text> : null}

        {voiceConsent === "unsupported" ? (
          <View style={styles.noticeCard}>
            <Text style={styles.noticeText}>Speech recognition is not available on this device. Check microphone permissions and speech services.</Text>
          </View>
        ) : null}

      </View>
    </ImageBackground>
  );
}

function formatTimer(seconds: number): string {
  const safe = Math.max(0, seconds);
  const minutes = Math.floor(safe / 60).toString().padStart(2, "0");
  const remainder = Math.floor(safe % 60).toString().padStart(2, "0");
  return `${minutes}:${remainder}`;
}

function nextLocalDayStart(): number {
  const next = new Date();
  next.setDate(next.getDate() + 1);
  next.setHours(0, 0, 0, 0);
  return next.getTime();
}

function todayKey(): string {
  const now = new Date();
  return `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
}

function getVoiceRemainingSeconds(child: ChildProfile): number {
  const dayKey = todayKey();
  const stored = voiceRemainingByChildId[child.id];
  if (stored?.dayKey === dayKey) return stored.remainingSeconds;
  const initialSeconds = Math.max(0, Math.round((child.daily_time_limit_minutes ?? 30) * 60));
  voiceRemainingByChildId[child.id] = { dayKey, remainingSeconds: initialSeconds };
  return initialSeconds;
}

async function requestMicConsent(): Promise<"granted" | "denied" | "unsupported"> {
  if (Platform.OS !== "web") {
    try {
      const available = await Voice.isAvailable();
      return available ? "granted" : "unsupported";
    } catch {
      return "unsupported";
    }
  }
  if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) return "unsupported";
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    stream.getTracks().forEach((track) => track.stop());
    return "granted";
  } catch {
    return "denied";
  }
}

function speakAnswer(text: string, onDone?: () => void): void {
  Speech.stop().catch(() => undefined);
  Speech.speak(text, { onDone, pitch: 1.08, rate: 0.92 });
}

function stopSpeech(): void {
  Speech.stop().catch(() => undefined);
}

const styles = StyleSheet.create({
  badge: {
    alignItems: "center",
    alignSelf: "center",
    backgroundColor: "rgba(255,255,255,0.12)",
    borderColor: "rgba(255,255,255,0.26)",
    borderRadius: radius.pill,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs
  },
  badgeIcon: {
    color: "#ffd95d",
    fontWeight: "900"
  },
  badgeText: {
    ...typography.small,
    color: colors.surface
  },
  chick: {
    bottom: 4,
    height: 74,
    position: "absolute",
    right: 16,
    width: 74
  },
  chickCompact: {
    height: 58,
    width: 58
  },
  childContext: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.14)",
    borderColor: "rgba(255,255,255,0.26)",
    borderRadius: radius.pill,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs
  },
  childContextText: {
    ...typography.small,
    color: colors.surface
  },
  closeCircle: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.88)",
    borderRadius: radius.pill,
    height: 52,
    justifyContent: "center",
    width: 52
  },
  closeText: {
    color: colors.brandPurpleDark,
    fontSize: 36,
    lineHeight: 40
  },
  content: {
    alignItems: "center",
    gap: spacing.md,
    flex: 1,
    justifyContent: "space-between",
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
    width: "100%"
  },
  contentCompact: {
    gap: spacing.xs,
    paddingBottom: spacing.sm
  },
  error: {
    ...typography.small,
    color: colors.danger,
    marginTop: spacing.xs
  },
  label: {
    ...typography.small,
    color: colors.textMuted,
    marginBottom: spacing.xs
  },
  mic: {
    color: colors.surface,
    fontSize: 76,
    lineHeight: 86
  },
  micRing: {
    alignItems: "center",
    backgroundColor: "rgba(45,19,130,0.86)",
    borderColor: "#ffd95d",
    borderRadius: 118,
    borderWidth: 7,
    height: 218,
    justifyContent: "center",
    shadowColor: "#d06cff",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.82,
    shadowRadius: 28,
    width: 218,
    elevation: 8
  },
  micRingCompact: {
    borderRadius: 94,
    height: 178,
    width: 178
  },
  micRingActive: {
    borderColor: "#ffe889",
    shadowColor: "#ff7cff",
    shadowOpacity: 1,
    shadowRadius: 38,
    transform: [{ scale: 1.03 }]
  },
  micRingDisabled: {
    opacity: 0.48
  },
  micWrap: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 252,
    width: "100%"
  },
  micWrapCompact: {
    minHeight: 196
  },
  noticeCard: {
    backgroundColor: "rgba(255,255,255,0.92)",
    borderColor: colors.brandLilacDeep,
    borderRadius: radius.md,
    borderWidth: 1,
    maxWidth: 560,
    padding: spacing.sm,
    width: "100%"
  },
  noticeText: {
    ...typography.small,
    color: colors.textSoft,
    textAlign: "center"
  },
  policy: {
    ...typography.tiny,
    color: colors.green,
    marginTop: spacing.xs
  },
  screen: {
    alignItems: "center",
    flex: 1
  },
  subtitle: {
    ...typography.body,
    color: "rgba(255,255,255,0.82)",
    maxWidth: 520,
    textAlign: "center"
  },
  timerPill: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.92)",
    borderRadius: radius.pill,
    minWidth: 78,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs
  },
  timerPillDanger: {
    backgroundColor: colors.dangerSoft
  },
  timerText: {
    ...typography.section,
    color: colors.brandPurpleDark,
    fontSize: 16
  },
  title: {
    color: colors.surface,
    fontSize: 34,
    fontWeight: "900",
    textAlign: "center"
  },
  topRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    width: "100%"
  },
  transcriptCard: {
    backgroundColor: "rgba(255,255,255,0.96)",
    borderRadius: 28,
    flexShrink: 0,
    maxWidth: 560,
    minHeight: 132,
    padding: spacing.md,
    width: "100%",
    ...shadows.lift
  },
  transcriptContent: {
    paddingBottom: spacing.xs
  },
  transcriptScroll: {
    maxHeight: 102,
    minHeight: 70
  },
  transcriptSpeaker: {
    ...typography.tiny,
    color: colors.textMuted,
    fontWeight: "900",
    marginBottom: 2
  },
  transcriptText: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "700",
    lineHeight: 21
  }
});
