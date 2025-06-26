import {
  SlashCommandBuilder,
  CommandInteraction,
  ChatInputCommandInteraction
} from 'discord.js';
import { ServerConfigService } from '../services/ServerConfigService';
import { ServerConfigOptions, Command } from '../types';

/**
 * Discord slash command for creating server configurations
 */
export class CreateServerCommand implements Command {
  public readonly data: SlashCommandBuilder;

  constructor(private configService: ServerConfigService) {
    this.data = new SlashCommandBuilder()
      .setName('create-server')
      .setDescription('Create a new Arma Reforger server configuration')
      
      // Required options
      .addStringOption(option =>
        option.setName('scenario')
          .setDescription('Scenario ID (e.g., {ECC61978EDCC2B5A}Missions/23_Campaign.conf)')
          .setRequired(true)
      )
      
      // Core server settings
      .addStringOption(option =>
        option.setName('name')
          .setDescription('Server name')
          .setRequired(false)
      )
      .addIntegerOption(option =>
        option.setName('max-players')
          .setDescription('Maximum number of players (1-128)')
          .setMinValue(1)
          .setMaxValue(128)
          .setRequired(false)
      )
      .addIntegerOption(option =>
        option.setName('bind-port')
          .setDescription('Server bind port (1024-65535)')
          .setMinValue(1024)
          .setMaxValue(65535)
          .setRequired(false)
      )
      .addStringOption(option =>
        option.setName('bind-address')
          .setDescription('Server bind address (default: 0.0.0.0)')
          .setRequired(false)
      )
      
      // Game settings
      .addStringOption(option =>
        option.setName('password')
          .setDescription('Server password')
          .setRequired(false)
      )
      .addStringOption(option =>
        option.setName('admin-password')
          .setDescription('Admin password')
          .setRequired(false)
      )
      .addBooleanOption(option =>
        option.setName('cross-platform')
          .setDescription('Enable cross-platform play')
          .setRequired(false)
      )
      .addBooleanOption(option =>
        option.setName('visible')
          .setDescription('Show server in browser')
          .setRequired(false)
      )
      
      // Game properties
      .addBooleanOption(option =>
        option.setName('battleye')
          .setDescription('Enable BattlEye anti-cheat')
          .setRequired(false)
      )
      .addBooleanOption(option =>
        option.setName('fast-validation')
          .setDescription('Enable fast validation')
          .setRequired(false)
      )
      .addBooleanOption(option =>
        option.setName('disable-third-person')
          .setDescription('Force first-person only')
          .setRequired(false)
      )
      .addBooleanOption(option =>
        option.setName('von-disable-ui')
          .setDescription('Disable VON UI')
          .setRequired(false)
      )
      .addBooleanOption(option =>
        option.setName('von-disable-direct-speech')
          .setDescription('Disable direct speech UI')
          .setRequired(false)
      )
      .addBooleanOption(option =>
        option.setName('von-cross-faction')
          .setDescription('Allow cross-faction VON transmission')
          .setRequired(false)
      )
      .addIntegerOption(option =>
        option.setName('server-max-view-distance')
          .setDescription('Server max view distance (500-10000)')
          .setMinValue(500)
          .setMaxValue(10000)
          .setRequired(false)
      )
      .addIntegerOption(option =>
        option.setName('network-view-distance')
          .setDescription('Network view distance (500-5000)')
          .setMinValue(500)
          .setMaxValue(5000)
          .setRequired(false)
      )
      .addIntegerOption(option =>
        option.setName('server-min-grass-distance')
          .setDescription('Server min grass distance (0 or 50-150)')
          .setMinValue(0)
          .setMaxValue(150)
          .setRequired(false)
      ) as SlashCommandBuilder;
  }

  /**
   * Execute the command
   */
  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.deferReply();

    try {
      // Extract options from the interaction
      const options: ServerConfigOptions = {
        scenario: interaction.options.getString('scenario', true),
        name: interaction.options.getString('name') || undefined,
        maxPlayers: interaction.options.getInteger('max-players') || undefined,
        bindPort: interaction.options.getInteger('bind-port') || undefined,
        bindAddress: interaction.options.getString('bind-address') || undefined,
        password: interaction.options.getString('password') || undefined,
        adminPassword: interaction.options.getString('admin-password') || undefined,
        crossPlatform: interaction.options.getBoolean('cross-platform') ?? undefined,
        visible: interaction.options.getBoolean('visible') ?? undefined,
        battleye: interaction.options.getBoolean('battleye') ?? undefined,
        fastValidation: interaction.options.getBoolean('fast-validation') ?? undefined,
        disableThirdPerson: interaction.options.getBoolean('disable-third-person') ?? undefined,
        vonDisableUI: interaction.options.getBoolean('von-disable-ui') ?? undefined,
        vonDisableDirectSpeechUI: interaction.options.getBoolean('von-disable-direct-speech') ?? undefined,
        vonCanTransmitCrossFaction: interaction.options.getBoolean('von-cross-faction') ?? undefined,
        serverMaxViewDistance: interaction.options.getInteger('server-max-view-distance') || undefined,
        networkViewDistance: interaction.options.getInteger('network-view-distance') || undefined,
        serverMinGrassDistance: interaction.options.getInteger('server-min-grass-distance') || undefined,
      };

      // Create the server configuration
      const result = await this.configService.createServerConfig(options);

      if (result.success) {
        const serverName = options.name || 'Discord Server';
        await interaction.editReply({
          content: `✅ **Server configuration created successfully!**\n\n` +
                  `**Server Name:** ${serverName}\n` +
                  `**Scenario:** ${options.scenario}\n` +
                  `**File:** \`${result.fileName}\`\n` +
                  `**Path:** \`${result.filePath}\`\n\n` +
                  `The configuration is ready to use with your Arma Reforger server!`
        });
      } else {
        await interaction.editReply({
          content: `❌ **Failed to create server configuration**\n\n` +
                  `**Error:** ${result.error}`
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      await interaction.editReply({
        content: `❌ **An unexpected error occurred**\n\n` +
                `**Error:** ${errorMessage}`
      });
    }
  }
}
