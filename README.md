# Reforger Types

TypeScript definitions for Arma Reforger server configuration and tooling. Perfect for building automation tools like Discord bots, web dashboards, or CLI utilities.

## Quick Start

```bash
npm install reforger-types
```

## For Automation Tool Builders

This library is designed to help you build tools that automate Arma Reforger server management. Whether you're creating a Discord bot, web dashboard, or CLI tool, this guide will get you started quickly.

### 🎯 Common Use Cases
- **Discord Bots**: Let users configure servers through Discord commands
- **Web Dashboards**: Build admin panels for server management
- **CLI Tools**: Create command-line utilities for server operators
- **APIs**: Build REST APIs for server configuration
- **Configuration Templates**: Generate reusable server configs

---

## Simple Examples

### ⚡ Fastest Way: One-Line Server Config

```typescript
import { createDefaultServerConfig, OfficialScenarios } from 'reforger-types';

// Create a complete server config in one line
const config = createDefaultServerConfig(
  "My Awesome Server",           // Server name
  OfficialScenarios.CONFLICT_EVERON  // Official scenario (auto-converts)
);

// Ready to save as JSON!
console.log(JSON.stringify(config, null, 2));
```

### 🛠️ Builder Pattern (Recommended for Tools)

```typescript
import { ServerConfigBuilder, OfficialScenarios } from 'reforger-types';

// Perfect for user input validation and step-by-step configuration
const builder = new ServerConfigBuilder('User Server', OfficialScenarios.CONFLICT_EVERON);

// Chain methods for clean, readable code
const config = builder
  .setMaxPlayers(64)
  .setBindPort(2001)
  .setCrossPlatform(true)
  .setRconPassword('secure123')
  .setAdminPassword('admin456')
  .build();

// Export as JSON for Arma Reforger
const jsonConfig = JSON.stringify(config, null, 2);
```

---

## 🤖 Discord Bot Example

```typescript
import { ServerConfigBuilder, OfficialScenarios } from 'reforger-types';

// Discord slash command handler
async function handleCreateServer(interaction) {
  const serverName = interaction.options.getString('name');
  const scenario = interaction.options.getString('scenario') || OfficialScenarios.CONFLICT_EVERON;
  const maxPlayers = interaction.options.getInteger('players') || 32;
  
  try {
    // Build configuration from user input
    const config = new ServerConfigBuilder(serverName, scenario)
      .setMaxPlayers(maxPlayers)
      .setCrossPlatform(true)
      .setRconPassword(generateRandomPassword())
      .build();
    
    // Save or deploy the configuration
    await saveServerConfig(config);
    
    await interaction.reply(`✅ Server "${serverName}" configured successfully!`);
  } catch (error) {
    await interaction.reply(`❌ Error: ${error.message}`);
  }
}

function generateRandomPassword() {
  return Math.random().toString(36).slice(-8);
}
```

## 🌐 Web Dashboard Example

```typescript
import { createDefaultServerConfig, OfficialScenarios } from 'reforger-types';

// Create a mapping for easier validation
const SCENARIO_MAP = {
  'conflict_everon': OfficialScenarios.CONFLICT_EVERON,
  'conflict_arland': OfficialScenarios.CONFLICT_ARLAND,
  'cah_military_base': OfficialScenarios.CAH_MILITARY_BASE,
  'cah_castle': OfficialScenarios.CAH_CASTLE,
  'tutorial': OfficialScenarios.TUTORIAL,
  // Add more as needed
} as const;

// Express.js API endpoint
app.post('/api/servers', async (req, res) => {
  const { name, scenario, maxPlayers, crossPlatform } = req.body;
  
  try {
    // Validate scenario exists
    if (!(scenario in SCENARIO_MAP)) {
      return res.status(400).json({ 
        error: 'Invalid scenario',
        availableScenarios: Object.keys(SCENARIO_MAP)
      });
    }
    
    // Create configuration
    const config = createDefaultServerConfig(
      name,
      SCENARIO_MAP[scenario as keyof typeof SCENARIO_MAP],
      '0.0.0.0',        // bind address
      2001,             // port  
      crossPlatform,    // cross-platform
      req.body.rconPassword || ''
    );
    
    // Customize based on user input
    config.game.maxPlayers = maxPlayers || 32;
    
    // Save to database or deploy
    const serverId = await deployServer(config);
    
    res.json({ 
      success: true, 
      serverId,
      config: config 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

## 📋 Available Official Scenarios

```typescript
import { OfficialScenarios } from 'reforger-types';

// All official scenarios available:
console.log('Available scenarios:', Object.keys(OfficialScenarios));

// Popular scenarios for quick access:
const popularScenarios = {
  // Large-scale conflict
  'Conflict Everon': OfficialScenarios.CONFLICT_EVERON,
  'Conflict Arland': OfficialScenarios.CONFLICT_ARLAND,
  
  // Smaller battles  
  'Combat Ops Everon': OfficialScenarios.COMBAT_OPS_EVERON,
  'Combat Ops Arland': OfficialScenarios.COMBAT_OPS_ARLAND,
  
  // Capture & Hold (competitive)
  'CAH Military Base': OfficialScenarios.CAH_MILITARY_BASE,
  'CAH Castle': OfficialScenarios.CAH_CASTLE,
  
  // Game Master (custom scenarios)
  'Game Master Everon': OfficialScenarios.GAME_MASTER_EVERON,
  'Game Master Arland': OfficialScenarios.GAME_MASTER_ARLAND
};
```

---

## 🔧 Advanced Configuration

### Configuration Validation

```typescript
import { ServerConfigBuilder } from 'reforger-types';

function validateServerConfig(userInput) {
  const errors = [];
  
  // Validate server name
  if (!userInput.name || userInput.name.length < 3) {
    errors.push('Server name must be at least 3 characters');
  }
  
  // Validate player count
  if (userInput.maxPlayers < 1 || userInput.maxPlayers > 64) {
    errors.push('Max players must be between 1 and 64');
  }
  
  // Validate ports
  if (userInput.port < 1024 || userInput.port > 65535) {
    errors.push('Port must be between 1024 and 65535');
  }
  
  if (errors.length > 0) {
    throw new Error(errors.join(', '));
  }
  
  return true;
}
```

### Dynamic Server Templates

```typescript
import { ServerConfigBuilder, OfficialScenarios } from 'reforger-types';

// Predefined server templates for easy deployment
const ServerTemplates = {
  // Beginner-friendly server
  BEGINNER: (name: string) => new ServerConfigBuilder(name, OfficialScenarios.TUTORIAL)
    .setMaxPlayers(16)
    .setCrossPlatform(true)
    .build(),
  
  // Competitive PvP server
  COMPETITIVE: (name: string) => new ServerConfigBuilder(name, OfficialScenarios.CAH_MILITARY_BASE)
    .setMaxPlayers(32)
    .setCrossPlatform(false) // PC only because I'm mean
    .build(),
  
  // Large-scale warfare
  MASSIVE: (name: string) => new ServerConfigBuilder(name, OfficialScenarios.CONFLICT_EVERON)
    .setMaxPlayers(128)
    .setCrossPlatform(true)
    .build()
};

// Usage in your automation tool
const newServer = ServerTemplates.COMPETITIVE('Clan Battle Server');
```

### Port Management for Multiple Servers

```typescript
import { createDefaultServerConfig, OfficialScenarios } from 'reforger-types';

class ServerManager {
  private usedPorts = new Set<number>();
  
  createServer(name: string, scenario: string) {
    const basePort = this.findAvailablePort();
    
    const config = createDefaultServerConfig(
      name,
      scenario,
      '0.0.0.0',
      basePort
    );
    
    // Extract the automatically allocated ports from the configuration
    const gamePort = config.bindPort;        // Game port (basePort)
    const a2sPort = config.a2s.port;         // Query port (basePort + 1)  
    const rconPort = config.rcon.port;       // RCON port (basePort + 2)
    
    // Track the allocated ports
    this.usedPorts.add(gamePort);
    this.usedPorts.add(a2sPort);
    this.usedPorts.add(rconPort);
    
    console.log(`Server "${name}" allocated ports:`, {
      game: gamePort,
      query: a2sPort,
      rcon: rconPort
    });
    
    return config;
  }
  
  private findAvailablePort(): number {
    for (let port = 2001; port < 65533; port += 100) {
      if (!this.usedPorts.has(port) && 
          !this.usedPorts.has(port + 1) && 
          !this.usedPorts.has(port + 2)) {
        return port;
      }
    }
    throw new Error('No available ports');
  }
}
```

---

## 💡 Tips for Tool Builders

### 1. **Error Handling**
The builder pattern is designed to always succeed, but you may want to validate user input before building:

```typescript
function validateAndBuild(userInput) {
  // Validate user input before building
  if (!userInput.name || userInput.name.length < 3) {
    throw new Error('Server name must be at least 3 characters');
  }
  
  if (userInput.players < 2 || userInput.players > 128) {
    throw new Error('Max players must be between 2 and 128');
  }

  // Build configuration (this never throws)
  const config = new ServerConfigBuilder(userInput.name, userInput.scenario)
    .setMaxPlayers(userInput.players)
    .build();
    
  return config;
}
```

### 2. **User-Friendly Scenario Names**
Create a mapping for better UX:

```typescript
const ScenarioDisplayNames = {
  [OfficialScenarios.CONFLICT_EVERON]: 'Conflict - Everon (Large Scale)',
  [OfficialScenarios.CAH_MILITARY_BASE]: 'Capture & Hold - Military Base'
};
```

### 3. **Configuration Presets**
Offer common configurations:

```typescript
const QuickPresets = {
  'Small PvP (16 players)': { maxPlayers: 16, scenario: 'CAH_CASTLE' },
  'Medium Conflict (32 players)': { maxPlayers: 32, scenario: 'CONFLICT_ARLAND' },
  'Large Warfare (64 players)': { maxPlayers: 64, scenario: 'CONFLICT_EVERON' },
  'Massive Warfare (128 players)': { maxPlayers: 128, scenario: 'CONFLICT_EVERON' }
};
```

### 4. **JSON Export Ready**
Configurations are ready for direct JSON export:

```typescript
const config = new ServerConfigBuilder('My Server', OfficialScenarios.CONFLICT_EVERON).build();

// Save to file
fs.writeFileSync('serverconfig.json', JSON.stringify(config, null, 2));

// Or send via API
await fetch('/api/deploy', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(config)
});
```

---

## 📚 Complete API Reference

### Builder Pattern Methods

```typescript
import { ServerConfigBuilder } from 'reforger-types';

// Constructor accepts optional server name and scenario ID
const builder = new ServerConfigBuilder('Server Name', 'scenario-id');
// or
const builder2 = new ServerConfigBuilder(); // Use defaults, configure later

// Core server settings
builder.setBindAddress('0.0.0.0');     // Server bind address
builder.setBindPort(2001);              // Base port (A2S=2002, RCON=2003)
builder.setPublicAddress('1.2.3.4');   // Public IP for server browser
builder.setPublicPort(2001);            // Public port

// Game configuration  
builder.setServerName('My Server');     // Display name
builder.setScenarioId('{ABC1234567}Missions/Example.conf');   // Mission scenario
builder.setMaxPlayers(64);              // 1-64 players
builder.setCrossPlatform(true);         // Enable console crossplay
builder.setGamePassword('password');    // Server password
builder.setAdminPassword('admin123');   // Admin password

// RCON settings
builder.setRconPassword('rcon123');     // RCON password
builder.setRconAddress('127.0.0.1');   // RCON bind address

// Operating settings
builder.setPlayerSaveTime(120);        // Save interval (seconds)
builder.setAiLimit(100);               // AI limit (-1 = unlimited)

const config = builder.build();         // Generate final config
```

### Quick Functions

```typescript
import { 
  createDefaultServerConfig,
  createDefaultGameConfig,
  OfficialScenarios 
} from 'reforger-types';

// Fastest way - everything with defaults
const config = createDefaultServerConfig(
  'Server Name',                    // Required: server name
  OfficialScenarios.CONFLICT_EVERON // Required: scenario path or string-ish that can become one
);

// With custom options
const customConfig = createDefaultServerConfig(
  'Custom Server',                 // Server name
  OfficialScenarios.CAH_CASTLE,    // Scenario
  '192.168.1.100',                 // Bind address (default: '0.0.0.0')
  3001,                            // Base port (default: 2001)
  true,                            // Cross-platform (default: false)
  'rcon-password'                  // RCON password (default: '')
);

// Just the game portion
const gameConfig = createDefaultGameConfig(
  'Game Name',
  OfficialScenarios.COMBAT_OPS_EVERON,
  true  // cross-platform
);
```

### Official Scenarios Reference

```typescript
import { OfficialScenarios } from 'reforger-types';

// Conflict Scenarios (Large-scale warfare)
OfficialScenarios.CONFLICT_EVERON           // Main Everon conflict
OfficialScenarios.CONFLICT_NORTHERN_EVERON  // North-central Everon  
OfficialScenarios.CONFLICT_SOUTHERN_EVERON  // Southwest coast Everon
OfficialScenarios.CONFLICT_WESTERN_EVERON   // Western Everon
OfficialScenarios.CONFLICT_MONTIGNAC        // Montignac region
OfficialScenarios.CONFLICT_ARLAND           // Arland island

// Combat Ops (Medium-scale operations)
OfficialScenarios.COMBAT_OPS_ARLAND         // Arland operations
OfficialScenarios.COMBAT_OPS_EVERON         // Everon operations

// Game Master (Sandbox/custom)
OfficialScenarios.GAME_MASTER_EVERON        // GM mode Everon
OfficialScenarios.GAME_MASTER_ARLAND        // GM mode Arland

// Capture & Hold (Competitive)
OfficialScenarios.CAH_MILITARY_BASE         // Military base
OfficialScenarios.CAH_CASTLE               // Castle location
OfficialScenarios.CAH_FACTORY               // Factory complex
OfficialScenarios.CAH_CONCRETE_PLANT        // Concrete plant
OfficialScenarios.CAH_FOREST               // Forest area
OfficialScenarios.CAH_LE_MOULE              // Le Moule town
OfficialScenarios.CAH_MORTON                // Morton area
OfficialScenarios.CAH_BRIARS               // Briars coast

// Training
OfficialScenarios.TUTORIAL                  // Tutorial/training
```

---

## 🔍 TypeScript Types (Advanced)

### Core Interfaces

```typescript
import { servers } from 'reforger-types';

// Complete server configuration
interface ServerConfig {
  bindAddress: string;
  bindPort: number;
  publicAddress: string;
  publicPort: number;
  a2s: A2SConfig;           // Server query protocol
  rcon: RconConfig;         // Remote console  
  game: GameConfig;         // Game settings
  operating: OperatingConfig; // Runtime settings
}

// Game-specific configuration
interface GameConfig {
  name: string;             // Server display name
  password: string;         // Join password
  passwordAdmin: string;    // Admin password
  admins: string[];         // Admin player IDs
  scenarioId: string;       // Mission scenario ID
  maxPlayers: number;       // Max player count (1-64)
  visible: boolean;         // Show in server browser
  crossPlatform: boolean;   // Allow console players
  supportedPlatforms: SupportedPlatform[];
  gameProperties: GameProperties;
  mods: Mod[];
}

// Supported platforms
enum SupportedPlatform {
  PC = "PLATFORM_PC",
  XBOX = "PLATFORM_XBL", 
  PLAYSTATION = "PLATFORM_PSN"
}
```

### Direct Type Usage

```typescript

// Manual configuration (if you prefer full control)
import { servers } from 'reforger-types';

const serverConfig: servers.ServerConfig = {
  bindAddress: "0.0.0.0",
  bindPort: 2001,
  publicAddress: "0.0.0.0", 
  publicPort: 2001,
  a2s: {
    address: "0.0.0.0",
    port: 2002                    // Automatically basePort + 1
  },
  rcon: {
    address: "127.0.0.1",
    port: 2003,                   // Automatically basePort + 2
    password: "your-password",
    permission: "admin",
    blacklist: [],
    whitelist: []
  },
  game: {
    name: "My Manual Server",
    password: "",
    passwordAdmin: "admin-password",
    admins: [],
    scenarioId: "{ECC61978EDCC2B5A}Missions/23_Campaign.conf",
    maxPlayers: 64,
    visible: true,
    crossPlatform: true,
    supportedPlatforms: [
      servers.SupportedPlatform.PC,
      servers.SupportedPlatform.XBOX,
      servers.SupportedPlatform.PLAYSTATION
    ],
    gameProperties: {
      serverMaxViewDistance: 4000,
      serverMinGrassDistance: 50,
      networkViewDistance: 1500,
      disableThirdPerson: false,
      fastValidation: true,
      battlEye: true,
      VONDisableUI: false,
      VONDisableDirectSpeechUI: false,
      missionHeader: {
        m_sName: "My Mission",
        m_sAuthor: "Author Name", 
        m_sSaveFileName: "saveExample"
      }
    },
    mods: []
  },
  operating: {
    lobbyPlayerSynchronise: true,
    playerSaveTime: 120,
    aiLimit: -1,
    slotReservationTimeout: 60
  }
};
```

---

## 🚀 Deployment Examples

### Save Configuration to File

```typescript
import fs from 'fs';
import { createDefaultServerConfig, OfficialScenarios } from 'reforger-types';

const config = createDefaultServerConfig('My Server', OfficialScenarios.CONFLICT_EVERON);

// Save as JSON file for Arma Reforger server
fs.writeFileSync('./serverconfig.json', JSON.stringify(config, null, 2));
console.log('✅ Server configuration saved to serverconfig.json');
```

### Environment-Based Configuration

```typescript
import { ServerConfigBuilder, OfficialScenarios } from 'reforger-types';

// Safe environment variable mapping
const ENV_SCENARIOS = {
  'CONFLICT_EVERON': OfficialScenarios.CONFLICT_EVERON,
  'CONFLICT_ARLAND': OfficialScenarios.CONFLICT_ARLAND,
  'CAH_MILITARY_BASE': OfficialScenarios.CAH_MILITARY_BASE,
  'TUTORIAL': OfficialScenarios.TUTORIAL,
} as const;

function createServerFromEnv() {
  const scenarioKey = process.env.SCENARIO || 'CONFLICT_EVERON';
  
  // Validate environment scenario
  if (!(scenarioKey in ENV_SCENARIOS)) {
    throw new Error(`Invalid SCENARIO environment variable: ${scenarioKey}`);
  }
  
  const config = new ServerConfigBuilder(
    process.env.SERVER_NAME || 'Default Server',
    ENV_SCENARIOS[scenarioKey as keyof typeof ENV_SCENARIOS]
  )
    .setBindAddress(process.env.BIND_ADDRESS || '0.0.0.0')
    .setBindPort(parseInt(process.env.BIND_PORT || '2001'))
    .setMaxPlayers(parseInt(process.env.MAX_PLAYERS || '32'))
    .setCrossPlatform(process.env.CROSS_PLATFORM === 'true')
    .setRconPassword(process.env.RCON_PASSWORD || '')
    .setAdminPassword(process.env.ADMIN_PASSWORD || '')
    .build();
    
  return config;
}
```