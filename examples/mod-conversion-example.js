#!/usr/bin/env node

/**
 * Example: Mod URL Conversion & Utilities
 * 
 * This example demonstrates advanced mod utilities for converting between
 * workshop URLs and mod objects, including extended mod functionality.
 */

import { 
  createModExtendedFromUrl,
  createModExtendedListFromUrls,
  createModListFromUrls,
  toBaseMod,
  toBaseModList,
  getEffectiveModName
} from 'reforger-types';

console.log('=== Mod URL Conversion Example ===\n');

// Sample workshop URLs
const workshopUrls = [
  'https://reforger.armaplatform.com/workshop/656AC925A777AE40-ATTEveronPVE',
  'https://reforger.armaplatform.com/workshop/789DEF123ABC456B-EnhancedGraphicsPack',
  'https://reforger.armaplatform.com/workshop/ABCD1234EFAB5678-TacticalEquipmentMod', // Valid hex (changed GH to AB)
  'https://invalid-url.com/workshop/123456', // Invalid URL to test filtering
  'https://reforger.armaplatform.com/workshop/invalid-format' // Invalid format
];

// 1. Create extended mods from URLs
console.log('1. Creating Extended Mods from URLs:');
const extendedMods = createModExtendedListFromUrls(workshopUrls);

extendedMods.forEach((mod, index) => {
  console.log(`${index + 1}. ${getEffectiveModName(mod)}`);
  console.log(`   Mod ID: ${mod.modId}`);
  console.log(`   Name: ${mod.name || 'Not specified'}`);
  console.log(`   Workshop URL: ${mod.url}`);
  console.log('');
});

console.log(`✅ Successfully created ${extendedMods.length} extended mods from ${workshopUrls.length} URLs\n`);

// 2. Create base mods from URLs (simpler objects)
console.log('2. Creating Base Mod Objects from URLs:');
const baseMods = createModListFromUrls(workshopUrls);

baseMods.forEach((mod, index) => {
  console.log(`${index + 1}. ${getEffectiveModName(mod)} (${mod.modId})`);
});

console.log(`✅ Successfully created ${baseMods.length} base mods\n`);

// 3. Demonstrate single URL conversion
console.log('3. Single URL Conversion:');
const singleUrl = 'https://reforger.armaplatform.com/workshop/656AC925A777AE40-MyCustomMod';
const singleMod = createModExtendedFromUrl(singleUrl);

if (singleMod) {
  console.log(`✅ Converted URL to mod:`);
  console.log(`   Name: ${getEffectiveModName(singleMod)}`);
  console.log(`   Mod ID: ${singleMod.modId}`);
  console.log(`   URL: ${singleMod.url}`);
} else {
  console.log('❌ Failed to convert URL');
}
console.log('');

// 4. Convert extended mods back to base mods
console.log('4. Converting Extended Mods back to Base Mods:');
if (extendedMods.length > 0) {
  const firstExtended = extendedMods[0];
  const convertedBase = toBaseMod(firstExtended);
  
  console.log(`Extended mod properties:`);
  console.log(`   - Has .url property: ${typeof firstExtended.url === 'string'}`);
  console.log(`   - Properties: ${Object.keys(firstExtended).join(', ')}`);
  
  console.log(`Base mod properties:`);
  console.log(`   - Has .url property: ${typeof convertedBase.url === 'string'}`);
  console.log(`   - Properties: ${Object.keys(convertedBase).join(', ')}`);
  
  // Convert entire list
  const convertedList = toBaseModList(extendedMods);
  console.log(`✅ Converted ${convertedList.length} extended mods to base mods`);
}
console.log('');

// 5. Practical usage: Preparing mods for server configuration
console.log('5. Practical Usage: Server Configuration Preparation');

// Start with URLs, convert to extended for manipulation, then to base for config
const configUrls = [
  'https://reforger.armaplatform.com/workshop/656AC925A777AE40-ATTEveronPVE',
  'https://reforger.armaplatform.com/workshop/789DEF123ABC456B-EnhancedGraphics'
];

const extendedForConfig = createModExtendedListFromUrls(configUrls);

// Add metadata to extended mods
extendedForConfig[0].version = '1.2.0';
extendedForConfig[0].required = true;

if (extendedForConfig[1]) {
  extendedForConfig[1].version = '2.1.0';
  extendedForConfig[1].required = false;
}

// Convert to base mods for final server configuration
const finalConfigMods = toBaseModList(extendedForConfig);

console.log('Final server configuration mods:');
console.log(JSON.stringify(finalConfigMods, null, 2));

console.log('\n✅ Mod URL conversion example completed!');
console.log('\n💡 Use cases:');
console.log('   - Convert workshop URLs from mod collections');
console.log('   - Prepare mod lists for server configurations');
console.log('   - Transform between extended and base mod formats');
console.log('   - Filter and validate mod URLs in bulk');
