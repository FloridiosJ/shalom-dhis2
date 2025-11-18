import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../context/AuthContext';
import HomeScreen from '../screens/HomeScreen';
import DetailsScreen from '../screens/DetailsScreen';
import LoginScreen from '../screens/LoginScreen';

export type AuthStackParamList = {
  Login: undefined;
};

export type MainStackParamList = {
  Home: undefined;
  Details: undefined;
};

export type RootStackParamList = AuthStackParamList & MainStackParamList;

const Stack = createStackNavigator<RootStackParamList>();

export default function Navigation() {
  const { isAuthenticated, isLoading } = useAuth();

  // Show loading screen while checking authentication
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6200ee" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: '#6200ee',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        {!isAuthenticated ? (
          // Auth Stack - Login Screen
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{
              headerShown: false,
            }}
          />
        ) : (
          // Main Stack - Authenticated Screens
          <>
            <Stack.Screen
              name="Home"
              component={HomeScreen}
              options={{
                title: 'Accueil',
              }}
            />
            <Stack.Screen
              name="Details"
              component={DetailsScreen}
              options={{
                title: 'Détails',
              }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
});
