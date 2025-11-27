import React, {useState, useEffect, useCallback} from 'react';
import {View, StyleSheet, useWindowDimensions} from 'react-native';
import {useQuery} from '@apollo/client/react';
import {FAB} from 'react-native-paper';
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
  // ✅ TOUS LES HOOKS EN PREMIER - Dans le même ordre à chaque rendu
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('nom');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const {width} = useWindowDimensions();

  // ✅ Fetch patients from GraphQL - TOUJOURS appelé
  const {data, loading, refetch, error} = useQuery<PatientsData>(GET_PATIENTS, {
    fetchPolicy: 'cache-and-network',
  });

  // ✅ Extraire les patients AVANT d'appeler useFilteredPatients
  const patients = data?.patients?.patients || [];

  // ✅ Use custom hook for filtering and sorting - TOUJOURS appelé avec des données par défaut
  const {filteredPatients} = useFilteredPatients({
    patients,
    searchQuery,
    sortBy,
  });

  // ✅ Determine if we should use split view (tablet) or stack navigation (mobile)
  const isTablet = width >= 768;

  // ✅ EFFECTS après tous les autres hooks
  useEffect(() => {
    if (error) {
      console.error('Error fetching patients:', error);
    }
  }, [error]);

  // ✅ Auto-select first patient on tablet if none selected
  useEffect(() => {
    if (isTablet && !selectedPatient && filteredPatients.length > 0) {
      setSelectedPatient(filteredPatients[0]);
    }
  }, [isTablet, selectedPatient, filteredPatients]);

  // ✅ CALLBACKS après les effects
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
    } catch (err) {
      console.error('Error refreshing patients:', err);
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

  const handleNewPatient = useCallback(() => {
    navigation.navigate('NouveauPatient');
  }, [navigation]);

  // ✅ RENDU conditionnel uniquement dans le JSX
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
        {/* FAB for creating new patient */}
        <FAB
          style={styles.fab}
          icon="plus"
          onPress={handleNewPatient}
          accessibilityLabel="Nouveau patient"
        />
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
      {/* FAB for creating new patient */}
      <FAB
        style={styles.fab}
        icon="plus"
        onPress={handleNewPatient}
        accessibilityLabel="Nouveau patient"
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
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#2196F3',
  },
});
