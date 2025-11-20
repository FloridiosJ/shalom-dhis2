import React, {useState, useCallback} from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Platform,
  AccessibilityRole,
} from 'react-native';
import {Text} from 'react-native-paper';
import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {THEME_COLORS} from '../../../styles/NewConsultationScreen.styles';

interface TimePickerBlueProps {
  label: string;
  value: Date;
  onChange: (date: Date) => void;
  error?: string;
  required?: boolean;
}

/**
 * TimePicker component for consultation form
 * Uses blue icons and black labels for consistency
 */
export default function TimePickerBlue({
  label,
  value,
  onChange,
  error,
  required,
}: TimePickerBlueProps) {
  const [show, setShow] = useState(false);

  const handleChange = useCallback(
    (event: DateTimePickerEvent, selectedDate?: Date) => {
      setShow(Platform.OS === 'ios');
      if (event.type === 'set' && selectedDate) {
        onChange(selectedDate);
      }
    },
    [onChange],
  );

  const formatTime = (date: Date): string => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const displayValue = formatTime(value);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        {label}
        {required && ' *'}
      </Text>

      <TouchableOpacity
        style={[styles.fieldButton, error && styles.fieldButtonError]}
        onPress={() => setShow(true)}
        accessibilityRole={'button' as AccessibilityRole}
        accessibilityLabel={`${label}: ${displayValue}`}
        accessibilityHint="Ouvre le sélecteur d'heure">
        <Icon name="clock-outline" size={20} color={THEME_COLORS.primary} />
        <Text style={styles.valueText}>{displayValue}</Text>
        <Icon name="menu-down" size={20} color={THEME_COLORS.primary} />
      </TouchableOpacity>

      {error && <Text style={styles.errorText}>{error}</Text>}

      {show && (
        <DateTimePicker
          value={value}
          mode="time"
          is24Hour={true}
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleChange}
        />
      )}
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
    color: '#111111', // Black label
    marginBottom: 8,
  },
  fieldButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: THEME_COLORS.border,
    borderRadius: 8,
    padding: 12,
    backgroundColor: THEME_COLORS.cardBackground,
    minHeight: 48, // Accessibility: > 44px
  },
  fieldButtonError: {
    borderColor: THEME_COLORS.error,
  },
  valueText: {
    flex: 1,
    fontSize: 16,
    color: THEME_COLORS.textPrimary,
    marginLeft: 8,
  },
  errorText: {
    fontSize: 12,
    color: THEME_COLORS.error,
    marginTop: 4,
  },
});
