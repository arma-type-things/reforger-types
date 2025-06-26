# Server Module Builder

Builder pattern implementation for fluent server configuration creation with validation and flexible customization.

## Builder Interface

### IServerConfigBuilder

Interface defining the builder pattern contract for server configuration creation.

```typescript
interface IServerConfigBuilder {
  // Core server settings
  setBindAddress(address: string): this;
  setBindPort(port: number): this;
  setPublicAddress(address: string): this;
  setPublicPort(port: number): this;
  
  // Game configuration
  setServerName(name: string): this;
  setScenarioId(scenarioId: string): this;
  setMaxPlayers(maxPlayers: number): this;
  setCrossPlatform(enabled: boolean): this;
  setGamePassword(password: string): this;
  setAdminPassword(password: string): this;
  
  // Mod configuration
  setMods(mods: Mod[]): this;
  addMod(mod: Mod): this;
  addMods(mods: Mod[]): this;
  addModsFromUrls(urls: string[]): this;
  clearMods(): this;
  
  // RCON configuration
  setRconPassword(password: string): this;
  setRconAddress(address: string): this;
  
  // Operating configuration
  setPlayerSaveTime(seconds: number): this;
  setAiLimit(limit: number): this;
  
  // Build methods
  build(): ServerConfig;
  buildGameConfig(): GameConfig;
  buildGameProperties(): GameProperties;
  buildOperatingConfig(): OperatingConfig;
  buildA2SConfig(): A2SConfig;
  buildRconConfig(): RconConfig;
  
  // Reset builder to defaults
  reset(): this;
}
```

## Builder Implementation

### ServerConfigBuilder

Fluent API builder for step-by-step server configuration creation with automatic validation and sensible defaults.

```typescript
class ServerConfigBuilder implements IServerConfigBuilder
```

**Constructor:**
```typescript
constructor(serverName: string, scenarioId: string)
```

**Parameters:**
- `serverName` - Display name for the server
- `scenarioId` - Mission/scenario identifier to run

#### Core Server Methods

**setBindAddress(address: string)**
- Sets the IP address the server binds to
- Default: `"0.0.0.0"` (all interfaces)

**setBindPort(port: number)**
- Sets the main server port
- Automatically calculates A2S (port + 1) and RCON (port + 2) ports
- Default: `2001`

**setPublicAddress(address: string)**
- Sets the public IP address for server advertising
- Uses bind address if not specified

**setPublicPort(port: number)**
- Sets the public port for server advertising  
- Uses bind port if not specified

#### Game Configuration Methods

**setServerName(name: string)**
- Sets the server display name

**setScenarioId(scenarioId: string)**
- Sets the mission/scenario to run

**setMaxPlayers(maxPlayers: number)**
- Sets maximum player count
- Default: `64`

**setCrossPlatform(enabled: boolean)**
- Enables/disables cross-platform support
- Default: `false`

**setGamePassword(password: string)**
- Sets server join password
- Empty string removes password protection

**setAdminPassword(password: string)**
- Sets server admin password
- Empty string disables admin access

#### Mod Configuration Methods

**setMods(mods: Mod[])**
- Replaces entire mod list

**addMod(mod: Mod)**
- Adds single mod to configuration

**addMods(mods: Mod[])**
- Adds multiple mods to configuration

**addModsFromUrls(urls: string[])**
- Converts workshop URLs to mods and adds them
- Automatically extracts mod IDs and generates names

**clearMods()**
- Removes all mods from configuration

#### Network Configuration Methods

**setRconPassword(password: string)**
- Sets RCON access password
- Empty string disables RCON

**setRconAddress(address: string)**
- Sets RCON bind address
- Default: `"127.0.0.1"` (localhost only)

#### Operating Configuration Methods

**setPlayerSaveTime(seconds: number)**
- Sets player data save interval
- Default: `120` seconds

**setAiLimit(limit: number)**
- Sets AI entity limit
- Default: `-1` (unlimited)

#### Build Methods

**build(): ServerConfig**
- Creates complete server configuration
- Validates all settings and applies defaults

**buildGameConfig(): GameConfig**
- Creates only the game configuration section

**buildGameProperties(): GameProperties**
- Creates only the game properties section

**buildOperatingConfig(): OperatingConfig**
- Creates only the operating configuration section

**buildA2SConfig(): A2SConfig**
- Creates only the A2S configuration section

**buildRconConfig(): RconConfig**
- Creates only the RCON configuration section

**reset(): this**
- Resets builder to default values
- Retains server name and scenario ID

## Usage Examples

### Basic Server Configuration

```typescript
import { ServerConfigBuilder } from 'reforger-types';

const config = new ServerConfigBuilder('My Server', 'scenario-id')
  .setMaxPlayers(32)
  .setBindPort(3001)
  .setCrossPlatform(true)
  .build();
```

### Full-Featured Server

```typescript
import { ServerConfigBuilder } from 'reforger-types';

const config = new ServerConfigBuilder('Advanced Server', 'scenario-id')
  .setBindPort(2001)
  .setMaxPlayers(64)
  .setCrossPlatform(true)
  .setGamePassword('gamepass')
  .setAdminPassword('adminpass')
  .setRconPassword('rconpass')
  .addModsFromUrls([
    'https://reforger.armaplatform.com/workshop/12345678-mod-name',
    'https://reforger.armaplatform.com/workshop/87654321-another-mod'
  ])
  .setPlayerSaveTime(300)
  .setAiLimit(100)
  .build();
```

### Partial Configuration Building

```typescript
import { ServerConfigBuilder } from 'reforger-types';

const builder = new ServerConfigBuilder('My Server', 'scenario-id');

// Build individual sections
const gameConfig = builder.buildGameConfig();
const operatingConfig = builder.buildOperatingConfig();
const rconConfig = builder.setRconPassword('admin').buildRconConfig();

// Or build complete configuration
const fullConfig = builder.build();
```

### Builder Reuse

```typescript
import { ServerConfigBuilder } from 'reforger-types';

const builder = new ServerConfigBuilder('Template Server', 'scenario-id')
  .setMaxPlayers(32)
  .setCrossPlatform(true);

// Create multiple configurations from same base
const serverA = builder.setServerName('Server A').setBindPort(2001).build();
const serverB = builder.setServerName('Server B').setBindPort(2002).build();

// Reset to clean state
builder.reset();
```
