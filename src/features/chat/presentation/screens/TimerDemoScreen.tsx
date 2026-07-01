import React from 'react';
import { StyleSheet, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../../app/navigation/routes';
import { ScreenShell } from '../../../../core/components/ScreenShell';
import { GhostBack } from '../../../../core/components/AppHeader';
import { MiniCard } from '../../../../core/components/Cards';
import { AppText } from '../../../../core/components/AppText';
import { colors } from '../../../../core/theme/colors';
import { spacing } from '../../../../core/theme/spacing';

type Props = NativeStackScreenProps<RootStackParamList, 'TimerDemo'>;
const timers = ['Soft pulse', 'Orbit dot', 'Breathing ring', 'Progress sweep', 'Tiny tick', 'Glow beat'];
export function TimerDemoScreen({ navigation }: Props) {
  return <ScreenShell><GhostBack onPress={() => navigation.goBack()} /><AppText variant="label">Choose style</AppText><AppText variant="h2">Timer Animations</AppText><View style={styles.list}>{timers.map((timer) => <MiniCard key={timer} style={styles.card}><View style={styles.ring}><AppText variant="tiny" style={styles.ringText}>4h</AppText></View><View style={styles.copy}><AppText variant="h3">{timer}</AppText><AppText variant="small">Gentle timer motion matching the child chat header.</AppText></View></MiniCard>)}</View></ScreenShell>;
}
const styles = StyleSheet.create({ list: { gap: spacing.md, marginTop: spacing.md }, card: { flexDirection: 'row', alignItems: 'center', gap: spacing.md }, ring: { width: 58, height: 58, borderRadius: 29, borderWidth: 4, borderColor: colors.teal, alignItems: 'center', justifyContent: 'center' }, ringText: { color: colors.tealDeep }, copy: { flex: 1 } });
