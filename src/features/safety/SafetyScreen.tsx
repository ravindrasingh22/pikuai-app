import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { updateControls } from "../../api/mobileApi";
import { PikuButton } from "../../components/common/PikuButton";
import { PikuCard } from "../../components/common/PikuCard";
import { useAsyncAction } from "../../hooks/useAsyncAction";
import { colors, radius, spacing, typography } from "../../theme/tokens";
import type { Controls } from "../../types/domain";

export function SafetyScreen({ controls, onUpdated }: { controls: Controls; onUpdated: () => Promise<void> }): React.JSX.Element {
  const [localControls, setLocalControls] = useState(controls);
  const save = useAsyncAction(async () => {
    await updateControls(localControls);
    await onUpdated();
  });

  return (
    <View style={styles.wrap}>
      <PikuCard tone="green">
        <Text style={styles.cardTitle}>Child-safe by design</Text>
        <Text style={styles.body}>These settings control text, voice, transcript visibility, content strictness and time limits.</Text>
      </PikuCard>
      <ToggleRow label="Voice mode" value={true} onChange={() => undefined} />
      <ToggleRow label="Transcript visibility" value={localControls.transcript_visibility_enabled} onChange={(value) => setLocalControls((current) => ({ ...current, transcript_visibility_enabled: value }))} />
      <ToggleRow label="Sensitive topic alerts" value={localControls.sensitive_topic_alerts_enabled} onChange={(value) => setLocalControls((current) => ({ ...current, sensitive_topic_alerts_enabled: value }))} />
      <ToggleRow label="Session time limit" value={Boolean(localControls.session_limit_enabled)} onChange={(value) => setLocalControls((current) => ({ ...current, session_limit_enabled: value }))} />
      <View style={styles.strictness}>
        {(["low", "balanced", "strict"] as const).map((level) => (
          <Pressable
            key={level}
            onPress={() => setLocalControls((current) => ({ ...current, content_strictness_level: level }))}
            style={[styles.strictnessPill, localControls.content_strictness_level === level && styles.strictnessActive]}
          >
            <Text style={[styles.strictnessText, localControls.content_strictness_level === level && styles.strictnessActiveText]}>{level}</Text>
          </Pressable>
        ))}
      </View>
      {save.error ? <Text style={styles.error}>{save.error}</Text> : null}
      <PikuButton label="Save Safety Settings" onPress={() => void save.run()} loading={save.loading} />
    </View>
  );
}

function ToggleRow({ label, value, onChange }: { label: string; value: boolean; onChange: (value: boolean) => void }): React.JSX.Element {
  return (
    <PikuCard style={styles.toggleRow}>
      <Text style={styles.toggleLabel}>{label}</Text>
      <Pressable onPress={() => onChange(!value)} style={[styles.switch, value && styles.switchOn]}>
        <View style={[styles.knob, value && styles.knobOn]} />
      </Pressable>
    </PikuCard>
  );
}

const styles = StyleSheet.create({
  body: {
    ...typography.body,
    color: colors.textSoft
  },
  cardTitle: {
    ...typography.section,
    color: colors.text,
    marginBottom: spacing.xs
  },
  error: {
    ...typography.small,
    color: colors.danger
  },
  knob: {
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    height: 24,
    width: 24
  },
  knobOn: {
    transform: [{ translateX: 24 }]
  },
  strictness: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  },
  strictnessActive: {
    backgroundColor: colors.brandBlue
  },
  strictnessActiveText: {
    color: colors.surface
  },
  strictnessPill: {
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: radius.pill,
    borderWidth: 1,
    flexBasis: 96,
    flexGrow: 1,
    padding: spacing.sm
  },
  strictnessText: {
    ...typography.small,
    color: colors.textSoft,
    textAlign: "center",
    textTransform: "capitalize"
  },
  switch: {
    backgroundColor: colors.line,
    borderRadius: radius.pill,
    padding: 3,
    width: 54
  },
  switchOn: {
    backgroundColor: colors.green
  },
  toggleLabel: {
    ...typography.body,
    color: colors.text,
    fontWeight: "800"
  },
  toggleRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between"
  },
  wrap: {
    gap: spacing.md
  }
});
