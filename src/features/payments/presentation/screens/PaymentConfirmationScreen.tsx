import React from 'react';
import { StyleSheet, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../../app/navigation/routes';
import { ScreenShell } from '../../../../core/components/ScreenShell';
import { Island } from '../../../../core/components/Cards';
import { AppText } from '../../../../core/components/AppText';
import { AppButton } from '../../../../core/components/AppButton';
import { colors } from '../../../../core/theme/colors';
import { spacing } from '../../../../core/theme/spacing';

type Props = NativeStackScreenProps<RootStackParamList, 'PaymentConfirmation'>;

export function PaymentConfirmationScreen({ navigation, route }: Props) {
  const plan = route.params?.planId ?? 'monthly';
  const label = plan === 'annual' ? 'Annual' : plan === 'quarterly' ? 'Quarterly' : 'Monthly';
  return (
    <ScreenShell center>
      <Island strong style={styles.card}>
        <View style={styles.check}><AppText variant="h1" style={styles.checkText}>✓</AppText></View>
        <AppText variant="h2" style={styles.center}>Payment confirmed</AppText>
        <AppText variant="small" style={styles.center}>Pratvim Family {label} is ready for your children.</AppText>
        <AppText variant="tiny" style={styles.center}>The app remains offline-only in this prototype. No backend or gateway was called.</AppText>
        <AppButton label="Return to Parent Home" onPress={() => navigation.navigate('ParentDashboard')} />
      </Island>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({ card: { gap: spacing.md, alignItems: 'center' }, check: { width: 76, height: 76, borderRadius: 38, backgroundColor: colors.teal, alignItems: 'center', justifyContent: 'center' }, checkText: { color: colors.white }, center: { textAlign: 'center' } });
