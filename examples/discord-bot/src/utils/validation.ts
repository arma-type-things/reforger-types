import { BotConfig } from '../types';
import { parse } from 'reforger-types';

/**
 * Load and validate environment configuration
 */
export function loadConfig(): BotConfig {
  const discordToken = process.env.DISCORD_TOKEN;
  const guildId = process.env.GUILD_ID;
  const configOutputDir = process.env.CONFIG_OUTPUT_DIR || './server-configs';

  if (!discordToken) {
    throw new Error('DISCORD_TOKEN environment variable is required');
  }

  if (!guildId) {
    throw new Error('GUILD_ID environment variable is required');
  }

  return {
    discordToken,
    guildId,
    configOutputDir
  };
}

/**
 * Validate server configuration options using the library's validation
 */
export function validateServerOptions(options: any): string[] {
  const errors: string[] = [];

  // Required fields
  if (!options.scenario || typeof options.scenario !== 'string') {
    errors.push('Scenario ID is required and must be a string');
  }

  // Create a minimal config for validation
  const testConfig = {
    bindAddress: '0.0.0.0',
    bindPort: options.bindPort || 2001,
    publicAddress: '0.0.0.0',
    publicPort: options.bindPort || 2001,
    a2s: { address: '0.0.0.0', port: (options.bindPort || 2001) + 1 },
    rcon: { 
      address: '127.0.0.1', 
      port: (options.bindPort || 2001) + 2, 
      password: '', 
      permission: 'admin', 
      blacklist: [], 
      whitelist: [] 
    },
    game: {
      name: 'Test Server',
      password: '',
      passwordAdmin: '',
      admins: [],
      scenarioId: options.scenario || 'test',
      maxPlayers: options.maxPlayers || 64,
      visible: true,
      crossPlatform: false,
      supportedPlatforms: ['PLATFORM_PC'],
      gameProperties: {
        serverMaxViewDistance: options.serverMaxViewDistance || 1600,
        serverMinGrassDistance: options.serverMinGrassDistance || 0,
        networkViewDistance: options.networkViewDistance || 1500,
        disableThirdPerson: false,
        fastValidation: true,
        battlEye: true,
        VONDisableUI: false,
        VONDisableDirectSpeechUI: false,
        VONCanTransmitCrossFaction: false,
        missionHeader: { m_sName: 'Test', m_sAuthor: 'Test', m_sSaveFileName: 'test' }
      },
      mods: [],
      modsRequiredByDefault: true
    },
    operating: {
      lobbyPlayerSynchronise: true,
      playerSaveTime: 120,
      aiLimit: -1,
      slotReservationTimeout: 60,
      disableCrashReporter: false,
      disableServerShutdown: false,
      disableAI: false
    }
  };

  // Use the library's validation
  const result = parse(testConfig, { validate: true });
  
  if (!result.success) {
    errors.push(...result.errors);
    if (result.validationErrors) {
      errors.push(...result.validationErrors.map(e => e.message));
    }
  }

  return errors;
}

/**
 * Generate a safe filename from server name
 */
export function generateFileName(serverName: string): string {
  const safe = serverName
    .replace(/[^a-zA-Z0-9\s-_]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .toLowerCase()
    .substring(0, 50); // Limit length

  const timestamp = new Date().toISOString().substring(0, 19).replace(/[:.]/g, '-');
  return `${safe}-${timestamp}.json`;
}
