import React, { useState } from "react";
import { Image, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { pikuImages } from "../../assets/brand";
import { loginParent, registerParent, setupParentPin, verifyParentPin } from "../../api/mobileApi";
import { PikuButton } from "../../components/common/PikuButton";
import { PikuCard } from "../../components/common/PikuCard";
import { PikuTextField } from "../../components/common/PikuTextField";
import { useAsyncAction } from "../../hooks/useAsyncAction";
import { colors, spacing, typography } from "../../theme/tokens";
import type { Navigate } from "../../navigation/types";

type BackProps = {
  canGoBack?: boolean;
  onBack?: () => void;
};

export function LoginScreen({
  canGoBack,
  navigate,
  onAuthenticated,
  onBack
}: BackProps & { navigate: Navigate; onAuthenticated: () => Promise<void> }): React.JSX.Element {
  const [email, setEmail] = useState("r2@ravin.co");
  const [password, setPassword] = useState("password123");
  const login = useAsyncAction(async () => {
    const result = await loginParent(email, password);
    if (result.two_factor_required) {
      throw new Error("This account requires 2FA. Use r2@ravin.co locally until 2FA verification is wired in the app.");
    }
    await onAuthenticated();
    navigate(result.pin_enabled === false || result.next_step === "setup_parent_pin" ? "parentPinSetup" : "dashboard", { resetHistory: true });
  });

  return (
    <AuthFrame canGoBack={canGoBack} navigate={navigate} onBack={onBack} title="Welcome back" subtitle="Sign in as the parent to manage profiles, safety, reports and settings.">
      <PikuTextField label="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
      <PikuTextField label="Password" value={password} onChangeText={setPassword} secureTextEntry />
      {login.error ? <Text style={styles.error}>{login.error}</Text> : null}
      <PikuButton label="Sign In" onPress={() => void login.run()} loading={login.loading} />
      <PikuButton label="Create Parent Account" onPress={() => navigate("register")} variant="ghost" />
    </AuthFrame>
  );
}

export function RegisterScreen({ canGoBack, navigate, onBack }: BackProps & { navigate: Navigate }): React.JSX.Element {
  const [fullName, setFullName] = useState("Priya Sharma");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const register = useAsyncAction(async () => {
    await registerParent({ fullName, email, mobile, password, country: "IN", preferredLanguage: "en" });
    await loginParent(email, password);
    navigate("parentPinSetup");
  });

  return (
    <AuthFrame canGoBack={canGoBack} navigate={navigate} onBack={onBack} title="Parent setup" subtitle="Create the family workspace before children use PikuAI.">
      <PikuTextField label="Full name" value={fullName} onChangeText={setFullName} />
      <PikuTextField label="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
      <PikuTextField label="Mobile number" value={mobile} onChangeText={setMobile} keyboardType="phone-pad" />
      <PikuTextField label="Password" value={password} onChangeText={setPassword} secureTextEntry />
      <PikuCard tone="green">
        <Text style={styles.note}>By continuing, the parent accepts child-safe AI controls, transcript visibility rules and privacy-first storage.</Text>
      </PikuCard>
      {register.error ? <Text style={styles.error}>{register.error}</Text> : null}
      <PikuButton label="Continue" onPress={() => void register.run()} loading={register.loading} />
      <PikuButton label="Back to Sign In" onPress={() => navigate("login")} variant="ghost" />
    </AuthFrame>
  );
}

export function ParentPinSetupScreen({
  canGoBack,
  navigate,
  onAuthenticated,
  onBack
}: BackProps & { navigate: Navigate; onAuthenticated: () => Promise<void> }): React.JSX.Element {
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const save = useAsyncAction(async () => {
    if (!/^\d{4}$/.test(pin) || pin !== confirmPin) {
      throw new Error("Use a matching 4 digit parent PIN.");
    }
    await setupParentPin(pin);
    await onAuthenticated();
    navigate("dashboard", { resetHistory: true });
  });

  return (
    <AuthFrame canGoBack={canGoBack} navigate={navigate} onBack={onBack} title="Set Parent PIN" subtitle="This PIN protects safety controls, reports, transcripts and billing on shared devices.">
      <PikuTextField label="Parent PIN" value={pin} onChangeText={setPin} keyboardType="number-pad" secureTextEntry maxLength={4} />
      <PikuTextField label="Confirm PIN" value={confirmPin} onChangeText={setConfirmPin} keyboardType="number-pad" secureTextEntry maxLength={4} />
      {save.error ? <Text style={styles.error}>{save.error}</Text> : null}
      <PikuButton label="Save PIN" onPress={() => void save.run()} loading={save.loading} />
    </AuthFrame>
  );
}

export function ParentPinGateScreen({
  navigate,
  onBack,
  targetRoute
}: {
  navigate: Navigate;
  onBack?: () => void;
  targetRoute: Parameters<Navigate>[0];
}): React.JSX.Element {
  const [pin, setPin] = useState("");
  const verify = useAsyncAction(async () => {
    if (!/^\d{4}$/.test(pin)) {
      throw new Error("Enter your 4 digit parent PIN.");
    }
    await verifyParentPin(pin);
    navigate(targetRoute, { resetHistory: true });
  });

  return (
    <AuthFrame canGoBack={Boolean(onBack)} navigate={navigate} onBack={onBack} title="Parent PIN" subtitle="Enter your PIN to return to the parent dashboard and protected controls.">
      <PikuTextField label="Parent PIN" value={pin} onChangeText={setPin} keyboardType="number-pad" secureTextEntry maxLength={4} />
      {verify.error ? <Text style={styles.error}>{verify.error}</Text> : null}
      <PikuButton label="Unlock Parent Area" onPress={() => void verify.run()} loading={verify.loading} />
    </AuthFrame>
  );
}

function AuthFrame({
  canGoBack,
  navigate,
  onBack,
  title,
  subtitle,
  children
}: BackProps & { navigate: Navigate; title: string; subtitle: string; children: React.ReactNode }): React.JSX.Element {
  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.frame}>
      <View style={styles.inner}>
        {canGoBack && onBack ? (
          <Pressable accessibilityLabel="Go back" accessibilityRole="button" onPress={onBack} style={styles.backButton}>
            <Text style={styles.backIcon}>‹</Text>
          </Pressable>
        ) : null}
        <Pressable accessibilityLabel="Go to welcome" accessibilityRole="button" onPress={() => navigate("welcome", { resetHistory: true })} style={styles.brandRow}>
          <Image source={pikuImages.icon} style={styles.brandIcon} resizeMode="contain" />
          <Text style={styles.brandText}>PikuAI</Text>
        </Pressable>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
        <View style={styles.form}>{children}</View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  backButton: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: 999,
    borderWidth: 1,
    height: 44,
    justifyContent: "center",
    marginBottom: spacing.md,
    width: 44
  },
  backIcon: {
    color: colors.text,
    fontSize: 34,
    fontWeight: "900",
    lineHeight: 36,
    marginTop: -2
  },
  brandIcon: {
    borderRadius: 12,
    height: 44,
    width: 44
  },
  brandRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.md
  },
  brandText: {
    color: colors.brandPurple,
    fontSize: 24,
    fontWeight: "900"
  },
  error: {
    ...typography.small,
    color: colors.danger,
    marginBottom: spacing.sm
  },
  form: {
    gap: spacing.xs
  },
  frame: {
    backgroundColor: colors.screen,
    flex: 1,
    justifyContent: "center",
    padding: spacing.lg
  },
  inner: {
    alignSelf: "center",
    maxWidth: 520,
    width: "100%"
  },
  note: {
    ...typography.small,
    color: colors.textSoft
  },
  subtitle: {
    ...typography.body,
    color: colors.textSoft,
    marginBottom: spacing.lg
  },
  title: {
    ...typography.hero,
    color: colors.text,
    marginBottom: spacing.xs
  }
});
