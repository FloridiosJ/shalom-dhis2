import React from 'react';
import {View, StyleSheet} from 'react-native';
import {Text, ProgressBar} from 'react-native-paper';
import {SyncProgress} from '../types/sync';

interface SyncProgressBarProps {
  progress: SyncProgress;
}

/**
 * Displays sync progress with a progress bar and text indicator
 * Shows "Envoi des données X/Y..."
 */
export default function SyncProgressBar({progress}: SyncProgressBarProps) {
  const progressValue = progress.total > 0 ? progress.current / progress.total : 0;

  return (
    <View
      style={styles.container}
      accessible={true}
      accessibilityRole="progressbar"
      accessibilityLabel={`Envoi des données ${progress.current} sur ${progress.total}`}
      accessibilityValue={{
        min: 0,
        max: progress.total,
        now: progress.current,
      }}>
      <Text variant="bodyMedium" style={styles.label}>
        Envoi des données ({progress.current}/{progress.total})...
      </Text>
      <ProgressBar
        progress={progressValue}
        color="#2196F3"
        style={styles.progressBar}
      />
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
  label: {
    color: '#212121',
    marginBottom: 12,
    fontWeight: '500',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E0E0E0',
  },
});
