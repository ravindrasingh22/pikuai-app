import React from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../../app/navigation/routes';
import { ScreenShell } from '../../../../core/components/ScreenShell';
import { UnifiedHeader } from '../../../../core/components/AppHeader';
import { Island } from '../../../../core/components/Cards';
import { AppText } from '../../../../core/components/AppText';
import { AppButton } from '../../../../core/components/AppButton';
import { AppInput } from '../../../../core/components/AppInput';
import { Images } from '../../../../core/assets/assets';
import { useAppStore } from '../../../../app/state/AppStore';
import { colors } from '../../../../core/theme/colors';
import { spacing } from '../../../../core/theme/spacing';

type Props = NativeStackScreenProps<RootStackParamList, 'AvatarLibrary'>;
const avatarOptions = ['👧','🧒','👦','👩‍🚀','🧑‍🎨','🧑‍🔬','🧑‍🚀','🧑‍🏫','🦊','🐼','🐯','🐧'];

export function AvatarLibraryScreen({ navigation }: Props) {
  const { state, dispatch } = useAppStore();
  const kid = state.kids.find((item) => item.id === state.activeKidId) ?? state.kids[0];
  return (
    <ScreenShell>
      <UnifiedHeader mode="parent" onKid={() => navigation.navigate('Login', { mode: 'kid' })} />
      <Island strong style={styles.card}>
        <AppText variant="label">Child profile</AppText>
        <AppText variant="h2">Make this profile yours</AppText>
        <AppText variant="small">Choose a character. Parents can update it automatically anytime.</AppText>
        <View style={styles.preview}><Image source={kid.avatar === 'maya' ? Images.kidMaya : Images.kidRavin} style={styles.previewImage} /><AppInput label="Display name" value={kid.name} editable={false} style={styles.nameInput} /></View>
        <AppText variant="small">Choose a character</AppText>
        <View style={styles.grid}>{avatarOptions.map((avatar, idx) => <Pressable key={`${avatar}-${idx}`} onPress={() => dispatch({ type: 'avatar/select', payload: 'generated' })} style={[styles.avatarChoice, state.selectedAvatar === 'generated' && idx === 0 && styles.choiceActive]}><AppText variant="h2">{avatar}</AppText></Pressable>)}</View>
        <AppButton label="Save child profile" onPress={() => navigation.navigate('Home')} />
      </Island>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({ card: { gap: spacing.md }, preview: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, backgroundColor: 'rgba(255,255,255,0.74)', borderRadius: 22, padding: spacing.md, borderWidth: 1, borderColor: colors.atlasLine }, previewImage: { width: 74, height: 74, borderRadius: 37 }, nameInput: { flex: 1 }, grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 }, avatarChoice: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.82)', borderWidth: 1, borderColor: colors.atlasLine }, choiceActive: { borderColor: colors.teal, backgroundColor: colors.tealSoft } });
