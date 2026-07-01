import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../../app/navigation/routes';
import { useAppStore } from '../../../../app/state/AppStore';
import { ScreenShell } from '../../../../core/components/ScreenShell';
import { Island } from '../../../../core/components/Cards';
import { Brand } from '../../../../core/components/Brand';
import { AppText } from '../../../../core/components/AppText';
import { AppInput } from '../../../../core/components/AppInput';
import { AppButton } from '../../../../core/components/AppButton';
import { ApiRequestError } from '../../../../core/api/client';
import { loginParent } from '../../data/parentAuthApi';
import { colors } from '../../../../core/theme/colors';
import { spacing } from '../../../../core/theme/spacing';

type Props = NativeStackScreenProps<RootStackParamList, 'ParentFullLogin'>;

export function ParentFullLoginScreen({ navigation }: Props) {
  const { state, dispatch } = useAppStore();
  const [email, setEmail] = useState(state.parent.email);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onLogin() {
    setLoading(true);
    setError(null);
    try {
      const response = await loginParent(email.trim().toLowerCase(), password);
      dispatch({
        type: 'auth/update',
        payload: {
          accessToken: response.access_token_optional ?? undefined,
          refreshToken: response.refresh_token_optional ?? undefined,
          nextStep: response.next_step
        }
      });
      dispatch({ type: 'parent/update', payload: { email: email.trim().toLowerCase() } });

      if (response.next_step === 'confirm_email') {
        navigation.navigate('ParentEmailConfirm');
      } else if (response.next_step === 'parent_details') {
        navigation.navigate('ParentDetails');
      } else if (response.next_step === 'parent_onboarding' || response.next_step === 'setup_parent_pin' || !response.pin_enabled) {
        navigation.navigate('ParentOnboarding');
      } else {
        navigation.navigate('Login', { mode: 'parent' });
      }
    } catch (caught) {
      if (caught instanceof ApiRequestError || caught instanceof Error) setError(caught.message);
      else setError('Unable to log in.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScreenShell scroll={false} background="default" bottomWave={false} noPadding contentStyle={styles.screen}>
      <LoginHeader onBack={() => navigation.navigate('Login', { mode: 'parent' })} />
      <View style={styles.body}>
        <Island strong style={styles.panel}>
          <AppText variant="h2" style={styles.center}>Parent account login</AppText>
          <AppText variant="small" style={styles.center}>Use your registered email, then unlock parent mode with your parent PIN.</AppText>
          <AppInput label="Parent email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
          <AppInput label="Password" value={password} onChangeText={setPassword} secureTextEntry />
          <View style={styles.providers}>
            <AppButton variant="secondary" label="Google" disabled style={styles.provider} />
            <AppButton variant="secondary" label="Facebook" disabled style={styles.provider} />
          </View>
          {error ? <AppText variant="tiny" style={styles.error}>{error}</AppText> : null}
          <AppButton label={loading ? 'Signing in...' : 'Continue'} onPress={onLogin} disabled={loading || !email.trim() || !password} />
          <AppButton variant="secondary" label="Use quick PIN instead" onPress={() => navigation.navigate('Login', { mode: 'parent' })} />
          <AppButton variant="secondary" label="New parent? Register first" onPress={() => navigation.navigate('ParentRegister')} />
        </Island>
      </View>
    </ScreenShell>
  );
}

function LoginHeader({ onBack }: { onBack: () => void }) {
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
  providers: { flexDirection: 'row', gap: spacing.sm },
  provider: { flex: 1 },
  error: { color: colors.danger, textAlign: 'center' }
});
