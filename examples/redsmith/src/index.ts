#!/usr/bin/env node

import { Command } from 'commander';
import { OfficialScenarios, type OfficialScenarioName, type Mod, type ServerConfig, isValidModId, loadServerConfigFromFile, ScenarioIdExtended } from 'reforger-types';
import { LayoutManager } from './layout.js';
import { RedsmithWizard } from './wizard.js';
import { ConfigValidator } from './validator.js';
import { type RedsmithConfig } from './wizard-steps.js';
import { 
  BaseCommand,
  FileContentType,
  type CliOptions,
  type WizardConfig,
  type ValidateConfig,
  type ExtractConfig,
  type ExtractModsOptions,
  parseFileContentType,
  resolveOutputFormat
} from './types.js';
import { formatModsByType } from './file-utils.js';

// Parse mod IDs from comma-separated string
function parseModIds(modsString?: string): Mod[] {
  if (!modsString) return [];
  
  // Split by comma and clean up each mod ID
  const modIds = modsString.split(',').map(id => id.trim().toUpperCase()).filter(id => id.length > 0);
  const validMods: Mod[] = [];
  const invalidMods: string[] = [];
  
  for (const modId of modIds) {
    if (isValidModId(modId)) {
      validMods.push({ modId });
    } else {
      invalidMods.push(modId);
    }
  }
  
  // Report invalid mod IDs but don't fail completely
  if (invalidMods.length > 0) {
    console.warn(`Warning: Invalid mod IDs ignored: ${invalidMods.join(', ')}`);
    console.warn('Mod IDs must be 16-character hexadecimal strings');
  }
  
  return validMods;
}

// List available scenarios
function listScenarios(): void {
  const layout = new LayoutManager();
  
  layout.printBrandedBanner('Available Scenarios');
  layout.printLine();
  layout.printMixed({ text: '  Use these scenario codes with the --scenario option:', colorKey: 'dimColor' });
  layout.printLine();

  const allScenarios = ScenarioIdExtended.getAllScenarios();

  for (const scenario of allScenarios) {
    layout.printMixed(
      { text: `  ${scenario.code.padEnd(28)}`, colorKey: 'bodyColor' },
      { text: scenario.displayName, colorKey: 'valueColor' }
    );
  }

  layout.printLine();
  layout.printMixed({ text: '  Example: ', colorKey: 'dimColor' });
  layout.printMixed({ text: 'redsmith --scenario conflict-everon', colorKey: 'bodyColor' });
  layout.printLine();
}

// Create WizardConfig from CLI options
function createWizardConfig(options: CliOptions): WizardConfig {
  return {
    command: BaseCommand.WIZARD,
    redsmithConfig: {
      serverName: options.name,
      bindAddress: options.bindAddress,
      publicAddress: options.publicAddress,
      bindPort: options.port,
      scenarioId: ScenarioIdExtended.mapScenarioName(options.scenario)?.toString(),
      missionName: options.missionName,
      missionAuthor: options.missionAuthor,
      saveFileName: options.saveFile,
      outputPath: options.output,
      mods: parseModIds(options.mods),
      modListFile: options.modListFile,
      crossPlatform: options.crossPlatform,
      yes: options.yes,
      force: options.force,
      validate: options.validate,
      stdout: options.stdout
    }
  };
}

// Create ValidateConfig from command arguments
function createValidateConfig(configFile: string, options: { debug?: boolean }): ValidateConfig {
  return {
    command: BaseCommand.VALIDATE,
    configFile,
    debug: options.debug
  };
}

// Create ExtractConfig from command arguments
function createExtractConfig(configFile: string, outputFile: string | undefined, options: ExtractModsOptions): ExtractConfig {
  return {
    command: BaseCommand.EXTRACT,
    configFile,
    outputFile,
    options
  };
}

// Wizard command handler
async function runWizard(options: CliOptions): Promise<void> {
  try {
    // Check if -- is the last argument for stdout mode
    const args = process.argv;
    if (args[args.length - 1] === '--') {
      options.stdout = true;
    }
    
    const wizardConfig = createWizardConfig(options);
    const wizard = new RedsmithWizard(wizardConfig.redsmithConfig);
    await wizard.run();
  } catch (error) {
    const layout = new LayoutManager();
    layout.printError(String(error));
    process.exit(1);
  }
}

// Validate command handler
async function runValidator(configFile: string, options: { debug?: boolean }): Promise<void> {
  try {
    const validateConfig = createValidateConfig(configFile, options);
    
    if (validateConfig.debug) {
      process.env.DEBUG = 'true';
    }
    
    const validator = new ConfigValidator();
    await validator.validateAndExit(validateConfig.configFile);
  } catch (error) {
    const layout = new LayoutManager();
    layout.printError(String(error));
    process.exit(1);
  }
}

// Extract mods from ServerConfig
export function extractModsFromConfig(serverConfig: ServerConfig): Mod[] {
  return serverConfig.game.mods || [];
}

// Extract mods command handler
async function runExtractMods(configFile: string, outputFile: string | undefined, options: ExtractModsOptions): Promise<void> {
  try {
    const extractConfig = createExtractConfig(configFile, outputFile, options);
    
    // Load the server configuration
    const serverConfig = loadServerConfigFromFile(extractConfig.configFile);
    if (!serverConfig) {
      throw new Error(`Failed to load or parse config file: ${extractConfig.configFile}`);
    }

    // Extract mods from the configuration
    const mods = extractModsFromConfig(serverConfig);
    
    // Resolve output format using the format resolution logic
    const outputFormat = resolveOutputFormat(extractConfig.options.output, extractConfig.outputFile);
    
    // Generate content in the resolved format
    const content = formatModsByType(mods, outputFormat);
    
    if (!extractConfig.outputFile) {
      // Output to stdout for piping/reuse - NO branding, NO layout
      console.log(content);
    } else {
      // File output path with branding and user feedback
      const layout = new LayoutManager();
      layout.printBrandedBanner('Extract Mods');
      layout.printLine();
      layout.printMixed({ text: `  Config file: ${extractConfig.configFile}`, colorKey: 'dimColor' });
      layout.printMixed({ text: `  Output file: ${extractConfig.outputFile}`, colorKey: 'dimColor' });
      layout.printMixed({ text: `  Output format: ${outputFormat}`, colorKey: 'dimColor' });
      layout.printMixed({ text: `  Found ${mods.length} mod(s) in configuration`, colorKey: 'bodyColor' });
      layout.printLine();
      
      const fs = await import('fs');
      const path = await import('path');
      
      // Ensure directory exists
      const dir = path.dirname(extractConfig.outputFile);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      fs.writeFileSync(extractConfig.outputFile, content, 'utf-8');
      
      layout.printMixed({ text: `  ✅ Extracted ${mods.length} mod(s) to: ${extractConfig.outputFile}`, colorKey: 'successColor' });
      layout.printLine();
    }
  } catch (error) {
    const layout = new LayoutManager();
    layout.printError(String(error));
    process.exit(1);
  }
}

// CLI setup
function setupCli(): void {
  const program = new Command();
  
  program
    .name('redsmith')
    .description('Interactive forge for crafting and validating Arma Reforger server configurations')
    .version('1.0.0');

  // Default command (wizard) - when no sub-command is specified
  program
    .option('-n, --name <name>', 'server name')
    .option('-b, --bind-address <address>', 'bind address')
    .option('-p, --public-address <address>', 'public address') 
    .option('--port <port>', 'bind port', (value) => parseInt(value))
    .option('-s, --scenario <scenario>', 'scenario (conflict-everon, conflict-arland, etc.)')
    .option('-o, --output <path>', 'output file path')
    .option('--mission-name <name>', 'mission name')
    .option('--mission-author <author>', 'mission author')
    .option('--save-file <filename>', 'save file name')
    .option('--mods <mods>', 'comma-separated list of mod IDs (16-character hex strings)')
    .option('--mod-list-file <path>', 'path to file containing mod list (JSON, CSV, or plain text)')
    .option('--cross-platform', 'enable cross-platform play (PC + Console)', true)
    .option('--no-cross-platform', 'disable cross-platform play (PC only)')
    .option('-y, --yes', 'skip confirmation prompt and proceed automatically')
    .option('-f, --force', 'allow overwriting existing files and skip confirmation')
    .option('--validate', 'run validation after saving the configuration file')
    .action(async (options) => {
      await runWizard(options);
    });

  // Validate sub-command
  program
    .command('validate')
    .description('Validate an existing Arma Reforger server configuration file')
    .argument('<config-file>', 'Path to the server configuration JSON file')
    .option('-d, --debug', 'Enable debug output')
    .action(async (configFile: string, options: { debug?: boolean }) => {
      await runValidator(configFile, options);
    });

  // List scenarios sub-command
  program
    .command('list-scenarios')
    .description('List all available scenario codes and names')
    .action(() => {
      listScenarios();
    });

  // Extract command with sub-commands
  const extractCommand = program
    .command('extract')
    .description('Extract information from server configuration files');

  // Extract mods sub-command
  extractCommand
    .command('mods')
    .description('Extract mod list from a server configuration file')
    .argument('<config-file>', 'Path to the server configuration JSON file')
    .argument('[output-file]', 'Output file path (omit for stdout)')
    .option('-o, --output <format>', 'Output format (json, yaml, csv, text)')
    .action(async (configFile: string, outputFile: string | undefined, options: { output?: string }) => {
      // Validate and parse the format option
      let parsedOptions: ExtractModsOptions = {};
      
      if (options.output) {
        const parsedFormat = parseFileContentType(options.output);
        if (!parsedFormat) {
          const layout = new LayoutManager();
          layout.printError(`Invalid output format: ${options.output}. Valid formats: json, yaml, csv, text`);
          process.exit(1);
        }
        parsedOptions.output = parsedFormat;
      }
      
      await runExtractMods(configFile, outputFile, parsedOptions);
    });

  program.parse();
}

// Main execution
async function main() {
  setupCli();
}

// Run the application
main();
