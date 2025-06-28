// ES Module Export and High-Level Usage Tests
import { test, describe } from 'node:test';
import assert from 'node:assert';
import { 
  // Namespace export
  server,
  // Direct exports
  ServerConfigBuilder, 
  createDefaultServerConfig,
  SupportedPlatform
} from '../dist/index.js';

describe('ES Module Exports', () => {
  test('should export server namespace', () => {
    assert.strictEqual(typeof server, 'object');
    assert.strictEqual(typeof server.ServerConfigBuilder, 'function');
    assert.strictEqual(typeof server.createDefaultServerConfig, 'function');
    assert.strictEqual(typeof server.SupportedPlatform, 'object');
  });

  test('should export direct convenience functions', () => {
    assert.strictEqual(typeof ServerConfigBuilder, 'function');
    assert.strictEqual(typeof createDefaultServerConfig, 'function');
    assert.strictEqual(typeof SupportedPlatform, 'object');
  });

  test('should export all default creation functions in server namespace', () => {
    assert.strictEqual(typeof server.createDefaultGameConfig, 'function');
    assert.strictEqual(typeof server.createDefaultA2SConfig, 'function');
    assert.strictEqual(typeof server.createDefaultRconConfig, 'function');
    assert.strictEqual(typeof server.createDefaultOperatingConfig, 'function');
    assert.strictEqual(typeof server.createDefaultMissionHeader, 'function');
  });
});

describe('High-Level Usage - Builder Pattern', () => {
  test('should create complete server config with builder', () => {
    const config = new ServerConfigBuilder('ES Test Server', 'es-scenario')
      .setBindPort(3001)
      .setMaxPlayers(64)
      .setCrossPlatform(true)
      .setRconPassword('es-password')
      .build();

    // Validate complete structure
    assert.strictEqual(config.game.name, 'ES Test Server');
    assert.strictEqual(config.bindPort, 3001);
    assert.strictEqual(config.a2s.port, 3002); // Port strategy test
    assert.strictEqual(config.rcon.port, 3003); // Port strategy test
    assert.strictEqual(config.game.maxPlayers, 64);
    assert.strictEqual(config.game.crossPlatform, true);
    assert.strictEqual(config.game.supportedPlatforms.length, 3); // Cross-platform logic
    assert.strictEqual(config.rcon.password, 'es-password');
  });

  test('should handle advanced builder configuration', () => {
    const config = new ServerConfigBuilder()
      .setServerName('Advanced ES Server')
      .setScenarioId('advanced-es-scenario')
      .setBindAddress('192.168.1.100')
      .setBindPort(4001)
      .setPublicAddress('203.0.113.1')
      .setPublicPort(4001)
      .setMaxPlayers(128)
      .setGamePassword('game123')
      .setAdminPassword('admin456')
      .setRconPassword('rcon789')
      .setRconAddress('192.168.1.100')
      .setPlayerSaveTime(60)
      .setAiLimit(50)
      .setCrossPlatform(false)
      .build();

    // Validate all settings applied correctly
    assert.strictEqual(config.bindAddress, '192.168.1.100');
    assert.strictEqual(config.publicAddress, '203.0.113.1');
    assert.strictEqual(config.game.password, 'game123');
    assert.strictEqual(config.game.passwordAdmin, 'admin456');
    assert.strictEqual(config.rcon.address, '192.168.1.100');
    assert.strictEqual(config.rcon.password, 'rcon789');
    assert.strictEqual(config.operating.playerSaveTime, 60);
    assert.strictEqual(config.operating.aiLimit, 50);
    assert.strictEqual(config.game.supportedPlatforms.length, 1); // Single platform
  });

  test('should support component building', () => {
    const builder = new ServerConfigBuilder('Component Server', 'component-scenario');
    
    const gameConfig = builder
      .setMaxPlayers(72)
      .setCrossPlatform(true)
      .buildGameConfig();
    
    const operatingConfig = builder
      .setPlayerSaveTime(180)
      .setAiLimit(75)
      .buildOperatingConfig();

    // Validate component building works
    assert.strictEqual(gameConfig.maxPlayers, 72);
    assert.strictEqual(gameConfig.crossPlatform, true);
    assert.strictEqual(gameConfig.supportedPlatforms.length, 3);
    assert.strictEqual(operatingConfig.playerSaveTime, 180);
    assert.strictEqual(operatingConfig.aiLimit, 75);
  });

  test('should reset builder to defaults', () => {
    const builder = new ServerConfigBuilder('Reset Test', 'reset-scenario')
      .setBindPort(5001)
      .setMaxPlayers(96)
      .reset()
      .setServerName('After Reset');

    const config = builder.build();

    assert.strictEqual(config.game.name, 'After Reset');
    assert.strictEqual(config.bindPort, 2001); // Default port
    assert.strictEqual(config.game.maxPlayers, 64); // Default max players
  });
});

describe('Comprehensive Builder Pattern Tests', () => {
  test('should handle fluent interface and state persistence', () => {
    const builder = new ServerConfigBuilder('State Test', 'state-scenario');

    // Test fluent interface maintains state
    builder
      .setBindPort(3000)
      .setMaxPlayers(64)
      .setGamePassword('test123');

    const config1 = builder.build();
    assert.strictEqual(config1.bindPort, 3000);
    assert.strictEqual(config1.game.maxPlayers, 64);
    assert.strictEqual(config1.game.password, 'test123');

    // Test state persists between builds
    const config2 = builder.build();
    assert.strictEqual(config2.bindPort, 3000);
    assert.strictEqual(config2.game.maxPlayers, 64);
    assert.strictEqual(config2.game.password, 'test123');

    // Test reset functionality restores defaults
    builder.reset().setServerName('After Reset');
    const config3 = builder.build();
    assert.strictEqual(config3.game.name, 'After Reset');
    assert.strictEqual(config3.bindPort, 2001); // Reset to default
    assert.strictEqual(config3.game.maxPlayers, 64); // Reset to default
    assert.strictEqual(config3.game.password, ''); // Reset to default
  });

  test('should validate port calculation strategy', () => {
    const config = new ServerConfigBuilder('Port Test', 'port-scenario')
      .setBindPort(5000)
      .build();

    // Validate port calculation business logic
    assert.strictEqual(config.bindPort, 5000);
    assert.strictEqual(config.a2s.port, 5001);     // basePort + 1
    assert.strictEqual(config.rcon.port, 5002);    // basePort + 2
    assert.strictEqual(config.publicPort, 5000);   // same as bind port
  });

  test('should handle address resolution correctly', () => {
    // Test default address resolution
    const defaultAddresses = new ServerConfigBuilder('Default', 'scenario')
      .setBindAddress('192.168.1.100')
      .build();

    assert.strictEqual(defaultAddresses.bindAddress, '192.168.1.100');
    assert.strictEqual(defaultAddresses.publicAddress, '192.168.1.100'); // Should match bind

    // Test explicit public address
    const explicitAddresses = new ServerConfigBuilder('Explicit', 'scenario')
      .setBindAddress('192.168.1.100')
      .setPublicAddress('203.0.113.1')
      .build();

    assert.strictEqual(explicitAddresses.bindAddress, '192.168.1.100');
    assert.strictEqual(explicitAddresses.publicAddress, '203.0.113.1'); // Should be explicit
  });

  test('should validate component isolation in builder', () => {
    const builder = new ServerConfigBuilder('Component Test', 'component-scenario');

    // Modify builder state
    builder.setMaxPlayers(96).setPlayerSaveTime(300);

    // Test that component builds don't affect each other
    const gameConfig = builder.buildGameConfig();
    const operatingConfig = builder.buildOperatingConfig();

    assert.strictEqual(gameConfig.maxPlayers, 96);
    assert.strictEqual(operatingConfig.playerSaveTime, 300);

    // Test that components can be built independently with fresh builder
    const freshBuilder = new ServerConfigBuilder('Fresh', 'fresh-scenario');
    const freshGame = freshBuilder.setMaxPlayers(128).buildGameConfig();
    const freshOperating = freshBuilder.buildOperatingConfig();

    assert.strictEqual(freshGame.maxPlayers, 128);
    assert.strictEqual(freshOperating.playerSaveTime, 120); // Default, not affected by game config
  });

  test('should validate all builder methods work correctly', () => {
    const config = new ServerConfigBuilder()
      .setServerName('Method Test')
      .setScenarioId('method-scenario')
      .setBindAddress('10.0.0.1')
      .setBindPort(6000)
      .setPublicAddress('203.0.113.100')
      .setPublicPort(6000)
      .setMaxPlayers(100)
      .setGamePassword('gamepass')
      .setAdminPassword('adminpass')
      .setRconPassword('rconpass')
      .setRconAddress('10.0.0.1')
      .setPlayerSaveTime(90)
      .setAiLimit(25)
      .setCrossPlatform(true)
      .build();

    // Validate all builder methods applied correctly
    assert.strictEqual(config.game.name, 'Method Test');
    assert.strictEqual(config.game.scenarioId, 'method-scenario');
    assert.strictEqual(config.bindAddress, '10.0.0.1');
    assert.strictEqual(config.bindPort, 6000);
    assert.strictEqual(config.publicAddress, '203.0.113.100');
    assert.strictEqual(config.publicPort, 6000);
    assert.strictEqual(config.game.maxPlayers, 100);
    assert.strictEqual(config.game.password, 'gamepass');
    assert.strictEqual(config.game.passwordAdmin, 'adminpass');
    assert.strictEqual(config.rcon.password, 'rconpass');
    assert.strictEqual(config.rcon.address, '10.0.0.1');
    assert.strictEqual(config.operating.playerSaveTime, 90);
    assert.strictEqual(config.operating.aiLimit, 25);
    assert.strictEqual(config.game.crossPlatform, true);
    assert.strictEqual(config.game.supportedPlatforms.length, 3);
  });
});

describe('High-Level Usage - Functional Approach', () => {
  test('should create complete config with minimal parameters', () => {
    const config = createDefaultServerConfig(
      'Minimal Server',
      'minimal-scenario'
    );

    // Validate defaults applied
    assert.strictEqual(config.game.name, 'Minimal Server');
    assert.strictEqual(config.bindAddress, '0.0.0.0'); // Default
    assert.strictEqual(config.bindPort, 2001); // Default
    assert.strictEqual(config.game.maxPlayers, 64); // Default (updated to match wiki)
    assert.strictEqual(config.operating.playerSaveTime, 120); // Default
  });

  test('should create complete config with all parameters', () => {
    const config = createDefaultServerConfig(
      'Full Functional Server',
      'full-functional-scenario',
      '192.168.1.200',
      3001,
      true,
      'full-rcon-password'
    );

    assert.strictEqual(config.game.name, 'Full Functional Server');
    assert.strictEqual(config.bindAddress, '192.168.1.200');
    assert.strictEqual(config.bindPort, 3001);
    assert.strictEqual(config.game.crossPlatform, true);
    assert.strictEqual(config.game.supportedPlatforms.length, 3);
    assert.strictEqual(config.rcon.password, 'full-rcon-password');
  });
});

describe('High-Level Usage - Default Values Validation', () => {
  test('should create unbranded mission header', () => {
    const header = server.createDefaultMissionHeader();
    
    // Validate refactored defaults (no more ATT branding)
    assert.strictEqual(header.m_sName, 'Default Mission');
    assert.strictEqual(header.m_sAuthor, 'Default Author');
    assert.strictEqual(header.m_sSaveFileName, 'defaultSave');
  });

  test('should validate all component defaults', () => {
    const gameConfig = server.createDefaultGameConfig('Test Game', 'test-scenario', false);
    const operatingConfig = server.createDefaultOperatingConfig();
    const a2sConfig = server.createDefaultA2SConfig(2001);
    const rconConfig = server.createDefaultRconConfig(2001, 'test-password');

    // Game config defaults
    assert.strictEqual(gameConfig.maxPlayers, 64); // Updated to match wiki default
    assert.strictEqual(gameConfig.visible, true);
    assert.strictEqual(gameConfig.crossPlatform, false);
    assert.strictEqual(gameConfig.supportedPlatforms.length, 1);

    // Operating config defaults
    assert.strictEqual(operatingConfig.lobbyPlayerSynchronise, true);
    assert.strictEqual(operatingConfig.playerSaveTime, 120);
    assert.strictEqual(operatingConfig.aiLimit, -1);
    assert.strictEqual(operatingConfig.slotReservationTimeout, 60);

    // Port strategy validation
    assert.strictEqual(a2sConfig.port, 2002); // Base + 1
    assert.strictEqual(rconConfig.port, 2003); // Base + 2
  });
});

describe('Cross-Platform Logic Validation', () => {
  test('should handle single platform correctly', () => {
    const config = server.createDefaultGameConfig('Single Platform', 'scenario', false);
    
    assert.strictEqual(config.crossPlatform, false);
    assert.strictEqual(config.supportedPlatforms.length, 1);
    assert.strictEqual(config.supportedPlatforms[0], SupportedPlatform.PC);
  });

  test('should handle cross-platform correctly', () => {
    const config = server.createDefaultGameConfig('Cross Platform', 'scenario', true);
    
    assert.strictEqual(config.crossPlatform, true);
    assert.strictEqual(config.supportedPlatforms.length, 3);
    assert.ok(config.supportedPlatforms.includes(SupportedPlatform.PC));
    assert.ok(config.supportedPlatforms.includes(SupportedPlatform.XBOX));
    assert.ok(config.supportedPlatforms.includes(SupportedPlatform.PLAYSTATION));
  });
});
