// Parser tests
import { test, expect, describe } from "bun:test";
import { 
  Parser,
  parse,
  createDefaultServerConfig,
  OfficialScenarios
} from '../src/index.js';

describe('Parser Class', () => {
  test('should create parser instance', () => {
    const parser = new Parser();
    expect(parser).toBeInstanceOf(Parser);
  });

  test('should parse valid server config object', () => {
    const parser = new Parser();
    const config = createDefaultServerConfig('Test Server', OfficialScenarios.CONFLICT_EVERON.toString());
    
    const result = parser.parse(config);
    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    expect(result.data?.game.name).toBe('Test Server');
  });

  test('should parse JSON string', () => {
    const parser = new Parser();
    const config = createDefaultServerConfig('JSON Test', OfficialScenarios.CAH_CASTLE.toString());
    const jsonString = JSON.stringify(config);
    
    const result = parser.parse(jsonString);
    expect(result.success).toBe(true);
    expect(result.data?.game.name).toBe('JSON Test');
  });

  test('should handle invalid JSON', () => {
    const parser = new Parser();
    
    const result = parser.parse('{ invalid json }');
    expect(result.success).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  test('should validate when option is enabled', () => {
    const parser = new Parser();
    const config = createDefaultServerConfig('Validation Test', OfficialScenarios.TUTORIAL.toString());
    
    const result = parser.parse(config, { validate: true });
    expect(result.success).toBe(true);
  });

  test('should ignore specified warnings', () => {
    const parser = new Parser();
    const config = createDefaultServerConfig('Warning Test', OfficialScenarios.COMBAT_OPS_ARLAND.toString());
    
    const result = parser.parse(config, {
      validate: true,
      ignore_warnings: ['EMPTY_ADMIN_PASSWORD']
    });
    
    expect(result.success).toBe(true);
  });

  test('should handle null input', () => {
    const parser = new Parser();
    
    const result = parser.parse(null);
    expect(result.success).toBe(false);
  });
});

describe('Parse Function', () => {
  test('should parse server config', () => {
    const config = createDefaultServerConfig('Parse Test', OfficialScenarios.GAME_MASTER_EVERON.toString());
    
    const result = parse(config);
    expect(result.success).toBe(true);
    expect(result.data?.game.name).toBe('Parse Test');
  });

  test('should accept validation options', () => {
    const config = createDefaultServerConfig('Options Test', OfficialScenarios.CONFLICT_EVERON.toString());
    
    const result = parse(config, {
      validate: true,
      ignore_warnings: ['EMPTY_ADMIN_PASSWORD']
    });
    
    expect(result.success).toBe(true);
  });

  test('should handle invalid data', () => {
    const result = parse({ invalid: 'data' });
    expect(result.success).toBe(false);
  });
});

describe('Parser Business Logic', () => {
  test('should preserve configuration data', () => {
    const originalConfig = createDefaultServerConfig('Data Test', OfficialScenarios.TUTORIAL.toString());
    
    const result = parse(originalConfig);
    expect(result.success).toBe(true);
    expect(result.data?.game.name).toBe(originalConfig.game.name);
    expect(result.data?.bindPort).toBe(originalConfig.bindPort);
  });

  test('should handle configuration with mods', () => {
    const config = createDefaultServerConfig('Mod Test', OfficialScenarios.CONFLICT_EVERON.toString());
    config.game.mods = [
      { modId: '123456789', name: 'Test Mod' }
    ];
    
    const result = parse(config);
    expect(result.success).toBe(true);
    expect(result.data?.game.mods).toBeDefined();
  });
});

