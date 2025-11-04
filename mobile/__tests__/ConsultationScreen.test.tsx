/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import ConsultationScreen from '../src/screens/ConsultationScreen';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

// Mock react-native-vector-icons
jest.mock('react-native-vector-icons/MaterialCommunityIcons', () => 'Icon');

// Mock react-native-paper
jest.mock('react-native-paper', () => {
  const ReactMock = require('react');
  const {TouchableOpacity, View, Text} = require('react-native');

  const CardContent = ({children}: any) =>
    ReactMock.createElement(View, {}, children);
  const Card = ({children, style}: any) =>
    ReactMock.createElement(View, {style}, children);
  Card.Content = CardContent;

  return {
    Text: ({children, style}: any) =>
      ReactMock.createElement(Text, {style}, children),
    Card,
    Button: ({children, onPress}: any) =>
      ReactMock.createElement(TouchableOpacity, {onPress}, children),
    FAB: ({onPress, icon}: any) =>
      ReactMock.createElement(
        TouchableOpacity,
        {onPress, testID: 'fab'},
        ReactMock.createElement(Text, {}, icon),
      ),
  };
});

// Mock consultation service
jest.mock('../src/services/consultationService', () => ({
  fetchConsultations: jest.fn(() =>
    Promise.resolve({
      dataEntries: [],
      totalCount: 0,
      hasNextPage: false,
      hasPreviousPage: false,
    }),
  ),
}));

describe('ConsultationScreen', () => {
  it('renders correctly', async () => {
    let tree;
    await ReactTestRenderer.act(async () => {
      tree = ReactTestRenderer.create(<ConsultationScreen />);
    });
    expect(tree).toBeDefined();
  });

  it('renders SearchBar component', async () => {
    let tree;
    await ReactTestRenderer.act(async () => {
      tree = ReactTestRenderer.create(<ConsultationScreen />);
    });
    const instance = tree?.toJSON();
    expect(instance).toBeTruthy();
  });

  it('renders FAB button', async () => {
    let tree;
    await ReactTestRenderer.act(async () => {
      tree = ReactTestRenderer.create(<ConsultationScreen />);
    });
    const instance = tree?.root;
    const fab = instance?.findByProps({testID: 'fab'});
    expect(fab).toBeTruthy();
  });
});
