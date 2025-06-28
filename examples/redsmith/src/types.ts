// Type definitions for Redsmith CLI application

import type { Mod } from 'reforger-types';
import type { RedsmithConfig } from './wizard-steps.js';

// File content types based on file extension
export enum FileContentType {
  TEXT = 'text',
  JSON = 'json',
  YAML = 'yaml',
  CSV = 'csv'
}

// Base command types
export enum BaseCommand {
  WIZARD = 'wizard',
  VALIDATE = 'validate', 
  EXTRACT = 'extract'
}

// Common options shared across all commands
export interface BaseConfig {
  command: BaseCommand;
}

// Wizard-specific config (extends existing RedsmithConfig)
export interface WizardConfig extends BaseConfig {
  command: BaseCommand.WIZARD;
  redsmithConfig: RedsmithConfig;
}

// Validate command config
export interface ValidateConfig extends BaseConfig {
  command: BaseCommand.VALIDATE;
  configFile: string;
  debug?: boolean;
}

// Extract command config
export interface ExtractConfig extends BaseConfig {
  command: BaseCommand.EXTRACT;
  configFile: string;
  outputFile?: string;
  options: ExtractModsOptions;
}

// Union type for all possible command configurations
export type CommandConfig = WizardConfig | ValidateConfig | ExtractConfig;

// Command line options interface (for CLI parsing)
export interface CliOptions {
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
export interface ExtractModsOptions {
  output?: string;
  stdout?: boolean;
}

// Extract command options interface (for future subcommands)
export interface ExtractOptions {
  mods?: ExtractModsOptions;
}
