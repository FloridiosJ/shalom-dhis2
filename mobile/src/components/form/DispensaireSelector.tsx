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
import {Dispensaire} from '@shared/types/consultation';

interface DispensaireSelectorProps {
  dispensaires: Dispensaire[];
  value?: string;
  onChange: (dispensaireId: string) => void;
  error?: string;
  disabled?: boolean;
}

export default function DispensaireSelector({
  dispensaires,
  value,
  onChange,
  error,
  disabled = false,
}: DispensaireSelectorProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const selectedDispensaire = dispensaires.find(d => d.id === value);

  const handleSelectDispensaire = useCallback(
    (dispensaire: Dispensaire) => {
      onChange(dispensaire.id);
      setModalVisible(false);
    },
    [onChange],
  );

  const renderDispensaireItem = useCallback(
    ({item}: {item: Dispensaire}) => (
      <TouchableOpacity
        style={[
          styles.dispensaireItem,
          item.id === value && styles.dispensaireItemSelected,
        ]}
        onPress={() => handleSelectDispensaire(item)}
        accessibilityRole={'button' as AccessibilityRole}
        accessibilityLabel={`Sélectionner ${item.name}`}
        accessibilityState={{selected: item.id === value}}>
        <View style={styles.dispensaireInfo}>
          <Text
            style={[
              styles.dispensaireName,
              item.id === value && styles.dispensaireNameSelected,
            ]}>
            {item.name}
          </Text>
          {item.code && (
            <Text style={styles.dispensaireCode}>{item.code}</Text>
          )}
        </View>
        {item.id === value && (
          <Icon name="check-circle" size={24} color="#0284c7" />
        )}
      </TouchableOpacity>
    ),
    [handleSelectDispensaire, value],
  );

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Dispensaire *</Text>

      <TouchableOpacity
        style={[
          styles.pickerButton,
          error && styles.pickerButtonError,
          disabled && styles.pickerButtonDisabled,
        ]}
        onPress={() => !disabled && setModalVisible(true)}
        disabled={disabled}
        accessibilityRole={'button' as AccessibilityRole}
        accessibilityLabel="Sélectionner un dispensaire"
        accessibilityState={{disabled}}>
        <View style={styles.pickerContent}>
          {selectedDispensaire ? (
            <>
              <Icon name="home-heart" size={20} color="#0284c7" />
              <Text style={styles.selectedDispensaireName}>
                {selectedDispensaire.name}
              </Text>
            </>
          ) : (
            <>
              <Icon name="home-heart" size={20} color="#9E9E9E" />
              <Text style={styles.placeholder}>Sélectionner…</Text>
            </>
          )}
          {!disabled && (
            <Icon
              name="chevron-down"
              size={20}
              color="#9E9E9E"
              style={styles.chevron}
            />
          )}
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
            <Text style={styles.modalTitle}>Sélectionner un dispensaire</Text>
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={styles.closeButton}
              accessibilityRole={'button' as AccessibilityRole}
              accessibilityLabel="Fermer">
              <Icon name="close" size={24} color="#000" />
            </TouchableOpacity>
          </View>

          <FlatList
            data={dispensaires}
            renderItem={renderDispensaireItem}
            keyExtractor={item => item.id}
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
  pickerButtonDisabled: {
    backgroundColor: '#F5F5F5',
    opacity: 0.6,
  },
  pickerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectedDispensaireName: {
    flex: 1,
    fontSize: 16,
    color: '#212121',
    fontWeight: '500',
    marginLeft: 8,
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
  dispensaireItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#FAFAFA',
    minHeight: 60,
  },
  dispensaireItemSelected: {
    backgroundColor: '#E3F2FD',
    borderWidth: 1,
    borderColor: '#0284c7',
  },
  dispensaireInfo: {
    flex: 1,
  },
  dispensaireName: {
    fontSize: 16,
    color: '#212121',
    fontWeight: '500',
  },
  dispensaireNameSelected: {
    color: '#0284c7',
    fontWeight: '600',
  },
  dispensaireCode: {
    fontSize: 14,
    color: '#757575',
    marginTop: 2,
  },
});
