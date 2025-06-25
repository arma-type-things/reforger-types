import {
  ServerConfig,
  GameConfig,
  GameProperties,
  OperatingConfig,
  RconConfig,
  Mod
} from '../server/types.js';
import { isValidModId, getEffectiveModName } from '../server/extensions.js';
import { 
  ParserError, 
  ParserWarning, 
  ParserErrorType, 
  ParserWarningType, 
  ValidationResult 
} from './types.js';
import { VALIDATION_CONSTANTS } from './constants.js';

/**
 * Server configuration validator - handles business logic validation
 */
export class Validator {
  /**
   * Validate a server configuration and return errors and warnings
   */
  validate(config: ServerConfig): ValidationResult {
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
