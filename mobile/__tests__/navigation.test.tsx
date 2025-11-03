/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import MainNavigator from '../src/navigation/MainNavigator';

// Mock react-native-vector-icons
jest.mock('react-native-vector-icons/MaterialCommunityIcons', () => 'Icon');

// Mock react-native-paper
jest.mock('react-native-paper', () => {
  const ReactMock = require('react');
  const CardContent = ({children}: any) =>
    ReactMock.createElement('CardContent', {}, children);
  const Card = ({children}: any) =>
    ReactMock.createElement('Card', {}, children);
  Card.Content = CardContent;
  return {
    Text: ({children}: any) => ReactMock.createElement('Text', {}, children),
    Card,
    Button: ({children}: any) =>
      ReactMock.createElement('Button', {}, children),
  };
});

// Mock @react-navigation/native
jest.mock('@react-navigation/native', () => ({
  NavigationContainer: ({children}: any) => children,
  useNavigation: () => ({
    navigate: jest.fn(),
  }),
}));

// Mock @react-navigation/bottom-tabs
jest.mock('@react-navigation/bottom-tabs', () => ({
  createBottomTabNavigator: () => ({
    Navigator: ({children}: any) => children,
    Screen: ({children}: any) => children,
  }),
}));

describe('Navigation Components', () => {
  describe('MainNavigator', () => {
    it('renders correctly', async () => {
      const mockOnLogout = jest.fn();
      await ReactTestRenderer.act(() => {
        ReactTestRenderer.create(<MainNavigator onLogout={mockOnLogout} />);
      });
    });

    it('accepts onLogout prop', async () => {
      const mockOnLogout = jest.fn();
      let tree;
      await ReactTestRenderer.act(() => {
        tree = ReactTestRenderer.create(
          <MainNavigator onLogout={mockOnLogout} />,
        );
      });
      expect(tree).toBeDefined();
    });
  });
});
