import React, {useState, useEffect, useCallback, useMemo} from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  AccessibilityRole,
} from 'react-native';
import {Text, FAB} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import SearchBar from '../components/SearchBar';
import ConsultationFilterPills, {
  FilterOption,
} from '../components/ConsultationFilterPills';
import ConsultationCard from '../components/ConsultationCard';
import {Consultation} from '../types';
import {fetchConsultations} from '../services/consultationService';
import {generateUUID, validateUniqueKeys} from '../utils/uuid';

const ITEMS_PER_PAGE = 20;

export default function ConsultationScreen({navigation}: {navigation: any}) {
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<FilterOption>('tous');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const loadConsultations = useCallback(
    async (pageNum: number, isRefresh = false) => {
      if (loading || (!hasMore && !isRefresh)) {
        return;
      }

      try {
        if (isRefresh) {
          setRefreshing(true);
          setError(null);
        } else {
          setLoading(true);
        }

        const filter: any = {};
        if (selectedFilter !== 'tous') {
          filter.status = selectedFilter;
        }
        if (searchQuery.trim()) {
          filter.search = searchQuery.trim();
        }

        const result = await fetchConsultations({
          filter,
          pagination: {
            page: pageNum,
            limit: ITEMS_PER_PAGE,
          },
          sort: {
            field: 'dateConsultation',
            direction: 'DESC',
          },
        });

        // Ensure all consultations have a unique id for stable keys
        const dataWithIds = result.dataEntries.map(item => {
          if (!item.id && !item.clientTempId) {
            // Generate a stable ID for items without one
            return {...item, clientTempId: generateUUID()};
          }
          return item;
        });

        setConsultations(prev => {
          let newConsultations: Consultation[];
          
          if (isRefresh || pageNum === 1) {
            newConsultations = dataWithIds;
          } else {
            // Merge with previous data, removing duplicates based on ID
            const existingIds = new Set(prev.map(item => item.id));
            const uniqueNewItems = dataWithIds.filter(
              item => !existingIds.has(item.id)
            );
            newConsultations = [...prev, ...uniqueNewItems];
          }
          
          // DEV mode: Validate key uniqueness with comprehensive logging
          if (__DEV__) {
            const keys = newConsultations.map((item, index) => 
              item.id || item.clientTempId || `fallback-${index}`
            );
            const isUnique = validateUniqueKeys(keys, 'ConsultationScreen');
            
            if (!isUnique) {
              console.warn('[ConsultationScreen] Items with missing IDs:', 
                newConsultations.filter(item => !item.id && !item.clientTempId)
              );
            }
            
            // Check for duplicate IDs in the data itself
            const idCounts = new Map<string, number>();
            newConsultations.forEach(item => {
              const id = item.id || item.clientTempId;
              if (id) {
                idCounts.set(id, (idCounts.get(id) || 0) + 1);
              }
            });
            
            const duplicateIds = Array.from(idCounts.entries())
              .filter(([_, count]) => count > 1)
              .map(([id, _]) => id);
            
            if (duplicateIds.length > 0) {
              console.warn(
                '[ConsultationScreen] Duplicate consultation IDs detected:',
                duplicateIds
              );
            }
          }
          
          return newConsultations;
        });

        setHasMore(result.hasNextPage);
        setPage(pageNum);
      } catch (err) {
        console.error('Error loading consultations:', err);
        setError(
          'Erreur lors du chargement des consultations. Veuillez réessayer.',
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [loading, hasMore, selectedFilter, searchQuery],
  );

  useEffect(() => {
    // Reset and load when filters change
    setPage(1);
    setHasMore(true);
    setConsultations([]);
    loadConsultations(1, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFilter, searchQuery]);

  const handleRefresh = useCallback(() => {
    setPage(1);
    setHasMore(true);
    loadConsultations(1, true);
  }, [loadConsultations]);

  const handleLoadMore = useCallback(() => {
    if (!loading && hasMore) {
      loadConsultations(page + 1);
    }
  }, [loading, hasMore, page, loadConsultations]);

  const handleConsultationPress = useCallback((consultation: Consultation) => {
    // TODO: Navigate to consultation detail screen
    console.log('Consultation pressed:', consultation.id);
  }, []);

  const handleNewConsultation = useCallback(() => {
    navigation.navigate('NewConsultation');
  }, [navigation]);

  const handleRetry = useCallback(() => {
    setError(null);
    handleRefresh();
  }, [handleRefresh]);

  const keyExtractor = useCallback(
    (item: Consultation, index: number) => {
      // Prefer id (from server), then clientTempId (local), then index as last resort
      // Using index as fallback ensures uniqueness even for edge cases
      return item.id || item.clientTempId || `fallback-${index}`;
    },
    [],
  );

  const renderItem = useCallback(
    ({item}: {item: Consultation}) => (
      <ConsultationCard
        consultation={item}
        onPress={() => handleConsultationPress(item)}
      />
    ),
    [handleConsultationPress],
  );

  const renderFooter = useMemo(() => {
    if (!loading || refreshing) {
      return null;
    }
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="small" color="#2196F3" />
      </View>
    );
  }, [loading, refreshing]);

  const renderEmpty = useMemo(() => {
    if (loading || refreshing) {
      return null;
    }

    if (error) {
      return (
        <View style={styles.emptyContainer}>
          <Icon name="alert-circle-outline" size={64} color="#9E9E9E" />
          <Text style={styles.emptyText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={handleRetry}
            accessibilityRole={'button' as AccessibilityRole}
            accessibilityLabel="Réessayer">
            <Text style={styles.retryButtonText}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <Icon name="clipboard-text-outline" size={64} color="#9E9E9E" />
        <Text style={styles.emptyText}>Aucune consultation trouvée</Text>
        <Text style={styles.emptySubtext}>
          {searchQuery || selectedFilter !== 'tous'
            ? 'Essayez de modifier vos critères de recherche'
            : 'Créez votre première consultation'}
        </Text>
      </View>
    );
  }, [loading, refreshing, error, searchQuery, selectedFilter, handleRetry]);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}>
      <View style={styles.container}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Rechercher un patient..."
          accessibilityLabel="Rechercher une consultation par patient"
        />
        <ConsultationFilterPills
          selectedFilter={selectedFilter}
          onFilterChange={setSelectedFilter}
        />
        <FlatList
          data={consultations}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={renderEmpty}
          contentContainerStyle={
            consultations.length === 0 && styles.emptyListContent
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={['#2196F3']}
              tintColor="#2196F3"
            />
          }
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          windowSize={10}
          initialNumToRender={10}
        />
        <FAB
          style={styles.fab}
          icon="plus"
          onPress={handleNewConsultation}
          accessibilityLabel="Nouvelle consultation"
          accessibilityRole={'button' as AccessibilityRole}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
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
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#616161',
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9E9E9E',
    marginTop: 8,
    textAlign: 'center',
  },
  footer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#2196F3',
    borderRadius: 8,
    minHeight: 44,
    justifyContent: 'center',
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#2196F3',
  },
});
