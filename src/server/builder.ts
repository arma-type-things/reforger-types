// Builder pattern interfaces for server configuration generation
import { ServerConfig, GameConfig, GameProperties, OperatingConfig, A2SConfig, RconConfig, SupportedPlatform, Mod } from './types.js';
import {
  createDefaultMissionHeader,
  createDefaultA2SConfig,
  createDefaultRconConfig,
  createDefaultGameProperties,
  createDefaultGameConfig,
  createDefaultOperatingConfig
} from './defaults.js';
import { createModListFromUrls, isValidModId, getEffectiveModName } from './extensions.js';

/**
 * Builder pattern interface for server configuration generation
 * 
 * Provides a fluent API for step-by-step server configuration creation with validation
 * and flexible customization. Recommended approach for building server configurations,
 * especially when dealing with user input or complex configuration scenarios.
 */
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
  
  // Mod configuration
  setMods(mods: Mod[]): this;
  addMod(mod: Mod): this;
  addMods(mods: Mod[]): this;
  addModsFromUrls(urls: string[]): this;
  clearMods(): this;
  
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

/**
 * Recommended builder for creating Arma Reforger server configurations
 * 
 * Provides a fluent, chainable API for step-by-step server configuration creation.
 * Automatically handles validation, port allocation, and provides sensible defaults.
 * Ideal for applications that need to build configurations from user input or
 * require granular control over the configuration process.
 * 
 * @example
 * ```typescript
 * import { ServerConfigBuilder, OfficialScenarios } from 'reforger-types';
 * 
 * const config = new ServerConfigBuilder('My Server', OfficialScenarios.CONFLICT_EVERON)
 *   .setMaxPlayers(64)
 *   .setBindPort(2001)
 *   .setCrossPlatform(true)
 *   .setRconPassword('admin123')
 *   .addModsFromUrls(['https://reforger.armaplatform.com/workshop/...'])
 *   .build();
 * ```
 */
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
  private _mods: Mod[] = [];
  private _rconPassword: string = "";
  private _rconAddress?: string;
  private _playerSaveTime: number = 120;
  private _aiLimit: number = -1;

  /**
   * Creates a new ServerConfigBuilder instance
   * @param serverName - Initial server display name (optional)
   * @param scenarioId - Initial scenario configuration path (optional)
   */
  constructor(serverName?: string, scenarioId?: string) {
    if (serverName) this._serverName = serverName;
    if (scenarioId) this._scenarioId = scenarioId;
  }

  // Core server settings
  setBindAddress(address: string): this {
    this._bindAddress = address;
    return this;
  }

  /**
   * Sets the main server port (A2S will use port + 1, RCON will use port + 2)
   * @param port - Port number (1024-65535)
   * @returns This builder instance for chaining
   */
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

  /**
   * Enables or disables cross-platform play (PC, Xbox, PlayStation)
   * @param enabled - True for cross-platform, false for PC only
   * @returns This builder instance for chaining
   */
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

  // Mod configuration
  setMods(mods: Mod[]): this {
    // Validate mod IDs before setting
    const validMods = mods.filter(mod => {
      if (!isValidModId(mod.modId)) {
        console.warn(`Invalid mod ID: ${mod.modId}. Skipping mod: ${getEffectiveModName(mod)}`);
        return false;
      }
      return true;
    });
    this._mods = validMods;
    return this;
  }

  addMod(mod: Mod): this {
    if (!isValidModId(mod.modId)) {
      console.warn(`Invalid mod ID: ${mod.modId}. Skipping mod: ${getEffectiveModName(mod)}`);
      return this;
    }
    // Check if mod already exists (by modId)
    const existingIndex = this._mods.findIndex(m => m.modId === mod.modId);
    if (existingIndex >= 0) {
      // Replace existing mod
      this._mods[existingIndex] = mod;
    } else {
      // Add new mod
      this._mods.push(mod);
    }
    return this;
  }

  addMods(mods: Mod[]): this {
    mods.forEach(mod => this.addMod(mod));
    return this;
  }

  addModsFromUrls(urls: string[]): this {
    const modsFromUrls = createModListFromUrls(urls);
    this.addMods(modsFromUrls);
    return this;
  }

  clearMods(): this {
    this._mods = [];
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
    config.mods = [...this._mods]; // Copy the mods array
    return config;
  }

  buildOperatingConfig(): OperatingConfig {
    const config = createDefaultOperatingConfig();
    config.playerSaveTime = this._playerSaveTime;
    config.aiLimit = this._aiLimit;
    return config;
  }

  /**
   * Builds the complete server configuration from all set options
   * @returns Complete ServerConfig object ready for JSON serialization
   */
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
    this._mods = [];
    this._rconPassword = "";
    this._rconAddress = undefined;
    this._playerSaveTime = 120;
    this._aiLimit = -1;
    return this;
  }
}