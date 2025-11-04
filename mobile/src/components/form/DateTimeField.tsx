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

interface DateTimeFieldProps {
  label: string;
  value: Date;
  onChange: (date: Date) => void;
  mode: 'date' | 'time';
  error?: string;
  minimumDate?: Date;
  maximumDate?: Date;
  required?: boolean;
}

export default function DateTimeField({
  label,
  value,
  onChange,
  mode,
  error,
  minimumDate,
  maximumDate,
  required,
}: DateTimeFieldProps) {
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

  const formatDate = (date: Date): string => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const formatTime = (date: Date): string => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const displayValue = mode === 'date' ? formatDate(value) : formatTime(value);
  const iconName = mode === 'date' ? 'calendar' : 'clock-outline';

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
        accessibilityHint={`Ouvre le sélecteur de ${
          mode === 'date' ? 'date' : 'heure'
        }`}>
        <Icon name={iconName} size={20} color="#757575" />
        <Text style={styles.valueText}>{displayValue}</Text>
        <Icon name="menu-down" size={20} color="#757575" />
      </TouchableOpacity>

      {error && <Text style={styles.errorText}>{error}</Text>}

      {show && (
        <DateTimePicker
          value={value}
          mode={mode}
          is24Hour={true}
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleChange}
          minimumDate={minimumDate}
          maximumDate={maximumDate}
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
    color: '#424242',
    marginBottom: 8,
  },
  fieldButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#FFFFFF',
    minHeight: 48,
  },
  fieldButtonError: {
    borderColor: '#D32F2F',
  },
  valueText: {
    flex: 1,
    fontSize: 16,
    color: '#212121',
    marginLeft: 8,
  },
  errorText: {
    fontSize: 12,
    color: '#D32F2F',
    marginTop: 4,
  },
});
