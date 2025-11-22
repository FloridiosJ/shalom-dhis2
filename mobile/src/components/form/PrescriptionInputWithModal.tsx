import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {Button, IconButton} from 'react-native-paper';
import {PrescriptionItem} from '../../constants/medications';
import PrescriptionSubForm from './PrescriptionSubForm';

interface PrescriptionInputWithModalProps {
  prescriptions: PrescriptionItem[];
  onChange: (prescriptions: PrescriptionItem[]) => void;
  disabled?: boolean;
  error?: string;
}

export default function PrescriptionInputWithModal({
  prescriptions = [],
  onChange,
  disabled = false,
  error,
}: PrescriptionInputWithModalProps) {
  const [showModal, setShowModal] = useState(false);
  const [currentPrescription, setCurrentPrescription] =
    useState<PrescriptionItem>({
      id: '',
      medicament: '',
      dose: '',
      frequence: '',
      duree: '',
      notes: '',
    });

  const handleOpenModal = () => {
    if (!disabled) {
      setShowModal(true);
      // Reset form
      setCurrentPrescription({
        id: '',
        medicament: '',
        dose: '',
        frequence: '',
        duree: '',
        notes: '',
      });
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setCurrentPrescription({
      id: '',
      medicament: '',
      dose: '',
      frequence: '',
      duree: '',
      notes: '',
    });
  };

  const handleAddPrescription = () => {
    // Validation: médicament est obligatoire
    if (!currentPrescription.medicament.trim()) {
      // TODO: Show error toast or message
      return;
    }

    // Ajouter la prescription à la liste
    const newPrescription: PrescriptionItem = {
      ...currentPrescription,
      id: `temp-${Date.now()}`,
      ordre: prescriptions.length,
    };

    onChange([...prescriptions, newPrescription]);

    // Reset form mais ne pas fermer le modal pour permettre d'ajouter d'autres
    setCurrentPrescription({
      id: '',
      medicament: '',
      dose: '',
      frequence: '',
      duree: '',
      notes: '',
    });
  };

  const handleRemovePrescription = (id: string) => {
    onChange(prescriptions.filter(p => p.id !== id));
  };

  const getMedicationsSummary = () => {
    if (prescriptions.length === 0) {
      return 'Cliquez pour ajouter des médicaments';
    }
    if (prescriptions.length === 1) {
      return prescriptions[0].medicament;
    }
    return `${prescriptions.length} médicaments prescrits`;
  };

  return (
    <View style={styles.container}>
      {/* Label */}
      <Text style={styles.label}>
        Prescriptions structurées
        <Text style={styles.recommended}> (Recommandé pour analyse)</Text>
      </Text>

      {/* Input field that opens modal */}
      <TouchableOpacity
        onPress={handleOpenModal}
        disabled={disabled}
        style={[
          styles.input,
          disabled && styles.inputDisabled,
          error && styles.inputError,
        ]}>
        <Text
          style={[
            styles.inputText,
            prescriptions.length === 0 && styles.inputPlaceholder,
          ]}>
          {getMedicationsSummary()}
        </Text>
      </TouchableOpacity>

      {error && <Text style={styles.errorText}>{error}</Text>}

      {/* Liste des médicaments ajoutés */}
      {prescriptions.length > 0 && (
        <View style={styles.medicationsList}>
          {prescriptions.map(prescription => (
            <View key={prescription.id} style={styles.medicationItem}>
              <View style={styles.medicationContent}>
                <Text style={styles.medicationName}>
                  {prescription.medicament}
                </Text>
                {prescription.dose && (
                  <Text style={styles.medicationDetail}>
                    {' '}
                    - {prescription.dose}
                  </Text>
                )}
                {prescription.frequence && (
                  <Text style={styles.medicationDetail}>
                    {' '}
                    - {prescription.frequence}
                  </Text>
                )}
                {prescription.duree && (
                  <Text style={styles.medicationDetail}>
                    {' '}
                    ({prescription.duree})
                  </Text>
                )}
              </View>
              <IconButton
                icon="close"
                size={20}
                iconColor="#ef4444"
                onPress={() => handleRemovePrescription(prescription.id)}
              />
            </View>
          ))}
        </View>
      )}

      {/* Modal */}
      <Modal
        visible={showModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleCloseModal}>
        <KeyboardAvoidingView
          style={styles.modalContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Ajouter un médicament</Text>
            <IconButton
              icon="close"
              size={24}
              onPress={handleCloseModal}
              style={styles.closeButton}
            />
          </View>

          {/* Modal Content */}
          <ScrollView
            style={styles.modalContent}
            keyboardShouldPersistTaps="handled">
            <PrescriptionSubForm
              value={currentPrescription}
              onChange={setCurrentPrescription}
            />
          </ScrollView>

          {/* Modal Actions */}
          <View style={styles.modalActions}>
            <Button
              mode="contained"
              onPress={handleAddPrescription}
              style={styles.addButton}
              labelStyle={styles.addButtonLabel}>
              Ajouter
            </Button>
            <Button
              mode="outlined"
              onPress={handleCloseModal}
              style={styles.finishButton}
              labelStyle={styles.finishButtonLabel}>
              Terminer
            </Button>
          </View>
        </KeyboardAvoidingView>
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
    color: '#0f172a',
    marginBottom: 8,
  },
  recommended: {
    fontSize: 12,
    fontWeight: '400',
    color: '#64748b',
  },
  input: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 6,
    backgroundColor: '#fff',
    minHeight: 48,
    justifyContent: 'center',
  },
  inputDisabled: {
    backgroundColor: '#f1f5f9',
  },
  inputError: {
    borderColor: '#ef4444',
  },
  inputText: {
    fontSize: 14,
    color: '#1e293b',
  },
  inputPlaceholder: {
    color: '#94a3b8',
  },
  errorText: {
    fontSize: 12,
    color: '#ef4444',
    marginTop: 4,
  },
  medicationsList: {
    marginTop: 12,
  },
  medicationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 8,
    marginBottom: 8,
    backgroundColor: '#f8fafc',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  medicationContent: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  medicationName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0284c7',
  },
  medicationDetail: {
    fontSize: 14,
    color: '#64748b',
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
  closeButton: {
    margin: 0,
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  addButton: {
    flex: 1,
    backgroundColor: '#0284c7',
  },
  addButtonLabel: {
    fontSize: 16,
  },
  finishButton: {
    flex: 1,
    borderColor: '#64748b',
  },
  finishButtonLabel: {
    color: '#64748b',
    fontSize: 16,
  },
});
