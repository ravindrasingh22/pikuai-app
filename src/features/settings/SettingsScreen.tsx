import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Avatar } from "../../components/common/Avatar";
import { PikuButton } from "../../components/common/PikuButton";
import { PikuCard } from "../../components/common/PikuCard";
import { colors, spacing, typography } from "../../theme/tokens";
import type { ChildProfile, ParentProfile } from "../../types/domain";
import type { Navigate } from "../../navigation/types";

export function SettingsScreen({ parent, childrenProfiles, navigate, onLogout }: {
  parent: ParentProfile;
  childrenProfiles: ChildProfile[];
  navigate: Navigate;
  onLogout: () => void;
}): React.JSX.Element {
  return (
    <View style={styles.wrap}>
      <PikuCard style={styles.profileCard}>
        <Avatar name={parent.full_name} variant="parent" size={64} />
        <View style={styles.profileCopy}>
          <Text style={styles.name}>{parent.full_name}</Text>
          <Text style={styles.body}>{parent.email}</Text>
        </View>
      </PikuCard>
      <PikuCard>
        <Text style={styles.sectionTitle}>Voice Settings</Text>
        <Text style={styles.body}>Voice mode, speech playback, transcript visibility and read-aloud responses are parent-managed.</Text>
        <View style={styles.settingRow}><Text style={styles.body}>Voice profiles enabled</Text><Text style={styles.value}>{childrenProfiles.filter((child) => child.voice_enabled !== false).length}</Text></View>
        <View style={styles.settingRow}><Text style={styles.body}>Parent PIN</Text><Text style={styles.value}>{parent.pin_enabled ? "Enabled" : "Not set"}</Text></View>
        <View style={styles.settingRow}><Text style={styles.body}>2FA</Text><Text style={styles.value}>{parent.two_factor_enabled ? "Enabled" : "Recommended"}</Text></View>
      </PikuCard>
      <PikuCard tone="purple">
        <Text style={styles.sectionTitle}>Privacy First</Text>
        <Text style={styles.body}>No child-data training by default. Parents control retention, visibility and optional personalization.</Text>
      </PikuCard>
      <PikuButton label="Open Child Mode" onPress={() => navigate("childPicker")} />
      <PikuButton label="Logout" onPress={onLogout} variant="ghost" />
    </View>
  );
}

const styles = StyleSheet.create({
  body: {
    ...typography.body,
    color: colors.textSoft
  },
  name: {
    ...typography.section,
    color: colors.text
  },
  profileCard: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.md
  },
  profileCopy: {
    flex: 1
  },
  sectionTitle: {
    ...typography.section,
    color: colors.text,
    marginBottom: spacing.xs
  },
  settingRow: {
    borderTopColor: colors.line,
    borderTopWidth: 1,
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
    justifyContent: "space-between",
    marginTop: spacing.sm,
    paddingTop: spacing.sm
  },
  value: {
    ...typography.body,
    color: colors.brandPurple,
    flexShrink: 0,
    fontWeight: "900"
  },
  wrap: {
    gap: spacing.md
  }
});
