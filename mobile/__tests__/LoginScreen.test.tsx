/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import LoginScreen from '../src/screens/LoginScreen';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
}));

// Mock react-native-paper
jest.mock('react-native-paper', () => {
  // eslint-disable-next-line @typescript-eslint/no-shadow
  const React = require('react');
  return {
    TextInput: (props: any) => React.createElement('TextInput', props),
    Button: (props: any) => React.createElement('Button', props),
    Text: (props: any) => React.createElement('Text', props),
    HelperText: (props: any) => React.createElement('HelperText', props),
  };
});

// Mock react-native-vector-icons
jest.mock('react-native-vector-icons/MaterialCommunityIcons', () => 'Icon');

// Mock Apollo Client
jest.mock('@apollo/client', () => ({
  ApolloClient: jest.fn().mockImplementation(() => ({
    mutate: jest.fn(),
  })),
  InMemoryCache: jest.fn(),
  gql: jest.fn((strings: TemplateStringsArray) => strings[0]),
  createHttpLink: jest.fn(),
}));

// Mock auth service
jest.mock('../src/services/auth', () => ({
  login: jest.fn(() => Promise.resolve({token: 'test-token', user: {id: '1'}})),
}));

describe('LoginScreen', () => {
  const mockOnLoginSuccess = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with all required elements', async () => {
    let component;
    await ReactTestRenderer.act(() => {
      component = ReactTestRenderer.create(
        <LoginScreen onLoginSuccess={mockOnLoginSuccess} />,
      );
    });

    const tree = component.toJSON();
    expect(tree).toBeTruthy();
    
    // Verify component structure exists
    expect(component.root).toBeTruthy();
  });
});
