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

    // Display summary banner with right-aligned title
    const summaryContent = `Errors: ${result.errors.length}\nWarnings: ${result.warnings.length}`;
    this.layout.printBanner(summaryContent, undefined, {
      title: '📊 Validation Summary',
      titleAlignment: 'right',
      textAlign: 'left'
    });
    this.layout.printLine();

    // Display errors in error banner
    if (result.hasErrors) {
      const errorContent = this.formatIssuesForBanner(result.errors, true);
      const errorDescription = 'These issues prevent the server from starting properly.\n\n';
      this.layout.printErrorBanner(
        errorDescription + errorContent,
        `ERRORS (${result.errors.length})`
      );
      this.layout.printLine();
    }

    // Display warnings in warning banner
    if (result.hasWarnings) {
      const warningContent = this.formatIssuesForBanner(result.warnings, false);
      const warningDescription = 'These are recommendations for optimal server performance.\n\n';
      this.layout.printWarningBanner(
        warningDescription + warningContent,
        `WARNINGS (${result.warnings.length})`
      );
      this.layout.printLine();
    }

    // Final status
    this.layout.printMixed({ text: '✨ Validation complete.', colorKey: 'bodyColor' });
    
    if (result.success) {
      this.layout.printMixed({ text: 'Configuration can be used (warnings are recommendations).', colorKey: 'successColor' });
    } else {
      this.layout.printMixed({ text: 'Configuration has errors that must be fixed.', colorKey: 'errorColor' });
    }
  }

  /**
   * Format validation issues for display in banners
   */
  private formatIssuesForBanner(issues: (ParserError | ParserWarning)[], isError: boolean): string {
    return issues.map((issue, index) => {
      let formatted = `${index + 1}. ${issue.message}`;
      
      if (issue.field) {
        formatted += `\n   Field: ${issue.field}`;
      }
      
      if (issue.value !== undefined) {
        formatted += `\n   Value: ${JSON.stringify(issue.value)}`;
      }
      
      // ParserError has validRange, ParserWarning has recommendedValue
      if (isError && 'validRange' in issue && issue.validRange) {
        formatted += `\n   Valid Range: ${issue.validRange}`;
      }
      
      if (!isError && 'recommendedValue' in issue && issue.recommendedValue !== undefined) {
        formatted += `\n   Recommended: ${JSON.stringify(issue.recommendedValue)}`;
      }
      
      return formatted;
    }).join('\n\n');
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
      this.layout.printBrandedBanner('Config Validator');
      this.layout.printLine();
      
      this.layout.printMixed({ text: '🔍 Validating Arma Reforger server configuration...', colorKey: 'bodyColor' });
      this.layout.printLabelValue('File: ', path.resolve(configPath));
      this.layout.printLine();
      
      // Show error in banner format
      this.layout.printErrorBanner(
        error.message,
        'VALIDATION ERROR'
      );
      
      if (process.env.DEBUG) {
        this.layout.printLine();
        this.layout.printMixed({ text: 'Stack trace:', colorKey: 'bodyColor' });
        this.layout.printError(error.stack);
      }
      
      process.exit(1);
    }
  }
}
