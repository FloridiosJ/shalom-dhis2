import React, {useState, useCallback} from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Modal,
  Platform,
  AccessibilityRole,
} from 'react-native';
import {Text} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {
  TYPES_CONSULTATION,
  getConsultationTypesByGender,
  ConsultationType,
} from '@shared/constants/typeConsultations';

interface TypeConsultationPickerProps {
  value: string;
  onChange: (typeCode: string) => void;
  error?: string;
  patientSexe?: 'M' | 'F' | 'L';
}

export default function TypeConsultationPicker({
  value,
  onChange,
  error,
  patientSexe,
}: TypeConsultationPickerProps) {
  const [modalVisible, setModalVisible] = useState(false);
  
  // Filter types based on patient gender
  const availableTypes = getConsultationTypesByGender(patientSexe);
  const selectedType = TYPES_CONSULTATION.find(t => t.code === value);

  const handleSelectType = useCallback(
    (type: ConsultationType) => {
      onChange(type.code);
      setModalVisible(false);
    },
    [onChange],
  );

  const renderTypeItem = useCallback(
    ({item}: {item: ConsultationType}) => (
      <TouchableOpacity
        style={[
          styles.typeItem,
          item.code === value && styles.typeItemSelected,
        ]}
        onPress={() => handleSelectType(item)}
        accessibilityRole={'button' as AccessibilityRole}
        accessibilityLabel={`Sélectionner ${item.label}`}
        accessibilityState={{selected: item.code === value}}>
        <Text style={styles.typeIcon}>{item.icon}</Text>
        <View style={styles.typeInfo}>
          <Text style={[
            styles.typeName,
            item.code === value && styles.typeNameSelected,
          ]}>
            {item.label}
          </Text>
        </View>
        {item.code === value && (
          <Icon name="check-circle" size={24} color="#0284c7" />
        )}
      </TouchableOpacity>
    ),
    [handleSelectType, value],
  );

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Type de consultation *</Text>

      <TouchableOpacity
        style={[styles.pickerButton, error && styles.pickerButtonError]}
        onPress={() => setModalVisible(true)}
        accessibilityRole={'button' as AccessibilityRole}
        accessibilityLabel="Sélectionner le type de consultation">
        <View style={styles.pickerContent}>
          {selectedType ? (
            <>
              <Text style={styles.typeIconSmall}>{selectedType.icon}</Text>
              <Text style={styles.selectedTypeName}>{selectedType.label}</Text>
            </>
          ) : (
            <>
              <Icon name="clipboard-text-outline" size={20} color="#9E9E9E" />
              <Text style={styles.placeholder}>Sélectionner un type</Text>
            </>
          )}
          <Icon 
            name="chevron-down" 
            size={20} 
            color="#9E9E9E" 
            style={styles.chevron}
          />
        </View>
      </TouchableOpacity>

      {error && <Text style={styles.errorText}>{error}</Text>}

      <Modal
        visible={modalVisible}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
        presentationStyle={Platform.OS === 'ios' ? 'pageSheet' : 'fullScreen'}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Type de consultation</Text>
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={styles.closeButton}
              accessibilityRole={'button' as AccessibilityRole}
              accessibilityLabel="Fermer">
              <Icon name="close" size={24} color="#000" />
            </TouchableOpacity>
          </View>

          <FlatList
            data={availableTypes}
            renderItem={renderTypeItem}
            keyExtractor={item => item.code}
            contentContainerStyle={styles.listContainer}
          />
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
  typeIconSmall: {
    fontSize: 18,
    marginRight: 8,
  },
  selectedTypeName: {
    flex: 1,
    fontSize: 16,
    color: '#212121',
    fontWeight: '500',
  },
  placeholder: {
    flex: 1,
    fontSize: 16,
    color: '#9E9E9E',
    marginLeft: 8,
  },
  chevron: {
    marginLeft: 'auto',
  },
  errorText: {
    fontSize: 12,
    color: '#D32F2F',
    marginTop: 4,
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
  listContainer: {
    padding: 8,
  },
  typeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#FAFAFA',
    minHeight: 60,
  },
  typeItemSelected: {
    backgroundColor: '#E3F2FD',
    borderWidth: 1,
    borderColor: '#0284c7',
  },
  typeIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  typeInfo: {
    flex: 1,
  },
  typeName: {
    fontSize: 16,
    color: '#212121',
    fontWeight: '500',
  },
  typeNameSelected: {
    color: '#0284c7',
    fontWeight: '600',
  },
});
