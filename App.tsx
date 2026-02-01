import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, VotingProvider } from './src/context';
import { AppNavigator } from './src/navigation';

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <VotingProvider>
          <StatusBar style="light" />
          <AppNavigator />
        </VotingProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
