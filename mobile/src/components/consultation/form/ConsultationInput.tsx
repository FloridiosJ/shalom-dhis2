import React from 'react';
import {View, StyleSheet, AccessibilityRole} from 'react-native';
import {TextInput, HelperText} from 'react-native-paper';
import {THEME_COLORS} from '../../../styles/NewConsultationScreen.styles';

interface ConsultationInputProps {
  label: string;
  value: string;
  onChange: (text: string) => void;
  placeholder?: string;
  error?: string;
  required?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
}

/**
 * Reusable input component for consultation form
 * Provides consistent styling and accessibility features
 */
export default function ConsultationInput({
  label,
  value,
  onChange,
  placeholder,
  error,
  required,
  multiline = false,
  numberOfLines = 1,
}: ConsultationInputProps) {
  return (
    <View style={styles.container}>
      <TextInput
        label={`${label}${required ? ' *' : ''}`}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        mode="outlined"
        error={!!error}
        multiline={multiline}
        numberOfLines={numberOfLines}
        outlineColor={THEME_COLORS.border}
        activeOutlineColor={THEME_COLORS.primary}
        style={[
          styles.input,
          multiline && styles.multilineInput,
        ]}
        accessibilityLabel={label}
        accessibilityRole={'text' as AccessibilityRole}
        accessibilityHint={placeholder}
      />
      {error && (
        <HelperText type="error" visible={!!error}>
          {error}
        </HelperText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  input: {
    backgroundColor: THEME_COLORS.cardBackground,
    minHeight: 48, // Accessibility: > 44px
  },
  multilineInput: {
    minHeight: 100,
  },
});
