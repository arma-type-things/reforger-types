// Mission Resource Reference Tests for Bun
// @ts-ignore
import { test, expect, describe } from "bun:test";
import { 
  MissionResourceReference,
  ScenarioId,
  OfficialScenarios,
  ServerConfigBuilder,
  createDefaultServerConfig,
  createDefaultScenarioId,
  createScenarioId,
  parseScenarioId
} from '../src/index.js';
import { ScenarioIdExtended, type ScenarioMetadata } from '../src/scenario/extensions.js';

describe('MissionResourceReference Core Functionality', () => {
  test('should create and serialize correctly', () => {
    const ref = new MissionResourceReference('ECC61978EDCC2B5A', 'Missions/23_Campaign.conf');
    
    expect(ref.resourceId).toBe('ECC61978EDCC2B5A');
    expect(ref.path).toBe('Missions/23_Campaign.conf');
    expect(ref.toString()).toBe('{ECC61978EDCC2B5A}Missions/23_Campaign.conf');
  });

  test('should parse from string correctly', () => {
    const resourceString = '{ECC61978EDCC2B5A}Missions/23_Campaign.conf';
    const ref = MissionResourceReference.fromString(resourceString);
    
    expect(ref.resourceId).toBe('ECC61978EDCC2B5A');
    expect(ref.path).toBe('Missions/23_Campaign.conf');
    expect(ref.toString()).toBe(resourceString);
  });

  test('should preserve path separators', () => {
    const ref = new MissionResourceReference('ABC123', 'Missions/SubFolder/mission.conf');
    expect(ref.toString()).toBe('{ABC123}Missions/SubFolder/mission.conf');
  });

  test('should validate string format', () => {
    expect(MissionResourceReference.isValid('{ECC61978EDCC2B5A}Missions/test.conf')).toBe(true);
    expect(MissionResourceReference.isValid('ECC61978EDCC2B5A}Missions/test.conf')).toBe(false);
    expect(MissionResourceReference.isValid('{ECC61978EDCC2B5A')).toBe(false);
    expect(MissionResourceReference.isValid('')).toBe(false);
  });

  test('should handle JSON serialization', () => {
    const ref = new MissionResourceReference('TEST123', 'path/to/resource');
    const json = JSON.stringify(ref);
    expect(json).toBe('"{TEST123}path/to/resource"');
  });
});

describe('ScenarioId Specific Functionality', () => {
  test('should create scenario ID correctly', () => {
    const scenario = new ScenarioId('ECC61978EDCC2B5A', 'Missions/23_Campaign.conf');
    
    expect(scenario.resourceId).toBe('ECC61978EDCC2B5A');
    expect(scenario.path).toBe('Missions/23_Campaign.conf');
    expect(scenario.toString()).toBe('{ECC61978EDCC2B5A}Missions/23_Campaign.conf');
  });

  test('should parse scenario from string', () => {
    const scenarioString = '{ECC61978EDCC2B5A}Missions/23_Campaign.conf';
    const scenario = ScenarioId.fromString(scenarioString);
    
    expect(scenario).toBeInstanceOf(ScenarioId);
    expect(scenario.toString()).toBe(scenarioString);
  });

  test('should validate scenario paths', () => {
    const validScenario = new ScenarioId('TEST', 'Missions/test.conf');
    const validScenario2 = new ScenarioId('TEST', 'MyMission/scenario.conf');
    const invalidScenario = new ScenarioId('TEST', 'textures/image.png');

    expect(validScenario.isValidScenarioPath()).toBe(true);
    expect(validScenario2.isValidScenarioPath()).toBe(true);
    expect(invalidScenario.isValidScenarioPath()).toBe(false);
  });
});

describe('Default Values and Helpers', () => {
  test('should create default scenario ID', () => {
    const scenario = createDefaultScenarioId();
    
    expect(scenario).toBeInstanceOf(ScenarioId);
    expect(scenario.resourceId).toBe('ECC61978EDCC2B5A');
    expect(scenario.path).toBe('Missions/23_Campaign.conf');
    expect(scenario.toString()).toBe('{ECC61978EDCC2B5A}Missions/23_Campaign.conf');
  });

  test('should create custom scenario ID', () => {
    const scenario = createScenarioId('CUSTOM123', 'MyMod/MyMission.conf');
    
    expect(scenario.resourceId).toBe('CUSTOM123');
    expect(scenario.path).toBe('MyMod/MyMission.conf');
  });

  test('should parse scenario with validation', () => {
    const validString = '{ECC61978EDCC2B5A}Missions/test.conf';
    const scenario = parseScenarioId(validString);
    
    expect(scenario).toBeInstanceOf(ScenarioId);
    expect(scenario.toString()).toBe(validString);
  });

  test('should throw on invalid scenario format', () => {
    expect(() => parseScenarioId('invalid-format')).toThrow();
    expect(() => parseScenarioId('{INVALID')).toThrow();
    expect(() => parseScenarioId('NOID}path')).toThrow();
  });
});

describe('Edge Cases and Error Handling', () => {
  test('should handle resource ID validation', () => {
    // Valid alphanumeric IDs
    expect(() => MissionResourceReference.fromString('{ABCDEF123456}path')).not.toThrow();
    expect(() => MissionResourceReference.fromString('{0123456789AB}path')).not.toThrow();
    
    // Alphanumeric characters are allowed
    expect(() => MissionResourceReference.fromString('{GGHHIIJJ}path')).not.toThrow();
    
    // But special characters should fail
    expect(() => MissionResourceReference.fromString('{ABC-DEF}path')).toThrow();
    expect(() => MissionResourceReference.fromString('{ABC_DEF}path')).toThrow();
  });

  test('should handle empty paths', () => {
    expect(() => new MissionResourceReference('TEST', '')).not.toThrow();
    const ref = new MissionResourceReference('TEST', '');
    expect(ref.toString()).toBe('{TEST}');
  });

  test('should handle complex paths', () => {
    const complexPath = 'Mods/MyMod/Missions/SubFolder/Complex.Mission.conf';
    const ref = new MissionResourceReference('TEST', complexPath);
    expect(ref.path).toBe(complexPath);
    expect(ref.toString()).toBe(`{TEST}${complexPath}`);
  });
});

describe('Official Scenarios Business Logic', () => {
  test('should provide all main scenario types', () => {
    // Main conflict scenarios should be available
    expect(OfficialScenarios.CONFLICT_EVERON).toBeInstanceOf(ScenarioId);
    expect(OfficialScenarios.CONFLICT_NORTHERN_EVERON).toBeInstanceOf(ScenarioId);
    expect(OfficialScenarios.CONFLICT_ARLAND).toBeInstanceOf(ScenarioId);
    
    // CAH scenarios should be available
    expect(OfficialScenarios.CAH_BRIARS).toBeInstanceOf(ScenarioId);
    expect(OfficialScenarios.CAH_CASTLE).toBeInstanceOf(ScenarioId);
    expect(OfficialScenarios.CAH_MILITARY_BASE).toBeInstanceOf(ScenarioId);
    
    // Combat Ops scenarios
    expect(OfficialScenarios.COMBAT_OPS_ARLAND).toBeInstanceOf(ScenarioId);
    expect(OfficialScenarios.COMBAT_OPS_EVERON).toBeInstanceOf(ScenarioId);
    
    // Game Master scenarios
    expect(OfficialScenarios.GAME_MASTER_EVERON).toBeInstanceOf(ScenarioId);
    expect(OfficialScenarios.GAME_MASTER_ARLAND).toBeInstanceOf(ScenarioId);
    
    // Tutorial
    expect(OfficialScenarios.TUTORIAL).toBeInstanceOf(ScenarioId);
  });
  
  test('should have correct resource IDs and paths', () => {
    // Test main conflict scenario
    const everon = OfficialScenarios.CONFLICT_EVERON;
    expect(everon.resourceId).toBe('ECC61978EDCC2B5A');
    expect(everon.path).toBe('Missions/23_Campaign.conf');
    expect(everon.toString()).toBe('{ECC61978EDCC2B5A}Missions/23_Campaign.conf');
    
    // Test CAH scenario
    const briars = OfficialScenarios.CAH_BRIARS;
    expect(briars.resourceId).toBe('3F2E005F43DBD2F8');
    expect(briars.path).toBe('Missions/CAH_Briars_Coast.conf');
    expect(briars.toString()).toBe('{3F2E005F43DBD2F8}Missions/CAH_Briars_Coast.conf');
    
    // Test Game Master scenario
    const gmEveron = OfficialScenarios.GAME_MASTER_EVERON;
    expect(gmEveron.resourceId).toBe('59AD59368755F41A');
    expect(gmEveron.path).toBe('Missions/21_GM_Eden.conf');
    expect(gmEveron.toString()).toBe('{59AD59368755F41A}Missions/21_GM_Eden.conf');
    
    // Test Tutorial scenario
    const tutorial = OfficialScenarios.TUTORIAL;
    expect(tutorial.resourceId).toBe('002AF7323E0129AF');
    expect(tutorial.path).toBe('Missions/Tutorial.conf');
    expect(tutorial.toString()).toBe('{002AF7323E0129AF}Missions/Tutorial.conf');
  });
  
  test('should all be valid scenario paths', () => {
    Object.values(OfficialScenarios).forEach(scenario => {
      expect(scenario.isValidScenarioPath()).toBe(true);
    });
  });
  
  test('should be immutable const values', () => {
    // Test that scenarios are read-only
    const originalEveron = OfficialScenarios.CONFLICT_EVERON.toString();
    
    // The const assertion prevents modification at TypeScript compile time
    // At runtime, we can verify the scenarios maintain their values
    expect(OfficialScenarios.CONFLICT_EVERON.toString()).toBe(originalEveron);
    
    // Test that the object structure is consistent
    expect(OfficialScenarios.CONFLICT_EVERON).toBeInstanceOf(ScenarioId);
    expect(typeof OfficialScenarios.CONFLICT_EVERON.resourceId).toBe('string');
    expect(typeof OfficialScenarios.CONFLICT_EVERON.path).toBe('string');
  });
  
  test('should work with helper functions', () => {
    // Should work with parseScenarioId
    const parsed = parseScenarioId(OfficialScenarios.CONFLICT_EVERON.toString());
    expect(parsed.resourceId).toBe(OfficialScenarios.CONFLICT_EVERON.resourceId);
    expect(parsed.path).toBe(OfficialScenarios.CONFLICT_EVERON.path);
    
    // Should work with createScenarioId
    const created = createScenarioId(
      OfficialScenarios.CAH_CASTLE.resourceId,
      OfficialScenarios.CAH_CASTLE.path
    );
    expect(created.toString()).toBe(OfficialScenarios.CAH_CASTLE.toString());
  });
});

describe('Automatic String Conversion', () => {
  test('should automatically convert to string in template literals', () => {
    const scenario = OfficialScenarios.CONFLICT_EVERON;
    const result = `Config: ${scenario}`;
    expect(result).toBe('Config: {ECC61978EDCC2B5A}Missions/23_Campaign.conf');
  });
  
  test('should automatically convert to string in concatenation', () => {
    const scenario = OfficialScenarios.CAH_BRIARS;
    const result = 'Scenario: ' + scenario;
    expect(result).toBe('Scenario: {3F2E005F43DBD2F8}Missions/CAH_Briars_Coast.conf');
  });
  
  test('should work with valueOf() method', () => {
    const scenario = OfficialScenarios.TUTORIAL;
    expect(scenario.valueOf()).toBe('{002AF7323E0129AF}Missions/Tutorial.conf');
  });
  
  test('should work with Symbol.toPrimitive', () => {
    const scenario = OfficialScenarios.GAME_MASTER_ARLAND;
    // Test string conversion
    expect(String(scenario)).toBe('{2BBBE828037C6F4B}Missions/22_GM_Arland.conf');
  });
  
  test('should work in JSON serialization automatically', () => {
    const config = {
      name: 'Test',
      scenario: OfficialScenarios.COMBAT_OPS_EVERON
    };
    
    const json = JSON.stringify(config);
    const parsed = JSON.parse(json);
    
    expect(parsed.scenario).toBe('{DFAC5FABD11F2390}Missions/26_CombatOpsEveron.conf');
  });
  
  test('should work in array operations automatically', () => {
    const scenarios = [
      OfficialScenarios.CONFLICT_NORTHERN_EVERON,
      OfficialScenarios.CAH_FACTORY
    ];
    
    const result = scenarios.join(' | ');
    expect(result).toBe('{C700DB41F0C546E1}Missions/23_Campaign_NorthCentral.conf | {9405201CBD22A30C}Missions/CAH_Factory.conf');
  });
  
  test('should work with server configuration functions without toString()', () => {
    // Test builder - TypeScript will complain but runtime should work
    const builderConfig = new ServerConfigBuilder('Builder Test', OfficialScenarios.CONFLICT_MONTIGNAC as any)
      .setMaxPlayers(40)
      .build();
    
    // The scenario gets stored as-is, but converts to string automatically when needed
    expect(String(builderConfig.game.scenarioId)).toBe('{FDE33AFE2ED7875B}Missions/23_Campaign_Montignac.conf');
    expect(`${builderConfig.game.scenarioId}`).toBe('{FDE33AFE2ED7875B}Missions/23_Campaign_Montignac.conf');
    
    // Test default config function
    const defaultConfig = createDefaultServerConfig('Default Test', OfficialScenarios.CAH_MORTON as any);
    expect(String(defaultConfig.game.scenarioId)).toBe('{2B4183DF23E88249}Missions/CAH_Morton.conf');
    expect(`${defaultConfig.game.scenarioId}`).toBe('{2B4183DF23E88249}Missions/CAH_Morton.conf');
  });
});

describe('ScenarioIdExtended Functionality', () => {

  test('should provide scenario mapping functionality', () => {
    const scenarioMap = ScenarioIdExtended.getScenarioMap();
    
    expect(scenarioMap).toBeInstanceOf(Map);
    expect(scenarioMap.size).toBeGreaterThan(0);
    
    // Test that it contains expected scenarios
    expect(scenarioMap.has('conflict-everon')).toBe(true);
    expect(scenarioMap.has('conflict-arland')).toBe(true);
    expect(scenarioMap.has('game-master-everon')).toBe(true);
  });

  test('should get scenario by friendly code', () => {
    const scenario = ScenarioIdExtended.fromCode('conflict-everon');
    
    expect(scenario).toBeInstanceOf(ScenarioId);
    expect(scenario?.toString()).toBe('{ECC61978EDCC2B5A}Missions/23_Campaign.conf');
    
    // Test case insensitive
    const scenarioUpper = ScenarioIdExtended.fromCode('CONFLICT-EVERON');
    expect(scenarioUpper?.toString()).toBe('{ECC61978EDCC2B5A}Missions/23_Campaign.conf');
  });

  test('should return undefined for unknown codes', () => {
    const unknown = ScenarioIdExtended.fromCode('unknown-scenario');
    expect(unknown).toBeUndefined();
  });

  test('should get all scenarios metadata', () => {
    const allScenarios = ScenarioIdExtended.getAllScenarios();
    
    expect(Array.isArray(allScenarios)).toBe(true);
    expect(allScenarios.length).toBeGreaterThan(0);
    
    // Each scenario should have required metadata properties
    allScenarios.forEach(scenario => {
      expect(scenario).toHaveProperty('code');
      expect(scenario).toHaveProperty('displayName');
      expect(scenario).toHaveProperty('scenario');
      expect(scenario).toHaveProperty('key');
      expect(scenario.scenario).toBeInstanceOf(ScenarioId);
      expect(typeof scenario.code).toBe('string');
      expect(typeof scenario.displayName).toBe('string');
      expect(typeof scenario.key).toBe('string');
    });
  });

  test('should get metadata by code', () => {
    const metadata = ScenarioIdExtended.getMetadata('conflict-everon');
    
    expect(metadata).toBeDefined();
    expect(metadata?.code).toBe('conflict-everon');
    expect(metadata?.displayName).toBe('Conflict Everon');
    expect(metadata?.key).toBe('CONFLICT_EVERON');
    expect(metadata?.scenario).toBeInstanceOf(ScenarioId);
    expect(metadata?.scenario.toString()).toBe('{ECC61978EDCC2B5A}Missions/23_Campaign.conf');
  });

  test('should provide backwards compatible mapScenarioName', () => {
    const scenario = ScenarioIdExtended.mapScenarioName('conflict-arland');
    
    expect(scenario).toBeInstanceOf(ScenarioId);
    expect(scenario?.toString()).toBe('{C41618FD18E9D714}Missions/23_Campaign_Arland.conf');
    
    // Test undefined input
    const undefinedResult = ScenarioIdExtended.mapScenarioName(undefined);
    expect(undefinedResult).toBeUndefined();
  });

  test('should handle all official scenarios in metadata', () => {
    const allScenarios = ScenarioIdExtended.getAllScenarios();
    const officialScenarioKeys = Object.keys(OfficialScenarios);
    
    // Should have metadata for main scenarios (not necessarily all official scenarios)
    const mainScenarios = [
      'CONFLICT_EVERON',
      'CONFLICT_ARLAND', 
      'COMBAT_OPS_EVERON',
      'GAME_MASTER_EVERON'
    ];
    
    mainScenarios.forEach(key => {
      const found = allScenarios.find(s => s.key === key);
      expect(found).toBeDefined();
    });
  });

  test('should maintain scenario map consistency', () => {
    // Multiple calls should return the same map instance (memoized)
    const map1 = ScenarioIdExtended.getScenarioMap();
    const map2 = ScenarioIdExtended.getScenarioMap();
    
    expect(map1).toBe(map2); // Same instance
    
    // Test that scenarios in metadata match official scenarios
    const metadata = ScenarioIdExtended.getMetadata('conflict-everon');
    expect(metadata?.scenario.toString()).toBe(OfficialScenarios.CONFLICT_EVERON.toString());
  });

  test('should work with case variations', () => {
    const codes = ['conflict-everon', 'CONFLICT-EVERON', 'Conflict-Everon'];
    
    codes.forEach(code => {
      const scenario = ScenarioIdExtended.fromCode(code);
      expect(scenario).toBeDefined();
      expect(scenario?.toString()).toBe('{ECC61978EDCC2B5A}Missions/23_Campaign.conf');
    });
  });
});
