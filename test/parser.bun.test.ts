// Parser tests
import { test, expect, describe } from "bun:test";
import { 
  ServerConfigParser,
  parseServerConfig,
  validateServerConfig,
  createDefaultServerConfig,
  OfficialScenarios
} from '../src/index.js';

describe('ServerConfigParser', () => {
  test('should create parser with default options', () => {
    const parser = new ServerConfigParser();
    expect(parser).toBeInstanceOf(ServerConfigParser);
  });

  test('should create parser with custom options', () => {
    const parser = new ServerConfigParser({
      strict: true,
      allowDefaults: false,
      validateRanges: true
    });
    expect(parser).toBeInstanceOf(ServerConfigParser);
  });
});

describe('Basic Parsing', () => {
  test('should parse valid server config object', () => {
    const validConfig = createDefaultServerConfig('Test Server', OfficialScenarios.CONFLICT_EVERON);
    
    const result = parseServerConfig(validConfig);
    
    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    expect(result.errors).toHaveLength(0);
    expect(result.data?.game.name).toBe('Test Server');
  });

  test('should parse valid server config JSON string', () => {
    const validConfig = createDefaultServerConfig('JSON Test', OfficialScenarios.CAH_CASTLE);
    const jsonString = JSON.stringify(validConfig);
    
    const result = parseServerConfig(jsonString);
    
    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    expect(result.errors).toHaveLength(0);
    expect(result.data?.game.name).toBe('JSON Test');
  });

  test('should handle invalid JSON string', () => {
    const invalidJson = '{ invalid json }';
    
    const result = parseServerConfig(invalidJson);
    
    expect(result.success).toBe(false);
    expect(result.data).toBeUndefined();
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors[0]).toContain('JSON parsing failed');
  });

  test('should handle missing required properties', () => {
    const incompleteConfig = {
      bindAddress: '0.0.0.0',
      // Missing other required properties
    };
    
    const result = parseServerConfig(incompleteConfig);
    
    expect(result.success).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors[0]).toContain('Invalid server configuration structure');
  });
});

describe('Validation Functions', () => {
  test('should validate correct server config', () => {
    const validConfig = createDefaultServerConfig('Valid Server', OfficialScenarios.TUTORIAL);
    
    const result = validateServerConfig(validConfig);
    
    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    expect(result.errors).toHaveLength(0);
  });

  test('should reject invalid config structure', () => {
    const invalidConfig = { notAValidConfig: true };
    
    const result = validateServerConfig(invalidConfig);
    
    expect(result.success).toBe(false);
    expect(result.data).toBeUndefined();
    expect(result.errors.length).toBeGreaterThan(0);
  });

  test('should handle null/undefined input', () => {
    expect(validateServerConfig(null).success).toBe(false);
    expect(validateServerConfig(undefined).success).toBe(false);
    expect(validateServerConfig('not an object').success).toBe(false);
  });
});

describe('Convenience Functions', () => {
  test('parseServerConfig should work as standalone function', () => {
    const config = createDefaultServerConfig('Standalone Test', OfficialScenarios.GAME_MASTER_EVERON);
    
    const result = parseServerConfig(config);
    
    expect(result.success).toBe(true);
    expect(result.data?.game.name).toBe('Standalone Test');
  });

  test('should accept parser options in convenience functions', () => {
    const config = createDefaultServerConfig('Options Test', OfficialScenarios.COMBAT_OPS_ARLAND);
    
    const result = parseServerConfig(config, { 
      strict: true, 
      validateRanges: false 
    });
    
    expect(result.success).toBe(true);
  });
});

describe('Future Parser Features (Placeholders)', () => {
  test('should have parseGameConfig method', () => {
    const parser = new ServerConfigParser();
    expect(typeof parser.parseGameConfig).toBe('function');
  });

  test('should have parseGameProperties method', () => {
    const parser = new ServerConfigParser();
    expect(typeof parser.parseGameProperties).toBe('function');
  });

  test('parseGameConfig should handle basic input', () => {
    const parser = new ServerConfigParser();
    const gameConfig = {
      name: 'Test Game',
      maxPlayers: 32,
      scenarioId: 'test-scenario'
    };
    
    const result = parser.parseGameConfig(gameConfig);
    // For now, just test that it doesn't crash
    expect(result).toBeDefined();
    expect(typeof result.success).toBe('boolean');
  });
});
