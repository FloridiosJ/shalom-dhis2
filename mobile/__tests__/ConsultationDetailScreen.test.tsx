/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import ConsultationDetailScreen from '../src/screens/ConsultationDetailScreen';
import {Consultation} from '../src/types';

// Mock react-native-vector-icons
jest.mock('react-native-vector-icons/MaterialCommunityIcons', () => 'Icon');

// Mock react-native-paper
jest.mock('react-native-paper', () => {
  const ReactMock = require('react');
  const {TouchableOpacity, View, Text, ScrollView} = require('react-native');

  const CardContent = ({children}: any) =>
    ReactMock.createElement(View, {}, children);
  const Card = ({children, style}: any) =>
    ReactMock.createElement(View, {style}, children);
  Card.Content = CardContent;

  return {
    Text: ({children, style, variant}: any) =>
      ReactMock.createElement(Text, {style, variant}, children),
    Card,
    Button: ({children, onPress, icon}: any) =>
      ReactMock.createElement(
        TouchableOpacity,
        {onPress, testID: 'button'},
        ReactMock.createElement(Text, {}, children),
      ),
  };
});

// Mock SafeAreaView
jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  const {View} = require('react-native');
  return {
    SafeAreaView: ({children, ...props}: any) =>
      React.createElement(View, props, children),
  };
});

describe('ConsultationDetailScreen', () => {
  const mockNavigation = {
    navigate: jest.fn(),
    goBack: jest.fn(),
  };

  const mockConsultation: Consultation = {
    id: '1',
    dateConsultation: '2024-03-15T10:00:00Z',
    diagnostic: 'Paludisme simple',
    prescription: 'Artemether-Lumefantrine (Coartem) 20/120mg, 2 fois par jour pendant 3 jours.',
    notes: 'La patiente a bien réagi au traitement initial. Recommander repos et hydratation. Prochain suivi dans 7 jours si les symptômes persistent.',
    patient: {
      id: 'p1',
      displayName: 'Fatoumata Diarra',
      nom: 'Diarra',
      prenom: 'Fatoumata',
      sexe: 'F',
      age: 28,
      numeroPatient: 'P-2024-001',
      village: 'Ségou',
    },
    status: 'termine',
    typeConsultation: 'Consultation générale',
    motifConsultation: 'Fièvre, maux de tête, frissons.',
    vitalSigns: {
      weight: 68,
      temperature: 38.5,
      bloodPressureSystolic: 120,
      bloodPressureDiastolic: 80,
      pulse: 92,
    },
    agentNotes: 'La patiente a bien réagi au traitement initial. Recommander repos et hydratation. Prochain suivi dans 7 jours si les symptômes persistent.',
  };

  const mockRoute = {
    params: {
      consultation: mockConsultation,
    },
  };

  it('renders without crashing', () => {
    const tree = ReactTestRenderer.create(
      <ConsultationDetailScreen route={mockRoute} navigation={mockNavigation} />,
    );
    expect(tree).toBeTruthy();
  });

  it('renders with minimal consultation data', () => {
    const minimalConsultation: Consultation = {
      id: '2',
      dateConsultation: '2024-03-16T10:00:00Z',
      diagnostic: 'Simple checkup',
      prescription: '',
      notes: '',
      patient: mockConsultation.patient,
      status: 'termine',
    };

    const minimalRoute = {
      params: {
        consultation: minimalConsultation,
      },
    };

    const tree = ReactTestRenderer.create(
      <ConsultationDetailScreen
        route={minimalRoute}
        navigation={mockNavigation}
      />,
    );
    expect(tree).toBeTruthy();
  });

  it('handles back button press', () => {
    let tree: ReactTestRenderer.ReactTestRenderer;
    
    ReactTestRenderer.act(() => {
      tree = ReactTestRenderer.create(
        <ConsultationDetailScreen route={mockRoute} navigation={mockNavigation} />,
      );
    });

    // Find the back button and simulate press
    const buttons = tree!.root.findAllByProps({testID: 'button'});
    expect(buttons.length).toBeGreaterThan(0);

    // Simulate button press
    ReactTestRenderer.act(() => {
      const backButton = buttons[0];
      backButton.props.onPress();
    });

    expect(mockNavigation.goBack).toHaveBeenCalled();
  });
});
