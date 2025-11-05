import React, {useState, useEffect} from 'react';
import {ScrollView, StyleSheet, Alert, ActivityIndicator} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {getUser, logout} from '../services/auth';
import {useSyncPreference} from '../hooks/useSyncPreference';
import {
  ProfileCard,
  SyncSettings,
  AboutApp,
  LogoutButton,
} from '../components/settings';
import type {User} from '../types';

const APP_VERSION = '0.0.1'; // Version from package.json (TODO: make dynamic)

export default function SettingsScreen() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const {wifiOnly, setWifiOnly, loading: syncLoading} = useSyncPreference();

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const userData = await getUser();
      setUser(userData);
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        {
          text: 'Annuler',
          style: 'cancel',
        },
        {
          text: 'Déconnexion',
          style: 'destructive',
          onPress: performLogout,
        },
      ],
      {cancelable: true},
    );
  };

  const performLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
      // Navigation will be handled by App.tsx when auth state changes
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert(
        'Erreur',
        'Une erreur est survenue lors de la déconnexion. Veuillez réessayer.',
      );
      setLoggingOut(false);
    }
  };

  const handleToggleWifiOnly = async (value: boolean) => {
    await setWifiOnly(value);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer} edges={['bottom']}>
        <ActivityIndicator size="large" color="#2196F3" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}>
        <ProfileCard user={user} />

        <SyncSettings
          wifiOnly={wifiOnly}
          onToggleWifiOnly={handleToggleWifiOnly}
          loading={syncLoading}
        />

        <AboutApp version={APP_VERSION} />

        <LogoutButton onPress={handleLogout} loading={loggingOut} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
});
