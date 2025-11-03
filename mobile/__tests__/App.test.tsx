/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import App from '../App';

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
    PaperProvider: ({children}: any) => children,
    TextInput: () => React.createElement('TextInput'),
    Button: () => React.createElement('Button'),
    Text: () => React.createElement('Text'),
    HelperText: () => React.createElement('HelperText'),
  };
});

// Mock Apollo Client
jest.mock('@apollo/client', () => ({
  ApolloClient: jest.fn(),
  InMemoryCache: jest.fn(),
  gql: jest.fn(),
  createHttpLink: jest.fn(),
  from: jest.fn(),
}));

// Mock Apollo Client React
jest.mock('@apollo/client/react', () => ({
  ApolloProvider: ({children}: any) => children,
}));

// Mock setContext from apollo link context
jest.mock('@apollo/client/link/context', () => ({
  setContext: jest.fn(),
}));

test('renders correctly', async () => {
  await ReactTestRenderer.act(() => {
    ReactTestRenderer.create(<App />);
  });
});
