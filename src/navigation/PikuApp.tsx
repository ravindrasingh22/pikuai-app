import React, { useCallback, useEffect, useMemo, useState } from "react";
import { BackHandler, StyleSheet, Text, View } from "react-native";
import { loadBootstrap, type BootstrapSnapshot } from "../api/mobileApi";
import { AppScaffold } from "../components/layout/AppScaffold";
import { EmptyState, LoadingState } from "../components/common/StatusViews";
import { LoginScreen, ParentPinGateScreen, ParentPinSetupScreen, RegisterScreen } from "../features/auth/AuthScreens";
import { ChildChatScreen, ChildPinScreen } from "../features/childChat/ChildChatScreen";
import { AddChildScreen, ChildPickerScreen, ChildrenListScreen } from "../features/children/ChildrenScreens";
import { WelcomeScreen } from "../features/onboarding/WelcomeScreen";
import { ParentDashboardScreen } from "../features/parentDashboard/ParentDashboardScreen";
import { ReportsScreen, TranscriptsScreen } from "../features/reports/ReportsScreens";
import { SafetyScreen } from "../features/safety/SafetyScreen";
import { SettingsScreen } from "../features/settings/SettingsScreen";
import { VoiceChatScreen } from "../features/voiceChat/VoiceChatScreen";
import { sampleChildren, sampleControls, sampleOverview, sampleParent, sampleReports, sampleTranscripts } from "../services/sampleData";
import { colors, spacing, typography } from "../theme/tokens";
import type { ChildProfile } from "../types/domain";
import type { AppRoute, Navigate, NavigationParams } from "./types";

const authRoutes = new Set<AppRoute>(["welcome", "login", "register", "parentPinSetup"]);
const childFullScreenRoutes = new Set<AppRoute>(["childChat", "voiceChat", "childPin"]);
const parentProtectedRoutes = new Set<AppRoute>(["dashboard", "children", "addChild", "safety", "familyControls", "reports", "transcripts", "settings"]);
const authorizedDefaultRoute: AppRoute = "dashboard";

export function PikuApp(): React.JSX.Element {
  const [route, setRoute] = useState<AppRoute>("welcome");
  const [history, setHistory] = useState<AppRoute[]>([]);
  const [parentAreaLocked, setParentAreaLocked] = useState(false);
  const [pendingParentRoute, setPendingParentRoute] = useState<AppRoute>("dashboard");
  const [pinGateReturnRoute, setPinGateReturnRoute] = useState<AppRoute>("childPicker");
  const [selectedChild, setSelectedChild] = useState<ChildProfile | null>(null);
  const [snapshot, setSnapshot] = useState<BootstrapSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setSnapshot(await loadBootstrap());
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not load backend data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const data = useMemo(() => ({
    parent: snapshot?.profile ?? sampleParent,
    children: snapshot?.children.length ? snapshot.children : sampleChildren,
    overview: snapshot?.overview ?? sampleOverview,
    controls: snapshot?.controls ?? sampleControls,
    transcripts: snapshot?.transcripts.length ? snapshot.transcripts : sampleTranscripts,
    reports: snapshot?.reports ?? sampleReports
  }), [snapshot]);

  const navigate: Navigate = useCallback((nextRoute, params) => {
    if (nextRoute === route && !params?.resetHistory && !params?.child) return;
    if (params?.child) setSelectedChild(params.child);
    if (childFullScreenRoutes.has(nextRoute)) {
      setParentAreaLocked(true);
    }
    if (params?.resetHistory) {
      if (parentProtectedRoutes.has(nextRoute)) {
        setParentAreaLocked(false);
      }
      setHistory([]);
      setRoute(nextRoute);
      return;
    }
    if (parentAreaLocked && parentProtectedRoutes.has(nextRoute)) {
      setPendingParentRoute(nextRoute);
      setPinGateReturnRoute(route);
      setHistory((current) => [...current, route]);
      setRoute("parentPinGate");
      return;
    }
    setHistory((current) => (current[current.length - 1] === route ? current : [...current, route]));
    setRoute(nextRoute);
  }, [parentAreaLocked, route]);

  const goBack = useCallback(() => {
    setHistory((current) => {
      const nextHistory = [...current];
      let previousRoute = nextHistory.pop();
      while (previousRoute && authRoutes.has(previousRoute)) {
        previousRoute = nextHistory.pop();
      }
      if (!previousRoute) return current;
      if (parentAreaLocked && parentProtectedRoutes.has(previousRoute)) {
        setPendingParentRoute(previousRoute);
        setPinGateReturnRoute(route);
        setRoute("parentPinGate");
        return nextHistory;
      }
      setRoute(previousRoute);
      return nextHistory;
    });
  }, [parentAreaLocked, route]);

  useEffect(() => {
    const subscription = BackHandler.addEventListener("hardwareBackPress", () => {
      if (route === "parentPinGate") {
        navigate(pinGateReturnRoute, { resetHistory: true });
        return true;
      }
      if (route !== authorizedDefaultRoute && history.some((historyRoute) => !authRoutes.has(historyRoute))) {
        goBack();
        return true;
      }
      return false;
    });
    return () => subscription.remove();
  }, [goBack, history, navigate, pinGateReturnRoute, route]);

  if (loading && !snapshot) {
    return <LoadingState />;
  }

  if (error && !snapshot) {
    return (
      <View style={styles.errorScreen}>
        <EmptyState title="Backend unavailable" body="PikuAI is showing local sample data so the mobile app can still be reviewed." actionLabel="Continue" onAction={() => setError(null)} />
      </View>
    );
  }

  const child = selectedChild ?? data.children[0];
  const showChrome = !authRoutes.has(route) && !childFullScreenRoutes.has(route);

  const canGoBack = history.some((historyRoute) => !authRoutes.has(historyRoute));

  if (route === "welcome") return <WelcomeScreen navigate={navigate} />;
  if (route === "login") return <LoginScreen canGoBack={canGoBack} navigate={navigate} onAuthenticated={refresh} onBack={goBack} />;
  if (route === "register") return <RegisterScreen canGoBack={canGoBack} navigate={navigate} onBack={goBack} />;
  if (route === "parentPinSetup") return <ParentPinSetupScreen canGoBack={canGoBack} navigate={navigate} onAuthenticated={refresh} onBack={goBack} />;
  if (route === "parentPinGate") return <ParentPinGateScreen navigate={navigate} onBack={() => navigate(pinGateReturnRoute, { resetHistory: true })} targetRoute={pendingParentRoute} />;
  if (route === "childChat" && child) return <ChildChatScreen canGoBack={canGoBack} child={child} navigate={navigate} onBack={goBack} />;
  if (route === "voiceChat" && child) return <VoiceChatScreen canGoBack={canGoBack} child={child} navigate={navigate} onBack={goBack} />;
  if (route === "childPin" && child) return <ChildPinScreen canGoBack={canGoBack} child={child} navigate={navigate} onBack={goBack} />;

  return (
    <AppScaffold
      activeRoute={route}
      canGoBack={route !== authorizedDefaultRoute && canGoBack}
      navigate={navigate}
      onBack={goBack}
      scroll
      showParentChrome={showChrome}
      subtitle={subtitleForRoute(route)}
      title={titleForRoute(route, data.parent.full_name)}
    >
      {renderRoute(route, navigate, data, refresh)}
      {error ? <Text style={styles.softError}>Using sample data: {error}</Text> : null}
    </AppScaffold>
  );
}

function renderRoute(
  route: AppRoute,
  navigate: Navigate,
  data: {
    parent: BootstrapSnapshot["profile"] extends infer T ? NonNullable<T> : never;
    children: ChildProfile[];
    overview: NonNullable<BootstrapSnapshot["overview"]>;
    controls: NonNullable<BootstrapSnapshot["controls"]>;
    transcripts: BootstrapSnapshot["transcripts"];
    reports: NonNullable<BootstrapSnapshot["reports"]>;
  },
  refresh: () => Promise<void>
): React.ReactNode {
  switch (route) {
    case "familyControls":
    case "safety":
      return <SafetyScreen controls={data.controls} onUpdated={refresh} />;
    case "dashboard":
      return <ParentDashboardScreen parent={data.parent} overview={data.overview} controls={data.controls} childrenProfiles={data.children} navigate={navigate} />;
    case "children":
      return <ChildrenListScreen childrenProfiles={data.children} navigate={navigate} />;
    case "addChild":
      return <AddChildScreen navigate={navigate} onCreated={refresh} />;
    case "childPicker":
      return <ChildPickerScreen childrenProfiles={data.children} navigate={navigate} />;
    case "reports":
      return <ReportsScreen reports={data.reports} />;
    case "transcripts":
      return <TranscriptsScreen transcripts={data.transcripts} childrenProfiles={data.children} />;
    case "settings":
      return <SettingsScreen parent={data.parent} childrenProfiles={data.children} navigate={navigate} />;
    case "parentPinGate":
      return <EmptyState title="Parent PIN required" body="Sensitive parent sections should call the Parent PIN verification endpoint before opening details." />;
    default:
      return <ParentDashboardScreen parent={data.parent} overview={data.overview} controls={data.controls} childrenProfiles={data.children} navigate={navigate} />;
  }
}

function titleForRoute(route: AppRoute, parentName: string): string {
  switch (route) {
    case "dashboard":
      return `Welcome back, ${parentName}`;
    case "children":
      return "Children";
    case "addChild":
      return "Add Child";
    case "childPicker":
      return "Children";
    case "safety":
    case "familyControls":
      return "Permissions / Safety";
    case "reports":
      return "Activity / Reports";
    case "transcripts":
      return "Chats";
    case "settings":
      return "Profile";
    default:
      return "PikuAI";
  }
}

function subtitleForRoute(route: AppRoute): string | undefined {
  if (route === "dashboard") return "Parent dashboard";
  if (route === "childPicker") return "Choose a profile to start chat";
  return undefined;
}

const styles = StyleSheet.create({
  errorScreen: {
    backgroundColor: colors.screen,
    flex: 1,
    justifyContent: "center",
    padding: spacing.lg
  },
  softError: {
    ...typography.small,
    color: colors.textMuted,
    marginTop: spacing.md,
    textAlign: "center"
  }
});
