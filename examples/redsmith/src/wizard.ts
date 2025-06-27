import * as fs from 'fs';
import * as path from 'path';
import prompts from 'prompts';
import { 
  createDefaultServerConfig,
  type ServerConfig,
  type MissionHeader
} from 'reforger-types';
import { LayoutManager } from './layout.js';
import { 
  type RedsmithConfig, 
  type WizardStep,
  ServerNameStep,
  NetworkStep,
  ScenarioStep,
  MissionHeaderStep,
  OutputStep
} from './wizard-steps.js';

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
      false, // crossPlatform - keeping simple for now
      '' // rconPassword - keeping empty for now
    );

    // Set the public address
    serverConfig.publicAddress = this.config.publicAddress;
    serverConfig.publicPort = this.config.bindPort;

    // Add mods if provided
    if (this.config.mods && this.config.mods.length > 0) {
      serverConfig.game.mods = this.config.mods;
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

  private async saveConfig(config: ServerConfig, outputPath: string): Promise<void> {
    // Check if file already exists - never overwrite by default
    const fileExists = fs.existsSync(outputPath);
    if (fileExists) {
      throw new Error(`File already exists: ${outputPath}. Cannot overwrite existing files.`);
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
    
    this.layout.printLabelValue('Output Path: ', path.resolve(outputPath));
    this.layout.printLine();
  }

  private async handleConfirmationResult(confirm: { proceed?: boolean }, config: ServerConfig): Promise<void> {
    if (confirm.proceed === undefined) {
      process.exit(0); // User cancelled (Ctrl+C)
    }

    if (confirm.proceed) {
      await this.saveConfig(config, this.config.outputPath!);
      this.layout.printSuccessBox('🎉 Server configuration forged successfully by Redsmith!');
    } else {
      this.layout.print('\n❌ Configuration not forged.', 'errorColor');
    }
  }

  async run(): Promise<void> {
    try {
      this.displayHeader();

      await this.runWizardSteps();

      const config = await this.generateConfig();
      
      this.displaySummary(config, this.config.outputPath!);
      
      let confirm: { proceed?: boolean };
      
      if (this.config.yes) {
        // Skip confirmation when --yes flag is set
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
