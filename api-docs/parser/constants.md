# Parser Module Constants

Validation constants and thresholds used for server configuration validation based on official Arma Reforger documentation.

## Validation Constants

### VALIDATION_CONSTANTS

Object containing all validation thresholds and limits for server configuration validation.

```typescript
const VALIDATION_CONSTANTS = {
  VIEW_DISTANCE: {
    MINIMUM: number;
    RECOMMENDED_MAX: number;
    ABSOLUTE_MAX: number;
    NETWORK_RECOMMENDED_RATIO: number;
  },
  PLAYER_COUNT: {
    MINIMUM: number;
    RECOMMENDED_MAX: number;
    ABSOLUTE_MAX: number;
  },
  GRASS_DISTANCE: {
    HIGH_PERFORMANCE_IMPACT: number;
  },
  AI_LIMIT: {
    HIGH_PERFORMANCE_IMPACT: number;
  },
  PORTS: {
    MINIMUM: number;
    MAXIMUM: number;
  },
  PASSWORD: {
    MINIMUM_LENGTH: number;
  }
} as const;
```

## View Distance Constants

### VIEW_DISTANCE

Constants for validating server and network view distances.

```typescript
VIEW_DISTANCE: {
  MINIMUM: 500,
  RECOMMENDED_MAX: 2500,
  ABSOLUTE_MAX: 10000,
  NETWORK_RECOMMENDED_RATIO: 0.9
}
```

**MINIMUM: 500**
- Minimum recommended view distance in meters
- Values below this may provide poor gameplay experience
- Related to: [GameProperties](../server/types.md#gameproperties) serverMaxViewDistance

**RECOMMENDED_MAX: 2500**
- Maximum recommended view distance before performance impact
- Values above this threshold trigger performance warnings
- Related to: [GameProperties](../server/types.md#gameproperties) serverMaxViewDistance

**ABSOLUTE_MAX: 10000**
- Absolute maximum view distance supported by the game
- Values above this are invalid and cause validation errors
- Related to: [GameProperties](../server/types.md#gameproperties) serverMaxViewDistance

**NETWORK_RECOMMENDED_RATIO: 0.9**
- Recommended ratio between network and server view distance
- Network view distance should be ~90% of server view distance
- Related to: [GameProperties](../server/types.md#gameproperties) networkViewDistance

## Player Count Constants

### PLAYER_COUNT

Constants for validating maximum player count settings.

```typescript
PLAYER_COUNT: {
  MINIMUM: 1,
  RECOMMENDED_MAX: 96,
  ABSOLUTE_MAX: 128
}
```

**MINIMUM: 1**
- Minimum players required for a functional server
- Related to: [GameConfig](../server/types.md#gameconfig) maxPlayers

**RECOMMENDED_MAX: 96**
- Maximum recommended player count before performance degradation
- Values above this trigger performance warnings
- Related to: [GameConfig](../server/types.md#gameconfig) maxPlayers

**ABSOLUTE_MAX: 128**
- Absolute maximum players supported by the server
- Game engine limitation
- Related to: [GameConfig](../server/types.md#gameconfig) maxPlayers

## Performance Impact Constants

### GRASS_DISTANCE

Constants for grass rendering distance validation.

```typescript
GRASS_DISTANCE: {
  HIGH_PERFORMANCE_IMPACT: 100
}
```

**HIGH_PERFORMANCE_IMPACT: 100**
- Grass distance threshold for performance warnings
- Values above this may significantly impact server performance
- Related to: [GameProperties](../server/types.md#gameproperties) serverMinGrassDistance

### AI_LIMIT

Constants for AI entity limit validation.

```typescript
AI_LIMIT: {
  HIGH_PERFORMANCE_IMPACT: 80
}
```

**HIGH_PERFORMANCE_IMPACT: 80**
- AI limit threshold for performance warnings
- Values above this may significantly impact server performance
- Related to: [OperatingConfig](../server/types.md#operatingconfig) aiLimit

## Network Configuration Constants

### PORTS

Constants for network port validation.

```typescript
PORTS: {
  MINIMUM: 1024,
  MAXIMUM: 65535
}
```

**MINIMUM: 1024**
- Minimum allowed port number for server configuration
- Ports below 1024 are typically reserved for system services
- Related to: [ServerConfig](../server/types.md#serverconfig) bindPort, publicPort

**MAXIMUM: 65535**
- Maximum valid port number in networking
- Standard TCP/UDP port range limit
- Related to: [ServerConfig](../server/types.md#serverconfig) bindPort, publicPort

## Security Constants

### PASSWORD

Constants for password validation rules.

```typescript
PASSWORD: {
  MINIMUM_LENGTH: 3
}
```

**MINIMUM_LENGTH: 3**
- Minimum length for RCON passwords (if not empty)
- Based on official server configuration documentation
- Empty passwords disable RCON access
- Related to: [RconConfig](../server/types.md#rconconfig) password

## Usage Examples

### Accessing Constants

```typescript
import { VALIDATION_CONSTANTS } from 'reforger-types';

// Check if view distance is within recommended range
const viewDistance = 3000;
if (viewDistance > VALIDATION_CONSTANTS.VIEW_DISTANCE.RECOMMENDED_MAX) {
  console.warn('View distance may impact performance');
}

// Validate player count
const maxPlayers = 120;
if (maxPlayers > VALIDATION_CONSTANTS.PLAYER_COUNT.ABSOLUTE_MAX) {
  console.error('Player count exceeds maximum supported');
}
```

### Custom Validation

```typescript
import { VALIDATION_CONSTANTS } from 'reforger-types';

function validateServerConfig(config: ServerConfig) {
  const warnings: string[] = [];
  
  // Check view distances
  const serverViewDistance = config.game.gameProperties.serverMaxViewDistance;
  const networkViewDistance = config.game.gameProperties.networkViewDistance;
  
  if (serverViewDistance > VALIDATION_CONSTANTS.VIEW_DISTANCE.RECOMMENDED_MAX) {
    warnings.push('Server view distance may impact performance');
  }
  
  const recommendedNetworkDistance = serverViewDistance * VALIDATION_CONSTANTS.VIEW_DISTANCE.NETWORK_RECOMMENDED_RATIO;
  if (Math.abs(networkViewDistance - recommendedNetworkDistance) > 100) {
    warnings.push('Network view distance should be ~90% of server view distance');
  }
  
  // Check player count
  if (config.game.maxPlayers > VALIDATION_CONSTANTS.PLAYER_COUNT.RECOMMENDED_MAX) {
    warnings.push('High player count may impact performance');
  }
  
  return warnings;
}
```

### Performance Optimization

```typescript
import { VALIDATION_CONSTANTS } from 'reforger-types';

function optimizeForPerformance(config: ServerConfig): ServerConfig {
  const optimized = { ...config };
  
  // Optimize view distances
  if (optimized.game.gameProperties.serverMaxViewDistance > VALIDATION_CONSTANTS.VIEW_DISTANCE.RECOMMENDED_MAX) {
    optimized.game.gameProperties.serverMaxViewDistance = VALIDATION_CONSTANTS.VIEW_DISTANCE.RECOMMENDED_MAX;
    optimized.game.gameProperties.networkViewDistance = Math.floor(
      VALIDATION_CONSTANTS.VIEW_DISTANCE.RECOMMENDED_MAX * VALIDATION_CONSTANTS.VIEW_DISTANCE.NETWORK_RECOMMENDED_RATIO
    );
  }
  
  // Optimize grass distance
  if (optimized.game.gameProperties.serverMinGrassDistance > VALIDATION_CONSTANTS.GRASS_DISTANCE.HIGH_PERFORMANCE_IMPACT) {
    optimized.game.gameProperties.serverMinGrassDistance = VALIDATION_CONSTANTS.GRASS_DISTANCE.HIGH_PERFORMANCE_IMPACT;
  }
  
  // Optimize AI limit
  if (optimized.operating.aiLimit > VALIDATION_CONSTANTS.AI_LIMIT.HIGH_PERFORMANCE_IMPACT) {
    optimized.operating.aiLimit = VALIDATION_CONSTANTS.AI_LIMIT.HIGH_PERFORMANCE_IMPACT;
  }
  
  return optimized;
}
```
