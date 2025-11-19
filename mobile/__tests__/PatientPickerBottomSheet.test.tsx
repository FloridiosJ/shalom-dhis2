/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import PatientPickerBottomSheet from '../src/components/form/PatientPickerBottomSheet';
import {PatientOption} from '../src/types/consultation';

// Mock react-native-vector-icons
jest.mock('react-native-vector-icons/MaterialCommunityIcons', () => 'Icon');

// Mock react-native-paper
jest.mock('react-native-paper', () => {
  const ReactMock = require('react');
  return {
    Text: ({children}: any) => ReactMock.createElement('Text', {}, children),
    Button: ({children}: any) =>
      ReactMock.createElement('Button', {}, children),
    TextInput: ({children}: any) =>
      ReactMock.createElement('TextInput', {}, children),
    ActivityIndicator: () => ReactMock.createElement('ActivityIndicator', {}),
  };
});

// Mock @gorhom/bottom-sheet
jest.mock('@gorhom/bottom-sheet', () => {
  const ReactMock = require('react');
  return {
    __esModule: true,
    default: ReactMock.forwardRef(({children}: any, ref: any) =>
      ReactMock.createElement('BottomSheet', {ref}, children),
    ),
    BottomSheetFlatList: ({children, renderItem, data}: any) => {
      if (!data || data.length === 0) {
        return ReactMock.createElement('BottomSheetFlatList', {}, children);
      }
      return ReactMock.createElement(
        'BottomSheetFlatList',
        {},
        data.map((item: any) => renderItem({item})),
      );
    },
    BottomSheetBackdrop: ({children}: any) =>
      ReactMock.createElement('BottomSheetBackdrop', {}, children),
    BottomSheetTextInput: ({children}: any) =>
      ReactMock.createElement('BottomSheetTextInput', {}, children),
  };
});

// Mock useDebounce hook
jest.mock('../src/hooks/useDebounce', () => ({
  useDebounce: (value: any) => value,
}));

const mockPatients: PatientOption[] = [
  {
    id: '1',
    displayName: 'Awa Traoré',
    numeroPatient: 'PAT-001',
  },
  {
    id: '2',
    displayName: 'Moussa Diop',
    numeroPatient: 'PAT-002',
  },
  {
    id: '3',
    displayName: 'Fatou Kante',
    numeroPatient: 'PAT-003',
  },
];

describe('PatientPickerBottomSheet', () => {
  it('renders correctly with no selection', async () => {
    await ReactTestRenderer.act(async () => {
      ReactTestRenderer.create(
        <PatientPickerBottomSheet
          value={null}
          onChange={jest.fn()}
          onCreatePatient={jest.fn()}
          patients={mockPatients}
          onSearchPatients={jest.fn()}
        />,
      );
    });
  });

  it('renders with a selected patient', async () => {
    await ReactTestRenderer.act(async () => {
      ReactTestRenderer.create(
        <PatientPickerBottomSheet
          value="1"
          onChange={jest.fn()}
          onCreatePatient={jest.fn()}
          patients={mockPatients}
          onSearchPatients={jest.fn()}
        />,
      );
    });
  });

  it('renders with an error', async () => {
    await ReactTestRenderer.act(async () => {
      ReactTestRenderer.create(
        <PatientPickerBottomSheet
          value={null}
          onChange={jest.fn()}
          onCreatePatient={jest.fn()}
          error="Veuillez sélectionner un patient"
          patients={mockPatients}
          onSearchPatients={jest.fn()}
        />,
      );
    });
  });

  it('renders with loading state', async () => {
    await ReactTestRenderer.act(async () => {
      ReactTestRenderer.create(
        <PatientPickerBottomSheet
          value={null}
          onChange={jest.fn()}
          onCreatePatient={jest.fn()}
          patients={[]}
          onSearchPatients={jest.fn()}
          loading={true}
        />,
      );
    });
  });

  it('renders with empty patient list', async () => {
    await ReactTestRenderer.act(async () => {
      ReactTestRenderer.create(
        <PatientPickerBottomSheet
          value={null}
          onChange={jest.fn()}
          onCreatePatient={jest.fn()}
          patients={[]}
          onSearchPatients={jest.fn()}
        />,
      );
    });
  });

  it('displays selected patient information', async () => {
    let component;
    await ReactTestRenderer.act(async () => {
      component = ReactTestRenderer.create(
        <PatientPickerBottomSheet
          value="2"
          onChange={jest.fn()}
          onCreatePatient={jest.fn()}
          patients={mockPatients}
          onSearchPatients={jest.fn()}
        />,
      );
    });

    const tree = component.toJSON();
    expect(tree).toBeTruthy();
  });
});
