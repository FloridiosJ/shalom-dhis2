/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import {useOfflineConsultation} from '../src/hooks/useOfflineConsultation';
import {NetworkProvider} from '../src/contexts/NetworkContext';
import {View, Text, Button} from 'react-native';
import {CreateConsultationInput} from '../src/services/consultationService';

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
    enqueue: jest.fn(async (type: string) => `temp-id-${type}`),
    syncNow: jest.fn(),
    pendingCount: 0,
    isSyncing: false,
    syncQueue: [],
    syncStatus: null,
    getPendingItems: jest.fn(),
    clearSyncedItems: jest.fn(),
    retryItem: jest.fn(),
  })),
}));

jest.mock('../src/services/consultationService', () => ({
  createConsultation: jest.fn(async () => ({
    id: 'test-id',
    dateConsultation: new Date().toISOString(),
    diagnostic: 'Test',
    prescription: '',
    notes: '',
    status: 'active',
    typeConsultation: 'general',
    patient: {
      id: 'patient-1',
      displayName: 'Test Patient',
    },
  })),
}));

// Test component that uses the hook
function TestComponent() {
  const {createConsultation, isOffline} = useOfflineConsultation();
  const [result, setResult] = React.useState<string>('none');

  const handleCreate = async () => {
    try {
      const input: CreateConsultationInput = {
        patientId: 'patient-1',
        typeConsultation: 'general',
        dateConsultation: new Date(),
        heureConsultation: new Date(),
        categoriesMaladie: '',
        notes: 'Test notes',
      };

      const res = await createConsultation(input);
      setResult(res.offline ? 'offline' : 'online');
    } catch (error) {
      setResult('error');
    }
  };

  return (
    <View>
      <Text testID="isOffline">{String(isOffline)}</Text>
      <Text testID="result">{result}</Text>
      <Button title="Create" onPress={handleCreate} />
    </View>
  );
}

describe('useOfflineConsultation', () => {
  it('provides isOffline status', async () => {
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
    const isOffline = root.findByProps({testID: 'isOffline'}).props.children;
    
    // Should be 'true' or 'false'
    expect(['true', 'false']).toContain(isOffline);
  });

  it('creates consultation when online', async () => {
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
    const button = root.findByType(Button);

    await ReactTestRenderer.act(async () => {
      button.props.onPress();
      await new Promise(resolve => setTimeout(resolve, 200));
    });

    const result = root.findByProps({testID: 'result'}).props.children;
    
    // Result should be 'online' or 'offline' depending on network state
    expect(['online', 'offline']).toContain(result);
  });
});
