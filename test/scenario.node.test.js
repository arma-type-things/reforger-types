// ES Module Export Tests for Scenario
import { test, describe } from 'node:test';
import assert from 'node:assert';
import { 
  // Namespace export
  scenario,
  // Direct exports
  MissionResourceReference,
  ScenarioId,
  OfficialScenarios,
  createDefaultScenarioId,
  createScenarioId,
  parseScenarioId
} from '../dist/index.js';

describe('Scenario ES Module Exports', () => {
  test('should export scenario namespace', () => {
    assert.strictEqual(typeof scenario, 'object');
    assert.strictEqual(typeof scenario.MissionResourceReference, 'function');
    assert.strictEqual(typeof scenario.ScenarioId, 'function');
    assert.strictEqual(typeof scenario.createDefaultScenarioId, 'function');
  });

  test('should export direct convenience classes and functions', () => {
    assert.strictEqual(typeof MissionResourceReference, 'function');
    assert.strictEqual(typeof ScenarioId, 'function');
    assert.strictEqual(typeof OfficialScenarios, 'object');
    assert.strictEqual(typeof createDefaultScenarioId, 'function');
    assert.strictEqual(typeof createScenarioId, 'function');
    assert.strictEqual(typeof parseScenarioId, 'function');
  });
});

describe('High-Level Scenario Usage', () => {
  test('should create and work with scenario IDs', () => {
    // Test default scenario creation
    const defaultScenario = createDefaultScenarioId();
    assert.ok(defaultScenario instanceof ScenarioId);
    assert.strictEqual(defaultScenario.resourceId, 'ECC61978EDCC2B5A');
    assert.strictEqual(defaultScenario.toString(), '{ECC61978EDCC2B5A}Missions/23_Campaign.conf');

    // Test custom scenario creation
    const customScenario = createScenarioId('CUSTOM123', 'MyMissions/CustomMission.conf');
    assert.strictEqual(customScenario.toString(), '{CUSTOM123}MyMissions/CustomMission.conf');
  });

  test('should handle string parsing and validation', () => {
    const scenarioString = '{ECC61978EDCC2B5A}Missions/TestMission.conf';
    
    // Test parsing
    const parsed = parseScenarioId(scenarioString);
    assert.ok(parsed instanceof ScenarioId);
    assert.strictEqual(parsed.toString(), scenarioString);
    
    // Test validation
    assert.ok(MissionResourceReference.isValid(scenarioString));
    assert.ok(!MissionResourceReference.isValid('invalid-format'));
  });

  test('should integrate with server configuration concept', () => {
    // Demonstrate how this would integrate with existing server config
    const scenario = createDefaultScenarioId();
    const scenarioIdString = scenario.toString();
    
    // This string can be used in server configuration
    assert.strictEqual(typeof scenarioIdString, 'string');
    assert.ok(scenarioIdString.startsWith('{'));
    assert.ok(scenarioIdString.includes('}'));
    
    // And can be parsed back to object form
    const reparsed = ScenarioId.fromString(scenarioIdString);
    assert.strictEqual(reparsed.toString(), scenarioIdString);
  });

  test('should handle JSON serialization for config files', () => {
    const scenario = createScenarioId('TEST123', 'Missions/Test.conf');
    
    // Test that it serializes to a string for JSON
    const json = JSON.stringify({ scenarioId: scenario });
    assert.strictEqual(json, '{"scenarioId":"{TEST123}Missions/Test.conf"}');
    
    // And can be used in config objects
    const config = {
      serverName: 'Test Server',
      scenarioId: scenario.toString(),
      port: 2001
    };
    
    assert.strictEqual(config.scenarioId, '{TEST123}Missions/Test.conf');
  });
});

describe('Official Scenarios', () => {
  test('should export OfficialScenarios enum with proper structure', () => {
    assert.strictEqual(typeof OfficialScenarios, 'object');
    
    // Test main conflict scenarios
    assert.ok(OfficialScenarios.CONFLICT_EVERON instanceof ScenarioId);
    assert.strictEqual(OfficialScenarios.CONFLICT_EVERON.resourceId, 'ECC61978EDCC2B5A');
    assert.strictEqual(OfficialScenarios.CONFLICT_EVERON.path, 'Missions/23_Campaign.conf');
    assert.strictEqual(OfficialScenarios.CONFLICT_EVERON.toString(), '{ECC61978EDCC2B5A}Missions/23_Campaign.conf');
    
    // Test CAH scenarios
    assert.ok(OfficialScenarios.CAH_BRIARS instanceof ScenarioId);
    assert.strictEqual(OfficialScenarios.CAH_BRIARS.toString(), '{3F2E005F43DBD2F8}Missions/CAH_Briars_Coast.conf');
    
    // Test Game Master scenarios
    assert.ok(OfficialScenarios.GAME_MASTER_EVERON instanceof ScenarioId);
    assert.strictEqual(OfficialScenarios.GAME_MASTER_EVERON.toString(), '{59AD59368755F41A}Missions/21_GM_Eden.conf');
    
    // Test Tutorial scenario
    assert.ok(OfficialScenarios.TUTORIAL instanceof ScenarioId);
    assert.strictEqual(OfficialScenarios.TUTORIAL.toString(), '{002AF7323E0129AF}Missions/Tutorial.conf');
  });
  
  test('should be usable with server configuration', async () => {
    const { ServerConfigBuilder } = await import('../dist/index.js');
    
    // Use official scenario with builder
    const config = new ServerConfigBuilder('Official Server', OfficialScenarios.CONFLICT_EVERON.toString())
      .setMaxPlayers(64)
      .build();
    
    assert.strictEqual(config.game.name, 'Official Server');
    assert.strictEqual(config.game.scenarioId, '{ECC61978EDCC2B5A}Missions/23_Campaign.conf');
    assert.strictEqual(config.game.maxPlayers, 64);
  });
  
  test('should contain expected number of scenarios', () => {
    const scenarioKeys = Object.keys(OfficialScenarios);
    // Should have 19 scenarios (excluding SP01_ single-player scenarios)
    assert.strictEqual(scenarioKeys.length, 19);
    
    // Should include all major categories
    const conflictScenarios = scenarioKeys.filter(key => key.startsWith('CONFLICT_'));
    const cahScenarios = scenarioKeys.filter(key => key.startsWith('CAH_'));
    const combatOpsScenarios = scenarioKeys.filter(key => key.startsWith('COMBAT_OPS_'));
    const gameMasterScenarios = scenarioKeys.filter(key => key.startsWith('GAME_MASTER_'));
    
    assert.strictEqual(conflictScenarios.length, 6); // 6 conflict variants
    assert.strictEqual(cahScenarios.length, 8); // 8 capture & hold scenarios
    assert.strictEqual(combatOpsScenarios.length, 2); // 2 combat ops scenarios
    assert.strictEqual(gameMasterScenarios.length, 2); // 2 game master scenarios
    // Plus 1 tutorial scenario = 19 total
  });
});

describe('Automatic String Conversion', () => {
  test('should work in template literals without toString()', () => {
    const scenario = OfficialScenarios.CONFLICT_EVERON;
    const result = `Scenario: ${scenario}`;
    assert.strictEqual(result, 'Scenario: {ECC61978EDCC2B5A}Missions/23_Campaign.conf');
  });
  
  test('should work in string concatenation without toString()', () => {
    const scenario = OfficialScenarios.CAH_CASTLE;
    const result = 'Scenario: ' + scenario;
    assert.strictEqual(result, 'Scenario: {F1A1BEA67132113E}Missions/CAH_Castle.conf');
  });
  
  test('should work with ServerConfigBuilder without toString()', async () => {
    const { ServerConfigBuilder } = await import('../dist/index.js');
    
    // This should work without .toString()
    const config = new ServerConfigBuilder('Test Server', OfficialScenarios.TUTORIAL)
      .setMaxPlayers(16)
      .build();
    
    assert.strictEqual(config.game.name, 'Test Server');
    // The scenario gets stored as-is, but converts to string automatically when needed
    assert.strictEqual(String(config.game.scenarioId), '{002AF7323E0129AF}Missions/Tutorial.conf');
    assert.strictEqual(`${config.game.scenarioId}`, '{002AF7323E0129AF}Missions/Tutorial.conf');
    assert.strictEqual(config.game.maxPlayers, 16);
  });
  
  test('should work with createDefaultServerConfig without toString()', async () => {
    const { createDefaultServerConfig } = await import('../dist/index.js');
    
    // This should work without .toString()
    const config = createDefaultServerConfig('Default Test', OfficialScenarios.COMBAT_OPS_ARLAND);
    
    assert.strictEqual(config.game.name, 'Default Test');
    // The scenario gets stored as-is, but converts to string automatically when needed
    assert.strictEqual(String(config.game.scenarioId), '{DAA03C6E6099D50F}Missions/24_CombatOps.conf');
    assert.strictEqual(`${config.game.scenarioId}`, '{DAA03C6E6099D50F}Missions/24_CombatOps.conf');
  });
  
  test('should work in JSON serialization', () => {
    const config = {
      serverName: 'Test Server',
      scenarioId: OfficialScenarios.GAME_MASTER_EVERON
    };
    
    const json = JSON.stringify(config);
    const parsed = JSON.parse(json);
    
    assert.strictEqual(parsed.scenarioId, '{59AD59368755F41A}Missions/21_GM_Eden.conf');
  });
  
  test('should work in array operations', () => {
    const scenarios = [
      OfficialScenarios.CONFLICT_EVERON,
      OfficialScenarios.CAH_MILITARY_BASE
    ];
    
    const joined = scenarios.join(', ');
    assert.strictEqual(joined, '{ECC61978EDCC2B5A}Missions/23_Campaign.conf, {6EA2E454519E5869}Missions/CAH_Military_Base.conf');
  });
});

describe('Interoperability with Server Namespace', () => {
  test('should work with existing server builder pattern', async () => {
    // Import server types
    const { ServerConfigBuilder } = await import('../dist/index.js');
    
    // Create a scenario ID
    const scenario = createScenarioId('INTEROP123', 'Missions/InteropTest.conf');
    
    // Use it with the server builder
    const config = new ServerConfigBuilder('Interop Server', scenario.toString())
      .setBindPort(3001)
      .build();
    
    assert.strictEqual(config.game.name, 'Interop Server');
    assert.strictEqual(config.game.scenarioId, '{INTEROP123}Missions/InteropTest.conf');
    assert.strictEqual(config.bindPort, 3001);
  });
});
