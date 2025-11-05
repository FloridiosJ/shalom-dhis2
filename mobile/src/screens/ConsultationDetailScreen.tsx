import React, {useCallback} from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  AccessibilityRole,
} from 'react-native';
import {Text} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {Consultation} from '../types';
import VitalsCard from '../components/consultation/VitalsCard';
import ConsultationDiagnosisCard from '../components/consultation/ConsultationDiagnosisCard';
import AgentNotesCard from '../components/consultation/AgentNotesCard';
import BackToPatientButton from '../components/consultation/BackToPatientButton';

interface ConsultationDetailScreenProps {
  route: {
    params: {
      consultation: Consultation;
    };
  };
  // TODO: Type navigation properly with StackNavigationProp when navigation types are defined
  navigation: any;
}

/**
 * ConsultationDetailScreen displays detailed information for a single consultation
 * Includes vital signs, diagnosis, treatment, and agent notes
 * Follows clean code practices with modular, reusable components
 */
export default function ConsultationDetailScreen({
  route,
  navigation,
}: ConsultationDetailScreenProps) {
  const {consultation} = route.params;

  const handleBackToPatient = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Date invalide';
      }
      return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Date invalide';
    }
  };

  // Loading state (could be added if fetching additional data)
  if (!consultation) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={[styles.container, styles.centerContent]}>
          <ActivityIndicator size="large" color="#2196F3" />
          <Text variant="bodyMedium" style={styles.loadingText}>
            Chargement...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {/* Header with consultation date */}
        <View
          style={styles.header}
          accessibilityRole={'header' as AccessibilityRole}>
          <Icon name="calendar-check" size={24} color="#2196F3" />
          <Text variant="headlineSmall" style={styles.headerTitle}>
            Consultation du {formatDate(consultation.dateConsultation)}
          </Text>
        </View>

        {/* Vital Signs Card */}
        <VitalsCard vitalSigns={consultation.vitalSigns} />

        {/* Diagnosis and Treatment Card */}
        <ConsultationDiagnosisCard
          motifConsultation={consultation.motifConsultation}
          diagnostic={consultation.diagnostic}
          prescription={consultation.prescription}
        />

        {/* Agent Notes Card */}
        <AgentNotesCard notes={consultation.agentNotes || consultation.notes} />

        {/* Back to Patient Button */}
        <BackToPatientButton onPress={handleBackToPatient} />

        {/* Bottom spacer for better scrolling */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    marginLeft: 12,
    fontWeight: '600',
    color: '#212121',
    flex: 1,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    color: '#757575',
  },
  bottomSpacer: {
    height: 16,
  },
});
