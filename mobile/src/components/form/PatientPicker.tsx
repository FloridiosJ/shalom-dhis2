import React, {useState, useCallback, useRef} from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  AccessibilityRole,
} from 'react-native';
import {Text, TextInput, Button} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {PatientOption} from '../../types/consultation';
import BottomSheetWrapper, {
  BottomSheetWrapperRef,
} from '../common/BottomSheetWrapper';
import {BottomSheetFlatList} from '@gorhom/bottom-sheet';

interface PatientPickerProps {
  value: string | null;
  onChange: (patientId: string | null) => void;
  onCreatePatient: () => void;
  error?: string;
  patients: PatientOption[];
  onSearchPatients: (query: string) => void;
  loading?: boolean;
}

export default function PatientPicker({
  value,
  onChange,
  onCreatePatient,
  error,
  patients,
  onSearchPatients,
  loading,
}: PatientPickerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const bottomSheetRef = useRef<BottomSheetWrapperRef>(null);
  const selectedPatient = patients.find(p => p.id === value);

  const handleSearch = useCallback(
    (text: string) => {
      setSearchQuery(text);
      onSearchPatients(text);
    },
    [onSearchPatients],
  );

  const handleSelectPatient = useCallback(
    (patient: PatientOption) => {
      onChange(patient.id);
      bottomSheetRef.current?.close();
      setSearchQuery('');
    },
    [onChange],
  );

  const handleClear = useCallback(() => {
    onChange(null);
  }, [onChange]);

  const handleOpenBottomSheet = useCallback(() => {
    bottomSheetRef.current?.open();
  }, []);

  const handleCloseBottomSheet = useCallback(() => {
    setSearchQuery('');
  }, []);

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

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Patient *</Text>

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
        onPress={onCreatePatient}
        style={styles.createButton}
        labelStyle={styles.createButtonLabel}
        icon="plus-circle"
        accessibilityRole={'button' as AccessibilityRole}
        accessibilityLabel="Créer un nouveau patient">
        Créer un nouveau patient
      </Button>

      <BottomSheetWrapper
        ref={bottomSheetRef}
        snapPoints={['75%', '90%']}
        enableDynamicSizing={false}
        onClose={handleCloseBottomSheet}
        keyboardBehavior="interactive">
        <View style={styles.bottomSheetContent}>
          <View style={styles.bottomSheetHeader}>
            <Text style={styles.bottomSheetTitle}>Sélectionner un patient</Text>
            <TouchableOpacity
              onPress={() => bottomSheetRef.current?.close()}
              style={styles.closeButton}
              accessibilityRole={'button' as AccessibilityRole}
              accessibilityLabel="Fermer">
              <Icon name="close" size={24} color="#000" />
            </TouchableOpacity>
          </View>

          <View style={styles.searchContainer}>
            <TextInput
              mode="outlined"
              placeholder="Rechercher par nom ou numéro..."
              value={searchQuery}
              onChangeText={handleSearch}
              left={<TextInput.Icon icon="magnify" />}
              style={styles.searchInput}
              accessibilityLabel="Rechercher un patient"
            />
          </View>

          <BottomSheetFlatList
            data={patients}
            renderItem={renderPatientItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContainer}
            keyboardShouldPersistTaps="handled"
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Icon
                  name="account-search-outline"
                  size={64}
                  color="#9E9E9E"
                />
                <Text style={styles.emptyText}>
                  {loading
                    ? 'Recherche en cours...'
                    : searchQuery
                    ? 'Aucun patient trouvé'
                    : 'Saisissez un nom ou numéro'}
                </Text>
              </View>
            }
          />
        </View>
      </BottomSheetWrapper>
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
  bottomSheetContent: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  bottomSheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  bottomSheetTitle: {
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
  searchInput: {
    backgroundColor: '#FFFFFF',
  },
  listContainer: {
    flexGrow: 1,
    paddingBottom: 16,
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
    minHeight: 200,
  },
  emptyText: {
    fontSize: 16,
    color: '#9E9E9E',
    marginTop: 16,
    textAlign: 'center',
  },
});
