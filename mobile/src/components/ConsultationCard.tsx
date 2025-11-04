import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity, AccessibilityRole} from 'react-native';
import {Card} from 'react-native-paper';
import {Consultation, ConsultationStatus} from '../types';

interface ConsultationCardProps {
  consultation: Consultation;
  onPress?: () => void;
}

const STATUS_CONFIG: Record<
  ConsultationStatus,
  {label: string; color: string; backgroundColor: string}
> = {
  termine: {
    label: 'Envoyé',
    color: '#2E7D32',
    backgroundColor: '#E8F5E9',
  },
  completed: {
    label: 'Envoyé',
    color: '#2E7D32',
    backgroundColor: '#E8F5E9',
  },
  suivi_requis: {
    label: 'En attente',
    color: '#EF6C00',
    backgroundColor: '#FFF3E0',
  },
  en_cours: {
    label: 'Brouillon',
    color: '#616161',
    backgroundColor: '#F5F5F5',
  },
  active: {
    label: 'En cours',
    color: '#2196F3',
    backgroundColor: '#E3F2FD',
  },
  cancelled: {
    label: 'Annulé',
    color: '#D32F2F',
    backgroundColor: '#FFEBEE',
  },
};

function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
}

export default function ConsultationCard({
  consultation,
  onPress,
}: ConsultationCardProps) {
  const statusConfig = STATUS_CONFIG[consultation.status];
  const formattedDate = formatDate(consultation.dateConsultation);
  const patientName = consultation.patient.displayName;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole={'button' as AccessibilityRole}
      accessibilityLabel={`Consultation de ${patientName}, ${consultation.diagnostic}, ${formattedDate}, statut ${statusConfig.label}`}>
      <Card style={styles.card}>
        <Card.Content style={styles.cardContent}>
          <View style={styles.mainContent}>
            <View style={styles.infoSection}>
              <Text style={styles.patientName} numberOfLines={1}>
                Patient : {patientName}
              </Text>
              <Text style={styles.diagnostic} numberOfLines={2}>
                Diagnostic : {consultation.diagnostic}
              </Text>
              <Text style={styles.date}>Date : {formattedDate}</Text>
            </View>
            <View
              style={[
                styles.statusBadge,
                {backgroundColor: statusConfig.backgroundColor},
              ]}
              accessibilityRole={'text' as AccessibilityRole}
              accessibilityLabel={`Statut: ${statusConfig.label}`}>
              <Text style={[styles.statusText, {color: statusConfig.color}]}>
                {statusConfig.label}
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 6,
    borderRadius: 12,
    elevation: 2,
    backgroundColor: '#FFFFFF',
  },
  cardContent: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  mainContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  infoSection: {
    flex: 1,
    marginRight: 12,
  },
  patientName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 4,
  },
  diagnostic: {
    fontSize: 14,
    color: '#616161',
    marginBottom: 4,
    lineHeight: 20,
  },
  date: {
    fontSize: 12,
    color: '#9E9E9E',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    minHeight: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
