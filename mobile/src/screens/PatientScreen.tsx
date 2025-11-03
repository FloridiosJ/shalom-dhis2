import React from 'react';
import {View} from 'react-native';
import {Text, Card} from 'react-native-paper';
import {placeholderScreenStyles} from '../styles/commonStyles';

export default function PatientScreen() {
  return (
    <View style={placeholderScreenStyles.container}>
      <Card style={placeholderScreenStyles.card}>
        <Card.Content>
          <Text variant="headlineMedium" style={placeholderScreenStyles.title}>
            👤 Patient
          </Text>
          <Text variant="bodyLarge" style={placeholderScreenStyles.subtitle}>
            En cours de développement
          </Text>
          <Text variant="bodyMedium" style={placeholderScreenStyles.info}>
            Fonctionnalités à venir :
          </Text>
          <Text variant="bodySmall" style={placeholderScreenStyles.listItem}>
            • Fiche patient
          </Text>
          <Text variant="bodySmall" style={placeholderScreenStyles.listItem}>
            • Recherche de patient
          </Text>
          <Text variant="bodySmall" style={placeholderScreenStyles.listItem}>
            • Création/édition de patient
          </Text>
          <Text variant="bodySmall" style={placeholderScreenStyles.listItem}>
            • Patients du dispensaire uniquement
          </Text>
        </Card.Content>
      </Card>
    </View>
  );
}
