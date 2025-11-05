import React, {useCallback} from 'react';
import {View, StyleSheet} from 'react-native';
import {Text, Button} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {usePatientDetail} from '../hooks/usePatientDetail';
import PatientDetail from '../components/PatientDetail';
import {Consultation} from '../types';

interface PatientDetailScreenProps {
  route: {
    params: {
      patientId: string;
    };
  };
  navigation: any;
}

/**
 * PatientDetailScreen displays detailed information for a single patient
 * Used in mobile stack navigation
 */
export default function PatientDetailScreen({
  route,
  navigation,
}: PatientDetailScreenProps) {
  const {patientId} = route.params;
  const {patient, loading, error} = usePatientDetail(patientId);

  const handleStartConsultation = useCallback(() => {
    if (patient) {
      navigation.navigate('Consultation', {
        screen: 'NewConsultation',
        params: {patientId: patient.id},
      });
    }
  }, [patient, navigation]);

  const handleConsultationPress = useCallback(
    (consultation: Consultation) => {
      // Navigate to consultation detail if implemented
      console.log('Navigate to consultation:', consultation.id);
    },
    [],
  );

  if (error) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Icon name="alert-circle-outline" size={64} color="#F44336" />
        <Text variant="titleLarge" style={styles.errorTitle}>
          Erreur de chargement
        </Text>
        <Text variant="bodyMedium" style={styles.errorText}>
          {error}
        </Text>
        <Button mode="contained" onPress={() => navigation.goBack()} style={styles.errorButton}>
          Retour
        </Button>
      </View>
    );
  }

  if (!patient && !loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Icon name="account-question-outline" size={64} color="#9E9E9E" />
        <Text variant="titleLarge" style={styles.errorTitle}>
          Patient introuvable
        </Text>
        <Text variant="bodyMedium" style={styles.errorText}>
          Le patient demandé n'a pas pu être trouvé.
        </Text>
        <Button mode="contained" onPress={() => navigation.goBack()} style={styles.errorButton}>
          Retour
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <PatientDetail
        patient={patient!}
        loading={loading}
        onStartConsultation={handleStartConsultation}
        onConsultationPress={handleConsultationPress}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorTitle: {
    marginTop: 16,
    marginBottom: 8,
    color: '#212121',
    textAlign: 'center',
  },
  errorText: {
    color: '#757575',
    textAlign: 'center',
    marginBottom: 24,
  },
  errorButton: {
    minWidth: 120,
  },
});
