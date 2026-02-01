import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context';
import {
  LoginScreen,
  HomeScreen,
  VotingScreen,
  CandidatesScreen,
  ResultsScreen,
  AdminScreen,
  ProfileScreen,
} from '../screens';
import { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: '#1a472a',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        {!isAuthenticated ? (
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ headerShown: false }}
          />
        ) : (
          <>
            <Stack.Screen
              name="Home"
              component={HomeScreen}
              options={{
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="Voting"
              component={VotingScreen}
              options={{
                title: 'ভোট দিন',
                headerBackTitle: 'Back',
              }}
            />
            <Stack.Screen
              name="Candidates"
              component={CandidatesScreen}
              options={{
                title: 'প্রার্থী তালিকা',
                headerBackTitle: 'Back',
              }}
            />
            <Stack.Screen
              name="Results"
              component={ResultsScreen}
              options={{
                title: 'নির্বাচনী ফলাফল',
                headerBackTitle: 'Back',
              }}
            />
            <Stack.Screen
              name="Admin"
              component={AdminScreen}
              options={{
                title: 'অ্যাডমিন প্যানেল',
                headerBackTitle: 'Back',
                headerStyle: {
                  backgroundColor: '#9C27B0',
                },
              }}
            />
            <Stack.Screen
              name="Profile"
              component={ProfileScreen}
              options={{
                title: 'প্রোফাইল সেটিংস',
                headerBackTitle: 'Back',
              }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
