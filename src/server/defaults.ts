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

export function createDefaultMissionHeader(): MissionHeader {
  return {
    m_sName: "Default Mission",
    m_sAuthor: "Default Author",
    m_sSaveFileName: "defaultSave"
  };
}

export function createDefaultA2SConfig(basePort: number): A2SConfig {
  return {
    address: "0.0.0.0",
    port: basePort + 1
  };
}

export function createDefaultRconConfig(basePort: number, password: string = ""): RconConfig {
  return {
    address: "127.0.0.1",
    port: basePort + 2,
    password: password,
    permission: "admin",
    blacklist: [],
    whitelist: []
  };
}

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
    mods: []
  };
}

export function createDefaultOperatingConfig(): OperatingConfig {
  return {
    lobbyPlayerSynchronise: true,
    playerSaveTime: 120,
    aiLimit: -1,
    slotReservationTimeout: 60
  };
}

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
