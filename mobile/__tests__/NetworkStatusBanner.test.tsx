/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import {NetworkStatusBanner} from '../src/components/NetworkStatusBanner';
import {NetworkProvider} from '../src/contexts/NetworkContext';

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
    pendingCount: 0,
    syncQueue: [],
    syncStatus: null,
    isSyncing: false,
    enqueue: jest.fn(),
    syncNow: jest.fn(),
    getPendingItems: jest.fn(),
    clearSyncedItems: jest.fn(),
    retryItem: jest.fn(),
  })),
}));

// Mock react-native-vector-icons
jest.mock('react-native-vector-icons/MaterialCommunityIcons', () => 'Icon');

describe('NetworkStatusBanner', () => {
  it('hides when online and no pending items', async () => {
    let component: ReactTestRenderer.ReactTestRenderer;
    await ReactTestRenderer.act(async () => {
      component = ReactTestRenderer.create(
        <NetworkProvider>
          <NetworkStatusBanner />
        </NetworkProvider>
      );
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    // Should render null when online and no pending items
    expect(component.toJSON()).toBeNull();
  });

  it('renders without errors', async () => {
    let component: ReactTestRenderer.ReactTestRenderer;
    await ReactTestRenderer.act(async () => {
      component = ReactTestRenderer.create(
        <NetworkProvider>
          <NetworkStatusBanner />
        </NetworkProvider>
      );
    });

    expect(component).toBeDefined();
  });
});
