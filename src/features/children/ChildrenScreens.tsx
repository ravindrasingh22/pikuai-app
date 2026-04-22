import React, { useState } from "react";
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { createChildProfile } from "../../api/mobileApi";
import { Avatar } from "../../components/common/Avatar";
import { PikuButton } from "../../components/common/PikuButton";
import { PikuCard } from "../../components/common/PikuCard";
import { PikuTextField } from "../../components/common/PikuTextField";
import { useAsyncAction } from "../../hooks/useAsyncAction";
import { colors, spacing, typography } from "../../theme/tokens";
import type { ChildProfile } from "../../types/domain";
import type { Navigate } from "../../navigation/types";

export function ChildrenListScreen({ childrenProfiles, navigate }: { childrenProfiles: ChildProfile[]; navigate: Navigate }): React.JSX.Element {
  const { width } = useWindowDimensions();
  const isPhone = width < 430;
  return (
    <View style={styles.wrap}>
      <Text style={styles.intro}>Manage your kids' profiles and settings.</Text>
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
                <Avatar name={child.display_name} size={isPhone ? 70 : 58} />
                <View style={styles.childCopy}>
                  <View style={styles.nameRow}>
                    <Text style={styles.childName}>{child.display_name}{index === 0 ? " ★" : ""}</Text>
                    <Text style={[styles.ageBadge, tone === "green" ? styles.greenBadge : tone === "purple" ? styles.purpleBadge : styles.blueBadge]}>Age {child.age_band}</Text>
                  </View>
                  <Text style={styles.childMeta}>{childProfileSummary(child, index)}</Text>
                </View>
                {isPhone ? (
                  <Text style={[styles.chevron, tone === "green" ? styles.greenChevron : tone === "purple" ? styles.purpleChevron : styles.blueChevron]}>›</Text>
                ) : (
                  <PikuButton label="Chat" onPress={() => navigate(child.child_pin_enabled ? "childPin" : "childChat", { child })} variant="ghost" />
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

function childProfileSummary(child: ChildProfile, index: number): string {
  if (index === 0) return "Curious explorer";
  if (index === 1) return "Loves dinosaurs";
  if (index === 2) return "Science enthusiast";
  if (!child.voice_enabled) return "Text only";
  return child.child_pin_enabled ? "PIN protected" : "Ready to chat";
}

export function AddChildScreen({ navigate, onCreated }: { navigate: Navigate; onCreated: () => Promise<void> }): React.JSX.Element {
  const [displayName, setDisplayName] = useState("");
  const [ageBand, setAgeBand] = useState("8-10");
  const [dailyLimit, setDailyLimit] = useState("30");
  const create = useAsyncAction(async () => {
    await createChildProfile({ displayName, ageBand, dailyTimeLimitMinutes: Number(dailyLimit) || 30 });
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
                <Avatar name={child.display_name} size={isPhone ? 70 : 58} />
                <View style={styles.childCopy}>
                  <View style={styles.nameRow}>
                    <Text style={styles.childName}>{child.display_name}{index === 0 ? " ★" : ""}</Text>
                    <Text style={[styles.ageBadge, tone === "green" ? styles.greenBadge : tone === "purple" ? styles.purpleBadge : styles.blueBadge]}>Age {child.age_band}</Text>
                  </View>
                  <Text style={styles.childMeta}>{childProfileSummary(child, index)}</Text>
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
