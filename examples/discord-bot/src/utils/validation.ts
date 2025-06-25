import { BotConfig } from '../types';

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
 * Validate server configuration options
 */
export function validateServerOptions(options: any): string[] {
  const errors: string[] = [];

  // Required fields
  if (!options.scenario || typeof options.scenario !== 'string') {
    errors.push('Scenario ID is required and must be a string');
  }

  // Validate numeric ranges
  if (options.maxPlayers !== undefined) {
    const maxPlayers = Number(options.maxPlayers);
    if (isNaN(maxPlayers) || maxPlayers < 1 || maxPlayers > 128) {
      errors.push('Max players must be between 1 and 128');
    }
  }

  if (options.bindPort !== undefined) {
    const bindPort = Number(options.bindPort);
    if (isNaN(bindPort) || bindPort < 1024 || bindPort > 65535) {
      errors.push('Bind port must be between 1024 and 65535');
    }
  }

  if (options.serverMaxViewDistance !== undefined) {
    const distance = Number(options.serverMaxViewDistance);
    if (isNaN(distance) || distance < 500 || distance > 10000) {
      errors.push('Server max view distance must be between 500 and 10000');
    }
  }

  if (options.networkViewDistance !== undefined) {
    const distance = Number(options.networkViewDistance);
    if (isNaN(distance) || distance < 500 || distance > 5000) {
      errors.push('Network view distance must be between 500 and 5000');
    }
  }

  if (options.serverMinGrassDistance !== undefined) {
    const distance = Number(options.serverMinGrassDistance);
    if (isNaN(distance) || (distance !== 0 && (distance < 50 || distance > 150))) {
      errors.push('Server min grass distance must be 0 or between 50 and 150');
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
