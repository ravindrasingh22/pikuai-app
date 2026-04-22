import React from "react";
import { Image, Platform, Pressable, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { pikuImages } from "../../assets/brand";
import { colors, radius, shadows } from "../../theme/tokens";
import type { Navigate } from "../../navigation/types";

export function WelcomeScreen({ navigate }: { navigate: Navigate }): React.JSX.Element {
  const { height, width } = useWindowDimensions();
  const contentWidth = Math.min(Math.max(width - 12, 356), 580);
  const scale = Math.min(Math.max(contentWidth / 342, 1), 1.34);
  const tallScale = Math.min(Math.max(height / 844, 0.86), 1.18);
  const compactHeight = height < 820;
  const heroHeight = Math.min(compactHeight ? 202 : 254, Math.max(172, 192 * scale * Math.min(tallScale, 1.02)));
  const familyWidth = Math.min(contentWidth * (compactHeight ? 0.86 : 0.94), 430);
  const familyHeight = familyWidth * 0.66;
  const cardHeight = Math.min(compactHeight ? 140 : 168, (compactHeight ? 132 : 146) * scale);
  const fillLargeScreen = height > 760;
  const topInset = Platform.OS === "android" ? StatusBar.currentHeight ?? 0 : 54;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView bounces contentContainerStyle={styles.viewport} showsVerticalScrollIndicator={false}>
        <View
          style={[
            styles.screen,
            {
              gap: fillLargeScreen ? Math.min(8, Math.max(2, (height - 760) / 28)) : 0,
              maxWidth: contentWidth,
              paddingBottom: Math.max(24, 28 * tallScale),
              paddingHorizontal: Math.max(10, 14 * scale),
              paddingTop: Math.round(topInset * 0.6) + Math.max(2, 3 * tallScale)
            }
          ]}
        >
        <View style={styles.brandRow}>
          <Image resizeMode="contain" source={pikuImages.icon} style={[styles.logo, { borderRadius: 12 * scale, height: 48 * scale, width: 48 * scale }]} />
          <Text style={[styles.brand, { fontSize: 33 * scale, lineHeight: 39 * scale }]}>PikuAI</Text>
        </View>

        <View style={[styles.heroArea, { height: heroHeight }]}>
          <View style={[styles.cloud, styles.cloudLeft, { transform: [{ scale }] }]}>
            <View style={[styles.cloudPuff, styles.cloudLeftPuffOne]} />
            <View style={[styles.cloudPuff, styles.cloudLeftPuffTwo]} />
          </View>
          <View style={[styles.cloud, styles.cloudRight, { transform: [{ scale }] }]}>
            <View style={[styles.cloudPuff, styles.cloudRightPuffOne]} />
            <View style={[styles.cloudPuff, styles.cloudRightPuffTwo]} />
          </View>
          <Text style={[styles.star, styles.starOne, { fontSize: 22 * scale }]}>⭐</Text>
          <Text style={[styles.star, styles.starTwo, { fontSize: 16 * scale }]}>✦</Text>
          <Text style={[styles.star, styles.starThree, { fontSize: 18 * scale }]}>✦</Text>
          <Image source={pikuImages.welcomeFamily} style={[styles.family, { height: familyHeight, width: familyWidth }]} resizeMode="contain" />
        </View>

        <View style={styles.copyBlock}>
          <View style={styles.titleRow}>
            <Text style={[styles.title, { fontSize: 25 * scale, lineHeight: 31 * scale }]}>Welcome, Parents!</Text>
            <WavingHand scale={scale} />
          </View>
          <Text style={[styles.subtitle, { fontSize: 14.5 * scale, lineHeight: 22.5 * scale }]}>PikuAI is a safe space where kids can{"\n"}ask, learn and explore with confidence.</Text>
        </View>

        <View style={[styles.featureCard, { borderRadius: 22 * scale, height: cardHeight, paddingHorizontal: 20 * scale, paddingTop: 20 * scale }]}>
          <View style={styles.sparkleTop} />
          <View style={styles.sparkleMid} />
          <View style={styles.sparkleSmall} />
          <Text style={[styles.featureTitle, { fontSize: 18 * scale, lineHeight: 24 * scale, maxWidth: 210 * scale }]}>Safe Voice and Text{"\n"}chat for your kids</Text>
          <View style={styles.iconRow}>
            <View style={[styles.circleIcon, { height: 52 * scale, width: 52 * scale }]}>
              <View style={styles.micHead} />
              <View style={styles.micArc} />
              <View style={styles.micStem} />
            </View>
            <View style={[styles.circleIcon, { height: 52 * scale, width: 52 * scale }]}>
              <View style={styles.chatBubble}>
                <Text style={styles.chatIcon}>•••</Text>
              </View>
            </View>
          </View>
          <Image source={pikuImages.icon} style={[styles.chick, { height: 96 * scale, width: 96 * scale }]} resizeMode="contain" />
        </View>

        <View style={styles.dots}>
          <View style={[styles.dot, styles.activeDot]} />
          <View style={styles.dot} />
          <View style={styles.dot} />
          <View style={styles.dot} />
          <View style={styles.dot} />
        </View>

        <Pressable accessibilityRole="button" onPress={() => navigate("register")} style={[styles.primaryButton, { height: 58 * scale }]}>
          <Text style={[styles.primaryButtonText, { fontSize: 17 * scale }]}>Start Parent Setup</Text>
        </Pressable>

        <Pressable accessibilityRole="button" onPress={() => navigate("login")} style={styles.footerButton}>
          <Text style={styles.footerText}>
            Already have an account? <Text style={styles.signIn}>Sign in</Text>
          </Text>
        </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function WavingHand({ scale }: { scale: number }): React.JSX.Element {
  return (
    <View style={[styles.waveIcon, { height: 28 * scale, width: 28 * scale }]}>
      <View style={[styles.waveFinger, styles.waveFingerOne, { transform: [{ scale }] }]} />
      <View style={[styles.waveFinger, styles.waveFingerTwo, { transform: [{ scale }] }]} />
      <View style={[styles.waveFinger, styles.waveFingerThree, { transform: [{ scale }] }]} />
      <View style={[styles.wavePalm, { transform: [{ rotate: "-16deg" }, { scale }] }]} />
      <View style={[styles.waveThumb, { transform: [{ rotate: "34deg" }, { scale }] }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  activeDot: {
    backgroundColor: "#6d28d9",
    borderRadius: 5,
    width: 22
  },
  brand: {
    color: "#6d28d9",
    fontSize: 32,
    fontWeight: "900",
    letterSpacing: -0.5
  },
  brandRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 2,
    justifyContent: "center",
    marginBottom: 6,
    marginTop: 0
  },
  chatBubble: {
    alignItems: "center",
    backgroundColor: "#7c3aed",
    borderRadius: 6,
    height: 26,
    justifyContent: "center",
    width: 30
  },
  chatIcon: {
    color: colors.surface,
    fontSize: 16,
    fontWeight: "900",
    lineHeight: 17,
    textAlign: "center"
  },
  chick: {
    bottom: -1,
    height: 96,
    position: "absolute",
    right: 8,
    width: 96
  },
  circleIcon: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    height: 52,
    justifyContent: "center",
    width: 52,
    ...shadows.card
  },
  cloud: {
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    opacity: 0.85,
    position: "absolute"
  },
  cloudLeft: {
    height: 22,
    left: 14,
    top: 28,
    width: 70
  },
  cloudLeftPuffOne: {
    height: 30,
    left: 10,
    top: -14,
    width: 30
  },
  cloudLeftPuffTwo: {
    height: 22,
    left: 28,
    top: -10,
    width: 22
  },
  cloudPuff: {
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    position: "absolute"
  },
  cloudRight: {
    height: 18,
    right: 20,
    top: 18,
    width: 55
  },
  cloudRightPuffOne: {
    height: 24,
    left: 8,
    top: -12,
    width: 24
  },
  cloudRightPuffTwo: {
    height: 18,
    left: 22,
    top: -8,
    width: 18
  },
  copyBlock: {
    alignItems: "center",
    marginTop: 8
  },
  dot: {
    backgroundColor: "#b8b0e0",
    borderRadius: radius.pill,
    height: 8,
    width: 8
  },
  dots: {
    alignItems: "center",
    flexDirection: "row",
    gap: 7,
    justifyContent: "center",
    marginTop: 12
  },
  family: {
    bottom: 0,
    height: 218,
    position: "absolute",
    width: 310
  },
  featureCard: {
    alignSelf: "center",
    backgroundColor: "#ddd8f8",
    borderRadius: 22,
    height: 150,
    marginTop: 12,
    overflow: "visible",
    paddingHorizontal: 20,
    paddingTop: 20,
    width: "100%"
  },
  featureTitle: {
    color: "#1a1a2e",
    fontSize: 18,
    fontWeight: "900",
    lineHeight: 24,
    maxWidth: 200
  },
  footerButton: {
    alignItems: "center",
    marginTop: 10,
    paddingBottom: 8,
    paddingTop: 4
  },
  footerText: {
    color: "#666688",
    fontSize: 13.5,
    fontWeight: "600"
  },
  heroArea: {
    alignItems: "flex-end",
    height: 230,
    justifyContent: "center",
    marginBottom: -6,
    position: "relative",
    width: "100%"
  },
  iconRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 10
  },
  logo: {
    borderRadius: 12,
    height: 48,
    width: 48
  },
  micArc: {
    borderBottomColor: "#3b82f6",
    borderBottomWidth: 2,
    borderRadius: 10,
    height: 12,
    marginTop: -6,
    width: 22
  },
  micHead: {
    backgroundColor: "#3b82f6",
    borderRadius: 7,
    height: 25,
    width: 12
  },
  micStem: {
    backgroundColor: "#3b82f6",
    borderRadius: radius.pill,
    height: 9,
    marginTop: 1,
    width: 3
  },
  primaryButton: {
    alignItems: "center",
    backgroundColor: "#6d28d9",
    borderRadius: 50,
    height: 58,
    justifyContent: "center",
    marginTop: 14,
    width: "100%",
    ...shadows.card
  },
  primaryButtonText: {
    color: colors.surface,
    fontSize: 17,
    fontWeight: "800",
    letterSpacing: 0.3
  },
  safeArea: {
    backgroundColor: "#ece9ff",
    flex: 1
  },
  screen: {
    alignSelf: "center",
    backgroundColor: "#ece9ff",
    width: "100%"
  },
  signIn: {
    color: "#6d28d9",
    fontWeight: "800"
  },
  sparkleTop: {
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    height: 6,
    opacity: 0.7,
    position: "absolute",
    right: 110,
    top: 14,
    width: 6
  },
  sparkleMid: {
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    height: 4,
    opacity: 0.7,
    position: "absolute",
    right: 94,
    top: 34,
    width: 4
  },
  sparkleSmall: {
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    height: 4,
    opacity: 0.7,
    position: "absolute",
    right: 130,
    top: 50,
    width: 4
  },
  star: {
    color: "#facc15",
    position: "absolute"
  },
  starOne: {
    fontSize: 22,
    left: 56,
    top: 46
  },
  starThree: {
    fontSize: 18,
    right: 62,
    top: 50
  },
  starTwo: {
    fontSize: 16,
    left: 130,
    top: 30
  },
  subtitle: {
    color: "#555577",
    fontSize: 14.5,
    fontWeight: "600",
    lineHeight: 22.5,
    marginTop: 4,
    paddingHorizontal: 10,
    textAlign: "center"
  },
  title: {
    color: "#1a1a2e",
    fontSize: 26,
    fontWeight: "900",
    letterSpacing: -0.3,
    lineHeight: 33,
    textAlign: "center"
  },
  titleRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 6,
    justifyContent: "center"
  },
  viewport: {
    alignItems: "center",
    backgroundColor: "#ece9ff",
    flexGrow: 1,
    justifyContent: "flex-start",
    minHeight: "100%",
    width: "100%"
  },
  waveIcon: {
    height: 28,
    position: "relative",
    width: 28
  },
  waveFinger: {
    backgroundColor: "#ffd45a",
    borderColor: "#d28b21",
    borderRadius: 6,
    borderWidth: 1,
    height: 15,
    position: "absolute",
    top: 1,
    width: 6
  },
  waveFingerOne: {
    left: 5
  },
  waveFingerThree: {
    left: 15
  },
  waveFingerTwo: {
    height: 17,
    left: 10,
    top: 0
  },
  wavePalm: {
    backgroundColor: "#ffd45a",
    borderColor: "#d28b21",
    borderRadius: 9,
    borderWidth: 1,
    height: 17,
    left: 6,
    position: "absolute",
    top: 10,
    width: 17
  },
  waveThumb: {
    backgroundColor: "#ffd45a",
    borderColor: "#d28b21",
    borderRadius: 6,
    borderWidth: 1,
    height: 7,
    left: 2,
    position: "absolute",
    top: 14,
    width: 13
  }
});
