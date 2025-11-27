import React, {useState, useEffect, useCallback} from 'react';
import {
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
  View,
  TouchableOpacity,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Text, Snackbar} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {getUser} from '../services/auth';
import {useSyncPreference} from '../hooks/useSyncPreference';
import {
  ProfileForm,
  SyncSettings,
  AboutApp,
  LogoutButton,
} from '../components/settings';
import type {User} from '../types';

// Read version from package.json
const APP_VERSION = '0.0.1';

interface ProfileFormData {
  nom: string;
  prenom: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface SettingsScreenProps {
  onLogout: () => void;
  navigation?: {
    goBack: () => void;
  };
}

export default function SettingsScreen({
  onLogout,
  navigation,
}: SettingsScreenProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarType, setSnackbarType] = useState<'success' | 'error'>(
    'success',
  );
  const {wifiOnly, setWifiOnly, loading: syncLoading} = useSyncPreference();

  const showSnackbar = useCallback((message: string, type: 'success' | 'error') => {
    setSnackbarMessage(message);
    setSnackbarType(type);
    setSnackbarVisible(true);
  }, []);

  const loadUserData = useCallback(async () => {
    try {
      const userData = await getUser();
      setUser(userData);
    } catch (error) {
      console.error('Error loading user data:', error);
      showSnackbar('Erreur lors du chargement des données', 'error');
    } finally {
      setLoading(false);
    }
  }, [showSnackbar]);

  useEffect(() => {
    loadUserData();
  }, [loadUserData]);

  const handleProfileSubmit = useCallback(
    async (data: ProfileFormData) => {
      setSaving(true);
      try {
        // TODO: Implement API call to update profile
        // For now, simulate a save operation
        await new Promise<void>(resolve => setTimeout(resolve, 1000));

        // Show success message
        showSnackbar('Modifications enregistrées avec succès', 'success');

        // Update local user data if name changed
        if (user && (data.nom !== user.nom || data.prenom !== user.prenom)) {
          setUser({...user, nom: data.nom, prenom: data.prenom});
        }
      } catch (error) {
        console.error('Error saving profile:', error);
        showSnackbar('Erreur lors de l\'enregistrement', 'error');
      } finally {
        setSaving(false);
      }
    },
    [user, showSnackbar],
  );

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
      await onLogout();
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert(
        'Erreur',
        'Une erreur est survenue lors de la déconnexion. Veuillez réessayer.',
      );
    } finally {
      setLoggingOut(false);
    }
  };

  const handleToggleWifiOnly = async (value: boolean) => {
    await setWifiOnly(value);
  };

  const handleGoBack = useCallback(() => {
    if (navigation?.goBack) {
      navigation.goBack();
    }
  }, [navigation]);

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer} edges={['bottom']}>
        <ActivityIndicator size="large" color="#2196F3" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleGoBack}
          accessibilityLabel="Retour"
          accessibilityRole="button">
          <Icon name="arrow-left" size={24} color="#212121" />
        </TouchableOpacity>
        <Text variant="titleLarge" style={styles.headerTitle}>
          Profil utilisateur
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        {/* Profile Form */}
        <ProfileForm user={user} onSubmit={handleProfileSubmit} loading={saving} />

        {/* Sync Settings */}
        <SyncSettings
          wifiOnly={wifiOnly}
          onToggleWifiOnly={handleToggleWifiOnly}
          loading={syncLoading}
        />

        {/* About Section */}
        <AboutApp version={APP_VERSION} />

        {/* Logout Button */}
        <LogoutButton onPress={handleLogout} loading={loggingOut} />
      </ScrollView>

      {/* Snackbar for feedback */}
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        style={[
          styles.snackbar,
          snackbarType === 'error' ? styles.snackbarError : styles.snackbarSuccess,
        ]}
        action={{
          label: 'OK',
          onPress: () => setSnackbarVisible(false),
        }}>
        {snackbarMessage}
      </Snackbar>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F5F7FA',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#212121',
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 44,
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
    backgroundColor: '#F5F7FA',
  },
  snackbar: {
    marginBottom: 16,
    marginHorizontal: 16,
    borderRadius: 8,
  },
  snackbarSuccess: {
    backgroundColor: '#4CAF50',
  },
  snackbarError: {
    backgroundColor: '#D32F2F',
  },
});
