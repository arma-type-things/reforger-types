// Mod Extensions Tests for Bun
// @ts-ignore
import { test, expect, describe } from "bun:test";
import { 
  createExtendedMod,
  getModWorkshopUrl,
  modIdFromUrl,
  isValidModId,
  createModListFromUrls,
  WORKSHOP_BASE_URL,
  type Mod,
  type ModExtended
} from '../src/index.js';

describe('Mod Extensions', () => {
  const sampleMod: Mod = {
    modId: '656AC925A777AE40',
    name: 'ATT Everon PVE',
    version: '1.0.0',
    required: true
  };

  describe('createExtendedMod', () => {
    test('should create extended mod with URL property', () => {
      const extendedMod = createExtendedMod(sampleMod);
      
      expect(extendedMod.modId).toBe(sampleMod.modId);
      expect(extendedMod.name).toBe(sampleMod.name);
      expect(extendedMod.version).toBe(sampleMod.version);
      expect(extendedMod.required).toBe(sampleMod.required);
      expect(extendedMod.url).toBe('https://reforger.armaplatform.com/workshop/656AC925A777AE40-ATTEveronPVE');
    });

    test('should handle mods with special characters in name', () => {
      const modWithSpecialChars: Mod = {
        modId: '123ABC456DEF7890',
        name: 'Test Mod: Special & Characters!',
        version: '2.0.0'
      };

      const extendedMod = createExtendedMod(modWithSpecialChars);
      expect(extendedMod.url).toBe('https://reforger.armaplatform.com/workshop/123ABC456DEF7890-TestModSpecialCharacters');
    });

    test('should handle mods with no name gracefully', () => {
      const modWithoutName: Mod = {
        modId: 'ABCD1234EFGH5678',
        name: '',
        version: '1.0.0'
      };

      const extendedMod = createExtendedMod(modWithoutName);
      expect(extendedMod.url).toBe('https://reforger.armaplatform.com/workshop/ABCD1234EFGH5678-mod');
    });
  });

  describe('getModWorkshopUrl', () => {
    test('should generate correct URL with mod object', () => {
      const mod: Mod = { modId: '656AC925A777AE40', name: 'ATT Everon PVE' };
      const url = getModWorkshopUrl(mod);
      expect(url).toBe('https://reforger.armaplatform.com/workshop/656AC925A777AE40-ATTEveronPVE');
    });

    test('should generate URL with mod object without name', () => {
      const mod: Mod = { modId: '656AC925A777AE40', name: '' };
      const url = getModWorkshopUrl(mod);
      expect(url).toBe('https://reforger.armaplatform.com/workshop/656AC925A777AE40-mod');
    });

    test('should sanitize special characters from name', () => {
      const mod: Mod = { modId: 'ABC123DEF456789A', name: 'Test: Mod & Special-Characters!' };
      const url = getModWorkshopUrl(mod);
      expect(url).toBe('https://reforger.armaplatform.com/workshop/ABC123DEF456789A-TestModSpecialCharacters');
    });

    test('should limit name length', () => {
      const longName = 'A'.repeat(100);
      const mod: Mod = { modId: 'ABC123DEF456789A', name: longName };
      const url = getModWorkshopUrl(mod);
      expect(url).toBe(`https://reforger.armaplatform.com/workshop/ABC123DEF456789A-${'A'.repeat(50)}`);
    });
  });

  describe('modIdFromUrl', () => {
    test('should parse mod ID from valid URL', () => {
      const url = 'https://reforger.armaplatform.com/workshop/656AC925A777AE40-ATTEveronPVE';
      const modId = modIdFromUrl(url);
      expect(modId).toBe('656AC925A777AE40');
    });

    test('should parse mod ID from URL with different suffix', () => {
      const url = 'https://reforger.armaplatform.com/workshop/123ABC456DEF7890-SomeOtherMod';
      const modId = modIdFromUrl(url);
      expect(modId).toBe('123ABC456DEF7890');
    });

    test('should return null for invalid URL', () => {
      const invalidUrl = 'https://example.com/invalid';
      const modId = modIdFromUrl(invalidUrl);
      expect(modId).toBe(null);
    });

    test('should return null for malformed workshop URL', () => {
      const malformedUrl = 'https://reforger.armaplatform.com/workshop/invalid-format';
      const modId = modIdFromUrl(malformedUrl);
      expect(modId).toBe(null);
    });
  });

  describe('isValidModId', () => {
    test('should validate correct mod IDs', () => {
      expect(isValidModId('656AC925A777AE40')).toBe(true);
      expect(isValidModId('ABCDEF1234567890')).toBe(true);
      expect(isValidModId('1234567890ABCDEF')).toBe(true);
    });

    test('should reject invalid mod IDs', () => {
      expect(isValidModId('656ac925a777ae40')).toBe(false); // lowercase
      expect(isValidModId('656AC925A777AE4')).toBe(false);  // too short
      expect(isValidModId('656AC925A777AE401')).toBe(false); // too long
      expect(isValidModId('656AC925A777AE4G')).toBe(false);  // invalid character
      expect(isValidModId('')).toBe(false);                   // empty
    });
  });

  describe('WORKSHOP_BASE_URL constant', () => {
    test('should have correct base URL', () => {
      expect(WORKSHOP_BASE_URL).toBe('https://reforger.armaplatform.com/workshop');
    });
  });

  describe('createModListFromUrls', () => {
    test('should create list of BaseMod objects from valid URLs', () => {
      const urls = [
        'https://reforger.armaplatform.com/workshop/656AC925A777AE40-ATTEveronPVE',
        'https://reforger.armaplatform.com/workshop/789DEF123ABC456B-EnhancedGraphicsPack'
      ];
      
      const mods = createModListFromUrls(urls);
      
      expect(mods).toHaveLength(2);
      expect(mods[0].modId).toBe('656AC925A777AE40');
      expect(mods[0].name).toBe('ATTEveronPVE');
      expect(mods[1].modId).toBe('789DEF123ABC456B');
      expect(mods[1].name).toBe('EnhancedGraphicsPack');
      
      // Should not have url property (BaseMod, not ModExtended)
      expect('url' in mods[0]).toBe(false);
    });

    test('should return empty array for empty input', () => {
      expect(createModListFromUrls([])).toEqual([]);
      expect(createModListFromUrls(null as any)).toEqual([]);
    });

    test('should filter out invalid URLs', () => {
      const urls = [
        'https://reforger.armaplatform.com/workshop/656AC925A777AE40-ValidMod',
        'https://invalid-url.com/workshop/invalid',
        'https://reforger.armaplatform.com/workshop/789DEF123ABC456B-AnotherValidMod'
      ];
      
      const mods = createModListFromUrls(urls);
      
      expect(mods).toHaveLength(2);
      expect(mods[0].modId).toBe('656AC925A777AE40');
      expect(mods[1].modId).toBe('789DEF123ABC456B');
    });
  });
});
