/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import NewConsultationScreen from '../src/screens/NewConsultationScreen';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
}));

// Mock react-native-vector-icons
jest.mock('react-native-vector-icons/MaterialCommunityIcons', () => 'Icon');

// Mock react-native-image-picker
jest.mock('react-native-image-picker', () => ({
  launchCamera: jest.fn(),
  launchImageLibrary: jest.fn(),
}));

// Mock @react-native-community/datetimepicker
jest.mock('@react-native-community/datetimepicker', () => 'DateTimePicker');

// Mock react-native-paper
jest.mock('react-native-paper', () => {
  const ReactMock = require('react');
  return {
    Text: ({children}: any) => ReactMock.createElement('Text', {}, children),
    Button: ({children}: any) =>
      ReactMock.createElement('Button', {}, children),
    TextInput: ({children}: any) =>
      ReactMock.createElement('TextInput', {}, children),
    ActivityIndicator: () =>
      ReactMock.createElement('ActivityIndicator', {}, null),
  };
});

const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
};

describe('NewConsultationScreen', () => {
  it('renders correctly', async () => {
    await ReactTestRenderer.act(async () => {
      ReactTestRenderer.create(
        <NewConsultationScreen navigation={mockNavigation} />,
      );
    });
  });

  it('has a navigation prop', async () => {
    let tree;
    await ReactTestRenderer.act(async () => {
      tree = ReactTestRenderer.create(
        <NewConsultationScreen navigation={mockNavigation} />,
      );
    });
    expect(tree).toBeDefined();
  });
});
