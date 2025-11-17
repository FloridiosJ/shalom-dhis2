/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import PatientPicker from '../src/components/form/PatientPicker';
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
    BottomSheetBackdrop: ({children}: any) =>
      ReactMock.createElement('BottomSheetBackdrop', {}, children),
    BottomSheetView: ({children}: any) =>
      ReactMock.createElement('BottomSheetView', {}, children),
    BottomSheetFlatList: ({children}: any) =>
      ReactMock.createElement('BottomSheetFlatList', {}, children),
  };
});

// Mock react-native-gesture-handler
jest.mock('react-native-gesture-handler', () => {
  const ReactMock = require('react');
  return {
    GestureHandlerRootView: ({children}: any) =>
      ReactMock.createElement('GestureHandlerRootView', {}, children),
  };
});

// Mock BottomSheetWrapper
jest.mock('../src/components/common/BottomSheetWrapper', () => {
  const ReactMock = require('react');
  return {
    __esModule: true,
    default: ReactMock.forwardRef(({children}: any, ref: any) =>
      ReactMock.createElement('BottomSheetWrapper', {ref}, children),
    ),
  };
});

const mockPatients: PatientOption[] = [
  {
    id: '1',
    displayName: 'Jean Dupont',
    numeroPatient: 'PAT-001',
  },
  {
    id: '2',
    displayName: 'Marie Martin',
    numeroPatient: 'PAT-002',
  },
];

describe('PatientPicker', () => {
  it('renders correctly', async () => {
    await ReactTestRenderer.act(async () => {
      ReactTestRenderer.create(
        <PatientPicker
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
        <PatientPicker
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
        <PatientPicker
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
});
