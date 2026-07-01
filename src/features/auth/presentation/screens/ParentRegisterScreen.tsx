import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../../app/navigation/routes';
import { ScreenShell } from '../../../../core/components/ScreenShell';
import { Island } from '../../../../core/components/Cards';
import { AppText } from '../../../../core/components/AppText';
import { AppInput } from '../../../../core/components/AppInput';
import { AppButton } from '../../../../core/components/AppButton';
import { Brand } from '../../../../core/components/Brand';
import { useAuthViewModel } from '../viewmodels/useAuthViewModel';
import { colors } from '../../../../core/theme/colors';
import { radius, spacing } from '../../../../core/theme/spacing';

type Props = NativeStackScreenProps<RootStackParamList, 'ParentRegister'>;

export function ParentRegisterScreen({ navigation }: Props) {
  const vm = useAuthViewModel();
  async function onRegister() {
    const ok = await vm.submitParentEmailRegistration();
    if (ok) navigation.navigate('ParentEmailConfirm');
  }

  return (
    <ScreenShell scroll={false} background="default" bottomWave={false} noPadding contentStyle={styles.screen}>
      <RegisterHeader onBack={() => navigation.navigate('Splash')} />
      <View style={styles.body}>
        <Island strong style={styles.panel}>
          <View style={styles.intro}>
            <AppText variant="h2">Create parent account</AppText>
          </View>

          <View style={styles.hint}>
            <View style={styles.hintIcon}><AppText variant="body">✉️</AppText></View>
            <AppText variant="small" style={styles.hintText}>Just your email to start — we'll collect the rest as you set up your family space in the next steps.</AppText>
          </View>

          <AppInput label="Email address" value={vm.email} onChangeText={vm.setEmail} keyboardType="email-address" autoCapitalize="none" placeholder="parent@example.com" />

          <View style={styles.terms}>
            <View style={styles.check}><AppText variant="tiny" style={styles.checkText}>✓</AppText></View>
            <AppText variant="tiny" style={styles.termsText}>I agree to the Terms & Conditions and Privacy Policy.</AppText>
          </View>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <AppText variant="tiny" style={styles.dividerText}>Or register through</AppText>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.socialRow}>
            <SocialProvider label="Google" mark="G" kind="google" onPress={() => navigation.navigate('ParentEmailConfirm')} />
            <SocialProvider label="Facebook" mark="f" kind="facebook" onPress={() => navigation.navigate('ParentEmailConfirm')} />
          </View>

          {vm.error ? <AppText variant="tiny" style={styles.error}>{vm.error}</AppText> : null}
        </Island>
      </View>
      <View style={styles.actionBar}>
        <AppButton label={vm.loading ? 'Sending...' : 'Register Now'} onPress={onRegister} disabled={vm.loading} style={styles.primaryAction} />
        <RegisterLoginAction onPress={() => navigation.navigate('ParentFullLogin')} />
      </View>
    </ScreenShell>
  );
}

function RegisterHeader({ onBack }: { onBack: () => void }) {
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

function SocialProvider({ label, mark, kind, onPress }: { label: string; mark: string; kind: 'google' | 'facebook'; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.socialButton, pressed && styles.socialPressed]}>
      <View style={[styles.providerMark, kind === 'google' ? styles.googleMark : styles.facebookMark]}>
        <AppText variant="small" style={[styles.providerMarkText, kind === 'google' ? styles.googleMarkText : styles.facebookMarkText]}>{mark}</AppText>
      </View>
      <AppText variant="tiny" style={styles.socialLabel}>{label}</AppText>
    </Pressable>
  );
}

function RegisterLoginAction({ onPress }: { onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.loginAction, pressed && styles.loginActionPressed]}>
      <AppText variant="small" style={styles.loginActionText}>Already registered? Login</AppText>
    </Pressable>
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
  intro: { width: '100%' },
  hint: {
    width: '100%',
    marginTop: 2,
    marginBottom: 2,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'rgba(92,132,137,0.18)',
    backgroundColor: 'rgba(248,239,225,0.42)',
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm
  },
  hintIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.atlasCard,
    alignItems: 'center',
    justifyContent: 'center'
  },
  hintText: { flex: 1, color: colors.text, lineHeight: 18 },
  terms: { alignItems: 'center', gap: spacing.xs, paddingVertical: spacing.xs },
  check: {
    width: 18,
    height: 18,
    borderRadius: 5,
    backgroundColor: colors.tealDeep,
    alignItems: 'center',
    justifyContent: 'center'
  },
  checkText: { color: colors.white, lineHeight: 14 },
  termsText: { textAlign: 'center', color: colors.text, lineHeight: 17 },
  divider: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: spacing.xs },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#dfe5e3' },
  dividerText: { color: '#737d7f' },
  socialRow: { flexDirection: 'row', gap: spacing.sm },
  socialButton: {
    flex: 1,
    minHeight: 46,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: '#cad8d8',
    backgroundColor: colors.atlasCard,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md
  },
  socialPressed: { backgroundColor: '#eef3f2', transform: [{ translateY: -1 }] },
  providerMark: { width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  googleMark: { backgroundColor: colors.white, borderWidth: 1, borderColor: '#e2e2e2' },
  facebookMark: { backgroundColor: '#4267b2' },
  providerMarkText: { fontWeight: '900', lineHeight: 17 },
  googleMarkText: { color: '#c84a31' },
  facebookMarkText: { color: colors.white },
  socialLabel: { color: '#39484b', fontWeight: '900' },
  actionBar: { width: '100%', alignItems: 'center', gap: spacing.sm, paddingTop: spacing.sm, paddingHorizontal: spacing.lg },
  primaryAction: { width: '82%', maxWidth: 252 },
  loginAction: {
    width: '82%',
    maxWidth: 270,
    minHeight: 48,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: 'rgba(229,211,184,0.88)',
    backgroundColor: 'rgba(255,255,252,0.74)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    shadowColor: '#444e44',
    shadowOpacity: 0.05,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 1
  },
  loginActionPressed: { backgroundColor: 'rgba(248,239,225,0.82)', transform: [{ scale: 0.985 }] },
  loginActionText: { color: '#315f66', fontWeight: '900', letterSpacing: 1, textAlign: 'center' },
  error: { color: colors.danger, textAlign: 'center' },
});
