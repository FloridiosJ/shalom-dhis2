import React, {memo} from 'react';
import {StyleSheet, AccessibilityRole} from 'react-native';
import {Button} from 'react-native-paper';

interface BackToPatientButtonProps {
  onPress: () => void;
}

/**
 * BackToPatientButton - Clear button to return to patient details
 * Reusable component for navigation back to patient screen
 */
const BackToPatientButton = memo(({onPress}: BackToPatientButtonProps) => {
  return (
    <Button
      mode="outlined"
      onPress={onPress}
      icon="arrow-left"
      style={styles.button}
      contentStyle={styles.buttonContent}
      labelStyle={styles.buttonLabel}
      accessibilityRole={'button' as AccessibilityRole}
      accessibilityLabel="Retour à la fiche patient"
      accessibilityHint="Retourner à la page de détails du patient">
      Retour à la fiche patient
    </Button>
  );
});

BackToPatientButton.displayName = 'BackToPatientButton';

export default BackToPatientButton;

const styles = StyleSheet.create({
  button: {
    marginHorizontal: 16,
    marginVertical: 16,
    borderRadius: 8,
    borderColor: '#2196F3',
    borderWidth: 1.5,
    minHeight: 48, // Minimum touch target size for accessibility
  },
  buttonContent: {
    height: 48,
    flexDirection: 'row-reverse', // Icon on left, text on right
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2196F3',
  },
});
