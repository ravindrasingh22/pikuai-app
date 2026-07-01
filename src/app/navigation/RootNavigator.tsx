import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './routes';
import { useAppStore } from '../state/AppStore';
import { SplashScreen } from '../../features/auth/presentation/screens/SplashScreen';
import { ParentRegisterScreen } from '../../features/auth/presentation/screens/ParentRegisterScreen';
import { ParentEmailConfirmScreen } from '../../features/auth/presentation/screens/ParentEmailConfirmScreen';
import { ParentDetailsScreen } from '../../features/auth/presentation/screens/ParentDetailsScreen';
import { ParentFullLoginScreen } from '../../features/auth/presentation/screens/ParentFullLoginScreen';
import { LoginScreen } from '../../features/auth/presentation/screens/LoginScreen';
import { ParentOnboardingScreen } from '../../features/onboarding/presentation/screens/ParentOnboardingScreen';
import { KidOnboardingScreen } from '../../features/onboarding/presentation/screens/KidOnboardingScreen';
import { KidRegisterScreen } from '../../features/parent/presentation/screens/KidRegisterScreen';
import { ParentDashboardScreen } from '../../features/parent/presentation/screens/ParentDashboardScreen';
import { ParentAnalyticsScreen } from '../../features/parent/presentation/screens/ParentAnalyticsScreen';
import { ParentAlertsScreen } from '../../features/parent/presentation/screens/ParentAlertsScreen';
import { ParentAlertScreen } from '../../features/parent/presentation/screens/ParentAlertScreen';
import { AvatarLibraryScreen } from '../../features/parent/presentation/screens/AvatarLibraryScreen';
import { PaymentPlansScreen } from '../../features/payments/presentation/screens/PaymentPlansScreen';
import { PaymentConfirmationScreen } from '../../features/payments/presentation/screens/PaymentConfirmationScreen';
import { HomeScreen } from '../../features/kid/presentation/screens/HomeScreen';
import { ChatScreen } from '../../features/chat/presentation/screens/ChatScreen';
import { TimerDemoScreen } from '../../features/chat/presentation/screens/TimerDemoScreen';
import { InfoScreen } from '../../features/info/presentation/screens/InfoScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

const animation = 'slide_from_right' as const;

export function RootNavigator() {
  const { state } = useAppStore();
  const initialRouteName = initialRouteForNextStep(state.auth.nextStep);

  return (
    <Stack.Navigator initialRouteName={initialRouteName} screenOptions={{ headerShown: false, animation, contentStyle: { backgroundColor: '#fffdf8' } }}>
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="ParentRegister" component={ParentRegisterScreen} />
      <Stack.Screen name="ParentEmailConfirm" component={ParentEmailConfirmScreen} />
      <Stack.Screen name="ParentDetails" component={ParentDetailsScreen} />
      <Stack.Screen name="ParentOnboarding" component={ParentOnboardingScreen} />
      <Stack.Screen name="KidRegister" component={KidRegisterScreen} />
      <Stack.Screen name="ParentDashboard" component={ParentDashboardScreen} />
      <Stack.Screen name="ParentAnalytics" component={ParentAnalyticsScreen} />
      <Stack.Screen name="AvatarLibrary" component={AvatarLibraryScreen} />
      <Stack.Screen name="PaymentPlans" component={PaymentPlansScreen} />
      <Stack.Screen name="PaymentConfirmation" component={PaymentConfirmationScreen} />
      <Stack.Screen name="ParentAlerts" component={ParentAlertsScreen} />
      <Stack.Screen name="ParentAlert" component={ParentAlertScreen} />
      <Stack.Screen name="Login" component={LoginScreen} initialParams={{ mode: state.auth.nextStep === 'dashboard' ? 'parent' : undefined }} />
      <Stack.Screen name="ParentFullLogin" component={ParentFullLoginScreen} />
      <Stack.Screen name="KidOnboarding" component={KidOnboardingScreen} />
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Chat" component={ChatScreen} />
      <Stack.Screen name="TimerDemo" component={TimerDemoScreen} />
      <Stack.Screen name="About" component={InfoScreen} />
      <Stack.Screen name="Privacy" component={InfoScreen} />
      <Stack.Screen name="Terms" component={InfoScreen} />
      <Stack.Screen name="Team" component={InfoScreen} />
      <Stack.Screen name="Contact" component={InfoScreen} />
      <Stack.Screen name="Support" component={InfoScreen} />
    </Stack.Navigator>
  );
}

function initialRouteForNextStep(nextStep?: string): keyof RootStackParamList {
  switch (nextStep) {
    case 'confirm_email':
      return 'ParentEmailConfirm';
    case 'parent_details':
      return 'ParentDetails';
    case 'parent_onboarding':
    case 'setup_parent_pin':
      return 'ParentOnboarding';
    case 'dashboard':
      return 'Login';
    default:
      return 'Splash';
  }
}
