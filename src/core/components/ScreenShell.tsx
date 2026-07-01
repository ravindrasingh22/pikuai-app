import React from 'react';
import { Image, ImageBackground, KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Images } from '../assets/assets';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { useResponsiveLayout } from '../utils/layout';

type Props = {
  children: React.ReactNode;
  scroll?: boolean;
  noPadding?: boolean;
  bottomWave?: boolean;
  background?: 'default' | 'splash' | 'chat' | 'screen';
  contentStyle?: StyleProp<ViewStyle>;
  center?: boolean;
};

export function ScreenShell({ children, scroll = true, noPadding, bottomWave = false, background = 'default', contentStyle, center }: Props) {
  const { contentWidth } = useResponsiveLayout();
  const source = background === 'splash' ? Images.splashWaveBackground : background === 'screen' ? Images.screenBackground : Images.chatWaveBackground;
  const content = (
    <View style={[styles.content, { width: contentWidth }, !noPadding && styles.padding, center && styles.center, contentStyle]}>
      {children}
    </View>
  );

  const screenContent = (
    <>
      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView style={styles.safe} behavior={Platform.select({ ios: 'padding', android: undefined })}>
          {scroll ? <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>{content}</ScrollView> : <View style={styles.fillCenter}>{content}</View>}
        </KeyboardAvoidingView>
      </SafeAreaView>
      {bottomWave ? <View pointerEvents="none" style={styles.waveWrap}><Image source={Images.waveBottom} style={styles.wave} /></View> : null}
    </>
  );

  if (background === 'default') {
    return (
      <View style={styles.innerBg}>
        <LinearGradient
          pointerEvents="none"
          colors={['rgba(255,253,248,0.94)', 'rgba(251,250,245,0.94)', 'rgba(213,234,230,0.80)']}
          locations={[0, 0.58, 1]}
          style={StyleSheet.absoluteFillObject}
        />
        {screenContent}
      </View>
    );
  }

  return (
    <ImageBackground source={source} resizeMode="cover" style={styles.bg} imageStyle={[styles.bgImage, background === 'screen' && styles.screenBgImage]}>
      {screenContent}
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, backgroundColor: colors.cream },
  bgImage: { opacity: 0.9 },
  screenBgImage: { opacity: 1 },
  innerBg: { flex: 1, backgroundColor: '#fbfaf5' },
  safe: { flex: 1 },
  scroll: { flexGrow: 1, alignItems: 'center' },
  fillCenter: { flex: 1, alignItems: 'center' },
  content: { flexGrow: 1, minHeight: '100%' },
  padding: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm, paddingBottom: spacing.xxl },
  center: { justifyContent: 'center' },
  waveWrap: {
    position: 'absolute',
    bottom: -12,
    left: 0,
    right: 0,
    height: 170
  },
  wave: {
    width: '100%',
    height: 170,
    opacity: 0.9,
    resizeMode: 'cover'
  }
});
