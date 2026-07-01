import React from 'react';
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

type Props = NativeStackScreenProps<RootStackParamList, 'ParentDetails'>;

export function ParentDetailsScreen({ navigation }: Props) {
  const vm = useAuthViewModel();
  async function onContinue() {
    const ok = await vm.submitParentDetails();
    if (ok) navigation.navigate('ParentOnboarding');
  }
  return (
    <ScreenShell scroll={false} background="default" bottomWave={false} noPadding contentStyle={styles.screen}>
      <DetailsHeader onBack={() => navigation.goBack()} />
      <View style={styles.body}>
        <Island strong style={styles.panel}>
          <View style={styles.intro}>
            <AppText variant="h2">Tell us who manages this family</AppText>
            <AppText variant="small" style={styles.introText}>Create your private parent profile. These details help protect parent-only settings, billing, alerts, and child profile management.</AppText>
          </View>

          <View style={styles.formStack}>
            <View style={styles.row}>
              <View style={styles.fieldHalf}>
                <AppInput label="First name *" value={vm.firstName} onChangeText={vm.setFirstName} placeholder="First name" autoComplete="given-name" />
              </View>
              <View style={styles.fieldHalf}>
                <AppInput label="Last name *" value={vm.lastName} onChangeText={vm.setLastName} placeholder="Last name" autoComplete="family-name" />
              </View>
            </View>
            <AppInput label="Password *" value={vm.password} onChangeText={vm.setPassword} secureTextEntry placeholder="Min. 8 characters" autoComplete="new-password" />
            <AppInput label="Confirm password *" value={vm.confirmPassword} onChangeText={vm.setConfirmPassword} secureTextEntry placeholder="Re-enter password" autoComplete="new-password" />
          </View>

          {!vm.canSubmitDetails && (vm.password.length > 0 || vm.confirmPassword.length > 0) ? <AppText variant="tiny" style={styles.error}>Password must be at least 8 characters and both password fields must match.</AppText> : null}
          {vm.error ? <AppText variant="tiny" style={styles.error}>{vm.error}</AppText> : null}
        </Island>
      </View>
      <View style={styles.actionBar}>
        <AppButton label={vm.loading ? 'Saving...' : 'Continue to Onboarding'} onPress={onContinue} disabled={!vm.canSubmitDetails || vm.loading} style={styles.primaryAction} />
      </View>
    </ScreenShell>
  );
}

function DetailsHeader({ onBack }: { onBack: () => void }) {
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
  intro: { gap: spacing.xs },
  introText: { color: colors.text },
  formStack: { gap: 12 },
  row: { flexDirection: 'row', gap: spacing.sm },
  fieldHalf: { flex: 1 },
  actionBar: { width: '100%', alignItems: 'center', gap: spacing.sm, paddingHorizontal: spacing.lg, paddingTop: spacing.sm },
  primaryAction: { width: '82%', maxWidth: 252 },
  error: { color: colors.danger }
});
