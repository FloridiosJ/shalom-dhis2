/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import HomeScreen from '../src/screens/HomeScreen';

// Mock react-native-paper components
jest.mock('react-native-paper', () => {
  const ReactMock = require('react');
  const {View, Text, TouchableOpacity} = require('react-native');
  
  const CardContent = (props: any) => ReactMock.createElement(View, props, props.children);
  const Card = Object.assign(
    (props: any) => ReactMock.createElement(View, props, props.children),
    { Content: CardContent }
  );
  
  const MenuItem = (props: any) => ReactMock.createElement(
    TouchableOpacity,
    { onPress: props.onPress },
    ReactMock.createElement(Text, null, props.title)
  );
  
  const Menu = Object.assign(
    (props: any) => {
      return ReactMock.createElement(
        View,
        null,
        props.anchor,
        props.visible && props.children,
      );
    },
    { Item: MenuItem }
  );
  
  return {
    Text: (props: any) =>
      ReactMock.createElement(Text, props, props.children),
    Button: (props: any) =>
      ReactMock.createElement(
        TouchableOpacity,
        {onPress: props.onPress},
        ReactMock.createElement(Text, null, props.children),
      ),
    Card,
    Menu,
  };
});

// Mock react-native-vector-icons
jest.mock('react-native-vector-icons/MaterialCommunityIcons', () => 'Icon');

describe('HomeScreen', () => {
  it('renders correctly', async () => {
    let component: ReactTestRenderer.ReactTestRenderer;
    await ReactTestRenderer.act(() => {
      component = ReactTestRenderer.create(<HomeScreen />);
    });

    const tree = component!.toJSON();
    expect(tree).toBeTruthy();
  });

  it('renders dashboard cards with correct structure', async () => {
    let component: ReactTestRenderer.ReactTestRenderer;
    await ReactTestRenderer.act(() => {
      component = ReactTestRenderer.create(<HomeScreen />);
    });

    const root = component!.root;

    // Check for Text components that should exist
    const textElements = root.findAllByType('Text' as any);
    const textContents = textElements.map((el: any) =>
      el.props.children ? String(el.props.children) : '',
    );

    // Verify key text elements are present
    expect(textContents.some((text: string) => text.includes('Shalom Mobile'))).toBe(true);
    expect(textContents.some((text: string) => text.includes('Consultations en attente'))).toBe(true);
    expect(textContents.some((text: string) => text.includes('Patients Récents'))).toBe(true);
    expect(textContents.some((text: string) => text.includes('Synchronisation requise'))).toBe(true);
    expect(textContents.some((text: string) => text.includes('Nouveau Patient'))).toBe(true);
  });

  it('includes filter dropdowns for Dispensaire and Période', async () => {
    let component: ReactTestRenderer.ReactTestRenderer;
    await ReactTestRenderer.act(() => {
      component = ReactTestRenderer.create(<HomeScreen />);
    });

    const root = component!.root;
    const textElements = root.findAllByType('Text' as any);
    const textContents = textElements.map((el: any) =>
      el.props.children ? String(el.props.children) : '',
    );

    // Check for filter text
    expect(textContents.some((text: string) => text.includes('Dispensaire'))).toBe(true);
    expect(textContents.some((text: string) => text.includes('Période'))).toBe(true);
  });

  it('displays numeric counts for dashboard metrics', async () => {
    let component: ReactTestRenderer.ReactTestRenderer;
    await ReactTestRenderer.act(() => {
      component = ReactTestRenderer.create(<HomeScreen />);
    });

    const root = component!.root;
    const textElements = root.findAllByType('Text' as any);
    const textContents = textElements.map((el: any) =>
      el.props.children ? String(el.props.children) : '',
    );

    // Check for numeric counts (12, 5, 8 from the component)
    expect(textContents.some((text: string) => text === '12')).toBe(true);
    expect(textContents.some((text: string) => text === '5')).toBe(true);
    expect(textContents.some((text: string) => text === '8')).toBe(true);
  });
});
