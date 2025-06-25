# Reforger Types

TypeScript definitions and utilities for Arma Reforger server configuration. Build automation tools, Discord bots, web dashboards, or CLI utilities with full type safety and validation.

## Installation

```bash
npm install reforger-types
```

## Examples

See the [examples folder](./examples) for complete implementations:
- **Discord Bot** - Slash commands for server configuration  
- **Config Validator** - CLI validation tool
- **Parser Example** - Configuration parsing and validation

## Quick Start

### Create a Server Config

```typescript
import { createDefaultServerConfig, OfficialScenarios } from 'reforger-types';

// One-line server configuration
const config = createDefaultServerConfig(
  "My Server",
  OfficialScenarios.CONFLICT_EVERON
);

// Ready to save as JSON
console.log(JSON.stringify(config, null, 2));
```

### Builder Pattern (Recommended)

```typescript
import { ServerConfigBuilder, OfficialScenarios } from 'reforger-types';

const config = new ServerConfigBuilder('My Server', OfficialScenarios.CONFLICT_EVERON)
  .setMaxPlayers(64)
  .setBindPort(2001)
  .setCrossPlatform(true)
  .setRconPassword('admin123')
  .build();
```

### Parse & Validate

```typescript
import { Parser, parse } from 'reforger-types';

// Using the convenience function
const result = parse(configObject);
if (result.success) {
  console.log('✅ Valid configuration');
  console.log('Server:', result.data.game.name);
} else {
  console.error('❌ Errors:', result.errors);
}

// Using Parser class with validation
const parser = new Parser();
const validatedResult = parser.parse(configObject, {
  validate: true,
  ignore_warnings: ['EMPTY_ADMIN_PASSWORD']
});
```

## Core API

### Main Exports

```typescript
import { 
  // Creation functions
  createDefaultServerConfig,
  ServerConfigBuilder,
  
  // Parsing & validation
  Parser,
  parse,
  
  // Constants & enums
  OfficialScenarios,
  SupportedPlatform,
  
  // Mod utilities
  createExtendedMod,
  createModExtendedFromUrl,
  
  // Types (TypeScript only)
  ServerConfig,
  GameConfig,
  Mod
} from 'reforger-types';
```

**Tip**: All core functions include JSDoc comments. Use your IDE's IntelliSense to explore available options and parameters.

## Key Concepts

- **Port Allocation**: Base port + 1 (A2S) + 2 (RCON)
- **Cross-Platform**: Set `crossPlatform: true` or configure `supportedPlatforms` 
- **Validation**: Distinguishes between hard errors and warnings
- **Mod URLs**: Automatic Steam Workshop URL generation

## Source Code

This library is designed for direct source exploration:

- [`src/index.ts`](./src/index.ts) - Main exports and type re-exports
- [`src/server/`](./src/server/) - Server configuration types and utilities
- [`src/scenario/`](./src/scenario/) - Scenario and mission utilities  
- [`docs/server-config-wiki.md`](./docs/server-config-wiki.md) - Complete configuration reference

## Development

```bash
npm run build    # Compile TypeScript
npm test         # Run all tests (Node.js + Bun + integration)
npm run dev      # Watch mode compilation
```

Requires Node.js 22+ and Bun for testing.