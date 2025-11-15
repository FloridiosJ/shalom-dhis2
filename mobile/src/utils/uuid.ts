/**
 * Generate a UUID v4
 * 
 * This utility provides a consistent way to generate UUIDs across the app.
 * Used for clientTempId generation and as fallback keys where unique IDs are needed.
 * 
 * Note: Bitwise operators are necessary for proper UUID v4 generation
 * 
 * @returns A UUID v4 string in the format xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
 */
export function generateUUID(): string {
  /* eslint-disable no-bitwise */
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
  /* eslint-enable no-bitwise */
}

/**
 * Validate that an array of keys are unique
 * Logs a warning in DEV mode if duplicate keys are found
 * 
 * @param keys Array of keys to validate
 * @param context Optional context string for better error messages
 * @returns true if all keys are unique, false otherwise
 */
export function validateUniqueKeys(keys: string[], context?: string): boolean {
  const keySet = new Set(keys);
  const hasNoDuplicates = keySet.size === keys.length;
  
  if (!hasNoDuplicates && __DEV__) {
    const duplicates = keys.filter((key, index) => keys.indexOf(key) !== index);
    const uniqueDuplicates = [...new Set(duplicates)];
    console.warn(
      `[Key Uniqueness Warning]${context ? ` ${context}:` : ''} Found ${keys.length - keySet.size} duplicate key(s).`,
      `Duplicate keys: ${uniqueDuplicates.join(', ')}`
    );
  }
  
  return hasNoDuplicates;
}
