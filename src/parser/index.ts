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

/**
 * Convenience function for parsing and validating Arma Reforger server configurations
 * 
 * This function provides a simple interface to the Parser class for common parsing tasks.
 * It handles JSON parsing, structure validation, and business logic validation in a single call.
 * 
 * @param input - Configuration to parse (JSON string, object, or unknown type)
 * @param options - Parsing and validation options
 * @param options.validate - Whether to perform business logic validation (default: true)
 * @param options.ignore_warnings - Array of warning types to ignore during validation
 * @param options.ignore_errors - Array of error types to ignore during validation
 * @returns ParseResult containing success status, parsed data, errors, and warnings
 * 
 * @example
 * ```typescript
 * import { parse } from 'reforger-types';
 * 
 * const result = parse(configObject, {
 *   validate: true,
 *   ignore_warnings: ['EMPTY_ADMIN_PASSWORD']
 * });
 * 
 * if (result.success) {
 *   console.log('✅ Valid configuration');
 *   console.log('Server:', result.data.game.name);
 * } else {
 *   console.error('❌ Errors:', result.errors);
 *   console.error('❌ Validation Errors:', result.validationErrors);
 * }
 * ```
 */
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
