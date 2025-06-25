# Reforger Types

TypeScript definitions for Arma Reforger server configuration and tooling. Perfect for building automation tools like Discord bots, web dashboards, or CLI utilities.

## For Automation Tool Builders

This library is designed to help you build tools that automate Arma Reforger server management. Whether you're creating a Discord bot, web dashboard, or CLI tool, this guide will get you started quickly.

### 🎯 Common Use Cases
- **Discord Bots**: Let users configure servers through Discord commands
- **Web Dashboards**: Build admin panels for server management
- **CLI Tools**: Create command-line utilities for server operators
- **APIs**: Build REST APIs for server configuration
- **Configuration Templates**: Generate reusable server configs

---

## Quick Start

```bash
npm install reforger-types
```

## 📁 Examples

See the [examples folder](https://github.com/arma-type-things/reforger-types/tree/main/examples) for complete implementations:

- **Discord Bot** - Full slash command implementation for server configuration
- **Parser Example** - Configuration parsing and validation demonstrations

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

## 🔧 Configuration & Validation

### Basic Validation
```typescript
import { parseServerConfig, validateServerConfig } from 'reforger-types';

// Parse and validate existing configurations
const result = parseServerConfig(jsonString);
if (result.success) {
  console.log('✅ Valid configuration');
} else {
  console.error('❌ Errors:', result.errors);
}
```

### Port Management
```typescript
// createDefaultServerConfig automatically handles port allocation:
// Base port: 2001 (game), 2002 (A2S query), 2003 (RCON)
const config = createDefaultServerConfig('Server', scenario, '0.0.0.0', 2001);
```

---

## 📚 API Reference

### Core Functions

```typescript
import { 
  createDefaultServerConfig,
  ServerConfigBuilder,
  OfficialScenarios,
  parseServerConfig 
} from 'reforger-types';

// Quick server creation
const config = createDefaultServerConfig('Server Name', OfficialScenarios.CONFLICT_EVERON);

// Detailed builder pattern
const builder = new ServerConfigBuilder('Server Name', 'scenario-id')
  .setMaxPlayers(64)
  .setBindPort(2001)
  .setCrossPlatform(true)
  .build();

// Parse existing configurations
const result = parseServerConfig(jsonString);
```

For detailed API documentation, see the TypeScript definitions and examples folder.