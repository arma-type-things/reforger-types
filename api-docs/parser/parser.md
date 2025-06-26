# Parser Module Parser

Main Parser class and convenience functions for parsing and validating Arma Reforger server configurations.

## Parser Class

### Parser

Primary class for parsing JSON strings or objects into validated [ServerConfig](../server/types.md#serverconfig) objects.

```typescript
class Parser {
  parse(
    input: string | object | unknown,
    options?: {
      validate?: boolean;
      ignore_warnings?: string[];
      ignore_errors?: string[];
    }
  ): ParseResult<ServerConfig>
}
```

**Methods:**

#### parse

Parses and validates an Arma Reforger server configuration.

```typescript
parse(
  input: string | object | unknown,
  options?: {
    validate?: boolean;
    ignore_warnings?: string[];
    ignore_errors?: string[];
  }
): ParseResult<ServerConfig>
```

**Parameters:**
- `input` - Configuration to parse (JSON string, object, or unknown type)
- `options` - Optional parsing and validation configuration
  - `validate` - Whether to perform business logic validation (default: `true`)
  - `ignore_warnings` - Array of warning types to ignore during validation
  - `ignore_errors` - Array of error types to ignore during validation

**Returns:** [ParseResult](./types.md#parseresult) containing success status, parsed data, errors, and warnings

**Processing Steps:**
1. **JSON Parsing** - Converts string input to JavaScript object (if needed)
2. **Structure Validation** - Verifies required fields are present
3. **Range Validation** - Checks numeric values are within valid ranges
4. **Business Logic Validation** - Applies game-specific validation rules (if enabled)
5. **Error/Warning Filtering** - Removes ignored error and warning types

## Convenience Functions

### parse

Convenience function that provides a simple interface to the Parser class.

```typescript
function parse(
  input: string | object | unknown,
  options?: {
    validate?: boolean;
    ignore_warnings?: string[];
    ignore_errors?: string[];
  }
): ParseResult<ServerConfig>
```

**Parameters:** Same as Parser.parse method

**Returns:** [ParseResult](./types.md#parseresult) from the default Parser instance

This function uses a singleton Parser instance and is the recommended approach for most use cases.

### parser

Default Parser instance exported for direct use.

```typescript
const parser: Parser
```

Singleton instance that can be used directly if needed, though the `parse` convenience function is recommended.

## Validation Phases

### Structure Validation

Basic "quack check" to ensure the input looks like a [ServerConfig](../server/types.md#serverconfig):
- Verifies required top-level properties exist
- Checks data types are appropriate
- Ensures nested objects are present

**Required top-level properties:**
- `bindAddress`
- `bindPort` 
- `a2s`
- `rcon`
- `game`
- `operating`

### Range Validation

Validates numeric values are within acceptable ranges:
- **Port numbers** - Must be between 1024-65535
- **Player count** - Must be between 1-128
- Other structural constraints

### Business Logic Validation

Advanced validation using the [Validator](./validator.md) class (when `validate: true`):
- Performance impact warnings
- Security configuration checks
- Best practice recommendations
- Game-specific rule enforcement

## Usage Examples

### Basic Parsing

```typescript
import { parse } from 'reforger-types';

const configString = `{
  "bindAddress": "0.0.0.0",
  "bindPort": 2001,
  "game": { "name": "My Server" },
  ...
}`;

const result = parse(configString);

if (result.success) {
  console.log('✅ Configuration is valid');
  console.log(`Server: ${result.data!.game.name}`);
} else {
  console.log('❌ Configuration has errors');
  result.errors.forEach(error => console.log(`  ${error}`));
}
```

### Advanced Parsing with Options

```typescript
import { parse, ParserWarningType, ParserErrorType } from 'reforger-types';

const result = parse(configObject, {
  validate: true,
  ignore_warnings: [
    ParserWarningType.EMPTY_ADMIN_PASSWORD,
    ParserWarningType.VIEW_DISTANCE_EXCEEDS_RECOMMENDED
  ],
  ignore_errors: [
    ParserErrorType.RCON_PASSWORD_TOO_SHORT
  ]
});

// Handle the result with filtered warnings/errors
if (result.success) {
  console.log('Configuration valid (with filtered issues)');
} else {
  console.log('Configuration has critical errors:');
  result.validationErrors.forEach(error => {
    console.log(`  ${error.type}: ${error.message}`);
  });
}
```

### Using Parser Instance Directly

```typescript
import { Parser } from 'reforger-types';

const parser = new Parser();

// Parse without validation
const quickResult = parser.parse(configObject, { validate: false });

// Parse with full validation
const fullResult = parser.parse(configObject, { validate: true });

// Reuse parser for multiple configurations
const configs = [config1, config2, config3];
const results = configs.map(config => parser.parse(config));
```

### Development vs Production Parsing

```typescript
import { parse } from 'reforger-types';

// Development: Lenient parsing with warnings only
const devResult = parse(configObject, {
  validate: true,
  ignore_errors: [
    'RCON_PASSWORD_TOO_SHORT',
    'EMPTY_ADMIN_PASSWORD'
  ]
});

// Production: Strict parsing
const prodResult = parse(configObject, {
  validate: true,
  ignore_warnings: [],
  ignore_errors: []
});

if (process.env.NODE_ENV === 'production' && !prodResult.success) {
  throw new Error('Invalid production configuration');
}
```

### Error Categorization

```typescript
import { parse } from 'reforger-types';

const result = parse(configObject);

if (!result.success) {
  // Categorize different types of errors
  const jsonErrors = result.errors; // JSON parsing, structure issues
  const validationErrors = result.validationErrors; // Business logic violations
  
  console.log('JSON/Structure Errors:');
  jsonErrors.forEach(error => console.log(`  ${error}`));
  
  console.log('Validation Errors:');
  validationErrors.forEach(error => {
    console.log(`  ${error.type}: ${error.message}`);
    if (error.field) console.log(`    Field: ${error.field}`);
    if (error.validRange) console.log(`    Valid range: ${error.validRange}`);
  });
}

// Always check warnings, even on success
if (result.warnings.length > 0) {
  console.log('Configuration Warnings:');
  result.warnings.forEach(warning => {
    console.log(`  ${warning.type}: ${warning.message}`);
    if (warning.recommendedValue !== undefined) {
      console.log(`    Recommended: ${warning.recommendedValue}`);
    }
  });
}
```

### Custom Validation Workflow

```typescript
import { Parser } from 'reforger-types';

class CustomServerConfigParser extends Parser {
  parseWithCustomRules(input: string | object) {
    // First, do standard parsing without validation
    const basicResult = this.parse(input, { validate: false });
    
    if (!basicResult.success) {
      return basicResult; // Return early if basic parsing failed
    }
    
    // Apply custom business rules
    const customWarnings = this.applyCustomRules(basicResult.data!);
    
    // Combine with standard validation
    const fullResult = super.parse(input, { validate: true });
    
    return {
      ...fullResult,
      warnings: [...fullResult.warnings, ...customWarnings]
    };
  }
  
  private applyCustomRules(config: ServerConfig): ParserWarning[] {
    const warnings: ParserWarning[] = [];
    
    // Example: Custom organization rules
    if (config.game.name.includes('Test')) {
      warnings.push({
        type: 'CUSTOM_WARNING' as any,
        message: 'Server name contains "Test" - consider a production name',
        field: 'game.name'
      });
    }
    
    return warnings;
  }
}
```
