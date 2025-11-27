/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import {useAutoSync} from '../src/hooks/useAutoSync';
import {NetworkProvider} from '../src/contexts/NetworkContext';
import {View, Text} from 'react-native';

// Mock dependencies
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

jest.mock('../src/hooks/useLocalSync', () => ({
  useLocalSync: jest.fn(() => ({
    syncNow: jest.fn(),
    pendingCount: 0,
    isSyncing: false,
    syncQueue: [],
    syncStatus: null,
    enqueue: jest.fn(),
    getPendingItems: jest.fn(),
    clearSyncedItems: jest.fn(),
    retryItem: jest.fn(),
  })),
}));

// Mock AppState
jest.mock('react-native/Libraries/AppState/AppState', () => ({
  addEventListener: jest.fn(() => ({
    remove: jest.fn(),
  })),
  currentState: 'active',
  default: {
    addEventListener: jest.fn(() => ({
      remove: jest.fn(),
    })),
    currentState: 'active',
  },
}));

// Test component that uses the hook
function TestComponent() {
  const {isAutoSyncEnabled} = useAutoSync();

  return (
    <View>
      <Text testID="isAutoSyncEnabled">{String(isAutoSyncEnabled)}</Text>
    </View>
  );
}

describe('useAutoSync', () => {
  it('enables auto-sync by default', async () => {
    let component: ReactTestRenderer.ReactTestRenderer;
    await ReactTestRenderer.act(async () => {
      component = ReactTestRenderer.create(
        <NetworkProvider>
          <TestComponent />
        </NetworkProvider>
      );
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    const root = component!.root;
    
    expect(root.findByProps({testID: 'isAutoSyncEnabled'}).props.children).toBe(
      'true'
    );
  });

  it('initializes without errors', async () => {
    let component: ReactTestRenderer.ReactTestRenderer;
    await ReactTestRenderer.act(async () => {
      component = ReactTestRenderer.create(
        <NetworkProvider>
          <TestComponent />
        </NetworkProvider>
      );
    });

    expect(component).toBeDefined();
  });
});
