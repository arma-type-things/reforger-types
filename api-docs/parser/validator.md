# Parser Module Validator

Business logic validation engine for Arma Reforger server configurations, implementing game-specific rules and best practices.

## Validator Class

### Validator

Core validation engine that applies business logic rules to server configurations.

```typescript
class Validator {
  validate(config: ServerConfig): ValidationResult
}
```

**Methods:**

#### validate

Validates a server configuration and returns detailed error and warning information.

```typescript
validate(config: ServerConfig): ValidationResult
```

**Parameters:**
- `config` - [ServerConfig](../server/types.md#serverconfig) object to validate

**Returns:** [ValidationResult](./types.md#validationresult) containing arrays of errors and warnings

**Validation Process:**
1. **Hard Requirements** - Critical issues that prevent server operation
2. **Configuration Warnings** - Suboptimal settings that may impact performance or security

## Validation Categories

### Hard Requirements Validation

Critical validation that produces [ParserError](./types.md#parsererror) objects:

#### RCON Validation
- **Password Length** - Must be at least 3 characters if provided
- **Password Format** - Cannot contain spaces
- **Permission Values** - Must be "admin" or "monitor"
- **Client Limits** - maxClients must be between 1-16

#### Game Configuration Validation
- **Server Name Length** - Must not exceed maximum allowed length
- **Admin Password Format** - Cannot contain spaces if provided
- **Admins List Size** - Cannot exceed maximum entries

#### Game Properties Validation
- **View Distance Ranges** - Server and network view distances must be within valid ranges
- **Grass Distance** - Must be a valid positive number

#### Operating Configuration Validation
- **Slot Reservation Timeout** - Must be within valid range
- **Join Queue Size** - Must be between 0-50

#### Platform Validation
- **Supported Platforms** - All entries must be valid [SupportedPlatform](../server/types.md#supportedplatform) values

### Configuration Warnings

Non-critical issues that produce [ParserWarning](./types.md#parserwarning) objects:

#### Performance Warnings
- **View Distance Impact** - Warns when distances exceed recommended thresholds
- **Player Count Impact** - High player counts may affect performance
- **Grass Distance Impact** - High grass distances impact rendering performance
- **AI Limit Impact** - High AI limits may impact server performance

#### Security Warnings
- **Empty Admin Password** - Admin access without password protection
- **Weak RCON Password** - RCON passwords that are easily guessable

#### Mod Warnings
- **Invalid Mod IDs** - Mod IDs that don't match the 16-character hexadecimal format
- **Duplicate Mods** - Same mod appearing multiple times in the mod list

#### Network Warnings
- **Address Mismatches** - Public and bind address configuration inconsistencies
- **Port Conflicts** - Potential conflicts between server, A2S, and RCON ports

## Validation Rules Reference

### View Distance Validation Rules

Based on [VALIDATION_CONSTANTS](./constants.md#view_distance):

**Server View Distance:**
- **Minimum Warning:** < 500m - May provide poor gameplay experience
- **Performance Warning:** > 2500m - May impact server performance
- **Maximum Error:** > 10000m - Exceeds game engine limits

**Network View Distance:**
- **Optimization Warning:** Should be ~90% of server view distance
- **Range Error:** Must be within valid networking bounds

### Player Count Validation Rules

Based on [VALIDATION_CONSTANTS](./constants.md#player_count):

**Maximum Players:**
- **Performance Warning:** > 96 players - May impact server performance
- **Hard Limit Error:** > 128 players - Exceeds game engine maximum

### Security Validation Rules

**Admin Password:**
- **Security Warning:** Empty password allows unrestricted admin access
- **Format Error:** Cannot contain spaces

**RCON Password:**
- **Minimum Length Error:** Must be at least 3 characters if provided
- **Format Error:** Cannot contain spaces
- **Security Warning:** Simple passwords are easily guessable

### Performance Validation Rules

Based on [VALIDATION_CONSTANTS](./constants.md):

**Grass Distance:**
- **Performance Warning:** > 100m may significantly impact performance

**AI Limit:**
- **Performance Warning:** > 80 entities may significantly impact performance

## Usage Examples

### Direct Validator Usage

```typescript
import { Validator } from 'reforger-types';

const validator = new Validator();
const result = validator.validate(serverConfig);

if (result.errors.length > 0) {
  console.log('Configuration has critical errors:');
  result.errors.forEach(error => {
    console.log(`  ${error.type}: ${error.message}`);
    if (error.field) console.log(`    Field: ${error.field}`);
    if (error.validRange) console.log(`    Valid range: ${error.validRange}`);
  });
}

if (result.warnings.length > 0) {
  console.log('Configuration warnings:');
  result.warnings.forEach(warning => {
    console.log(`  ${warning.type}: ${warning.message}`);
    if (warning.recommendedValue !== undefined) {
      console.log(`    Recommended: ${warning.recommendedValue}`);
    }
  });
}
```

### Validation Through Parser

```typescript
import { parse } from 'reforger-types';

// Validator is automatically used when validate: true (default)
const result = parse(configObject, { validate: true });

// Access validation results
console.log('Validation Errors:', result.validationErrors);
console.log('Validation Warnings:', result.warnings);
```

### Error-Specific Handling

```typescript
import { Validator, ParserErrorType, ParserWarningType } from 'reforger-types';

const validator = new Validator();
const result = validator.validate(config);

// Handle specific error types
const rconErrors = result.errors.filter(error => 
  error.type.startsWith('RCON_')
);

const performanceWarnings = result.warnings.filter(warning =>
  warning.type === ParserWarningType.VIEW_DISTANCE_EXCEEDS_RECOMMENDED ||
  warning.type === ParserWarningType.PLAYER_COUNT_EXCEEDS_RECOMMENDED
);

if (rconErrors.length > 0) {
  console.log('RCON configuration needs attention:');
  rconErrors.forEach(error => console.log(`  ${error.message}`));
}

if (performanceWarnings.length > 0) {
  console.log('Performance optimizations recommended:');
  performanceWarnings.forEach(warning => console.log(`  ${warning.message}`));
}
```

### Custom Validation Extension

```typescript
import { Validator, ValidationResult } from 'reforger-types';

class ExtendedValidator extends Validator {
  validate(config: ServerConfig): ValidationResult {
    // Get standard validation results
    const standardResult = super.validate(config);
    
    // Add custom validation rules
    const customWarnings = this.validateCustomRules(config);
    
    return {
      errors: standardResult.errors,
      warnings: [...standardResult.warnings, ...customWarnings]
    };
  }
  
  private validateCustomRules(config: ServerConfig): ParserWarning[] {
    const warnings: ParserWarning[] = [];
    
    // Example: Organization-specific rules
    if (!config.game.name.includes('Organization')) {
      warnings.push({
        type: 'CUSTOM_NAMING' as any,
        message: 'Server name should include organization identifier',
        field: 'game.name',
        recommendedValue: `Organization - ${config.game.name}`
      });
    }
    
    // Example: Environment-specific rules
    if (config.bindPort === 2001 && process.env.NODE_ENV === 'production') {
      warnings.push({
        type: 'PRODUCTION_PORT' as any,
        message: 'Consider using non-default port for production servers',
        field: 'bindPort',
        value: config.bindPort
      });
    }
    
    return warnings;
  }
}
```

### Validation Result Analysis

```typescript
import { Validator, ParserErrorType, ParserWarningType } from 'reforger-types';

function analyzeConfiguration(config: ServerConfig) {
  const validator = new Validator();
  const result = validator.validate(config);
  
  const analysis = {
    isValid: result.errors.length === 0,
    criticalIssues: result.errors.length,
    warnings: result.warnings.length,
    categories: {
      security: 0,
      performance: 0,
      network: 0,
      mods: 0
    }
  };
  
  // Categorize warnings
  result.warnings.forEach(warning => {
    if (warning.type.includes('PASSWORD') || warning.type.includes('ADMIN')) {
      analysis.categories.security++;
    } else if (warning.type.includes('VIEW_DISTANCE') || warning.type.includes('PLAYER_COUNT')) {
      analysis.categories.performance++;
    } else if (warning.type.includes('ADDRESS') || warning.type.includes('PORT')) {
      analysis.categories.network++;
    } else if (warning.type.includes('MOD')) {
      analysis.categories.mods++;
    }
  });
  
  return analysis;
}

const analysis = analyzeConfiguration(myConfig);
console.log(`Configuration Analysis:
  Valid: ${analysis.isValid}
  Critical Issues: ${analysis.criticalIssues}
  Warnings: ${analysis.warnings}
  Security Issues: ${analysis.categories.security}
  Performance Issues: ${analysis.categories.performance}
  Network Issues: ${analysis.categories.network}
  Mod Issues: ${analysis.categories.mods}`);
```

### Selective Validation

```typescript
import { Validator } from 'reforger-types';

class SelectiveValidator extends Validator {
  validateSecurity(config: ServerConfig) {
    const result = this.validate(config);
    
    return {
      errors: result.errors.filter(error => 
        error.type.includes('PASSWORD') || 
        error.type.includes('ADMIN')
      ),
      warnings: result.warnings.filter(warning =>
        warning.type.includes('PASSWORD') ||
        warning.type.includes('ADMIN') ||
        warning.type === ParserWarningType.EMPTY_ADMIN_PASSWORD
      )
    };
  }
  
  validatePerformance(config: ServerConfig) {
    const result = this.validate(config);
    
    return {
      errors: result.errors.filter(error =>
        error.type.includes('VIEW_DISTANCE') ||
        error.type.includes('GRASS')
      ),
      warnings: result.warnings.filter(warning =>
        warning.type.includes('VIEW_DISTANCE') ||
        warning.type.includes('PLAYER_COUNT') ||
        warning.type.includes('PERFORMANCE')
      )
    };
  }
}
```
