import React from "react";
import { Image, Platform, Pressable, ScrollView, StatusBar, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { pikuImages } from "../../assets/brand";
import { colors, layout, radius, shadows, spacing, typography } from "../../theme/tokens";
import type { AppRoute, Navigate } from "../../navigation/types";

type NavItem = {
  route: AppRoute;
  icon: string;
  label: string;
};

const parentNavItems: NavItem[] = [
  { route: "dashboard", icon: "H", label: "Dashboard" },
  { route: "children", icon: "C", label: "Children" },
  { route: "transcripts", icon: "T", label: "Chats" },
  { route: "safety", icon: "S", label: "Permissions / Safety" },
  { route: "reports", icon: "R", label: "Activity / Reports" },
  { route: "settings", icon: "P", label: "Profile" }
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
  title,
  subtitle,
  scroll = true,
  showParentChrome = true
}: AppScaffoldProps): React.JSX.Element {
  const { width } = useWindowDimensions();
  const isTablet = width >= layout.tabletBreakpoint;
  const topInset = Platform.OS === "android" ? StatusBar.currentHeight ?? 0 : 54;
  const bottomInset = Platform.OS === "ios" ? 24 : 0;

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
              <Pressable accessibilityLabel="Open navigation" accessibilityRole="button" onPress={() => navigate("dashboard")} style={styles.menuButton}>
                <Text style={styles.menuIcon}>☰</Text>
              </Pressable>
            ) : null}
            <View style={styles.titleBlock}>
              {subtitle && isTablet ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
              <Text style={[styles.title, !isTablet && styles.phoneTitle]}>{title}</Text>
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
      {isTablet ? <Sidebar activeRoute={activeRoute} navigate={navigate} /> : null}
      {scroll ? <ScrollView contentContainerStyle={[styles.scroll, !isTablet && styles.phoneScroll]}>{content}</ScrollView> : content}
      {!isTablet ? <BottomNav activeRoute={activeRoute} bottomInset={bottomInset} navigate={navigate} /> : null}
    </View>
  );
}

function Sidebar({ activeRoute, navigate }: { activeRoute: AppRoute; navigate: Navigate }): React.JSX.Element {
  return (
    <View style={styles.sidebar}>
      <View style={styles.brandRow}>
        <Image source={pikuImages.icon} style={styles.brandIcon} />
        <Text style={styles.brandText}>PikuAI</Text>
      </View>
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
      <Pressable onPress={() => navigate("welcome", { resetHistory: true })} style={styles.logout}>
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
    fontSize: 16,
    fontWeight: "900",
    textAlign: "center",
    width: 22
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
  phoneTitle: {
    fontSize: 22,
    lineHeight: 28,
    textAlign: "left"
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
    gap: spacing.sm,
    minHeight: 48,
    paddingHorizontal: spacing.sm
  },
  sidebarItems: {
    gap: spacing.xs
  },
  sidebarLabel: {
    ...typography.body,
    color: colors.textSoft,
    fontWeight: "800"
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
