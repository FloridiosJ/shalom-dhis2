import React from 'react';
import {View, StyleSheet, TouchableOpacity, AccessibilityRole} from 'react-native';
import {Text} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {Consultation} from '../types';

interface ConsultationHistoryProps {
  consultations: Consultation[];
  onConsultationPress?: (consultation: Consultation) => void;
}

/**
 * ConsultationHistory component displays a chronological list of patient consultations
 * Shows date and type/diagnostic for each consultation
 */
export default function ConsultationHistory({
  consultations,
  onConsultationPress,
}: ConsultationHistoryProps) {
  if (!consultations || consultations.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Icon name="clipboard-text-outline" size={48} color="#BDBDBD" />
        <Text variant="bodyMedium" style={styles.emptyText}>
          Aucune consultation enregistrée
        </Text>
      </View>
    );
  }

  // Sort consultations by date (most recent first)
  const sortedConsultations = [...consultations].sort(
    (a, b) =>
      new Date(b.dateConsultation).getTime() -
      new Date(a.dateConsultation).getTime(),
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <View style={styles.container}>
      {sortedConsultations.map((consultation, index) => (
        <TouchableOpacity
          key={consultation.id}
          style={[
            styles.consultationItem,
            index < sortedConsultations.length - 1 && styles.consultationItemBorder,
          ]}
          onPress={() => onConsultationPress?.(consultation)}
          disabled={!onConsultationPress}
          accessibilityRole={
            onConsultationPress ? ('button' as AccessibilityRole) : undefined
          }
          accessibilityLabel={`Consultation du ${formatDate(
            consultation.dateConsultation,
          )}`}>
          <View style={styles.consultationContent}>
            <View style={styles.dateContainer}>
              <Text variant="titleSmall" style={styles.date}>
                {formatDate(consultation.dateConsultation)}
              </Text>
              <Text variant="bodyMedium" style={styles.diagnostic}>
                {consultation.typeConsultation || consultation.diagnostic}
              </Text>
            </View>
            {onConsultationPress && (
              <Icon name="chevron-right" size={20} color="#9E9E9E" />
            )}
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    overflow: 'hidden',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
    paddingHorizontal: 16,
  },
  emptyText: {
    marginTop: 12,
    color: '#9E9E9E',
    textAlign: 'center',
  },
  consultationItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    minHeight: 44, // Minimum touch target size
  },
  consultationItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  consultationContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateContainer: {
    flex: 1,
  },
  date: {
    fontWeight: '600',
    color: '#212121',
    marginBottom: 4,
  },
  diagnostic: {
    color: '#616161',
  },
});
