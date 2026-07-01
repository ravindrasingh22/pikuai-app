import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../../app/navigation/routes';
import { ScreenShell } from '../../../../core/components/ScreenShell';
import { MinimalHeader } from '../../../../core/components/AppHeader';
import { Island } from '../../../../core/components/Cards';
import { AppText } from '../../../../core/components/AppText';
import { AppButton } from '../../../../core/components/AppButton';
import { useAppStore } from '../../../../app/state/AppStore';
import { colors } from '../../../../core/theme/colors';
import { spacing } from '../../../../core/theme/spacing';

type Props = NativeStackScreenProps<RootStackParamList, 'KidOnboarding'>;

const slides = [
  { title: 'Learn in simple words', text: 'Get clear answers, easy examples, and helpful follow-up ideas made for kids.', visual: 'learn' },
  { title: 'Choose your next adventure', text: 'Follow what you love, from space and animals to art and inventions, and discover something new each time.', visual: 'safe' }
];

function KidVisual({ type }: { type: string }) {
  return (
    <View style={styles.visual}>
      <View style={styles.grid} />
      {type === 'ask' ? <><View style={[styles.orb, styles.orb1]} /><View style={styles.questionCard}><AppText variant="tiny">Tap a question</AppText></View></> : null}
      {type === 'learn' ? <><View style={styles.noteCard}><AppText variant="tiny">Your answer</AppText></View><View style={styles.noteCardSmall}><AppText variant="tiny">Try next</AppText></View></> : null}
      {type === 'safe' ? <><View style={styles.compass} /><View style={styles.path} /></> : null}
    </View>
  );
}

export function KidOnboardingScreen({ navigation }: Props) {
  const { state, dispatch } = useAppStore();
  const [index, setIndex] = useState(0);
  const slide = slides[index];
  function finish() {
    if (state.activeKidId) {
      dispatch({ type: 'kid/onboardingComplete', payload: state.activeKidId });
    }
    navigation.navigate('Home');
  }
  function next() { index === slides.length - 1 ? finish() : setIndex(index + 1); }
  return (
    <ScreenShell scroll={false}>
      <View style={styles.full}>
        <MinimalHeader />
        <Island strong style={styles.card}>
          <KidVisual type={slide.visual} />
          <AppText variant="tiny" style={styles.center}>{index + 1} of {slides.length}</AppText>
          <AppText variant="h2" style={styles.center}>{slide.title}</AppText>
          <AppText variant="small" style={styles.center}>{slide.text}</AppText>
          <View style={styles.dots}>{slides.map((_, dot) => <View key={dot} style={[styles.dot, dot === index && styles.dotActive]} />)}</View>
        </Island>
        <AppButton label={index === slides.length - 1 ? 'Continue' : 'Next'} onPress={next} style={styles.bottom} />
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  full: { flex: 1, justifyContent: 'space-between' },
  card: { gap: spacing.md, alignItems: 'center', marginTop: 18 },
  center: { textAlign: 'center' },
  visual: { width: '82%', height: 210, borderRadius: 26, backgroundColor: 'rgba(255,255,255,0.82)', borderWidth: 1, borderColor: colors.atlasLine, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  grid: { ...StyleSheet.absoluteFillObject, opacity: 0.3, backgroundColor: '#f7f2e8' },
  orb: { width: 52, height: 52, borderRadius: 26, backgroundColor: colors.mint },
  orb1: { position: 'absolute', left: 54, top: 66 },
  questionCard: { position: 'absolute', right: 38, top: 70, width: 112, height: 62, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.white, borderWidth: 1, borderColor: colors.atlasLine },
  noteCard: { width: 140, height: 76, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.white, borderWidth: 1, borderColor: colors.atlasLine },
  noteCardSmall: { position: 'absolute', right: 40, bottom: 52, width: 88, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.mint },
  compass: { width: 84, height: 84, borderRadius: 42, borderWidth: 8, borderColor: colors.teal, borderLeftColor: colors.atlasLine },
  path: { position: 'absolute', bottom: 54, width: 140, height: 12, borderRadius: 10, backgroundColor: colors.atlasCream },
  dots: { flexDirection: 'row', gap: 8, marginTop: 4 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.atlasLine },
  dotActive: { width: 24, backgroundColor: colors.teal },
  bottom: { marginBottom: spacing.lg }
});
