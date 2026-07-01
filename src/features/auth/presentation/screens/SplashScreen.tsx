import React, { useEffect, useRef } from 'react';
import { Animated, Image, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../../app/navigation/routes';
import { ScreenShell } from '../../../../core/components/ScreenShell';
import { Brand } from '../../../../core/components/Brand';
import { AppText } from '../../../../core/components/AppText';
import { AppButton } from '../../../../core/components/AppButton';
import { Images } from '../../../../core/assets/assets';
import { colors } from '../../../../core/theme/colors';

type Props = NativeStackScreenProps<RootStackParamList, 'Splash'>;

const questionCards = [
  { key: 'orbit', icon: '🪐', text: 'How do planets orbit?', style: 'orbit', gradient: ['#eef6f7', '#d7ecef'] },
  { key: 'sky', icon: '💡', text: 'Why is the sky blue?', style: 'sky', gradient: ['#fff4b8', '#ffe27a'] },
  { key: 'leaf', icon: '🌿', text: 'Why do plants need sunlight?', style: 'leaf', gradient: ['#e8f6e4', '#c8e8c0'] },
  { key: 'puzzle', icon: '🧩', text: 'How do puzzles fit together?', style: 'puzzle', gradient: ['#d8f5df', '#9ed9b2'] },
  { key: 'kind', icon: '💚', text: "Can kind words make someone's day?", style: 'kind', gradient: ['#e9f7ef', '#c8e8d8'] }
] as const;

const sceneDots = [
  { left: 20, top: 16, size: 8 },
  { left: 92, top: 148, size: 6 },
  { left: 172, top: 20, size: 10 },
  { right: 88, top: 174, size: 6 },
  { right: 24, top: 26, size: 8 },
  { right: 6, top: 220, size: 10 }
];

export function SplashScreen({ navigation }: Props) {
  const float = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(float, { toValue: 1, duration: 2400, useNativeDriver: true }),
        Animated.timing(float, { toValue: 0, duration: 2400, useNativeDriver: true })
      ])
    ).start();
  }, [float]);
  const translateY = float.interpolate({ inputRange: [0, 1], outputRange: [0, -10] });
  const cardFloat = float.interpolate({ inputRange: [0, 1], outputRange: [0, -7] });
  return (
    <ScreenShell background="splash" scroll={false} bottomWave={false} contentStyle={styles.content}>
      <View style={styles.center}>
        <View style={styles.brand}>
          <Brand variant="wordmark" style={styles.logo} />
          <AppText variant="tiny" style={styles.tagline}>Protected Curiosity, Trusted AI</AppText>
        </View>
        <View style={styles.heroStage}>
          <View style={styles.referenceScene}>
            {questionCards.map((card, index) => (
              <Animated.View
                key={card.key}
                style={[
                  styles.questionCard,
                  styles[card.style],
                  { transform: [{ translateY: index % 2 ? Animated.multiply(cardFloat, -1) : cardFloat }, { rotate: card.style === 'sky' ? '-7deg' : card.style === 'leaf' ? '7deg' : card.style === 'puzzle' ? '-5deg' : card.style === 'kind' ? '5deg' : '-2deg' }] }
                ]}
              >
                <LinearGradient colors={card.gradient} style={styles.questionIcon}>
                  <AppText variant="tiny" style={styles.questionIconText}>{card.icon}</AppText>
                </LinearGradient>
                <AppText variant="tiny" style={styles.questionText}>{card.text}</AppText>
              </Animated.View>
            ))}
            <View style={styles.sceneDots}>
              {sceneDots.map((dot, index) => <Animated.View key={index} style={[styles.sceneDot, dot, { width: dot.size, height: dot.size, borderRadius: dot.size / 2, transform: [{ translateY: index % 2 ? Animated.multiply(translateY, -0.55) : Animated.multiply(translateY, 0.55) }] }]} />)}
            </View>
            <Animated.View style={[styles.kidWrap, { transform: [{ translateY }] }]}>
              <Image source={Images.splashKid} style={styles.kid} resizeMode="contain" />
            </Animated.View>
          </View>
        </View>
      </View>
      <View style={styles.actions}>
        <View style={styles.storyPanel}>
          <AppButton label="Get Started" onPress={() => navigation.navigate('ParentRegister')} style={styles.cta} />
          <AppText variant="tiny" style={styles.bottomHint}>Built for curious young minds, backed by trust.</AppText>
        </View>
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 16, paddingTop: 24, paddingBottom: 16, alignItems: 'center', justifyContent: 'space-between' },
  center: { alignItems: 'center', width: '100%' },
  brand: { alignItems: 'center', gap: 4, marginBottom: 12 },
  logo: { width: 178, height: 54 },
  tagline: { color: colors.atlasTeal, fontWeight: '900', letterSpacing: 0 },
  heroStage: { width: '100%', alignItems: 'center', justifyContent: 'flex-end' },
  referenceScene: { position: 'relative', width: '100%', maxWidth: 340, height: 460, overflow: 'visible' },
  questionCard: {
    position: 'absolute',
    zIndex: 3,
    width: 120,
    minHeight: 108,
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 10,
    paddingVertical: 12,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(228,239,238,0.92)',
    backgroundColor: 'rgba(247,254,252,0.92)',
    shadowColor: '#365c60',
    shadowOpacity: 0.08,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 14 },
    elevation: 3
  },
  orbit: { top: 14, left: '50%', marginLeft: -64, width: 128, minHeight: 112 },
  sky: { top: 128, left: 6 },
  leaf: { top: 80, right: 6 },
  puzzle: { bottom: 108, left: 4 },
  kind: { bottom: 100, right: 4, width: 122 },
  questionIcon: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  questionIconText: { fontSize: 15, lineHeight: 18 },
  questionText: { width: '100%', color: '#26474c', textAlign: 'center', fontWeight: '900', lineHeight: 14 },
  sceneDots: { position: 'absolute', zIndex: 2, top: 124, left: 0, right: 0, height: 210 },
  sceneDot: { position: 'absolute', backgroundColor: 'rgba(95,161,165,0.76)' },
  kidWrap: { position: 'absolute', zIndex: 4, width: 220, height: 280, left: '50%', marginLeft: -110, bottom: 12 },
  kid: { width: '100%', height: '100%' },
  actions: { width: '100%', maxWidth: 330, padding: 16 },
  storyPanel: { alignItems: 'center', gap: 6 },
  cta: { width: '100%' },
  bottomHint: { color: colors.muted, fontWeight: '700', textAlign: 'center' }
});
