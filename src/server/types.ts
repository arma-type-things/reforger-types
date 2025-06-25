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
}

export type MissionHeaderValue = string | number | boolean;
export interface MissionHeader {
  [key: string]: MissionHeaderValue;
}

export interface Mod {
  modId: string;
  name: string;
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

export interface OperatingConfig {
  lobbyPlayerSynchronise: boolean;
  playerSaveTime: number;
  aiLimit: number;
  slotReservationTimeout: number;
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
