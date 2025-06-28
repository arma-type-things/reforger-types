# Reforger Types

TypeScript definitions and utilities for Arma Reforger server configuration. Build automation tools, Discord bots, web dashboards, or CLI utilities with full type safety and validation.

## Installation

```bash
npm install reforger-types
```

## Examples

See the [examples folder](./examples) for complete implementations:
- **[Redsmith](./examples/redsmith/)** - Interactive wizard and validation tool for server configs
- **[Discord Bot](./examples/discord-bot/)** - Slash commands for server configuration  
- **[Config Validator](./examples/config-validator/)** - Focused example demonstrating direct validation API usage
- **[Parser Example](./examples/parser-example.js)** - Configuration parsing and validation
- **[Mod Extensions Example](./examples/mod-extensions-example.js)** - Workshop URL and mod utilities
- **[Mod Conversion Example](./examples/mod-conversion-example.js)** - URL-to-mod conversion and extended mod utilities

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
  .setBindPort(2001)
  .setCrossPlatform(true)
  .setRconPassword('admin123')
  .setGamePassword('server123')
  .addModsFromUrls([
    'https://reforger.armaplatform.com/workshop/A1B2C3D4E5F6G7H8-enhanced-realism'
  ])
  .build();
```

### Parse & Validate

```typescript
import { parse } from 'reforger-types';

// Simple validation (recommended)
const result = parse(configObject);
if (result.success) {
  console.log('✅ Valid configuration');
  console.log('Server:', result.data.game.name);
} else {
  console.error('❌ Errors:', result.errors);
  console.error('❌ Validation Issues:', result.validationErrors);
}

// Custom validation options
const customResult = parse(configObject, {
  validate: true,
  ignore_warnings: ['EMPTY_ADMIN_PASSWORD', 'WEAK_RCON_PASSWORD']
});
```

### CLI Validation

For command-line validation:

```bash
# Using redsmith for validation
npx redsmith validate path/to/server.json

# With debug output
npx redsmith validate path/to/server.json --debug
```

Redsmith can also be installed globally with `npm install -g redsmith`, though this project recommends using `npx` for better dependency management.

## API Documentation

For detailed API reference, see the [api-docs](./api-docs/) folder:
- **[Server Module](./api-docs/server/)** - Configuration types, builder patterns, and mod utilities
- **[Parser Module](./api-docs/parser/)** - Validation engine, error handling, and parsing workflows  
- **[Scenario Module](./api-docs/scenario/)** - Mission resource references and scenario utilities

## Core API

### Main Exports

```typescript
import { 
  // Creation functions
  createDefaultServerConfig,
  ServerConfigBuilder,
  
  // Parsing & validation
  parse,
  
  // Constants & enums
  OfficialScenarios,
  SupportedPlatform,
  
  // Mod utilities
  createExtendedMod,
  createModExtendedFromUrl,
  modIdFromUrl,
  isValidModId,
  
  // Types (TypeScript only)
  ServerConfig,
  GameConfig,
  Mod,
  ModExtended
} from 'reforger-types';
```

**Tip**: All core functions include comprehensive JSDoc comments. Use your IDE's IntelliSense to explore available options, parameters, and examples.

## Development

```bash
npm run build    # Compile TypeScript
npm test         # Run all tests (Node.js + Bun + integration)
```

Requires Node.js 22+. Bun required for complete test suite.