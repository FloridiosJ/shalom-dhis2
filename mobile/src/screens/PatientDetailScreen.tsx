import React, {useCallback} from 'react';
import {View, StyleSheet} from 'react-native';
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
      <View style={styles.container}>
        {/* Error handling could be improved with a proper error component */}
      </View>
    );
  }

  if (!patient && !loading) {
    return (
      <View style={styles.container}>
        {/* Not found state */}
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
});
