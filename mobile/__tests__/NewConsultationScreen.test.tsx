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

// Mock @gorhom/bottom-sheet
jest.mock('@gorhom/bottom-sheet', () => {
  const ReactMock = require('react');
  return {
    __esModule: true,
    default: ReactMock.forwardRef(({children}: any, ref: any) =>
      ReactMock.createElement('BottomSheet', {ref}, children),
    ),
    BottomSheetBackdrop: ({children}: any) =>
      ReactMock.createElement('BottomSheetBackdrop', {}, children),
    BottomSheetView: ({children}: any) =>
      ReactMock.createElement('BottomSheetView', {}, children),
    BottomSheetFlatList: ({children}: any) =>
      ReactMock.createElement('BottomSheetFlatList', {}, children),
  };
});

// Mock BottomSheetWrapper
jest.mock('../src/components/common/BottomSheetWrapper', () => {
  const ReactMock = require('react');
  return {
    __esModule: true,
    default: ReactMock.forwardRef(({children}: any, ref: any) =>
      ReactMock.createElement('BottomSheetWrapper', {ref}, children),
    ),
  };
});

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
