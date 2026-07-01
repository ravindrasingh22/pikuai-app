import React, { useState } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../../app/navigation/routes';
import { ScreenShell } from '../../../../core/components/ScreenShell';
import { GhostBack } from '../../../../core/components/AppHeader';
import { Island, MiniCard } from '../../../../core/components/Cards';
import { AppText } from '../../../../core/components/AppText';
import { AppButton } from '../../../../core/components/AppButton';
import { useAppStore } from '../../../../app/state/AppStore';
import { colors } from '../../../../core/theme/colors';
import { spacing } from '../../../../core/theme/spacing';

type Props = NativeStackScreenProps<RootStackParamList, 'PaymentPlans'>;
type PlanId = 'monthly' | 'quarterly' | 'annual';
const plans = [
  { id: 'monthly' as PlanId, label: 'Monthly', price: '₹499', note: 'Flexible month to month', badge: 'Most picked' },
  { id: 'quarterly' as PlanId, label: 'Quarterly', price: '₹1,299', note: 'Save with 3 months', badge: 'Save 13%' },
  { id: 'annual' as PlanId, label: 'Annual', price: '₹4,499', note: 'Best value for the year', badge: 'Save 25%' }
];

export function PaymentPlansScreen({ navigation }: Props) {
  const { state, dispatch } = useAppStore();
  const [selected, setSelected] = useState<PlanId>(state.subscription.planId);
  const [modal, setModal] = useState(false);
  return (
    <ScreenShell>
      <GhostBack onPress={() => navigation.navigate('ParentDashboard')} />
      <View style={styles.body}>
        <AppText variant="label">Family subscription</AppText>
        <AppText variant="h2">Protected learning for your whole family</AppText>
        <AppText variant="small">Choose the duration that works best for your family. One plan supports up to four child profiles.</AppText>
        <View style={styles.plans}>{plans.map((plan) => <Pressable key={plan.id} onPress={() => setSelected(plan.id)} style={[styles.plan, selected === plan.id && styles.planActive]}><View><AppText variant="h3">{plan.label}</AppText><AppText variant="tiny">{plan.note}</AppText></View><View style={styles.price}><AppText variant="h3" style={styles.priceText}>{plan.price}</AppText><AppText variant="tiny" style={styles.badge}>{plan.badge}</AppText></View></Pressable>)}</View>
        <MiniCard style={styles.benefits}><View style={styles.benefitRow}><AppText variant="tiny">✓ 4 child profiles</AppText><AppText variant="tiny">✓ AI answer controls</AppText><AppText variant="tiny">✓ 24/7 learning</AppText></View><AppText variant="tiny">Secure prototype checkout. No backend payment gateway is connected.</AppText></MiniCard>
        <AppButton label="Review and Pay" onPress={() => setModal(true)} />
      </View>
      <Modal visible={modal} transparent animationType="fade"><View style={styles.modalBackdrop}><Island strong style={styles.checkout}><Pressable style={styles.close} onPress={() => setModal(false)}><AppText variant="h2">×</AppText></Pressable><AppText variant="label">Secure checkout</AppText><AppText variant="h2">Complete subscription</AppText><MiniCard><AppText variant="small">Pratvim Family {plans.find((p) => p.id === selected)?.label}</AppText><AppText variant="h2">{plans.find((p) => p.id === selected)?.price}</AppText></MiniCard><AppText variant="tiny">Payment method: UPI / Card placeholder. This is UI only.</AppText><AppButton label="Renew monthly subscription" onPress={() => { dispatch({ type: 'subscription/select', payload: selected }); setModal(false); navigation.navigate('PaymentConfirmation', { planId: selected }); }} /><AppButton variant="secondary" label="Back" onPress={() => setModal(false)} /></Island></View></Modal>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  body: { gap: spacing.md }, plans: { gap: spacing.sm }, plan: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderRadius: 24, padding: 16, backgroundColor: 'rgba(255,255,255,0.82)', borderWidth: 1, borderColor: colors.atlasLine }, planActive: { backgroundColor: '#eef9f7', borderColor: colors.teal }, price: { alignItems: 'flex-end', gap: 4 }, priceText: { color: colors.tealDeep }, badge: { backgroundColor: colors.tealSoft, color: colors.tealDark, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999 }, benefits: { gap: spacing.sm }, benefitRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }, modalBackdrop: { flex: 1, backgroundColor: colors.overlay, justifyContent: 'center', padding: 20 }, checkout: { gap: spacing.md }, close: { alignSelf: 'flex-end' }
});
