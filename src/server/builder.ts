// Builder pattern interfaces for server configuration generation
import { ServerConfig, GameConfig, GameProperties, OperatingConfig, A2SConfig, RconConfig, SupportedPlatform } from './types.js';
import {
  createDefaultMissionHeader,
  createDefaultA2SConfig,
  createDefaultRconConfig,
  createDefaultGameProperties,
  createDefaultGameConfig,
  createDefaultOperatingConfig
} from './defaults.js';

export interface IServerConfigBuilder {
  // Core server settings
  setBindAddress(address: string): this;
  setBindPort(port: number): this;
  setPublicAddress(address: string): this;
  setPublicPort(port: number): this;
  
  // Game configuration
  setServerName(name: string): this;
  setScenarioId(scenarioId: string): this;
  setMaxPlayers(maxPlayers: number): this;
  setCrossPlatform(enabled: boolean): this;
  setGamePassword(password: string): this;
  setAdminPassword(password: string): this;
  
  // RCON configuration
  setRconPassword(password: string): this;
  setRconAddress(address: string): this;
  
  // Operating configuration
  setPlayerSaveTime(seconds: number): this;
  setAiLimit(limit: number): this;
  
  // Build methods
  build(): ServerConfig;
  buildGameConfig(): GameConfig;
  buildGameProperties(): GameProperties;
  buildOperatingConfig(): OperatingConfig;
  buildA2SConfig(): A2SConfig;
  buildRconConfig(): RconConfig;
  
  // Reset builder to defaults
  reset(): this;
}

export class ServerConfigBuilder implements IServerConfigBuilder {
  private _bindAddress: string = "0.0.0.0";
  private _bindPort: number = 2001;
  private _publicAddress?: string;
  private _publicPort?: number;
  private _serverName: string = "Default Server";
  private _scenarioId: string = "";
  private _maxPlayers: number = 32;
  private _crossPlatform: boolean = false;
  private _gamePassword: string = "";
  private _adminPassword: string = "";
  private _rconPassword: string = "";
  private _rconAddress?: string;
  private _playerSaveTime: number = 120;
  private _aiLimit: number = -1;

  constructor(serverName?: string, scenarioId?: string) {
    if (serverName) this._serverName = serverName;
    if (scenarioId) this._scenarioId = scenarioId;
  }

  // Core server settings
  setBindAddress(address: string): this {
    this._bindAddress = address;
    return this;
  }

  setBindPort(port: number): this {
    this._bindPort = port;
    return this;
  }

  setPublicAddress(address: string): this {
    this._publicAddress = address;
    return this;
  }

  setPublicPort(port: number): this {
    this._publicPort = port;
    return this;
  }

  // Game configuration
  setServerName(name: string): this {
    this._serverName = name;
    return this;
  }

  setScenarioId(scenarioId: string): this {
    this._scenarioId = scenarioId;
    return this;
  }

  setMaxPlayers(maxPlayers: number): this {
    this._maxPlayers = maxPlayers;
    return this;
  }

  setCrossPlatform(enabled: boolean): this {
    this._crossPlatform = enabled;
    return this;
  }

  setGamePassword(password: string): this {
    this._gamePassword = password;
    return this;
  }

  setAdminPassword(password: string): this {
    this._adminPassword = password;
    return this;
  }

  // RCON configuration
  setRconPassword(password: string): this {
    this._rconPassword = password;
    return this;
  }

  setRconAddress(address: string): this {
    this._rconAddress = address;
    return this;
  }

  // Operating configuration
  setPlayerSaveTime(seconds: number): this {
    this._playerSaveTime = seconds;
    return this;
  }

  setAiLimit(limit: number): this {
    this._aiLimit = limit;
    return this;
  }

  // Build methods
  buildA2SConfig(): A2SConfig {
    return createDefaultA2SConfig(this._bindPort);
  }

  buildRconConfig(): RconConfig {
    const rconAddress = this._rconAddress || "127.0.0.1";
    const config = createDefaultRconConfig(this._bindPort, this._rconPassword);
    config.address = rconAddress;
    return config;
  }

  buildGameProperties(): GameProperties {
    return createDefaultGameProperties();
  }

  buildGameConfig(): GameConfig {
    const config = createDefaultGameConfig(this._serverName, this._scenarioId, this._crossPlatform);
    config.password = this._gamePassword;
    config.passwordAdmin = this._adminPassword;
    config.maxPlayers = this._maxPlayers;
    return config;
  }

  buildOperatingConfig(): OperatingConfig {
    const config = createDefaultOperatingConfig();
    config.playerSaveTime = this._playerSaveTime;
    config.aiLimit = this._aiLimit;
    return config;
  }

  build(): ServerConfig {
    const publicAddress = this._publicAddress || this._bindAddress;
    const publicPort = this._publicPort || this._bindPort;

    return {
      bindAddress: this._bindAddress,
      bindPort: this._bindPort,
      publicAddress: publicAddress,
      publicPort: publicPort,
      a2s: this.buildA2SConfig(),
      rcon: this.buildRconConfig(),
      game: this.buildGameConfig(),
      operating: this.buildOperatingConfig()
    };
  }

  reset(): this {
    this._bindAddress = "0.0.0.0";
    this._bindPort = 2001;
    this._publicAddress = undefined;
    this._publicPort = undefined;
    this._serverName = "Default Server";
    this._scenarioId = "";
    this._maxPlayers = 32;
    this._crossPlatform = false;
    this._gamePassword = "";
    this._adminPassword = "";
    this._rconPassword = "";
    this._rconAddress = undefined;
    this._playerSaveTime = 120;
    this._aiLimit = -1;
    return this;
  }
}