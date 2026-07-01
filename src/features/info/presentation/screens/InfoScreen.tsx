import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { RootStackParamList } from '../../../../app/navigation/routes';
import { ScreenShell } from '../../../../core/components/ScreenShell';
import { GhostBack, UnifiedHeader } from '../../../../core/components/AppHeader';
import { Island, MiniCard } from '../../../../core/components/Cards';
import { AppText } from '../../../../core/components/AppText';
import { AppInput } from '../../../../core/components/AppInput';
import { AppButton } from '../../../../core/components/AppButton';
import { Images } from '../../../../core/assets/assets';
import { spacing } from '../../../../core/theme/spacing';
import { colors } from '../../../../core/theme/colors';

type Props = { navigation: any; route: { name: string } };

type PageKey = 'about' | 'privacy' | 'terms' | 'team' | 'contact' | 'support';

const pageByRoute: Record<string, PageKey> = { About: 'about', Privacy: 'privacy', Terms: 'terms', Team: 'team', Contact: 'contact', Support: 'support' };

const copy: Record<PageKey, { label: string; title: string; paragraphs: string[] }> = {
  about: { label: 'About Pratvim', title: 'Curiosity with thoughtful boundaries', paragraphs: ['Pratvim is a protected AI learning space created for children and the adults who care for them.', 'Kids can ask questions in simple language while parents manage profiles, access, screen-time habits, and safety activity.', 'Pratvim supports learning, not unsupervised decision-making. Parents remain in control of child access and can review activity whenever needed.'] },
  privacy: { label: 'Privacy policy', title: 'Family privacy comes first', paragraphs: ['Pratvim collects only the account and profile information needed to operate the family experience.', 'Child profiles are managed by the parent account. Private PINs are used only for local prototype access in this build.', 'Conversation data shown here is static demo data. Backend storage has intentionally not been integrated.'] },
  terms: { label: 'Terms & conditions', title: 'Use Pratvim with adult guidance', paragraphs: ['Pratvim is designed as a learning companion for children under parent supervision.', 'Parents are responsible for creating profiles, reviewing activity, and setting family rules for screen time.', 'The current mobile build is a frontend prototype and does not process payments or connect to production APIs.'] },
  team: { label: 'Team', title: 'Built for safer learning', paragraphs: ['Ravindra Singh — Product and engineering leader focused on safe AI systems for young learners.', 'Prateek Sharma — Brings rich strategic experience in user experience and product mindset.', 'Shashank Merothiya — Supports product execution and thoughtful digital experiences.'] },
  contact: { label: 'Contact', title: 'Talk to Pratvim', paragraphs: ['For partnerships, schools, and parent feedback, use the support form inside the app prototype.', 'This screen is intentionally static until the backend contact workflow is connected.'] },
  support: { label: 'Help & support', title: 'How can we help?', paragraphs: ['Use this page to model the support flow for account questions, child profile updates, safety concerns, or billing questions.', 'No support ticket is sent in this frontend-only build.'] }
};

export function InfoScreen({ navigation, route }: Props) {
  const page = pageByRoute[route.name] ?? 'about';
  const data = copy[page];
  return (
    <ScreenShell>
      <View style={styles.header}><GhostBack onPress={() => navigation.goBack()} /><UnifiedHeader mode="parent" onKid={() => navigation.navigate('Login', { mode: 'kid' })} /></View>
      <Island strong style={styles.page}>
        <AppText variant="label">{data.label}</AppText>
        <AppText variant="h1">{data.title}</AppText>
        {data.paragraphs.map((paragraph) => <AppText key={paragraph} variant="body">{paragraph}</AppText>)}
        {page === 'team' ? <View style={styles.teamGrid}><TeamCard image={Images.teamRavindra} name="Ravindra Singh" role="Engineering & safe AI" /><TeamCard image={Images.teamPrateek} name="Prateek Sharma" role="UX & product strategy" /><TeamCard image={Images.teamShashank} name="Shashank Merothiya" role="Product execution" /></View> : null}
        {page === 'support' || page === 'contact' ? <View style={styles.form}><AppInput label="Parent email" value="parent@example.com" /><AppInput label="Message" value="I need help with Pratvim." multiline style={styles.message} /><AppButton label="Submit request" /></View> : null}
      </Island>
    </ScreenShell>
  );
}

function TeamCard({ image, name, role }: { image: number; name: string; role: string }) {
  return <MiniCard style={styles.teamCard}><Image source={image} style={styles.teamImage} /><View style={styles.teamCopy}><AppText variant="h3">{name}</AppText><AppText variant="small">{role}</AppText></View></MiniCard>;
}

const styles = StyleSheet.create({
  header: { marginBottom: spacing.sm },
  page: { gap: spacing.md },
  teamGrid: { gap: spacing.sm },
  teamCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  teamImage: { width: 64, height: 64, borderRadius: 32, backgroundColor: colors.atlasLine },
  teamCopy: { flex: 1 },
  form: { gap: spacing.md },
  message: { minHeight: 88, borderRadius: 20, textAlignVertical: 'top', paddingTop: 14 }
});
