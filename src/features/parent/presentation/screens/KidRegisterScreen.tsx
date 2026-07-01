import React, { useEffect, useState } from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../../app/navigation/routes';
import { ScreenShell } from '../../../../core/components/ScreenShell';
import { UnifiedHeader } from '../../../../core/components/AppHeader';
import { Island } from '../../../../core/components/Cards';
import { AppText } from '../../../../core/components/AppText';
import { AppInput } from '../../../../core/components/AppInput';
import { AppButton } from '../../../../core/components/AppButton';
import { useParentViewModel, avatarForKid } from '../viewmodels/useParentViewModel';
import { colors } from '../../../../core/theme/colors';
import { spacing } from '../../../../core/theme/spacing';

type Props = NativeStackScreenProps<RootStackParamList, 'KidRegister'>;
const genderOptions = ['Boy', 'Girl', 'Prefer not to say'] as const;

export function KidRegisterScreen({ navigation }: Props) {
  const vm = useParentViewModel();

  useEffect(() => {
    if (!vm.state.auth.parentUnlocked) {
      navigation.replace('Login', { mode: 'parent' });
      return;
    }
    vm.refreshChildren();
  }, [navigation, vm.state.auth.parentUnlocked, vm.refreshChildren]);

  return (
    <ScreenShell>
      <UnifiedHeader mode="parent" onMenu={() => navigation.navigate('ParentDashboard')} onKid={() => navigation.navigate('Login', { mode: 'kid' })} />
      <Island strong style={styles.panel}>
        <View style={styles.intro}><View><AppText variant="label">Child setup</AppText><AppText variant="h2">Create a child profile</AppText><AppText variant="small">Add basic details and a private PIN for protected access.</AppText></View><View style={styles.count}><AppText variant="h3" style={styles.countText}>+</AppText><AppText variant="tiny">{Math.min(vm.kids.length + 1, 4)} of 4</AppText></View></View>
        <AppInput label="Kid nickname *" helper="Pratvim never requires your child's real name. Please add a nickname instead." value={vm.kidName} onChangeText={vm.setKidName} />
        <View style={styles.generated}><AppText variant="h1" style={styles.generatedText}>{(vm.kidName || 'R').charAt(0).toUpperCase()}</AppText></View>
        <View style={styles.row}><AppInput label="Age *" value={vm.kidAge} onChangeText={vm.setKidAge} keyboardType="number-pad" maxLength={2} style={styles.half} /><GenderDropdown value={vm.kidGender || 'Prefer not to say'} onChange={vm.setKidGender} /></View>
        <AppInput label="Kid login PIN *" value={vm.kidPin} onChangeText={vm.setKidPin} keyboardType="number-pad" maxLength={4} />
        {vm.kidError ? <AppText variant="tiny" style={styles.error}>{vm.kidError}</AppText> : null}
        <AppButton label={vm.savingKid ? 'Adding child...' : 'Add a kid'} onPress={vm.addKid} disabled={vm.savingKid || vm.loadingChildren} />
        <View style={styles.added}><AppText variant="h3">Added children</AppText><AppText variant="tiny">Tap a profile on Parent Home to edit or remove it.</AppText></View>
        {vm.loadingChildren ? <AppText variant="small" style={styles.center}>Loading child profiles...</AppText> : null}
        {!vm.loadingChildren && vm.kids.length === 0 ? <AppText variant="small" style={styles.center}>No child profiles have been added yet.</AppText> : null}
        {!vm.loadingChildren && vm.kids.length > 0 ? <View style={styles.kidsRow}>{vm.kids.map((kid) => <Pressable key={kid.id} style={styles.kid}><Image source={avatarForKid(kid.avatar)} style={styles.kidImage} /><AppText variant="tiny" style={styles.center}>{kid.name}</AppText><AppText variant="tiny" style={styles.kidMeta}>{kid.age} yrs</AppText></Pressable>)}</View> : null}
      </Island>
      <AppButton variant="secondary" label="Finish and open Parent Home" onPress={() => navigation.navigate('ParentDashboard')} style={styles.finish} />
    </ScreenShell>
  );
}

function GenderDropdown({ value, onChange }: { value: typeof genderOptions[number]; onChange: (value: typeof genderOptions[number]) => void }) {
  const [open, setOpen] = useState(false);

  return (
    <View style={styles.dropdownWrap}>
      <AppText variant="small" style={styles.dropdownLabel}>Gender</AppText>
      <Pressable onPress={() => setOpen((current) => !current)} style={[styles.dropdownButton, open && styles.dropdownButtonOpen]}>
        <AppText variant="small" style={styles.dropdownValue}>{value}</AppText>
        <AppText variant="small" style={styles.dropdownChevron}>{open ? '⌃' : '⌄'}</AppText>
      </Pressable>
      {open ? (
        <View style={styles.dropdownMenu}>
          {genderOptions.map((option) => (
            <Pressable key={option} onPress={() => { onChange(option); setOpen(false); }} style={[styles.dropdownOption, option === value && styles.dropdownOptionActive]}>
              <AppText variant="small" style={[styles.dropdownOptionText, option === value && styles.dropdownOptionTextActive]}>{option}</AppText>
            </Pressable>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  panel: { gap: spacing.md },
  intro: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.md },
  count: { width: 72, height: 52, borderRadius: 18, backgroundColor: colors.tealSoft, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.tealLine },
  countText: { color: colors.tealDeep, marginBottom: -8 },
  generated: { width: 74, height: 74, borderRadius: 37, alignSelf: 'center', backgroundColor: colors.teal, alignItems: 'center', justifyContent: 'center' },
  generatedText: { color: colors.white },
  row: { flexDirection: 'row', gap: spacing.sm },
  half: { flex: 1 },
  dropdownWrap: { flex: 1, gap: 6, zIndex: 3 },
  dropdownLabel: { color: colors.inkMid, fontWeight: '800' },
  dropdownButton: {
    minHeight: 48,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderWidth: 1,
    borderColor: colors.atlasLine,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm
  },
  dropdownButtonOpen: { borderColor: colors.tealLine, backgroundColor: '#f7fcfb' },
  dropdownValue: { color: colors.ink, fontWeight: '700', flex: 1 },
  dropdownChevron: { color: colors.tealDeep, fontWeight: '900' },
  dropdownMenu: {
    marginTop: 2,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.tealLine,
    backgroundColor: colors.cream,
    overflow: 'hidden',
    shadowColor: '#343a37',
    shadowOpacity: 0.12,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8
  },
  dropdownOption: { minHeight: 42, justifyContent: 'center', paddingHorizontal: spacing.md, borderBottomWidth: 1, borderBottomColor: 'rgba(231,226,217,0.72)' },
  dropdownOptionActive: { backgroundColor: colors.tealSoft },
  dropdownOptionText: { color: colors.inkMid, fontWeight: '800' },
  dropdownOptionTextActive: { color: colors.tealDeep },
  added: { marginTop: 4 },
  kidsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  kid: { width: 92, borderRadius: 18, alignItems: 'center', padding: 8, backgroundColor: 'rgba(255,255,255,0.78)', borderWidth: 1, borderColor: colors.atlasLine },
  kidImage: { width: 44, height: 44, borderRadius: 22 },
  center: { textAlign: 'center' },
  kidMeta: { color: colors.muted, textAlign: 'center' },
  error: { color: colors.danger, textAlign: 'center' },
  finish: { marginTop: spacing.md }
});
