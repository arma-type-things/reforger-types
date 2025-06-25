#!/usr/bin/env node

import * as readline from 'readline';
import * as fs from 'fs';
import * as path from 'path';
import { 
  createDefaultServerConfig,
  createDefaultMissionHeader,
  OfficialScenarios,
  type ServerConfig,
  type MissionHeader,
  type OfficialScenarioName
} from '../../../dist/index.js';

// Interface for readline interaction
interface PromptInterface {
  question(query: string): Promise<string>;
  close(): void;
}

// Configuration holder interface
interface WizardConfig {
  serverName?: string;
  bindAddress?: string;
  publicAddress?: string;
  bindPort?: number;
  scenarioId?: string;
}

class RedsmithWizard {
  private rl: PromptInterface;
  private config: WizardConfig = {};
  private missionHeader: MissionHeader = createDefaultMissionHeader();

  constructor() {
    const readline_interface = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    this.rl = {
      question: (query: string): Promise<string> => {
        return new Promise((resolve) => {
          readline_interface.question(query, (answer: string) => {
            resolve(answer.trim());
          });
        });
      },
      close: () => {
        readline_interface.close();
      }
    };
  }

  private displayHeader(): void {
    console.log('╔═══════════════════════════════════════════════════════════════════════════════════╗');
    console.log('║                                     Redsmith                                      ║');
    console.log('║                          Interactive Reforger Config Forge                       ║');
    console.log('║                                                                                   ║');
    console.log('║  Forge the perfect server configuration for your Arma Reforger server.          ║');
    console.log('║  Press Ctrl+C at any time to exit.                                              ║');
    console.log('╚═══════════════════════════════════════════════════════════════════════════════════╝');
    console.log();
  }

  private async promptChoice(question: string, options: string[], defaultIndex: number = 0): Promise<number> {
    console.log(question);
    options.forEach((option, index) => {
      const marker = index === defaultIndex ? '→' : ' ';
      console.log(`${marker} ${index + 1}. ${option}`);
    });
    
    const answer = await this.rl.question(`\nSelect option (1-${options.length}) [${defaultIndex + 1}]: `);
    
    if (answer === '') {
      return defaultIndex;
    }
    
    const choice = parseInt(answer) - 1;
    if (isNaN(choice) || choice < 0 || choice >= options.length) {
      console.log('Invalid selection. Please try again.\n');
      return this.promptChoice(question, options, defaultIndex);
    }
    
    return choice;
  }

  private async promptString(question: string, defaultValue: string = ''): Promise<string> {
    const prompt = defaultValue ? `${question} [${defaultValue}]: ` : `${question}: `;
    const answer = await this.rl.question(prompt);
    return answer === '' ? defaultValue : answer;
  }

  private async promptNumber(question: string, defaultValue: number, min?: number, max?: number): Promise<number> {
    const answer = await this.rl.question(`${question} [${defaultValue}]: `);
    
    if (answer === '') {
      return defaultValue;
    }
    
    const value = parseInt(answer);
    if (isNaN(value)) {
      console.log('Invalid number. Please try again.\n');
      return this.promptNumber(question, defaultValue, min, max);
    }
    
    if (min !== undefined && value < min) {
      console.log(`Value must be at least ${min}. Please try again.\n`);
      return this.promptNumber(question, defaultValue, min, max);
    }
    
    if (max !== undefined && value > max) {
      console.log(`Value must be at most ${max}. Please try again.\n`);
      return this.promptNumber(question, defaultValue, min, max);
    }
    
    return value;
  }

  private async configureBasicSettings(): Promise<void> {
    console.log('📋 Basic Server Settings');
    console.log('═════════════════════════\n');

    const serverName = await this.promptString('Server name', 'My Reforger Server');
    const bindAddress = await this.promptString('Bind address (IP to bind to)', '0.0.0.0');
    const publicAddress = await this.promptString('Public address (IP for players to connect)', '0.0.0.0');
    const bindPort = await this.promptNumber('Bind port (main server port)', 2001, 1024, 65535);

    this.config.serverName = serverName;
    this.config.bindAddress = bindAddress;
    this.config.publicAddress = publicAddress;
    this.config.bindPort = bindPort;

    console.log();
  }

  private async configureScenario(): Promise<void> {
    console.log('🎮 Scenario Selection');
    console.log('═════════════════════\n');

    const scenarioNames: OfficialScenarioName[] = [
      'CONFLICT_EVERON',
      'CONFLICT_NORTHERN_EVERON', 
      'CONFLICT_SOUTHERN_EVERON',
      'CONFLICT_WESTERN_EVERON',
      'CONFLICT_MONTIGNAC',
      'CONFLICT_ARLAND',
      'COMBAT_OPS_ARLAND',
      'COMBAT_OPS_EVERON',
      'GAME_MASTER_EVERON',
      'GAME_MASTER_ARLAND'
    ];

    const scenarioOptions = scenarioNames.map(name => {
      const displayName = name.replace(/_/g, ' ').toLowerCase()
        .replace(/\b\w/g, l => l.toUpperCase());
      return displayName;
    });

    const selectedIndex = await this.promptChoice(
      'Select a scenario:',
      scenarioOptions,
      0
    );

    this.config.scenarioId = OfficialScenarios[scenarioNames[selectedIndex]].toString();
    console.log();
  }

  private async configureMissionHeader(): Promise<void> {
    console.log('🏷️  Mission Header Settings');
    console.log('═══════════════════════════\n');

    const missionName = await this.promptString('Mission name', 'Default Mission');
    const missionAuthor = await this.promptString('Mission author', 'Default Author');
    const saveFileName = await this.promptString('Save file name', 'defaultSave');

    this.missionHeader = {
      m_sName: missionName,
      m_sAuthor: missionAuthor,
      m_sSaveFileName: saveFileName
    };

    console.log();
  }

  private async configureOutputPath(): Promise<string> {
    console.log('💾 Output Configuration');
    console.log('═══════════════════════\n');

    const outputPath = await this.promptString('Output file path', './server.json');
    console.log();

    return outputPath;
  }

  private async generateConfig(): Promise<ServerConfig> {
    if (!this.config.serverName || !this.config.bindAddress || !this.config.publicAddress || !this.config.bindPort || !this.config.scenarioId) {
      throw new Error('Missing required configuration values');
    }

    const serverConfig = createDefaultServerConfig(
      this.config.serverName,
      this.config.scenarioId,
      this.config.bindAddress,
      this.config.bindPort,
      false, // crossPlatform - keeping simple for now
      '' // rconPassword - keeping empty for now
    );

    // Set the public address
    serverConfig.publicAddress = this.config.publicAddress;
    serverConfig.publicPort = this.config.bindPort;

    // Update mission header
    serverConfig.game.gameProperties.missionHeader = this.missionHeader;

    return serverConfig;
  }

  private async saveConfig(config: ServerConfig, outputPath: string): Promise<void> {
    const configJson = JSON.stringify(config, null, 2);
    
    try {
      // Ensure directory exists
      const dir = path.dirname(outputPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      fs.writeFileSync(outputPath, configJson, 'utf-8');
      console.log(`✅ Configuration saved to: ${path.resolve(outputPath)}`);
    } catch (error) {
      console.error(`❌ Failed to save configuration: ${error}`);
      throw error;
    }
  }

  private displaySummary(config: ServerConfig, outputPath: string): void {
    console.log('\n📝 Configuration Summary');
    console.log('═════════════════════════\n');
    console.log(`Server Name: ${config.game.name}`);
    console.log(`Bind Address: ${config.bindAddress}`);
    console.log(`Public Address: ${config.publicAddress}`);
    console.log(`Bind Port: ${config.bindPort}`);
    console.log(`Public Port: ${config.publicPort}`);
    console.log(`A2S Port: ${config.a2s.port}`);
    console.log(`RCON Port: ${config.rcon.port}`);
    console.log(`Mission Name: ${config.game.gameProperties.missionHeader.m_sName}`);
    console.log(`Mission Author: ${config.game.gameProperties.missionHeader.m_sAuthor}`);
    console.log(`Save File: ${config.game.gameProperties.missionHeader.m_sSaveFileName}`);
    console.log(`Output Path: ${path.resolve(outputPath)}`);
    console.log();
  }

  async run(): Promise<void> {
    try {
      this.displayHeader();

      await this.configureBasicSettings();
      await this.configureScenario();
      await this.configureMissionHeader();
      const outputPath = await this.configureOutputPath();

      const config = await this.generateConfig();
      
      this.displaySummary(config, outputPath);
      
      const confirm = await this.promptString('Forge this configuration? (y/N)', 'N');
      if (confirm.toLowerCase() === 'y' || confirm.toLowerCase() === 'yes') {
        await this.saveConfig(config, outputPath);
        console.log('\n🎉 Server configuration forged successfully by Redsmith!');
      } else {
        console.log('\n❌ Configuration not forged.');
      }

    } catch (error) {
      console.error(`\n❌ Error: ${error}`);
      process.exit(1);
    } finally {
      this.rl.close();
    }
  }
}

// Run the wizard
const wizard = new RedsmithWizard();
wizard.run();
