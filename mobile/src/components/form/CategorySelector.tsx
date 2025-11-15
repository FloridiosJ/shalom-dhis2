import React, {useState, useCallback} from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Modal,
  Platform,
  AccessibilityRole,
  ScrollView,
} from 'react-native';
import {Text, TextInput, Button, Chip} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {CategoryWithMeta, CategorieMaladie} from '@shared/types/consultation';

interface CategorySelectorProps {
  categories: CategorieMaladie[];
  selectedCategories: CategoryWithMeta[];
  onChange: (categories: CategoryWithMeta[]) => void;
  error?: string;
}

export default function CategorySelector({
  categories,
  selectedCategories,
  onChange,
  error,
}: CategorySelectorProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingNotes, setEditingNotes] = useState<{[key: string]: string}>({});

  // Initialize notes from selected categories
  React.useEffect(() => {
    const notes: {[key: string]: string} = {};
    selectedCategories.forEach(cat => {
      notes[cat.categorieMaladieId] = cat.notes || '';
    });
    setEditingNotes(notes);
  }, [selectedCategories]);

  const handleAddCategory = useCallback(
    (category: CategorieMaladie) => {
      // Check if already added
      if (selectedCategories.some(c => c.categorieMaladieId === category.id)) {
        return;
      }

      const newCategory: CategoryWithMeta = {
        categorieMaladieId: category.id,
        isPrincipal: selectedCategories.length === 0, // First is principal by default
        notes: '',
        nom: category.nom,
        code: category.code,
      };

      onChange([...selectedCategories, newCategory]);
      setModalVisible(false);
      setSearchQuery('');
    },
    [onChange, selectedCategories],
  );

  const handleRemoveCategory = useCallback(
    (categoryId: string) => {
      onChange(selectedCategories.filter(c => c.categorieMaladieId !== categoryId));
    },
    [onChange, selectedCategories],
  );

  const handleSetPrincipal = useCallback(
    (categoryId: string) => {
      onChange(
        selectedCategories.map(c => ({
          ...c,
          isPrincipal: c.categorieMaladieId === categoryId,
        }))
      );
    },
    [onChange, selectedCategories],
  );

  const handleNotesChange = useCallback(
    (categoryId: string, notes: string) => {
      setEditingNotes(prev => ({...prev, [categoryId]: notes}));
    },
    [],
  );

  const handleNotesBlur = useCallback(
    (categoryId: string) => {
      onChange(
        selectedCategories.map(c =>
          c.categorieMaladieId === categoryId
            ? {...c, notes: editingNotes[categoryId] || ''}
            : c
        )
      );
    },
    [onChange, selectedCategories, editingNotes],
  );

  // Filter available categories (not yet selected)
  const availableCategories = categories.filter(
    cat => !selectedCategories.some(sc => sc.categorieMaladieId === cat.id)
  );

  // Filter categories by search term
  const filteredCategories = availableCategories.filter(cat => {
    if (!searchQuery.trim()) return true;
    const searchLower = searchQuery.toLowerCase();
    const nomLower = (cat.nom || '').toLowerCase();
    return nomLower.includes(searchLower);
  });

  const renderCategoryItem = useCallback(
    ({item}: {item: CategorieMaladie}) => (
      <TouchableOpacity
        style={styles.categoryItem}
        onPress={() => handleAddCategory(item)}
        accessibilityRole={'button' as AccessibilityRole}
        accessibilityLabel={`Ajouter ${item.nom}`}>
        <View style={styles.categoryInfo}>
          <Text style={styles.categoryName}>{item.nom}</Text>
          {item.code && <Text style={styles.categoryCode}>{item.code}</Text>}
        </View>
        <Icon name="plus-circle" size={24} color="#0284c7" />
      </TouchableOpacity>
    ),
    [handleAddCategory],
  );

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Catégories de maladies *</Text>

      {/* Selected categories */}
      {selectedCategories.length > 0 && (
        <View style={styles.selectedContainer}>
          {selectedCategories.map(cat => (
            <View key={cat.categorieMaladieId} style={styles.selectedCategoryCard}>
              <View style={styles.selectedCategoryHeader}>
                <View style={styles.selectedCategoryTitleRow}>
                  {cat.isPrincipal && (
                    <Chip
                      mode="flat"
                      style={styles.principalChip}
                      textStyle={styles.principalChipText}
                      icon="star">
                      Principale
                    </Chip>
                  )}
                  <Text style={styles.selectedCategoryName}>{cat.nom}</Text>
                </View>
                <View style={styles.selectedCategoryActions}>
                  {!cat.isPrincipal && selectedCategories.length > 1 && (
                    <TouchableOpacity
                      onPress={() => handleSetPrincipal(cat.categorieMaladieId)}
                      style={styles.actionButton}
                      accessibilityRole={'button' as AccessibilityRole}
                      accessibilityLabel="Marquer comme principale">
                      <Icon name="star-outline" size={20} color="#0284c7" />
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    onPress={() => handleRemoveCategory(cat.categorieMaladieId)}
                    style={styles.actionButton}
                    accessibilityRole={'button' as AccessibilityRole}
                    accessibilityLabel="Retirer">
                    <Icon name="close" size={20} color="#D32F2F" />
                  </TouchableOpacity>
                </View>
              </View>
              <TextInput
                mode="outlined"
                placeholder="Notes pour cette catégorie (optionnel)"
                value={editingNotes[cat.categorieMaladieId] || ''}
                onChangeText={(text) => handleNotesChange(cat.categorieMaladieId, text)}
                onBlur={() => handleNotesBlur(cat.categorieMaladieId)}
                style={styles.notesInput}
                multiline
                numberOfLines={2}
              />
            </View>
          ))}
        </View>
      )}

      {/* Add category button */}
      {availableCategories.length > 0 && (
        <Button
          mode="outlined"
          onPress={() => setModalVisible(true)}
          icon="plus"
          style={styles.addButton}
          labelStyle={styles.addButtonLabel}
          accessibilityRole={'button' as AccessibilityRole}
          accessibilityLabel="Ajouter une catégorie">
          Ajouter une catégorie
        </Button>
      )}

      {error && <Text style={styles.errorText}>{error}</Text>}

      {/* Category selection modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
        presentationStyle={Platform.OS === 'ios' ? 'pageSheet' : 'fullScreen'}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Ajouter une catégorie</Text>
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={styles.closeButton}
              accessibilityRole={'button' as AccessibilityRole}
              accessibilityLabel="Fermer">
              <Icon name="close" size={24} color="#000" />
            </TouchableOpacity>
          </View>

          <View style={styles.searchContainer}>
            <TextInput
              mode="outlined"
              placeholder="Rechercher une catégorie..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              left={<TextInput.Icon icon="magnify" />}
              style={styles.searchInput}
            />
          </View>

          <FlatList
            data={filteredCategories}
            renderItem={renderCategoryItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContainer}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Icon name="folder-search-outline" size={64} color="#9E9E9E" />
                <Text style={styles.emptyText}>
                  {searchQuery
                    ? 'Aucune catégorie trouvée'
                    : 'Toutes les catégories sont déjà ajoutées'}
                </Text>
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
    fontWeight: '600',
    color: '#424242',
    marginBottom: 8,
  },
  selectedContainer: {
    marginBottom: 12,
  },
  selectedCategoryCard: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  selectedCategoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  selectedCategoryTitleRow: {
    flex: 1,
    gap: 8,
  },
  principalChip: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFF3E0',
    marginBottom: 4,
  },
  principalChipText: {
    color: '#F57C00',
    fontSize: 12,
  },
  selectedCategoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
  },
  selectedCategoryActions: {
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
  notesInput: {
    backgroundColor: '#FFFFFF',
    fontSize: 14,
  },
  addButton: {
    borderColor: '#0284c7',
    borderWidth: 1,
  },
  addButtonLabel: {
    color: '#0284c7',
    fontSize: 14,
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
  searchContainer: {
    padding: 16,
  },
  searchInput: {
    backgroundColor: '#FFFFFF',
  },
  listContainer: {
    flexGrow: 1,
    padding: 8,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FAFAFA',
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#212121',
  },
  categoryCode: {
    fontSize: 14,
    color: '#757575',
    marginTop: 2,
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
