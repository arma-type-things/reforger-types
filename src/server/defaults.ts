// Default initializer functions for server configuration
import {
  A2SConfig,
  RconConfig,
  MissionHeader,
  GameProperties,
  GameConfig,
  OperatingConfig,
  ServerConfig,
  SupportedPlatform
} from './types.js';

/**
 * Creates default mission header with placeholder values
 * @returns MissionHeader object with default values
 */
export function createDefaultMissionHeader(): MissionHeader {
  return {
    m_sName: "Default Mission",
    m_sAuthor: "Default Author",
    m_sSaveFileName: "defaultSave"
  };
}

/**
 * Creates A2S (Steam Query) configuration
 * @param basePort - Base port number (A2S will use basePort + 1)
 * @returns A2S configuration object
 */
export function createDefaultA2SConfig(basePort: number): A2SConfig {
  return {
    address: "0.0.0.0",
    port: basePort + 1
  };
}

/**
 * Creates RCON (Remote Console) configuration
 * @param basePort - Base port number (RCON will use basePort + 2)
 * @param password - RCON password (minimum 3 characters if provided, empty disables RCON)
 * @returns RCON configuration object
 */
export function createDefaultRconConfig(basePort: number, password: string = ""): RconConfig {
  return {
    address: "127.0.0.1",
    port: basePort + 2,
    password: password,
    permission: "admin",
    blacklist: [],
    whitelist: [],
    maxClients: 16  // Wiki default: 16
  };
}

/**
 * Creates default game properties with recommended performance settings
 * @returns GameProperties object with battle-tested default values
 */
export function createDefaultGameProperties(): GameProperties {
  return {
    serverMaxViewDistance: 1600,  // Wiki default: 1600
    serverMinGrassDistance: 0,    // Wiki default: 0
    networkViewDistance: 1500,    // Wiki default: 1500
    disableThirdPerson: false,
    fastValidation: true,         // Wiki default: true (since 0.9.6)
    battlEye: true,              // Wiki default: true (since 0.9.8.73)
    VONDisableUI: false,
    VONDisableDirectSpeechUI: false,
    VONCanTransmitCrossFaction: false, // Wiki default: false (v1.0.0+)
    missionHeader: createDefaultMissionHeader()
  };
}

/**
 * Creates game configuration section with server identity and scenario settings
 * @param name - Server display name
 * @param scenarioId - Scenario configuration path
 * @param crossPlatform - Enable cross-platform play (affects supportedPlatforms)
 * @returns GameConfig object with the specified settings
 */
export function createDefaultGameConfig(
  name: string,
  scenarioId: string,
  crossPlatform: boolean = false
): GameConfig {
  const supportedPlatforms = crossPlatform 
    ? [SupportedPlatform.PC, SupportedPlatform.XBOX, SupportedPlatform.PLAYSTATION]
    : [SupportedPlatform.PC];

  return {
    name: name,
    password: "",
    passwordAdmin: "",
    admins: [],
    scenarioId: scenarioId,
    maxPlayers: 64,              // Wiki default: 64
    visible: true,               // Wiki default: true (since 0.9.8.73)
    crossPlatform: crossPlatform,
    supportedPlatforms: supportedPlatforms,
    gameProperties: createDefaultGameProperties(),
    mods: [],
    modsRequiredByDefault: true  // v1.2.1+: boolean, Default: true
  };
}

/**
 * Creates operating configuration with server performance and behavior settings
 * @returns OperatingConfig object with default operational parameters
 */
export function createDefaultOperatingConfig(): OperatingConfig {
  return {
    lobbyPlayerSynchronise: true,
    playerSaveTime: 120,
    aiLimit: -1,
    slotReservationTimeout: 60,
    disableCrashReporter: false,      // v0.9.8+: boolean, Default: false
    disableServerShutdown: false,     // v0.9.8+: boolean, Default: false
    disableAI: false                  // v1.1.0+: boolean, Default: false
    // disableNavmeshStreaming: undefined by default (v1.2.0+ spec: not provided = no navmesh streaming disabled)
  };
}

/**
 * Creates a complete server configuration with sensible defaults for new servers
 * 
 * Provides a good basic configuration for brand new servers with the popular Everon Conflict
 * game mode as default. Automatically handles port allocation (base + 1 for A2S, base + 2 for RCON).
 * 
 * For more control and step-by-step configuration, consider using ServerConfigBuilder instead.
 * 
 * @param serverName - Display name for the server
 * @param scenarioId - Scenario configuration path (use OfficialScenarios constants)
 * @param bindAddress - IP address to bind to (default: "0.0.0.0" for all interfaces)
 * @param bindPort - Main server port (default: 2001)
 * @param crossPlatform - Enable cross-platform play (default: false, PC only)
 * @param rconPassword - RCON password (optional, leave empty to disable RCON)
 * @returns Complete ServerConfig object ready for JSON serialization
 * 
 * @example
 * ```typescript
 * import { createDefaultServerConfig, OfficialScenarios } from 'reforger-types';
 * 
 * const config = createDefaultServerConfig(
 *   "My Server",
 *   OfficialScenarios.CONFLICT_EVERON,
 *   "0.0.0.0",
 *   2001,
 *   true,
 *   "admin123"
 * );
 * ```
 */
export function createDefaultServerConfig(
  serverName: string,
  scenarioId: string,
  bindAddress: string = "0.0.0.0",
  bindPort: number = 2001,
  crossPlatform: boolean = false,
  rconPassword: string = ""
): ServerConfig {
  return {
    bindAddress: bindAddress,
    bindPort: bindPort,
    publicAddress: bindAddress,
    publicPort: bindPort,
    a2s: createDefaultA2SConfig(bindPort),
    rcon: createDefaultRconConfig(bindPort, rconPassword),
    game: createDefaultGameConfig(serverName, scenarioId, crossPlatform),
    operating: createDefaultOperatingConfig()
  };
}
