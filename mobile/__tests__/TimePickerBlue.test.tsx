/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import TimePickerBlue from '../src/components/consultation/form/TimePickerBlue';

// Mock react-native-vector-icons
jest.mock('react-native-vector-icons/MaterialCommunityIcons', () => 'Icon');

// Mock @react-native-community/datetimepicker
jest.mock('@react-native-community/datetimepicker', () => 'DateTimePicker');

// Mock react-native-paper
jest.mock('react-native-paper', () => {
  const ReactMock = require('react');
  return {
    Text: ({children}: any) => ReactMock.createElement('Text', {}, children),
  };
});

describe('TimePickerBlue', () => {
  it('renders correctly', async () => {
    await ReactTestRenderer.act(async () => {
      ReactTestRenderer.create(
        <TimePickerBlue
          label="Heure"
          value={new Date()}
          onChange={jest.fn()}
        />,
      );
    });
  });

  it('renders with error', async () => {
    await ReactTestRenderer.act(async () => {
      ReactTestRenderer.create(
        <TimePickerBlue
          label="Heure"
          value={new Date()}
          onChange={jest.fn()}
          error="L'heure est invalide"
        />,
      );
    });
  });

  it('renders required field', async () => {
    await ReactTestRenderer.act(async () => {
      ReactTestRenderer.create(
        <TimePickerBlue
          label="Heure"
          value={new Date()}
          onChange={jest.fn()}
          required
        />,
      );
    });
  });
});
