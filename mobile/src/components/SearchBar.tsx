import React from 'react';
import {View, TextInput, StyleSheet, AccessibilityRole} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  accessibilityLabel?: string;
}

export default function SearchBar({
  value,
  onChangeText,
  placeholder = 'Rechercher...',
  accessibilityLabel = 'Barre de recherche',
}: SearchBarProps) {
  return (
    <View style={styles.container}>
      <Icon name="magnify" size={20} color="#757575" style={styles.icon} />
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#9E9E9E"
        accessibilityLabel={accessibilityLabel}
        accessibilityRole={'search' as AccessibilityRole}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginHorizontal: 16,
    marginVertical: 12,
    minHeight: 44, // Minimum touch target size
  },
  icon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#212121',
    padding: 0,
  },
});
