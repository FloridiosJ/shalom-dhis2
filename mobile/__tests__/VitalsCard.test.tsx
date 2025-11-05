/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import VitalsCard from '../src/components/consultation/VitalsCard';
import {VitalSigns} from '../src/types';

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

describe('VitalsCard', () => {
  const mockVitalSigns: VitalSigns = {
    weight: 68,
    temperature: 38.5,
    bloodPressureSystolic: 120,
    bloodPressureDiastolic: 80,
    pulse: 92,
  };

  it('renders without crashing with vital signs', () => {
    const tree = ReactTestRenderer.create(
      <VitalsCard vitalSigns={mockVitalSigns} />,
    );
    expect(tree).toBeTruthy();
  });

  it('renders empty state when no vital signs provided', () => {
    const tree = ReactTestRenderer.create(<VitalsCard />);
    expect(tree).toBeTruthy();
  });

  it('renders with partial vital signs', () => {
    const partialVitalSigns: VitalSigns = {
      weight: 68,
      temperature: 38.5,
    };
    const tree = ReactTestRenderer.create(
      <VitalsCard vitalSigns={partialVitalSigns} />,
    );
    expect(tree).toBeTruthy();
  });

  it('renders with only blood pressure', () => {
    const bpOnly: VitalSigns = {
      bloodPressureSystolic: 120,
      bloodPressureDiastolic: 80,
    };
    const tree = ReactTestRenderer.create(<VitalsCard vitalSigns={bpOnly} />);
    expect(tree).toBeTruthy();
  });
});
