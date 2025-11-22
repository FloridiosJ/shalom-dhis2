/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, {useEffect, useState} from 'react';
import {View, ActivityIndicator, StyleSheet} from 'react-native';
import {PaperProvider} from 'react-native-paper';
import {ApolloProvider} from '@apollo/client/react';
import {apolloClient} from './src/services/apollo';
import {isAuthenticated, logout} from './src/services/auth';
import LoginScreen from './src/screens/LoginScreen';
import MainNavigator from './src/navigation/MainNavigator';
import {NetworkProvider} from './src/contexts/NetworkContext';
import {useAutoSync} from './src/hooks/useAutoSync';

/**
 * Main app component with auto-sync enabled
 */
function AppWithSync({onLogout}: {onLogout: () => void}) {
  // Enable automatic synchronization on network reconnection
  useAutoSync();

  return <MainNavigator onLogout={onLogout} />;
}

export default function App() {
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const auth = await isAuthenticated();
      setAuthenticated(auth);
    } catch (error) {
      console.error('Auth check error:', error);
      setAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSuccess = () => {
    setAuthenticated(true);
  };

  const handleLogout = async () => {
    try {
      await logout();
      setAuthenticated(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6200ee" />
      </View>
    );
  }

  return (
    <ApolloProvider client={apolloClient}>
      <NetworkProvider>
        <PaperProvider>
          {authenticated ? (
            <AppWithSync onLogout={handleLogout} />
          ) : (
            <LoginScreen onLoginSuccess={handleLoginSuccess} />
          )}
        </PaperProvider>
      </NetworkProvider>
    </ApolloProvider>
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
