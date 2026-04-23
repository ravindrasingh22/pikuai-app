import React, { useState } from "react";
import { Modal, Pressable, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { createChildProfile, deleteChildProfile, updateChildProfile } from "../../api/mobileApi";
import { Avatar } from "../../components/common/Avatar";
import { PikuButton } from "../../components/common/PikuButton";
import { PikuCard } from "../../components/common/PikuCard";
import { PikuTextField } from "../../components/common/PikuTextField";
import { useAsyncAction } from "../../hooks/useAsyncAction";
import { colors, spacing, typography } from "../../theme/tokens";
import type { ChildProfile } from "../../types/domain";
import type { Navigate } from "../../navigation/types";

const ageBandOptions = ["3-5", "6-8", "9-11", "11-13", "14-17"] as const;
const genderOptions = [
  { key: "girl", label: "Girl" },
  { key: "boy", label: "Boy" },
  { key: "not_disclosed", label: "I don't want to disclose" }
] as const;

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
  const [editTarget, setEditTarget] = useState<ChildProfile | null>(null);
  const [editName, setEditName] = useState("");
  const [editAgeBand, setEditAgeBand] = useState<(typeof ageBandOptions)[number]>("6-8");
  const [editDailyLimit, setEditDailyLimit] = useState("30");
  const [editAvatarKey, setEditAvatarKey] = useState("kid");
  const [editGender, setEditGender] = useState<(typeof genderOptions)[number]["key"]>("not_disclosed");
  const openEdit = (child: ChildProfile): void => {
    setEditTarget(child);
    setEditName(child.display_name);
    setEditAgeBand(ageBandOptions.includes(child.age_band as (typeof ageBandOptions)[number]) ? child.age_band as (typeof ageBandOptions)[number] : "6-8");
    setEditDailyLimit(String(child.daily_time_limit_minutes ?? 30));
    setEditAvatarKey(child.avatar_key ?? "kid");
    setEditGender(genderOptions.some((option) => option.key === child.gender) ? child.gender ?? "not_disclosed" : "not_disclosed");
  };
  const remove = useAsyncAction(async () => {
    if (!deleteTarget) return;
    await deleteChildProfile(deleteTarget.id, deleteChats);
    setDeleteTarget(null);
    setDeleteChats(false);
    await onDeleted();
  });
  const update = useAsyncAction(async () => {
    if (!editTarget) return;
    await updateChildProfile(editTarget.id, {
      displayName: editName,
      ageBand: editAgeBand,
      dailyTimeLimitMinutes: Number(editDailyLimit) || 30,
      avatarKey: editAvatarKey,
      gender: editGender
    });
    setEditTarget(null);
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
              <View style={styles.childActions}>
                <PikuButton label="Edit" onPress={() => openEdit(child)} variant="secondary" style={styles.childActionButton} />
                <PikuButton label="Delete" onPress={() => setDeleteTarget(child)} variant="ghost" style={styles.childActionButton} />
              </View>
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
      <Modal animationType="fade" transparent visible={editTarget !== null} onRequestClose={() => setEditTarget(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.cardTitle}>Edit child profile</Text>
            <PikuTextField label="Display name" value={editName} onChangeText={setEditName} />
            <AgeBandSelector value={editAgeBand} onChange={setEditAgeBand} />
            <GenderSelector value={editGender} onChange={setEditGender} />
            <PikuTextField label="Voice chat timer (minutes)" value={editDailyLimit} onChangeText={setEditDailyLimit} keyboardType="number-pad" />
            <AvatarSelector value={editAvatarKey} onChange={setEditAvatarKey} />
            {update.error ? <Text style={styles.error}>{update.error}</Text> : null}
            <View style={styles.modalActions}>
              <PikuButton label="Cancel" onPress={() => setEditTarget(null)} variant="secondary" />
              <PikuButton label="Save" onPress={() => void update.run()} loading={update.loading} />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function childProfileSummary(child: ChildProfile): string {
  const genderLabel = genderOptions.find((option) => option.key === child.gender)?.label ?? "I don't want to disclose";
  const profileStatus = `Gender: ${genderLabel}`;
  if (child.voice_enabled === false) return "Text only";
  return child.child_pin_enabled ? `${profileStatus} · Voice enabled · PIN protected` : `${profileStatus} · Voice enabled`;
}

export function AddChildScreen({ navigate, onCreated }: { navigate: Navigate; onCreated: () => Promise<void> }): React.JSX.Element {
  const [displayName, setDisplayName] = useState("");
  const [ageBand, setAgeBand] = useState<(typeof ageBandOptions)[number]>("6-8");
  const [dailyLimit, setDailyLimit] = useState("30");
  const [avatarKey, setAvatarKey] = useState("kid");
  const [gender, setGender] = useState<(typeof genderOptions)[number]["key"]>("not_disclosed");
  const create = useAsyncAction(async () => {
    await createChildProfile({ displayName, ageBand, dailyTimeLimitMinutes: Number(dailyLimit) || 30, avatarKey, gender, voiceEnabled: true });
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
      <AgeBandSelector value={ageBand} onChange={setAgeBand} />
      <GenderSelector value={gender} onChange={setGender} />
      <PikuTextField label="Voice chat timer (minutes)" value={dailyLimit} onChangeText={setDailyLimit} keyboardType="number-pad" />
      <AvatarSelector value={avatarKey} onChange={setAvatarKey} />
      <Text style={styles.childMeta}>Voice chat is enabled by default. The timer resets the next day after it runs out.</Text>
      {create.error ? <Text style={styles.error}>{create.error}</Text> : null}
      <PikuButton label="Save Child Profile" onPress={() => void create.run()} loading={create.loading} />
    </View>
  );
}

function GenderSelector({
  onChange,
  value
}: {
  onChange: (value: (typeof genderOptions)[number]["key"]) => void;
  value: (typeof genderOptions)[number]["key"];
}): React.JSX.Element {
  return (
    <View style={styles.selectorWrap}>
      <Text style={styles.fieldLabel}>Gender</Text>
      <View style={styles.genderOptions}>
        {genderOptions.map((option) => (
          <Pressable
            key={option.key}
            accessibilityRole="button"
            accessibilityState={{ selected: value === option.key }}
            onPress={() => onChange(option.key)}
            style={[styles.genderOption, value === option.key && styles.genderOptionActive]}
          >
            <Text style={[styles.genderOptionText, value === option.key && styles.genderOptionTextActive]}>{option.label}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

function AgeBandSelector({
  onChange,
  value
}: {
  onChange: (value: (typeof ageBandOptions)[number]) => void;
  value: (typeof ageBandOptions)[number];
}): React.JSX.Element {
  const [open, setOpen] = useState(false);
  return (
    <View style={styles.dropdownWrap}>
      <Text style={styles.fieldLabel}>Age band</Text>
      <Pressable accessibilityRole="button" onPress={() => setOpen((current) => !current)} style={styles.dropdownButton}>
        <Text style={styles.dropdownValue}>{value}</Text>
        <Text style={styles.dropdownChevron}>{open ? "^" : "v"}</Text>
      </Pressable>
      {open ? (
        <View style={styles.dropdownMenu}>
          {ageBandOptions.map((option) => (
            <Pressable
              key={option}
              accessibilityRole="button"
              accessibilityState={{ selected: value === option }}
              onPress={() => {
                onChange(option);
                setOpen(false);
              }}
              style={[styles.dropdownOption, value === option && styles.dropdownOptionActive]}
            >
              <Text style={[styles.dropdownOptionText, value === option && styles.dropdownOptionTextActive]}>{option}</Text>
            </Pressable>
          ))}
        </View>
      ) : null}
    </View>
  );
}

function AvatarSelector({ onChange, value }: { onChange: (value: string) => void; value: string }): React.JSX.Element {
  return (
    <View style={styles.avatarPicker}>
      <Text style={styles.fieldLabel}>Profile icon</Text>
      <View style={styles.avatarOptions}>
        {avatarOptions.map((option) => (
          <Pressable
            key={option.key}
            accessibilityRole="button"
            accessibilityState={{ selected: value === option.key }}
            onPress={() => onChange(option.key)}
            style={[styles.avatarOption, value === option.key && styles.avatarOptionActive]}
          >
            <Avatar avatarKey={option.key} name={option.key} size={32} />
          </Pressable>
        ))}
      </View>
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
  childActionButton: {
    minHeight: 40,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs
  },
  childActions: {
    gap: spacing.xs
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
  dropdownButton: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    minHeight: 52,
    paddingHorizontal: spacing.md
  },
  dropdownChevron: {
    ...typography.body,
    color: colors.brandPurple,
    fontWeight: "900"
  },
  dropdownMenu: {
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: 14,
    borderWidth: 1,
    overflow: "hidden"
  },
  dropdownOption: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm
  },
  dropdownOptionActive: {
    backgroundColor: colors.brandLilac
  },
  dropdownOptionText: {
    ...typography.body,
    color: colors.text
  },
  dropdownOptionTextActive: {
    color: colors.brandPurple,
    fontWeight: "900"
  },
  dropdownValue: {
    ...typography.body,
    color: colors.text,
    fontWeight: "800"
  },
  dropdownWrap: {
    gap: spacing.xs
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
  genderOption: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: 14,
    borderWidth: 1,
    minHeight: 44,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm
  },
  genderOptionActive: {
    backgroundColor: colors.brandLilac,
    borderColor: colors.brandPurple
  },
  genderOptionText: {
    ...typography.body,
    color: colors.text
  },
  genderOptionTextActive: {
    color: colors.brandPurple,
    fontWeight: "900"
  },
  genderOptions: {
    gap: spacing.xs
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
  selectorWrap: {
    gap: spacing.xs
  },
  wrap: {
    gap: spacing.md
  }
});
