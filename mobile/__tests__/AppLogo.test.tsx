/**
 * @format
 */

import React from 'react';
import ReactTestRenderer, {act} from 'react-test-renderer';
import {AppLogo} from '../src/components/AppLogo';

// Mock react-native-svg
jest.mock('react-native-svg', () => {
  const React = require('react');
  const View = require('react-native').View;
  return {
    __esModule: true,
    default: ({children, ...props}: any) => React.createElement(View, props, children),
    Svg: ({children, ...props}: any) => React.createElement(View, props, children),
    Circle: (props: any) => React.createElement(View, props),
    G: ({children, ...props}: any) => React.createElement(View, props, children),
    Rect: (props: any) => React.createElement(View, props),
    Path: (props: any) => React.createElement(View, props),
    Text: ({children, ...props}: any) => React.createElement(View, props, children),
  };
});

describe('AppLogo Component', () => {
  it('renders full logo with text', async () => {
    let tree: any;
    await act(async () => {
      tree = ReactTestRenderer.create(
        <AppLogo width={200} height={200} showText={true} variant="full" />
      );
    });
    expect(tree.toJSON()).toBeTruthy();
  });

  it('renders mark variant without text', async () => {
    let tree: any;
    await act(async () => {
      tree = ReactTestRenderer.create(
        <AppLogo width={64} height={64} variant="mark" />
      );
    });
    expect(tree.toJSON()).toBeTruthy();
  });

  it('renders monochrome variant', async () => {
    let tree: any;
    await act(async () => {
      tree = ReactTestRenderer.create(
        <AppLogo width={150} height={150} showText={true} variant="mono" />
      );
    });
    expect(tree.toJSON()).toBeTruthy();
  });

  it('uses default props when not specified', async () => {
    let tree: any;
    await act(async () => {
      tree = ReactTestRenderer.create(<AppLogo />);
    });
    expect(tree.toJSON()).toBeTruthy();
  });

  it('renders correctly with custom dimensions', async () => {
    let tree: any;
    await act(async () => {
      tree = ReactTestRenderer.create(
        <AppLogo width={100} height={100} />
      );
    });
    expect(tree.toJSON()).toBeTruthy();
  });
});
