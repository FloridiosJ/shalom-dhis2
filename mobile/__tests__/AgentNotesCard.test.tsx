/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import AgentNotesCard from '../src/components/consultation/AgentNotesCard';

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

describe('AgentNotesCard', () => {
  it('renders without crashing with notes', () => {
    const tree = ReactTestRenderer.create(
      <AgentNotesCard notes="La patiente a bien réagi au traitement initial. Recommander repos et hydratation." />,
    );
    expect(tree).toBeTruthy();
  });

  it('renders empty state when no notes provided', () => {
    const tree = ReactTestRenderer.create(<AgentNotesCard />);
    expect(tree).toBeTruthy();
  });

  it('renders empty state with empty string', () => {
    const tree = ReactTestRenderer.create(<AgentNotesCard notes="" />);
    expect(tree).toBeTruthy();
  });

  it('renders empty state with whitespace-only string', () => {
    const tree = ReactTestRenderer.create(<AgentNotesCard notes="   " />);
    expect(tree).toBeTruthy();
  });
});
