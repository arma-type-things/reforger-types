/**
 * Example: Working with Mod Extensions
 * 
 * This example demonstrates how to use the mod extensions to generate
 * workshop URLs and work with mod metadata.
 */

import { 
  createExtendedMod,
  getModWorkshopUrl,
  modIdFromUrl,
  isValidModId,
  WORKSHOP_BASE_URL
} from 'reforger-types';

// Example mod data
const exampleMods = [
  {
    modId: '656AC925A777AE40',
    name: 'ATT Everon PVE',
    version: '1.2.0',
    required: true
  },
  {
    modId: '789DEF123ABC456B',
    name: 'Enhanced Graphics Pack',
    version: '2.1.5',
    required: false
  },
  {
    modId: 'ABCD1234EFGH5678',
    name: 'Tactical Equipment Mod',
    version: '0.9.3',
    required: true
  }
];

console.log('=== Mod Extensions Example ===\n');

// Create extended mods with URL properties
console.log('1. Creating Extended Mods with URLs:');
const extendedMods = exampleMods.map(createExtendedMod);

extendedMods.forEach((mod, index) => {
  console.log(`${index + 1}. ${mod.name}`);
  console.log(`   Mod ID: ${mod.modId}`);
  console.log(`   Version: ${mod.version}`);
  console.log(`   Required: ${mod.required ? 'Yes' : 'No'}`);
  console.log(`   Workshop URL: ${mod.url}`);
  console.log('');
});

// Generate URLs manually
console.log('2. Generating URLs Manually:');
exampleMods.forEach((mod, index) => {
  const url = getModWorkshopUrl(mod);
  console.log(`${index + 1}. ${mod.name}: ${url}`);
});

console.log('\n3. URL Generation with Different Names:');
const modId = '656AC925A777AE40';
const testMod1 = { modId, name: 'mod' };
const testMod2 = { modId, name: 'My Awesome Mod' };
const testMod3 = { modId, name: 'Test: Mod & Special-Characters!' };

console.log(`Default name: ${getModWorkshopUrl(testMod1)}`);
console.log(`Custom name: ${getModWorkshopUrl(testMod2)}`);
console.log(`Special chars: ${getModWorkshopUrl(testMod3)}`);

// Parse mod IDs from URLs
console.log('\n4. Parsing Mod IDs from URLs:');
const sampleUrls = [
  'https://reforger.armaplatform.com/workshop/656AC925A777AE40-ATTEveronPVE',
  'https://reforger.armaplatform.com/workshop/789DEF123ABC456B-EnhancedGraphicsPack',
  'https://invalid-url.com/workshop/123456',
  'https://reforger.armaplatform.com/workshop/invalid-format'
];

sampleUrls.forEach((url, index) => {
  const modId = modIdFromUrl(url);
  console.log(`${index + 1}. ${url}`);
  console.log(`   Parsed Mod ID: ${modId || 'Invalid URL'}`);
  console.log('');
});

// Validate mod IDs
console.log('5. Mod ID Validation:');
const testModIds = [
  '656AC925A777AE40',  // Valid
  '789def123abc456b',  // Invalid (lowercase)
  'ABCD1234EFGH567',   // Invalid (too short)
  'ABCD1234EFGH56789', // Invalid (too long)
  'ABCD1234EFGH567G',  // Invalid (invalid character)
  ''                   // Invalid (empty)
];

testModIds.forEach((modId, index) => {
  const isValid = isValidModId(modId);
  console.log(`${index + 1}. "${modId}" - ${isValid ? '✅ Valid' : '❌ Invalid'}`);
});

// Practical usage: Generate mod list for server configuration
console.log('\n6. Practical Usage: Server Configuration with Mod URLs');
console.log('```json');
console.log(JSON.stringify({
  mods: extendedMods.map(mod => ({
    modId: mod.modId,
    name: mod.name,
    version: mod.version,
    required: mod.required,
    workshopUrl: mod.url  // Extended property for reference
  }))
}, null, 2));
console.log('```');

console.log(`\nWorkshop Base URL: ${WORKSHOP_BASE_URL}`);
console.log('\n=== Example Complete ===');
