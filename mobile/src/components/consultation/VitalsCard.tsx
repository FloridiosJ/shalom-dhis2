import React, {memo} from 'react';
import {View, StyleSheet, AccessibilityRole} from 'react-native';
import {Text, Card} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {VitalSigns} from '../../types';

interface VitalsCardProps {
  vitalSigns?: VitalSigns;
}

interface VitalItemProps {
  icon: string;
  label: string;
  value: string;
  unit: string;
  iconColor: string;
}

/**
 * VitalItem - Individual vital sign display
 */
const VitalItem = memo(({icon, label, value, unit, iconColor}: VitalItemProps) => (
  <View
    style={styles.vitalItem}
    accessibilityRole={'text' as AccessibilityRole}
    accessibilityLabel={`${label}: ${value} ${unit}`}>
    <View style={styles.vitalHeader}>
      <Icon name={icon} size={20} color={iconColor} style={styles.vitalIcon} />
      <Text variant="bodySmall" style={styles.vitalLabel}>
        {label}
      </Text>
    </View>
    <Text variant="headlineSmall" style={styles.vitalValue}>
      {value}
    </Text>
    <Text variant="bodySmall" style={styles.vitalUnit}>
      {unit}
    </Text>
  </View>
));

VitalItem.displayName = 'VitalItem';

/**
 * VitalsCard - Displays patient vital signs in a reusable card format
 * Shows weight, temperature, blood pressure, and pulse
 */
const VitalsCard = memo(({vitalSigns}: VitalsCardProps) => {
  // Handle empty or missing vital signs
  if (!vitalSigns) {
    return (
      <Card style={styles.card} accessibilityRole={'region' as AccessibilityRole}>
        <Card.Content>
          <View style={styles.header}>
            <Icon name="heart-pulse" size={24} color="#2196F3" />
            <Text variant="titleLarge" style={styles.title}>
              Signes vitaux
            </Text>
          </View>
          <View style={styles.emptyContainer}>
            <Icon name="alert-circle-outline" size={48} color="#BDBDBD" />
            <Text variant="bodyMedium" style={styles.emptyText}>
              Aucun signe vital enregistré
            </Text>
          </View>
        </Card.Content>
      </Card>
    );
  }

  const {
    weight,
    temperature,
    bloodPressureSystolic,
    bloodPressureDiastolic,
    pulse,
  } = vitalSigns;

  return (
    <Card style={styles.card} accessibilityRole={'region' as AccessibilityRole}>
      <Card.Content>
        <View style={styles.header}>
          <Icon name="heart-pulse" size={24} color="#2196F3" />
          <Text variant="titleLarge" style={styles.title}>
            Signes vitaux
          </Text>
        </View>

        <View style={styles.vitalsGrid}>
          {/* Weight */}
          {weight !== undefined && (
            <VitalItem
              icon="weight-kilogram"
              label="Poids"
              value={weight.toString()}
              unit="kg"
              iconColor="#4CAF50"
            />
          )}

          {/* Temperature */}
          {temperature !== undefined && (
            <VitalItem
              icon="thermometer"
              label="Température"
              value={temperature.toFixed(1)}
              unit="°C"
              iconColor="#FF9800"
            />
          )}

          {/* Blood Pressure */}
          {bloodPressureSystolic !== undefined &&
            bloodPressureDiastolic !== undefined && (
              <VitalItem
                icon="heart-pulse"
                label="Pression artérielle"
                value={`${bloodPressureSystolic}/${bloodPressureDiastolic}`}
                unit=""
                iconColor="#F44336"
              />
            )}

          {/* Pulse */}
          {pulse !== undefined && (
            <VitalItem
              icon="heart"
              label="Pouls"
              value={pulse.toString()}
              unit="bpm"
              iconColor="#E91E63"
            />
          )}
        </View>
      </Card.Content>
    </Card>
  );
});

VitalsCard.displayName = 'VitalsCard';

export default VitalsCard;

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    marginLeft: 8,
    fontWeight: '600',
    color: '#212121',
  },
  vitalsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  vitalItem: {
    width: '48%',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    minHeight: 100,
  },
  vitalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  vitalIcon: {
    marginRight: 6,
  },
  vitalLabel: {
    color: '#757575',
    fontWeight: '500',
  },
  vitalValue: {
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 4,
  },
  vitalUnit: {
    color: '#9E9E9E',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
  },
  emptyText: {
    marginTop: 12,
    color: '#9E9E9E',
    textAlign: 'center',
  },
});
