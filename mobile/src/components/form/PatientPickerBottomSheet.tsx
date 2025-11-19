import React, {
  useState,
  useCallback,
  useMemo,
  useRef,
  useEffect,
} from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  AccessibilityRole,
  Keyboard,
} from 'react-native';
import {Text, TextInput, Button, ActivityIndicator} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import BottomSheet, {
  BottomSheetFlatList,
  BottomSheetBackdrop,
  BottomSheetTextInput,
} from '@gorhom/bottom-sheet';
import {PatientOption} from '../../types/consultation';
import {useDebounce} from '../../hooks/useDebounce';

interface PatientPickerBottomSheetProps {
  value: string | null;
  onChange: (patientId: string | null) => void;
  onCreatePatient: () => void;
  error?: string;
  patients: PatientOption[];
  onSearchPatients: (query: string) => void;
  loading?: boolean;
}

/**
 * PatientPickerBottomSheet Component
 * 
 * A reusable component for selecting patients with bottom sheet UI.
 * Features:
 * - Bottom sheet with search functionality
 * - Debounced search (300ms)
 * - Keyboard dismissal on scroll
 * - Accessibility support
 * - "Create new patient" button when no results
 * 
 * @component
 * @example
 * ```tsx
 * <PatientPickerBottomSheet
 *   value={patientId}
 *   onChange={setPatientId}
 *   onCreatePatient={handleCreate}
 *   patients={patientsList}
 *   onSearchPatients={handleSearch}
 *   loading={isLoading}
 * />
 * ```
 */
export default function PatientPickerBottomSheet({
  value,
  onChange,
  onCreatePatient,
  error,
  patients,
  onSearchPatients,
  loading,
}: PatientPickerBottomSheetProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const bottomSheetRef = useRef<BottomSheet>(null);
  const selectedPatient = patients.find(p => p.id === value);

  // Snap points for the bottom sheet
  const snapPoints = useMemo(() => ['75%', '90%'], []);

  // Handle debounced search
  useEffect(() => {
    if (debouncedSearchQuery !== undefined) {
      onSearchPatients(debouncedSearchQuery);
    }
  }, [debouncedSearchQuery, onSearchPatients]);

  const handleOpenBottomSheet = useCallback(() => {
    bottomSheetRef.current?.expand();
  }, []);

  const handleCloseBottomSheet = useCallback(() => {
    bottomSheetRef.current?.close();
    setSearchQuery('');
    Keyboard.dismiss();
  }, []);

  const handleSelectPatient = useCallback(
    (patient: PatientOption) => {
      onChange(patient.id);
      handleCloseBottomSheet();
    },
    [onChange, handleCloseBottomSheet],
  );

  const handleClear = useCallback(() => {
    onChange(null);
  }, [onChange]);

  const handleCreatePatient = useCallback(() => {
    handleCloseBottomSheet();
    onCreatePatient();
  }, [handleCloseBottomSheet, onCreatePatient]);

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
      />
    ),
    [],
  );

  const renderPatientItem = useCallback(
    ({item}: {item: PatientOption}) => (
      <TouchableOpacity
        style={styles.patientItem}
        onPress={() => handleSelectPatient(item)}
        accessibilityRole={'button' as AccessibilityRole}
        accessibilityLabel={`Sélectionner le patient ${item.displayName}`}>
        <View style={styles.patientInfo}>
          <Text style={styles.patientName}>{item.displayName}</Text>
          <Text style={styles.patientNumber}>{item.numeroPatient}</Text>
        </View>
        <Icon name="chevron-right" size={24} color="#9E9E9E" />
      </TouchableOpacity>
    ),
    [handleSelectPatient],
  );

  const renderEmptyComponent = useCallback(() => {
    if (loading) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color="#2196F3" />
          <Text style={styles.emptyText}>Recherche en cours...</Text>
        </View>
      );
    }

    if (searchQuery && patients.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Icon name="account-search-outline" size={64} color="#9E9E9E" />
          <Text style={styles.emptyText}>Aucun patient trouvé</Text>
          <Button
            mode="contained"
            onPress={handleCreatePatient}
            style={styles.createButtonEmpty}
            labelStyle={styles.createButtonLabel}
            icon="plus-circle"
            accessibilityRole={'button' as AccessibilityRole}
            accessibilityLabel="Créer un nouveau patient">
            Créer un nouveau patient
          </Button>
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <Icon name="magnify" size={64} color="#9E9E9E" />
        <Text style={styles.emptyText}>
          Recherchez un patient par nom ou identifiant
        </Text>
      </View>
    );
  }, [loading, searchQuery, patients.length, handleCreatePatient]);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Patient</Text>

      <TouchableOpacity
        style={[styles.pickerButton, error && styles.pickerButtonError]}
        onPress={handleOpenBottomSheet}
        accessibilityRole={'button' as AccessibilityRole}
        accessibilityLabel="Sélectionner un patient"
        accessibilityHint="Ouvre un écran de recherche de patient">
        <View style={styles.pickerContent}>
          {selectedPatient ? (
            <>
              <View style={styles.selectedPatientInfo}>
                <Text style={styles.selectedPatientName}>
                  {selectedPatient.displayName}
                </Text>
                <Text style={styles.selectedPatientNumber}>
                  {selectedPatient.numeroPatient}
                </Text>
              </View>
              <TouchableOpacity
                onPress={handleClear}
                hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
                accessibilityRole={'button' as AccessibilityRole}
                accessibilityLabel="Effacer la sélection">
                <Icon name="close-circle" size={20} color="#9E9E9E" />
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Icon name="magnify" size={20} color="#9E9E9E" />
              <Text style={styles.placeholder}>
                Nom ou identifiant du patient
              </Text>
            </>
          )}
        </View>
      </TouchableOpacity>

      {error && <Text style={styles.errorText}>{error}</Text>}

      <Button
        mode="text"
        onPress={handleCreatePatient}
        style={styles.createButton}
        labelStyle={styles.createButtonLabel}
        icon="plus-circle"
        accessibilityRole={'button' as AccessibilityRole}
        accessibilityLabel="Créer un nouveau patient">
        Créer un nouveau patient
      </Button>

      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        keyboardBehavior="interactive"
        keyboardBlurBehavior="restore"
        android_keyboardInputMode="adjustResize"
        onClose={() => {
          setSearchQuery('');
          Keyboard.dismiss();
        }}>
        <View style={styles.bottomSheetContent}>
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>Sélectionner un patient</Text>
            <TouchableOpacity
              onPress={handleCloseBottomSheet}
              style={styles.closeButton}
              accessibilityRole={'button' as AccessibilityRole}
              accessibilityLabel="Fermer">
              <Icon name="close" size={24} color="#000" />
            </TouchableOpacity>
          </View>

          <View style={styles.searchContainer}>
            <View style={styles.searchInputWrapper}>
              <Icon
                name="magnify"
                size={20}
                color="#9E9E9E"
                style={styles.searchIcon}
              />
              <BottomSheetTextInput
                style={styles.searchInput}
                placeholder="Rechercher un utilisateur"
                value={searchQuery}
                onChangeText={setSearchQuery}
                accessibilityLabel="Rechercher un patient"
                autoCorrect={false}
              />
            </View>
          </View>

          <BottomSheetFlatList
            data={patients}
            renderItem={renderPatientItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContainer}
            ListEmptyComponent={renderEmptyComponent}
            keyboardShouldPersistTaps="handled"
            onScrollBeginDrag={Keyboard.dismiss}
          />
        </View>
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#424242',
    marginBottom: 8,
  },
  pickerButton: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#FFFFFF',
    minHeight: 48,
  },
  pickerButtonError: {
    borderColor: '#D32F2F',
  },
  pickerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectedPatientInfo: {
    flex: 1,
    marginLeft: 0,
  },
  selectedPatientName: {
    fontSize: 16,
    color: '#212121',
    fontWeight: '500',
  },
  selectedPatientNumber: {
    fontSize: 14,
    color: '#757575',
    marginTop: 2,
  },
  placeholder: {
    fontSize: 16,
    color: '#9E9E9E',
    marginLeft: 8,
  },
  errorText: {
    fontSize: 12,
    color: '#D32F2F',
    marginTop: 4,
  },
  createButton: {
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  createButtonLabel: {
    fontSize: 14,
    textTransform: 'none',
  },
  createButtonEmpty: {
    marginTop: 24,
    backgroundColor: '#2196F3',
  },
  bottomSheetContent: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#212121',
  },
  closeButton: {
    padding: 8,
    minHeight: 44,
    minWidth: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    padding: 16,
    paddingBottom: 8,
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#212121',
    paddingVertical: 12,
    paddingHorizontal: 0,
  },
  listContainer: {
    flexGrow: 1,
  },
  patientItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
    minHeight: 60,
  },
  patientInfo: {
    flex: 1,
  },
  patientName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#212121',
  },
  patientNumber: {
    fontSize: 14,
    color: '#757575',
    marginTop: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    minHeight: 300,
  },
  emptyText: {
    fontSize: 16,
    color: '#9E9E9E',
    marginTop: 16,
    textAlign: 'center',
  },
});
