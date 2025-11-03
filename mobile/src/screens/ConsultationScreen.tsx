import React from 'react';
import {View, StyleSheet} from 'react-native';
import {Text, Card} from 'react-native-paper';

export default function ConsultationScreen() {
  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="headlineMedium" style={styles.title}>
            📋 Consultation
          </Text>
          <Text variant="bodyLarge" style={styles.subtitle}>
            En cours de développement
          </Text>
          <Text variant="bodyMedium" style={styles.info}>
            Fonctionnalités à venir :
          </Text>
          <Text variant="bodySmall" style={styles.listItem}>
            • Liste des consultations
          </Text>
          <Text variant="bodySmall" style={styles.listItem}>
            • Création/édition de consultation
          </Text>
          <Text variant="bodySmall" style={styles.listItem}>
            • Synchronisation des données
          </Text>
        </Card.Content>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
    justifyContent: 'center',
  },
  card: {
    padding: 16,
  },
  title: {
    marginBottom: 16,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  subtitle: {
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  info: {
    marginBottom: 12,
    fontWeight: '600',
  },
  listItem: {
    color: '#666',
    marginLeft: 8,
    marginBottom: 4,
  },
});
