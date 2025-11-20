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
import {Text, TextInput} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {
  TYPES_CONSULTATION,
  getActiveConsultationTypes,
  ConsultationType,
} from '../../constants/consultationTypes';

interface ConsultationPickerProps {
  value: string | null;
  onChange: (code: string | null) => void;
  error?: string;
  required?: boolean;
}

export default function ConsultationPicker({
  value,
  onChange,
  error,
  required = false,
}: ConsultationPickerProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const activeTypes = getActiveConsultationTypes();
  const selectedType = TYPES_CONSULTATION.find(t => t.code === value);

  // Filter types based on search query
  const filteredTypes = searchQuery
    ? activeTypes.filter(
        type =>
          type.libelle.toLowerCase().includes(searchQuery.toLowerCase()) ||
          type.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          type.code.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : activeTypes;

  const handleSelectType = useCallback(
    (type: ConsultationType) => {
      onChange(type.code);
      setModalVisible(false);
      setSearchQuery('');
    },
    [onChange],
  );

  const handleClear = useCallback(() => {
    onChange(null);
  }, [onChange]);

  const renderTypeItem = useCallback(
    ({item}: {item: ConsultationType}) => (
      <TouchableOpacity
        style={styles.typeItem}
        onPress={() => handleSelectType(item)}
        accessibilityRole={'button' as AccessibilityRole}
        accessibilityLabel={`Sélectionner ${item.libelle}`}>
        <View style={styles.typeInfo}>
          <Text style={styles.typeName}>{item.libelle}</Text>
        </View>
        <Icon name="chevron-right" size={24} color="#9E9E9E" />
      </TouchableOpacity>
    ),
    [handleSelectType],
  );

  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        Type de consultation {required && '*'}
      </Text>

      <TouchableOpacity
        style={[styles.selector, error ? styles.selectorError : null]}
        onPress={() => setModalVisible(true)}
        accessibilityRole={'button' as AccessibilityRole}
        accessibilityLabel="Sélectionner un type de consultation">
        <View style={styles.selectorContent}>
          {selectedType ? (
            <View style={styles.selectedInfo}>
              <Text style={styles.selectedLabel}>{selectedType.libelle}</Text>
              <Text style={styles.selectedDescription}>
                {selectedType.description}
              </Text>
            </View>
          ) : (
            <Text style={styles.placeholder} numberOfLines={1} ellipsizeMode="tail">
              Sélectionner un type de consultation
            </Text>
          )}
        </View>
        <View style={styles.selectorIcons}>
          {selectedType && (
            <TouchableOpacity
              onPress={handleClear}
              style={styles.clearButton}
              accessibilityRole={'button' as AccessibilityRole}
              accessibilityLabel="Effacer la sélection">
              <Icon name="close-circle" size={20} color="#757575" />
            </TouchableOpacity>
          )}
          <Icon name="chevron-down" size={24} color="#757575" />
        </View>
      </TouchableOpacity>

      {error && <Text style={styles.errorText}>{error}</Text>}

      <Modal
        visible={modalVisible}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
        transparent={false}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Type de consultation</Text>
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={styles.closeButton}
              accessibilityRole={'button' as AccessibilityRole}
              accessibilityLabel="Fermer">
              <Icon name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <View style={styles.searchContainer}>
            <TextInput
              mode="outlined"
              placeholder="Rechercher un type..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={styles.searchInput}
              left={<TextInput.Icon icon="magnify" />}
              accessibilityLabel="Rechercher un type de consultation"
            />
          </View>

          <FlatList
            data={filteredTypes}
            renderItem={renderTypeItem}
            keyExtractor={item => item.code}
            style={styles.list}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Aucun type trouvé</Text>
              </View>
            }
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
    color: '#333',
    fontWeight: '500',
    marginBottom: 8,
  },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 4,
    padding: 12,
    backgroundColor: '#FFFFFF',
    minHeight: 56,
  },
  selectorError: {
    borderColor: '#D32F2F',
  },
  selectorContent: {
    flex: 1,
  },
  selectedInfo: {
    flex: 1,
  },
  selectedLabel: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
    marginBottom: 2,
  },
  selectedDescription: {
    fontSize: 12,
    color: '#757575',
  },
  placeholder: {
    fontSize: 16,
    color: '#9E9E9E',
  },
  selectorIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  clearButton: {
    padding: 4,
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
    backgroundColor: '#FFFFFF',
    ...Platform.select({
      ios: {
        paddingTop: 50,
      },
      android: {
        paddingTop: 16,
      },
    }),
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 8,
  },
  searchContainer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  searchInput: {
    backgroundColor: '#FFFFFF',
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 16,
  },
  typeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
  },
  typeInfo: {
    flex: 1,
    marginRight: 12,
  },
  typeName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  typeDescription: {
    fontSize: 14,
    color: '#757575',
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#9E9E9E',
  },
});
