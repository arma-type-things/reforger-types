// Core server configuration types

/**
 * Configuration for A2S (Steam Query) protocol
 * 
 * A2S allows players to query server information from the Steam server browser.
 * The A2S port is typically set to the main server port + 1 for standard configurations.
 */
export interface A2SConfig {
  /** IP address for A2S queries (usually "0.0.0.0" for all interfaces) */
  address: string;
  /** UDP port for A2S queries (typically bindPort + 1) */
  port: number;
}

/**
 * Configuration for RCON (Remote Console) access
 * 
 * RCON allows remote administration of the server through a console interface.
 * The RCON port is typically set to the main server port + 2 for standard configurations.
 */
export interface RconConfig {
  /** IP address for RCON connections (usually "127.0.0.1" for localhost only) */
  address: string;
  /** TCP port for RCON connections (typically bindPort + 2) */
  port: number;
  /** RCON password (minimum 3 characters, no spaces, empty disables RCON) */
  password: string;
  /** Permission level for RCON users ("admin" or "monitor") */
  permission: string;
  /** List of banned Steam IDs or IP addresses */
  blacklist: string[];
  /** List of allowed Steam IDs or IP addresses (empty allows all) */
  whitelist: string[];
  /** Maximum number of concurrent RCON clients (1-16, default: 16) */
  maxClients?: number;  // v1.1.0+: number (1-16), Default: 16
}

/** Valid values for mission header properties */
export type MissionHeaderValue = string | number | boolean;

/**
 * Mission header configuration for scenario customization
 * 
 * Allows setting custom properties for the mission such as name, author, and save file.
 * This is a flexible dictionary that can contain any string, number, or boolean values.
 */
export interface MissionHeader {
  [key: string]: MissionHeaderValue;
}

/**
 * Mod configuration for server mod loading
 * 
 * Defines a mod that should be loaded by the server. The modId is required and must
 * be a valid 16-character hexadecimal string. Optional properties provide metadata
 * and configuration for the mod.
 */
export interface Mod {
  /** Unique mod identifier (16-character hex string) */
  modId: string;
  /** Human-readable mod name (optional, generated from modId if not provided) */
  name?: string;
  /** Mod version string (optional) */
  version?: string;
  /** Whether clients must have this mod to join (optional, default varies by server) */
  required?: boolean;
}

/**
 * Platform identifiers for cross-platform server support
 * 
 * These values must match exactly what Arma Reforger expects in the server configuration.
 * Use these constants rather than hardcoding strings to ensure compatibility.
 */
export enum SupportedPlatform {
  /** Windows PC platform */
  PC = "PLATFORM_PC",
  /** Xbox platform */
  XBOX = "PLATFORM_XBL", 
  /** PlayStation platform */
  PLAYSTATION = "PLATFORM_PSN"
}

export interface GameProperties {
  serverMaxViewDistance: number;
  serverMinGrassDistance: number;
  networkViewDistance: number;
  disableThirdPerson: boolean;
  fastValidation: boolean;
  battlEye: boolean;
  VONDisableUI: boolean;
  VONDisableDirectSpeechUI: boolean;
  VONCanTransmitCrossFaction?: boolean;
  missionHeader: MissionHeader;
}

export interface GameConfig {
  name: string;
  password: string;
  passwordAdmin: string;
  admins: string[];
  scenarioId: string;
  maxPlayers: number;
  visible: boolean;
  crossPlatform: boolean;
  supportedPlatforms: SupportedPlatform[];
  gameProperties: GameProperties;
  mods: Mod[];
  modsRequiredByDefault?: boolean;
}

export interface JoinQueueConfig {
  maxSize: number;  // v1.2.1+: number (0-50), Default: 0 (disabled)
}

export interface OperatingConfig {
  lobbyPlayerSynchronise: boolean;
  playerSaveTime: number;
  aiLimit: number;
  slotReservationTimeout: number;
  disableCrashReporter?: boolean;      // v0.9.8+: boolean, Default: false
  disableServerShutdown?: boolean;     // v0.9.8+: boolean, Default: false
  disableAI?: boolean;                 // v1.1.0+: boolean, Default: false
  disableNavmeshStreaming?: boolean | string[];  // v1.0.0: boolean, v1.2.0+: array, Default: undefined
  joinQueue?: JoinQueueConfig;         // v1.2.1+: configuration for player join queue
}

export interface ServerConfig {
  bindAddress: string;
  bindPort: number;
  publicAddress: string;
  publicPort: number;
  a2s: A2SConfig;
  rcon: RconConfig;
  game: GameConfig;
  operating: OperatingConfig;
}
