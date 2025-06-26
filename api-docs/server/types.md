# Server Module Types

Core type definitions and interfaces for Arma Reforger server configuration.

## Core Configuration Types

### ServerConfig

The main server configuration interface containing all required sections for a dedicated server.

```typescript
interface ServerConfig {
  bindAddress: string;
  bindPort: number;
  publicAddress: string;
  publicPort: number;
  a2s: A2SConfig;
  rcon: RconConfig;
  game: GameConfig;
  operating: OperatingConfig;
}
```

#### GameConfig

Game-specific configuration including server name, scenario, players, and mods.

```typescript
interface GameConfig {
  name: string;
  password: string;
  passwordAdmin: string;
  admins: string[];
  scenarioId: string;
  maxPlayers: number;
  visible: boolean;
  crossPlatform: boolean;
  supportedPlatforms: SupportedPlatform[];
  gameProperties: GameProperties;
  mods: Mod[];
  modsRequiredByDefault?: boolean;
}
```

#### GameProperties

Advanced game behavior settings and mission configuration.

```typescript
interface GameProperties {
  serverMaxViewDistance: number;
  serverMinGrassDistance: number;
  networkViewDistance: number;
  disableThirdPerson: boolean;
  fastValidation: boolean;
  battlEye: boolean;
  VONDisableUI: boolean;
  VONDisableDirectSpeechUI: boolean;
  VONCanTransmitCrossFaction?: boolean;
  missionHeader: MissionHeader;
}
```

#### OperatingConfig

Server operational settings for performance and behavior tuning.

```typescript
interface OperatingConfig {
  lobbyPlayerSynchronise: boolean;
  playerSaveTime: number;
  aiLimit: number;
  slotReservationTimeout: number;
  disableCrashReporter?: boolean;      // v0.9.8+
  disableServerShutdown?: boolean;     // v0.9.8+
  disableAI?: boolean;                 // v1.1.0+
  disableNavmeshStreaming?: boolean | string[];  // v1.0.0: boolean, v1.2.0+: array
  joinQueue?: JoinQueueConfig;         // v1.2.1+
}
```

#### JoinQueueConfig

Player join queue configuration for managing server capacity.

```typescript
interface JoinQueueConfig {
  maxSize: number;  // v1.2.1+: number (0-50), Default: 0 (disabled)
}
```

## Network Configuration Types

### A2SConfig

Configuration for A2S (Steam Query) protocol allowing server browser queries.

```typescript
interface A2SConfig {
  /** IP address for A2S queries (usually "0.0.0.0" for all interfaces) */
  address: string;
  /** UDP port for A2S queries (typically bindPort + 1) */
  port: number;
}
```

### RconConfig

Configuration for RCON (Remote Console) administrative access.

```typescript
interface RconConfig {
  /** IP address for RCON connections (usually "127.0.0.1" for localhost only) */
  address: string;
  /** TCP port for RCON connections (typically bindPort + 2) */
  port: number;
  /** RCON password (minimum 3 characters, no spaces, empty disables RCON) */
  password: string;
  /** Permission level for RCON users ("admin" or "monitor") */
  permission: string;
  /** List of banned Steam IDs or IP addresses */
  blacklist: string[];
  /** List of allowed Steam IDs or IP addresses (empty allows all) */
  whitelist: string[];
  /** Maximum number of concurrent RCON clients (1-16, default: 16) */
  maxClients?: number;  // v1.1.0+
}
```

## Mission and Mod Types

### MissionHeader

Flexible mission configuration allowing custom properties for scenario customization.

```typescript
interface MissionHeader {
  [key: string]: MissionHeaderValue;
}

type MissionHeaderValue = string | number | boolean;
```

### Mod

Basic mod configuration for server mod loading.

```typescript
interface Mod {
  /** Unique mod identifier (16-character hex string) */
  modId: string;
  /** Human-readable mod name (optional, generated from modId if not provided) */
  name?: string;
  /** Mod version string (optional) */
  version?: string;
  /** Whether clients must have this mod to join (optional, default varies by server) */
  required?: boolean;
}
```

## Enums and Constants

### SupportedPlatform

Platform identifiers for cross-platform server support.

```typescript
enum SupportedPlatform {
  /** Windows PC platform */
  PC = "PLATFORM_PC",
  /** Xbox platform */
  XBOX = "PLATFORM_XBL", 
  /** PlayStation platform */
  PLAYSTATION = "PLATFORM_PSN"
}
```

These values must match exactly what Arma Reforger expects in the server configuration. Use these constants rather than hardcoding strings to ensure compatibility.
