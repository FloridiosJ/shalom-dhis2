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
  CATEGORIES_MALADIES,
  CategorieMaladie,
  CategorieSubMaladie,
  getCategorieByCode,
  getSubCategorieByCode,
} from '../../constants/categoriesMaladies';

interface CategoriePickerProps {
  value: string | null; // Format: "CATEGORIE_CODE:SUBCATEGORIE_CODE"
  onChange: (value: string | null) => void;
  error?: string;
  required?: boolean;
}

export default function CategoriePicker({
  value,
  onChange,
  error,
  required = false,
}: CategoriePickerProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedMainCategory, setSelectedMainCategory] =
    useState<CategorieMaladie | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Parse current value
  const parseValue = () => {
    if (!value) return {mainCode: null, subCode: null};
    const [mainCode, subCode] = value.split(':');
    return {mainCode, subCode};
  };

  const {mainCode, subCode} = parseValue();
  const currentMainCategory = mainCode ? getCategorieByCode(mainCode) : null;
  const currentSubCategory =
    mainCode && subCode
      ? getSubCategorieByCode(mainCode, subCode)
      : null;

  // Filter categories based on search query
  const filteredMainCategories = searchQuery
    ? CATEGORIES_MALADIES.filter(
        cat =>
          cat.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
          cat.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          cat.code.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : CATEGORIES_MALADIES;

  const filteredSubCategories =
    selectedMainCategory && searchQuery
      ? selectedMainCategory.sousCategories.filter(
          sub =>
            sub.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
            sub.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            sub.code.toLowerCase().includes(searchQuery.toLowerCase()),
        )
      : selectedMainCategory?.sousCategories || [];

  const handleSelectMainCategory = useCallback((category: CategorieMaladie) => {
    setSelectedMainCategory(category);
    setSearchQuery('');
  }, []);

  const handleSelectSubCategory = useCallback(
    (subCategory: CategorieSubMaladie) => {
      if (selectedMainCategory) {
        const fullValue = `${selectedMainCategory.code}:${subCategory.code}`;
        onChange(fullValue);
        setModalVisible(false);
        setSelectedMainCategory(null);
        setSearchQuery('');
      }
    },
    [selectedMainCategory, onChange],
  );

  const handleBack = useCallback(() => {
    setSelectedMainCategory(null);
    setSearchQuery('');
  }, []);

  const handleClear = useCallback(() => {
    onChange(null);
  }, [onChange]);

  const handleCloseModal = useCallback(() => {
    setModalVisible(false);
    setSelectedMainCategory(null);
    setSearchQuery('');
  }, []);

  const renderMainCategoryItem = useCallback(
    ({item}: {item: CategorieMaladie}) => (
      <TouchableOpacity
        style={styles.categoryItem}
        onPress={() => handleSelectMainCategory(item)}
        accessibilityRole={'button' as AccessibilityRole}
        accessibilityLabel={`Sélectionner ${item.nom}`}>
        <View style={styles.categoryInfo}>
          <Text style={styles.categoryName}>{item.nom}</Text>
          <Text style={styles.categoryDescription}>{item.description}</Text>
          <Text style={styles.categoryCount}>
            {item.sousCategories.length} sous-catégories
          </Text>
        </View>
        <Icon name="chevron-right" size={24} color="#9E9E9E" />
      </TouchableOpacity>
    ),
    [handleSelectMainCategory],
  );

  const renderSubCategoryItem = useCallback(
    ({item}: {item: CategorieSubMaladie}) => (
      <TouchableOpacity
        style={styles.categoryItem}
        onPress={() => handleSelectSubCategory(item)}
        accessibilityRole={'button' as AccessibilityRole}
        accessibilityLabel={`Sélectionner ${item.nom}`}>
        <View style={styles.categoryInfo}>
          <Text style={styles.categoryName}>{item.nom}</Text>
          <Text style={styles.categoryDescription}>{item.description}</Text>
        </View>
        <Icon name="check-circle-outline" size={24} color="#1976D2" />
      </TouchableOpacity>
    ),
    [handleSelectSubCategory],
  );

  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        Catégorie de maladie {required && '*'}
      </Text>

      <TouchableOpacity
        style={[styles.selector, error ? styles.selectorError : null]}
        onPress={() => setModalVisible(true)}
        accessibilityRole={'button' as AccessibilityRole}
        accessibilityLabel="Sélectionner une catégorie de maladie">
        <View style={styles.selectorContent}>
          {currentMainCategory && currentSubCategory ? (
            <View style={styles.selectedInfo}>
              <Text style={styles.selectedLabel}>
                {currentMainCategory.nom} → {currentSubCategory.nom}
              </Text>
              <Text style={styles.selectedDescription}>
                {currentSubCategory.description}
              </Text>
            </View>
          ) : (
            <Text style={styles.placeholder}>
              Sélectionner une catégorie de maladie
            </Text>
          )}
        </View>
        <View style={styles.selectorIcons}>
          {currentMainCategory && currentSubCategory && (
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
        onRequestClose={handleCloseModal}
        transparent={false}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            {selectedMainCategory && (
              <TouchableOpacity
                onPress={handleBack}
                style={styles.backButton}
                accessibilityRole={'button' as AccessibilityRole}
                accessibilityLabel="Retour">
                <Icon name="arrow-left" size={24} color="#333" />
              </TouchableOpacity>
            )}
            <Text style={styles.modalTitle}>
              {selectedMainCategory
                ? selectedMainCategory.nom
                : 'Catégorie de maladie'}
            </Text>
            <TouchableOpacity
              onPress={handleCloseModal}
              style={styles.closeButton}
              accessibilityRole={'button' as AccessibilityRole}
              accessibilityLabel="Fermer">
              <Icon name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <View style={styles.searchContainer}>
            <TextInput
              mode="outlined"
              placeholder={
                selectedMainCategory
                  ? 'Rechercher une sous-catégorie...'
                  : 'Rechercher une catégorie...'
              }
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={styles.searchInput}
              left={<TextInput.Icon icon="magnify" />}
              accessibilityLabel="Rechercher"
            />
          </View>

          {selectedMainCategory ? (
            <FlatList
              data={filteredSubCategories}
              renderItem={renderSubCategoryItem}
              keyExtractor={item => item.code}
              style={styles.list}
              contentContainerStyle={styles.listContent}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>
                    Aucune sous-catégorie trouvée
                  </Text>
                </View>
              }
            />
          ) : (
            <FlatList
              data={filteredMainCategories}
              renderItem={renderMainCategoryItem}
              keyExtractor={item => item.code}
              style={styles.list}
              contentContainerStyle={styles.listContent}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>Aucune catégorie trouvée</Text>
                </View>
              }
            />
          )}
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
    color: '#1976D2',
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
    flex: 1,
    textAlign: 'center',
  },
  backButton: {
    padding: 8,
    position: 'absolute',
    left: 8,
    zIndex: 1,
    ...Platform.select({
      ios: {
        top: 42,
      },
      android: {
        top: 8,
      },
    }),
  },
  closeButton: {
    padding: 8,
    position: 'absolute',
    right: 8,
    zIndex: 1,
    ...Platform.select({
      ios: {
        top: 42,
      },
      android: {
        top: 8,
      },
    }),
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
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
  },
  categoryInfo: {
    flex: 1,
    marginRight: 12,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  categoryDescription: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 2,
  },
  categoryCount: {
    fontSize: 12,
    color: '#1976D2',
    marginTop: 4,
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
