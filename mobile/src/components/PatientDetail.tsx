import React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  AccessibilityRole,
} from 'react-native';
import {Text, Button} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {Patient, Consultation} from '../types';
import ConsultationHistory from './ConsultationHistory';

interface PatientDetailProps {
  patient: Patient & {
    religion?: string;
    consultations?: Consultation[];
  };
  loading?: boolean;
  onStartConsultation: () => void;
  onConsultationPress?: (consultation: Consultation) => void;
}

interface InfoRowProps {
  icon: string;
  label: string;
  value: string;
  iconColor?: string;
}

function InfoRow({
  icon,
  label,
  value,
  iconColor = '#757575',
}: InfoRowProps) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoLabelContainer}>
        <Icon name={icon} size={20} color={iconColor} style={styles.infoIcon} />
        <Text variant="bodyMedium" style={styles.infoLabel}>
          {label}
        </Text>
      </View>
      <Text variant="bodyLarge" style={styles.infoValue}>
        {value}
      </Text>
    </View>
  );
}

/**
 * PatientDetail component displays comprehensive patient information
 * Including demographics and consultation history
 */
export default function PatientDetail({
  patient,
  loading,
  onStartConsultation,
  onConsultationPress,
}: PatientDetailProps) {
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text variant="bodyMedium" style={styles.loadingText}>
          Chargement...
        </Text>
      </View>
    );
  }



  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Icon
            name={patient.sexe === 'M' ? 'account' : 'account-outline'}
            size={48}
            color="#2196F3"
          />
        </View>
        <Text variant="headlineMedium" style={styles.patientName}>
          {patient.displayName}
        </Text>
      </View>

      {/* Demographic Information Section */}
      <View style={styles.section}>
        <Text variant="titleLarge" style={styles.sectionTitle}>
          Informations Démographiques
        </Text>

        <View style={styles.card}>
          <InfoRow
            icon="account-card-details"
            label="Nom complet"
            value={patient.displayName}
          />
          <InfoRow
            icon="identifier"
            label="ID Unique"
            value={patient.numeroPatient}
            iconColor="#2196F3"
          />
          <InfoRow
            icon="cake-variant"
            label="Âge"
            value={`${patient.age} ans`}
          />
          <InfoRow
            icon={patient.sexe === 'M' ? 'gender-male' : 'gender-female'}
            label="Sexe"
            value={patient.sexe === 'M' ? 'Masculin' : 'Féminin'}
            iconColor={patient.sexe === 'M' ? '#2196F3' : '#E91E63'}
          />
          <InfoRow
            icon="map-marker"
            label="Village"
            value={patient.village || 'Non renseigné'}
            iconColor="#4CAF50"
          />
          {patient.religion && (
            <InfoRow icon="book-cross" label="Religion" value={patient.religion} />
          )}
        </View>
      </View>

      {/* Consultation History Section */}
      <View style={styles.section}>
        <Text variant="titleLarge" style={styles.sectionTitle}>
          Historique des Consultations
        </Text>

        <View style={styles.card}>
          <ConsultationHistory
            consultations={patient.consultations || []}
            onConsultationPress={onConsultationPress}
          />
        </View>
      </View>

      {/* Action Button */}
      <View style={styles.actionContainer}>
        <Button
          mode="contained"
          onPress={onStartConsultation}
          icon="plus"
          style={styles.actionButton}
          contentStyle={styles.actionButtonContent}
          labelStyle={styles.actionButtonLabel}
          accessibilityRole={'button' as AccessibilityRole}
          accessibilityLabel="Démarrer une nouvelle consultation">
          Démarrer une nouvelle consultation
        </Button>
      </View>

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  loadingText: {
    marginTop: 16,
    color: '#757575',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 24,
    paddingHorizontal: 16,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  patientName: {
    fontWeight: 'bold',
    color: '#212121',
    textAlign: 'center',
  },
  section: {
    marginTop: 16,
  },
  sectionTitle: {
    fontWeight: '600',
    color: '#212121',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 8,
  },
  infoRow: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  infoLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  infoIcon: {
    marginRight: 8,
  },
  infoLabel: {
    color: '#757575',
    fontWeight: '500',
  },
  infoValue: {
    color: '#212121',
    fontWeight: '400',
    marginLeft: 28,
  },
  actionContainer: {
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  actionButton: {
    borderRadius: 8,
    minHeight: 48, // Minimum touch target size
  },
  actionButtonContent: {
    height: 48,
  },
  actionButtonLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  bottomSpacer: {
    height: 24,
  },
});
