import {StyleSheet} from 'react-native';

// Theme colors - Blue as primary color matching header
export const THEME_COLORS = {
  primary: '#2196F3', // Blue for headers and primary actions
  background: '#F5F5F5',
  cardBackground: '#FFFFFF',
  textPrimary: '#212121',
  textSecondary: '#757575',
  border: '#E0E0E0',
  error: '#D32F2F',
  success: '#4CAF50',
};

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME_COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  section: {
    backgroundColor: THEME_COLORS.cardBackground,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  // Date and Time section - two separate lines
  dateTimeContainer: {
    backgroundColor: THEME_COLORS.cardBackground,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  dateTimeRow: {
    marginBottom: 12,
  },
  dateTimeLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME_COLORS.primary, // Blue label
    marginBottom: 8,
  },
  // Clinical Information section
  clinicalSection: {
    backgroundColor: THEME_COLORS.cardBackground,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  clinicalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: THEME_COLORS.textPrimary,
    marginBottom: 16,
  },
  // Single action button
  actionBar: {
    backgroundColor: THEME_COLORS.cardBackground,
    borderTopWidth: 1,
    borderTopColor: THEME_COLORS.border,
    padding: 16,
  },
  saveButton: {
    backgroundColor: THEME_COLORS.primary, // Blue button
    minHeight: 48,
    borderRadius: 8,
  },
  saveButtonLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  // Loading state
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
