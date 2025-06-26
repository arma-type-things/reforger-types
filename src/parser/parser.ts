import { ServerConfig } from '../server/types.js';
import { ParseResult, ParserWarning, ParserError } from './types.js';
import { Validator } from './validator.js';

/**
 * Parser for Arma Reforger server configurations
 * Handles JSON parsing and basic structure validation, delegates business logic to Validator
 */
export class Parser {
  private validator = new Validator();

  /**
   * Parse and validate an Arma Reforger server configuration
   * 
   * @param input - JSON string or configuration object to parse
   * @param options - Parse configuration options
   * @returns ParseResult with success status, parsed data, errors, and warnings
   */
  parse(
    input: string | object | unknown,
    options: {
      validate?: boolean;
      ignore_warnings?: string[];
      ignore_errors?: string[];
    } = {}
  ): ParseResult<ServerConfig> {
    const {
      validate = true,
      ignore_warnings = [],
      ignore_errors = []
    } = options;

    const errors: string[] = [];
    let warnings: ParserWarning[] = [];
    let validationErrors: ParserError[] = [];

    try {
      // Parse JSON if input is a string
      const data = typeof input === 'string' ? JSON.parse(input) : input;
      
      // Basic "quack check" - does it look like a ServerConfig?
      if (!this.isValidServerConfigStructure(data)) {
        errors.push('Invalid server configuration structure');
        return { success: false, errors, warnings, validationErrors };
      }

      const config = data as ServerConfig;

      // Perform validation if requested
      if (validate) {
        // Range validation (structural errors)
        const rangeErrors = this.validateRanges(config);
        errors.push(...rangeErrors);

        // Business logic validation (validation errors and warnings)
        const validationResult = this.validator.validate(config);
        validationErrors = validationResult.errors;
        warnings = validationResult.warnings;

        // Filter out ignored warnings and errors
        warnings = warnings.filter(w => !ignore_warnings.includes(w.type));
        validationErrors = validationErrors.filter(e => !ignore_errors.includes(e.type));
      }

      return {
        success: errors.length === 0 && validationErrors.length === 0,
        data: errors.length === 0 && validationErrors.length === 0 ? config : undefined,
        errors,
        warnings,
        validationErrors
      };

    } catch (error) {
      errors.push(`JSON parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return { success: false, errors, warnings, validationErrors };
    }
  }

  /**
   * Basic structure validation - "quack check" for ServerConfig
   */
  private isValidServerConfigStructure(data: unknown): data is ServerConfig {
    if (!data || typeof data !== 'object') {
      return false;
    }

    const config = data as Record<string, unknown>;
    
    // Check for required top-level properties
    const requiredProps = ['bindAddress', 'bindPort', 'a2s', 'rcon', 'game', 'operating'];
    for (const prop of requiredProps) {
      if (!(prop in config)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Validate numeric ranges - structural validation
   */
  private validateRanges(config: ServerConfig): string[] {
    const errors: string[] = [];

    // Port validation (these are structural errors)
    if (config.bindPort < 1024 || config.bindPort > 65535) {
      errors.push(`bindPort must be between 1024 and 65535, got: ${config.bindPort}`);
    }

    // Player count validation (these are structural errors)
    if (config.game.maxPlayers < 1 || config.game.maxPlayers > 128) {
      errors.push(`maxPlayers must be between 1 and 128, got: ${config.game.maxPlayers}`);
    }

    return errors;
  }
}
