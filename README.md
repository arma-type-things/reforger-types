# Reforger Types

TypeScript definitions for Arma Reforger server configuration.

## Installation

```bash
npm install reforger-types
```

## Usage

### TypeScript with Default Initializers (Easiest)

```typescript
import { createDefaultServerConfig, servers } from 'reforger-types';

// Minimal setup - only required parameters
const serverConfig = createDefaultServerConfig(
  "My Reforger Server",                         // server name
  "{ECC61978EDCC2B5A}Missions/23_Campaign.conf" // scenario ID
  // Uses defaults: bindAddress="0.0.0.0", bindPort=2001, crossPlatform=false, rconPassword=""
);

// Full setup with all optional parameters
const fullServerConfig = createDefaultServerConfig(
  "My Reforger Server",                         // server name
  "{ECC61978EDCC2B5A}Missions/23_Campaign.conf", // scenario ID
  "192.168.1.100",                             // bind address (optional, default: "0.0.0.0")
  3001,                                         // base port (optional, default: 2001, a2s=3002, rcon=3003)
  true,                                         // cross-platform (optional, default: false)
  "my-rcon-password"                           // RCON password (optional, default: "")
);

// Customize specific parts if needed
serverConfig.game.maxPlayers = 64;
serverConfig.game.gameProperties.missionHeader.customProperty = "custom value";
```

### TypeScript with Namespace (Recommended)

```typescript
import { servers } from 'reforger-types';

const serverConfig: servers.ServerConfig = {
  bindAddress: "0.0.0.0",
  bindPort: 2001,
  publicAddress: "",
  publicPort: 2001,
  a2s: {
    address: "0.0.0.0",
    port: 17777
  },
  rcon: {
    address: "127.0.0.1",
    port: 19999,
    password: "your-password",
    permission: "admin",
    blacklist: [],
    whitelist: []
  },
  game: {
    name: "My Reforger Server",
    password: "",
    passwordAdmin: "admin-password",
    admins: [],
    scenarioId: "{ECC61978EDCC2B5A}Missions/23_Campaign.conf",
    maxPlayers: 64,
    visible: true,
    crossPlatform: true,
    supportedPlatforms: [servers.SupportedPlatform.PC],
    gameProperties: {
      serverMaxViewDistance: 2500,
      serverMinGrassDistance: 50,
      networkViewDistance: 1000,
      disableThirdPerson: false,
      fastValidation: true,
      battlEye: true,
      VONDisableUI: false,
      VONDisableDirectSpeechUI: false,
      missionHeader: {
        m_sName: "My Mission",
        m_sAuthor: "Author",
        m_sSaveFileName: "save.json"
      }
    },
    mods: []
  },
  operating: {
    lobbyPlayerSynchronise: true,
    playerSaveTime: 10,
    aiLimit: 100,
    slotReservationTimeout: 30
  }
};
```

### TypeScript with Direct Imports (Backward Compatible)

```typescript
import { ServerConfig, GameConfig, SupportedPlatform } from 'reforger-types';

const serverConfig: ServerConfig = {
  // ... same configuration as above
  game: {
    supportedPlatforms: [SupportedPlatform.PC]
    // ... rest of config
  }
};
```

### JavaScript (Node.js)

```javascript
const { servers, SupportedPlatform } = require('reforger-types');

const serverConfig = {
  // ... your configuration
  game: {
    supportedPlatforms: [SupportedPlatform.PC, SupportedPlatform.XBOX]
  }
};

// Or using the namespace
const serverConfig2 = {
  game: {
    supportedPlatforms: [servers.SupportedPlatform.PC]
  }
};
```

### Bun

```typescript
import { servers } from 'reforger-types';

// Works the same as TypeScript with full namespace support
```

## Available Types

### Available Types

### Namespace Export
- `servers` - Main namespace containing all server-related types

### Default Initializer Functions
- `createDefaultServerConfig(serverName, scenarioId, bindAddress?, bindPort?, crossPlatform?, rconPassword?)` - Creates complete server config with defaults
- `createDefaultGameConfig(name, scenarioId, crossPlatform?)` - Creates game configuration with defaults
- `createDefaultGameProperties()` - Creates game properties with optimal defaults
- `createDefaultOperatingConfig()` - Creates operating configuration with defaults
- `createDefaultA2SConfig(basePort)` - Creates A2S config (basePort + 1)
- `createDefaultRconConfig(basePort, password?)` - Creates RCON config (basePort + 2)
- `createDefaultMissionHeader()` - Creates mission header with default values

### Default Values Applied
- **Ports**: A2S = basePort + 1, RCON = basePort + 2
- **Cross-Platform**: When true, includes PC, Xbox, and PlayStation
- **View Distances**: Max 4000m, Min Grass 50m, Network 1500m
- **Players**: Default max 32, lobby sync enabled, save every 120s
- **Security**: BattlEye enabled, fast validation enabled
- **Mission**: Default Mission by "Default Author", saves to "defaultSave"

### Types within `servers` namespace
- `servers.ServerConfig` - Main server configuration interface
- `servers.GameConfig` - Game-specific configuration
- `servers.GameProperties` - Game properties and settings
- `servers.OperatingConfig` - Operating parameters
- `servers.A2SConfig` - A2S query configuration
- `servers.RconConfig` - RCON configuration
- `servers.MissionHeader` - Mission metadata
- `servers.Mod` - Mod information
- `servers.SupportedPlatform` - Enum for supported platforms

### Direct Exports (for backward compatibility)
- `ServerConfig` - Alias for `servers.ServerConfig`
- `GameConfig` - Alias for `servers.GameConfig`
- `GameProperties` - Alias for `servers.GameProperties`
- `OperatingConfig` - Alias for `servers.OperatingConfig`
- `A2SConfig` - Alias for `servers.A2SConfig`
- `RconConfig` - Alias for `servers.RconConfig`
- `MissionHeader` - Alias for `servers.MissionHeader`
- `Mod` - Alias for `servers.Mod`
- `SupportedPlatform` - Alias for `servers.SupportedPlatform`

## License

ISC
