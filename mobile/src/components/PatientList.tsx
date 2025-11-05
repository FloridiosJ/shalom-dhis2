import React from 'react';
import {
  FlatList,
  View,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import {Text} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {Patient} from '../types';
import PatientCard from './PatientCard';
import SearchBar from './SearchBar';
import SortMenu from './SortMenu';
import {SortOption} from '../hooks/useFilteredPatients';

interface PatientListProps {
  patients: Patient[];
  searchQuery: string;
  onSearchChange: (text: string) => void;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  onPatientPress: (patient: Patient) => void;
  loading?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  ListHeaderComponent?: React.ReactElement;
}

/**
 * PatientList component displays a searchable, sortable list of patients
 * Optimized with FlatList for performance with large datasets
 */
export default function PatientList({
  patients,
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  onPatientPress,
  loading,
  refreshing,
  onRefresh,
  ListHeaderComponent,
}: PatientListProps) {
  const renderItem = ({item}: {item: Patient}) => (
    <PatientCard patient={item} onPress={() => onPatientPress(item)} />
  );

  const renderEmpty = () => {
    if (loading) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color="#2196F3" />
          <Text variant="bodyMedium" style={styles.emptyText}>
            Chargement des patients...
          </Text>
        </View>
      );
    }

    if (searchQuery.trim()) {
      return (
        <View style={styles.emptyContainer}>
          <Icon name="account-search" size={64} color="#BDBDBD" />
          <Text variant="titleMedium" style={styles.emptyTitle}>
            Aucun patient trouvé
          </Text>
          <Text variant="bodyMedium" style={styles.emptyText}>
            Essayez avec d'autres critères de recherche
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <Icon name="account-multiple" size={64} color="#BDBDBD" />
        <Text variant="titleMedium" style={styles.emptyTitle}>
          Aucun patient enregistré
        </Text>
        <Text variant="bodyMedium" style={styles.emptyText}>
          Les patients apparaîtront ici
        </Text>
      </View>
    );
  };

  const keyExtractor = (item: Patient) => item.id;

  const getItemLayout = (_: any, index: number) => ({
    length: ITEM_HEIGHT,
    offset: ITEM_HEIGHT * index,
    index,
  });

  return (
    <View style={styles.container}>
      {ListHeaderComponent}
      <SearchBar
        value={searchQuery}
        onChangeText={onSearchChange}
        placeholder="Rechercher un patient..."
        accessibilityLabel="Rechercher un patient par nom, prénom ou numéro"
      />
      <SortMenu selectedSort={sortBy} onSortChange={onSortChange} />

      <FlatList
        data={patients}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        getItemLayout={getItemLayout}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={
          patients.length === 0 ? styles.emptyListContent : styles.listContent
        }
        refreshControl={
          onRefresh ? (
            <RefreshControl
              refreshing={refreshing || false}
              onRefresh={onRefresh}
              colors={['#2196F3']}
              tintColor="#2196F3"
            />
          ) : undefined
        }
        // Performance optimizations
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        updateCellsBatchingPeriod={50}
        initialNumToRender={10}
        windowSize={10}
        // Accessibility
        accessibilityRole="list"
        accessibilityLabel="Liste des patients"
      />
    </View>
  );
}

const ITEM_HEIGHT = 120; // Approximate height of PatientCard + margins

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  listContent: {
    paddingVertical: 8,
  },
  emptyListContent: {
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 48,
  },
  emptyTitle: {
    marginTop: 16,
    marginBottom: 8,
    color: '#757575',
    fontWeight: '600',
    textAlign: 'center',
  },
  emptyText: {
    color: '#9E9E9E',
    textAlign: 'center',
  },
});
