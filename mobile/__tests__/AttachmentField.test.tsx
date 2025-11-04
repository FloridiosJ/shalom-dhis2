/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import AttachmentField from '../src/components/form/AttachmentField';
import {Attachment} from '../src/types/consultation';

// Mock react-native-vector-icons
jest.mock('react-native-vector-icons/MaterialCommunityIcons', () => 'Icon');

// Mock react-native-image-picker
jest.mock('react-native-image-picker', () => ({
  launchCamera: jest.fn(),
  launchImageLibrary: jest.fn(),
}));

// Mock react-native-paper
jest.mock('react-native-paper', () => {
  const ReactMock = require('react');
  return {
    Text: ({children}: any) => ReactMock.createElement('Text', {}, children),
    Button: ({children}: any) =>
      ReactMock.createElement('Button', {}, children),
  };
});

const mockAttachments: Attachment[] = [
  {
    id: '1',
    uri: 'file:///path/to/image.jpg',
    name: 'image.jpg',
    type: 'image/jpeg',
    size: 102400,
  },
];

describe('AttachmentField', () => {
  it('renders correctly with no attachments', async () => {
    await ReactTestRenderer.act(async () => {
      ReactTestRenderer.create(
        <AttachmentField value={[]} onChange={jest.fn()} />,
      );
    });
  });

  it('renders correctly with attachments', async () => {
    await ReactTestRenderer.act(async () => {
      ReactTestRenderer.create(
        <AttachmentField value={mockAttachments} onChange={jest.fn()} />,
      );
    });
  });
});
