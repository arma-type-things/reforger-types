// Configuration parser for Arma Reforger server configurations
import {
  ServerConfig,
  GameConfig,
  GameProperties,
  OperatingConfig,
  A2SConfig,
  RconConfig,
  MissionHeader,
  Mod,
  SupportedPlatform
} from './types.js';

export interface ParseResult<T> {
  success: boolean;
  data?: T;
  errors: string[];
  warnings: string[];
}

export interface ParserOptions {
  strict?: boolean;           // Strict validation (fail on unknown properties)
  allowDefaults?: boolean;    // Fill in missing properties with defaults
  validateRanges?: boolean;   // Validate numeric ranges (ports, player counts, etc.)
}

export class ServerConfigParser {
  private options: Required<ParserOptions>;

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
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      const data = typeof json === 'string' ? JSON.parse(json) : json;
      
      // TODO: Implement validation logic
      // For now, return the data as-is with basic structure check
      if (!this.isValidServerConfigStructure(data)) {
        errors.push('Invalid server configuration structure');
        return { success: false, errors, warnings };
      }

      return {
        success: true,
        data: data as ServerConfig,
        errors,
        warnings
      };
    } catch (error) {
      errors.push(`JSON parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return { success: false, errors, warnings };
    }
  }

  /**
   * Parse just the game configuration section
   */
  parseGameConfig(json: string | object): ParseResult<GameConfig> {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      const data = typeof json === 'string' ? JSON.parse(json) : json;
      
      // TODO: Implement GameConfig validation
      return {
        success: true,
        data: data as GameConfig,
        errors,
        warnings
      };
    } catch (error) {
      errors.push(`JSON parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return { success: false, errors, warnings };
    }
  }

  /**
   * Parse game properties section
   */
  parseGameProperties(json: string | object): ParseResult<GameProperties> {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      const data = typeof json === 'string' ? JSON.parse(json) : json;
      
      // TODO: Implement GameProperties validation
      return {
        success: true,
        data: data as GameProperties,
        errors,
        warnings
      };
    } catch (error) {
      errors.push(`JSON parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return { success: false, errors, warnings };
    }
  }

  /**
   * Validate a server configuration without parsing
   */
  validateServerConfig(config: unknown): ParseResult<ServerConfig> {
    const errors: string[] = [];
    const warnings: string[] = [];

    // TODO: Implement comprehensive validation
    if (!this.isValidServerConfigStructure(config)) {
      errors.push('Invalid server configuration structure');
    }

    return {
      success: errors.length === 0,
      data: errors.length === 0 ? config as ServerConfig : undefined,
      errors,
      warnings
    };
  }

  /**
   * Basic structure validation (placeholder for future implementation)
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
   * Validate numeric ranges according to game limits
   */
  private validateRanges(config: ServerConfig): string[] {
    const errors: string[] = [];

    // Port validation
    if (config.bindPort < 1024 || config.bindPort > 65535) {
      errors.push(`bindPort must be between 1024 and 65535, got: ${config.bindPort}`);
    }

    // Player count validation
    if (config.game.maxPlayers < 1 || config.game.maxPlayers > 128) {
      errors.push(`maxPlayers must be between 1 and 128, got: ${config.game.maxPlayers}`);
    }

    // View distance validation
    if (config.game.gameProperties.serverMaxViewDistance < 500 || 
        config.game.gameProperties.serverMaxViewDistance > 10000) {
      errors.push(`serverMaxViewDistance must be between 500 and 10000, got: ${config.game.gameProperties.serverMaxViewDistance}`);
    }

    return errors;
  }

  /**
   * Apply default values to missing properties
   */
  private applyDefaults(config: Partial<ServerConfig>): ServerConfig {
    // TODO: Implement default application logic
    // This would merge the provided config with createDefaultServerConfig()
    return config as ServerConfig;
  }
}

/**
 * Convenience function for quick parsing
 */
export function parseServerConfig(
  json: string | object, 
  options?: ParserOptions
): ParseResult<ServerConfig> {
  const parser = new ServerConfigParser(options);
  return parser.parseServerConfig(json);
}

/**
 * Convenience function for validation only
 */
export function validateServerConfig(
  config: unknown,
  options?: ParserOptions
): ParseResult<ServerConfig> {
  const parser = new ServerConfigParser(options);
  return parser.validateServerConfig(config);
}
