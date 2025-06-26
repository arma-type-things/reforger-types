# Server Module Defaults

Default initializer functions for creating server configuration objects with sensible defaults.

## Configuration Creation Functions

### createDefaultServerConfig

Creates a complete server configuration with all required sections and sensible defaults.

```typescript
function createDefaultServerConfig(
  serverName: string, 
  scenarioId: string, 
  bindPort: number = 2001
): ServerConfig
```

**Parameters:**
- `serverName` - Display name for the server
- `scenarioId` - Mission/scenario identifier to run
- `bindPort` - Main server port (default: 2001)

**Returns:** Complete `ServerConfig` object with all sections configured

**Automatic port allocation:**
- A2S port: `bindPort + 1`
- RCON port: `bindPort + 2`

### createDefaultGameConfig

Creates game section configuration with common settings.

```typescript
function createDefaultGameConfig(
  serverName: string, 
  scenarioId: string
): GameConfig
```

**Parameters:**
- `serverName` - Display name for the server
- `scenarioId` - Mission/scenario identifier to run

**Returns:** `GameConfig` with default game settings including cross-platform support and empty mod list

### createDefaultGameProperties

Creates game properties section with performance and behavior defaults.

```typescript
function createDefaultGameProperties(): GameProperties
```

**Returns:** `GameProperties` with optimized view distances, BattlEye enabled, and default mission header

## Network Configuration Functions

### createDefaultA2SConfig

Creates A2S (Steam Query) configuration for server browser visibility.

```typescript
function createDefaultA2SConfig(basePort: number): A2SConfig
```

**Parameters:**
- `basePort` - Main server port (A2S will use `basePort + 1`)

**Returns:** `A2SConfig` bound to all interfaces on the calculated port

### createDefaultRconConfig

Creates RCON (Remote Console) configuration for server administration.

```typescript
function createDefaultRconConfig(basePort: number, password: string = ""): RconConfig
```

**Parameters:**
- `basePort` - Main server port (RCON will use `basePort + 2`)
- `password` - RCON password (empty string disables RCON)

**Returns:** `RconConfig` bound to localhost with admin permissions

## Operating Configuration Functions

### createDefaultOperatingConfig

Creates operational settings for server performance and behavior.

```typescript
function createDefaultOperatingConfig(): OperatingConfig
```

**Returns:** `OperatingConfig` with balanced settings for typical server operation

## Mission Configuration Functions

### createDefaultMissionHeader

Creates default mission header properties for scenario customization.

```typescript
function createDefaultMissionHeader(): MissionHeader
```

**Returns:** `MissionHeader` with placeholder mission name, author, and save file properties

## Usage Examples

### Quick Server Setup

```typescript
import { createDefaultServerConfig } from 'reforger-types';

const config = createDefaultServerConfig(
  "My Arma Server", 
  "{ECC61978EDCC2B5A}Missions/23_Campaign.conf"
);
```

### Custom Port Configuration

```typescript
import { createDefaultServerConfig } from 'reforger-types';

const config = createDefaultServerConfig(
  "Custom Port Server", 
  "{ECC61978EDCC2B5A}Missions/23_Campaign.conf",
  3001  // Main port 3001, A2S: 3002, RCON: 3003
);
```

### Component-by-Component Setup

```typescript
import { 
  createDefaultGameConfig,
  createDefaultOperatingConfig,
  createDefaultA2SConfig,
  createDefaultRconConfig 
} from 'reforger-types';

const game = createDefaultGameConfig("My Server", "scenario-id");
const operating = createDefaultOperatingConfig();
const a2s = createDefaultA2SConfig(2001);
const rcon = createDefaultRconConfig(2001, "mypassword");

const config: ServerConfig = {
  bindAddress: "0.0.0.0",
  bindPort: 2001,
  publicAddress: "",
  publicPort: 2001,
  game,
  operating,
  a2s,
  rcon
};
```
