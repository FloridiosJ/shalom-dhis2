import React from 'react';
import {View, StyleSheet, TouchableOpacity} from 'react-native';
import {Text, Card, Button} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {SyncError} from '../types/sync';

interface SyncErrorListProps {
  errors: SyncError[];
  onRetry: (errorId: string) => void;
  onRetryAll: () => void;
}

/**
 * Displays a list of sync errors with individual retry buttons
 * and a "Retry All" action
 */
export default function SyncErrorList({
  errors,
  onRetry,
  onRetryAll,
}: SyncErrorListProps) {
  if (errors.length === 0) {
    return null;
  }

  return (
    <View
      style={styles.container}
      accessible={true}
      accessibilityRole="list"
      accessibilityLabel={`Liste des erreurs: ${errors.length} erreur${errors.length > 1 ? 's' : ''}`}>
      {/* Header with title and retry all button */}
      <View style={styles.header}>
        <Text variant="titleMedium" style={styles.title}>
          Erreurs
        </Text>
        <TouchableOpacity
          onPress={onRetryAll}
          style={styles.retryAllButton}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Tout réessayer"
          accessibilityHint="Réessayer toutes les erreurs de synchronisation">
          <Text style={styles.retryAllText}>Tout réessayer</Text>
          <Icon name="refresh" size={18} color="#2196F3" style={styles.retryAllIcon} />
        </TouchableOpacity>
      </View>

      {/* Error cards */}
      {errors.map(error => (
        <Card
          key={error.id}
          style={styles.errorCard}
          accessible={true}
          accessibilityRole="listitem"
          accessibilityLabel={`Erreur: ${error.title}, ${error.description}`}>
          <Card.Content style={styles.errorContent}>
            <View style={styles.errorHeader}>
              <View style={styles.errorIconContainer}>
                <Icon name="alert-circle" size={24} color="#F44336" />
              </View>
              <View style={styles.errorTextContainer}>
                <Text variant="bodyLarge" style={styles.errorTitle}>
                  {error.title}
                </Text>
                <Text variant="bodySmall" style={styles.errorDescription}>
                  {error.description}
                </Text>
              </View>
            </View>
            {error.retryable && (
              <Button
                mode="text"
                onPress={() => onRetry(error.id)}
                icon="refresh"
                style={styles.retryButton}
                labelStyle={styles.retryButtonLabel}
                accessibilityRole="button"
                accessibilityLabel={`Réessayer ${error.title}`}
                accessibilityHint="Réessayer cette synchronisation">
                Réessayer
              </Button>
            )}
          </Card.Content>
        </Card>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  title: {
    color: '#212121',
    fontWeight: 'bold',
  },
  retryAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    minHeight: 44, // Accessibility: minimum touch target
  },
  retryAllText: {
    color: '#2196F3',
    fontSize: 14,
    fontWeight: '600',
    marginRight: 4,
  },
  retryAllIcon: {
    marginLeft: 4,
  },
  errorCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: '#F44336',
  },
  errorContent: {
    padding: 16,
  },
  errorHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  errorIconContainer: {
    marginRight: 12,
    marginTop: 2,
  },
  errorTextContainer: {
    flex: 1,
  },
  errorTitle: {
    color: '#212121',
    fontWeight: '600',
    marginBottom: 4,
  },
  errorDescription: {
    color: '#757575',
  },
  retryButton: {
    alignSelf: 'flex-end',
    minHeight: 44, // Accessibility: minimum touch target
  },
  retryButtonLabel: {
    fontSize: 14,
  },
});
