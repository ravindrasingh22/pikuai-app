import React from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../../app/navigation/routes';
import { ScreenShell } from '../../../../core/components/ScreenShell';
import { GhostBack, UnifiedHeader } from '../../../../core/components/AppHeader';
import { Island, MiniCard, StatCard } from '../../../../core/components/Cards';
import { AppText } from '../../../../core/components/AppText';
import { AppButton } from '../../../../core/components/AppButton';
import { useParentViewModel, avatarForKid } from '../viewmodels/useParentViewModel';
import { colors } from '../../../../core/theme/colors';
import { spacing } from '../../../../core/theme/spacing';

type Props = NativeStackScreenProps<RootStackParamList, 'ParentAnalytics'>;

export function ParentAnalyticsScreen({ navigation }: Props) {
  const vm = useParentViewModel();
  const kid = vm.activeKid;
  return (
    <ScreenShell>
      <View style={styles.header}><GhostBack onPress={() => navigation.navigate('ParentDashboard')} /><UnifiedHeader mode="parent" onKid={() => navigation.navigate('Login', { mode: 'kid' })} /></View>
      <View style={styles.body}>
        <AppText variant="label">Parent view</AppText>
        <AppText variant="h2">Safety alerts</AppText>
        <View style={styles.kidTabs}>{vm.kids.map((item) => <Pressable key={item.id} onPress={() => vm.selectKid(item.id)} style={[styles.kidTab, item.id === kid.id && styles.kidTabActive]}><Image source={avatarForKid(item.avatar)} style={styles.avatar} /><AppText variant="tiny">{item.name}</AppText></Pressable>)}</View>
        <Island strong style={styles.reportCard}>
          <AppText variant="tiny">{kid.name}'s report</AppText>
          <AppText variant="h2">{kid.name}'s learning overview</AppText>
          <AppText variant="small">Track learning time, alert patterns, and healthy app habits for this child.</AppText>
          <View style={styles.summaryGrid}><StatCard style={styles.summary}><AppText variant="small">Day streak</AppText><AppText variant="h2">{kid.streak}</AppText><AppText variant="tiny">Learning days</AppText></StatCard><StatCard style={styles.summary}><AppText variant="small">Daily time</AppText><AppText variant="h2">{Math.floor(kid.dailyMinutes / 60)}h {kid.dailyMinutes % 60}m</AppText><AppText variant="tiny">Current day</AppText></StatCard><Pressable style={styles.summaryPress} onPress={() => navigation.navigate('ParentAlerts')}><StatCard style={styles.summary}><AppText variant="small">Alerts</AppText><AppText variant="h2">{kid.alerts}</AppText><AppText variant="tiny">View details</AppText></StatCard></Pressable></View>
        </Island>
        <MiniCard style={styles.chartCard}><AppText variant="h3">Weekly learning minutes</AppText><View style={styles.barRow}>{kid.weeklyMinutes.map((value, idx) => <View key={idx} style={styles.barWrap}><View style={[styles.bar, { height: Math.max(12, value * 1.4) }]} /><AppText variant="tiny">{['M','T','W','T','F','S','S'][idx]}</AppText></View>)}</View></MiniCard>
        <MiniCard style={styles.topics}><AppText variant="h3">Topics explored</AppText><View style={styles.topicRow}>{kid.topics.map((topic) => <View key={topic} style={styles.topic}><AppText variant="tiny" style={styles.topicText}>{topic}</AppText></View>)}</View></MiniCard>
        <AppButton label="Register Kid" variant="secondary" onPress={() => navigation.navigate('KidRegister')} />
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
  reportCard: { gap: spacing.md },
  summaryGrid: { flexDirection: 'row', gap: spacing.sm },
  summary: { flex: 1 },
  summaryPress: { flex: 1 },
  chartCard: { gap: spacing.md },
  barRow: { height: 114, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  barWrap: { alignItems: 'center', gap: 6, flex: 1 },
  bar: { width: 18, borderRadius: 10, backgroundColor: colors.teal },
  topics: { gap: spacing.md },
  topicRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  topic: { borderRadius: 999, paddingHorizontal: 12, paddingVertical: 7, backgroundColor: colors.tealSoft },
  topicText: { color: colors.tealDark }
});
