import React from 'react';
import {View, StyleSheet, Switch} from 'react-native';
import {Text, Card} from 'react-native-paper';

interface SyncSettingsProps {
  wifiOnly: boolean;
  onToggleWifiOnly: (value: boolean) => void;
  loading?: boolean;
}

/**
 * SyncSettings component manages synchronization preferences
 * Allows users to enable/disable WiFi-only sync
 */
export const SyncSettings: React.FC<SyncSettingsProps> = ({
  wifiOnly,
  onToggleWifiOnly,
  loading = false,
}) => {
  return (
    <View style={styles.container}>
      <Text variant="labelSmall" style={styles.sectionTitle}>
        PARAMÈTRES DE SYNCHRONISATION
      </Text>
      <Card style={styles.card}>
        <Card.Content style={styles.cardContent}>
          <View style={styles.settingRow}>
            <View style={styles.settingContent}>
              <Text variant="bodyLarge" style={styles.settingTitle}>
                Synchroniser en Wi-Fi uniquement
              </Text>
              <Text variant="bodySmall" style={styles.settingDescription}>
                Économise les données mobiles
              </Text>
            </View>
            <Switch
              value={wifiOnly}
              onValueChange={onToggleWifiOnly}
              disabled={loading}
              trackColor={{false: '#E0E0E0', true: '#90CAF9'}}
              thumbColor={wifiOnly ? '#2196F3' : '#F5F5F5'}
              ios_backgroundColor="#E0E0E0"
              accessibilityLabel="Activer/désactiver la synchronisation Wi-Fi uniquement"
              accessibilityRole="switch"
              accessibilityState={{checked: wifiOnly}}
            />
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
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    minHeight: 60,
  },
  settingContent: {
    flex: 1,
    marginRight: 16,
  },
  settingTitle: {
    color: '#212121',
    fontWeight: '500',
    marginBottom: 4,
  },
  settingDescription: {
    color: '#757575',
  },
});
