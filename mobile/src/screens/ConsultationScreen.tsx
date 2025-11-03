import React from 'react';
import {View} from 'react-native';
import {Text, Card} from 'react-native-paper';
import {placeholderScreenStyles} from '../styles/commonStyles';

export default function ConsultationScreen() {
  return (
    <View style={placeholderScreenStyles.container}>
      <Card style={placeholderScreenStyles.card}>
        <Card.Content>
          <Text variant="headlineMedium" style={placeholderScreenStyles.title}>
            📋 Consultation
          </Text>
          <Text variant="bodyLarge" style={placeholderScreenStyles.subtitle}>
            En cours de développement
          </Text>
          <Text variant="bodyMedium" style={placeholderScreenStyles.info}>
            Fonctionnalités à venir :
          </Text>
          <Text variant="bodySmall" style={placeholderScreenStyles.listItem}>
            • Liste des consultations
          </Text>
          <Text variant="bodySmall" style={placeholderScreenStyles.listItem}>
            • Création/édition de consultation
          </Text>
          <Text variant="bodySmall" style={placeholderScreenStyles.listItem}>
            • Synchronisation des données
          </Text>
        </Card.Content>
      </Card>
    </View>
  );
}
