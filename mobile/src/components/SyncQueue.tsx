import React from 'react';
import {View, StyleSheet} from 'react-native';
import {Text} from 'react-native-paper';
import {SyncQueueStats} from '../types/sync';

interface SyncQueueProps {
  stats: SyncQueueStats;
}

/**
 * Displays sync queue statistics:
 * - Number of pending items
 * - Number of errors
 */
export default function SyncQueue({stats}: SyncQueueProps) {
  return (
    <View
      style={styles.container}
      accessible={true}
      accessibilityRole="summary"
      accessibilityLabel={`Queue d'envoi: ${stats.pendingCount} éléments en attente, ${stats.errorCount} erreurs`}>
      <Text variant="titleMedium" style={styles.title}>
        Queue d'envoi
      </Text>
      
      <View style={styles.statsRow}>
        <Text variant="bodyMedium" style={styles.statLabel}>
          Éléments en attente
        </Text>
        <Text
          variant="bodyLarge"
          style={[styles.statValue, styles.pendingValue]}
          accessibilityLabel={`${stats.pendingCount} éléments en attente`}>
          {stats.pendingCount}
        </Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.statsRow}>
        <Text variant="bodyMedium" style={styles.statLabel}>
          Erreur(s) de synchronisation
        </Text>
        <Text
          variant="bodyLarge"
          style={[styles.statValue, styles.errorValue]}
          accessibilityLabel={`${stats.errorCount} erreurs de synchronisation`}>
          {stats.errorCount}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },
  title: {
    color: '#212121',
    fontWeight: 'bold',
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  statLabel: {
    color: '#757575',
    flex: 1,
  },
  statValue: {
    fontWeight: 'bold',
    minWidth: 32,
    textAlign: 'right',
  },
  pendingValue: {
    color: '#212121',
  },
  errorValue: {
    color: '#F44336',
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 8,
  },
});
