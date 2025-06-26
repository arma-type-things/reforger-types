import * as fs from 'fs';
import * as path from 'path';
import { parse, type ParserError, type ParserWarning } from 'reforger-types';
import { LayoutManager } from './layout.js';

export interface ValidationResult {
  success: boolean;
  errors: ParserError[];
  warnings: ParserWarning[];
  hasErrors: boolean;
  hasWarnings: boolean;
}

export class ConfigValidator {
  private layout: LayoutManager;

  constructor() {
    this.layout = new LayoutManager();
  }

  /**
   * Validate a configuration file and return structured results
   */
  async validateFile(configPath: string): Promise<ValidationResult> {
    // Check if file exists
    if (!fs.existsSync(configPath)) {
      throw new Error(`Configuration file not found: ${configPath}`);
    }

    try {
      // Read and parse the JSON file
      const configContent = fs.readFileSync(configPath, 'utf8');
      let configData: any;

      try {
        configData = JSON.parse(configContent);
      } catch (jsonError: any) {
        throw new Error(`Invalid JSON format: ${jsonError.message}`);
      }

      // Parse with our validator
      const result = parse(configData, { validate: true });

      // Check for basic parsing errors (not validation errors)
      if (!result.success && result.errors && result.errors.length > 0) {
        throw new Error(`Failed to parse server configuration: ${result.errors.join(', ')}`);
      }

      const { validationErrors = [], warnings = [] } = result;
      
      return {
        success: validationErrors.length === 0,
        errors: validationErrors,
        warnings: warnings,
        hasErrors: validationErrors.length > 0,
        hasWarnings: warnings.length > 0
      };

    } catch (error: any) {
      throw new Error(`Validation failed: ${error.message}`);
    }
  }

  /**
   * Format and display validation results using the layout manager
   */
  displayResults(result: ValidationResult, configPath: string): void {
    this.layout.printBrandedBanner('Config Validator');
    this.layout.printLine();
    
    this.layout.printMixed({ text: '🔍 Validating Arma Reforger server configuration...', colorKey: 'bodyColor' });
    this.layout.printLabelValue('File: ', path.resolve(configPath));
    this.layout.printLine();

    const totalIssues = result.errors.length + result.warnings.length;

    if (totalIssues === 0) {
      this.layout.printSuccessBox('✅ Configuration is valid!\nNo errors or warnings found.');
      return;
    }

    // Display summary
    this.layout.printSectionHeader('📊 Validation Summary');
    this.layout.printLabelValue('Errors: ', result.errors.length.toString());
    this.layout.printLabelValue('Warnings: ', result.warnings.length.toString());
    this.layout.printLine();

    // Display errors first
    if (result.hasErrors) {
      this.layout.printWithPrefix('🚨 ERRORS ', `(${result.errors.length}):`, 'errorColor', 'errorColor');
      this.layout.printMixed({ text: 'These issues prevent the server from starting properly.', colorKey: 'errorColor' });
      this.layout.printLine();
      
      result.errors.forEach((error, index) => {
        this.displayIssue(error, index + 1, true);
      });
    }

    // Display warnings
    if (result.hasWarnings) {
      this.layout.printWithPrefix('⚠️  WARNINGS ', `(${result.warnings.length}):`, 'valueColor', 'valueColor');
      this.layout.printMixed({ text: 'These are recommendations for optimal server performance.', colorKey: 'dimColor' });
      this.layout.printLine();
      
      result.warnings.forEach((warning, index) => {
        this.displayIssue(warning, index + 1, false);
      });
    }

    // Final status
    this.layout.printLine();
    this.layout.printMixed({ text: '✨ Validation complete.', colorKey: 'bodyColor' });
    
    if (result.success) {
      this.layout.printMixed({ text: 'Configuration can be used (warnings are recommendations).', colorKey: 'successColor' });
    } else {
      this.layout.printMixed({ text: 'Configuration has errors that must be fixed.', colorKey: 'errorColor' });
    }
  }

  /**
   * Format and display a single validation issue
   */
  private displayIssue(issue: ParserError | ParserWarning, index: number, isError: boolean): void {
    const icon = isError ? '❌' : '⚠️';
    const typeLabel = isError ? 'ERROR' : 'WARNING';
    
    this.layout.printWithPrefix(`${index}. ${icon} `, `${typeLabel}: ${issue.message}`, 
      isError ? 'errorColor' : 'valueColor', 'bodyColor');
    
    if (issue.field) {
      this.layout.printLabelValue('   Field: ', issue.field);
    }
    
    if (issue.value !== undefined) {
      this.layout.printLabelValue('   Value: ', JSON.stringify(issue.value));
    }
    
    // ParserError has validRange, ParserWarning has recommendedValue
    if (isError && 'validRange' in issue && issue.validRange) {
      this.layout.printLabelValue('   Valid Range: ', issue.validRange);
    }
    
    if (!isError && 'recommendedValue' in issue && issue.recommendedValue !== undefined) {
      this.layout.printLabelValue('   Recommended: ', JSON.stringify(issue.recommendedValue));
    }
    
    this.layout.printLine();
  }

  /**
   * Run validation and exit with appropriate code (for CLI usage)
   */
  async validateAndExit(configPath: string): Promise<void> {
    try {
      const result = await this.validateFile(configPath);
      this.displayResults(result, configPath);
      
      const exitCode = result.hasErrors ? 1 : 0;
      process.exit(exitCode);
      
    } catch (error: any) {
      this.layout.printError(`❌ ${error.message}`);
      
      if (process.env.DEBUG) {
        this.layout.printError('\nStack trace:');
        this.layout.printError(error.stack);
      }
      
      process.exit(1);
    }
  }
}
