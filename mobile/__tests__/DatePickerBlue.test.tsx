/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import DatePickerBlue from '../src/components/consultation/form/DatePickerBlue';

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

describe('DatePickerBlue', () => {
  it('renders correctly', async () => {
    await ReactTestRenderer.act(async () => {
      ReactTestRenderer.create(
        <DatePickerBlue
          label="Date de consultation"
          value={new Date()}
          onChange={jest.fn()}
        />,
      );
    });
  });

  it('renders with error', async () => {
    await ReactTestRenderer.act(async () => {
      ReactTestRenderer.create(
        <DatePickerBlue
          label="Date de consultation"
          value={new Date()}
          onChange={jest.fn()}
          error="La date est invalide"
        />,
      );
    });
  });

  it('renders required field', async () => {
    await ReactTestRenderer.act(async () => {
      ReactTestRenderer.create(
        <DatePickerBlue
          label="Date de consultation"
          value={new Date()}
          onChange={jest.fn()}
          required
        />,
      );
    });
  });

  it('renders with min and max dates', async () => {
    await ReactTestRenderer.act(async () => {
      ReactTestRenderer.create(
        <DatePickerBlue
          label="Date de consultation"
          value={new Date()}
          onChange={jest.fn()}
          minimumDate={new Date('2024-01-01')}
          maximumDate={new Date()}
        />,
      );
    });
  });
});
