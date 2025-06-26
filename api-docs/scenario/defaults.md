# Scenario Module Defaults

Default scenario creation utilities and helper functions for mission resource references.

## Creation Functions

### createDefaultScenarioId

Creates a default scenario ID using the main Everon Conflict scenario.

```typescript
function createDefaultScenarioId(): ScenarioId
```

**Returns:** ScenarioId for the default Everon Conflict scenario

Provides a commonly used scenario for server configuration with balanced gameplay and performance.

### createScenarioId

Creates a scenario ID from individual components.

```typescript
function createScenarioId(
  resourceId: MissionResourceId, 
  missionPath: MissionPath
): ScenarioId
```

**Parameters:**
- `resourceId` - Mission resource identifier (16-character hex string)
- `missionPath` - Relative path to mission configuration file

**Returns:** ScenarioId object for the specified scenario

### parseScenarioId

Parses a scenario ID from string format with validation.

```typescript
function parseScenarioId(scenarioString: string): ScenarioId
```

**Parameters:**
- `scenarioString` - String in format `"{ResourceId}Path"`

**Returns:** Validated ScenarioId object

## Usage Examples

### Default Scenario

```typescript
import { createDefaultScenarioId } from 'reforger-types';

const scenario = createDefaultScenarioId();
// Use in server configuration
const gameConfig = {
  scenarioId: scenario.toString(),
  // ... other config
};
```

### Custom Scenario

```typescript
import { createScenarioId } from 'reforger-types';

const customScenario = createScenarioId(
  "ABCD1234EFGH5678", 
  "MyMod/CustomMission.conf"
);
```

### String Parsing

```typescript
import { parseScenarioId } from 'reforger-types';

const parsed = parseScenarioId("{ECC61978EDCC2B5A}Missions/23_Campaign.conf");
console.log(parsed.resourceId); // "ECC61978EDCC2B5A"
console.log(parsed.path);       // "Missions/23_Campaign.conf"
```
