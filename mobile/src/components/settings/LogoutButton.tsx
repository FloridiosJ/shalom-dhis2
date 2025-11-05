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
        <Icon name="logout" size={24} color="#D32F2F" />
        <Text variant="bodyLarge" style={styles.buttonText}>
          Déconnexion
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#FFEBEE',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    minHeight: 56,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFCDD2',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
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
    marginLeft: 12,
  },
});
