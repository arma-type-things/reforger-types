import { promises as fs } from 'fs';
import path from 'path';
import { ServerConfigBuilder } from 'reforger-types';
import { ServerConfigOptions, ConfigCreationResult } from '../types';
import { validateServerOptions, generateFileName } from '../utils/validation';

/**
 * Service for creating and saving server configurations
 */
export class ServerConfigService {
  constructor(private outputDir: string) {}

  /**
   * Create a server configuration from options and save to file
   */
  async createServerConfig(options: ServerConfigOptions): Promise<ConfigCreationResult> {
    try {
      // Validate options
      const errors = validateServerOptions(options);
      if (errors.length > 0) {
        return {
          success: false,
          error: `Validation errors: ${errors.join(', ')}`
        };
      }

      // Create configuration using builder
      const builder = new ServerConfigBuilder();
      
      // Set scenario (required)
      builder.setScenarioId(options.scenario);
      
      // Set optional server settings
      if (options.name) builder.setServerName(options.name);
      if (options.maxPlayers) builder.setMaxPlayers(options.maxPlayers);
      if (options.bindPort) builder.setBindPort(options.bindPort);
      if (options.bindAddress) builder.setBindAddress(options.bindAddress);
      
      // Set optional game settings
      if (options.password) builder.setGamePassword(options.password);
      if (options.adminPassword) builder.setAdminPassword(options.adminPassword);
      if (options.crossPlatform !== undefined) builder.setCrossPlatform(options.crossPlatform);
      
      // Build the configuration
      const config = builder.build();
      
      // Apply additional game properties that aren't in the builder
      if (options.visible !== undefined) {
        config.game.visible = options.visible;
      }
      
      if (options.battleye !== undefined) {
        config.game.gameProperties.battlEye = options.battleye;
      }
      
      if (options.fastValidation !== undefined) {
        config.game.gameProperties.fastValidation = options.fastValidation;
      }
      
      if (options.disableThirdPerson !== undefined) {
        config.game.gameProperties.disableThirdPerson = options.disableThirdPerson;
      }
      
      if (options.vonDisableUI !== undefined) {
        config.game.gameProperties.VONDisableUI = options.vonDisableUI;
      }
      
      if (options.vonDisableDirectSpeechUI !== undefined) {
        config.game.gameProperties.VONDisableDirectSpeechUI = options.vonDisableDirectSpeechUI;
      }
      
      if (options.vonCanTransmitCrossFaction !== undefined) {
        config.game.gameProperties.VONCanTransmitCrossFaction = options.vonCanTransmitCrossFaction;
      }
      
      if (options.serverMaxViewDistance !== undefined) {
        config.game.gameProperties.serverMaxViewDistance = options.serverMaxViewDistance;
      }
      
      if (options.networkViewDistance !== undefined) {
        config.game.gameProperties.networkViewDistance = options.networkViewDistance;
      }
      
      if (options.serverMinGrassDistance !== undefined) {
        config.game.gameProperties.serverMinGrassDistance = options.serverMinGrassDistance;
      }

      // Generate filename and save
      const serverName = options.name || 'Discord Server';
      const fileName = generateFileName(serverName);
      const filePath = await this.saveConfig(config, fileName);

      return {
        success: true,
        filePath,
        fileName
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Save configuration to file
   */
  private async saveConfig(config: any, fileName: string): Promise<string> {
    // Ensure output directory exists
    await fs.mkdir(this.outputDir, { recursive: true });
    
    const filePath = path.join(this.outputDir, fileName);
    const configJson = JSON.stringify(config, null, 2);
    
    await fs.writeFile(filePath, configJson, 'utf8');
    
    return filePath;
  }
}
