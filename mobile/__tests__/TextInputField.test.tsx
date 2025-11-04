/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import TextInputField from '../src/components/form/TextInputField';

// Mock react-native-paper
jest.mock('react-native-paper', () => {
  const ReactMock = require('react');
  return {
    Text: ({children}: any) => ReactMock.createElement('Text', {}, children),
    TextInput: ({children}: any) =>
      ReactMock.createElement('TextInput', {}, children),
  };
});

describe('TextInputField', () => {
  it('renders single line input correctly', async () => {
    await ReactTestRenderer.act(async () => {
      ReactTestRenderer.create(
        <TextInputField
          label="Diagnostic"
          value=""
          onChange={jest.fn()}
          placeholder="ex: Paludisme simple"
        />,
      );
    });
  });

  it('renders multiline input correctly', async () => {
    await ReactTestRenderer.act(async () => {
      ReactTestRenderer.create(
        <TextInputField
          label="Notes"
          value=""
          onChange={jest.fn()}
          multiline
          numberOfLines={4}
        />,
      );
    });
  });

  it('renders with error', async () => {
    await ReactTestRenderer.act(async () => {
      ReactTestRenderer.create(
        <TextInputField
          label="Diagnostic"
          value=""
          onChange={jest.fn()}
          error="Le diagnostic est requis"
        />,
      );
    });
  });

  it('renders required field', async () => {
    await ReactTestRenderer.act(async () => {
      ReactTestRenderer.create(
        <TextInputField
          label="Diagnostic"
          value=""
          onChange={jest.fn()}
          required
        />,
      );
    });
  });

  it('renders with character count', async () => {
    await ReactTestRenderer.act(async () => {
      ReactTestRenderer.create(
        <TextInputField
          label="Diagnostic"
          value="Test"
          onChange={jest.fn()}
          maxLength={100}
        />,
      );
    });
  });
});
