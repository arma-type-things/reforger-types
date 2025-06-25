/**
 * Configuration options for creating a server config
 */
export interface ServerConfigOptions {
  // Required
  scenario: string;
  
  // Core server settings
  name?: string;
  maxPlayers?: number;
  bindPort?: number;
  bindAddress?: string;
  
  // Game settings
  password?: string;
  adminPassword?: string;
  crossPlatform?: boolean;
  visible?: boolean;
  
  // Game properties
  battleye?: boolean;
  fastValidation?: boolean;
  disableThirdPerson?: boolean;
  vonDisableUI?: boolean;
  vonDisableDirectSpeechUI?: boolean;
  vonCanTransmitCrossFaction?: boolean;
  serverMaxViewDistance?: number;
  networkViewDistance?: number;
  serverMinGrassDistance?: number;
}

/**
 * Result of a server config creation operation
 */
export interface ConfigCreationResult {
  success: boolean;
  filePath?: string;
  fileName?: string;
  error?: string;
}

/**
 * Environment configuration
 */
export interface BotConfig {
  discordToken: string;
  guildId: string;
  configOutputDir: string;
}
