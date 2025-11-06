/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import ConsultationInput from '../src/components/consultation/form/ConsultationInput';

// Mock react-native-paper
jest.mock('react-native-paper', () => {
  const ReactMock = require('react');
  return {
    TextInput: ({children}: any) =>
      ReactMock.createElement('TextInput', {}, children),
    HelperText: ({children}: any) =>
      ReactMock.createElement('HelperText', {}, children),
  };
});

describe('ConsultationInput', () => {
  it('renders correctly', async () => {
    await ReactTestRenderer.act(async () => {
      ReactTestRenderer.create(
        <ConsultationInput
          label="Type consultation"
          value=""
          onChange={jest.fn()}
        />,
      );
    });
  });

  it('renders with error', async () => {
    await ReactTestRenderer.act(async () => {
      ReactTestRenderer.create(
        <ConsultationInput
          label="Type consultation"
          value=""
          onChange={jest.fn()}
          error="Ce champ est requis"
        />,
      );
    });
  });

  it('renders required field', async () => {
    await ReactTestRenderer.act(async () => {
      ReactTestRenderer.create(
        <ConsultationInput
          label="Type consultation"
          value=""
          onChange={jest.fn()}
          required
        />,
      );
    });
  });

  it('renders multiline input', async () => {
    await ReactTestRenderer.act(async () => {
      ReactTestRenderer.create(
        <ConsultationInput
          label="Notes"
          value=""
          onChange={jest.fn()}
          multiline
          numberOfLines={4}
        />,
      );
    });
  });

  it('renders with placeholder', async () => {
    await ReactTestRenderer.act(async () => {
      ReactTestRenderer.create(
        <ConsultationInput
          label="Type consultation"
          value=""
          onChange={jest.fn()}
          placeholder="ex: Consultation générale"
        />,
      );
    });
  });
});
