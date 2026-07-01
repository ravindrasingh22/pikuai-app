import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { RootStackParamList } from '../../../../app/navigation/routes';
import { useAppStore } from '../../../../app/state/AppStore';
import { ScreenShell } from '../../../../core/components/ScreenShell';
import { Brand } from '../../../../core/components/Brand';
import { AppText } from '../../../../core/components/AppText';
import { AppButton } from '../../../../core/components/AppButton';
import { AppInput } from '../../../../core/components/AppInput';
import { ApiRequestError } from '../../../../core/api/client';
import { completeParentOnboarding, setupParentPin } from '../../../auth/data/parentAuthApi';
import { colors } from '../../../../core/theme/colors';
import { spacing } from '../../../../core/theme/spacing';

type Props = NativeStackScreenProps<RootStackParamList, 'ParentOnboarding'>;

const slides = [
  { title: 'Welcome, Parents', text: 'Create a safe space where each child can ask, learn, and explore with confidence.', features: ['Kid profiles', 'Private PINs'], visual: 'setup' },
  { title: 'Protected AI conversations', text: 'Set up safe text and image questions with age-aware answers for your kids.', features: ['Protected chat', 'Image questions'], visual: 'chat' },
  { title: 'Secure parent access', text: 'Reports, screen time & safety alerts — all in one place.', features: ['Kid reports', 'Safety alerts'], visual: 'reports' }
];

function ParentVisual({ type }: { type: string }) {
  return (
    <LinearGradient colors={['#fffefa', '#f3e7d3']} style={styles.visual}>
      <View style={styles.visualGlowTop} />
      <View style={styles.visualGlowBottom} />
      {type === 'setup' ? (
        <View style={styles.setupScene}>
          <View style={styles.setupDevice}>
            <View style={styles.deviceSpeaker} />
            <View style={styles.profileOne} />
            <View style={styles.profileTwo} />
            <View style={styles.profileThree} />
          </View>
          <View style={styles.setupShield}><AppText variant="h2" style={styles.shieldCheck}>✓</AppText></View>
        </View>
      ) : type === 'chat' ? (
        <View style={styles.chatScene}>
          <View style={styles.chatPhone} />
          <View style={styles.chatPhoneSpeaker} />
          <View style={styles.chatPhoneLineOne} />
          <View style={styles.chatPhoneLineTwo} />
          <View style={styles.chatBubbleKid}><View style={styles.chatBubbleKidDot} /></View>
          <View style={styles.chatBubbleAi}>
            <View style={styles.chatBubbleAiLineWide} />
            <View style={styles.chatBubbleAiLineShort} />
          </View>
          <View style={styles.chatMic}>
            <View style={styles.micStem} />
            <View style={styles.micArc} />
          </View>
        </View>
      ) : (
        <View style={styles.reportScene}>
          <View style={styles.reportCardMain} />
          <View style={styles.reportCardSmall} />
          <View style={styles.reportRing} />
          <View style={styles.reportBarOne} />
          <View style={styles.reportBarTwo} />
          <View style={styles.reportBarThree} />
          <View style={styles.reportDot} />
        </View>
      )}
    </LinearGradient>
  );
}

export function ParentOnboardingScreen({ navigation }: Props) {
  const { state, dispatch } = useAppStore();
  const [index, setIndex] = useState(0);
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const slide = slides[index];

  async function next() {
    setError(null);
    if (index !== slides.length - 1) {
      setIndex(index + 1);
      return;
    }

    const token = state.auth.accessToken;
    if (!token) {
      setError('Parent session expired. Please confirm your email again.');
      return;
    }
    if (!/^\d{4}$/.test(pin)) {
      setError('Enter a 4-digit parent PIN.');
      return;
    }

    setLoading(true);
    try {
      await setupParentPin(pin, token);
      await completeParentOnboarding(token);
      dispatch({ type: 'parent/update', payload: { pin } });
      dispatch({ type: 'auth/update', payload: { nextStep: 'dashboard', parentUnlocked: true } });
      navigation.navigate('ParentDashboard');
    } catch (caught) {
      if (caught instanceof ApiRequestError || caught instanceof Error) {
        setError(caught.message);
      } else {
        setError('Unable to complete parent onboarding.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScreenShell scroll={false} background="default" bottomWave={false} noPadding contentStyle={styles.screen}>
      <ParentOnboardingHeader />
      <View style={styles.card}>
          <ParentVisual type={slide.visual} />
        <AppText variant="tiny" style={styles.stepLabel}>{index + 1} of {slides.length}</AppText>
        <AppText variant="h2" style={styles.title}>{slide.title}</AppText>
        <AppText variant="small" style={styles.copy}>{slide.text}</AppText>
        <View style={styles.features}>
          {slide.features.map((item) => (
            <View key={item} style={styles.feature}>
              <View style={styles.featureCheck}><AppText variant="tiny" style={styles.featureCheckText}>✓</AppText></View>
              <AppText variant="tiny" style={styles.featureText}>{item}</AppText>
            </View>
          ))}
        </View>
          <View style={styles.dots}>{slides.map((_, dot) => <View key={dot} style={[styles.dot, dot === index && styles.dotActive]} />)}</View>
        {index === 2 ? (
          <View style={styles.pinSetup}>
            <View style={styles.pinCopy}>
              <AppText variant="small" style={styles.pinTitle}>Secure parent access</AppText>
              <AppText variant="tiny" style={styles.pinText}>Create a 4-digit PIN for quick access to parent-only settings.</AppText>
            </View>
            <AppInput label="Parent PIN" value={pin} onChangeText={setPin} keyboardType="number-pad" maxLength={4} textAlign="center" style={styles.pinInput} />
          </View>
        ) : null}
        {error ? <AppText variant="tiny" style={styles.error}>{error}</AppText> : null}
      </View>
      <View style={styles.footer}>
        <AppButton label={loading ? 'Saving...' : index === slides.length - 1 ? 'Save & Go Home' : 'Next'} onPress={next} disabled={loading || (index === slides.length - 1 && pin.length !== 4)} style={styles.nextButton} />
      </View>
    </ScreenShell>
  );
}

function ParentOnboardingHeader() {
  return (
    <View style={styles.header}>
      <View style={styles.headerLeft} />
      <Brand variant="wordmark" style={styles.headerLogo} />
      <View style={styles.headerRight} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, overflow: 'hidden' },
  header: {
    minHeight: 52,
    paddingHorizontal: spacing.lg,
    paddingVertical: 10,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'transparent'
  },
  headerLeft: { width: 58, height: 34 },
  headerRight: { width: 58, height: 34 },
  headerLogo: { width: 140, height: 26 },
  card: {
    flex: 1,
    width: '100%',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(255,255,252,0.88)',
    borderTopWidth: 1,
    borderBottomWidth: 0,
    borderLeftWidth: 0,
    borderRightWidth: 0,
    borderColor: 'rgba(92,132,137,0.18)'
  },
  visual: {
    width: '100%',
    maxWidth: 320,
    aspectRatio: 1.5,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: colors.atlasLine,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    shadowColor: '#543e8f',
    shadowOpacity: 0.12,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 16 },
    elevation: 3
  },
  visualGlowTop: { position: 'absolute', left: 20, top: 16, width: 116, height: 116, borderRadius: 58, backgroundColor: 'rgba(255,255,255,0.62)' },
  visualGlowBottom: { position: 'absolute', right: -18, bottom: -12, width: 150, height: 150, borderRadius: 75, backgroundColor: 'rgba(215,199,170,0.18)' },
  setupScene: { width: 190, height: 145, alignItems: 'center', justifyContent: 'center' },
  setupDevice: { width: 116, height: 112, borderRadius: 22, backgroundColor: '#f2f8f6', borderWidth: 1, borderColor: colors.atlasLine, alignItems: 'center', paddingTop: 18 },
  deviceSpeaker: { width: 68, height: 12, borderRadius: 10, backgroundColor: colors.atlasCream },
  profileOne: { position: 'absolute', left: 22, bottom: 28, width: 24, height: 24, borderRadius: 12, backgroundColor: '#d7ecef' },
  profileTwo: { position: 'absolute', left: 46, bottom: 22, width: 30, height: 30, borderRadius: 15, backgroundColor: '#ffe27a' },
  profileThree: { position: 'absolute', right: 20, bottom: 28, width: 24, height: 24, borderRadius: 12, backgroundColor: '#c8e8c0' },
  setupShield: { position: 'absolute', right: 14, bottom: 12, width: 58, height: 58, borderRadius: 29, backgroundColor: colors.teal, alignItems: 'center', justifyContent: 'center' },
  shieldCheck: { color: colors.white, fontWeight: '900', lineHeight: 28 },
  chatScene: { width: '100%', height: '100%', position: 'relative' },
  chatPhone: {
    position: 'absolute',
    left: '23.75%',
    top: '17.84%',
    width: '30%',
    height: '61.97%',
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderWidth: 2,
    borderColor: colors.atlasLine,
    shadowColor: '#343a37',
    shadowOpacity: 0.12,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 2
  },
  chatPhoneSpeaker: { position: 'absolute', left: '32.8%', top: '26.3%', width: '11.9%', height: 6, borderRadius: 6, backgroundColor: colors.atlasCream },
  chatPhoneLineOne: { position: 'absolute', left: '31.6%', top: '39.4%', width: '15%', height: 8, borderRadius: 8, backgroundColor: '#eef3f2' },
  chatPhoneLineTwo: { position: 'absolute', left: '31.6%', top: '47.9%', width: '11.25%', height: 8, borderRadius: 8, backgroundColor: colors.atlasCream },
  chatBubbleKid: {
    position: 'absolute',
    left: '42.5%',
    top: '26.3%',
    width: '38.1%',
    height: 42,
    borderRadius: 18,
    backgroundColor: colors.atlasCream,
    justifyContent: 'center',
    paddingLeft: 18
  },
  chatBubbleKidDot: { width: 62, height: 9, borderRadius: 9, backgroundColor: 'rgba(82,123,131,0.24)' },
  chatBubbleAi: {
    position: 'absolute',
    right: '16.9%',
    top: '52.6%',
    width: '45.6%',
    height: 42,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderWidth: 1,
    borderColor: colors.atlasLine,
    justifyContent: 'center',
    gap: 7,
    paddingLeft: 18
  },
  chatBubbleAiLineWide: { width: 84, height: 8, borderRadius: 8, backgroundColor: 'rgba(82,123,131,0.18)' },
  chatBubbleAiLineShort: { width: 58, height: 8, borderRadius: 8, backgroundColor: 'rgba(82,123,131,0.14)' },
  chatMic: {
    position: 'absolute',
    left: '29.7%',
    bottom: '17.8%',
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.teal,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#527b83',
    shadowOpacity: 0.22,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3
  },
  micStem: { position: 'absolute', top: 13, width: 12, height: 22, borderRadius: 8, backgroundColor: colors.white },
  micArc: { position: 'absolute', top: 31, width: 22, height: 14, borderLeftWidth: 3, borderRightWidth: 3, borderBottomWidth: 3, borderColor: colors.white, borderBottomLeftRadius: 14, borderBottomRightRadius: 14 },
  reportScene: { width: 176, height: 132, borderRadius: 24, backgroundColor: '#fcf7ef', borderWidth: 1, borderColor: colors.atlasLine },
  reportCardMain: { position: 'absolute', left: 18, top: 22, width: 122, height: 82, borderRadius: 18, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.atlasLine },
  reportCardSmall: { position: 'absolute', right: 16, bottom: 18, width: 58, height: 42, borderRadius: 14, backgroundColor: '#eef3f2', borderWidth: 1, borderColor: colors.atlasLine },
  reportRing: { position: 'absolute', top: 40, left: 36, width: 42, height: 42, borderRadius: 21, borderWidth: 7, borderColor: colors.teal },
  reportBarOne: { position: 'absolute', right: 30, top: 38, width: 46, height: 10, borderRadius: 10, backgroundColor: colors.atlasCream },
  reportBarTwo: { position: 'absolute', right: 30, top: 58, width: 66, height: 10, borderRadius: 10, backgroundColor: colors.mint },
  reportBarThree: { position: 'absolute', right: 30, top: 78, width: 38, height: 10, borderRadius: 10, backgroundColor: colors.teal },
  reportDot: { position: 'absolute', right: 26, bottom: 24, width: 12, height: 12, borderRadius: 6, backgroundColor: '#527b83' },
  stepLabel: { textAlign: 'center', color: colors.tealDeep, fontWeight: '900', letterSpacing: 0.8 },
  title: { textAlign: 'center', color: '#18383d' },
  copy: { textAlign: 'center', color: '#5d787b', maxWidth: 270 },
  features: { width: '100%', flexDirection: 'row', flexWrap: 'wrap', rowGap: 10, paddingHorizontal: 2, paddingVertical: 4 },
  feature: { width: '50%', flexDirection: 'row', alignItems: 'center', gap: 8 },
  featureCheck: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#dce9e7', alignItems: 'center', justifyContent: 'center' },
  featureCheckText: { color: '#527b83', fontWeight: '900', lineHeight: 14 },
  featureText: { color: '#39484b', fontWeight: '900', flexShrink: 1 },
  dots: { flexDirection: 'row', gap: 8, marginTop: 4 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.atlasLine },
  dotActive: { width: 24, backgroundColor: colors.teal },
  pinSetup: { width: '100%', gap: 10, paddingTop: 4 },
  pinCopy: { gap: 2 },
  pinTitle: { color: '#18383d', fontWeight: '900' },
  pinText: { color: '#5d787b' },
  pinInput: { minHeight: 44, borderRadius: 14, fontWeight: '900', letterSpacing: 5 },
  error: { color: colors.danger, textAlign: 'center' },
  footer: { flexShrink: 0, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20, paddingTop: 10, paddingBottom: 20 },
  nextButton: { width: '88%', maxWidth: 300, minHeight: 50 }
});
