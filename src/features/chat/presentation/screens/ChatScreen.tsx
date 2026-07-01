import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Image, Modal, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../../app/navigation/routes';
import { ScreenShell } from '../../../../core/components/ScreenShell';
import { Brand } from '../../../../core/components/Brand';
import { Island } from '../../../../core/components/Cards';
import { AppText } from '../../../../core/components/AppText';
import { AppButton } from '../../../../core/components/AppButton';
import { Icons, Images } from '../../../../core/assets/assets';
import { avatarForKid } from '../../../parent/presentation/viewmodels/useParentViewModel';
import { useChatViewModel } from '../viewmodels/useChatViewModel';
import { colors } from '../../../../core/theme/colors';
import { radius, spacing } from '../../../../core/theme/spacing';
import { typography } from '../../../../core/theme/typography';

type Props = NativeStackScreenProps<RootStackParamList, 'Chat'>;

export function ChatScreen({ navigation, route }: Props) {
  const vm = useChatViewModel(route.params?.chatId);
  const [history, setHistory] = useState(false);
  const [upload, setUpload] = useState(false);
  const [typedTextById, setTypedTextById] = useState<Record<string, string>>({});
  const seenMessageIds = useRef<Set<string>>(new Set());
  const activeTypingTimers = useRef<ReturnType<typeof setInterval>[]>([]);
  const activeChatId = useRef<string | undefined>(undefined);
  const messageScrollRef = useRef<ScrollView>(null);
  const chat = vm.currentChat;
  const kidSource = avatarForKid(vm.activeKid.avatar);
  const heroQuestion = chat?.title || chat?.preview || 'Ask anything you want to learn';
  const hasMessages = Boolean(chat?.messages.length);
  const submitDraft = () => {
    if (!vm.sending && vm.draft.trim()) vm.send();
  };

  useEffect(() => {
    const messages = chat?.messages ?? [];
    if (activeChatId.current !== chat?.id) {
      activeChatId.current = chat?.id;
      seenMessageIds.current = new Set(messages.map((message) => message.id));
      setTypedTextById({});
      return;
    }

    messages.forEach((message) => {
      if (seenMessageIds.current.has(message.id)) return;
      seenMessageIds.current.add(message.id);
      if (message.role !== 'ai' || message.text === 'Thinking...') return;

      setTypedTextById((current) => ({ ...current, [message.id]: '' }));
      let index = 0;
      const timer = setInterval(() => {
        index += 2;
        setTypedTextById((current) => ({ ...current, [message.id]: message.text.slice(0, index) }));
        if (index >= message.text.length) clearInterval(timer);
      }, 18);
      activeTypingTimers.current.push(timer);
    });
  }, [chat?.id, chat?.messages]);

  useEffect(() => () => {
    activeTypingTimers.current.forEach((timer) => clearInterval(timer));
    activeTypingTimers.current = [];
  }, []);

  useEffect(() => {
    requestAnimationFrame(() => {
      messageScrollRef.current?.scrollToEnd({ animated: true });
    });
  }, [chat?.messages.length, typedTextById, vm.sending]);

  return (
    <ScreenShell scroll={false} background="default" bottomWave={false} noPadding contentStyle={styles.shellContent}>
      <View style={styles.full}>
        <View style={styles.header}>
          <View style={styles.chatHeaderLeft}>
            <Pressable style={styles.historyButton} onPress={() => setHistory(true)} accessibilityRole="button" accessibilityLabel="Open previous chats">
              <View style={styles.menuLine}/><View style={[styles.menuLine, styles.menuLineShort]}/><View style={styles.menuLine}/>
            </Pressable>
            <Brand variant="icon" style={styles.headerBrand} />
          </View>
          <View style={styles.chatHeaderRight}>
            <Pressable style={[styles.pin, chat?.pinned && styles.pinActive]} onPress={() => chat && vm.dispatch({ type: 'chat/togglePin', payload: chat.id })} disabled={!chat} accessibilityRole="button" accessibilityLabel={chat?.pinned ? 'Unpin this chat' : 'Pin this chat'}>
              <Image source={Icons.pin} style={[styles.pinIcon, chat?.pinned && styles.pinIconActive]} />
            </Pressable>
            <Pressable style={styles.timer} onPress={() => navigation.navigate('TimerDemo')} accessibilityRole="button" accessibilityLabel="Show learning streak">
              <AppText variant="tiny" style={styles.timerText}>4d</AppText>
              <View style={styles.streakBadge}><AppText variant="tiny" style={styles.streakText}>4h</AppText></View>
            </Pressable>
            <View style={styles.profileGroup}>
              <Pressable onPress={() => navigation.navigate('Login', { mode: 'parent' })} style={styles.chatAvatarButton} accessibilityRole="button" accessibilityLabel="Parent profile">
                <Image source={Icons.parentProfile} style={styles.chatAvatarImage} />
              </Pressable>
              <Pressable onPress={() => navigation.navigate('AvatarLibrary')} style={[styles.chatAvatarButton, styles.chatAvatarActive]} accessibilityRole="button" accessibilityLabel="Child profile">
                <Image source={kidSource} style={styles.chatAvatarImage} />
              </Pressable>
            </View>
          </View>
        </View>
        {!hasMessages ? <View style={styles.featureSummary}>
          <View style={styles.featureBubble}>
            <AppText variant="h3" numberOfLines={3} style={styles.featureTitle}>{heroQuestion}</AppText>
          </View>
          <Image source={kidSource} style={styles.questionAvatar} />
        </View> : null}
        <ScrollView
          ref={messageScrollRef}
          style={styles.messagePane}
          contentContainerStyle={styles.messagePaneContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          onContentSizeChange={() => messageScrollRef.current?.scrollToEnd({ animated: true })}
        >
          {hasMessages ? <View style={styles.dateDivider}><View style={styles.dateLine} /><AppText variant="tiny" style={styles.dateText}>Today</AppText><View style={styles.dateLine} /></View> : null}
          {hasMessages ? chat?.messages.map((message) => (
            <View key={message.id} style={[styles.messageClean, message.role === 'kid' ? styles.messageKid : styles.messageAi]}>
              <View style={styles.cleanBubbleWrap}>
                <View style={[styles.cleanBubble, message.role === 'kid' ? styles.kidBubble : styles.aiBubble]}>
                  {message.role === 'ai' ? <AppText variant="tiny" style={styles.assistantLabel}>Pratvim</AppText> : null}
                  <AppText variant="small" style={styles.bubbleText}>{typedTextById[message.id] ?? message.text}</AppText>
                  <AppText variant="tiny" style={styles.bubbleTime}>{message.time}</AppText>
                </View>
              </View>
            </View>
          )) : <Island strong style={styles.emptyChat}><View style={styles.emptyIcon}><Brand variant="icon" style={styles.emptyIconImage} /></View><AppText variant="h2" style={styles.emptyTitle}>Hi, {vm.activeKid.name}</AppText><AppText variant="small" style={styles.emptyText}>Type a question, use voice, or add a picture. Pratvim will explain it in simple, protected language.</AppText></Island>}
        </ScrollView>
        <View style={styles.chatFooter}>
          <View style={[styles.composer, vm.sending && styles.composerAnswering]}>
            <Pressable style={styles.plus} onPress={() => setUpload(true)} accessibilityRole="button" accessibilityLabel="More options"><AppText variant="h2" style={styles.plusText}>+</AppText></Pressable>
            <View style={styles.composerField}>
              <TextInput
                value={vm.draft}
                onChangeText={vm.setDraft}
                editable={!vm.sending}
                placeholder={vm.sending ? 'Thinking...' : 'Type your question...'}
                placeholderTextColor="#a2a4a0"
                style={styles.input}
                returnKeyType="send"
                blurOnSubmit={false}
                onSubmitEditing={submitDraft}
              />
            </View>
            <Pressable style={[styles.send, (!vm.draft.trim() || vm.sending) && styles.sendDisabled]} disabled={vm.sending || !vm.draft.trim()} onPress={submitDraft} accessibilityRole="button" accessibilityLabel="Send">
              <SendIcon />
            </Pressable>
          </View>
        </View>
        {vm.error ? <AppText variant="tiny" style={styles.chatError}>{vm.error}</AppText> : null}
        <AppText variant="tiny" style={styles.footnote}>Your learning buddy keeps answers calm, clear, and age-aware.</AppText>
      </View>
      <HistoryDrawer visible={history} onClose={() => setHistory(false)} navigation={navigation} />
      <UploadModal visible={upload} onClose={() => setUpload(false)} />
    </ScreenShell>
  );
}

function SendIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" accessibilityElementsHidden>
      <Path d="M4.5 11.2 19.4 4.3c.8-.4 1.6.4 1.2 1.2l-6.9 14.9c-.3.7-1.3.6-1.5-.1l-1.8-6.2-6.2-1.8c-.7-.2-.8-1.2-.1-1.5Z" fill="#fff" />
      <Path d="m10.6 13.9 4.1-4.1" stroke="#00847d" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function HistoryDrawer({ visible, onClose, navigation }: { visible: boolean; onClose: () => void; navigation: Props['navigation'] }) {
  const vm = useChatViewModel(undefined, { autoLoadThreads: false });
  const [filter, setFilter] = useState<'pinned' | 'all'>('pinned');
  const [query, setQuery] = useState('');
  const slide = useRef(new Animated.Value(-340)).current;
  const fade = useRef(new Animated.Value(0)).current;
  const [rendered, setRendered] = useState(visible);
  const normalizedQuery = query.trim().toLowerCase();
  const chats = vm.childChats.filter((chat) => {
    if (!normalizedQuery && filter === 'pinned' && !chat.pinned) return false;
    if (!normalizedQuery) return true;
    return `${chat.title} ${chat.preview} ${chat.tag}`.toLowerCase().includes(normalizedQuery);
  });
  const startNewChat = () => {
    const chatId = vm.startNewChat();
    onClose();
    navigation.navigate('Chat', { chatId });
  };

  useEffect(() => {
    if (visible) {
      setRendered(true);
      Animated.parallel([
        Animated.timing(fade, { toValue: 1, duration: 180, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        Animated.timing(slide, { toValue: 0, duration: 260, easing: Easing.out(Easing.cubic), useNativeDriver: true })
      ]).start();
      return;
    }

    Animated.parallel([
      Animated.timing(fade, { toValue: 0, duration: 140, easing: Easing.in(Easing.quad), useNativeDriver: true }),
      Animated.timing(slide, { toValue: -340, duration: 190, easing: Easing.in(Easing.cubic), useNativeDriver: true })
    ]).start(({ finished }) => {
      if (finished) setRendered(false);
    });
  }, [fade, slide, visible]);

  if (!rendered) {
    return null;
  }

  return (
    <Modal visible={rendered} transparent animationType="none" onRequestClose={onClose}>
      <View style={styles.historyLayer}>
        <Animated.View style={[styles.historyBackdropAnimated, { opacity: fade }]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityRole="button" accessibilityLabel="Close previous chats" />
        </Animated.View>
        <Animated.View style={[styles.historyPanel, { transform: [{ translateX: slide }] }]}>
          <View style={styles.historyHeading}>
            <View>
              <Brand variant="wordmark" style={styles.historyLogo} />
              <AppText variant="h2" style={styles.historyHeadingTitle}>Previous chats</AppText>
            </View>
            <Pressable onPress={onClose} style={styles.historyClose} accessibilityRole="button" accessibilityLabel="Close previous chats">
              <AppText variant="h2" style={styles.historyCloseText}>×</AppText>
            </Pressable>
          </View>

          <View style={styles.historyTabs}>
            <HistoryTab active={filter === 'pinned'} icon={Icons.pin} label="Pinned chats" onPress={() => setFilter('pinned')} />
            <HistoryTab active={filter === 'all'} icon={Icons.clock} label="All chats" onPress={() => setFilter('all')} />
          </View>

          <TextInput value={query} onChangeText={setQuery} placeholder="Search chats" style={styles.historySearch} placeholderTextColor="#8da6ad" />

          <ScrollView style={styles.historyList} contentContainerStyle={styles.historyListContent} showsVerticalScrollIndicator={false}>
            {vm.loadingThreads ? (
              <View style={styles.historyEmpty}>
                <AppText variant="small" style={styles.historyEmptyText}>Loading chats...</AppText>
              </View>
            ) : null}
            {!vm.loadingThreads && chats.length ? chats.map((chat) => (
              <Pressable key={chat.id} style={({ pressed }) => [styles.historyCard, pressed && styles.historyCardPressed]} onPress={() => { onClose(); navigation.navigate('Chat', { chatId: chat.id }); }}>
                {chat.pinned ? <View style={styles.historyPinIcon}><Image source={Icons.pin} style={styles.historyPinImage} /></View> : null}
                <AppText variant="small" numberOfLines={1} style={styles.historyTitle}>{chat.title || 'Learning Chat'}</AppText>
                <AppText variant="tiny" numberOfLines={2} style={styles.historyPreview}>{chat.preview}</AppText>
                <AppText variant="tiny" style={styles.historyMeta}>{chat.date} | {chat.paused ? 'Paused' : 'Active'}</AppText>
              </Pressable>
            )) : null}
            {!vm.loadingThreads && !chats.length ? (
              <View style={styles.historyEmpty}>
                <AppText variant="h3" style={styles.historyEmptyTitle}>No chats yet</AppText>
                <AppText variant="small" style={styles.historyEmptyText}>{normalizedQuery ? 'No chats match your search.' : filter === 'pinned' ? 'Pinned chats will appear here.' : 'Start a new chat to begin learning.'}</AppText>
              </View>
            ) : null}
          </ScrollView>

          <AppButton label="Start New Chat" onPress={startNewChat} />
          <Pressable style={styles.drawerLogoutButton} onPress={() => { onClose(); navigation.replace('Login', { mode: 'kid' }); }}>
            <AppText variant="small" style={styles.drawerLogoutText}>Log out of child profile</AppText>
          </Pressable>
        </Animated.View>
      </View>
    </Modal>
  );
}

function HistoryTab({ active, icon, label, onPress }: { active: boolean; icon: number; label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.historyTab, active && styles.historyTabActive]}>
      <Image source={icon} style={[styles.historyTabIcon, active && styles.historyTabIconActive]} />
      <AppText variant="tiny" numberOfLines={1} style={[styles.historyTabText, active && styles.historyTabTextActive]}>{label}</AppText>
    </Pressable>
  );
}

function UploadModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  return <Modal visible={visible} transparent animationType="fade"><View style={styles.modalBackdrop}><Island strong style={styles.upload}><Pressable onPress={onClose} style={styles.uploadClose}><AppText variant="h2">×</AppText></Pressable><View style={styles.uploadIcon}><Image source={Icons.message} style={styles.uploadIconImage} /></View><AppText variant="h2" style={styles.center}>Upload image</AppText><AppText variant="small" style={styles.center}>Choose a picture and ask about it in simple words.</AppText><AppButton variant="secondary" label="Choose from gallery" /><AppButton variant="secondary" label="Use sample" /><AppButton label="Done" onPress={onClose} /></Island></View></Modal>;
}

const styles = StyleSheet.create({
  shellContent: { flex: 1, minHeight: '100%', paddingHorizontal: 0, paddingTop: 0, paddingBottom: 0 },
  full: { flex: 1, paddingTop: 0, paddingBottom: 0, gap: 0, overflow: 'hidden' },
  header: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    paddingHorizontal: 14,
    paddingTop: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,143,136,0.12)',
    backgroundColor: 'rgba(255,253,248,0.97)',
    shadowColor: '#008f88',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3
  },
  chatHeaderLeft: {
    height: 44,
    minWidth: 94,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingLeft: 4,
    paddingRight: 10,
    paddingVertical: 4,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: '#dde9e7',
    backgroundColor: 'rgba(255,255,255,0.92)',
    shadowColor: '#008f88',
    shadowOpacity: 0.06,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
    overflow: 'hidden'
  },
  historyButton: { width: 34, height: 34, borderRadius: 17, backgroundColor: 'transparent', borderWidth: 1, borderColor: 'rgba(102,143,150,0.45)', justifyContent: 'center', alignItems: 'center', gap: 4 },
  menuLine: { width: 14, height: 2, borderRadius: 2, backgroundColor: '#4d737a' },
  menuLineShort: { width: 10 },
  headerBrand: { width: 62, height: 22, resizeMode: 'contain' },
  chatHeaderRight: {
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: '#dde9e7',
    backgroundColor: 'rgba(255,255,255,0.92)',
    shadowColor: '#008f88',
    shadowOpacity: 0.06,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4
  },
  pin: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#b8cfca',
    backgroundColor: '#f5f8f4',
    padding: 5
  },
  pinActive: { borderColor: 'rgba(0,143,136,0.40)', backgroundColor: 'rgba(0,143,136,0.10)' },
  pinIcon: { width: 16, height: 16, resizeMode: 'contain', tintColor: '#31585d', opacity: 1 },
  pinIconActive: { tintColor: colors.tealDeep, opacity: 1 },
  timer: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: colors.teal, backgroundColor: 'rgba(255,255,255,0.96)', position: 'relative' },
  timerText: { color: colors.tealDeep, fontWeight: '900' },
  streakBadge: { position: 'absolute', right: -8, bottom: -6, minWidth: 23, height: 19, borderRadius: 10, borderWidth: 2, borderColor: colors.atlasCard, backgroundColor: '#527b83', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 },
  streakText: { color: colors.white, fontSize: 9, lineHeight: 11, fontWeight: '900' },
  profileGroup: { flexDirection: 'row', alignItems: 'center', gap: 4, padding: 0 },
  chatAvatarButton: { width: 26, height: 26, borderRadius: 13, borderWidth: 2, borderColor: 'transparent', backgroundColor: 'transparent', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  chatAvatarActive: { borderColor: colors.teal },
  chatAvatarImage: { width: 24, height: 24, borderRadius: 12, resizeMode: 'cover' },
  featureSummary: { position: 'relative', width: '88%', minHeight: 72, alignSelf: 'center', marginTop: 24, marginBottom: 8 },
  featureBubble: {
    minHeight: 68,
    justifyContent: 'center',
    marginRight: 18,
    paddingVertical: 14,
    paddingLeft: 22,
    paddingRight: 58,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(234,219,196,0.84)',
    backgroundColor: 'rgba(255,254,250,0.68)',
    shadowColor: '#313736',
    shadowOpacity: 0.05,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 7 },
    elevation: 2
  },
  featureTitle: { color: '#202f33', fontWeight: '800', lineHeight: 25, textAlign: 'left' },
  questionAvatar: {
    position: 'absolute',
    right: 0,
    top: 13,
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 2,
    borderColor: 'rgba(255,254,250,0.96)',
    backgroundColor: '#f8efe1',
    shadowColor: '#313736',
    shadowOpacity: 0.12,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 6 }
  },
  messagePane: { flex: 1 },
  messagePaneContent: { gap: 14, paddingHorizontal: 14, paddingTop: 16, paddingBottom: 8 },
  emptyChat: { marginTop: 18, gap: 12, alignItems: 'center', paddingVertical: 24, paddingHorizontal: 16, backgroundColor: 'transparent', borderWidth: 0, shadowOpacity: 0, elevation: 0 },
  emptyIcon: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,254,250,0.84)', borderWidth: 1, borderColor: 'rgba(234,219,196,0.76)' },
  emptyIconImage: { width: 48, height: 48, resizeMode: 'contain' },
  emptyTitle: { textAlign: 'center', color: colors.inkMid },
  emptyText: { maxWidth: 270, textAlign: 'center', color: '#5e7b82', lineHeight: 22 },
  dateDivider: { flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: 2 },
  dateLine: { flex: 1, height: 1, backgroundColor: 'rgba(234,219,196,0.86)' },
  dateText: { color: '#6d858a', fontSize: 11, lineHeight: 13, fontWeight: '900', textTransform: 'uppercase' },
  messageClean: { display: 'flex' },
  messageAi: { alignItems: 'flex-start' },
  messageKid: { alignItems: 'flex-end' },
  cleanBubbleWrap: { position: 'relative', maxWidth: '100%' },
  cleanBubble: {
    minWidth: 168,
    borderRadius: 20,
    paddingTop: 14,
    paddingHorizontal: 18,
    paddingBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(231,203,170,0.86)',
    shadowColor: '#313736',
    shadowOpacity: 0.055,
    shadowRadius: 26,
    shadowOffset: { width: 0, height: 10 },
    elevation: 3
  },
  kidBubble: { maxWidth: 286, paddingHorizontal: 16, backgroundColor: 'rgba(248,239,225,0.72)', borderColor: 'rgba(234,203,171,0.92)', borderTopLeftRadius: 18, borderTopRightRadius: 18, borderBottomRightRadius: 6, borderBottomLeftRadius: 18, marginTop: 14 },
  aiBubble: { width: '100%', backgroundColor: 'rgba(255,254,250,0.96)', borderLeftWidth: 4, borderLeftColor: colors.teal, borderTopLeftRadius: 6, borderBottomLeftRadius: 6, borderTopRightRadius: 20, borderBottomRightRadius: 20, marginTop: 14 },
  assistantLabel: { display: 'none' },
  bubbleText: { color: '#263a3e', fontWeight: '700', lineHeight: 22 },
  bubbleTime: { color: '#64777c', fontSize: 11, lineHeight: 13, fontWeight: '800', marginTop: 6 },
  chatFooter: {
    flexShrink: 0,
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 12,
    backgroundColor: 'transparent'
  },
  composer: {
    width: '100%',
    maxWidth: 390,
    minHeight: 62,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 'auto',
    paddingTop: 8,
    paddingRight: 12,
    paddingBottom: 12,
    paddingLeft: 12,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: 'rgba(255,255,252,0.62)',
    backgroundColor: 'rgba(248,239,225,0.62)',
    shadowColor: '#483d2c',
    shadowOpacity: 0.10,
    shadowRadius: 26,
    shadowOffset: { width: 0, height: 12 },
    elevation: 4
  },
  composerAnswering: { opacity: 0.72 },
  plus: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.98)', shadowColor: '#313736', shadowOpacity: 0.08, shadowRadius: 16, shadowOffset: { width: 0, height: 8 }, elevation: 2 },
  plusText: { color: '#18383d', marginTop: -2 },
  composerField: { flex: 1, height: 44, borderRadius: radius.pill, backgroundColor: 'rgba(255,255,252,0.96)', borderWidth: 1, borderColor: 'rgba(223,237,234,0.90)', justifyContent: 'center', paddingLeft: 14, paddingRight: 5, shadowColor: '#313736', shadowOpacity: 0.05, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } },
  input: { flex: 1, height: 44, paddingHorizontal: 0, color: colors.ink, fontFamily: typography.fontFamily, fontWeight: '600', fontSize: 14 },
  send: {
    flexShrink: 0,
    width: 48,
    height: 48,
    minWidth: 48,
    minHeight: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0,
    backgroundColor: '#00847d',
    shadowColor: '#00847d',
    shadowOpacity: 0.22,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 14 },
    elevation: 6
  },
  sendDisabled: { opacity: 0.55 },
  chatError: { color: colors.danger, textAlign: 'center', marginTop: -4 },
  footnote: { display: 'none' },
  historyLayer: { flex: 1, alignItems: 'stretch', justifyContent: 'flex-start' },
  historyBackdropAnimated: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(31,48,50,0.30)' },
  historyPanel: {
    position: 'relative',
    zIndex: 1,
    width: '92%',
    maxWidth: 370,
    height: '100%',
    paddingTop: 52,
    paddingHorizontal: 16,
    paddingBottom: 18,
    borderTopRightRadius: 28,
    borderBottomRightRadius: 28,
    backgroundColor: '#fbfaf5',
    shadowColor: '#1c2d2e',
    shadowOpacity: 0.16,
    shadowRadius: 42,
    shadowOffset: { width: 18, height: 0 },
    elevation: 16,
    gap: 14
  },
  historyHeading: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10, marginBottom: 2 },
  historyLogo: { width: 146, height: 42 },
  historyHeadingTitle: { marginTop: 8, color: colors.inkMid, fontWeight: '900' },
  historyClose: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.9)', alignItems: 'center', justifyContent: 'center' },
  historyCloseText: { color: '#28646b', lineHeight: 28, marginTop: -2 },
  historyTabs: {
    height: 52,
    flexDirection: 'row',
    gap: 8,
    padding: 4,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(234,219,196,0.9)',
    backgroundColor: 'rgba(255,254,250,0.74)'
  },
  historyTab: {
    flex: 1,
    minWidth: 0,
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(111,150,156,0.42)',
    backgroundColor: 'rgba(255,255,255,0.72)'
  },
  historyTabActive: { backgroundColor: '#006c67', borderColor: '#006c67', shadowColor: '#527b83', shadowOpacity: 0.18, shadowRadius: 14, shadowOffset: { width: 0, height: 6 }, elevation: 3 },
  historyTabIcon: { width: 17, height: 17, resizeMode: 'contain', tintColor: '#31585d', opacity: 0.88 },
  historyTabIconActive: { tintColor: colors.white, opacity: 1 },
  historyTabText: { flexShrink: 1, color: '#28646b', fontSize: 11, lineHeight: 13, fontWeight: '900' },
  historyTabTextActive: { color: colors.white },
  historySearch: {
    height: 46,
    borderRadius: 23,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(234,219,196,0.9)',
    backgroundColor: 'rgba(255,254,250,0.86)',
    color: colors.ink,
    fontFamily: typography.fontFamily,
    fontWeight: '800'
  },
  historyList: { flex: 1 },
  historyListContent: { gap: 10, paddingRight: 2, paddingBottom: 8 },
  historyCard: {
    position: 'relative',
    width: '100%',
    minHeight: 92,
    padding: 13,
    paddingRight: 44,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(234,219,196,0.74)',
    backgroundColor: 'rgba(255,254,250,0.86)',
    shadowColor: '#117177',
    shadowOpacity: 0.07,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 5 },
    elevation: 2,
    gap: 4
  },
  historyCardPressed: { backgroundColor: 'rgba(238,243,242,0.72)' },
  historyPinIcon: { position: 'absolute', top: 12, right: 12, width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: '#e7f6f3' },
  historyPinImage: { width: 15, height: 15, resizeMode: 'contain', tintColor: colors.tealDeep },
  historyPreview: { color: colors.text, fontWeight: '700', lineHeight: 15 },
  historyMeta: { color: colors.muted, fontWeight: '900' },
  historyEmpty: { minHeight: 150, alignItems: 'center', justifyContent: 'center', gap: 5, padding: 20 },
  historyEmptyTitle: { color: '#527b83', textAlign: 'center' },
  historyEmptyText: { color: '#527b83', textAlign: 'center' },
  drawerLogoutButton: { width: '100%', minHeight: 40, alignItems: 'center', justifyContent: 'center', paddingVertical: 8, paddingHorizontal: 14, borderRadius: 20, borderWidth: 1, borderColor: '#d8c9b3', backgroundColor: 'transparent', marginTop: -6 },
  drawerLogoutText: { color: '#275a5d', fontWeight: '800' },
  modalBackdrop: { flex: 1, backgroundColor: colors.overlay, justifyContent: 'center', padding: 14 },
  drawer: { width: '100%', maxWidth: 420, alignSelf: 'center', maxHeight: '92%', borderRadius: 28, padding: 18, backgroundColor: colors.paper, gap: 10 },
  drawerHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  drawerLogo: { width: 130, height: 50 },
  segment: { flexDirection: 'row', gap: 8 },
  search: { height: 44, borderRadius: 22, paddingHorizontal: 14, borderWidth: 1, borderColor: colors.atlasLine, backgroundColor: colors.white, color: colors.ink, fontFamily: typography.fontFamily },
  historyItem: { borderRadius: 18, borderWidth: 1, borderColor: colors.atlasLine, backgroundColor: 'rgba(255,255,255,0.78)', padding: 12 },
  historyTitle: { color: colors.inkMid, fontWeight: '900' },
  upload: { gap: spacing.md, alignItems: 'center' },
  uploadClose: { alignSelf: 'flex-end' },
  uploadIcon: { width: 72, height: 72, borderRadius: 36, backgroundColor: colors.tealSoft, alignItems: 'center', justifyContent: 'center' },
  uploadIconImage: { width: 34, height: 34, tintColor: colors.tealDeep },
  center: { textAlign: 'center' }
});
