// Mod Extensions Tests for Node.js ES Modules
import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { 
  createExtendedMod,
  getModWorkshopUrl,
  modIdFromUrl,
  isValidModId,
  createModListFromUrls,
  WORKSHOP_BASE_URL
} from '../dist/index.js';

describe('Mod Extensions ES Module Tests', () => {
  const sampleMod = {
    modId: '656AC925A777AE40',
    name: 'ATT Everon PVE',
    version: '1.0.0',
    required: true
  };

  describe('createExtendedMod', () => {
    test('should create extended mod with URL property', () => {
      const extendedMod = createExtendedMod(sampleMod);
      
      assert.equal(extendedMod.modId, sampleMod.modId);
      assert.equal(extendedMod.name, sampleMod.name);
      assert.equal(extendedMod.version, sampleMod.version);
      assert.equal(extendedMod.required, sampleMod.required);
      assert.equal(extendedMod.url, 'https://reforger.armaplatform.com/workshop/656AC925A777AE40-ATTEveronPVE');
    });

    test('should handle mods with special characters in name', () => {
      const modWithSpecialChars = {
        modId: '123ABC456DEF7890',
        name: 'Test Mod: Special & Characters!',
        version: '2.0.0'
      };

      const extendedMod = createExtendedMod(modWithSpecialChars);
      assert.equal(extendedMod.url, 'https://reforger.armaplatform.com/workshop/123ABC456DEF7890-TestModSpecialCharacters');
    });

    test('should handle mods with no name gracefully', () => {
      const modWithoutName = {
        modId: 'ABCD1234EFGH5678',
        name: '',
        version: '1.0.0'
      };

      const extendedMod = createExtendedMod(modWithoutName);
      assert.equal(extendedMod.url, 'https://reforger.armaplatform.com/workshop/ABCD1234EFGH5678-mod');
    });
  });

  describe('getModWorkshopUrl', () => {
    test('should generate correct URL with mod object', () => {
      const mod = { modId: '656AC925A777AE40', name: 'ATT Everon PVE' };
      const url = getModWorkshopUrl(mod);
      assert.equal(url, 'https://reforger.armaplatform.com/workshop/656AC925A777AE40-ATTEveronPVE');
    });

    test('should generate URL with mod object without name', () => {
      const mod = { modId: '656AC925A777AE40', name: '' };
      const url = getModWorkshopUrl(mod);
      assert.equal(url, 'https://reforger.armaplatform.com/workshop/656AC925A777AE40-mod');
    });

    test('should sanitize special characters from name', () => {
      const mod = { modId: 'ABC123DEF456789A', name: 'Test: Mod & Special-Characters!' };
      const url = getModWorkshopUrl(mod);
      assert.equal(url, 'https://reforger.armaplatform.com/workshop/ABC123DEF456789A-TestModSpecialCharacters');
    });

    test('should limit name length', () => {
      const longName = 'A'.repeat(100);
      const mod = { modId: 'ABC123DEF456789A', name: longName };
      const url = getModWorkshopUrl(mod);
      assert.equal(url, `https://reforger.armaplatform.com/workshop/ABC123DEF456789A-${'A'.repeat(50)}`);
    });
  });

  describe('modIdFromUrl', () => {
    test('should parse mod ID from valid URL', () => {
      const url = 'https://reforger.armaplatform.com/workshop/656AC925A777AE40-ATTEveronPVE';
      const modId = modIdFromUrl(url);
      assert.equal(modId, '656AC925A777AE40');
    });

    test('should parse mod ID from URL with different suffix', () => {
      const url = 'https://reforger.armaplatform.com/workshop/123ABC456DEF7890-SomeOtherMod';
      const modId = modIdFromUrl(url);
      assert.equal(modId, '123ABC456DEF7890');
    });

    test('should return null for invalid URL', () => {
      const invalidUrl = 'https://example.com/invalid';
      const modId = modIdFromUrl(invalidUrl);
      assert.equal(modId, null);
    });

    test('should return null for malformed workshop URL', () => {
      const malformedUrl = 'https://reforger.armaplatform.com/workshop/invalid-format';
      const modId = modIdFromUrl(malformedUrl);
      assert.equal(modId, null);
    });
  });

  describe('isValidModId', () => {
    test('should validate correct mod IDs', () => {
      assert.equal(isValidModId('656AC925A777AE40'), true);
      assert.equal(isValidModId('ABCDEF1234567890'), true);
      assert.equal(isValidModId('1234567890ABCDEF'), true);
    });

    test('should reject invalid mod IDs', () => {
      assert.equal(isValidModId('656ac925a777ae40'), false); // lowercase
      assert.equal(isValidModId('656AC925A777AE4'), false);  // too short
      assert.equal(isValidModId('656AC925A777AE401'), false); // too long
      assert.equal(isValidModId('656AC925A777AE4G'), false);  // invalid character
      assert.equal(isValidModId(''), false);                   // empty
    });
  });

  describe('WORKSHOP_BASE_URL constant', () => {
    test('should have correct base URL', () => {
      assert.equal(WORKSHOP_BASE_URL, 'https://reforger.armaplatform.com/workshop');
    });
  });

  describe('createModListFromUrls', () => {
    test('should create list of BaseMod objects from valid URLs', () => {
      const urls = [
        'https://reforger.armaplatform.com/workshop/656AC925A777AE40-ATTEveronPVE',
        'https://reforger.armaplatform.com/workshop/789DEF123ABC456B-EnhancedGraphicsPack'
      ];
      
      const mods = createModListFromUrls(urls);
      
      assert.equal(mods.length, 2);
      assert.equal(mods[0].modId, '656AC925A777AE40');
      assert.equal(mods[0].name, 'ATTEveronPVE');
      assert.equal(mods[1].modId, '789DEF123ABC456B');
      assert.equal(mods[1].name, 'EnhancedGraphicsPack');
      
      // Should not have url property (BaseMod, not ModExtended)
      assert.equal('url' in mods[0], false);
    });

    test('should return empty array for empty input', () => {
      assert.deepEqual(createModListFromUrls([]), []);
      assert.deepEqual(createModListFromUrls(null), []);
    });

    test('should filter out invalid URLs', () => {
      const urls = [
        'https://reforger.armaplatform.com/workshop/656AC925A777AE40-ValidMod',
        'https://invalid-url.com/workshop/invalid',
        'https://reforger.armaplatform.com/workshop/789DEF123ABC456B-AnotherValidMod'
      ];
      
      const mods = createModListFromUrls(urls);
      
      assert.equal(mods.length, 2);
      assert.equal(mods[0].modId, '656AC925A777AE40');
      assert.equal(mods[1].modId, '789DEF123ABC456B');
    });
  });
});
