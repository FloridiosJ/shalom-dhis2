import React from 'react';
import {View, StyleSheet} from 'react-native';
import {Text, Card} from 'react-native-paper';

interface AboutAppProps {
  version: string;
}

/**
 * AboutApp component displays application information
 * Shows app version (read-only)
 */
export const AboutApp: React.FC<AboutAppProps> = ({version}) => {
  return (
    <View style={styles.container}>
      <Text variant="labelSmall" style={styles.sectionTitle}>
        À PROPOS
      </Text>
      <Card style={styles.card}>
        <Card.Content style={styles.cardContent}>
          <View style={styles.infoRow}>
            <Text variant="bodyLarge" style={styles.infoLabel}>
              Version de l'application
            </Text>
            <Text variant="bodyLarge" style={styles.infoValue}>
              {version}
            </Text>
          </View>
        </Card.Content>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: '#9E9E9E',
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 8,
    marginLeft: 4,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  cardContent: {
    paddingVertical: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    minHeight: 60,
  },
  infoLabel: {
    color: '#212121',
    fontWeight: '400',
  },
  infoValue: {
    color: '#757575',
    fontWeight: '500',
  },
});
