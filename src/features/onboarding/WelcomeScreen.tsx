import React from "react";
import { Image, Platform, Pressable, SafeAreaView, StatusBar, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { pikuImages } from "../../assets/brand";
import { colors, radius, shadows } from "../../theme/tokens";
import type { Navigate } from "../../navigation/types";

export function WelcomeScreen({ navigate }: { navigate: Navigate }): React.JSX.Element {
  const { height, width } = useWindowDimensions();
  const contentWidth = Math.min(Math.max(width - 48, 342), 560);
  const scale = Math.min(Math.max(contentWidth / 342, 1), 1.34);
  const tallScale = Math.min(Math.max(height / 844, 0.86), 1.18);
  const heroHeight = Math.min(300, Math.max(190, 230 * scale * Math.min(tallScale, 1.06)));
  const familyWidth = Math.min(contentWidth * 0.94, 430);
  const familyHeight = familyWidth * 0.7;
  const cardHeight = Math.min(190, 150 * scale);
  const fillLargeScreen = height > 760;
  const topInset = Platform.OS === "android" ? StatusBar.currentHeight ?? 0 : 54;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.viewport}>
        <View
          style={[
            styles.screen,
            {
              gap: fillLargeScreen ? Math.max(4, (height - 760) / 18) : 0,
              maxWidth: contentWidth,
              paddingBottom: Math.max(24, 32 * tallScale),
              paddingHorizontal: Math.max(24, 30 * scale),
              paddingTop: topInset + Math.max(8, 10 * tallScale)
            }
          ]}
        >
        <View style={styles.brandRow}>
          <Image source={pikuImages.icon} style={[styles.logo, { borderRadius: 14 * scale, height: 48 * scale, width: 48 * scale }]} />
          <Text style={[styles.brand, { fontSize: 32 * scale, lineHeight: 38 * scale }]}>PikuAI</Text>
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
          <Text style={[styles.title, { fontSize: 26 * scale, lineHeight: 33 * scale }]}>Welcome, Parents! 👋</Text>
          <Text style={[styles.subtitle, { fontSize: 14.5 * scale, lineHeight: 22.5 * scale }]}>PikuAI is a safe space where kids can{"\n"}ask, learn and explore with confidence.</Text>
        </View>

        <View style={[styles.featureCard, { borderRadius: 22 * scale, height: cardHeight, paddingHorizontal: 20 * scale, paddingTop: 20 * scale }]}>
          <View style={styles.sparkleTop} />
          <View style={styles.sparkleMid} />
          <View style={styles.sparkleSmall} />
          <Text style={[styles.featureTitle, { fontSize: 18 * scale, lineHeight: 24 * scale, maxWidth: 200 * scale }]}>Voice and text chat{"\n"}for your curious kids</Text>
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
      </View>
    </SafeAreaView>
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
    gap: 10,
    justifyContent: "center",
    marginBottom: 4,
    marginTop: 14
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
    marginTop: 10
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
    marginTop: 20
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
    marginTop: 18,
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
    marginTop: 16,
    paddingVertical: 8
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
    marginTop: 14
  },
  logo: {
    borderRadius: 14,
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
    marginTop: 22,
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
    marginTop: 6,
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
  viewport: {
    alignItems: "center",
    backgroundColor: "#ece9ff",
    flex: 1,
    justifyContent: "center",
    width: "100%"
  }
});
