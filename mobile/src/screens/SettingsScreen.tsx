import React from 'react';
import {View} from 'react-native';
import {Text, Card} from 'react-native-paper';
import {placeholderScreenStyles} from '../styles/commonStyles';

export default function SettingsScreen() {
  return (
    <View style={placeholderScreenStyles.container}>
      <Card style={placeholderScreenStyles.card}>
        <Card.Content>
          <Text variant="headlineMedium" style={placeholderScreenStyles.title}>
            ⚙️ Settings
          </Text>
          <Text variant="bodyLarge" style={placeholderScreenStyles.subtitle}>
            En cours de développement
          </Text>
          <Text variant="bodyMedium" style={placeholderScreenStyles.info}>
            Fonctionnalités à venir :
          </Text>
          <Text variant="bodySmall" style={placeholderScreenStyles.listItem}>
            • Paramètres de l'application
          </Text>
          <Text variant="bodySmall" style={placeholderScreenStyles.listItem}>
            • Préférences utilisateur
          </Text>
          <Text variant="bodySmall" style={placeholderScreenStyles.listItem}>
            • Configuration de synchronisation
          </Text>
        </Card.Content>
      </Card>
    </View>
  );
}
