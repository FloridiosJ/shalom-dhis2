import React, {useState} from 'react';
import {View, StyleSheet, TouchableOpacity, AccessibilityRole} from 'react-native';
import {Text, Menu} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {SortOption} from '../hooks/useFilteredPatients';

interface SortMenuProps {
  selectedSort: SortOption;
  onSortChange: (sort: SortOption) => void;
}

const sortOptions: {value: SortOption; label: string; icon: string}[] = [
  {value: 'nom', label: 'Trier par : Nom', icon: 'sort-alphabetical-ascending'},
  {value: 'age', label: 'Trier par : Âge', icon: 'sort-numeric-descending'},
  {value: 'recent', label: 'Trier par : Récent', icon: 'clock-outline'},
];

/**
 * SortMenu component provides a dropdown menu for sorting options
 * Follows Material Design principles with proper accessibility
 */
export default function SortMenu({selectedSort, onSortChange}: SortMenuProps) {
  const [visible, setVisible] = useState(false);

  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

  const handleSelect = (sort: SortOption) => {
    onSortChange(sort);
    closeMenu();
  };

  const selectedOption = sortOptions.find(opt => opt.value === selectedSort);

  return (
    <View style={styles.container}>
      <Menu
        visible={visible}
        onDismiss={closeMenu}
        anchor={
          <TouchableOpacity
            onPress={openMenu}
            style={styles.button}
            accessibilityRole={'button' as AccessibilityRole}
            accessibilityLabel="Options de tri"
            accessibilityHint="Double-tap pour ouvrir le menu de tri">
            <Icon
              name={selectedOption?.icon || 'sort'}
              size={18}
              color="#2196F3"
            />
            <Text style={styles.buttonText}>{selectedOption?.label}</Text>
            <Icon
              name={visible ? 'chevron-up' : 'chevron-down'}
              size={20}
              color="#757575"
            />
          </TouchableOpacity>
        }
        contentStyle={styles.menuContent}>
        {sortOptions.map(option => (
          <Menu.Item
            key={option.value}
            onPress={() => handleSelect(option.value)}
            title={option.label}
            leadingIcon={option.icon}
            style={
              selectedSort === option.value ? styles.selectedMenuItem : undefined
            }
            titleStyle={
              selectedSort === option.value
                ? styles.selectedMenuItemText
                : undefined
            }
          />
        ))}
      </Menu>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 8,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    minHeight: 44, // Minimum touch target size
  },
  buttonText: {
    marginLeft: 8,
    marginRight: 8,
    color: '#2196F3',
    fontWeight: '500',
    fontSize: 14,
    flex: 1,
  },
  menuContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
  },
  selectedMenuItem: {
    backgroundColor: '#E3F2FD',
  },
  selectedMenuItemText: {
    color: '#2196F3',
    fontWeight: '600',
  },
});
