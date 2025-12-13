import React from 'react';
import {StyleSheet, TouchableOpacity, View} from 'react-native';
import {Text} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface LogoutButtonProps {
  onPress: () => void;
  loading?: boolean;
}

/**
 * LogoutButton component with danger styling
 * Handles user logout with appropriate visual feedback
 * Updated design: white background with red border and text
 */
export const LogoutButton: React.FC<LogoutButtonProps> = ({
  onPress,
  loading = false,
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={loading}
      style={[styles.button, loading && styles.buttonDisabled]}
      accessibilityLabel="Se déconnecter"
      accessibilityRole="button"
      accessibilityHint="Appuyez pour vous déconnecter de l'application">
      <View style={styles.buttonContent}>
        <Icon name="logout" size={20} color="#D32F2F" />
        <Text variant="bodyLarge" style={styles.buttonText}>
          Déconnexion
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingVertical: 14,
    paddingHorizontal: 24,
    minHeight: 52,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#D32F2F',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#D32F2F',
    fontWeight: '600',
    marginLeft: 8,
    fontSize: 15,
  },
});
