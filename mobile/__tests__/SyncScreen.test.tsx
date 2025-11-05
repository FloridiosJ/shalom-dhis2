/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import SyncScreen from '../src/screens/SyncScreen';
import {useSyncQueue} from '../src/hooks/useSyncQueue';

// Mock the useSyncQueue hook
jest.mock('../src/hooks/useSyncQueue');

// Mock react-native-paper components
jest.mock('react-native-paper', () => {
  const ReactMock = require('react');
  const {View, Text, TouchableOpacity} = require('react-native');
  
  const CardContent = (props: any) => ReactMock.createElement(View, props, props.children);
  const Card = Object.assign(
    (props: any) => ReactMock.createElement(View, props, props.children),
    { Content: CardContent }
  );
  
  return {
    Text: (props: any) =>
      ReactMock.createElement(Text, props, props.children),
    Button: (props: any) =>
      ReactMock.createElement(
        TouchableOpacity,
        {onPress: props.onPress, disabled: props.disabled},
        ReactMock.createElement(Text, null, props.children),
      ),
    Card,
    ProgressBar: (props: any) => ReactMock.createElement(View, props),
  };
});

// Mock react-native-vector-icons
jest.mock('react-native-vector-icons/MaterialCommunityIcons', () => 'Icon');

const mockSyncState = {
  status: 'idle' as const,
  lastSync: {
    status: 'success' as const,
    timestamp: '2023-12-08T14:35:00Z',
    itemsSynced: 3,
  },
  queueStats: {
    pendingCount: 5,
    errorCount: 2,
  },
  errors: [
    {
      id: 'error-1',
      title: 'Échec d\'envoi du formulaire Z',
      description: 'Erreur réseau',
      timestamp: new Date().toISOString(),
      retryable: true,
    },
    {
      id: 'error-2',
      title: 'Fichier patient invalide',
      description: 'Données corrompues',
      timestamp: new Date().toISOString(),
      retryable: true,
    },
  ],
  progress: null,
  isOffline: false,
};

describe('SyncScreen', () => {
  beforeEach(() => {
    (useSyncQueue as jest.Mock).mockReturnValue({
      syncState: mockSyncState,
      startSync: jest.fn(),
      retryError: jest.fn(),
      retryAllErrors: jest.fn(),
      isSyncing: false,
    });
  });

  it('renders correctly', async () => {
    let component: ReactTestRenderer.ReactTestRenderer;
    await ReactTestRenderer.act(() => {
      component = ReactTestRenderer.create(<SyncScreen />);
    });

    const tree = component!.toJSON();
    expect(tree).toBeTruthy();
  });

  it('displays last sync status', async () => {
    let component: ReactTestRenderer.ReactTestRenderer;
    await ReactTestRenderer.act(() => {
      component = ReactTestRenderer.create(<SyncScreen />);
    });

    const root = component!.root;
    const textElements = root.findAllByType('Text' as any);
    const textContents = textElements.map((el: any) =>
      el.props.children ? String(el.props.children) : '',
    );

    expect(textContents.some((text: string) => text.includes('Dernière synchronisation'))).toBe(true);
  });

  it('displays queue statistics', async () => {
    let component: ReactTestRenderer.ReactTestRenderer;
    await ReactTestRenderer.act(() => {
      component = ReactTestRenderer.create(<SyncScreen />);
    });

    const root = component!.root;
    const textElements = root.findAllByType('Text' as any);
    const textContents = textElements.map((el: any) =>
      el.props.children ? String(el.props.children) : '',
    );

    expect(textContents.some((text: string) => text.includes('Queue d\'envoi'))).toBe(true);
    expect(textContents.some((text: string) => text.includes('Éléments en attente'))).toBe(true);
  });

  it('displays error list', async () => {
    let component: ReactTestRenderer.ReactTestRenderer;
    await ReactTestRenderer.act(() => {
      component = ReactTestRenderer.create(<SyncScreen />);
    });

    const root = component!.root;
    const textElements = root.findAllByType('Text' as any);
    const textContents = textElements.map((el: any) =>
      el.props.children ? String(el.props.children) : '',
    );

    expect(textContents.some((text: string) => text.includes('Erreurs'))).toBe(true);
    expect(textContents.some((text: string) => text.includes('Tout réessayer'))).toBe(true);
  });

  it('displays sync button', async () => {
    let component: ReactTestRenderer.ReactTestRenderer;
    await ReactTestRenderer.act(() => {
      component = ReactTestRenderer.create(<SyncScreen />);
    });

    const root = component!.root;
    const textElements = root.findAllByType('Text' as any);
    const textContents = textElements.map((el: any) =>
      el.props.children ? String(el.props.children) : '',
    );

    expect(textContents.some((text: string) => text.includes('Synchroniser maintenant'))).toBe(true);
  });

  it('displays progress bar when syncing', async () => {
    (useSyncQueue as jest.Mock).mockReturnValue({
      syncState: {
        ...mockSyncState,
        status: 'syncing',
        progress: {current: 2, total: 5},
      },
      startSync: jest.fn(),
      retryError: jest.fn(),
      retryAllErrors: jest.fn(),
      isSyncing: true,
    });

    let component: ReactTestRenderer.ReactTestRenderer;
    await ReactTestRenderer.act(() => {
      component = ReactTestRenderer.create(<SyncScreen />);
    });

    const root = component!.root;
    const textElements = root.findAllByType('Text' as any);
    const textContents = textElements.map((el: any) =>
      el.props.children ? String(el.props.children) : '',
    );

    expect(textContents.some((text: string) => text.includes('Envoi des données'))).toBe(true);
  });

  it('shows offline notice when offline', async () => {
    (useSyncQueue as jest.Mock).mockReturnValue({
      syncState: {
        ...mockSyncState,
        isOffline: true,
      },
      startSync: jest.fn(),
      retryError: jest.fn(),
      retryAllErrors: jest.fn(),
      isSyncing: false,
    });

    let component: ReactTestRenderer.ReactTestRenderer;
    await ReactTestRenderer.act(() => {
      component = ReactTestRenderer.create(<SyncScreen />);
    });

    const root = component!.root;
    const textElements = root.findAllByType('Text' as any);
    const textContents = textElements.map((el: any) =>
      el.props.children ? String(el.props.children) : '',
    );

    expect(textContents.some((text: string) => text.includes('Mode hors ligne'))).toBe(true);
  });
});
