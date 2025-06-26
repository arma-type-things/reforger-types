# Scenario Module Types

Mission resource reference types and classes for handling scenario identifiers in server configuration.

## Core Types

### MissionResourceId

String type representing a mission resource identifier.

```typescript
type MissionResourceId = string;
```

Typically a 16-character hexadecimal identifier for mission resources.

### MissionPath

String type representing a relative path within a mission resource.

```typescript
type MissionPath = string;
```

Path to mission configuration files within the resource structure.

### ScenarioId

Alias for MissionResourceReference, used specifically for scenario identification in [GameConfig](../server/types.md#gameconfig).

```typescript
type ScenarioId = MissionResourceReference;
```

## Reference Classes

### MissionResourceReference

Composite class for mission resource references combining resource ID and path.

```typescript
class MissionResourceReference {
  constructor(resourceId: MissionResourceId, path: MissionPath)
  
  get resourceId(): MissionResourceId
  get path(): MissionPath
  
  toString(): string
  static fromString(resourceString: string): MissionResourceReference
}
```

#### Methods

**toString()**
- Converts to string format: `"{ResourceId}Path"`
- Used in [GameConfig](../server/types.md#gameconfig) scenarioId field

**fromString(resourceString)**
- Parses string format back to MissionResourceReference
- Validates format and extracts components

## Constants

### OfficialScenarios

Collection of official Arma Reforger scenario references.

```typescript
const OfficialScenarios = {
  CONFLICT_EVERON: ScenarioId;
  // Additional official scenarios...
}
```

Common scenarios provided by the base game for immediate use in server configuration.
