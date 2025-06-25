// Export all types and interfaces
export * from './types.js';

// Export constants
export * from './constants.js';

// Export validator
export * from './validator.js';

// Export parser and convenience functions
export * from './parser.js';

// Legacy compatibility exports
import { ServerConfig } from '../server/types.js';
import { ParseResult, ParserOptions } from './types.js';
import { Parser } from './parser.js';

/**
 * Legacy server configuration parser class for backwards compatibility
 */
export class ServerConfigParser {
  private options: Required<ParserOptions>;
  private internalParser = new Parser();

  constructor(options: ParserOptions = {}) {
    this.options = {
      strict: options.strict ?? false,
      allowDefaults: options.allowDefaults ?? true,
      validateRanges: options.validateRanges ?? true
    };
  }

  /**
   * Parse a complete server configuration from JSON
   */
  parseServerConfig(json: string | object): ParseResult<ServerConfig> {
    // Delegate to the new Parser class
    return this.internalParser.parse(json, {
      validate: this.options.validateRanges,
      ignore_warnings: [],
      ignore_errors: []
    });
  }

  /**
   * Validate a server configuration without parsing
   */
  validateServerConfig(config: unknown): ParseResult<ServerConfig> {
    // Delegate to the new Parser class
    return this.internalParser.parse(config, {
      validate: true,
      ignore_warnings: [],
      ignore_errors: []
    });
  }
}

// Export a convenience instance
export const parser = new Parser();

// Convenience function that uses the default instance
export function parse(
  input: string | object | unknown,
  options?: {
    validate?: boolean;
    ignore_warnings?: string[];
    ignore_errors?: string[];
  }
): ParseResult<ServerConfig> {
  return parser.parse(input, options);
}

/**
 * Convenience function for quick parsing (legacy compatibility)
 */
export function parseServerConfig(
  json: string | object, 
  options?: ParserOptions
): ParseResult<ServerConfig> {
  const parser = new ServerConfigParser(options);
  return parser.parseServerConfig(json);
}

/**
 * Convenience function for validation only (legacy compatibility)
 */
export function validateServerConfig(
  config: unknown,
  options?: ParserOptions
): ParseResult<ServerConfig> {
  const parser = new ServerConfigParser(options);
  return parser.validateServerConfig(config);
}
