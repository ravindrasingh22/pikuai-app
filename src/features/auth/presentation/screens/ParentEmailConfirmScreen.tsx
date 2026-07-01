import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../../app/navigation/routes';
import { ScreenShell } from '../../../../core/components/ScreenShell';
import { Island } from '../../../../core/components/Cards';
import { Brand } from '../../../../core/components/Brand';
import { AppText } from '../../../../core/components/AppText';
import { AppInput } from '../../../../core/components/AppInput';
import { AppButton } from '../../../../core/components/AppButton';
import { useAuthViewModel } from '../viewmodels/useAuthViewModel';
import { colors } from '../../../../core/theme/colors';
import { spacing } from '../../../../core/theme/spacing';

type Props = NativeStackScreenProps<RootStackParamList, 'ParentEmailConfirm'>;

export function ParentEmailConfirmScreen({ navigation }: Props) {
  const vm = useAuthViewModel();
  const [code, setCode] = useState('');

  async function onConfirm() {
    const ok = await vm.submitEmailConfirmation(code);
    if (ok) navigation.navigate('ParentDetails');
  }

  return (
    <ScreenShell scroll={false} background="default" bottomWave={false} noPadding contentStyle={styles.screen}>
      <ConfirmHeader onBack={() => navigation.goBack()} />
      <View style={styles.body}>
        <Island strong style={styles.panel}>
        <AppText variant="h2" style={styles.center}>Confirm your email</AppText>
        <AppText variant="small" style={styles.center}>We sent a confirmation code to {vm.maskedEmail}. Enter it to complete parent registration.</AppText>
          <AppInput
            label="Confirmation code"
            value={code}
            onChangeText={setCode}
            keyboardType="number-pad"
            maxLength={6}
            placeholder="Enter 6 digit code"
            textAlign="center"
            style={styles.codeInput}
          />
          {vm.error ? <AppText variant="tiny" style={styles.error}>{vm.error}</AppText> : null}
        </Island>
      </View>
      <View style={styles.actionBar}>
        <AppButton label={vm.loading ? 'Confirming...' : 'Confirm Email'} onPress={onConfirm} disabled={vm.loading || code.trim().length !== 6} style={styles.primaryAction} />
        <AppButton variant="secondary" label={vm.loading ? 'Please wait...' : 'Resend code'} onPress={vm.resendConfirmationCode} disabled={vm.loading} style={styles.secondaryAction} />
      </View>
    </ScreenShell>
  );
}

function ConfirmHeader({ onBack }: { onBack: () => void }) {
  return (
    <View style={styles.topBar}>
      <Pressable onPress={onBack} accessibilityRole="button" accessibilityLabel="Back" style={({ pressed }) => [styles.backButton, pressed && styles.backButtonPressed]}>
        <AppText variant="h2" style={styles.backIcon}>‹</AppText>
      </Pressable>
      <Brand variant="wordmark" style={styles.headerLogo} />
      <View style={styles.headerBalance} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { position: 'relative', paddingBottom: 14, overflow: 'hidden' },
  topBar: {
    minHeight: 62,
    width: '100%',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,143,136,0.12)',
    backgroundColor: 'rgba(255,254,250,0.97)',
    shadowColor: '#008f88',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    borderColor: '#527b83',
    backgroundColor: '#527b83',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#527b83',
    shadowOpacity: 0.24,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 7 },
    elevation: 4
  },
  backButtonPressed: { transform: [{ scale: 0.985 }], backgroundColor: '#466d74' },
  backIcon: { color: colors.white, fontWeight: '900', lineHeight: 30, marginTop: -2 },
  headerLogo: { width: 140, height: 26 },
  headerBalance: { width: 42, height: 42 },
  body: { flex: 1, width: '100%', justifyContent: 'flex-start', paddingHorizontal: spacing.lg, paddingTop: spacing.md },
  panel: { gap: spacing.md, paddingHorizontal: spacing.xl, paddingVertical: 24 },
  center: { textAlign: 'center' },
  codeInput: {
    minHeight: 56,
    borderRadius: 16,
    borderWidth: 2,
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 4
  },
  actionBar: { width: '100%', alignItems: 'center', gap: spacing.sm, paddingHorizontal: spacing.lg, paddingTop: spacing.sm },
  primaryAction: { width: '82%', maxWidth: 252 },
  secondaryAction: { width: '82%', maxWidth: 270 },
  error: { color: colors.danger, textAlign: 'center' }
});
