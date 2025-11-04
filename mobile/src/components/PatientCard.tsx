import React from 'react';
import {View, TouchableOpacity, StyleSheet, AccessibilityRole} from 'react-native';
import {Text, Card} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {Patient} from '../types';

interface PatientCardProps {
  patient: Patient;
  onPress: () => void;
}

/**
 * PatientCard component displays individual patient information in a card format
 * Optimized for FlatList usage with minimal re-renders
 */
export default function PatientCard({patient, onPress}: PatientCardProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={styles.touchable}
      accessibilityRole={'button' as AccessibilityRole}
      accessibilityLabel={`Voir les détails de ${patient.displayName}`}
      accessibilityHint="Double-tap pour ouvrir la fiche patient">
      <Card style={styles.card} elevation={1}>
        <Card.Content style={styles.content}>
          <View style={styles.mainInfo}>
            <View style={styles.headerRow}>
              <Text variant="titleMedium" style={styles.name} numberOfLines={1}>
                {patient.displayName}
              </Text>
              <Icon name="chevron-right" size={24} color="#757575" />
            </View>

            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <Icon name="cake-variant" size={16} color="#757575" />
                <Text variant="bodyMedium" style={styles.infoText}>
                  {patient.age} ans
                </Text>
              </View>

              <View style={styles.infoItem}>
                <Icon
                  name={patient.sexe === 'M' ? 'gender-male' : 'gender-female'}
                  size={16}
                  color={patient.sexe === 'M' ? '#2196F3' : '#E91E63'}
                />
                <Text variant="bodyMedium" style={styles.infoText}>
                  {patient.sexe === 'M' ? 'Masculin' : 'Féminin'}
                </Text>
              </View>
            </View>

            <View style={styles.badgeContainer}>
              <View style={styles.badge}>
                <Icon name="hospital-building" size={14} color="#4CAF50" />
                <Text variant="bodySmall" style={styles.badgeText}>
                  {patient.village}
                </Text>
              </View>
            </View>
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  touchable: {
    marginHorizontal: 16,
    marginVertical: 6,
    minHeight: 44, // Minimum touch target size
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
  },
  content: {
    padding: 12,
  },
  mainInfo: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  name: {
    fontWeight: 'bold',
    color: '#212121',
    flex: 1,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    flexWrap: 'wrap',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginVertical: 2,
  },
  infoText: {
    marginLeft: 6,
    color: '#616161',
  },
  badgeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginTop: 4,
  },
  badgeText: {
    marginLeft: 4,
    color: '#2E7D32',
    fontWeight: '500',
  },
});
