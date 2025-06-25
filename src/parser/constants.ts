/**
 * Validation constants for Arma Reforger server configuration
 * Based on official documentation from the server config wiki
 */
export const VALIDATION_CONSTANTS = {
  VIEW_DISTANCE: {
    MINIMUM: 500,
    RECOMMENDED_MAX: 2500,  // Performance impact starts to become significant above this
    ABSOLUTE_MAX: 10000,
    NETWORK_RECOMMENDED_RATIO: 0.9  // Network view distance should be ~90% of server view distance
  },
  PLAYER_COUNT: {
    MINIMUM: 1,
    RECOMMENDED_MAX: 96,    // Performance impact increases significantly above this
    ABSOLUTE_MAX: 128
  },
  GRASS_DISTANCE: {
    HIGH_PERFORMANCE_IMPACT: 100  // Values above this may significantly impact performance
  },
  AI_LIMIT: {
    HIGH_PERFORMANCE_IMPACT: 80  // Values above this may significantly impact performance
  },
  PORTS: {
    MINIMUM: 1024,
    MAXIMUM: 65535
  },
  PASSWORD: {
    MINIMUM_LENGTH: 3  // According to wiki: "must be at least 3 characters long"
  }
} as const;
