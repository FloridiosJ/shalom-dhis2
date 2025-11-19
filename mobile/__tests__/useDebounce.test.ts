/**
 * @format
 */

import {renderHook, waitFor} from '@testing-library/react-native';
import {useDebounce} from '../src/hooks/useDebounce';

describe('useDebounce', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('returns the initial value immediately', () => {
    const {result} = renderHook(() => useDebounce('test', 300));
    expect(result.current).toBe('test');
  });

  it('debounces value changes', async () => {
    const {result, rerender} = renderHook(
      ({value}) => useDebounce(value, 300),
      {
        initialProps: {value: 'initial'},
      },
    );

    expect(result.current).toBe('initial');

    // Update value
    rerender({value: 'updated'});

    // Value should not change immediately
    expect(result.current).toBe('initial');

    // Fast-forward time
    jest.advanceTimersByTime(300);

    // Value should now be updated
    await waitFor(() => {
      expect(result.current).toBe('updated');
    });
  });

  it('cancels previous timeout on rapid changes', async () => {
    const {result, rerender} = renderHook(
      ({value}) => useDebounce(value, 300),
      {
        initialProps: {value: 'initial'},
      },
    );

    rerender({value: 'first'});
    jest.advanceTimersByTime(100);

    rerender({value: 'second'});
    jest.advanceTimersByTime(100);

    rerender({value: 'final'});
    jest.advanceTimersByTime(300);

    await waitFor(() => {
      expect(result.current).toBe('final');
    });
  });

  it('uses custom delay', async () => {
    const {result, rerender} = renderHook(
      ({value}) => useDebounce(value, 500),
      {
        initialProps: {value: 'initial'},
      },
    );

    rerender({value: 'updated'});

    // After 300ms, still the old value
    jest.advanceTimersByTime(300);
    expect(result.current).toBe('initial');

    // After 500ms total, new value
    jest.advanceTimersByTime(200);
    await waitFor(() => {
      expect(result.current).toBe('updated');
    });
  });
});
