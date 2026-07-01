import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { AppText } from './AppText';
import { colors } from '../theme/colors';
import { radius } from '../theme/spacing';

type Item = { key: string; label: string; icon?: string };

export function SegmentedTabs({ items, value, onChange }: { items: Item[]; value: string; onChange: (key: string) => void }) {
  return (
    <View style={styles.wrap}>
      {items.map((item) => {
        const active = item.key === value;
        return (
          <Pressable key={item.key} onPress={() => onChange(item.key)} style={[styles.tab, active && styles.active]}>
            <AppText variant="tiny" style={[styles.text, active && styles.activeText]}>{item.icon ? `${item.icon} ` : ''}{item.label}</AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.78)', borderRadius: radius.pill, padding: 4, borderWidth: 1, borderColor: colors.atlasLine, gap: 4 },
  tab: { flex: 1, minHeight: 34, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 8 },
  active: { backgroundColor: colors.teal },
  text: { color: colors.tealDark },
  activeText: { color: colors.white }
});
