import React, {useState, useEffect, useCallback} from 'react';
import {View, StyleSheet, useWindowDimensions} from 'react-native';
import {useQuery} from '@apollo/client';
import {Patient} from '../types';
import {GET_PATIENTS} from '../services/patientService';
import PatientList from '../components/PatientList';
import PatientDetail from '../components/PatientDetail';
import {useFilteredPatients, SortOption} from '../hooks/useFilteredPatients';

interface PatientsData {
  patients: {
    patients: Patient[];
  };
}

/**
 * PatientScreen displays a list of patients with search and sort functionality
 * Implements responsive layout: split view on tablets, stack navigation on phones
 */
export default function PatientScreen({navigation}: {navigation: any}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('nom');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const {width} = useWindowDimensions();

  // Determine if we should use split view (tablet) or stack navigation (mobile)
  const isTablet = width >= 768;

  // Fetch patients from GraphQL
  const {data, loading, refetch} = useQuery<PatientsData>(GET_PATIENTS, {
    fetchPolicy: 'cache-and-network',
    onError: error => {
      console.error('Error fetching patients:', error);
    },
  });

  const patients = data?.patients?.patients || [];

  // Use custom hook for filtering and sorting
  const {filteredPatients} = useFilteredPatients({
    patients,
    searchQuery,
    sortBy,
  });

  const handlePatientPress = useCallback(
    (patient: Patient) => {
      if (isTablet) {
        // On tablet, show detail in split view
        setSelectedPatient(patient);
      } else {
        // On mobile, navigate to detail screen
        navigation.navigate('PatientDetail', {patientId: patient.id});
      }
    },
    [isTablet, navigation],
  );

  const handleRefresh = useCallback(async () => {
    try {
      await refetch();
    } catch (error) {
      console.error('Error refreshing patients:', error);
    }
  }, [refetch]);

  const handleStartConsultation = useCallback(() => {
    if (selectedPatient) {
      navigation.navigate('Consultation', {
        screen: 'NewConsultation',
        params: {patientId: selectedPatient.id},
      });
    }
  }, [selectedPatient, navigation]);

  // Auto-select first patient on tablet if none selected
  useEffect(() => {
    if (isTablet && !selectedPatient && filteredPatients.length > 0) {
      setSelectedPatient(filteredPatients[0]);
    }
  }, [isTablet, selectedPatient, filteredPatients]);

  if (isTablet) {
    // Split view for tablet
    return (
      <View style={styles.tabletContainer}>
        <View style={styles.listContainer}>
          <PatientList
            patients={filteredPatients}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            sortBy={sortBy}
            onSortChange={setSortBy}
            onPatientPress={handlePatientPress}
            loading={loading}
            refreshing={false}
            onRefresh={handleRefresh}
          />
        </View>
        <View style={styles.separator} />
        <View style={styles.detailContainer}>
          {selectedPatient ? (
            <PatientDetail
              patient={selectedPatient}
              onStartConsultation={handleStartConsultation}
            />
          ) : (
            <View style={styles.noSelectionContainer}>
              {/* Empty state when no patient selected */}
            </View>
          )}
        </View>
      </View>
    );
  }

  // Stack navigation for mobile
  return (
    <View style={styles.mobileContainer}>
      <PatientList
        patients={filteredPatients}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        sortBy={sortBy}
        onSortChange={setSortBy}
        onPatientPress={handlePatientPress}
        loading={loading}
        refreshing={false}
        onRefresh={handleRefresh}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  tabletContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#F5F5F5',
  },
  mobileContainer: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  listContainer: {
    flex: 1,
    maxWidth: 400,
  },
  separator: {
    width: 1,
    backgroundColor: '#E0E0E0',
  },
  detailContainer: {
    flex: 2,
  },
  noSelectionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
