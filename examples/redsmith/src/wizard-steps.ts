import prompts from 'prompts';
import * as path from 'path';
import { OfficialScenarios, type OfficialScenarioName, type Mod } from 'reforger-types';
import { LayoutManager } from './layout.js';

// Configuration holder interface
export interface RedsmithConfig {
  serverName?: string;
  bindAddress?: string;
  publicAddress?: string;
  bindPort?: number;
  scenarioId?: string;
  missionName?: string;
  missionAuthor?: string;
  saveFileName?: string;
  outputPath?: string;
  mods?: Mod[];
  crossPlatform?: boolean;
  yes?: boolean;
  force?: boolean;
  validate?: boolean;
  stdout?: boolean;
}

// Interface for wizard steps
export interface WizardStep {
  name: string;
  execute(config: RedsmithConfig, layout: LayoutManager): Promise<void>;
  isRequired(config: RedsmithConfig): boolean;
}

// Base wizard step implementation
export abstract class BaseWizardStep implements WizardStep {
  constructor(public name: string) {}

  abstract execute(config: RedsmithConfig, layout: LayoutManager): Promise<void>;
  abstract isRequired(config: RedsmithConfig): boolean;

  protected async promptString(question: string, defaultValue: string = ''): Promise<string> {
    const response = await prompts({
      type: 'text',
      name: 'value',
      message: question,
      initial: defaultValue,
      validate: (value: string) => {
        if (!value || value.trim() === '') {
          return 'This field cannot be empty';
        }
        const trimmedValue = value.trim();
        if (trimmedValue.length < 1) {
          return 'Please enter at least 1 character';
        }
        if (trimmedValue.length > 256) {
          return 'Text must be 256 characters or less';
        }
        return true;
      }
    });
    
    if (response.value === undefined) {
      process.exit(0); // User cancelled (Ctrl+C)
    }
    
    return response.value?.trim() || defaultValue;
  }

  protected async promptFilePath(question: string, defaultValue: string = ''): Promise<string> {
    const response = await prompts({
      type: 'text',
      name: 'value',
      message: question,
      initial: defaultValue,
      validate: (value: string) => {
        if (!value || value.trim() === '') {
          return 'File path cannot be empty';
        }
        const trimmedValue = value.trim();
        
        // Check for invalid characters (basic validation)
        const invalidChars = /[<>:"|?*]/;
        if (invalidChars.test(trimmedValue)) {
          return 'File path contains invalid characters (<>:"|?*)';
        }
        
        // Check if it's a valid file extension for JSON
        if (!trimmedValue.toLowerCase().endsWith('.json')) {
          return 'File path must end with .json extension';
        }
        
        // Check if the directory part is valid (if it exists)
        const dir = path.dirname(trimmedValue);
        if (dir && dir !== '.' && !path.isAbsolute(dir)) {
          // For relative paths, check if they start with valid patterns
          if (!dir.match(/^\.{0,2}[/\\]/) && !dir.match(/^[a-zA-Z0-9._-]+/)) {
            return 'Invalid directory path format';
          }
        }
        
        return true;
      }
    });
    
    if (response.value === undefined) {
      process.exit(0); // User cancelled (Ctrl+C)
    }
    
    return response.value?.trim() || defaultValue;
  }

  protected async promptIPAddress(question: string, defaultValue: string = '0.0.0.0'): Promise<string> {
    const response = await prompts({
      type: 'text',
      name: 'value',
      message: question,
      initial: defaultValue,
      validate: (value: string) => {
        if (!value || value.trim() === '') {
          return 'IP address cannot be empty';
        }
        // Allow special values like "0.0.0.0" or basic IP format validation
        const trimmedValue = value.trim();
        const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
        if (!ipRegex.test(trimmedValue)) {
          return 'Please enter a valid IP address (e.g., 192.168.1.1 or 0.0.0.0)';
        }
        // Additional validation for IP octets
        const octets = trimmedValue.split('.');
        for (const octet of octets) {
          const num = parseInt(octet, 10);
          if (num < 0 || num > 255) {
            return 'IP address octets must be between 0 and 255';
          }
        }
        return true;
      }
    });
    
    if (response.value === undefined) {
      process.exit(0); // User cancelled (Ctrl+C)
    }
    
    return response.value?.trim() || defaultValue;
  }

  protected async promptNumber(
    question: string, 
    defaultValue: number, 
    min?: number, 
    max?: number
  ): Promise<number> {
    // Use text input instead of number to handle default values properly
    const response = await prompts({
      type: 'text',
      name: 'value',
      message: question,
      initial: defaultValue.toString(),
      validate: (value: string) => {
        // If empty string, user hit enter - this is valid (will use default)
        if (value.trim() === '') {
          return true;
        }
        
        // Parse the entered value
        const numValue = parseInt(value.trim(), 10);
        if (isNaN(numValue)) {
          return 'Please enter a valid number';
        }
        
        if (min !== undefined && numValue < min) {
          return `Value must be at least ${min}`;
        }
        if (max !== undefined && numValue > max) {
          return `Value must be at most ${max}`;
        }
        return true;
      }
    });
    
    // Handle cancellation (Ctrl+C)
    if (response.value === undefined) {
      process.exit(0);
    }
    
    // If empty string (user hit enter), use default value
    if (response.value.trim() === '') {
      return defaultValue;
    }
    
    // Parse and return the entered value
    return parseInt(response.value.trim(), 10);
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
export class ServerNameStep extends BaseWizardStep {
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

export class NetworkStep extends BaseWizardStep {
  constructor() { super('Network Configuration'); }

  isRequired(config: RedsmithConfig): boolean {
    return !config.bindAddress || !config.publicAddress || !config.bindPort;
  }

  async execute(config: RedsmithConfig, layout: LayoutManager): Promise<void> {
    if (!config.bindAddress) {
      config.bindAddress = await this.promptIPAddress('Bind address (IP to bind to)', '0.0.0.0');
    }
    if (!config.publicAddress) {
      config.publicAddress = await this.promptIPAddress('Public address (IP for players to connect)', '0.0.0.0');
    }
    if (!config.bindPort) {
      config.bindPort = await this.promptNumber('Bind port (main server port)', 2001, 1024, 65535);
    }
    layout.printLine();
  }
}

export class CrossPlayStep extends BaseWizardStep {
  constructor() { super('Cross-Platform Settings'); }

  isRequired(config: RedsmithConfig): boolean {
    return config.crossPlatform === undefined;
  }

  async execute(config: RedsmithConfig, layout: LayoutManager): Promise<void> {
    layout.printSectionHeader('🎮 Cross-Platform Settings');
    
    const response = await prompts({
      type: 'confirm',
      name: 'crossPlatform',
      message: 'Enable cross-platform play (PC + Console)?',
      initial: true
    });
    
    if (response.crossPlatform === undefined) {
      process.exit(0); // User cancelled (Ctrl+C)
    }
    
    config.crossPlatform = response.crossPlatform;
    layout.printLine();
  }
}

export class ScenarioStep extends BaseWizardStep {
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

export class MissionHeaderStep extends BaseWizardStep {
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

export class OutputStep extends BaseWizardStep {
  constructor() { super('Output Configuration'); }

  isRequired(config: RedsmithConfig): boolean {
    // Skip if stdout mode is enabled or if outputPath is already provided
    return !config.outputPath && !config.stdout;
  }

  async execute(config: RedsmithConfig, layout: LayoutManager): Promise<void> {
    layout.printSectionHeader('💾 Output Configuration');
    config.outputPath = await this.promptFilePath('Output file path', './server.json');
    layout.printLine();
  }
}
