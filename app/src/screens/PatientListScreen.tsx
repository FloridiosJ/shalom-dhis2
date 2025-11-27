import React, { useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { Text, Card, FAB, ActivityIndicator, Searchbar } from 'react-native-paper';
import { useQuery } from '@apollo/client/react';
import { NavigationProp, useFocusEffect } from '@react-navigation/native';
import { GET_PATIENTS, Patient, PatientsResponse } from '../services/patientService';

interface PatientListScreenProps {
  navigation: NavigationProp<any>;
}

export default function PatientListScreen({ navigation }: PatientListScreenProps) {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [refreshing, setRefreshing] = React.useState(false);

  const { data, loading, refetch, error } = useQuery<PatientsResponse>(GET_PATIENTS, {
    fetchPolicy: 'cache-and-network',
  });

  // Refresh when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  const patients = data?.patients?.patients || [];

  // Filter patients by search query
  const filteredPatients = patients.filter((patient) => {
    const query = searchQuery.toLowerCase();
    return (
      patient.displayName?.toLowerCase().includes(query) ||
      patient.nom?.toLowerCase().includes(query) ||
      patient.prenom?.toLowerCase().includes(query) ||
      patient.village?.toLowerCase().includes(query) ||
      patient.numeroPatient?.toLowerCase().includes(query)
    );
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refetch();
    } catch (err) {
      console.error('Error refreshing patients:', err);
    } finally {
      setRefreshing(false);
    }
  };

  const handlePatientPress = (patient: Patient) => {
    // TODO: Navigate to patient detail screen when available
    console.log('Patient selected:', patient.id);
  };

  const handleNewPatient = () => {
    navigation.navigate('NouveauPatient');
  };

  const renderPatientItem = ({ item }: { item: Patient }) => (
    <TouchableOpacity
      onPress={() => handlePatientPress(item)}
      accessibilityLabel={`Patient ${item.displayName}`}
      accessibilityRole="button"
    >
      <Card style={styles.patientCard}>
        <Card.Content>
          <View style={styles.patientHeader}>
            <View style={styles.patientInfo}>
              <Text variant="titleMedium" style={styles.patientName}>
                {item.displayName || `${item.prenom || ''} ${item.nom}`.trim()}
              </Text>
              <Text variant="bodySmall" style={styles.patientNumber}>
                N° {item.numeroPatient}
              </Text>
            </View>
            <View style={styles.patientBadge}>
              <Text style={styles.badgeText}>
                {item.sexe === 'M' ? '👨' : '👩'}
              </Text>
            </View>
          </View>
          <View style={styles.patientDetails}>
            {item.village && (
              <Text variant="bodySmall" style={styles.detailText}>
                📍 {item.village}
              </Text>
            )}
            {item.categorieAge && (
              <Text variant="bodySmall" style={styles.detailText}>
                {item.categorieAge}
              </Text>
            )}
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  const renderEmptyList = () => {
    if (loading) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color="#2196F3" />
          <Text style={styles.emptyText}>Chargement des patients...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.errorText}>Erreur lors du chargement</Text>
          <Text style={styles.emptySubtext}>{error.message}</Text>
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Aucun patient trouvé</Text>
        <Text style={styles.emptySubtext}>
          {searchQuery
            ? 'Essayez de modifier votre recherche'
            : 'Créez votre premier patient'}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Rechercher un patient..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
          inputStyle={styles.searchInput}
        />
      </View>

      <FlatList
        data={filteredPatients}
        renderItem={renderPatientItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContent,
          filteredPatients.length === 0 && styles.emptyListContent,
        ]}
        ListEmptyComponent={renderEmptyList}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#2196F3']}
            tintColor="#2196F3"
          />
        }
        showsVerticalScrollIndicator={false}
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
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  searchContainer: {
    padding: 16,
    paddingBottom: 8,
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  searchbar: {
    backgroundColor: '#f5f5f5',
    elevation: 0,
  },
  searchInput: {
    fontSize: 14,
  },
  listContent: {
    padding: 16,
    paddingBottom: 80, // Space for FAB
  },
  emptyListContent: {
    flexGrow: 1,
  },
  patientCard: {
    marginBottom: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    elevation: 2,
  },
  patientHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  patientInfo: {
    flex: 1,
  },
  patientName: {
    fontWeight: '600',
    color: '#333',
  },
  patientNumber: {
    color: '#666',
    marginTop: 2,
  },
  patientBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    fontSize: 18,
  },
  patientDetails: {
    flexDirection: 'row',
    marginTop: 8,
    flexWrap: 'wrap',
  },
  detailText: {
    color: '#666',
    marginRight: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#c62828',
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#2196F3',
  },
});
