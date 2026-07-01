import React from 'react';
import { StyleSheet, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../../app/navigation/routes';
import { ScreenShell } from '../../../../core/components/ScreenShell';
import { GhostBack } from '../../../../core/components/AppHeader';
import { Island } from '../../../../core/components/Cards';
import { AppText } from '../../../../core/components/AppText';
import { AppButton } from '../../../../core/components/AppButton';
import { colors } from '../../../../core/theme/colors';
import { spacing } from '../../../../core/theme/spacing';

type Props = NativeStackScreenProps<RootStackParamList, 'ParentAlert'>;

export function ParentAlertScreen({ navigation }: Props) {
  return (
    <ScreenShell center>
      <GhostBack onPress={() => navigation.goBack()} />
      <Island strong style={styles.card}>
        <View style={styles.icon}><AppText variant="h1" style={styles.iconText}>!</AppText></View>
        <AppText variant="h2" style={styles.center}>Chat paused</AppText>
        <AppText variant="small" style={styles.center}>The daily learning timer reached its limit. A parent can review this session before continuing.</AppText>
        <Island style={styles.reason}><AppText variant="label">Reason</AppText><AppText variant="h3">Screen time limit reached</AppText><AppText variant="small">Question: Why is the sky blue?</AppText></Island>
        <AppButton label="Open parent alerts" onPress={() => navigation.navigate('ParentAlerts')} />
        <AppButton variant="secondary" label="Back to chat" onPress={() => navigation.navigate('Chat')} />
      </Island>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({ card: { gap: spacing.md, alignItems: 'center' }, center: { textAlign: 'center' }, icon: { width: 70, height: 70, borderRadius: 35, backgroundColor: colors.warning, alignItems: 'center', justifyContent: 'center' }, iconText: { color: colors.danger }, reason: { width: '100%', gap: 4, padding: spacing.md } });
