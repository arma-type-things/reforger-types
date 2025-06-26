#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import { parse, ParserWarningType, ParserErrorType } from 'reforger-types';
import type { ParserError, ParserWarning, ParseResult, ServerConfig } from 'reforger-types';

const program = new Command();

function formatIssue(issue: ParserError | ParserWarning, isError: boolean = false): string {
  const icon = isError ? '❌' : '⚠️';
  const typeLabel = isError ? 'ERROR' : 'WARNING';
  const typeColor = isError ? chalk.red : chalk.yellow;
  
  let output = `${icon} ${typeColor.bold(typeLabel)}: ${issue.message}\n`;
  
  if (issue.field) {
    output += `   ${chalk.cyan('Field:')} ${issue.field}\n`;
  }
  
  if (issue.value !== undefined) {
    output += `   ${chalk.cyan('Value:')} ${JSON.stringify(issue.value)}\n`;
  }
  
  // ParserError has validRange, ParserWarning has recommendedValue
  if (isError && 'validRange' in issue && issue.validRange) {
    output += `   ${chalk.cyan('Valid Range:')} ${issue.validRange}\n`;
  }
  
  if (!isError && 'recommendedValue' in issue && issue.recommendedValue !== undefined) {
    output += `   ${chalk.cyan('Recommended:')} ${JSON.stringify(issue.recommendedValue)}\n`;
  }
  
  return output;
}

function validateConfigFile(configPath: string): void {
  // Check if file exists
  if (!fs.existsSync(configPath)) {
    console.error(chalk.red.bold('Error:') + ` Configuration file not found: ${configPath}`);
    process.exit(1);
  }

  console.log(chalk.bold('🔍 Validating Arma Reforger server configuration...'));
  console.log(chalk.cyan('File:') + ` ${path.resolve(configPath)}\n`);

  try {
    // Read and parse the JSON file
    const configContent = fs.readFileSync(configPath, 'utf8');
    let configData: any;

    try {
      configData = JSON.parse(configContent);
    } catch (jsonError: any) {
      console.error(chalk.red.bold('JSON Parse Error:'));
      console.error(`❌ Invalid JSON format: ${jsonError.message}`);
      process.exit(1);
    }

    // Parse with our validator
    const result = parse(configData, { validate: true });

    // Check for basic parsing errors (not validation errors)
    if (!result.success && result.errors && result.errors.length > 0) {
      console.error(chalk.red.bold('Configuration Parse Error:'));
      console.error('❌ Failed to parse server configuration');
      console.error(`   ${chalk.cyan('Details:')} ${result.errors.join(', ')}`);
      process.exit(1);
    }

    // Display results (including validation errors and warnings)
    const { validationErrors, warnings } = result;
    const totalIssues = validationErrors.length + warnings.length;

    if (totalIssues === 0) {
      console.log(chalk.green.bold('✅ Configuration is valid!'));
      console.log(chalk.green('No errors or warnings found.'));
      process.exit(0);
    }

    // Display summary
    console.log(chalk.bold('📊 Validation Summary:'));
    console.log(chalk.red('Errors:') + ` ${validationErrors.length}`);
    console.log(chalk.yellow('Warnings:') + ` ${warnings.length}`);
    console.log();

    // Display errors first
    if (validationErrors.length > 0) {
      console.log(chalk.red.bold(`🚨 ERRORS (${validationErrors.length}):`));
      console.log(chalk.red('These issues prevent the server from starting properly.\n'));
      
      validationErrors.forEach((error, index) => {
        console.log(`${index + 1}. ${formatIssue(error, true)}`);
      });
    }

    // Display warnings
    if (warnings.length > 0) {
      console.log(chalk.yellow.bold(`⚠️  WARNINGS (${warnings.length}):`));
      console.log(chalk.yellow('These are recommendations for optimal server performance.\n'));
      
      warnings.forEach((warning, index) => {
        console.log(`${index + 1}. ${formatIssue(warning, false)}`);
      });
    }

    // Exit with appropriate code
    const exitCode = validationErrors.length > 0 ? 1 : 0;

    console.log(chalk.bold('✨ Validation complete.'));
    if (exitCode === 0) {
      console.log(chalk.green('Configuration can be used (warnings are recommendations).'));
    } else {
      console.log(chalk.red('Configuration has errors that must be fixed.'));
    }

    process.exit(exitCode);

  } catch (error: any) {
    console.error(chalk.red.bold('Unexpected Error:'));
    console.error(`❌ ${error.message}`);
    
    if (process.env.DEBUG) {
      console.error('\nStack trace:');
      console.error(error.stack);
    }
    
    process.exit(1);
  }
}

// Setup CLI
program
  .name('validate-config')
  .description('Validate Arma Reforger server configuration files')
  .version('1.0.0')
  .argument('<config-file>', 'Path to the server configuration JSON file')
  .option('-d, --debug', 'Enable debug output')
  .action((configFile: string, options: { debug?: boolean }) => {
    if (options.debug) {
      process.env.DEBUG = 'true';
    }
    validateConfigFile(configFile);
  });

program.parse();
