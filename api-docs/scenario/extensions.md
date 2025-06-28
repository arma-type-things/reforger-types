# Scenario Extensions

Extended scenario utilities for metadata, mapping, and enhanced scenario management functionality.

## ScenarioMetadata

Interface for scenario metadata used in display and mapping purposes.

```typescript
interface ScenarioMetadata {
  /** Friendly code used in CLI and user interfaces */
  code: string;
  /** Human-readable display name */
  displayName: string;
  /** Official scenario instance */
  scenario: ScenarioId;
  /** Official scenario key */
  key: OfficialScenarioName;
}
```

### Properties

- **`code`**: String identifier used in command-line interfaces and user-facing APIs
- **`displayName`**: Human-readable name suitable for UI display
- **`scenario`**: The actual ScenarioId instance for this scenario
- **`key`**: The corresponding key from the OfficialScenarios enum

## ScenarioIdExtended

Extended ScenarioId class providing metadata and helper methods for scenario management.

```typescript
class ScenarioIdExtended extends ScenarioId
```

### Static Methods

#### `getScenarioMap()`

Returns the complete scenario metadata map.

```typescript
static getScenarioMap(): Map<string, ScenarioMetadata>
```

**Returns**: Map with scenario codes as keys and ScenarioMetadata as values

**Example**:
```typescript
const scenarioMap = ScenarioIdExtended.getScenarioMap();
console.log(scenarioMap.get('conflict-everon'));
// { code: 'conflict-everon', displayName: 'Conflict Everon', ... }
```

#### `fromCode()`

Creates a ScenarioId from a friendly code string.

```typescript
static fromCode(code: string): ScenarioId | undefined
```

**Parameters**:
- `code`: Friendly scenario code (case-insensitive)

**Returns**: ScenarioId instance or undefined if code not found

**Example**:
```typescript
const scenario = ScenarioIdExtended.fromCode('conflict-everon');
if (scenario) {
  console.log(scenario.toString()); // "{...}scenarios/Conflict_Everon.conf"
}
```

#### `getAllScenarios()`

Returns all available scenario metadata as an array.

```typescript
static getAllScenarios(): ScenarioMetadata[]
```

**Returns**: Array of all scenario metadata objects

**Example**:
```typescript
const allScenarios = ScenarioIdExtended.getAllScenarios();
allScenarios.forEach(scenario => {
  console.log(`${scenario.code}: ${scenario.displayName}`);
});
```

#### `getMetadata()`

Retrieves scenario metadata by code.

```typescript
static getMetadata(code: string): ScenarioMetadata | undefined
```

**Parameters**:
- `code`: Scenario code to look up (case-insensitive)

**Returns**: ScenarioMetadata or undefined if not found

**Example**:
```typescript
const metadata = ScenarioIdExtended.getMetadata('conflict-everon');
if (metadata) {
  console.log(metadata.displayName); // "Conflict Everon"
}
```

#### `mapScenarioName()` (Legacy)

Maps scenario name to ScenarioId for backwards compatibility.

```typescript
static mapScenarioName(scenarioName?: string): ScenarioId | undefined
```

**Parameters**:
- `scenarioName`: Optional scenario name string

**Returns**: ScenarioId instance or undefined

**Note**: This method provides backwards compatibility. Use `fromCode()` for new implementations.

## Available Scenarios

The extension provides metadata for all official scenarios:

- `conflict-everon` - Conflict Everon
- `conflict-northern-everon` - Conflict Northern Everon  
- `conflict-southern-everon` - Conflict Southern Everon
- `conflict-western-everon` - Conflict Western Everon
- `conflict-arland` - Conflict Arland
- `conflict-northern-arland` - Conflict Northern Arland
- `conflict-southern-arland` - Conflict Southern Arland
- `capture-and-hold-everon` - Capture and Hold Everon
- `capture-and-hold-arland` - Capture and Hold Arland
- `game-master` - Game Master

## Usage Examples

### CLI Integration

```typescript
import { ScenarioIdExtended } from '@reforger-types/scenario';

// Get user-friendly scenario list for CLI
function getScenarioChoices() {
  return ScenarioIdExtended.getAllScenarios().map(s => ({
    name: s.displayName,
    value: s.code
  }));
}

// Convert user selection to server config
function buildServerConfig(selectedCode: string) {
  const scenario = ScenarioIdExtended.fromCode(selectedCode);
  return {
    gameHostBindAddress: "0.0.0.0",
    gameHostBindPort: 2001,
    missionHeader: {
      scenarioId: scenario?.toString()
    }
  };
}
```

### Metadata Lookup

```typescript
// Display scenario information
function displayScenarioInfo(code: string) {
  const metadata = ScenarioIdExtended.getMetadata(code);
  if (metadata) {
    console.log(`Scenario: ${metadata.displayName}`);
    console.log(`Code: ${metadata.code}`);
    console.log(`Path: ${metadata.scenario.toString()}`);
  }
}
```

### Migration Helper

```typescript
// Convert old scenario references to new format
function migrateOldConfig(oldScenarioName: string) {
  const scenario = ScenarioIdExtended.mapScenarioName(oldScenarioName);
  return scenario ? scenario.toString() : undefined;
}
```

## See Also

- [Types](./types.md) - Core ScenarioId and mission reference types
- [Defaults](./defaults.md) - Default scenario creation utilities
- [Server Types](../server/types.md) - Server configuration interfaces that use scenarios
