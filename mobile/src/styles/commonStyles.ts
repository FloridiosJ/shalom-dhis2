import {StyleSheet} from 'react-native';

/**
 * Common styles shared across placeholder screens
 */
export const placeholderScreenStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
    justifyContent: 'center',
  },
  card: {
    padding: 16,
  },
  title: {
    marginBottom: 16,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  subtitle: {
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  info: {
    marginBottom: 12,
    fontWeight: '600',
  },
  listItem: {
    color: '#666',
    marginLeft: 8,
    marginBottom: 4,
  },
});
