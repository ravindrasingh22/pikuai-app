import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import { AppStoreProvider, useAppStore } from './state/AppStore';
import { RootNavigator } from './navigation/RootNavigator';

export function AppRoot() {
  const [fontsLoaded] = useFonts({
    'Nunito Sans': require('../../assets/fonts/NunitoSans-Variable.ttf')
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AppStoreProvider>
        <AppShell />
      </AppStoreProvider>
    </GestureHandlerRootView>
  );
}

function AppShell() {
  const { hydrated } = useAppStore();

  if (!hydrated) {
    return null;
  }

  return (
    <NavigationContainer>
      <StatusBar style="dark" backgroundColor="#fffdf8" />
      <RootNavigator />
    </NavigationContainer>
  );
}
