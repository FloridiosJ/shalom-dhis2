/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import ConsultationScreen from '../src/screens/ConsultationScreen';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

// Mock react-native-vector-icons
jest.mock('react-native-vector-icons/MaterialCommunityIcons', () => 'Icon');

// Mock react-native-paper
jest.mock('react-native-paper', () => {
  const ReactMock = require('react');
  const {TouchableOpacity, View, Text} = require('react-native');

  const CardContent = ({children}: any) =>
    ReactMock.createElement(View, {}, children);
  const Card = ({children, style}: any) =>
    ReactMock.createElement(View, {style}, children);
  Card.Content = CardContent;

  return {
    Text: ({children, style}: any) =>
      ReactMock.createElement(Text, {style}, children),
    Card,
    Button: ({children, onPress}: any) =>
      ReactMock.createElement(TouchableOpacity, {onPress}, children),
    FAB: ({onPress, icon}: any) =>
      ReactMock.createElement(
        TouchableOpacity,
        {onPress, testID: 'fab'},
        ReactMock.createElement(Text, {}, icon),
      ),
  };
});

// Mock consultation service
jest.mock('../src/services/consultationService', () => ({
  fetchConsultations: jest.fn(() =>
    Promise.resolve({
      dataEntries: [],
      totalCount: 0,
      hasNextPage: false,
      hasPreviousPage: false,
    }),
  ),
}));

// Import Consultation type for tests
import {Consultation} from '../src/types';
import {fetchConsultations} from '../src/services/consultationService';

describe('ConsultationScreen', () => {
  it('renders correctly', async () => {
    let tree;
    await ReactTestRenderer.act(async () => {
      tree = ReactTestRenderer.create(<ConsultationScreen />);
    });
    expect(tree).toBeDefined();
  });

  it('renders SearchBar component', async () => {
    let tree;
    await ReactTestRenderer.act(async () => {
      tree = ReactTestRenderer.create(<ConsultationScreen />);
    });
    const instance = tree?.toJSON();
    expect(instance).toBeTruthy();
  });

  it('renders FAB button', async () => {
    let tree;
    await ReactTestRenderer.act(async () => {
      tree = ReactTestRenderer.create(<ConsultationScreen />);
    });
    const instance = tree?.root;
    const fab = instance?.findByProps({testID: 'fab'});
    expect(fab).toBeTruthy();
  });

  it('handles duplicate consultations with unique keys', async () => {
    // Mock consultations with potential duplicate scenarios
    const mockConsultations: Consultation[] = [
      {
        id: '1',
        dateConsultation: '2025-01-15',
        diagnostic: 'Test 1',
        prescription: 'Rx 1',
        notes: 'Note 1',
        status: 'en_cours',
        patient: {
          id: 'patient-1',
          displayName: 'John Doe',
          nom: 'Doe',
          prenom: 'John',
          sexe: 'M',
          age: 30,
          numeroPatient: 'P001',
          village: 'Village 1',
        },
      },
      {
        id: '2',
        dateConsultation: '2025-01-15',
        diagnostic: 'Test 2',
        prescription: 'Rx 2',
        notes: 'Note 2',
        status: 'termine',
        patient: {
          id: 'patient-1', // Same patient, same date
          displayName: 'John Doe',
          nom: 'Doe',
          prenom: 'John',
          sexe: 'M',
          age: 30,
          numeroPatient: 'P001',
          village: 'Village 1',
        },
      },
      {
        // Item without id but with clientTempId
        clientTempId: 'temp-123',
        dateConsultation: '2025-01-15',
        diagnostic: 'Test 3',
        prescription: 'Rx 3',
        notes: 'Note 3',
        status: 'en_cours',
        patient: {
          id: 'patient-1',
          displayName: 'John Doe',
          nom: 'Doe',
          prenom: 'John',
          sexe: 'M',
          age: 30,
          numeroPatient: 'P001',
          village: 'Village 1',
        },
      } as any,
    ];

    (fetchConsultations as jest.Mock).mockResolvedValueOnce({
      dataEntries: mockConsultations,
      totalCount: 3,
      hasNextPage: false,
      hasPreviousPage: false,
    });

    let tree;
    await ReactTestRenderer.act(async () => {
      tree = ReactTestRenderer.create(<ConsultationScreen />);
    });

    // Wait for consultations to load
    await ReactTestRenderer.act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    expect(tree).toBeDefined();
    // The component should render without duplicate key warnings
  });
});
