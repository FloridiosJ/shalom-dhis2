import React, {useCallback} from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  Text,
  StyleSheet,
  AccessibilityRole,
} from 'react-native';
import {ConsultationStatus} from '../types';

export type FilterOption = 'tous' | ConsultationStatus;

interface ConsultationFilterPillsProps {
  selectedFilter: FilterOption;
  onFilterChange: (filter: FilterOption) => void;
}

interface PillData {
  key: FilterOption;
  label: string;
}

const FILTERS: PillData[] = [
  {key: 'tous', label: 'Tous'},
  {key: 'brouillon', label: 'Brouillon'},
  {key: 'en_attente', label: 'En attente'},
  {key: 'envoye', label: 'Envoyé'},
];

export default function ConsultationFilterPills({
  selectedFilter,
  onFilterChange,
}: ConsultationFilterPillsProps) {
  const renderPill = useCallback(
    (filter: PillData) => {
      const isSelected = selectedFilter === filter.key;
      return (
        <TouchableOpacity
          key={filter.key}
          style={[styles.pill, isSelected && styles.pillSelected]}
          onPress={() => onFilterChange(filter.key)}
          accessibilityRole={'button' as AccessibilityRole}
          accessibilityLabel={`Filtrer par ${filter.label}`}
          accessibilityState={{selected: isSelected}}>
          <Text style={[styles.pillText, isSelected && styles.pillTextSelected]}>
            {filter.label}
          </Text>
        </TouchableOpacity>
      );
    },
    [selectedFilter, onFilterChange],
  );

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {FILTERS.map(renderPill)}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 8,
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    minHeight: 44, // Minimum touch target size
    justifyContent: 'center',
    alignItems: 'center',
  },
  pillSelected: {
    backgroundColor: '#2196F3',
  },
  pillText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#757575',
  },
  pillTextSelected: {
    color: '#FFFFFF',
  },
});
