// Export all types and interfaces
export * from './types.js';

// Export constants
export * from './constants.js';

// Export validator
export * from './validator.js';

// Export parser and convenience functions
export * from './parser.js';

// Export a convenience instance
import { Parser } from './parser.js';
export const parser = new Parser();

// Convenience function that uses the default instance
export function parse(
  input: string | object | unknown,
  options?: {
    validate?: boolean;
    ignore_warnings?: string[];
    ignore_errors?: string[];
  }
) {
  return parser.parse(input, options);
}
