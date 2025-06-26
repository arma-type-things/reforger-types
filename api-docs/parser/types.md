# Parser Module Types

Error types, warning types, and result interfaces for configuration parsing and validation.

## Result Types

### ParseResult

Main result interface returned by parsing operations.

```typescript
interface ParseResult<T> {
  success: boolean;
  data?: T;
  errors: string[];
  warnings: ParserWarning[];
  validationErrors: ParserError[];
}
```

**Properties:**
- `success` - Whether parsing and validation succeeded
- `data` - Parsed and validated configuration object (only present if success is true)
- `errors` - Array of parsing error messages (JSON syntax errors, missing fields)
- `warnings` - Array of validation warnings with context
- `validationErrors` - Array of validation errors with context

### ValidationResult

Result interface from the validation engine.

```typescript
interface ValidationResult {
  errors: ParserError[];
  warnings: ParserWarning[];
}
```

**Properties:**
- `errors` - Array of validation errors that prevent successful configuration
- `warnings` - Array of validation warnings for suboptimal configurations

## Error Types

### ParserError

Detailed error information for validation failures.

```typescript
interface ParserError {
  type: ParserErrorType;
  message: string;
  field?: string;
  value?: unknown;
  validRange?: string;
}
```

**Properties:**
- `type` - Specific error type from ParserErrorType enum
- `message` - Human-readable error description
- `field` - Configuration field that caused the error (optional)
- `value` - The invalid value that caused the error (optional)
- `validRange` - Description of valid values (optional)

### ParserErrorType

Enumeration of hard validation failures that prevent server operation.

```typescript
enum ParserErrorType {
  // RCON errors
  RCON_PASSWORD_TOO_SHORT = 'RCON_PASSWORD_TOO_SHORT',
  RCON_PASSWORD_CONTAINS_SPACES = 'RCON_PASSWORD_CONTAINS_SPACES',
  RCON_INVALID_PERMISSION = 'RCON_INVALID_PERMISSION',
  RCON_MAX_CLIENTS_OUT_OF_RANGE = 'RCON_MAX_CLIENTS_OUT_OF_RANGE',
  
  // Game configuration errors
  GAME_NAME_TOO_LONG = 'GAME_NAME_TOO_LONG',
  ADMIN_PASSWORD_CONTAINS_SPACES = 'ADMIN_PASSWORD_CONTAINS_SPACES',
  ADMINS_LIST_TOO_LONG = 'ADMINS_LIST_TOO_LONG',
  
  // Game properties errors
  SERVER_VIEW_DISTANCE_OUT_OF_RANGE = 'SERVER_VIEW_DISTANCE_OUT_OF_RANGE',
  NETWORK_VIEW_DISTANCE_OUT_OF_RANGE = 'NETWORK_VIEW_DISTANCE_OUT_OF_RANGE',
  GRASS_DISTANCE_INVALID = 'GRASS_DISTANCE_INVALID',
  
  // Operating configuration errors
  SLOT_RESERVATION_TIMEOUT_OUT_OF_RANGE = 'SLOT_RESERVATION_TIMEOUT_OUT_OF_RANGE',
  JOIN_QUEUE_MAX_SIZE_OUT_OF_RANGE = 'JOIN_QUEUE_MAX_SIZE_OUT_OF_RANGE',
  
  // Platform errors
  INVALID_SUPPORTED_PLATFORM = 'INVALID_SUPPORTED_PLATFORM'
}
```

#### RCON Error Types

**RCON_PASSWORD_TOO_SHORT**
- RCON password must be at least 3 characters (if not empty)
- Related to: [RconConfig](../server/types.md#rconconfig)

**RCON_PASSWORD_CONTAINS_SPACES**
- RCON passwords cannot contain spaces
- Related to: [RconConfig](../server/types.md#rconconfig)

**RCON_INVALID_PERMISSION**
- RCON permission must be "admin" or "monitor"
- Related to: [RconConfig](../server/types.md#rconconfig)

**RCON_MAX_CLIENTS_OUT_OF_RANGE**
- RCON maxClients must be between 1-16
- Related to: [RconConfig](../server/types.md#rconconfig)

#### Game Configuration Error Types

**GAME_NAME_TOO_LONG**
- Server name exceeds maximum allowed length
- Related to: [GameConfig](../server/types.md#gameconfig)

**ADMIN_PASSWORD_CONTAINS_SPACES**
- Admin passwords cannot contain spaces
- Related to: [GameConfig](../server/types.md#gameconfig)

**ADMINS_LIST_TOO_LONG**
- Admins list exceeds maximum allowed entries
- Related to: [GameConfig](../server/types.md#gameconfig)

#### Game Properties Error Types

**SERVER_VIEW_DISTANCE_OUT_OF_RANGE**
- Server view distance outside valid range
- Related to: [GameProperties](../server/types.md#gameproperties)

**NETWORK_VIEW_DISTANCE_OUT_OF_RANGE**
- Network view distance outside valid range
- Related to: [GameProperties](../server/types.md#gameproperties)

**GRASS_DISTANCE_INVALID**
- Grass distance has invalid value
- Related to: [GameProperties](../server/types.md#gameproperties)

#### Operating Configuration Error Types

**SLOT_RESERVATION_TIMEOUT_OUT_OF_RANGE**
- Slot reservation timeout outside valid range
- Related to: [OperatingConfig](../server/types.md#operatingconfig)

**JOIN_QUEUE_MAX_SIZE_OUT_OF_RANGE**
- Join queue size outside valid range (0-50)
- Related to: [JoinQueueConfig](../server/types.md#joinqueueconfig)

#### Platform Error Types

**INVALID_SUPPORTED_PLATFORM**
- Invalid platform identifier in supportedPlatforms array
- Valid platforms: [SupportedPlatform](../server/types.md#supportedplatform)

## Warning Types

### ParserWarning

Detailed warning information for suboptimal configurations.

```typescript
interface ParserWarning {
  type: ParserWarningType;
  message: string;
  field?: string;
  value?: unknown;
  recommendedValue?: unknown;
}
```

**Properties:**
- `type` - Specific warning type from ParserWarningType enum
- `message` - Human-readable warning description
- `field` - Configuration field that triggered the warning (optional)
- `value` - The value that triggered the warning (optional)
- `recommendedValue` - Suggested alternative value (optional)

### ParserWarningType

Enumeration of configuration warnings for suboptimal but functional settings.

```typescript
enum ParserWarningType {
  // View distance warnings
  VIEW_DISTANCE_EXCEEDS_RECOMMENDED = 'VIEW_DISTANCE_EXCEEDS_RECOMMENDED',
  VIEW_DISTANCE_EXCEEDS_MAXIMUM = 'VIEW_DISTANCE_EXCEEDS_MAXIMUM',
  VIEW_DISTANCE_BELOW_MINIMUM = 'VIEW_DISTANCE_BELOW_MINIMUM',
  NETWORK_VIEW_DISTANCE_MISMATCH = 'NETWORK_VIEW_DISTANCE_MISMATCH',
  
  // Player count warnings
  PLAYER_COUNT_EXCEEDS_RECOMMENDED = 'PLAYER_COUNT_EXCEEDS_RECOMMENDED',
  
  // Performance warnings
  GRASS_DISTANCE_HIGH_PERFORMANCE_IMPACT = 'GRASS_DISTANCE_HIGH_PERFORMANCE_IMPACT',
  AI_LIMIT_HIGH_PERFORMANCE_IMPACT = 'AI_LIMIT_HIGH_PERFORMANCE_IMPACT',
  
  // Security warnings
  EMPTY_ADMIN_PASSWORD = 'EMPTY_ADMIN_PASSWORD',
  WEAK_RCON_PASSWORD = 'WEAK_RCON_PASSWORD',
  
  // Mod warnings
  INVALID_MOD_ID = 'INVALID_MOD_ID',
  DUPLICATE_MOD_ID = 'DUPLICATE_MOD_ID',
  
  // Configuration warnings
  PUBLIC_ADDRESS_MISMATCH = 'PUBLIC_ADDRESS_MISMATCH',
  PORT_CONFLICT = 'PORT_CONFLICT'
}
```

#### Performance Warning Types

**VIEW_DISTANCE_EXCEEDS_RECOMMENDED**
- View distance above recommended maximum may impact performance
- Related to: [GameProperties](../server/types.md#gameproperties)

**VIEW_DISTANCE_EXCEEDS_MAXIMUM**
- View distance above absolute maximum threshold
- Related to: [GameProperties](../server/types.md#gameproperties)

**VIEW_DISTANCE_BELOW_MINIMUM**
- View distance below minimum recommended value
- Related to: [GameProperties](../server/types.md#gameproperties)

**NETWORK_VIEW_DISTANCE_MISMATCH**
- Network view distance should be ~90% of server view distance
- Related to: [GameProperties](../server/types.md#gameproperties)

**PLAYER_COUNT_EXCEEDS_RECOMMENDED**
- Player count above recommended maximum may impact performance
- Related to: [GameConfig](../server/types.md#gameconfig)

**GRASS_DISTANCE_HIGH_PERFORMANCE_IMPACT**
- High grass distance may significantly impact server performance
- Related to: [GameProperties](../server/types.md#gameproperties)

**AI_LIMIT_HIGH_PERFORMANCE_IMPACT**
- High AI limit may significantly impact server performance
- Related to: [OperatingConfig](../server/types.md#operatingconfig)

#### Security Warning Types

**EMPTY_ADMIN_PASSWORD**
- Admin password is empty, allowing unrestricted admin access
- Related to: [GameConfig](../server/types.md#gameconfig)

**WEAK_RCON_PASSWORD**
- RCON password is weak or easily guessable
- Related to: [RconConfig](../server/types.md#rconconfig)

#### Mod Warning Types

**INVALID_MOD_ID**
- Mod ID format is invalid (not 16-character hexadecimal)
- Related to: [Mod](../server/types.md#mod)

**DUPLICATE_MOD_ID**
- Same mod ID appears multiple times in the mod list
- Related to: [Mod](../server/types.md#mod)

#### Configuration Warning Types

**PUBLIC_ADDRESS_MISMATCH**
- Public address differs from bind address configuration
- Related to: [ServerConfig](../server/types.md#serverconfig)

**PORT_CONFLICT**
- Potential port conflicts detected in configuration
- Related to: [ServerConfig](../server/types.md#serverconfig)

## Usage Examples

### Handling Parse Results

```typescript
import { parse, ParserErrorType, ParserWarningType } from 'reforger-types';

const result = parse(configObject);

if (result.success) {
  console.log('✅ Configuration is valid');
  console.log(`Server: ${result.data!.game.name}`);
  
  // Handle warnings
  if (result.warnings.length > 0) {
    console.log('⚠️ Warnings:');
    result.warnings.forEach(warning => {
      console.log(`  ${warning.type}: ${warning.message}`);
    });
  }
} else {
  console.log('❌ Configuration is invalid');
  
  // Handle parsing errors
  if (result.errors.length > 0) {
    console.log('Parse errors:');
    result.errors.forEach(error => console.log(`  ${error}`));
  }
  
  // Handle validation errors
  if (result.validationErrors.length > 0) {
    console.log('Validation errors:');
    result.validationErrors.forEach(error => {
      console.log(`  ${error.type}: ${error.message}`);
      if (error.field) console.log(`    Field: ${error.field}`);
      if (error.validRange) console.log(`    Valid range: ${error.validRange}`);
    });
  }
}
```

### Filtering Specific Warnings

```typescript
import { parse, ParserWarningType } from 'reforger-types';

const result = parse(configObject, {
  validate: true,
  ignore_warnings: [
    ParserWarningType.EMPTY_ADMIN_PASSWORD,
    ParserWarningType.VIEW_DISTANCE_EXCEEDS_RECOMMENDED
  ]
});
```

### Type-Safe Error Handling

```typescript
import { parse, ParserErrorType } from 'reforger-types';

const result = parse(configObject);

if (!result.success) {
  const rconErrors = result.validationErrors.filter(error => 
    error.type === ParserErrorType.RCON_PASSWORD_TOO_SHORT ||
    error.type === ParserErrorType.RCON_PASSWORD_CONTAINS_SPACES
  );
  
  if (rconErrors.length > 0) {
    console.log('RCON configuration needs attention:');
    rconErrors.forEach(error => console.log(`  ${error.message}`));
  }
}
```
