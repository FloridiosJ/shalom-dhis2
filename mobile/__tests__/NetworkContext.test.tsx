/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import {NetworkProvider, useNetwork} from '../src/contexts/NetworkContext';
import {View, Text} from 'react-native';

// Mock NetInfo
jest.mock('@react-native-community/netinfo', () => ({
  addEventListener: jest.fn(() => jest.fn()),
  fetch: jest.fn(() =>
    Promise.resolve({
      isConnected: true,
      isInternetReachable: true,
      type: 'wifi',
    })
  ),
}));

// Test component that uses the hook
function TestComponent() {
  const {isConnected, isInternetReachable, connectionType} = useNetwork();

  return (
    <View>
      <Text testID="isConnected">{String(isConnected)}</Text>
      <Text testID="isInternetReachable">{String(isInternetReachable)}</Text>
      <Text testID="connectionType">{connectionType || 'null'}</Text>
    </View>
  );
}

describe('NetworkContext', () => {
  it('provides network state through context', async () => {
    let component: ReactTestRenderer.ReactTestRenderer;
    await ReactTestRenderer.act(async () => {
      component = ReactTestRenderer.create(
        <NetworkProvider>
          <TestComponent />
        </NetworkProvider>
      );
      // Wait for initial fetch
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    const root = component!.root;
    
    // Check initial state (from mocked fetch)
    expect(root.findByProps({testID: 'isConnected'}).props.children).toBe('true');
  });

  it('initializes with default values', async () => {
    let component: ReactTestRenderer.ReactTestRenderer;
    await ReactTestRenderer.act(async () => {
      component = ReactTestRenderer.create(
        <NetworkProvider>
          <TestComponent />
        </NetworkProvider>
      );
    });

    const root = component!.root;
    
    // Check that values are provided
    const isConnected = root.findByProps({testID: 'isConnected'}).props.children;
    expect(['true', 'false']).toContain(isConnected);
  });
});
