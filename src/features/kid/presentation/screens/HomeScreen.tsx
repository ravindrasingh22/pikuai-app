import React from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../../app/navigation/routes';
import { ScreenShell } from '../../../../core/components/ScreenShell';
import { UnifiedHeader } from '../../../../core/components/AppHeader';
import { AppText } from '../../../../core/components/AppText';
import { AppButton } from '../../../../core/components/AppButton';
import { Icons } from '../../../../core/assets/assets';
import { avatarForKid } from '../../../parent/presentation/viewmodels/useParentViewModel';
import { useKidViewModel } from '../viewmodels/useKidViewModel';
import { colors } from '../../../../core/theme/colors';
import { spacing } from '../../../../core/theme/spacing';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

function ChatCard({ title, preview, date, pinned, onPress }: { title: string; preview: string; date: string; pinned?: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.chatCard, pressed && styles.chatCardPressed]}>
      <View style={[styles.chatTypeIcon, pinned ? styles.pinIcon : styles.recentIcon]}>
        <Image source={pinned ? Icons.pin : Icons.clock} style={styles.chatTypeImage} />
      </View>
      <View style={styles.chatCopy}>
        <AppText variant="small" numberOfLines={1} style={styles.chatTitle}>{title || 'Learning Chat'}</AppText>
        <AppText variant="tiny" numberOfLines={1} style={styles.chatPreview}>{preview}</AppText>
        <View style={styles.chatMetaRow}>
          <AppText variant="tiny" style={styles.chatMeta}>{date}</AppText>
          <View style={styles.metaDot} />
          <AppText variant="tiny" style={styles.chatMeta}>Active</AppText>
        </View>
      </View>
      <AppText variant="h3" style={styles.chev}>›</AppText>
    </Pressable>
  );
}

export function HomeScreen({ navigation }: Props) {
  const vm = useKidViewModel();
  const pinnedChats = vm.pinnedChats.slice(0, 2);
  const recentChats = (vm.recentChats.length ? vm.recentChats : vm.kidChats).slice(0, 2);
  const kidSource = vm.activeKid ? avatarForKid(vm.activeKid.avatar) : undefined;

  return (
    <ScreenShell>
      <UnifiedHeader mode="kid" kidSource={kidSource} onParent={() => navigation.navigate('Login', { mode: 'parent' })} onKid={() => navigation.navigate('AvatarLibrary')} />
      <View style={styles.body}>
        <View style={styles.welcomePanel}>
          <View style={styles.discoveryCopy}>
            <AppText variant="h2" style={styles.heroTitle}>What would you like to discover?</AppText>
            <AppText variant="small" style={styles.heroText}>Start a protected conversation, continue a question, or learn from a picture.</AppText>
          </View>
          <AppButton label="Start New Chat" icon={Icons.message} onPress={() => navigation.navigate('Chat')} style={styles.newChatButton} />
        </View>

        <HomeSection title="Pinned" onViewAll={() => navigation.navigate('Chat')}>
          {pinnedChats.length ? pinnedChats.map((chat) => (
            <ChatCard key={chat.id} title={chat.title} preview={chat.preview} date={chat.date} pinned onPress={() => navigation.navigate('Chat', { chatId: chat.id })} />
          )) : <AppText variant="small" style={styles.emptyCard}>No pinned chats yet.</AppText>}
        </HomeSection>

        <HomeSection title="Recent" onViewAll={() => navigation.navigate('Chat')}>
          {recentChats.length ? recentChats.map((chat) => (
            <ChatCard key={chat.id} title={chat.title} preview={chat.preview} date={chat.date} onPress={() => navigation.navigate('Chat', { chatId: chat.id })} />
          )) : <AppText variant="small" style={styles.emptyCard}>No recent chats yet.</AppText>}
        </HomeSection>
      </View>
    </ScreenShell>
  );
}

function HomeSection({ title, onViewAll, children }: { title: string; onViewAll: () => void; children: React.ReactNode }) {
  return (
    <View style={styles.homeSection}>
      <View style={styles.sectionHead}>
        <AppText variant="h3" style={styles.sectionTitle}>{title}</AppText>
        <Pressable onPress={onViewAll} style={styles.viewAll}>
          <AppText variant="small" style={styles.link}>View all</AppText>
          <Image source={Icons.chevronRightTeal} style={styles.viewAllIcon} />
        </Pressable>
      </View>
      <View style={styles.listPanel}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  body: { gap: 0, paddingBottom: spacing.lg },
  welcomePanel: { alignItems: 'center', marginTop: 14, marginBottom: 18, paddingHorizontal: 0 },
  discoveryCopy: { alignItems: 'center', gap: 7, paddingHorizontal: 8 },
  heroTitle: { textAlign: 'center', color: colors.inkMid, fontWeight: '900' },
  heroText: { textAlign: 'center', color: colors.text, lineHeight: 21 },
  newChatButton: { marginTop: 20 },
  homeSection: { marginTop: 16, gap: 10 },
  sectionHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
  sectionTitle: { color: colors.inkMid, fontWeight: '900' },
  viewAll: { minHeight: 28, flexDirection: 'row', alignItems: 'center', gap: 2 },
  link: { color: colors.teal, fontWeight: '900' },
  viewAllIcon: { width: 21, height: 21, resizeMode: 'contain' },
  listPanel: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.88)',
    borderWidth: 1,
    borderColor: 'rgba(0,143,136,0.10)',
    shadowColor: '#117177',
    shadowOpacity: 0.08,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5
  },
  chatCard: {
    minHeight: 80,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(234,219,196,0.76)'
  },
  chatCardPressed: { backgroundColor: 'rgba(238,243,242,0.64)' },
  chatTypeIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.teal,
    shadowOpacity: 0.14,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3
  },
  pinIcon: { backgroundColor: '#d7eeeb' },
  recentIcon: { backgroundColor: '#e6f1ed' },
  chatTypeImage: { width: 22, height: 22, resizeMode: 'contain', tintColor: colors.tealDeep, opacity: 0.88 },
  chatCopy: { flex: 1, minWidth: 0, gap: 2 },
  chatTitle: { color: colors.inkMid, fontWeight: '900' },
  chatPreview: { color: colors.text, fontWeight: '700' },
  chatMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 1 },
  chatMeta: { color: colors.muted, fontWeight: '800' },
  metaDot: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: colors.muted, opacity: 0.58 },
  chev: { color: '#a8c4c2', width: 24, textAlign: 'right' },
  emptyCard: { paddingVertical: 12, color: colors.muted, textAlign: 'center', fontWeight: '800' }
});
