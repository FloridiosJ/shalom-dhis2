/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import {useSyncQueue} from '../src/hooks/useSyncQueue';
import {View, Text} from 'react-native';

// Test component that uses the hook
function TestComponent() {
  const {syncState, isSyncing, hasErrors} = useSyncQueue();

  return (
    <View>
      <Text testID="status">{syncState.status}</Text>
      <Text testID="isSyncing">{String(isSyncing)}</Text>
      <Text testID="hasErrors">{String(hasErrors)}</Text>
      <Text testID="pendingCount">{syncState.queueStats.pendingCount}</Text>
      <Text testID="errorCount">{syncState.queueStats.errorCount}</Text>
      <Text testID="errorsLength">{syncState.errors.length}</Text>
    </View>
  );
}

describe('useSyncQueue', () => {
  it('initializes with correct default state', async () => {
    let component: ReactTestRenderer.ReactTestRenderer;
    await ReactTestRenderer.act(() => {
      component = ReactTestRenderer.create(<TestComponent />);
    });

    const root = component!.root;
    
    expect(root.findByProps({testID: 'status'}).props.children).toBe('idle');
    expect(root.findByProps({testID: 'isSyncing'}).props.children).toBe('false');
    expect(root.findByProps({testID: 'hasErrors'}).props.children).toBe('true');
    expect(root.findByProps({testID: 'pendingCount'}).props.children).toBe(5);
    expect(root.findByProps({testID: 'errorCount'}).props.children).toBe(2);
    expect(root.findByProps({testID: 'errorsLength'}).props.children).toBe(2);
  });

  it('provides correct sync state properties', async () => {
    let component: ReactTestRenderer.ReactTestRenderer;
    await ReactTestRenderer.act(() => {
      component = ReactTestRenderer.create(<TestComponent />);
    });

    const root = component!.root;
    const status = root.findByProps({testID: 'status'}).props.children;
    
    expect(['idle', 'syncing', 'success', 'error']).toContain(status);
  });
});
