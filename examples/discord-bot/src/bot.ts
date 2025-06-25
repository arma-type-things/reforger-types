import { Client, Collection, Events, GatewayIntentBits, REST, Routes } from 'discord.js';
import dotenv from 'dotenv';
import { loadConfig } from './utils/validation';
import { ServerConfigService } from './services/ServerConfigService';
import { CreateServerCommand } from './commands/CreateServerCommand';

// Load environment variables
dotenv.config();

// Initialize bot configuration
const config = loadConfig();

// Create Discord client
const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

// Create services
const configService = new ServerConfigService(config.configOutputDir);

// Create commands
const createServerCommand = new CreateServerCommand(configService);

// Store commands in a collection
const commands = new Collection();
commands.set(createServerCommand.data.name, createServerCommand);

// Register slash commands
async function registerCommands() {
  try {
    console.log('Started refreshing application (/) commands.');

    const rest = new REST({ version: '10' }).setToken(config.discordToken);
    
    const commandData = [createServerCommand.data.toJSON()];
    
    await rest.put(
      Routes.applicationGuildCommands(client.user!.id, config.guildId),
      { body: commandData }
    );

    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error('Error registering commands:', error);
  }
}

// Bot event handlers
client.once(Events.ClientReady, async (readyClient) => {
  console.log(`Ready! Logged in as ${readyClient.user.tag}`);
  await registerCommands();
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = commands.get(interaction.commandName);
  
  if (!command) {
    console.error(`No command matching ${interaction.commandName} was found.`);
    return;
  }

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error('Error executing command:', error);
    
    const errorMessage = {
      content: '❌ There was an error while executing this command!',
      ephemeral: true
    };
    
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(errorMessage);
    } else {
      await interaction.reply(errorMessage);
    }
  }
});

// Start the bot
client.login(config.discordToken).catch(console.error);
