import React from "react";
import { StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { PikuButton } from "../../components/common/PikuButton";
import { PikuCard } from "../../components/common/PikuCard";
import { Avatar } from "../../components/common/Avatar";
import { colors, layout, spacing, typography } from "../../theme/tokens";
import type { ChildProfile, Controls, DashboardOverview, ParentProfile } from "../../types/domain";
import type { Navigate } from "../../navigation/types";

type Props = {
  parent: ParentProfile;
  overview: DashboardOverview;
  controls: Controls;
  childrenProfiles: ChildProfile[];
  navigate: Navigate;
};

export function ParentDashboardScreen({ parent, overview, controls, childrenProfiles, navigate }: Props): React.JSX.Element {
  const { width } = useWindowDimensions();
  const isTablet = width >= layout.tabletBreakpoint;
  const isPhone = !isTablet;
  const safeTotal = Math.max(1, overview.weekly_sessions);

  return (
    <View style={styles.wrap}>
      {isPhone ? (
        <PikuCard tone="purple" style={styles.mobileHero}>
          <View style={styles.mobileHeroHeader}>
            <View>
              <Text style={styles.mobileHeroKicker}>Family overview</Text>
              <Text style={styles.mobileHeroTitle}>{childrenProfiles.length || overview.child_count} children are active</Text>
            </View>
            <Text style={styles.mobileHeroScore}>{Math.round(((safeTotal - overview.pending_alerts) / safeTotal) * 100)}%</Text>
          </View>
          <Text style={styles.mobileHeroText}>Safe interactions this week. Alerts and parent controls are ready when you need them.</Text>
        </PikuCard>
      ) : null}

      <View style={[styles.statGrid, isTablet && styles.tabletStatsGrid]}>
        <StatCard compact={isPhone} label="Children" value={String(childrenProfiles.length || overview.child_count)} detail="Active profiles" icon="C" tone="blue" />
        <StatCard compact={isPhone} label="Chats Today" value={String(overview.weekly_sessions)} detail="+25% vs yesterday" icon="M" tone="green" />
        <StatCard compact={isPhone} label="Voice Messages" value={childrenProfiles.filter((child) => child.voice_enabled).length.toString()} detail="+16% vs yesterday" icon="V" tone="purple" />
        <StatCard compact={isPhone} label="Safe Interactions" value={`${Math.round(((safeTotal - overview.pending_alerts) / safeTotal) * 100)}%`} detail="Excellent" icon="S" tone="green" />
      </View>

      <View style={[styles.mainGrid, isTablet && styles.tabletMainGrid]}>
        <PikuCard style={styles.activityCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <Text style={styles.link}>View all</Text>
          </View>
          {(overview.recent_activity ?? []).slice(0, 4).map((activity, index) => {
            const child = childrenProfiles[index % Math.max(1, childrenProfiles.length)];
            return (
              <View key={activity.id} style={styles.activityRow}>
                <Avatar name={child?.display_name ?? "Piku"} size={46} />
                <View style={styles.activityCopy}>
                  <Text style={styles.activityName}>{child?.display_name ?? "Piku"}</Text>
                  <Text style={styles.activityText}>{activity.title}</Text>
                </View>
                <Text style={styles.activityTime}>{activity.updated_at}</Text>
              </View>
            );
          })}
        </PikuCard>

        <PikuCard style={styles.safetyCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Safety Summary</Text>
            <Text style={styles.link}>View report</Text>
          </View>
          <PikuCard tone="green" style={styles.goodCard}>
            <Text style={styles.goodIcon}>✓</Text>
            <View style={styles.goodCopy}>
              <Text style={styles.goodTitle}>All good!</Text>
              <Text style={styles.goodText}>We didn't detect any concerning activity. Keep up the great job.</Text>
            </View>
          </PikuCard>
          <View style={styles.controlGrid}>
            <MiniStatus label="Content Filtering" value={controls.content_strictness_level === "strict" ? "On" : "Balanced"} tone="blue" />
            <MiniStatus label="Screening" value="Strict" tone="yellow" />
            <MiniStatus label="Privacy Protection" value={controls.transcript_visibility_enabled ? "High" : "Limited"} tone="blue" />
            <MiniStatus label="Time Limits" value={controls.session_limit_enabled ? "Enabled" : "Off"} tone="green" />
          </View>
        </PikuCard>
      </View>

      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={[styles.quickRow, isTablet && styles.quickTablet]}>
        <PikuButton label="Add Child" icon="+" onPress={() => navigate("addChild")} variant="secondary" style={styles.quickButton} />
        <PikuButton label="Voice Settings" icon="V" onPress={() => navigate("settings")} variant="secondary" style={styles.quickButton} />
        <PikuButton label="Set Time Limits" icon="T" onPress={() => navigate("safety")} variant="secondary" style={styles.quickButton} />
        <PikuButton label="View Reports" icon="R" onPress={() => navigate("reports")} variant="secondary" style={styles.quickButton} />
      </View>
    </View>
  );
}

function StatCard({ compact, label, value, detail, icon, tone }: { compact?: boolean; label: string; value: string; detail: string; icon: string; tone: "blue" | "green" | "purple" }): React.JSX.Element {
  return (
    <PikuCard style={[styles.statCard, compact && styles.phoneStatCard]}>
      <View style={[styles.statIcon, compact && styles.phoneStatIcon, tone === "blue" ? styles.blueIcon : tone === "green" ? styles.greenIcon : styles.purpleIcon]}>
        <Text style={styles.statIconText}>{icon}</Text>
      </View>
      <View>
        <Text style={styles.statLabel}>{label}</Text>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={[styles.statDetail, tone === "green" && styles.greenText]}>{detail}</Text>
      </View>
    </PikuCard>
  );
}

function MiniStatus({ label, value, tone }: { label: string; value: string; tone: "blue" | "yellow" | "green" }): React.JSX.Element {
  return (
    <PikuCard tone={tone} style={styles.miniStatus}>
      <Text style={styles.miniLabel}>{label}</Text>
      <Text style={styles.miniValue}>{value}</Text>
    </PikuCard>
  );
}

const styles = StyleSheet.create({
  activityCard: {
    flex: 1
  },
  activityCopy: {
    flex: 1
  },
  activityName: {
    ...typography.body,
    color: colors.text,
    fontWeight: "800"
  },
  activityRow: {
    alignItems: "center",
    borderBottomColor: colors.line,
    borderBottomWidth: 1,
    flexDirection: "row",
    gap: spacing.sm,
    paddingVertical: spacing.sm
  },
  activityText: {
    ...typography.small,
    color: colors.textSoft
  },
  activityTime: {
    ...typography.tiny,
    color: colors.textMuted
  },
  blueIcon: { backgroundColor: colors.blueSoft },
  controlGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  },
  goodCard: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.md,
    marginBottom: spacing.sm
  },
  goodCopy: { flex: 1 },
  goodIcon: {
    color: colors.green,
    fontSize: 42,
    fontWeight: "900"
  },
  goodText: {
    ...typography.body,
    color: colors.textSoft
  },
  goodTitle: {
    ...typography.section,
    color: colors.text
  },
  greenIcon: { backgroundColor: colors.greenSoft },
  greenText: { color: colors.green },
  link: {
    ...typography.small,
    color: colors.brandBlue
  },
  mainGrid: {
    gap: spacing.md,
    marginBottom: spacing.lg
  },
  miniLabel: {
    ...typography.tiny,
    color: colors.textSoft
  },
  miniStatus: {
    flexGrow: 1,
    minWidth: 140,
    padding: spacing.sm
  },
  miniValue: {
    ...typography.small,
    color: colors.green,
    marginTop: 2
  },
  mobileHero: {
    gap: spacing.sm,
    marginBottom: spacing.sm
  },
  mobileHeroHeader: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: spacing.sm,
    justifyContent: "space-between"
  },
  mobileHeroKicker: {
    ...typography.small,
    color: colors.brandPurple,
    marginBottom: 2
  },
  mobileHeroScore: {
    color: colors.green,
    fontSize: 34,
    fontWeight: "900"
  },
  mobileHeroText: {
    ...typography.body,
    color: colors.textSoft
  },
  mobileHeroTitle: {
    ...typography.section,
    color: colors.text,
    maxWidth: 220
  },
  purpleIcon: { backgroundColor: colors.purpleSoft },
  phoneStatCard: {
    alignItems: "flex-start",
    flexBasis: "47%",
    flexDirection: "column",
    minWidth: 0,
    padding: spacing.sm
  },
  phoneStatIcon: {
    height: 38,
    width: 38
  },
  quickButton: {
    flexGrow: 1,
    minWidth: 150
  },
  quickRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  },
  quickTablet: {
    flexWrap: "nowrap"
  },
  safetyCard: {
    flex: 1
  },
  sectionHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.sm
  },
  sectionTitle: {
    ...typography.section,
    color: colors.text,
    marginBottom: spacing.sm
  },
  statCard: {
    alignItems: "center",
    flexDirection: "row",
    flexGrow: 1,
    flexShrink: 1,
    gap: spacing.sm,
    minWidth: 178
  },
  statDetail: {
    ...typography.tiny,
    color: colors.textMuted
  },
  statGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginBottom: spacing.lg
  },
  statIcon: {
    alignItems: "center",
    borderRadius: 18,
    height: 48,
    justifyContent: "center",
    width: 48
  },
  statIconText: {
    color: colors.brandBlue,
    fontSize: 18,
    fontWeight: "900"
  },
  statLabel: {
    ...typography.small,
    color: colors.textSoft
  },
  statValue: {
    color: colors.text,
    fontSize: 24,
    fontWeight: "900"
  },
  tabletMainGrid: {
    flexDirection: "row"
  },
  tabletStatsGrid: {
    flexWrap: "nowrap"
  },
  wrap: {
    gap: spacing.sm
  }
});
