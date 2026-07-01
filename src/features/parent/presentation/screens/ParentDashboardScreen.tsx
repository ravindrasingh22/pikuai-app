import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Image, Modal, Pressable, StyleSheet, View } from 'react-native';
import Svg, { Circle, Line, Path, Polyline, Rect } from 'react-native-svg';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../../app/navigation/routes';
import { useAppStore } from '../../../../app/state/AppStore';
import { clearPersistedState } from '../../../../app/state/persistence';
import { ScreenShell } from '../../../../core/components/ScreenShell';
import { UnifiedHeader } from '../../../../core/components/AppHeader';
import { Brand } from '../../../../core/components/Brand';
import { Island, MiniCard, StatCard } from '../../../../core/components/Cards';
import { AppText } from '../../../../core/components/AppText';
import { AppButton } from '../../../../core/components/AppButton';
import { Icons } from '../../../../core/assets/assets';
import { useParentViewModel, avatarForKid } from '../viewmodels/useParentViewModel';
import { colors } from '../../../../core/theme/colors';
import { radius, spacing } from '../../../../core/theme/spacing';

type Props = NativeStackScreenProps<RootStackParamList, 'ParentDashboard'>;

export function ParentDashboardScreen({ navigation }: Props) {
  const vm = useParentViewModel();
  const { state } = useAppStore();
  const [menuVisible, setMenuVisible] = useState(false);
  const [profileVisible, setProfileVisible] = useState(false);
  const kid = vm.activeKid;

  useEffect(() => {
    if (!state.auth.parentUnlocked) {
      navigation.replace('Login', { mode: 'parent' });
    }
  }, [navigation, state.auth.parentUnlocked]);

  useEffect(() => {
    if (state.auth.parentUnlocked) {
      vm.refreshChildren();
    }
  }, [state.auth.parentUnlocked, vm.refreshChildren]);

  if (!state.auth.parentUnlocked) {
    return null;
  }

  return (
    <ScreenShell>
      <UnifiedHeader mode="parent" onMenu={() => setMenuVisible(true)} onParent={() => setProfileVisible(true)} onKid={() => navigation.navigate('Login', { mode: 'kid' })} />
      <View style={styles.body}>
        <View style={styles.topRow}>
          <View>
            <AppText variant="label">Family overview</AppText>
            <AppText variant="h2">{vm.parentName}</AppText>
          </View>
          <Pressable onPress={() => navigation.navigate('ParentAnalytics')} style={styles.chartIcon}><AppText variant="h3" style={styles.chartText}>⌁</AppText></Pressable>
        </View>
        <View style={styles.summaryGrid}>
          <StatCard style={styles.summary}><AppText variant="small">Children</AppText><AppText variant="h1">{vm.kids.length}</AppText><AppText variant="tiny">Profiles managed</AppText></StatCard>
          <Pressable style={styles.summaryPress} onPress={() => navigation.navigate('ParentAlerts')}><StatCard style={styles.summaryAlert}><AppText variant="small">Alerts</AppText><AppText variant="h1">{vm.totalAlerts}</AppText><AppText variant="tiny">Needs review</AppText></StatCard></Pressable>
        </View>
        <Island strong style={styles.planCard}>
          <View style={styles.planHeader}><AppText variant="tiny" style={styles.status}>{vm.subscription.status}</AppText><AppText variant="h3">Family Monthly</AppText></View>
          <AppText variant="small">Valid until {vm.subscription.validUntil}</AppText>
          <View style={styles.planStats}><AppText variant="tiny">▣ {vm.subscription.daysLeft} days left</AppText><AppText variant="tiny">● {vm.subscription.tokensLeft} tokens left</AppText></View>
          <AppButton label="Manage / Upgrade plan" onPress={() => navigation.navigate('PaymentPlans')} />
        </Island>
        <MiniCard style={styles.activityCard}>
          <View style={styles.kidsHeader}><View><AppText variant="label">Activity</AppText><AppText variant="h3">Children</AppText></View><Pressable style={styles.addKid} onPress={() => navigation.navigate('KidRegister')}><AppText variant="h2" style={styles.addKidText}>+</AppText></Pressable></View>
          <View style={styles.kidTabs}>{vm.kids.map((item) => <Pressable key={item.id} onPress={() => vm.selectKid(item.id)} style={[styles.kidTab, item.id === kid.id && styles.kidTabActive]}><Image source={avatarForKid(item.avatar)} style={styles.tabAvatar} /><AppText variant="tiny" style={styles.center}>{item.name}</AppText></Pressable>)}</View>
          {kid ? <Island style={styles.kidDetail}>
            <View style={styles.kidDetailHeader}><Image source={avatarForKid(kid.avatar)} style={styles.kidAvatar} /><View><AppText variant="h3">{kid.name}'s Activity Overview</AppText><AppText variant="small">{kid.age} yrs · {kid.gender || 'Kid'}</AppText></View></View>
            <View style={styles.summaryGrid}><StatCard style={styles.summary}><AppText variant="small">Day streak</AppText><AppText variant="h2">{kid.streak}</AppText><AppText variant="tiny">Learning days</AppText></StatCard><StatCard style={styles.summary}><AppText variant="small">Daily time</AppText><AppText variant="h2">{Math.floor(kid.dailyMinutes / 60)}h {kid.dailyMinutes % 60}m</AppText><AppText variant="tiny">Today</AppText></StatCard><Pressable style={styles.summaryPress} onPress={() => navigation.navigate('ParentAlerts')}><StatCard style={styles.summary}><AppText variant="small">Alerts</AppText><AppText variant="h2">{kid.alerts}</AppText><AppText variant="tiny">View details</AppText></StatCard></Pressable></View>
          </Island> : null}
        </MiniCard>
      </View>
      <ParentMenu visible={menuVisible} onClose={() => setMenuVisible(false)} navigation={navigation} />
      <ParentProfileModal visible={profileVisible} onClose={() => setProfileVisible(false)} navigation={navigation} />
    </ScreenShell>
  );
}

function ParentMenu({ visible, onClose, navigation }: { visible: boolean; onClose: () => void; navigation: Props['navigation'] }) {
  const { dispatch } = useAppStore();
  const slide = useRef(new Animated.Value(-340)).current;
  const fade = useRef(new Animated.Value(0)).current;
  const [rendered, setRendered] = useState(visible);
  const parentLinks: { label: string; route: keyof RootStackParamList; icon: MenuIconName }[] = [
    { label: 'Parent home', route: 'ParentDashboard', icon: 'home' },
    { label: 'Activity reports', route: 'ParentAnalytics', icon: 'chart' },
    { label: 'Add a child', route: 'KidRegister', icon: 'user-plus' },
    { label: 'Family plans', route: 'PaymentPlans', icon: 'card' }
  ];
  const legalLinks: { label: string; route: keyof RootStackParamList; icon: MenuIconName }[] = [
    { label: 'Privacy policy', route: 'Privacy', icon: 'shield' },
    { label: 'Terms & conditions', route: 'Terms', icon: 'file' },
    { label: 'Help & Support', route: 'Support', icon: 'help' }
  ];

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
      if (finished) {
        setRendered(false);
      }
    });
  }, [fade, slide, visible]);

  function openRoute(route: keyof RootStackParamList) {
    onClose();
    navigation.navigate(route as never);
  }

  async function onLogout() {
    onClose();
    await clearPersistedState();
    dispatch({ type: 'state/reset' });
    navigation.navigate('Splash');
  }

  if (!rendered) {
    return null;
  }

  return (
    <Modal visible={rendered} transparent animationType="none" onRequestClose={onClose}>
      <View style={styles.menuLayer}>
        <Animated.View style={[styles.menuBackdropAnimated, { opacity: fade }]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        </Animated.View>
        <Animated.View style={[styles.menuPanel, { transform: [{ translateX: slide }] }]}>
          <View style={styles.menuHeader}>
            <Brand variant="wordmark" style={styles.menuLogo} />
            <Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel="Close parent navigation" style={styles.menuClose}>
              <AppText variant="h3" style={styles.menuCloseText}>×</AppText>
            </Pressable>
          </View>

          <View style={styles.menuNavigation}>
            {parentLinks.map((link) => <MenuLink key={link.route} label={link.label} icon={link.icon} onPress={() => openRoute(link.route)} />)}
          </View>

          <AppText variant="tiny" style={styles.menuSectionLabel}>Help & Legal</AppText>
          <View style={styles.menuNavigation}>
            {legalLinks.map((link) => <MenuLink key={link.route} label={link.label} icon={link.icon} onPress={() => openRoute(link.route)} />)}
          </View>

          <View style={styles.menuAccountActions}>
            <MenuLink label="Update profile" icon="user" onPress={() => openRoute('ParentDetails')} compact />
            <MenuLink label="Logout" icon="logout" onPress={onLogout} compact danger />
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

type MenuIconName = 'home' | 'chart' | 'user-plus' | 'card' | 'shield' | 'file' | 'help' | 'user' | 'logout';

function MenuLink({ label, icon, onPress, compact, danger }: { label: string; icon: MenuIconName; onPress: () => void; compact?: boolean; danger?: boolean }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.menuItem, compact && styles.menuItemCompact, pressed && styles.menuItemPressed]}>
      <View style={[styles.menuIcon, danger && styles.menuIconDanger]}>
        <MenuIcon name={icon} color={danger ? colors.danger : colors.tealDeep} />
      </View>
      <AppText variant="small" style={[styles.menuItemText, danger && styles.menuItemDangerText]}>{label}</AppText>
    </Pressable>
  );
}

function MenuIcon({ name, color }: { name: MenuIconName; color: string }) {
  const common = { stroke: color, strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, fill: 'none' };

  return (
    <Svg width={18} height={18} viewBox="0 0 24 24">
      {name === 'home' ? <><Path {...common} d="M3 11.5 12 4l9 7.5" /><Path {...common} d="M5.5 10.5V20h13v-9.5" /><Path {...common} d="M9.5 20v-5h5v5" /></> : null}
      {name === 'chart' ? <><Line {...common} x1="5" y1="19" x2="19" y2="19" /><Rect {...common} x="6" y="11" width="3.5" height="8" rx="1" /><Rect {...common} x="10.25" y="7" width="3.5" height="12" rx="1" /><Rect {...common} x="14.5" y="4" width="3.5" height="15" rx="1" /></> : null}
      {name === 'user-plus' ? <><Circle {...common} cx="9" cy="8" r="3.5" /><Path {...common} d="M3.5 19c.8-3.2 2.7-5 5.5-5s4.7 1.8 5.5 5" /><Line {...common} x1="18.5" y1="8" x2="18.5" y2="14" /><Line {...common} x1="15.5" y1="11" x2="21.5" y2="11" /></> : null}
      {name === 'card' ? <><Rect {...common} x="3.5" y="6.5" width="17" height="11" rx="2.5" /><Line {...common} x1="4" y1="10" x2="20" y2="10" /><Line {...common} x1="7" y1="14.5" x2="11" y2="14.5" /></> : null}
      {name === 'shield' ? <><Path {...common} d="M12 3.5 19 6v5.2c0 4.2-2.7 7.7-7 9.3-4.3-1.6-7-5.1-7-9.3V6l7-2.5Z" /><Path {...common} d="m9 12 2 2 4-4" /></> : null}
      {name === 'file' ? <><Path {...common} d="M7 3.5h7l3 3V20.5H7z" /><Path {...common} d="M14 3.5v4h4" /><Line {...common} x1="9.5" y1="12" x2="14.5" y2="12" /><Line {...common} x1="9.5" y1="15.5" x2="14.5" y2="15.5" /></> : null}
      {name === 'help' ? <><Circle {...common} cx="12" cy="12" r="8.5" /><Path {...common} d="M9.8 9.4A2.3 2.3 0 0 1 12 8c1.4 0 2.4.9 2.4 2.1 0 1.8-2.2 2-2.2 3.7" /><Line {...common} x1="12.2" y1="17" x2="12.2" y2="17.1" /></> : null}
      {name === 'user' ? <><Circle {...common} cx="12" cy="8" r="3.5" /><Path {...common} d="M5.5 19.5c1-3.7 3.2-5.5 6.5-5.5s5.5 1.8 6.5 5.5" /></> : null}
      {name === 'logout' ? <><Path {...common} d="M10 5H6.5A1.5 1.5 0 0 0 5 6.5v11A1.5 1.5 0 0 0 6.5 19H10" /><Path {...common} d="M14 8l4 4-4 4" /><Line {...common} x1="9" y1="12" x2="18" y2="12" /></> : null}
    </Svg>
  );
}

function ParentProfileModal({ visible, onClose, navigation }: { visible: boolean; onClose: () => void; navigation: Props['navigation'] }) {
  const { dispatch } = useAppStore();

  async function onLogout() {
    onClose();
    await clearPersistedState();
    dispatch({ type: 'state/reset' });
    navigation.navigate('Splash');
  }

  return <Modal visible={visible} transparent animationType="fade"><View style={styles.modalBackdrop}><View style={styles.profileModal}><Pressable onPress={onClose} style={styles.close}><AppText variant="h2">×</AppText></Pressable><Image source={Icons.parentProfile} style={styles.profileAvatar} /><AppText variant="h3">Parent profile</AppText><AppText variant="small" style={styles.center}>parent@example.com</AppText><AppButton variant="secondary" label="Update profile" onPress={() => { onClose(); navigation.navigate('ParentDetails'); }} /><AppButton variant="secondary" label="Terms & Conditions" onPress={() => { onClose(); navigation.navigate('Terms'); }} /><AppButton variant="secondary" label="Support" onPress={() => { onClose(); navigation.navigate('Support'); }} /><AppButton variant="danger" label="Logout" onPress={onLogout} /></View></View></Modal>;
}

const styles = StyleSheet.create({
  body: { gap: spacing.md },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  chartIcon: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.78)', borderWidth: 1, borderColor: colors.atlasLine },
  chartText: { color: colors.tealDeep },
  summaryGrid: { flexDirection: 'row', gap: spacing.sm },
  summary: { flex: 1 },
  summaryPress: { flex: 1 },
  summaryAlert: { flex: 1, backgroundColor: '#fff8ea' },
  planCard: { gap: spacing.sm },
  planHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  status: { color: colors.tealDeep, backgroundColor: colors.tealSoft, paddingHorizontal: 10, paddingVertical: 5, borderRadius: radius.pill },
  planStats: { flexDirection: 'row', justifyContent: 'space-between' },
  activityCard: { gap: spacing.md },
  kidsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  addKid: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.teal },
  addKidText: { color: colors.white },
  kidTabs: { flexDirection: 'row', gap: spacing.sm },
  kidTab: { width: 88, padding: 8, alignItems: 'center', gap: 4, borderRadius: 18, borderWidth: 1, borderColor: colors.atlasLine, backgroundColor: 'rgba(255,255,255,0.78)' },
  kidTabActive: { borderColor: colors.teal, backgroundColor: '#eaf5f3' },
  tabAvatar: { width: 42, height: 42, borderRadius: 21 },
  center: { textAlign: 'center' },
  kidDetail: { gap: spacing.md, padding: spacing.md },
  kidDetailHeader: { flexDirection: 'row', gap: spacing.md, alignItems: 'center' },
  kidAvatar: { width: 58, height: 58, borderRadius: 29 },
  modalBackdrop: { flex: 1, backgroundColor: colors.overlay, justifyContent: 'center', padding: 20 },
  menuLayer: { flex: 1 },
  menuBackdropAnimated: { ...StyleSheet.absoluteFillObject, backgroundColor: colors.overlay },
  menuPanel: {
    width: '82%',
    maxWidth: 340,
    minWidth: 292,
    height: '100%',
    paddingTop: 56,
    paddingHorizontal: 18,
    paddingBottom: 22,
    backgroundColor: 'rgba(255, 253, 248, 0.98)',
    borderTopRightRadius: 28,
    borderBottomRightRadius: 28,
    borderRightWidth: 1,
    borderColor: 'rgba(158, 184, 187, 0.9)',
    shadowColor: '#343a37',
    shadowOpacity: 0.16,
    shadowRadius: 24,
    shadowOffset: { width: 8, height: 0 },
    elevation: 14,
    gap: 14
  },
  menuHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 6 },
  menuLogo: { width: 132, height: 44 },
  menuClose: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.tealLine,
    backgroundColor: 'rgba(255,255,255,0.78)'
  },
  menuCloseText: { color: colors.tealDeep, lineHeight: 28 },
  menuNavigation: { gap: 9 },
  menuSectionLabel: { marginTop: 8, color: colors.muted, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 0 },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 50,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(222, 233, 231, 0.95)',
    backgroundColor: 'rgba(255,255,255,0.74)'
  },
  menuItemCompact: { minHeight: 46, backgroundColor: 'rgba(246, 251, 250, 0.82)' },
  menuItemPressed: { transform: [{ scale: 0.985 }], backgroundColor: '#eff8f6' },
  menuIcon: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.tealSoft },
  menuIconDanger: { backgroundColor: 'rgba(180,75,75,0.09)' },
  menuItemText: { color: colors.inkMid, fontWeight: '900' },
  menuItemDangerText: { color: colors.danger },
  menuAccountActions: { marginTop: 'auto', paddingTop: 14, borderTopWidth: 1, borderColor: 'rgba(222, 233, 231, 0.95)', gap: 9 },
  profileModal: { alignSelf: 'center', width: '86%', maxWidth: 360, borderRadius: 28, padding: 20, backgroundColor: colors.cream, alignItems: 'stretch', gap: 10 },
  close: { alignSelf: 'flex-end' },
  profileAvatar: { width: 72, height: 72, borderRadius: 36, alignSelf: 'center' }
});
