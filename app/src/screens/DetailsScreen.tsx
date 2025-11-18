import React from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { Text, Button, Card, List } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import { NavigationProp } from '@react-navigation/native';

interface DetailsScreenProps {
  navigation: NavigationProp<any>;
}

export default function DetailsScreen({ navigation }: DetailsScreenProps) {
  return (
    <ScrollView style={styles.container}>
      <StatusBar style="auto" />
      
      <View style={styles.content}>
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="headlineMedium" style={styles.title}>
              Écran de détails
            </Text>
            <Text variant="bodyLarge" style={styles.subtitle}>
              Exemple d'écran secondaire
            </Text>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.cardTitle}>
              Fonctionnalités disponibles
            </Text>
            
            <List.Item
              title="Navigation"
              description="Navigation entre écrans avec React Navigation"
              left={props => <List.Icon {...props} icon="navigation" />}
              style={styles.listItem}
            />
            
            <List.Item
              title="Géolocalisation"
              description="Accès à la position GPS via expo-location"
              left={props => <List.Icon {...props} icon="map-marker" />}
              style={styles.listItem}
            />
            
            <List.Item
              title="Notifications"
              description="Notifications locales et push avec expo-notifications"
              left={props => <List.Icon {...props} icon="bell" />}
              style={styles.listItem}
            />
            
            <List.Item
              title="Images"
              description="Sélection d'images avec expo-image-picker"
              left={props => <List.Icon {...props} icon="image" />}
              style={styles.listItem}
            />
            
            <List.Item
              title="Stockage sécurisé"
              description="Données sensibles avec expo-secure-store"
              left={props => <List.Icon {...props} icon="lock" />}
              style={styles.listItem}
            />
            
            <List.Item
              title="Apollo Client"
              description="Requêtes GraphQL avec @apollo/client"
              left={props => <List.Icon {...props} icon="graphql" />}
              style={styles.listItem}
            />
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.cardTitle}>
              Informations
            </Text>
            <Text variant="bodyMedium" style={styles.info}>
              Cette application est construite avec:
            </Text>
            <Text variant="bodyMedium" style={styles.info}>
              • Expo SDK 54
            </Text>
            <Text variant="bodyMedium" style={styles.info}>
              • React Native 0.81
            </Text>
            <Text variant="bodyMedium" style={styles.info}>
              • TypeScript 5.9
            </Text>
            <Text variant="bodyMedium" style={styles.info}>
              • React Native Paper pour l'UI
            </Text>
          </Card.Content>
        </Card>

        <Button
          mode="contained"
          onPress={() => navigation.goBack()}
          style={styles.button}
          icon="arrow-left"
        >
          Retour à l'accueil
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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
  cardTitle: {
    fontWeight: 'bold',
    marginBottom: 12,
  },
  listItem: {
    paddingVertical: 8,
  },
  info: {
    marginVertical: 4,
    color: '#666',
  },
  button: {
    marginBottom: 32,
  },
});
