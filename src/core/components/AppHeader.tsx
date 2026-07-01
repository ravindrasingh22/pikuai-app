import React from 'react';
import { Image, ImageSourcePropType, Pressable, StyleSheet, View } from 'react-native';
import { Brand } from './Brand';
import { AppText } from './AppText';
import { Images, Icons } from '../assets/assets';
import { colors } from '../theme/colors';
import { radius } from '../theme/spacing';

export function GhostBack({ onPress }: { onPress?: () => void }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel="Back" style={({ pressed }) => [styles.ghost, pressed && styles.ghostPressed]}>
      <AppText variant="h2" style={styles.back}>‹</AppText>
    </Pressable>
  );
}

export function MenuButton({ onPress }: { onPress?: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.menuButton}>
      <View style={styles.menuLine} /><View style={styles.menuLine} /><View style={styles.menuLine} />
    </Pressable>
  );
}

export function ProfileAvatar({ kind = 'kid', active, onPress, source }: { kind?: 'kid' | 'parent'; active?: boolean; onPress?: () => void; source?: ImageSourcePropType }) {
  return (
    <Pressable onPress={onPress} style={[styles.avatarButton, active && styles.avatarActive]}>
      <Image source={source ?? (kind === 'parent' ? Icons.parentProfile : Images.kidRavin)} style={styles.avatarImage} />
    </Pressable>
  );
}

export function MinimalHeader({ onBack, skipLabel, onSkip, brand = 'wordmark' }: { onBack?: () => void; skipLabel?: string; onSkip?: () => void; brand?: 'wordmark' | 'icon' }) {
  return (
    <View style={styles.minimal}>
      {onBack ? <GhostBack onPress={onBack} /> : null}
      <View style={styles.headerSlot} />
      <Brand variant={brand} style={brand === 'wordmark' ? styles.wordmarkSmall : styles.iconSmall} />
      {skipLabel ? <Pressable onPress={onSkip} style={styles.skip}><AppText variant="tiny" style={styles.skipText}>{skipLabel}</AppText></Pressable> : <View style={styles.headerSlot} />}
    </View>
  );
}

export function UnifiedHeader({ mode = 'parent', onMenu, onParent, onKid, kidSource }: { mode?: 'parent' | 'kid'; onMenu?: () => void; onParent?: () => void; onKid?: () => void; kidSource?: ImageSourcePropType }) {
  return (
    <View style={styles.unified}>
      <View style={styles.leftGroup}>
        <MenuButton onPress={onMenu} />
        <Brand variant="icon" style={styles.iconSmall} />
      </View>
      <View style={styles.profileSwitch}>
        <ProfileAvatar kind="parent" active={mode === 'parent'} onPress={onParent} />
        <ProfileAvatar kind="kid" active={mode === 'kid'} onPress={onKid} source={kidSource} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  minimal: { height: 58, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', zIndex: 3, position: 'relative' },
  unified: { height: 58, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', zIndex: 3 },
  leftGroup: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerSlot: { width: 42, height: 42 },
  ghost: {
    position: 'absolute',
    zIndex: 58,
    top: '50%',
    left: -6,
    marginTop: -21,
    width: 24,
    minWidth: 24,
    height: 42,
    minHeight: 42,
    padding: 0,
    borderTopRightRadius: 14,
    borderBottomRightRadius: 14,
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
    borderWidth: 1,
    borderColor: colors.tealLine,
    backgroundColor: 'rgba(255,254,250,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#343a37',
    shadowOpacity: 0.1,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 5 },
    elevation: 3
  },
  ghostPressed: { backgroundColor: colors.white, transform: [{ scale: 0.985 }] },
  back: { marginTop: -2, marginLeft: -1, color: colors.tealDeep, fontWeight: '900', lineHeight: 28 },
  wordmarkSmall: { width: 116, height: 45 },
  iconSmall: { width: 32, height: 32 },
  skip: { height: 34, paddingHorizontal: 13, borderRadius: radius.pill, backgroundColor: 'rgba(255,255,255,0.75)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.atlasLine },
  skipText: { color: colors.inkMid },
  menuButton: { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.74)', borderWidth: 1, borderColor: colors.atlasLine, justifyContent: 'center', paddingHorizontal: 11, gap: 4 },
  menuLine: { height: 2, borderRadius: 2, backgroundColor: colors.tealDark },
  profileSwitch: { flexDirection: 'row', alignItems: 'center', gap: -6, backgroundColor: 'rgba(255,255,255,0.7)', padding: 3, borderRadius: 22, borderWidth: 1, borderColor: colors.atlasLine },
  avatarButton: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center', opacity: 0.65 },
  avatarActive: { opacity: 1, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.tealLine },
  avatarImage: { width: 28, height: 28, borderRadius: 14, resizeMode: 'cover' }
});
