import React, {useState} from 'react';
import {View, Text, StyleSheet, FlatList, TouchableOpacity, Modal} from 'react-native';
import {TextInput, IconButton} from 'react-native-paper';
import {COMMON_MEDICATIONS} from '../../constants/medications';

interface MedicationPickerProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export default function MedicationPicker({
  value,
  onChange,
  disabled = false,
}: MedicationPickerProps) {
  const [showPicker, setShowPicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredMedications = COMMON_MEDICATIONS.filter(med =>
    med.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleSelect = (medication: string) => {
    onChange(medication);
    setShowPicker(false);
    setSearchQuery('');
  };

  const handleClear = () => {
    onChange('');
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={() => !disabled && setShowPicker(true)}
        disabled={disabled}
        style={[styles.input, disabled && styles.inputDisabled]}>
        <Text
          style={[
            styles.inputText,
            !value && styles.placeholder,
          ]}>
          {value || 'Sélectionner un médicament'}
        </Text>
        {value && !disabled && (
          <IconButton
            icon="close"
            size={20}
            onPress={handleClear}
            style={styles.clearButton}
          />
        )}
      </TouchableOpacity>

      <Modal
        visible={showPicker}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowPicker(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Sélectionner un médicament</Text>
            <IconButton
              icon="close"
              size={24}
              onPress={() => setShowPicker(false)}
            />
          </View>

          <View style={styles.searchContainer}>
            <TextInput
              mode="outlined"
              placeholder="Rechercher..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={styles.searchInput}
              left={<TextInput.Icon icon="magnify" />}
              outlineColor="#cbd5e1"
              activeOutlineColor="#0284c7"
            />
          </View>

          <FlatList
            data={filteredMedications}
            keyExtractor={item => item}
            renderItem={({item}) => (
              <TouchableOpacity
                style={styles.listItem}
                onPress={() => handleSelect(item)}>
                <Text style={styles.listItemText}>{item}</Text>
                {value === item && (
                  <IconButton icon="check" size={20} iconColor="#0284c7" />
                )}
              </TouchableOpacity>
            )}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 0,
  },
  input: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 4,
    backgroundColor: '#fff',
    minHeight: 56,
  },
  inputDisabled: {
    backgroundColor: '#f1f5f9',
  },
  inputText: {
    fontSize: 16,
    color: '#1e293b',
    flex: 1,
  },
  placeholder: {
    color: '#94a3b8',
  },
  clearButton: {
    margin: 0,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0f172a',
    flex: 1,
  },
  searchContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  searchInput: {
    backgroundColor: '#fff',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  listItemText: {
    fontSize: 16,
    color: '#1e293b',
    flex: 1,
  },
  separator: {
    height: 1,
    backgroundColor: '#e2e8f0',
  },
});
