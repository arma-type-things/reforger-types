#!/usr/bin/env node

import { Command } from 'commander';
import { OfficialScenarios, type OfficialScenarioName, type Mod, type ServerConfig, isValidModId } from 'reforger-types';
import { LayoutManager } from './layout.js';
import { RedsmithWizard } from './wizard.js';
import { ConfigValidator } from './validator.js';
import { type RedsmithConfig } from './wizard-steps.js';

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
  mods?: string;
  modListFile?: string;
  crossPlatform?: boolean;
  yes?: boolean;
  force?: boolean;
  validate?: boolean;
  stdout?: boolean; // true if -- was detected
}

// Extract mods command options interface
interface ExtractModsOptions {
  output?: string;
  stdout?: boolean;
}

// Extract command options interface (for future subcommands)
interface ExtractOptions {
  mods?: ExtractModsOptions;
}

// Scenario name mapping
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

  const scenarioMap: Array<{ code: string; name: string }> = [
    { code: 'conflict-everon', name: 'Conflict Everon' },
    { code: 'conflict-northern-everon', name: 'Conflict Northern Everon' },
    { code: 'conflict-southern-everon', name: 'Conflict Southern Everon' },
    { code: 'conflict-western-everon', name: 'Conflict Western Everon' },
    { code: 'conflict-montignac', name: 'Conflict Montignac' },
    { code: 'conflict-arland', name: 'Conflict Arland' },
    { code: 'combat-ops-arland', name: 'Combat Ops Arland' },
    { code: 'combat-ops-everon', name: 'Combat Ops Everon' },
    { code: 'game-master-everon', name: 'Game Master Everon' },
    { code: 'game-master-arland', name: 'Game Master Arland' }
  ];

  for (const scenario of scenarioMap) {
    layout.printMixed(
      { text: `  ${scenario.code.padEnd(28)}`, colorKey: 'bodyColor' },
      { text: scenario.name, colorKey: 'valueColor' }
    );
  }

  layout.printLine();
  layout.printMixed({ text: '  Example: ', colorKey: 'dimColor' });
  layout.printMixed({ text: 'redsmith --scenario conflict-everon', colorKey: 'bodyColor' });
  layout.printLine();
}

// Convert CLI options to RedsmithConfig
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
    outputPath: options.output,
    mods: parseModIds(options.mods),
    modListFile: options.modListFile,
    crossPlatform: options.crossPlatform,
    yes: options.yes,
    force: options.force,
    validate: options.validate,
    stdout: options.stdout
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
    
    const initialConfig = cliToConfig(options);
    const wizard = new RedsmithWizard(initialConfig);
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
    if (options.debug) {
      process.env.DEBUG = 'true';
    }
    
    const validator = new ConfigValidator();
    await validator.validateAndExit(configFile);
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
async function runExtractMods(configFile: string, outputFile: string, options: ExtractModsOptions): Promise<void> {
  try {
    // Process the output file argument
    const processedOptions = { ...options };
    if (outputFile === '--') {
      processedOptions.stdout = true;
    }

    const layout = new LayoutManager();
    layout.printBrandedBanner('Extract Mods');
    layout.printLine();
    layout.printMixed({ text: `  Config file: ${configFile}`, colorKey: 'dimColor' });
    layout.printMixed({ text: `  Output file: ${outputFile}`, colorKey: 'dimColor' });
    layout.printMixed({ text: `  Options: ${JSON.stringify(processedOptions)}`, colorKey: 'dimColor' });
    layout.printLine();

    if (processedOptions.stdout) {
      // Stdout output path - keep as stub
      layout.printMixed({ text: '  [STUB] Stdout output not yet implemented', colorKey: 'errorColor' });
      layout.printLine();
    } else {
      // File output path - implement basic file writing
      layout.printMixed({ text: '  [STUB] Extract mods functionality not yet implemented', colorKey: 'errorColor' });
      layout.printMixed({ text: `  Would write extracted mods to: ${outputFile}`, colorKey: 'dimColor' });
      layout.printLine();
      
      // Create a placeholder file to demonstrate the file path
      const fs = await import('fs');
      const path = await import('path');
      
      // Ensure directory exists
      const dir = path.dirname(outputFile);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      // Write placeholder content
      const placeholderContent = '# STUB: Extracted mods would appear here\n# This is a placeholder file created by the stub implementation\n';
      fs.writeFileSync(outputFile, placeholderContent, 'utf-8');
      
      layout.printMixed({ text: `  ✅ Placeholder file created: ${outputFile}`, colorKey: 'successColor' });
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
    .argument('<output-file>', 'Output file path (use -- for stdout)')
    .option('-o, --output <format>', 'Output format')
    .action(async (configFile: string, outputFile: string, options: ExtractModsOptions) => {
      await runExtractMods(configFile, outputFile, options);
    });

  program.parse();
}

// Main execution
async function main() {
  setupCli();
}

// Run the application
main();
