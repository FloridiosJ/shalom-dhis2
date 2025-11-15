/**
 * @format
 */

import {generateUUID, validateUniqueKeys} from '../src/utils/uuid';

describe('uuid utility', () => {
  describe('generateUUID', () => {
    it('generates a valid UUID v4 format', () => {
      const uuid = generateUUID();
      // UUID v4 format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      expect(uuid).toMatch(uuidRegex);
    });

    it('generates unique UUIDs', () => {
      const uuid1 = generateUUID();
      const uuid2 = generateUUID();
      const uuid3 = generateUUID();
      
      expect(uuid1).not.toBe(uuid2);
      expect(uuid1).not.toBe(uuid3);
      expect(uuid2).not.toBe(uuid3);
    });

    it('generates 1000 unique UUIDs', () => {
      const uuids = new Set();
      for (let i = 0; i < 1000; i++) {
        uuids.add(generateUUID());
      }
      expect(uuids.size).toBe(1000);
    });
  });

  describe('validateUniqueKeys', () => {
    let consoleWarnSpy: jest.SpyInstance;

    beforeEach(() => {
      consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
    });

    afterEach(() => {
      consoleWarnSpy.mockRestore();
    });

    it('returns true for unique keys', () => {
      const keys = ['key1', 'key2', 'key3'];
      const result = validateUniqueKeys(keys);
      expect(result).toBe(true);
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    it('returns false for duplicate keys', () => {
      const keys = ['key1', 'key2', 'key1', 'key3'];
      const result = validateUniqueKeys(keys);
      expect(result).toBe(false);
    });

    it('logs warning in DEV mode for duplicates', () => {
      const originalDEV = (global as any).__DEV__;
      (global as any).__DEV__ = true;

      const keys = ['key1', 'key2', 'key1', 'key3', 'key2'];
      validateUniqueKeys(keys, 'TestContext');

      expect(consoleWarnSpy).toHaveBeenCalled();
      expect(consoleWarnSpy.mock.calls[0][0]).toContain('Key Uniqueness Warning');
      expect(consoleWarnSpy.mock.calls[0][0]).toContain('TestContext');

      (global as any).__DEV__ = originalDEV;
    });

    it('does not log in production mode', () => {
      const originalDEV = (global as any).__DEV__;
      (global as any).__DEV__ = false;

      const keys = ['key1', 'key2', 'key1'];
      validateUniqueKeys(keys);

      expect(consoleWarnSpy).not.toHaveBeenCalled();

      (global as any).__DEV__ = originalDEV;
    });

    it('handles empty array', () => {
      const keys: string[] = [];
      const result = validateUniqueKeys(keys);
      expect(result).toBe(true);
    });

    it('handles single key', () => {
      const keys = ['onlyKey'];
      const result = validateUniqueKeys(keys);
      expect(result).toBe(true);
    });
  });
});
