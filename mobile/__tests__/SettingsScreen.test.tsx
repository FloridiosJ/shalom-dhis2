/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import SettingsScreen from '../src/screens/SettingsScreen';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
}));

// Mock react-native components
jest.mock('react-native/Libraries/Components/ActivityIndicator/ActivityIndicator', () => 'ActivityIndicator');

// Mock react-native-paper
jest.mock('react-native-paper', () => {
  const React = require('react');
  return {
    Text: (props: any) => React.createElement('Text', props),
    Card: ({children, ...props}: any) => React.createElement('Card', props, children),
  };
});

// Mock react-native-vector-icons
jest.mock('react-native-vector-icons/MaterialCommunityIcons', () => 'Icon');

// Mock SafeAreaView
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: ({children}: {children: React.ReactNode}) => children,
}));

// Mock auth service
jest.mock('../src/services/auth', () => ({
  getUser: jest.fn(() => Promise.resolve({
    id: '1',
    nom: 'Dupont',
    prenom: 'Alexandre',
    email: 'alexandre@test.com',
    login: 'AG-12345',
    role: 'agent',
  })),
  logout: jest.fn(() => Promise.resolve()),
}));

// Mock useSyncPreference hook
jest.mock('../src/hooks/useSyncPreference', () => ({
  useSyncPreference: jest.fn(() => ({
    wifiOnly: false,
    setWifiOnly: jest.fn(),
    loading: false,
  })),
}));

describe('SettingsScreen', () => {
  const mockOnLogout = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    const component = ReactTestRenderer.create(<SettingsScreen onLogout={mockOnLogout} />);
    expect(component).toBeTruthy();
  });

  it('matches snapshot', () => {
    const tree = ReactTestRenderer.create(<SettingsScreen onLogout={mockOnLogout} />).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
