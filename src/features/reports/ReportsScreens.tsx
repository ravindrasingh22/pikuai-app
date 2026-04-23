import React, { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { PikuCard } from "../../components/common/PikuCard";
import { colors, spacing, typography } from "../../theme/tokens";
import type { ChildProfile, ReportSummary, TranscriptThread } from "../../types/domain";
import { safePercent } from "../../utils/format";

export function ReportsScreen({ reports }: { reports: ReportSummary }): React.JSX.Element {
  const childMessages = reports.usage.child_messages ?? 0;
  const safeMessages = reports.safety.policy_buckets.allowed ?? 0;
  return (
    <View style={styles.wrap}>
      <View style={styles.grid}>
        <Metric label="Total Sessions" value={String(reports.usage.threads ?? 0)} tone="blue" />
        <Metric label="Voice vs Text" value="Mixed" tone="purple" />
        <Metric label="Safe Ratio" value={safePercent(safeMessages, childMessages)} tone="green" />
        <Metric label="Open Alerts" value={String(reports.safety.open_alerts)} tone="yellow" />
      </View>
      <PikuCard>
        <Text style={styles.sectionTitle}>Common safe topics</Text>
        {Object.entries(reports.safety.top_categories).map(([topic, count]) => (
          <View key={topic} style={styles.row}>
            <Text style={styles.rowLabel}>{topic}</Text>
            <Text style={styles.rowValue}>{count}</Text>
          </View>
        ))}
      </PikuCard>
      <PikuCard tone="green">
        <Text style={styles.sectionTitle}>Safety summary</Text>
        <Text style={styles.body}>PikuAI classifies messages into explain, guide, redirect and refuse modes. Parent reports show high-level insights first, with transcript details protected by Parent PIN.</Text>
      </PikuCard>
    </View>
  );
}

export function TranscriptsScreen({ transcripts, childrenProfiles }: { transcripts: TranscriptThread[]; childrenProfiles: ChildProfile[] }): React.JSX.Element {
  const groupedThreads = useMemo(() => {
    const byChild = new Map<string, TranscriptThread[]>();
    transcripts.forEach((thread) => {
      const childId = thread.child_profile_id ?? "unknown-child";
      const existing = byChild.get(childId);
      if (existing) {
        existing.push(thread);
      } else {
        byChild.set(childId, [thread]);
      }
    });
    return byChild;
  }, [transcripts]);

  const childSections = useMemo(() => {
    return childrenProfiles.map((child, index) => ({
      child,
      index,
      threads: groupedThreads.get(child.id) ?? []
    })).filter((section) => section.threads.length > 0);
  }, [childrenProfiles, groupedThreads]);

  const [collapsedByChild, setCollapsedByChild] = useState<Record<string, boolean>>({});
  const [collapsedByThread, setCollapsedByThread] = useState<Record<string, boolean>>({});
  const toggleChild = (childId: string): void => {
    setCollapsedByChild((current) => ({ ...current, [childId]: !current[childId] }));
  };
  const toggleThread = (threadId: string): void => {
    setCollapsedByThread((current) => ({ ...current, [threadId]: !current[threadId] }));
  };

  return (
    <View style={styles.wrap}>
      {childSections.length === 0 ? (
        <PikuCard>
          <Text style={styles.sectionTitle}>No chat threads yet</Text>
          <Text style={styles.body}>Chats will appear here after a child starts talking with Piku.</Text>
        </PikuCard>
      ) : null}
      {childSections.map(({ child, index, threads }) => {
        const collapsed = collapsedByChild[child.id] ?? false;
        const tone = index % 3 === 0 ? "blue" : index % 3 === 1 ? "green" : "purple";
        return (
          <PikuCard key={child.id} tone={tone}>
            <Pressable onPress={() => toggleChild(child.id)} accessibilityRole="button" style={styles.collapsibleHeader}>
              <View style={styles.headerTextWrap}>
                <Text style={styles.threadTitle}>{child.display_name}</Text>
                <Text style={styles.body}>Age {child.age_band} • {threads.length} threads</Text>
              </View>
              <Text style={styles.chevron}>{collapsed ? "▾" : "▴"}</Text>
            </Pressable>
            {collapsed ? null : (
              <View style={styles.threadsWrap}>
                {threads.map((thread) => (
                  <View key={thread.id} style={styles.threadCard}>
                    <Pressable onPress={() => toggleThread(thread.id)} accessibilityRole="button" style={styles.collapsibleHeader}>
                      <View style={styles.headerTextWrap}>
                        <Text style={styles.threadTitle}>{thread.title}</Text>
                        <Text style={styles.badge}>{thread.last_policy_bucket}</Text>
                      </View>
                      <Text style={styles.chevron}>{(collapsedByThread[thread.id] ?? false) ? "▾" : "▴"}</Text>
                    </Pressable>
                    {(collapsedByThread[thread.id] ?? false) ? null : (
                      <View style={styles.messagePreviewWrap}>
                        {thread.messages.length === 0 ? (
                          <Text style={styles.body}>No messages in this thread yet.</Text>
                        ) : (
                          thread.messages.slice(0, 2).map((message) => (
                            <Text key={message.id} style={message.input_mode === "voice" ? styles.voiceTranscriptBody : styles.body}>{message.sender_type}: {message.rendered_text}</Text>
                          ))
                        )}
                      </View>
                    )}
                  </View>
                ))}
              </View>
            )}
          </PikuCard>
        );
      })}
    </View>
  );
}

function Metric({ label, value, tone }: { label: string; value: string; tone: "blue" | "purple" | "green" | "yellow" }): React.JSX.Element {
  return (
    <PikuCard tone={tone} style={styles.metric}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
    </PikuCard>
  );
}

const styles = StyleSheet.create({
  badge: {
    ...typography.tiny,
    color: colors.green,
    textTransform: "capitalize"
  },
  body: {
    ...typography.body,
    color: colors.textSoft,
    marginTop: spacing.xs
  },
  chevron: {
    color: colors.textMuted,
    fontSize: 18,
    fontWeight: "800"
  },
  collapsibleHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between"
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  },
  headerTextWrap: {
    flex: 1,
    minWidth: 0
  },
  metric: {
    flexBasis: "47%",
    flexGrow: 1,
    minWidth: 0
  },
  metricLabel: {
    ...typography.small,
    color: colors.textSoft
  },
  metricValue: {
    color: colors.text,
    fontSize: 28,
    fontWeight: "900",
    marginTop: spacing.xs
  },
  row: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.md
  },
  rowLabel: {
    ...typography.body,
    color: colors.text,
    textTransform: "capitalize"
  },
  rowValue: {
    ...typography.body,
    color: colors.brandPurple,
    fontWeight: "900"
  },
  sectionTitle: {
    ...typography.section,
    color: colors.text
  },
  threadCard: {
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: 14,
    borderWidth: 1,
    padding: spacing.sm
  },
  messagePreviewWrap: {
    marginTop: spacing.xs
  },
  voiceTranscriptBody: {
    ...typography.body,
    color: colors.textSoft,
    fontStyle: "italic"
  },
  threadTitle: {
    ...typography.body,
    color: colors.text,
    flex: 1,
    fontWeight: "800"
  },
  threadsWrap: {
    gap: spacing.sm,
    marginTop: spacing.sm
  },
  wrap: {
    gap: spacing.md
  }
});
