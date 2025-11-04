import React from 'react';
import {View} from 'react-native';
import {Text, Card} from 'react-native-paper';
import {placeholderScreenStyles} from '../styles/commonStyles';

export default function SyncScreen() {
  return (
    <View style={placeholderScreenStyles.container}>
      <Card style={placeholderScreenStyles.card}>
        <Card.Content>
          <Text variant="headlineMedium" style={placeholderScreenStyles.title}>
            🔄 Sync/Statut
          </Text>
          <Text variant="bodyLarge" style={placeholderScreenStyles.subtitle}>
            En cours de développement
          </Text>
          <Text variant="bodyMedium" style={placeholderScreenStyles.info}>
            Fonctionnalités à venir :
          </Text>
          <Text variant="bodySmall" style={placeholderScreenStyles.listItem}>
            • Synchronisation des données
          </Text>
          <Text variant="bodySmall" style={placeholderScreenStyles.listItem}>
            • Statut de synchronisation
          </Text>
          <Text variant="bodySmall" style={placeholderScreenStyles.listItem}>
            • Gestion des conflits
          </Text>
        </Card.Content>
      </Card>
    </View>
  );
}
