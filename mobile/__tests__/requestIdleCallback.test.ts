/**
 * @format
 */

import {
  scheduleIdleCallback,
  cancelIdleCallback,
  runAfterInteractions,
} from '../src/utils/requestIdleCallback';

// Mock timers for testing
jest.useFakeTimers();

describe('requestIdleCallback utilities', () => {
  beforeEach(() => {
    jest.clearAllTimers();
  });

  afterEach(() => {
    jest.clearAllTimers();
  });

  describe('scheduleIdleCallback', () => {
    it('schedules a callback to run', () => {
      const callback = jest.fn();
      scheduleIdleCallback(callback);

      expect(callback).not.toHaveBeenCalled();

      // Fast-forward time
      jest.runAllTimers();

      expect(callback).toHaveBeenCalled();
    });

    it('provides deadline object to callback', () => {
      const callback = jest.fn();
      scheduleIdleCallback(callback);

      jest.runAllTimers();

      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          didTimeout: expect.any(Boolean),
          timeRemaining: expect.any(Function),
        }),
      );
    });

    it('timeRemaining returns a number', () => {
      let deadline: any;
      const callback = jest.fn((d) => {
        deadline = d;
      });
      scheduleIdleCallback(callback);

      jest.runAllTimers();

      expect(typeof deadline.timeRemaining()).toBe('number');
      expect(deadline.timeRemaining()).toBeGreaterThanOrEqual(0);
    });
  });

  describe('cancelIdleCallback', () => {
    it('cancels a scheduled callback', () => {
      const callback = jest.fn();
      const handle = scheduleIdleCallback(callback);

      cancelIdleCallback(handle);
      jest.runAllTimers();

      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe('runAfterInteractions', () => {
    it('runs callback and returns a promise', async () => {
      const callback = jest.fn();
      const promise = runAfterInteractions(callback);

      expect(callback).not.toHaveBeenCalled();

      // Fast-forward time and resolve promises
      jest.runAllTimers();
      await promise;

      expect(callback).toHaveBeenCalled();
    });

    it('resolves even if callback throws an error', async () => {
      const callback = jest.fn(() => {
        throw new Error('Test error');
      });

      const consoleErrorSpy = jest
        .spyOn(console, 'error')
        .mockImplementation();

      const promise = runAfterInteractions(callback);

      jest.runAllTimers();
      await expect(promise).resolves.toBeUndefined();

      expect(callback).toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error in idle callback:',
        expect.any(Error),
      );

      consoleErrorSpy.mockRestore();
    });

    it('can be used to defer heavy operations', async () => {
      const heavyOperation = jest.fn(() => {
        // Simulate heavy computation
        let sum = 0;
        for (let i = 0; i < 1000; i++) {
          sum += i;
        }
        return sum;
      });

      const promise = runAfterInteractions(heavyOperation);

      expect(heavyOperation).not.toHaveBeenCalled();

      jest.runAllTimers();
      await promise;

      expect(heavyOperation).toHaveBeenCalled();
    });
  });

  describe('Integration with React components', () => {
    it('can be used to defer state updates', async () => {
      const stateUpdate = jest.fn();

      // Simulate component mount effect
      const componentEffect = async () => {
        await runAfterInteractions(() => {
          stateUpdate('new value');
        });
      };

      const promise = componentEffect();
      expect(stateUpdate).not.toHaveBeenCalled();

      jest.runAllTimers();
      await promise;

      expect(stateUpdate).toHaveBeenCalledWith('new value');
    });
  });
});
