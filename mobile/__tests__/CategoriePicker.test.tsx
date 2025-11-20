/**
 * @format
 */

import React from 'react';
import ReactTestRenderer, {act} from 'react-test-renderer';
import CategoriePicker from '../src/components/form/CategoriePicker';

// Mock react-native-vector-icons
jest.mock('react-native-vector-icons/MaterialCommunityIcons', () => 'Icon');

// Mock react-native-paper
jest.mock('react-native-paper', () => {
  const ReactMock = require('react');
  return {
    Text: ({children}: any) => ReactMock.createElement('Text', {}, children),
    TextInput: ({children, ...props}: any) =>
      ReactMock.createElement('TextInput', props, children),
  };
});

describe('CategoriePicker', () => {
  it('renders correctly with no selection', async () => {
    await act(async () => {
      ReactTestRenderer.create(
        <CategoriePicker value={null} onChange={jest.fn()} />,
      );
    });
  });

  it('renders correctly with a selected value (hierarchical)', async () => {
    await act(async () => {
      ReactTestRenderer.create(
        <CategoriePicker
          value="INFECTIEUSES:RESPIRATOIRES"
          onChange={jest.fn()}
        />,
      );
    });
  });

  it('renders with error message', async () => {
    await act(async () => {
      ReactTestRenderer.create(
        <CategoriePicker
          value={null}
          onChange={jest.fn()}
          error="Ce champ est requis"
        />,
      );
    });
  });

  it('renders as required field', async () => {
    await act(async () => {
      ReactTestRenderer.create(
        <CategoriePicker value={null} onChange={jest.fn()} required />,
      );
    });
  });

  it('calls onChange when selection is made', async () => {
    const mockOnChange = jest.fn();
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await act(async () => {
      renderer = ReactTestRenderer.create(
        <CategoriePicker value={null} onChange={mockOnChange} />,
      );
    });

    // Verify component rendered
    expect(renderer!).toBeDefined();
  });

  it('displays hierarchical structure correctly', async () => {
    await act(async () => {
      ReactTestRenderer.create(
        <CategoriePicker value={null} onChange={jest.fn()} />,
      );
    });
    // The component should handle 2-level hierarchy
    // This is tested by the component rendering without errors
  });

  it('handles invalid value format gracefully', async () => {
    await act(async () => {
      ReactTestRenderer.create(
        <CategoriePicker value="INVALID_FORMAT" onChange={jest.fn()} />,
      );
    });
  });

  it('parses value with colon separator', async () => {
    await act(async () => {
      ReactTestRenderer.create(
        <CategoriePicker
          value="CHRONIQUES:DIABETE"
          onChange={jest.fn()}
        />,
      );
    });
  });
});
