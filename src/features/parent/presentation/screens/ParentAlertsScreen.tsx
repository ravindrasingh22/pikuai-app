import React from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../../app/navigation/routes';
import { ScreenShell } from '../../../../core/components/ScreenShell';
import { GhostBack, UnifiedHeader } from '../../../../core/components/AppHeader';
import { Island, MiniCard } from '../../../../core/components/Cards';
import { AppText } from '../../../../core/components/AppText';
import { useParentViewModel, avatarForKid } from '../viewmodels/useParentViewModel';
import { colors } from '../../../../core/theme/colors';
import { spacing } from '../../../../core/theme/spacing';

type Props = NativeStackScreenProps<RootStackParamList, 'ParentAlerts'>;

export function ParentAlertsScreen({ navigation }: Props) {
  const vm = useParentViewModel();
  const kid = vm.activeKid;
  return (
    <ScreenShell>
      <View style={styles.header}><GhostBack onPress={() => navigation.navigate('ParentDashboard')} /><UnifiedHeader mode="parent" onKid={() => navigation.navigate('Login', { mode: 'kid' })} /></View>
      <View style={styles.body}>
        <AppText variant="label">Parent view</AppText>
        <AppText variant="h2">Safety alerts</AppText>
        <View style={styles.kidTabs}>{vm.kids.map((item) => <Pressable key={item.id} onPress={() => vm.selectKid(item.id)} style={[styles.kidTab, item.id === kid.id && styles.kidTabActive]}><Image source={avatarForKid(item.avatar)} style={styles.avatar} /><AppText variant="tiny">{item.name}</AppText></Pressable>)}</View>
        <Island strong style={styles.total}><View><AppText variant="small">Needs review</AppText><AppText variant="h1">{kid.alerts}</AppText><AppText variant="tiny">{kid.name}</AppText></View><Pressable onPress={() => navigation.navigate('ParentAnalytics')} style={styles.chartButton}><AppText variant="h3" style={styles.chartText}>⌁</AppText></Pressable></Island>
        {kid.alerts > 0 ? <MiniCard style={styles.alertItem}><View style={styles.alertTop}><AppText variant="tiny" style={styles.alertBadge}>Needs review</AppText><AppText variant="h3">1</AppText></View><AppText variant="h3">Timer reached</AppText><AppText variant="small">{kid.name}'s session reached the daily learning limit.</AppText><AppText variant="tiny">Suggested action: review and extend only if needed.</AppText></MiniCard> : <MiniCard><AppText variant="h3">No active alerts</AppText><AppText variant="small">This child has no safety items waiting for review.</AppText></MiniCard>}
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  header: { marginBottom: spacing.sm },
  body: { gap: spacing.md },
  kidTabs: { flexDirection: 'row', gap: 8 },
  kidTab: { flexDirection: 'row', gap: 6, alignItems: 'center', paddingHorizontal: 10, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: colors.atlasLine, backgroundColor: 'rgba(255,255,255,0.78)' },
  kidTabActive: { backgroundColor: colors.tealSoft, borderColor: colors.tealLine },
  avatar: { width: 28, height: 28, borderRadius: 14 },
  total: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  chartButton: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.tealSoft },
  chartText: { color: colors.tealDeep },
  alertItem: { gap: spacing.sm, backgroundColor: '#fff8ea' },
  alertTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  alertBadge: { color: colors.danger, backgroundColor: '#fff1ea', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999 }
});
