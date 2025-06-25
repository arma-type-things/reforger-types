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
import { isValidModId, getEffectiveModName } from './extensions.js';

/**
 * Enumeration of parser error types for hard validation failures
 */
export enum ParserErrorType {
  // RCON errors
  RCON_PASSWORD_TOO_SHORT = 'RCON_PASSWORD_TOO_SHORT',
  RCON_PASSWORD_CONTAINS_SPACES = 'RCON_PASSWORD_CONTAINS_SPACES',
  RCON_INVALID_PERMISSION = 'RCON_INVALID_PERMISSION',
  RCON_MAX_CLIENTS_OUT_OF_RANGE = 'RCON_MAX_CLIENTS_OUT_OF_RANGE',
  
  // Game configuration errors
  GAME_NAME_TOO_LONG = 'GAME_NAME_TOO_LONG',
  ADMIN_PASSWORD_CONTAINS_SPACES = 'ADMIN_PASSWORD_CONTAINS_SPACES',
  ADMINS_LIST_TOO_LONG = 'ADMINS_LIST_TOO_LONG',
  
  // Game properties errors
  SERVER_VIEW_DISTANCE_OUT_OF_RANGE = 'SERVER_VIEW_DISTANCE_OUT_OF_RANGE',
  NETWORK_VIEW_DISTANCE_OUT_OF_RANGE = 'NETWORK_VIEW_DISTANCE_OUT_OF_RANGE',
  GRASS_DISTANCE_INVALID = 'GRASS_DISTANCE_INVALID',
  
  // Operating configuration errors
  SLOT_RESERVATION_TIMEOUT_OUT_OF_RANGE = 'SLOT_RESERVATION_TIMEOUT_OUT_OF_RANGE',
  JOIN_QUEUE_MAX_SIZE_OUT_OF_RANGE = 'JOIN_QUEUE_MAX_SIZE_OUT_OF_RANGE',
  
  // Platform errors
  INVALID_SUPPORTED_PLATFORM = 'INVALID_SUPPORTED_PLATFORM'
}

/**
 * Parser error with contextual information
 */
export interface ParserError {
  type: ParserErrorType;
  message: string;
  field?: string;
  value?: unknown;
  validRange?: string;
}

/**
 * Enumeration of parser warning types
 */
export enum ParserWarningType {
  // View distance warnings
  VIEW_DISTANCE_EXCEEDS_RECOMMENDED = 'VIEW_DISTANCE_EXCEEDS_RECOMMENDED',
  VIEW_DISTANCE_EXCEEDS_MAXIMUM = 'VIEW_DISTANCE_EXCEEDS_MAXIMUM',
  VIEW_DISTANCE_BELOW_MINIMUM = 'VIEW_DISTANCE_BELOW_MINIMUM',
  NETWORK_VIEW_DISTANCE_MISMATCH = 'NETWORK_VIEW_DISTANCE_MISMATCH',
  
  // Player count warnings
  PLAYER_COUNT_EXCEEDS_RECOMMENDED = 'PLAYER_COUNT_EXCEEDS_RECOMMENDED',
  
  // Performance warnings
  GRASS_DISTANCE_HIGH_PERFORMANCE_IMPACT = 'GRASS_DISTANCE_HIGH_PERFORMANCE_IMPACT',
  AI_LIMIT_HIGH_PERFORMANCE_IMPACT = 'AI_LIMIT_HIGH_PERFORMANCE_IMPACT',
  
  // Security warnings
  EMPTY_ADMIN_PASSWORD = 'EMPTY_ADMIN_PASSWORD',
  WEAK_RCON_PASSWORD = 'WEAK_RCON_PASSWORD',
  
  // Mod warnings
  INVALID_MOD_ID = 'INVALID_MOD_ID',
  DUPLICATE_MOD_ID = 'DUPLICATE_MOD_ID',
  
  // Configuration warnings
  PUBLIC_ADDRESS_MISMATCH = 'PUBLIC_ADDRESS_MISMATCH',
  PORT_CONFLICT = 'PORT_CONFLICT'
}

/**
 * Parser warning with contextual information
 */
export interface ParserWarning {
  type: ParserWarningType;
  message: string;
  field?: string;
  value?: unknown;
  recommendedValue?: unknown;
}

export interface ParseResult<T> {
  success: boolean;
  data?: T;
  errors: string[];
  warnings: ParserWarning[];
  validationErrors: ParserError[];
}

/**
 * Validation constants for Arma Reforger server configuration
 * Based on official documentation from the server config wiki
 */
const VALIDATION_CONSTANTS = {
  VIEW_DISTANCE: {
    MINIMUM: 500,
    RECOMMENDED_MAX: 2500,  // Performance impact starts to become significant above this
    ABSOLUTE_MAX: 10000,
    NETWORK_RECOMMENDED_RATIO: 0.9  // Network view distance should be ~90% of server view distance
  },
  PLAYER_COUNT: {
    MINIMUM: 1,
    RECOMMENDED_MAX: 96,    // Performance impact increases significantly above this
    ABSOLUTE_MAX: 128
  },
  GRASS_DISTANCE: {
    HIGH_PERFORMANCE_IMPACT: 100  // Values above this may significantly impact performance
  },
  AI_LIMIT: {
    HIGH_PERFORMANCE_IMPACT: 80  // Values above this may significantly impact performance
  },
  PORTS: {
    MINIMUM: 1024,
    MAXIMUM: 65535
  },
  PASSWORD: {
    MINIMUM_LENGTH: 3  // According to wiki: "must be at least 3 characters long"
  }
} as const;

/**
 * Validation result from the Validator
 */
interface ValidationResult {
  errors: ParserError[];
  warnings: ParserWarning[];
}

/**
 * Server configuration validator - handles business logic validation
 */
class Validator {
  /**
   * Validate a server configuration and return errors and warnings
   */
  validateServerConfig(config: ServerConfig): ValidationResult {
    const errors: ParserError[] = [];
    const warnings: ParserWarning[] = [];

    // Perform hard validation checks
    this.validateHardRequirements(config, errors);

    // Generate warnings for configuration issues
    this.generateConfigurationWarnings(config, warnings);

    return { errors, warnings };
  }

  /**
   * Validate hard requirements that should cause parsing to fail
   */
  private validateHardRequirements(config: ServerConfig, validationErrors: ParserError[]): void {
    // RCON validation
    this.validateRconHardRequirements(config.rcon, validationErrors);
    
    // Game configuration validation
    this.validateGameConfigHardRequirements(config.game, validationErrors);
    
    // Game properties validation
    this.validateGamePropertiesHardRequirements(config.game.gameProperties, validationErrors);
    
    // Operating configuration validation
    this.validateOperatingConfigHardRequirements(config.operating, validationErrors);
  }

  /**
   * Validate RCON hard requirements
   */
  private validateRconHardRequirements(rconConfig: RconConfig, validationErrors: ParserError[]): void {
    // Only validate RCON requirements if RCON is being used (password is provided)
    if (!rconConfig.password || rconConfig.password.length === 0) {
      // RCON is optional - no validation needed if password is empty
      return;
    }

    // RCON password must be at least 3 characters if provided
    if (rconConfig.password.length < 3) {
      validationErrors.push({
        type: ParserErrorType.RCON_PASSWORD_TOO_SHORT,
        message: `RCON password must be at least 3 characters long. Current length: ${rconConfig.password.length}`,
        field: 'rcon.password',
        value: rconConfig.password.length,
        validRange: '3+ characters'
      });
    }

    // RCON password cannot contain spaces
    if (rconConfig.password.includes(' ')) {
      validationErrors.push({
        type: ParserErrorType.RCON_PASSWORD_CONTAINS_SPACES,
        message: 'RCON password cannot contain spaces',
        field: 'rcon.password',
        value: rconConfig.password
      });
    }

    // RCON permission must be valid
    if (rconConfig.permission && !['admin', 'monitor'].includes(rconConfig.permission)) {
      validationErrors.push({
        type: ParserErrorType.RCON_INVALID_PERMISSION,
        message: `Invalid RCON permission: ${rconConfig.permission}. Must be 'admin' or 'monitor'`,
        field: 'rcon.permission',
        value: rconConfig.permission,
        validRange: 'admin | monitor'
      });
    }

    // RCON maxClients must be between 1 and 16
    if (rconConfig.maxClients !== undefined) {
      if (rconConfig.maxClients < 1 || rconConfig.maxClients > 16) {
        validationErrors.push({
          type: ParserErrorType.RCON_MAX_CLIENTS_OUT_OF_RANGE,
          message: `RCON maxClients must be between 1 and 16. Current value: ${rconConfig.maxClients}`,
          field: 'rcon.maxClients',
          value: rconConfig.maxClients,
          validRange: '1-16'
        });
      }
    }
  }

  /**
   * Validate game configuration hard requirements
   */
  private validateGameConfigHardRequirements(gameConfig: GameConfig, validationErrors: ParserError[]): void {
    // Game name cannot exceed 100 characters
    if (gameConfig.name && gameConfig.name.length > 100) {
      validationErrors.push({
        type: ParserErrorType.GAME_NAME_TOO_LONG,
        message: `Game name cannot exceed 100 characters. Current length: ${gameConfig.name.length}`,
        field: 'game.name',
        value: gameConfig.name.length,
        validRange: '0-100 characters'
      });
    }

    // Admin password cannot contain spaces
    if (gameConfig.passwordAdmin && gameConfig.passwordAdmin.includes(' ')) {
      validationErrors.push({
        type: ParserErrorType.ADMIN_PASSWORD_CONTAINS_SPACES,
        message: 'Admin password cannot contain spaces',
        field: 'game.passwordAdmin',
        value: gameConfig.passwordAdmin
      });
    }

    // Admins list cannot exceed 20 entries
    if (gameConfig.admins && gameConfig.admins.length > 20) {
      validationErrors.push({
        type: ParserErrorType.ADMINS_LIST_TOO_LONG,
        message: `Admins list cannot exceed 20 entries. Current count: ${gameConfig.admins.length}`,
        field: 'game.admins',
        value: gameConfig.admins.length,
        validRange: '0-20 entries'
      });
    }

    // Validate supported platforms
    if (gameConfig.supportedPlatforms) {
      const validPlatforms = ['PLATFORM_PC', 'PLATFORM_XBL', 'PLATFORM_PSN'];
      gameConfig.supportedPlatforms.forEach((platform, index) => {
        if (!validPlatforms.includes(platform)) {
          validationErrors.push({
            type: ParserErrorType.INVALID_SUPPORTED_PLATFORM,
            message: `Invalid supported platform: ${platform}. Valid platforms: ${validPlatforms.join(', ')}`,
            field: `game.supportedPlatforms[${index}]`,
            value: platform,
            validRange: validPlatforms.join(' | ')
          });
        }
      });
    }
  }

  /**
   * Validate game properties hard requirements
   */
  private validateGamePropertiesHardRequirements(gameProperties: GameProperties, validationErrors: ParserError[]): void {
    // Server view distance must be within 500-10000 range
    if (gameProperties.serverMaxViewDistance < 500 || gameProperties.serverMaxViewDistance > 10000) {
      validationErrors.push({
        type: ParserErrorType.SERVER_VIEW_DISTANCE_OUT_OF_RANGE,
        message: `Server view distance must be between 500 and 10000. Current value: ${gameProperties.serverMaxViewDistance}`,
        field: 'game.gameProperties.serverMaxViewDistance',
        value: gameProperties.serverMaxViewDistance,
        validRange: '500-10000'
      });
    }

    // Network view distance must be within 500-5000 range
    if (gameProperties.networkViewDistance < 500 || gameProperties.networkViewDistance > 5000) {
      validationErrors.push({
        type: ParserErrorType.NETWORK_VIEW_DISTANCE_OUT_OF_RANGE,
        message: `Network view distance must be between 500 and 5000. Current value: ${gameProperties.networkViewDistance}`,
        field: 'game.gameProperties.networkViewDistance',
        value: gameProperties.networkViewDistance,
        validRange: '500-5000'
      });
    }

    // Grass distance must be 0 or between 50-150
    if (gameProperties.serverMinGrassDistance !== 0 && 
        (gameProperties.serverMinGrassDistance < 50 || gameProperties.serverMinGrassDistance > 150)) {
      validationErrors.push({
        type: ParserErrorType.GRASS_DISTANCE_INVALID,
        message: `Grass distance must be 0 or between 50 and 150. Current value: ${gameProperties.serverMinGrassDistance}`,
        field: 'game.gameProperties.serverMinGrassDistance',
        value: gameProperties.serverMinGrassDistance,
        validRange: '0 | 50-150'
      });
    }
  }

  /**
   * Validate operating configuration hard requirements
   */
  private validateOperatingConfigHardRequirements(operatingConfig: OperatingConfig, validationErrors: ParserError[]): void {
    // Slot reservation timeout must be between 5-300 seconds
    if (operatingConfig.slotReservationTimeout !== undefined && 
        (operatingConfig.slotReservationTimeout < 5 || operatingConfig.slotReservationTimeout > 300)) {
      validationErrors.push({
        type: ParserErrorType.SLOT_RESERVATION_TIMEOUT_OUT_OF_RANGE,
        message: `Slot reservation timeout must be between 5 and 300 seconds. Current value: ${operatingConfig.slotReservationTimeout}`,
        field: 'operating.slotReservationTimeout',
        value: operatingConfig.slotReservationTimeout,
        validRange: '5-300 seconds'
      });
    }

    // Join queue maxSize must be between 0-50
    if (operatingConfig.joinQueue?.maxSize !== undefined) {
      if (operatingConfig.joinQueue.maxSize < 0 || operatingConfig.joinQueue.maxSize > 50) {
        validationErrors.push({
          type: ParserErrorType.JOIN_QUEUE_MAX_SIZE_OUT_OF_RANGE,
          message: `Join queue maxSize must be between 0 and 50. Current value: ${operatingConfig.joinQueue.maxSize}`,
          field: 'operating.joinQueue.maxSize',
          value: operatingConfig.joinQueue.maxSize,
          validRange: '0-50'
        });
      }
    }
  }

  /**
   * Generate configuration warnings for potential issues
   */
  private generateConfigurationWarnings(config: ServerConfig, warnings: ParserWarning[]): void {
    // View distance warnings
    this.validateViewDistances(config.game.gameProperties, warnings);
    
    // Player count warnings
    this.validatePlayerCount(config.game, warnings);
    
    // Performance warnings
    this.validatePerformanceSettings(config.game.gameProperties, config.operating, warnings);
    
    // Security warnings
    this.validateSecuritySettings(config.game, config.rcon, warnings);
    
    // Mod warnings
    this.validateMods(config.game.mods, warnings);
    
    // Network warnings
    this.validateNetworkSettings(config, warnings);
  }

  /**
   * Validate view distance settings and generate warnings
   */
  private validateViewDistances(gameProperties: GameProperties, warnings: ParserWarning[]): void {
    const serverViewDistance = gameProperties.serverMaxViewDistance;
    const networkViewDistance = gameProperties.networkViewDistance;

    // Check if view distance exceeds recommended maximum
    if (serverViewDistance > VALIDATION_CONSTANTS.VIEW_DISTANCE.RECOMMENDED_MAX) {
      warnings.push({
        type: ParserWarningType.VIEW_DISTANCE_EXCEEDS_RECOMMENDED,
        message: `Server view distance (${serverViewDistance}) exceeds recommended maximum of ${VALIDATION_CONSTANTS.VIEW_DISTANCE.RECOMMENDED_MAX}. This may impact server performance.`,
        field: 'game.gameProperties.serverMaxViewDistance',
        value: serverViewDistance,
        recommendedValue: VALIDATION_CONSTANTS.VIEW_DISTANCE.RECOMMENDED_MAX
      });
    }

    // Check if view distance exceeds absolute maximum
    if (serverViewDistance > VALIDATION_CONSTANTS.VIEW_DISTANCE.ABSOLUTE_MAX) {
      warnings.push({
        type: ParserWarningType.VIEW_DISTANCE_EXCEEDS_MAXIMUM,
        message: `Server view distance (${serverViewDistance}) exceeds maximum supported value of ${VALIDATION_CONSTANTS.VIEW_DISTANCE.ABSOLUTE_MAX}.`,
        field: 'game.gameProperties.serverMaxViewDistance',
        value: serverViewDistance,
        recommendedValue: VALIDATION_CONSTANTS.VIEW_DISTANCE.ABSOLUTE_MAX
      });
    }

    // Check if view distance is below minimum
    if (serverViewDistance < VALIDATION_CONSTANTS.VIEW_DISTANCE.MINIMUM) {
      warnings.push({
        type: ParserWarningType.VIEW_DISTANCE_BELOW_MINIMUM,
        message: `Server view distance (${serverViewDistance}) is below minimum recommended value of ${VALIDATION_CONSTANTS.VIEW_DISTANCE.MINIMUM}.`,
        field: 'game.gameProperties.serverMaxViewDistance',
        value: serverViewDistance,
        recommendedValue: VALIDATION_CONSTANTS.VIEW_DISTANCE.MINIMUM
      });
    }

    // Check network view distance vs server view distance ratio
    const recommendedNetworkDistance = Math.floor(serverViewDistance * VALIDATION_CONSTANTS.VIEW_DISTANCE.NETWORK_RECOMMENDED_RATIO);
    if (networkViewDistance > serverViewDistance) {
      warnings.push({
        type: ParserWarningType.NETWORK_VIEW_DISTANCE_MISMATCH,
        message: `Network view distance (${networkViewDistance}) should not exceed server view distance (${serverViewDistance}).`,
        field: 'game.gameProperties.networkViewDistance',
        value: networkViewDistance,
        recommendedValue: recommendedNetworkDistance
      });
    }
  }

  /**
   * Validate player count settings
   */
  private validatePlayerCount(gameConfig: GameConfig, warnings: ParserWarning[]): void {
    const maxPlayers = gameConfig.maxPlayers;

    if (maxPlayers > VALIDATION_CONSTANTS.PLAYER_COUNT.RECOMMENDED_MAX) {
      warnings.push({
        type: ParserWarningType.PLAYER_COUNT_EXCEEDS_RECOMMENDED,
        message: `Player count (${maxPlayers}) exceeds recommended maximum of ${VALIDATION_CONSTANTS.PLAYER_COUNT.RECOMMENDED_MAX}. Consider server performance impact.`,
        field: 'game.maxPlayers',
        value: maxPlayers,
        recommendedValue: VALIDATION_CONSTANTS.PLAYER_COUNT.RECOMMENDED_MAX
      });
    }
  }

  /**
   * Validate performance-related settings
   */
  private validatePerformanceSettings(gameProperties: GameProperties, operating: OperatingConfig, warnings: ParserWarning[]): void {
    // Grass distance performance warning
    if (gameProperties.serverMinGrassDistance > VALIDATION_CONSTANTS.GRASS_DISTANCE.HIGH_PERFORMANCE_IMPACT) {
      warnings.push({
        type: ParserWarningType.GRASS_DISTANCE_HIGH_PERFORMANCE_IMPACT,
        message: `Grass distance (${gameProperties.serverMinGrassDistance}) may significantly impact server performance.`,
        field: 'game.gameProperties.serverMinGrassDistance',
        value: gameProperties.serverMinGrassDistance,
        recommendedValue: VALIDATION_CONSTANTS.GRASS_DISTANCE.HIGH_PERFORMANCE_IMPACT
      });
    }

    // AI limit performance warning (only warn if aiLimit is positive and above threshold)
    if (operating.aiLimit > 0 && operating.aiLimit > VALIDATION_CONSTANTS.AI_LIMIT.HIGH_PERFORMANCE_IMPACT) {
      warnings.push({
        type: ParserWarningType.AI_LIMIT_HIGH_PERFORMANCE_IMPACT,
        message: `AI limit (${operating.aiLimit}) may significantly impact server performance.`,
        field: 'operating.aiLimit',
        value: operating.aiLimit,
        recommendedValue: VALIDATION_CONSTANTS.AI_LIMIT.HIGH_PERFORMANCE_IMPACT
      });
    }
  }

  /**
   * Validate security-related settings
   */
  private validateSecuritySettings(gameConfig: GameConfig, rconConfig: RconConfig, warnings: ParserWarning[]): void {
    // Empty admin password warning
    if (!gameConfig.passwordAdmin || gameConfig.passwordAdmin.trim() === '') {
      warnings.push({
        type: ParserWarningType.EMPTY_ADMIN_PASSWORD,
        message: 'Admin password is empty, you should probably reconsider this.',
        field: 'game.passwordAdmin',
        value: gameConfig.passwordAdmin
      });
    }

    // Weak RCON password warning (only if RCON is being used)
    if (rconConfig.password && rconConfig.password.length > 0 && 
        rconConfig.password.length < VALIDATION_CONSTANTS.PASSWORD.MINIMUM_LENGTH) {
      warnings.push({
        type: ParserWarningType.WEAK_RCON_PASSWORD,
        message: `RCON password is too short (${rconConfig.password.length} characters). Recommended minimum: ${VALIDATION_CONSTANTS.PASSWORD.MINIMUM_LENGTH} characters.`,
        field: 'rcon.password',
        value: rconConfig.password.length,
        recommendedValue: VALIDATION_CONSTANTS.PASSWORD.MINIMUM_LENGTH
      });
    }
  }

  /**
   * Validate mod configurations
   */
  private validateMods(mods: Mod[], warnings: ParserWarning[]): void {
    const seenModIds = new Set<string>();

    mods.forEach((mod, index) => {
      // Invalid mod ID warning
      if (!isValidModId(mod.modId)) {
        warnings.push({
          type: ParserWarningType.INVALID_MOD_ID,
          message: `Invalid mod ID format: ${mod.modId}. Expected 16-character hexadecimal string. Mod: ${getEffectiveModName(mod)}`,
          field: `game.mods[${index}].modId`,
          value: mod.modId
        });
      }

      // Duplicate mod ID warning
      if (seenModIds.has(mod.modId)) {
        warnings.push({
          type: ParserWarningType.DUPLICATE_MOD_ID,
          message: `Duplicate mod ID: ${mod.modId}. Mod: ${getEffectiveModName(mod)}`,
          field: `game.mods[${index}].modId`,
          value: mod.modId
        });
      } else {
        seenModIds.add(mod.modId);
      }
    });
  }

  /**
   * Validate network-related settings
   */
  private validateNetworkSettings(config: ServerConfig, warnings: ParserWarning[]): void {
    // Only warn about public address mismatch if bind address is a specific IP (not 0.0.0.0)
    // and the addresses are completely different (not just different interfaces)
    if (config.publicAddress && config.bindAddress && 
        config.bindAddress !== "0.0.0.0" && 
        config.publicAddress !== config.bindAddress &&
        !config.publicAddress.includes('local')) {
      warnings.push({
        type: ParserWarningType.PUBLIC_ADDRESS_MISMATCH,
        message: `Public address (${config.publicAddress}) differs from bind address (${config.bindAddress}). Verify this is correct for your network setup.`,
        field: 'publicAddress',
        value: config.publicAddress,
        recommendedValue: config.bindAddress
      });
    }

    // Port conflict warnings
    const ports = [config.bindPort, config.a2s.port, config.rcon.port];
    const uniquePorts = new Set(ports);
    if (uniquePorts.size !== ports.length) {
      warnings.push({
        type: ParserWarningType.PORT_CONFLICT,
        message: `Port conflict detected. Bind port: ${config.bindPort}, A2S port: ${config.a2s.port}, RCON port: ${config.rcon.port}`,
        field: 'ports'
      });
    }
  }
}

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
        const validationResult = this.validator.validateServerConfig(config);
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
 * Legacy parser options interface for backwards compatibility
 */
export interface ParserOptions {
  strict?: boolean;           // Strict validation (fail on unknown properties)
  allowDefaults?: boolean;    // Fill in missing properties with defaults
  validateRanges?: boolean;   // Validate numeric ranges (ports, player counts, etc.)
}

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
