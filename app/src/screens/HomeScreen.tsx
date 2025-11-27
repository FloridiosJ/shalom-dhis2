import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, Alert } from 'react-native';
import { Text, Button, Card, ActivityIndicator, FAB } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import * as Location from 'expo-location';
import { NavigationProp } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';

interface HomeScreenProps {
  navigation: NavigationProp<any>;
}

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const { user, logout } = useAuth();
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [loading, setLoading] = useState(false);

  const getLocation = async () => {
    try {
      setLoading(true);
      
      // Request permission
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Permission refusée',
          'La permission de géolocalisation est nécessaire pour cette fonctionnalité.'
        );
        setLoading(false);
        return;
      }

      // Get current location
      const currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation);
      
      Alert.alert(
        'Position obtenue',
        `Latitude: ${currentLocation.coords.latitude.toFixed(6)}\nLongitude: ${currentLocation.coords.longitude.toFixed(6)}`
      );
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de récupérer la position');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
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
          onPress: async () => {
            try {
              await logout();
            } catch (error) {
              Alert.alert('Erreur', 'Impossible de se déconnecter');
              console.error(error);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.wrapper}>
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        <StatusBar style="auto" />
        
        <View style={styles.content}>
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="headlineMedium" style={styles.title}>
                Bonjour {user?.fullName || user?.prenom || 'Utilisateur'}! 👋
              </Text>
              <Text variant="bodyLarge" style={styles.subtitle}>
                Bienvenue dans l'application Expo
              </Text>
              {user?.dispensaire && (
                <Text variant="bodyMedium" style={styles.dispensaireText}>
                  📍 {user.dispensaire.name}
                </Text>
              )}
            </Card.Content>
          </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.cardTitle}>
              Géolocalisation
            </Text>
            <Text variant="bodyMedium" style={styles.description}>
              Testez la fonctionnalité de géolocalisation native
            </Text>
            
            {location && (
              <View style={styles.locationInfo}>
                <Text variant="bodyMedium">
                  📍 Latitude: {location.coords.latitude.toFixed(6)}
                </Text>
                <Text variant="bodyMedium">
                  📍 Longitude: {location.coords.longitude.toFixed(6)}
                </Text>
                <Text variant="bodySmall" style={styles.accuracy}>
                  Précision: ±{location.coords.accuracy?.toFixed(0)}m
                </Text>
              </View>
            )}
            
            <Button
              mode="contained"
              onPress={getLocation}
              loading={loading}
              disabled={loading}
              style={styles.button}
              icon="map-marker"
            >
              {loading ? 'Chargement...' : 'Obtenir ma position'}
            </Button>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.cardTitle}>
              Patients
            </Text>
            <Text variant="bodyMedium" style={styles.description}>
              Gérez les patients du dispensaire
            </Text>
            
            <Button
              mode="contained"
              onPress={() => navigation.navigate('NouveauPatient')}
              style={styles.button}
              icon="account-plus"
              buttonColor="#4CAF50"
            >
              Nouveau Patient
            </Button>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.cardTitle}>
              Navigation
            </Text>
            <Text variant="bodyMedium" style={styles.description}>
              Explorez l'application
            </Text>
            
            <Button
              mode="contained"
              onPress={() => navigation.navigate('Details')}
              style={styles.button}
              icon="arrow-right"
            >
              Aller à l'écran de détails
            </Button>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.cardTitle}>
              Compte
            </Text>
            <Text variant="bodyMedium" style={styles.description}>
              Gérez votre session
            </Text>
            
            <Button
              mode="outlined"
              onPress={handleLogout}
              style={styles.button}
              icon="logout"
              buttonColor="#fff"
              textColor="#c62828"
            >
              Se déconnecter
            </Button>
          </Card.Content>
        </Card>
      </View>
    </ScrollView>
    
    {/* FAB for navigating to patient list */}
    <FAB
      style={styles.fab}
      icon="plus"
      onPress={() => navigation.navigate('PatientList')}
      accessibilityLabel="Liste des patients"
    />
  </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 80, // Space for FAB
  },
  content: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
    elevation: 2,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    color: '#666',
  },
  dispensaireText: {
    color: '#6200ee',
    marginTop: 8,
    fontWeight: '600',
  },
  cardTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  description: {
    color: '#666',
    marginBottom: 16,
  },
  locationInfo: {
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  accuracy: {
    color: '#999',
    marginTop: 4,
  },
  button: {
    marginTop: 8,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#2196F3',
  },
});
