/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import DateTimeField from '../src/components/form/DateTimeField';

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

describe('DateTimeField', () => {
  it('renders date picker correctly', async () => {
    await ReactTestRenderer.act(async () => {
      ReactTestRenderer.create(
        <DateTimeField
          label="Date de consultation"
          value={new Date()}
          onChange={jest.fn()}
          mode="date"
        />,
      );
    });
  });

  it('renders time picker correctly', async () => {
    await ReactTestRenderer.act(async () => {
      ReactTestRenderer.create(
        <DateTimeField
          label="Heure"
          value={new Date()}
          onChange={jest.fn()}
          mode="time"
        />,
      );
    });
  });

  it('renders with error', async () => {
    await ReactTestRenderer.act(async () => {
      ReactTestRenderer.create(
        <DateTimeField
          label="Date de consultation"
          value={new Date()}
          onChange={jest.fn()}
          mode="date"
          error="La date est invalide"
        />,
      );
    });
  });

  it('renders required field', async () => {
    await ReactTestRenderer.act(async () => {
      ReactTestRenderer.create(
        <DateTimeField
          label="Date de consultation"
          value={new Date()}
          onChange={jest.fn()}
          mode="date"
          required
        />,
      );
    });
  });
});
