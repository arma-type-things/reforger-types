// Core server configuration types

export interface A2SConfig {
  address: string;
  port: number;
}

export interface RconConfig {
  address: string;
  port: number;
  password: string;
  permission: string;
  blacklist: string[];
  whitelist: string[];
  maxClients?: number;  // v1.1.0+: number (1-16), Default: 16
}

export type MissionHeaderValue = string | number | boolean;
export interface MissionHeader {
  [key: string]: MissionHeaderValue;
}

export interface Mod {
  modId: string;
  name?: string;
  version?: string;
  required?: boolean;
}

export enum SupportedPlatform {
  PC = "PLATFORM_PC",
  XBOX = "PLATFORM_XBL",
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
