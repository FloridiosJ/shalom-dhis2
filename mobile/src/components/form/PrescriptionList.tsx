import React, {useState, useCallback} from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Platform,
  FlatList,
  AccessibilityRole,
} from 'react-native';
import {Text, TextInput, Button, Divider} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {PrescriptionItem} from '@shared/types/consultation';
import {
  COMMON_MEDICATIONS,
  COMMON_FREQUENCIES,
  COMMON_DURATIONS,
} from '@shared/constants/medications';

interface PrescriptionListProps {
  items: PrescriptionItem[];
  onChange: (items: PrescriptionItem[]) => void;
}

export default function PrescriptionList({
  items,
  onChange,
}: PrescriptionListProps) {
  const [editingItem, setEditingItem] = useState<PrescriptionItem | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [showMedicationSuggestions, setShowMedicationSuggestions] = useState(false);
  const [showFrequencySuggestions, setShowFrequencySuggestions] = useState(false);
  const [showDurationSuggestions, setShowDurationSuggestions] = useState(false);

  const handleAddItem = useCallback(() => {
    const newItem: PrescriptionItem = {
      id: `temp-${Date.now()}`,
      medicament: '',
      dose: '',
      frequence: '',
      duree: '',
      notes: '',
      ordre: items.length,
    };
    setEditingItem(newItem);
    setModalVisible(true);
  }, [items.length]);

  const handleEditItem = useCallback((item: PrescriptionItem) => {
    setEditingItem({...item});
    setModalVisible(true);
  }, []);

  const handleRemoveItem = useCallback(
    (itemId?: string) => {
      onChange(items.filter(item => item.id !== itemId));
    },
    [items, onChange],
  );

  const handleSaveItem = useCallback(() => {
    if (!editingItem || !editingItem.medicament.trim()) {
      return;
    }

    const existingIndex = items.findIndex(i => i.id === editingItem.id);
    if (existingIndex >= 0) {
      // Update existing
      const updatedItems = [...items];
      updatedItems[existingIndex] = editingItem;
      onChange(updatedItems);
    } else {
      // Add new
      onChange([...items, editingItem]);
    }

    setEditingItem(null);
    setModalVisible(false);
  }, [editingItem, items, onChange]);

  const handleFieldChange = useCallback(
    (field: keyof PrescriptionItem, value: string) => {
      if (editingItem) {
        setEditingItem({...editingItem, [field]: value});
      }
    },
    [editingItem],
  );

  const filteredMedications = COMMON_MEDICATIONS.filter(med =>
    med.toLowerCase().includes((editingItem?.medicament || '').toLowerCase())
  ).slice(0, 5);

  const filteredFrequencies = COMMON_FREQUENCIES.filter(freq =>
    freq.toLowerCase().includes((editingItem?.frequence || '').toLowerCase())
  ).slice(0, 5);

  const filteredDurations = COMMON_DURATIONS.filter(dur =>
    dur.toLowerCase().includes((editingItem?.duree || '').toLowerCase())
  ).slice(0, 5);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        Prescriptions structurées
        <Text style={styles.labelOptional}> (Recommandé pour analyse)</Text>
      </Text>

      {/* List of prescription items */}
      {items.length > 0 && (
        <View style={styles.itemsList}>
          {items.map((item, index) => (
            <View key={item.id} style={styles.itemCard}>
              <View style={styles.itemHeader}>
                <Text style={styles.itemTitle}>Médicament #{index + 1}</Text>
                <View style={styles.itemActions}>
                  <TouchableOpacity
                    onPress={() => handleEditItem(item)}
                    style={styles.actionButton}
                    accessibilityRole={'button' as AccessibilityRole}
                    accessibilityLabel="Modifier">
                    <Icon name="pencil" size={18} color="#0284c7" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleRemoveItem(item.id)}
                    style={styles.actionButton}
                    accessibilityRole={'button' as AccessibilityRole}
                    accessibilityLabel="Supprimer">
                    <Icon name="close" size={18} color="#D32F2F" />
                  </TouchableOpacity>
                </View>
              </View>
              <View style={styles.itemContent}>
                <Text style={styles.itemMedicament}>{item.medicament}</Text>
                {item.dose && (
                  <Text style={styles.itemDetail}>Dose: {item.dose}</Text>
                )}
                {item.frequence && (
                  <Text style={styles.itemDetail}>
                    Fréquence: {item.frequence}
                  </Text>
                )}
                {item.duree && (
                  <Text style={styles.itemDetail}>Durée: {item.duree}</Text>
                )}
                {item.notes && (
                  <Text style={styles.itemNotes}>Note: {item.notes}</Text>
                )}
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Add medication button */}
      <Button
        mode="outlined"
        onPress={handleAddItem}
        icon="plus"
        style={styles.addButton}
        labelStyle={styles.addButtonLabel}
        accessibilityRole={'button' as AccessibilityRole}
        accessibilityLabel="Ajouter un médicament">
        Ajouter un médicament
      </Button>

      {/* Edit/Add Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
        presentationStyle={Platform.OS === 'ios' ? 'pageSheet' : 'fullScreen'}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {editingItem?.id?.startsWith('temp-') ? 'Ajouter' : 'Modifier'} un
              médicament
            </Text>
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={styles.closeButton}
              accessibilityRole={'button' as AccessibilityRole}
              accessibilityLabel="Fermer">
              <Icon name="close" size={24} color="#000" />
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            {/* Medicament field with autocomplete */}
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Médicament *</Text>
              <TextInput
                mode="outlined"
                placeholder="Ex: Paracétamol"
                value={editingItem?.medicament || ''}
                onChangeText={text => {
                  handleFieldChange('medicament', text);
                  setShowMedicationSuggestions(text.length > 0);
                }}
                onFocus={() =>
                  setShowMedicationSuggestions(
                    (editingItem?.medicament || '').length > 0
                  )
                }
                style={styles.input}
              />
              {showMedicationSuggestions && filteredMedications.length > 0 && (
                <View style={styles.suggestionsContainer}>
                  {filteredMedications.map(med => (
                    <TouchableOpacity
                      key={med}
                      style={styles.suggestionItem}
                      onPress={() => {
                        handleFieldChange('medicament', med);
                        setShowMedicationSuggestions(false);
                      }}>
                      <Text style={styles.suggestionText}>{med}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {/* Dose field */}
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Dose</Text>
              <TextInput
                mode="outlined"
                placeholder="Ex: 500mg, 2 comprimés"
                value={editingItem?.dose || ''}
                onChangeText={text => handleFieldChange('dose', text)}
                style={styles.input}
              />
            </View>

            {/* Frequence field with autocomplete */}
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Fréquence</Text>
              <TextInput
                mode="outlined"
                placeholder="Ex: 3x/jour"
                value={editingItem?.frequence || ''}
                onChangeText={text => {
                  handleFieldChange('frequence', text);
                  setShowFrequencySuggestions(text.length > 0);
                }}
                onFocus={() =>
                  setShowFrequencySuggestions(
                    (editingItem?.frequence || '').length > 0
                  )
                }
                style={styles.input}
              />
              {showFrequencySuggestions && filteredFrequencies.length > 0 && (
                <View style={styles.suggestionsContainer}>
                  {filteredFrequencies.map(freq => (
                    <TouchableOpacity
                      key={freq}
                      style={styles.suggestionItem}
                      onPress={() => {
                        handleFieldChange('frequence', freq);
                        setShowFrequencySuggestions(false);
                      }}>
                      <Text style={styles.suggestionText}>{freq}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {/* Duree field with autocomplete */}
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Durée</Text>
              <TextInput
                mode="outlined"
                placeholder="Ex: 7 jours"
                value={editingItem?.duree || ''}
                onChangeText={text => {
                  handleFieldChange('duree', text);
                  setShowDurationSuggestions(text.length > 0);
                }}
                onFocus={() =>
                  setShowDurationSuggestions((editingItem?.duree || '').length > 0)
                }
                style={styles.input}
              />
              {showDurationSuggestions && filteredDurations.length > 0 && (
                <View style={styles.suggestionsContainer}>
                  {filteredDurations.map(dur => (
                    <TouchableOpacity
                      key={dur}
                      style={styles.suggestionItem}
                      onPress={() => {
                        handleFieldChange('duree', dur);
                        setShowDurationSuggestions(false);
                      }}>
                      <Text style={styles.suggestionText}>{dur}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {/* Notes field */}
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Notes</Text>
              <TextInput
                mode="outlined"
                placeholder="Précisions pour ce médicament"
                value={editingItem?.notes || ''}
                onChangeText={text => handleFieldChange('notes', text)}
                multiline
                numberOfLines={3}
                style={styles.input}
              />
            </View>
          </View>

          {/* Save button */}
          <View style={styles.modalFooter}>
            <Button
              mode="contained"
              onPress={handleSaveItem}
              disabled={!editingItem?.medicament.trim()}
              style={styles.saveButton}
              labelStyle={styles.saveButtonLabel}>
              Enregistrer
            </Button>
          </View>
        </View>
      </Modal>
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
  labelOptional: {
    fontSize: 12,
    fontWeight: '400',
    color: '#757575',
  },
  itemsList: {
    marginBottom: 12,
  },
  itemCard: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0284c7',
  },
  itemActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 4,
    minHeight: 32,
    minWidth: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemContent: {
    gap: 4,
  },
  itemMedicament: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 4,
  },
  itemDetail: {
    fontSize: 14,
    color: '#424242',
  },
  itemNotes: {
    fontSize: 14,
    color: '#757575',
    fontStyle: 'italic',
    marginTop: 4,
  },
  addButton: {
    borderColor: '#0284c7',
    borderWidth: 1,
  },
  addButtonLabel: {
    color: '#0284c7',
    fontSize: 14,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
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
  modalContent: {
    flex: 1,
    padding: 16,
  },
  fieldContainer: {
    marginBottom: 16,
    position: 'relative',
    zIndex: 1,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#424242',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
  },
  suggestionsContainer: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 4,
    marginTop: 4,
    maxHeight: 200,
    zIndex: 1000,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  suggestionItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  suggestionText: {
    fontSize: 14,
    color: '#212121',
  },
  modalFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  saveButton: {
    backgroundColor: '#0284c7',
  },
  saveButtonLabel: {
    fontSize: 16,
  },
});
