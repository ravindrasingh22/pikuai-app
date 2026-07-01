import React, { useEffect } from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../../app/navigation/routes';
import { ScreenShell } from '../../../../core/components/ScreenShell';
import { MinimalHeader } from '../../../../core/components/AppHeader';
import { Island } from '../../../../core/components/Cards';
import { AppText } from '../../../../core/components/AppText';
import { AppInput } from '../../../../core/components/AppInput';
import { AppButton } from '../../../../core/components/AppButton';
import { SegmentedTabs } from '../../../../core/components/SegmentedTabs';
import { Images, Icons } from '../../../../core/assets/assets';
import { useAuthViewModel } from '../viewmodels/useAuthViewModel';
import { useAppStore } from '../../../../app/state/AppStore';
import { colors } from '../../../../core/theme/colors';
import { spacing } from '../../../../core/theme/spacing';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export function LoginScreen({ navigation, route }: Props) {
  const vm = useAuthViewModel();
  const { state, dispatch } = useAppStore();
  useEffect(() => { if (route.params?.mode) vm.setMode(route.params.mode); }, [route.params?.mode]);
  useEffect(() => {
    if (vm.mode === 'kid' && state.auth.accessToken) {
      vm.refreshKidProfiles();
    }
  }, [state.auth.accessToken, vm.mode, vm.refreshKidProfiles]);
  const selectedKid = state.kids.find((kid) => kid.id === state.activeKidId) ?? state.kids[0];
  async function continueLogin() {
    if (vm.mode === 'parent') {
      const ok = await vm.submitParentPin();
      if (ok) navigation.navigate('ParentDashboard');
      return;
    }
    const verifiedChildId = await vm.submitKidPin(selectedKid?.id);
    if (!verifiedChildId) return;
    const completed = state.kidOnboardingCompleted[verifiedChildId];
    navigation.replace(completed ? 'Home' : 'KidOnboarding');
  }
  return (
    <ScreenShell>
      <MinimalHeader onBack={() => navigation.navigate('Splash')} />
      <Island strong style={styles.panel}>
        <SegmentedTabs value={vm.mode} onChange={(key) => vm.setMode(key as 'kid' | 'parent')} items={[{ key: 'kid', label: 'Kid', icon: '🌟' }, { key: 'parent', label: 'Parent', icon: '🔐' }]} />
        <AppText variant="h2" style={styles.center}>{vm.mode === 'kid' ? 'Who is learning today?' : 'Parent quick access'}</AppText>
        <AppText variant="small" style={styles.center}>{vm.mode === 'kid' ? 'Choose your profile to enter your private PIN.' : 'Enter your parent PIN after a session timeout or when switching from a child profile.'}</AppText>
        {vm.mode === 'kid' ? (
          <View style={styles.kidRow}>
            {vm.loadingKids ? <AppText variant="small" style={styles.center}>Loading child profiles...</AppText> : null}
            {!vm.loadingKids && state.kids.length === 0 ? <AppText variant="small" style={styles.center}>No child profile is ready yet. Ask a parent to add one first.</AppText> : null}
            {!vm.loadingKids && state.kids.map((kid) => (
              <Pressable key={kid.id} onPress={() => dispatch({ type: 'kid/select', payload: kid.id })} style={[styles.kidCard, kid.id === state.activeKidId && styles.kidActive]}>
                <Image source={kid.avatar === 'maya' ? Images.kidMaya : Images.kidRavin} style={styles.kidImage} />
                <AppText variant="small" style={styles.center}>{kid.name}</AppText>
              </Pressable>
            ))}
          </View>
        ) : (
          <View style={styles.parentCard}>
            <Image source={Icons.parentProfile} style={styles.parentIcon} />
            <View><AppText variant="small">Selected profile</AppText><AppText variant="h3">Parent</AppText></View>
          </View>
        )}
        <AppInput label={vm.mode === 'parent' ? 'Parent PIN' : `${selectedKid?.name ?? 'Kid'} PIN`} placeholder="Enter 4 digit PIN" value={vm.pin} onChangeText={(value) => vm.setPin(value.replace(/\D/g, '').slice(0, 4))} keyboardType="number-pad" maxLength={4} textAlign="center" />
        {vm.mode === 'parent' ? <AppText variant="tiny" style={styles.legal}>☑ I agree to the Terms & Conditions.</AppText> : null}
        {vm.error ? <AppText variant="tiny" style={styles.error}>{vm.error}</AppText> : null}
        <AppButton label={vm.loading || vm.loadingKids ? 'Checking...' : vm.mode === 'parent' ? 'Open Parent Home' : 'Start Learning'} onPress={continueLogin} disabled={vm.loading || vm.loadingKids || vm.pin.length !== 4 || (vm.mode === 'kid' && !selectedKid)} />
        {vm.mode === 'parent' ? <AppButton variant="secondary" label="Login with email" onPress={() => navigation.navigate('ParentFullLogin')} /> : null}
      </Island>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  panel: { gap: spacing.md },
  center: { textAlign: 'center' },
  kidRow: { flexDirection: 'row', gap: spacing.md, justifyContent: 'center' },
  kidCard: { width: 120, borderRadius: 22, padding: 14, alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.86)', borderWidth: 1, borderColor: colors.atlasLine, gap: 8 },
  kidActive: { borderColor: colors.teal, backgroundColor: '#f0faf8' },
  kidImage: { width: 70, height: 70, borderRadius: 35 },
  parentCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, borderRadius: 22, padding: spacing.md, backgroundColor: '#f8f3e9', borderWidth: 1, borderColor: colors.sandLine },
  parentIcon: { width: 54, height: 54, borderRadius: 27 },
  legal: { color: colors.tealDeep },
  error: { color: colors.danger, textAlign: 'center' }
});
