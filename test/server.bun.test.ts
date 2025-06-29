// Business Logic and Edge Case Tests with Bun
import { test, expect, describe } from "bun:test";
import { 
  server,
  ServerConfigBuilder,
  SupportedPlatform
} from '../src/index.js';

describe('Port Allocation Edge Cases', () => {
  test('edge case port values', () => {
    // Test minimum valid port
    const minPortConfig = new ServerConfigBuilder('Min', 'scenario')
      .setBindPort(1024)
      .build();
    
    expect(minPortConfig.bindPort).toBe(1024);
    expect(minPortConfig.a2s.port).toBe(1025);
    expect(minPortConfig.rcon.port).toBe(1026);

    // Test high port values
    const highPortConfig = new ServerConfigBuilder('High', 'scenario')
      .setBindPort(65533)
      .build();
    
    expect(highPortConfig.bindPort).toBe(65533);
    expect(highPortConfig.a2s.port).toBe(65534);
    expect(highPortConfig.rcon.port).toBe(65535);
  });

  test('independent port assignment', () => {
    // Test that components can have separate port assignment
    const a2sConfig = server.createDefaultA2SConfig(3000);
    const rconConfig = server.createDefaultRconConfig(4000, 'password');

    expect(a2sConfig.port).toBe(3001); // Base + 1
    expect(rconConfig.port).toBe(4002); // Base + 2 (not Base + 1)
  });
});

describe('Cross-Platform Edge Cases', () => {
  test('platform array consistency', () => {
    // Single platform should always be PC only
    const singleConfig = server.createDefaultGameConfig('Single', 'scenario', false);
    expect(singleConfig.supportedPlatforms).toEqual([SupportedPlatform.PC]);

    // Multi-platform should include all platforms in consistent order
    const multiConfig = server.createDefaultGameConfig('Multi', 'scenario', true);
    expect(multiConfig.supportedPlatforms).toHaveLength(3);
    expect(multiConfig.supportedPlatforms).toContain(SupportedPlatform.PC);
    expect(multiConfig.supportedPlatforms).toContain(SupportedPlatform.XBOX);
    expect(multiConfig.supportedPlatforms).toContain(SupportedPlatform.PLAYSTATION);
  });

  test('platform enum values', () => {
    // Validate enum values are strings as expected by Reforger
    expect(SupportedPlatform.PC).toBe('PLATFORM_PC');
    expect(SupportedPlatform.XBOX).toBe('PLATFORM_XBL');
    expect(SupportedPlatform.PLAYSTATION).toBe('PLATFORM_PSN');
  });
});

describe('Default Value Edge Cases', () => {
  test('mission header extensibility', () => {
    const header = server.createDefaultMissionHeader();

    // Test that the mission header acts as a proper dictionary
    expect(header.m_sName).toBe('Default Mission');
    expect(header.m_sAuthor).toBe('Default Author');
    expect(header.m_sSaveFileName).toBe('defaultSave');

    // Test dynamic property assignment works (mission header allows any string/number/boolean)
    header.customProperty = 'custom value';
    header.numericProperty = 42;
    header.booleanProperty = true;

    expect(header.customProperty).toBe('custom value');
    expect(header.numericProperty).toBe(42);
    expect(header.booleanProperty).toBe(true);
  });

  test('operating config boundary values', () => {
    const config = server.createDefaultOperatingConfig();

    // Test AI limit edge case (unlimited)
    expect(config.aiLimit).toBe(-1); // -1 = unlimited

    // Test timeout values are reasonable
    expect(config.playerSaveTime).toBeGreaterThan(0);
    expect(config.slotReservationTimeout).toBeGreaterThan(0);
    
    // Test boolean defaults
    expect(config.lobbyPlayerSynchronise).toBe(true);
  });

  test('game config player limits', () => {
    // Test default max players is reasonable
    const defaultConfig = server.createDefaultGameConfig('Test', 'scenario', false);
    expect(defaultConfig.maxPlayers).toBe(64); // Updated to match wiki default
    expect(defaultConfig.maxPlayers).toBeGreaterThan(0);
    expect(defaultConfig.maxPlayers).toBeLessThanOrEqual(256); // Reasonable upper bound

    // Test visibility defaults
    expect(defaultConfig.visible).toBe(true);
  });
});

describe('Configuration Validation Edge Cases', () => {
  test('empty string handling', () => {
    const builder = new ServerConfigBuilder('', '');
    const config = builder.build();

    // Empty strings are falsy, so constructor uses defaults
    expect(config.game.name).toBe('Default Server');
    expect(config.game.scenarioId).toBe('');
    
    // But setter methods should preserve empty strings
    builder.setServerName('').setScenarioId('test');
    const config2 = builder.build();
    expect(config2.game.name).toBe('');
    expect(config2.game.scenarioId).toBe('test');
  });

  test('builder method chaining robustness', () => {
    // Test that method chaining works with all combinations
    const config = new ServerConfigBuilder()
      .setServerName('Chain Test')
      .setScenarioId('chain-scenario')
      .setBindPort(7000)
      .setMaxPlayers(50)
      .setCrossPlatform(false)
      .setGamePassword('chain123')
      .setAdminPassword('chainadmin')
      .setRconPassword('chainrcon')
      .setPlayerSaveTime(200)
      .setAiLimit(100)
      .build();

    expect(config.game.name).toBe('Chain Test');
    expect(config.bindPort).toBe(7000);
    expect(config.game.maxPlayers).toBe(50);
    expect(config.game.password).toBe('chain123');
    expect(config.operating.aiLimit).toBe(100);
  });

  test('address and port consistency', () => {
    const config = new ServerConfigBuilder('Consistency', 'scenario')
      .setBindAddress('127.0.0.1')
      .setBindPort(8000)
      .setRconAddress('192.168.1.1')
      .build();

    // Validate addresses are set correctly
    expect(config.bindAddress).toBe('127.0.0.1');
    expect(config.publicAddress).toBe('127.0.0.1'); // Should match bind by default
    expect(config.rcon.address).toBe('192.168.1.1');
    
    // Validate port calculation remains consistent
    expect(config.bindPort).toBe(8000);
    expect(config.a2s.port).toBe(8001);
    expect(config.rcon.port).toBe(8002);
  });
});

describe('New Properties from Wiki', () => {
  test('VONCanTransmitCrossFaction defaults correctly', () => {
    const gameProperties = server.createDefaultGameProperties();
    expect(gameProperties.VONCanTransmitCrossFaction).toBe(false); // Wiki default: false
  });

  test('serverMinGrassDistance updated to wiki default', () => {
    const gameProperties = server.createDefaultGameProperties();
    expect(gameProperties.serverMinGrassDistance).toBe(0); // Wiki default: 0 (updated from 50)
  });

  test('serverMaxViewDistance updated to wiki default', () => {
    const gameProperties = server.createDefaultGameProperties();
    expect(gameProperties.serverMaxViewDistance).toBe(1600); // Wiki default: 1600 (updated from 4000)
  });
});

describe('loadServerConfigFromFile', () => {
  const { loadServerConfigFromFile } = server;
  
  test('loads valid JSON server config file', () => {
    // Create a valid server config object
    const validConfig = server.createDefaultServerConfig(
      'Test Server',
      'MyScenario',
      '127.0.0.1',
      2001,
      true,
      'testpass'
    );
    
    // Write to temporary file
    const tempFile = '/tmp/test-server-config.json';
    const fs = require('fs');
    fs.writeFileSync(tempFile, JSON.stringify(validConfig, null, 2));
    
    // Test loading
    const result = loadServerConfigFromFile(tempFile);
    
    expect(result).toBeDefined();
    expect(result?.game.name).toBe('Test Server');
    expect(result?.bindPort).toBe(2001);
    expect(result?.game.crossPlatform).toBe(true);
    
    // Cleanup
    fs.unlinkSync(tempFile);
  });

  test('returns undefined for invalid JSON file', () => {
    // Write invalid JSON to temporary file
    const tempFile = '/tmp/test-invalid.json';
    const fs = require('fs');
    fs.writeFileSync(tempFile, '{ invalid json content');
    
    const result = loadServerConfigFromFile(tempFile);
    
    expect(result).toBeUndefined();
    
    // Cleanup
    fs.unlinkSync(tempFile);
  });

  test('returns undefined for non-existent file', () => {
    const result = loadServerConfigFromFile('/tmp/non-existent-file.json');
    expect(result).toBeUndefined();
  });

  test('returns undefined for empty file', () => {
    // Write empty file
    const tempFile = '/tmp/test-empty.json';
    const fs = require('fs');
    fs.writeFileSync(tempFile, '');
    
    const result = loadServerConfigFromFile(tempFile);
    
    expect(result).toBeUndefined();
    
    // Cleanup
    fs.unlinkSync(tempFile);
  });

  test('loads minimal valid JSON object', () => {
    // Write minimal valid JSON
    const tempFile = '/tmp/test-minimal.json';
    const fs = require('fs');
    const minimalConfig = { game: { name: 'Minimal' }, bindPort: 2001 };
    fs.writeFileSync(tempFile, JSON.stringify(minimalConfig));
    
    const result = loadServerConfigFromFile(tempFile);
    
    expect(result).toBeDefined();
    expect(result?.game.name).toBe('Minimal');
    expect(result?.bindPort).toBe(2001);
    
    // Cleanup
    fs.unlinkSync(tempFile);
  });
});
