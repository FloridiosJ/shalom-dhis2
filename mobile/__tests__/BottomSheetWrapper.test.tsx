/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import {Text} from 'react-native';
import BottomSheetWrapper from '../src/components/common/BottomSheetWrapper';

// Mock @gorhom/bottom-sheet
jest.mock('@gorhom/bottom-sheet', () => {
  const ReactMock = require('react');
  return {
    __esModule: true,
    default: ReactMock.forwardRef(({children}: any, ref: any) =>
      ReactMock.createElement('BottomSheet', {ref}, children),
    ),
    BottomSheetBackdrop: ({children}: any) =>
      ReactMock.createElement('BottomSheetBackdrop', {}, children),
    BottomSheetView: ({children}: any) =>
      ReactMock.createElement('BottomSheetView', {}, children),
  };
});

// Mock react-native-gesture-handler
jest.mock('react-native-gesture-handler', () => {
  const ReactMock = require('react');
  return {
    GestureHandlerRootView: ({children}: any) =>
      ReactMock.createElement('GestureHandlerRootView', {}, children),
  };
});

describe('BottomSheetWrapper', () => {
  it('renders correctly with children', async () => {
    await ReactTestRenderer.act(async () => {
      ReactTestRenderer.create(
        <BottomSheetWrapper>
          <Text>Test Content</Text>
        </BottomSheetWrapper>,
      );
    });
  });

  it('renders with custom snap points', async () => {
    await ReactTestRenderer.act(async () => {
      ReactTestRenderer.create(
        <BottomSheetWrapper snapPoints={['50%', '75%']}>
          <Text>Test Content</Text>
        </BottomSheetWrapper>,
      );
    });
  });

  it('renders with dynamic sizing disabled', async () => {
    await ReactTestRenderer.act(async () => {
      ReactTestRenderer.create(
        <BottomSheetWrapper enableDynamicSizing={false} snapPoints={['50%']}>
          <Text>Test Content</Text>
        </BottomSheetWrapper>,
      );
    });
  });
});
