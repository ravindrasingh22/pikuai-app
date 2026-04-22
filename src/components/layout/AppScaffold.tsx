import React, { useEffect, useRef, useState } from "react";
import { Animated, Image, Platform, Pressable, ScrollView, StatusBar, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { pikuImages } from "../../assets/brand";
import { colors, layout, radius, shadows, spacing, typography } from "../../theme/tokens";
import type { AppRoute, Navigate } from "../../navigation/types";

type NavItem = {
  route: AppRoute;
  icon: string;
  label: string;
};

const parentNavItems: NavItem[] = [
  { route: "dashboard", icon: "⌂", label: "Dashboard" },
  { route: "children", icon: "👧", label: "Children" },
  { route: "childPicker", icon: "💬", label: "New Chat" },
  { route: "transcripts", icon: "🗨️", label: "My Chats" },
  { route: "safety", icon: "🔐", label: "Safety" },
  { route: "reports", icon: "📊", label: "Reports" },
  { route: "settings", icon: "⚙️", label: "Profile" }
];

const bottomNavItems: NavItem[] = [
  { route: "dashboard", icon: "home", label: "Dashboard" },
  { route: "children", icon: "children", label: "Children" },
  { route: "childPicker", icon: "chat", label: "Chats" },
  { route: "reports", icon: "reports", label: "Reports" },
  { route: "settings", icon: "profile", label: "Profile" }
];

type AppScaffoldProps = {
  activeRoute: AppRoute;
  canGoBack?: boolean;
  children: React.ReactNode;
  navigate: Navigate;
  onBack?: () => void;
  onLogout?: () => void;
  title?: string;
  subtitle?: string;
  scroll?: boolean;
  showParentChrome?: boolean;
};

export function AppScaffold({
  activeRoute,
  canGoBack = false,
  children,
  navigate,
  onBack,
  onLogout,
  title,
  subtitle,
  scroll = true,
  showParentChrome = true
}: AppScaffoldProps): React.JSX.Element {
  const { width } = useWindowDimensions();
  const isTablet = width >= layout.tabletBreakpoint;
  const topInset = Platform.OS === "android" ? StatusBar.currentHeight ?? 0 : 54;
  const bottomInset = Platform.OS === "ios" ? 24 : 0;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigateFromMenu = (nextRoute: AppRoute) => {
    setMobileMenuOpen(false);
    navigate(nextRoute);
  };

  if (!showParentChrome) {
    return <View style={styles.fullScreen}>{children}</View>;
  }

  const content = (
    <View style={[styles.content, !isTablet && styles.phoneContent, !isTablet && { paddingTop: topInset + spacing.sm }, isTablet && styles.tabletContent]}>
      {title ? (
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            {canGoBack && onBack ? (
              <Pressable accessibilityLabel="Go back" accessibilityRole="button" onPress={onBack} style={styles.backButton}>
                <Text style={styles.backIcon}>‹</Text>
              </Pressable>
            ) : !isTablet ? (
              <Pressable accessibilityLabel="Open navigation" accessibilityRole="button" onPress={() => setMobileMenuOpen((open) => !open)} style={styles.menuButton}>
                <Text style={styles.menuIcon}>☰</Text>
              </Pressable>
            ) : null}
            <View style={styles.titleBlock}>
              {subtitle && isTablet ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
              {!isTablet ? (
                <View style={styles.phoneTitleRow}>
                  <Pressable accessibilityLabel="Go to welcome" accessibilityRole="button" onPress={() => navigate("welcome", { resetHistory: true })}>
                    <Image source={pikuImages.icon} style={styles.phoneHeaderLogo} resizeMode="contain" />
                  </Pressable>
                  <Text style={[styles.title, styles.phoneTitle]}>{title}</Text>
                </View>
              ) : (
                <Text style={styles.title}>{title}</Text>
              )}
            </View>
          </View>
          <Pressable accessibilityLabel="Open settings" accessibilityRole="button" style={[styles.notification, !isTablet && styles.phoneMenu]} onPress={() => navigate("settings")}>
            <Text style={[styles.notificationText, !isTablet && styles.phoneMenuText]}>⋮</Text>
          </Pressable>
        </View>
      ) : null}
      {children}
    </View>
  );

  return (
    <View style={[styles.root, !isTablet && styles.phoneRoot]}>
      {isTablet ? <Sidebar activeRoute={activeRoute} navigate={navigate} onLogout={onLogout} /> : null}
      {scroll ? <ScrollView contentContainerStyle={[styles.scroll, !isTablet && styles.phoneScroll]}>{content}</ScrollView> : content}
      {!isTablet ? <MobileMenu activeRoute={activeRoute} open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} topInset={topInset} navigate={navigateFromMenu} /> : null}
      {!isTablet ? <BottomNav activeRoute={activeRoute} bottomInset={bottomInset} navigate={navigate} /> : null}
    </View>
  );
}

function MobileMenu({
  activeRoute,
  navigate,
  onClose,
  open,
  topInset
}: {
  activeRoute: AppRoute;
  navigate: (route: AppRoute) => void;
  onClose: () => void;
  open: boolean;
  topInset: number;
}): React.JSX.Element | null {
  const slide = useRef(new Animated.Value(-300)).current;
  const [mounted, setMounted] = useState(open);

  useEffect(() => {
    if (open) {
      setMounted(true);
      Animated.timing(slide, {
        duration: 220,
        toValue: 0,
        useNativeDriver: true
      }).start();
      return;
    }
    Animated.timing(slide, {
      duration: 180,
      toValue: -300,
      useNativeDriver: true
    }).start(({ finished }) => {
      if (finished) setMounted(false);
    });
  }, [open, slide]);

  if (!mounted) return null;

  return (
    <View pointerEvents={open ? "auto" : "none"} style={styles.mobileMenuLayer}>
      <Pressable accessibilityLabel="Close navigation" accessibilityRole="button" onPress={onClose} style={styles.mobileMenuScrim} />
      <Animated.View style={[styles.mobileMenu, { paddingTop: topInset + spacing.sm, transform: [{ translateX: slide }] }]}>
        <View style={styles.mobileMenuBrandRow}>
          <Image source={pikuImages.icon} style={styles.mobileMenuLogo} />
          <Text style={styles.mobileMenuBrand}>PikuAI</Text>
        </View>
        {parentNavItems.map((item) => {
          const active = activeRoute === item.route;
          return (
            <Pressable key={item.route} accessibilityRole="button" accessibilityState={{ selected: active }} onPress={() => navigate(item.route)} style={[styles.mobileMenuItem, active && styles.mobileMenuItemActive]}>
              <Text style={[styles.mobileMenuIcon, active && styles.mobileMenuTextActive]}>{item.icon}</Text>
              <Text style={[styles.mobileMenuLabel, active && styles.mobileMenuTextActive]}>{item.label}</Text>
            </Pressable>
          );
        })}
      </Animated.View>
    </View>
  );
}

function Sidebar({ activeRoute, navigate, onLogout }: { activeRoute: AppRoute; navigate: Navigate; onLogout?: () => void }): React.JSX.Element {
  return (
    <View style={styles.sidebar}>
      <Pressable accessibilityLabel="Go to welcome" accessibilityRole="button" onPress={() => navigate("welcome", { resetHistory: true })} style={styles.brandRow}>
        <Image source={pikuImages.icon} style={styles.brandIcon} />
        <Text style={styles.brandText}>PikuAI</Text>
      </Pressable>
      <View style={styles.sidebarItems}>
        {parentNavItems.map((item) => {
          const active = activeRoute === item.route;
          return (
            <Pressable key={item.route} onPress={() => navigate(item.route)} style={[styles.sidebarItem, active && styles.activeSidebarItem]}>
              <Text style={[styles.navIcon, active && styles.activeNavText]}>{item.icon}</Text>
              <Text style={[styles.sidebarLabel, active && styles.activeNavText]}>{item.label}</Text>
            </Pressable>
          );
        })}
      </View>
      <Pressable onPress={onLogout ?? (() => navigate("welcome", { resetHistory: true }))} style={styles.logout}>
        <Text style={styles.logoutText}>Logout</Text>
      </Pressable>
      <View style={styles.encouragement}>
        <Text style={styles.encouragementTitle}>You're doing great!</Text>
        <Text style={styles.encouragementText}>Your kids are learning, exploring and growing safely with PikuAI.</Text>
      </View>
    </View>
  );
}

function BottomNav({ activeRoute, bottomInset, navigate }: { activeRoute: AppRoute; bottomInset: number; navigate: Navigate }): React.JSX.Element {
  return (
    <View style={[styles.bottomNav, { paddingBottom: Math.max(spacing.sm, bottomInset) }]}>
      {bottomNavItems.map((item) => {
        const active = activeRoute === item.route;
        return (
          <Pressable key={item.route} accessibilityRole="button" accessibilityState={{ selected: active }} onPress={() => navigate(item.route)} style={[styles.bottomItem, active && styles.bottomItemActive]}>
            <TabIcon name={item.icon} active={active} />
            <Text style={[styles.bottomLabel, active && styles.bottomActive]} numberOfLines={1}>{item.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function TabIcon({ name, active }: { name: string; active: boolean }): React.JSX.Element {
  const stroke = active ? colors.brandBlue : colors.textMuted;
  if (name === "children") {
    return (
      <View style={styles.childrenIcon}>
        <View style={[styles.personHead, { backgroundColor: stroke }, styles.personHeadMain]} />
        <View style={[styles.personBody, { backgroundColor: stroke }, styles.personBodyMain]} />
        <View style={[styles.personHead, { backgroundColor: stroke }, styles.personHeadSide]} />
        <View style={[styles.personBody, { backgroundColor: stroke }, styles.personBodySide]} />
      </View>
    );
  }
  if (name === "chat") {
    return <View style={[styles.chatIcon, { borderColor: stroke }]} />;
  }
  if (name === "reports") {
    return (
      <View style={styles.reportsIcon}>
        <View style={[styles.reportBar, { backgroundColor: stroke, height: 11 }]} />
        <View style={[styles.reportBar, { backgroundColor: stroke, height: 18 }]} />
        <View style={[styles.reportBar, { backgroundColor: stroke, height: 24 }]} />
      </View>
    );
  }
  if (name === "profile") {
    return (
      <View style={styles.profileIcon}>
        <View style={[styles.profileHead, { borderColor: stroke }]} />
        <View style={[styles.profileBody, { borderColor: stroke }]} />
      </View>
    );
  }
  return (
    <View style={styles.homeIcon}>
      <View style={[styles.homeRoof, { borderBottomColor: stroke }]} />
      <View style={[styles.homeBase, { borderColor: stroke }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  activeNavText: {
    color: colors.surface
  },
  activeSidebarItem: {
    backgroundColor: colors.brandBlue
  },
  bottomActive: {
    color: colors.brandBlue
  },
  backButton: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: radius.pill,
    borderWidth: 1,
    height: 42,
    justifyContent: "center",
    width: 42
  },
  backIcon: {
    color: colors.text,
    fontSize: 32,
    fontWeight: "900",
    lineHeight: 34,
    marginTop: -2
  },
  bottomItem: {
    alignItems: "center",
    borderRadius: radius.pill,
    flex: 1,
    gap: 3,
    minHeight: 54,
    minWidth: 0
  },
  bottomItemActive: {
    backgroundColor: colors.blueSoft
  },
  bottomLabel: {
    ...typography.tiny,
    color: colors.textMuted
  },
  bottomNav: {
    backgroundColor: colors.surface,
    borderTopColor: colors.line,
    borderTopWidth: 1,
    flexDirection: "row",
    gap: spacing.xxs,
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.sm,
    paddingTop: spacing.xs
  },
  brandIcon: {
    borderRadius: 12,
    height: 42,
    width: 42
  },
  brandRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.lg
  },
  brandText: {
    color: colors.brandPurple,
    fontSize: 24,
    fontWeight: "900"
  },
  content: {
    alignSelf: "center",
    padding: spacing.md,
    width: "100%"
  },
  encouragement: {
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: radius.lg,
    borderWidth: 1,
    marginTop: "auto",
    padding: spacing.md,
    ...shadows.card
  },
  encouragementText: {
    ...typography.small,
    color: colors.textSoft
  },
  encouragementTitle: {
    ...typography.small,
    color: colors.text,
    marginBottom: spacing.xs
  },
  fullScreen: {
    backgroundColor: colors.screen,
    flex: 1
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
    justifyContent: "space-between",
    marginBottom: spacing.md
  },
  headerLeft: {
    alignItems: "center",
    flex: 1,
    flexDirection: "row",
    gap: spacing.sm,
    minWidth: 0
  },
  logout: {
    borderTopColor: colors.line,
    borderTopWidth: 1,
    marginTop: spacing.md,
    paddingVertical: spacing.md
  },
  logoutText: {
    ...typography.body,
    color: colors.danger,
    fontWeight: "800"
  },
  navIcon: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: "800",
    textAlign: "center",
    width: 24
  },
  notification: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: radius.pill,
    borderWidth: 1,
    height: 44,
    justifyContent: "center",
    width: 44
  },
  phoneMenu: {
    backgroundColor: "transparent",
    borderColor: "transparent",
    height: 38,
    width: 28
  },
  phoneMenuText: {
    color: colors.text,
    fontSize: 26,
    lineHeight: 30
  },
  phoneContent: {
    maxWidth: "100%",
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.lg
  },
  phoneScroll: {
    paddingBottom: 86
  },
  phoneRoot: {
    flexDirection: "column"
  },
  notificationText: {
    color: colors.danger,
    fontWeight: "900"
  },
  menuButton: {
    alignItems: "center",
    height: 38,
    justifyContent: "center",
    width: 28
  },
  menuIcon: {
    color: colors.text,
    fontSize: 24,
    fontWeight: "900",
    lineHeight: 28
  },
  mobileMenu: {
    backgroundColor: colors.surface,
    gap: spacing.xs,
    height: "100%",
    left: 0,
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.sm,
    position: "absolute",
    top: 0,
    width: 270,
    ...shadows.card
  },
  mobileMenuBrand: {
    color: colors.brandPurple,
    fontSize: 19,
    fontWeight: "900"
  },
  mobileMenuBrandRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.xs,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.xs
  },
  mobileMenuIcon: {
    color: colors.textMuted,
    fontSize: 15,
    fontWeight: "800",
    textAlign: "center",
    width: 26
  },
  mobileMenuItem: {
    alignItems: "center",
    borderRadius: radius.md,
    flexDirection: "row",
    gap: spacing.xs,
    minHeight: 40,
    paddingHorizontal: spacing.sm
  },
  mobileMenuItemActive: {
    backgroundColor: colors.brandBlue
  },
  mobileMenuLabel: {
    color: colors.textSoft,
    flex: 1,
    fontSize: 12,
    fontWeight: "800",
    lineHeight: 16
  },
  mobileMenuLayer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 40
  },
  mobileMenuLogo: {
    borderRadius: 10,
    height: 34,
    width: 34
  },
  mobileMenuScrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(32,33,63,0.24)"
  },
  mobileMenuTextActive: {
    color: colors.surface
  },
  phoneTitle: {
    fontSize: 22,
    lineHeight: 28,
    textAlign: "left"
  },
  phoneHeaderLogo: {
    borderRadius: 8,
    height: 30,
    width: 30
  },
  phoneTitleRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.xs,
    minWidth: 0
  },
  root: {
    backgroundColor: colors.screen,
    flex: 1,
    flexDirection: "row"
  },
  scroll: {
    flexGrow: 1
  },
  sidebar: {
    backgroundColor: colors.surface,
    borderRightColor: colors.line,
    borderRightWidth: 1,
    padding: spacing.lg,
    width: layout.sidebarWidth
  },
  sidebarItem: {
    alignItems: "center",
    borderRadius: radius.md,
    flexDirection: "row",
    gap: spacing.xs,
    minHeight: 42,
    paddingHorizontal: spacing.sm
  },
  sidebarItems: {
    gap: spacing.xs
  },
  sidebarLabel: {
    color: colors.textSoft,
    fontSize: 12,
    fontWeight: "800",
    lineHeight: 16
  },
  subtitle: {
    ...typography.small,
    color: colors.textMuted
  },
  tabletContent: {
    maxWidth: 1040,
    padding: spacing.xl
  },
  title: {
    ...typography.title,
    color: colors.text
  },
  titleBlock: {
    flex: 1,
    minWidth: 0
  },
  chatIcon: {
    borderRadius: 12,
    borderWidth: 2,
    height: 18,
    marginTop: 8,
    width: 22
  },
  childrenIcon: {
    height: 26,
    marginTop: 5,
    width: 28
  },
  homeBase: {
    borderRadius: 2,
    borderTopWidth: 0,
    borderWidth: 2,
    height: 14,
    left: 6,
    position: "absolute",
    top: 12,
    width: 16
  },
  homeIcon: {
    height: 28,
    marginTop: 4,
    width: 28
  },
  homeRoof: {
    borderBottomWidth: 10,
    borderLeftColor: "transparent",
    borderLeftWidth: 11,
    borderRightColor: "transparent",
    borderRightWidth: 11,
    height: 0,
    left: 3,
    position: "absolute",
    top: 3,
    width: 0
  },
  personBody: {
    borderRadius: 6,
    position: "absolute"
  },
  personBodyMain: {
    height: 12,
    left: 9,
    top: 13,
    width: 11
  },
  personBodySide: {
    height: 9,
    left: 18,
    opacity: 0.65,
    top: 16,
    width: 9
  },
  personHead: {
    borderRadius: radius.pill,
    position: "absolute"
  },
  personHeadMain: {
    height: 9,
    left: 10,
    top: 3,
    width: 9
  },
  personHeadSide: {
    height: 7,
    left: 19,
    opacity: 0.65,
    top: 8,
    width: 7
  },
  profileBody: {
    borderRadius: 10,
    borderWidth: 2,
    height: 11,
    marginTop: 2,
    width: 19
  },
  profileHead: {
    borderRadius: radius.pill,
    borderWidth: 2,
    height: 11,
    width: 11
  },
  profileIcon: {
    alignItems: "center",
    height: 28,
    justifyContent: "center",
    marginTop: 4,
    width: 28
  },
  reportBar: {
    borderRadius: 3,
    width: 4
  },
  reportsIcon: {
    alignItems: "flex-end",
    flexDirection: "row",
    gap: 3,
    height: 28,
    justifyContent: "center",
    marginTop: 4,
    width: 28
  }
});
