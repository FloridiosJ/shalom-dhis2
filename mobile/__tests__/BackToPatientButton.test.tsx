/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import BackToPatientButton from '../src/components/consultation/BackToPatientButton';

// Mock react-native-paper
jest.mock('react-native-paper', () => {
  const ReactMock = require('react');
  const {TouchableOpacity, Text} = require('react-native');

  return {
    Button: ({children, onPress, icon}: any) =>
      ReactMock.createElement(
        TouchableOpacity,
        {onPress, testID: 'back-button'},
        ReactMock.createElement(Text, {}, children),
      ),
  };
});

describe('BackToPatientButton', () => {
  it('renders without crashing', () => {
    const mockOnPress = jest.fn();
    const tree = ReactTestRenderer.create(
      <BackToPatientButton onPress={mockOnPress} />,
    );
    expect(tree).toBeTruthy();
  });

  it('calls onPress when button is pressed', () => {
    const mockOnPress = jest.fn();
    let tree: ReactTestRenderer.ReactTestRenderer;
    
    ReactTestRenderer.act(() => {
      tree = ReactTestRenderer.create(
        <BackToPatientButton onPress={mockOnPress} />,
      );
    });

    const button = tree!.root.findByProps({testID: 'back-button'});
    
    ReactTestRenderer.act(() => {
      button.props.onPress();
    });

    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });
});
