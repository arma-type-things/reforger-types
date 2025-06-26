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

/**
 * Parse result interface
 */
export interface ParseResult<T> {
  success: boolean;
  data?: T;
  errors: string[];
  warnings: ParserWarning[];
  validationErrors: ParserError[];
}

/**
 * Validation result from the Validator
 */
export interface ValidationResult {
  errors: ParserError[];
  warnings: ParserWarning[];
}
