import React, { useState } from "react";
import { Modal, Pressable, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { createChildProfile, deleteChildProfile } from "../../api/mobileApi";
import { Avatar } from "../../components/common/Avatar";
import { PikuButton } from "../../components/common/PikuButton";
import { PikuCard } from "../../components/common/PikuCard";
import { PikuTextField } from "../../components/common/PikuTextField";
import { useAsyncAction } from "../../hooks/useAsyncAction";
import { colors, spacing, typography } from "../../theme/tokens";
import type { ChildProfile } from "../../types/domain";
import type { Navigate } from "../../navigation/types";

const avatarOptions = [
  { key: "girl" },
  { key: "boy" },
  { key: "kid" },
  { key: "star" },
  { key: "rocket" }
];

export function ChildrenListScreen({
  childrenProfiles,
  navigate,
  onDeleted
}: {
  childrenProfiles: ChildProfile[];
  navigate: Navigate;
  onDeleted: () => Promise<void>;
}): React.JSX.Element {
  const { width } = useWindowDimensions();
  const isPhone = width < 430;
  const [deleteTarget, setDeleteTarget] = useState<ChildProfile | null>(null);
  const [deleteChats, setDeleteChats] = useState(false);
  const remove = useAsyncAction(async () => {
    if (!deleteTarget) return;
    await deleteChildProfile(deleteTarget.id, deleteChats);
    setDeleteTarget(null);
    setDeleteChats(false);
    await onDeleted();
  });
  return (
    <View style={styles.wrap}>
      <Text style={styles.intro}>Manage your kids' profiles and settings.</Text>
      <View style={styles.childrenStack}>
        {childrenProfiles.map((child, index) => {
          const tone = index === 0 ? "blue" : index === 1 ? "green" : "purple";
          return (
            <PikuCard key={child.id} tone={tone} style={[styles.childCard, isPhone && styles.phoneChildCard]}>
              <Avatar avatarKey={child.avatar_key} name={child.display_name} size={isPhone ? 70 : 58} />
              <View style={styles.childCopy}>
                <View style={styles.nameRow}>
                  <Text style={styles.childName}>{child.display_name}{index === 0 ? " ★" : ""}</Text>
                  <Text style={[styles.ageBadge, tone === "green" ? styles.greenBadge : tone === "purple" ? styles.purpleBadge : styles.blueBadge]}>Age {child.age_band}</Text>
                </View>
                <Text style={styles.childMeta}>{childProfileSummary(child)}</Text>
              </View>
              <PikuButton label="Delete" onPress={() => setDeleteTarget(child)} variant="ghost" />
            </PikuCard>
          );
        })}
      </View>
      {isPhone ? (
        <Pressable accessibilityRole="button" onPress={() => navigate("addChild")} style={({ pressed }) => [styles.addChildDashed, pressed && styles.pressed]}>
          <Text style={styles.addChildText}>+ Add Child</Text>
        </Pressable>
      ) : (
        <PikuButton label="+ Add Child" onPress={() => navigate("addChild")} variant="secondary" />
      )}
      <Modal animationType="fade" transparent visible={deleteTarget !== null} onRequestClose={() => setDeleteTarget(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.cardTitle}>Delete child profile?</Text>
            <Text style={styles.intro}>
              {deleteTarget ? `Remove ${deleteTarget.display_name} from your children list.` : "Remove this child profile."}
            </Text>
            <Pressable
              accessibilityRole="checkbox"
              accessibilityState={{ checked: deleteChats }}
              onPress={() => setDeleteChats((current) => !current)}
              style={styles.checkboxRow}
            >
              <View style={[styles.checkbox, deleteChats && styles.checkboxChecked]}>
                {deleteChats ? <Text style={styles.checkboxMark}>✓</Text> : null}
              </View>
              <Text style={styles.checkboxText}>Also delete past chats and transcripts for this child</Text>
            </Pressable>
            {remove.error ? <Text style={styles.error}>{remove.error}</Text> : null}
            <View style={styles.modalActions}>
              <PikuButton label="Cancel" onPress={() => setDeleteTarget(null)} variant="secondary" />
              <PikuButton label="Delete" onPress={() => void remove.run()} loading={remove.loading} />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function childProfileSummary(child: ChildProfile): string {
  if (child.voice_enabled === false) return "Text only";
  return child.child_pin_enabled ? "Voice enabled · PIN protected" : "Voice enabled";
}

export function AddChildScreen({ navigate, onCreated }: { navigate: Navigate; onCreated: () => Promise<void> }): React.JSX.Element {
  const [displayName, setDisplayName] = useState("");
  const [ageBand, setAgeBand] = useState("8-10");
  const [dailyLimit, setDailyLimit] = useState("30");
  const [avatarKey, setAvatarKey] = useState("kid");
  const create = useAsyncAction(async () => {
    await createChildProfile({ displayName, ageBand, dailyTimeLimitMinutes: Number(dailyLimit) || 30, avatarKey, voiceEnabled: true });
    await onCreated();
    navigate("children");
  });

  return (
    <View style={styles.form}>
      <PikuCard tone="blue">
        <Text style={styles.cardTitle}>New child profile</Text>
        <Text style={styles.intro}>Create a safe, age-shaped space before the child enters chat.</Text>
      </PikuCard>
      <PikuTextField label="Display name" value={displayName} onChangeText={setDisplayName} />
      <PikuTextField label="Age band" value={ageBand} onChangeText={setAgeBand} placeholder="5-7, 8-10 or 11-12" />
      <PikuTextField label="Daily time limit" value={dailyLimit} onChangeText={setDailyLimit} keyboardType="number-pad" />
      <View style={styles.avatarPicker}>
        <Text style={styles.fieldLabel}>Profile icon</Text>
        <View style={styles.avatarOptions}>
          {avatarOptions.map((option) => (
            <Pressable
              key={option.key}
              accessibilityRole="button"
              accessibilityState={{ selected: avatarKey === option.key }}
              onPress={() => setAvatarKey(option.key)}
              style={[styles.avatarOption, avatarKey === option.key && styles.avatarOptionActive]}
            >
              <Avatar avatarKey={option.key} name={option.key} size={32} />
            </Pressable>
          ))}
        </View>
      </View>
      <Text style={styles.childMeta}>Voice chat is enabled by default. You can change it later in child settings.</Text>
      {create.error ? <Text style={styles.error}>{create.error}</Text> : null}
      <PikuButton label="Save Child Profile" onPress={() => void create.run()} loading={create.loading} />
    </View>
  );
}

export function ChildPickerScreen({ childrenProfiles, navigate }: { childrenProfiles: ChildProfile[]; navigate: Navigate }): React.JSX.Element {
  const { width } = useWindowDimensions();
  const isPhone = width < 430;
  return (
    <View style={styles.wrap}>
      <Text style={styles.childModeTitle}>Choose your profile</Text>
      <Text style={styles.intro}>Pick your name before chatting with Piku.</Text>
      <View style={styles.childrenStack}>
        {childrenProfiles.map((child, index) => {
          const tone = index === 0 ? "blue" : index === 1 ? "green" : "purple";
          return (
            <Pressable
              key={child.id}
              accessibilityRole="button"
              onPress={() => navigate(child.child_pin_enabled ? "childPin" : "childChat", { child })}
              style={({ pressed }) => pressed && styles.pressed}
            >
              <PikuCard tone={tone} style={[styles.childCard, isPhone && styles.phoneChildCard]}>
                <Avatar avatarKey={child.avatar_key} name={child.display_name} size={isPhone ? 70 : 58} />
                <View style={styles.childCopy}>
                  <View style={styles.nameRow}>
                    <Text style={styles.childName}>{child.display_name}{index === 0 ? " ★" : ""}</Text>
                    <Text style={[styles.ageBadge, tone === "green" ? styles.greenBadge : tone === "purple" ? styles.purpleBadge : styles.blueBadge]}>Age {child.age_band}</Text>
                  </View>
                  <Text style={styles.childMeta}>{childProfileSummary(child)}</Text>
                </View>
                {isPhone ? (
                  <Text style={[styles.chevron, tone === "green" ? styles.greenChevron : tone === "purple" ? styles.purpleChevron : styles.blueChevron]}>›</Text>
                ) : (
                  <PikuButton label="Open" onPress={() => navigate(child.child_pin_enabled ? "childPin" : "childChat", { child })} variant="ghost" />
                )}
              </PikuCard>
            </Pressable>
          );
        })}
      </View>
      {isPhone ? (
        <Pressable accessibilityRole="button" onPress={() => navigate("addChild")} style={({ pressed }) => [styles.addChildDashed, pressed && styles.pressed]}>
          <Text style={styles.addChildText}>+ Add Child</Text>
        </Pressable>
      ) : (
        <PikuButton label="+ Add Child" onPress={() => navigate("addChild")} variant="secondary" />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  ageBadge: {
    ...typography.tiny,
    borderRadius: 10,
    color: colors.surface,
    fontSize: 13,
    lineHeight: 17,
    overflow: "hidden",
    paddingHorizontal: spacing.sm,
    paddingVertical: 5
  },
  addChildDashed: {
    alignItems: "center",
    borderColor: "#9bb5ff",
    borderRadius: 18,
    borderStyle: "dashed",
    borderWidth: 2,
    justifyContent: "center",
    minHeight: 68
  },
  addChildText: {
    ...typography.section,
    color: colors.brandBlue
  },
  blueBadge: {
    backgroundColor: colors.brandBlue
  },
  blueChevron: {
    color: colors.brandBlue
  },
  cardTitle: {
    ...typography.section,
    color: colors.text,
    marginBottom: spacing.xs
  },
  avatarOption: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: 16,
    borderWidth: 1,
    height: 52,
    justifyContent: "center",
    width: 52
  },
  avatarOptionActive: {
    borderColor: colors.brandPurple,
    borderWidth: 2
  },
  avatarOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  },
  avatarPicker: {
    gap: spacing.xs
  },
  checkbox: {
    alignItems: "center",
    borderColor: colors.line,
    borderRadius: 6,
    borderWidth: 2,
    height: 24,
    justifyContent: "center",
    width: 24
  },
  checkboxChecked: {
    backgroundColor: colors.brandPurple,
    borderColor: colors.brandPurple
  },
  checkboxMark: {
    color: colors.surface,
    fontWeight: "900"
  },
  checkboxRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
    paddingVertical: spacing.sm
  },
  checkboxText: {
    ...typography.body,
    color: colors.text,
    flex: 1
  },
  childCard: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.md
  },
  childCopy: {
    flex: 1,
    minWidth: 0
  },
  childMeta: {
    ...typography.body,
    color: colors.textSoft
  },
  childModeTitle: {
    ...typography.hero,
    color: colors.text
  },
  childName: {
    ...typography.section,
    color: colors.text,
    fontSize: 19
  },
  childrenStack: {
    gap: spacing.md
  },
  chevron: {
    fontSize: 36,
    fontWeight: "700",
    lineHeight: 38
  },
  error: {
    ...typography.small,
    color: colors.danger
  },
  form: {
    gap: spacing.sm
  },
  fieldLabel: {
    ...typography.small,
    color: colors.text
  },
  greenBadge: {
    backgroundColor: colors.green
  },
  greenChevron: {
    color: colors.green
  },
  intro: {
    ...typography.body,
    color: colors.textSoft
  },
  nameRow: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs
  },
  modalActions: {
    flexDirection: "row",
    gap: spacing.sm,
    justifyContent: "flex-end"
  },
  modalCard: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    gap: spacing.sm,
    maxWidth: 420,
    padding: spacing.lg,
    width: "90%"
  },
  modalOverlay: {
    alignItems: "center",
    backgroundColor: "rgba(33, 24, 62, 0.42)",
    flex: 1,
    justifyContent: "center",
    padding: spacing.md
  },
  phoneChildButton: {
    alignSelf: "stretch",
    width: "100%"
  },
  phoneChildCard: {
    borderColor: "transparent",
    borderRadius: 18,
    flexDirection: "row",
    minHeight: 104,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm
  },
  pressed: {
    opacity: 0.75
  },
  purpleBadge: {
    backgroundColor: colors.brandPurple
  },
  purpleChevron: {
    color: colors.brandPurple
  },
  wrap: {
    gap: spacing.md
  }
});
