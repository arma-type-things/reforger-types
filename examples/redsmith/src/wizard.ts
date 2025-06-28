import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';
import prompts from 'prompts';
import { 
  createDefaultServerConfig,
  type ServerConfig,
  type MissionHeader,
  type Mod,
  isValidModId,
  dedupModList
} from 'reforger-types';
import { LayoutManager } from './layout.js';
import { ConfigValidator } from './validator.js';
import { 
  type RedsmithConfig, 
  type WizardStep,
  ServerNameStep,
  NetworkStep,
  CrossPlayStep,
  ScenarioStep,
  MissionHeaderStep,
  OutputStep
} from './wizard-steps.js';

/**
 * File content types based on file extension
 */
enum FileContentType {
  TEXT = 'text',
  JSON = 'json',
  YAML = 'yaml',
  CSV = 'csv'
}

/**
 * Determine file content type based on file extension
 * Defaults to TEXT for unrecognized extensions
 */
function getFileContentType(filePath: string): FileContentType {
  const extension = path.extname(filePath).toLowerCase();
  
  switch (extension) {
    case '.json':
      return FileContentType.JSON;
    case '.yaml':
    case '.yml':
      return FileContentType.YAML;
    case '.csv':
      return FileContentType.CSV;
    default:
      return FileContentType.TEXT;
  }
}

/**
 * Parse JSON/YAML content for mod list
 * Tries JSON first, falls back to YAML on parse failure
 * Returns empty list if neither format works or no valid mods found
 */
function yamlJsonModListParser(content: string): Mod[] {
  let parsed: any;
  
  // Try JSON first
  try {
    parsed = JSON.parse(content);
  } catch {
    // JSON failed, try YAML
    try {
      parsed = yaml.load(content);
    } catch {
      return [];
    }
  }
  
  const mods: Mod[] = [];
  
  // Handle array of objects
  if (Array.isArray(parsed)) {
    for (const item of parsed) {
      if (typeof item === 'object' && item !== null && typeof (item as any).modId === 'string') {
        const mod: Mod = { modId: (item as any).modId };
        
        // Only add optional properties if they exist and are valid
        if (typeof (item as any).name === 'string') mod.name = (item as any).name;
        if (typeof (item as any).version === 'string') mod.version = (item as any).version;
        if (typeof (item as any).required === 'boolean') mod.required = (item as any).required;
        
        mods.push(mod);
      }
    }
  }
  // Handle single object
  else if (typeof parsed === 'object' && parsed !== null && typeof (parsed as any).modId === 'string') {
    const mod: Mod = { modId: (parsed as any).modId };
    
    if (typeof (parsed as any).name === 'string') mod.name = (parsed as any).name;
    if (typeof (parsed as any).version === 'string') mod.version = (parsed as any).version;
    if (typeof (parsed as any).required === 'boolean') mod.required = (parsed as any).required;
    
    mods.push(mod);
  }
  
  return mods;
}

/**
 * Parse plain text content for mod list
 * Returns empty list if no valid mod IDs found
 */
function textModListParser(content: string): Mod[] {
  try {
    const lines = content.split(/\r?\n/)
      .map(line => line.replace(/\r$/, '').trim())
      .filter(line => line.length > 0);
    
    const mods: Mod[] = [];
    
    for (const line of lines) {
      if (isValidModId(line)) {
        mods.push({ modId: line.toUpperCase() });
      }
    }
    
    return mods;
  } catch {
    return [];
  }
}

/**
 * Parse CSV content for mod list
 * Returns empty list if no valid mod IDs found
 */
function csvModListParser(content: string): Mod[] {
  // TODO: Implement CSV parsing logic
  return [];
}

/**
 * Load and parse mod list from file
 * Returns empty list if file cannot be read or parsed
 */
function loadModListFromFile(filePath: string): Mod[] {
  try {
    if (!fs.existsSync(filePath)) {
      return [];
    }
    
    const content = fs.readFileSync(filePath, 'utf-8');
    const fileType = getFileContentType(filePath);
    
    switch (fileType) {
      case FileContentType.JSON:
      case FileContentType.YAML:
        return yamlJsonModListParser(content);
      case FileContentType.CSV:
        return csvModListParser(content);
      case FileContentType.TEXT:
      default:
        return textModListParser(content);
    }
  } catch {
    return [];
  }
}

export class RedsmithWizard {
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
      new CrossPlayStep(),
      new ScenarioStep(),
      // new MissionHeaderStep(), // Disabled for now - mission header fields are optional
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
      this.config.crossPlatform ?? true, // Default to true for redsmith
      '' // rconPassword - keeping empty for now
    );

    // Set the public address
    serverConfig.publicAddress = this.config.publicAddress;
    serverConfig.publicPort = this.config.bindPort;

    // Combine mods from CLI and file sources, then deduplicate
    const combinedMods: Mod[] = [];
    
    // Add mods from CLI
    if (this.config.mods && this.config.mods.length > 0) {
      combinedMods.push(...this.config.mods);
    }
    
    // Add mods from file
    if (this.config.modListFile) {
      const fileMods = loadModListFromFile(this.config.modListFile);
      combinedMods.push(...fileMods);
    }
    
    // Deduplicate and set final mod list
    if (combinedMods.length > 0) {
      serverConfig.game.mods = dedupModList(combinedMods);
    }

    // Update mission header - only include fields that are actually provided
    const missionHeader: MissionHeader = {};
    if (this.config.missionName) {
      missionHeader.m_sName = this.config.missionName;
    }
    if (this.config.missionAuthor) {
      missionHeader.m_sAuthor = this.config.missionAuthor;
    }
    if (this.config.saveFileName) {
      missionHeader.m_sSaveFileName = this.config.saveFileName;
    }
    serverConfig.game.gameProperties.missionHeader = missionHeader;

    return serverConfig;
  }

  private async saveConfig(config: ServerConfig, outputPath: string, force: boolean = false): Promise<void> {
    // Check if file already exists - only block if force is not enabled
    const fileExists = fs.existsSync(outputPath);
    if (fileExists && !force) {
      throw new Error(`Refusing to overwrite existing file: ${outputPath} (use --force to override)`);
    }
    
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

  private outputToStdout(config: ServerConfig): void {
    const configJson = JSON.stringify(config, null, 2);
    console.log(configJson);
  }

  private displaySummary(config: ServerConfig, outputPath?: string): void {
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
    this.layout.printLabelValue('Cross-Platform: ', config.game.crossPlatform ? 'Enabled' : 'Disabled');
    
    // Show mission header fields only if they exist
    if (config.game.gameProperties.missionHeader.m_sName) {
      this.layout.printLabelValue('Mission Name: ', String(config.game.gameProperties.missionHeader.m_sName));
    }
    if (config.game.gameProperties.missionHeader.m_sAuthor) {
      this.layout.printLabelValue('Mission Author: ', String(config.game.gameProperties.missionHeader.m_sAuthor));
    }
    if (config.game.gameProperties.missionHeader.m_sSaveFileName) {
      this.layout.printLabelValue('Save File: ', String(config.game.gameProperties.missionHeader.m_sSaveFileName));
    }
    
    if (outputPath) {
      this.layout.printLabelValue('Output Path: ', path.resolve(outputPath));
    } else {
      this.layout.printLabelValue('Output: ', 'stdout');
    }
    this.layout.printLine();
  }

  private async validateConfig(configPath: string): Promise<void> {
    this.layout.printLine();
    this.layout.printSectionHeader('🔍 Validation Results');
    
    try {
      const validator = new ConfigValidator();
      const result = await validator.validateFile(configPath);
      validator.displayResults(result, configPath);
      
      // If there are errors, exit with error code
      if (result.hasErrors) {
        process.exit(1);
      }
    } catch (error) {
      this.layout.printError('Validation failed: ' + String(error));
      process.exit(1);
    }
  }

  private async handleConfirmationResult(confirm: { proceed?: boolean }, config: ServerConfig): Promise<void> {
    if (confirm.proceed === undefined) {
      process.exit(0); // User cancelled (Ctrl+C)
    }

    if (confirm.proceed) {
      if (this.config.stdout) {
        // Output to stdout instead of file
        this.outputToStdout(config);
      } else {
        // Normal file output
        await this.saveConfig(config, this.config.outputPath!, this.config.force || false);
        
        // Run validation if requested (only for file output)
        if (this.config.validate) {
          await this.validateConfig(this.config.outputPath!);
        }
        
        this.layout.printSuccessBox('🎉 Server configuration forged successfully by Redsmith!');
      }
    } else {
      this.layout.print('\n❌ Configuration not forged.', 'errorColor');
    }
  }

  async run(): Promise<void> {
    try {
      this.displayHeader();

      await this.runWizardSteps();

      const config = await this.generateConfig();
      
      this.displaySummary(config, this.config.stdout ? undefined : this.config.outputPath!);
      
      let confirm: { proceed?: boolean };
      
      if (this.config.yes || this.config.force || this.config.validate) {
        // Skip confirmation when --yes, --force, or --validate flag is set
        confirm = { proceed: true };
      } else {
        // Normal confirmation flow
        confirm = await prompts({
          type: 'confirm',
          name: 'proceed',
          message: 'Forge this configuration?',
          initial: false
        });
      }

      await this.handleConfirmationResult(confirm, config);

    } catch (error) {
      this.layout.printError('\n' + String(error));
      process.exit(1);
    }
  }
}
