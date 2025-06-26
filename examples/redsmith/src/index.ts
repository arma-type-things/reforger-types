#!/usr/bin/env node

import * as fs from 'fs';
import * as path from 'path';
import { Command } from 'commander';
import prompts from 'prompts';
import chalk from 'chalk';
import { 
  createDefaultServerConfig,
  createDefaultMissionHeader,
  OfficialScenarios,
  type ServerConfig,
  type MissionHeader,
  type OfficialScenarioName
} from '../../../dist/index.js';
import { LayoutManager } from './layout.js';
import { ThemeColors } from './constants.js';

// Configuration holder interface
interface RedsmithConfig {
  serverName?: string;
  bindAddress?: string;
  publicAddress?: string;
  bindPort?: number;
  scenarioId?: string;
  missionName?: string;
  missionAuthor?: string;
  saveFileName?: string;
  outputPath?: string;
}

// Interface for wizard steps
interface WizardStep {
  name: string;
  execute(config: RedsmithConfig, layout: LayoutManager): Promise<void>;
  isRequired(config: RedsmithConfig): boolean;
}

// Command line options interface
interface CliOptions {
  name?: string;
  bindAddress?: string;
  publicAddress?: string;
  port?: number;
  scenario?: string;
  output?: string;
  missionName?: string;
  missionAuthor?: string;
  saveFile?: string;
}

// Base wizard step implementation
abstract class BaseWizardStep implements WizardStep {
  constructor(public name: string) {}

  abstract execute(config: RedsmithConfig, layout: LayoutManager): Promise<void>;
  abstract isRequired(config: RedsmithConfig): boolean;

  protected async promptString(question: string, defaultValue: string = ''): Promise<string> {
    const response = await prompts({
      type: 'text',
      name: 'value',
      message: question,
      initial: defaultValue
    });
    
    if (response.value === undefined) {
      process.exit(0); // User cancelled (Ctrl+C)
    }
    
    return response.value || defaultValue;
  }

  protected async promptNumber(question: string, defaultValue: number, min?: number, max?: number): Promise<number> {
    const response = await prompts({
      type: 'number',
      name: 'value',
      message: question,
      initial: defaultValue,
      min,
      max,
      validate: (value: number) => {
        if (min !== undefined && value < min) {
          return `Value must be at least ${min}`;
        }
        if (max !== undefined && value > max) {
          return `Value must be at most ${max}`;
        }
        return true;
      }
    });
    
    if (response.value === undefined) {
      process.exit(0); // User cancelled (Ctrl+C)
    }
    
    return response.value ?? defaultValue;
  }

  protected async promptChoice(question: string, options: string[], defaultIndex: number = 0): Promise<number> {
    const choices = options.map((option, index) => ({
      title: option,
      value: index
    }));

    const response = await prompts({
      type: 'select',
      name: 'value',
      message: question,
      choices,
      initial: defaultIndex
    });
    
    if (response.value === undefined) {
      process.exit(0); // User cancelled (Ctrl+C)
    }
    
    return response.value;
  }
}

// Wizard step implementations
class ServerNameStep extends BaseWizardStep {
  constructor() { super('Server Name'); }

  isRequired(config: RedsmithConfig): boolean {
    return !config.serverName;
  }

  async execute(config: RedsmithConfig, layout: LayoutManager): Promise<void> {
    layout.printSectionHeader('📋 Basic Server Settings');
    config.serverName = await this.promptString('Server name', 'My Reforger Server');
    layout.printLine();
  }
}

class NetworkStep extends BaseWizardStep {
  constructor() { super('Network Configuration'); }

  isRequired(config: RedsmithConfig): boolean {
    return !config.bindAddress || !config.publicAddress || !config.bindPort;
  }

  async execute(config: RedsmithConfig, layout: LayoutManager): Promise<void> {
    if (!config.bindAddress) {
      config.bindAddress = await this.promptString('Bind address (IP to bind to)', '0.0.0.0');
    }
    if (!config.publicAddress) {
      config.publicAddress = await this.promptString('Public address (IP for players to connect)', '0.0.0.0');
    }
    if (!config.bindPort) {
      config.bindPort = await this.promptNumber('Bind port (main server port)', 2001, 1024, 65535);
    }
    layout.printLine();
  }
}

class ScenarioStep extends BaseWizardStep {
  constructor() { super('Scenario Selection'); }

  isRequired(config: RedsmithConfig): boolean {
    return !config.scenarioId;
  }

  async execute(config: RedsmithConfig, layout: LayoutManager): Promise<void> {
    layout.printSectionHeader('🎮 Scenario Selection');

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

    const selectedIndex = await this.promptChoice('Select a scenario:', scenarioOptions, 0);
    config.scenarioId = OfficialScenarios[scenarioNames[selectedIndex]].toString();
    layout.printLine();
  }
}

class MissionHeaderStep extends BaseWizardStep {
  constructor() { super('Mission Header Settings'); }

  isRequired(config: RedsmithConfig): boolean {
    return !config.missionName || !config.missionAuthor || !config.saveFileName;
  }

  async execute(config: RedsmithConfig, layout: LayoutManager): Promise<void> {
    layout.printSectionHeader('🏷️ Mission Header Settings');

    if (!config.missionName) {
      config.missionName = await this.promptString('Mission name', 'Default Mission');
    }
    if (!config.missionAuthor) {
      config.missionAuthor = await this.promptString('Mission author', 'Default Author');
    }
    if (!config.saveFileName) {
      config.saveFileName = await this.promptString('Save file name', 'defaultSave');
    }
    layout.printLine();
  }
}

class OutputStep extends BaseWizardStep {
  constructor() { super('Output Configuration'); }

  isRequired(config: RedsmithConfig): boolean {
    return !config.outputPath;
  }

  async execute(config: RedsmithConfig, layout: LayoutManager): Promise<void> {
    layout.printSectionHeader('💾 Output Configuration');
    config.outputPath = await this.promptString('Output file path', './server.json');
    layout.printLine();
  }
}

class RedsmithWizard {
  private config: RedsmithConfig = {};
  private steps: WizardStep[];
  private layout: LayoutManager;

  constructor(initialConfig: RedsmithConfig = {}) {
    this.config = { ...initialConfig };
    this.layout = new LayoutManager();

    // Initialize wizard steps
    this.steps = [
      new ServerNameStep(),
      new NetworkStep(),
      new ScenarioStep(),
      new MissionHeaderStep(),
      new OutputStep()
    ];
  }

  private displayHeader(): void {
    this.layout.printBrandedBanner('Interactive Reforger Config Forge');
    this.layout.printLine();
    this.layout.printMixed(
      { text: '  Forge the perfect server configuration for your Arma Reforger server.', colorKey: 'dimColor' }
    );
    this.layout.printMixed(
      { text: '  Press Ctrl+C at any time to exit.', colorKey: 'dimColor' }
    );
    this.layout.printLine();
  }

  private async runWizardSteps(): Promise<void> {
    for (const step of this.steps) {
      if (step.isRequired(this.config)) {
        await step.execute(this.config, this.layout);
      }
    }
  }

  private async generateConfig(): Promise<ServerConfig> {
    if (!this.config.serverName || !this.config.bindAddress || !this.config.publicAddress || 
        !this.config.bindPort || !this.config.scenarioId) {
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
    const missionHeader: MissionHeader = {
      m_sName: this.config.missionName || 'Default Mission',
      m_sAuthor: this.config.missionAuthor || 'Default Author',
      m_sSaveFileName: this.config.saveFileName || 'defaultSave'
    };
    serverConfig.game.gameProperties.missionHeader = missionHeader;

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
      this.layout.printWithPrefix('✅ Configuration saved to: ', path.resolve(outputPath), 'successColor', 'bodyColor');
    } catch (error) {
      this.layout.printWithPrefix('❌ Failed to save configuration: ', String(error), 'errorColor', 'bodyColor');
      throw error;
    }
  }

  private displaySummary(config: ServerConfig, outputPath: string): void {
    this.layout.printLine();
    this.layout.printSectionHeader('Configuration Summary');
    this.layout.printLine();
    this.layout.printLabelValue('Server Name: ', config.game.name);
    this.layout.printLabelValue('Bind Address: ', config.bindAddress);
    this.layout.printLabelValue('Public Address: ', config.publicAddress);
    this.layout.printLabelValue('Bind Port: ', config.bindPort.toString());
    this.layout.printLabelValue('Public Port: ', config.publicPort.toString());
    this.layout.printLabelValue('A2S Port: ', config.a2s.port.toString());
    this.layout.printLabelValue('RCON Port: ', config.rcon.port.toString());
    this.layout.printLabelValue('Mission Name: ', String(config.game.gameProperties.missionHeader.m_sName));
    this.layout.printLabelValue('Mission Author: ', String(config.game.gameProperties.missionHeader.m_sAuthor));
    this.layout.printLabelValue('Save File: ', String(config.game.gameProperties.missionHeader.m_sSaveFileName));
    this.layout.printLabelValue('Output Path: ', path.resolve(outputPath));
    this.layout.printLine();
  }

  async run(): Promise<void> {
    try {
      this.displayHeader();

      await this.runWizardSteps();

      const config = await this.generateConfig();
      
      this.displaySummary(config, this.config.outputPath!);
      
      const confirm = await prompts({
        type: 'confirm',
        name: 'proceed',
        message: 'Forge this configuration?',
        initial: false
      });

      if (confirm.proceed === undefined) {
        process.exit(0); // User cancelled (Ctrl+C)
      }

      if (confirm.proceed) {
        await this.saveConfig(config, this.config.outputPath!);
        this.layout.printSuccessBox('🎉 Server configuration forged successfully by Redsmith!');
      } else {
        this.layout.print('\n❌ Configuration not forged.', 'errorColor');
      }

    } catch (error) {
      this.layout.printError('\n' + String(error));
      process.exit(1);
    }
  }
}

// CLI option parsing and scenario mapping
function parseCliOptions(): CliOptions {
  const program = new Command();
  
  program
    .name('redsmith')
    .description('Interactive forge for crafting Arma Reforger server configuration files')
    .version('1.0.0')
    .option('-n, --name <name>', 'server name')
    .option('-b, --bind-address <address>', 'bind address')
    .option('-p, --public-address <address>', 'public address')
    .option('--port <port>', 'bind port', (value) => parseInt(value))
    .option('-s, --scenario <scenario>', 'scenario (conflict-everon, conflict-arland, etc.)')
    .option('-o, --output <path>', 'output file path')
    .option('--mission-name <name>', 'mission name')
    .option('--mission-author <author>', 'mission author')
    .option('--save-file <filename>', 'save file name');

  program.parse();
  return program.opts();
}

function mapScenarioName(scenarioName?: string): string | undefined {
  if (!scenarioName) return undefined;

  const scenarioMap: Record<string, OfficialScenarioName> = {
    'conflict-everon': 'CONFLICT_EVERON',
    'conflict-northern-everon': 'CONFLICT_NORTHERN_EVERON',
    'conflict-southern-everon': 'CONFLICT_SOUTHERN_EVERON',
    'conflict-western-everon': 'CONFLICT_WESTERN_EVERON',
    'conflict-montignac': 'CONFLICT_MONTIGNAC',
    'conflict-arland': 'CONFLICT_ARLAND',
    'combat-ops-arland': 'COMBAT_OPS_ARLAND',
    'combat-ops-everon': 'COMBAT_OPS_EVERON',
    'game-master-everon': 'GAME_MASTER_EVERON',
    'game-master-arland': 'GAME_MASTER_ARLAND'
  };

  const mapped = scenarioMap[scenarioName.toLowerCase()];
  return mapped ? OfficialScenarios[mapped].toString() : undefined;
}

function cliToConfig(options: CliOptions): RedsmithConfig {
  return {
    serverName: options.name,
    bindAddress: options.bindAddress,
    publicAddress: options.publicAddress,
    bindPort: options.port,
    scenarioId: mapScenarioName(options.scenario),
    missionName: options.missionName,
    missionAuthor: options.missionAuthor,
    saveFileName: options.saveFile,
    outputPath: options.output
  };
}

// Main execution
async function main() {
  try {
    const cliOptions = parseCliOptions();
    const initialConfig = cliToConfig(cliOptions);
    
    const wizard = new RedsmithWizard(initialConfig);
    await wizard.run();
  } catch (error) {
    const layout = new LayoutManager();
    layout.printError(String(error));
    process.exit(1);
  }
}

// Run the application
main();
