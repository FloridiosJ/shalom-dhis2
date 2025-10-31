import React from 'react';
import {View, StyleSheet} from 'react-native';
import {Text, Button} from 'react-native-paper';
import {logout} from '../services/auth';

interface HomeScreenProps {
  onLogout: () => void;
}

export default function HomeScreen({onLogout}: HomeScreenProps) {
  const handleLogout = async () => {
    try {
      await logout();
      onLogout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text variant="headlineMedium" style={styles.title}>
          🎉 React Native Mobile
        </Text>
        <Text variant="bodyLarge" style={styles.subtitle}>
          Configuration réussie !
        </Text>
        <Text variant="bodyMedium" style={styles.info}>
          Shalom DHIS2
        </Text>
        <Button
          mode="contained"
          onPress={handleLogout}
          style={styles.button}
          icon="logout">
          Se déconnecter
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    marginBottom: 20,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  subtitle: {
    color: '#666',
    marginBottom: 10,
  },
  info: {
    color: '#999',
    marginBottom: 30,
  },
  button: {
    marginTop: 20,
  },
});
