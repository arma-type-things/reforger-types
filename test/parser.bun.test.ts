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

describe('New Parser Architecture', () => {
  test('should export Parser class', async () => {
    const { Parser } = await import('../dist/server/parser.js');
    expect(typeof Parser).toBe('function');
    
    const parser = new Parser();
    expect(typeof parser.parse).toBe('function');
  });

  test('should export default parser instance', async () => {
    const { parser } = await import('../dist/server/parser.js');
    expect(typeof parser.parse).toBe('function');
  });

  test('should export top-level parse function', async () => {
    const { parse } = await import('../dist/server/parser.js');
    expect(typeof parse).toBe('function');
  });

  test('Parser.parse should handle validation options', async () => {
    const { Parser } = await import('../dist/server/parser.js');
    const parser = new Parser();
    
    const validConfig = {
      bindAddress: '0.0.0.0',
      bindPort: 2001,
      a2s: { address: '', port: 2002 },
      rcon: { address: '', port: 2003, password: '' },
      game: {
        name: 'Test',
        maxPlayers: 32,
        gameProperties: {
          serverMaxViewDistance: 2000,
          networkViewDistance: 1000,
          serverMinGrassDistance: 50
        },
        mods: []
      },
      operating: {
        aiLimit: 50,
        joinQueue: { maxSize: 10 }
      }
    };
    
    // Test with validation enabled
    const result1 = parser.parse(validConfig, { validate: true });
    expect(result1).toBeDefined();
    expect(typeof result1.success).toBe('boolean');
    
    // Test with validation disabled
    const result2 = parser.parse(validConfig, { validate: false });
    expect(result2).toBeDefined();
    expect(typeof result2.success).toBe('boolean');
    
    // Test with ignore options
    const result3 = parser.parse(validConfig, { 
      validate: true,
      ignore_warnings: ['EMPTY_ADMIN_PASSWORD'],
      ignore_errors: []
    });
    expect(result3).toBeDefined();
    expect(typeof result3.success).toBe('boolean');
  });
});
