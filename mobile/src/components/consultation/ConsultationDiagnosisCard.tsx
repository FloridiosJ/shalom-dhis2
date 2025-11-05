import React, {memo} from 'react';
import {View, StyleSheet, AccessibilityRole} from 'react-native';
import {Text, Card} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface ConsultationDiagnosisCardProps {
  motifConsultation?: string;
  diagnostic?: string;
  prescription?: string;
}

interface SectionProps {
  icon: string;
  label: string;
  value?: string;
  iconColor: string;
}

/**
 * Section - Displays a labeled section with icon
 */
const Section = memo(({icon, label, value, iconColor}: SectionProps) => {
  if (!value) {
    return null;
  }

  return (
    <View
      style={styles.section}
      accessibilityRole={'text' as AccessibilityRole}
      accessibilityLabel={`${label}: ${value}`}>
      <View style={styles.sectionHeader}>
        <Icon name={icon} size={18} color={iconColor} style={styles.sectionIcon} />
        <Text variant="bodyMedium" style={styles.sectionLabel}>
          {label}
        </Text>
      </View>
      <Text variant="bodyLarge" style={styles.sectionValue}>
        {value}
      </Text>
    </View>
  );
});

Section.displayName = 'Section';

/**
 * ConsultationDiagnosisCard - Displays consultation reason, diagnosis and treatment
 * Reusable component for showing consultation medical details
 */
const ConsultationDiagnosisCard = memo(
  ({motifConsultation, diagnostic, prescription}: ConsultationDiagnosisCardProps) => {
    // Check if we have any data to display
    const hasData = motifConsultation || diagnostic || prescription;

    return (
      <Card style={styles.card} accessibilityRole={'region' as AccessibilityRole}>
        <Card.Content>
          <View style={styles.header}>
            <Icon name="stethoscope" size={24} color="#2196F3" />
            <Text variant="titleLarge" style={styles.title}>
              Diagnostic et Traitement
            </Text>
          </View>

          {!hasData ? (
            <View style={styles.emptyContainer}>
              <Icon name="alert-circle-outline" size={48} color="#BDBDBD" />
              <Text variant="bodyMedium" style={styles.emptyText}>
                Aucune information médicale disponible
              </Text>
            </View>
          ) : (
            <>
              {/* Motif de consultation */}
              <Section
                icon="clipboard-text"
                label="Motif de consultation"
                value={motifConsultation}
                iconColor="#FF9800"
              />

              {/* Diagnostic */}
              <Section
                icon="medical-bag"
                label="Diagnostic"
                value={diagnostic}
                iconColor="#F44336"
              />

              {/* Traitement prescrit */}
              <Section
                icon="pill"
                label="Traitement prescrit"
                value={prescription}
                iconColor="#4CAF50"
              />
            </>
          )}
        </Card.Content>
      </Card>
    );
  },
);

ConsultationDiagnosisCard.displayName = 'ConsultationDiagnosisCard';

export default ConsultationDiagnosisCard;

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
  section: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  sectionIcon: {
    marginRight: 6,
  },
  sectionLabel: {
    color: '#757575',
    fontWeight: '500',
  },
  sectionValue: {
    color: '#212121',
    lineHeight: 22,
    marginLeft: 24,
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
