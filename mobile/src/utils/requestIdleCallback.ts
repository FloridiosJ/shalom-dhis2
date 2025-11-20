/**
 * Polyfill for requestIdleCallback in React Native
 * 
 * This is a replacement for the deprecated InteractionManager.runAfterInteractions.
 * It schedules work to run when the JS thread is idle, avoiding blocking the UI.
 * 
 * Note: React Native doesn't have native requestIdleCallback support, so we use
 * setTimeout as a fallback with a small delay to achieve similar behavior.
 * 
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Window/requestIdleCallback
 */

type IdleRequestCallback = (deadline: IdleDeadline) => void;

interface IdleDeadline {
  didTimeout: boolean;
  timeRemaining: () => number;
}

interface IdleCallbackOptions {
  timeout?: number;
}

// Check if requestIdleCallback is available (it's not in React Native)
const hasNativeSupport = typeof requestIdleCallback !== 'undefined';

/**
 * Schedule a callback to run during idle time
 * 
 * @param callback Function to execute when idle
 * @param options Optional configuration with timeout
 * @returns A handle that can be used to cancel the callback
 */
export function scheduleIdleCallback(
  callback: IdleRequestCallback,
  options?: IdleCallbackOptions
): number {
  if (hasNativeSupport) {
    // Use native implementation if available (future-proofing)
    return requestIdleCallback(callback, options);
  }

  // Fallback implementation using setTimeout
  // Use a small delay to let the current frame complete
  const startTime = Date.now();
  const timeout = options?.timeout || 1000;

  const timeoutId = setTimeout(() => {
    const didTimeout = Date.now() - startTime >= timeout;
    
    callback({
      didTimeout,
      timeRemaining: () => {
        // Return remaining time in the idle period
        // For the fallback, we assume 50ms is available
        const elapsed = Date.now() - startTime;
        return Math.max(0, 50 - elapsed);
      },
    });
  }, 1) as unknown as number;

  return timeoutId;
}

/**
 * Cancel a scheduled idle callback
 * 
 * @param handle The handle returned by scheduleIdleCallback
 */
export function cancelIdleCallback(handle: number): void {
  if (hasNativeSupport) {
    cancelIdleCallback(handle);
  } else {
    clearTimeout(handle);
  }
}

/**
 * Run a callback after interactions complete
 * 
 * This is a direct replacement for InteractionManager.runAfterInteractions.
 * Use this when you need to defer work until after animations/interactions complete.
 * 
 * @param callback The callback to execute
 * @returns A promise that resolves after the callback completes
 * 
 * @example
 * runAfterInteractions(() => {
 *   // Heavy computation or non-urgent work
 *   console.log('This runs when the UI is idle');
 * });
 */
export function runAfterInteractions(
  callback: () => void
): Promise<void> {
  return new Promise((resolve) => {
    scheduleIdleCallback(() => {
      try {
        callback();
        resolve();
      } catch (error) {
        console.error('Error in idle callback:', error);
        resolve();
      }
    });
  });
}
