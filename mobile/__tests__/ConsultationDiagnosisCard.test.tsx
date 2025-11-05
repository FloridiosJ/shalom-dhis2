/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import ConsultationDiagnosisCard from '../src/components/consultation/ConsultationDiagnosisCard';

// Mock react-native-vector-icons
jest.mock('react-native-vector-icons/MaterialCommunityIcons', () => 'Icon');

// Mock react-native-paper
jest.mock('react-native-paper', () => {
  const ReactMock = require('react');
  const {View, Text} = require('react-native');

  const CardContent = ({children}: any) =>
    ReactMock.createElement(View, {}, children);
  const Card = ({children, style}: any) =>
    ReactMock.createElement(View, {style}, children);
  Card.Content = CardContent;

  return {
    Text: ({children, style, variant}: any) =>
      ReactMock.createElement(Text, {style, variant}, children),
    Card,
  };
});

describe('ConsultationDiagnosisCard', () => {
  it('renders without crashing with full data', () => {
    const tree = ReactTestRenderer.create(
      <ConsultationDiagnosisCard
        motifConsultation="Fièvre, maux de tête, frissons."
        diagnostic="Paludisme simple"
        prescription="Artemether-Lumefantrine (Coartem) 20/120mg, 2 fois par jour pendant 3 jours."
      />,
    );
    expect(tree).toBeTruthy();
  });

  it('renders empty state when no data provided', () => {
    const tree = ReactTestRenderer.create(<ConsultationDiagnosisCard />);
    expect(tree).toBeTruthy();
  });

  it('renders with only diagnostic', () => {
    const tree = ReactTestRenderer.create(
      <ConsultationDiagnosisCard diagnostic="Paludisme simple" />,
    );
    expect(tree).toBeTruthy();
  });

  it('renders with motif and diagnostic only', () => {
    const tree = ReactTestRenderer.create(
      <ConsultationDiagnosisCard
        motifConsultation="Fièvre"
        diagnostic="Paludisme simple"
      />,
    );
    expect(tree).toBeTruthy();
  });
});
