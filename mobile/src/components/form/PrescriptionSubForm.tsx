import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {TextInput} from 'react-native-paper';
import {PrescriptionItem} from '../../constants/medications';
import MedicationPicker from './MedicationPicker';
import FrequencyPicker from './FrequencyPicker';
import DurationPicker from './DurationPicker';

interface PrescriptionSubFormProps {
  value: PrescriptionItem;
  onChange: (value: PrescriptionItem) => void;
  showLabels?: boolean;
  disabled?: boolean;
}

export default function PrescriptionSubForm({
  value,
  onChange,
  showLabels = true,
  disabled = false,
}: PrescriptionSubFormProps) {
  const handleFieldChange = (field: keyof PrescriptionItem, fieldValue: any) => {
    onChange({...value, [field]: fieldValue});
  };

  return (
    <View style={styles.container}>
      {/* Médicament - OBLIGATOIRE */}
      <View style={styles.field}>
        {showLabels && (
          <Text style={styles.label}>
            Médicament <Text style={styles.required}>*</Text>
          </Text>
        )}
        <MedicationPicker
          value={value.medicament || ''}
          onChange={val => handleFieldChange('medicament', val)}
          disabled={disabled}
        />
      </View>

      {/* Dose */}
      <View style={styles.field}>
        {showLabels && <Text style={styles.label}>Dose</Text>}
        <TextInput
          mode="outlined"
          value={value.dose || ''}
          onChangeText={val => handleFieldChange('dose', val)}
          placeholder="Ex: 500mg, 2 comprimés..."
          disabled={disabled}
          style={styles.input}
          outlineColor="#cbd5e1"
          activeOutlineColor="#0284c7"
        />
      </View>

      {/* Fréquence */}
      <View style={styles.field}>
        {showLabels && <Text style={styles.label}>Fréquence</Text>}
        <FrequencyPicker
          value={value.frequence || ''}
          onChange={val => handleFieldChange('frequence', val)}
          disabled={disabled}
        />
      </View>

      {/* Durée */}
      <View style={styles.field}>
        {showLabels && <Text style={styles.label}>Durée</Text>}
        <DurationPicker
          value={value.duree || ''}
          onChange={val => handleFieldChange('duree', val)}
          disabled={disabled}
        />
      </View>

      {/* Notes */}
      <View style={styles.field}>
        {showLabels && <Text style={styles.label}>Notes</Text>}
        <TextInput
          mode="outlined"
          value={value.notes || ''}
          onChangeText={val => handleFieldChange('notes', val)}
          placeholder="Précisions pour ce médicament..."
          disabled={disabled}
          multiline
          numberOfLines={2}
          style={styles.input}
          outlineColor="#cbd5e1"
          activeOutlineColor="#0284c7"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
  },
  field: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#475569',
    marginBottom: 6,
  },
  required: {
    color: '#dc2626',
  },
  input: {
    backgroundColor: '#fff',
  },
});
